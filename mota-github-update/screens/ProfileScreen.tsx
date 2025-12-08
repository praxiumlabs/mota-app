/**
 * MOTA Profile Screen
 * User profile, security settings, and account management
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth, TierConfig, AccessLevel } from '../context/AuthContext';
import { TierBadge } from './FomoComponents';

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

interface ProfileScreenProps {
  onShowAuthModal: () => void;
}

export function ProfileScreen({ onShowAuthModal }: ProfileScreenProps) {
  const {
    user,
    logout,
    isGuest,
    biometricType,
    biometricAvailable,
    enableBiometric,
    disableBiometric,
    isLoading,
  } = useAuth();
  const insets = useSafeAreaInsets();
  const [biometricLoading, setBiometricLoading] = useState(false);

  // Guest View
  if (isGuest || !user) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
        <View style={styles.guestContainer}>
          <View style={styles.guestAvatar}>
            <Feather name="user" size={64} color={Colors.mutedGrey} />
          </View>
          <Text style={styles.guestTitle}>You're browsing as a Guest</Text>
          <Text style={styles.guestText}>
            Create a free account to unlock all features
          </Text>
          <Pressable style={styles.signUpButton} onPress={onShowAuthModal}>
            <LinearGradient
              colors={[Colors.gold, Colors.goldDark]}
              style={styles.signUpButtonGradient}
            >
              <Text style={styles.signUpButtonText}>Sign Up Free</Text>
            </LinearGradient>
          </Pressable>
          <Pressable style={styles.loginLink} onPress={onShowAuthModal}>
            <Text style={styles.loginLinkText}>Already have an account? Sign In</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const tierConfig = user.investorTier ? TierConfig[user.investorTier] : null;
  const BiometricIcon = biometricType === 'faceId' ? 'face-recognition' : 'fingerprint';

  const handleBiometricToggle = async () => {
    setBiometricLoading(true);
    
    if (user.biometricEnabled) {
      await disableBiometric();
    } else {
      const success = await enableBiometric();
      if (!success) {
        Alert.alert(
          'Verification Failed',
          'Could not verify your identity. Please try again.',
          [{ text: 'OK' }]
        );
      }
    }
    
    setBiometricLoading(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: logout },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: 100 }}
    >
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={[
          styles.avatar,
          tierConfig && { backgroundColor: tierConfig.color + '30' }
        ]}>
          {tierConfig ? (
            <Feather
              name={tierConfig.icon as any}
              size={32}
              color={tierConfig.color}
            />
          ) : (
            <Feather name="user" size={32} color={Colors.blue} />
          )}
        </View>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        
        {/* Tier Badge or Member Badge */}
        {user.investorTier ? (
          <TierBadge tier={user.investorTier} size="medium" />
        ) : (
          <View style={styles.memberBadge}>
            <Feather name="star" size={14} color={Colors.blue} />
            <Text style={styles.memberBadgeText}>Member</Text>
          </View>
        )}
      </View>

      {/* Security Settings */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Feather name="shield" size={20} color={Colors.gold} />
          <Text style={styles.sectionTitle}>Security Settings</Text>
        </View>

        {/* Biometric Toggle */}
        {biometricAvailable ? (
          <Pressable
            style={styles.settingsRow}
            onPress={handleBiometricToggle}
            disabled={biometricLoading || isLoading}
          >
            <View style={[
              styles.settingsIconBox,
              user.biometricEnabled && { backgroundColor: Colors.goldSubtle }
            ]}>
              <MaterialCommunityIcons
                name={BiometricIcon}
                size={22}
                color={user.biometricEnabled ? Colors.gold : Colors.mutedGrey}
              />
            </View>
            <View style={styles.settingsRowText}>
              <Text style={styles.settingsRowLabel}>
                {biometricType === 'faceId' ? 'Face ID' : 'Fingerprint'} Login
              </Text>
              <Text style={styles.settingsRowHint}>
                {user.biometricEnabled
                  ? 'Enabled - Quick secure access'
                  : 'Disabled - Enable for faster login'}
              </Text>
            </View>
            {biometricLoading ? (
              <ActivityIndicator color={Colors.gold} />
            ) : (
              <Feather
                name={user.biometricEnabled ? 'toggle-right' : 'toggle-left'}
                size={32}
                color={user.biometricEnabled ? Colors.gold : Colors.mutedGrey}
              />
            )}
          </Pressable>
        ) : (
          <View style={styles.settingsUnavailable}>
            <Feather name="alert-circle" size={18} color={Colors.mutedGrey} />
            <Text style={styles.settingsUnavailableText}>
              Biometric login not available on this device
            </Text>
          </View>
        )}

        {/* Change Password */}
        <Pressable style={styles.settingsRow}>
          <View style={styles.settingsIconBox}>
            <Feather name="lock" size={22} color={Colors.mutedGrey} />
          </View>
          <View style={styles.settingsRowText}>
            <Text style={styles.settingsRowLabel}>Change Password</Text>
            <Text style={styles.settingsRowHint}>Update your password</Text>
          </View>
          <Feather name="chevron-right" size={20} color={Colors.mutedGrey} />
        </Pressable>

        {/* Two-Factor Auth */}
        <Pressable style={styles.settingsRow}>
          <View style={styles.settingsIconBox}>
            <Feather name="smartphone" size={22} color={Colors.mutedGrey} />
          </View>
          <View style={styles.settingsRowText}>
            <Text style={styles.settingsRowLabel}>Two-Factor Authentication</Text>
            <Text style={styles.settingsRowHint}>Add extra security</Text>
          </View>
          <Feather name="chevron-right" size={20} color={Colors.mutedGrey} />
        </Pressable>
      </View>

      {/* Account Settings */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Feather name="settings" size={20} color={Colors.gold} />
          <Text style={styles.sectionTitle}>Account</Text>
        </View>

        <Pressable style={styles.settingsRow}>
          <View style={styles.settingsIconBox}>
            <Feather name="bell" size={22} color={Colors.mutedGrey} />
          </View>
          <View style={styles.settingsRowText}>
            <Text style={styles.settingsRowLabel}>Notifications</Text>
            <Text style={styles.settingsRowHint}>Manage alerts & updates</Text>
          </View>
          <Feather name="chevron-right" size={20} color={Colors.mutedGrey} />
        </Pressable>

        <Pressable style={styles.settingsRow}>
          <View style={styles.settingsIconBox}>
            <Feather name="globe" size={22} color={Colors.mutedGrey} />
          </View>
          <View style={styles.settingsRowText}>
            <Text style={styles.settingsRowLabel}>Language</Text>
            <Text style={styles.settingsRowHint}>English</Text>
          </View>
          <Feather name="chevron-right" size={20} color={Colors.mutedGrey} />
        </Pressable>

        <Pressable style={styles.settingsRow}>
          <View style={styles.settingsIconBox}>
            <Feather name="help-circle" size={22} color={Colors.mutedGrey} />
          </View>
          <View style={styles.settingsRowText}>
            <Text style={styles.settingsRowLabel}>Help & Support</Text>
            <Text style={styles.settingsRowHint}>FAQs, contact us</Text>
          </View>
          <Feather name="chevron-right" size={20} color={Colors.mutedGrey} />
        </Pressable>
      </View>

      {/* Upgrade CTA (for Members) */}
      {user.accessLevel === AccessLevel.MEMBER && (
        <View style={styles.upgradeSection}>
          <LinearGradient
            colors={[Colors.goldSubtle, 'transparent']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
          <MaterialCommunityIcons name="diamond-stone" size={32} color={Colors.gold} />
          <Text style={styles.upgradeTitle}>Become an Investor</Text>
          <Text style={styles.upgradeText}>
            Unlock VIP benefits, portfolio dashboard, and exclusive perks
          </Text>
          <Pressable style={styles.upgradeButton}>
            <Text style={styles.upgradeButtonText}>Learn More</Text>
            <Feather name="arrow-right" size={16} color={Colors.gold} />
          </Pressable>
        </View>
      )}

      {/* Sign Out */}
      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Feather name="log-out" size={18} color={Colors.error} />
        <Text style={styles.logoutButtonText}>Sign Out</Text>
      </Pressable>

      {/* App Version */}
      <Text style={styles.versionText}>MOTA v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.deepNavy,
  },

  // Guest View
  guestContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  guestAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  guestTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 10,
  },
  guestText: {
    fontSize: 14,
    color: Colors.softGrey,
    textAlign: 'center',
    marginBottom: 32,
  },
  signUpButton: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 280,
  },
  signUpButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  signUpButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.deepNavy,
  },
  loginLink: {
    marginTop: 20,
  },
  loginLinkText: {
    fontSize: 14,
    color: Colors.gold,
  },

  // Profile Header
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardElevated,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: Colors.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.softGrey,
    marginBottom: 16,
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(96, 165, 250, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  memberBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.blue,
    marginLeft: 6,
  },

  // Sections
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    marginLeft: 10,
  },

  // Settings Rows
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardElevated,
  },
  settingsIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsRowText: {
    flex: 1,
    marginLeft: 14,
  },
  settingsRowLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  settingsRowHint: {
    fontSize: 12,
    color: Colors.mutedGrey,
    marginTop: 2,
  },
  settingsUnavailable: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardElevated,
    borderRadius: 10,
    padding: 14,
  },
  settingsUnavailableText: {
    fontSize: 13,
    color: Colors.mutedGrey,
    marginLeft: 10,
  },

  // Upgrade Section
  upgradeSection: {
    marginHorizontal: 20,
    marginTop: 10,
    padding: 24,
    backgroundColor: Colors.cardElevated,
    borderRadius: 16,
    alignItems: 'center',
    overflow: 'hidden',
  },
  upgradeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.gold,
    marginTop: 12,
    marginBottom: 8,
  },
  upgradeText: {
    fontSize: 13,
    color: Colors.softGrey,
    textAlign: 'center',
    marginBottom: 16,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  upgradeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gold,
    marginRight: 6,
  },

  // Logout
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 30,
    padding: 16,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.error,
    borderRadius: 12,
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.error,
    marginLeft: 8,
  },

  // Version
  versionText: {
    fontSize: 12,
    color: Colors.mutedGrey,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
});

export default ProfileScreen;
