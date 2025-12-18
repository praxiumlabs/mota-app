/**
 * ImageGrid Component
 * Displays multiple images in a responsive grid layout
 * Handles 1, 2, 3, 4, 5, 6+ images with different layouts
 */

import React, { useState } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  FlatList,
  Text,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ImageItem {
  url: string;
  caption?: string;
  isPrimary?: boolean;
}

interface ImageGridProps {
  images: ImageItem[];
  height?: number;
  borderRadius?: number;
  onImagePress?: (index: number) => void;
  showCounter?: boolean;
}

export default function ImageGrid({
  images = [],
  height = 250,
  borderRadius = 16,
  onImagePress,
  showCounter = true,
}: ImageGridProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <View style={[styles.placeholder, { height, borderRadius }]}>
        <Ionicons name="image-outline" size={48} color="#718096" />
        <Text style={styles.placeholderText}>No images</Text>
      </View>
    );
  }

  const handleImagePress = (index: number) => {
    if (onImagePress) {
      onImagePress(index);
    } else {
      setActiveIndex(index);
      setModalVisible(true);
    }
  };

  const renderGrid = () => {
    const count = images.length;
    const gap = 2;

    // Single image - full width
    if (count === 1) {
      return (
        <TouchableOpacity 
          activeOpacity={0.9} 
          onPress={() => handleImagePress(0)}
          style={{ height, borderRadius, overflow: 'hidden' }}
        >
          <Image source={{ uri: images[0].url }} style={styles.fullImage} />
        </TouchableOpacity>
      );
    }

    // Two images - side by side
    if (count === 2) {
      return (
        <View style={[styles.row, { height, gap }]}>
          {images.map((img, i) => (
            <TouchableOpacity 
              key={i} 
              activeOpacity={0.9} 
              onPress={() => handleImagePress(i)}
              style={[styles.halfImage, { borderRadius: i === 0 ? borderRadius : 0, borderTopRightRadius: i === 1 ? borderRadius : 0, borderBottomRightRadius: i === 1 ? borderRadius : 0, borderTopLeftRadius: i === 0 ? borderRadius : 0, borderBottomLeftRadius: i === 0 ? borderRadius : 0 }]}
            >
              <Image source={{ uri: img.url }} style={styles.fullImage} />
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    // Three images - one large left, two stacked right
    if (count === 3) {
      return (
        <View style={[styles.row, { height, gap }]}>
          <TouchableOpacity 
            activeOpacity={0.9} 
            onPress={() => handleImagePress(0)}
            style={[styles.twoThirds, { borderTopLeftRadius: borderRadius, borderBottomLeftRadius: borderRadius }]}
          >
            <Image source={{ uri: images[0].url }} style={styles.fullImage} />
          </TouchableOpacity>
          <View style={[styles.column, { gap }]}>
            {images.slice(1, 3).map((img, i) => (
              <TouchableOpacity 
                key={i} 
                activeOpacity={0.9} 
                onPress={() => handleImagePress(i + 1)}
                style={[styles.stackedImage, { borderTopRightRadius: i === 0 ? borderRadius : 0, borderBottomRightRadius: i === 1 ? borderRadius : 0 }]}
              >
                <Image source={{ uri: img.url }} style={styles.fullImage} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    }

    // Four images - 2x2 grid
    if (count === 4) {
      return (
        <View style={{ height, gap }}>
          <View style={[styles.row, { flex: 1, gap }]}>
            <TouchableOpacity activeOpacity={0.9} onPress={() => handleImagePress(0)} style={[styles.quarterImage, { borderTopLeftRadius: borderRadius }]}>
              <Image source={{ uri: images[0].url }} style={styles.fullImage} />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.9} onPress={() => handleImagePress(1)} style={[styles.quarterImage, { borderTopRightRadius: borderRadius }]}>
              <Image source={{ uri: images[1].url }} style={styles.fullImage} />
            </TouchableOpacity>
          </View>
          <View style={[styles.row, { flex: 1, gap }]}>
            <TouchableOpacity activeOpacity={0.9} onPress={() => handleImagePress(2)} style={[styles.quarterImage, { borderBottomLeftRadius: borderRadius }]}>
              <Image source={{ uri: images[2].url }} style={styles.fullImage} />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.9} onPress={() => handleImagePress(3)} style={[styles.quarterImage, { borderBottomRightRadius: borderRadius }]}>
              <Image source={{ uri: images[3].url }} style={styles.fullImage} />
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // Five images - 2 top, 3 bottom
    if (count === 5) {
      return (
        <View style={{ height, gap }}>
          <View style={[styles.row, { flex: 1, gap }]}>
            <TouchableOpacity activeOpacity={0.9} onPress={() => handleImagePress(0)} style={[styles.quarterImage, { borderTopLeftRadius: borderRadius }]}>
              <Image source={{ uri: images[0].url }} style={styles.fullImage} />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.9} onPress={() => handleImagePress(1)} style={[styles.quarterImage, { borderTopRightRadius: borderRadius }]}>
              <Image source={{ uri: images[1].url }} style={styles.fullImage} />
            </TouchableOpacity>
          </View>
          <View style={[styles.row, { flex: 1, gap }]}>
            {images.slice(2, 5).map((img, i) => (
              <TouchableOpacity 
                key={i} 
                activeOpacity={0.9} 
                onPress={() => handleImagePress(i + 2)}
                style={[styles.thirdImage, { borderBottomLeftRadius: i === 0 ? borderRadius : 0, borderBottomRightRadius: i === 2 ? borderRadius : 0 }]}
              >
                <Image source={{ uri: img.url }} style={styles.fullImage} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    }

    // Six or more images - 2 top, 3 bottom with +more overlay
    return (
      <View style={{ height, gap }}>
        <View style={[styles.row, { flex: 1, gap }]}>
          <TouchableOpacity activeOpacity={0.9} onPress={() => handleImagePress(0)} style={[styles.quarterImage, { borderTopLeftRadius: borderRadius }]}>
            <Image source={{ uri: images[0].url }} style={styles.fullImage} />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.9} onPress={() => handleImagePress(1)} style={[styles.quarterImage, { borderTopRightRadius: borderRadius }]}>
            <Image source={{ uri: images[1].url }} style={styles.fullImage} />
          </TouchableOpacity>
        </View>
        <View style={[styles.row, { flex: 1, gap }]}>
          {images.slice(2, 5).map((img, i) => (
            <TouchableOpacity 
              key={i} 
              activeOpacity={0.9} 
              onPress={() => handleImagePress(i + 2)}
              style={[styles.thirdImage, { borderBottomLeftRadius: i === 0 ? borderRadius : 0, borderBottomRightRadius: i === 2 ? borderRadius : 0 }]}
            >
              <Image source={{ uri: img.url }} style={styles.fullImage} />
              {i === 2 && count > 5 && (
                <View style={styles.moreOverlay}>
                  <Text style={styles.moreText}>+{count - 5}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  // Full screen gallery modal
  const renderModal = () => (
    <Modal
      visible={modalVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setModalVisible(false)}
    >
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          {showCounter && (
            <Text style={styles.counter}>
              {activeIndex + 1} / {images.length}
            </Text>
          )}
          <View style={{ width: 44 }} />
        </View>

        {/* Image Carousel */}
        <FlatList
          data={images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={activeIndex}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
          onMomentumScrollEnd={(e) => {
            const newIndex = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
            setActiveIndex(newIndex);
          }}
          renderItem={({ item, index }) => (
            <View style={styles.slideContainer}>
              <Image
                source={{ uri: item.url }}
                style={styles.modalImage}
                resizeMode="contain"
              />
              {item.caption && (
                <View style={styles.captionContainer}>
                  <Text style={styles.caption}>{item.caption}</Text>
                </View>
              )}
            </View>
          )}
          keyExtractor={(_, i) => i.toString()}
        />

        {/* Dots indicator */}
        {images.length > 1 && images.length <= 10 && (
          <View style={styles.dotsContainer}>
            {images.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === activeIndex && styles.dotActive,
                ]}
              />
            ))}
          </View>
        )}

        {/* Thumbnails for many images */}
        {images.length > 10 && (
          <FlatList
            data={images}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.thumbnailList}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                onPress={() => setActiveIndex(index)}
                style={[
                  styles.thumbnail,
                  index === activeIndex && styles.thumbnailActive,
                ]}
              >
                <Image source={{ uri: item.url }} style={styles.thumbnailImage} />
              </TouchableOpacity>
            )}
            keyExtractor={(_, i) => i.toString()}
          />
        )}
      </View>
    </Modal>
  );

  return (
    <View>
      {renderGrid()}
      {renderModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: '#1a1f2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#718096',
    fontSize: 14,
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
  },
  column: {
    flex: 1,
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  halfImage: {
    flex: 1,
    overflow: 'hidden',
  },
  twoThirds: {
    flex: 2,
    overflow: 'hidden',
  },
  stackedImage: {
    flex: 1,
    overflow: 'hidden',
  },
  quarterImage: {
    flex: 1,
    overflow: 'hidden',
  },
  thirdImage: {
    flex: 1,
    overflow: 'hidden',
  },
  moreOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counter: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  slideContainer: {
    width: SCREEN_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.7,
  },
  captionContainer: {
    padding: 16,
    width: '100%',
  },
  caption: {
    color: '#a0aec0',
    fontSize: 14,
    textAlign: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dotActive: {
    backgroundColor: '#d4af37',
    width: 24,
  },
  thumbnailList: {
    maxHeight: 80,
    paddingVertical: 10,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailActive: {
    borderColor: '#d4af37',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
});
