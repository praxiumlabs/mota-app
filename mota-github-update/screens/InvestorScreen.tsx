/**
 * MOTA Investor Screen
 * - Marketing view for non-investors (Guest/Member)
 * - Dashboard view for Investors
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useAuth,
  AccessLevel,
  InvestorTier,
  TierConfig,
  TierThresholds,
  InvestorBenefits,
} from '../context/AuthContext';
import {
  TierCard,
  TierBadge,
  TierProgressCard,
} from './FomoComponents';

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
  purple: '#A78BFA',
};

// ============================================
// INVESTOR MARKETING VIEW (Non-Investor)
// ============================================

function InvestorMarketingView() {
  const insets = useSafeAreaInsets();

  const handleRequestDeck = () => {
    // Open external website for investor deck request
    Linking.openURL('https://macauoftheamericas.com');
  };

  // Visible tiers (Silver, Gold, Platinum, Diamond)
  const visibleTiers = [
    InvestorTier.SILVER,
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
            return (
              <View key={tier} style={styles.tierPreviewRow}>
                <View style={styles.tierPreviewBadge}>
                  <LinearGradient
                    colors={config.bgGradient}
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
        <Text style={styles.tierNote}>
          * Black Card & Founders Card available by invitation only
        </Text>
      </View>

      {/* CTA Section */}
      <View style={styles.ctaSection}>
        <Text style={styles.ctaText}>
          Ready to learn more about this exclusive opportunity?
        </Text>
        <Pressable style={styles.ctaButton} onPress={handleRequestDeck}>
          <LinearGradient
            colors={[Colors.gold, Colors.goldDark]}
            style={styles.ctaButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Feather name="file-text" size={18} color={Colors.deepNavy} />
            <Text style={styles.ctaButtonText}>Request Investor Deck</Text>
            <Feather name="external-link" size={16} color={Colors.deepNavy} />
          </LinearGradient>
        </Pressable>
        <Text style={styles.ctaHint}>Opens macauoftheamericas.com</Text>
      </View>

      {/* Process Steps */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Investment Process</Text>
        <View style={styles.processSteps}>
          {[
            { step: '1', title: 'Request Deck', desc: 'Submit contact info' },
            { step: '2', title: 'Review Materials', desc: 'PPM & financials' },
            { step: '3', title: 'Consultation', desc: 'Q&A with our team' },
            { step: '4', title: 'Sign & Verify', desc: 'Complete documents' },
          ].map((item, idx) => (
            <View key={idx} style={styles.processStep}>
              <View style={styles.processStepNumber}>
                <Text style={styles.processStepNumberText}>{item.step}</Text>
              </View>
              <View style={styles.processStepText}>
                <Text style={styles.processStepTitle}>{item.title}</Text>
                <Text style={styles.processStepDesc}>{item.desc}</Text>
              </View>
              {idx < 3 && <View style={styles.processStepLine} />}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

// ============================================
// INVESTOR DASHBOARD VIEW (Investor)
// ============================================

function InvestorDashboardView() {
  const { user, getNextTierInfo } = useAuth();
  const insets = useSafeAreaInsets();
  const nextTierInfo = getNextTierInfo();

  if (!user || user.accessLevel !== AccessLevel.INVESTOR) return null;

  const tierConfig = user.investorTier ? TierConfig[user.investorTier] : null;
  const investmentAmount = user.investmentAmount || 0;
  const portfolioValue = user.portfolioValue || 0;
  const roi = investmentAmount > 0
    ? ((portfolioValue - investmentAmount) / investmentAmount * 100).toFixed(1)
    : '0';
  const gain = portfolioValue - investmentAmount;

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: 100 }}
    >
      {/* Header */}
      <View style={styles.dashboardHeader}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{user.name}</Text>
        </View>
        {user.investorTier && <TierBadge tier={user.investorTier} size="small" />}
      </View>

      {/* Tier Card */}
      <View style={styles.section}>
        <TierCard user={user} />
      </View>

      {/* Portfolio Card */}
      <View style={styles.portfolioCard}>
        <View style={styles.portfolioGoldBar} />
        <Text style={styles.portfolioLabel}>TOTAL PORTFOLIO VALUE</Text>
        <Text style={styles.portfolioValue}>${portfolioValue.toLocaleString()}</Text>
        <View style={styles.portfolioChange}>
          <Feather name="trending-up" size={16} color={Colors.success} />
          <Text style={styles.portfolioChangeText}>
            +${gain.toLocaleString()} ({roi}%)
          </Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Feather name="dollar-sign" size={20} color={Colors.gold} />
          <Text style={styles.statCardValue}>${investmentAmount.toLocaleString()}</Text>
          <Text style={styles.statCardLabel}>Invested</Text>
        </View>
        <View style={styles.statCard}>
          <Feather name="percent" size={20} color={Colors.success} />
          <Text style={styles.statCardValue}>+{roi}%</Text>
          <Text style={styles.statCardLabel}>ROI</Text>
        </View>
        <View style={styles.statCard}>
          <Feather name="bar-chart-2" size={20} color={Colors.blue} />
          <Text style={styles.statCardValue}>${portfolioValue.toLocaleString()}</Text>
          <Text style={styles.statCardLabel}>Value</Text>
        </View>
        <View style={styles.statCard}>
          <Feather name="calendar" size={20} color={Colors.purple} />
          <Text style={styles.statCardValue}>{user.memberSince?.split('-')[0]}</Text>
          <Text style={styles.statCardLabel}>Since</Text>
        </View>
      </View>

      {/* Tier Progress */}
      <View style={styles.section}>
        <TierProgressCard user={user} nextTierInfo={nextTierInfo} />
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <Pressable style={styles.actionButton}>
            <Feather name="file-text" size={22} color={Colors.gold} />
            <Text style={styles.actionButtonLabel}>Documents</Text>
          </Pressable>
          <Pressable style={styles.actionButton}>
            <Feather name="phone" size={22} color={Colors.gold} />
            <Text style={styles.actionButtonLabel}>Concierge</Text>
          </Pressable>
          <Pressable style={styles.actionButton}>
            <Feather name="calendar" size={22} color={Colors.gold} />
            <Text style={styles.actionButtonLabel}>Events</Text>
          </Pressable>
          <Pressable style={styles.actionButton}>
            <Feather name="gift" size={22} color={Colors.gold} />
            <Text style={styles.actionButtonLabel}>Benefits</Text>
          </Pressable>
        </View>
      </View>

      {/* VIP Benefits */}
      {tierConfig && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Benefits</Text>
          <View style={styles.benefitsList}>
            {tierConfig.benefits.map((benefit, idx) => (
              <View key={idx} style={styles.benefitRow}>
                <Feather name="check-circle" size={18} color={Colors.success} />
                <Text style={styles.benefitRowText}>{benefit}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
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
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  benefitCard: {
    width: '50%',
    padding: 6,
  },
  benefitCardInner: {
    backgroundColor: Colors.cardElevated,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
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
    textAlign: 'center',
  },
  benefitCardDesc: {
    fontSize: 11,
    color: Colors.softGrey,
    textAlign: 'center',
  },
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
  tierNote: {
    fontSize: 11,
    color: Colors.mutedGrey,
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
  },
  ctaSection: {
    alignItems: 'center',
    backgroundColor: Colors.cardElevated,
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 20,
    marginBottom: 24,
  },
  ctaText: {
    fontSize: 14,
    color: Colors.softGrey,
    textAlign: 'center',
    marginBottom: 16,
  },
  ctaButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  ctaButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  ctaButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.deepNavy,
    marginHorizontal: 10,
  },
  ctaHint: {
    fontSize: 11,
    color: Colors.mutedGrey,
    marginTop: 10,
  },
  processSteps: {
    backgroundColor: Colors.cardElevated,
    borderRadius: 14,
    padding: 16,
  },
  processStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  processStepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  processStepNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.deepNavy,
  },
  processStepText: {
    flex: 1,
    marginLeft: 12,
  },
  processStepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  processStepDesc: {
    fontSize: 12,
    color: Colors.softGrey,
  },
  processStepLine: {
    position: 'absolute',
    left: 15,
    top: 36,
    width: 2,
    height: 24,
    backgroundColor: Colors.goldMuted,
  },

  // Dashboard View
  dashboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
    marginHorizontal: 4,
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
  actionsGrid: {
    flexDirection: 'row',
  },
  actionButton: {
    flex: 1,
    backgroundColor: Colors.cardElevated,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  actionButtonLabel: {
    fontSize: 11,
    color: Colors.white,
    marginTop: 8,
  },
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
});

export default InvestorScreen;
