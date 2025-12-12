/**
 * User Management Routes (Admin)
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Get all users (admin)
router.get('/', auth, async (req, res) => {
  try {
    const { accessLevel, investorTier, search, page = 1, limit = 20 } = req.query;
    
    const query = {};
    
    if (accessLevel) query.accessLevel = accessLevel;
    if (investorTier) query.investorTier = investorTier;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await User.countDocuments(query);
    
    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user (admin)
router.put('/:id', auth, async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password; // Don't allow password update through this route
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Upgrade user to investor
router.put('/:id/upgrade-investor', auth, async (req, res) => {
  try {
    const { investorTier, investmentAmount } = req.body;
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    user.accessLevel = 'investor';
    user.investorTier = investorTier;
    user.investmentAmount = investmentAmount;
    user.portfolioValue = investmentAmount;
    
    await user.save();
    
    res.json(user.toJSON());
  } catch (error) {
    res.status(500).json({ error: 'Failed to upgrade user' });
  }
});

// Deactivate user
router.put('/:id/deactivate', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to deactivate user' });
  }
});

// Get user favorites
router.get('/:id/favorites', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('favorites');
    res.json(user?.favorites || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// Add favorite
router.post('/favorites', auth, async (req, res) => {
  try {
    const { itemId, itemType } = req.body;
    
    if (!req.user.favorites.includes(itemId)) {
      req.user.favorites.push(itemId);
      req.user.favoriteModel = itemType;
      await req.user.save();
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add favorite' });
  }
});

// Remove favorite
router.delete('/favorites/:itemId', auth, async (req, res) => {
  try {
    req.user.favorites = req.user.favorites.filter(
      id => id.toString() !== req.params.itemId
    );
    await req.user.save();
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

module.exports = router;
