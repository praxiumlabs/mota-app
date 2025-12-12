/**
 * Investment Bar Component
 * Shows investor's investment progress and portfolio value
 */

import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { C, G } from '../constants/theme';

interface Props {
  investmentAmount: number;
  portfolioValue: number;
  tier: 'gold' | 'platinum' | 'diamond';
}

export default function InvestmentBar({ investmentAmount, portfolioValue, tier }: Props) {
  const roi = investmentAmount > 0 
    ? ((portfolioValue - investmentAmount) / investmentAmount * 100).toFixed(1)
    : '0';
  
  const isPositive = parseFloat(roi) >= 0;
  
  const getTierGradient = () => {
    if (tier === 'diamond') return G.diamond;
    if (tier === 'platinum') return G.platinum;
    return G.gold;
  };

  const getTierIcon = () => {
    if (tier === 'diamond') return 'diamond';
    if (tier === 'platinum') return 'ribbon';
    return 'medal';
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return '$' + (amount / 1000000).toFixed(1) + 'M';
    }
    if (amount >= 1000) {
      return '$' + (amount / 1000).toFixed(0) + 'K';
    }
    return '$' + amount.toLocaleString();
  };

  return (
    <LinearGradient colors={getTierGradient()} style={styles.container}>
      {/* Background Pattern */}
      <View style={styles.pattern}>
        {[...Array(5)].map((_, i) => (
          <View key={i} style={[styles.patternLine, { top: 30 + i * 25, opacity: 0.1 - i * 0.015 }]} />
        ))}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Left: Tier Badge */}
        <View style={styles.leftSection}>
          <View style={styles.tierBadge}>
            <Ionicons name={getTierIcon()} size={16} color={C.bg} />
            <Text style={styles.tierText}>{tier.charAt(0).toUpperCase() + tier.slice(1)}</Text>
          </View>
          <Text style={styles.labelSmall}>Investor</Text>
        </View>

        {/* Center: Investment & Portfolio */}
        <View style={styles.centerSection}>
          <View style={styles.valueRow}>
            <View style={styles.valueItem}>
              <Text style={styles.valueLabel}>Invested</Text>
              <Text style={styles.valueAmount}>{formatCurrency(investmentAmount)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.valueItem}>
              <Text style={styles.valueLabel}>Portfolio</Text>
              <Text style={styles.valueAmount}>{formatCurrency(portfolioValue)}</Text>
            </View>
          </View>
        </View>

        {/* Right: ROI */}
        <View style={styles.rightSection}>
          <Text style={styles.roiLabel}>ROI</Text>
          <View style={styles.roiRow}>
            <Ionicons 
              name={isPositive ? 'trending-up' : 'trending-down'} 
              size={16} 
              color={C.bg} 
            />
            <Text style={styles.roiValue}>{roi}%</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    overflow: 'hidden',
  },
  pattern: {
    ...StyleSheet.absoluteFillObject,
  },
  patternLine: {
    position: 'absolute',
    left: -50,
    right: -50,
    height: 1,
    backgroundColor: '#FFF',
    transform: [{ rotate: '-10deg' }],
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  leftSection: {
    marginRight: 16,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 4,
  },
  tierText: {
    fontSize: 12,
    fontWeight: '700',
    color: C.bg,
    marginLeft: 4,
  },
  labelSmall: {
    fontSize: 10,
    color: 'rgba(0,0,0,0.6)',
    textAlign: 'center',
  },
  centerSection: {
    flex: 1,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueItem: {
    flex: 1,
    alignItems: 'center',
  },
  valueLabel: {
    fontSize: 10,
    color: 'rgba(0,0,0,0.6)',
    marginBottom: 2,
  },
  valueAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: C.bg,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(0,0,0,0.2)',
    marginHorizontal: 12,
  },
  rightSection: {
    alignItems: 'center',
    marginLeft: 16,
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  roiLabel: {
    fontSize: 10,
    color: 'rgba(0,0,0,0.6)',
    marginBottom: 2,
  },
  roiRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roiValue: {
    fontSize: 14,
    fontWeight: '700',
    color: C.bg,
    marginLeft: 4,
  },
});
