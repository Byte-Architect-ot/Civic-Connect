// test-classification.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mlService = require('./services/mlService');

async function testImageClassification() {
  console.log('Testing Image Classification Service...');
  console.log('Key loaded:', process.env.ROBOFLOW_API_KEY ? 'Yes (starts with ' + process.env.ROBOFLOW_API_KEY.substring(0, 5) + '...)' : '❌ NO KEY FOUND IN .ENV');

  // Place a sample test image (e.g., test.jpg) in your backend root folder
  const testImagePath = path.join(__dirname, 'test.jpg');

  if (!fs.existsSync(testImagePath)) {
    console.error('Please place a sample image named "test.jpg" in your backend root directory to run this test.');
    return;
  }

  const imageBuffer = fs.readFileSync(testImagePath);
  
  console.log('Sending image buffer to Roboflow API...');
  const result = await mlService.classifyImage(imageBuffer);

  console.log('\n--- ML Service Output ---');
  console.log(result);
}

testImageClassification();