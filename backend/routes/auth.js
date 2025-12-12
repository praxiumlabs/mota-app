/**
 * Auth Routes
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth, generateToken } = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    // Create user
    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      accessLevel: 'member',
    });
    
    await user.save();
    
    const token = generateToken(user._id);
    
    res.status(201).json({
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    const token = generateToken(user._id);
    
    res.json({
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  res.json(req.user.toJSON());
});

// Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const updates = ['name', 'phone', 'avatar', 'address', 'notificationsEnabled'];
    const allowedUpdates = {};
    
    updates.forEach(field => {
      if (req.body[field] !== undefined) {
        allowedUpdates[field] = req.body[field];
      }
    });
    
    Object.assign(req.user, allowedUpdates);
    await req.user.save();
    
    res.json(req.user.toJSON());
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change password
router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const isMatch = await req.user.comparePassword(currentPassword);
    
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    
    req.user.password = newPassword;
    await req.user.save();
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Enable/disable biometric
router.put('/biometric', auth, async (req, res) => {
  try {
    const { enabled } = req.body;
    
    req.user.biometricEnabled = enabled;
    await req.user.save();
    
    res.json({ biometricEnabled: req.user.biometricEnabled });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update biometric settings' });
  }
});

module.exports = router;
