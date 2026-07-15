const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { i18n, middleware } = require('./i18n');

const authRoutes = require('./routes/authRoutes');
const dataRoutes = require('./routes/dataRoutes');
const exportRoutes = require('./routes/exportRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');

const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim().replace(/\/$/, ''))
  : ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    // Remove trailing slash from incoming origin just in case
    const cleanOrigin = origin.replace(/\/$/, '');
    
    // Allow if origin is in the list or if ALLOWED_ORIGINS is set to '*'
    if (process.env.ALLOWED_ORIGINS === '*' || allowedOrigins.includes(cleanOrigin)) {
      return callback(null, true);
    }
    
    // Log the rejected origin so we can debug it on Render
    console.warn(`[CORS REJECTED] Origin not allowed: ${origin}`);
    callback(null, false); // Do NOT throw an error, just return false
  },
  credentials: true
}));
app.use(express.json());
app.use(middleware.handle(i18n));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/chatbot', chatbotRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
