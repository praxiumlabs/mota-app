/**
 * Funding Round & Milestone Model
 */

const mongoose = require('mongoose');

const MilestoneSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  targetDate: Date,
  completedDate: Date,
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'delayed'],
    default: 'pending',
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
});

const InvestmentSchema = new mongoose.Schema({
  investor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  tier: {
    type: String,
    enum: ['gold', 'platinum', 'diamond'],
    required: true,
  },
  investmentDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending',
  },
  documents: [{
    name: String,
    url: String,
    uploadedAt: Date,
  }],
});

const FundingRoundSchema = new mongoose.Schema({
  // Phase info
  phase: {
    type: Number,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: String,
  // Timeline
  startDate: {
    type: Date,
    required: true,
  },
  endDate: Date,
  period: String, // e.g., "2026-2028"
  // Funding
  targetAmount: {
    type: Number,
    required: true,
  },
  raisedAmount: {
    type: Number,
    default: 0,
  },
  minimumInvestment: Number,
  // Status
  status: {
    type: String,
    enum: ['upcoming', 'active', 'completed', 'closed'],
    default: 'upcoming',
  },
  // Investments
  investments: [InvestmentSchema],
  investorCount: {
    type: Number,
    default: 0,
  },
  // Milestones
  milestones: [MilestoneSchema],
  // Returns
  projectedReturns: {
    annual: Number,
    total: Number,
  },
  actualReturns: {
    annual: Number,
    total: Number,
  },
  // Dividends
  dividendSchedule: {
    frequency: {
      type: String,
      enum: ['monthly', 'quarterly', 'annually'],
      default: 'quarterly',
    },
    startDate: Date,
    nextPaymentDate: Date,
    projectedAmount: Number,
  },
  // Documents
  documents: [{
    name: String,
    type: {
      type: String,
      enum: ['pitch_deck', 'legal', 'financial', 'update', 'other'],
    },
    url: String,
    isPublic: { type: Boolean, default: false },
    uploadedAt: { type: Date, default: Date.now },
  }],
}, {
  timestamps: true,
});

FundingRoundSchema.index({ phase: 1 });
FundingRoundSchema.index({ status: 1 });

module.exports = mongoose.model('FundingRound', FundingRoundSchema);
