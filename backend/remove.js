const mongoose = require('mongoose');
require('dotenv').config();
const Hazard = require('./models/Hazard');

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    const hazards = await Hazard.find({}, 'title');
    console.log(hazards.map(h => h.title));
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}
check();
