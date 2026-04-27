const mongoose = require('mongoose');
require('dotenv').config();
const Hazard = require('./models/Hazard');

const titlesToRemove = [
  'Water Supply Timing Issue',
  'Broken Divider on Highway',
  'Low Hanging Power Lines',
  'Streetlight Not Working',
  'Water Leakage from Main Pipe',
  'Illegal Construction on Footpath',
  'Broken Drainage Pipe',
  'Stray Dog Menace',
  'Large Pothole on Miraj Road'
];

async function remove() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected to DB');
    const result = await Hazard.deleteMany({ title: { $in: titlesToRemove } });
    console.log('Deleted ' + result.deletedCount + ' entries');
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

remove();
