/**
 * =====================================================
 * MOTA ADAPTIVE MEDIA GRID & FILE UPLOAD
 * =====================================================
 * 
 * Features:
 * - Adaptive grid layout for any number of images
 * - Elegant arrangements for 1, 2, 3, 4, 5+ images
 * - Full-screen image viewer
 * - Backend file upload support
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const C = {
  bg: '#0A122A',
  card: '#101C40',
  cardLight: '#182952',
  gold: '#D4AF37',
  text: '#F5F5F5',
  textSec: '#A0AEC0',
  textMuted: '#718096',
};


// =====================================================
// ADAPTIVE MEDIA GRID COMPONENT
// =====================================================
export const AdaptiveMediaGrid = ({ 
  images = [], 
  onImagePress,
  containerWidth = SCREEN_WIDTH - 40,
  gap = 4,
  borderRadius = 12,
  maxHeight = 400,
}) => {
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const handleImagePress = (index) => {
    if (onImagePress) {
      onImagePress(index);
    } else {
      setViewerIndex(index);
      setViewerVisible(true);
    }
  };

  if (!images || images.length === 0) {
    return (
      <View style={[gridStyles.placeholder, { height: 200, borderRadius }]}>
        <Ionicons name="images-outline" size={48} color={C.textMuted} />
        <Text style={gridStyles.placeholderText}>No images available</Text>
      </View>
    );
  }

  const getImageUrl = (img) => {
    if (typeof img === 'string') return img;
    return img.url || img.uri || img.imageUrl;
  };

  // Layout configurations based on image count
  const renderGrid = () => {
    const count = images.length;

    // Single Image - Full Width
    if (count === 1) {
      return (
        <TouchableOpacity 
          style={[gridStyles.singleImage, { width: containerWidth, height: maxHeight * 0.7, borderRadius }]}
          onPress={() => handleImagePress(0)}
          activeOpacity={0.9}
        >
          <Image 
            source={{ uri: getImageUrl(images[0]) }} 
            style={[gridStyles.image, { borderRadius }]}
            resizeMode="cover"
          />
        </TouchableOpacity>
      );
    }

    // Two Images - Side by Side
    if (count === 2) {
      const itemWidth = (containerWidth - gap) / 2;
      return (
        <View style={[gridStyles.row, { gap }]}>
          {images.map((img, index) => (
            <TouchableOpacity 
              key={index}
              style={[gridStyles.gridItem, { width: itemWidth, height: maxHeight * 0.5, borderRadius }]}
              onPress={() => handleImagePress(index)}
              activeOpacity={0.9}
            >
              <Image 
                source={{ uri: getImageUrl(img) }} 
                style={[gridStyles.image, { borderRadius }]}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    // Three Images - 1 Large + 2 Small
    if (count === 3) {
      const largeWidth = containerWidth * 0.6 - gap / 2;
      const smallWidth = containerWidth * 0.4 - gap / 2;
      const smallHeight = (maxHeight * 0.6 - gap) / 2;

      return (
        <View style={[gridStyles.row, { gap, height: maxHeight * 0.6 }]}>
          <TouchableOpacity 
            style={[gridStyles.gridItem, { width: largeWidth, height: '100%', borderRadius }]}
            onPress={() => handleImagePress(0)}
            activeOpacity={0.9}
          >
            <Image 
              source={{ uri: getImageUrl(images[0]) }} 
              style={[gridStyles.image, { borderRadius }]}
              resizeMode="cover"
            />
          </TouchableOpacity>
          <View style={[gridStyles.column, { gap, width: smallWidth }]}>
            {[1, 2].map((i) => (
              <TouchableOpacity 
                key={i}
                style={[gridStyles.gridItem, { width: '100%', height: smallHeight, borderRadius }]}
                onPress={() => handleImagePress(i)}
                activeOpacity={0.9}
              >
                <Image 
                  source={{ uri: getImageUrl(images[i]) }} 
                  style={[gridStyles.image, { borderRadius }]}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    }

    // Four Images - 2x2 Grid
    if (count === 4) {
      const itemWidth = (containerWidth - gap) / 2;
      const itemHeight = (maxHeight * 0.6 - gap) / 2;

      return (
        <View style={[gridStyles.grid2x2, { gap }]}>
          {images.map((img, index) => (
            <TouchableOpacity 
              key={index}
              style={[gridStyles.gridItem, { width: itemWidth, height: itemHeight, borderRadius }]}
              onPress={() => handleImagePress(index)}
              activeOpacity={0.9}
            >
              <Image 
                source={{ uri: getImageUrl(img) }} 
                style={[gridStyles.image, { borderRadius }]}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    // Five Images - 2 Large + 3 Small
    if (count === 5) {
      const topItemWidth = (containerWidth - gap) / 2;
      const topHeight = maxHeight * 0.4;
      const bottomItemWidth = (containerWidth - gap * 2) / 3;
      const bottomHeight = maxHeight * 0.25;

      return (
        <View style={{ gap }}>
          <View style={[gridStyles.row, { gap }]}>
            {[0, 1].map((i) => (
              <TouchableOpacity 
                key={i}
                style={[gridStyles.gridItem, { width: topItemWidth, height: topHeight, borderRadius }]}
                onPress={() => handleImagePress(i)}
                activeOpacity={0.9}
              >
                <Image 
                  source={{ uri: getImageUrl(images[i]) }} 
                  style={[gridStyles.image, { borderRadius }]}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </View>
          <View style={[gridStyles.row, { gap }]}>
            {[2, 3, 4].map((i) => (
              <TouchableOpacity 
                key={i}
                style={[gridStyles.gridItem, { width: bottomItemWidth, height: bottomHeight, borderRadius }]}
                onPress={() => handleImagePress(i)}
                activeOpacity={0.9}
              >
                <Image 
                  source={{ uri: getImageUrl(images[i]) }} 
                  style={[gridStyles.image, { borderRadius }]}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    }

    // 6+ Images - Dynamic Grid with "See More"
    const showCount = 6;
    const remainingCount = count - showCount;
    const topItemWidth = (containerWidth - gap) / 2;
    const topHeight = maxHeight * 0.35;
    const bottomItemWidth = (containerWidth - gap * 3) / 4;
    const bottomHeight = maxHeight * 0.2;

    return (
      <View style={{ gap }}>
        {/* Top Row - 2 Large */}
        <View style={[gridStyles.row, { gap }]}>
          {[0, 1].map((i) => (
            <TouchableOpacity 
              key={i}
              style={[gridStyles.gridItem, { width: topItemWidth, height: topHeight, borderRadius }]}
              onPress={() => handleImagePress(i)}
              activeOpacity={0.9}
            >
              <Image 
                source={{ uri: getImageUrl(images[i]) }} 
                style={[gridStyles.image, { borderRadius }]}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </View>
        {/* Bottom Row - 4 Small */}
        <View style={[gridStyles.row, { gap }]}>
          {[2, 3, 4, 5].map((i) => (
            <TouchableOpacity 
              key={i}
              style={[gridStyles.gridItem, { width: bottomItemWidth, height: bottomHeight, borderRadius }]}
              onPress={() => handleImagePress(i)}
              activeOpacity={0.9}
            >
              <Image 
                source={{ uri: getImageUrl(images[i]) }} 
                style={[gridStyles.image, { borderRadius }]}
                resizeMode="cover"
              />
              {/* "See More" overlay on last visible image */}
              {i === 5 && remainingCount > 0 && (
                <View style={[gridStyles.seeMoreOverlay, { borderRadius }]}>
                  <Text style={gridStyles.seeMoreText}>+{remainingCount}</Text>
                  <Text style={gridStyles.seeMoreLabel}>more</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={gridStyles.container}>
      {renderGrid()}
      
      {/* Full Screen Image Viewer */}
      <ImageViewer
        visible={viewerVisible}
        images={images.map(getImageUrl)}
        initialIndex={viewerIndex}
        onClose={() => setViewerVisible(false)}
      />
    </View>
  );
};


// =====================================================
// FULL SCREEN IMAGE VIEWER
// =====================================================
const ImageViewer = ({ visible, images, initialIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const handleScroll = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={viewerStyles.container}>
        {/* Header */}
        <View style={viewerStyles.header}>
          <Text style={viewerStyles.counter}>{currentIndex + 1} / {images.length}</Text>
          <TouchableOpacity style={viewerStyles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Images */}
        <FlatList
          data={images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialIndex}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
          onMomentumScrollEnd={handleScroll}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={viewerStyles.imageContainer}>
              <Image
                source={{ uri: item }}
                style={viewerStyles.image}
                resizeMode="contain"
              />
            </View>
          )}
        />

        {/* Dots Indicator */}
        {images.length > 1 && images.length <= 10 && (
          <View style={viewerStyles.dots}>
            {images.map((_, index) => (
              <View
                key={index}
                style={[
                  viewerStyles.dot,
                  currentIndex === index && viewerStyles.dotActive,
                ]}
              />
            ))}
          </View>
        )}
      </View>
    </Modal>
  );
};

const viewerStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  counter: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT - 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: SCREEN_WIDTH,
    height: '100%',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dotActive: {
    backgroundColor: '#fff',
    width: 24,
  },
});

const gridStyles = StyleSheet.create({
  container: {},
  row: {
    flexDirection: 'row',
  },
  column: {
    flexDirection: 'column',
  },
  grid2x2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    overflow: 'hidden',
    backgroundColor: C.cardLight,
  },
  singleImage: {
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  seeMoreOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  seeMoreText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  seeMoreLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  placeholder: {
    backgroundColor: C.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 14,
    color: C.textMuted,
    marginTop: 8,
  },
});


// =====================================================
// IMAGE UPLOADER COMPONENT (For Admin/Profile)
// =====================================================
export const ImageUploader = ({
  images = [],
  onImagesChange,
  maxImages = 10,
  uploadEndpoint = '/upload/image',
  itemType = 'general',
  itemId = null,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const pickImage = async (useCamera = false) => {
    try {
      const permissionResult = useCamera 
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert('Permission Required', `Please grant ${useCamera ? 'camera' : 'photo library'} access to upload images.`);
        return;
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.8,
            base64: true,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsMultipleSelection: true,
            selectionLimit: maxImages - images.length,
            quality: 0.8,
            base64: true,
          });

      if (!result.canceled && result.assets) {
        await uploadImages(result.assets);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const uploadImages = async (assets) => {
    setUploading(true);
    setUploadProgress(0);
    
    const uploadedImages = [];
    
    for (let i = 0; i < assets.length; i++) {
      const asset = assets[i];
      setUploadProgress(((i + 1) / assets.length) * 100);
      
      try {
        // Upload to backend
        const response = await uploadToServer(asset);
        if (response.success) {
          uploadedImages.push({
            url: response.imageUrl,
            uri: response.imageUrl,
            isPrimary: images.length === 0 && i === 0,
          });
        }
      } catch (error) {
        console.error('Upload error:', error);
      }
    }

    setUploading(false);
    setUploadProgress(0);
    
    if (uploadedImages.length > 0) {
      onImagesChange([...images, ...uploadedImages]);
    }
  };

  const uploadToServer = async (asset) => {
    // Create form data for file upload
    const formData = new FormData();
    
    // If base64 is available, use it
    if (asset.base64) {
      const response = await fetch('/api/upload/base64/' + itemType, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: `data:image/jpeg;base64,${asset.base64}`,
          itemId,
        }),
      });
      return response.json();
    }
    
    // Otherwise use file upload
    formData.append('image', {
      uri: asset.uri,
      type: 'image/jpeg',
      name: `image_${Date.now()}.jpg`,
    } as any);
    
    if (itemId) {
      formData.append('itemId', itemId);
    }

    const response = await fetch(`/api${uploadEndpoint}`, {
      method: 'POST',
      body: formData,
    });
    
    return response.json();
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const setPrimaryImage = (index) => {
    const newImages = images.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));
    onImagesChange(newImages);
  };

  const showUploadOptions = () => {
    Alert.alert(
      'Add Image',
      'Choose how to add an image',
      [
        { text: 'Take Photo', onPress: () => pickImage(true) },
        { text: 'Choose from Library', onPress: () => pickImage(false) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <View style={uploaderStyles.container}>
      <Text style={uploaderStyles.label}>Images ({images.length}/{maxImages})</Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={uploaderStyles.imageRow}>
          {/* Existing Images */}
          {images.map((img, index) => (
            <View key={index} style={uploaderStyles.imageWrapper}>
              <Image 
                source={{ uri: typeof img === 'string' ? img : img.url || img.uri }} 
                style={uploaderStyles.image}
              />
              {img.isPrimary && (
                <View style={uploaderStyles.primaryBadge}>
                  <Text style={uploaderStyles.primaryText}>Primary</Text>
                </View>
              )}
              <View style={uploaderStyles.imageActions}>
                <TouchableOpacity 
                  style={uploaderStyles.actionBtn}
                  onPress={() => setPrimaryImage(index)}
                >
                  <Ionicons 
                    name={img.isPrimary ? 'star' : 'star-outline'} 
                    size={16} 
                    color={img.isPrimary ? C.gold : '#fff'} 
                  />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[uploaderStyles.actionBtn, uploaderStyles.deleteBtn]}
                  onPress={() => removeImage(index)}
                >
                  <Ionicons name="trash-outline" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
          
          {/* Add Image Button */}
          {images.length < maxImages && (
            <TouchableOpacity 
              style={uploaderStyles.addBtn}
              onPress={showUploadOptions}
              disabled={uploading}
            >
              {uploading ? (
                <View style={uploaderStyles.uploadingContainer}>
                  <ActivityIndicator size="small" color={C.gold} />
                  <Text style={uploaderStyles.uploadingText}>{Math.round(uploadProgress)}%</Text>
                </View>
              ) : (
                <>
                  <Ionicons name="add" size={32} color={C.gold} />
                  <Text style={uploaderStyles.addText}>Add Image</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const uploaderStyles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: C.textSec,
    marginBottom: 12,
  },
  imageRow: {
    flexDirection: 'row',
    gap: 12,
  },
  imageWrapper: {
    width: 120,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  primaryBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: C.gold,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  primaryText: {
    fontSize: 10,
    fontWeight: '700',
    color: C.bg,
  },
  imageActions: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    gap: 6,
  },
  actionBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtn: {
    backgroundColor: 'rgba(220,38,38,0.8)',
  },
  addBtn: {
    width: 120,
    height: 120,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: C.cardLight,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: C.card,
  },
  addText: {
    fontSize: 12,
    color: C.textMuted,
    marginTop: 4,
  },
  uploadingContainer: {
    alignItems: 'center',
  },
  uploadingText: {
    fontSize: 12,
    color: C.gold,
    marginTop: 8,
  },
});


// =====================================================
// BACKEND ROUTES FOR FILE UPLOAD
// =====================================================
// Add this to your backend: routes/upload.js

const backendUploadRoutes = `
/**
 * Upload Routes
 * Handle file uploads to server storage
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth } = require('../middleware/auth');

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads', req.params.type || 'general');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

// Upload single image
router.post('/:type', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const imageUrl = \`\${process.env.BASE_URL || 'http://localhost:3000'}/uploads/\${req.params.type}/\${req.file.filename}\`;
    
    res.json({
      success: true,
      imageUrl,
      filename: req.file.filename,
      size: req.file.size,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload multiple images
router.post('/:type/multiple', auth, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const images = req.files.map(file => ({
      url: \`\${baseUrl}/uploads/\${req.params.type}/\${file.filename}\`,
      filename: file.filename,
      size: file.size,
    }));
    
    res.json({
      success: true,
      images,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload base64 image
router.post('/base64/:type', auth, async (req, res) => {
  try {
    const { image, itemId } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    // Extract base64 data
    const matches = image.match(/^data:image\\/([a-zA-Z]+);base64,(.+)$/);
    if (!matches) {
      return res.status(400).json({ error: 'Invalid image format' });
    }

    const ext = matches[1];
    const data = matches[2];
    const buffer = Buffer.from(data, 'base64');

    // Generate filename
    const filename = \`\${Date.now()}-\${Math.round(Math.random() * 1E9)}.\${ext}\`;
    const uploadDir = path.join(__dirname, '../uploads', req.params.type);
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filepath = path.join(uploadDir, filename);
    fs.writeFileSync(filepath, buffer);

    const imageUrl = \`\${process.env.BASE_URL || 'http://localhost:3000'}/uploads/\${req.params.type}/\${filename}\`;
    
    res.json({
      success: true,
      imageUrl,
      filename,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete image
router.delete('/:type/:filename', auth, async (req, res) => {
  try {
    const filepath = path.join(__dirname, '../uploads', req.params.type, req.params.filename);
    
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
`;


export default {
  AdaptiveMediaGrid,
  ImageViewer,
  ImageUploader,
};
