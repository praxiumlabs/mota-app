/**
 * Restaurant Model
 * Resort dining establishments
 */

const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  cuisine: {
    type: String,
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
  priceRange: {
    type: String,
    enum: ['$', '$$', '$$$', '$$$$'],
    required: true,
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
  dogFriendly: {
    type: Boolean,
    default: false,
  },
  kidsFriendly: {
    type: Boolean,
    default: true,
  },
  // Hours
  hours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String },
  },
  // Menu highlights
  menuHighlights: [{
    name: String,
    description: String,
    price: Number,
  }],
  // Features
  features: [{
    type: String,
  }],
  dressCode: {
    type: String,
    enum: ['casual', 'smart casual', 'business casual', 'formal'],
    default: 'smart casual',
  },
  reservationRequired: {
    type: Boolean,
    default: true,
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
  // Contact
  phone: String,
  email: String,
  // Location
  location: {
    building: String,
    floor: Number,
  },
}, {
  timestamps: true,
});

RestaurantSchema.index({ cuisine: 1, priceRange: 1, isFeatured: 1 });

module.exports = mongoose.model('Restaurant', RestaurantSchema);
