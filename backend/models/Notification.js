/**
 * Notification Model
 * For sending notifications to users
 */

const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  // Target audience
  targetType: {
    type: String,
    enum: ['all', 'members', 'investors', 'gold', 'platinum', 'diamond', 'specific'],
    default: 'all'
  },
  
  // For specific user targeting
  targetUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Notification content
  title: {
    type: String,
    required: true
  },
  
  message: {
    type: String,
    required: true
  },
  
  // Type of notification
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'upgrade', 'event', 'promo', 'system'],
    default: 'info'
  },
  
  // Optional link/action
  actionType: {
    type: String,
    enum: ['none', 'screen', 'url'],
    default: 'none'
  },
  
  actionTarget: String, // Screen name or URL
  
  // Image/icon
  imageUrl: String,
  
  // Scheduling
  scheduledFor: Date,
  sentAt: Date,
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sent'],
    default: 'draft'
  },
  
  // Read tracking per user
  readBy: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    readAt: { type: Date, default: Date.now }
  }],
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
  
}, { timestamps: true });

// Get unread count for a user
NotificationSchema.statics.getUnreadCount = async function(userId, userAccessLevel, investorTier) {
  const query = {
    status: 'sent',
    'readBy.user': { $ne: userId },
    $or: [
      { targetType: 'all' },
      { targetUsers: userId }
    ]
  };
  
  // Add access level based targeting
  if (userAccessLevel === 'member') {
    query.$or.push({ targetType: 'members' });
  }
  
  if (userAccessLevel === 'investor') {
    query.$or.push({ targetType: 'investors' });
    if (investorTier) {
      query.$or.push({ targetType: investorTier });
    }
  }
  
  return this.countDocuments(query);
};

// Get notifications for a user
NotificationSchema.statics.getForUser = async function(userId, userAccessLevel, investorTier, limit = 50) {
  const query = {
    status: 'sent',
    $or: [
      { targetType: 'all' },
      { targetUsers: userId }
    ]
  };
  
  if (userAccessLevel === 'member') {
    query.$or.push({ targetType: 'members' });
  }
  
  if (userAccessLevel === 'investor') {
    query.$or.push({ targetType: 'investors' });
    if (investorTier) {
      query.$or.push({ targetType: investorTier });
    }
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

module.exports = mongoose.model('Notification', NotificationSchema);
