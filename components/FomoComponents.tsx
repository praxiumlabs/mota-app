/**
 * FOMO Components for MOTA App
 * Creates urgency and exclusivity
 * ERROR FREE VERSION - No gap properties
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// ============================================
// EXCLUSIVE BADGE
// ============================================

export function ExclusiveBadge() {
  return (
    <View style={styles.exclusiveBadge}>
      <Ionicons name="star" size={10} color="#D4AF37" />
      <Text style={styles.exclusiveText}>EXCLUSIVE</Text>
    </View>
  );
}

// ============================================
// COUNTDOWN TIMER
// ============================================

interface CountdownTimerProps {
  endDate: Date;
  label?: string;
}

export function CountdownTimer({ endDate, label = 'Offer ends in' }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = React.useState('');

  React.useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(endDate).getTime();
      const distance = end - now;

      if (distance < 0) {
        setTimeLeft('Expired');
        clearInterval(timer);
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h`);
      } else {
        setTimeLeft(`${hours}h ${minutes}m`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  return (
    <View style={styles.countdownContainer}>
      <Ionicons name="time-outline" size={14} color="#FF6B6B" />
      <Text style={styles.countdownLabel}>{label}: </Text>
      <Text style={styles.countdownTime}>{timeLeft}</Text>
    </View>
  );
}

// ============================================
// SPOTS LEFT
// ============================================

interface SpotsLeftProps {
  current: number;
  total: number;
}

export function SpotsLeft({ current, total }: SpotsLeftProps) {
  const spotsLeft = total - current;
  const percentage = (current / total) * 100;
  const isLow = spotsLeft <= total * 0.2;

  return (
    <View style={styles.spotsContainer}>
      <View style={styles.spotsBar}>
        <View style={[styles.spotsFill, { width: `${Math.min(percentage, 100)}%` }]} />
      </View>
      <Text style={[styles.spotsText, isLow && styles.spotsTextUrgent]}>
        {spotsLeft <= 0 ? 'Sold Out!' : `${spotsLeft} spots left`}
      </Text>
    </View>
  );
}

// ============================================
// MEMBER DISCOUNT
// ============================================

interface MemberDiscountProps {
  percent: number;
}

export function MemberDiscount({ percent }: MemberDiscountProps) {
  return (
    <View style={styles.memberDiscount}>
      <Ionicons name="pricetag" size={12} color="#4CAF50" />
      <Text style={styles.memberDiscountText}>{percent}% Member Discount</Text>
    </View>
  );
}

// ============================================
// VIP ONLY OVERLAY
// ============================================

interface VIPOnlyOverlayProps {
  tierRequired?: string;
}

export function VIPOnlyOverlay({ tierRequired }: VIPOnlyOverlayProps) {
  return (
    <View style={styles.vipOverlay}>
      <Ionicons name="lock-closed" size={16} color="#D4AF37" />
      <Text style={styles.vipOverlayText}>
        {tierRequired ? `${tierRequired}+ Only` : 'VIP Only'}
      </Text>
    </View>
  );
}

// ============================================
// PRICE DISPLAY
// ============================================

interface PriceDisplayProps {
  originalPrice?: number;
  discountedPrice?: number;
  regularPrice?: number;
  memberPrice?: number;
}

export function PriceDisplay({ 
  originalPrice, 
  discountedPrice,
  regularPrice,
  memberPrice 
}: PriceDisplayProps) {
  const original = originalPrice ?? regularPrice ?? 0;
  const discounted = discountedPrice ?? memberPrice ?? original;
  const hasDiscount = discounted < original;
  
  return (
    <View style={styles.priceContainer}>
      {hasDiscount ? (
        <Text style={styles.originalPrice}>${original}</Text>
      ) : null}
      <Text style={[styles.currentPrice, hasDiscount && styles.discountedPrice]}>
        ${discounted}
      </Text>
    </View>
  );
}

// ============================================
// GUEST FOMO BANNER
// ============================================

interface GuestFomoBannerProps {
  onSignUp: () => void;
}

export function GuestFomoBanner({ onSignUp }: GuestFomoBannerProps) {
  return (
    <TouchableOpacity style={styles.fomoBanner} onPress={onSignUp}>
      <LinearGradient
        colors={['rgba(212, 175, 55, 0.15)', 'rgba(212, 175, 55, 0.05)']}
        style={styles.fomoBannerGradient}
      >
        <View style={styles.fomoBannerContent}>
          <Ionicons name="gift" size={24} color="#D4AF37" />
          <View style={styles.fomoBannerText}>
            <Text style={styles.fomoBannerTitle}>Unlock Member Pricing</Text>
            <Text style={styles.fomoBannerSubtitle}>Sign up free and save 10% on everything</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#D4AF37" />
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ============================================
// MEMBER FOMO BANNER
// ============================================

interface MemberFomoBannerProps {
  onLearnMore: () => void;
}

export function MemberFomoBanner({ onLearnMore }: MemberFomoBannerProps) {
  return (
    <TouchableOpacity style={styles.fomoBanner} onPress={onLearnMore}>
      <LinearGradient
        colors={['rgba(212, 175, 55, 0.2)', 'rgba(212, 175, 55, 0.05)']}
        style={styles.fomoBannerGradient}
      >
        <View style={styles.fomoBannerContent}>
          <Ionicons name="diamond" size={24} color="#D4AF37" />
          <View style={styles.fomoBannerText}>
            <Text style={styles.fomoBannerTitle}>Become an Investor</Text>
            <Text style={styles.fomoBannerSubtitle}>Up to 50% off + exclusive VIP perks</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#D4AF37" />
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ============================================
// LOCKED FEATURE CARD
// ============================================

interface LockedFeatureCardProps {
  title: string;
  description: string;
  requiredTier?: string;
  onUnlock: () => void;
}

export function LockedFeatureCard({ title, description, requiredTier, onUnlock }: LockedFeatureCardProps) {
  return (
    <TouchableOpacity style={styles.lockedCard} onPress={onUnlock}>
      <View style={styles.lockedIconContainer}>
        <Ionicons name="lock-closed" size={28} color="#D4AF37" />
      </View>
      <Text style={styles.lockedTitle}>{title}</Text>
      <Text style={styles.lockedDescription}>{description}</Text>
      <View style={styles.lockedBadge}>
        <Text style={styles.lockedBadgeText}>
          {requiredTier ? `${requiredTier}+ Required` : 'Upgrade to Unlock'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ============================================
// ACTION BUTTON
// ============================================

interface ActionButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export function ActionButton({ title, onPress, variant = 'primary', disabled }: ActionButtonProps) {
  if (variant === 'secondary') {
    return (
      <TouchableOpacity 
        style={[styles.secondaryButton, disabled && styles.buttonDisabled]} 
        onPress={onPress}
        disabled={disabled}
      >
        <Text style={styles.secondaryButtonText}>{title}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      style={[styles.primaryButton, disabled && styles.buttonDisabled]} 
      onPress={onPress}
      disabled={disabled}
    >
      <LinearGradient
        colors={disabled ? ['#666', '#444'] : ['#D4AF37', '#B8960C']}
        style={styles.primaryButtonGradient}
      >
        <Text style={styles.primaryButtonText}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ============================================
// TIER BADGE
// ============================================

interface TierBadgeProps {
  tier: string;
  size?: 'small' | 'medium' | 'large';
}

const tierColors: Record<string, { bg: string[]; text: string }> = {
  gold: { bg: ['#D4AF37', '#B8960C'], text: '#000' },
  platinum: { bg: ['#E5E4E2', '#C9C9C9'], text: '#000' },
  diamond: { bg: ['#B9F2FF', '#E0FFFF'], text: '#000' },
  black: { bg: ['#000000', '#333333'], text: '#D4AF37' },
  founders: { bg: ['#D4AF37', '#000000'], text: '#fff' },
};

export function TierBadge({ tier, size = 'small' }: TierBadgeProps) {
  const colors = tierColors[tier] || tierColors.gold;
  const fontSize = size === 'large' ? 14 : size === 'medium' ? 12 : 10;
  const padding = size === 'large' ? 12 : size === 'medium' ? 10 : 8;

  return (
    <LinearGradient
      colors={colors.bg as [string, string]}
      style={[styles.tierBadge, { paddingHorizontal: padding, paddingVertical: padding / 2 }]}
    >
      <Text style={[styles.tierBadgeText, { fontSize, color: colors.text }]}>
        {tier.toUpperCase()}
      </Text>
    </LinearGradient>
  );
}

// ============================================
// TIER CARD
// ============================================

interface TierCardProps {
  user: {
    investorTier?: string;
    investmentAmount?: number;
    portfolioValue?: number;
  };
  discountPercent: number;
}

export function TierCard({ user, discountPercent }: TierCardProps) {
  return (
    <View style={styles.tierCard}>
      <View style={styles.tierCardHeader}>
        <TierBadge tier={user.investorTier || 'gold'} size="medium" />
        <Text style={styles.tierDiscount}>{discountPercent}% off all bookings</Text>
      </View>
      <View style={styles.tierCardStats}>
        <View style={styles.tierStat}>
          <Text style={styles.tierStatValue}>
            ${(user.investmentAmount || 0).toLocaleString()}
          </Text>
          <Text style={styles.tierStatLabel}>Invested</Text>
        </View>
        <View style={styles.tierStat}>
          <Text style={styles.tierStatValue}>
            ${(user.portfolioValue || 0).toLocaleString()}
          </Text>
          <Text style={styles.tierStatLabel}>Portfolio</Text>
        </View>
      </View>
    </View>
  );
}

// ============================================
// TIER PROGRESS CARD
// ============================================

interface TierProgressCardProps {
  user: {
    investorTier?: string;
    investmentAmount?: number;
  };
  nextTierInfo?: {
    name: string;
    threshold: number;
    benefits: string[];
  } | null;
}

export function TierProgressCard({ user, nextTierInfo }: TierProgressCardProps) {
  if (!nextTierInfo) return null;

  const progress = ((user.investmentAmount || 0) / nextTierInfo.threshold) * 100;
  const remaining = nextTierInfo.threshold - (user.investmentAmount || 0);

  return (
    <View style={styles.progressCard}>
      <Text style={styles.progressTitle}>Next Tier: {nextTierInfo.name}</Text>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` }]} />
      </View>
      <Text style={styles.progressText}>
        ${remaining.toLocaleString()} more to unlock
      </Text>
      <View style={styles.benefitsList}>
        {nextTierInfo.benefits.map((benefit, index) => (
          <View key={index} style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={14} color="#D4AF37" />
            <Text style={styles.benefitText}>{benefit}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  // Exclusive Badge
  exclusiveBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  exclusiveText: {
    color: '#D4AF37',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginLeft: 4,
  },

  // Countdown
  countdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  countdownLabel: {
    color: '#888',
    fontSize: 12,
    marginLeft: 5,
  },
  countdownTime: {
    color: '#FF6B6B',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Spots
  spotsContainer: {
    marginTop: 8,
  },
  spotsBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  spotsFill: {
    height: '100%',
    backgroundColor: '#FF6B6B',
    borderRadius: 2,
  },
  spotsText: {
    color: '#888',
    fontSize: 11,
    marginTop: 4,
  },
  spotsTextUrgent: {
    color: '#FF6B6B',
    fontWeight: '600',
  },

  // Member Discount
  memberDiscount: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  memberDiscountText: {
    color: '#4CAF50',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },

  // VIP Overlay
  vipOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  vipOverlayText: {
    color: '#D4AF37',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 5,
  },

  // Price
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  originalPrice: {
    color: '#888',
    fontSize: 13,
    textDecorationLine: 'line-through',
    marginRight: 6,
  },
  currentPrice: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  discountedPrice: {
    color: '#4CAF50',
  },

  // FOMO Banner
  fomoBanner: {
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  fomoBannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  fomoBannerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fomoBannerText: {
    marginLeft: 12,
    flex: 1,
  },
  fomoBannerTitle: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '600',
  },
  fomoBannerSubtitle: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },

  // Locked Card
  lockedCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  lockedIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  lockedTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  lockedDescription: {
    color: '#888',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 15,
  },
  lockedBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  lockedBadgeText: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '600',
  },

  // Buttons
  primaryButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  primaryButtonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#000',
    fontSize: 15,
    fontWeight: 'bold',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#D4AF37',
    fontSize: 15,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },

  // Tier Badge
  tierBadge: {
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  tierBadgeText: {
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  // Tier Card
  tierCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
  },
  tierCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  tierDiscount: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  tierCardStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  tierStat: {
    alignItems: 'center',
  },
  tierStatValue: {
    color: '#D4AF37',
    fontSize: 24,
    fontWeight: 'bold',
  },
  tierStatLabel: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },

  // Progress Card
  progressCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 15,
    padding: 20,
  },
  progressTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#D4AF37',
    borderRadius: 4,
  },
  progressText: {
    color: '#888',
    fontSize: 12,
    marginTop: 8,
  },
  benefitsList: {
    marginTop: 15,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitText: {
    color: '#ccc',
    fontSize: 13,
    marginLeft: 8,
  },
});

export default {
  ExclusiveBadge,
  CountdownTimer,
  SpotsLeft,
  MemberDiscount,
  VIPOnlyOverlay,
  PriceDisplay,
  GuestFomoBanner,
  MemberFomoBanner,
  LockedFeatureCard,
  ActionButton,
  TierBadge,
  TierCard,
  TierProgressCard,
};
