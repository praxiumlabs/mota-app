/**
 * Lead Pipeline Routes
 */

const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
const { auth } = require('../middleware/auth');

// Get all leads
router.get('/', auth, async (req, res) => {
  try {
    const { status, assignedTo, source, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (assignedTo) query.assignedTo = assignedTo;
    if (source) query.source = source;
    
    const leads = await Lead.find(query)
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Lead.countDocuments(query);
    
    // Pipeline stats
    const stats = {
      new: await Lead.countDocuments({ status: 'new' }),
      contacted: await Lead.countDocuments({ status: 'contacted' }),
      qualified: await Lead.countDocuments({ status: 'qualified' }),
      proposal: await Lead.countDocuments({ status: 'proposal' }),
      negotiation: await Lead.countDocuments({ status: 'negotiation' }),
      closed_won: await Lead.countDocuments({ status: 'closed_won' }),
      closed_lost: await Lead.countDocuments({ status: 'closed_lost' }),
    };
    
    res.json({
      leads,
      stats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

// Create lead
router.post('/', async (req, res) => {
  try {
    const lead = new Lead(req.body);
    await lead.save();
    res.status(201).json(lead);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create lead' });
  }
});

// Get lead by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('convertedToUser', 'name email');
    
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    
    res.json(lead);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch lead' });
  }
});

// Update lead
router.put('/:id', auth, async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    
    res.json(lead);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update lead' });
  }
});

// Update lead status
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    const lead = await Lead.findById(req.params.id);
    
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    
    lead.status = status;
    lead.activities.push({
      type: 'status_change',
      description: `Status changed to ${status}`,
      createdBy: req.user._id,
    });
    
    await lead.save();
    
    res.json(lead);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Add activity to lead
router.post('/:id/activity', auth, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    
    lead.activities.push({
      ...req.body,
      createdBy: req.user._id,
    });
    
    if (req.body.type === 'call' || req.body.type === 'email' || req.body.type === 'meeting') {
      lead.lastContacted = new Date();
    }
    
    await lead.save();
    
    res.json(lead);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add activity' });
  }
});

// Assign lead
router.put('/:id/assign', auth, async (req, res) => {
  try {
    const { assignedTo } = req.body;
    
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { assignedTo },
      { new: true }
    ).populate('assignedTo', 'name email');
    
    res.json(lead);
  } catch (error) {
    res.status(500).json({ error: 'Failed to assign lead' });
  }
});

// Delete lead
router.delete('/:id', auth, async (req, res) => {
  try {
    await Lead.findByIdAndDelete(req.params.id);
    res.json({ message: 'Lead deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete lead' });
  }
});

module.exports = router;
