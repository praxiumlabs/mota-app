/**
 * MOTA Backend Server v3.4
 * Complete Resort & Investment Management System
 * With Image Upload Support
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/api/reservations', require('./routes/reservations'));
app.use('/api/favorites', require('./routes/favorites'));
app.use('/api/feedback', require('./routes/feedback'));
// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ============================================
// DATABASE CONNECTION
// ============================================
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mota';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ============================================
// ROUTES
// ============================================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/investors', require('./routes/investors'));
app.use('/api/leads', require('./routes/leads'));
app.use('/api/funding', require('./routes/funding'));
app.use('/api/lodging', require('./routes/lodging'));
app.use('/api/restaurants', require('./routes/restaurants'));
app.use('/api/activities', require('./routes/activities'));
app.use('/api/events', require('./routes/events'));
app.use('/api/reservations', require('./routes/reservations'));
app.use('/api/concierge', require('./routes/concierge'));
app.use('/api/offers', require('./routes/offers'));
app.use('/api/deck-requests', require('./routes/deckRequests'));
app.use('/api/newsletter', require('./routes/newsletter'));
app.use('/api/support', require('./routes/support'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/content', require('./routes/content'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/fleet', require('./routes/exoticFleet'));
app.use('/api/nightlife', require('./routes/nightlife'));
app.use('/api/upload', require('./routes/upload'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '3.4.0'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 MOTA Backend running on port ${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
});

module.exports = app;
