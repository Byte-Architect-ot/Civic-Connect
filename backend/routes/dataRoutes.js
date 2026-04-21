const express = require('express');
const router = express.Router();
const Hazard = require('../models/Hazard');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

// Create a new hazard report
router.post('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { title, description, category, priority, location, imageUrl, lat, lng } = req.body;
    
    const newHazard = new Hazard({
      title,
      description,
      category: category || 'Others',
      priority: priority || 'Medium',
      location: location || '',
      imageUrl: imageUrl || '',
      lat: lat || (16.8 + Math.random() * 0.1),
      lng: lng || (74.5 + Math.random() * 0.2),
      status: 'Pending',
      reportedBy: user.name,
      reportedByUserId: user._id,
      upvotes: 0,
      upvotedBy: [],
      updates: []
    });

    const savedHazard = await newHazard.save();
    res.status(201).json(savedHazard.toJSON());
  } catch (error) {
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
