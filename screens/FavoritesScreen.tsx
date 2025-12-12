/**
 * FavoritesScreen - View and manage saved favorites
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet, View, Text, ScrollView, TouchableOpacity,
  RefreshControl, Alert, Image, ActivityIndicator, Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const C = {
  bg: '#0A122A',
  card: '#101C40',
  cardLight: '#1A2A50',
  gold: '#D4AF37',
  text: '#F5F5F5',
  textSec: '#A0AEC0',
  textMuted: '#5A6A8A',
  success: '#48BB78',
  error: '#FC8181',
};

const G = {
  dark: ['#0A122A', '#101C40', '#0A122A'],
  gold: ['#E8C547', '#D4AF37', '#B8952F'],
  overlay: ['transparent', 'rgba(10,18,42,0.7)', 'rgba(10,18,42,0.95)'],
};

const PLACEHOLDER = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80';

interface Favorite {
  _id: string;
  itemId: any;
  itemType: string;
  createdAt: string;
}

interface Props {
  onBack: () => void;
  onOpenDetail?: (item: any, type: string) => void;
}

export default function FavoritesScreen({ onBack, onOpenDetail }: Props) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const loadFavorites = useCallback(async () => {
    try {
      const response = await api.get('/users/favorites');
      setFavorites(response.data.favorites || []);
    } catch (err) {
      console.log('Error loading favorites:', err);
      // Demo data for testing
      setFavorites([
        {
          _id: '1',
          itemType: 'restaurant',
          itemId: {
            _id: 'r1',
            name: 'Ocean Pearl Fine Dining',
            cuisine: 'Seafood & International',
            priceRange: '$$$$',
            rating: 4.9,
            images: [{ url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80' }]
          },
          createdAt: new Date().toISOString()
        },
        {
          _id: '2',
          itemType: 'activity',
          itemId: {
            _id: 'a1',
            name: 'Reef Snorkeling Adventure',
            category: 'Water Sports',
            price: 150,
            rating: 4.8,
            images: [{ url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80' }]
          },
          createdAt: new Date().toISOString()
        },
        {
          _id: '3',
          itemType: 'lodging',
          itemId: {
            _id: 'l1',
            name: 'Presidential Overwater Villa',
            category: 'Villa',
            price: 2500,
            rating: 5.0,
            images: [{ url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80' }]
          },
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const onRefresh = () => {
    setRefreshing(true);
    loadFavorites();
  };

  const removeFavorite = (id: string, name: string) => {
    Alert.alert(
      'Remove Favorite',
      `Remove "${name}" from your favorites?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/users/favorites/${id}`);
              setFavorites(prev => prev.filter(f => f._id !== id));
            } catch (err) {
              // Remove locally anyway for demo
              setFavorites(prev => prev.filter(f => f._id !== id));
            }
          }
        }
      ]
    );
  };

  const getFilteredFavorites = () => {
    if (filter === 'all') return favorites;
    return favorites.filter(f => f.itemType === filter);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'restaurant': return 'restaurant';
      case 'activity': return 'compass';
      case 'lodging': return 'bed';
      case 'event': return 'calendar';
      case 'nightlife': return 'wine';
      default: return 'heart';
    }
  };

  const getCategories = () => {
    const types = [...new Set(favorites.map(f => f.itemType))];
    return ['all', ...types];
  };

  const filtered = getFilteredFavorites();

  const FavoriteCard = ({ favorite }: { favorite: Favorite }) => {
    const item = favorite.itemId;
    const [imageError, setImageError] = useState(false);
    const imageUrl = item?.images?.[0]?.url || item?.image || PLACEHOLDER;

    return (
      <TouchableOpacity 
        style={s.card}
        onPress={() => onOpenDetail?.(item, favorite.itemType)}
        activeOpacity={0.9}
      >
        <Image 
          source={{ uri: imageError ? PLACEHOLDER : imageUrl }}
          style={s.cardImage}
          onError={() => setImageError(true)}
        />
        <LinearGradient colors={G.overlay} style={s.cardOverlay} />
        
        {/* Remove Button */}
        <TouchableOpacity 
          style={s.removeBtn}
          onPress={() => removeFavorite(favorite._id, item?.name || 'Item')}
        >
          <Ionicons name="heart" size={20} color={C.error} />
        </TouchableOpacity>

        {/* Type Badge */}
        <View style={s.typeBadge}>
          <Ionicons name={getTypeIcon(favorite.itemType) as any} size={12} color={C.gold} />
        </View>

        <View style={s.cardContent}>
          <Text style={s.cardName} numberOfLines={2}>{item?.name || 'Unknown'}</Text>
          <Text style={s.cardCategory}>{item?.cuisine || item?.category || favorite.itemType}</Text>
          <View style={s.cardFooter}>
            {item?.priceRange && <Text style={s.cardPrice}>{item.priceRange}</Text>}
            {item?.price && <Text style={s.cardPrice}>${item.price}</Text>}
            {item?.rating && (
              <View style={s.ratingContainer}>
                <Ionicons name="star" size={12} color={C.gold} />
                <Text style={s.ratingText}>{item.rating}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={G.dark} style={s.container}>
      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={onBack} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color={C.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Favorites</Text>
        <View style={s.headerCount}>
          <Text style={s.headerCountText}>{favorites.length}</Text>
        </View>
      </View>

      {/* Filter Chips */}
      {favorites.length > 0 && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={s.filterContainer}
          contentContainerStyle={s.filterContent}
        >
          {getCategories().map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[s.filterChip, filter === cat && s.filterChipActive]}
              onPress={() => setFilter(cat)}
            >
              {cat !== 'all' && (
                <Ionicons 
                  name={getTypeIcon(cat) as any} 
                  size={14} 
                  color={filter === cat ? C.bg : C.textSec} 
                />
              )}
              <Text style={[s.filterChipText, filter === cat && s.filterChipTextActive]}>
                {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {loading ? (
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" color={C.gold} />
          <Text style={s.loadingText}>Loading favorites...</Text>
        </View>
      ) : (
        <ScrollView
          style={s.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.gold} />
          }
        >
          {filtered.length === 0 ? (
            <View style={s.emptyContainer}>
              <View style={s.emptyIcon}>
                <Ionicons name="heart-outline" size={48} color={C.textMuted} />
              </View>
              <Text style={s.emptyTitle}>No Favorites Yet</Text>
              <Text style={s.emptyText}>
                Start exploring and save your favorite restaurants, activities, and more!
              </Text>
              <TouchableOpacity style={s.exploreBtn} onPress={onBack}>
                <LinearGradient colors={G.gold} style={s.exploreBtnGradient}>
                  <Text style={s.exploreBtnText}>Explore Now</Text>
                  <Ionicons name="arrow-forward" size={18} color={C.bg} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={s.grid}>
              {filtered.map((favorite) => (
                <FavoriteCard key={favorite._id} favorite={favorite} />
              ))}
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.text,
  },
  headerCount: {
    minWidth: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.card,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  headerCountText: {
    fontSize: 14,
    fontWeight: '700',
    color: C.gold,
  },
  filterContainer: {
    maxHeight: 50,
    marginBottom: 8,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: C.card,
    gap: 6,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: C.gold,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.textSec,
  },
  filterChipTextActive: {
    color: C.bg,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: C.textSec,
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: C.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: C.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: C.textSec,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  exploreBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  exploreBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
  },
  exploreBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: C.bg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.3,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: C.card,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  removeBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '700',
    color: C.text,
    marginBottom: 2,
  },
  cardCategory: {
    fontSize: 12,
    color: C.textSec,
    marginBottom: 6,
    textTransform: 'capitalize',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: C.gold,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: C.text,
  },
});
