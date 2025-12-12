/**
 * Content Model
 * Manages all app content: slideshows, text, settings
 */

const mongoose = require('mongoose');

const SlideSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  description: { type: String },
  imageUrl: { type: String, required: true },
  buttonText: { type: String },
  buttonLink: { type: String },
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
