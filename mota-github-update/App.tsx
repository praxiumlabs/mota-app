/**
 * MOTA - Macau of the Americas
 * Premium Luxury Resort & Investment App
 * Location: Ambergris Caye, Belize (17.898769, -87.981777)
 * 
 * Updated with:
 * - 3-Tier User System: Guest → Member → Investor
 * - 6 Investor Tiers: Silver → Gold → Platinum → Diamond → Black → Founders
 * - Biometric Authentication (Face ID / Fingerprint)
 * - Bottom Sheet Modal Sign Up Flow
 * - FOMO Teasers & Access Control
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
  Dimensions,
  ImageBackground,
  Animated,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';
import { useSafeAreaInsets, SafeAreaProvider } from 'react-native-safe-area-context';

// Auth Context
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import { BottomSheet } from './components/BottomSheet';
import { AuthModal } from './components/AuthModal';
import {
  GuestFomoBanner,
  MemberFomoBanner,
  LockedFeatureCard,
  ActionButton,
} from './components/FomoComponents';

// Screens
import { InvestorScreen } from './screens/InvestorScreen';
import { ProfileScreen } from './screens/ProfileScreen';

SplashScreen.preventAutoHideAsync();

const { width, height } = Dimensions.get('window');

// ============================================
// COLORS
// ============================================

const Colors = {
  deepNavy: '#0A122A',
  secondaryNavy: '#101C40',
  cardDark: '#0D1729',
  cardElevated: '#162038',
  gold: '#D4AF37',
  goldLight: '#E8D48B',
  goldDark: '#B8960C',
  goldMuted: 'rgba(212, 175, 55, 0.3)',
  goldSubtle: 'rgba(212, 175, 55, 0.12)',
  white: '#FFFFFF',
  lightGrey: '#F5F5F5',
  softGrey: '#A0A8B8',
  mutedGrey: '#6B7280',
  success: '#10B981',
  overlayDark: 'rgba(10, 18, 42, 0.92)',
  overlayMedium: 'rgba(10, 18, 42, 0.7)',
  overlayLight: 'rgba(10, 18, 42, 0.4)',
  transparent: 'transparent',
};

// ============================================
// DATA
// ============================================

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=1200',
  'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200',
];

const CATEGORIES = [
  { id: '1', name: 'Hotels', icon: 'home' },
  { id: '2', name: 'Dining', icon: 'coffee' },
  { id: '3', name: 'Activities', icon: 'compass' },
  { id: '4', name: 'Nightlife', icon: 'moon' },
  { id: '5', name: 'Beaches', icon: 'sun' },
  { id: '6', name: 'Events', icon: 'calendar' },
];

const RESTAURANTS = [
  { id: '1', name: 'Hidden Treasure', category: 'Fine Dining', rating: 4.7, image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800' },
  { id: '2', name: "Elvi's Kitchen", category: 'Belizean', rating: 4.5, image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800' },
  { id: '3', name: 'Blue Water Grill', category: 'Sushi & Seafood', rating: 4.6, image: 'https://images.unsplash.com/photo-1579027989536-b7b1f875659b?w=800' },
];

const ACTIVITIES = [
  { id: '1', name: 'Hol Chan Marine Reserve', category: 'Snorkeling', rating: 4.9, image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800', price: '$75' },
  { id: '2', name: 'Great Blue Hole', category: 'Diving', rating: 4.8, image: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800', price: '$350' },
  { id: '3', name: 'Sunset Catamaran', category: 'Sailing', rating: 4.8, image: 'https://images.unsplash.com/photo-1500514966906-fe245eea9344?w=800', price: '$95' },
];

const EVENTS = [
  { id: '1', name: 'Costa Maya Festival', date: 'Aug 1-4, 2025', venue: 'San Pedro' },
  { id: '2', name: 'Lobster Fest', date: 'Jun 15-21, 2025', venue: 'Island-wide' },
  { id: '3', name: 'Jazz Night', date: 'Every Thursday', venue: 'Blue Water Grill' },
  { id: '4', name: 'Investor Gala', date: 'Dec 31, 2025', venue: 'MOTA Ballroom' },
];

// ============================================
// SPLASH SCREEN
// ============================================

function SplashScreenComponent() {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.splashContainer}>
      <LinearGradient colors={[Colors.deepNavy, Colors.secondaryNavy]} style={StyleSheet.absoluteFill} />
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <LinearGradient colors={[Colors.gold, Colors.goldDark]} style={styles.splashLogo}>
          <MaterialCommunityIcons name="diamond-stone" size={40} color={Colors.deepNavy} />
        </LinearGradient>
      </Animated.View>
      <Text style={styles.splashTitle}>MOTA</Text>
      <Text style={styles.splashSubtitle}>MACAU OF THE AMERICAS</Text>
      <ActivityIndicator size="small" color={Colors.gold} style={{ marginTop: 40 }} />
    </View>
  );
}

// ============================================
// BOTTOM NAV
// ============================================

function BottomNavBar({ 
  currentTab, 
  onTabPress 
}: { 
  currentTab: string; 
  onTabPress: (tab: string) => void;
}) {
  const insets = useSafeAreaInsets();
  
  const tabs = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'explore', label: 'Explore', icon: 'compass' },
    { id: 'events', label: 'Events', icon: 'calendar' },
    { id: 'investor', label: 'Investor', icon: 'briefcase' },
    { id: 'profile', label: 'Profile', icon: 'user' },
  ];

  return (
    <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {tabs.map((tab) => {
        const isActive = currentTab === tab.id;
        return (
          <Pressable key={tab.id} style={styles.navTab} onPress={() => onTabPress(tab.id)}>
            {isActive && <View style={styles.navIndicator} />}
            <Feather name={tab.icon as any} size={22} color={isActive ? Colors.gold : Colors.mutedGrey} />
            <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ============================================
// HOME SCREEN
// ============================================

function HomeScreen({ onShowAuthModal }: { onShowAuthModal: (action?: string) => void }) {
  const insets = useSafeAreaInsets();
  const { user, isGuest, isMember, canAccess } = useAuth();
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length), 5000);
    return () => clearInterval(interval);
  }, []);

  const handleBookAction = (action: string) => {
    if (!canAccess('booking')) {
      onShowAuthModal(action);
    } else {
      // Handle actual booking
      console.log('Booking:', action);
    }
  };

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <View style={[styles.heroSection, { paddingTop: insets.top }]}>
        <ImageBackground source={{ uri: HERO_IMAGES[heroIndex] }} style={styles.heroImage}>
          <LinearGradient 
            colors={[Colors.overlayLight, Colors.overlayMedium, Colors.overlayDark]} 
            locations={[0, 0.5, 1]} 
            style={styles.heroGradient}
          >
            <View style={styles.heroTopBar}>
              <View style={styles.logoRow}>
                <MaterialCommunityIcons name="diamond-stone" size={24} color={Colors.gold} />
                <Text style={styles.logoText}>MOTA</Text>
              </View>
              <Pressable style={styles.profileBtn}>
                <Feather name="user" size={18} color={Colors.gold} />
              </Pressable>
            </View>
            <View style={styles.heroContent}>
              <Text style={styles.heroLabel}>WELCOME TO PARADISE</Text>
              <Text style={styles.heroTitle}>Discover{'\n'}the Island</Text>
              <Text style={styles.heroSubtitle}>A $2.5B integrated resort on Ambergris Caye, Belize</Text>
            </View>
            <View style={styles.heroDots}>
              {HERO_IMAGES.map((_, i) => (
                <View key={i} style={[styles.heroDot, i === heroIndex && styles.heroDotActive]} />
              ))}
            </View>
          </LinearGradient>
        </ImageBackground>
      </View>

      {/* FOMO Banners */}
      {isGuest && <GuestFomoBanner onSignUp={() => onShowAuthModal('book restaurants')} />}
      {isMember && <MemberFomoBanner onPress={() => {}} />}

      {/* Categories */}
      <View style={styles.section}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
          {CATEGORIES.map((cat) => (
            <Pressable key={cat.id} style={styles.categoryCard}>
              <LinearGradient colors={[Colors.cardElevated, Colors.cardDark]} style={styles.categoryGradient}>
                <Feather name={cat.icon as any} size={20} color={Colors.gold} />
                <Text style={styles.categoryName}>{cat.name}</Text>
              </LinearGradient>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Restaurants */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Dining</Text>
          <Text style={styles.seeAll}>See All</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {RESTAURANTS.map((r) => (
            <Pressable key={r.id} style={styles.restaurantCard}>
              <ImageBackground source={{ uri: r.image }} style={styles.restaurantImage} imageStyle={{ borderRadius: 16 }}>
                <LinearGradient colors={[Colors.transparent, Colors.overlayDark]} style={styles.restaurantGradient}>
                  <Text style={styles.restaurantCategory}>{r.category}</Text>
                  <Text style={styles.restaurantName}>{r.name}</Text>
                  <View style={styles.cardFooter}>
                    <View style={styles.ratingRow}>
                      <Feather name="star" size={12} color={Colors.gold} />
                      <Text style={styles.ratingText}>{r.rating}</Text>
                    </View>
                    <ActionButton
                      label="Book"
                      isLocked={!canAccess('booking')}
                      onPress={() => handleBookAction(`book ${r.name}`)}
                    />
                  </View>
                </LinearGradient>
              </ImageBackground>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Activities */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Adventures</Text>
          <Text style={styles.seeAll}>See All</Text>
        </View>
        {ACTIVITIES.map((a) => (
          <Pressable key={a.id} style={styles.activityCard}>
            <ImageBackground source={{ uri: a.image }} style={styles.activityImage} imageStyle={{ borderRadius: 12 }} />
            <View style={styles.activityContent}>
              <Text style={styles.activityCategory}>{a.category}</Text>
              <Text style={styles.activityName}>{a.name}</Text>
              <View style={styles.activityFooter}>
                <View style={styles.ratingRow}>
                  <Feather name="star" size={12} color={Colors.gold} />
                  <Text style={styles.ratingText}>{a.rating}</Text>
                </View>
                <Text style={styles.activityPrice}>From {a.price}</Text>
              </View>
            </View>
            <ActionButton
              label="Reserve"
              isLocked={!canAccess('booking')}
              onPress={() => handleBookAction(`reserve ${a.name}`)}
            />
          </Pressable>
        ))}
      </View>

      {/* Locked Features (for Guests) */}
      {isGuest && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Member Features</Text>
          <View style={styles.lockedGrid}>
            <LockedFeatureCard
              icon="heart"
              title="Favorites"
              requiredLevel="member"
              onPress={() => onShowAuthModal('save favorites')}
            />
            <LockedFeatureCard
              icon="calendar"
              title="RSVP Events"
              requiredLevel="member"
              onPress={() => onShowAuthModal('RSVP to events')}
            />
          </View>
        </View>
      )}

      {/* Investor CTA */}
      <View style={styles.section}>
        <Pressable style={styles.investorCTA}>
          <LinearGradient colors={[Colors.goldSubtle, Colors.transparent]} style={StyleSheet.absoluteFill} />
          <View style={styles.ctaBorder} />
          <MaterialCommunityIcons name="diamond-stone" size={32} color={Colors.gold} style={{ marginBottom: 12 }} />
          <Text style={styles.ctaLabel}>EXCLUSIVE OPPORTUNITY</Text>
          <Text style={styles.ctaTitle}>Become an Investor</Text>
          <Text style={styles.ctaText}>Join our exclusive group and own a piece of paradise.</Text>
          <View style={styles.ctaButtonWrapper}>
            <LinearGradient colors={[Colors.gold, Colors.goldDark]} style={styles.ctaButtonBg}>
              <Text style={styles.ctaButtonText}>LEARN MORE</Text>
            </LinearGradient>
          </View>
        </Pressable>
      </View>

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

// ============================================
// EXPLORE SCREEN
// ============================================

function ExploreScreen({ onShowAuthModal }: { onShowAuthModal: (action?: string) => void }) {
  const insets = useSafeAreaInsets();
  const { canAccess } = useAuth();

  return (
    <ScrollView 
      style={styles.screen} 
      showsVerticalScrollIndicator={false} 
      contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: 120 }}
    >
      <Text style={styles.screenTitle}>Explore</Text>
      <Text style={styles.screenSubtitle}>Discover everything MOTA offers</Text>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Feather name="search" size={18} color={Colors.mutedGrey} />
          <TextInput 
            style={styles.searchInput} 
            placeholder="What are you looking for?" 
            placeholderTextColor={Colors.mutedGrey} 
          />
        </View>
      </View>

      {/* Restaurants */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Restaurants</Text>
          <Text style={styles.seeAll}>See All</Text>
        </View>
        {RESTAURANTS.map((r) => (
          <Pressable key={r.id} style={styles.listCard}>
            <ImageBackground source={{ uri: r.image }} style={styles.listCardImage} imageStyle={{ borderRadius: 12 }} />
            <View style={styles.listCardContent}>
              <Text style={styles.listCardCategory}>{r.category}</Text>
              <Text style={styles.listCardName}>{r.name}</Text>
              <View style={styles.ratingRow}>
                <Feather name="star" size={12} color={Colors.gold} />
                <Text style={styles.ratingText}>{r.rating}</Text>
              </View>
            </View>
            <ActionButton
              label="Book"
              isLocked={!canAccess('booking')}
              onPress={() => !canAccess('booking') && onShowAuthModal(`book ${r.name}`)}
            />
          </Pressable>
        ))}
      </View>

      {/* Activities */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Activities</Text>
          <Text style={styles.seeAll}>See All</Text>
        </View>
        {ACTIVITIES.map((a) => (
          <Pressable key={a.id} style={styles.listCard}>
            <ImageBackground source={{ uri: a.image }} style={styles.listCardImage} imageStyle={{ borderRadius: 12 }} />
            <View style={styles.listCardContent}>
              <Text style={styles.listCardCategory}>{a.category}</Text>
              <Text style={styles.listCardName}>{a.name}</Text>
              <Text style={styles.listCardPrice}>From {a.price}</Text>
            </View>
            <ActionButton
              label="Reserve"
              isLocked={!canAccess('booking')}
              onPress={() => !canAccess('booking') && onShowAuthModal(`reserve ${a.name}`)}
            />
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

// ============================================
// EVENTS SCREEN
// ============================================

function EventsScreen({ onShowAuthModal }: { onShowAuthModal: (action?: string) => void }) {
  const insets = useSafeAreaInsets();
  const { canAccess } = useAuth();

  return (
    <ScrollView 
      style={styles.screen} 
      showsVerticalScrollIndicator={false} 
      contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: 120 }}
    >
      <Text style={styles.screenTitle}>Events</Text>
      <Text style={styles.screenSubtitle}>Upcoming experiences at MOTA</Text>

      <View style={styles.section}>
        {EVENTS.map((e, i) => (
          <Pressable key={e.id} style={styles.eventCard}>
            <LinearGradient
              colors={i === 0 ? [Colors.goldSubtle, Colors.cardDark] : [Colors.cardElevated, Colors.cardDark]}
              style={styles.eventCardGradient}
            >
              {i === 0 && (
                <View style={styles.eventBadge}>
                  <Text style={styles.eventBadgeText}>FEATURED</Text>
                </View>
              )}
              <Text style={styles.eventName}>{e.name}</Text>
              <View style={styles.eventMeta}>
                <Feather name="calendar" size={14} color={Colors.gold} />
                <Text style={styles.eventDate}>{e.date}</Text>
              </View>
              <Text style={styles.eventVenue}>{e.venue}</Text>
              <ActionButton
                label="RSVP"
                isLocked={!canAccess('rsvp')}
                onPress={() => !canAccess('rsvp') && onShowAuthModal(`RSVP to ${e.name}`)}
              />
            </LinearGradient>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

// ============================================
// MAIN APP CONTENT
// ============================================

function AppContent() {
  const [isReady, setIsReady] = useState(false);
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTriggerAction, setAuthTriggerAction] = useState<string | undefined>(undefined);

  useEffect(() => {
    async function prepare() {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsReady(true);
    }
    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (isReady) {
      await SplashScreen.hideAsync();
    }
  }, [isReady]);

  const handleShowAuthModal = (action?: string) => {
    setAuthTriggerAction(action);
    setShowAuthModal(true);
  };

  if (!isReady) {
    return <SplashScreenComponent />;
  }

  return (
    <SafeAreaProvider>
      <View style={styles.container} onLayout={onLayoutRootView}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.deepNavy} translucent />

        {/* Screens */}
        {currentTab === 'home' && <HomeScreen onShowAuthModal={handleShowAuthModal} />}
        {currentTab === 'explore' && <ExploreScreen onShowAuthModal={handleShowAuthModal} />}
        {currentTab === 'events' && <EventsScreen onShowAuthModal={handleShowAuthModal} />}
        {currentTab === 'investor' && <InvestorScreen />}
        {currentTab === 'profile' && <ProfileScreen onShowAuthModal={handleShowAuthModal} />}

        {/* Bottom Navigation */}
        <BottomNavBar currentTab={currentTab} onTabPress={setCurrentTab} />

        {/* Auth Bottom Sheet Modal */}
        <BottomSheet
          isVisible={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          height="75%"
        >
          <AuthModal
            onClose={() => setShowAuthModal(false)}
            triggerAction={authTriggerAction}
          />
        </BottomSheet>
      </View>
    </SafeAreaProvider>
  );
}

// ============================================
// ROOT APP WITH AUTH PROVIDER
// ============================================

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.deepNavy,
  },
  screen: {
    flex: 1,
    backgroundColor: Colors.deepNavy,
  },

  // Splash
  splashContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashLogo: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 8,
    marginTop: 24,
  },
  splashSubtitle: {
    fontSize: 10,
    color: Colors.softGrey,
    letterSpacing: 4,
    marginTop: 8,
  },

  // Bottom Nav
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: Colors.cardDark,
    borderTopWidth: 1,
    borderTopColor: Colors.goldSubtle,
    paddingTop: 8,
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navIndicator: {
    position: 'absolute',
    top: -1,
    width: 32,
    height: 3,
    backgroundColor: Colors.gold,
    borderRadius: 2,
  },
  navLabel: {
    fontSize: 11,
    color: Colors.mutedGrey,
    marginTop: 4,
  },
  navLabelActive: {
    color: Colors.gold,
  },

  // Hero
  heroSection: {
    height: height * 0.52,
  },
  heroImage: {
    flex: 1,
  },
  heroGradient: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  heroTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 4,
    marginLeft: 8,
  },
  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.goldSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.goldMuted,
  },
  heroContent: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  heroLabel: {
    fontSize: 11,
    color: Colors.gold,
    letterSpacing: 3,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 38,
    fontWeight: '700',
    color: Colors.white,
    lineHeight: 44,
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 14,
    color: Colors.softGrey,
    lineHeight: 20,
  },
  heroDots: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  heroDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.mutedGrey,
    marginHorizontal: 4,
  },
  heroDotActive: {
    width: 24,
    backgroundColor: Colors.gold,
  },

  // Sections
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  seeAll: {
    fontSize: 13,
    color: Colors.gold,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.white,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  screenSubtitle: {
    fontSize: 14,
    color: Colors.softGrey,
    paddingHorizontal: 20,
    marginBottom: 20,
  },

  // Categories
  categoriesScroll: {
    paddingHorizontal: 20,
  },
  categoryCard: {
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  categoryGradient: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.goldSubtle,
    borderRadius: 12,
  },
  categoryName: {
    fontSize: 12,
    color: Colors.softGrey,
    marginTop: 6,
  },

  // Restaurant Cards
  restaurantCard: {
    width: 200,
    height: 240,
    marginRight: 14,
    borderRadius: 16,
    overflow: 'hidden',
  },
  restaurantImage: {
    flex: 1,
  },
  restaurantGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 14,
  },
  restaurantCategory: {
    fontSize: 11,
    color: Colors.gold,
    letterSpacing: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: Colors.white,
    marginLeft: 4,
  },

  // Activity Cards
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardElevated,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  activityImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
  },
  activityContent: {
    flex: 1,
    marginLeft: 14,
  },
  activityCategory: {
    fontSize: 11,
    color: Colors.gold,
    letterSpacing: 1,
  },
  activityName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
    marginTop: 2,
  },
  activityFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  activityPrice: {
    fontSize: 12,
    color: Colors.softGrey,
    marginLeft: 12,
  },

  // Locked Features Grid
  lockedGrid: {
    flexDirection: 'row',
    gap: 12,
  },

  // Investor CTA
  investorCTA: {
    borderRadius: 18,
    padding: 22,
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: Colors.cardElevated,
  },
  ctaBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.gold,
  },
  ctaLabel: {
    fontSize: 10,
    color: Colors.gold,
    letterSpacing: 2,
  },
  ctaTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.white,
    marginTop: 8,
    marginBottom: 8,
  },
  ctaText: {
    fontSize: 13,
    color: Colors.softGrey,
    textAlign: 'center',
    marginBottom: 16,
  },
  ctaButtonWrapper: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  ctaButtonBg: {
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  ctaButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.deepNavy,
    letterSpacing: 1,
  },

  // Search
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardElevated,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.goldSubtle,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.white,
    marginLeft: 10,
  },

  // List Cards
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardElevated,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  listCardImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  listCardContent: {
    flex: 1,
    marginLeft: 14,
  },
  listCardCategory: {
    fontSize: 11,
    color: Colors.gold,
    letterSpacing: 1,
  },
  listCardName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
    marginTop: 2,
  },
  listCardPrice: {
    fontSize: 12,
    color: Colors.softGrey,
    marginTop: 4,
  },

  // Event Cards
  eventCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 14,
  },
  eventCardGradient: {
    padding: 18,
  },
  eventBadge: {
    backgroundColor: Colors.gold,
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 12,
  },
  eventBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.deepNavy,
    letterSpacing: 1,
  },
  eventName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 8,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 13,
    color: Colors.softGrey,
    marginLeft: 8,
  },
  eventVenue: {
    fontSize: 12,
    color: Colors.mutedGrey,
    marginBottom: 14,
  },
});
