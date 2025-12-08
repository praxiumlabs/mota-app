/**
 * FOMO Components for MOTA App
 * Creates urgency and exclusivity
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
import { useAuth } from '../context/AuthContext';

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
        <View style={[styles.spotsFill, { width: `${percentage}%` }]} />
      </View>
      <Text style={[styles.spotsText, isLow && styles.spotsTextUrgent]}>
        {spotsLeft <= 0 ? 'SOLD OUT' : `Only ${spotsLeft} spots left!`}
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
    <View style={styles.discountBadge}>
      <Text style={styles.discountText}>{percent}% OFF</Text>
    </View>
  );
}

// ============================================
// VIP ONLY OVERLAY
// ============================================

interface VIPOnlyOverlayProps {
  tierRequired?: string | null;
}

export function VIPOnlyOverlay({ tierRequired }: VIPOnlyOverlayProps) {
  return (
    <View style={styles.vipOverlay}>
      <Ionicons name="lock-closed" size={16} color="#D4AF37" />
      <Text style={styles.vipText}>
        {tierRequired ? `${tierRequired.toUpperCase()}+ ONLY` : 'VIP ONLY'}
      </Text>
    </View>
  );
}

// ============================================
// PRICE DISPLAY - Updated with flexible props
// ============================================

interface PriceDisplayProps {
  originalPrice?: number;
  discountedPrice?: number;
  regularPrice?: number;
  memberPrice?: number;
  showDiscount?: boolean;
}

export function PriceDisplay({ 
  originalPrice, 
  discountedPrice, 
  regularPrice, 
  memberPrice, 
  showDiscount = true 
}: PriceDisplayProps) {
  // Support both prop naming conventions
  const basePrice = originalPrice ?? regularPrice ?? 0;
  const finalPrice = discountedPrice ?? memberPrice ?? basePrice;
  const hasDiscount = basePrice > finalPrice;

  if (!showDiscount || !hasDiscount) {
    return <Text style={styles.priceText}>${finalPrice}</Text>;
  }

  const discountPercent = Math.round(((basePrice - finalPrice) / basePrice) * 100);

  return (
    <View style={styles.priceContainer}>
      <Text style={styles.originalPrice}>${basePrice}</Text>
      <Text style={styles.discountedPrice}>${finalPrice}</Text>
      <View style={styles.saveBadge}>
        <Text style={styles.saveText}>{discountPercent}% OFF</Text>
      </View>
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
    <TouchableOpacity onPress={onSignUp}>
      <LinearGradient 
        colors={['rgba(212, 175, 55, 0.2)', 'rgba(212, 175, 55, 0.1)']}
        style={styles.guestBanner}
      >
        <View style={styles.bannerContent}>
          <Ionicons name="gift-outline" size={24} color="#D4AF37" />
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>Unlock Exclusive Benefits</Text>
            <Text style={styles.bannerSubtitle}>Sign up now and get 10% off your first booking</Text>
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
  onPress: () => void;
}

export function MemberFomoBanner({ onPress }: MemberFomoBannerProps) {
  return (
    <TouchableOpacity onPress={onPress}>
      <LinearGradient 
        colors={['rgba(212, 175, 55, 0.3)', 'rgba(184, 134, 11, 0.2)']}
        style={styles.memberBanner}
      >
        <Ionicons name="trending-up" size={24} color="#D4AF37" />
        <View style={styles.bannerText}>
          <Text style={styles.bannerTitle}>Become an Investor</Text>
          <Text style={styles.bannerSubtitle}>Unlock up to 50% discounts & exclusive perks</Text>
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
  icon: string;
  title: string;
  requiredLevel: string;
  onPress: () => void;
}

export function LockedFeatureCard({ icon, title, requiredLevel, onPress }: LockedFeatureCardProps) {
  return (
    <TouchableOpacity style={styles.lockedCard} onPress={onPress}>
      <View style={styles.lockedIconContainer}>
        <Ionicons name={icon as any} size={24} color="#666" />
        <View style={styles.lockBadge}>
          <Ionicons name="lock-closed" size={10} color="#D4AF37" />
        </View>
      </View>
      <Text style={styles.lockedTitle}>{title}</Text>
      <Text style={styles.lockedRequirement}>{requiredLevel} required</Text>
    </TouchableOpacity>
  );
}

// ============================================
// ACTION BUTTON
// ============================================

interface ActionButtonProps {
  label: string;
  isLocked: boolean;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

export function ActionButton({ label, isLocked, onPress, variant = 'primary' }: ActionButtonProps) {
  if (isLocked) {
    return (
      <TouchableOpacity style={styles.lockedButton} onPress={onPress}>
        <Ionicons name="lock-closed" size={16} color="#D4AF37" />
        <Text style={styles.lockedButtonText}>Unlock to {label}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress}>
      <LinearGradient 
        colors={variant === 'primary' ? ['#D4AF37', '#B8860B'] : ['#333', '#222']}
        style={styles.actionButton}
      >
        <Text style={[styles.actionButtonText, variant === 'secondary' && { color: '#D4AF37' }]}>
          {label}
        </Text>
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

export function TierBadge({ tier, size = 'small' }: TierBadgeProps) {
  const getColors = (): [string, string] => {
    switch (tier) {
      case 'founders': return ['#FFD700', '#FFA500'];
      case 'black': return ['#000000', '#333333'];
      case 'diamond': return ['#B9F2FF', '#E0FFFF'];
      case 'platinum': return ['#E5E4E2', '#C9C9C9'];
      case 'gold': return ['#D4AF37', '#B8860B'];
      default: return ['#666', '#444'];
    }
  };

  const sizeStyles = {
    small: { paddingVertical: 4, paddingHorizontal: 10, fontSize: 10 },
    medium: { paddingVertical: 6, paddingHorizontal: 14, fontSize: 12 },
    large: { paddingVertical: 8, paddingHorizontal: 18, fontSize: 14 },
  };

  const textColor = ['diamond', 'platinum'].includes(tier) ? '#0a0a0a' : '#fff';

  return (
    <LinearGradient colors={getColors()} style={[styles.tierBadge, sizeStyles[size]]}>
      <Text style={[styles.tierBadgeText, { fontSize: sizeStyles[size].fontSize, color: textColor }]}>
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
    portfolioValue?: number;
    investmentAmount?: number;
  };
}

export function TierCard({ user }: TierCardProps) {
  const { getDiscountPercent } = useAuth();
  const discount = getDiscountPercent();

  return (
    <View style={styles.tierCard}>
      <View style={styles.tierCardHeader}>
        <TierBadge tier={user.investorTier || 'member'} size="medium" />
        <Text style={styles.tierDiscount}>{discount}% discount</Text>
      </View>
      {user.portfolioValue && (
        <View style={styles.tierCardStats}>
          <View style={styles.tierStat}>
            <Text style={styles.tierStatValue}>${(user.portfolioValue / 1000).toFixed(0)}K</Text>
            <Text style={styles.tierStatLabel}>Portfolio</Text>
          </View>
          <View style={styles.tierStat}>
            <Text style={styles.tierStatValue}>${(user.investmentAmount || 0 / 1000).toFixed(0)}K</Text>
            <Text style={styles.tierStatLabel}>Invested</Text>
          </View>
        </View>
      )}
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
  };
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
    gap: 4,
  },
  exclusiveText: {
    color: '#D4AF37',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
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
    marginLeft: 4,
  },
  countdownTime: {
    color: '#FF6B6B',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Spots Left
  spotsContainer: {
    marginTop: 10,
  },
  spotsBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  spotsFill: {
    height: '100%',
    backgroundColor: '#D4AF37',
  },
  spotsText: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  spotsTextUrgent: {
    color: '#FF6B6B',
    fontWeight: 'bold',
  },

  // Discount Badge
  discountBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  discountText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
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
    borderRadius: 4,
    gap: 5,
  },
  vipText: {
    color: '#D4AF37',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  // Price Display
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceText: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: 'bold',
  },
  originalPrice: {
    color: '#888',
    fontSize: 14,
    textDecorationLine: 'line-through',
  },
  discountedPrice: {
    color: '#D4AF37',
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  saveText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },

  // Banners
  guestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  memberBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 20,
    marginVertical: 10,
    gap: 12,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bannerSubtitle: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },

  // Locked Card
  lockedCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    width: 140,
  },
  lockedIconContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  lockBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#1a1a2e',
    borderRadius: 10,
    padding: 3,
  },
  lockedTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  lockedRequirement: {
    color: '#D4AF37',
    fontSize: 11,
    marginTop: 4,
  },

  // Buttons
  lockedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#D4AF37',
    gap: 8,
  },
  lockedButtonText: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButton: {
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#0a0a0a',
    fontSize: 16,
    fontWeight: '600',
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
    gap: 8,
  },
  benefitText: {
    color: '#ccc',
    fontSize: 13,
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
