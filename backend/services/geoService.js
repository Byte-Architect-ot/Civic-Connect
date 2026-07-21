const axios = require('axios');

const geoService = {
  geocodeAddress: async (addressName) => {
    try {
      if (!addressName) return null;
      
      const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: {
          q: addressName,
          format: 'json',
          limit: 1
        },
        headers: {
          'User-Agent': 'CivicConnect-App/1.0'
        }
      });

      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        return {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon)
        };
      }
      return null;
    } catch (error) {
      console.error('Error geocoding address:', error.message);
      return null;
    }
  }
};

module.exports = geoService;
