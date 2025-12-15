/**
 * Upload Routes
 * Handle file uploads for profile images, restaurant images, etc.
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Lodging = require('../models/Lodging');
const Activity = require('../models/Activity');
const Event = require('../models/Event');

// Ensure upload directories exist
const uploadDirs = ['uploads', 'uploads/profiles', 'uploads/restaurants', 'uploads/lodging', 'uploads/activities', 'uploads/events'];
uploadDirs.forEach(dir => {
  const fullPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.params.type || 'general';
    let uploadPath = path.join(__dirname, '..', 'uploads');
    
    if (type === 'profile') uploadPath = path.join(uploadPath, 'profiles');
    else if (type === 'restaurant') uploadPath = path.join(uploadPath, 'restaurants');
    else if (type === 'lodging') uploadPath = path.join(uploadPath, 'lodging');
    else if (type === 'activity') uploadPath = path.join(uploadPath, 'activities');
    else if (type === 'event') uploadPath = path.join(uploadPath, 'events');
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${req.params.type || 'file'}-${uniqueSuffix}${ext}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  }
});

// Upload profile image
router.post('/profile', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const imageUrl = `/uploads/profiles/${req.file.filename}`;
    
    // Update user's avatar
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: imageUrl },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      imageUrl,
      user
    });
  } catch (error) {
    console.error('Profile upload error:', error);
    res.status(500).json({ error: 'Failed to upload profile image' });
  }
});

// Upload image for a specific type (restaurant, lodging, etc.)
router.post('/:type/:id', auth, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const { type, id } = req.params;
    const imageUrls = req.files.map((file, index) => ({
      url: `/uploads/${type}s/${file.filename}`,
      caption: req.body.captions?.[index] || '',
      isPrimary: index === 0 && req.body.setPrimary === 'true'
    }));

    let Model;
    switch (type) {
      case 'restaurant': Model = Restaurant; break;
      case 'lodging': Model = Lodging; break;
      case 'activity': Model = Activity; break;
      case 'event': Model = Event; break;
      default:
        return res.status(400).json({ error: 'Invalid upload type' });
    }

    // Add images to the item
    const item = await Model.findByIdAndUpdate(
      id,
      { $push: { images: { $each: imageUrls } } },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({
      success: true,
      images: imageUrls,
      item
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload images' });
  }
});

// Set primary image
router.put('/:type/:id/primary/:imageIndex', auth, async (req, res) => {
  try {
    const { type, id, imageIndex } = req.params;
    
    let Model;
    switch (type) {
      case 'restaurant': Model = Restaurant; break;
      case 'lodging': Model = Lodging; break;
      case 'activity': Model = Activity; break;
      case 'event': Model = Event; break;
      default:
        return res.status(400).json({ error: 'Invalid type' });
    }

    const item = await Model.findById(id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Reset all to non-primary
    item.images.forEach(img => img.isPrimary = false);
    
    // Set the selected one as primary
    if (item.images[imageIndex]) {
      item.images[imageIndex].isPrimary = true;
    }

    await item.save();

    res.json({ success: true, images: item.images });
  } catch (error) {
    console.error('Set primary error:', error);
    res.status(500).json({ error: 'Failed to set primary image' });
  }
});

// Delete image
router.delete('/:type/:id/:imageIndex', auth, async (req, res) => {
  try {
    const { type, id, imageIndex } = req.params;
    
    let Model;
    switch (type) {
      case 'restaurant': Model = Restaurant; break;
      case 'lodging': Model = Lodging; break;
      case 'activity': Model = Activity; break;
      case 'event': Model = Event; break;
      default:
        return res.status(400).json({ error: 'Invalid type' });
    }

    const item = await Model.findById(id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Get the image to delete
    const imageToDelete = item.images[imageIndex];
    if (imageToDelete) {
      // Delete file from filesystem
      const filePath = path.join(__dirname, '..', imageToDelete.url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      // Remove from array
      item.images.splice(imageIndex, 1);
      await item.save();
    }

    res.json({ success: true, images: item.images });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// Upload base64 image (for mobile apps)
router.post('/base64/:type', auth, async (req, res) => {
  try {
    const { type } = req.params;
    const { image, itemId } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    // Extract base64 data
    const matches = image.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) {
      return res.status(400).json({ error: 'Invalid base64 image format' });
    }

    const ext = matches[1];
    const data = matches[2];
    const buffer = Buffer.from(data, 'base64');

    // Generate filename
    const filename = `${type}-${Date.now()}-${Math.round(Math.random() * 1E9)}.${ext}`;
    let uploadPath;

    if (type === 'profile') {
      uploadPath = path.join(__dirname, '..', 'uploads', 'profiles', filename);
    } else {
      uploadPath = path.join(__dirname, '..', 'uploads', `${type}s`, filename);
    }

    // Write file
    fs.writeFileSync(uploadPath, buffer);

    let imageUrl;
    if (type === 'profile') {
      imageUrl = `/uploads/profiles/${filename}`;
      
      // Update user avatar
      await User.findByIdAndUpdate(req.user._id, { avatar: imageUrl });
    } else {
      imageUrl = `/uploads/${type}s/${filename}`;
      
      // Add to item if itemId provided
      if (itemId) {
        let Model;
        switch (type) {
          case 'restaurant': Model = Restaurant; break;
          case 'lodging': Model = Lodging; break;
          case 'activity': Model = Activity; break;
          case 'event': Model = Event; break;
        }
        
        if (Model) {
          await Model.findByIdAndUpdate(itemId, {
            $push: { images: { url: imageUrl, isPrimary: false } }
          });
        }
      }
    }

    res.json({ success: true, imageUrl });
  } catch (error) {
    console.error('Base64 upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

module.exports = router;
