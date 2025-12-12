/**
 * Support Chat Model
 */

const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ['user', 'support', 'system'],
    required: true,
  },
  senderUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  content: {
    type: String,
    required: true,
  },
  attachments: [{
    name: String,
    url: String,
    type: String,
  }],
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: Date,
}, {
  timestamps: true,
});

const SupportTicketSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Ticket info
  ticketNumber: {
    type: String,
    unique: true,
  },
  subject: {
    type: String,
    default: 'General Inquiry',
  },
  category: {
    type: String,
    enum: ['general', 'reservation', 'billing', 'investment', 'technical', 'complaint', 'feedback'],
    default: 'general',
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal',
  },
  // Messages
  messages: [MessageSchema],
  // Status
  status: {
    type: String,
    enum: ['open', 'pending', 'in_progress', 'resolved', 'closed'],
    default: 'open',
  },
  // Assignment
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  // Resolution
  resolvedAt: Date,
  resolution: String,
  // Rating
  satisfactionRating: {
    type: Number,
    min: 1,
    max: 5,
  },
  feedback: String,
  // VIP handling
  isVIP: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Generate ticket number
SupportTicketSchema.pre('save', function(next) {
  if (!this.ticketNumber) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.ticketNumber = `TKT-${timestamp}-${random}`;
  }
  next();
});

SupportTicketSchema.index({ user: 1, status: 1 });
SupportTicketSchema.index({ ticketNumber: 1 });
SupportTicketSchema.index({ status: 1, priority: -1, createdAt: -1 });

module.exports = mongoose.model('SupportTicket', SupportTicketSchema);
