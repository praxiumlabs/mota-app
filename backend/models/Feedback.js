/**
 * Feedback Model
 * Rating system (1-3★ → support, 4-5★ → app store)
 */

const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  userEmail: String,
  
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  
  // improvement = 1-3 stars, positive = 4-5 stars
  type: {
    type: String,
    enum: ['improvement', 'positive', 'general'],
    default: 'general',
  },
  
  feedback: {
    type: String,
    required: true,
  },
  
  likedMost: String,
  
  status: {
    type: String,
    enum: ['new', 'reviewed', 'actioned', 'archived'],
    default: 'new',
  },
  
  adminNotes: String,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  reviewedAt: Date,
  
  source: {
    type: String,
    enum: ['app_prompt', 'manual', 'support'],
    default: 'app_prompt',
  },
  
  deviceInfo: {
    platform: String,
    version: String,
    device: String,
  },
  
}, { timestamps: true });

FeedbackSchema.index({ status: 1, createdAt: -1 });
FeedbackSchema.index({ rating: 1 });
FeedbackSchema.index({ type: 1 });

module.exports = mongoose.model('Feedback', FeedbackSchema);
