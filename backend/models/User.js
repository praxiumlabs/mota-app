/**
 * User Model
 * Supports Guest, Member, and Investor tiers
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  avatar: {
    type: String,
  },
  accessLevel: {
    type: String,
    enum: ['guest', 'member', 'investor'],
    default: 'member',
  },
  investorTier: {
    type: String,
    enum: ['gold', 'platinum', 'diamond', null],
    default: null,
  },
  investmentAmount: {
    type: Number,
    default: 0,
  },
  portfolioValue: {
    type: Number,
    default: 0,
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'favoriteModel',
  }],
  favoriteModel: {
    type: String,
    enum: ['Lodging', 'Restaurant', 'Activity', 'Event'],
  },
  biometricEnabled: {
    type: Boolean,
    default: false,
  },
  notificationsEnabled: {
    type: Boolean,
    default: true,
  },
  memberSince: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  // Investor specific fields
  investorProfile: {
    accreditedStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
    kycCompleted: { type: Boolean, default: false },
    documentsSubmitted: [{ type: String }],
    investmentPreferences: {
      riskTolerance: { type: String, enum: ['conservative', 'moderate', 'aggressive'] },
      investmentHorizon: { type: String },
    },
  },
  // Address
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,
  },
}, {
  timestamps: true,
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive data from JSON
UserSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', UserSchema);
