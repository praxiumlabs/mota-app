/**
 * Reservation Routes
 */

const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const { auth, requireMember } = require('../middleware/auth');

// Get user's reservations
router.get('/my', auth, async (req, res) => {
  try {
    const { status, type } = req.query;
    
    const query = { user: req.user._id };
    if (status) query.status = status;
    if (type) query.type = type;
    
    const reservations = await Reservation.find(query)
      .sort({ date: -1 });
    
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
});

// Get all reservations (admin)
router.get('/', auth, async (req, res) => {
  try {
    const { status, type, date, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }
    
    const reservations = await Reservation.find(query)
      .populate('user', 'name email phone')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Reservation.countDocuments(query);
    
    res.json({
      reservations,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
});

// Create reservation
router.post('/', auth, requireMember, async (req, res) => {
  try {
    const { type, itemId, itemName, date, time, guests, specialRequests, dietaryRequirements, occasion, contactInfo } = req.body;
    
    // Validate required fields
    if (!type || !itemName || !date) {
      return res.status(400).json({ error: 'Missing required fields: type, itemName, and date are required' });
    }

    // Map type to model
    const modelMap = {
      lodging: 'Lodging',
      restaurant: 'Restaurant',
      activity: 'Activity',
      nightlife: 'Nightlife',
    };

    if (!modelMap[type]) {
      return res.status(400).json({ error: 'Invalid reservation type' });
    }

    // Parse date
    const reservationDate = new Date(date);
    if (isNaN(reservationDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }
    
    // Build reservation object
    const reservationData = {
      user: req.user._id,
      type,
      itemName,
      date: reservationDate,
      time: time || 'TBD',
      guests: parseInt(guests) || 2,
      specialRequests: specialRequests || '',
      dietaryRequirements: dietaryRequirements || '',
      occasion: occasion || '',
      status: 'confirmed',
      confirmedAt: new Date(),
    };

    // Only add itemId and itemModel if itemId is a valid ObjectId
    const mongoose = require('mongoose');
    if (itemId && mongoose.Types.ObjectId.isValid(itemId)) {
      reservationData.itemId = itemId;
      reservationData.itemModel = modelMap[type];
    } else {
      // Create a placeholder ObjectId if none provided
      reservationData.itemId = new mongoose.Types.ObjectId();
      reservationData.itemModel = modelMap[type];
    }

    const reservation = new Reservation(reservationData);
    await reservation.save();
    
    res.status(201).json({
      success: true,
      reservation,
      message: `Your reservation at ${itemName} has been confirmed!`,
    });
  } catch (error) {
    console.error('Reservation error:', error.message, error.stack);
    res.status(500).json({ error: error.message || 'Failed to create reservation' });
  }
});

// Get reservation by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('user', 'name email phone');
    
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    
    // Check ownership
    if (reservation.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(reservation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reservation' });
  }
});

// Get by confirmation number
router.get('/confirm/:confirmationNumber', async (req, res) => {
  try {
    const reservation = await Reservation.findOne({ 
      confirmationNumber: req.params.confirmationNumber 
    });
    
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    
    res.json({
      confirmationNumber: reservation.confirmationNumber,
      itemName: reservation.itemName,
      type: reservation.type,
      date: reservation.date,
      time: reservation.time,
      guests: reservation.guests,
      status: reservation.status,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reservation' });
  }
});

// Update reservation
router.put('/:id', auth, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    
    const updates = ['date', 'time', 'guests', 'specialRequests'];
    updates.forEach(field => {
      if (req.body[field] !== undefined) {
        reservation[field] = req.body[field];
      }
    });
    
    await reservation.save();
    
    res.json(reservation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update reservation' });
  }
});

// Cancel reservation
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    
    reservation.status = 'cancelled';
    reservation.cancelledAt = new Date();
    reservation.cancellationReason = req.body.reason;
    
    await reservation.save();
    
    res.json({ success: true, message: 'Reservation cancelled' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel reservation' });
  }
});

// Update status (admin)
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status, adminNotes },
      { new: true }
    );
    
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    
    res.json(reservation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

module.exports = router;
