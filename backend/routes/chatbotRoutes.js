const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/query', async (req, res) => {
  try {
    const { message } = req.body;
    
    // Forward the payload securely to the chatbot microservice
    const chatbotUrl = process.env.CHATBOT_SERVICE_URL || 'http://localhost:5000';
    const response = await axios.post(`${chatbotUrl}/api/chatbot/query`, {
      message
    });
    
    // Return the reply directly
    res.json(response.data);
  } catch (error) {
    console.error('Error proxying to chatbot microservice:', error.response?.data || error.message);
    res.status(500).json({ error: 'Chatbot service error.', details: error.message });
  }
});

module.exports = router;
