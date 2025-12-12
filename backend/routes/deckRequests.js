/**
 * Deck Requests & Contacts Routes
 */

const express = require('express');
const router = express.Router();
const DeckRequest = require('../models/DeckRequest');
const Lead = require('../models/Lead');
const { auth } = require('../middleware/auth');

// Submit deck request (public)
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, company, title, investmentInterest, message, source, referralCode } = req.body;
    
    // Check for existing request
    const existing = await DeckRequest.findOne({ email: email.toLowerCase() });
    
    if (existing && existing.deckSent) {
      return res.status(400).json({ error: 'Deck already sent to this email' });
    }
    
    const request = new DeckRequest({
      name,
      email: email.toLowerCase(),
      phone,
      company,
      title,
      investmentInterest,
      message,
      source: source || 'website',
      referralCode,
      requestType: 'deck_request',
    });
    
    await request.save();
    
    // Auto-create lead
    const lead = new Lead({
      name,
      email: email.toLowerCase(),
      phone,
      company,
      title,
      source: 'deck_request',
      investmentInterest: {
        tier: investmentInterest,
      },
      notes: message,
    });
    
    await lead.save();
    
    request.convertedToLead = lead._id;
    await request.save();
    
    res.status(201).json({
      success: true,
      message: 'Your request has been received. We will send the deck to your email shortly.',
    });
  } catch (error) {
    console.error('Deck request error:', error);
    res.status(500).json({ error: 'Failed to submit request' });
  }
});

// Submit contact form (public)
router.post('/contact', async (req, res) => {
  try {
    const request = new DeckRequest({
      ...req.body,
      requestType: 'contact',
    });
    
    await request.save();
    
    res.status(201).json({
      success: true,
      message: 'Your message has been received. We will get back to you soon.',
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit contact form' });
  }
});

// Get all requests (admin)
router.get('/', auth, async (req, res) => {
  try {
    const { status, requestType, deckSent, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (requestType) query.requestType = requestType;
    if (deckSent === 'true') query.deckSent = true;
    if (deckSent === 'false') query.deckSent = false;
    
    const requests = await DeckRequest.find(query)
      .populate('assignedTo', 'name email')
      .populate('convertedToLead')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await DeckRequest.countDocuments(query);
    
    res.json({
      requests,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
      stats: {
        newRequests: await DeckRequest.countDocuments({ status: 'new' }),
        pendingDeck: await DeckRequest.countDocuments({ status: 'new', deckSent: false, requestType: 'deck_request' }),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// Get request by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const request = await DeckRequest.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('convertedToLead');
    
    if (!request) return res.status(404).json({ error: 'Request not found' });
    
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch request' });
  }
});

// Update request (admin)
router.put('/:id', auth, async (req, res) => {
  try {
    const request = await DeckRequest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!request) return res.status(404).json({ error: 'Request not found' });
    
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update request' });
  }
});

// Mark deck as sent
router.put('/:id/deck-sent', auth, async (req, res) => {
  try {
    const { deckVersion } = req.body;
    
    const request = await DeckRequest.findByIdAndUpdate(
      req.params.id,
      {
        deckSent: true,
        deckSentAt: new Date(),
        deckVersion,
        status: 'reviewed',
      },
      { new: true }
    );
    
    if (!request) return res.status(404).json({ error: 'Request not found' });
    
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update request' });
  }
});

// Delete request (admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    await DeckRequest.findByIdAndDelete(req.params.id);
    res.json({ message: 'Request deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete request' });
  }
});

module.exports = router;
