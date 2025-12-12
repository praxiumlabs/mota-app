/**
 * Offers Routes
 */

const express = require('express');
const router = express.Router();
const Offer = require('../models/Offer');
const { optionalAuth, auth } = require('../middleware/auth');

// Get available offers
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, featured } = req.query;
    
    const query = { isActive: true, validUntil: { $gte: new Date() } };
    
    // Filter by access level
    if (!req.user) {
      query.accessLevel = 'all';
    } else if (req.user.accessLevel === 'member') {
      query.accessLevel = { $in: ['all', 'member'] };
    }
    // Investors can see all offers
    
    if (category) query.category = category;
    if (featured === 'true') query.isFeatured = true;
    
    const offers = await Offer.find(query).sort({ isFeatured: -1, createdAt: -1 });
    
    res.json(offers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch offers' });
  }
});

// Get offer by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) return res.status(404).json({ error: 'Offer not found' });
    res.json(offer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch offer' });
  }
});

// Validate offer code
router.post('/validate', auth, async (req, res) => {
  try {
    const { code } = req.body;
    
    const offer = await Offer.findOne({ code, isActive: true });
    
    if (!offer) {
      return res.json({ valid: false, error: 'Invalid code' });
    }
    
    if (offer.validUntil && new Date() > offer.validUntil) {
      return res.json({ valid: false, error: 'Code expired' });
    }
    
    if (offer.maxUses && offer.currentUses >= offer.maxUses) {
      return res.json({ valid: false, error: 'Code usage limit reached' });
    }
    
    // Check if user already used
    if (offer.usedBy.some(u => u.user.toString() === req.user._id.toString())) {
      return res.json({ valid: false, error: 'You have already used this code' });
    }
    
    res.json({
      valid: true,
      offer: {
        name: offer.name,
        discountPercent: offer.discountPercent,
        discountAmount: offer.discountAmount,
        offerType: offer.offerType,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to validate code' });
  }
});

// Redeem offer
router.post('/:id/redeem', auth, async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    
    if (!offer || !offer.isActive) {
      return res.status(404).json({ error: 'Offer not found' });
    }
    
    offer.usedBy.push({ user: req.user._id });
    offer.currentUses += 1;
    await offer.save();
    
    res.json({ success: true, message: 'Offer redeemed' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to redeem offer' });
  }
});

// Create offer (admin)
router.post('/', auth, async (req, res) => {
  try {
    const offer = new Offer(req.body);
    await offer.save();
    res.status(201).json(offer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create offer' });
  }
});

// Update offer (admin)
router.put('/:id', auth, async (req, res) => {
  try {
    const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!offer) return res.status(404).json({ error: 'Offer not found' });
    res.json(offer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update offer' });
  }
});

// Delete offer (admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    await Offer.findByIdAndDelete(req.params.id);
    res.json({ message: 'Offer deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete offer' });
  }
});

module.exports = router;
