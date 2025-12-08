/**
 * MOTA - Premium Casino Resort App
 * Connected to Backend API
 * All screens complete and working
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

// Import components
import { AuthProvider, useAuth } from './context/AuthContext';
import BottomSheet from './components/BottomSheet';
import AuthModal from './components/AuthModal';
import { 
  ExclusiveBadge, 
  SpotsLeft, 
  VIPOnlyOverlay,
  PriceDisplay,
} from './components/FomoComponents';
import InvestorScreen from './screens/InvestorScreen';
import ProfileScreen from './screens/ProfileScreen';

// Import API service
import api from './services/api';

const { width } = Dimensions.get('window');

// Colors
const Colors = {
  deepNavy: '#0A122A',
  cardDark: '#0D1729',
  cardElevated: '#162038',
  gold: '#D4AF37',
  goldDark: '#B8960C',
  goldSubtle: 'rgba(212, 175, 55, 0.12)',
  white: '#FFFFFF',
  softGrey: '#A0A8B8',
  mutedGrey: '#6B7280',
  success: '#10B981',
  error: '#EF4444',
  blue: '#60A5FA',
};

// ============================================
// TYPES
// ============================================

interface Restaurant {
  _id: string;
  name: string;
  category: string;
  description?: string;
  image: string;
  rating: number;
  priceRange?: string;
  regularPrice: number;
  memberPrice?: number;
  platinumPrice?: number;
  diamondPrice?: number;
  openHours?: string;
  location?: string;
  address?: string;
  phone?: string;
  cuisine?: string[];
  amenities?: string[];
  isFeatured?: boolean;
  isActive?: boolean;
}

interface Activity {
  _id: string;
  name: string;
  category: string;
  description?: string;
  image: string;
  rating: number;
  duration?: string;
  difficulty?: string;
  regularPrice: number;
  memberPrice?: number;
  platinumPrice?: number;
  diamondPrice?: number;
  included?: string[];
  requirements?: string[];
  maxParticipants?: number;
  isFeatured?: boolean;
}

interface Event {
  _id: string;
  name: string;
  description?: string;
  image: string;
  date: string;
  endDate?: string;
  time?: string;
  venue?: string;
  address?: string;
  regularPrice?: number;
  memberPrice?: number;
  vipPrice?: number;
  capacity?: number;
  registeredCount?: number;
  isVipOnly?: boolean;
  investorTierRequired?: string;
  isFeatured?: boolean;
}

interface Offer {
  _id: string;
  title: string;
  description?: string;
  image?: string;
  type: string;
  discountPercent?: number;
  discountAmount?: number;
  freeAddon?: string;
  code?: string;
  validFrom?: string;
  validUntil?: string;
  minTier?: string;
}

// ============================================
// HOME SCREEN COMPONENT
// ============================================

function HomeScreen({ 
  onShowAuth,
  onNavigate,
}: { 
  onShowAuth: () => void;
  onNavigate: (tab: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const { user, isInvestor, getDiscountPercent } = useAuth();
  
  // Data state
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  
  // Loading state
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Detail modals
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const isLoggedIn = !!user;
  const discountPercent = getDiscountPercent();

  // Fetch data from API
  const fetchData = useCallback(async () => {
    try {
      setError(null);
      
      const [restaurantsData, activitiesData, eventsData, offersData] = await Promise.all([
        api.getRestaurants().catch(() => []),
        api.getActivities().catch(() => []),
        api.getEvents().catch(() => []),
        api.getOffers().catch(() => []),
      ]);
      
      setRestaurants(restaurantsData || []);
      setActivities(activitiesData || []);
      setEvents(eventsData || []);
      setOffers(offersData || []);
      
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError('Unable to connect to server.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  // Get price based on user's tier
  const getPriceForTier = useCallback((item: Restaurant | Activity) => {
    if (!isLoggedIn) return item.regularPrice;
    
    if (isInvestor && user?.investorTier) {
      switch (user.investorTier) {
        case 'diamond':
        case 'black':
        case 'founders':
          return item.diamondPrice || Math.round(item.regularPrice * 0.75);
        case 'platinum':
          return item.platinumPrice || Math.round(item.regularPrice * 0.85);
        case 'gold':
          return item.memberPrice || Math.round(item.regularPrice * 0.9);
      }
    }
    
    return item.memberPrice || Math.round(item.regularPrice * 0.9);
  }, [isLoggedIn, isInvestor, user?.investorTier]);

  // Render loading screen
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={['#0a0a0a', '#1a1a2e']} style={StyleSheet.absoluteFill} />
        <ActivityIndicator size="large" color={Colors.gold} />
        <Text style={styles.loadingText}>Loading MOTA...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0a0a0a', '#1a1a2e', '#0a0a0a']} style={StyleSheet.absoluteFill} />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 10, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.gold} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              {isLoggedIn ? `Welcome back, ${user?.name?.split(' ')[0]}` : 'Welcome to'}
            </Text>
            <Text style={styles.logo}>MOTA</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => isLoggedIn ? onNavigate('profile') : onShowAuth()}
          >
            {isLoggedIn ? (
              <LinearGradient colors={[Colors.gold, Colors.goldDark]} style={styles.profileGradient}>
                <Text style={styles.profileInitial}>{user?.name?.[0] || 'U'}</Text>
              </LinearGradient>
            ) : (
              <Ionicons name="person-circle-outline" size={40} color={Colors.gold} />
            )}
          </TouchableOpacity>
        </View>

        {/* Error Banner */}
        {error && (
          <TouchableOpacity style={styles.errorBanner} onPress={fetchData}>
            <Ionicons name="warning" size={20} color="#fff" />
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.retryText}>Tap to retry</Text>
          </TouchableOpacity>
        )}

        {/* Investor Tier Badge */}
        {isLoggedIn && isInvestor && user?.investorTier && (
          <TouchableOpacity 
            style={styles.tierBadgeContainer}
            onPress={() => onNavigate('invest')}
          >
            <LinearGradient
              colors={
                user.investorTier === 'founders' ? ['#E5E4E2', '#C0C0C0'] :
                user.investorTier === 'black' ? ['#000000', '#333333'] :
                user.investorTier === 'diamond' ? ['#B9F2FF', '#E0FFFF'] :
                user.investorTier === 'platinum' ? ['#E5E4E2', '#C9C9C9'] :
                [Colors.gold, Colors.goldDark]
              }
              style={styles.tierBadge}
            >
              <Ionicons 
                name={user.investorTier === 'founders' ? 'star' : 'diamond'} 
                size={16} 
                color={user.investorTier === 'diamond' || user.investorTier === 'platinum' ? '#0a0a0a' : '#fff'} 
              />
              <Text style={[
                styles.tierText,
                (user.investorTier === 'diamond' || user.investorTier === 'platinum') && { color: '#0a0a0a' }
              ]}>
                {user.investorTier.charAt(0).toUpperCase() + user.investorTier.slice(1)} Investor • {discountPercent}% off
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Member Badge */}
        {isLoggedIn && !isInvestor && (
          <View style={styles.memberBadgeContainer}>
            <View style={styles.memberBadge}>
              <Ionicons name="star" size={14} color={Colors.blue} />
              <Text style={styles.memberBadgeText}>Member • 10% off all bookings</Text>
            </View>
          </View>
        )}

        {/* Active Offers */}
        {offers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎁 Special Offers</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
              {offers.map((offer) => (
                <TouchableOpacity key={offer._id} style={styles.offerCard}>
                  <LinearGradient colors={[Colors.gold, Colors.goldDark]} style={styles.offerGradient}>
                    <View style={styles.offerHeader}>
                      <Text style={styles.offerTitle}>{offer.title}</Text>
                      {offer.discountPercent && (
                        <View style={styles.offerBadge}>
                          <Text style={styles.offerBadgeText}>{offer.discountPercent}% OFF</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.offerDescription}>{offer.description}</Text>
                    {offer.code && (
                      <View style={styles.offerCodeContainer}>
                        <Text style={styles.offerCode}>Code: {offer.code}</Text>
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity style={styles.quickAction} onPress={() => onNavigate('explore')}>
            <LinearGradient colors={[Colors.cardElevated, Colors.cardDark]} style={styles.quickActionGradient}>
              <Ionicons name="restaurant" size={24} color={Colors.gold} />
              <Text style={styles.quickActionText}>Dining</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={() => onNavigate('explore')}>
            <LinearGradient colors={[Colors.cardElevated, Colors.cardDark]} style={styles.quickActionGradient}>
              <Ionicons name="water" size={24} color={Colors.gold} />
              <Text style={styles.quickActionText}>Activities</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={() => onNavigate('explore')}>
            <LinearGradient colors={[Colors.cardElevated, Colors.cardDark]} style={styles.quickActionGradient}>
              <Ionicons name="calendar" size={24} color={Colors.gold} />
              <Text style={styles.quickActionText}>Events</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={() => onNavigate('invest')}>
            <LinearGradient colors={[Colors.cardElevated, Colors.cardDark]} style={styles.quickActionGradient}>
              <Ionicons name="trending-up" size={24} color={Colors.gold} />
              <Text style={styles.quickActionText}>Invest</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Featured Restaurants */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🍽️ Restaurants</Text>
            <TouchableOpacity onPress={() => onNavigate('explore')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {restaurants.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="restaurant-outline" size={40} color={Colors.mutedGrey} />
              <Text style={styles.emptyText}>No restaurants available</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
              {restaurants.map((restaurant) => (
                <TouchableOpacity 
                  key={restaurant._id} 
                  style={styles.card}
                  onPress={() => setSelectedRestaurant(restaurant)}
                >
                  <Image source={{ uri: restaurant.image }} style={styles.cardImage} />
                  <LinearGradient 
                    colors={['transparent', 'rgba(0,0,0,0.9)']} 
                    style={styles.cardGradient}
                  >
                    {restaurant.isFeatured && <ExclusiveBadge />}
                    <View style={styles.cardContent}>
                      <Text style={styles.cardTitle} numberOfLines={1}>{restaurant.name}</Text>
                      <Text style={styles.cardSubtitle}>{restaurant.category}</Text>
                      <View style={styles.cardFooter}>
                        <View style={styles.ratingContainer}>
                          <Ionicons name="star" size={14} color={Colors.gold} />
                          <Text style={styles.rating}>{restaurant.rating}</Text>
                        </View>
                        <PriceDisplay 
                          originalPrice={restaurant.regularPrice}
                          discountedPrice={getPriceForTier(restaurant)}
                        />
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Activities */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🏄 Activities</Text>
            <TouchableOpacity onPress={() => onNavigate('explore')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {activities.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="boat-outline" size={40} color={Colors.mutedGrey} />
              <Text style={styles.emptyText}>No activities available</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
              {activities.map((activity) => (
                <TouchableOpacity 
                  key={activity._id} 
                  style={styles.card}
                  onPress={() => setSelectedActivity(activity)}
                >
                  <Image source={{ uri: activity.image }} style={styles.cardImage} />
                  <LinearGradient 
                    colors={['transparent', 'rgba(0,0,0,0.9)']} 
                    style={styles.cardGradient}
                  >
                    {activity.isFeatured && <ExclusiveBadge />}
                    <View style={styles.cardContent}>
                      <Text style={styles.cardTitle} numberOfLines={1}>{activity.name}</Text>
                      <Text style={styles.cardSubtitle}>{activity.duration || activity.category}</Text>
                      <View style={styles.cardFooter}>
                        <View style={styles.ratingContainer}>
                          <Ionicons name="star" size={14} color={Colors.gold} />
                          <Text style={styles.rating}>{activity.rating}</Text>
                        </View>
                        <PriceDisplay 
                          originalPrice={activity.regularPrice}
                          discountedPrice={getPriceForTier(activity)}
                        />
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Upcoming Events */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🎉 Upcoming Events</Text>
            <TouchableOpacity onPress={() => onNavigate('explore')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {events.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="calendar-outline" size={40} color={Colors.mutedGrey} />
              <Text style={styles.emptyText}>No upcoming events</Text>
            </View>
          ) : (
            events.slice(0, 3).map((event) => (
              <TouchableOpacity 
                key={event._id} 
                style={styles.eventCard}
                onPress={() => setSelectedEvent(event)}
              >
                <Image source={{ uri: event.image }} style={styles.eventImage} />
                <LinearGradient 
                  colors={['transparent', 'rgba(0,0,0,0.95)']} 
                  style={styles.eventGradient}
                >
                  {event.isVipOnly && <VIPOnlyOverlay tierRequired={event.investorTierRequired} />}
                  <View style={styles.eventContent}>
                    <View style={styles.eventDateBadge}>
                      <Text style={styles.eventDateDay}>
                        {new Date(event.date).getDate()}
                      </Text>
                      <Text style={styles.eventDateMonth}>
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                      </Text>
                    </View>
                    <View style={styles.eventInfo}>
                      <Text style={styles.eventTitle}>{event.name}</Text>
                      <View style={styles.eventMeta}>
                        <Ionicons name="location" size={14} color={Colors.softGrey} />
                        <Text style={styles.eventVenue}>{event.venue}</Text>
                      </View>
                      {event.capacity && (
                        <SpotsLeft current={event.registeredCount || 0} total={event.capacity} />
                      )}
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* CTA for non-members */}
        {!isLoggedIn && (
          <TouchableOpacity 
            style={styles.ctaContainer}
            onPress={onShowAuth}
          >
            <LinearGradient colors={[Colors.gold, Colors.goldDark]} style={styles.ctaGradient}>
              <MaterialCommunityIcons name="diamond-stone" size={32} color="#0a0a0a" />
              <Text style={styles.ctaTitle}>Join MOTA Today</Text>
              <Text style={styles.ctaSubtitle}>Unlock exclusive benefits and discounts</Text>
              <View style={styles.ctaButton}>
                <Text style={styles.ctaButtonText}>Get Started Free</Text>
                <Ionicons name="arrow-forward" size={20} color={Colors.gold} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Become Investor CTA for members */}
        {isLoggedIn && !isInvestor && (
          <TouchableOpacity 
            style={styles.investorCta}
            onPress={() => onNavigate('invest')}
          >
            <LinearGradient colors={[Colors.cardElevated, Colors.cardDark]} style={styles.investorCtaGradient}>
              <View style={styles.investorCtaContent}>
                <MaterialCommunityIcons name="diamond-stone" size={40} color={Colors.gold} />
                <View style={styles.investorCtaText}>
                  <Text style={styles.investorCtaTitle}>Become an Investor</Text>
                  <Text style={styles.investorCtaSubtitle}>Up to 50% off + exclusive VIP perks</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color={Colors.gold} />
            </LinearGradient>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Restaurant Detail Modal */}
      <BottomSheet 
        isVisible={!!selectedRestaurant} 
        onClose={() => setSelectedRestaurant(null)}
      >
        {selectedRestaurant && (
          <ScrollView style={styles.detailContent} showsVerticalScrollIndicator={false}>
            <Image source={{ uri: selectedRestaurant.image }} style={styles.detailImage} />
            <Text style={styles.detailTitle}>{selectedRestaurant.name}</Text>
            <Text style={styles.detailCategory}>{selectedRestaurant.category}</Text>
            <Text style={styles.detailDescription}>{selectedRestaurant.description}</Text>
            
            <View style={styles.detailInfo}>
              <View style={styles.detailRow}>
                <Ionicons name="star" size={18} color={Colors.gold} />
                <Text style={styles.detailText}>{selectedRestaurant.rating} Rating</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="time" size={18} color={Colors.gold} />
                <Text style={styles.detailText}>{selectedRestaurant.openHours || 'Hours vary'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="location" size={18} color={Colors.gold} />
                <Text style={styles.detailText}>{selectedRestaurant.location || 'See map'}</Text>
              </View>
            </View>

            <View style={styles.priceSection}>
              <Text style={styles.priceLabel}>Your Price:</Text>
              <PriceDisplay 
                originalPrice={selectedRestaurant.regularPrice}
                discountedPrice={getPriceForTier(selectedRestaurant)}
              />
            </View>

            <TouchableOpacity style={styles.bookButton}>
              <LinearGradient colors={[Colors.gold, Colors.goldDark]} style={styles.bookButtonGradient}>
                <Text style={styles.bookButtonText}>Reserve Table</Text>
              </LinearGradient>
            </TouchableOpacity>
            <View style={{ height: 30 }} />
          </ScrollView>
        )}
      </BottomSheet>

      {/* Activity Detail Modal */}
      <BottomSheet 
        isVisible={!!selectedActivity} 
        onClose={() => setSelectedActivity(null)}
      >
        {selectedActivity && (
          <ScrollView style={styles.detailContent} showsVerticalScrollIndicator={false}>
            <Image source={{ uri: selectedActivity.image }} style={styles.detailImage} />
            <Text style={styles.detailTitle}>{selectedActivity.name}</Text>
            <Text style={styles.detailCategory}>{selectedActivity.category}</Text>
            <Text style={styles.detailDescription}>{selectedActivity.description}</Text>
            
            <View style={styles.detailInfo}>
              <View style={styles.detailRow}>
                <Ionicons name="time" size={18} color={Colors.gold} />
                <Text style={styles.detailText}>{selectedActivity.duration || 'Duration varies'}</Text>
              </View>
            </View>

            {selectedActivity.included && selectedActivity.included.length > 0 && (
              <View style={styles.includedSection}>
                <Text style={styles.includedTitle}>What's Included:</Text>
                {selectedActivity.included.map((item, index) => (
                  <View key={index} style={styles.includedItem}>
                    <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                    <Text style={styles.includedText}>{item}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.priceSection}>
              <Text style={styles.priceLabel}>Your Price:</Text>
              <PriceDisplay 
                originalPrice={selectedActivity.regularPrice}
                discountedPrice={getPriceForTier(selectedActivity)}
              />
            </View>

            <TouchableOpacity style={styles.bookButton}>
              <LinearGradient colors={[Colors.gold, Colors.goldDark]} style={styles.bookButtonGradient}>
                <Text style={styles.bookButtonText}>Book Now</Text>
              </LinearGradient>
            </TouchableOpacity>
            <View style={{ height: 30 }} />
          </ScrollView>
        )}
      </BottomSheet>

      {/* Event Detail Modal */}
      <BottomSheet 
        isVisible={!!selectedEvent} 
        onClose={() => setSelectedEvent(null)}
      >
        {selectedEvent && (
          <ScrollView style={styles.detailContent} showsVerticalScrollIndicator={false}>
            <Image source={{ uri: selectedEvent.image }} style={styles.detailImage} />
            <Text style={styles.detailTitle}>{selectedEvent.name}</Text>
            <Text style={styles.detailCategory}>{selectedEvent.venue}</Text>
            <Text style={styles.detailDescription}>{selectedEvent.description}</Text>
            
            <View style={styles.detailInfo}>
              <View style={styles.detailRow}>
                <Ionicons name="calendar" size={18} color={Colors.gold} />
                <Text style={styles.detailText}>
                  {new Date(selectedEvent.date).toLocaleDateString('en-US', { 
                    weekday: 'long',
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </Text>
              </View>
              {selectedEvent.capacity && (
                <View style={styles.detailRow}>
                  <Ionicons name="people" size={18} color={Colors.gold} />
                  <Text style={styles.detailText}>
                    {selectedEvent.capacity - (selectedEvent.registeredCount || 0)} spots remaining
                  </Text>
                </View>
              )}
            </View>

            {selectedEvent.isVipOnly && (
              <View style={styles.vipNotice}>
                <Ionicons name="diamond" size={20} color={Colors.gold} />
                <Text style={styles.vipNoticeText}>
                  This event is exclusive to {selectedEvent.investorTierRequired || 'VIP'} members
                </Text>
              </View>
            )}

            <TouchableOpacity style={styles.bookButton}>
              <LinearGradient colors={[Colors.gold, Colors.goldDark]} style={styles.bookButtonGradient}>
                <Text style={styles.bookButtonText}>RSVP Now</Text>
              </LinearGradient>
            </TouchableOpacity>
            <View style={{ height: 30 }} />
          </ScrollView>
        )}
      </BottomSheet>
    </View>
  );
}

// ============================================
// EXPLORE SCREEN
// ============================================

function ExploreScreen({ onShowAuth }: { onShowAuth: () => void }) {
  const insets = useSafeAreaInsets();
  const { user, isInvestor } = useAuth();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const isLoggedIn = !!user;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [r, a, e] = await Promise.all([
        api.getRestaurants().catch(() => []),
        api.getActivities().catch(() => []),
        api.getEvents().catch(() => []),
      ]);
      setRestaurants(r || []);
      setActivities(a || []);
      setEvents(e || []);
    } finally {
      setLoading(false);
    }
  };

  const getPriceForTier = (item: Restaurant | Activity) => {
    if (!isLoggedIn) return item.regularPrice;
    if (isInvestor && user?.investorTier) {
      switch (user.investorTier) {
        case 'diamond':
        case 'black':
        case 'founders':
          return item.diamondPrice || Math.round(item.regularPrice * 0.75);
        case 'platinum':
          return item.platinumPrice || Math.round(item.regularPrice * 0.85);
        case 'gold':
          return item.memberPrice || Math.round(item.regularPrice * 0.9);
      }
    }
    return item.memberPrice || Math.round(item.regularPrice * 0.9);
  };

  const categories = [
    { id: 'all', label: 'All', icon: 'apps' },
    { id: 'restaurants', label: 'Dining', icon: 'restaurant' },
    { id: 'activities', label: 'Activities', icon: 'water' },
    { id: 'events', label: 'Events', icon: 'calendar' },
  ];

  const filteredItems = () => {
    let items: any[] = [];
    
    if (activeCategory === 'all' || activeCategory === 'restaurants') {
      items = [...items, ...restaurants.map(r => ({ ...r, type: 'restaurant' }))];
    }
    if (activeCategory === 'all' || activeCategory === 'activities') {
      items = [...items, ...activities.map(a => ({ ...a, type: 'activity' }))];
    }
    if (activeCategory === 'all' || activeCategory === 'events') {
      items = [...items, ...events.map(e => ({ ...e, type: 'event' }))];
    }

    if (searchQuery) {
      items = items.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.venue?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return items;
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={Colors.gold} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#0a0a0a', '#1a1a2e', '#0a0a0a']} style={StyleSheet.absoluteFill} />
      
      {/* Header */}
      <View style={styles.exploreHeader}>
        <Text style={styles.exploreTitle}>Explore</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.mutedGrey} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search restaurants, activities..."
          placeholderTextColor={Colors.mutedGrey}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={Colors.mutedGrey} />
          </TouchableOpacity>
        )}
      </View>

      {/* Categories */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.categoriesContainer}
        contentContainerStyle={{ paddingHorizontal: 20 }}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryChip,
              activeCategory === cat.id && styles.categoryChipActive
            ]}
            onPress={() => setActiveCategory(cat.id)}
          >
            <Ionicons 
              name={cat.icon as any} 
              size={18} 
              color={activeCategory === cat.id ? '#0a0a0a' : Colors.softGrey} 
            />
            <Text style={[
              styles.categoryChipText,
              activeCategory === cat.id && styles.categoryChipTextActive
            ]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results */}
      <FlatList
        data={filteredItems()}
        keyExtractor={(item) => `${item.type}-${item._id}`}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.exploreCard}>
            <Image source={{ uri: item.image }} style={styles.exploreCardImage} />
            <View style={styles.exploreCardContent}>
              <View style={styles.exploreCardBadge}>
                <Text style={styles.exploreCardBadgeText}>
                  {item.type === 'restaurant' ? '🍽️' : item.type === 'activity' ? '🏄' : '🎉'}
                </Text>
              </View>
              <Text style={styles.exploreCardTitle} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.exploreCardSubtitle} numberOfLines={1}>
                {item.category || item.venue || ''}
              </Text>
              <View style={styles.exploreCardFooter}>
                {item.rating && (
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={12} color={Colors.gold} />
                    <Text style={styles.ratingSmall}>{item.rating}</Text>
                  </View>
                )}
                {item.regularPrice && (
                  <PriceDisplay 
                    originalPrice={item.regularPrice}
                    discountedPrice={getPriceForTier(item)}
                  />
                )}
                {item.date && (
                  <Text style={styles.eventDateSmall}>
                    {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={60} color={Colors.mutedGrey} />
            <Text style={styles.emptyStateText}>No results found</Text>
            <Text style={styles.emptyStateSubtext}>Try a different search or category</Text>
          </View>
        )}
      />
    </View>
  );
}

// ============================================
// MAIN APP CONTENT
// ============================================

function MainApp() {
  const [activeTab, setActiveTab] = useState('home');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const insets = useSafeAreaInsets();

  const handleShowAuth = () => {
    setShowAuthModal(true);
  };

  const handleCloseAuth = () => {
    setShowAuthModal(false);
  };

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
  };

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'invest':
        return <InvestorScreen />;
      case 'profile':
        return <ProfileScreen onShowAuthModal={handleShowAuth} />;
      case 'explore':
        return <ExploreScreen onShowAuth={handleShowAuth} />;
      default:
        return <HomeScreen onShowAuth={handleShowAuth} onNavigate={handleNavigate} />;
    }
  };

  return (
    <View style={styles.container}>
      {renderContent()}
      
      {/* Navigation Bar */}
      <View style={[styles.navBar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('home')}>
          <Ionicons 
            name={activeTab === 'home' ? 'home' : 'home-outline'} 
            size={24} 
            color={activeTab === 'home' ? Colors.gold : Colors.mutedGrey} 
          />
          <Text style={[styles.navLabel, activeTab === 'home' && styles.navLabelActive]}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('explore')}>
          <Ionicons 
            name={activeTab === 'explore' ? 'compass' : 'compass-outline'} 
            size={24} 
            color={activeTab === 'explore' ? Colors.gold : Colors.mutedGrey} 
          />
          <Text style={[styles.navLabel, activeTab === 'explore' && styles.navLabelActive]}>Explore</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('invest')}>
          <Ionicons 
            name={activeTab === 'invest' ? 'trending-up' : 'trending-up-outline'} 
            size={24} 
            color={activeTab === 'invest' ? Colors.gold : Colors.mutedGrey} 
          />
          <Text style={[styles.navLabel, activeTab === 'invest' && styles.navLabelActive]}>Invest</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('profile')}>
          <Ionicons 
            name={activeTab === 'profile' ? 'person' : 'person-outline'} 
            size={24} 
            color={activeTab === 'profile' ? Colors.gold : Colors.mutedGrey} 
          />
          <Text style={[styles.navLabel, activeTab === 'profile' && styles.navLabelActive]}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Auth Modal */}
      <BottomSheet 
        isVisible={showAuthModal} 
        onClose={handleCloseAuth}
      >
        <AuthModal onClose={handleCloseAuth} />
      </BottomSheet>
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },
  loadingText: {
    color: Colors.gold,
    marginTop: 16,
    fontSize: 16,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  greeting: {
    color: Colors.softGrey,
    fontSize: 14,
  },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.gold,
    letterSpacing: 8,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  profileGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    color: '#0a0a0a',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Error Banner
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  errorText: {
    color: '#fff',
    marginLeft: 10,
    flex: 1,
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  // Badges
  tierBadgeContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    alignSelf: 'flex-start',
  },
  tierText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 13,
  },
  memberBadgeContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(96, 165, 250, 0.15)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    alignSelf: 'flex-start',
  },
  memberBadgeText: {
    color: Colors.blue,
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 13,
  },

  // Sections
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    paddingHorizontal: 20,
  },
  seeAll: {
    color: Colors.gold,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: Colors.cardElevated,
    marginHorizontal: 20,
    padding: 40,
    borderRadius: 15,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.mutedGrey,
    marginTop: 12,
    fontSize: 14,
  },

  // Quick Actions
  quickActionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 25,
    gap: 10,
  },
  quickAction: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  quickActionGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    borderRadius: 12,
  },
  quickActionText: {
    color: Colors.softGrey,
    fontSize: 11,
    marginTop: 6,
  },

  // Offer Cards
  offerCard: {
    width: width * 0.8,
    marginLeft: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  offerGradient: {
    padding: 20,
  },
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  offerTitle: {
    color: '#0a0a0a',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  offerBadge: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  offerBadgeText: {
    color: '#0a0a0a',
    fontWeight: 'bold',
    fontSize: 12,
  },
  offerDescription: {
    color: '#0a0a0a',
    opacity: 0.8,
    marginTop: 8,
    fontSize: 14,
  },
  offerCodeContainer: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  offerCode: {
    color: '#0a0a0a',
    fontWeight: 'bold',
    fontSize: 13,
  },

  // Cards
  card: {
    width: width * 0.6,
    height: 220,
    marginLeft: 20,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.cardDark,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  cardGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 15,
  },
  cardContent: {},
  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardSubtitle: {
    color: Colors.softGrey,
    fontSize: 13,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    color: Colors.gold,
    marginLeft: 4,
    fontWeight: '600',
  },

  // Event Cards
  eventCard: {
    marginHorizontal: 20,
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  eventImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  eventGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 15,
  },
  eventContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventDateBadge: {
    backgroundColor: Colors.gold,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    marginRight: 15,
  },
  eventDateDay: {
    color: '#0a0a0a',
    fontSize: 20,
    fontWeight: 'bold',
  },
  eventDateMonth: {
    color: '#0a0a0a',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  eventVenue: {
    color: Colors.softGrey,
    fontSize: 13,
    marginLeft: 4,
  },

  // CTAs
  ctaContainer: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  ctaGradient: {
    padding: 30,
    alignItems: 'center',
  },
  ctaTitle: {
    color: '#0a0a0a',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 12,
  },
  ctaSubtitle: {
    color: '#0a0a0a',
    opacity: 0.8,
    marginTop: 8,
    textAlign: 'center',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginTop: 20,
  },
  ctaButtonText: {
    color: Colors.gold,
    fontWeight: '600',
    marginRight: 8,
  },
  investorCta: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  investorCtaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  investorCtaContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  investorCtaText: {
    marginLeft: 15,
  },
  investorCtaTitle: {
    color: Colors.gold,
    fontSize: 16,
    fontWeight: 'bold',
  },
  investorCtaSubtitle: {
    color: Colors.softGrey,
    fontSize: 13,
    marginTop: 2,
  },

  // Nav Bar
  navBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingTop: 10,
    backgroundColor: 'rgba(10, 10, 10, 0.98)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
  },
  navLabel: {
    color: Colors.mutedGrey,
    fontSize: 11,
    marginTop: 4,
  },
  navLabelActive: {
    color: Colors.gold,
  },

  // Detail Modal
  detailContent: {
    padding: 20,
  },
  detailImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginBottom: 20,
  },
  detailTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  detailCategory: {
    color: Colors.gold,
    fontSize: 15,
    marginTop: 5,
    fontWeight: '500',
  },
  detailDescription: {
    color: Colors.softGrey,
    fontSize: 14,
    marginTop: 12,
    lineHeight: 22,
  },
  detailInfo: {
    marginTop: 20,
    backgroundColor: Colors.cardElevated,
    borderRadius: 12,
    padding: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    color: '#fff',
    marginLeft: 12,
    fontSize: 14,
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  priceLabel: {
    color: Colors.softGrey,
    fontSize: 16,
  },
  includedSection: {
    marginTop: 20,
  },
  includedTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  includedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  includedText: {
    color: Colors.softGrey,
    marginLeft: 10,
    fontSize: 14,
  },
  vipNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderRadius: 12,
    padding: 15,
    marginTop: 20,
  },
  vipNoticeText: {
    color: Colors.gold,
    marginLeft: 10,
    fontSize: 13,
    flex: 1,
  },
  bookButton: {
    marginTop: 25,
    borderRadius: 30,
    overflow: 'hidden',
  },
  bookButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#0a0a0a',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Explore Screen
  exploreHeader: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  exploreTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardElevated,
    marginHorizontal: 20,
    paddingHorizontal: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    color: '#fff',
    fontSize: 15,
  },
  categoriesContainer: {
    marginBottom: 10,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardElevated,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    marginRight: 10,
  },
  categoryChipActive: {
    backgroundColor: Colors.gold,
  },
  categoryChipText: {
    color: Colors.softGrey,
    marginLeft: 8,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#0a0a0a',
  },
  exploreCard: {
    flexDirection: 'row',
    backgroundColor: Colors.cardElevated,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  exploreCardImage: {
    width: 100,
    height: 100,
  },
  exploreCardContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  exploreCardBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  exploreCardBadgeText: {
    fontSize: 14,
  },
  exploreCardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  exploreCardSubtitle: {
    color: Colors.softGrey,
    fontSize: 13,
    marginTop: 2,
  },
  exploreCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 15,
  },
  ratingSmall: {
    color: Colors.gold,
    fontSize: 12,
    marginLeft: 4,
  },
  eventDateSmall: {
    color: Colors.gold,
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
  },
  emptyStateSubtext: {
    color: Colors.mutedGrey,
    fontSize: 14,
    marginTop: 5,
  },
});

// ============================================
// APP WRAPPER
// ============================================

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
