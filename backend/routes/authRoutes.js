const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, adminKey, phone } = req.body;
    
    if (role === 'admin' && adminKey !== process.env.ADMIN_KEY) {
      return res.status(403).json({ message: 'Invalid Admin Key' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    if (!password || password.length < 4) {
      return res.status(400).json({ message: 'Password must be at least 4 characters' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role === 'admin' ? 'admin' : 'user';

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: userRole,
      phone: phone || '',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );

    res.status(201).json({ 
      message: 'User registered successfully',
      token,
      user: newUser.toJSON()
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'No account found with this email' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );

    res.json({ token, user: user.toJSON() });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: req.t('msg_user_not_found') });
    }
    res.json({ user: user.toJSON() });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
