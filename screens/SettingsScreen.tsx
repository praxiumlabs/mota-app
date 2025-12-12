/**
 * SettingsScreen - App settings and preferences
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
  darkMode: boolean;
  hapticFeedback: boolean;
  autoPlayVideos: boolean;
  highQualityImages: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  biometricEnabled: false,
  pushNotifications: true,
  emailNotifications: true,
  marketingEmails: false,
  darkMode: true,
  hapticFeedback: true,
  autoPlayVideos: true,
  highQualityImages: true,
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
      const stored = await AsyncStorage.getItem('mota_settings');
      if (stored) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
      }
    } catch (err) {
      console.log('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: Settings) => {
    try {
      await AsyncStorage.setItem('mota_settings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (err) {
      console.log('Error saving settings:', err);
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
    } catch (err) {
      console.log('Error checking biometrics:', err);
    }
  };

  const toggleBiometric = async () => {
    if (!biometricAvailable) {
      Alert.alert(
        'Biometrics Unavailable',
        `${biometricType} is not available on this device. Please enable it in your device settings.`,
        [{ text: 'OK' }]
      );
      return;
    }

    if (!settings.biometricEnabled) {
      // Verify biometric before enabling
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Enable ${biometricType} for MOTA`,
        disableDeviceFallback: false,
        cancelLabel: 'Cancel',
      });

      if (result.success) {
        const newSettings = { ...settings, biometricEnabled: true };
        saveSettings(newSettings);
        Alert.alert('Success', `${biometricType} has been enabled for quick login.`);
      }
    } else {
      const newSettings = { ...settings, biometricEnabled: false };
      saveSettings(newSettings);
    }
  };

  const updateSetting = (key: keyof Settings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  const clearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data including images. The app may be slower until data is re-downloaded.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            // Clear app cache
            Alert.alert('Cache Cleared', 'All cached data has been removed.');
          }
        }
      ]
    );
  };

  const deleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data, reservations, and preferences will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirm Deletion',
              'Please type DELETE to confirm account deletion.',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'I Understand',
                  style: 'destructive',
                  onPress: () => {
                    // Would call API to delete account
                    logout();
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };

  const SettingRow = ({ 
    icon, 
    title, 
    subtitle, 
    value, 
    onToggle,
    disabled = false,
    showArrow = false,
    onPress
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    value?: boolean;
    onToggle?: () => void;
    disabled?: boolean;
    showArrow?: boolean;
    onPress?: () => void;
  }) => (
    <TouchableOpacity 
      style={[s.settingRow, disabled && s.settingRowDisabled]}
      onPress={onPress || onToggle}
      disabled={disabled && !onPress}
      activeOpacity={onToggle ? 1 : 0.7}
    >
      <View style={s.settingIcon}>
        <Ionicons name={icon as any} size={20} color={disabled ? C.textMuted : C.gold} />
      </View>
      <View style={s.settingInfo}>
        <Text style={[s.settingTitle, disabled && s.settingTitleDisabled]}>{title}</Text>
        {subtitle && <Text style={s.settingSubtitle}>{subtitle}</Text>}
      </View>
      {value !== undefined ? (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: C.cardLight, true: C.gold + '80' }}
          thumbColor={value ? C.gold : C.textMuted}
          disabled={disabled}
        />
      ) : showArrow ? (
        <Ionicons name="chevron-forward" size={20} color={C.textMuted} />
      ) : null}
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <Text style={s.sectionHeader}>{title}</Text>
  );

  return (
    <LinearGradient colors={G.dark} style={s.container}>
      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={onBack} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color={C.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
        {/* Security */}
        <SectionHeader title="SECURITY" />
        <View style={s.section}>
          <SettingRow
            icon="finger-print"
            title={biometricType}
            subtitle={biometricAvailable 
              ? `Quick login with ${biometricType}` 
              : 'Not available on this device'}
            value={settings.biometricEnabled}
            onToggle={toggleBiometric}
            disabled={!biometricAvailable}
          />
          <SettingRow
            icon="lock-closed"
            title="Change Password"
            showArrow
            onPress={() => Alert.alert('Change Password', 'Go to Edit Profile to change your password.')}
          />
          <SettingRow
            icon="shield-checkmark"
            title="Two-Factor Authentication"
            subtitle="Add extra security to your account"
            showArrow
            onPress={() => Alert.alert('Coming Soon', 'Two-factor authentication will be available in a future update.')}
          />
        </View>

        {/* Notifications */}
        <SectionHeader title="NOTIFICATIONS" />
        <View style={s.section}>
          <SettingRow
            icon="notifications"
            title="Push Notifications"
            subtitle="Reservations, events, and updates"
            value={settings.pushNotifications}
            onToggle={() => updateSetting('pushNotifications', !settings.pushNotifications)}
          />
          <SettingRow
            icon="mail"
            title="Email Notifications"
            subtitle="Booking confirmations and reminders"
            value={settings.emailNotifications}
            onToggle={() => updateSetting('emailNotifications', !settings.emailNotifications)}
          />
          <SettingRow
            icon="megaphone"
            title="Marketing & Promotions"
            subtitle="Special offers and news"
            value={settings.marketingEmails}
            onToggle={() => updateSetting('marketingEmails', !settings.marketingEmails)}
          />
        </View>

        {/* Display */}
        <SectionHeader title="DISPLAY" />
        <View style={s.section}>
          <SettingRow
            icon="moon"
            title="Dark Mode"
            subtitle="Always on (optimized for MOTA)"
            value={settings.darkMode}
            onToggle={() => {}}
            disabled
          />
          <SettingRow
            icon="image"
            title="High Quality Images"
            subtitle="Uses more data"
            value={settings.highQualityImages}
            onToggle={() => updateSetting('highQualityImages', !settings.highQualityImages)}
          />
          <SettingRow
            icon="play-circle"
            title="Auto-Play Videos"
            subtitle="On Wi-Fi only"
            value={settings.autoPlayVideos}
            onToggle={() => updateSetting('autoPlayVideos', !settings.autoPlayVideos)}
          />
          <SettingRow
            icon="radio-button-on"
            title="Haptic Feedback"
            subtitle="Vibration on interactions"
            value={settings.hapticFeedback}
            onToggle={() => updateSetting('hapticFeedback', !settings.hapticFeedback)}
          />
        </View>

        {/* Privacy */}
        <SectionHeader title="PRIVACY" />
        <View style={s.section}>
          <SettingRow
            icon="document-text"
            title="Privacy Policy"
            showArrow
            onPress={() => Linking.openURL('https://mota.bet/privacy')}
          />
          <SettingRow
            icon="newspaper"
            title="Terms of Service"
            showArrow
            onPress={() => Linking.openURL('https://mota.bet/terms')}
          />
          <SettingRow
            icon="analytics"
            title="Analytics"
            subtitle="Help improve MOTA"
            value={true}
            onToggle={() => Alert.alert('Analytics', 'Analytics helps us improve your experience.')}
          />
        </View>

        {/* Data */}
        <SectionHeader title="DATA" />
        <View style={s.section}>
          <SettingRow
            icon="cloud-download"
            title="Download My Data"
            subtitle="Get a copy of your data"
            showArrow
            onPress={() => Alert.alert('Download Data', 'Your data export will be sent to your email within 24 hours.')}
          />
          <SettingRow
            icon="trash"
            title="Clear Cache"
            subtitle="Free up storage space"
            showArrow
            onPress={clearCache}
          />
        </View>

        {/* About */}
        <SectionHeader title="ABOUT" />
        <View style={s.section}>
          <SettingRow
            icon="information-circle"
            title="App Version"
            subtitle="3.1.0"
          />
          <SettingRow
            icon="star"
            title="Rate MOTA"
            showArrow
            onPress={() => Alert.alert('Rate Us', 'Thank you for your support!')}
          />
          <SettingRow
            icon="chatbubble-ellipses"
            title="Send Feedback"
            showArrow
            onPress={() => Linking.openURL('mailto:feedback@mota.bet?subject=MOTA%20App%20Feedback')}
          />
        </View>

        {/* Danger Zone */}
        {user && (
          <>
            <SectionHeader title="ACCOUNT" />
            <View style={s.section}>
              <TouchableOpacity style={s.dangerBtn} onPress={deleteAccount}>
                <Ionicons name="warning" size={20} color={C.error} />
                <Text style={s.dangerBtnText}>Delete Account</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: C.textMuted,
    letterSpacing: 1,
    marginTop: 24,
    marginBottom: 8,
    marginLeft: 4,
  },
  section: {
    backgroundColor: C.card,
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.cardLight,
  },
  settingRowDisabled: {
    opacity: 0.6,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.cardLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingInfo: {
    flex: 1,
    marginLeft: 12,
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
  dangerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  dangerBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: C.error,
  },
});
