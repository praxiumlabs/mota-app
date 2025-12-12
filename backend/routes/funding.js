/**
 * Funding Rounds & Milestones Routes
 */

const express = require('express');
const router = express.Router();
const FundingRound = require('../models/FundingRound');
const { auth, requireInvestor } = require('../middleware/auth');

// Get all funding rounds
router.get('/', async (req, res) => {
  try {
    const rounds = await FundingRound.find()
      .select('-investments')
      .sort({ phase: 1 });
    
    res.json(rounds);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch funding rounds' });
  }
});

// Get timeline (public)
router.get('/timeline', async (req, res) => {
  try {
    const rounds = await FundingRound.find()
      .select('phase name period status milestones')
      .sort({ phase: 1 });
    
    const timeline = rounds.map(round => ({
      phase: round.phase,
      name: round.name,
      period: round.period,
      status: round.status,
      milestoneProgress: round.milestones?.length > 0
        ? Math.round(round.milestones.reduce((sum, m) => sum + m.progress, 0) / round.milestones.length)
        : 0,
    }));
    
    res.json(timeline);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch timeline' });
  }
});

// Get specific round
router.get('/:phase', async (req, res) => {
  try {
    const round = await FundingRound.findOne({ phase: req.params.phase });
    
    if (!round) {
      return res.status(404).json({ error: 'Funding round not found' });
    }
    
    // Remove sensitive investment details for non-admin
    const publicRound = round.toObject();
    delete publicRound.investments;
    
    res.json(publicRound);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch funding round' });
  }
});

// Create funding round (admin)
router.post('/', auth, async (req, res) => {
  try {
    const round = new FundingRound(req.body);
    await round.save();
    res.status(201).json(round);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create funding round' });
  }
});

// Update funding round (admin)
router.put('/:phase', auth, async (req, res) => {
  try {
    const round = await FundingRound.findOneAndUpdate(
      { phase: req.params.phase },
      req.body,
      { new: true }
    );
    
    if (!round) {
      return res.status(404).json({ error: 'Funding round not found' });
    }
    
    res.json(round);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update funding round' });
  }
});

// Add milestone
router.post('/:phase/milestones', auth, async (req, res) => {
  try {
    const round = await FundingRound.findOne({ phase: req.params.phase });
    
    if (!round) {
      return res.status(404).json({ error: 'Funding round not found' });
    }
    
    round.milestones.push(req.body);
    await round.save();
    
    res.json(round);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add milestone' });
  }
});

// Update milestone
router.put('/:phase/milestones/:milestoneId', auth, async (req, res) => {
  try {
    const round = await FundingRound.findOne({ phase: req.params.phase });
    
    if (!round) {
      return res.status(404).json({ error: 'Funding round not found' });
    }
    
    const milestone = round.milestones.id(req.params.milestoneId);
    
    if (!milestone) {
      return res.status(404).json({ error: 'Milestone not found' });
    }
    
    Object.assign(milestone, req.body);
    await round.save();
    
    res.json(round);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update milestone' });
  }
});

// Record investment (admin)
router.post('/:phase/investments', auth, async (req, res) => {
  try {
    const round = await FundingRound.findOne({ phase: req.params.phase });
    
    if (!round) {
      return res.status(404).json({ error: 'Funding round not found' });
    }
    
    round.investments.push(req.body);
    round.raisedAmount += req.body.amount;
    round.investorCount += 1;
    
    await round.save();
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record investment' });
  }
});

// Get funding stats (admin)
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const rounds = await FundingRound.find();
    
    const stats = {
      totalRaised: rounds.reduce((sum, r) => sum + r.raisedAmount, 0),
      totalTarget: rounds.reduce((sum, r) => sum + r.targetAmount, 0),
      totalInvestors: rounds.reduce((sum, r) => sum + r.investorCount, 0),
      activeRounds: rounds.filter(r => r.status === 'active').length,
      completedRounds: rounds.filter(r => r.status === 'completed').length,
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
