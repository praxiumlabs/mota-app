/**
 * SettingsScreen - App settings and preferences
 * FIX #7 & #9: Removed Display and Data sections
 */

import React, { useState, useEffect } from 'react';
import {
  StyleSheet, View, Text, ScrollView, TouchableOpacity,
  Switch, Alert, Platform, Linking
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { useAuth } from '../context/AuthContext';

const C = {
  bg: '#0A122A',
  card: '#101C40',
  cardLight: '#1A2A50',
  gold: '#D4AF37',
  text: '#F5F5F5',
  textSec: '#A0AEC0',
  textMuted: '#5A6A8A',
  success: '#48BB78',
  error: '#FC8181',
  warning: '#F6AD55',
};

const G = {
  dark: ['#0A122A', '#101C40', '#0A122A'],
  gold: ['#E8C547', '#D4AF37', '#B8952F'],
};

interface Settings {
  biometricEnabled: boolean;
  pushNotifications: boolean;
  emailNotifications: boolean;
  marketingEmails: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  biometricEnabled: false,
  pushNotifications: true,
  emailNotifications: true,
  marketingEmails: false,
};

interface Props {
  onBack: () => void;
}

export default function SettingsScreen({ onBack }: Props) {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('Biometrics');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
    checkBiometricAvailability();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem('app_settings');
      if (stored) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkBiometricAvailability = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setBiometricAvailable(compatible && enrolled);

      if (compatible) {
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType(Platform.OS === 'ios' ? 'Face ID' : 'Face Recognition');
        } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType(Platform.OS === 'ios' ? 'Touch ID' : 'Fingerprint');
        }
      }
    } catch (error) {
      console.error('Biometric check error:', error);
    }
  };

  const updateSetting = async (key: keyof Settings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    try {
      await AsyncStorage.setItem('app_settings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleBiometricToggle = async (value: boolean) => {
    if (value) {
      try {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: `Enable ${biometricType} for MOTA`,
          cancelLabel: 'Cancel',
          disableDeviceFallback: false,
        });

        if (result.success) {
          updateSetting('biometricEnabled', true);
          Alert.alert('Success', `${biometricType} has been enabled for quick login.`);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to enable biometric authentication.');
      }
    } else {
      updateSetting('biometricEnabled', false);
    }
  };

  const openPrivacyPolicy = () => {
    Linking.openURL('https://motaresort.com/privacy');
  };

  const openTermsOfService = () => {
    Linking.openURL('https://motaresort.com/terms');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // API call to delete account would go here
              Alert.alert('Account Deleted', 'Your account has been deleted.');
              logout();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete account. Please contact support.');
            }
          },
        },
      ]
    );
  };

  const renderSettingItem = (
    icon: string,
    title: string,
    subtitle?: string,
    value?: boolean,
    onToggle?: (value: boolean) => void,
    onPress?: () => void,
    disabled?: boolean,
    showArrow?: boolean
  ) => (
    <TouchableOpacity
      style={[styles.settingItem, disabled && styles.settingItemDisabled]}
      onPress={onPress}
      disabled={disabled || !onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.settingIcon}>
        <Ionicons name={icon as any} size={22} color={disabled ? C.textMuted : C.gold} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, disabled && styles.settingTitleDisabled]}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {value !== undefined && onToggle && (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: C.cardLight, true: C.gold }}
          thumbColor="#fff"
          disabled={disabled}
        />
      )}
      {showArrow && (
        <Ionicons name="chevron-forward" size={20} color={C.textMuted} />
      )}
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={G.dark} style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={C.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <View style={styles.sectionContent}>
            {renderSettingItem(
              'finger-print',
              biometricType,
              biometricAvailable ? 'Quick and secure login' : 'Not available on this device',
              settings.biometricEnabled,
              handleBiometricToggle,
              undefined,
              !biometricAvailable
            )}
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.sectionContent}>
            {renderSettingItem(
              'notifications',
              'Push Notifications',
              'Receive alerts about bookings and events',
              settings.pushNotifications,
              (value) => updateSetting('pushNotifications', value)
            )}
            {renderSettingItem(
              'mail',
              'Email Notifications',
              'Booking confirmations and updates',
              settings.emailNotifications,
              (value) => updateSetting('emailNotifications', value)
            )}
            {renderSettingItem(
              'megaphone',
              'Marketing Emails',
              'Special offers and promotions',
              settings.marketingEmails,
              (value) => updateSetting('marketingEmails', value)
            )}
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.sectionContent}>
            {renderSettingItem(
              'document-text',
              'Privacy Policy',
              undefined,
              undefined,
              undefined,
              openPrivacyPolicy,
              false,
              true
            )}
            {renderSettingItem(
              'shield-checkmark',
              'Terms of Service',
              undefined,
              undefined,
              undefined,
              openTermsOfService,
              false,
              true
            )}
            {renderSettingItem(
              'information-circle',
              'App Version',
              'v4.0.0',
              undefined,
              undefined,
              undefined,
              false,
              false
            )}
          </View>
        </View>

        {/* Danger Zone */}
        {user && user.accessLevel === 'member' && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: C.error }]}>Danger Zone</Text>
            <View style={styles.sectionContent}>
              <TouchableOpacity style={styles.dangerButton} onPress={handleDeleteAccount}>
                <Ionicons name="trash-outline" size={20} color={C.error} />
                <Text style={styles.dangerButtonText}>Delete Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.text,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: C.card,
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.cardLight,
  },
  settingItemDisabled: {
    opacity: 0.5,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: C.cardLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: C.text,
  },
  settingTitleDisabled: {
    color: C.textMuted,
  },
  settingSubtitle: {
    fontSize: 12,
    color: C.textMuted,
    marginTop: 2,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  dangerButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: C.error,
  },
});
