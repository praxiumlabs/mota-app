/**
 * Investor Routes
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const FundingRound = require('../models/FundingRound');
const { auth, requireInvestor } = require('../middleware/auth');

// Get investor dashboard
router.get('/dashboard', auth, requireInvestor, async (req, res) => {
  try {
    const user = req.user;
    
    // Get all funding rounds
    const fundingRounds = await FundingRound.find().sort({ phase: 1 });
    
    // Get user's investments
    const userInvestments = fundingRounds.reduce((acc, round) => {
      const investment = round.investments.find(
        inv => inv.investor.toString() === user._id.toString()
      );
      if (investment) {
        acc.push({
          phase: round.phase,
          phaseName: round.name,
          amount: investment.amount,
          date: investment.investmentDate,
          status: round.status,
        });
      }
      return acc;
    }, []);
    
    res.json({
      portfolioValue: user.portfolioValue || user.investmentAmount,
      investmentAmount: user.investmentAmount,
      tier: user.investorTier,
      investments: userInvestments,
      timeline: fundingRounds.map(round => ({
        phase: round.phase,
        name: round.name,
        period: round.period,
        status: round.status,
        progress: round.milestones?.reduce((sum, m) => sum + m.progress, 0) / (round.milestones?.length || 1),
      })),
      dividends: {
        nextExpected: 864000,
        nextDate: 'Q1 2031',
        frequency: 'quarterly',
        startDate: 'Post Phase 3',
      },
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
});

// Get investment history
router.get('/history', auth, requireInvestor, async (req, res) => {
  try {
    const fundingRounds = await FundingRound.find();
    
    const history = fundingRounds.reduce((acc, round) => {
      const investment = round.investments.find(
        inv => inv.investor.toString() === req.user._id.toString()
      );
      if (investment) {
        acc.push({
          phase: round.phase,
          phaseName: round.name,
          amount: investment.amount,
          tier: investment.tier,
          date: investment.investmentDate,
          status: investment.status,
        });
      }
      return acc;
    }, []);
    
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Get documents
router.get('/documents', auth, requireInvestor, async (req, res) => {
  try {
    const fundingRounds = await FundingRound.find();
    
    const documents = fundingRounds.reduce((acc, round) => {
      round.documents.forEach(doc => {
        if (doc.isPublic || req.user.investorTier) {
          acc.push({
            ...doc.toObject(),
            phase: round.phase,
            phaseName: round.name,
          });
        }
      });
      return acc;
    }, []);
    
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Get project updates
router.get('/updates', auth, requireInvestor, async (req, res) => {
  try {
    const fundingRounds = await FundingRound.find()
      .select('phase name milestones status')
      .sort({ phase: 1 });
    
    const updates = fundingRounds.map(round => ({
      phase: round.phase,
      name: round.name,
      status: round.status,
      milestones: round.milestones,
    }));
    
    res.json(updates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch updates' });
  }
});

// Get all investors (admin)
router.get('/', auth, async (req, res) => {
  try {
    const { tier, page = 1, limit = 20 } = req.query;
    
    const query = { accessLevel: 'investor' };
    if (tier) query.investorTier = tier;
    
    const investors = await User.find(query)
      .select('-password')
      .sort({ investmentAmount: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await User.countDocuments(query);
    
    res.json({
      investors,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
      stats: {
        totalInvestors: total,
        goldCount: await User.countDocuments({ accessLevel: 'investor', investorTier: 'gold' }),
        platinumCount: await User.countDocuments({ accessLevel: 'investor', investorTier: 'platinum' }),
        diamondCount: await User.countDocuments({ accessLevel: 'investor', investorTier: 'diamond' }),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch investors' });
  }
});

module.exports = router;
