/**
 * Lodging Model
 * Resort accommodations
 */

const mongoose = require('mongoose');

const LodgingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['Suite', 'Villa', 'Bungalow', 'Penthouse', 'Cottage'],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  shortDescription: {
    type: String,
  },
  images: [{
    url: String,
    caption: String,
    isPrimary: { type: Boolean, default: false },
  }],
  price: {
    type: Number,
    required: true,
  },
  priceUnit: {
    type: String,
    default: 'night',
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  reviewCount: {
    type: Number,
    default: 0,
  },
  // Filters
  view: {
    type: String,
    enum: ['ocean', 'beach', 'garden', 'pool', 'mountain'],
  },
  dogFriendly: {
    type: Boolean,
    default: false,
  },
  kidsFriendly: {
    type: Boolean,
    default: true,
  },
  priceCategory: {
    type: String,
    enum: ['budget', 'mid', 'luxury', 'ultra-luxury'],
    default: 'luxury',
  },
  // Amenities
  amenities: [{
    type: String,
  }],
  bedrooms: {
    type: Number,
    default: 1,
  },
  bathrooms: {
    type: Number,
    default: 1,
  },
  maxGuests: {
    type: Number,
    default: 2,
  },
  squareFeet: {
    type: Number,
  },
  // Availability
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
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
}, {
  timestamps: true,
});

// Index for filtering
LodgingSchema.index({ view: 1, dogFriendly: 1, kidsFriendly: 1, priceCategory: 1 });
LodgingSchema.index({ isFeatured: 1, isAvailable: 1 });

module.exports = mongoose.model('Lodging', LodgingSchema);
