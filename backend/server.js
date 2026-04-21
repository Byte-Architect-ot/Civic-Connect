const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const { i18n, middleware } = require('./i18n');

const authRoutes = require('./routes/authRoutes');
const dataRoutes = require('./routes/dataRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(middleware.handle(i18n));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
