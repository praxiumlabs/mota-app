/**
 * MOTA - Macau of the Americas
 * Premium Casino Resort App v3.4
 * Complete with MOTA Card, VIP Concierge, Portfolio, Investment Timeline
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, 
  Dimensions, StatusBar, ActivityIndicator, RefreshControl, FlatList, 
  TextInput, Alert, Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './context/AuthContext';
import { C, G, PLACEHOLDER_IMAGE } from './constants/theme';
import InvestmentBar from './components/InvestmentBar';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import FleetScreen from './screens/FleetScreen';
import DetailScreen from './screens/DetailScreen';
import ReservationsScreen from './screens/ReservationsScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import SettingsScreen from './screens/SettingsScreen';
import HelpScreen from './screens/HelpScreen';
import api from './services/api';

const { width } = Dimensions.get('window');

// ============================================
// HERO SLIDES
// ============================================
const DefaultSlides = [
  { id: 1, title: 'Luxury Retreats', subtitle: 'WHERE PARADISE MEETS PERFECTION', description: 'World-class accommodations with breathtaking Caribbean views', imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80' },
  { id: 2, title: 'World-Class Gaming', subtitle: 'THE ULTIMATE ENTERTAINMENT', description: 'Premier casino experience with exclusive VIP lounges', imageUrl: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=1200&q=80' },
  { id: 3, title: 'Outdoor Adventures', subtitle: 'EXPLORE THE UNTAMED BEAUTY', description: 'From pristine beaches to lush jungles, discover Belize', imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80' },
  { id: 4, title: 'Culinary Excellence', subtitle: 'A FEAST FOR THE SENSES', description: 'Exquisite cuisines crafted by world-renowned chefs', imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80' },
  { id: 5, title: 'Vibrant Nightlife', subtitle: 'WHERE THE NIGHT COMES ALIVE', description: 'Exclusive clubs, lounges, and entertainment venues', imageUrl: 'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=1200&q=80' },
];

// ============================================
// INVESTOR TIER BENEFITS
// ============================================
const TierBenefits: Record<string, any> = {
  gold: {
    id: 'gold', name: 'Gold', investment: '$2.5M', phase: 'Phase 2 Investment',
    color: '#D4AF37', gradient: ['#E8C547', '#D4AF37', '#B8952F'], creditLine: '$2,500,000',
    benefits: [
      'Complimentary chips: $50K annually',
      '7 complimentary nights per year',
      '2 business-class plane tickets annually',
      'Priority reservations & concierge',
      'Exclusive event access',
      'Annual membership renewal',
    ]
  },
  platinum: {
    id: 'platinum', name: 'Platinum', investment: '$15M', phase: 'Phase 2 Investment',
    color: '#E5E4E2', gradient: ['#E8E8E8', '#E5E4E2', '#D4D4D4'], creditLine: '$15,000,000',
    benefits: [
      'All Gold benefits plus:',
      'Complimentary chips: $300K annually',
      '30 complimentary nights per year',
      'Private jet access (shared)',
      'VIP gaming floor access',
      'Personal account manager',
      'Priority villa reservations',
    ]
  },
  diamond: {
    id: 'diamond', name: 'Diamond', investment: '$70M', phase: 'Phase 2 Investment',
    color: '#B9F2FF', gradient: ['#E0F7FA', '#B9F2FF', '#81D4FA'], creditLine: '$70,000,000',
    benefits: [
      'All Platinum benefits plus:',
      'Complimentary chips: $1.4M annually',
      '90+ complimentary nights per year',
      'Dedicated private aircraft',
      'Resort ownership privileges',
      '24/7 dedicated concierge team',
      'Bespoke experience curation',
    ]
  }
};

// ============================================
// INVESTMENT TIMELINE
// ============================================
const InvestmentTimeline = [
  { phase: 1, name: 'Infrastructure Development', years: '2023-2025', status: 'completed' },
  { phase: 2, name: 'Mahogany Bay Resort', years: '2026-2028', status: 'active', amount: '$10,000,000', date: 'Nov 2025' },
  { phase: 3, name: 'Secret Beach Development', years: '2027-2031', status: 'upcoming' },
  { phase: 4, name: 'Crown Jewel Casino Resort', years: '2031-2035', status: 'upcoming' },
  { phase: 5, name: 'Full Destination Launch', years: '2036-2045', status: 'upcoming' },
];

// ============================================
// REUSABLE COMPONENTS
// ============================================
const GoldBtn = ({ title, icon, onPress, lg, style, disabled }: any) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={style} disabled={disabled}>
    <LinearGradient colors={disabled ? [C.textMuted, C.textMuted] : G.gold} style={[s.goldBtn, lg && s.goldBtnLg]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
      <Text style={[s.goldBtnText, lg && s.goldBtnTextLg]}>{title}</Text>
      {icon && <Ionicons name={icon} size={lg ? 20 : 16} color={C.bg} style={{ marginLeft: 8 }} />}
    </LinearGradient>
  </TouchableOpacity>
);

const FilterChip = ({ label, active, onPress, icon }: any) => (
  <TouchableOpacity onPress={onPress} style={[s.filterChip, active && s.filterChipActive]} activeOpacity={0.7}>
    {icon && <Ionicons name={icon} size={14} color={active ? C.bg : C.textSec} style={{ marginRight: 4 }} />}
    <Text style={[s.filterChipText, active && s.filterChipTextActive]}>{label}</Text>
  </TouchableOpacity>
);

const ItemCard = ({ item, onPress }: any) => {
  const [imageError, setImageError] = useState(false);
  const imageUrl = item.images?.[0]?.url || item.image || PLACEHOLDER_IMAGE;
  return (
    <TouchableOpacity style={s.itemCard} onPress={onPress} activeOpacity={0.9}>
      <Image source={{ uri: imageError ? PLACEHOLDER_IMAGE : imageUrl }} style={s.itemCardImage} onError={() => setImageError(true)} />
      <LinearGradient colors={G.overlay} style={s.itemCardOverlay} />
      <View style={s.itemCardContent}>
        <Text style={s.itemCardName} numberOfLines={1}>{item.name || ''}</Text>
        {(item.cuisine || item.category) ? <Text style={s.itemCardSub}>{item.cuisine || item.category}</Text> : null}
        <View style={s.itemCardFooter}>
          {item.priceRange ? <Text style={s.itemCardPrice}>{item.priceRange}</Text> : null}
          {item.price ? <Text style={s.itemCardPrice}>${item.price}</Text> : null}
          {item.rating !== undefined && item.rating !== null && item.rating > 0 ? (
            <View style={s.itemCardRating}>
              <Ionicons name="star" size={12} color={C.gold} />
              <Text style={s.itemCardRatingText}>{item.rating}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ============================================
// MOTA CARD COMPONENT
// ============================================
const MOTACard = ({ tier, user }: { tier: string; user: any }) => {
  const tierInfo = TierBenefits[tier];
  if (!tierInfo) return null;
  return (
    <View style={s.motaCardContainer}>
      <LinearGradient colors={tierInfo.gradient} style={s.motaCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={s.motaCardHeader}>
          <View>
            <Text style={s.motaCardLogo}>MOTA</Text>
            <Text style={s.motaCardType}>{tierInfo.name} Card</Text>
          </View>
          <View style={s.motaCardChip}><Ionicons name="diamond" size={24} color={C.bg} /></View>
        </View>
        <Text style={s.motaCardNumber}>•••• •••• •••• {user?.id?.slice(-4) || '0000'}</Text>
        <View style={s.motaCardFooter}>
          <View>
            <Text style={s.motaCardLabel}>MEMBER</Text>
            <Text style={s.motaCardValue}>{user?.name?.toUpperCase() || 'MEMBER'}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={s.motaCardLabel}>CREDIT LINE</Text>
            <Text style={s.motaCardValue}>{tierInfo.creditLine}</Text>
          </View>
        </View>
        <View style={s.motaCardPattern}><Ionicons name="diamond-outline" size={120} color="rgba(0,0,0,0.05)" /></View>
      </LinearGradient>
    </View>
  );
};

// ============================================
// TIER BENEFITS CARD
// ============================================
const TierBenefitsCard = ({ tier }: { tier: string }) => {
  const tierInfo = TierBenefits[tier];
  if (!tierInfo) return null;
  return (
    <View style={s.tierBenefitsCard}>
      <LinearGradient colors={tierInfo.gradient} style={s.tierBenefitsHeader}>
        <Ionicons name="diamond" size={24} color={C.bg} />
        <Text style={s.tierBenefitsTitle}>{tierInfo.name} Benefits</Text>
        <Text style={s.tierBenefitsInvestment}>{tierInfo.investment}</Text>
      </LinearGradient>
      <View style={s.tierBenefitsList}>
        {tierInfo.benefits.map((benefit: string, index: number) => (
          <View key={index} style={s.tierBenefitItem}>
            <Ionicons name="checkmark-circle" size={18} color={C.success} />
            <Text style={s.tierBenefitText}>{benefit}</Text>
          </View>
        ))}
        <View style={s.tierBenefitItem}>
          <Ionicons name="checkmark-circle" size={18} color={C.success} />
          <Text style={s.tierBenefitText}>Flexible credit line of {tierInfo.creditLine}</Text>
        </View>
      </View>
    </View>
  );
};

// ============================================
// PORTFOLIO OVERVIEW COMPONENT
// ============================================
const PortfolioOverview = ({ user }: { user: any }) => (
  <View style={s.portfolioContainer}>
    <Text style={s.portfolioTitle}>Portfolio Overview</Text>
    <Text style={s.portfolioSubtitle}>Your investment journey and returns</Text>
    <View style={s.portfolioStats}>
      <View style={s.portfolioStat}>
        <Text style={s.portfolioStatLabel}>Total Invested</Text>
        <Text style={s.portfolioStatValue}>${((user?.investmentAmount || 0) / 1000000).toFixed(1)}M</Text>
      </View>
      <View style={s.portfolioStat}>
        <Text style={s.portfolioStatLabel}>Current Value</Text>
        <Text style={[s.portfolioStatValue, { color: C.success }]}>${((user?.portfolioValue || 0) / 1000000).toFixed(1)}M</Text>
      </View>
      <View style={s.portfolioStat}>
        <Text style={s.portfolioStatLabel}>ROI</Text>
        <Text style={[s.portfolioStatValue, { color: C.success }]}>+{(((user?.portfolioValue || 0) - (user?.investmentAmount || 1)) / (user?.investmentAmount || 1) * 100).toFixed(1)}%</Text>
      </View>
    </View>
    <Text style={s.timelineTitle}>Investment Timeline</Text>
    <View style={s.timeline}>
      {InvestmentTimeline.map((phase, index) => (
        <View key={phase.phase} style={s.timelineItem}>
          <View style={s.timelineDot}>
            <View style={[s.timelineDotInner, phase.status === 'completed' && s.timelineDotCompleted, phase.status === 'active' && s.timelineDotActive]}>
              {phase.status === 'completed' && <Ionicons name="checkmark" size={12} color="#fff" />}
            </View>
            {index < InvestmentTimeline.length - 1 && <View style={[s.timelineLine, phase.status === 'completed' && s.timelineLineCompleted]} />}
          </View>
          <View style={s.timelineContent}>
            <Text style={s.timelinePhase}>Phase {phase.phase}</Text>
            <Text style={s.timelineName}>{phase.name}</Text>
            <Text style={s.timelineYears}>{phase.years}</Text>
            {phase.amount && <Text style={s.timelineAmount}>{phase.amount}</Text>}
            {phase.date && <Text style={s.timelineDate}>{phase.date}</Text>}
            {phase.status === 'completed' && <View style={s.timelineStatusBadge}><Text style={s.timelineStatusText}>Completed</Text></View>}
          </View>
        </View>
      ))}
    </View>
    <View style={s.dividendsCard}>
      <View style={s.dividendsHeader}>
        <Ionicons name="cash-outline" size={24} color={C.gold} />
        <Text style={s.dividendsTitle}>Dividends</Text>
      </View>
      <Text style={s.dividendsNote}>Dividends will be paid out quarterly following completion of Phase 3</Text>
      <View style={s.dividendsExpected}>
        <Text style={s.dividendsLabel}>Next Expected</Text>
        <Text style={s.dividendsAmount}>$864,000</Text>
        <Text style={s.dividendsDate}>Q1 2031</Text>
      </View>
    </View>
    <View style={s.portfolioLinks}>
      {[
        { icon: 'document-text-outline', title: 'Document Vault', sub: 'Access investment documents' },
        { icon: 'trending-up-outline', title: 'Project Updates', sub: 'Latest development progress' },
        { icon: 'clipboard-outline', title: 'Required Forms', sub: 'KYC and investor agreements' },
      ].map((link, i) => (
        <TouchableOpacity key={i} style={s.portfolioLink}>
          <View style={s.portfolioLinkIcon}><Ionicons name={link.icon as any} size={22} color={C.gold} /></View>
          <View style={s.portfolioLinkContent}>
            <Text style={s.portfolioLinkTitle}>{link.title}</Text>
            <Text style={s.portfolioLinkSub}>{link.sub}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={C.textMuted} />
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

// ============================================
// SERVICE REQUEST MODAL
// ============================================
const ServiceModal = ({ visible, service, onClose, onSubmit }: any) => {
  const [notes, setNotes] = useState('');
  const serviceOptions: Record<string, string[]> = {
    'Dining': ['Fine Dining', 'Casual Dining', 'Private Chef', 'Room Service'],
    'Lodging': ['Suite Upgrade', 'Villa Booking', 'Extended Stay', 'Special Arrangement'],
    'Yacht Charter': ['Half Day Charter', 'Full Day Charter', 'Sunset Cruise', 'Fishing Trip'],
    'Transport': ['Airport Transfer', 'Luxury Vehicle', 'Helicopter', 'Private Jet'],
    'Events': ['VIP Access', 'Private Event', 'Group Booking', 'Special Seating'],
    'Special': ['Anniversary', 'Birthday', 'Proposal', 'Custom Request'],
    'Private Tour': ['Mayan Ruins', 'Jungle Adventure', 'Island Hopping', 'Cultural Experience'],
    'Spa & Wellness': ['Couples Massage', 'Day Package', 'Private Suite', 'Wellness Retreat'],
  };
  const options = serviceOptions[service?.title] || [];
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={s.modalOverlay}>
        <View style={s.modalContent}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>{service?.title || 'Service'} Request</Text>
            <TouchableOpacity onPress={onClose} style={s.modalClose}><Ionicons name="close" size={24} color={C.text} /></TouchableOpacity>
          </View>
          <ScrollView style={s.modalBody} showsVerticalScrollIndicator={false}>
            <Text style={s.modalLabel}>Select Service Type</Text>
            <View style={s.serviceOptions}>
              {options.map((opt: string, i: number) => (
                <TouchableOpacity key={i} style={s.serviceOption}><Text style={s.serviceOptionText}>{opt}</Text></TouchableOpacity>
              ))}
            </View>
            <Text style={s.modalLabel}>Preferred Date</Text>
            <TextInput style={s.modalInput} placeholder="Select date" placeholderTextColor={C.textMuted} />
            <Text style={s.modalLabel}>Preferred Time</Text>
            <TextInput style={s.modalInput} placeholder="Select time" placeholderTextColor={C.textMuted} />
            <Text style={s.modalLabel}>Number of Guests</Text>
            <TextInput style={s.modalInput} placeholder="2" placeholderTextColor={C.textMuted} keyboardType="number-pad" />
            <Text style={s.modalLabel}>Special Requests</Text>
            <TextInput style={[s.modalInput, s.modalTextarea]} placeholder="Any special requirements..." placeholderTextColor={C.textMuted} multiline value={notes} onChangeText={setNotes} />
          </ScrollView>
          <View style={s.modalFooter}>
            <TouchableOpacity style={s.modalCancelBtn} onPress={onClose}><Text style={s.modalCancelText}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => { onSubmit({ notes }); onClose(); }}>
              <LinearGradient colors={G.gold} style={s.modalSubmitBtn}><Text style={s.modalSubmitText}>Submit Request</Text></LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ============================================
// VIP PROMO MODAL
// ============================================
const VIPPromoModal = ({ visible, onClose }: any) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={s.modalOverlay}>
      <View style={[s.modalContent, { maxHeight: '80%' }]}>
        <LinearGradient colors={G.gold} style={s.vipPromoHeader}>
          <Ionicons name="diamond" size={48} color={C.bg} />
          <Text style={s.vipPromoTitle}>VIP Concierge</Text>
          <Text style={s.vipPromoSubtitle}>Exclusive Benefit for MOTA Investors</Text>
        </LinearGradient>
        <ScrollView style={s.modalBody}>
          <Text style={s.vipPromoText}>VIP Concierge is an exclusive benefit available only to MOTA investors. Unlock premium services and personalized experiences.</Text>
          <Text style={s.vipBenefitsTitle}>VIP Benefits Include:</Text>
          {['24/7 Dedicated Concierge Team', 'Priority Reservations at All Venues', 'Private Jet & Yacht Arrangements', 'Bespoke Experience Curation', 'Exclusive Event Access', 'Personal Account Manager'].map((b, i) => (
            <View key={i} style={s.vipBenefitItem}><Ionicons name="checkmark-circle" size={20} color={C.gold} /><Text style={s.vipBenefitText}>{b}</Text></View>
          ))}
          <View style={s.vipTiersPreview}>
            <Text style={s.vipTiersTitle}>Investment Tiers</Text>
            {Object.values(TierBenefits).map((tier: any) => (
              <View key={tier.id} style={s.vipTierRow}>
                <LinearGradient colors={tier.gradient} style={s.vipTierBadge}><Text style={s.vipTierName}>{tier.name}</Text></LinearGradient>
                <Text style={s.vipTierAmount}>{tier.investment}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
        <View style={s.modalFooter}>
          <TouchableOpacity style={s.modalCancelBtn} onPress={onClose}><Text style={s.modalCancelText}>Close</Text></TouchableOpacity>
          <TouchableOpacity onPress={onClose}><LinearGradient colors={G.gold} style={s.modalSubmitBtn}><Text style={s.modalSubmitText}>Learn More</Text></LinearGradient></TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

// ============================================
// MAIN APP CONTENT
// ============================================
function AppContent() {
  const insets = useSafeAreaInsets();
  const { user, logout, isInvestor } = useAuth();
  const [currentScreen, setCurrentScreen] = useState('main');
  const [activeTab, setActiveTab] = useState(0);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedItemType, setSelectedItemType] = useState<string>('');
  const [slides, setSlides] = useState(DefaultSlides);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [lodging, setLodging] = useState<any[]>([]);
  const [nightlife, setNightlife] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [exploreCategory, setExploreCategory] = useState('All');
  const [priceFilter, setPriceFilter] = useState('All');
  const [ratingFilter, setRatingFilter] = useState('All');
  const [amenityFilter, setAmenityFilter] = useState('All');
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideRef = useRef<FlatList>(null);
  const [serviceModal, setServiceModal] = useState<any>(null);
  const [vipPromoVisible, setVipPromoVisible] = useState(false);
  const [conciergeTab, setConciergeTab] = useState<'standard' | 'vip'>('standard');
  const [luxuryExpanded, setLuxuryExpanded] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [slidesData, restaurantsData, eventsData, activitiesData, lodgingData, nightlifeData] = await Promise.all([
        api.getSlideshow(), api.getRestaurants({ featured: true }), api.getEvents({ upcoming: true }), api.getActivities({ featured: true }), api.getLodging({ featured: true }), api.getNightlife(),
      ]);
      if (slidesData.length > 0) setSlides(slidesData);
      if (restaurantsData.length > 0) setRestaurants(restaurantsData);
      if (eventsData.length > 0) setEvents(eventsData);
      if (activitiesData.length > 0) setActivities(activitiesData);
      if (lodgingData.length > 0) setLodging(lodgingData);
      if (nightlifeData.length > 0) setNightlife(nightlifeData);
      if (user) { try { const r = await api.get('/notifications/unread-count'); setNotificationCount(r.data.count || 0); } catch {} }
    } catch {} finally { setLoading(false); setRefreshing(false); }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => {
    if (activeTab !== 0) return;
    const timer = setInterval(() => { setCurrentSlide(p => { const n = (p + 1) % slides.length; slideRef.current?.scrollToIndex({ index: n, animated: true }); return n; }); }, 5000);
    return () => clearInterval(timer);
  }, [slides.length, activeTab]);

  const onRefresh = () => { setRefreshing(true); loadData(); };
  const openDetail = (item: any, type: string) => { setSelectedItem(item); setSelectedItemType(type); setCurrentScreen('detail'); };
  const getTierGradient = () => user?.investorTier === 'diamond' ? G.diamond : user?.investorTier === 'platinum' ? G.platinum : G.gold;

  const getFilteredItems = () => {
    let items: any[] = [];
    if (exploreCategory === 'All' || exploreCategory === 'Lodging') items = [...items, ...lodging.map(l => ({ ...l, _type: 'lodging' }))];
    if (exploreCategory === 'All' || exploreCategory === 'Eateries') items = [...items, ...restaurants.map(r => ({ ...r, _type: 'restaurant' }))];
    if (exploreCategory === 'All' || exploreCategory === 'Experiences') items = [...items, ...activities.map(a => ({ ...a, _type: 'activity' }))];
    if (exploreCategory === 'All' || exploreCategory === 'Nightlife') items = [...items, ...nightlife.map(n => ({ ...n, _type: 'nightlife' }))];
    
    // Price filter
    if (priceFilter !== 'All') {
      items = items.filter(item => {
        if (priceFilter === '$' && item.priceRange === '$') return true;
        if (priceFilter === '$$' && (item.priceRange === '$$' || (item.price && item.price < 200))) return true;
        if (priceFilter === '$$$' && (item.priceRange === '$$$' || (item.price && item.price >= 200 && item.price < 500))) return true;
        if (priceFilter === '$$$$' && (item.priceRange === '$$$$' || (item.price && item.price >= 500))) return true;
        return false;
      });
    }
    
    // Rating filter
    if (ratingFilter !== 'All') {
      const minRating = parseFloat(ratingFilter);
      items = items.filter(item => item.rating && item.rating >= minRating);
    }
    
    // Amenity filter
    if (amenityFilter !== 'All') {
      items = items.filter(item => {
        if (amenityFilter === 'Dog Friendly') return item.dogFriendly === true;
        if (amenityFilter === 'Kids Friendly') return item.kidsFriendly === true;
        if (amenityFilter === 'Ocean View') return item.view === 'ocean';
        if (amenityFilter === 'Beach View') return item.view === 'beach';
        return true;
      });
    }
    
    return items;
  };

  const handleServiceRequest = (service: any) => {
    if (!user) { Alert.alert('Sign In Required', 'Please sign in to request concierge services.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Sign In', onPress: () => setCurrentScreen('login') }]); return; }
    setServiceModal(service);
  };

  // Screen routing
  if (currentScreen === 'login') return <LoginScreen onBack={() => setCurrentScreen('main')} onSwitchToSignup={() => setCurrentScreen('signup')} />;
  if (currentScreen === 'signup') return <SignupScreen onBack={() => setCurrentScreen('main')} onSwitchToLogin={() => setCurrentScreen('login')} />;
  if (currentScreen === 'notifications') return <NotificationsScreen onBack={() => { setCurrentScreen('main'); loadData(); }} />;
  if (currentScreen === 'editProfile') return <EditProfileScreen onBack={() => setCurrentScreen('main')} />;
  if (currentScreen === 'fleet') return <FleetScreen onBack={() => setCurrentScreen('main')} />;
  if (currentScreen === 'reservations') return <ReservationsScreen onBack={() => setCurrentScreen('main')} />;
  if (currentScreen === 'favorites') return <FavoritesScreen onBack={() => setCurrentScreen('main')} onOpenDetail={(item, type) => { setSelectedItem(item); setSelectedItemType(type); setCurrentScreen('detail'); }} />;
  if (currentScreen === 'settings') return <SettingsScreen onBack={() => setCurrentScreen('main')} />;
  if (currentScreen === 'help') return <HelpScreen onBack={() => setCurrentScreen('main')} />;
  if (currentScreen === 'detail' && selectedItem) return <DetailScreen item={selectedItem} type={selectedItemType as any} onBack={() => { setCurrentScreen('main'); setSelectedItem(null); }} />;

  // ============================================
  // HOME TAB
  // ============================================
  const renderHomeTab = () => (
    <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.gold} />}>
      <View style={s.heroContainer}>
        <FlatList ref={slideRef} data={slides} horizontal pagingEnabled showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => setCurrentSlide(Math.round(e.nativeEvent.contentOffset.x / width))}
          keyExtractor={(_, i) => `slide-${i}`}
          renderItem={({ item }) => (
            <View style={s.heroSlide}>
              <Image source={{ uri: item.imageUrl || item.image }} style={s.heroImage} />
              <LinearGradient colors={G.overlay} style={s.heroOverlay} />
              <View style={s.heroContent}>
                <Text style={s.heroSubtitle}>{item.subtitle}</Text>
                <Text style={s.heroTitle}>{item.title}</Text>
                <Text style={s.heroDesc}>{item.description}</Text>
              </View>
            </View>
          )}
        />
        <View style={s.slideIndicators}>{slides.map((_, i) => <View key={i} style={[s.slideIndicator, currentSlide === i && s.slideIndicatorActive]} />)}</View>
      </View>
      {isInvestor && user?.investorTier && <InvestmentBar investmentAmount={user.investmentAmount || 0} portfolioValue={user.portfolioValue || 0} tier={user.investorTier} />}
      <View style={s.searchSection}>
        <View style={s.searchBar}>
          <Ionicons name="sparkles" size={20} color={C.gold} />
          <TextInput style={s.searchInput} placeholder="Ask me anything..." placeholderTextColor={C.textMuted} />
          <View style={s.aiTag}><Text style={s.aiTagText}>AI</Text></View>
        </View>
      </View>
      <View style={s.quickCats}>
        {[{ icon: 'bed-outline', label: 'Lodging' }, { icon: 'restaurant-outline', label: 'Eateries' }, { icon: 'compass-outline', label: 'Experiences' }, { icon: 'wine-outline', label: 'Nightlife' }].map((cat, i) => (
          <TouchableOpacity key={i} style={s.quickCat} onPress={() => { setExploreCategory(cat.label); setActiveTab(1); }}>
            <LinearGradient colors={G.card} style={s.quickCatIcon}><Ionicons name={cat.icon as any} size={24} color={C.gold} /></LinearGradient>
            <Text style={s.quickCatLabel}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {[{ title: 'Featured Destinations', data: lodging, type: 'lodging', filter: 'Lodging' }, { title: 'Featured Dining', data: restaurants, type: 'restaurant', filter: 'Eateries' }, { title: 'Upcoming Events', data: events, type: 'event' }, { title: 'Experiences', data: activities, type: 'activity', filter: 'Experiences' }].map((section, si) => (
        <View key={si} style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>{section.title}</Text>
            <TouchableOpacity onPress={() => { if (section.filter) setExploreCategory(section.filter); setActiveTab(section.type === 'event' ? 2 : 1); }}><Text style={s.sectionMore}>View all</Text></TouchableOpacity>
          </View>
          <FlatList data={section.data.slice(0, 5)} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }} keyExtractor={(item) => item._id || item.id} renderItem={({ item }) => <ItemCard item={item} onPress={() => openDetail(item, section.type)} />} />
        </View>
      ))}
      <View style={{ height: 100 }} />
    </ScrollView>
  );

  // ============================================
  // EXPLORE TAB
  // ============================================
  const renderExploreTab = () => (
    <View style={{ flex: 1 }}>
      <View style={[s.searchSection, { paddingTop: 10, paddingBottom: 8 }]}>
        <View style={s.searchBar}>
          <Ionicons name="sparkles" size={20} color={C.gold} />
          <TextInput style={s.searchInput} placeholder="Ask me anything..." placeholderTextColor={C.textMuted} />
          <View style={s.aiTag}><Text style={s.aiTagText}>AI</Text></View>
        </View>
      </View>
      
      {/* Category Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterRow} contentContainerStyle={{ paddingHorizontal: 16, alignItems: 'center' }}>
        {['All', 'Lodging', 'Eateries', 'Experiences', 'Nightlife'].map((cat) => (
          <FilterChip key={cat} label={cat} active={exploreCategory === cat} onPress={() => setExploreCategory(cat)} />
        ))}
      </ScrollView>
      
      {/* Price Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterRow} contentContainerStyle={{ paddingHorizontal: 16, alignItems: 'center' }}>
        {['All', '$', '$$', '$$$', '$$$$'].map((price) => (
          <FilterChip key={price} label={price === 'All' ? 'Any Price' : price} active={priceFilter === price} onPress={() => setPriceFilter(price)} />
        ))}
      </ScrollView>
      
      {/* Rating Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterRow} contentContainerStyle={{ paddingHorizontal: 16, alignItems: 'center' }}>
        {['All', '4.5', '4.0', '3.5'].map((rating) => (
          <FilterChip 
            key={rating} 
            label={rating === 'All' ? 'Any Rating' : `${rating}+ ★`} 
            active={ratingFilter === rating} 
            onPress={() => setRatingFilter(rating)} 
          />
        ))}
      </ScrollView>
      
      {/* Amenity Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[s.filterRow, { marginBottom: 8 }]} contentContainerStyle={{ paddingHorizontal: 16, alignItems: 'center' }}>
        {['All', 'Dog Friendly', 'Kids Friendly', 'Ocean View', 'Beach View'].map((amenity) => (
          <FilterChip 
            key={amenity} 
            label={amenity === 'All' ? 'Any Amenity' : amenity} 
            active={amenityFilter === amenity} 
            onPress={() => setAmenityFilter(amenity)}
            icon={amenity === 'Dog Friendly' ? 'paw' : amenity === 'Kids Friendly' ? 'people' : amenity.includes('View') ? 'eye' : undefined}
          />
        ))}
      </ScrollView>
      
      <FlatList data={getFilteredItems()} numColumns={2} keyExtractor={(item, i) => item._id || `item-${i}`} contentContainerStyle={{ padding: 16, paddingBottom: 100 }} columnWrapperStyle={{ justifyContent: 'space-between' }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.gold} />}
        renderItem={({ item }) => (
          <TouchableOpacity style={s.exploreCard} onPress={() => openDetail(item, item._type)} activeOpacity={0.9}>
            <Image source={{ uri: item.images?.[0]?.url || item.image || PLACEHOLDER_IMAGE }} style={s.exploreCardImage} />
            <LinearGradient colors={G.overlay} style={s.exploreCardOverlay} />
            <View style={s.exploreCardContent}>
              <Text style={s.exploreCardName} numberOfLines={1}>{item.name}</Text>
              <Text style={s.exploreCardSub} numberOfLines={1}>{item.cuisine || item.category || item.type || ' '}</Text>
              {item.rating ? (
                <View style={s.exploreCardRating}>
                  <Ionicons name="star" size={12} color={C.gold} />
                  <Text style={s.exploreCardRatingText}>{item.rating}</Text>
                </View>
              ) : null}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={s.emptyContainer}>
            <Ionicons name="search-outline" size={48} color={C.textMuted} />
            <Text style={s.emptyTitle}>No Results</Text>
            <Text style={s.emptySubtitle}>Try adjusting your filters</Text>
          </View>
        }
      />
    </View>
  );

  // ============================================
  // EVENTS TAB
  // ============================================
  const renderEventsTab = () => (
    <FlatList data={events} keyExtractor={(item) => item._id || item.id} contentContainerStyle={{ padding: 20, paddingBottom: 100 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.gold} />}
      renderItem={({ item }) => (
        <TouchableOpacity style={s.eventListCard} onPress={() => openDetail(item, 'event')}>
          <Image source={{ uri: item.images?.[0]?.url || item.image || PLACEHOLDER_IMAGE }} style={s.eventListImage} />
          <View style={s.eventListContent}>
            <View style={s.eventListDate}><Text style={s.eventListDay}>{new Date(item.date).getDate()}</Text><Text style={s.eventListMonth}>{new Date(item.date).toLocaleString('en', { month: 'short' })}</Text></View>
            <View style={s.eventListInfo}>
              <Text style={s.eventListName} numberOfLines={2}>{item.name}</Text>
              <Text style={s.eventListVenue}>{item.venue}</Text>
              <View style={s.eventListFooter}>
                {item.price ? <Text style={s.eventListPrice}>${item.price}</Text> : <Text style={s.eventListFree}>FREE</Text>}
                <GoldBtn title="RSVP" onPress={() => openDetail(item, 'event')} />
              </View>
            </View>
          </View>
        </TouchableOpacity>
      )}
      ListEmptyComponent={<View style={s.emptyContainer}><Ionicons name="calendar-outline" size={48} color={C.textMuted} /><Text style={s.emptyTitle}>No Events</Text></View>}
    />
  );

  // ============================================
  // CONCIERGE TAB
  // ============================================
  const renderConciergeTab = () => (
    <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={s.conciergeTabRow}>
        <TouchableOpacity style={[s.conciergeTabBtn, conciergeTab === 'standard' && s.conciergeTabBtnActive]} onPress={() => setConciergeTab('standard')}>
          <Ionicons name="person" size={18} color={conciergeTab === 'standard' ? C.bg : C.textSec} />
          <Text style={[s.conciergeTabText, conciergeTab === 'standard' && s.conciergeTabTextActive]}>Concierge</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.conciergeTabBtn, conciergeTab === 'vip' && s.conciergeTabBtnActive, !isInvestor && s.conciergeTabBtnDisabled]} onPress={() => isInvestor ? setConciergeTab('vip') : setVipPromoVisible(true)}>
          <Ionicons name="diamond" size={18} color={conciergeTab === 'vip' ? C.bg : isInvestor ? C.gold : C.textMuted} />
          <Text style={[s.conciergeTabText, conciergeTab === 'vip' && s.conciergeTabTextActive, !isInvestor && { color: C.textMuted }]}>VIP Concierge</Text>
          {!isInvestor && <Ionicons name="lock-closed" size={14} color={C.textMuted} style={{ marginLeft: 4 }} />}
        </TouchableOpacity>
      </View>
      <View style={s.conciergeHeader}>
        <LinearGradient colors={conciergeTab === 'vip' && isInvestor ? getTierGradient() : G.gold} style={s.conciergeHeaderGrad}>
          <Ionicons name={conciergeTab === 'vip' ? 'diamond' : 'person'} size={28} color={C.bg} />
          <View style={{ marginLeft: 14, flex: 1 }}>
            <Text style={s.conciergeHeaderTitle}>{conciergeTab === 'vip' ? 'VIP Concierge' : 'Concierge Services'}</Text>
            <Text style={s.conciergeHeaderSub}>{conciergeTab === 'vip' ? 'Exclusive Investor Services' : '24/7 Personalized Assistance'}</Text>
          </View>
        </LinearGradient>
      </View>
      <Text style={s.conciergeSectionTitle}>Available Services</Text>
      <View style={s.servicesGrid}>
        {[{ icon: 'restaurant-outline', title: 'Dining', desc: 'Reserve tables at any restaurant' }, { icon: 'bed-outline', title: 'Lodging', desc: 'Book suites and villas' }, { icon: 'calendar-outline', title: 'Events', desc: 'VIP event access' }, { icon: 'gift-outline', title: 'Special', desc: 'Celebrations & requests' }, { icon: 'map-outline', title: 'Private Tour', desc: 'Guided tours & experiences' }, { icon: 'leaf-outline', title: 'Spa & Wellness', desc: 'Relaxation & treatments' }].map((service, i) => (
          <TouchableOpacity key={i} style={s.serviceCard} activeOpacity={0.8} onPress={() => handleServiceRequest(service)}>
            <LinearGradient colors={G.card} style={s.serviceCardGrad}>
              <View style={s.serviceIconWrap}><Ionicons name={service.icon as any} size={24} color={C.gold} /></View>
              <Text style={s.serviceTitle}>{service.title}</Text>
              <Text style={s.serviceDesc}>{service.desc}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
      <View style={s.luxurySection}>
        <TouchableOpacity style={s.luxuryHeader} onPress={() => setLuxuryExpanded(!luxuryExpanded)}>
          <LinearGradient colors={G.gold} style={s.luxuryHeaderGrad}>
            <Ionicons name="sparkles" size={22} color={C.bg} />
            <Text style={s.luxuryHeaderText}>Luxury Experiences</Text>
            <Ionicons name={luxuryExpanded ? 'chevron-up' : 'chevron-down'} size={22} color={C.bg} />
          </LinearGradient>
        </TouchableOpacity>
        {luxuryExpanded && (
          <View style={s.luxuryContent}>
            <TouchableOpacity style={s.luxuryItem} onPress={() => setCurrentScreen('fleet')}>
              <Ionicons name="car-sport" size={22} color={C.gold} />
              <View style={s.luxuryItemInfo}><Text style={s.luxuryItemTitle}>PCH Exotic Fleet</Text><Text style={s.luxuryItemDesc}>Luxury car rentals</Text></View>
              <Ionicons name="chevron-forward" size={20} color={C.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity style={s.luxuryItem} onPress={() => handleServiceRequest({ title: 'Yacht Charter' })}>
              <Ionicons name="boat" size={22} color={C.gold} />
              <View style={s.luxuryItemInfo}><Text style={s.luxuryItemTitle}>Yacht Charter</Text><Text style={s.luxuryItemDesc}>Private yacht experiences</Text></View>
              <Ionicons name="chevron-forward" size={20} color={C.textMuted} />
            </TouchableOpacity>
            {isInvestor && (
              <TouchableOpacity style={s.luxuryItem} onPress={() => handleServiceRequest({ title: 'Transport' })}>
                <Ionicons name="airplane" size={22} color={C.gold} />
                <View style={s.luxuryItemInfo}><Text style={s.luxuryItemTitle}>Private Aviation</Text><Text style={s.luxuryItemDesc}>Jet & helicopter transfers</Text></View>
                <Ionicons name="chevron-forward" size={20} color={C.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );

  // ============================================
  // PROFILE TAB
  // ============================================
  const renderProfileTab = () => {
    if (!user) {
      return (
        <View style={s.profileGuest}>
          <LinearGradient colors={G.gold} style={s.profileGuestIcon}><Ionicons name="person" size={48} color={C.bg} /></LinearGradient>
          <Text style={s.profileGuestTitle}>Welcome to MOTA</Text>
          <Text style={s.profileGuestSub}>Sign in to access your account, bookings, and exclusive member benefits.</Text>
          <GoldBtn title="Sign In" lg onPress={() => setCurrentScreen('login')} style={{ marginTop: 20, width: '100%' }} />
          <TouchableOpacity style={{ marginTop: 16 }} onPress={() => setCurrentScreen('signup')}><Text style={s.profileGuestLink}>Don't have an account? <Text style={{ color: C.gold }}>Sign Up</Text></Text></TouchableOpacity>
        </View>
      );
    }
    const tierInfo = TierBenefits[user.investorTier as string];
    return (
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={s.profileHeader}>
          <LinearGradient colors={getTierGradient()} style={s.profileAvatar}><Text style={s.profileAvatarText}>{user.name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}</Text></LinearGradient>
          <Text style={s.profileName}>{user.name}</Text>
          <Text style={s.profileEmail}>{user.email}</Text>
          {user.investorTier && <View style={[s.tierBadge, { backgroundColor: tierInfo?.color + '30' }]}><Ionicons name="diamond" size={14} color={tierInfo?.color || C.gold} /><Text style={[s.tierBadgeText, { color: tierInfo?.color || C.gold }]}>{tierInfo?.name} Investor</Text></View>}
        </View>
        {isInvestor && user.investorTier && <MOTACard tier={user.investorTier} user={user} />}
        {isInvestor && user.investorTier && <View style={{ paddingHorizontal: 20 }}><TierBenefitsCard tier={user.investorTier} /></View>}
        {isInvestor && user.investorTier && <PortfolioOverview user={user} />}
        <View style={s.profileMenu}>
          {[{ icon: 'person-outline', label: 'Edit Profile', screen: 'editProfile' }, { icon: 'notifications-outline', label: 'Notifications', screen: 'notifications', badge: notificationCount }, { icon: 'bookmark-outline', label: 'My Reservations', screen: 'reservations' }, { icon: 'heart-outline', label: 'Favorites', screen: 'favorites' }, { icon: 'settings-outline', label: 'Settings', screen: 'settings' }, { icon: 'help-circle-outline', label: 'Help & Support', screen: 'help' }].map((item, i) => (
            <TouchableOpacity key={i} style={s.profileMenuItem} onPress={() => setCurrentScreen(item.screen)}>
              <View style={s.profileMenuIcon}><Ionicons name={item.icon as any} size={22} color={C.gold} /></View>
              <Text style={s.profileMenuText}>{item.label}</Text>
              {item.badge && item.badge > 0 && <View style={s.notificationBadge}><Text style={s.notificationBadgeText}>{item.badge}</Text></View>}
              <Ionicons name="chevron-forward" size={20} color={C.textMuted} />
            </TouchableOpacity>
          ))}
          {isInvestor && (
            <TouchableOpacity style={s.profileMenuItem} onPress={() => Alert.alert('Contact Support', 'Chat feature coming soon!')}>
              <View style={s.profileMenuIcon}><Ionicons name="chatbubble-outline" size={22} color={C.gold} /></View>
              <Text style={s.profileMenuText}>Contact Us</Text>
              <View style={s.liveIndicator}><Text style={s.liveIndicatorText}>LIVE</Text></View>
              <Ionicons name="chevron-forward" size={20} color={C.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={s.logoutBtn} onPress={() => Alert.alert('Logout', 'Are you sure?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Logout', style: 'destructive', onPress: logout }])}>
          <Ionicons name="log-out-outline" size={20} color={C.error} /><Text style={s.logoutBtnText}>Logout</Text>
        </TouchableOpacity>
        <Text style={s.versionText}>MOTA v3.4.0</Text>
      </ScrollView>
    );
  };

  // Main render
  const tabs = [{ icon: 'home', label: 'Home' }, { icon: 'compass', label: 'Explore' }, { icon: 'calendar', label: 'Events' }, { icon: 'diamond', label: 'Concierge' }, { icon: 'person', label: 'Profile' }];
  if (loading) return <LinearGradient colors={G.dark} style={s.loadingContainer}><ActivityIndicator size="large" color={C.gold} /><Text style={s.loadingText}>Loading MOTA...</Text></LinearGradient>;

  return (
    <LinearGradient colors={G.dark} style={s.container}>
      <StatusBar barStyle="light-content" />
      <View style={[s.header, { paddingTop: insets.top + 10 }]}>
        <View><Text style={s.headerLogo}>MOTA</Text><Text style={s.headerSub}>Macau of the Americas</Text></View>
        <View style={s.headerRight}>
          <TouchableOpacity style={s.headerBtn} onPress={() => setCurrentScreen('notifications')}>
            <Ionicons name="notifications-outline" size={22} color={C.text} />
            {notificationCount > 0 && <View style={s.headerBadge}><Text style={s.headerBadgeText}>{notificationCount > 9 ? '9+' : notificationCount}</Text></View>}
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ flex: 1 }}>
        {activeTab === 0 && renderHomeTab()}
        {activeTab === 1 && renderExploreTab()}
        {activeTab === 2 && renderEventsTab()}
        {activeTab === 3 && renderConciergeTab()}
        {activeTab === 4 && renderProfileTab()}
      </View>
      <LinearGradient colors={[C.bg, C.card]} style={[s.navBar, { paddingBottom: insets.bottom + 8 }]}>
        {tabs.map((tab, i) => (
          <TouchableOpacity key={i} style={s.navItem} onPress={() => setActiveTab(i)}>
            <View style={[s.navItemIcon, activeTab === i && s.navItemIconActive]}><Ionicons name={(activeTab === i ? tab.icon : tab.icon + '-outline') as any} size={22} color={activeTab === i ? C.gold : C.textMuted} /></View>
            <Text style={[s.navLabel, activeTab === i && s.navLabelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </LinearGradient>
      <ServiceModal visible={!!serviceModal} service={serviceModal} onClose={() => setServiceModal(null)} onSubmit={() => Alert.alert('Request Submitted', 'Our concierge team will contact you shortly.')} />
      <VIPPromoModal visible={vipPromoVisible} onClose={() => setVipPromoVisible(false)} />
    </LinearGradient>
  );
}

export default function App() {
  return <SafeAreaProvider><AuthProvider><AppContent /></AuthProvider></SafeAreaProvider>;
}

// ============================================
// STYLES
// ============================================
const s = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: C.textSec, marginTop: 16, fontSize: 14 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 12 },
  headerLogo: { fontSize: 28, fontWeight: '800', color: C.gold, letterSpacing: 3 },
  headerSub: { fontSize: 10, color: C.textMuted, letterSpacing: 2, textTransform: 'uppercase' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
  headerBadge: { position: 'absolute', top: -2, right: -2, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: C.error, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  headerBadgeText: { fontSize: 10, fontWeight: '700', color: '#fff' },
  heroContainer: { height: 280 },
  heroSlide: { width, height: 280 },
  heroImage: { width: '100%', height: '100%', position: 'absolute' },
  heroOverlay: { ...StyleSheet.absoluteFillObject },
  heroContent: { position: 'absolute', bottom: 50, left: 20, right: 20 },
  heroSubtitle: { fontSize: 11, color: C.gold, letterSpacing: 2, fontWeight: '600', marginBottom: 6 },
  heroTitle: { fontSize: 28, fontWeight: '800', color: C.text, marginBottom: 6 },
  heroDesc: { fontSize: 14, color: C.textSec, lineHeight: 20 },
  slideIndicators: { position: 'absolute', bottom: 20, alignSelf: 'center', flexDirection: 'row', gap: 8 },
  slideIndicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.3)' },
  slideIndicatorActive: { backgroundColor: C.gold, width: 24 },
  searchSection: { paddingHorizontal: 20, paddingVertical: 16 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 12, paddingHorizontal: 16, height: 50, borderWidth: 1, borderColor: C.cardLight },
  searchInput: { flex: 1, fontSize: 15, color: C.text, marginLeft: 12 },
  aiTag: { backgroundColor: C.gold, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  aiTagText: { fontSize: 10, fontWeight: '700', color: C.bg },
  quickCats: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 10, marginBottom: 20 },
  quickCat: { alignItems: 'center' },
  quickCatIcon: { width: 60, height: 60, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  quickCatLabel: { fontSize: 12, color: C.textSec, fontWeight: '500' },
  section: { marginBottom: 28 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: C.text },
  sectionMore: { fontSize: 14, color: C.gold, fontWeight: '600' },
  itemCard: { width: 200, height: 240, marginRight: 16, borderRadius: 16, overflow: 'hidden', backgroundColor: C.card },
  itemCardImage: { width: '100%', height: '100%', position: 'absolute' },
  itemCardOverlay: { ...StyleSheet.absoluteFillObject },
  itemCardContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 14 },
  itemCardName: { fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 2 },
  itemCardSub: { fontSize: 12, color: C.textSec },
  itemCardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  itemCardPrice: { fontSize: 14, fontWeight: '600', color: C.gold },
  itemCardRating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  itemCardRatingText: { fontSize: 12, color: C.text, fontWeight: '600' },
  filterRow: { marginBottom: 12, height: 44 },
  filterChip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: C.card, borderRadius: 22, marginRight: 10, borderWidth: 1.5, borderColor: C.cardLight, minWidth: 60, height: 40 },
  filterChipActive: { backgroundColor: C.gold, borderColor: C.gold },
  filterChipText: { fontSize: 13, color: C.textSec, fontWeight: '500' },
  filterChipTextActive: { color: C.bg, fontWeight: '500' },
  exploreCard: { width: (width - 48) / 2, height: 180, borderRadius: 16, overflow: 'hidden', marginBottom: 16, backgroundColor: C.card },
  exploreCardImage: { width: '100%', height: '100%', position: 'absolute' },
  exploreCardOverlay: { ...StyleSheet.absoluteFillObject },
  exploreCardContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 12 },
  exploreCardName: { fontSize: 14, fontWeight: '700', color: C.text },
  exploreCardSub: { fontSize: 11, color: C.textSec },
  exploreCardRating: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  exploreCardRatingText: { fontSize: 11, color: C.text },
  eventListCard: { backgroundColor: C.card, borderRadius: 16, marginBottom: 16, overflow: 'hidden', flexDirection: 'row' },
  eventListImage: { width: 100, height: 120 },
  eventListContent: { flex: 1, padding: 14, flexDirection: 'row' },
  eventListDate: { alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  eventListDay: { fontSize: 24, fontWeight: '800', color: C.gold },
  eventListMonth: { fontSize: 12, color: C.textSec, textTransform: 'uppercase' },
  eventListInfo: { flex: 1 },
  eventListName: { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 4 },
  eventListVenue: { fontSize: 12, color: C.textSec, marginBottom: 8 },
  eventListFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eventListPrice: { fontSize: 16, fontWeight: '700', color: C.gold },
  eventListFree: { fontSize: 14, fontWeight: '600', color: C.success },
  conciergeTabRow: { flexDirection: 'row', padding: 16, gap: 12 },
  conciergeTabBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 10, backgroundColor: C.card, gap: 8 },
  conciergeTabBtnActive: { backgroundColor: C.gold },
  conciergeTabBtnDisabled: { opacity: 0.7 },
  conciergeTabText: { fontSize: 14, fontWeight: '600', color: C.textSec },
  conciergeTabTextActive: { color: C.bg },
  conciergeHeader: { paddingHorizontal: 16 },
  conciergeHeaderGrad: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 16 },
  conciergeHeaderTitle: { fontSize: 18, fontWeight: '700', color: C.bg },
  conciergeHeaderSub: { fontSize: 12, color: 'rgba(0,0,0,0.6)' },
  conciergeSectionTitle: { fontSize: 18, fontWeight: '700', color: C.text, paddingHorizontal: 20, marginTop: 24, marginBottom: 16 },
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, justifyContent: 'space-between' },
  serviceCard: { width: (width - 48) / 2, marginBottom: 16, marginHorizontal: 4 },
  serviceCardGrad: { padding: 16, borderRadius: 16, alignItems: 'center' },
  serviceIconWrap: { width: 50, height: 50, borderRadius: 25, backgroundColor: C.cardLight, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  serviceTitle: { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 4 },
  serviceDesc: { fontSize: 11, color: C.textSec, textAlign: 'center' },
  luxurySection: { paddingHorizontal: 16, marginTop: 16 },
  luxuryHeader: { borderRadius: 12, overflow: 'hidden' },
  luxuryHeaderGrad: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  luxuryHeaderText: { flex: 1, fontSize: 16, fontWeight: '700', color: C.bg },
  luxuryContent: { backgroundColor: C.card, borderBottomLeftRadius: 12, borderBottomRightRadius: 12, marginTop: -8, paddingTop: 8 },
  luxuryItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: C.cardLight },
  luxuryItemInfo: { flex: 1, marginLeft: 14 },
  luxuryItemTitle: { fontSize: 15, fontWeight: '600', color: C.text },
  luxuryItemDesc: { fontSize: 12, color: C.textSec },
  profileGuest: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  profileGuestIcon: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  profileGuestTitle: { fontSize: 24, fontWeight: '700', color: C.text, marginBottom: 8 },
  profileGuestSub: { fontSize: 14, color: C.textSec, textAlign: 'center', lineHeight: 22 },
  profileGuestLink: { fontSize: 14, color: C.textSec },
  profileHeader: { alignItems: 'center', paddingVertical: 30 },
  profileAvatar: { width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  profileAvatarText: { fontSize: 32, fontWeight: '700', color: C.bg },
  profileName: { fontSize: 22, fontWeight: '700', color: C.text, marginBottom: 4 },
  profileEmail: { fontSize: 14, color: C.textSec },
  tierBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 12, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, gap: 6 },
  tierBadgeText: { fontSize: 13, fontWeight: '600' },
  profileMenu: { marginTop: 20, marginHorizontal: 20, backgroundColor: C.card, borderRadius: 16 },
  profileMenuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: C.cardLight },
  profileMenuIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: C.cardLight, alignItems: 'center', justifyContent: 'center' },
  profileMenuText: { flex: 1, fontSize: 15, color: C.text, marginLeft: 14, fontWeight: '500' },
  notificationBadge: { backgroundColor: C.error, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginRight: 8 },
  notificationBadgeText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  liveIndicator: { backgroundColor: C.success, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginRight: 8 },
  liveIndicatorText: { fontSize: 10, fontWeight: '700', color: '#fff' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20, marginHorizontal: 20, padding: 16, backgroundColor: 'rgba(248,113,113,0.1)', borderRadius: 12, gap: 8 },
  logoutBtnText: { fontSize: 15, fontWeight: '600', color: C.error },
  versionText: { textAlign: 'center', color: C.textMuted, fontSize: 12, marginTop: 20 },
  navBar: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 12, borderTopWidth: 1, borderTopColor: C.cardLight },
  navItem: { alignItems: 'center' },
  navItemIcon: { width: 44, height: 32, alignItems: 'center', justifyContent: 'center' },
  navItemIconActive: { backgroundColor: 'rgba(212,175,55,0.15)', borderRadius: 16 },
  navLabel: { fontSize: 10, color: C.textMuted, marginTop: 4 },
  navLabelActive: { color: C.gold },
  goldBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10 },
  goldBtnLg: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12 },
  goldBtnText: { fontSize: 12, fontWeight: '700', color: C.bg, letterSpacing: 0.5 },
  goldBtnTextLg: { fontSize: 15 },
  emptyContainer: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: C.text, marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: C.textSec, marginTop: 4 },
  motaCardContainer: { paddingHorizontal: 20, marginBottom: 20 },
  motaCard: { borderRadius: 20, padding: 24, height: 200, position: 'relative', overflow: 'hidden' },
  motaCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  motaCardLogo: { fontSize: 24, fontWeight: '800', color: C.bg, letterSpacing: 2 },
  motaCardType: { fontSize: 12, color: 'rgba(0,0,0,0.6)', fontWeight: '600' },
  motaCardChip: { width: 44, height: 34, borderRadius: 6, backgroundColor: 'rgba(0,0,0,0.1)', alignItems: 'center', justifyContent: 'center' },
  motaCardNumber: { fontSize: 18, fontWeight: '600', color: C.bg, letterSpacing: 3, marginTop: 30 },
  motaCardFooter: { flexDirection: 'row', justifyContent: 'space-between', position: 'absolute', bottom: 24, left: 24, right: 24 },
  motaCardLabel: { fontSize: 10, color: 'rgba(0,0,0,0.5)', marginBottom: 4 },
  motaCardValue: { fontSize: 14, fontWeight: '700', color: C.bg },
  motaCardPattern: { position: 'absolute', right: -30, top: -30, opacity: 0.5 },
  portfolioContainer: { padding: 20 },
  portfolioTitle: { fontSize: 22, fontWeight: '700', color: C.text, marginBottom: 4 },
  portfolioSubtitle: { fontSize: 14, color: C.textSec, marginBottom: 20 },
  portfolioStats: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  portfolioStat: { flex: 1, backgroundColor: C.card, padding: 16, borderRadius: 12, marginHorizontal: 4, alignItems: 'center' },
  portfolioStatLabel: { fontSize: 11, color: C.textMuted, marginBottom: 6 },
  portfolioStatValue: { fontSize: 18, fontWeight: '700', color: C.text },
  timelineTitle: { fontSize: 18, fontWeight: '700', color: C.text, marginBottom: 16 },
  timeline: { marginBottom: 24 },
  timelineItem: { flexDirection: 'row', marginBottom: 8 },
  timelineDot: { alignItems: 'center', marginRight: 16 },
  timelineDotInner: { width: 24, height: 24, borderRadius: 12, backgroundColor: C.cardLight, alignItems: 'center', justifyContent: 'center' },
  timelineDotCompleted: { backgroundColor: C.success },
  timelineDotActive: { backgroundColor: C.gold },
  timelineLine: { width: 2, flex: 1, backgroundColor: C.cardLight, marginTop: 4 },
  timelineLineCompleted: { backgroundColor: C.success },
  timelineContent: { flex: 1, paddingBottom: 24 },
  timelinePhase: { fontSize: 12, color: C.gold, fontWeight: '600' },
  timelineName: { fontSize: 15, fontWeight: '700', color: C.text, marginVertical: 2 },
  timelineYears: { fontSize: 12, color: C.textMuted },
  timelineAmount: { fontSize: 14, fontWeight: '600', color: C.success, marginTop: 4 },
  timelineDate: { fontSize: 12, color: C.textSec },
  timelineStatusBadge: { backgroundColor: 'rgba(74,222,128,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, marginTop: 6, alignSelf: 'flex-start' },
  timelineStatusText: { fontSize: 11, fontWeight: '600', color: C.success },
  dividendsCard: { backgroundColor: C.card, borderRadius: 16, padding: 20, marginBottom: 20 },
  dividendsHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  dividendsTitle: { fontSize: 18, fontWeight: '700', color: C.text },
  dividendsNote: { fontSize: 13, color: C.textSec, lineHeight: 20, marginBottom: 16 },
  dividendsExpected: { backgroundColor: C.cardLight, borderRadius: 12, padding: 16, alignItems: 'center' },
  dividendsLabel: { fontSize: 12, color: C.textMuted, marginBottom: 4 },
  dividendsAmount: { fontSize: 28, fontWeight: '700', color: C.success },
  dividendsDate: { fontSize: 14, color: C.textSec, marginTop: 4 },
  portfolioLinks: { backgroundColor: C.card, borderRadius: 16 },
  portfolioLink: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: C.cardLight },
  portfolioLinkIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: C.cardLight, alignItems: 'center', justifyContent: 'center' },
  portfolioLinkContent: { flex: 1, marginLeft: 14 },
  portfolioLinkTitle: { fontSize: 15, fontWeight: '600', color: C.text },
  portfolioLinkSub: { fontSize: 12, color: C.textSec },
  tierBenefitsCard: { backgroundColor: C.card, borderRadius: 16, overflow: 'hidden', marginBottom: 20 },
  tierBenefitsHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  tierBenefitsTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: C.bg },
  tierBenefitsInvestment: { fontSize: 14, fontWeight: '700', color: C.bg },
  tierBenefitsList: { padding: 16 },
  tierBenefitItem: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  tierBenefitText: { fontSize: 14, color: C.textSec, flex: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', maxWidth: 400, backgroundColor: C.card, borderRadius: 20, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: C.cardLight },
  modalTitle: { fontSize: 18, fontWeight: '700', color: C.text },
  modalClose: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.cardLight, alignItems: 'center', justifyContent: 'center' },
  modalBody: { padding: 20 },
  modalFooter: { flexDirection: 'row', padding: 20, gap: 12, borderTopWidth: 1, borderTopColor: C.cardLight },
  modalLabel: { fontSize: 13, fontWeight: '600', color: C.textMuted, marginBottom: 8, marginTop: 16 },
  modalInput: { backgroundColor: C.cardLight, borderRadius: 10, padding: 14, color: C.text, fontSize: 15 },
  modalTextarea: { height: 100, textAlignVertical: 'top' },
  modalCancelBtn: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: C.cardLight, alignItems: 'center' },
  modalCancelText: { fontSize: 15, fontWeight: '600', color: C.textSec },
  modalSubmitBtn: { flex: 1, padding: 14, borderRadius: 10, alignItems: 'center' },
  modalSubmitText: { fontSize: 15, fontWeight: '700', color: C.bg },
  serviceOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  serviceOption: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, backgroundColor: C.cardLight, borderWidth: 1, borderColor: C.cardLight },
  serviceOptionText: { fontSize: 13, color: C.text },
  vipPromoHeader: { alignItems: 'center', padding: 30 },
  vipPromoTitle: { fontSize: 24, fontWeight: '700', color: C.bg, marginTop: 12 },
  vipPromoSubtitle: { fontSize: 13, color: 'rgba(0,0,0,0.6)' },
  vipPromoText: { fontSize: 14, color: C.textSec, lineHeight: 22, marginBottom: 20 },
  vipBenefitsTitle: { fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 12 },
  vipBenefitItem: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  vipBenefitText: { fontSize: 14, color: C.textSec },
  vipTiersPreview: { marginTop: 20, padding: 16, backgroundColor: C.cardLight, borderRadius: 12 },
  vipTiersTitle: { fontSize: 14, fontWeight: '700', color: C.text, marginBottom: 12 },
  vipTierRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  vipTierBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  vipTierName: { fontSize: 13, fontWeight: '700', color: C.bg },
  vipTierAmount: { fontSize: 14, fontWeight: '600', color: C.textSec },
});
