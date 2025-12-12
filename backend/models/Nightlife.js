/**
 * Nightlife Model
 * Bars, clubs, lounges
 */

const mongoose = require('mongoose');

const NightlifeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['Bar', 'Nightclub', 'Lounge', 'Rooftop Bar', 'Casino Lounge', 'Pool Bar', 'Speakeasy', 'Beach Bar'],
    required: true,
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
  priceRange: {
    type: String,
    enum: ['$', '$$', '$$$', '$$$$'],
    default: '$$$',
  },
  // Hours
  hours: String,
  openTime: String,
  closeTime: String,
  // Features
  features: [String],
  musicType: String,
  dressCode: {
    type: String,
    enum: ['casual', 'smart casual', 'upscale', 'formal'],
    default: 'smart casual',
  },
  // Age restriction
  minAge: {
    type: Number,
    default: 21,
  },
  // Reservations
  reservationRequired: {
    type: Boolean,
    default: false,
  },
  // Status
  isAvailable: {
    type: Boolean,
    default: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  // Location
  location: {
    building: String,
    floor: Number,
  },
}, {
  timestamps: true,
});

NightlifeSchema.index({ type: 1, isFeatured: 1 });

module.exports = mongoose.model('Nightlife', NightlifeSchema);
