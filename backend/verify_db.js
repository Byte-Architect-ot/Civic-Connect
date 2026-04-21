const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./routes/../models/User');
const Hazard = require('./routes/../models/Hazard');

async function testConnection() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("TEST SCRIPT: Connected to MongoDB via MONGODB_URI");

    const users = await User.find({ role: 'user' });
    console.log(`TEST SCRIPT: Found ${users.length} citizens`);

    const admins = await User.find({ role: 'admin' });
    console.log(`TEST SCRIPT: Found ${admins.length} admins`);

    const reports = await Hazard.find({});
    console.log(`TEST SCRIPT: Found ${reports.length} reports`);

    const reportData = reports.length > 0 ? reports[0] : null;
    if (reportData) {
      console.log(`TEST SCRIPT: Latest report title: ${reportData.title}`);
    }

    process.exit(0);
  } catch (err) {
    console.error("TEST SCRIPT: Error connecting", err);
    process.exit(1);
  }
}

testConnection();
