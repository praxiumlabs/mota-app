/**
 * MOTA - Macau of the Americas
 * Premium Casino Resort App
 * 
 * Focus: Guest Experience - Make their stay easy and enjoyable
 * Navigation: Home | Explore | Events | Concierge | Profile
 * 
 * v2.2 - Enhanced slideshow & investor profile
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, Dimensions, StatusBar, ActivityIndicator, RefreshControl, FlatList, TextInput, Modal, Alert, ImageBackground, Linking, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './context/AuthContext';
import BottomSheet from './components/BottomSheet';
import AuthModal from './components/AuthModal';
import api from './services/api';

const { width, height } = Dimensions.get('window');

// PREMIUM COLOR PALETTE
const C = {
  bg: '#0A122A', card: '#101C40', cardLight: '#152347',
  gold: '#D4AF37', goldLight: '#E8C547', goldDark: '#B8952F', goldMuted: 'rgba(212,175,55,0.15)',
  text: '#F5F5F5', textSec: '#A0AEC0', textMuted: '#718096',
  success: '#48BB78', error: '#FC8181', blue: '#4299E1', purple: '#9F7AEA', cyan: '#38B2AC',
  silver: '#C0C0C0', platinum: '#E5E4E2', diamond: '#B9F2FF',
};

const G = {
  gold: ['#E8C547', '#D4AF37', '#B8952F'] as const,
  dark: ['#101C40', '#0A122A'] as const,
  card: ['#152347', '#101C40'] as const,
  overlay: ['transparent', 'rgba(10,18,42,0.3)', 'rgba(10,18,42,0.85)'] as const,
  silver: ['#E8E8E8', '#C0C0C0', '#A8A8A8'] as const,
  platinum: ['#E8E8E8', '#E5E4E2', '#D4D4D4'] as const,
  diamond: ['#E0F7FA', '#B9F2FF', '#81D4FA'] as const,
  black: ['#434343', '#000000'] as const,
  founders: ['#FFD700', '#FFA500', '#FF8C00'] as const,
};

// INVESTOR TIERS DATA
const InvestorTiers = [
  { id: 'silver', name: 'Silver', minInvestment: 50000, discount: 5, color: C.silver, gradient: G.silver, 
    benefits: ['5% Resort Discount', 'Priority Reservations', 'Welcome Amenity', 'Member Events Access'] },
  { id: 'gold', name: 'Gold', minInvestment: 100000, discount: 10, color: C.gold, gradient: G.gold,
    benefits: ['10% Resort Discount', 'Room Upgrades', 'Spa Credits ($200/yr)', 'Golf Access', 'Concierge Priority'] },
  { id: 'platinum', name: 'Platinum', minInvestment: 250000, discount: 20, color: C.platinum, gradient: G.platinum,
    benefits: ['20% Resort Discount', 'Suite Upgrades', 'Spa Credits ($500/yr)', 'Airport Transfers', 'Private Events', 'Yacht Day (1/yr)'] },
  { id: 'diamond', name: 'Diamond', minInvestment: 500000, discount: 30, color: C.diamond, gradient: G.diamond,
    benefits: ['30% Resort Discount', 'Villa Access', 'Unlimited Spa', 'Private Chef (2x/yr)', 'Helicopter Transfer', 'Yacht Week', 'Founders Events'] },
  { id: 'black', name: 'Black', minInvestment: 1000000, discount: 40, color: '#000', gradient: G.black,
    benefits: ['40% Resort Discount', 'Dedicated Villa', 'Personal Concierge', 'Unlimited Transfers', 'Investment Advisory', 'Board Dinners'] },
  { id: 'founders', name: 'Founders', minInvestment: 2500000, discount: 50, color: '#FFD700', gradient: G.founders,
    benefits: ['50% Lifetime Discount', 'Ownership Suite', '24/7 Personal Staff', 'Equity Participation', 'Board Seat Observer', 'Legacy Benefits'] },
];

// HERO SLIDES - Premium resort imagery with elegant titles
const HeroSlides = [
  { 
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200',
    title: 'Paradise Awaits',
    subtitle: 'Belize\'s Premier Destination'
  },
  { 
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200',
    title: 'Unrivaled Luxury',
    subtitle: 'Where Dreams Meet Reality'
  },
  { 
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200',
    title: 'Caribbean Elegance',
    subtitle: 'A World Apart'
  },
  { 
    image: 'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=1200',
    title: 'Suite Dreams',
    subtitle: 'Curated Perfection'
  },
  { 
    image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200',
    title: 'Endless Horizons',
    subtitle: 'Your Story Begins Here'
  },
];

// ROOMS DATA
const Rooms = [
  { id: '1', name: 'Oceanfront Suite', type: 'Suite', beds: 'King', size: '850 sq ft', price: 599, image: 'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=800', amenities: ['Ocean View', 'Butler Service'] },
  { id: '2', name: 'Overwater Villa', type: 'Villa', beds: '2 Kings', size: '1,800 sq ft', price: 1299, image: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800', amenities: ['Glass Floor', 'Private Pool'] },
  { id: '3', name: 'Beachfront Bungalow', type: 'Bungalow', beds: 'King', size: '1,200 sq ft', price: 899, image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800', amenities: ['Beach Access', 'Hammock'] },
  { id: '4', name: 'Presidential Villa', type: 'Villa', beds: '3 Kings', size: '4,500 sq ft', price: 3999, image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800', amenities: ['Private Chef', 'Helipad'] },
];

// CARS DATA
const Cars = [
  { id: '1', name: 'Lamborghini Huracán', price: 1500, image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600', cat: 'Supercar' },
  { id: '2', name: 'Ferrari 488 GTB', price: 1800, image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=600', cat: 'Supercar' },
  { id: '3', name: 'Rolls-Royce Ghost', price: 2000, image: 'https://images.unsplash.com/photo-1563720360172-67b8f3dce741?w=600', cat: 'Luxury' },
  { id: '4', name: 'Bentley Continental', price: 1200, image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600', cat: 'Luxury' },
];

// YACHTS DATA
const Yachts = [
  { id: '1', name: 'Sunset Cruise', duration: '3 hours', price: 2500, image: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=600', capacity: '12 guests' },
  { id: '2', name: 'Island Hopping', duration: 'Full Day', price: 5000, image: 'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=600', capacity: '20 guests' },
  { id: '3', name: 'Private Charter', duration: 'Custom', price: 8000, image: 'https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=600', capacity: '30 guests' },
];

// COMPONENTS
const GoldBtn = ({ title, icon, onPress, lg, style }: any) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={style}>
    <LinearGradient colors={G.gold} style={[s.goldBtn, lg && s.goldBtnLg]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
      <Text style={[s.goldBtnText, lg && s.goldBtnTextLg]}>{title}</Text>
      {icon ? <Ionicons name={icon} size={lg ? 20 : 16} color={C.bg} style={{ marginLeft: 8 }} /> : null}
    </LinearGradient>
  </TouchableOpacity>
);

// INVESTOR CARD COMPONENT
function InvestorCard({ user, tier, compact = false }: { user: any; tier: any; compact?: boolean }) {
  const cardHeight = compact ? 180 : 220;
  
  // Generate investor ID from user id
  const investorId = user?._id ? `MOTA-${user._id.slice(-8).toUpperCase()}` : 'MOTA-00000000';
  
  return (
    <View style={[s.investorCard, { height: cardHeight }]}>
      <LinearGradient 
        colors={tier?.gradient || G.gold} 
        style={s.investorCardGrad}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Card Pattern Overlay */}
        <View style={s.cardPattern}>
          {[...Array(6)].map((_, i) => (
            <View key={i} style={[s.cardPatternLine, { top: 20 + i * 35, opacity: 0.1 }]} />
          ))}
        </View>
        
        {/* Top Row */}
        <View style={s.cardTop}>
          <View>
            <Text style={s.cardLogo}>MOTA</Text>
            <Text style={s.cardLogoSub}>INVESTOR</Text>
          </View>
          <View style={s.cardTierBadge}>
            <MaterialCommunityIcons 
              name={tier?.id === 'diamond' ? 'diamond-stone' : tier?.id === 'platinum' ? 'star-circle' : 'shield-crown'} 
              size={16} 
              color={tier?.id === 'diamond' || tier?.id === 'platinum' ? C.bg : '#FFF'} 
            />
            <Text style={[s.cardTierText, (tier?.id === 'diamond' || tier?.id === 'platinum') && { color: C.bg }]}>
              {tier?.name || 'Member'}
            </Text>
          </View>
        </View>
        
        {/* QR Pattern */}
        <View style={s.cardQR}>
          {[...Array(25)].map((_, i) => (
            <View 
              key={i} 
              style={[
                s.qrBlock, 
                { opacity: Math.random() > 0.5 ? 0.9 : 0.3 },
                (tier?.id === 'diamond' || tier?.id === 'platinum') && { backgroundColor: C.bg }
              ]} 
            />
          ))}
        </View>
        
        {/* Bottom Info */}
        <View style={s.cardBottom}>
          <View>
            <Text style={[s.cardName, (tier?.id === 'diamond' || tier?.id === 'platinum') && { color: C.bg }]}>
              {user?.name || 'Investor'}
            </Text>
            <Text style={[s.cardId, (tier?.id === 'diamond' || tier?.id === 'platinum') && { color: 'rgba(0,0,0,0.6)' }]}>
              {investorId}
            </Text>
          </View>
          <View style={s.cardDiscount}>
            <Text style={[s.cardDiscountValue, (tier?.id === 'diamond' || tier?.id === 'platinum') && { color: C.bg }]}>
              {tier?.discount || 0}%
            </Text>
            <Text style={[s.cardDiscountLabel, (tier?.id === 'diamond' || tier?.id === 'platinum') && { color: 'rgba(0,0,0,0.6)' }]}>
              OFF
            </Text>
          </View>
        </View>
        
        {/* Contactless Icon */}
        <View style={[s.contactlessIcon, (tier?.id === 'diamond' || tier?.id === 'platinum') && { borderColor: 'rgba(0,0,0,0.3)' }]}>
          <MaterialCommunityIcons 
            name="contactless-payment" 
            size={18} 
            color={(tier?.id === 'diamond' || tier?.id === 'platinum') ? C.bg : '#FFF'} 
          />
        </View>
      </LinearGradient>
    </View>
  );
}

// INVESTMENT PROGRESS COMPONENT
function InvestmentProgress({ user, currentTier, nextTier }: { user: any; currentTier: any; nextTier: any | null }) {
  const currentAmount = user?.investmentAmount || 0;
  const nextRequired = nextTier?.minInvestment || currentTier?.minInvestment || 0;
  const currentMin = currentTier?.minInvestment || 0;
  
  const progress = nextTier 
    ? Math.min(100, ((currentAmount - currentMin) / (nextRequired - currentMin)) * 100)
    : 100;
  
  const amountToNext = nextTier ? nextRequired - currentAmount : 0;
  
  return (
    <View style={s.progressSection}>
      <View style={s.progressHeader}>
        <Text style={s.progressTitle}>Investment Progress</Text>
        {nextTier ? (
          <Text style={s.progressNextTier}>Next: {nextTier.name}</Text>
        ) : (
          <Text style={s.progressMaxTier}>Maximum Tier ✨</Text>
        )}
      </View>
      
      <View style={s.progressAmounts}>
        <Text style={s.progressCurrent}>${currentAmount.toLocaleString()}</Text>
        {nextTier ? (
          <Text style={s.progressTarget}>${nextRequired.toLocaleString()}</Text>
        ) : null}
      </View>
      
      <View style={s.progressBarBg}>
        <LinearGradient 
          colors={currentTier?.gradient || G.gold} 
          style={[s.progressBarFill, { width: `${progress}%` }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      </View>
      
      {nextTier ? (
        <Text style={s.progressRemaining}>
          ${amountToNext.toLocaleString()} more to unlock {nextTier.name}
        </Text>
      ) : null}
    </View>
  );
}

// TIER BENEFITS COMPARISON
function TierBenefitsComparison({ currentTier, nextTier }: { currentTier: any; nextTier: any | null }) {
  if (!nextTier) return null;
  
  const newBenefits = nextTier.benefits.filter((b: string) => !currentTier.benefits.includes(b));
  
  return (
    <View style={s.benefitsSection}>
      <Text style={s.benefitsSectionTitle}>Unlock with {nextTier.name}</Text>
      <View style={s.benefitsList}>
        {newBenefits.map((benefit: string, index: number) => (
          <View key={index} style={s.benefitItem}>
            <View style={[s.benefitIcon, { backgroundColor: `${nextTier.color}30` }]}>
              <Ionicons name="lock-open" size={14} color={nextTier.color} />
            </View>
            <Text style={s.benefitText}>{benefit}</Text>
          </View>
        ))}
        <View style={s.benefitItem}>
          <View style={[s.benefitIcon, { backgroundColor: `${nextTier.color}30` }]}>
            <Ionicons name="pricetag" size={14} color={nextTier.color} />
          </View>
          <Text style={s.benefitText}>{nextTier.discount}% Resort Discount (up from {currentTier.discount}%)</Text>
        </View>
      </View>
    </View>
  );
}

// CURRENT BENEFITS LIST
function CurrentBenefits({ tier }: { tier: any }) {
  return (
    <View style={s.currentBenefitsSection}>
      <Text style={s.currentBenefitsTitle}>Your {tier.name} Benefits</Text>
      <View style={s.currentBenefitsList}>
        {tier.benefits.map((benefit: string, index: number) => (
          <View key={index} style={s.currentBenefitItem}>
            <Ionicons name="checkmark-circle" size={18} color={C.success} />
            <Text style={s.currentBenefitText}>{benefit}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// RESERVATION MODAL
function ReservationModal({ visible, onClose, item, type }: any) {
  const { user } = useAuth();
  const [date, setDate] = useState('Today');
  const [time, setTime] = useState('7:00 PM');
  const [guests, setGuests] = useState(2);
  const [loading, setLoading] = useState(false);
  
  if (!item) return null;
  
  const dates = ['Today', 'Tomorrow', 'Sat 14', 'Sun 15'];
  const times = ['6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM'];
  
  const handleBook = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to make a reservation.');
      return;
    }
    
    setLoading(true);
    try {
      await api.createBooking({
        type,
        itemId: item._id || item.id,
        itemName: item.name,
        date,
        time,
        guests,
      });
      Alert.alert('Reservation Confirmed! ✨', `Your ${type} reservation at ${item.name} has been confirmed.`, [{ text: 'Done', onPress: onClose }]);
    } catch (error: any) {
      Alert.alert('Booking Failed', error.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={s.modalOverlay}>
        <LinearGradient colors={[C.card, C.bg]} style={s.resModal}>
          <View style={s.resHeader}>
            <View>
              <Text style={s.resTitle}>{item.name}</Text>
              <Text style={s.resSub}>{type === 'restaurant' ? 'Table Reservation' : 'Book Experience'}</Text>
            </View>
            <TouchableOpacity style={s.closeBtn} onPress={onClose}><Ionicons name="close" size={24} color={C.text} /></TouchableOpacity>
          </View>
          <ScrollView style={s.resContent} showsVerticalScrollIndicator={false}>
            <Text style={s.inputLabel}>Select Date</Text>
            <View style={s.dateRow}>
              {dates.map(d => (
                <TouchableOpacity key={d} onPress={() => setDate(d)} style={[s.dateOpt, date === d && s.dateOptActive]}>
                  {date === d ? <LinearGradient colors={G.gold} style={StyleSheet.absoluteFill} /> : null}
                  <Text style={[s.dateOptText, date === d && s.dateOptTextActive]}>{d}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={s.inputLabel}>Select Time</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {times.map(t => (
                <TouchableOpacity key={t} onPress={() => setTime(t)} style={[s.timeOpt, time === t && s.timeOptActive]}>
                  {time === t ? <LinearGradient colors={G.gold} style={StyleSheet.absoluteFill} /> : null}
                  <Text style={[s.timeOptText, time === t && s.timeOptTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={s.inputLabel}>Number of Guests</Text>
            <View style={s.guestSel}>
              <TouchableOpacity style={s.guestBtn} onPress={() => setGuests(Math.max(1, guests - 1))}><Ionicons name="remove-circle" size={32} color={C.gold} /></TouchableOpacity>
              <Text style={s.guestCount}>{guests}</Text>
              <TouchableOpacity style={s.guestBtn} onPress={() => setGuests(Math.min(20, guests + 1))}><Ionicons name="add-circle" size={32} color={C.gold} /></TouchableOpacity>
            </View>
            <View style={s.summaryCard}>
              <View style={s.summaryRow}><Text style={s.summaryLabel}>Date</Text><Text style={s.summaryValue}>{date}</Text></View>
              <View style={s.summaryRow}><Text style={s.summaryLabel}>Time</Text><Text style={s.summaryValue}>{time}</Text></View>
              <View style={[s.summaryRow, { borderBottomWidth: 0 }]}><Text style={s.summaryLabel}>Guests</Text><Text style={s.summaryValue}>{guests} {guests === 1 ? 'person' : 'people'}</Text></View>
            </View>
          </ScrollView>
          <View style={s.resFooter}>
            <GoldBtn title={loading ? "Booking..." : "Confirm Reservation"} icon="checkmark-circle" lg onPress={handleBook} style={{ width: '100%' }} />
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
}

// PREMIUM HERO SLIDESHOW
function HeroSlideshow({ heroIndex }: { heroIndex: number }) {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    // Fade out then in on slide change
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0.7, duration: 300, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, [heroIndex]);
  
  const slide = HeroSlides[heroIndex];
  
  return (
    <View style={s.heroSection}>
      <Image source={{ uri: slide.image }} style={s.heroImage} />
      
      {/* Gradient Overlay */}
      <LinearGradient 
        colors={['rgba(10,18,42,0.3)', 'rgba(10,18,42,0.1)', 'rgba(10,18,42,0.7)', 'rgba(10,18,42,0.95)']} 
        locations={[0, 0.3, 0.7, 1]}
        style={s.heroOverlay}
      >
        {/* Top Bar */}
        <View style={[s.heroTopBar, { paddingTop: insets.top + 10 }]}>
          <Text style={s.heroLogo}>MOTA</Text>
          <View style={s.heroTopRight}>
            <View style={s.liveBadge}>
              <View style={s.liveDot} />
              <Text style={s.liveText}>BELIZE</Text>
            </View>
          </View>
        </View>
        
        {/* Center Content */}
        <Animated.View style={[s.heroCenter, { opacity: fadeAnim }]}>
          <Text style={s.heroSubtitle}>{slide.subtitle}</Text>
          <Text style={s.heroTitle}>{slide.title}</Text>
          <View style={s.heroLine} />
        </Animated.View>
        
        {/* Bottom Dots */}
        <View style={s.heroBottom}>
          <View style={s.heroDots}>
            {HeroSlides.map((_, i) => (
              <View key={i} style={[s.heroDot, heroIndex === i && s.heroDotActive]} />
            ))}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

// HOME SCREEN
function HomeScreen({ onNavigate, onShowAuth }: { onNavigate: (tab: string, params?: any) => void; onShowAuth: () => void }) {
  const insets = useSafeAreaInsets();
  const { user, getDiscountPercent } = useAuth();
  const [heroIndex, setHeroIndex] = useState(0);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [resType, setResType] = useState<string>('restaurant');
  
  const isLoggedIn = !!user;

  // Hero slideshow
  useEffect(() => {
    const timer = setInterval(() => setHeroIndex(i => (i + 1) % HeroSlides.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = useCallback(async () => {
    try { 
      const [r, a, e] = await Promise.all([
        api.getRestaurants().catch(() => []), 
        api.getActivities().catch(() => []), 
        api.getEvents().catch(() => [])
      ]); 
      setRestaurants(r || []); 
      setActivities(a || []); 
      setEvents(e || []); 
    } finally { 
      setLoading(false); 
      setRefreshing(false); 
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleBooking = (item: any, type: string) => {
    if (!user) {
      onShowAuth();
      return;
    }
    setSelectedItem(item);
    setResType(type);
  };

  // Quick Actions
  const quickActions = [
    { id: 'lodging', icon: 'bed-outline', label: 'Lodging', color: C.gold },
    { id: 'dining', icon: 'restaurant-outline', label: 'Dining', color: C.purple },
    { id: 'experiences', icon: 'compass-outline', label: 'Experiences', color: C.cyan },
    { id: 'gaming', icon: 'game-controller-outline', label: 'Gaming', color: C.success },
  ];

  const handleQuickAction = (id: string) => {
    switch(id) {
      case 'lodging': onNavigate('explore', { tab: 'rooms' }); break;
      case 'dining': onNavigate('explore', { tab: 'dining' }); break;
      case 'experiences': onNavigate('explore', { tab: 'activities' }); break;
      case 'gaming': Alert.alert('Casino', 'Opening soon!'); break;
    }
  };

  if (loading) return <View style={s.loadingContainer}><ActivityIndicator size="large" color={C.gold} /></View>;

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={C.gold} />}
      >
        {/* PREMIUM HERO */}
        <HeroSlideshow heroIndex={heroIndex} />

        {/* QUICK ACTIONS */}
        <View style={s.quickActionsSection}>
          <View style={s.quickActionsGrid}>
            {quickActions.map(action => (
              <TouchableOpacity 
                key={action.id} 
                style={s.quickActionItem} 
                onPress={() => handleQuickAction(action.id)}
                activeOpacity={0.7}
              >
                <LinearGradient colors={G.card} style={s.quickActionBubble}>
                  <View style={[s.quickActionIconWrap, { backgroundColor: `${action.color}20` }]}>
                    <Ionicons name={action.icon as any} size={28} color={action.color} />
                  </View>
                </LinearGradient>
                <Text style={s.quickActionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* FEATURED ROOMS */}
        <View style={s.section}>
          <View style={s.secHeader}>
            <Text style={s.secTitle}>Featured Suites</Text>
            <TouchableOpacity onPress={() => onNavigate('explore', { tab: 'rooms' })}>
              <Text style={s.secAction}>View All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={Rooms.slice(0, 4)}
            contentContainerStyle={{ paddingLeft: 20 }}
            renderItem={({ item }) => (
              <TouchableOpacity style={s.roomCard} activeOpacity={0.9}>
                <ImageBackground source={{ uri: item.image }} style={s.roomImage} imageStyle={{ borderRadius: 20 }}>
                  <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={s.roomOverlay}>
                    <View>
                      <View style={s.roomAmenities}>
                        {item.amenities.map((a, i) => (
                          <View key={i} style={s.amenityTag}><Text style={s.amenityText}>{a}</Text></View>
                        ))}
                      </View>
                      <Text style={s.roomName}>{item.name}</Text>
                      <Text style={s.roomDetails}>{item.type} • {item.beds} • {item.size}</Text>
                    </View>
                    <View style={s.roomFooter}>
                      <Text style={s.roomPrice}>${item.price}</Text>
                      <Text style={s.perNight}>/ night</Text>
                    </View>
                  </LinearGradient>
                </ImageBackground>
              </TouchableOpacity>
            )}
            keyExtractor={item => item.id}
          />
        </View>

        {/* DINING */}
        <View style={s.section}>
          <View style={s.secHeader}>
            <Text style={s.secTitle}>Dining</Text>
            <TouchableOpacity onPress={() => onNavigate('explore', { tab: 'dining' })}>
              <Text style={s.secAction}>View All</Text>
            </TouchableOpacity>
          </View>
          {(restaurants.length > 0 ? restaurants : [
            { _id: '1', name: 'The Pearl', category: 'Fine Dining', cuisine: 'Seafood', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600', priceRange: '$$$$' },
            { _id: '2', name: 'Jade Garden', category: 'Asian', cuisine: 'Pan-Asian', image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600', priceRange: '$$$' },
          ]).slice(0, 3).map((rest: any) => (
            <TouchableOpacity key={rest._id} style={s.listCard} onPress={() => handleBooking(rest, 'restaurant')} activeOpacity={0.85}>
              <Image source={{ uri: rest.image }} style={s.listImg} />
              <View style={s.listContent}>
                <Text style={s.listName}>{rest.name}</Text>
                <Text style={s.listCat}>{rest.cuisine || rest.category}</Text>
                <View style={s.listFooter}>
                  <Text style={s.listPrice}>{rest.priceRange || '$$$'}</Text>
                  <View style={s.listRating}>
                    <Ionicons name="star" size={14} color={C.gold} />
                    <Text style={s.listRatingText}>4.8</Text>
                  </View>
                </View>
              </View>
              <View style={s.listAction}>
                <Ionicons name="chevron-forward" size={20} color={C.textMuted} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* UPCOMING EVENTS */}
        <View style={s.section}>
          <View style={s.secHeader}>
            <Text style={s.secTitle}>Upcoming Events</Text>
            <TouchableOpacity onPress={() => onNavigate('events')}>
              <Text style={s.secAction}>View All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={events.length > 0 ? events : [
              { _id: '1', name: 'Costa Maya Festival', image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800', date: '2025-08-01', venue: 'Beach Pavilion' },
              { _id: '2', name: 'Lobster Fest', image: 'https://images.unsplash.com/photo-1559742811-822873691df8?w=800', date: '2025-06-15', venue: 'Main Restaurant' },
            ]}
            contentContainerStyle={{ paddingLeft: 20 }}
            renderItem={({ item }: any) => (
              <TouchableOpacity style={s.eventCard} activeOpacity={0.9} onPress={() => onNavigate('events')}>
                <Image source={{ uri: item.image }} style={s.eventImage} />
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={s.eventOverlay}>
                  <Text style={s.eventDate}>{item.date ? new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD'}</Text>
                  <Text style={s.eventName}>{item.name}</Text>
                  <Text style={s.eventVenue}>{item.venue || 'MOTA Resort'}</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
            keyExtractor={(item: any) => item._id}
          />
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      <ReservationModal 
        visible={!!selectedItem} 
        onClose={() => setSelectedItem(null)} 
        item={selectedItem} 
        type={resType} 
      />
    </View>
  );
}

// EXPLORE SCREEN
function ExploreScreen({ onShowAuth, initialTab }: { onShowAuth: () => void; initialTab?: string }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab || 'rooms');
  const [search, setSearch] = useState('');
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [resType, setResType] = useState<string>('restaurant');

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { if (initialTab) setActiveTab(initialTab); }, [initialTab]);

  const fetchData = async () => { 
    try { 
      const [r, a] = await Promise.all([
        api.getRestaurants().catch(() => []), 
        api.getActivities().catch(() => [])
      ]); 
      setRestaurants(r || []); 
      setActivities(a || []); 
    } finally { 
      setLoading(false); 
    } 
  };

  const handleBooking = (item: any, type: string) => {
    if (!user) {
      onShowAuth();
      return;
    }
    setSelectedItem(item);
    setResType(type);
  };

  const tabs = [
    { id: 'rooms', icon: 'bed-outline', label: 'Rooms' },
    { id: 'dining', icon: 'restaurant-outline', label: 'Dining' },
    { id: 'activities', icon: 'compass-outline', label: 'Activities' },
    { id: 'rentals', icon: 'car-sport-outline', label: 'Rentals' },
  ];

  const getItems = () => {
    switch(activeTab) {
      case 'rooms': return Rooms.map(r => ({ ...r, type: 'room' }));
      case 'dining': return (restaurants.length > 0 ? restaurants : [
        { _id: '1', name: 'The Pearl', category: 'Fine Dining', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600' },
        { _id: '2', name: 'Jade Garden', category: 'Pan-Asian', image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600' },
        { _id: '3', name: 'Steakhouse', category: 'American', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600' },
      ]).map(r => ({ ...r, type: 'restaurant' }));
      case 'activities': return (activities.length > 0 ? activities : [
        { _id: '1', name: 'Spa & Wellness', category: 'Relaxation', image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600' },
        { _id: '2', name: 'Scuba Diving', category: 'Water Sports', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600' },
        { _id: '3', name: 'Golf Course', category: 'Sports', image: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=600' },
      ]).map(a => ({ ...a, type: 'activity' }));
      case 'rentals': return Cars.map(c => ({ ...c, type: 'rental', category: c.cat }));
      default: return [];
    }
  };

  const items = getItems().filter(item => !search || item.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <View style={s.container}>
      <LinearGradient colors={[C.bg, C.card, C.bg]} style={StyleSheet.absoluteFill} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + 10, paddingBottom: 120 }}>
        <View style={s.exploreHeader}>
          <Text style={s.exploreTitle}>Explore</Text>
        </View>

        <View style={s.searchBar}>
          <Ionicons name="search" size={20} color={C.textMuted} />
          <TextInput style={s.searchInput} placeholder="Search..." placeholderTextColor={C.textMuted} value={search} onChangeText={setSearch} />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={20} color={C.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 20, paddingRight: 10 }} style={s.tabsScroll}>
          {tabs.map(tab => (
            <TouchableOpacity key={tab.id} onPress={() => setActiveTab(tab.id)} style={[s.tabPill, activeTab === tab.id && s.tabPillActive]} activeOpacity={0.8}>
              {activeTab === tab.id ? <LinearGradient colors={G.gold} style={StyleSheet.absoluteFill} /> : null}
              <Ionicons name={tab.icon as any} size={18} color={activeTab === tab.id ? C.bg : C.textSec} />
              <Text style={[s.tabPillText, activeTab === tab.id && s.tabPillTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={{ paddingHorizontal: 20 }}>
          {loading ? (
            <ActivityIndicator color={C.gold} style={{ marginTop: 40 }} />
          ) : items.length === 0 ? (
            <View style={s.emptyState}>
              <Ionicons name="search-outline" size={48} color={C.textMuted} />
              <Text style={s.emptyStateTitle}>No results found</Text>
            </View>
          ) : (
            items.map((item: any, index) => (
              <TouchableOpacity 
                key={item._id || item.id || index} 
                style={s.exploreListCard} 
                activeOpacity={0.85}
                onPress={() => item.type === 'restaurant' ? handleBooking(item, 'restaurant') : item.type === 'activity' ? handleBooking(item, 'activity') : null}
              >
                <Image source={{ uri: item.image }} style={s.listImg} />
                <View style={s.listContent}>
                  <Text style={s.listName}>{item.name}</Text>
                  <Text style={s.listCat}>{item.category || item.cuisine || item.type}</Text>
                  {item.price ? (
                    <View style={s.listFooter}>
                      <Text style={s.listPrice}>${typeof item.price === 'number' ? item.price.toLocaleString() : item.price}</Text>
                      {item.type === 'rental' ? <Text style={s.listPriceUnit}>/day</Text> : item.type === 'room' ? <Text style={s.listPriceUnit}>/night</Text> : null}
                    </View>
                  ) : null}
                </View>
                <View style={s.listAction}>
                  <Ionicons name="chevron-forward" size={20} color={C.textMuted} />
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      <ReservationModal visible={!!selectedItem} onClose={() => setSelectedItem(null)} item={selectedItem} type={resType} />
    </View>
  );
}

// EVENTS SCREEN
function EventsScreen({ onShowAuth }: { onShowAuth: () => void }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await api.getEvents();
        setEvents(data || []);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleRSVP = (event: any) => {
    if (!user) {
      onShowAuth();
      return;
    }
    Alert.alert('RSVP Confirmed!', `You're registered for ${event.name}`);
  };

  const displayEvents = events.length > 0 ? events : [
    { _id: '1', name: 'Costa Maya Festival', description: 'Annual celebration of Central American culture', image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800', date: '2025-08-01', venue: 'Beach Pavilion' },
    { _id: '2', name: 'Lobster Fest', description: 'Week-long celebration of lobster season', image: 'https://images.unsplash.com/photo-1559742811-822873691df8?w=800', date: '2025-06-15', venue: 'Main Restaurant' },
    { _id: '3', name: 'New Year Gala', description: 'Exclusive celebration to ring in the new year', image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800', date: '2025-12-31', venue: 'Grand Ballroom' },
  ];

  return (
    <View style={s.container}>
      <LinearGradient colors={[C.bg, C.card, C.bg]} style={StyleSheet.absoluteFill} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + 10, paddingBottom: 120 }}>
        <View style={s.exploreHeader}>
          <Text style={s.exploreTitle}>Events</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={C.gold} style={{ marginTop: 40 }} />
        ) : (
          <View style={{ paddingHorizontal: 20 }}>
            {displayEvents.map((event: any) => (
              <TouchableOpacity key={event._id} style={s.eventListCard} activeOpacity={0.9}>
                <Image source={{ uri: event.image }} style={s.eventListImg} />
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.95)']} style={s.eventListOverlay}>
                  <View style={s.eventListDate}>
                    <Text style={s.eventListMonth}>
                      {event.date ? new Date(event.date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase() : 'TBD'}
                    </Text>
                    <Text style={s.eventListDay}>
                      {event.date ? new Date(event.date).getDate() : '--'}
                    </Text>
                  </View>
                  <View style={s.eventListContent}>
                    <Text style={s.eventListName}>{event.name}</Text>
                    <Text style={s.eventListDesc}>{event.description}</Text>
                    <View style={s.eventListFooter}>
                      <View style={s.eventListVenue}>
                        <Ionicons name="location-outline" size={14} color={C.textSec} />
                        <Text style={s.eventListVenueText}>{event.venue || 'MOTA Resort'}</Text>
                      </View>
                      <TouchableOpacity onPress={() => handleRSVP(event)}>
                        <LinearGradient colors={G.gold} style={s.rsvpBtn}>
                          <Text style={s.rsvpBtnText}>RSVP</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// CONCIERGE SCREEN
function ConciergeScreen({ onShowAuth }: { onShowAuth: () => void }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const handleService = (service: string) => {
    if (!user) {
      onShowAuth();
      return;
    }
    Alert.alert(service, 'Our concierge team will contact you shortly.');
  };

  const services = [
    { id: 'airport', icon: 'airplane-outline', title: 'Airport Transfers', desc: 'Luxury pickup & dropoff' },
    { id: 'dining', icon: 'restaurant-outline', title: 'Dining Reservations', desc: 'VIP table arrangements' },
    { id: 'spa', icon: 'fitness-outline', title: 'Spa Appointments', desc: 'Wellness & relaxation' },
    { id: 'tours', icon: 'map-outline', title: 'Private Tours', desc: 'Guided local experiences' },
    { id: 'tickets', icon: 'ticket-outline', title: 'Event Tickets', desc: 'Shows & entertainment' },
    { id: 'special', icon: 'gift-outline', title: 'Special Requests', desc: 'Celebrations & more' },
  ];

  return (
    <View style={s.container}>
      <LinearGradient colors={[C.bg, C.card, C.bg]} style={StyleSheet.absoluteFill} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + 10, paddingBottom: 120 }}>
        <View style={s.exploreHeader}>
          <Text style={s.exploreTitle}>Concierge</Text>
        </View>

        <View style={s.conciergeSection}>
          <Text style={s.conciergeSectionTitle}>Services</Text>
          <View style={s.servicesGrid}>
            {services.map(service => (
              <TouchableOpacity key={service.id} style={s.serviceCard} onPress={() => handleService(service.title)} activeOpacity={0.85}>
                <LinearGradient colors={G.card} style={s.serviceCardGrad}>
                  <View style={s.serviceIconWrap}>
                    <Ionicons name={service.icon as any} size={28} color={C.gold} />
                  </View>
                  <Text style={s.serviceTitle}>{service.title}</Text>
                  <Text style={s.serviceDesc}>{service.desc}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={s.conciergeSection}>
          <Text style={s.conciergeSectionTitle}>PCH Exotic Fleet</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={Cars}
            contentContainerStyle={{ marginTop: 16 }}
            renderItem={({ item }) => (
              <TouchableOpacity style={s.carCard} activeOpacity={0.9} onPress={() => handleService(`${item.name} Rental`)}>
                <Image source={{ uri: item.image }} style={s.carImage} />
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={s.carOverlay}>
                  <Text style={s.carName}>{item.name}</Text>
                  <View style={s.carFooter}>
                    <Text style={s.carPrice}>${item.price}</Text>
                    <Text style={s.carPriceUnit}>/day</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            )}
            keyExtractor={item => item.id}
          />
        </View>

        <View style={s.conciergeSection}>
          <Text style={s.conciergeSectionTitle}>Yacht Charters</Text>
          {Yachts.map(yacht => (
            <TouchableOpacity key={yacht.id} style={s.yachtCard} activeOpacity={0.85} onPress={() => handleService(`${yacht.name} Charter`)}>
              <Image source={{ uri: yacht.image }} style={s.yachtImage} />
              <View style={s.yachtContent}>
                <Text style={s.yachtName}>{yacht.name}</Text>
                <Text style={s.yachtDetails}>{yacht.duration} • {yacht.capacity}</Text>
                <Text style={s.yachtPrice}>From ${yacht.price.toLocaleString()}</Text>
              </View>
              <View style={s.yachtAction}>
                <Ionicons name="chevron-forward" size={20} color={C.textMuted} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ paddingHorizontal: 20, marginTop: 10 }}>
          <TouchableOpacity onPress={() => handleService('Personal Concierge')} activeOpacity={0.85}>
            <LinearGradient colors={G.gold} style={s.contactConciergeBtn}>
              <MaterialCommunityIcons name="headset" size={24} color={C.bg} />
              <View style={{ marginLeft: 16, flex: 1 }}>
                <Text style={s.contactConciergeTitle}>Contact Concierge</Text>
                <Text style={s.contactConciergeSub}>Available 24/7</Text>
              </View>
              <Ionicons name="call" size={20} color={C.bg} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// PROFILE SCREEN - Enhanced for Investors
function ProfileScreen({ onShowAuthModal }: { onShowAuthModal: () => void }) {
  const insets = useSafeAreaInsets();
  const { user, logout, getDiscountPercent, refreshUser, isInvestor } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const isLoggedIn = !!user;
  const disc = getDiscountPercent();
  
  // Get investor tier info
  const investorTierName = user?.investorTier || 'silver';
  const currentTier = InvestorTiers.find(t => t.id === investorTierName) || InvestorTiers[0];
  const currentTierIndex = InvestorTiers.findIndex(t => t.id === investorTierName);
  const nextTier = currentTierIndex < InvestorTiers.length - 1 ? InvestorTiers[currentTierIndex + 1] : null;
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshUser();
    setRefreshing(false);
  };

  // Guest View
  if (!isLoggedIn) return (
    <View style={s.container}>
      <LinearGradient colors={[C.bg, C.card, C.bg]} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={[s.profileGuestContainer, { paddingTop: insets.top + 40 }]}>
        <View style={s.profileGuestIcon}>
          <LinearGradient colors={G.gold} style={s.profileGuestIconGrad}>
            <MaterialCommunityIcons name="account-outline" size={48} color={C.bg} />
          </LinearGradient>
        </View>
        <Text style={s.profileGuestTitle}>Welcome to MOTA</Text>
        <Text style={s.profileGuestSub}>Sign in to access your bookings, favorites, and personalized recommendations</Text>
        <View style={s.profileGuestBenefits}>
          {[
            { icon: 'calendar', text: 'Manage reservations' },
            { icon: 'heart', text: 'Save your favorites' },
            { icon: 'ticket', text: 'Access your tickets' },
            { icon: 'time', text: 'View booking history' },
          ].map((b, i) => (
            <View key={i} style={s.profileGuestBenefit}>
              <View style={s.profileGuestBenefitIcon}>
                <Ionicons name={b.icon as any} size={20} color={C.gold} />
              </View>
              <Text style={s.profileGuestBenefitText}>{b.text}</Text>
            </View>
          ))}
        </View>
        <GoldBtn title="Sign In" icon="arrow-forward" lg onPress={onShowAuthModal} style={{ width: '100%' }} />
        <TouchableOpacity onPress={onShowAuthModal} style={{ marginTop: 16 }}>
          <Text style={s.profileGuestSignIn}>Don't have an account? <Text style={{ color: C.gold }}>Create one</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  // INVESTOR PROFILE VIEW
  if (isInvestor) {
    return (
      <View style={s.container}>
        <LinearGradient colors={[C.bg, C.card, C.bg]} style={StyleSheet.absoluteFill} />
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 120 }} 
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={C.gold} />}
        >
          {/* Investor Header */}
          <View style={s.investorProfileHeader}>
            <Text style={s.investorWelcome}>Welcome back,</Text>
            <Text style={s.investorName}>{user?.name || 'Investor'}</Text>
            <View style={[s.investorBadge, { backgroundColor: `${currentTier.color}30` }]}>
              <MaterialCommunityIcons 
                name={currentTier.id === 'diamond' ? 'diamond-stone' : currentTier.id === 'platinum' ? 'star-circle' : 'shield-crown'} 
                size={16} 
                color={currentTier.color} 
              />
              <Text style={[s.investorBadgeText, { color: currentTier.color }]}>{currentTier.name} Investor</Text>
            </View>
          </View>
          
          {/* Investor Card */}
          <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
            <InvestorCard user={user} tier={currentTier} />
          </View>
          
          {/* Investment Progress */}
          <View style={{ paddingHorizontal: 20 }}>
            <InvestmentProgress user={user} currentTier={currentTier} nextTier={nextTier} />
          </View>
          
          {/* Quick Stats */}
          <View style={s.investorStats}>
            <View style={s.investorStatCard}>
              <Text style={s.investorStatValue}>${(user?.investmentAmount || 0).toLocaleString()}</Text>
              <Text style={s.investorStatLabel}>Invested</Text>
            </View>
            <View style={s.investorStatCard}>
              <Text style={s.investorStatValue}>${(user?.portfolioValue || 0).toLocaleString()}</Text>
              <Text style={s.investorStatLabel}>Portfolio</Text>
            </View>
            <View style={s.investorStatCard}>
              <Text style={[s.investorStatValue, { color: C.success }]}>{disc}%</Text>
              <Text style={s.investorStatLabel}>Discount</Text>
            </View>
          </View>
          
          {/* Next Tier Benefits */}
          {nextTier ? (
            <View style={{ paddingHorizontal: 20 }}>
              <TierBenefitsComparison currentTier={currentTier} nextTier={nextTier} />
            </View>
          ) : null}
          
          {/* Current Benefits */}
          <View style={{ paddingHorizontal: 20 }}>
            <CurrentBenefits tier={currentTier} />
          </View>
          
          {/* Quick Actions for Investors */}
          <View style={s.investorActions}>
            <Text style={s.investorActionsTitle}>Quick Actions</Text>
            <View style={s.investorActionsGrid}>
              {[
                { icon: 'document-text', label: 'Documents', action: () => Alert.alert('Documents', 'Investment documents coming soon') },
                { icon: 'headset', label: 'Concierge', action: () => Alert.alert('VIP Concierge', 'Your dedicated concierge will contact you') },
                { icon: 'gift', label: 'Benefits', action: () => Alert.alert('Benefits', 'View your exclusive benefits') },
                { icon: 'trending-up', label: 'Invest More', action: () => Linking.openURL('https://macauoftheamericas.com') },
              ].map((action, i) => (
                <TouchableOpacity key={i} style={s.investorActionBtn} onPress={action.action} activeOpacity={0.8}>
                  <LinearGradient colors={G.card} style={s.investorActionGrad}>
                    <Ionicons name={action.icon as any} size={24} color={C.gold} />
                    <Text style={s.investorActionLabel}>{action.label}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* Settings & Support */}
          {[
            { 
              title: 'Settings', 
              items: [
                { icon: 'person-outline', label: 'Edit Profile' },
                { icon: 'notifications-outline', label: 'Notifications' },
                { icon: 'lock-closed-outline', label: 'Privacy & Security' },
              ] 
            },
            { 
              title: 'Support', 
              items: [
                { icon: 'help-circle-outline', label: 'Help Center' },
                { icon: 'chatbubble-outline', label: 'Contact Us' },
              ] 
            },
          ].map((sec, si) => (
            <View key={si} style={s.profileSection}>
              <Text style={s.profileSecTitle}>{sec.title}</Text>
              <LinearGradient colors={G.card} style={s.profileMenu}>
                {sec.items.map((item: any, ii) => (
                  <TouchableOpacity 
                    key={ii} 
                    style={[s.profileMenuItem, ii < sec.items.length - 1 && s.profileMenuItemBorder]} 
                    onPress={() => Alert.alert(item.label)}
                  >
                    <View style={s.profileMenuItemIcon}>
                      <Ionicons name={item.icon} size={22} color={C.gold} />
                    </View>
                    <Text style={s.profileMenuItemLabel}>{item.label}</Text>
                    <Ionicons name="chevron-forward" size={20} color={C.textMuted} />
                  </TouchableOpacity>
                ))}
              </LinearGradient>
            </View>
          ))}

          <View style={s.profileSection}>
            <TouchableOpacity 
              style={s.logoutBtn} 
              onPress={() => Alert.alert('Sign Out', 'Are you sure?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Sign Out', style: 'destructive', onPress: logout }
              ])}
            >
              <Ionicons name="log-out-outline" size={22} color={C.error} />
              <Text style={s.logoutBtnText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
          <Text style={s.profileVersion}>MOTA v2.2</Text>
        </ScrollView>
      </View>
    );
  }

  // MEMBER PROFILE VIEW (non-investor)
  return (
    <View style={s.container}>
      <LinearGradient colors={[C.bg, C.card, C.bg]} style={StyleSheet.absoluteFill} />
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 120 }} 
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={C.gold} />}
      >
        <View style={s.profileHeader}>
          <LinearGradient colors={G.gold} style={s.profileAvatar}>
            <Text style={s.profileAvatarText}>{user?.name ? user.name[0].toUpperCase() : 'U'}</Text>
          </LinearGradient>
          <Text style={s.profileName}>{user?.name || 'User'}</Text>
          <Text style={s.profileEmail}>{user?.email || ''}</Text>
          <View style={s.memberBadge}>
            <Ionicons name="star" size={14} color={C.gold} />
            <Text style={s.memberBadgeText}>Member</Text>
          </View>
        </View>

        <View style={s.profileStats}>
          {[
            { v: '0', l: 'Bookings' },
            { v: '0', l: 'Favorites' },
            { v: '0', l: 'Reviews' },
          ].map((st, i) => (
            <View key={i} style={s.profileStatCard}>
              <Text style={s.profileStatV}>{st.v}</Text>
              <Text style={s.profileStatL}>{st.l}</Text>
            </View>
          ))}
        </View>

        {[
          { 
            title: 'Account', 
            items: [
              { icon: 'person-outline', label: 'Edit Profile' },
              { icon: 'heart-outline', label: 'Favorites' },
              { icon: 'time-outline', label: 'Booking History' },
            ] 
          },
          { 
            title: 'Settings', 
            items: [
              { icon: 'notifications-outline', label: 'Notifications' },
              { icon: 'lock-closed-outline', label: 'Privacy & Security' },
              { icon: 'language-outline', label: 'Language' },
            ] 
          },
          { 
            title: 'Support', 
            items: [
              { icon: 'help-circle-outline', label: 'Help Center' },
              { icon: 'chatbubble-outline', label: 'Contact Us' },
              { icon: 'document-text-outline', label: 'Terms & Conditions' },
            ] 
          },
        ].map((sec, si) => (
          <View key={si} style={s.profileSection}>
            <Text style={s.profileSecTitle}>{sec.title}</Text>
            <LinearGradient colors={G.card} style={s.profileMenu}>
              {sec.items.map((item: any, ii) => (
                <TouchableOpacity 
                  key={ii} 
                  style={[s.profileMenuItem, ii < sec.items.length - 1 && s.profileMenuItemBorder]} 
                  onPress={() => Alert.alert(item.label)}
                >
                  <View style={s.profileMenuItemIcon}>
                    <Ionicons name={item.icon} size={22} color={C.gold} />
                  </View>
                  <Text style={s.profileMenuItemLabel}>{item.label}</Text>
                  <Ionicons name="chevron-forward" size={20} color={C.textMuted} />
                </TouchableOpacity>
              ))}
            </LinearGradient>
          </View>
        ))}

        <View style={s.profileSection}>
          <TouchableOpacity 
            style={s.logoutBtn} 
            onPress={() => Alert.alert('Sign Out', 'Are you sure?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Sign Out', style: 'destructive', onPress: logout }
            ])}
          >
            <Ionicons name="log-out-outline" size={22} color={C.error} />
            <Text style={s.logoutBtnText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
        <Text style={s.profileVersion}>MOTA v2.2</Text>
      </ScrollView>
    </View>
  );
}

// MAIN APP
function MainApp() {
  const [activeTab, setActiveTab] = useState('home');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [exploreParams, setExploreParams] = useState<any>({});
  const insets = useSafeAreaInsets();

  const handleNavigate = (tab: string, params?: any) => { 
    if (params) setExploreParams(params); 
    setActiveTab(tab); 
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'explore': return <ExploreScreen onShowAuth={() => setShowAuthModal(true)} initialTab={exploreParams?.tab} />;
      case 'events': return <EventsScreen onShowAuth={() => setShowAuthModal(true)} />;
      case 'concierge': return <ConciergeScreen onShowAuth={() => setShowAuthModal(true)} />;
      case 'profile': return <ProfileScreen onShowAuthModal={() => setShowAuthModal(true)} />;
      default: return <HomeScreen onShowAuth={() => setShowAuthModal(true)} onNavigate={handleNavigate} />;
    }
  };

  const navItems = [
    { id: 'home', icon: 'home', label: 'Home' },
    { id: 'explore', icon: 'compass', label: 'Explore' },
    { id: 'events', icon: 'calendar', label: 'Events' },
    { id: 'concierge', icon: 'headset', label: 'Concierge' },
    { id: 'profile', icon: 'person', label: 'Profile' },
  ];

  return (
    <View style={s.container}>
      {renderContent()}
      
      <View style={[s.navBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <LinearGradient colors={['rgba(10,18,42,0.95)', 'rgba(10,18,42,0.99)']} style={StyleSheet.absoluteFill} />
        {navItems.map(item => (
          <TouchableOpacity 
            key={item.id} 
            style={s.navItem} 
            onPress={() => { setExploreParams({}); setActiveTab(item.id); }} 
            activeOpacity={0.7}
          >
            {activeTab === item.id ? (
              <LinearGradient colors={G.gold} style={s.navItemActive}>
                <Ionicons name={item.icon as any} size={20} color={C.bg} />
              </LinearGradient>
            ) : (
              <Ionicons name={`${item.icon}-outline` as any} size={20} color={C.textMuted} />
            )}
            <Text style={[s.navLabel, activeTab === item.id && s.navLabelActive]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <BottomSheet isVisible={showAuthModal} onClose={() => setShowAuthModal(false)}>
        <AuthModal onClose={() => setShowAuthModal(false)} />
      </BottomSheet>
    </View>
  );
}

// STYLES
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  loadingContainer: { flex: 1, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center' },
  
  // Premium Hero
  heroSection: { height: height * 0.48 },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: { ...StyleSheet.absoluteFillObject },
  heroTopBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24 },
  heroLogo: { fontSize: 32, fontWeight: '800', color: C.gold, letterSpacing: 8 },
  heroTopRight: { flexDirection: 'row', alignItems: 'center' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.success, marginRight: 6 },
  liveText: { fontSize: 11, fontWeight: '700', color: C.text, letterSpacing: 1 },
  heroCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  heroSubtitle: { fontSize: 14, fontWeight: '500', color: C.gold, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 },
  heroTitle: { fontSize: 38, fontWeight: '300', color: C.text, textAlign: 'center', letterSpacing: 1, lineHeight: 46 },
  heroLine: { width: 60, height: 2, backgroundColor: C.gold, marginTop: 20, borderRadius: 1 },
  heroBottom: { paddingBottom: 30, alignItems: 'center' },
  heroDots: { flexDirection: 'row', justifyContent: 'center' },
  heroDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: 4 },
  heroDotActive: { backgroundColor: C.gold, width: 24 },

  // Quick Actions
  quickActionsSection: { marginTop: -30, paddingHorizontal: 20, marginBottom: 24 },
  quickActionsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  quickActionItem: { alignItems: 'center', width: (width - 60) / 4 },
  quickActionBubble: { width: 70, height: 70, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  quickActionIconWrap: { width: 50, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  quickActionLabel: { fontSize: 12, fontWeight: '600', color: C.text, textAlign: 'center' },

  // Sections
  section: { marginBottom: 28 },
  secHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 },
  secTitle: { fontSize: 20, fontWeight: '700', color: C.text },
  secAction: { fontSize: 14, fontWeight: '600', color: C.gold },

  // Room Cards
  roomCard: { width: width * 0.72, marginRight: 16, borderRadius: 20, overflow: 'hidden' },
  roomImage: { width: '100%', height: 260 },
  roomOverlay: { flex: 1, padding: 18, justifyContent: 'flex-end' },
  roomName: { fontSize: 18, fontWeight: '700', color: C.text, marginTop: 8 },
  roomDetails: { fontSize: 13, color: C.textSec, marginTop: 4 },
  roomAmenities: { flexDirection: 'row' },
  amenityTag: { backgroundColor: C.goldMuted, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginRight: 8 },
  amenityText: { fontSize: 11, color: C.gold, fontWeight: '500' },
  roomFooter: { flexDirection: 'row', alignItems: 'baseline', marginTop: 12 },
  roomPrice: { fontSize: 22, fontWeight: '700', color: C.gold },
  perNight: { fontSize: 13, color: C.textSec, marginLeft: 4 },

  // List Cards
  listCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 16, marginBottom: 12, marginHorizontal: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  exploreListCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 16, marginBottom: 12, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  listImg: { width: 90, height: 90 },
  listContent: { flex: 1, padding: 14 },
  listName: { fontSize: 16, fontWeight: '700', color: C.text },
  listCat: { fontSize: 13, color: C.textSec, marginTop: 2 },
  listFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  listPrice: { fontSize: 15, fontWeight: '700', color: C.gold },
  listPriceUnit: { fontSize: 12, color: C.textSec, marginLeft: 2 },
  listRating: { flexDirection: 'row', alignItems: 'center', marginLeft: 12 },
  listRatingText: { fontSize: 13, color: C.text, marginLeft: 4, fontWeight: '600' },
  listAction: { paddingRight: 16 },

  // Event Cards
  eventCard: { width: 200, height: 240, marginRight: 16, borderRadius: 20, overflow: 'hidden' },
  eventImage: { width: '100%', height: '100%' },
  eventOverlay: { ...StyleSheet.absoluteFillObject, padding: 16, justifyContent: 'flex-end' },
  eventDate: { fontSize: 12, color: C.gold, fontWeight: '700', marginBottom: 4 },
  eventName: { fontSize: 16, fontWeight: '700', color: C.text },
  eventVenue: { fontSize: 12, color: C.textSec, marginTop: 4 },

  // Event List
  eventListCard: { borderRadius: 20, overflow: 'hidden', marginBottom: 16, height: 200 },
  eventListImg: { width: '100%', height: '100%' },
  eventListOverlay: { ...StyleSheet.absoluteFillObject, flexDirection: 'row', padding: 20 },
  eventListDate: { backgroundColor: C.bg, borderRadius: 12, padding: 12, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' },
  eventListMonth: { fontSize: 11, color: C.gold, fontWeight: '700' },
  eventListDay: { fontSize: 24, color: C.text, fontWeight: '700' },
  eventListContent: { flex: 1, marginLeft: 16, justifyContent: 'flex-end' },
  eventListName: { fontSize: 20, fontWeight: '700', color: C.text },
  eventListDesc: { fontSize: 13, color: C.textSec, marginTop: 4 },
  eventListFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  eventListVenue: { flexDirection: 'row', alignItems: 'center' },
  eventListVenueText: { fontSize: 12, color: C.textSec, marginLeft: 4 },
  rsvpBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  rsvpBtnText: { fontSize: 12, fontWeight: '700', color: C.bg },

  // Concierge
  conciergeSection: { paddingHorizontal: 20, marginBottom: 28 },
  conciergeSectionTitle: { fontSize: 20, fontWeight: '700', color: C.text, marginBottom: 16 },
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
  serviceCard: { width: '50%', padding: 6 },
  serviceCardGrad: { borderRadius: 20, padding: 20, alignItems: 'center' },
  serviceIconWrap: { width: 56, height: 56, borderRadius: 18, backgroundColor: C.goldMuted, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  serviceTitle: { fontSize: 14, fontWeight: '700', color: C.text, textAlign: 'center' },
  serviceDesc: { fontSize: 12, color: C.textSec, textAlign: 'center', marginTop: 4 },
  carCard: { width: 200, height: 150, marginRight: 16, borderRadius: 16, overflow: 'hidden' },
  carImage: { width: '100%', height: '100%' },
  carOverlay: { ...StyleSheet.absoluteFillObject, padding: 16, justifyContent: 'flex-end' },
  carName: { fontSize: 14, fontWeight: '700', color: C.text },
  carFooter: { flexDirection: 'row', alignItems: 'baseline', marginTop: 4 },
  carPrice: { fontSize: 16, fontWeight: '700', color: C.gold },
  carPriceUnit: { fontSize: 11, color: C.textSec, marginLeft: 2 },
  yachtCard: { flexDirection: 'row', backgroundColor: C.card, borderRadius: 16, overflow: 'hidden', marginBottom: 12 },
  yachtImage: { width: 100, height: 100 },
  yachtContent: { flex: 1, padding: 14, justifyContent: 'center' },
  yachtName: { fontSize: 16, fontWeight: '700', color: C.text },
  yachtDetails: { fontSize: 13, color: C.textSec, marginTop: 4 },
  yachtPrice: { fontSize: 14, fontWeight: '700', color: C.gold, marginTop: 8 },
  yachtAction: { justifyContent: 'center', paddingRight: 16 },
  contactConciergeBtn: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 20 },
  contactConciergeTitle: { fontSize: 16, fontWeight: '700', color: C.bg },
  contactConciergeSub: { fontSize: 12, color: 'rgba(0,0,0,0.6)' },

  // Explore
  exploreHeader: { paddingHorizontal: 20, paddingBottom: 16 },
  exploreTitle: { fontSize: 32, fontWeight: '800', color: C.text },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, marginHorizontal: 20, paddingHorizontal: 16, borderRadius: 14, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  searchInput: { flex: 1, paddingVertical: 14, paddingHorizontal: 12, fontSize: 15, color: C.text },
  tabsScroll: { marginBottom: 16 },
  tabPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 25, backgroundColor: C.card, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginRight: 10 },
  tabPillActive: { borderColor: C.gold },
  tabPillText: { fontSize: 13, fontWeight: '600', color: C.textSec, marginLeft: 8 },
  tabPillTextActive: { color: C.bg },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyStateTitle: { fontSize: 18, fontWeight: '600', color: C.textMuted, marginTop: 16 },

  // Investor Card
  investorCard: { borderRadius: 20, overflow: 'hidden', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12 },
  investorCardGrad: { flex: 1, padding: 20 },
  cardPattern: { ...StyleSheet.absoluteFillObject },
  cardPatternLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: '#FFF' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardLogo: { fontSize: 24, fontWeight: '800', color: '#FFF', letterSpacing: 4 },
  cardLogoSub: { fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.7)', letterSpacing: 2, marginTop: 2 },
  cardTierBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  cardTierText: { fontSize: 12, fontWeight: '700', color: '#FFF', marginLeft: 6 },
  cardQR: { position: 'absolute', right: 20, top: '40%', width: 50, height: 50, flexDirection: 'row', flexWrap: 'wrap' },
  qrBlock: { width: 8, height: 8, backgroundColor: '#FFF', margin: 1, borderRadius: 1 },
  cardBottom: { flex: 1, justifyContent: 'flex-end', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  cardName: { fontSize: 18, fontWeight: '700', color: '#FFF' },
  cardId: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4, fontFamily: 'monospace' },
  cardDiscount: { alignItems: 'flex-end' },
  cardDiscountValue: { fontSize: 28, fontWeight: '800', color: '#FFF' },
  cardDiscountLabel: { fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.7)' },
  contactlessIcon: { position: 'absolute', right: 20, bottom: 20, width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },

  // Investment Progress
  progressSection: { backgroundColor: C.card, borderRadius: 20, padding: 20, marginBottom: 20 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  progressTitle: { fontSize: 16, fontWeight: '700', color: C.text },
  progressNextTier: { fontSize: 12, fontWeight: '600', color: C.gold },
  progressMaxTier: { fontSize: 12, fontWeight: '600', color: C.success },
  progressAmounts: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressCurrent: { fontSize: 20, fontWeight: '700', color: C.text },
  progressTarget: { fontSize: 14, fontWeight: '600', color: C.textMuted },
  progressBarBg: { height: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
  progressRemaining: { fontSize: 12, color: C.textSec, marginTop: 12, textAlign: 'center' },

  // Benefits
  benefitsSection: { backgroundColor: C.card, borderRadius: 20, padding: 20, marginBottom: 20 },
  benefitsSectionTitle: { fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 16 },
  benefitsList: {},
  benefitItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  benefitIcon: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  benefitText: { fontSize: 14, color: C.text, flex: 1 },
  currentBenefitsSection: { backgroundColor: C.card, borderRadius: 20, padding: 20, marginBottom: 20 },
  currentBenefitsTitle: { fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 16 },
  currentBenefitsList: {},
  currentBenefitItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  currentBenefitText: { fontSize: 14, color: C.textSec, marginLeft: 10 },

  // Investor Profile
  investorProfileHeader: { alignItems: 'center', paddingVertical: 24 },
  investorWelcome: { fontSize: 14, color: C.textSec },
  investorName: { fontSize: 28, fontWeight: '700', color: C.text, marginTop: 4 },
  investorBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginTop: 12 },
  investorBadgeText: { fontSize: 13, fontWeight: '600', marginLeft: 8 },
  investorStats: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 20 },
  investorStatCard: { flex: 1, backgroundColor: C.card, borderRadius: 16, padding: 16, alignItems: 'center', marginHorizontal: 4 },
  investorStatValue: { fontSize: 18, fontWeight: '700', color: C.gold },
  investorStatLabel: { fontSize: 11, color: C.textMuted, marginTop: 4 },
  investorActions: { paddingHorizontal: 20, marginBottom: 24 },
  investorActionsTitle: { fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 16 },
  investorActionsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  investorActionBtn: { width: '23%' },
  investorActionGrad: { borderRadius: 16, padding: 16, alignItems: 'center' },
  investorActionLabel: { fontSize: 11, color: C.textSec, marginTop: 8, textAlign: 'center' },

  // Profile
  profileGuestContainer: { flex: 1, alignItems: 'center', paddingHorizontal: 32 },
  profileGuestIcon: { marginBottom: 24 },
  profileGuestIconGrad: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center' },
  profileGuestTitle: { fontSize: 28, fontWeight: '700', color: C.text, marginBottom: 12, textAlign: 'center' },
  profileGuestSub: { fontSize: 15, color: C.textSec, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  profileGuestBenefits: { width: '100%', marginBottom: 32 },
  profileGuestBenefit: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  profileGuestBenefitIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: C.goldMuted, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  profileGuestBenefitText: { fontSize: 15, color: C.text, fontWeight: '500' },
  profileGuestSignIn: { fontSize: 14, color: C.textSec },
  profileHeader: { alignItems: 'center', paddingVertical: 32 },
  profileAvatar: { width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  profileAvatarText: { fontSize: 36, fontWeight: '700', color: C.bg },
  profileName: { fontSize: 24, fontWeight: '700', color: C.text },
  profileEmail: { fontSize: 14, color: C.textSec, marginTop: 4 },
  memberBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.goldMuted, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginTop: 12 },
  memberBadgeText: { fontSize: 13, color: C.gold, fontWeight: '600', marginLeft: 6 },
  profileStats: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 24 },
  profileStatCard: { flex: 1, backgroundColor: C.card, borderRadius: 16, padding: 16, alignItems: 'center', marginHorizontal: 4 },
  profileStatV: { fontSize: 24, fontWeight: '700', color: C.gold },
  profileStatL: { fontSize: 11, color: C.textMuted, marginTop: 4 },
  profileSection: { paddingHorizontal: 20, marginBottom: 24 },
  profileSecTitle: { fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 12 },
  profileMenu: { borderRadius: 20, overflow: 'hidden' },
  profileMenuItem: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  profileMenuItemBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  profileMenuItemIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: C.goldMuted, justifyContent: 'center', alignItems: 'center' },
  profileMenuItemLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: C.text, marginLeft: 14 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  logoutBtnText: { fontSize: 15, fontWeight: '600', color: C.error, marginLeft: 8 },
  profileVersion: { fontSize: 12, color: C.textMuted, textAlign: 'center', marginTop: 24 },

  // Navigation
  navBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', overflow: 'hidden' },
  navItem: { flex: 1, alignItems: 'center' },
  navItemActive: { width: 40, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  navLabel: { fontSize: 10, color: C.textMuted, marginTop: 4, fontWeight: '500' },
  navLabelActive: { color: C.gold, fontWeight: '600' },

  // Buttons
  goldBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 14 },
  goldBtnLg: { paddingVertical: 18, borderRadius: 16 },
  goldBtnText: { fontSize: 14, fontWeight: '700', color: C.bg },
  goldBtnTextLg: { fontSize: 16 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  resModal: { height: height * 0.85, borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' },
  resHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 24, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  resTitle: { fontSize: 22, fontWeight: '700', color: C.text },
  resSub: { fontSize: 14, color: C.gold, marginTop: 4 },
  closeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.card, justifyContent: 'center', alignItems: 'center' },
  resContent: { flex: 1, padding: 24 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: C.text, marginBottom: 12, marginTop: 20 },
  dateRow: { flexDirection: 'row' },
  dateOpt: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: C.card, alignItems: 'center', marginRight: 10, overflow: 'hidden' },
  dateOptActive: {},
  dateOptText: { fontSize: 14, fontWeight: '600', color: C.textSec },
  dateOptTextActive: { color: C.bg },
  timeOpt: { paddingVertical: 12, paddingHorizontal: 18, borderRadius: 12, backgroundColor: C.card, marginRight: 10, overflow: 'hidden' },
  timeOptActive: {},
  timeOptText: { fontSize: 14, fontWeight: '600', color: C.textSec },
  timeOptTextActive: { color: C.bg },
  guestSel: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 12, paddingVertical: 8 },
  guestBtn: { width: 50, height: 50, justifyContent: 'center', alignItems: 'center' },
  guestCount: { flex: 1, textAlign: 'center', fontSize: 24, fontWeight: '700', color: C.text },
  summaryCard: { backgroundColor: C.card, borderRadius: 16, padding: 16, marginTop: 24 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  summaryLabel: { fontSize: 14, color: C.textSec },
  summaryValue: { fontSize: 14, fontWeight: '600', color: C.text },
  resFooter: { padding: 24, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' },
});

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
