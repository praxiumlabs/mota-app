/**
 * Lodging Routes
 */

const express = require('express');
const router = express.Router();
const Lodging = require('../models/Lodging');
const { optionalAuth, auth } = require('../middleware/auth');

// Get all lodging
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { 
      view, dogFriendly, kidsFriendly, priceCategory, 
      featured, available, minPrice, maxPrice,
      page = 1, limit = 20 
    } = req.query;
    
    const query = {};
    
    if (view) query.view = view;
    if (dogFriendly === 'true') query.dogFriendly = true;
    if (kidsFriendly === 'true') query.kidsFriendly = true;
    if (priceCategory) query.priceCategory = priceCategory;
    if (featured === 'true') query.isFeatured = true;
    if (available !== 'false') query.isAvailable = true;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseInt(minPrice);
      if (maxPrice) query.price.$lte = parseInt(maxPrice);
    }
    
    const lodging = await Lodging.find(query)
      .sort({ isFeatured: -1, rating: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Lodging.countDocuments(query);
    
    res.json({
      lodging,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch lodging' });
  }
});

// Get featured lodging
router.get('/featured', async (req, res) => {
  try {
    const lodging = await Lodging.find({ isFeatured: true, isAvailable: true })
      .sort({ rating: -1 })
      .limit(6);
    
    res.json(lodging);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch featured lodging' });
  }
});

// Get lodging by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const lodging = await Lodging.findById(req.params.id);
    
    if (!lodging) {
      return res.status(404).json({ error: 'Lodging not found' });
    }
    
    res.json(lodging);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch lodging' });
  }
});

// Create lodging (admin)
router.post('/', auth, async (req, res) => {
  try {
    const lodging = new Lodging(req.body);
    await lodging.save();
    res.status(201).json(lodging);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create lodging' });
  }
});

// Update lodging (admin)
router.put('/:id', auth, async (req, res) => {
  try {
    const lodging = await Lodging.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!lodging) {
      return res.status(404).json({ error: 'Lodging not found' });
    }
    
    res.json(lodging);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update lodging' });
  }
});

// Delete lodging (admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    await Lodging.findByIdAndDelete(req.params.id);
    res.json({ message: 'Lodging deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete lodging' });
  }
});

module.exports = router;
