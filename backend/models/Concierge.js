/**
 * Concierge Request Model
 */

const mongoose = require('mongoose');

const ConciergeRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Request type
  serviceCategory: {
    type: String,
    enum: ['private-tours', 'dining', 'spa', 'airport', 'tickets', 'special', 'luxury-experiences'],
    required: true,
  },
  serviceName: {
    type: String,
    required: true,
  },
  selectedOption: {
    type: String,
    required: true,
  },
  // VIP request
  isVIP: {
    type: Boolean,
    default: false,
  },
  // Schedule
  preferredDate: {
    type: Date,
    required: true,
  },
  preferredTime: String,
  alternateDate: Date,
  alternateTime: String,
  // Details
  guestCount: {
    type: Number,
    default: 1,
  },
  specialRequests: String,
  notes: String,
  // Status
  status: {
    type: String,
    enum: ['pending', 'processing', 'confirmed', 'completed', 'cancelled'],
    default: 'pending',
  },
  // Assignment
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  // Pricing
  estimatedPrice: Number,
  finalPrice: Number,
  isPaid: {
    type: Boolean,
    default: false,
  },
  // Communication
  adminNotes: String,
  internalPriority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal',
  },
  // Confirmation
  confirmationNumber: String,
  confirmedAt: Date,
}, {
  timestamps: true,
});

ConciergeRequestSchema.pre('save', function(next) {
  if (!this.confirmationNumber) {
    const prefix = 'CON';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.confirmationNumber = `${prefix}-${timestamp}-${random}`;
  }
  next();
});

ConciergeRequestSchema.index({ user: 1, status: 1 });
ConciergeRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('ConciergeRequest', ConciergeRequestSchema);
