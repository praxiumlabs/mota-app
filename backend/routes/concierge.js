/**
 * Concierge Routes
 */

const express = require('express');
const router = express.Router();
const ConciergeRequest = require('../models/Concierge');
const { auth, requireMember, requireInvestor } = require('../middleware/auth');

// Get user's concierge requests
router.get('/my-requests', auth, async (req, res) => {
  try {
    const requests = await ConciergeRequest.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// Get all requests (admin)
router.get('/', auth, async (req, res) => {
  try {
    const { status, isVIP, serviceCategory, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (isVIP === 'true') query.isVIP = true;
    if (serviceCategory) query.serviceCategory = serviceCategory;
    
    const requests = await ConciergeRequest.find(query)
      .populate('user', 'name email phone investorTier')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await ConciergeRequest.countDocuments(query);
    
    res.json({
      requests,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
      stats: {
        pending: await ConciergeRequest.countDocuments({ status: 'pending' }),
        processing: await ConciergeRequest.countDocuments({ status: 'processing' }),
        vipPending: await ConciergeRequest.countDocuments({ status: 'pending', isVIP: true }),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// Create concierge request
router.post('/request', auth, requireMember, async (req, res) => {
  try {
    const { 
      serviceCategory, serviceName, selectedOption,
      preferredDate, preferredTime, alternateDate, alternateTime,
      guestCount, specialRequests, notes 
    } = req.body;
    
    // Check if VIP request
    const isVIP = req.user.accessLevel === 'investor';
    
    const request = new ConciergeRequest({
      user: req.user._id,
      serviceCategory,
      serviceName,
      selectedOption,
      preferredDate: new Date(preferredDate),
      preferredTime,
      alternateDate: alternateDate ? new Date(alternateDate) : undefined,
      alternateTime,
      guestCount,
      specialRequests,
      notes,
      isVIP,
      internalPriority: isVIP ? 'high' : 'normal',
    });
    
    await request.save();
    
    res.status(201).json({
      success: true,
      request,
      message: `Your ${serviceName} request has been submitted. Confirmation: ${request.confirmationNumber}`,
    });
  } catch (error) {
    console.error('Concierge request error:', error);
    res.status(500).json({ error: 'Failed to submit request' });
  }
});

// VIP concierge request
router.post('/vip-request', auth, requireInvestor, async (req, res) => {
  try {
    const request = new ConciergeRequest({
      ...req.body,
      user: req.user._id,
      isVIP: true,
      internalPriority: req.user.investorTier === 'diamond' ? 'urgent' : 'high',
    });
    
    await request.save();
    
    res.status(201).json({
      success: true,
      request,
      message: 'Your VIP request has been prioritized.',
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit VIP request' });
  }
});

// Get request by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const request = await ConciergeRequest.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('assignedTo', 'name email');
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch request' });
  }
});

// Update request status (admin)
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status, adminNotes, estimatedPrice } = req.body;
    
    const updates = { status };
    if (adminNotes) updates.adminNotes = adminNotes;
    if (estimatedPrice) updates.estimatedPrice = estimatedPrice;
    if (status === 'confirmed') updates.confirmedAt = new Date();
    
    const request = await ConciergeRequest.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update request' });
  }
});

// Assign request (admin)
router.put('/:id/assign', auth, async (req, res) => {
  try {
    const { assignedTo } = req.body;
    
    const request = await ConciergeRequest.findByIdAndUpdate(
      req.params.id,
      { assignedTo, status: 'processing' },
      { new: true }
    ).populate('assignedTo', 'name email');
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: 'Failed to assign request' });
  }
});

// Cancel request
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const request = await ConciergeRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    if (request.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    request.status = 'cancelled';
    await request.save();
    
    res.json({ success: true, message: 'Request cancelled' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel request' });
  }
});

module.exports = router;
