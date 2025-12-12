/**
 * Admin Routes - Analytics Dashboard
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Reservation = require('../models/Reservation');
const Event = require('../models/Event');
const ConciergeRequest = require('../models/Concierge');
const Lead = require('../models/Lead');
const FundingRound = require('../models/FundingRound');
const DeckRequest = require('../models/DeckRequest');
const SupportTicket = require('../models/Support');
const { Subscriber } = require('../models/Newsletter');
const { auth } = require('../middleware/auth');

// Dashboard Overview
router.get('/dashboard', auth, async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    
    // User stats
    const userStats = {
      total: await User.countDocuments(),
      members: await User.countDocuments({ accessLevel: 'member' }),
      investors: await User.countDocuments({ accessLevel: 'investor' }),
      newThisMonth: await User.countDocuments({ createdAt: { $gte: startOfMonth } }),
      byTier: {
        gold: await User.countDocuments({ investorTier: 'gold' }),
        platinum: await User.countDocuments({ investorTier: 'platinum' }),
        diamond: await User.countDocuments({ investorTier: 'diamond' }),
      },
    };
    
    // Reservation stats
    const reservationStats = {
      total: await Reservation.countDocuments(),
      thisMonth: await Reservation.countDocuments({ createdAt: { $gte: startOfMonth } }),
      pending: await Reservation.countDocuments({ status: 'pending' }),
      confirmed: await Reservation.countDocuments({ status: 'confirmed' }),
      byType: {
        lodging: await Reservation.countDocuments({ type: 'lodging' }),
        restaurant: await Reservation.countDocuments({ type: 'restaurant' }),
        activity: await Reservation.countDocuments({ type: 'activity' }),
      },
    };
    
    // Event stats
    const eventStats = {
      total: await Event.countDocuments(),
      upcoming: await Event.countDocuments({ date: { $gte: new Date() }, status: 'upcoming' }),
      totalRSVPs: await Event.aggregate([
        { $group: { _id: null, total: { $sum: '$currentRSVPs' } } }
      ]).then(r => r[0]?.total || 0),
    };
    
    // Concierge stats
    const conciergeStats = {
      total: await ConciergeRequest.countDocuments(),
      pending: await ConciergeRequest.countDocuments({ status: 'pending' }),
      vipPending: await ConciergeRequest.countDocuments({ status: 'pending', isVIP: true }),
      thisWeek: await ConciergeRequest.countDocuments({ createdAt: { $gte: startOfWeek } }),
    };
    
    // Lead stats
    const leadStats = {
      total: await Lead.countDocuments(),
      new: await Lead.countDocuments({ status: 'new' }),
      qualified: await Lead.countDocuments({ status: 'qualified' }),
      converted: await Lead.countDocuments({ status: 'closed_won' }),
      thisMonth: await Lead.countDocuments({ createdAt: { $gte: startOfMonth } }),
    };
    
    // Funding stats
    const fundingRounds = await FundingRound.find();
    const fundingStats = {
      totalRaised: fundingRounds.reduce((sum, r) => sum + r.raisedAmount, 0),
      totalTarget: fundingRounds.reduce((sum, r) => sum + r.targetAmount, 0),
      totalInvestors: fundingRounds.reduce((sum, r) => sum + r.investorCount, 0),
      activePhase: fundingRounds.find(r => r.status === 'active')?.phase || null,
    };
    
    // Support stats
    const supportStats = {
      openTickets: await SupportTicket.countDocuments({ status: { $in: ['open', 'pending'] } }),
      vipTickets: await SupportTicket.countDocuments({ status: { $in: ['open', 'pending'] }, isVIP: true }),
      avgResolutionTime: 'N/A', // Would calculate from resolved tickets
    };
    
    // Deck request stats
    const deckStats = {
      total: await DeckRequest.countDocuments(),
      new: await DeckRequest.countDocuments({ status: 'new' }),
      pendingSend: await DeckRequest.countDocuments({ deckSent: false, requestType: 'deck_request' }),
      thisMonth: await DeckRequest.countDocuments({ createdAt: { $gte: startOfMonth } }),
    };
    
    // Newsletter stats
    const newsletterStats = {
      subscribers: await Subscriber.countDocuments({ isSubscribed: true }),
      newThisMonth: await Subscriber.countDocuments({ subscribedAt: { $gte: startOfMonth } }),
    };
    
    res.json({
      users: userStats,
      reservations: reservationStats,
      events: eventStats,
      concierge: conciergeStats,
      leads: leadStats,
      funding: fundingStats,
      support: supportStats,
      deckRequests: deckStats,
      newsletter: newsletterStats,
      generatedAt: new Date(),
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
});

// Activity feed
router.get('/activity', auth, async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    // Get recent activities from various collections
    const [users, reservations, rsvps, concierge, leads, support] = await Promise.all([
      User.find().sort({ createdAt: -1 }).limit(5).select('name email accessLevel createdAt'),
      Reservation.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name').select('type itemName status createdAt user'),
      Event.find({ 'rsvps.0': { $exists: true } }).sort({ 'rsvps.rsvpDate': -1 }).limit(5).select('name rsvps'),
      ConciergeRequest.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name').select('serviceName status createdAt user'),
      Lead.find().sort({ createdAt: -1 }).limit(5).select('name status source createdAt'),
      SupportTicket.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name').select('ticketNumber status createdAt user'),
    ]);
    
    // Combine and format activities
    const activities = [
      ...users.map(u => ({ type: 'user_registered', data: u, time: u.createdAt })),
      ...reservations.map(r => ({ type: 'reservation', data: r, time: r.createdAt })),
      ...concierge.map(c => ({ type: 'concierge', data: c, time: c.createdAt })),
      ...leads.map(l => ({ type: 'lead', data: l, time: l.createdAt })),
      ...support.map(s => ({ type: 'support', data: s, time: s.createdAt })),
    ];
    
    // Sort by time
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    
    res.json(activities.slice(0, parseInt(limit)));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

// Analytics - User growth
router.get('/analytics/users', auth, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    const days = parseInt(period) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const growth = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    
    res.json(growth);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Analytics - Reservations
router.get('/analytics/reservations', auth, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    const days = parseInt(period) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const byType = await Reservation.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
        },
      },
    ]);
    
    const byDay = await Reservation.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    
    res.json({ byType, byDay });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Analytics - Leads pipeline
router.get('/analytics/leads', auth, async (req, res) => {
  try {
    const pipeline = await Lead.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$investmentInterest.estimatedAmount' },
        },
      },
    ]);
    
    const bySource = await Lead.aggregate([
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 },
        },
      },
    ]);
    
    res.json({ pipeline, bySource });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// System health
router.get('/health', auth, async (req, res) => {
  try {
    const dbStatus = require('mongoose').connection.readyState === 1 ? 'connected' : 'disconnected';
    
    res.json({
      status: 'ok',
      database: dbStatus,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date(),
    });
  } catch (error) {
    res.status(500).json({ error: 'Health check failed' });
  }
});

module.exports = router;
