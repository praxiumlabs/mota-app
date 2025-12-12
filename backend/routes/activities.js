/**
 * Activities Routes
 */

const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const { optionalAuth, auth } = require('../middleware/auth');

// Get all activities
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, featured, available, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (category) query.category = category;
    if (featured === 'true') query.isFeatured = true;
    if (available !== 'false') query.isAvailable = true;
    
    const activities = await Activity.find(query)
      .sort({ isFeatured: -1, rating: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Activity.countDocuments(query);
    
    res.json({
      activities,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

router.get('/featured', async (req, res) => {
  try {
    const activities = await Activity.find({ isFeatured: true, isAvailable: true }).sort({ rating: -1 }).limit(6);
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch featured activities' });
  }
});

router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ error: 'Activity not found' });
    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const activity = new Activity(req.body);
    await activity.save();
    res.status(201).json(activity);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create activity' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const activity = await Activity.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!activity) return res.status(404).json({ error: 'Activity not found' });
    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update activity' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Activity.findByIdAndDelete(req.params.id);
    res.json({ message: 'Activity deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete activity' });
  }
});

module.exports = router;
