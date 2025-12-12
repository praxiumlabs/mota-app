/**
 * Exotic Fleet Model
 * Cars and Yachts for PCH Exotics
 */

const mongoose = require('mongoose');

const ExoticFleetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  
  type: {
    type: String,
    enum: ['car', 'yacht'],
    required: true
  },
  
  // For cars
  make: String,
  model: String,
  year: Number,
  
  // For yachts
  length: String, // e.g., "65ft"
  capacity: Number, // passenger capacity
  
  description: String,
  shortDescription: String,
  
  // Pricing
  pricePerDay: Number,
  pricePerHour: Number,
  
  // Images
  images: [{
    url: String,
    isPrimary: { type: Boolean, default: false }
  }],
  
  // Specs
  specs: {
    engine: String,
    horsepower: Number,
    topSpeed: String,
    acceleration: String, // 0-60
    transmission: String,
    // Yacht specific
    cabins: Number,
    crew: Number
  },
  
  // Features
  features: [String],
  
  // Availability
  isAvailable: {
    type: Boolean,
    default: true
  },
  
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  // Access level required
  accessLevel: {
    type: String,
    enum: ['all', 'member', 'investor'],
    default: 'member'
  },
  
  investorTierRequired: {
    type: String,
    enum: ['', 'gold', 'platinum', 'diamond'],
    default: ''
  },
  
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 5
  },
  
  reviewCount: {
    type: Number,
    default: 0
  }
  
}, { timestamps: true });

module.exports = mongoose.model('ExoticFleet', ExoticFleetSchema);
