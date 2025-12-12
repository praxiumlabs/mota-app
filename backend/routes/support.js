/**
 * Support Chat Routes
 */

const express = require('express');
const router = express.Router();
const SupportTicket = require('../models/Support');
const { auth, requireInvestor } = require('../middleware/auth');

// Get user's tickets
router.get('/tickets', auth, async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ user: req.user._id })
      .sort({ updatedAt: -1 });
    
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// Get or create active chat
router.get('/chat', auth, async (req, res) => {
  try {
    // Find existing open ticket or create new one
    let ticket = await SupportTicket.findOne({
      user: req.user._id,
      status: { $in: ['open', 'pending', 'in_progress'] },
    });
    
    if (!ticket) {
      ticket = new SupportTicket({
        user: req.user._id,
        subject: 'Support Chat',
        isVIP: req.user.accessLevel === 'investor',
        messages: [{
          sender: 'support',
          content: `Welcome${req.user.accessLevel === 'investor' ? ' to VIP Support' : ''}! How can we help you today?`,
        }],
      });
      await ticket.save();
    }
    
    res.json({
      ticketId: ticket._id,
      ticketNumber: ticket.ticketNumber,
      messages: ticket.messages,
      status: ticket.status,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get chat' });
  }
});

// Send message
router.post('/message', auth, async (req, res) => {
  try {
    const { message, ticketId } = req.body;
    
    let ticket;
    
    if (ticketId) {
      ticket = await SupportTicket.findById(ticketId);
    } else {
      // Find or create ticket
      ticket = await SupportTicket.findOne({
        user: req.user._id,
        status: { $in: ['open', 'pending', 'in_progress'] },
      });
      
      if (!ticket) {
        ticket = new SupportTicket({
          user: req.user._id,
          subject: 'Support Chat',
          isVIP: req.user.accessLevel === 'investor',
        });
      }
    }
    
    ticket.messages.push({
      sender: 'user',
      senderUser: req.user._id,
      content: message,
    });
    
    if (ticket.status === 'open') {
      ticket.status = 'pending';
    }
    
    await ticket.save();
    
    res.json({
      success: true,
      ticketId: ticket._id,
      message: ticket.messages[ticket.messages.length - 1],
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get messages for a ticket
router.get('/messages/:ticketId', auth, async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.ticketId);
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    // Check ownership
    if (ticket.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(ticket.messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Get all tickets (admin)
router.get('/', auth, async (req, res) => {
  try {
    const { status, priority, isVIP, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (isVIP === 'true') query.isVIP = true;
    
    const tickets = await SupportTicket.find(query)
      .populate('user', 'name email investorTier')
      .populate('assignedTo', 'name email')
      .sort({ isVIP: -1, priority: -1, updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await SupportTicket.countDocuments(query);
    
    res.json({
      tickets,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
      stats: {
        open: await SupportTicket.countDocuments({ status: 'open' }),
        pending: await SupportTicket.countDocuments({ status: 'pending' }),
        vipOpen: await SupportTicket.countDocuments({ status: { $in: ['open', 'pending'] }, isVIP: true }),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// Reply to ticket (admin)
router.post('/:id/reply', auth, async (req, res) => {
  try {
    const { message } = req.body;
    
    const ticket = await SupportTicket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    ticket.messages.push({
      sender: 'support',
      senderUser: req.user._id,
      content: message,
    });
    
    ticket.status = 'in_progress';
    
    await ticket.save();
    
    res.json({
      success: true,
      message: ticket.messages[ticket.messages.length - 1],
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send reply' });
  }
});

// Update ticket status (admin)
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status, resolution } = req.body;
    
    const updates = { status };
    if (status === 'resolved') {
      updates.resolvedAt = new Date();
      updates.resolution = resolution;
    }
    
    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update ticket' });
  }
});

// Assign ticket (admin)
router.put('/:id/assign', auth, async (req, res) => {
  try {
    const { assignedTo } = req.body;
    
    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      { assignedTo, status: 'in_progress' },
      { new: true }
    ).populate('assignedTo', 'name email');
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Failed to assign ticket' });
  }
});

// Close ticket
router.put('/:id/close', auth, async (req, res) => {
  try {
    const { satisfactionRating, feedback } = req.body;
    
    const ticket = await SupportTicket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    ticket.status = 'closed';
    if (satisfactionRating) ticket.satisfactionRating = satisfactionRating;
    if (feedback) ticket.feedback = feedback;
    
    await ticket.save();
    
    res.json({ success: true, message: 'Ticket closed' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to close ticket' });
  }
});

module.exports = router;
