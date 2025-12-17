/**
 * Reservation Model
 * Full booking flow with dietary restrictions
 */

const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  // Item being booked
  itemType: {
    type: String,
    enum: ['restaurant', 'lodging', 'activity', 'event', 'fleet'],
    required: true,
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'itemModel',
  },
  itemModel: {
    type: String,
    enum: ['Restaurant', 'Lodging', 'Activity', 'Event', 'ExoticFleet'],
  },
  itemName: String,
  
  // Booking Details (Name, Email, Phone, Special Requests)
  bookingDetails: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    specialRequests: String,
  },
  
  // Date & Time
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  endTime: String,
  
  // Guests
  guestCount: {
    type: Number,
    default: 1,
  },
  
  // Occasion
  occasion: {
    type: String,
    enum: ['casual', 'birthday', 'anniversary', 'business', 'celebration', 'date', 'other', null],
  },
  
  // Dietary Restrictions (transmitted to venue)
  dietaryRestrictions: [{
    type: String,
  }],
  
  // Fixed Event Flag (read-only date/time for events like Investor Summit)
  isFixedEvent: {
    type: Boolean,
    default: false,
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'],
    default: 'pending',
  },
  
  // Confirmation
  confirmationNumber: {
    type: String,
    unique: true,
  },
  confirmedAt: Date,
  confirmedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  
  // Cancellation
  cancelledAt: Date,
  cancellationReason: String,
  
  // Payment
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'bank', 'credit_line', 'equity'],
  },
  amount: Number,
  transactionId: String,
  
  // Notes for venue
  venueNotes: String,
  
}, { timestamps: true });

// Generate confirmation number
ReservationSchema.pre('save', function(next) {
  if (!this.confirmationNumber) {
    const prefix = this.itemType.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.confirmationNumber = `${prefix}-${timestamp}-${random}`;
  }
  
  const modelMap = {
    restaurant: 'Restaurant',
    lodging: 'Lodging',
    activity: 'Activity',
    event: 'Event',
    fleet: 'ExoticFleet',
  };
  this.itemModel = modelMap[this.itemType];
  
  next();
});

ReservationSchema.index({ user: 1, status: 1 });
ReservationSchema.index({ itemType: 1, itemId: 1, date: 1 });
ReservationSchema.index({ confirmationNumber: 1 });

module.exports = mongoose.model('Reservation', ReservationSchema);
