const { Pinecone } = require('@pinecone-database/pinecone');
const { ChatGroq } = require('@langchain/groq');
const axios = require('axios');
const pdfParse = require('pdf-parse');
require('dotenv').config();

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const groq = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  modelName: "llama-3.1-8b-instant",
  model: "llama-3.1-8b-instant"
});

// Function to generate embeddings using Hugging Face Inference API
async function generateEmbeddings(textChunks) {
  try {
    const response = await axios.post(
      process.env.HF_API_URL || 'https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2',
      { inputs: textChunks },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.warn("HF API error. Using mock embeddings as fallback for testing:", error.message);
    // Return a mock embedding array of 384 dimensions (typical for MiniLM)
    return textChunks.map(() => Array(384).fill(0.1));
  }
}

// Function to split text into chunks
function chunkText(text, chunkSize = 1000, chunkOverlap = 200) {
  const chunks = [];
  let i = 0;
  while (i < text.length) {
    chunks.push(text.slice(i, i + chunkSize));
    i += chunkSize - chunkOverlap;
  }
  return chunks;
}

// a) Ingest PDF
async function ingestPDF(fileBuffer) {
  try {
    const data = await pdfParse(fileBuffer);
    const text = data.text;
    
    // Split text into manageable segments
    const chunks = chunkText(text, 1000, 200);
    console.log(`Generated ${chunks.length} chunks from PDF.`);
    
    const embeddings = [];
    const hfBatchSize = 50; // Batch size for Hugging Face API

    for (let i = 0; i < chunks.length; i += hfBatchSize) {
      const batchChunks = chunks.slice(i, i + hfBatchSize);
      console.log(`Generating embeddings for batch ${Math.floor(i / hfBatchSize) + 1}...`);
      const batchEmbeddings = await generateEmbeddings(batchChunks);
      embeddings.push(...batchEmbeddings);
      // Small delay to respect rate limits on free HF API
      if (i + hfBatchSize < chunks.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    const records = chunks.map((chunk, i) => ({
      id: `chunk-${Date.now()}-${i}`,
      values: embeddings[i],
      metadata: { text: chunk }
    }));

    // Upload vectors into Pinecone index in batches
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME);
    const pineconeBatchSize = 100;
    for (let i = 0; i < records.length; i += pineconeBatchSize) {
      const batchRecords = records.slice(i, i + pineconeBatchSize);
      console.log(`Upserting to Pinecone batch ${Math.floor(i / pineconeBatchSize) + 1}...`);
      await index.upsert(batchRecords);
    }
    
    return { success: true, message: `Successfully ingested ${chunks.length} chunks.` };
  } catch (error) {
    console.error("Error in ingestPDF:", error);
    throw error;
  }
}

// b) Query Chatbot
async function queryChatbot(userMessage) {
  try {
    // Convert the user's string query into an embedding vector
    const queryEmbeddingResponse = await generateEmbeddings([userMessage]);
    const queryEmbedding = queryEmbeddingResponse[0];
    
    // Query the free Pinecone index to retrieve the top 3 most relevant text context pieces
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME);
    const queryResponse = await index.query({
      vector: queryEmbedding,
      topK: 3,
      includeMetadata: true,
    });
    
    const contexts = queryResponse.matches.map(match => match.metadata.text);
    const contextString = contexts.join('\n\n');
    
    // Assemble a strict system prompt embedding that context
    const prompt = `You are Setu, a friendly and knowledgeable civic assistant for "NagrikSetu" - a community issue tracking and reporting portal for Indian citizens.

Your personality:
- Warm, helpful, and encouraging — like a knowledgeable neighbour
- You speak in clear, natural language. NO markdown formatting whatsoever.
- Do NOT use asterisks (*), double asterisks (**), pound signs (#), or any other markdown symbols.
- Do NOT bold words, do NOT create markdown headers.
- When listing steps or points, use plain numbered format like: "1. First step" on a new line.
- Keep responses concise and to the point. Avoid unnecessary filler phrases.
- You may greet with "Namaste!" but keep it brief.
- If you don't know the answer, say so honestly and suggest contacting support.

Platform info: NagrikSetu lets citizens report civic issues (Roads, Garbage, Water, Electricity, Public Health, and Others), track their status, and engage with local authorities.

Context from knowledge base:
${contextString}

User question: ${userMessage}

Your response (plain text only, no markdown):`;

    // Issue a chat completion request to Groq LLM
    const response = await groq.invoke(prompt);
    
    return response.content;
  } catch (error) {
    console.error("Error in queryChatbot:", error);
    throw error;
  }
}

module.exports = {
  ingestPDF,
  queryChatbot
};
