/**
 * Auth Middleware
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'mota-secret-key-change-in-production';

// Authenticate any user
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }
    
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Optional auth - sets user if token provided but doesn't require it
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.userId);
      if (user && user.isActive) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    // Invalid token, continue without user
    next();
  }
};

// Require member access
const requireMember = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (req.user.accessLevel === 'guest') {
    return res.status(403).json({ error: 'Member access required' });
  }
  
  next();
};

// Require investor access
const requireInvestor = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (req.user.accessLevel !== 'investor') {
    return res.status(403).json({ error: 'Investor access required' });
  }
  
  next();
};

// Require specific investor tier
const requireTier = (minTier) => {
  const tierOrder = { gold: 1, platinum: 2, diamond: 3 };
  
  return (req, res, next) => {
    if (!req.user || req.user.accessLevel !== 'investor') {
      return res.status(403).json({ error: 'Investor access required' });
    }
    
    const userTierLevel = tierOrder[req.user.investorTier] || 0;
    const requiredLevel = tierOrder[minTier] || 0;
    
    if (userTierLevel < requiredLevel) {
      return res.status(403).json({ 
        error: `${minTier.charAt(0).toUpperCase() + minTier.slice(1)} tier or higher required` 
      });
    }
    
    next();
  };
};

// Admin access
const requireAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Check if user has admin role (you can add an isAdmin field to User model)
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  next();
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
};

module.exports = {
  auth,
  optionalAuth,
  requireMember,
  requireInvestor,
  requireTier,
  requireAdmin,
  generateToken,
  JWT_SECRET,
};
