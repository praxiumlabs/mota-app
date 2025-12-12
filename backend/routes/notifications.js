/**
 * Notification Routes
 * Send and manage notifications
 */

const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Get notifications for current user
router.get('/my', auth, async (req, res) => {
  try {
    const notifications = await Notification.getForUser(
      req.user._id,
      req.user.accessLevel,
      req.user.investorTier
    );
    
    // Mark which ones are read
    const notificationsWithRead = notifications.map(n => ({
      ...n,
      isRead: n.readBy?.some(r => r.user?.toString() === req.user._id.toString()) || false
    }));
    
    res.json({ notifications: notificationsWithRead });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get unread count for current user
router.get('/unread-count', auth, async (req, res) => {
  try {
    const count = await Notification.getUnreadCount(
      req.user._id,
      req.user.accessLevel,
      req.user.investorTier
    );
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    // Check if already read
    const alreadyRead = notification.readBy.some(
      r => r.user.toString() === req.user._id.toString()
    );
    
    if (!alreadyRead) {
      notification.readBy.push({ user: req.user._id });
      await notification.save();
    }
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark all as read
router.put('/read-all', auth, async (req, res) => {
  try {
    const notifications = await Notification.getForUser(
      req.user._id,
      req.user.accessLevel,
      req.user.investorTier
    );
    
    for (const n of notifications) {
      const notification = await Notification.findById(n._id);
      const alreadyRead = notification.readBy.some(
        r => r.user.toString() === req.user._id.toString()
      );
      if (!alreadyRead) {
        notification.readBy.push({ user: req.user._id });
        await notification.save();
      }
    }
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================
// ADMIN ROUTES
// =============================================

// Get all notifications (admin)
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email')
      .populate('targetUsers', 'name email');
    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create notification (admin)
router.post('/', auth, async (req, res) => {
  try {
    const notification = new Notification({
      ...req.body,
      createdBy: req.user._id
    });
    
    await notification.save();
    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send notification immediately (admin)
router.post('/send', auth, async (req, res) => {
  try {
    const notification = new Notification({
      ...req.body,
      createdBy: req.user._id,
      status: 'sent',
      sentAt: new Date()
    });
    
    await notification.save();
    
    // Count how many users will receive it
    let targetCount = 0;
    if (notification.targetType === 'all') {
      targetCount = await User.countDocuments({ isActive: true });
    } else if (notification.targetType === 'members') {
      targetCount = await User.countDocuments({ accessLevel: 'member', isActive: true });
    } else if (notification.targetType === 'investors') {
      targetCount = await User.countDocuments({ accessLevel: 'investor', isActive: true });
    } else if (['gold', 'platinum', 'diamond'].includes(notification.targetType)) {
      targetCount = await User.countDocuments({ investorTier: notification.targetType, isActive: true });
    } else if (notification.targetType === 'specific') {
      targetCount = notification.targetUsers?.length || 0;
    }
    
    res.status(201).json({ 
      notification,
      targetCount,
      message: `Notification sent to ${targetCount} users`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send upgrade notification to specific user
router.post('/send-upgrade/:userId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const tierNames = {
      gold: 'Gold',
      platinum: 'Platinum', 
      diamond: 'Diamond'
    };
    
    const notification = new Notification({
      targetType: 'specific',
      targetUsers: [user._id],
      title: '🎉 Congratulations!',
      message: `You have been upgraded to ${tierNames[user.investorTier] || 'Investor'} status! Enjoy exclusive benefits and privileges.`,
      type: 'upgrade',
      status: 'sent',
      sentAt: new Date(),
      createdBy: req.user._id
    });
    
    await notification.save();
    
    res.json({ 
      success: true, 
      notification,
      message: `Upgrade notification sent to ${user.name || user.email}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update notification
router.put('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete notification
router.delete('/:id', auth, async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
