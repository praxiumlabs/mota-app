/**
 * Fleet Screen
 * PCH Exotic Fleet - Luxury Cars & Yachts
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity, FlatList, Image,
  ActivityIndicator, RefreshControl, Dimensions, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { C, G, PLACEHOLDER_IMAGE } from '../constants/theme';
import api from '../services/api';

const { width } = Dimensions.get('window');

interface FleetItem {
  _id: string;
  name: string;
  type: 'car' | 'yacht';
  make?: string;
  model?: string;
  year?: number;
  length?: string;
  capacity?: number;
  description: string;
  shortDescription: string;
  pricePerDay: number;
  pricePerHour: number;
  images: { url: string; isPrimary: boolean }[];
  specs: any;
  features: string[];
  isAvailable: boolean;
  isFeatured: boolean;
  accessLevel: string;
  investorTierRequired: string;
  rating: number;
}

interface Props {
  onBack: () => void;
}

export default function FleetScreen({ onBack }: Props) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'car' | 'yacht'>('car');
  const [fleet, setFleet] = useState<FleetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FleetItem | null>(null);

  const loadFleet = useCallback(async () => {
    try {
      const response = await api.get('/fleet');
      setFleet(response.data.fleet || []);
    } catch (err) {
      console.log('Error loading fleet:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadFleet();
  }, [loadFleet]);

  const filteredFleet = fleet.filter(item => item.type === activeTab);

  const canAccess = (item: FleetItem) => {
    if (item.accessLevel === 'all') return true;
    if (!user) return false;
    if (item.accessLevel === 'member' && (user.accessLevel === 'member' || user.accessLevel === 'investor')) return true;
    if (item.accessLevel === 'investor' && user.accessLevel === 'investor') {
      if (!item.investorTierRequired) return true;
      const tiers = ['gold', 'platinum', 'diamond'];
      const userTierIndex = tiers.indexOf(user.investorTier || '');
      const requiredTierIndex = tiers.indexOf(item.investorTierRequired);
      return userTierIndex >= requiredTierIndex;
    }
    return false;
  };

  const handleBook = (item: FleetItem) => {
    if (!canAccess(item)) {
      Alert.alert(
        'Access Required',
        `This ${item.type === 'car' ? 'vehicle' : 'yacht'} requires ${item.investorTierRequired || item.accessLevel} access. Upgrade your membership to book.`,
        [{ text: 'OK' }]
      );
      return;
    }
    Alert.alert(
      'Book ' + item.name,
      `Reserve this ${item.type === 'car' ? 'vehicle' : 'yacht'}?\n\nDaily Rate: $${item.pricePerDay.toLocaleString()}\nHourly Rate: $${item.pricePerHour.toLocaleString()}/hr`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Request Booking', onPress: () => {
          Alert.alert('Request Sent', 'Our concierge team will contact you shortly to confirm your booking.');
        }}
      ]
    );
  };

  const formatPrice = (price: number) => {
    return '$' + price.toLocaleString();
  };

  const getImageUrl = (item: FleetItem) => {
    const primary = item.images?.find(img => img.isPrimary);
    return primary?.url || item.images?.[0]?.url || PLACEHOLDER_IMAGE;
  };

  const renderItem = ({ item }: { item: FleetItem }) => {
    const accessible = canAccess(item);
    
    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => setSelectedItem(item)}
        activeOpacity={0.9}
      >
        <Image 
          source={{ uri: getImageUrl(item) }} 
          style={styles.cardImage}
          resizeMode="cover"
        />
        
        {/* Overlay */}
        <LinearGradient 
          colors={['transparent', 'rgba(0,0,0,0.8)']} 
          style={styles.cardOverlay}
        />
        
        {/* Featured Badge */}
        {item.isFeatured && (
          <View style={styles.featuredBadge}>
            <Ionicons name="star" size={12} color={C.bg} />
            <Text style={styles.featuredText}>Featured</Text>
          </View>
        )}
        
        {/* Lock Badge for restricted items */}
        {!accessible && (
          <View style={styles.lockBadge}>
            <Ionicons name="lock-closed" size={14} color={C.text} />
            <Text style={styles.lockText}>
              {item.investorTierRequired ? item.investorTierRequired.charAt(0).toUpperCase() + item.investorTierRequired.slice(1) : 'Investor'} Only
            </Text>
          </View>
        )}
        
        {/* Content */}
        <View style={styles.cardContent}>
          <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
          
          {item.type === 'car' ? (
            <Text style={styles.cardSpecs}>
              {item.year} • {item.specs?.horsepower}hp • {item.specs?.acceleration}
            </Text>
          ) : (
            <Text style={styles.cardSpecs}>
              {item.length} • {item.capacity} guests • {item.specs?.crew} crew
            </Text>
          )}
          
          <View style={styles.cardFooter}>
            <View>
              <Text style={styles.priceLabel}>From</Text>
              <Text style={styles.priceValue}>{formatPrice(item.pricePerDay)}/day</Text>
            </View>
            <View style={styles.ratingWrap}>
              <Ionicons name="star" size={14} color={C.gold} />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name={activeTab === 'car' ? 'car-sport-outline' : 'boat-outline'} size={60} color={C.textMuted} />
      <Text style={styles.emptyTitle}>No {activeTab === 'car' ? 'Vehicles' : 'Yachts'} Available</Text>
      <Text style={styles.emptySubtitle}>Check back soon for new additions to our fleet.</Text>
    </View>
  );

  const renderDetail = () => {
    if (!selectedItem) return null;
    const accessible = canAccess(selectedItem);
    
    return (
      <View style={[styles.detailContainer, { paddingTop: insets.top }]}>
        <Image 
          source={{ uri: getImageUrl(selectedItem) }} 
          style={styles.detailImage}
          resizeMode="cover"
        />
        <LinearGradient 
          colors={['rgba(0,0,0,0.3)', 'transparent', G.dark[1]]} 
          style={styles.detailImageOverlay}
        />
        
        {/* Close Button */}
        <TouchableOpacity 
          style={[styles.detailCloseBtn, { top: insets.top + 16 }]}
          onPress={() => setSelectedItem(null)}
        >
          <Ionicons name="close" size={24} color={C.text} />
        </TouchableOpacity>
        
        {/* Content */}
        <View style={styles.detailContent}>
          <View style={styles.detailHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.detailName}>{selectedItem.name}</Text>
              {selectedItem.type === 'car' ? (
                <Text style={styles.detailSubtitle}>
                  {selectedItem.year} {selectedItem.make} {selectedItem.model}
                </Text>
              ) : (
                <Text style={styles.detailSubtitle}>
                  {selectedItem.length} Luxury Yacht • {selectedItem.capacity} Guests
                </Text>
              )}
            </View>
            <View style={styles.detailRating}>
              <Ionicons name="star" size={18} color={C.gold} />
              <Text style={styles.detailRatingText}>{selectedItem.rating}</Text>
            </View>
          </View>
          
          <Text style={styles.detailDescription}>{selectedItem.description}</Text>
          
          {/* Specs */}
          <Text style={styles.detailSectionTitle}>Specifications</Text>
          <View style={styles.specsGrid}>
            {selectedItem.type === 'car' ? (
              <>
                <View style={styles.specItem}>
                  <Ionicons name="speedometer-outline" size={20} color={C.gold} />
                  <Text style={styles.specValue}>{selectedItem.specs?.horsepower}hp</Text>
                  <Text style={styles.specLabel}>Power</Text>
                </View>
                <View style={styles.specItem}>
                  <Ionicons name="timer-outline" size={20} color={C.gold} />
                  <Text style={styles.specValue}>{selectedItem.specs?.acceleration}</Text>
                  <Text style={styles.specLabel}>0-60 mph</Text>
                </View>
                <View style={styles.specItem}>
                  <Ionicons name="flash-outline" size={20} color={C.gold} />
                  <Text style={styles.specValue}>{selectedItem.specs?.topSpeed}</Text>
                  <Text style={styles.specLabel}>Top Speed</Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.specItem}>
                  <Ionicons name="resize-outline" size={20} color={C.gold} />
                  <Text style={styles.specValue}>{selectedItem.length}</Text>
                  <Text style={styles.specLabel}>Length</Text>
                </View>
                <View style={styles.specItem}>
                  <Ionicons name="people-outline" size={20} color={C.gold} />
                  <Text style={styles.specValue}>{selectedItem.capacity}</Text>
                  <Text style={styles.specLabel}>Guests</Text>
                </View>
                <View style={styles.specItem}>
                  <Ionicons name="bed-outline" size={20} color={C.gold} />
                  <Text style={styles.specValue}>{selectedItem.specs?.cabins}</Text>
                  <Text style={styles.specLabel}>Cabins</Text>
                </View>
              </>
            )}
          </View>
          
          {/* Features */}
          <Text style={styles.detailSectionTitle}>Features</Text>
          <View style={styles.featuresWrap}>
            {selectedItem.features?.map((feature, i) => (
              <View key={i} style={styles.featureTag}>
                <Ionicons name="checkmark" size={14} color={C.gold} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
          
          {/* Pricing */}
          <View style={styles.pricingCard}>
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Hourly Rate</Text>
              <Text style={styles.pricingValue}>{formatPrice(selectedItem.pricePerHour)}/hr</Text>
            </View>
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Daily Rate</Text>
              <Text style={styles.pricingValue}>{formatPrice(selectedItem.pricePerDay)}/day</Text>
            </View>
          </View>
          
          {/* Book Button */}
          <TouchableOpacity 
            onPress={() => handleBook(selectedItem)}
            activeOpacity={0.85}
            style={{ marginBottom: insets.bottom + 20 }}
          >
            <LinearGradient colors={accessible ? G.gold : [C.textMuted, C.textMuted]} style={styles.bookBtn}>
              {accessible ? (
                <>
                  <Text style={styles.bookBtnText}>Request Booking</Text>
                  <Ionicons name="arrow-forward" size={20} color={C.bg} style={{ marginLeft: 8 }} />
                </>
              ) : (
                <>
                  <Ionicons name="lock-closed" size={18} color={C.bg} style={{ marginRight: 8 }} />
                  <Text style={styles.bookBtnText}>Upgrade to Access</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <LinearGradient colors={G.dark} style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={C.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>PCH Exotic Fleet</Text>
          <Text style={styles.headerSubtitle}>Luxury Cars & Yachts</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'car' && styles.tabActive]}
          onPress={() => setActiveTab('car')}
        >
          <Ionicons name="car-sport" size={20} color={activeTab === 'car' ? C.gold : C.textMuted} />
          <Text style={[styles.tabText, activeTab === 'car' && styles.tabTextActive]}>Cars</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'yacht' && styles.tabActive]}
          onPress={() => setActiveTab('yacht')}
        >
          <Ionicons name="boat" size={20} color={activeTab === 'yacht' ? C.gold : C.textMuted} />
          <Text style={[styles.tabText, activeTab === 'yacht' && styles.tabTextActive]}>Yachts</Text>
        </TouchableOpacity>
      </View>

      {/* Fleet List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={C.gold} />
        </View>
      ) : (
        <FlatList
          data={filteredFleet}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          contentContainerStyle={[
            styles.listContent,
            filteredFleet.length === 0 && styles.listContentEmpty,
            { paddingBottom: insets.bottom + 20 }
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadFleet();
              }}
              tintColor={C.gold}
            />
          }
        />
      )}

      {/* Detail View */}
      {selectedItem && renderDetail()}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: C.textSec,
    marginTop: 2,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: C.card,
    marginHorizontal: 6,
  },
  tabActive: {
    backgroundColor: C.goldMuted,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: C.textMuted,
    marginLeft: 8,
  },
  tabTextActive: {
    color: C.gold,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
  },
  listContentEmpty: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    height: 260,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  featuredBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.gold,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  featuredText: {
    fontSize: 12,
    fontWeight: '600',
    color: C.bg,
    marginLeft: 4,
  },
  lockBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  lockText: {
    fontSize: 11,
    fontWeight: '600',
    color: C.text,
    marginLeft: 4,
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  cardName: {
    fontSize: 20,
    fontWeight: '700',
    color: C.text,
    marginBottom: 4,
  },
  cardSpecs: {
    fontSize: 13,
    color: C.textSec,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  priceLabel: {
    fontSize: 11,
    color: C.textMuted,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: C.gold,
  },
  ratingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.text,
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: C.text,
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: C.textSec,
    textAlign: 'center',
  },
  // Detail View
  detailContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: C.bg,
  },
  detailImage: {
    width: '100%',
    height: 280,
  },
  detailImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    height: 280,
  },
  detailCloseBtn: {
    position: 'absolute',
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailContent: {
    flex: 1,
    marginTop: -40,
    backgroundColor: C.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailName: {
    fontSize: 24,
    fontWeight: '700',
    color: C.text,
  },
  detailSubtitle: {
    fontSize: 14,
    color: C.textSec,
    marginTop: 4,
  },
  detailRating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.goldMuted,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  detailRatingText: {
    fontSize: 16,
    fontWeight: '700',
    color: C.gold,
    marginLeft: 4,
  },
  detailDescription: {
    fontSize: 14,
    color: C.textSec,
    lineHeight: 22,
    marginBottom: 24,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
    marginBottom: 14,
  },
  specsGrid: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  specItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: C.card,
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 4,
  },
  specValue: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
    marginTop: 8,
  },
  specLabel: {
    fontSize: 11,
    color: C.textMuted,
    marginTop: 2,
  },
  featuresWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  featureTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 12,
    color: C.text,
    marginLeft: 6,
  },
  pricingCard: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  pricingLabel: {
    fontSize: 14,
    color: C.textSec,
  },
  pricingValue: {
    fontSize: 18,
    fontWeight: '700',
    color: C.gold,
  },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 14,
  },
  bookBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: C.bg,
  },
});
