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

// ── Validate required environment variables at startup ──────────────────────
const REQUIRED_ENV = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnv = REQUIRED_ENV.filter(key => !process.env[key]);
if (missingEnv.length > 0) {
  console.error(`[STARTUP ERROR] Missing required environment variables: ${missingEnv.join(', ')}`);
  console.error('Set these in your Render dashboard under Environment → Environment Variables.');
  process.exit(1);
}

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

// ── MongoDB connection ────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 10000,
  family: 4 // Force IPv4 to prevent Node.js 17+ from hanging on IPv6
})
  .then(() => console.log('[DB] Connected to MongoDB'))
  .catch(err => {
    console.error('[DB] MongoDB connection failed:', err.message);
    // Do NOT exit — let the server run so health checks pass,
    // but individual DB queries will fail with a clear error.
  });

app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/chatbot', chatbotRoutes);

// ── Global error handler (catches unhandled errors in routes) ─────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[UNHANDLED ERROR]', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[SERVER] Running on port ${PORT}`);
});
