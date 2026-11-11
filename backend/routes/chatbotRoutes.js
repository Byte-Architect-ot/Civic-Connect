const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/query', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required.' });
    }
    
    // Forward the payload securely to the chatbot microservice (default port 5001)
    const chatbotUrl = process.env.CHATBOT_SERVICE_URL || 'http://localhost:5001';
    const response = await axios.post(`${chatbotUrl}/api/chatbot/query`, {
      message
    }, {
      timeout: 60000 // Safely wait out standard Render free-tier cold starts
    });
    
    // Return the reply directly
    res.json(response.data);
  } catch (error) {
    console.error('Error proxying to chatbot microservice:', error.response?.data || error.message);
    // Provide a helpful fallback reply so the UI doesn't crash
    res.json({
      reply: 'Namaste! I am Setu, your civic assistant. I am experiencing a brief connection delay with the knowledge base, but you can report civic issues like potholes, garbage, or water leaks right from your dashboard.'
    });
  }
});

module.exports = router;
