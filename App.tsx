/**
 * MOTA - Macau of the Americas
 * Premium Luxury Resort & Investment App
 * Location: Ambergris Caye, Belize (17.898769, -87.981777)
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
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';
import { useSafeAreaInsets, SafeAreaProvider } from 'react-native-safe-area-context';

SplashScreen.preventAutoHideAsync();

const { width, height } = Dimensions.get('window');

// LUXURY COLOR PALETTE
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

// HERO IMAGES
const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=1200',
  'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200',
];

// CATEGORIES
const CATEGORIES = [
  { id: '1', name: 'Hotels', icon: 'home' },
  { id: '2', name: 'Dining', icon: 'coffee' },
  { id: '3', name: 'Activities', icon: 'compass' },
  { id: '4', name: 'Nightlife', icon: 'moon' },
  { id: '5', name: 'Beaches', icon: 'sun' },
  { id: '6', name: 'Events', icon: 'calendar' },
];

// RESTAURANTS
const RESTAURANTS = [
  { id: '1', name: 'Hidden Treasure', category: 'Fine Dining', rating: 4.7, image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800', description: 'Award-winning Caribbean seafood' },
  { id: '2', name: 'Elvi\'s Kitchen', category: 'Belizean', rating: 4.5, image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800', description: 'Legendary local cuisine since 1974' },
  { id: '3', name: 'Blue Water Grill', category: 'Sushi & Seafood', rating: 4.6, image: 'https://images.unsplash.com/photo-1579027989536-b7b1f875659b?w=800', description: 'Oceanfront dining with world-class sushi' },
];

// ACTIVITIES
const ACTIVITIES = [
  { id: '1', name: 'Hol Chan Marine Reserve', category: 'Snorkeling', rating: 4.9, image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800', price: '$75' },
  { id: '2', name: 'Great Blue Hole', category: 'Diving', rating: 4.8, image: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800', price: '$350' },
  { id: '3', name: 'Sunset Catamaran', category: 'Sailing', rating: 4.8, image: 'https://images.unsplash.com/photo-1500514966906-fe245eea9344?w=800', price: '$95' },
];

// EVENTS
const EVENTS = [
  { id: '1', name: 'Costa Maya Festival', date: 'Aug 1-4, 2025', venue: 'San Pedro' },
  { id: '2', name: 'Lobster Fest', date: 'Jun 15-21, 2025', venue: 'Island-wide' },
  { id: '3', name: 'Jazz Night', date: 'Every Thursday', venue: 'Blue Water Grill' },
  { id: '4', name: 'Investor Gala', date: 'Dec 31, 2025', venue: 'MOTA Ballroom' },
];

// INVESTOR STATS
const INVESTOR_STATS = [
  { label: 'Invested', value: '$250K', icon: 'trending-up' },
  { label: 'Value', value: '$287K', icon: 'bar-chart-2' },
  { label: 'Distributions', value: '$12.5K', icon: 'dollar-sign' },
  { label: 'ROI', value: '+15%', icon: 'percent' },
];

// VIP BENEFITS
const VIP_BENEFITS = [
  { id: '1', title: 'Helicopter', icon: 'navigation' },
  { id: '2', title: 'Yacht', icon: 'anchor' },
  { id: '3', title: 'Concierge', icon: 'headphones' },
  { id: '4', title: 'VIP Events', icon: 'star' },
  { id: '5', title: 'Priority', icon: 'calendar' },
  { id: '6', title: 'Private Dining', icon: 'lock' },
];

// MAIN APP
export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [currentTab, setCurrentTab] = useState<'home' | 'explore' | 'events' | 'investor'>('home');

  useEffect(() => {
    async function prepare() {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsReady(true);
    }
    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (isReady) await SplashScreen.hideAsync();
  }, [isReady]);

  if (!isReady) return <SplashScreenComponent />;

  return (
    <SafeAreaProvider>
      <View style={styles.container} onLayout={onLayoutRootView}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.deepNavy} translucent />
        
        {currentTab === 'home' && <HomeScreen />}
        {currentTab === 'explore' && <ExploreScreen />}
        {currentTab === 'events' && <EventsScreen />}
        {currentTab === 'investor' && <InvestorScreen />}

        <BottomNavBar currentTab={currentTab} onTabPress={setCurrentTab} />
      </View>
    </SafeAreaProvider>
  );
}

// SPLASH SCREEN
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

// BOTTOM NAV
function BottomNavBar({ currentTab, onTabPress }: { currentTab: string; onTabPress: (tab: any) => void }) {
  const insets = useSafeAreaInsets();
  const tabs = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'explore', label: 'Explore', icon: 'compass' },
    { id: 'events', label: 'Events', icon: 'calendar' },
    { id: 'investor', label: 'Investor', icon: 'briefcase' },
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

// HOME SCREEN
function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length), 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <View style={[styles.heroSection, { paddingTop: insets.top }]}>
        <ImageBackground source={{ uri: HERO_IMAGES[heroIndex] }} style={styles.heroImage}>
          <LinearGradient colors={[Colors.overlayLight, Colors.overlayMedium, Colors.overlayDark]} locations={[0, 0.5, 1]} style={styles.heroGradient}>
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
              {HERO_IMAGES.map((_, i) => <View key={i} style={[styles.heroDot, i === heroIndex && styles.heroDotActive]} />)}
            </View>
          </LinearGradient>
        </ImageBackground>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Feather name="search" size={18} color={Colors.mutedGrey} />
          <TextInput style={styles.searchInput} placeholder="Search hotels, dining..." placeholderTextColor={Colors.mutedGrey} />
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.quickStats}>
        <View style={styles.statItem}><Text style={styles.statValue}>$2.5B</Text><Text style={styles.statLabel}>Investment</Text></View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}><Text style={styles.statValue}>2026</Text><Text style={styles.statLabel}>Opening</Text></View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}><Text style={styles.statValue}>850</Text><Text style={styles.statLabel}>Acres</Text></View>
      </View>

      {/* Categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
        {CATEGORIES.map((cat) => (
          <Pressable key={cat.id} style={styles.categoryItem}>
            <View style={styles.categoryIcon}><Feather name={cat.icon as any} size={24} color={Colors.gold} /></View>
            <Text style={styles.categoryName}>{cat.name}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Dining Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Fine Dining</Text>
          <Text style={styles.seeAll}>See All</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {RESTAURANTS.map((r) => (
            <Pressable key={r.id} style={styles.restaurantCard}>
              <ImageBackground source={{ uri: r.image }} style={styles.restaurantImage} imageStyle={{ borderRadius: 16 }}>
                <LinearGradient colors={[Colors.transparent, Colors.overlayDark]} style={styles.restaurantGradient}>
                  <Text style={styles.restaurantCategory}>{r.category}</Text>
                  <Text style={styles.restaurantName}>{r.name}</Text>
                  <View style={styles.ratingRow}>
                    <Feather name="star" size={12} color={Colors.gold} />
                    <Text style={styles.ratingText}>{r.rating}</Text>
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
                <View style={styles.ratingRow}><Feather name="star" size={12} color={Colors.gold} /><Text style={styles.ratingText}>{a.rating}</Text></View>
                <Text style={styles.activityPrice}>From {a.price}</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </View>

      {/* Investor CTA */}
      <View style={styles.section}>
        <Pressable style={styles.investorCTA}>
          <LinearGradient colors={[Colors.goldSubtle, Colors.transparent]} style={StyleSheet.absoluteFill} />
          <View style={styles.ctaBorder} />
          <MaterialCommunityIcons name="diamond-stone" size={32} color={Colors.gold} style={{ marginBottom: 12 }} />
          <Text style={styles.ctaLabel}>EXCLUSIVE OPPORTUNITY</Text>
          <Text style={styles.ctaTitle}>Become an Investor</Text>
          <Text style={styles.ctaText}>Join our exclusive group and own a piece of paradise.</Text>
          <View style={styles.ctaButton}>
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

// EXPLORE SCREEN
function ExploreScreen() {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + 20 }}>
      <Text style={styles.screenTitle}>Explore</Text>
      <Text style={styles.screenSubtitle}>Discover everything MOTA offers</Text>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Feather name="search" size={18} color={Colors.mutedGrey} />
          <TextInput style={styles.searchInput} placeholder="What are you looking for?" placeholderTextColor={Colors.mutedGrey} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Restaurants</Text>
        {RESTAURANTS.map((r) => (
          <Pressable key={r.id} style={styles.listCard}>
            <ImageBackground source={{ uri: r.image }} style={styles.listImage} imageStyle={{ borderRadius: 12 }} />
            <View style={styles.listContent}>
              <Text style={styles.listCategory}>{r.category}</Text>
              <Text style={styles.listName}>{r.name}</Text>
              <Text style={styles.listDesc}>{r.description}</Text>
            </View>
            <Feather name="chevron-right" size={20} color={Colors.gold} />
          </Pressable>
        ))}
      </View>

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

// EVENTS SCREEN
function EventsScreen() {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + 20 }}>
      <Text style={styles.screenTitle}>Events</Text>
      <Text style={styles.screenSubtitle}>Upcoming experiences</Text>
      
      <View style={styles.section}>
        {EVENTS.map((e, i) => (
          <Pressable key={e.id} style={[styles.eventCard, i === 0 && styles.eventCardFeatured]}>
            <LinearGradient colors={[Colors.cardElevated, Colors.cardDark]} style={styles.eventCardBg}>
              <View style={styles.eventBadge}><Text style={styles.eventBadgeText}>{i === 0 ? 'FEATURED' : 'UPCOMING'}</Text></View>
              <Text style={styles.eventName}>{e.name}</Text>
              <View style={styles.eventMeta}>
                <Feather name="calendar" size={14} color={Colors.gold} />
                <Text style={styles.eventDate}>{e.date}</Text>
              </View>
              <Text style={styles.eventVenue}>{e.venue}</Text>
              {i === 0 && (
                <Pressable style={styles.eventButton}>
                  <LinearGradient colors={[Colors.gold, Colors.goldDark]} style={styles.eventButtonBg}>
                    <Text style={styles.eventButtonText}>Get Tickets</Text>
                  </LinearGradient>
                </Pressable>
              )}
            </LinearGradient>
          </Pressable>
        ))}
      </View>

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

// INVESTOR SCREEN
function InvestorScreen() {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + 20 }}>
      <View style={styles.investorHeader}>
        <View>
          <Text style={styles.screenTitle}>Dashboard</Text>
          <Text style={styles.screenSubtitle}>Welcome back, James</Text>
        </View>
        <View style={styles.tierBadge}>
          <LinearGradient colors={[Colors.gold, Colors.goldDark]} style={styles.tierBadgeBg}>
            <MaterialCommunityIcons name="crown" size={12} color={Colors.deepNavy} />
            <Text style={styles.tierText}>GOLD</Text>
          </LinearGradient>
        </View>
      </View>

      {/* Portfolio Card */}
      <View style={styles.section}>
        <View style={styles.portfolioCard}>
          <LinearGradient colors={[Colors.cardElevated, Colors.cardDark]} style={StyleSheet.absoluteFill} />
          <View style={styles.portfolioGoldBar} />
          <Text style={styles.portfolioLabel}>TOTAL PORTFOLIO VALUE</Text>
          <Text style={styles.portfolioValue}>$287,500</Text>
          <View style={styles.portfolioChange}>
            <Feather name="trending-up" size={16} color={Colors.success} />
            <Text style={styles.portfolioChangeText}>+15.0% (+$37,500)</Text>
          </View>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.section}>
        <View style={styles.statsGrid}>
          {INVESTOR_STATS.map((s, i) => (
            <View key={i} style={styles.statCard}>
              <LinearGradient colors={[Colors.cardElevated, Colors.cardDark]} style={styles.statCardBg}>
                <Feather name={s.icon as any} size={18} color={Colors.gold} />
                <Text style={styles.statCardValue}>{s.value}</Text>
                <Text style={styles.statCardLabel}>{s.label}</Text>
              </LinearGradient>
            </View>
          ))}
        </View>
      </View>

      {/* VIP Button */}
      <View style={styles.section}>
        <Pressable style={styles.vipButton}>
          <LinearGradient colors={[Colors.gold, Colors.goldDark]} style={styles.vipButtonBg}>
            <MaterialCommunityIcons name="star-four-points" size={18} color={Colors.deepNavy} />
            <Text style={styles.vipButtonText}>ACCESS VIP CONCIERGE</Text>
            <Feather name="chevron-right" size={18} color={Colors.deepNavy} />
          </LinearGradient>
        </Pressable>
      </View>

      {/* Benefits */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Benefits</Text>
        <View style={styles.benefitsGrid}>
          {VIP_BENEFITS.map((b) => (
            <View key={b.id} style={styles.benefitItem}>
              <View style={styles.benefitIcon}><Feather name={b.icon as any} size={20} color={Colors.gold} /></View>
              <Text style={styles.benefitTitle}>{b.title}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

// STYLES
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.deepNavy },
  screen: { flex: 1, backgroundColor: Colors.deepNavy },

  // Splash
  splashContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.deepNavy },
  splashLogo: { width: 80, height: 80, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  splashTitle: { fontSize: 48, fontWeight: '700', color: Colors.gold, letterSpacing: 10 },
  splashSubtitle: { fontSize: 11, color: Colors.softGrey, letterSpacing: 4, marginTop: 8 },

  // Bottom Nav
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: Colors.cardDark, borderTopWidth: 1, borderTopColor: Colors.goldSubtle, paddingTop: 8 },
  navTab: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  navIndicator: { position: 'absolute', top: -1, width: 32, height: 3, backgroundColor: Colors.gold, borderRadius: 2 },
  navLabel: { fontSize: 11, color: Colors.mutedGrey, marginTop: 4 },
  navLabelActive: { color: Colors.gold },

  // Hero
  heroSection: { height: height * 0.52 },
  heroImage: { flex: 1 },
  heroGradient: { flex: 1, paddingHorizontal: 20, paddingBottom: 20 },
  heroTopBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16 },
  logoRow: { flexDirection: 'row', alignItems: 'center' },
  logoText: { fontSize: 20, fontWeight: '700', color: Colors.white, letterSpacing: 4, marginLeft: 8 },
  profileBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.goldSubtle, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.goldMuted },
  heroContent: { flex: 1, justifyContent: 'flex-end', marginBottom: 20 },
  heroLabel: { fontSize: 11, color: Colors.gold, letterSpacing: 3, marginBottom: 8 },
  heroTitle: { fontSize: 38, fontWeight: '700', color: Colors.white, lineHeight: 44, marginBottom: 10 },
  heroSubtitle: { fontSize: 14, color: Colors.softGrey, lineHeight: 20 },
  heroDots: { flexDirection: 'row', justifyContent: 'center' },
  heroDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.mutedGrey, marginHorizontal: 4 },
  heroDotActive: { width: 24, backgroundColor: Colors.gold },

  // Search
  searchContainer: { paddingHorizontal: 20, marginTop: -20, marginBottom: 20 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.cardElevated, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: Colors.goldSubtle },
  searchInput: { flex: 1, fontSize: 15, color: Colors.white, marginLeft: 10 },

  // Quick Stats
  quickStats: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: Colors.cardDark, marginHorizontal: 20, borderRadius: 16, paddingVertical: 18, marginBottom: 20, borderWidth: 1, borderColor: Colors.goldSubtle },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '700', color: Colors.gold },
  statLabel: { fontSize: 10, color: Colors.softGrey, marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 },
  statDivider: { width: 1, height: 32, backgroundColor: Colors.goldMuted },

  // Categories
  categories: { paddingHorizontal: 20, marginBottom: 24 },
  categoryItem: { alignItems: 'center', marginRight: 16 },
  categoryIcon: { width: 56, height: 56, borderRadius: 16, backgroundColor: Colors.cardElevated, alignItems: 'center', justifyContent: 'center', marginBottom: 6, borderWidth: 1, borderColor: Colors.goldSubtle },
  categoryName: { fontSize: 11, color: Colors.softGrey },

  // Section
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: Colors.white },
  seeAll: { fontSize: 13, color: Colors.gold, fontWeight: '600' },
  screenTitle: { fontSize: 28, fontWeight: '700', color: Colors.white, paddingHorizontal: 20 },
  screenSubtitle: { fontSize: 14, color: Colors.softGrey, paddingHorizontal: 20, marginBottom: 20 },

  // Restaurant Card
  restaurantCard: { width: width * 0.65, height: 180, marginRight: 14, borderRadius: 16, overflow: 'hidden' },
  restaurantImage: { flex: 1 },
  restaurantGradient: { flex: 1, padding: 14, justifyContent: 'flex-end' },
  restaurantCategory: { fontSize: 11, color: Colors.gold, fontWeight: '600', marginBottom: 4 },
  restaurantName: { fontSize: 18, fontWeight: '700', color: Colors.white, marginBottom: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: 12, color: Colors.gold, fontWeight: '600', marginLeft: 4 },

  // Activity Card
  activityCard: { flexDirection: 'row', backgroundColor: Colors.cardElevated, borderRadius: 14, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: Colors.goldSubtle },
  activityImage: { width: 80, height: 80, borderRadius: 10 },
  activityContent: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  activityCategory: { fontSize: 10, color: Colors.gold, fontWeight: '600', marginBottom: 2 },
  activityName: { fontSize: 15, fontWeight: '700', color: Colors.white, marginBottom: 4 },
  activityFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  activityPrice: { fontSize: 13, color: Colors.gold, fontWeight: '700' },

  // Investor CTA
  investorCTA: { borderRadius: 20, padding: 24, alignItems: 'center', overflow: 'hidden' },
  ctaBorder: { ...StyleSheet.absoluteFillObject, borderRadius: 20, borderWidth: 1, borderColor: Colors.gold },
  ctaLabel: { fontSize: 10, color: Colors.gold, letterSpacing: 2, marginBottom: 6 },
  ctaTitle: { fontSize: 22, fontWeight: '700', color: Colors.white, marginBottom: 8 },
  ctaText: { fontSize: 13, color: Colors.softGrey, textAlign: 'center', marginBottom: 18 },
  ctaButton: { borderRadius: 12, overflow: 'hidden' },
  ctaButtonBg: { paddingHorizontal: 24, paddingVertical: 12 },
  ctaButtonText: { fontSize: 13, fontWeight: '700', color: Colors.deepNavy, letterSpacing: 1 },

  // List Card
  listCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.cardElevated, borderRadius: 14, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: Colors.goldSubtle },
  listImage: { width: 70, height: 70, borderRadius: 10 },
  listContent: { flex: 1, marginLeft: 12 },
  listCategory: { fontSize: 10, color: Colors.gold, fontWeight: '600' },
  listName: { fontSize: 15, fontWeight: '700', color: Colors.white, marginVertical: 2 },
  listDesc: { fontSize: 11, color: Colors.softGrey },

  // Event Card
  eventCard: { marginBottom: 12, borderRadius: 16, overflow: 'hidden' },
  eventCardFeatured: { marginBottom: 16 },
  eventCardBg: { padding: 18, borderWidth: 1, borderColor: Colors.goldSubtle, borderRadius: 16 },
  eventBadge: { alignSelf: 'flex-start', backgroundColor: Colors.goldSubtle, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 10 },
  eventBadgeText: { fontSize: 9, color: Colors.gold, fontWeight: '700', letterSpacing: 1 },
  eventName: { fontSize: 18, fontWeight: '700', color: Colors.white, marginBottom: 8 },
  eventMeta: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  eventDate: { fontSize: 13, color: Colors.gold, marginLeft: 6, fontWeight: '600' },
  eventVenue: { fontSize: 12, color: Colors.softGrey },
  eventButton: { marginTop: 14, alignSelf: 'flex-start', borderRadius: 10, overflow: 'hidden' },
  eventButtonBg: { paddingHorizontal: 20, paddingVertical: 10 },
  eventButtonText: { fontSize: 12, fontWeight: '700', color: Colors.deepNavy },

  // Investor Header
  investorHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, marginBottom: 20 },
  tierBadge: { borderRadius: 8, overflow: 'hidden' },
  tierBadgeBg: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5 },
  tierText: { fontSize: 10, fontWeight: '700', color: Colors.deepNavy, letterSpacing: 1, marginLeft: 4 },

  // Portfolio Card
  portfolioCard: { borderRadius: 18, padding: 22, alignItems: 'center', overflow: 'hidden' },
  portfolioGoldBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: Colors.gold },
  portfolioLabel: { fontSize: 10, color: Colors.softGrey, letterSpacing: 2, marginBottom: 6 },
  portfolioValue: { fontSize: 38, fontWeight: '700', color: Colors.gold, marginBottom: 6 },
  portfolioChange: { flexDirection: 'row', alignItems: 'center' },
  portfolioChangeText: { fontSize: 14, color: Colors.success, fontWeight: '600', marginLeft: 6 },

  // Stats Grid
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -5 },
  statCard: { width: '50%', padding: 5 },
  statCardBg: { padding: 14, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: Colors.goldSubtle },
  statCardValue: { fontSize: 18, fontWeight: '700', color: Colors.white, marginVertical: 4 },
  statCardLabel: { fontSize: 10, color: Colors.softGrey, textTransform: 'uppercase' },

  // VIP Button
  vipButton: { borderRadius: 14, overflow: 'hidden' },
  vipButtonBg: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14 },
  vipButtonText: { fontSize: 13, fontWeight: '700', color: Colors.deepNavy, letterSpacing: 1, marginHorizontal: 8 },

  // Benefits Grid
  benefitsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12, marginHorizontal: -6 },
  benefitItem: { width: '33.33%', padding: 6, alignItems: 'center' },
  benefitIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: Colors.goldSubtle, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  benefitTitle: { fontSize: 11, color: Colors.softGrey, textAlign: 'center' },
});
