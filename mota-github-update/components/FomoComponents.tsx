/**
 * MOTA FOMO Components
 * Banners, locked features, and tier progression displays
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  useAuth,
  TierConfig,
  TierBenefit,
  NextTierInfo,
  User,
} from '../context/AuthContext';

// Colors
const Colors = {
  deepNavy: '#0A122A',
  cardDark: '#0D1729',
  cardElevated: '#162038',
  gold: '#D4AF37',
  goldDark: '#B8960C',
  goldSubtle: 'rgba(212, 175, 55, 0.12)',
  goldMuted: 'rgba(212, 175, 55, 0.3)',
  white: '#FFFFFF',
  softGrey: '#A0A8B8',
  mutedGrey: '#6B7280',
  success: '#10B981',
  blue: '#60A5FA',
};

// ============================================
// GUEST FOMO BANNER
// Shows to guests to encourage sign up
// ============================================

interface GuestFomoBannerProps {
  onSignUp: () => void;
}

export function GuestFomoBanner({ onSignUp }: GuestFomoBannerProps) {
  return (
    <Pressable style={styles.guestBanner} onPress={onSignUp}>
      <View style={styles.bannerContent}>
        <MaterialCommunityIcons name="star-four-points" size={20} color={Colors.gold} />
        <View style={styles.bannerTextContainer}>
          <Text style={styles.bannerTitle}>Sign up FREE to unlock bookings</Text>
          <Text style={styles.bannerSubtitle}>Save favorites, RSVP events & more</Text>
        </View>
      </View>
      <View style={styles.bannerButton}>
        <Text style={styles.bannerButtonText}>Join Free</Text>
      </View>
    </Pressable>
  );
}

// ============================================
// MEMBER FOMO BANNER
// Shows to members to encourage investor upgrade
// ============================================

interface MemberFomoBannerProps {
  onPress?: () => void;
}

export function MemberFomoBanner({ onPress }: MemberFomoBannerProps) {
  return (
    <Pressable style={styles.memberBanner} onPress={onPress}>
      <LinearGradient
        colors={[Colors.goldSubtle, 'rgba(22, 32, 56, 0.8)']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      />
      <View style={styles.bannerContent}>
        <MaterialCommunityIcons name="diamond-stone" size={20} color={Colors.gold} />
        <View style={styles.bannerTextContainer}>
          <Text style={styles.bannerTitle}>Investors get VIP concierge & perks</Text>
          <Text style={styles.bannerSubtitle}>Explore investment opportunities</Text>
        </View>
      </View>
      <Feather name="chevron-right" size={20} color={Colors.gold} />
    </Pressable>
  );
}

// ============================================
// LOCKED FEATURE CARD
// Shows locked features with required access level
// ============================================

interface LockedFeatureCardProps {
  icon: string;
  title: string;
  requiredLevel: 'member' | 'investor';
  onPress?: () => void;
}

export function LockedFeatureCard({ icon, title, requiredLevel, onPress }: LockedFeatureCardProps) {
  return (
    <Pressable style={styles.lockedCard} onPress={onPress}>
      <View style={styles.lockedIconWrapper}>
        <Feather name={icon as any} size={24} color={Colors.mutedGrey} />
        <View style={styles.lockBadge}>
          <Feather name="lock" size={10} color={Colors.gold} />
        </View>
      </View>
      <Text style={styles.lockedTitle}>{title}</Text>
      <Text style={styles.lockedHint}>
        {requiredLevel === 'member' ? 'Members only' : 'Investors only'}
      </Text>
    </Pressable>
  );
}

// ============================================
// ACTION BUTTON WITH LOCK
// For booking/RSVP buttons that require auth
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
      <Pressable style={styles.lockedButton} onPress={onPress}>
        <Feather name="lock" size={14} color={Colors.mutedGrey} />
        <Text style={styles.lockedButtonText}>{label}</Text>
      </Pressable>
    );
  }

  if (variant === 'primary') {
    return (
      <Pressable style={styles.actionButton} onPress={onPress}>
        <LinearGradient
          colors={[Colors.gold, Colors.goldDark]}
          style={styles.actionButtonGradient}
        >
          <Text style={styles.actionButtonText}>{label}</Text>
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable style={styles.actionButtonSecondary} onPress={onPress}>
      <Text style={styles.actionButtonSecondaryText}>{label}</Text>
    </Pressable>
  );
}

// ============================================
// TIER CARD DISPLAY
// Visual representation of investor tier card
// ============================================

interface TierCardProps {
  user: User;
}

export function TierCard({ user }: TierCardProps) {
  if (!user.investorTier) return null;

  const tierConfig = TierConfig[user.investorTier];
  const cardNumber = `•••• •••• •••• ${Math.floor(1000 + Math.random() * 9000)}`;

  return (
    <View style={styles.tierCard}>
      <LinearGradient
        colors={tierConfig.bgGradient}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={styles.tierCardHeader}>
        <Feather
          name={tierConfig.icon as any}
          size={28}
          color={tierConfig.textColor || Colors.deepNavy}
        />
        <Text style={[styles.tierCardName, { color: tierConfig.textColor || Colors.deepNavy }]}>
          {tierConfig.name}
        </Text>
      </View>
      <Text style={[styles.tierCardNumber, { color: tierConfig.textColor || 'rgba(0,0,0,0.6)' }]}>
        {cardNumber}
      </Text>
      <View style={styles.tierCardFooter}>
        <View>
          <Text style={[styles.tierCardLabel, { color: tierConfig.textColor || 'rgba(0,0,0,0.5)' }]}>
            Member Since
          </Text>
          <Text style={[styles.tierCardValue, { color: tierConfig.textColor || 'rgba(0,0,0,0.8)' }]}>
            {user.memberSince}
          </Text>
        </View>
        <Text style={[styles.tierCardLogo, { color: tierConfig.textColor || 'rgba(0,0,0,0.3)' }]}>
          MOTA
        </Text>
      </View>
    </View>
  );
}

// ============================================
// TIER BADGE (Small)
// For headers and profile displays
// ============================================

interface TierBadgeProps {
  tier: string;
  size?: 'small' | 'medium';
}

export function TierBadge({ tier, size = 'small' }: TierBadgeProps) {
  const tierConfig = TierConfig[tier];
  if (!tierConfig) return null;

  const isSmall = size === 'small';

  return (
    <View style={[styles.tierBadge, isSmall && styles.tierBadgeSmall]}>
      <LinearGradient
        colors={tierConfig.bgGradient}
        style={styles.tierBadgeGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Feather
          name={tierConfig.icon as any}
          size={isSmall ? 12 : 14}
          color={tierConfig.textColor || Colors.deepNavy}
        />
        <Text
          style={[
            styles.tierBadgeText,
            isSmall && styles.tierBadgeTextSmall,
            { color: tierConfig.textColor || Colors.deepNavy },
          ]}
        >
          {isSmall ? tierConfig.name.split(' ')[0] : tierConfig.name}
        </Text>
      </LinearGradient>
    </View>
  );
}

// ============================================
// TIER PROGRESS CARD
// Shows progression to next tier
// ============================================

interface TierProgressCardProps {
  user: User;
  nextTierInfo: NextTierInfo | null;
}

export function TierProgressCard({ user, nextTierInfo }: TierProgressCardProps) {
  if (!user.investorTier) return null;

  const tierConfig = TierConfig[user.investorTier];

  // User at max visible tier (Diamond) or hidden tiers (Black/Founders)
  if (!nextTierInfo) {
    return (
      <View style={styles.progressCard}>
        <View style={styles.tierAchieved}>
          <MaterialCommunityIcons name="crown" size={32} color={Colors.gold} />
          <Text style={styles.tierAchievedTitle}>Top Tier Achieved!</Text>
          <Text style={styles.tierAchievedText}>
            You have ultimate access to all MOTA benefits
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.progressCard}>
      {/* Header */}
      <View style={styles.progressHeader}>
        <View style={styles.currentTierBadge}>
          <Feather name={tierConfig.icon as any} size={18} color={tierConfig.color} />
          <Text style={[styles.currentTierText, { color: tierConfig.color }]}>
            {tierConfig.name} Holder
          </Text>
        </View>
        <Text style={styles.investedAmount}>
          ${user.investmentAmount?.toLocaleString()} invested
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBg}>
          <LinearGradient
            colors={[Colors.gold, Colors.goldDark]}
            style={[styles.progressBarFill, { width: `${nextTierInfo.progress}%` }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </View>
        <Text style={styles.progressPercent}>{Math.round(nextTierInfo.progress)}%</Text>
      </View>

      {/* Amount to next */}
      <Text style={styles.progressText}>
        <Text style={styles.progressTextBold}>
          ${nextTierInfo.amountToNext.toLocaleString()}
        </Text>
        {' '}more to reach {nextTierInfo.nextTierName}
      </Text>

      {/* Benefits Preview */}
      <View style={styles.unlockPreview}>
        <View style={styles.unlockLabel}>
          <MaterialCommunityIcons name="star-four-points" size={14} color={Colors.gold} />
          <Text style={styles.unlockLabelText}>
            Unlock with {nextTierInfo.nextTierName}:
          </Text>
        </View>

        {nextTierInfo.benefits.map((benefit, idx) => (
          <View key={idx} style={styles.unlockBenefitRow}>
            <View style={styles.unlockBenefitIcon}>
              <Feather name={benefit.icon as any} size={18} color={Colors.gold} />
            </View>
            <View style={styles.unlockBenefitText}>
              <Text style={styles.unlockBenefitTitle}>{benefit.title}</Text>
              <Text style={styles.unlockBenefitDesc}>{benefit.description}</Text>
            </View>
            <Feather name="lock" size={14} color={Colors.mutedGrey} />
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
  // Guest Banner
  guestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.goldSubtle,
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bannerTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  bannerTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.white,
  },
  bannerSubtitle: {
    fontSize: 11,
    color: Colors.softGrey,
    marginTop: 2,
  },
  bannerButton: {
    backgroundColor: Colors.gold,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  bannerButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.deepNavy,
  },

  // Member Banner
  memberBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.goldMuted,
    overflow: 'hidden',
  },

  // Locked Card
  lockedCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.cardElevated,
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(107, 114, 128, 0.3)',
  },
  lockedIconWrapper: {
    position: 'relative',
    marginBottom: 10,
  },
  lockBadge: {
    position: 'absolute',
    bottom: -4,
    right: -8,
    backgroundColor: Colors.cardDark,
    borderRadius: 8,
    padding: 2,
  },
  lockedTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 4,
  },
  lockedHint: {
    fontSize: 11,
    color: Colors.mutedGrey,
  },

  // Action Buttons
  lockedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.mutedGrey,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  lockedButtonText: {
    fontSize: 12,
    color: Colors.mutedGrey,
    marginLeft: 4,
  },
  actionButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.deepNavy,
  },
  actionButtonSecondary: {
    backgroundColor: Colors.cardElevated,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  actionButtonSecondaryText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.gold,
  },

  // Tier Card
  tierCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    overflow: 'hidden',
  },
  tierCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  tierCardName: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
    marginLeft: 10,
  },
  tierCardNumber: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 3,
    marginBottom: 20,
  },
  tierCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  tierCardLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  tierCardValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  tierCardLogo: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
  },

  // Tier Badge
  tierBadge: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  tierBadgeSmall: {
    borderRadius: 6,
  },
  tierBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tierBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
  tierBadgeTextSmall: {
    fontSize: 11,
  },

  // Progress Card
  progressCard: {
    backgroundColor: Colors.cardElevated,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  currentTierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentTierText: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
  investedAmount: {
    fontSize: 13,
    color: Colors.softGrey,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressBarBg: {
    flex: 1,
    height: 10,
    backgroundColor: Colors.cardDark,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.gold,
    marginLeft: 12,
    minWidth: 40,
  },
  progressText: {
    fontSize: 13,
    color: Colors.softGrey,
    marginBottom: 20,
  },
  progressTextBold: {
    fontWeight: '700',
    color: Colors.white,
  },
  unlockPreview: {
    backgroundColor: Colors.cardDark,
    borderRadius: 12,
    padding: 14,
  },
  unlockLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  unlockLabelText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.gold,
    marginLeft: 6,
  },
  unlockBenefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardElevated,
  },
  unlockBenefitIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.goldSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlockBenefitText: {
    flex: 1,
    marginLeft: 12,
  },
  unlockBenefitTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.white,
  },
  unlockBenefitDesc: {
    fontSize: 11,
    color: Colors.softGrey,
    marginTop: 2,
  },
  tierAchieved: {
    alignItems: 'center',
    padding: 20,
  },
  tierAchievedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.gold,
    marginTop: 12,
    marginBottom: 8,
  },
  tierAchievedText: {
    fontSize: 13,
    color: Colors.softGrey,
    textAlign: 'center',
  },
});

export default {
  GuestFomoBanner,
  MemberFomoBanner,
  LockedFeatureCard,
  ActionButton,
  TierCard,
  TierBadge,
  TierProgressCard,
};
