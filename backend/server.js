/**
 * MOTA Backend Server
 * Express API for MOTA App
 * 
 * Features:
 * - Admin authentication
 * - CRUD for restaurants, activities, events
 * - User management
 * - Offers & discounts system
 */

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'mota-super-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// ============================================
// DATA STORAGE (JSON Files)
// ============================================

const DATA_DIR = path.join(__dirname, 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper functions for data persistence
function loadData(filename) {
  const filepath = path.join(DATA_DIR, filename);
  if (fs.existsSync(filepath)) {
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
  }
  return null;
}

function saveData(filename, data) {
  const filepath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
}

// Initialize default data
function initializeData() {
  // Admin users
  if (!loadData('admins.json')) {
    const defaultAdmin = {
      id: '1',
      email: 'admin@mota.com',
      password: bcrypt.hashSync('admin123', 10),
      name: 'MOTA Admin',
      role: 'super_admin',
      createdAt: new Date().toISOString()
    };
    saveData('admins.json', [defaultAdmin]);
  }

  // Restaurants
  if (!loadData('restaurants.json')) {
    saveData('restaurants.json', [
      {
        id: '1',
        name: 'Hidden Treasure',
        category: 'Fine Dining',
        description: 'Award-winning Caribbean seafood with ocean views',
        image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
        rating: 4.7,
        priceRange: '$$$',
        regularPrice: 150,
        memberPrice: 135,
        platinumPrice: 127,
        diamondPrice: 112,
        openHours: '6:00 PM - 11:00 PM',
        location: 'Beachfront',
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        name: "Elvi's Kitchen",
        category: 'Belizean',
        description: 'Legendary local cuisine since 1974',
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
        rating: 4.5,
        priceRange: '$$',
        regularPrice: 75,
        memberPrice: 68,
        platinumPrice: 64,
        diamondPrice: 56,
        openHours: '11:00 AM - 10:00 PM',
        location: 'Town Center',
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Blue Water Grill',
        category: 'Sushi & Seafood',
        description: 'Oceanfront dining with world-class sushi',
        image: 'https://images.unsplash.com/photo-1579027989536-b7b1f875659b?w=800',
        rating: 4.6,
        priceRange: '$$$',
        regularPrice: 120,
        memberPrice: 108,
        platinumPrice: 102,
        diamondPrice: 90,
        openHours: '5:00 PM - 10:00 PM',
        location: 'Oceanfront',
        isActive: true,
        createdAt: new Date().toISOString()
      }
    ]);
  }

  // Activities
  if (!loadData('activities.json')) {
    saveData('activities.json', [
      {
        id: '1',
        name: 'Hol Chan Marine Reserve',
        category: 'Snorkeling',
        description: 'Explore vibrant coral reefs and swim with sea turtles',
        image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
        rating: 4.9,
        duration: '3 hours',
        regularPrice: 75,
        memberPrice: 68,
        platinumPrice: 64,
        diamondPrice: 56,
        included: ['Equipment', 'Guide', 'Refreshments'],
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Great Blue Hole',
        category: 'Diving',
        description: 'Dive into one of the world\'s most famous dive sites',
        image: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800',
        rating: 4.8,
        duration: 'Full day',
        regularPrice: 350,
        memberPrice: 315,
        platinumPrice: 298,
        diamondPrice: 263,
        included: ['Equipment', 'Certified guide', 'Lunch', 'Transport'],
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Sunset Catamaran',
        category: 'Sailing',
        description: 'Romantic sunset sail with champagne and appetizers',
        image: 'https://images.unsplash.com/photo-1500514966906-fe245eea9344?w=800',
        rating: 4.8,
        duration: '2 hours',
        regularPrice: 95,
        memberPrice: 86,
        platinumPrice: 81,
        diamondPrice: 71,
        included: ['Champagne', 'Appetizers', 'Music'],
        isActive: true,
        createdAt: new Date().toISOString()
      }
    ]);
  }

  // Events
  if (!loadData('events.json')) {
    saveData('events.json', [
      {
        id: '1',
        name: 'Costa Maya Festival',
        description: 'Annual celebration of Central American culture',
        image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800',
        date: '2025-08-01',
        endDate: '2025-08-04',
        venue: 'San Pedro',
        regularPrice: 0,
        memberPrice: 0,
        vipPrice: 250,
        capacity: 5000,
        registeredCount: 0,
        isVipOnly: false,
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Lobster Fest',
        description: 'Week-long celebration of lobster season opening',
        image: 'https://images.unsplash.com/photo-1559742811-822873691df8?w=800',
        date: '2025-06-15',
        endDate: '2025-06-21',
        venue: 'Island-wide',
        regularPrice: 0,
        memberPrice: 0,
        vipPrice: 0,
        capacity: 10000,
        registeredCount: 0,
        isVipOnly: false,
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Investor Gala',
        description: 'Exclusive end-of-year celebration for MOTA investors',
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
        date: '2025-12-31',
        endDate: '2025-12-31',
        venue: 'MOTA Ballroom',
        regularPrice: 0,
        memberPrice: 0,
        vipPrice: 0,
        capacity: 500,
        registeredCount: 0,
        isVipOnly: true,
        investorTierRequired: 'gold',
        isActive: true,
        createdAt: new Date().toISOString()
      }
    ]);
  }

  // Offers/Discounts
  if (!loadData('offers.json')) {
    saveData('offers.json', [
      {
        id: '1',
        title: 'Early Bird Dining',
        description: '20% off dinner before 6 PM',
        type: 'restaurant',
        targetId: '1', // Hidden Treasure
        discountPercent: 20,
        validFrom: '2025-01-01',
        validUntil: '2025-12-31',
        minTier: 'member',
        code: 'EARLYBIRD20',
        maxUses: 100,
        usedCount: 0,
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Platinum Exclusive Spa',
        description: 'Complimentary spa treatment with any booking',
        type: 'activity',
        targetId: null, // Applies to all activities
        discountPercent: 0,
        freeAddon: 'Spa Treatment',
        validFrom: '2025-01-01',
        validUntil: '2025-12-31',
        minTier: 'platinum',
        code: 'PLATINUMSPA',
        maxUses: 50,
        usedCount: 0,
        isActive: true,
        createdAt: new Date().toISOString()
      }
    ]);
  }

  // App Users
  if (!loadData('users.json')) {
    saveData('users.json', [
      {
        id: '1',
        email: 'member@mota.com',
        password: bcrypt.hashSync('member123', 10),
        name: 'Sarah Chen',
        accessLevel: 'member',
        investorTier: null,
        investmentAmount: 0,
        portfolioValue: 0,
        favorites: [],
        bookings: [],
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        email: 'gold@mota.com',
        password: bcrypt.hashSync('gold123', 10),
        name: 'James Wilson',
        accessLevel: 'investor',
        investorTier: 'gold',
        investmentAmount: 150000,
        portfolioValue: 172000,
        memberSince: '2024-01-20',
        favorites: [],
        bookings: [],
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        email: 'platinum@mota.com',
        password: bcrypt.hashSync('plat123', 10),
        name: 'Victoria Chang',
        accessLevel: 'investor',
        investorTier: 'platinum',
        investmentAmount: 350000,
        portfolioValue: 412000,
        memberSince: '2023-09-10',
        favorites: [],
        bookings: [],
        createdAt: new Date().toISOString()
      },
      {
        id: '4',
        email: 'diamond@mota.com',
        password: bcrypt.hashSync('diamond123', 10),
        name: 'Robert Sterling',
        accessLevel: 'investor',
        investorTier: 'diamond',
        investmentAmount: 750000,
        portfolioValue: 892000,
        memberSince: '2023-03-05',
        favorites: [],
        bookings: [],
        createdAt: new Date().toISOString()
      },
      {
        id: '5',
        email: 'founder@mota.com',
        password: bcrypt.hashSync('founder123', 10),
        name: 'Alexander Reyes',
        accessLevel: 'investor',
        investorTier: 'founders',
        investmentAmount: 2500000,
        portfolioValue: 3200000,
        memberSince: '2022-01-01',
        favorites: [],
        bookings: [],
        createdAt: new Date().toISOString()
      }
    ]);
  }

  // Bookings
  if (!loadData('bookings.json')) {
    saveData('bookings.json', []);
  }

  console.log('✅ Data initialized');
}

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
  const { email, password } = req.body;
  const admins = loadData('admins.json') || [];
  
  const admin = admins.find(a => a.email === email);
  if (!admin || !bcrypt.compareSync(password, admin.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: admin.id, email: admin.email, role: admin.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    token,
    admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role }
  });
});

app.get('/api/admin/me', authenticateAdmin, (req, res) => {
  const admins = loadData('admins.json') || [];
  const admin = admins.find(a => a.id === req.admin.id);
  if (!admin) return res.status(404).json({ error: 'Admin not found' });
  
  const { password, ...adminData } = admin;
  res.json(adminData);
});

// ============================================
// USER AUTH ROUTES
// ============================================

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const users = loadData('users.json') || [];
  
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, accessLevel: user.accessLevel },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  const { password: _, ...userData } = user;
  res.json({ token, user: userData });
});

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  const users = loadData('users.json') || [];
  
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: 'Email already exists' });
  }

  const newUser = {
    id: String(users.length + 1),
    email: email.toLowerCase(),
    password: bcrypt.hashSync(password, 10),
    name,
    accessLevel: 'member',
    investorTier: null,
    favorites: [],
    bookings: [],
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveData('users.json', users);

  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, accessLevel: newUser.accessLevel },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  const { password: _, ...userData } = newUser;
  res.json({ token, user: userData });
});

// ============================================
// RESTAURANT ROUTES
// ============================================

// Get all restaurants (public)
app.get('/api/restaurants', (req, res) => {
  const restaurants = loadData('restaurants.json') || [];
  const activeRestaurants = restaurants.filter(r => r.isActive);
  res.json(activeRestaurants);
});

// Get single restaurant
app.get('/api/restaurants/:id', (req, res) => {
  const restaurants = loadData('restaurants.json') || [];
  const restaurant = restaurants.find(r => r.id === req.params.id);
  if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
  res.json(restaurant);
});

// Create restaurant (admin only)
app.post('/api/admin/restaurants', authenticateAdmin, (req, res) => {
  const restaurants = loadData('restaurants.json') || [];
  const newRestaurant = {
    id: String(Date.now()),
    ...req.body,
    isActive: true,
    createdAt: new Date().toISOString()
  };
  restaurants.push(newRestaurant);
  saveData('restaurants.json', restaurants);
  res.status(201).json(newRestaurant);
});

// Update restaurant (admin only)
app.put('/api/admin/restaurants/:id', authenticateAdmin, (req, res) => {
  const restaurants = loadData('restaurants.json') || [];
  const index = restaurants.findIndex(r => r.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Restaurant not found' });
  
  restaurants[index] = { ...restaurants[index], ...req.body, updatedAt: new Date().toISOString() };
  saveData('restaurants.json', restaurants);
  res.json(restaurants[index]);
});

// Delete restaurant (admin only)
app.delete('/api/admin/restaurants/:id', authenticateAdmin, (req, res) => {
  const restaurants = loadData('restaurants.json') || [];
  const index = restaurants.findIndex(r => r.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Restaurant not found' });
  
  restaurants.splice(index, 1);
  saveData('restaurants.json', restaurants);
  res.json({ success: true });
});

// ============================================
// ACTIVITY ROUTES
// ============================================

app.get('/api/activities', (req, res) => {
  const activities = loadData('activities.json') || [];
  const activeActivities = activities.filter(a => a.isActive);
  res.json(activeActivities);
});

app.get('/api/activities/:id', (req, res) => {
  const activities = loadData('activities.json') || [];
  const activity = activities.find(a => a.id === req.params.id);
  if (!activity) return res.status(404).json({ error: 'Activity not found' });
  res.json(activity);
});

app.post('/api/admin/activities', authenticateAdmin, (req, res) => {
  const activities = loadData('activities.json') || [];
  const newActivity = {
    id: String(Date.now()),
    ...req.body,
    isActive: true,
    createdAt: new Date().toISOString()
  };
  activities.push(newActivity);
  saveData('activities.json', activities);
  res.status(201).json(newActivity);
});

app.put('/api/admin/activities/:id', authenticateAdmin, (req, res) => {
  const activities = loadData('activities.json') || [];
  const index = activities.findIndex(a => a.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Activity not found' });
  
  activities[index] = { ...activities[index], ...req.body, updatedAt: new Date().toISOString() };
  saveData('activities.json', activities);
  res.json(activities[index]);
});

app.delete('/api/admin/activities/:id', authenticateAdmin, (req, res) => {
  const activities = loadData('activities.json') || [];
  const index = activities.findIndex(a => a.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Activity not found' });
  
  activities.splice(index, 1);
  saveData('activities.json', activities);
  res.json({ success: true });
});

// ============================================
// EVENT ROUTES
// ============================================

app.get('/api/events', (req, res) => {
  const events = loadData('events.json') || [];
  const activeEvents = events.filter(e => e.isActive);
  res.json(activeEvents);
});

app.get('/api/events/:id', (req, res) => {
  const events = loadData('events.json') || [];
  const event = events.find(e => e.id === req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  res.json(event);
});

app.post('/api/admin/events', authenticateAdmin, (req, res) => {
  const events = loadData('events.json') || [];
  const newEvent = {
    id: String(Date.now()),
    ...req.body,
    registeredCount: 0,
    isActive: true,
    createdAt: new Date().toISOString()
  };
  events.push(newEvent);
  saveData('events.json', events);
  res.status(201).json(newEvent);
});

app.put('/api/admin/events/:id', authenticateAdmin, (req, res) => {
  const events = loadData('events.json') || [];
  const index = events.findIndex(e => e.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Event not found' });
  
  events[index] = { ...events[index], ...req.body, updatedAt: new Date().toISOString() };
  saveData('events.json', events);
  res.json(events[index]);
});

app.delete('/api/admin/events/:id', authenticateAdmin, (req, res) => {
  const events = loadData('events.json') || [];
  const index = events.findIndex(e => e.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Event not found' });
  
  events.splice(index, 1);
  saveData('events.json', events);
  res.json({ success: true });
});

// ============================================
// OFFER ROUTES
// ============================================

app.get('/api/offers', (req, res) => {
  const offers = loadData('offers.json') || [];
  const activeOffers = offers.filter(o => o.isActive);
  res.json(activeOffers);
});

app.get('/api/offers/:id', (req, res) => {
  const offers = loadData('offers.json') || [];
  const offer = offers.find(o => o.id === req.params.id);
  if (!offer) return res.status(404).json({ error: 'Offer not found' });
  res.json(offer);
});

app.post('/api/admin/offers', authenticateAdmin, (req, res) => {
  const offers = loadData('offers.json') || [];
  const newOffer = {
    id: String(Date.now()),
    ...req.body,
    usedCount: 0,
    isActive: true,
    createdAt: new Date().toISOString()
  };
  offers.push(newOffer);
  saveData('offers.json', offers);
  res.status(201).json(newOffer);
});

app.put('/api/admin/offers/:id', authenticateAdmin, (req, res) => {
  const offers = loadData('offers.json') || [];
  const index = offers.findIndex(o => o.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Offer not found' });
  
  offers[index] = { ...offers[index], ...req.body, updatedAt: new Date().toISOString() };
  saveData('offers.json', offers);
  res.json(offers[index]);
});

app.delete('/api/admin/offers/:id', authenticateAdmin, (req, res) => {
  const offers = loadData('offers.json') || [];
  const index = offers.findIndex(o => o.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Offer not found' });
  
  offers.splice(index, 1);
  saveData('offers.json', offers);
  res.json({ success: true });
});

// ============================================
// USER MANAGEMENT (Admin)
// ============================================

app.get('/api/admin/users', authenticateAdmin, (req, res) => {
  const users = loadData('users.json') || [];
  const usersWithoutPasswords = users.map(({ password, ...user }) => user);
  res.json(usersWithoutPasswords);
});

app.get('/api/admin/users/:id', authenticateAdmin, (req, res) => {
  const users = loadData('users.json') || [];
  const user = users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  const { password, ...userData } = user;
  res.json(userData);
});

app.put('/api/admin/users/:id', authenticateAdmin, (req, res) => {
  const users = loadData('users.json') || [];
  const index = users.findIndex(u => u.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'User not found' });
  
  // Don't allow password update through this endpoint
  const { password, ...updateData } = req.body;
  users[index] = { ...users[index], ...updateData, updatedAt: new Date().toISOString() };
  saveData('users.json', users);
  
  const { password: _, ...userData } = users[index];
  res.json(userData);
});

// Upgrade user to investor
app.post('/api/admin/users/:id/upgrade-to-investor', authenticateAdmin, (req, res) => {
  const { investorTier, investmentAmount } = req.body;
  const users = loadData('users.json') || [];
  const index = users.findIndex(u => u.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'User not found' });
  
  users[index] = {
    ...users[index],
    accessLevel: 'investor',
    investorTier,
    investmentAmount,
    portfolioValue: investmentAmount,
    memberSince: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString()
  };
  saveData('users.json', users);
  
  const { password: _, ...userData } = users[index];
  res.json(userData);
});

// ============================================
// BOOKING ROUTES
// ============================================

app.post('/api/bookings', authenticateUser, (req, res) => {
  const bookings = loadData('bookings.json') || [];
  const newBooking = {
    id: String(Date.now()),
    userId: req.user.id,
    ...req.body,
    status: 'confirmed',
    createdAt: new Date().toISOString()
  };
  bookings.push(newBooking);
  saveData('bookings.json', bookings);
  res.status(201).json(newBooking);
});

app.get('/api/bookings', authenticateUser, (req, res) => {
  const bookings = loadData('bookings.json') || [];
  const userBookings = bookings.filter(b => b.userId === req.user.id);
  res.json(userBookings);
});

app.get('/api/admin/bookings', authenticateAdmin, (req, res) => {
  const bookings = loadData('bookings.json') || [];
  res.json(bookings);
});

// ============================================
// DASHBOARD STATS (Admin)
// ============================================

app.get('/api/admin/stats', authenticateAdmin, (req, res) => {
  const users = loadData('users.json') || [];
  const restaurants = loadData('restaurants.json') || [];
  const activities = loadData('activities.json') || [];
  const events = loadData('events.json') || [];
  const bookings = loadData('bookings.json') || [];
  const offers = loadData('offers.json') || [];

  const stats = {
    totalUsers: users.length,
    totalMembers: users.filter(u => u.accessLevel === 'member').length,
    totalInvestors: users.filter(u => u.accessLevel === 'investor').length,
    investorsByTier: {
      gold: users.filter(u => u.investorTier === 'gold').length,
      platinum: users.filter(u => u.investorTier === 'platinum').length,
      diamond: users.filter(u => u.investorTier === 'diamond').length,
      black: users.filter(u => u.investorTier === 'black').length,
      founders: users.filter(u => u.investorTier === 'founders').length,
    },
    totalRestaurants: restaurants.filter(r => r.isActive).length,
    totalActivities: activities.filter(a => a.isActive).length,
    totalEvents: events.filter(e => e.isActive).length,
    totalBookings: bookings.length,
    activeOffers: offers.filter(o => o.isActive).length,
    totalInvestment: users.reduce((sum, u) => sum + (u.investmentAmount || 0), 0),
  };

  res.json(stats);
});

// ============================================
// START SERVER
// ============================================

initializeData();

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║     MOTA Backend Server                    ║
║     Running on http://localhost:${PORT}       ║
╠════════════════════════════════════════════╣
║  Admin Login:                              ║
║  Email: admin@mota.com                     ║
║  Password: admin123                        ║
╚════════════════════════════════════════════╝
  `);
});

module.exports = app;
