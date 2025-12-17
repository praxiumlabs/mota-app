/**
 * Content Model
 * Manages all app content: slideshows, text, settings
 * 
 * UPDATED: Added deep linking support for slides
 */

const mongoose = require('mongoose');

const SlideSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  description: { type: String },
  imageUrl: { type: String, required: true },
  buttonText: { type: String },
  buttonLink: { type: String },
  
  // ============================================
  // DEEP LINKING CONFIGURATION
  // ============================================
  // linkType: What type of navigation to perform
  //   - 'tab': Navigate to a specific tab (optionally with category)
  //   - 'screen': Navigate to a specific screen
  //   - 'external': Open an external URL
  //   - 'none': No action (default)
  linkType: { 
    type: String, 
    enum: ['tab', 'screen', 'external', 'none'],
    default: 'none'
  },
  
  // linkTarget: The destination
  //   - For 'tab': Category name (Lodging, Eateries, Experiences, Nightlife) or null
  //   - For 'screen': Screen name (fleet, reservations, favorites, etc.)
  //   - For 'external': Full URL (https://...)
  linkTarget: { type: String },
  
  // linkTab: Tab index for 'tab' linkType
  //   - 0: Home
  //   - 1: Explore
  //   - 2: Events
  //   - 3: Concierge
  //   - 4: Profile
  linkTab: { 
    type: Number,
    min: 0,
    max: 4
  },
  // ============================================
  
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
});

const ContentSchema = new mongoose.Schema({
  key: { 
    type: String, 
    required: true, 
    unique: true,
    enum: [
      'homepage_slideshow',
      'homepage_welcome',
      'about_resort',
      'contact_info',
      'app_settings',
      'investment_info',
      'membership_tiers',
      'footer_content'
    ]
  },
  
  // For slideshow content
  slides: [SlideSchema],
  
  // For text content
  title: { type: String },
  subtitle: { type: String },
  body: { type: String },
  
  // For structured data (JSON)
  data: { type: mongoose.Schema.Types.Mixed },
  
  // For images
  images: [{
    url: { type: String },
    alt: { type: String },
    caption: { type: String }
  }],
  
  // Metadata
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
}, { timestamps: true });

module.exports = mongoose.model('Content', ContentSchema);