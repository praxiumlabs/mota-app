/**
 * Reservation Routes
 * Full booking flow with time slots and dietary restrictions
 * NO auto-reserve - all bookings require confirmation
 */

const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const TimeSlot = require('../models/TimeSlot');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Generate default time slots based on item type
function generateDefaultSlots(itemType) {
  switch (itemType) {
    case 'restaurant':
      return [
        '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
        '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM',
      ];
    case 'activity':
      return [
        '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
        '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
      ];
    case 'fleet':
      return [
        '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
        '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
      ];
    default:
      return ['10:00 AM', '2:00 PM', '6:00 PM'];
  }
}

// Get available time slots for a specific date
router.get('/slots/:itemType/:itemId/:date', async (req, res) => {
  try {
    const { itemType, itemId, date } = req.params;
    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0);
    
    let slots = await TimeSlot.find({
      itemType,
      itemId,
      date: dateObj,
    }).sort({ time: 1 });
    
    if (slots.length === 0) {
      const defaultSlots = generateDefaultSlots(itemType);
      slots = defaultSlots.map(time => ({
        time,
        totalCapacity: 10,
        bookedCount: 0,
        isAvailable: true,
        spotsLeft: 10,
      }));
    } else {
      slots = slots.map(s => ({
        time: s.time,
        available: s.isSlotAvailable(),
        spotsLeft: s.spotsLeft,
        totalCapacity: s.totalCapacity,
      }));
    }
    
    res.json({ slots });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create reservation
router.post('/', auth, async (req, res) => {
  try {
    const {
      itemType, itemId, itemName, date, time, guestCount,
      occasion, bookingDetails, dietaryRestrictions,
      isFixedEvent, amount, paymentMethod,
    } = req.body;

    if (!itemType || !itemId || !date || !time) {
      return res.status(400).json({ error: 'Missing required booking information' });
    }

    if (!bookingDetails?.name || !bookingDetails?.email || !bookingDetails?.phone) {
      return res.status(400).json({ error: 'Missing booking contact details' });
    }

    // Check slot availability (skip for fixed events)
    if (!isFixedEvent) {
      const dateObj = new Date(date);
      dateObj.setHours(0, 0, 0, 0);
      
      let slot = await TimeSlot.findOne({ itemType, itemId, date: dateObj, time });

      if (slot && !slot.isSlotAvailable()) {
        return res.status(400).json({ error: 'This time slot is no longer available' });
      }

      if (!slot) {
        slot = new TimeSlot({
          itemType, itemId, date: dateObj, time,
          totalCapacity: 10, bookedCount: 1,
        });
      } else {
        slot.bookedCount += 1;
      }
      await slot.save();
    }

    const reservation = new Reservation({
      user: req.user._id,
      itemType, itemId, itemName,
      date: new Date(date), time,
      guestCount: guestCount || 1,
      occasion, bookingDetails,
      dietaryRestrictions: dietaryRestrictions || [],
      isFixedEvent: isFixedEvent || false,
      amount, paymentMethod,
      status: 'pending',
    });

    await reservation.save();

    // Update user's dietary restrictions if provided
    if (dietaryRestrictions && dietaryRestrictions.length > 0) {
      await User.findByIdAndUpdate(req.user._id, { dietaryRestrictions });
    }

    res.status(201).json({
      success: true,
      reservation,
      confirmationNumber: reservation.confirmationNumber,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user's reservations
router.get('/my', auth, async (req, res) => {
  try {
    const { status, upcoming } = req.query;
    const query = { user: req.user._id };
    
    if (status) query.status = status;
    if (upcoming === 'true') {
      query.date = { $gte: new Date() };
      query.status = { $in: ['pending', 'confirmed'] };
    }

    const reservations = await Reservation.find(query)
      .sort({ date: upcoming === 'true' ? 1 : -1 })
      .populate('itemId');

    res.json({ reservations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single reservation
router.get('/:id', auth, async (req, res) => {
  try {
    const reservation = await Reservation.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate('itemId');

    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    res.json({ reservation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cancel reservation
router.post('/:id/cancel', auth, async (req, res) => {
  try {
    const { reason } = req.body;
    
    const reservation = await Reservation.findOne({
      _id: req.params.id,
      user: req.user._id,
      status: { $in: ['pending', 'confirmed'] },
    });

    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found or cannot be cancelled' });
    }

    reservation.status = 'cancelled';
    reservation.cancelledAt = new Date();
    reservation.cancellationReason = reason;
    await reservation.save();

    // Free up the time slot
    if (!reservation.isFixedEvent) {
      await TimeSlot.findOneAndUpdate(
        { itemType: reservation.itemType, itemId: reservation.itemId, date: reservation.date, time: reservation.time },
        { $inc: { bookedCount: -1 } }
      );
    }

    res.json({ success: true, reservation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// ADMIN ROUTES
// ============================================

router.get('/admin/all', auth, async (req, res) => {
  try {
    const { status, itemType, date, page = 1, limit = 50 } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (itemType) query.itemType = itemType;
    if (date) {
      const dateObj = new Date(date);
      query.date = {
        $gte: new Date(dateObj.setHours(0, 0, 0, 0)),
        $lte: new Date(dateObj.setHours(23, 59, 59, 999)),
      };
    }

    const reservations = await Reservation.find(query)
      .sort({ date: -1, time: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('user', 'name email phone accessLevel investorTier')
      .populate('itemId');

    const total = await Reservation.countDocuments(query);

    res.json({
      reservations,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/admin/:id/status', auth, async (req, res) => {
  try {
    const { status, venueNotes } = req.body;
    const updateData = { status, venueNotes };
    
    if (status === 'confirmed') {
      updateData.confirmedAt = new Date();
      updateData.confirmedBy = req.user._id;
    }
    
    const reservation = await Reservation.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate('user', 'name email');

    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    res.json({ success: true, reservation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
