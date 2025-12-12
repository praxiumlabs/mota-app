/**
 * Newsletter & Communication Model
 */

const mongoose = require('mongoose');

// Subscriber Schema
const SubscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  name: String,
  // Subscription
  isSubscribed: {
    type: Boolean,
    default: true,
  },
  subscribedAt: {
    type: Date,
    default: Date.now,
  },
  unsubscribedAt: Date,
  // Preferences
  preferences: {
    promotions: { type: Boolean, default: true },
    events: { type: Boolean, default: true },
    investorUpdates: { type: Boolean, default: true },
    newsletter: { type: Boolean, default: true },
  },
  // User link
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  // Source
  source: {
    type: String,
    enum: ['website', 'app', 'registration', 'event', 'other'],
    default: 'website',
  },
  // Stats
  emailsReceived: { type: Number, default: 0 },
  emailsOpened: { type: Number, default: 0 },
  lastEmailOpened: Date,
}, {
  timestamps: true,
});

// Campaign Schema
const CampaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  content: {
    html: String,
    text: String,
  },
  // Target audience
  audience: {
    type: String,
    enum: ['all', 'members', 'investors', 'leads', 'custom'],
    default: 'all',
  },
  customAudience: [{
    type: String, // Email addresses
  }],
  investorTierFilter: {
    type: String,
    enum: ['gold', 'platinum', 'diamond', 'all', null],
  },
  // Schedule
  scheduledAt: Date,
  sentAt: Date,
  // Status
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sending', 'sent', 'cancelled'],
    default: 'draft',
  },
  // Stats
  stats: {
    totalRecipients: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 },
    opened: { type: Number, default: 0 },
    clicked: { type: Number, default: 0 },
    bounced: { type: Number, default: 0 },
    unsubscribed: { type: Number, default: 0 },
  },
  // Created by
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

SubscriberSchema.index({ email: 1 });
SubscriberSchema.index({ isSubscribed: 1 });
CampaignSchema.index({ status: 1, scheduledAt: 1 });

const Subscriber = mongoose.model('Subscriber', SubscriberSchema);
const Campaign = mongoose.model('Campaign', CampaignSchema);

module.exports = { Subscriber, Campaign };
