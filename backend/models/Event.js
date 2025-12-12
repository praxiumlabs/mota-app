/**
 * Event Model
 */

const mongoose = require('mongoose');

const RSVPSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  guests: {
    type: Number,
    default: 1,
    min: 1,
    max: 10,
  },
  dietaryRequirements: String,
  specialRequests: String,
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'attended'],
    default: 'confirmed',
  },
  rsvpDate: {
    type: Date,
    default: Date.now,
  },
});

const EventSchema = new mongoose.Schema({
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
  images: [{
    url: String,
    caption: String,
    isPrimary: { type: Boolean, default: false },
  }],
  date: {
    type: Date,
    required: true,
  },
  endDate: Date,
  time: String,
  venue: {
    type: String,
    required: true,
  },
  venueAddress: String,
  // Capacity
  capacity: {
    type: Number,
  },
  currentRSVPs: {
    type: Number,
    default: 0,
  },
  // RSVPs
  rsvps: [RSVPSchema],
  // Event details
  category: {
    type: String,
    enum: ['Gala', 'Concert', 'Dining', 'Sports', 'Wellness', 'Entertainment', 'Investor', 'VIP'],
    default: 'Entertainment',
  },
  dressCode: String,
  // Pricing
  isFree: {
    type: Boolean,
    default: true,
  },
  price: Number,
  // Access
  accessLevel: {
    type: String,
    enum: ['public', 'member', 'investor', 'vip'],
    default: 'member',
  },
  investorTierRequired: {
    type: String,
    enum: ['gold', 'platinum', 'diamond', null],
    default: null,
  },
  // Status
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming',
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

EventSchema.index({ date: 1, status: 1, isFeatured: 1 });

// Virtual to check if event is full
EventSchema.virtual('isFull').get(function() {
  return this.capacity && this.currentRSVPs >= this.capacity;
});

module.exports = mongoose.model('Event', EventSchema);
