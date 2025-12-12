/**
 * Restaurant Routes
 */

const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');
const { optionalAuth, auth } = require('../middleware/auth');

// Get all restaurants
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { 
      cuisine, priceRange, dogFriendly, kidsFriendly,
      featured, available, page = 1, limit = 20 
    } = req.query;
    
    const query = {};
    
    if (cuisine) query.cuisine = { $regex: cuisine, $options: 'i' };
    if (priceRange) query.priceRange = priceRange;
    if (dogFriendly === 'true') query.dogFriendly = true;
    if (kidsFriendly === 'true') query.kidsFriendly = true;
    if (featured === 'true') query.isFeatured = true;
    if (available !== 'false') query.isAvailable = true;
    
    const restaurants = await Restaurant.find(query)
      .sort({ isFeatured: -1, rating: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Restaurant.countDocuments(query);
    
    res.json({
      restaurants,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
});

// Get featured restaurants
router.get('/featured', async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ isFeatured: true, isAvailable: true })
      .sort({ rating: -1 })
      .limit(6);
    
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch featured restaurants' });
  }
});

// Get restaurant by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch restaurant' });
  }
});

// Create restaurant (admin)
router.post('/', auth, async (req, res) => {
  try {
    const restaurant = new Restaurant(req.body);
    await restaurant.save();
    res.status(201).json(restaurant);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create restaurant' });
  }
});

// Update restaurant (admin)
router.put('/:id', auth, async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update restaurant' });
  }
});

// Delete restaurant (admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    await Restaurant.findByIdAndDelete(req.params.id);
    res.json({ message: 'Restaurant deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete restaurant' });
  }
});

module.exports = router;
