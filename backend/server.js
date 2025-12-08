/**
 * MOTA Backend Server v2
 * Express API with MongoDB Database
 * 
 * Features:
 * - MongoDB database for persistent storage
 * - Full CRUD for all entities
 * - Admin authentication with JWT
 * - User management with tier upgrades
 * - Offers & discounts system
 * - Booking management
 */

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'mota-super-secret-key-change-in-production';

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mota_db';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../admin'))); // Serve admin dashboard

// ============================================
// MONGOOSE SCHEMAS
// ============================================

// Admin Schema
const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['super_admin', 'admin', 'moderator'], default: 'admin' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String },
  avatar: { type: String },
  accessLevel: { type: String, enum: ['guest', 'member', 'investor'], default: 'member' },
  investorTier: { type: String, enum: ['gold', 'platinum', 'diamond', 'black', 'founders', null], default: null },
  investmentAmount: { type: Number, default: 0 },
  portfolioValue: { type: Number, default: 0 },
  memberSince: { type: String },
  favorites: [{ type: String }],
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Restaurant Schema
const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String },
  image: { type: String },
  images: [{ type: String }],
  rating: { type: Number, default: 4.5 },
  reviewCount: { type: Number, default: 0 },
  priceRange: { type: String, enum: ['$', '$$', '$$$', '$$$$'], default: '$$' },
  regularPrice: { type: Number, required: true },
  memberPrice: { type: Number },
  platinumPrice: { type: Number },
  diamondPrice: { type: Number },
  openHours: { type: String },
  location: { type: String },
  address: { type: String },
  phone: { type: String },
  website: { type: String },
  amenities: [{ type: String }],
  cuisine: [{ type: String }],
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Activity Schema
const activitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String },
  image: { type: String },
  images: [{ type: String }],
  rating: { type: Number, default: 4.5 },
  reviewCount: { type: Number, default: 0 },
  duration: { type: String },
  difficulty: { type: String, enum: ['easy', 'moderate', 'challenging'], default: 'moderate' },
  regularPrice: { type: Number, required: true },
  memberPrice: { type: Number },
  platinumPrice: { type: Number },
  diamondPrice: { type: Number },
  included: [{ type: String }],
  requirements: [{ type: String }],
  maxParticipants: { type: Number },
  location: { type: String },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Event Schema
const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  image: { type: String },
  images: [{ type: String }],
  date: { type: String, required: true },
  endDate: { type: String },
  time: { type: String },
  venue: { type: String },
  address: { type: String },
  regularPrice: { type: Number, default: 0 },
  memberPrice: { type: Number, default: 0 },
  vipPrice: { type: Number, default: 0 },
  capacity: { type: Number },
  registeredCount: { type: Number, default: 0 },
  registeredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isVipOnly: { type: Boolean, default: false },
  investorTierRequired: { type: String, enum: ['gold', 'platinum', 'diamond', 'black', 'founders', null], default: null },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Offer Schema
const offerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  image: { type: String },
  type: { type: String, enum: ['restaurant', 'activity', 'event', 'general'], required: true },
  targetId: { type: String }, // ID of specific restaurant/activity/event
  discountPercent: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  freeAddon: { type: String },
  validFrom: { type: String },
  validUntil: { type: String },
  minTier: { type: String, enum: ['member', 'gold', 'platinum', 'diamond', 'black', 'founders'], default: 'member' },
  code: { type: String, unique: true },
  maxUses: { type: Number, default: 100 },
  usedCount: { type: Number, default: 0 },
  usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Booking Schema
const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String },
  userEmail: { type: String },
  type: { type: String, enum: ['restaurant', 'activity', 'event'], required: true },
  itemId: { type: String, required: true },
  itemName: { type: String },
  date: { type: String, required: true },
  time: { type: String },
  guests: { type: Number, default: 1 },
  specialRequests: { type: String },
  totalPrice: { type: Number },
  discountApplied: { type: Number, default: 0 },
  offerCode: { type: String },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create Models
const Admin = mongoose.model('Admin', adminSchema);
const User = mongoose.model('User', userSchema);
const Restaurant = mongoose.model('Restaurant', restaurantSchema);
const Activity = mongoose.model('Activity', activitySchema);
const Event = mongoose.model('Event', eventSchema);
const Offer = mongoose.model('Offer', offerSchema);
const Booking = mongoose.model('Booking', bookingSchema);

// ============================================
// SEED DEFAULT DATA
// ============================================

async function seedDatabase() {
  try {
    // Check if admin exists
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      await Admin.create({
        email: 'admin@mota.com',
        password: bcrypt.hashSync('admin123', 10),
        name: 'MOTA Admin',
        role: 'super_admin'
      });
      console.log('✅ Default admin created');
    }

    // Check if users exist
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const users = [
        { email: 'member@mota.com', password: bcrypt.hashSync('member123', 10), name: 'Sarah Chen', accessLevel: 'member' },
        { email: 'gold@mota.com', password: bcrypt.hashSync('gold123', 10), name: 'James Wilson', accessLevel: 'investor', investorTier: 'gold', investmentAmount: 150000, portfolioValue: 172000, memberSince: '2024-01-20' },
        { email: 'platinum@mota.com', password: bcrypt.hashSync('plat123', 10), name: 'Victoria Chang', accessLevel: 'investor', investorTier: 'platinum', investmentAmount: 350000, portfolioValue: 412000, memberSince: '2023-09-10' },
        { email: 'diamond@mota.com', password: bcrypt.hashSync('diamond123', 10), name: 'Robert Sterling', accessLevel: 'investor', investorTier: 'diamond', investmentAmount: 750000, portfolioValue: 892000, memberSince: '2023-03-05' },
        { email: 'founder@mota.com', password: bcrypt.hashSync('founder123', 10), name: 'Alexander Reyes', accessLevel: 'investor', investorTier: 'founders', investmentAmount: 2500000, portfolioValue: 3200000, memberSince: '2022-01-01' }
      ];
      await User.insertMany(users);
      console.log('✅ Default users created');
    }

    // Check if restaurants exist
    const restaurantCount = await Restaurant.countDocuments();
    if (restaurantCount === 0) {
      const restaurants = [
        { name: 'Hidden Treasure', category: 'Fine Dining', description: 'Award-winning Caribbean seafood with ocean views', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800', rating: 4.7, priceRange: '$$$', regularPrice: 150, memberPrice: 135, platinumPrice: 127, diamondPrice: 112, openHours: '6:00 PM - 11:00 PM', location: 'Beachfront', isFeatured: true },
        { name: "Elvi's Kitchen", category: 'Belizean', description: 'Legendary local cuisine since 1974', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800', rating: 4.5, priceRange: '$$', regularPrice: 75, memberPrice: 68, platinumPrice: 64, diamondPrice: 56, openHours: '11:00 AM - 10:00 PM', location: 'Town Center' },
        { name: 'Blue Water Grill', category: 'Sushi & Seafood', description: 'Oceanfront dining with world-class sushi', image: 'https://images.unsplash.com/photo-1579027989536-b7b1f875659b?w=800', rating: 4.6, priceRange: '$$$', regularPrice: 120, memberPrice: 108, platinumPrice: 102, diamondPrice: 90, openHours: '5:00 PM - 10:00 PM', location: 'Oceanfront', isFeatured: true }
      ];
      await Restaurant.insertMany(restaurants);
      console.log('✅ Default restaurants created');
    }

    // Check if activities exist
    const activityCount = await Activity.countDocuments();
    if (activityCount === 0) {
      const activities = [
        { name: 'Hol Chan Marine Reserve', category: 'Snorkeling', description: 'Explore vibrant coral reefs and swim with sea turtles', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800', rating: 4.9, duration: '3 hours', regularPrice: 75, memberPrice: 68, platinumPrice: 64, diamondPrice: 56, included: ['Equipment', 'Guide', 'Refreshments'], isFeatured: true },
        { name: 'Great Blue Hole', category: 'Diving', description: 'Dive into one of the world\'s most famous dive sites', image: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800', rating: 4.8, duration: 'Full day', regularPrice: 350, memberPrice: 315, platinumPrice: 298, diamondPrice: 263, included: ['Equipment', 'Certified guide', 'Lunch', 'Transport'], isFeatured: true },
        { name: 'Sunset Catamaran', category: 'Sailing', description: 'Romantic sunset sail with champagne and appetizers', image: 'https://images.unsplash.com/photo-1500514966906-fe245eea9344?w=800', rating: 4.8, duration: '2 hours', regularPrice: 95, memberPrice: 86, platinumPrice: 81, diamondPrice: 71, included: ['Champagne', 'Appetizers', 'Music'] }
      ];
      await Activity.insertMany(activities);
      console.log('✅ Default activities created');
    }

    // Check if events exist
    const eventCount = await Event.countDocuments();
    if (eventCount === 0) {
      const events = [
        { name: 'Costa Maya Festival', description: 'Annual celebration of Central American culture', image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800', date: '2025-08-01', endDate: '2025-08-04', venue: 'San Pedro', capacity: 5000, isFeatured: true },
        { name: 'Lobster Fest', description: 'Week-long celebration of lobster season opening', image: 'https://images.unsplash.com/photo-1559742811-822873691df8?w=800', date: '2025-06-15', endDate: '2025-06-21', venue: 'Island-wide', capacity: 10000 },
        { name: 'Investor Gala', description: 'Exclusive end-of-year celebration for MOTA investors', image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800', date: '2025-12-31', venue: 'MOTA Ballroom', capacity: 500, isVipOnly: true, investorTierRequired: 'gold', isFeatured: true }
      ];
      await Event.insertMany(events);
      console.log('✅ Default events created');
    }

    // Check if offers exist
    const offerCount = await Offer.countDocuments();
    if (offerCount === 0) {
      const offers = [
        { title: 'Early Bird Dining', description: '20% off dinner before 6 PM', type: 'restaurant', discountPercent: 20, validFrom: '2025-01-01', validUntil: '2025-12-31', minTier: 'member', code: 'EARLYBIRD20', maxUses: 100 },
        { title: 'Platinum Exclusive Spa', description: 'Complimentary spa treatment with any booking', type: 'activity', freeAddon: 'Spa Treatment', validFrom: '2025-01-01', validUntil: '2025-12-31', minTier: 'platinum', code: 'PLATINUMSPA', maxUses: 50 }
      ];
      await Offer.insertMany(offers);
      console.log('✅ Default offers created');
    }

  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Run seed after connection
mongoose.connection.once('open', () => {
  seedDatabase();
});

// ============================================
// WELCOME ROUTE
// ============================================

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../admin/index.html'));
});

app.get('/api', (req, res) => {
  res.json({
    message: '🌴 MOTA Backend API v2',
    status: 'running',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    endpoints: {
      restaurants: 'GET /api/restaurants',
      activities: 'GET /api/activities',
      events: 'GET /api/events',
      offers: 'GET /api/offers',
      adminLogin: 'POST /api/admin/login',
      userLogin: 'POST /api/auth/login',
      stats: 'GET /api/admin/stats'
    }
  });
});

// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================

function authenticateAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function authenticateUser(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// ============================================
// ADMIN AUTH ROUTES
// ============================================

app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    
    if (!admin || !bcrypt.compareSync(password, admin.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      admin: { id: admin._id, email: admin.email, name: admin.name, role: admin.role }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/me', authenticateAdmin, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password');
    if (!admin) return res.status(404).json({ error: 'Admin not found' });
    res.json(admin);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// USER AUTH ROUTES
// ============================================

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email, accessLevel: user.accessLevel },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userObj = user.toObject();
    delete userObj.password;
    res.json({ token, user: userObj });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const user = await User.create({
      email: email.toLowerCase(),
      password: bcrypt.hashSync(password, 10),
      name,
      phone,
      accessLevel: 'member'
    });

    const token = jwt.sign(
      { id: user._id, email: user.email, accessLevel: user.accessLevel },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userObj = user.toObject();
    delete userObj.password;
    res.json({ token, user: userObj });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// RESTAURANT ROUTES
// ============================================

app.get('/api/restaurants', async (req, res) => {
  try {
    const { featured, category, limit } = req.query;
    let query = { isActive: true };
    if (featured === 'true') query.isFeatured = true;
    if (category) query.category = category;
    
    let restaurants = Restaurant.find(query).sort({ createdAt: -1 });
    if (limit) restaurants = restaurants.limit(parseInt(limit));
    
    res.json(await restaurants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/restaurants/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/restaurants', authenticateAdmin, async (req, res) => {
  try {
    // Auto-calculate tier prices
    const { regularPrice } = req.body;
    const restaurant = await Restaurant.create({
      ...req.body,
      memberPrice: Math.round(regularPrice * 0.9),
      platinumPrice: Math.round(regularPrice * 0.85),
      diamondPrice: Math.round(regularPrice * 0.75)
    });
    res.status(201).json(restaurant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/restaurants/:id', authenticateAdmin, async (req, res) => {
  try {
    const { regularPrice } = req.body;
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };
    
    // Recalculate tier prices if regularPrice changed
    if (regularPrice) {
      updateData.memberPrice = Math.round(regularPrice * 0.9);
      updateData.platinumPrice = Math.round(regularPrice * 0.85);
      updateData.diamondPrice = Math.round(regularPrice * 0.75);
    }

    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/restaurants/:id', authenticateAdmin, async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndDelete(req.params.id);
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// ACTIVITY ROUTES
// ============================================

app.get('/api/activities', async (req, res) => {
  try {
    const { featured, category, limit } = req.query;
    let query = { isActive: true };
    if (featured === 'true') query.isFeatured = true;
    if (category) query.category = category;
    
    let activities = Activity.find(query).sort({ createdAt: -1 });
    if (limit) activities = activities.limit(parseInt(limit));
    
    res.json(await activities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/activities/:id', async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ error: 'Activity not found' });
    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/activities', authenticateAdmin, async (req, res) => {
  try {
    const { regularPrice } = req.body;
    const activity = await Activity.create({
      ...req.body,
      memberPrice: Math.round(regularPrice * 0.9),
      platinumPrice: Math.round(regularPrice * 0.85),
      diamondPrice: Math.round(regularPrice * 0.75)
    });
    res.status(201).json(activity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/activities/:id', authenticateAdmin, async (req, res) => {
  try {
    const { regularPrice } = req.body;
    const updateData = { ...req.body, updatedAt: new Date() };
    
    if (regularPrice) {
      updateData.memberPrice = Math.round(regularPrice * 0.9);
      updateData.platinumPrice = Math.round(regularPrice * 0.85);
      updateData.diamondPrice = Math.round(regularPrice * 0.75);
    }

    const activity = await Activity.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!activity) return res.status(404).json({ error: 'Activity not found' });
    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/activities/:id', authenticateAdmin, async (req, res) => {
  try {
    const activity = await Activity.findByIdAndDelete(req.params.id);
    if (!activity) return res.status(404).json({ error: 'Activity not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// EVENT ROUTES
// ============================================

app.get('/api/events', async (req, res) => {
  try {
    const { featured, upcoming, limit } = req.query;
    let query = { isActive: true };
    if (featured === 'true') query.isFeatured = true;
    if (upcoming === 'true') query.date = { $gte: new Date().toISOString().split('T')[0] };
    
    let events = Event.find(query).sort({ date: 1 });
    if (limit) events = events.limit(parseInt(limit));
    
    res.json(await events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/events/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/events', authenticateAdmin, async (req, res) => {
  try {
    const event = await Event.create(req.body);
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/events/:id', authenticateAdmin, async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/events/:id', authenticateAdmin, async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// RSVP for event
app.post('/api/events/:id/rsvp', authenticateUser, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    
    if (event.registeredUsers.includes(req.user.id)) {
      return res.status(400).json({ error: 'Already registered' });
    }

    if (event.capacity && event.registeredCount >= event.capacity) {
      return res.status(400).json({ error: 'Event is full' });
    }

    event.registeredUsers.push(req.user.id);
    event.registeredCount = event.registeredUsers.length;
    await event.save();

    res.json({ success: true, message: 'RSVP confirmed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// OFFER ROUTES
// ============================================

app.get('/api/offers', async (req, res) => {
  try {
    const { type, tier } = req.query;
    let query = { isActive: true };
    if (type) query.type = type;
    
    const offers = await Offer.find(query).sort({ createdAt: -1 });
    res.json(offers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/offers/:id', async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) return res.status(404).json({ error: 'Offer not found' });
    res.json(offer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/offers', authenticateAdmin, async (req, res) => {
  try {
    const offer = await Offer.create(req.body);
    res.status(201).json(offer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/offers/:id', authenticateAdmin, async (req, res) => {
  try {
    const offer = await Offer.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!offer) return res.status(404).json({ error: 'Offer not found' });
    res.json(offer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/offers/:id', authenticateAdmin, async (req, res) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);
    if (!offer) return res.status(404).json({ error: 'Offer not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Validate offer code
app.post('/api/offers/validate', authenticateUser, async (req, res) => {
  try {
    const { code } = req.body;
    const offer = await Offer.findOne({ code: code.toUpperCase(), isActive: true });
    
    if (!offer) {
      return res.status(404).json({ error: 'Invalid offer code' });
    }

    // Check if expired
    if (offer.validUntil && new Date(offer.validUntil) < new Date()) {
      return res.status(400).json({ error: 'Offer has expired' });
    }

    // Check max uses
    if (offer.maxUses && offer.usedCount >= offer.maxUses) {
      return res.status(400).json({ error: 'Offer limit reached' });
    }

    res.json({
      valid: true,
      offer: {
        title: offer.title,
        discountPercent: offer.discountPercent,
        discountAmount: offer.discountAmount,
        freeAddon: offer.freeAddon
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// USER MANAGEMENT (Admin)
// ============================================

app.get('/api/admin/users', authenticateAdmin, async (req, res) => {
  try {
    const { accessLevel, investorTier, search, limit, page } = req.query;
    let query = {};
    
    if (accessLevel) query.accessLevel = accessLevel;
    if (investorTier) query.investorTier = investorTier;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 50;
    const skip = (pageNum - 1) * limitNum;

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
    
    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/users/:id', authenticateAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/users/:id', authenticateAdmin, async (req, res) => {
  try {
    const { password, ...updateData } = req.body;
    updateData.updatedAt = new Date();

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/users/:id', authenticateAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upgrade user to investor
app.post('/api/admin/users/:id/upgrade-to-investor', authenticateAdmin, async (req, res) => {
  try {
    const { investorTier, investmentAmount } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        accessLevel: 'investor',
        investorTier,
        investmentAmount,
        portfolioValue: investmentAmount,
        memberSince: new Date().toISOString().split('T')[0],
        updatedAt: new Date()
      },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// BOOKING ROUTES
// ============================================

app.post('/api/bookings', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    const booking = await Booking.create({
      ...req.body,
      userId: req.user.id,
      userName: user.name,
      userEmail: user.email
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/bookings', authenticateUser, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/bookings', authenticateAdmin, async (req, res) => {
  try {
    const { status, type, limit, page } = req.query;
    let query = {};
    if (status) query.status = status;
    if (type) query.type = type;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 50;
    const skip = (pageNum - 1) * limitNum;

    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Booking.countDocuments(query);

    res.json({
      bookings,
      pagination: { total, page: pageNum, pages: Math.ceil(total / limitNum) }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/bookings/:id', authenticateAdmin, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// DASHBOARD STATS (Admin)
// ============================================

app.get('/api/admin/stats', authenticateAdmin, async (req, res) => {
  try {
    const [
      totalUsers,
      totalMembers,
      totalInvestors,
      goldInvestors,
      platinumInvestors,
      diamondInvestors,
      blackInvestors,
      foundersInvestors,
      totalRestaurants,
      totalActivities,
      totalEvents,
      totalBookings,
      pendingBookings,
      activeOffers,
      users
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ accessLevel: 'member' }),
      User.countDocuments({ accessLevel: 'investor' }),
      User.countDocuments({ investorTier: 'gold' }),
      User.countDocuments({ investorTier: 'platinum' }),
      User.countDocuments({ investorTier: 'diamond' }),
      User.countDocuments({ investorTier: 'black' }),
      User.countDocuments({ investorTier: 'founders' }),
      Restaurant.countDocuments({ isActive: true }),
      Activity.countDocuments({ isActive: true }),
      Event.countDocuments({ isActive: true }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'pending' }),
      Offer.countDocuments({ isActive: true }),
      User.find({ accessLevel: 'investor' }).select('investmentAmount')
    ]);

    const totalInvestment = users.reduce((sum, u) => sum + (u.investmentAmount || 0), 0);

    res.json({
      totalUsers,
      totalMembers,
      totalInvestors,
      investorsByTier: {
        gold: goldInvestors,
        platinum: platinumInvestors,
        diamond: diamondInvestors,
        black: blackInvestors,
        founders: foundersInvestors
      },
      totalRestaurants,
      totalActivities,
      totalEvents,
      totalBookings,
      pendingBookings,
      activeOffers,
      totalInvestment
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════╗
║         MOTA Backend Server v2                   ║
║         Running on http://localhost:${PORT}         ║
╠══════════════════════════════════════════════════╣
║  Admin Dashboard: http://localhost:${PORT}          ║
║  API Endpoint:    http://localhost:${PORT}/api      ║
╠══════════════════════════════════════════════════╣
║  Admin Login:                                    ║
║  Email: admin@mota.com                           ║
║  Password: admin123                              ║
╚══════════════════════════════════════════════════╝
  `);
});

module.exports = app;
