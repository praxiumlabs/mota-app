/**
 * Newsletter & Communication Routes
 */

const express = require('express');
const router = express.Router();
const { Subscriber, Campaign } = require('../models/Newsletter');
const { auth } = require('../middleware/auth');

// Subscribe (public)
router.post('/subscribe', async (req, res) => {
  try {
    const { email, name, source, preferences } = req.body;
    
    let subscriber = await Subscriber.findOne({ email: email.toLowerCase() });
    
    if (subscriber) {
      if (subscriber.isSubscribed) {
        return res.json({ success: true, message: 'Already subscribed' });
      }
      subscriber.isSubscribed = true;
      subscriber.subscribedAt = new Date();
      subscriber.unsubscribedAt = undefined;
    } else {
      subscriber = new Subscriber({
        email: email.toLowerCase(),
        name,
        source: source || 'website',
        preferences: preferences || {},
      });
    }
    
    await subscriber.save();
    
    res.json({ success: true, message: 'Successfully subscribed' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});

// Unsubscribe
router.post('/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;
    
    const subscriber = await Subscriber.findOne({ email: email.toLowerCase() });
    
    if (!subscriber) {
      return res.status(404).json({ error: 'Email not found' });
    }
    
    subscriber.isSubscribed = false;
    subscriber.unsubscribedAt = new Date();
    await subscriber.save();
    
    res.json({ success: true, message: 'Successfully unsubscribed' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to unsubscribe' });
  }
});

// Update preferences
router.put('/preferences', async (req, res) => {
  try {
    const { email, preferences } = req.body;
    
    const subscriber = await Subscriber.findOneAndUpdate(
      { email: email.toLowerCase() },
      { preferences },
      { new: true }
    );
    
    if (!subscriber) {
      return res.status(404).json({ error: 'Subscriber not found' });
    }
    
    res.json({ success: true, preferences: subscriber.preferences });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// Get all subscribers (admin)
router.get('/subscribers', auth, async (req, res) => {
  try {
    const { isSubscribed, page = 1, limit = 50 } = req.query;
    
    const query = {};
    if (isSubscribed !== undefined) query.isSubscribed = isSubscribed === 'true';
    
    const subscribers = await Subscriber.find(query)
      .sort({ subscribedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Subscriber.countDocuments(query);
    
    res.json({
      subscribers,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
      stats: {
        totalSubscribers: await Subscriber.countDocuments({ isSubscribed: true }),
        totalUnsubscribed: await Subscriber.countDocuments({ isSubscribed: false }),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subscribers' });
  }
});

// Get all campaigns (admin)
router.get('/campaigns', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    
    const campaigns = await Campaign.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Campaign.countDocuments(query);
    
    res.json({
      campaigns,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

// Create campaign (admin)
router.post('/campaigns', auth, async (req, res) => {
  try {
    const campaign = new Campaign({
      ...req.body,
      createdBy: req.user._id,
    });
    
    await campaign.save();
    
    res.status(201).json(campaign);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

// Get campaign by ID
router.get('/campaigns/:id', auth, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    
    res.json(campaign);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch campaign' });
  }
});

// Update campaign
router.put('/campaigns/:id', auth, async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    
    res.json(campaign);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update campaign' });
  }
});

// Send campaign
router.post('/campaigns/:id/send', auth, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    
    // Get target subscribers
    let query = { isSubscribed: true };
    
    if (campaign.audience === 'investors') {
      // Would need to join with users
    }
    
    const subscribers = await Subscriber.countDocuments(query);
    
    campaign.status = 'sending';
    campaign.stats.totalRecipients = subscribers;
    await campaign.save();
    
    // In production, this would trigger actual email sending
    // For now, simulate completion
    setTimeout(async () => {
      campaign.status = 'sent';
      campaign.sentAt = new Date();
      await campaign.save();
    }, 1000);
    
    res.json({ success: true, message: `Sending to ${subscribers} recipients` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send campaign' });
  }
});

// Delete campaign
router.delete('/campaigns/:id', auth, async (req, res) => {
  try {
    await Campaign.findByIdAndDelete(req.params.id);
    res.json({ message: 'Campaign deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete campaign' });
  }
});

module.exports = router;
