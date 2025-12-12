/**
 * Exotic Fleet Routes
 * PCH Exotics - Cars and Yachts
 */

const express = require('express');
const router = express.Router();
const ExoticFleet = require('../models/ExoticFleet');
const { auth, optionalAuth } = require('../middleware/auth');

// Get all fleet (public)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { type, featured, available } = req.query;
    
    const query = {};
    if (type) query.type = type;
    if (featured === 'true') query.isFeatured = true;
    if (available === 'true') query.isAvailable = true;
    
    const fleet = await ExoticFleet.find(query).sort({ isFeatured: -1, createdAt: -1 });
    
    res.json({ fleet });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get cars only
router.get('/cars', optionalAuth, async (req, res) => {
  try {
    const cars = await ExoticFleet.find({ type: 'car', isAvailable: true })
      .sort({ isFeatured: -1, pricePerDay: -1 });
    res.json({ cars });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get yachts only
router.get('/yachts', optionalAuth, async (req, res) => {
  try {
    const yachts = await ExoticFleet.find({ type: 'yacht', isAvailable: true })
      .sort({ isFeatured: -1, pricePerDay: -1 });
    res.json({ yachts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single item
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const item = await ExoticFleet.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create (admin)
router.post('/', auth, async (req, res) => {
  try {
    const item = new ExoticFleet(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update (admin)
router.put('/:id', auth, async (req, res) => {
  try {
    const item = await ExoticFleet.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete (admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    await ExoticFleet.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
