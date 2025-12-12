/**
 * Events Routes with RSVP
 */

const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { optionalAuth, auth, requireMember } = require('../middleware/auth');

// Get all events
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { upcoming, featured, category, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (upcoming === 'true') {
      query.date = { $gte: new Date() };
      query.status = 'upcoming';
    }
    if (featured === 'true') query.isFeatured = true;
    if (category) query.category = category;
    
    const events = await Event.find(query)
      .sort({ date: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Event.countDocuments(query);
    
    res.json({
      events,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get upcoming events
router.get('/upcoming', async (req, res) => {
  try {
    const events = await Event.find({
      date: { $gte: new Date() },
      status: 'upcoming',
    }).sort({ date: 1 }).limit(10);
    
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch upcoming events' });
  }
});

// Get event by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    
    // Check if user has RSVPd
    let userRSVP = null;
    if (req.user) {
      userRSVP = event.rsvps.find(r => r.user.toString() === req.user._id.toString());
    }
    
    res.json({
      ...event.toObject(),
      userRSVP: userRSVP ? {
        guests: userRSVP.guests,
        status: userRSVP.status,
        rsvpDate: userRSVP.rsvpDate,
      } : null,
      spotsRemaining: event.capacity ? event.capacity - event.currentRSVPs : null,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// RSVP to event
router.post('/:id/rsvp', auth, requireMember, async (req, res) => {
  try {
    const { guests = 1, dietaryRequirements, specialRequests } = req.body;
    
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Check if already RSVPd
    const existingRSVP = event.rsvps.find(
      r => r.user.toString() === req.user._id.toString()
    );
    
    if (existingRSVP) {
      // Update existing RSVP
      existingRSVP.guests = guests;
      existingRSVP.dietaryRequirements = dietaryRequirements;
      existingRSVP.specialRequests = specialRequests;
      existingRSVP.status = 'confirmed';
    } else {
      // Check capacity
      if (event.capacity && event.currentRSVPs + guests > event.capacity) {
        return res.status(400).json({ error: 'Event is at capacity' });
      }
      
      // Add new RSVP
      event.rsvps.push({
        user: req.user._id,
        guests,
        dietaryRequirements,
        specialRequests,
        status: 'confirmed',
      });
      event.currentRSVPs += guests;
    }
    
    await event.save();
    
    res.json({
      success: true,
      message: 'RSVP confirmed',
      rsvp: {
        eventId: event._id,
        eventName: event.name,
        eventDate: event.date,
        venue: event.venue,
        guests,
        dietaryRequirements,
        status: 'confirmed',
      },
    });
  } catch (error) {
    console.error('RSVP error:', error);
    res.status(500).json({ error: 'Failed to RSVP' });
  }
});

// Cancel RSVP
router.delete('/:id/rsvp', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    const rsvpIndex = event.rsvps.findIndex(
      r => r.user.toString() === req.user._id.toString()
    );
    
    if (rsvpIndex === -1) {
      return res.status(404).json({ error: 'RSVP not found' });
    }
    
    const rsvp = event.rsvps[rsvpIndex];
    event.currentRSVPs -= rsvp.guests;
    event.rsvps.splice(rsvpIndex, 1);
    
    await event.save();
    
    res.json({ success: true, message: 'RSVP cancelled' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel RSVP' });
  }
});

// Get user's RSVPs
router.get('/user/rsvps', auth, async (req, res) => {
  try {
    const events = await Event.find({
      'rsvps.user': req.user._id,
    }).sort({ date: 1 });
    
    const rsvps = events.map(event => {
      const rsvp = event.rsvps.find(r => r.user.toString() === req.user._id.toString());
      return {
        event: {
          _id: event._id,
          name: event.name,
          date: event.date,
          venue: event.venue,
          image: event.images?.[0]?.url,
        },
        guests: rsvp.guests,
        status: rsvp.status,
        rsvpDate: rsvp.rsvpDate,
      };
    });
    
    res.json(rsvps);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch RSVPs' });
  }
});

// Create event (admin)
router.post('/', auth, async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Update event (admin)
router.put('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// Delete event (admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

module.exports = router;
