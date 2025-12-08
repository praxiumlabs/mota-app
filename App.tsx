/**
 * MOTA - Premium Casino Resort App
 * Connected to Backend API
 * Compatible with existing components
 */

import React, { useState, useEffect } from 'react';
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
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// Import components
import { AuthProvider, useAuth } from './context/AuthContext';
import BottomSheet from './components/BottomSheet';
import AuthModal from './components/AuthModal';
import { 
  ExclusiveBadge, 
  SpotsLeft, 
  VIPOnlyOverlay,
  PriceDisplay 
} from './components/FomoComponents';
import InvestorScreen from './screens/InvestorScreen';
import ProfileScreen from './screens/ProfileScreen';

// Import API service
import api from './services/api';

const { width, height } = Dimensions.get('window');

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
  priceRange: string;
  regularPrice: number;
  memberPrice?: number;
  platinumPrice?: number;
  diamondPrice?: number;
  openHours?: string;
  location?: string;
  isFeatured?: boolean;
}

interface Activity {
  _id: string;
  name: string;
  category: string;
  description?: string;
  image: string;
  rating: number;
  duration?: string;
  regularPrice: number;
  memberPrice?: number;
  platinumPrice?: number;
  diamondPrice?: number;
  included?: string[];
  isFeatured?: boolean;
}

interface Event {
  _id: string;
  name: string;
  description?: string;
  image: string;
  date: string;
  venue?: string;
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
  code?: string;
  validUntil?: string;
  minTier?: string;
}

// ============================================
// MAIN APP CONTENT
// ============================================

function MainApp() {
  const { user, isInvestor, isMember, getDiscountPercent } = useAuth();
  
  // Navigation state
  const [activeTab, setActiveTab] = useState('home');
  
  // Data state
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  
  // Loading state
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modal state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const isLoggedIn = !!user;
  const discountPercent = getDiscountPercent();

  // Fetch data from API
  const fetchData = async () => {
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
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Get price based on user's tier
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

  // Render loading screen
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={['#0a0a0a', '#1a1a2e']} style={StyleSheet.absoluteFill} />
        <ActivityIndicator size="large" color="#D4AF37" />
        <Text style={styles.loadingText}>Loading MOTA...</Text>
      </View>
    );
  }

  // Render Invest tab
  if (activeTab === 'invest') {
    return (
      <SafeAreaProvider>
        <View style={styles.container}>
          <InvestorScreen />
          <NavBar activeTab={activeTab} setActiveTab={setActiveTab} />
        </View>
      </SafeAreaProvider>
    );
  }

  // Render Profile tab
  if (activeTab === 'profile') {
    return (
      <SafeAreaProvider>
        <View style={styles.container}>
          <ProfileScreen onShowAuthModal={function (): void {
            throw new Error('Function not implemented.');
          } } />
          <NavBar activeTab={activeTab} setActiveTab={setActiveTab} />
        </View>
      </SafeAreaProvider>
    );
  }

  // Home screen
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={['#0a0a0a', '#1a1a2e', '#0a0a0a']} style={StyleSheet.absoluteFill} />
        
        <SafeAreaView style={styles.safeArea}>
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D4AF37" />
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
                onPress={() => isLoggedIn ? setActiveTab('profile') : setShowAuthModal(true)}
              >
                {isLoggedIn ? (
                  <LinearGradient colors={['#D4AF37', '#B8860B']} style={styles.profileGradient}>
                    <Text style={styles.profileInitial}>{user?.name?.[0] || 'U'}</Text>
                  </LinearGradient>
                ) : (
                  <Ionicons name="person-circle-outline" size={40} color="#D4AF37" />
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
                onPress={() => setActiveTab('invest')}
              >
                <LinearGradient
                  colors={
                    user.investorTier === 'founders' ? ['#E5E4E2', '#C0C0C0'] :
                    user.investorTier === 'black' ? ['#000000', '#333333'] :
                    user.investorTier === 'diamond' ? ['#B9F2FF', '#E0FFFF'] :
                    user.investorTier === 'platinum' ? ['#E5E4E2', '#C9C9C9'] :
                    ['#D4AF37', '#B8860B']
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

            {/* Active Offers */}
            {offers.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🎁 Special Offers</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {offers.map((offer) => (
                    <TouchableOpacity key={offer._id} style={styles.offerCard}>
                      <LinearGradient colors={['#D4AF37', '#B8860B']} style={styles.offerGradient}>
                        <Text style={styles.offerTitle}>{offer.title}</Text>
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

            {/* Featured Restaurants */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>🍽️ Restaurants</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
              </View>
              
              {restaurants.length === 0 ? (
                <Text style={styles.emptyText}>No restaurants available</Text>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
                          <Text style={styles.cardTitle}>{restaurant.name}</Text>
                          <Text style={styles.cardSubtitle}>{restaurant.category}</Text>
                          <View style={styles.cardFooter}>
                            <View style={styles.ratingContainer}>
                              <Ionicons name="star" size={14} color="#D4AF37" />
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
                <TouchableOpacity>
                  <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
              </View>
              
              {activities.length === 0 ? (
                <Text style={styles.emptyText}>No activities available</Text>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
                          <Text style={styles.cardTitle}>{activity.name}</Text>
                          <Text style={styles.cardSubtitle}>{activity.duration || activity.category}</Text>
                          <View style={styles.cardFooter}>
                            <View style={styles.ratingContainer}>
                              <Ionicons name="star" size={14} color="#D4AF37" />
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

            {/* Events */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>🎉 Events</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
              </View>
              
              {events.length === 0 ? (
                <Text style={styles.emptyText}>No upcoming events</Text>
              ) : (
                events.map((event) => (
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
                        <Text style={styles.eventDate}>
                          {new Date(event.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </Text>
                        <Text style={styles.eventTitle}>{event.name}</Text>
                        <Text style={styles.eventVenue}>{event.venue}</Text>
                        {event.capacity && (
                          <SpotsLeft current={event.registeredCount || 0} total={event.capacity} />
                        )}
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
                onPress={() => setShowAuthModal(true)}
              >
                <LinearGradient colors={['#D4AF37', '#B8860B']} style={styles.ctaGradient}>
                  <Text style={styles.ctaTitle}>Join MOTA Today</Text>
                  <Text style={styles.ctaSubtitle}>Unlock exclusive benefits and discounts</Text>
                  <View style={styles.ctaButton}>
                    <Text style={styles.ctaButtonText}>Get Started</Text>
                    <Ionicons name="arrow-forward" size={20} color="#0a0a0a" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            )}

            <View style={{ height: 100 }} />
          </ScrollView>
        </SafeAreaView>

        {/* Navigation Bar */}
        <NavBar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Auth Modal */}
        <BottomSheet 
          isVisible={showAuthModal} 
          onClose={() => setShowAuthModal(false)}
        >
          <AuthModal onClose={() => setShowAuthModal(false)} />
        </BottomSheet>

        {/* Restaurant Detail Modal */}
        <BottomSheet 
          isVisible={!!selectedRestaurant} 
          onClose={() => setSelectedRestaurant(null)}
        >
          {selectedRestaurant && (
            <View style={styles.detailContent}>
              <Image source={{ uri: selectedRestaurant.image }} style={styles.detailImage} />
              <Text style={styles.detailTitle}>{selectedRestaurant.name}</Text>
              <Text style={styles.detailCategory}>{selectedRestaurant.category}</Text>
              <Text style={styles.detailDescription}>{selectedRestaurant.description}</Text>
              
              <View style={styles.detailInfo}>
                <View style={styles.detailRow}>
                  <Ionicons name="star" size={18} color="#D4AF37" />
                  <Text style={styles.detailText}>{selectedRestaurant.rating} Rating</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="time" size={18} color="#D4AF37" />
                  <Text style={styles.detailText}>{selectedRestaurant.openHours || 'Hours vary'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="location" size={18} color="#D4AF37" />
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
                <LinearGradient colors={['#D4AF37', '#B8860B']} style={styles.bookButtonGradient}>
                  <Text style={styles.bookButtonText}>Reserve Table</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </BottomSheet>

        {/* Activity Detail Modal */}
        <BottomSheet 
          isVisible={!!selectedActivity} 
          onClose={() => setSelectedActivity(null)}
        >
          {selectedActivity && (
            <View style={styles.detailContent}>
              <Image source={{ uri: selectedActivity.image }} style={styles.detailImage} />
              <Text style={styles.detailTitle}>{selectedActivity.name}</Text>
              <Text style={styles.detailCategory}>{selectedActivity.category}</Text>
              <Text style={styles.detailDescription}>{selectedActivity.description}</Text>
              
              <View style={styles.detailInfo}>
                <View style={styles.detailRow}>
                  <Ionicons name="time" size={18} color="#D4AF37" />
                  <Text style={styles.detailText}>{selectedActivity.duration || 'Duration varies'}</Text>
                </View>
              </View>

              {selectedActivity.included && selectedActivity.included.length > 0 && (
                <View style={styles.includedSection}>
                  <Text style={styles.includedTitle}>What's Included:</Text>
                  {selectedActivity.included.map((item, index) => (
                    <View key={index} style={styles.includedItem}>
                      <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
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
                <LinearGradient colors={['#D4AF37', '#B8860B']} style={styles.bookButtonGradient}>
                  <Text style={styles.bookButtonText}>Book Now</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </BottomSheet>

        {/* Event Detail Modal */}
        <BottomSheet 
          isVisible={!!selectedEvent} 
          onClose={() => setSelectedEvent(null)}
        >
          {selectedEvent && (
            <View style={styles.detailContent}>
              <Image source={{ uri: selectedEvent.image }} style={styles.detailImage} />
              <Text style={styles.detailTitle}>{selectedEvent.name}</Text>
              <Text style={styles.detailCategory}>{selectedEvent.venue}</Text>
              <Text style={styles.detailDescription}>{selectedEvent.description}</Text>
              
              <View style={styles.detailInfo}>
                <View style={styles.detailRow}>
                  <Ionicons name="calendar" size={18} color="#D4AF37" />
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
                    <Ionicons name="people" size={18} color="#D4AF37" />
                    <Text style={styles.detailText}>
                      {selectedEvent.capacity - (selectedEvent.registeredCount || 0)} spots remaining
                    </Text>
                  </View>
                )}
              </View>

              <TouchableOpacity style={styles.bookButton}>
                <LinearGradient colors={['#D4AF37', '#B8860B']} style={styles.bookButtonGradient}>
                  <Text style={styles.bookButtonText}>RSVP Now</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </BottomSheet>
      </View>
    </SafeAreaProvider>
  );
}

// ============================================
// NAV BAR COMPONENT
// ============================================

function NavBar({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
  return (
    <View style={styles.navBar}>
      <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('home')}>
        <Ionicons name={activeTab === 'home' ? 'home' : 'home-outline'} size={24} color={activeTab === 'home' ? '#D4AF37' : '#888'} />
        <Text style={[styles.navLabel, activeTab === 'home' && styles.navLabelActive]}>Home</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('explore')}>
        <Ionicons name={activeTab === 'explore' ? 'compass' : 'compass-outline'} size={24} color={activeTab === 'explore' ? '#D4AF37' : '#888'} />
        <Text style={[styles.navLabel, activeTab === 'explore' && styles.navLabelActive]}>Explore</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('invest')}>
        <Ionicons name={activeTab === 'invest' ? 'trending-up' : 'trending-up-outline'} size={24} color={activeTab === 'invest' ? '#D4AF37' : '#888'} />
        <Text style={[styles.navLabel, activeTab === 'invest' && styles.navLabelActive]}>Invest</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('profile')}>
        <Ionicons name={activeTab === 'profile' ? 'person' : 'person-outline'} size={24} color={activeTab === 'profile' ? '#D4AF37' : '#888'} />
        <Text style={[styles.navLabel, activeTab === 'profile' && styles.navLabelActive]}>Profile</Text>
      </TouchableOpacity>
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
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#D4AF37',
    marginTop: 16,
    fontSize: 16,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  greeting: {
    color: '#888',
    fontSize: 14,
  },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#D4AF37',
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
    backgroundColor: 'rgba(244, 67, 54, 0.9)',
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 10,
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

  // Tier Badge
  tierBadgeContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  tierText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
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
  },
  seeAll: {
    color: '#D4AF37',
    fontSize: 14,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    padding: 20,
  },

  // Offer Cards
  offerCard: {
    width: width * 0.75,
    height: 120,
    marginLeft: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  offerGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  offerTitle: {
    color: '#0a0a0a',
    fontSize: 18,
    fontWeight: 'bold',
  },
  offerDescription: {
    color: '#0a0a0a',
    opacity: 0.8,
    marginTop: 5,
  },
  offerCodeContainer: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  offerCode: {
    color: '#0a0a0a',
    fontWeight: 'bold',
  },

  // Cards
  card: {
    width: width * 0.6,
    height: 200,
    marginLeft: 20,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#1a1a2e',
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
    color: '#888',
    fontSize: 14,
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
    color: '#D4AF37',
    marginLeft: 4,
    fontWeight: '600',
  },

  // Event Cards
  eventCard: {
    marginHorizontal: 20,
    height: 200,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 15,
  },
  eventImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  eventGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
  },
  eventContent: {},
  eventDate: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '600',
  },
  eventTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 5,
  },
  eventVenue: {
    color: '#888',
    marginTop: 5,
  },

  // CTA
  ctaContainer: {
    marginHorizontal: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  ctaGradient: {
    padding: 25,
    alignItems: 'center',
  },
  ctaTitle: {
    color: '#0a0a0a',
    fontSize: 22,
    fontWeight: 'bold',
  },
  ctaSubtitle: {
    color: '#0a0a0a',
    opacity: 0.8,
    marginTop: 5,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginTop: 15,
  },
  ctaButtonText: {
    color: '#D4AF37',
    fontWeight: '600',
    marginRight: 8,
  },

  // Nav Bar
  navBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingBottom: 25,
    paddingTop: 10,
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
  },
  navLabel: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  navLabelActive: {
    color: '#D4AF37',
  },

  // Detail Modal
  detailContent: {
    padding: 20,
  },
  detailImage: {
    width: '100%',
    height: 200,
    borderRadius: 15,
    marginBottom: 20,
  },
  detailTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  detailCategory: {
    color: '#D4AF37',
    fontSize: 16,
    marginTop: 5,
  },
  detailDescription: {
    color: '#888',
    fontSize: 14,
    marginTop: 10,
    lineHeight: 22,
  },
  detailInfo: {
    marginTop: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailText: {
    color: '#fff',
    marginLeft: 10,
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
    color: '#888',
    fontSize: 16,
  },
  includedSection: {
    marginTop: 20,
  },
  includedTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  includedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  includedText: {
    color: '#888',
    marginLeft: 10,
  },
  bookButton: {
    marginTop: 25,
    borderRadius: 25,
    overflow: 'hidden',
  },
  bookButtonGradient: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#0a0a0a',
    fontSize: 16,
    fontWeight: 'bold',
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
