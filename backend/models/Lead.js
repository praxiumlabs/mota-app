/**
 * Lead Model
 * Lead pipeline management for investor prospects
 */

const mongoose = require('mongoose');

const LeadActivitySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['note', 'call', 'email', 'meeting', 'status_change', 'document'],
    required: true,
  },
  description: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const LeadSchema = new mongoose.Schema({
  // Contact Info
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  phone: String,
  company: String,
  title: String,
  // Source
  source: {
    type: String,
    enum: ['website', 'referral', 'event', 'advertisement', 'social', 'deck_request', 'other'],
    default: 'website',
  },
  referredBy: String,
  // Pipeline status
  status: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'],
    default: 'new',
  },
  // Investment interest
  investmentInterest: {
    tier: {
      type: String,
      enum: ['gold', 'platinum', 'diamond', 'undecided'],
    },
    estimatedAmount: Number,
    timeline: String,
  },
  // Qualification
  isQualified: {
    type: Boolean,
    default: false,
  },
  qualificationScore: {
    type: Number,
    min: 0,
    max: 100,
  },
  // Assignment
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  // Activity log
  activities: [LeadActivitySchema],
  // Notes
  notes: String,
  // Tags
  tags: [String],
  // Conversion
  convertedToUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  convertedAt: Date,
  // Address
  address: {
    city: String,
    state: String,
    country: String,
  },
  // Follow up
  nextFollowUp: Date,
  lastContacted: Date,
}, {
  timestamps: true,
});

LeadSchema.index({ status: 1, assignedTo: 1 });
LeadSchema.index({ email: 1 });
LeadSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Lead', LeadSchema);
