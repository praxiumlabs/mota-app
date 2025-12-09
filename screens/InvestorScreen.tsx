/**
 * MOTA Investor Screen
 * Marketing view for non-investors, Dashboard for investors
 * ERROR FREE VERSION
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useAuth,
  TierConfig,
  TierThresholds,
  InvestorTier,
  InvestorBenefits,
} from '../context/AuthContext';

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
// INVESTOR DASHBOARD VIEW (For Investors)
// ============================================

function InvestorDashboardView() {
  const insets = useSafeAreaInsets();
  const { user, getDiscountPercent, getNextTierInfo } = useAuth();

  const discountPercent = getDiscountPercent();
  const tierConfig = user?.investorTier ? TierConfig[user.investorTier] : null;
  
  // Safely get next tier info
  let nextTierInfo = null;
  try {
    nextTierInfo = getNextTierInfo();
  } catch (e) {
    // Ignore errors
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: 100 }}
    >
      {/* Welcome Header */}
      <View style={styles.dashboardHeader}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.userName}>{user?.name || 'Investor'}</Text>
      </View>

      {/* Portfolio Card */}
      <View style={styles.portfolioCard}>
        <View style={styles.portfolioGoldBar} />
        <Text style={styles.portfolioLabel}>PORTFOLIO VALUE</Text>
        <Text style={styles.portfolioValue}>
          ${(user?.portfolioValue || 0).toLocaleString()}
        </Text>
        <View style={styles.portfolioChange}>
          <Feather name="trending-up" size={16} color={Colors.success} />
          <Text style={styles.portfolioChangeText}>
            +${((user?.portfolioValue || 0) - (user?.investmentAmount || 0)).toLocaleString()} all time
          </Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Feather name="credit-card" size={20} color={Colors.gold} />
          <Text style={styles.statCardValue}>
            {tierConfig?.name || 'Gold'}
          </Text>
          <Text style={styles.statCardLabel}>Current Tier</Text>
        </View>
        <View style={[styles.statCard, { marginHorizontal: 8 }]}>
          <Feather name="percent" size={20} color={Colors.gold} />
          <Text style={styles.statCardValue}>{discountPercent}%</Text>
          <Text style={styles.statCardLabel}>Discount</Text>
        </View>
        <View style={styles.statCard}>
          <Feather name="calendar" size={20} color={Colors.gold} />
          <Text style={styles.statCardValue}>
            {user?.memberSince ? new Date(user.memberSince).getFullYear() : '2024'}
          </Text>
          <Text style={styles.statCardLabel}>Member Since</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionButton}>
            <Feather name="file-text" size={24} color={Colors.gold} />
            <Text style={styles.actionButtonLabel}>Documents</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { marginHorizontal: 8 }]}>
            <Feather name="phone" size={24} color={Colors.gold} />
            <Text style={styles.actionButtonLabel}>Concierge</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Feather name="gift" size={24} color={Colors.gold} />
            <Text style={styles.actionButtonLabel}>Benefits</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Current Tier Benefits */}
      {tierConfig && tierConfig.benefits ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Benefits</Text>
          <View style={styles.benefitsList}>
            {tierConfig.benefits.map((benefit: string, index: number) => (
              <View key={index} style={styles.benefitRow}>
                <Feather name="check-circle" size={18} color={Colors.gold} />
                <Text style={styles.benefitRowText}>{benefit}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {/* Next Tier Progress */}
      {nextTierInfo ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Next Tier Progress</Text>
          <View style={styles.progressCard}>
            <Text style={styles.progressTitle}>
              Next: {nextTierInfo.nextTierName}
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${Math.min(nextTierInfo.progress, 100)}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              ${nextTierInfo.amountToNext.toLocaleString()} more to unlock
            </Text>
            {nextTierInfo.benefits && nextTierInfo.benefits.length > 0 ? (
              <View style={styles.benefitsListSmall}>
                {nextTierInfo.benefits.slice(0, 3).map((benefit: any, index: number) => (
                  <View key={index} style={styles.benefitItemSmall}>
                    <Feather name="check-circle" size={14} color={Colors.gold} />
                    <Text style={styles.benefitTextSmall}>
                      {typeof benefit === 'string' ? benefit : (benefit?.title || '')}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}

// ============================================
// INVESTOR MARKETING VIEW (Non-Investor)
// ============================================

function InvestorMarketingView() {
  const insets = useSafeAreaInsets();

  const handleRequestDeck = () => {
    Linking.openURL('https://macauoftheamericas.com');
  };

  // Visible tiers (Gold is entry level - no Silver)
  const visibleTiers = [
    InvestorTier.GOLD,
    InvestorTier.PLATINUM,
    InvestorTier.DIAMOND,
  ];

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: 100 }}
    >
      {/* Hero Section */}
      <View style={styles.marketingHero}>
        <LinearGradient
          colors={[Colors.goldSubtle, 'transparent']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
        <MaterialCommunityIcons name="diamond-stone" size={48} color={Colors.gold} />
        <Text style={styles.marketingTitle}>Invest in Paradise</Text>
        <Text style={styles.marketingSubtitle}>
          Join the $2.5B Macau of the Americas project on Ambergris Caye, Belize
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.marketingStats}>
        <View style={styles.marketingStat}>
          <Text style={styles.statValue}>$2.5B</Text>
          <Text style={styles.statLabel}>Project Value</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.marketingStat}>
          <Text style={styles.statValue}>15-20%</Text>
          <Text style={styles.statLabel}>Target Returns</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.marketingStat}>
          <Text style={styles.statValue}>2026</Text>
          <Text style={styles.statLabel}>Opening Year</Text>
        </View>
      </View>

      {/* Investor Benefits Preview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Investor Benefits Preview</Text>
        <View style={styles.benefitsGrid}>
          {InvestorBenefits.map((benefit, idx) => (
            <View key={idx} style={styles.benefitCard}>
              <View style={styles.benefitIconBox}>
                <Feather name={benefit.icon as any} size={24} color={Colors.gold} />
              </View>
              <Text style={styles.benefitCardTitle}>{benefit.title}</Text>
              <Text style={styles.benefitCardDesc}>{benefit.description}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Investment Tiers */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Investment Tiers</Text>
        <View style={styles.tiersPreview}>
          {visibleTiers.map((tier) => {
            const config = TierConfig[tier];
            const threshold = TierThresholds[tier];
            if (!config) return null;
            return (
              <View key={tier} style={styles.tierPreviewRow}>
                <View style={styles.tierPreviewBadge}>
                  <LinearGradient
                    colors={config.bgGradient as [string, string]}
                    style={StyleSheet.absoluteFill}
                  />
                  <Feather
                    name={config.icon as any}
                    size={16}
                    color={config.textColor || Colors.deepNavy}
                  />
                </View>
                <Text style={styles.tierPreviewName}>{config.name}</Text>
                <Text style={styles.tierPreviewThreshold}>
                  {threshold === 0 ? 'Entry Level' : `$${threshold?.toLocaleString()}+`}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* CTA */}
      <View style={styles.ctaSection}>
        <TouchableOpacity style={styles.ctaButton} onPress={handleRequestDeck}>
          <LinearGradient
            colors={[Colors.gold, Colors.goldDark]}
            style={styles.ctaButtonGradient}
          >
            <Text style={styles.ctaButtonText}>Request Investor Deck</Text>
            <Feather name="arrow-right" size={18} color={Colors.deepNavy} />
          </LinearGradient>
        </TouchableOpacity>
        <Text style={styles.ctaDisclaimer}>
          Minimum investment starting at $100,000
        </Text>
      </View>
    </ScrollView>
  );
}

// ============================================
// MAIN INVESTOR SCREEN
// ============================================

export function InvestorScreen() {
  const { isInvestor } = useAuth();

  if (isInvestor) {
    return <InvestorDashboardView />;
  }

  return <InvestorMarketingView />;
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.deepNavy,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 14,
  },

  // Dashboard Header
  dashboardHeader: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 14,
    color: Colors.softGrey,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.white,
    marginTop: 4,
  },

  // Portfolio Card
  portfolioCard: {
    backgroundColor: Colors.cardElevated,
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
    overflow: 'hidden',
  },
  portfolioGoldBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: Colors.gold,
  },
  portfolioLabel: {
    fontSize: 11,
    color: Colors.softGrey,
    letterSpacing: 1,
    marginBottom: 8,
  },
  portfolioValue: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.gold,
    marginBottom: 8,
  },
  portfolioChange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  portfolioChangeText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.success,
    marginLeft: 6,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.cardElevated,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  statCardValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
    marginTop: 8,
    marginBottom: 4,
  },
  statCardLabel: {
    fontSize: 10,
    color: Colors.softGrey,
  },

  // Actions Grid
  actionsGrid: {
    flexDirection: 'row',
  },
  actionButton: {
    flex: 1,
    backgroundColor: Colors.cardElevated,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  actionButtonLabel: {
    fontSize: 11,
    color: Colors.white,
    marginTop: 8,
  },

  // Benefits List
  benefitsList: {
    backgroundColor: Colors.cardElevated,
    borderRadius: 14,
    padding: 16,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardDark,
  },
  benefitRowText: {
    fontSize: 14,
    color: Colors.white,
    marginLeft: 12,
  },

  // Progress Card
  progressCard: {
    backgroundColor: Colors.cardElevated,
    borderRadius: 15,
    padding: 20,
  },
  progressTitle: {
    color: Colors.white,
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
    backgroundColor: Colors.gold,
    borderRadius: 4,
  },
  progressText: {
    color: '#888',
    fontSize: 12,
    marginTop: 8,
  },
  benefitsListSmall: {
    marginTop: 15,
  },
  benefitItemSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitTextSmall: {
    color: '#ccc',
    fontSize: 13,
    marginLeft: 8,
  },

  // Marketing View
  marketingHero: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    borderRadius: 20,
    marginBottom: 24,
    overflow: 'hidden',
  },
  marketingTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.white,
    marginTop: 16,
    marginBottom: 8,
  },
  marketingSubtitle: {
    fontSize: 14,
    color: Colors.softGrey,
    textAlign: 'center',
    lineHeight: 20,
  },
  marketingStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: Colors.cardElevated,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 24,
  },
  marketingStat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.gold,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.softGrey,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.cardDark,
  },

  // Benefits Grid
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  benefitCard: {
    width: '50%',
    padding: 6,
  },
  benefitIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.goldSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  benefitCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 4,
  },
  benefitCardDesc: {
    fontSize: 11,
    color: Colors.softGrey,
  },

  // Tiers Preview
  tiersPreview: {
    backgroundColor: Colors.cardElevated,
    borderRadius: 14,
    padding: 8,
  },
  tierPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  tierPreviewBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  tierPreviewName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
    marginLeft: 12,
  },
  tierPreviewThreshold: {
    fontSize: 12,
    color: Colors.softGrey,
  },

  // CTA Section
  ctaSection: {
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  ctaButton: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
  },
  ctaButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.deepNavy,
    marginRight: 8,
  },
  ctaDisclaimer: {
    fontSize: 11,
    color: Colors.mutedGrey,
    marginTop: 12,
  },
});

export default InvestorScreen;
