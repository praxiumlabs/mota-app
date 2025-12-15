/**
 * Content Routes
 * Manage all app content: slideshows, text, settings
 */

const express = require('express');
const router = express.Router();
const Content = require('../models/Content');
const { auth, requireInvestor } = require('../middleware/auth');

// ============================================
// SLIDESHOW MANAGEMENT (MUST BE BEFORE /:key)
// ============================================

// Get homepage slideshow
router.get('/slideshow/homepage', async (req, res) => {
  try {
    const content = await Content.findOne({ key: 'homepage_slideshow' });
    res.json({ 
      slides: content?.slides?.filter(s => s.isActive).sort((a, b) => a.order - b.order) || [] 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update entire slideshow
router.put('/slideshow/homepage', auth, async (req, res) => {
  try {
    const { slides } = req.body;
    
    const content = await Content.findOneAndUpdate(
      { key: 'homepage_slideshow' },
      { 
        key: 'homepage_slideshow',
        slides: slides.map((s, i) => ({ ...s, order: i })),
        updatedBy: req.user._id 
      },
      { new: true, upsert: true }
    );
    
    res.json(content);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add slide to slideshow
router.post('/slideshow/homepage/slides', auth, async (req, res) => {
  try {
    let content = await Content.findOne({ key: 'homepage_slideshow' });
    
    if (!content) {
      content = new Content({ key: 'homepage_slideshow', slides: [] });
    }
    
    const newSlide = {
      ...req.body,
      order: content.slides.length
    };
    
    content.slides.push(newSlide);
    content.updatedBy = req.user._id;
    await content.save();
    
    res.json(content);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update single slide
router.put('/slideshow/homepage/slides/:slideId', auth, async (req, res) => {
  try {
    const content = await Content.findOne({ key: 'homepage_slideshow' });
    
    if (!content) {
      return res.status(404).json({ error: 'Slideshow not found' });
    }
    
    const slide = content.slides.id(req.params.slideId);
    if (!slide) {
      return res.status(404).json({ error: 'Slide not found' });
    }
    
    Object.assign(slide, req.body);
    content.updatedBy = req.user._id;
    await content.save();
    
    res.json(content);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete slide
router.delete('/slideshow/homepage/slides/:slideId', auth, async (req, res) => {
  try {
    const content = await Content.findOne({ key: 'homepage_slideshow' });
    
    if (!content) {
      return res.status(404).json({ error: 'Slideshow not found' });
    }
    
    content.slides = content.slides.filter(s => s._id.toString() !== req.params.slideId);
    content.updatedBy = req.user._id;
    await content.save();
    
    res.json(content);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reorder slides
router.put('/slideshow/homepage/reorder', auth, async (req, res) => {
  try {
    const { slideIds } = req.body; // Array of slide IDs in new order
    
    const content = await Content.findOne({ key: 'homepage_slideshow' });
    
    if (!content) {
      return res.status(404).json({ error: 'Slideshow not found' });
    }
    
    // Reorder slides based on provided order
    const reorderedSlides = slideIds.map((id, index) => {
      const slide = content.slides.find(s => s._id.toString() === id);
      if (slide) {
        slide.order = index;
      }
      return slide;
    }).filter(Boolean);
    
    content.slides = reorderedSlides;
    content.updatedBy = req.user._id;
    await content.save();
    
    res.json(content);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// GENERIC CONTENT ROUTES (MUST BE AFTER SPECIFIC ROUTES)
// ============================================

// Get all content
router.get('/', async (req, res) => {
  try {
    const content = await Content.find();
    res.json({ content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get content by key
router.get('/:key', async (req, res) => {
  try {
    const content = await Content.findOne({ key: req.params.key });
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }
    res.json(content);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create or update content by key
router.put('/:key', auth, async (req, res) => {
  try {
    const { key } = req.params;
    const updateData = { ...req.body, key, updatedBy: req.user._id };
    
    const content = await Content.findOneAndUpdate(
      { key },
      updateData,
      { new: true, upsert: true, runValidators: true }
    );
    
    res.json(content);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
