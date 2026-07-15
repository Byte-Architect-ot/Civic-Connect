const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { ingestPDF, queryChatbot } = require('./engine');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

// Set up multer for file uploads in memory
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/chat/ingest: Accepts a single PDF file upload under the key "file"
app.post('/api/chatbot/ingest', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Please upload a file under the key "file".' });
    }
    const result = await ingestPDF(req.file.buffer);
    res.json(result);
  } catch (error) {
    console.error("Ingest error:", error);
    res.status(500).json({ error: 'Failed to ingest PDF.', details: error.message });
  }
});

// POST /api/chat/query: Accepts a JSON payload { "message": "..." }
app.post('/api/chatbot/query', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required.' });
    }
    const reply = await queryChatbot(message);
    res.json({ reply }); // Responds back with { "reply": "..." }
  } catch (error) {
    console.error("Query error:", error);
    res.status(500).json({ error: 'Failed to process query.', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Chatbot microservice listening on port ${PORT}`);
});
