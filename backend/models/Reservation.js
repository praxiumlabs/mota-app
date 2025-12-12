/**
 * Reservation Model
 * Handles all booking types: lodging, dining, activities
 */

const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Reservation type
  type: {
    type: String,
    enum: ['lodging', 'restaurant', 'activity', 'nightlife'],
    required: true,
  },
  // Reference to the booked item
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'itemModel',
  },
  itemModel: {
    type: String,
    enum: ['Lodging', 'Restaurant', 'Activity', 'Nightlife'],
    required: true,
  },
  itemName: {
    type: String,
    required: true,
  },
  // Booking details
  date: {
    type: Date,
    required: true,
  },
  endDate: Date, // For lodging
  time: String,
  guests: {
    type: Number,
    required: true,
    min: 1,
  },
  // Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'],
    default: 'pending',
  },
  // Additional info
  specialRequests: String,
  dietaryRequirements: String,
  occasion: String,
  // Pricing
  totalPrice: Number,
  discount: Number,
  discountCode: String,
  // Confirmation
  confirmationNumber: {
    type: String,
    unique: true,
  },
  confirmedAt: Date,
  // Cancellation
  cancelledAt: Date,
  cancellationReason: String,
  // Notes
  adminNotes: String,
}, {
  timestamps: true,
});

// Generate confirmation number before save
ReservationSchema.pre('save', function(next) {
  if (!this.confirmationNumber) {
    const prefix = this.type.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.confirmationNumber = `${prefix}-${timestamp}-${random}`;
  }
  next();
});

ReservationSchema.index({ user: 1, status: 1 });
ReservationSchema.index({ date: 1, type: 1 });
ReservationSchema.index({ confirmationNumber: 1 });

module.exports = mongoose.model('Reservation', ReservationSchema);
