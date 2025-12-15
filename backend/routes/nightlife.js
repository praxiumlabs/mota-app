/**
 * Nightlife Routes
 * Bars, clubs, lounges
 */

const express = require('express');
const router = express.Router();
const Nightlife = require('../models/Nightlife');
const { auth, optionalAuth } = require('../middleware/auth');

// Get all nightlife venues
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { type, featured } = req.query;
    
    const query = {};
    if (type) query.type = type;
    if (featured === 'true') query.isFeatured = true;
    
    const nightlife = await Nightlife.find(query).sort({ isFeatured: -1, createdAt: -1 });
    res.json({ nightlife });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single venue
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const venue = await Nightlife.findById(req.params.id);
    if (!venue) {
      return res.status(404).json({ error: 'Venue not found' });
    }
    res.json(venue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create venue (admin)
router.post('/', auth, async (req, res) => {
  try {
    const venue = new Nightlife(req.body);
    await venue.save();
    res.status(201).json(venue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update venue (admin)
router.put('/:id', auth, async (req, res) => {
  try {
    const venue = await Nightlife.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(venue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete venue (admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    await Nightlife.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
