/**
 * MOTA - Macau of the Americas
 * Premium Casino Resort App v4.0
 * Complete with all advanced features integrated
 * 
 * APP1.TSX - Part 1 of 2
 * Contains: Imports, Constants, Utilities, Components, BookingModal
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, 
  Dimensions, StatusBar, ActivityIndicator, RefreshControl, FlatList, 
  TextInput, Alert, Modal, Animated, Linking, Platform, KeyboardAvoidingView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './context/AuthContext';
import { C, G, PLACEHOLDER_IMAGE } from './constants/theme';
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
import { TouchableWithoutFeedback } from 'react-native';

// ============================================
// NEW COMPONENT IMPORTS
// ============================================
import {
  CalendarGrid,
  TimeSlotSelector,
  BookingDetailsEditor,
  DietaryRestrictionsModal,
  GuestCountSelector,
  FixedEventBookingInfo,
} from './components/BookingComponents';

import { AdaptiveMediaGrid, ImageViewer } from './components/MediaGrid';

import {
  PaymentMethodSelector,
  PaymentConfirmationModal,
} from './components/PaymentSystem';

import {
  NetGainCard,
  FavoritesSection,
  ProfilePicture,
  PermissionsModal,
  AccountDeletionModal,
} from './components/ProfileSettings';

import {
  RatingModal,
  EngagementTracker,
} from './components/RatingSystem';

const { width } = Dimensions.get('window');

// ============================================
// FIX #6: PHONE VALIDATION UTILITIES
// ============================================
const formatPhoneNumber = (text: string): string => {
  const cleaned = text.replace(/\D/g, '').slice(0, 10);
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
  return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
};
const isValidPhone = (phone: string): boolean => phone.replace(/\D/g, '').length === 10;
const isValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// ============================================
// AI ASSISTANT USE CASES
// ============================================
const AIUseCases = [
  { id: 1, title: 'Find Dining', desc: 'Discover perfect restaurants', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&q=60', icon: 'restaurant' },
  { id: 2, title: 'Book Experiences', desc: 'Adventures tailored to you', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=200&q=60', icon: 'compass' },
  { id: 3, title: 'Plan Your Stay', desc: 'Perfect accommodations', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&q=60', icon: 'bed' },
  { id: 4, title: 'For You', desc: 'Personalized suggestions', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&q=60', icon: 'sparkles' },
];

// ============================================
// CONCIERGE SERVICE DATA WITH IMAGES
// ============================================
const ConciergeServices = {
  standard: [
    { icon: 'restaurant-outline', title: 'Dining', desc: 'Reserve tables at any restaurant', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80', color: '#FF6B6B',
      options: [
        { name: 'Ocean Pearl', type: 'Fine Dining', cuisine: 'Seafood', price: '$$$$', rating: 4.9, image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&q=80' },
        { name: 'Jade Garden', type: 'Asian Fusion', cuisine: 'Pan-Asian', price: '$$$', rating: 4.7, image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&q=80' },
        { name: 'The Steakhouse', type: 'Steakhouse', cuisine: 'American', price: '$$$$', rating: 4.8, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80' },
      ]
    },
    { icon: 'bed-outline', title: 'Lodging', desc: 'Book suites and villas', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80', color: '#4ECDC4',
      options: [
        { name: 'Royal Suite', type: 'Suite', beds: 'King', sqft: '1,200', price: '$899/night', image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80' },
        { name: 'Ocean Villa', type: 'Villa', beds: '2 King', sqft: '2,500', price: '$1,599/night', image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80' },
        { name: 'Penthouse', type: 'Penthouse', beds: '3 King', sqft: '4,000', price: '$2,999/night', image: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=400&q=80' },
      ]
    },
    { icon: 'calendar-outline', title: 'Events', desc: 'VIP event access', image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=80', color: '#9B59B6',
      options: [
        { name: 'Gala Night', type: 'Formal Event', date: 'Dec 31', price: '$500/person', image: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=400&q=80' },
        { name: 'Wine Tasting', type: 'Social', date: 'Weekly', price: '$150/person', image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&q=80' },
        { name: 'Live Concert', type: 'Entertainment', date: 'Sat nights', price: '$200/person', image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&q=80' },
      ]
    },
    { icon: 'car-sport-outline', title: 'Transportation', desc: 'Luxury vehicle service', image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&q=80', color: '#3498DB',
      options: [
        { name: 'Airport Transfer', type: 'Transfer', vehicle: 'Mercedes S-Class', price: '$150', image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&q=80' },
        { name: 'City Tour', type: 'Tour', duration: '4 hours', price: '$300', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&q=80' },
        { name: 'Day Trip', type: 'Excursion', duration: 'Full day', price: '$500', image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&q=80' },
      ]
    },
    { icon: 'fitness-outline', title: 'Wellness', desc: 'Spa and fitness booking', image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&q=80', color: '#1ABC9C',
      options: [
        { name: 'Signature Massage', type: 'Spa', duration: '90 min', price: '$200', image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&q=80' },
        { name: 'Couples Retreat', type: 'Package', duration: '3 hours', price: '$500', image: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=400&q=80' },
        { name: 'Personal Training', type: 'Fitness', duration: '1 hour', price: '$100', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80' },
      ]
    },
    { icon: 'golf-outline', title: 'Recreation', desc: 'Golf, tennis, and more', image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400&q=80', color: '#27AE60',
      options: [
        { name: 'Golf Round', type: 'Golf', holes: '18', price: '$250', image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400&q=80' },
        { name: 'Tennis Court', type: 'Tennis', duration: '1 hour', price: '$50', image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400&q=80' },
        { name: 'Scuba Diving', type: 'Water Sports', duration: '2 hours', price: '$150', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&q=80' },
      ]
    },
  ],
  vip: [
    { icon: 'airplane', title: 'Private Aviation', desc: 'Charter jets and helicopters', tier: 'gold', image: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=400&q=80',
      options: [
        { name: 'Helicopter Tour', type: 'Charter', duration: '1 hour', price: 'From $2,500', image: 'https://images.unsplash.com/photo-1534786626903-3d8a5c8f0b07?w=400&q=80' },
        { name: 'Private Jet', type: 'Charter', route: 'Regional', price: 'From $15,000', image: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=400&q=80' },
        { name: 'Island Hopper', type: 'Charter', islands: '3 stops', price: 'From $8,000', image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&q=80' },
      ]
    },
    { icon: 'boat', title: 'Yacht Charter', desc: 'Luxury vessels and crews', tier: 'gold', image: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=400&q=80',
      options: [
        { name: 'Day Cruise', type: 'Charter', duration: '8 hours', price: 'From $5,000', image: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=400&q=80' },
        { name: 'Sunset Sail', type: 'Charter', duration: '4 hours', price: 'From $2,000', image: 'https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=400&q=80' },
        { name: 'Week Charter', type: 'Charter', duration: '7 days', price: 'From $50,000', image: 'https://images.unsplash.com/photo-1605281317010-fe5ece3098e8?w=400&q=80' },
      ]
    },
    { icon: 'diamond', title: 'Bespoke Experiences', desc: 'Custom curated journeys', tier: 'platinum', image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&q=80',
      options: [
        { name: 'Private Island', type: 'Exclusive', duration: 'Full day', price: 'From $25,000', image: 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=400&q=80' },
        { name: 'Chef\'s Table', type: 'Culinary', guests: 'Up to 8', price: 'From $5,000', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80' },
        { name: 'VIP Safari', type: 'Adventure', duration: '3 days', price: 'From $15,000', image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=400&q=80' },
      ]
    },
    { icon: 'people', title: 'Personal Staff', desc: 'Dedicated service team', tier: 'platinum', image: 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=400&q=80',
      options: [
        { name: 'Personal Butler', type: 'Service', availability: '24/7', price: '$1,000/day', image: 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=400&q=80' },
        { name: 'Private Chef', type: 'Service', meals: 'All day', price: '$800/day', image: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&q=80' },
        { name: 'Security Detail', type: 'Service', team: '2 agents', price: '$2,000/day', image: 'https://images.unsplash.com/photo-1521791055366-0d553872125f?w=400&q=80' },
      ]
    },
    { icon: 'videocam', title: 'Media Production', desc: 'Film and photo services', tier: 'diamond', image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&q=80',
      options: [
        { name: 'Photo Shoot', type: 'Media', duration: 'Half day', price: 'From $5,000', image: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400&q=80' },
        { name: 'Film Production', type: 'Media', crew: 'Full team', price: 'From $50,000', image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&q=80' },
        { name: 'Private Concert', type: 'Entertainment', artists: 'Your choice', price: 'From $250,000', image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&q=80' },
      ]
    },
  ],
};

// ============================================
// HERO SLIDES
// ============================================
const DefaultSlides = [
  { 
    id: 1, 
    title: 'Luxury Retreats', 
    subtitle: 'WHERE PARADISE MEETS PERFECTION', 
    description: 'World-class accommodations with breathtaking Caribbean views', 
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80',
    linkType: 'tab',
    linkTarget: 'Lodging',
    linkTab: 1,
  },
  { 
    id: 2, 
    title: 'World-Class Gaming', 
    subtitle: 'THE ULTIMATE ENTERTAINMENT', 
    description: 'Premier casino experience with exclusive VIP lounges', 
    imageUrl: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=1200&q=80',
    linkType: 'tab',
    linkTarget: 'Nightlife',
    linkTab: 1,
  },
  { 
    id: 3, 
    title: 'Adventure Awaits', 
    subtitle: 'EXPLORE THE UNTAMED BEAUTY', 
    description: 'From pristine beaches to lush jungles, discover Belize', 
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80',
    linkType: 'tab',
    linkTarget: 'Experiences',
    linkTab: 1,
  },
  { 
    id: 4, 
    title: 'Exquisite Dining', 
    subtitle: 'A FEAST FOR THE SENSES', 
    description: 'Exquisite cuisines crafted by world-renowned chefs', 
    imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80',
    linkType: 'tab',
    linkTarget: 'Eateries',
    linkTab: 1,
  },
  { 
    id: 5, 
    title: 'Unforgettable Events', 
    subtitle: 'WHERE THE NIGHT COMES ALIVE', 
    description: 'Exclusive clubs, lounges, and entertainment venues', 
    imageUrl: 'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=1200&q=80',
    linkType: 'tab',
    linkTarget: null,
    linkTab: 2,
  },
];

// ============================================
// INVESTOR TIER BENEFITS
// ============================================
const TierBenefits: Record<string, any> = {
  gold: {
    id: 'gold',
    name: 'Gold',
    investment: '$2.5M+',
    creditLine: '$50,000',
    gradient: ['#FFD700', '#FFA500', '#B8860B'],
    color: '#FFD700',
    benefits: [
      'Priority restaurant reservations',
      'Complimentary suite upgrades',
      'Access to VIP lounge',
      'Dedicated concierge line',
      'Exclusive member events',
    ],
  },
  platinum: {
    id: 'platinum',
    name: 'Platinum',
    investment: '$15M+',
    creditLine: '$250,000',
    gradient: ['#E5E4E2', '#A0A0A0', '#71706E'],
    color: '#E5E4E2',
    benefits: [
      'All Gold benefits',
      'Private jet booking service',
      'Yacht charter access',
      'Personal account manager',
      'Bespoke experience curation',
      'Priority event access',
    ],
  },
  diamond: {
    id: 'diamond',
    name: 'Diamond',
    investment: '$70M+',
    creditLine: '$1,000,000',
    gradient: ['#B9F2FF', '#89CFF0', '#00BFFF'],
    color: '#B9F2FF',
    benefits: [
      'All Platinum benefits',
      'Unlimited credit line',
      '24/7 personal concierge team',
      'Private villa access',
      'Helicopter transfers',
      'Custom event hosting',
      'Board meeting privileges',
    ],
  },
};

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
        {(item.cuisine || item.category) && <Text style={s.itemCardSub}>{item.cuisine || item.category}</Text>}
        <View style={s.itemCardFooter}>
          {item.priceRange && <Text style={s.itemCardPrice}>{item.priceRange}</Text>}
          {item.price && <Text style={s.itemCardPrice}>${item.price}</Text>}
          {item.rating > 0 && <View style={s.itemCardRating}><Ionicons name="star" size={12} color={C.gold} /><Text style={s.itemCardRatingText}>{item.rating}</Text></View>}
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
          <View style={s.motaCardChip}>
            <Ionicons name="diamond" size={24} color={C.bg} />
          </View>
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
// PORTFOLIO OVERVIEW COMPONENT (with Net Gain)
// ============================================
const PortfolioOverview = ({ user }: { user: any }) => {
  const investmentAmount = user?.investmentAmount || 0;
  const portfolioValue = user?.portfolioValue || 0;
  const totalDividends = user?.totalDividends || 0;
  const netGain = (portfolioValue - investmentAmount) + totalDividends;
  const netGainPercent = investmentAmount > 0 ? ((netGain / investmentAmount) * 100).toFixed(1) : '0';
  const isPositive = netGain >= 0;
  
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return '$' + (amount / 1000000).toFixed(2) + 'M';
    if (amount >= 1000) return '$' + (amount / 1000).toFixed(0) + 'K';
    return '$' + amount.toLocaleString();
  };

  return (
    <View style={s.portfolioContainer}>
      <Text style={s.portfolioTitle}>Investment Portfolio</Text>
      <Text style={s.portfolioSubtitle}>Your MOTA investment overview</Text>
      <View style={s.portfolioStats}>
        <View style={s.portfolioStat}>
          <Text style={s.portfolioStatLabel}>Invested</Text>
          <Text style={s.portfolioStatValue}>{formatCurrency(investmentAmount)}</Text>
        </View>
        <View style={s.portfolioStat}>
          <Text style={s.portfolioStatLabel}>Current Value</Text>
          <Text style={s.portfolioStatValue}>{formatCurrency(portfolioValue)}</Text>
        </View>
        <View style={s.portfolioStat}>
          <Text style={s.portfolioStatLabel}>Dividends</Text>
          <Text style={[s.portfolioStatValue, { color: C.gold }]}>{formatCurrency(totalDividends)}</Text>
        </View>
      </View>
      <NetGainCard 
        investmentAmount={investmentAmount}
        portfolioValue={portfolioValue}
        totalDividends={totalDividends}
      />
    </View>
  );
};

// ============================================
// VIP PROMO MODAL
// ============================================
const VIPPromoModal = ({ visible, onClose }: any) => (
  <Modal visible={visible} transparent animationType="fade">
    <TouchableWithoutFeedback onPress={onClose}>
      <View style={s.modalOverlay}>
        <TouchableWithoutFeedback>
          <View style={s.modalContent}>
            <LinearGradient colors={G.gold} style={s.vipPromoHeader}>
              <Ionicons name="diamond" size={48} color={C.bg} />
              <Text style={s.vipPromoTitle}>Become a VIP Investor</Text>
              <Text style={s.vipPromoSubtitle}>Unlock exclusive benefits</Text>
            </LinearGradient>
            <ScrollView style={s.modalBody}>
              <Text style={s.vipPromoText}>Unlock premium services and personalized experiences.</Text>
              <Text style={s.vipBenefitsTitle}>VIP Benefits Include:</Text>
              {['24/7 Dedicated Concierge Team', 'Priority Reservations at All Venues', 'Private Jet & Yacht Arrangements', 'Bespoke Experience Curation', 'Exclusive Event Access', 'Personal Account Manager'].map((b, i) => (
                <View key={i} style={s.vipBenefitItem}>
                  <Ionicons name="checkmark-circle" size={20} color={C.gold} />
                  <Text style={s.vipBenefitText}>{b}</Text>
                </View>
              ))}
              <View style={s.vipTiersPreview}>
                <Text style={s.vipTiersTitle}>Investment Tiers</Text>
                {Object.values(TierBenefits).map((tier: any) => (
                  <View key={tier.id} style={s.vipTierRow}>
                    <LinearGradient colors={tier.gradient} style={s.vipTierBadge}>
                      <Text style={s.vipTierName}>{tier.name}</Text>
                    </LinearGradient>
                    <Text style={s.vipTierAmount}>{tier.investment}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
            <View style={s.modalFooter}>
              <TouchableOpacity style={s.modalCancelBtn} onPress={onClose}>
                <Text style={s.modalCancelText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose}>
                <LinearGradient colors={G.gold} style={s.modalSubmitBtn}>
                  <Text style={s.modalSubmitText}>Learn More</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  </Modal>
);

// ============================================
// AI ASSISTANT POPUP
// ============================================
const AIAssistantPopup = ({ visible, onClose }: any) => {
  const [query, setQuery] = useState('');
  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={s.aiPopupOverlay}>
            <TouchableWithoutFeedback>
              <View style={s.aiPopupContent}>
                <View style={s.aiPopupHeader}>
                  <LinearGradient colors={G.gold} style={s.aiPopupIcon}>
                    <Ionicons name="sparkles" size={24} color={C.bg} />
                  </LinearGradient>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={s.aiPopupTitle}>MOTA AI Assistant</Text>
                    <Text style={s.aiPopupSubtitle}>How can I help you today?</Text>
                  </View>
                  <TouchableOpacity onPress={onClose}>
                    <Ionicons name="close" size={24} color={C.textMuted} />
                  </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.aiUseCases}>
                  {AIUseCases.map((uc) => (
                    <TouchableOpacity key={uc.id} style={s.aiUseCaseCard} onPress={() => setQuery(uc.title)}>
                      <Image source={{ uri: uc.image }} style={s.aiUseCaseImage} />
                      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={s.aiUseCaseOverlay} />
                      <View style={s.aiUseCaseContent}>
                        <Text style={s.aiUseCaseTitle}>{uc.title}</Text>
                        <Text style={s.aiUseCaseDesc}>{uc.desc}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <View style={s.aiInputContainer}>
                  <TextInput 
                    style={s.aiInput} 
                    placeholder="Ask me anything about MOTA..." 
                    placeholderTextColor={C.textMuted} 
                    value={query} 
                    onChangeText={setQuery} 
                    multiline 
                  />
                  <TouchableOpacity style={s.aiSendBtn}>
                    <LinearGradient colors={G.gold} style={s.aiSendBtnGrad}>
                      <Ionicons name="send" size={18} color={C.bg} />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ============================================
// CONCIERGE SERVICE DETAIL MODAL
// ============================================
const ConciergeServiceDetailModal = ({ visible, service, onClose, onBook }: any) => {
  if (!service) return null;
  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={s.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={s.conciergeDetailModal}>
              <View style={s.conciergeDetailHeader}>
                <LinearGradient colors={G.gold} style={s.conciergeDetailIcon}>
                  <Ionicons name={service.icon || 'diamond'} size={28} color={C.bg} />
                </LinearGradient>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={s.conciergeDetailTitle}>{service.title}</Text>
                  <Text style={s.conciergeDetailDesc}>{service.desc}</Text>
                </View>
                <TouchableOpacity onPress={onClose}>
                  <Ionicons name="close" size={24} color={C.textMuted} />
                </TouchableOpacity>
              </View>
              <View style={s.conciergeDetailDivider} />
              <Text style={s.conciergeOptionTitle}>Available Options</Text>
              <ScrollView style={s.conciergeOptions}>
                {(service.options || []).map((option: any, index: number) => (
                  <TouchableOpacity 
                    key={index} 
                    style={s.conciergeOptionCard} 
                    onPress={() => { onBook(option); onClose(); }}
                  >
                    <Image source={{ uri: option.image }} style={s.conciergeOptionImage} />
                    <View style={s.conciergeOptionInfo}>
                      <Text style={s.conciergeOptionName}>{option.name}</Text>
                      <Text style={s.conciergeOptionType}>{option.type}</Text>
                      <Text style={s.conciergeOptionPrice}>{option.price}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={C.gold} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

// ============================================
// BOOKING MODAL - WITH ALL FIXES APPLIED
// FIX #1: Click outside to close (TouchableWithoutFeedback wrapper)
// FIX #3: All events as fixed schedule (isFixed logic)
// FIX #4: Proper API format (clean phone, proper fields)
// FIX #5: Payment methods (Step 4 with 3 options)
// FIX #6: Phone validation (formatPhoneNumber, isValidPhone, maxLength)
// ============================================
const BookingModal = ({ visible, item, itemType, isFixedEvent = false, onClose, onConfirm, user }: any) => {
  // FIX #3: ALL events treated as fixed schedule
  const isFixed = isFixedEvent || itemType === 'event';
  
  // FIX #5: 5 steps now (added payment step)
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [guestCount, setGuestCount] = useState(1);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingDetails, setBookingDetails] = useState({ 
    name: user?.name || '', 
    email: user?.email || '', 
    phone: user?.phone || '', 
    specialRequests: '' 
  });
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>(user?.dietaryRestrictions || []);
  const [showDietaryModal, setShowDietaryModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<'card' | 'mota_credit' | 'mota_equity'>('card');

  useEffect(() => { 
    if (selectedDate && !isFixed) loadTimeSlots(); 
  }, [selectedDate]);

  const loadTimeSlots = async () => {
    if (!item?._id) return;
    setLoadingSlots(true);
    try {
      const dateStr = selectedDate?.toISOString().split('T')[0];
      const response = await api.get(`/reservations/slots/${itemType}/${item._id}/${dateStr}`);
      setAvailableSlots(response.data.slots || []);
    } catch (error) {
      setAvailableSlots([
        { time: '6:00 PM', available: true, spotsLeft: 5 },
        { time: '6:30 PM', available: true, spotsLeft: 3 },
        { time: '7:00 PM', available: true, spotsLeft: 8 },
        { time: '7:30 PM', available: true, spotsLeft: 2 },
        { time: '8:00 PM', available: true, spotsLeft: 6 },
        { time: '9:00 PM', available: true, spotsLeft: 10 },
      ]);
    } finally { 
      setLoadingSlots(false); 
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!isFixed && (!selectedDate || !selectedTime)) {
        Alert.alert('Select Date & Time', 'Please select a date and time.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!bookingDetails.name || !bookingDetails.email || !bookingDetails.phone) {
        Alert.alert('Required Fields', 'Please fill in all required fields.');
        return;
      }
      // FIX #6: Phone validation
      if (!isValidPhone(bookingDetails.phone)) {
        Alert.alert('Invalid Phone', 'Please enter a valid 10-digit phone number.');
        return;
      }
      if (!isValidEmail(bookingDetails.email)) {
        Alert.alert('Invalid Email', 'Please enter a valid email address.');
        return;
      }
      setShowDietaryModal(true);
    } else if (step === 3) {
      setStep(4);
    } else if (step === 4) {
      setStep(5);
    }
  };

  const handleDietarySave = (restrictions: string[]) => {
    setDietaryRestrictions(restrictions);
    setShowDietaryModal(false);
    setStep(4);
  };

  const handleDietarySkip = () => {
    setShowDietaryModal(false);
    setStep(4);
  };

  const handleConfirmBooking = () => {
    // FIX #4: Proper API format - clean phone number (digits only)
    onConfirm({
      item,
      itemType,
      date: isFixed ? item.date : selectedDate?.toISOString(),
      time: isFixed ? (item.startTime || item.time) : selectedTime,
      guestCount,
      bookingDetails: {
        name: bookingDetails.name.trim(),
        email: bookingDetails.email.trim(),
        phone: bookingDetails.phone.replace(/\D/g, ''), // FIX #4: Digits only
        specialRequests: bookingDetails.specialRequests?.trim() || '',
      },
      dietaryRestrictions,
      isFixedEvent: isFixed,
      paymentMethod: selectedPayment,
    });
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setStep(1);
    setSelectedDate(null);
    setSelectedTime('');
    setGuestCount(1);
    setAvailableSlots([]);
    setSelectedPayment('card');
  };

  if (!visible || !item) return null;
  console.log('=== BOOKING MODAL RENDERING ===');
  console.log('Step:', step);
  console.log('isFixed:', isFixed);
  console.log('itemType:', itemType);
  console.log('item:', item?.name);
  // FIX #1: Click outside to close
  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={s.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={s.bookingModalContent}>
              <View style={s.bookingModalHeader}>
                <View>
                  <Text style={s.bookingModalTitle}>{item.name}</Text>
                  <Text style={s.bookingModalSubtitle}>
                    {step === 1 ? 'Select Date & Time' : 
                     step === 2 ? 'Your Details' : 
                     step === 3 ? 'Dietary Restrictions' : 
                     step === 4 ? 'Payment Method' : 
                     'Confirm Booking'}
                  </Text>
                </View>
                <TouchableOpacity onPress={onClose} style={s.bookingModalClose}>
                  <Ionicons name="close" size={24} color={C.text} />
                </TouchableOpacity>
              </View>
              
              {/* Progress dots - 5 steps now */}
              <View style={s.bookingProgress}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <View key={n} style={[s.bookingProgressDot, step >= n && s.bookingProgressDotActive]} />
                ))}
              </View>
              
              <ScrollView style={s.bookingModalBody} showsVerticalScrollIndicator={false}>
                {/* Step 1: Date & Time */}
                {step === 1 && (
                  <>
                    {isFixed ? (
                      <FixedEventBookingInfo event={item} />
                    ) : (
                      <>
                        {console.log('Rendering CalendarGrid, isFixed:', isFixed)}
                        <CalendarGrid selectedDate={selectedDate} onSelectDate={setSelectedDate} />
                        {selectedDate && (
                          <TimeSlotSelector 
                            selectedTime={selectedTime} 
                            onSelectTime={setSelectedTime} 
                            availableSlots={availableSlots} 
                            loading={loadingSlots} 
                          />
                        )}
                      </>
                    )}
                    <GuestCountSelector count={guestCount} onChangeCount={setGuestCount} maxGuests={item.maxGuests || 20} />
                  </>
                )}
                
                {/* Step 2: Contact Details */}
                {step === 2 && (
                  <View style={s.bookingFormSection}>
                    <Text style={s.bookingFormLabel}>Full Name *</Text>
                    <TextInput 
                      style={s.bookingFormInput} 
                      placeholder="Enter your full name" 
                      placeholderTextColor={C.textMuted} 
                      value={bookingDetails.name} 
                      onChangeText={(text) => setBookingDetails({ ...bookingDetails, name: text })} 
                    />
                    
                    <Text style={s.bookingFormLabel}>Email *</Text>
                    <TextInput 
                      style={[
                        s.bookingFormInput, 
                        bookingDetails.email && !isValidEmail(bookingDetails.email) && { borderColor: C.error, borderWidth: 1 }
                      ]} 
                      placeholder="your@email.com" 
                      placeholderTextColor={C.textMuted} 
                      value={bookingDetails.email} 
                      onChangeText={(text) => setBookingDetails({ ...bookingDetails, email: text })} 
                      keyboardType="email-address" 
                      autoCapitalize="none" 
                    />
                    
                    {/* FIX #6: Phone validation with formatting and visual error */}
                    <Text style={s.bookingFormLabel}>Phone *</Text>
                    <TextInput 
                      style={[
                        s.bookingFormInput, 
                        bookingDetails.phone && !isValidPhone(bookingDetails.phone) && { borderColor: C.error, borderWidth: 1 }
                      ]} 
                      placeholder="(555) 123-4567" 
                      placeholderTextColor={C.textMuted} 
                      value={bookingDetails.phone} 
                      onChangeText={(text) => setBookingDetails({ ...bookingDetails, phone: formatPhoneNumber(text) })} 
                      keyboardType="phone-pad" 
                      maxLength={14}  // FIX #6: maxLength for formatted phone
                    />
                    
                    <Text style={s.bookingFormLabel}>Special Requests</Text>
                    <TextInput 
                      style={[s.bookingFormInput, { height: 80, textAlignVertical: 'top' }]} 
                      placeholder="Any special requests..." 
                      placeholderTextColor={C.textMuted} 
                      value={bookingDetails.specialRequests} 
                      onChangeText={(text) => setBookingDetails({ ...bookingDetails, specialRequests: text })} 
                      multiline 
                    />
                  </View>
                )}
                
                {/* FIX #5: Step 4 - Payment Methods */}
                {step === 4 && (
                  <View style={s.paymentSection}>
                    <Text style={s.paymentSectionTitle}>Select Payment Method</Text>
                    {[
                      { key: 'card', icon: 'card', title: 'Credit / Debit Card', desc: 'Pay with Visa, Mastercard, Amex' },
                      { key: 'mota_credit', icon: 'wallet', title: 'MOTA Credit Line', desc: 'Use your investor credit line' },
                      { key: 'mota_equity', icon: 'diamond', title: 'MOTA Equity', desc: 'Pay with your equity balance' },
                    ].map((pm) => (
                      <TouchableOpacity 
                        key={pm.key} 
                        style={[s.paymentOption, selectedPayment === pm.key && s.paymentOptionSelected]} 
                        onPress={() => setSelectedPayment(pm.key as any)}
                      >
                        <View style={s.paymentOptionIcon}>
                          <Ionicons name={pm.icon as any} size={24} color={selectedPayment === pm.key ? C.gold : C.textMuted} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={s.paymentOptionTitle}>{pm.title}</Text>
                          <Text style={s.paymentOptionDesc}>{pm.desc}</Text>
                        </View>
                        <View style={[s.paymentRadio, selectedPayment === pm.key && s.paymentRadioSelected]}>
                          {selectedPayment === pm.key && <View style={s.paymentRadioInner} />}
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
                
                {/* Step 5: Confirmation */}
                {step === 5 && (
                  <View style={s.bookingConfirmation}>
                    <View style={s.confirmationIcon}>
                      <Ionicons name="checkmark-circle" size={48} color={C.gold} />
                    </View>
                    <Text style={s.confirmationTitle}>Review Your Booking</Text>
                    <View style={s.confirmationCard}>
                      <View style={s.confirmationRow}>
                        <Text style={s.confirmationLabel}>Date</Text>
                        <Text style={s.confirmationValue}>
                          {(isFixed ? new Date(item.date) : selectedDate)?.toLocaleDateString('en-US', { 
                            weekday: 'long', month: 'long', day: 'numeric' 
                          })}
                        </Text>
                      </View>
                      <View style={s.confirmationRow}>
                        <Text style={s.confirmationLabel}>Time</Text>
                        <Text style={s.confirmationValue}>{isFixed ? item.startTime : selectedTime}</Text>
                      </View>
                      <View style={s.confirmationRow}>
                        <Text style={s.confirmationLabel}>Guests</Text>
                        <Text style={s.confirmationValue}>{guestCount}</Text>
                      </View>
                      <View style={s.confirmationRow}>
                        <Text style={s.confirmationLabel}>Name</Text>
                        <Text style={s.confirmationValue}>{bookingDetails.name}</Text>
                      </View>
                      <View style={s.confirmationRow}>
                        <Text style={s.confirmationLabel}>Payment</Text>
                        <Text style={s.confirmationValue}>
                          {selectedPayment === 'card' ? 'Credit/Debit Card' : 
                           selectedPayment === 'mota_credit' ? 'MOTA Credit Line' : 
                           'MOTA Equity'}
                        </Text>
                      </View>
                      {dietaryRestrictions.length > 0 && (
                        <View style={s.confirmationRow}>
                          <Text style={s.confirmationLabel}>Dietary</Text>
                          <Text style={s.confirmationValue}>{dietaryRestrictions.join(', ')}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}
              </ScrollView>
              
              <View style={s.bookingModalFooter}>
                {step > 1 && (
                  <TouchableOpacity style={s.bookingBackBtn} onPress={() => setStep(step - 1)}>
                    <Text style={s.bookingBackText}>Back</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity 
                  style={s.bookingNextBtn} 
                  onPress={step === 5 ? handleConfirmBooking : handleNext}
                >
                  <LinearGradient colors={G.gold} style={s.bookingNextBtnGrad}>
                    <Text style={s.bookingNextText}>
                      {step === 5 ? 'Confirm Booking' : 'Continue'}
                    </Text>
                    <Ionicons name={step === 5 ? 'checkmark' : 'arrow-forward'} size={18} color={C.bg} />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
              
              {/* Dietary Modal */}
              <DietaryRestrictionsModal
                visible={showDietaryModal}
                onClose={() => setShowDietaryModal(false)}
                currentRestrictions={dietaryRestrictions}
                onSave={handleDietarySave}
                onSkip={handleDietarySkip}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

// ============================================
// END OF APP1.TSX
// Continue in app2.tsx with AppContent and Styles
// ============================================
// ============================================
// APP2.TSX - Part 2 of 2
// Contains: AppContent, Tab Renderers, Styles
// Merge this after app1.tsx
// ============================================

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
  const [exploreCategory, setExploreCategory] = useState('Lodging');
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideRef = useRef<FlatList>(null);
  const [vipPromoVisible, setVipPromoVisible] = useState(false);
  const [conciergeTab, setConciergeTab] = useState<'standard' | 'vip'>('standard');
  
  // v4.0 features state
  const [aiPopupVisible, setAiPopupVisible] = useState(false);
  const [filterDropdown, setFilterDropdown] = useState<string | null>(null);
  const [selectedPrices, setSelectedPrices] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [conciergeServiceDetail, setConciergeServiceDetail] = useState<any>(null);
  
  // Booking modal state
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [bookingItem, setBookingItem] = useState<any>(null);
  const [bookingItemType, setBookingItemType] = useState<string>('');
  const [isFixedEventBooking, setIsFixedEventBooking] = useState(false);
  
  // Permissions modal state
  const [permissionsModalVisible, setPermissionsModalVisible] = useState(false);
  
  // Rating modal state
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  
  // Account deletion state
  const [accountDeletionVisible, setAccountDeletionVisible] = useState(false);
  
  // Favorites state
  const [favorites, setFavorites] = useState<any[]>([]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [slidesRes, restaurantsRes, eventsRes, activitiesRes, lodgingRes, nightlifeRes, notificationsRes] = await Promise.all([
        api.get('/content/homepage_slideshow').catch(() => ({ data: { slides: DefaultSlides } })),
        api.get('/restaurants').catch(() => ({ data: [] })),
        api.get('/events').catch(() => ({ data: [] })),
        api.get('/activities').catch(() => ({ data: [] })),
        api.get('/lodging').catch(() => ({ data: [] })),
        api.get('/restaurants?category=nightlife').catch(() => ({ data: [] })),
        api.get('/notifications/unread-count').catch(() => ({ data: { count: 0 } })),
      ]);
      setSlides(slidesRes.data?.slides?.length > 0 ? slidesRes.data.slides : DefaultSlides);
      setRestaurants(restaurantsRes.data?.restaurants || restaurantsRes.data || []);
      setEvents(eventsRes.data?.events || eventsRes.data || []);
      setActivities(activitiesRes.data?.activities || activitiesRes.data || []);
      setLodging(lodgingRes.data?.lodging || lodgingRes.data || []);
      setNightlife(nightlifeRes.data?.restaurants || nightlifeRes.data || []);
      setNotificationCount(notificationsRes.data?.count || 0);
      if (user) { 
        const favRes = await api.get('/favorites').catch(() => ({ data: [] })); 
        setFavorites(favRes.data?.favorites || favRes.data || []); 
      }
    } catch (error) { 
      console.error('Load data error:', error); 
    } finally { 
      setLoading(false); 
      setRefreshing(false); 
    }
  };

  const onRefresh = () => { setRefreshing(true); loadData(); };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => { 
        const next = (prev + 1) % slides.length; 
        slideRef.current?.scrollToIndex({ index: next, animated: true }); 
        return next; 
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const getTierGradient = () => user?.investorTier ? TierBenefits[user.investorTier]?.gradient || G.gold : G.gold;

  const openDetail = (item: any, type: string) => { 
    setSelectedItem(item); 
    setSelectedItemType(type); 
    setCurrentScreen('detail'); 
  };

  const openBookingModal = (item: any, type: string, isFixed: boolean = false) => {
    if (!user) { 
      Alert.alert('Sign In Required', 'Please sign in to make a reservation.', [
        { text: 'Cancel', style: 'cancel' }, 
        { text: 'Sign In', onPress: () => setCurrentScreen('login') }
      ]); 
      return; 
    }
    setBookingItem(item); 
    setBookingItemType(type); 
    setIsFixedEventBooking(isFixed); 
    setBookingModalVisible(true);
  };

  // FIX #2: Hero slideshow deep linking with debug logging
  const handleSlidePress = (slide: any) => {
    console.log('=== SLIDE PRESSED ===');
    console.log('Title:', slide.title);
    console.log('linkType:', slide.linkType);
    console.log('linkTab:', slide.linkTab);
    console.log('linkTarget:', slide.linkTarget);
    
    if (!slide.linkType || slide.linkType === 'none') return;
    
    switch (slide.linkType) {
      case 'tab':
        setActiveTab(slide.linkTab);
        if (slide.linkTarget && slide.linkTab === 1) {
          setTimeout(() => setExploreCategory(slide.linkTarget), 100);
        }
        break;
      case 'screen':
        if (slide.linkTarget) setCurrentScreen(slide.linkTarget);
        break;
      case 'external':
        if (slide.linkTarget) Linking.openURL(slide.linkTarget);
        break;
    }
  };

  const handleConciergeServicePress = (service: any) => {
    setConciergeServiceDetail(service);
  };

  const handleBookOption = (option: any) => {
    openBookingModal(option, 'concierge', false);
  };

  // FIX #4: Proper API format for booking confirm
  const handleBookingConfirm = async (bookingData: any) => {
    try {
      const isFixed = bookingData.isFixedEvent || bookingData.itemType === 'event';
      const response = await api.post('/reservations', {
        itemType: bookingData.itemType,
        itemId: bookingData.item._id,
        itemName: bookingData.item.name,
        date: isFixed ? bookingData.item.date : bookingData.date,
        time: isFixed ? (bookingData.item.startTime || bookingData.item.time) : bookingData.time,
        guestCount: bookingData.guestCount || 1,
        bookingDetails: bookingData.bookingDetails,
        dietaryRestrictions: bookingData.dietaryRestrictions || [],
        paymentMethod: bookingData.paymentMethod || 'card',
        isFixedEvent: isFixed,
      });
      Alert.alert(
        'Booking Confirmed! 🎉', 
        `Your reservation at ${bookingData.item.name} has been submitted.\n\nConfirmation: ${response.data.confirmationNumber}`, 
        [{ text: 'OK' }]
      );
      EngagementTracker.trackAction('booking_complete');
    } catch (error: any) { 
      Alert.alert('Booking Error', error.response?.data?.error || error.message || 'Failed to create reservation.'); 
    }
  };

  const toggleFavorite = async (item: any, type: string) => {
    if (!user) { Alert.alert('Sign In Required', 'Please sign in to save favorites.'); return; }
    try {
      const response = await api.post('/favorites/toggle', { 
        itemType: type, 
        itemId: item._id, 
        itemName: item.name, 
        itemImage: item.images?.[0]?.url || item.image, 
        itemRating: item.rating 
      });
      if (response.data.isFavorited) {
        setFavorites(Array.isArray(favorites) ? [...favorites, response.data.favorite] : [response.data.favorite]);
      } else {
        setFavorites(Array.isArray(favorites) ? favorites.filter(f => f.itemId !== item._id) : []);
      }
    } catch (error) { 
      console.error('Toggle favorite error:', error); 
    }
  };

  const isFavorited = (itemId: string) => Array.isArray(favorites) && favorites.some(f => f.itemId === itemId);
  
  const handlePermissionsGranted = () => { setPermissionsModalVisible(false); };
  
  const handleRatingSubmit = async (rating: number, feedback: string) => { 
    try { 
      await api.post('/feedback', { rating, feedback, type: rating <= 3 ? 'improvement' : 'positive' }); 
    } catch (e) {} 
    setRatingModalVisible(false); 
  };
  
  const handleAccountDeletion = async (type: 'deactivate' | 'delete') => { 
    try { 
      await api.post(`/users/${type}-account`); 
      Alert.alert('Success', type === 'deactivate' ? 'Account deactivated.' : 'Account deleted.'); 
      logout(); 
    } catch (e) { 
      Alert.alert('Error', 'Failed. Contact support.'); 
    } 
    setAccountDeletionVisible(false); 
  };

  const getUpcomingEvents = () => {
    if (!Array.isArray(events)) return [];
    const now = new Date();
    return events
      .filter(e => new Date(e.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);
  };
  const getExploreData = () => {
    switch (exploreCategory) {
      case 'Eateries': return Array.isArray(restaurants) ? restaurants : [];
      case 'Lodging': return Array.isArray(lodging) ? lodging : [];
      case 'Experiences': return Array.isArray(activities) ? activities : [];
      case 'Nightlife': return Array.isArray(nightlife) ? nightlife : [];
      default: return Array.isArray(lodging) ? lodging : [];
    }
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
  if (currentScreen === 'detail' && selectedItem) return <DetailScreen item={selectedItem} type={selectedItemType as any} onBack={() => { setCurrentScreen('main'); setSelectedItem(null); }} onBook={(item: any, type: string, isFixed: boolean) => openBookingModal(item, type, isFixed)} />;

  // ============================================
  // HOME TAB
  // ============================================
  const renderHomeTab = () => (
    <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.gold} />}>
      {/* Hero Slideshow */}
      <View style={s.heroContainer}>
        <FlatList 
          ref={slideRef} 
          data={slides} 
          horizontal 
          pagingEnabled 
          showsHorizontalScrollIndicator={false} 
          keyExtractor={(item, index) => item.id?.toString() || `slide-${index}`}
          onMomentumScrollEnd={(e) => setCurrentSlide(Math.round(e.nativeEvent.contentOffset.x / width))}
          renderItem={({ item }) => (
            <TouchableOpacity style={s.heroSlide} activeOpacity={0.9} onPress={() => handleSlidePress(item)}>
              <Image source={{ uri: item.imageUrl }} style={s.heroImage} />
              <LinearGradient colors={['transparent', 'rgba(10,18,42,0.7)', C.bg]} style={s.heroOverlay} />
              <View style={s.heroContent}>
                <Text style={s.heroSubtitle}>{item.subtitle}</Text>
                <Text style={s.heroTitle}>{item.title}</Text>
                <Text style={s.heroDesc}>{item.description}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
        <View style={s.heroDots}>
          {slides.map((_, i) => <View key={i} style={[s.heroDot, currentSlide === i && s.heroDotActive]} />)}
        </View>
      </View>
      
      {/* AI Card */}
      <TouchableOpacity style={s.aiCard} onPress={() => setAiPopupVisible(true)}>
        <LinearGradient colors={G.gold} style={s.aiCardGradient}>
          <View style={s.aiCardIcon}><Ionicons name="sparkles" size={24} color={C.bg} /></View>
          <View style={s.aiCardContent}>
            <Text style={s.aiCardTitle}>MOTA AI Assistant</Text>
            <Text style={s.aiCardDesc}>Get personalized recommendations</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={C.bg} />
        </LinearGradient>
      </TouchableOpacity>
      
      {/* Upcoming Events */}
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>Upcoming Events</Text>
        <TouchableOpacity onPress={() => setActiveTab(2)}><Text style={s.sectionLink}>View All</Text></TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.horizontalScroll}>
        {getUpcomingEvents().map((event, index) => (
            <TouchableOpacity key={event._id || `event-${index}`} style={s.eventCard}  onPress={() => openDetail(event, 'event')}>
            <Image source={{ uri: event.images?.[0]?.url || PLACEHOLDER_IMAGE }} style={s.eventImage} />
            <LinearGradient colors={G.overlay} style={s.eventOverlay} />
            <View style={s.eventContent}>
              <View style={s.eventDateBadge}>
                <Text style={s.eventDateDay}>{new Date(event.date).getDate()}</Text>
                <Text style={s.eventDateMonth}>{new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}</Text>
              </View>
              <Text style={s.eventName}>{event.name}</Text>
              <Text style={s.eventLocation}>{event.location || 'MOTA Resort'}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {/* Featured Dining */}
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>Featured Dining</Text>
        <TouchableOpacity onPress={() => { setExploreCategory('Eateries'); setActiveTab(1); }}><Text style={s.sectionLink}>View All</Text></TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.horizontalScroll}>
        {restaurants.slice(0, 5).map((item, index) => <ItemCard key={item._id || `restaurant-${index}`} item={item}onPress={() => openDetail(item, 'restaurant')} />)}
      </ScrollView>
      
      {/* Adventures & Activities */}
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>Adventures & Activities</Text>
        <TouchableOpacity onPress={() => { setExploreCategory('Experiences'); setActiveTab(1); }}><Text style={s.sectionLink}>View All</Text></TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.horizontalScroll}>
        {activities.slice(0, 5).map((item, index) => <ItemCard key={item._id || `activity-${index}`} item={item} onPress={() => openDetail(item, 'activity')} />)}
      </ScrollView>
      
      {/* VIP Promo (non-investors only) */}
      {!isInvestor && (
        <TouchableOpacity style={s.vipPromoCard} onPress={() => setVipPromoVisible(true)}>
          <LinearGradient colors={G.gold} style={s.vipPromoGradient}>
            <Ionicons name="diamond" size={32} color={C.bg} />
            <View style={s.vipPromoContent}>
              <Text style={s.vipPromoTitle}>Become a VIP Investor</Text>
              <Text style={s.vipPromoSubtitle}>Unlock exclusive benefits</Text>
            </View>
            <Ionicons name="arrow-forward" size={24} color={C.bg} />
          </LinearGradient>
        </TouchableOpacity>
      )}
      
      <View style={{ height: 100 }} />
    </ScrollView>
  );

  // ============================================
  // EXPLORE TAB
  // ============================================
  const renderExploreTab = () => (
    <View style={{ flex: 1 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterRow} contentContainerStyle={{ paddingHorizontal: 20 }}>
        {['Lodging', 'Eateries', 'Experiences', 'Nightlife'].map((cat) => (
          <FilterChip key={cat} label={cat} active={exploreCategory === cat} onPress={() => setExploreCategory(cat)} />
        ))}
      </ScrollView>
      <FlatList 
        data={getExploreData()} 
        keyExtractor={(item) => item._id} 
        numColumns={2} 
        contentContainerStyle={{ padding: 10, paddingBottom: 100 }} 
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.gold} />}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={s.exploreCard} 
            onPress={() => openDetail(item, exploreCategory === 'Eateries' ? 'restaurant' : exploreCategory === 'Lodging' ? 'lodging' : 'activity')}
          >
            <Image source={{ uri: item.images?.[0]?.url || item.image || PLACEHOLDER_IMAGE }} style={s.exploreCardImage} />
            <LinearGradient colors={G.overlay} style={s.exploreCardOverlay} />
            <TouchableOpacity style={s.favoriteBtn} onPress={() => toggleFavorite(item, exploreCategory.toLowerCase())}>
              <Ionicons name={isFavorited(item._id) ? 'heart' : 'heart-outline'} size={20} color={isFavorited(item._id) ? C.error : '#fff'} />
            </TouchableOpacity>
            <View style={s.exploreCardContent}>
              <Text style={s.exploreCardName} numberOfLines={1}>{item.name}</Text>
              {(item.cuisine || item.category || item.type) && <Text style={s.exploreCardSub} numberOfLines={1}>{item.cuisine || item.category || item.type}</Text>}
              {item.rating && (
                <View style={s.exploreCardRating}>
                  <Ionicons name="star" size={12} color={C.gold} />
                  <Text style={s.exploreCardRatingText}>{item.rating}</Text>
                </View>
              )}
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
  // EVENTS TAB - FIX #3: All events as fixed schedule
  // ============================================
  const renderEventsTab = () => (
    <FlatList 
      data={events} 
      keyExtractor={(item, index) => item._id || item.id || `event-list-${index}`}
      contentContainerStyle={{ padding: 20, paddingBottom: 100 }} 
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.gold} />}
      renderItem={({ item }) => (
        <TouchableOpacity style={s.eventListCard} onPress={() => openDetail(item, 'event')}>
          <Image source={{ uri: item.images?.[0]?.url || PLACEHOLDER_IMAGE }} style={s.eventListImage} />
          <LinearGradient colors={G.overlay} style={s.eventListOverlay} />
          <View style={s.eventListContent}>
            <View style={s.eventListDateBadge}>
              <Text style={s.eventListDateDay}>{new Date(item.date).getDate()}</Text>
              <Text style={s.eventListDateMonth}>{new Date(item.date).toLocaleDateString('en-US', { month: 'short' })}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.eventListName}>{item.name}</Text>
              <Text style={s.eventListTime}>{item.startTime || item.time} • {item.location || 'MOTA Resort'}</Text>
              {/* FIX #3: Fixed schedule badge for ALL events */}
              <View style={s.fixedBadge}>
                <Ionicons name="lock-closed" size={12} color={C.textMuted} />
                <Text style={s.fixedBadgeText}>Fixed Schedule</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={s.eventListBookBtn} 
              onPress={() => openBookingModal(item, 'event', true)}  // FIX #3: Always true for events
            >
              <Text style={s.eventListBookText}>Book</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}
      ListEmptyComponent={
        <View style={s.emptyContainer}>
          <Ionicons name="calendar-outline" size={48} color={C.textMuted} />
          <Text style={s.emptyTitle}>No Upcoming Events</Text>
          <Text style={s.emptySubtitle}>Check back soon</Text>
        </View>
      }
    />
  );

  // ============================================
  // CONCIERGE TAB
  // ============================================
  const renderConciergeTab = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
      {/* Tab Switcher */}
      <View style={s.conciergeTabRow}>
        <TouchableOpacity 
          style={[s.conciergeTabBtn, conciergeTab === 'standard' && s.conciergeTabBtnActive]} 
          onPress={() => setConciergeTab('standard')}
        >
          <Ionicons name="person" size={18} color={conciergeTab === 'standard' ? C.bg : C.textSec} />
          <Text style={[s.conciergeTabText, conciergeTab === 'standard' && s.conciergeTabTextActive]}>Concierge</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[s.conciergeTabBtn, conciergeTab === 'vip' && s.conciergeTabBtnActive, !isInvestor && s.conciergeTabBtnDisabled]} 
          onPress={() => isInvestor ? setConciergeTab('vip') : setVipPromoVisible(true)}
        >
          <Ionicons name="diamond" size={18} color={conciergeTab === 'vip' ? C.bg : isInvestor ? C.gold : C.textMuted} />
          <Text style={[s.conciergeTabText, conciergeTab === 'vip' && s.conciergeTabTextActive, !isInvestor && { color: C.textMuted }]}>VIP Concierge</Text>
          {!isInvestor && <Ionicons name="lock-closed" size={14} color={C.textMuted} style={{ marginLeft: 4 }} />}
        </TouchableOpacity>
      </View>
      
      {/* Header */}
      <View style={s.conciergeHeader}>
        <LinearGradient colors={conciergeTab === 'vip' && isInvestor ? getTierGradient() : G.gold} style={s.conciergeHeaderGrad}>
          <Ionicons name={conciergeTab === 'vip' ? 'diamond' : 'person'} size={28} color={C.bg} />
          <View style={{ marginLeft: 14, flex: 1 }}>
            <Text style={s.conciergeHeaderTitle}>{conciergeTab === 'vip' ? 'VIP Concierge' : 'Concierge Services'}</Text>
            <Text style={s.conciergeHeaderSub}>{conciergeTab === 'vip' ? 'Exclusive Investor Services' : '24/7 Personalized Assistance'}</Text>
          </View>
        </LinearGradient>
      </View>

      {conciergeTab === 'standard' ? (
        <>
          <Text style={s.conciergeSectionTitle}>Available Services</Text>
          <View style={s.conciergeServicesGrid}>
            {ConciergeServices.standard.map((service, i) => (
              <TouchableOpacity key={i} style={s.conciergeServiceCard} activeOpacity={0.9} onPress={() => handleConciergeServicePress(service)}>
                <Image source={{ uri: service.image }} style={s.conciergeServiceImage} />
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={s.conciergeServiceOverlay}>
                  <View style={[s.conciergeServiceIconWrap, { backgroundColor: service.color + '40' }]}>
                    <Ionicons name={service.icon as any} size={20} color={service.color} />
                  </View>
                  <Text style={s.conciergeServiceTitle}>{service.title}</Text>
                  <Text style={s.conciergeServiceDesc}>{service.desc}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </>
      ) : (
        <>
          {isInvestor && user?.investorTier && (
            <View style={s.vipTierBanner}>
              <LinearGradient colors={getTierGradient()} style={s.vipTierBannerGrad}>
                <Ionicons name="shield-checkmark" size={24} color={C.bg} />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={s.vipTierBannerTitle}>{user.investorTier.charAt(0).toUpperCase() + user.investorTier.slice(1)} Member</Text>
                  <Text style={s.vipTierBannerSub}>Priority access to all VIP services</Text>
                </View>
              </LinearGradient>
            </View>
          )}

          <Text style={s.conciergeSectionTitle}>Exclusive VIP Services</Text>
          <View style={s.vipServicesContainer}>
            {ConciergeServices.vip.map((service, i) => {
              const tierOrder = { gold: 1, platinum: 2, diamond: 3 };
              const userTierLevel = tierOrder[user?.investorTier as keyof typeof tierOrder] || 0;
              const serviceTierLevel = tierOrder[service.tier as keyof typeof tierOrder] || 0;
              const isLocked = userTierLevel < serviceTierLevel;

              return (
                <TouchableOpacity 
                  key={i} 
                  style={[s.vipServiceCard, isLocked && s.vipServiceCardLocked]} 
                  activeOpacity={isLocked ? 1 : 0.9}
                  onPress={() => !isLocked && handleConciergeServicePress(service)}
                >
                  <LinearGradient colors={isLocked ? [C.card, C.card] : [C.card, C.cardLight]} style={s.vipServiceGradient}>

                    <View style={s.vipServiceHeader}>
                      <View style={[s.vipServiceIcon, isLocked && { opacity: 0.5 }]}>
                        <Ionicons name={service.icon as any} size={28} color={isLocked ? C.textMuted : C.gold} />
                      </View>
                      {isLocked && (
                        <View style={s.vipServiceLock}>
                          <Ionicons name="lock-closed" size={12} color={C.textMuted} />
                          <Text style={[s.vipServiceLockText, { color: service.tier === 'diamond' ? '#B9F2FF' : service.tier === 'platinum' ? '#E5E4E2' : '#D4AF37' }]}>
                            {service.tier.toUpperCase()}+
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={s.vipServiceTitle}>{service.title}</Text>
                    <Text style={s.vipServiceDesc}>{service.desc}</Text>
                    <View style={s.vipServiceFooter}>
                      <Text style={s.vipServiceCta}>{isLocked ? 'Upgrade to Access' : 'View Options'}</Text>
                      <Ionicons name="arrow-forward" size={16} color={C.gold} />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={s.vipContactSection}>
            <Text style={s.vipContactTitle}>Need Something Custom?</Text>
            <Text style={s.vipContactDesc}>Your dedicated concierge team is available 24/7</Text>
            <TouchableOpacity style={s.vipContactBtn}>
              <LinearGradient colors={G.gold} style={s.vipContactBtnGrad}>
                <Ionicons name="chatbubbles" size={20} color={C.bg} />
                <Text style={s.vipContactBtnText}>Contact VIP Concierge</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );

  // ============================================
  // PROFILE TAB - NOTIFICATION REMOVED FROM MENU
  // (Notification is already in header)
  // ============================================
  const renderProfileTab = () => {
    if (!user) {
      return (
        <View style={s.profileGuest}>
          <LinearGradient colors={G.gold} style={s.profileGuestIcon}>
            <Ionicons name="person" size={48} color={C.bg} />
          </LinearGradient>
          <Text style={s.profileGuestTitle}>Welcome to MOTA</Text>
          <Text style={s.profileGuestSub}>Sign in to access your account, bookings, and exclusive member benefits.</Text>
          <GoldBtn title="Sign In" lg onPress={() => setCurrentScreen('login')} style={{ marginTop: 20, width: '100%' }} />
          <TouchableOpacity style={{ marginTop: 16 }} onPress={() => setCurrentScreen('signup')}>
            <Text style={s.profileGuestLink}>Don't have an account? <Text style={{ color: C.gold }}>Sign Up</Text></Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    const tierInfo = TierBenefits[user.investorTier as string];
    const isMember = user.accessLevel === 'member';
    const canDeleteAccount = isMember && !isInvestor;
    
    return (
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Profile Header */}
        <View style={s.profileHeader}>
          <ProfilePicture 
            user={user} 
            canUpload={user.accessLevel !== 'guest'}
            onUpload={async (imageUri) => {
              try { await api.post('/upload/base64/profile', { image: imageUri }); }
              catch (error) { Alert.alert('Upload Failed', 'Could not upload profile picture.'); }
            }}
          />
          <Text style={s.profileName}>{user.name}</Text>
          <Text style={s.profileEmail}>{user.email}</Text>
          {user.investorTier && (
            <View style={[s.tierBadge, { backgroundColor: tierInfo?.color + '30' }]}>
              <Ionicons name="diamond" size={14} color={tierInfo?.color || C.gold} />
              <Text style={[s.tierBadgeText, { color: tierInfo?.color || C.gold }]}>{tierInfo?.name} Investor</Text>
            </View>
          )}
        </View>
        
        {/* INVESTOR COMPONENTS - KEPT EXACTLY AS ORIGINAL */}
        {isInvestor && user.investorTier && <MOTACard tier={user.investorTier} user={user} />}
        {isInvestor && user.investorTier && <View style={{ paddingHorizontal: 20 }}><TierBenefitsCard tier={user.investorTier} /></View>}
        {isInvestor && user.investorTier && <PortfolioOverview user={user} />}
        
        {/* Favorites Section */}
        {favorites.length > 0 && (
          <FavoritesSection 
            favorites={favorites} 
            onViewAll={() => setCurrentScreen('favorites')}
            onItemPress={(item, type) => openDetail(item, type)}
          />
        )}
        
        {/* Profile Menu - NOTIFICATION REMOVED (it's in header) */}
        <View style={s.profileMenu}>
          {[
            { icon: 'person-outline', label: 'Edit Profile', screen: 'editProfile' }, 
            { icon: 'bookmark-outline', label: 'My Reservations', screen: 'reservations' }, 
            { icon: 'heart-outline', label: 'Favorites', screen: 'favorites' }, 
            { icon: 'settings-outline', label: 'Settings', screen: 'settings' }, 
            { icon: 'help-circle-outline', label: 'Help & Support', screen: 'help' }
          ].map((item, i) => (
            <TouchableOpacity key={i} style={s.profileMenuItem} onPress={() => setCurrentScreen(item.screen)}>
              <View style={s.profileMenuIcon}><Ionicons name={item.icon as any} size={22} color={C.gold} /></View>
              <Text style={s.profileMenuText}>{item.label}</Text>
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
          {canDeleteAccount && (
            <TouchableOpacity style={s.profileMenuItem} onPress={() => setAccountDeletionVisible(true)}>
              <View style={[s.profileMenuIcon, { backgroundColor: 'rgba(248,113,113,0.1)' }]}><Ionicons name="trash-outline" size={22} color={C.error} /></View>
              <Text style={[s.profileMenuText, { color: C.error }]}>Delete Account</Text>
              <Ionicons name="chevron-forward" size={20} color={C.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity style={s.logoutBtn} onPress={() => Alert.alert('Logout', 'Are you sure?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Logout', style: 'destructive', onPress: logout }])}>
          <Ionicons name="log-out-outline" size={20} color={C.error} /><Text style={s.logoutBtnText}>Logout</Text>
        </TouchableOpacity>
        <Text style={s.versionText}>MOTA v4.0.0</Text>
      </ScrollView>
    );
  };

  // Main render
  const tabs = [
    { icon: 'home', label: 'Home' }, 
    { icon: 'compass', label: 'Explore' }, 
    { icon: 'calendar', label: 'Events' }, 
    { icon: 'diamond', label: 'Concierge' }, 
    { icon: 'person', label: 'Profile' }
  ];
  
  if (loading) {
    return (
      <LinearGradient colors={G.dark} style={s.loadingContainer}>
        <ActivityIndicator size="large" color={C.gold} />
        <Text style={s.loadingText}>Loading MOTA...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={G.dark} style={s.container}>
      <StatusBar barStyle="light-content" />
      <View style={[s.header, { paddingTop: insets.top + 10 }]}>
        <View>
          <Text style={s.headerLogo}>MOTA</Text>
          <Text style={s.headerSub}>Macau of the Americas</Text>
        </View>
        <View style={s.headerRight}>
          <TouchableOpacity style={s.headerBtn} onPress={() => setCurrentScreen('notifications')}>
            <Ionicons name="notifications-outline" size={22} color={C.text} />
            {notificationCount > 0 && (
              <View style={s.headerBadge}>
                <Text style={s.headerBadgeText}>{notificationCount > 9 ? '9+' : notificationCount}</Text>
              </View>
            )}
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
            <View style={[s.navItemIcon, activeTab === i && s.navItemIconActive]}>
              <Ionicons name={(activeTab === i ? tab.icon : tab.icon + '-outline') as any} size={22} color={activeTab === i ? C.gold : C.textMuted} />
            </View>
            <Text style={[s.navLabel, activeTab === i && s.navLabelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </LinearGradient>
      
      {/* Modals */}
      <VIPPromoModal visible={vipPromoVisible} onClose={() => setVipPromoVisible(false)} />
      <AIAssistantPopup visible={aiPopupVisible} onClose={() => setAiPopupVisible(false)} />
      <ConciergeServiceDetailModal 
        visible={!!conciergeServiceDetail} 
        service={conciergeServiceDetail} 
        onClose={() => setConciergeServiceDetail(null)}
        onBook={handleBookOption}
      />
      
      <BookingModal
        visible={bookingModalVisible}
        item={bookingItem}
        itemType={bookingItemType}
        isFixedEvent={isFixedEventBooking}
        onClose={() => {
          setBookingModalVisible(false);
          setBookingItem(null);
        }}
        onConfirm={handleBookingConfirm}
        user={user}
      />
      
      <PermissionsModal
        visible={permissionsModalVisible}
        onGranted={handlePermissionsGranted}
        onClose={() => {}}
      />
      
      <RatingModal
        visible={ratingModalVisible}
        onClose={() => setRatingModalVisible(false)}
        onSubmit={handleRatingSubmit}
      />
      
      <AccountDeletionModal
        visible={accountDeletionVisible}
        onClose={() => setAccountDeletionVisible(false)}
        onDeactivate={() => handleAccountDeletion('deactivate')}
        onDelete={() => handleAccountDeletion('delete')}
      />
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
  heroContent: { position: 'absolute', bottom: 40, left: 20, right: 20 },
  heroSubtitle: { fontSize: 11, color: C.gold, letterSpacing: 2, fontWeight: '600', marginBottom: 4 },
  heroTitle: { fontSize: 28, fontWeight: '800', color: C.text, marginBottom: 8 },
  heroDesc: { fontSize: 13, color: C.textSec, lineHeight: 18 },
  heroDots: { flexDirection: 'row', justifyContent: 'center', position: 'absolute', bottom: 12, width: '100%' },
  heroDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.textMuted, marginHorizontal: 3 },
  heroDotActive: { width: 20, backgroundColor: C.gold },
  aiCard: { marginHorizontal: 20, marginTop: -20, borderRadius: 16, overflow: 'hidden', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  aiCardGradient: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  aiCardIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(0,0,0,0.2)', alignItems: 'center', justifyContent: 'center' },
  aiCardContent: { flex: 1, marginLeft: 12 },
  aiCardTitle: { fontSize: 16, fontWeight: '700', color: C.bg },
  aiCardDesc: { fontSize: 12, color: 'rgba(0,0,0,0.6)' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 24, marginBottom: 12 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: C.text },
  sectionLink: { fontSize: 13, color: C.gold, fontWeight: '600' },
  horizontalScroll: { paddingLeft: 20 },
  eventCard: { width: 200, height: 240, marginRight: 12, borderRadius: 16, overflow: 'hidden' },
  eventImage: { width: '100%', height: '100%', position: 'absolute' },
  eventOverlay: { ...StyleSheet.absoluteFillObject },
  eventContent: { position: 'absolute', bottom: 16, left: 16, right: 16 },
  eventDateBadge: { position: 'absolute', top: -180, right: 0, backgroundColor: C.gold, borderRadius: 8, padding: 8, alignItems: 'center' },
  eventDateDay: { fontSize: 20, fontWeight: '800', color: C.bg },
  eventDateMonth: { fontSize: 10, fontWeight: '600', color: C.bg, textTransform: 'uppercase' },
  eventName: { fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 4 },
  eventLocation: { fontSize: 12, color: C.textSec },
  itemCard: { width: 160, height: 200, marginRight: 12, borderRadius: 16, overflow: 'hidden' },
  itemCardImage: { width: '100%', height: '100%', position: 'absolute' },
  itemCardOverlay: { ...StyleSheet.absoluteFillObject },
  itemCardContent: { position: 'absolute', bottom: 12, left: 12, right: 12 },
  itemCardName: { fontSize: 14, fontWeight: '700', color: C.text },
  itemCardSub: { fontSize: 11, color: C.textSec, marginTop: 2 },
  itemCardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  itemCardPrice: { fontSize: 12, color: C.gold, fontWeight: '600' },
  itemCardRating: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  itemCardRatingText: { fontSize: 12, color: C.text, fontWeight: '600' },
  vipPromoCard: { marginHorizontal: 20, marginTop: 24, borderRadius: 16, overflow: 'hidden' },
  vipPromoGradient: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  vipPromoContent: { flex: 1, marginLeft: 16 },
  vipPromoTitle: { fontSize: 18, fontWeight: '700', color: C.bg },
  vipPromoSubtitle: { fontSize: 13, color: 'rgba(0,0,0,0.6)' },
  filterRow: { paddingVertical: 12 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: C.card, marginRight: 8, flexDirection: 'row', alignItems: 'center' },
  filterChipActive: { backgroundColor: C.gold },
  filterChipText: { fontSize: 13, color: C.textSec, fontWeight: '600' },
  filterChipTextActive: { color: C.bg },
  exploreCard: { flex: 1, margin: 6, height: 180, borderRadius: 12, overflow: 'hidden', backgroundColor: C.card },
  exploreCardImage: { width: '100%', height: '100%', position: 'absolute' },
  exploreCardOverlay: { ...StyleSheet.absoluteFillObject },
  exploreCardContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 12 },
  exploreCardName: { fontSize: 14, fontWeight: '700', color: C.text },
  exploreCardSub: { fontSize: 11, color: C.textSec },
  exploreCardRating: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  exploreCardRatingText: { fontSize: 11, color: C.text },
  favoriteBtn: { position: 'absolute', top: 10, right: 10, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  eventListCard: { backgroundColor: C.card, borderRadius: 16, marginBottom: 16, overflow: 'hidden', flexDirection: 'row' },
  eventListImage: { width: 100, height: 120 },
  eventListOverlay: { position: 'absolute', width: 100, height: 120 },
  eventListContent: { flex: 1, padding: 14, flexDirection: 'row', alignItems: 'center' },
  eventListDateBadge: { backgroundColor: C.gold, borderRadius: 8, padding: 8, alignItems: 'center', marginRight: 12 },
  eventListDateDay: { fontSize: 20, fontWeight: '800', color: C.bg },
  eventListDateMonth: { fontSize: 10, fontWeight: '600', color: C.bg, textTransform: 'uppercase' },
  eventListName: { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 4 },
  eventListTime: { fontSize: 12, color: C.textSec },
  eventListBookBtn: { backgroundColor: C.gold, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  eventListBookText: { fontSize: 13, fontWeight: '700', color: C.bg },
  fixedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  fixedBadgeText: { fontSize: 10, color: C.textMuted },
  emptyContainer: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: C.text, marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: C.textSec, marginTop: 4 },
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
  conciergeServicesGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12 },
  conciergeServiceCard: { width: '50%', padding: 6, height: 160 },
  conciergeServiceImage: { width: '100%', height: '100%', borderRadius: 12, position: 'absolute' },
  conciergeServiceOverlay: { flex: 1, borderRadius: 12, padding: 12, justifyContent: 'flex-end' },
  conciergeServiceIconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  conciergeServiceTitle: { fontSize: 14, fontWeight: '700', color: C.text },
  conciergeServiceDesc: { fontSize: 11, color: C.textSec },
  vipTierBanner: { marginHorizontal: 16, marginTop: 16 },
  vipTierBannerGrad: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12 },
  vipTierBannerTitle: { fontSize: 16, fontWeight: '700', color: C.bg },
  vipTierBannerSub: { fontSize: 12, color: 'rgba(0,0,0,0.6)' },
  vipServicesContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12 },
  vipServiceCard: { width: '50%', padding: 6 },
  vipServiceCardLocked: { opacity: 0.7 },
  vipServiceGradient: { borderRadius: 16, padding: 16, height: 180 },
  vipServiceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  vipServiceIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: C.cardLight, alignItems: 'center', justifyContent: 'center' },
  vipServiceLock: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  vipServiceLockText: { fontSize: 10, fontWeight: '700' },
  vipServiceTitle: { fontSize: 14, fontWeight: '700', color: C.text, marginTop: 12 },
  vipServiceDesc: { fontSize: 11, color: C.textSec, marginTop: 4, flex: 1 },
  vipServiceFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  vipServiceCta: { fontSize: 12, color: C.gold, fontWeight: '600' },
  vipContactSection: { padding: 20, alignItems: 'center' },
  vipContactTitle: { fontSize: 18, fontWeight: '700', color: C.text },
  vipContactDesc: { fontSize: 13, color: C.textSec, marginTop: 4, marginBottom: 16 },
  vipContactBtn: { borderRadius: 12, overflow: 'hidden' },
  vipContactBtnGrad: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 24, gap: 8 },
  vipContactBtnText: { fontSize: 15, fontWeight: '700', color: C.bg },
  profileGuest: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  profileGuestIcon: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  profileGuestTitle: { fontSize: 24, fontWeight: '700', color: C.text, marginBottom: 8 },
  profileGuestSub: { fontSize: 14, color: C.textSec, textAlign: 'center', lineHeight: 22 },
  profileGuestLink: { fontSize: 14, color: C.textSec },
  profileHeader: { alignItems: 'center', paddingVertical: 30 },
  profileName: { fontSize: 22, fontWeight: '700', color: C.text, marginBottom: 4 },
  profileEmail: { fontSize: 14, color: C.textSec },
  tierBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 12, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, gap: 6 },
  tierBadgeText: { fontSize: 13, fontWeight: '600' },
  profileMenu: { marginTop: 20, marginHorizontal: 20, backgroundColor: C.card, borderRadius: 16 },
  profileMenuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: C.cardLight },
  profileMenuIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: C.cardLight, alignItems: 'center', justifyContent: 'center' },
  profileMenuText: { flex: 1, fontSize: 15, color: C.text, marginLeft: 14, fontWeight: '500' },
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
  tierBenefitsCard: { backgroundColor: C.card, borderRadius: 16, overflow: 'hidden', marginBottom: 20 },
  tierBenefitsHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  tierBenefitsTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: C.bg },
  tierBenefitsInvestment: { fontSize: 14, fontWeight: '700', color: C.bg },
  tierBenefitsList: { padding: 16 },
  tierBenefitItem: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  tierBenefitText: { fontSize: 14, color: C.textSec, flex: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', maxWidth: 400, backgroundColor: C.card, borderRadius: 20, maxHeight: '90%' },
  modalBody: { padding: 20 },
  modalFooter: { flexDirection: 'row', padding: 20, gap: 12, borderTopWidth: 1, borderTopColor: C.cardLight },
  modalCancelBtn: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: C.cardLight, alignItems: 'center' },
  modalCancelText: { fontSize: 15, fontWeight: '600', color: C.textSec },
  modalSubmitBtn: { flex: 1, padding: 14, borderRadius: 10, alignItems: 'center' },
  modalSubmitText: { fontSize: 15, fontWeight: '700', color: C.bg },
  vipPromoHeader: { alignItems: 'center', padding: 30 },
  vipPromoText: { fontSize: 14, color: C.textSec, lineHeight: 22, marginBottom: 20 },
  vipBenefitsTitle: { fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 12 },
  vipBenefitItem: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  vipBenefitText: { fontSize: 14, color: C.textSec },
  vipTiersPreview: { marginTop: 20, padding: 16, backgroundColor: C.cardLight, borderRadius: 12 },
  vipTiersTitle: { fontSize: 14, fontWeight: '700', color: C.text, marginBottom: 12 },
  vipTierRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  vipTierBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  vipTierName: { fontSize: 13, fontWeight: '700', color: C.bg },
  vipTierAmount: { fontSize: 14, fontWeight: '600', color: C.text },
  aiPopupOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'flex-end' },
  aiPopupContent: { backgroundColor: C.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '80%' },
  aiPopupHeader: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: C.cardLight },
  aiPopupIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  aiPopupTitle: { fontSize: 18, fontWeight: '700', color: C.text },
  aiPopupSubtitle: { fontSize: 13, color: C.textSec },
  aiUseCases: { padding: 20 },
  aiUseCaseCard: { width: 140, height: 100, borderRadius: 12, overflow: 'hidden', marginRight: 12 },
  aiUseCaseImage: { width: '100%', height: '100%', position: 'absolute' },
  aiUseCaseOverlay: { ...StyleSheet.absoluteFillObject },
  aiUseCaseContent: { position: 'absolute', bottom: 8, left: 8, right: 8 },
  aiUseCaseTitle: { fontSize: 13, fontWeight: '700', color: C.text },
  aiUseCaseDesc: { fontSize: 10, color: C.textSec },
  aiInputContainer: { flexDirection: 'row', alignItems: 'flex-end', padding: 20, paddingTop: 0, gap: 12 },
  aiInput: { flex: 1, backgroundColor: C.cardLight, borderRadius: 16, padding: 16, fontSize: 15, color: C.text, maxHeight: 120 },
  aiSendBtn: { borderRadius: 24, overflow: 'hidden' },
  aiSendBtnGrad: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  conciergeDetailModal: { backgroundColor: C.card, borderRadius: 20, maxHeight: '70%', width: '100%', maxWidth: 400 },
  conciergeDetailHeader: { flexDirection: 'row', alignItems: 'flex-start', padding: 20 },
  conciergeDetailIcon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  conciergeDetailTitle: { fontSize: 18, fontWeight: '700', color: C.text },
  conciergeDetailDesc: { fontSize: 13, color: C.textSec, marginTop: 4 },
  conciergeDetailDivider: { height: 1, backgroundColor: C.cardLight, marginHorizontal: 20 },
  conciergeOptionTitle: { fontSize: 14, fontWeight: '600', color: C.textMuted, paddingHorizontal: 20, paddingVertical: 12 },
  conciergeOptions: { paddingHorizontal: 20, paddingBottom: 20 },
  conciergeOptionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.cardLight, borderRadius: 12, padding: 12, marginBottom: 12 },
  conciergeOptionImage: { width: 60, height: 60, borderRadius: 8 },
  conciergeOptionInfo: { flex: 1, marginLeft: 12 },
  conciergeOptionName: { fontSize: 14, fontWeight: '700', color: C.text },
  conciergeOptionType: { fontSize: 11, color: C.textSec },
  conciergeOptionPrice: { fontSize: 14, fontWeight: '700', color: C.gold, marginTop: 4 },
  bookingModalContent: { backgroundColor: C.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%', width: '100%' },
  bookingModalHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: C.cardLight },
  bookingModalTitle: { fontSize: 20, fontWeight: '700', color: C.text },
  bookingModalSubtitle: { fontSize: 13, color: C.textSec, marginTop: 4 },
  bookingModalClose: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.cardLight, alignItems: 'center', justifyContent: 'center' },
  bookingProgress: { flexDirection: 'row', justifyContent: 'center', paddingVertical: 16, gap: 8 },
  bookingProgressDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.cardLight },
  bookingProgressDotActive: { backgroundColor: C.gold, width: 24 },
  bookingModalBody: { padding: 20, maxHeight: 400 },
  bookingModalFooter: { flexDirection: 'row', padding: 20, gap: 12, borderTopWidth: 1, borderTopColor: C.cardLight },
  bookingBackBtn: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: C.cardLight, alignItems: 'center' },
  bookingBackText: { fontSize: 16, fontWeight: '600', color: C.textSec },
  bookingNextBtn: { flex: 2 },
  bookingNextBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12, gap: 8 },
  bookingNextText: { fontSize: 16, fontWeight: '700', color: C.bg },
  bookingFormSection: { gap: 16 },
  bookingFormLabel: { fontSize: 14, fontWeight: '600', color: C.text, marginBottom: 6 },
  bookingFormInput: { backgroundColor: C.card, borderRadius: 12, padding: 14, fontSize: 15, color: C.text },
  bookingConfirmation: { alignItems: 'center' },
  confirmationIcon: { marginBottom: 16 },
  confirmationTitle: { fontSize: 20, fontWeight: '700', color: C.text, marginBottom: 20 },
  confirmationCard: { backgroundColor: C.card, borderRadius: 16, padding: 20, width: '100%' },
  confirmationRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.cardLight },
  confirmationLabel: { fontSize: 14, color: C.textSec },
  confirmationValue: { fontSize: 14, fontWeight: '600', color: C.text },
  paymentSection: { gap: 12 },
  paymentSectionTitle: { fontSize: 18, fontWeight: '700', color: C.text, marginBottom: 8 },
  paymentOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 16, padding: 16, borderWidth: 2, borderColor: 'transparent' },
  paymentOptionSelected: { borderColor: C.gold, backgroundColor: 'rgba(212,175,55,0.1)' },
  paymentOptionIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: C.cardLight, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  paymentOptionTitle: { fontSize: 16, fontWeight: '600', color: C.text },
  paymentOptionDesc: { fontSize: 13, color: C.textMuted },
  paymentRadio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: C.textMuted, alignItems: 'center', justifyContent: 'center' },
  paymentRadioSelected: { borderColor: C.gold },
  paymentRadioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: C.gold },
});
