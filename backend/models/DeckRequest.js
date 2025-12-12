/**
 * Deck Request & Contact Model
 */

const mongoose = require('mongoose');

const DeckRequestSchema = new mongoose.Schema({
  // Contact info
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
  // Request type
  requestType: {
    type: String,
    enum: ['deck_request', 'contact', 'inquiry', 'partnership'],
    default: 'deck_request',
  },
  // Interest
  investmentInterest: {
    type: String,
    enum: ['gold', 'platinum', 'diamond', 'exploring', 'not_sure'],
  },
  message: String,
  // Source
  source: {
    type: String,
    enum: ['website', 'app', 'referral', 'event', 'other'],
    default: 'website',
  },
  referralCode: String,
  // Deck delivery
  deckSent: {
    type: Boolean,
    default: false,
  },
  deckSentAt: Date,
  deckVersion: String,
  // Status
  status: {
    type: String,
    enum: ['new', 'reviewed', 'contacted', 'converted', 'closed'],
    default: 'new',
  },
  // Follow up
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  notes: String,
  // Conversion
  convertedToLead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
  },
  // Location
  ipAddress: String,
  location: {
    city: String,
    country: String,
  },
}, {
  timestamps: true,
});

DeckRequestSchema.index({ status: 1, createdAt: -1 });
DeckRequestSchema.index({ email: 1 });

module.exports = mongoose.model('DeckRequest', DeckRequestSchema);
