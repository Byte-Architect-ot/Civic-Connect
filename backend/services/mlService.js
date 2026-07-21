const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

const mlService = {
  analyzeIssue: async (title, description) => {
    try {
      const response = await axios.post(`${ML_SERVICE_URL}/api/ml/categorize/analyze`, {
        title,
        description
      });
      return response.data;
    } catch (error) {
      console.error('Error analyzing issue with ML:', error.message);
      return null;
    }
  },

  classifyImage: async (imageBuffer) => {
    try {
      const apiKey = process.env.ROBOFLOW_API_KEY;
      if (!apiKey) return { detected: false };

      const base64Image = imageBuffer.toString('base64');
      const response = await axios({
        method: 'POST',
        url: `https://detect.roboflow.com/civic-issues-qj5pb/2?api_key=${apiKey}`,
        data: base64Image,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      const predictions = response.data.predictions || [];
      if (predictions.length > 0) {
        const topPred = predictions.reduce((prev, current) => (prev.confidence > current.confidence) ? prev : current);
        return {
          detected: true,
          category: topPred.class,
          confidence: Math.round(topPred.confidence * 100),
          severity: 'High'
        };
      }
      return { detected: false };
    } catch (error) {
      console.error('Error classifying image:', error.message);
      return { detected: false };
    }
  },

  checkDuplicates: async (lat, lng, existingIssues) => {
    try {
      const response = await axios.post(`${ML_SERVICE_URL}/api/ml/cluster/detect-duplicates`, {
        lat,
        lng,
        existingIssues
      });
      return response.data;
    } catch (error) {
      console.error('Error checking duplicates with ML:', error.message);
      return { hasDuplicates: false, duplicates: [], count: 0 };
    }
  },

  calculateUrgency: async (hazard) => {
    // We will assume there's an urgency calculation endpoint in ml-service,
    // though it might not exist yet. Let's return a default if it fails.
    try {
      // Mocked calculation for now since there's no endpoint in ml-service for calculateUrgency
      // Or we can just calculate it here
      let score = 0;
      if (hazard.priority === 'Critical') score += 40;
      else if (hazard.priority === 'High') score += 30;
      else if (hazard.priority === 'Medium') score += 20;
      else score += 10;
      
      score += (hazard.upvotes || 0) * 5;
      score += (hazard.clusterSize || 0) * 10;
      
      return { urgency_score: Math.min(score, 100) };
    } catch (error) {
      console.error('Error calculating urgency:', error.message);
      return null;
    }
  }
};

module.exports = mlService;