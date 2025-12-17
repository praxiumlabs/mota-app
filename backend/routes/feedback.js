/**
 * Feedback Routes
 * Rating system (1-3★ → support, 4-5★ → app store)
 */

const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const { auth } = require('../middleware/auth');

// Submit feedback
router.post('/', auth, async (req, res) => {
  try {
    const { rating, type, feedback, likedMost, deviceInfo } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    if (!feedback || feedback.trim().length === 0) {
      return res.status(400).json({ error: 'Feedback content is required' });
    }

    const feedbackType = type || (rating <= 3 ? 'improvement' : 'positive');

    const newFeedback = new Feedback({
      user: req.user?._id,
      userEmail: req.user?.email,
      rating,
      type: feedbackType,
      feedback: feedback.trim(),
      likedMost,
      deviceInfo,
      source: 'app_prompt',
    });

    await newFeedback.save();

    res.status(201).json({
      success: true,
      message: 'Thank you for your feedback!',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// ADMIN ROUTES
// ============================================

router.get('/admin', auth, async (req, res) => {
  try {
    const { status, type, rating, page = 1, limit = 50 } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (type) query.type = type;
    if (rating) query.rating = parseInt(rating);

    const feedbacks = await Feedback.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('user', 'name email accessLevel investorTier');

    const total = await Feedback.countDocuments(query);

    const stats = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          totalCount: { $sum: 1 },
          lowRatings: { $sum: { $cond: [{ $lte: ['$rating', 3] }, 1, 0] } },
          highRatings: { $sum: { $cond: [{ $gte: ['$rating', 4] }, 1, 0] } },
          newCount: { $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] } },
        },
      },
    ]);

    res.json({
      feedbacks,
      stats: stats[0] || { avgRating: 0, totalCount: 0, lowRatings: 0, highRatings: 0, newCount: 0 },
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/admin/:id', auth, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status, adminNotes, reviewedBy: req.user._id, reviewedAt: new Date() },
      { new: true }
    ).populate('user', 'name email');

    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    res.json({ success: true, feedback });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
