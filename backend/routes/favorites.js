/**
 * Favorites Routes
 * User favorites with analytics for admin
 */

const express = require('express');
const router = express.Router();
const Favorite = require('../models/Favorite');
const { auth } = require('../middleware/auth');

// Get user's favorites
router.get('/', auth, async (req, res) => {
  try {
    const { type } = req.query;
    const query = { user: req.user._id };
    if (type) query.itemType = type;

    const favorites = await Favorite.find(query).sort({ createdAt: -1 });
    res.json({ favorites });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check if item is favorited
router.get('/check/:itemType/:itemId', auth, async (req, res) => {
  try {
    const favorite = await Favorite.findOne({
      user: req.user._id,
      itemType: req.params.itemType,
      itemId: req.params.itemId,
    });
    res.json({ isFavorited: !!favorite });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle favorite
router.post('/toggle', auth, async (req, res) => {
  try {
    const { itemType, itemId, itemName, itemImage, itemCategory, itemRating } = req.body;

    if (!itemType || !itemId) {
      return res.status(400).json({ error: 'itemType and itemId are required' });
    }

    const existing = await Favorite.findOne({
      user: req.user._id,
      itemType,
      itemId,
    });

    if (existing) {
      await existing.deleteOne();
      res.json({ success: true, isFavorited: false });
    } else {
      const favorite = new Favorite({
        user: req.user._id,
        itemType, itemId, itemName, itemImage, itemCategory, itemRating,
      });
      await favorite.save();
      res.json({ success: true, isFavorited: true, favorite });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove favorite
router.delete('/:itemType/:itemId', auth, async (req, res) => {
  try {
    await Favorite.findOneAndDelete({
      user: req.user._id,
      itemType: req.params.itemType,
      itemId: req.params.itemId,
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// ADMIN ANALYTICS
// ============================================

router.get('/admin/analytics', auth, async (req, res) => {
  try {
    const analytics = await Favorite.getAnalytics();
    const totalFavorites = await Favorite.countDocuments();
    const uniqueUsers = await Favorite.distinct('user');
    
    res.json({
      totalFavorites,
      uniqueUsers: uniqueUsers.length,
      byCategory: analytics,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/admin/analytics/:itemType/:itemId', auth, async (req, res) => {
  try {
    const analytics = await Favorite.getItemAnalytics(req.params.itemType, req.params.itemId);
    res.json({ analytics });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
