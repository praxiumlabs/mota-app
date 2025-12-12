/**
 * Partner Offers Model
 */

const mongoose = require('mongoose');

const OfferSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  shortDescription: String,
  // Partner info
  partner: {
    name: String,
    logo: String,
    website: String,
  },
  // Offer details
  offerType: {
    type: String,
    enum: ['discount', 'complimentary', 'upgrade', 'exclusive_access', 'bundle'],
    required: true,
  },
  discountPercent: Number,
  discountAmount: Number,
  // Images
  images: [{
    url: String,
    isPrimary: { type: Boolean, default: false },
  }],
  // Code
  code: {
    type: String,
    unique: true,
    sparse: true,
  },
  // Validity
  validFrom: {
    type: Date,
    default: Date.now,
  },
  validUntil: Date,
  // Access restrictions
  accessLevel: {
    type: String,
    enum: ['all', 'member', 'investor'],
    default: 'member',
  },
  investorTierRequired: {
    type: String,
    enum: ['gold', 'platinum', 'diamond', null],
    default: null,
  },
  // Usage
  maxUses: Number,
  currentUses: {
    type: Number,
    default: 0,
  },
  usedBy: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    usedAt: { type: Date, default: Date.now },
  }],
  // Terms
  terms: String,
  // Status
  isActive: {
    type: Boolean,
    default: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  // Category
  category: {
    type: String,
    enum: ['dining', 'spa', 'activities', 'lodging', 'travel', 'shopping', 'entertainment'],
  },
}, {
  timestamps: true,
});

OfferSchema.index({ isActive: 1, accessLevel: 1 });
OfferSchema.index({ code: 1 });

module.exports = mongoose.model('Offer', OfferSchema);
