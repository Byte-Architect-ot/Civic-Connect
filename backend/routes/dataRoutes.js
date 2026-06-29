const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Hazard = require('../models/Hazard');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

// Multer Configuration 
const fs = require('fs');
const uploadDir = path.join(__dirname, '..', 'uploads');

// Ensure uploads directory exists (crucial for deployed environments like Render)
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file format. Only JPEG, PNG, and WebP are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

const mlService = require('../services/mlService');

// Create a new hazard report (with optional image upload)
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { title, description, category, priority, location, lat, lng } = req.body;

    // If a file was uploaded, store its base64 string; otherwise empty string
    let imageUrl = '';
    if (req.file) {
      const base64Str = req.file.buffer.toString('base64');
      imageUrl = `data:${req.file.mimetype};base64,${base64Str}`;
    }

    // 🤖 ML ENHANCEMENT 1: Auto-categorize and detect severity
    let mlAnalysis = null;
    if (title && description) {
      mlAnalysis = await mlService.analyzeIssue(title, description);
    }

    // 🤖 ML ENHANCEMENT 2: Check for duplicates
    const existingIssues = await Hazard.find({
      status: { $in: ['Pending', 'In Progress'] },
      lat: { $exists: true, $ne: 0 },
      lng: { $exists: true, $ne: 0 }
    }).select('_id title lat lng').lean();

    let duplicateCheck = { hasDuplicates: false, duplicates: [] };
    if (lat && lng && existingIssues.length > 0) {
      duplicateCheck = await mlService.checkDuplicates(
        parseFloat(lat), 
        parseFloat(lng), 
        existingIssues.map(issue => ({
          id: issue._id.toString(),
          lat: issue.lat,
          lng: issue.lng,
          title: issue.title
        }))
      );
    }

    const newHazard = new Hazard({
      title,
      description,
      category: mlAnalysis?.category || category || 'Others',
      priority: mlAnalysis?.priority || priority || 'Medium',
      location: location || '',
      imageUrl,
      lat: lat ? parseFloat(lat) : (16.8 + Math.random() * 0.1),
      lng: lng ? parseFloat(lng) : (74.5 + Math.random() * 0.2),
      status: 'Pending',
      reportedBy: user.name,
      reportedByUserId: user._id,
      upvotes: 0,
      upvotedBy: [],
      updates: [],
      // ML fields
      mlCategory: mlAnalysis?.category || '',
      mlPriority: mlAnalysis?.priority || '',
      mlConfidence: mlAnalysis?.category_confidence || 0,
      clusterSize: duplicateCheck.count || 0,
      duplicateOf: duplicateCheck.duplicates ? duplicateCheck.duplicates.map(d => d.id) : []
    });

    // 🤖 ML ENHANCEMENT 3: Calculate initial urgency score
    const urgencyData = await mlService.calculateUrgency(newHazard);
    if (urgencyData) {
      newHazard.urgencyScore = urgencyData.urgency_score;
    }

    const savedHazard = await newHazard.save();
    
    // Send response with hazard and ML metadata
    res.status(201).json({
      ...savedHazard.toJSON(),
      mlSuggestions: mlAnalysis,
      duplicateWarning: duplicateCheck.hasDuplicates ? {
        message: `Found ${duplicateCheck.count} similar issue(s) nearby`,
        duplicates: duplicateCheck.duplicates
      } : null
    });
  } catch (error) {
    // Handle multer-specific errors
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
      }
      return res.status(400).json({ message: error.message });
    }
    if (error.message && error.message.includes('Unsupported file format')) {
      return res.status(400).json({ message: error.message });
    }
    console.error('Create hazard error:', error);
    res.status(500).json({ message: 'Server error while creating report' });
  }
});

// Get all hazards (admin sees all, user sees only their own)
router.get('/', authMiddleware, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'user') {
      query.reportedByUserId = req.user.id;
    }
    const data = await Hazard.find(query).sort({ createdAt: -1 });
    res.json(data.map(h => h.toJSON()));
  } catch (error) {
    console.error('Get hazards error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get ALL hazards (public feed for dashboard — all users can see all issues)
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const data = await Hazard.find({}).sort({ createdAt: -1 });
    res.json(data.map(h => h.toJSON()));
  } catch (error) {
    console.error('Get all hazards error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update hazard status (admin only)
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only authorities can update status' });
    }

    const { status, comment } = req.body;
    const user = await User.findById(req.user.id);
    
    const hazard = await Hazard.findById(req.params.id);
    if (!hazard) {
      return res.status(404).json({ message: 'Hazard not found' });
    }

    // Add update entry
    hazard.updates.unshift({
      status,
      comment: comment || `Status changed to ${status}`,
      updatedBy: user ? user.name : 'Authority'
    });
    hazard.status = status;

    const updated = await hazard.save();
    res.json(updated.toJSON());
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle upvote on a hazard
router.put('/:id/upvote', authMiddleware, async (req, res) => {
  try {
    const hazard = await Hazard.findById(req.params.id);
    if (!hazard) {
      return res.status(404).json({ message: 'Hazard not found' });
    }

    const userId = req.user.id;
    const hasUpvoted = hazard.upvotedBy.includes(userId);

    if (hasUpvoted) {
      hazard.upvotedBy = hazard.upvotedBy.filter(id => id !== userId);
      hazard.upvotes = Math.max(0, hazard.upvotes - 1);
    } else {
      hazard.upvotedBy.push(userId);
      hazard.upvotes += 1;
    }

    const updated = await hazard.save();
    res.json(updated.toJSON());
  } catch (error) {
    console.error('Upvote error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a hazard (owner or admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const hazard = await Hazard.findById(req.params.id);
    if (!hazard) {
      return res.status(404).json({ message: 'Hazard not found' });
    }

    // Only the creator or admin can delete
    if (hazard.reportedByUserId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this report' });
    }

    await Hazard.findByIdAndDelete(req.params.id);
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
