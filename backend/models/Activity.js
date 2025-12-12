/**
 * Activity/Experience Model
 */

const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    enum: ['Water Sports', 'Adventure', 'Wellness', 'Cultural', 'Entertainment', 'Tours', 'Gaming'],
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
  price: {
    type: Number,
    required: true,
  },
  priceUnit: {
    type: String,
    default: 'person',
  },
  duration: {
    type: String,
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
  // Requirements
  minAge: Number,
  maxParticipants: Number,
  skillLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'all levels'],
    default: 'all levels',
  },
  // Includes
  includes: [String],
  notIncluded: [String],
  whatToBring: [String],
  // Schedule
  availableTimes: [String],
  availableDays: [String],
  // Status
  isAvailable: {
    type: Boolean,
    default: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

ActivitySchema.index({ category: 1, isFeatured: 1 });

module.exports = mongoose.model('Activity', ActivitySchema);
