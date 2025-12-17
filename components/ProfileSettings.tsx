/**
 * =====================================================
 * MOTA PROFILE & SETTINGS SYSTEM
 * =====================================================
 * 
 * FIXED VERSION - Permissions modal now re-checks when returning from Settings
 * 
 * Features:
 * - Net Gain calculation (replaces ROI)
 * - Favorites system with analytics
 * - Profile picture restrictions (guests can't upload)
 * - Mandatory location/bluetooth permissions
 * - Settings menu cleanup
 * - Account deletion options
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
  Alert,
  Switch,
  Image,
  Linking,
  Platform,
  TextInput,
  AppState,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';

const C = {
  bg: '#0A122A',
  card: '#101C40',
  cardLight: '#182952',
  gold: '#D4AF37',
  goldLight: '#E8C547',
  text: '#F5F5F5',
  textSec: '#A0AEC0',
  textMuted: '#718096',
  success: '#48BB78',
  error: '#FC8181',
  warning: '#F6AD55',
};

const G = {
  gold: ['#E8C547', '#D4AF37', '#B8952F'],
};


// =====================================================
// NET GAIN COMPONENT (Replaces ROI)
// =====================================================
export const NetGainCard = ({ user }: { user: any }) => {
  const investmentCost = user?.investmentAmount || 0;
  const currentValue = user?.portfolioValue || 0;
  const totalDividends = user?.totalDividends || 0;
  
  const netGain = (currentValue - investmentCost) + totalDividends;
  const isPositive = netGain >= 0;
  const percentageGain = investmentCost > 0 ? ((netGain / investmentCost) * 100) : 0;

  const formatCurrency = (amount: number) => {
    const absAmount = Math.abs(amount);
    if (absAmount >= 1000000) {
      return '$' + (amount / 1000000).toFixed(2) + 'M';
    }
    if (absAmount >= 1000) {
      return '$' + (amount / 1000).toFixed(1) + 'K';
    }
    return '$' + amount.toLocaleString();
  };

  return (
    <View style={netGainStyles.container}>
      <LinearGradient 
        colors={isPositive ? ['#1a472a', '#0a2818'] : ['#472a2a', '#280a0a']} 
        style={netGainStyles.gradient}
      >
        <View style={netGainStyles.header}>
          <View style={netGainStyles.iconContainer}>
            <Ionicons 
              name={isPositive ? 'trending-up' : 'trending-down'} 
              size={24} 
              color={isPositive ? C.success : C.error} 
            />
          </View>
          <View>
            <Text style={netGainStyles.label}>Net Gain</Text>
            <Text style={[
              netGainStyles.value,
              { color: isPositive ? C.success : C.error }
            ]}>
              {isPositive ? '+' : ''}{formatCurrency(netGain)}
            </Text>
          </View>
          <View style={netGainStyles.percentBadge}>
            <Text style={[
              netGainStyles.percentText,
              { color: isPositive ? C.success : C.error }
            ]}>
              {isPositive ? '+' : ''}{percentageGain.toFixed(1)}%
            </Text>
          </View>
        </View>

        <View style={netGainStyles.breakdown}>
          <View style={netGainStyles.breakdownItem}>
            <Text style={netGainStyles.breakdownLabel}>Investment Cost</Text>
            <Text style={netGainStyles.breakdownValue}>{formatCurrency(investmentCost)}</Text>
          </View>
          <View style={netGainStyles.breakdownItem}>
            <Text style={netGainStyles.breakdownLabel}>Current Value</Text>
            <Text style={netGainStyles.breakdownValue}>{formatCurrency(currentValue)}</Text>
          </View>
          <View style={netGainStyles.breakdownItem}>
            <Text style={netGainStyles.breakdownLabel}>Total Dividends</Text>
            <Text style={[netGainStyles.breakdownValue, { color: C.gold }]}>
              +{formatCurrency(totalDividends)}
            </Text>
          </View>
        </View>

        <View style={netGainStyles.formula}>
          <Text style={netGainStyles.formulaText}>
            Net Gain = (Current Value - Investment) + Dividends
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
};

const netGainStyles = StyleSheet.create({
  container: {
    marginVertical: 16,
    marginHorizontal: 20,
  },
  gradient: {
    borderRadius: 16,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  label: {
    fontSize: 13,
    color: C.textMuted,
  },
  value: {
    fontSize: 24,
    fontWeight: '800',
  },
  percentBadge: {
    marginLeft: 'auto',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  percentText: {
    fontSize: 14,
    fontWeight: '700',
  },
  breakdown: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
    padding: 16,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  breakdownLabel: {
    fontSize: 13,
    color: C.textMuted,
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '600',
    color: C.text,
  },
  formula: {
    marginTop: 12,
    alignItems: 'center',
  },
  formulaText: {
    fontSize: 11,
    color: C.textMuted,
    fontStyle: 'italic',
  },
});


// =====================================================
// FAVORITES SYSTEM
// =====================================================
export const FavoritesSection = ({ 
  favorites = [], 
  onToggleFavorite,
  onViewItem,
}: {
  favorites: any[];
  onToggleFavorite?: (id: string) => void;
  onViewItem?: (item: any) => void;
}) => {
  const groupedFavorites = favorites.reduce((acc: any, fav: any) => {
    const type = fav.type || 'other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(fav);
    return acc;
  }, {});

  const typeLabels: Record<string, string> = {
    restaurant: 'Restaurants',
    lodging: 'Lodging',
    activity: 'Activities',
    event: 'Events',
    nightlife: 'Nightlife',
    other: 'Other',
  };

  if (favorites.length === 0) {
    return (
      <View style={favStyles.emptyContainer}>
        <Ionicons name="heart-outline" size={48} color={C.textMuted} />
        <Text style={favStyles.emptyTitle}>No Favorites Yet</Text>
        <Text style={favStyles.emptyText}>
          Tap the heart icon on any item to save it here
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={favStyles.container} showsVerticalScrollIndicator={false}>
      {Object.entries(groupedFavorites).map(([type, items]: [string, any]) => (
        <View key={type} style={favStyles.section}>
          <Text style={favStyles.sectionTitle}>
            {typeLabels[type] || type} ({items.length})
          </Text>
          {items.map((item: any) => (
            <TouchableOpacity 
              key={item._id || item.id}
              style={favStyles.favoriteCard}
              onPress={() => onViewItem?.(item)}
            >
              <Image 
                source={{ uri: item.image || item.images?.[0]?.url || 'https://via.placeholder.com/80' }} 
                style={favStyles.favoriteImage}
              />
              <View style={favStyles.favoriteInfo}>
                <Text style={favStyles.favoriteName}>{item.name}</Text>
                <Text style={favStyles.favoriteType}>{item.category || item.type}</Text>
                {item.rating && (
                  <View style={favStyles.ratingRow}>
                    <Ionicons name="star" size={14} color={C.gold} />
                    <Text style={favStyles.ratingText}>{item.rating.toFixed(1)}</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity 
                style={favStyles.removeBtn}
                onPress={() => onToggleFavorite?.(item._id || item.id)}
              >
                <Ionicons name="heart" size={24} color={C.error} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

const favStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.text,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: C.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  favoriteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  favoriteImage: {
    width: 80,
    height: 80,
  },
  favoriteInfo: {
    flex: 1,
    padding: 12,
  },
  favoriteName: {
    fontSize: 15,
    fontWeight: '600',
    color: C.text,
  },
  favoriteType: {
    fontSize: 13,
    color: C.textMuted,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  ratingText: {
    fontSize: 13,
    color: C.gold,
    fontWeight: '600',
  },
  removeBtn: {
    padding: 16,
  },
});


// =====================================================
// PROFILE PICTURE COMPONENT
// =====================================================
export const ProfilePicture = ({ 
  user, 
  size = 100,
  editable = true,
  onImageUpdate,
}: {
  user: any;
  size?: number;
  editable?: boolean;
  onImageUpdate?: (url: string) => void;
}) => {
  const [uploading, setUploading] = useState(false);
  
  const canUpload = user?.accessLevel !== 'guest' && editable;
  
  const handlePickImage = async () => {
    if (!canUpload) {
      Alert.alert(
        'Members Only',
        'Create a free account to upload a profile picture and unlock more features.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign Up', onPress: () => {} },
        ]
      );
      return;
    }

    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please grant photo library access to upload a profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        setUploading(true);
        try {
          const response = await fetch('/api/upload/base64/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              image: `data:image/jpeg;base64,${result.assets[0].base64}`,
            }),
          });
          const data = await response.json();
          
          if (data.success && data.imageUrl) {
            onImageUpdate?.(data.imageUrl);
          }
        } catch (error) {
          Alert.alert('Upload Failed', 'Could not upload profile picture. Please try again.');
        } finally {
          setUploading(false);
        }
      }
    } catch (error) {
      console.error('Image picker error:', error);
    }
  };

  const initials = user?.name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || '?';

  return (
    <TouchableOpacity 
      style={[profilePicStyles.container, { width: size, height: size }]}
      onPress={handlePickImage}
      disabled={uploading}
    >
      {user?.avatar ? (
        <Image 
          source={{ uri: user.avatar }} 
          style={[profilePicStyles.image, { width: size, height: size, borderRadius: size / 2 }]}
        />
      ) : (
        <LinearGradient 
          colors={G.gold} 
          style={[profilePicStyles.placeholder, { width: size, height: size, borderRadius: size / 2 }]}
        >
          <Text style={[profilePicStyles.initials, { fontSize: size * 0.35 }]}>{initials}</Text>
        </LinearGradient>
      )}
      
      {canUpload && !uploading && (
        <View style={profilePicStyles.editBadge}>
          <Ionicons name="camera" size={14} color="#fff" />
        </View>
      )}
      
      {!canUpload && editable && (
        <View style={profilePicStyles.lockedBadge}>
          <Ionicons name="lock-closed" size={12} color={C.textMuted} />
        </View>
      )}
      
      {uploading && (
        <View style={profilePicStyles.uploadingOverlay}>
          <Text style={profilePicStyles.uploadingText}>...</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const profilePicStyles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    backgroundColor: C.cardLight,
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontWeight: '700',
    color: C.bg,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.gold,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: C.bg,
  },
  lockedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: C.cardLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: C.bg,
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: {
    color: '#fff',
    fontSize: 16,
  },
});


// =====================================================
// PERMISSIONS HANDLER (FIXED - Re-checks on app resume)
// =====================================================
export const PermissionsModal = ({ visible, onComplete }: { visible: boolean; onComplete: () => void }) => {
  const [locationStatus, setLocationStatus] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [bluetoothStatus, setBluetoothStatus] = useState<'pending' | 'granted' | 'denied'>('pending');
  const appState = useRef(AppState.currentState);

  // Check permissions on mount and when modal becomes visible
  useEffect(() => {
    if (visible) {
      checkPermissions();
    }
  }, [visible]);

  // Re-check permissions when app comes back from background (after Settings)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to foreground - re-check permissions
        checkPermissions();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const checkPermissions = async () => {
    try {
      // Check location permission
      const locationPerm = await Location.getForegroundPermissionsAsync();
      setLocationStatus(locationPerm.status === 'granted' ? 'granted' : 
                       locationPerm.status === 'denied' ? 'denied' : 'pending');
      
      // For Bluetooth, we'll simulate as granted for demo
      // In production, you'd check actual bluetooth permissions
      if (Platform.OS === 'ios') {
        setBluetoothStatus('granted');
      } else {
        setBluetoothStatus('granted');
      }
    } catch (error) {
      console.log('Permission check error:', error);
    }
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationStatus(status === 'granted' ? 'granted' : 'denied');
      
      if (status === 'granted') {
        try {
          await Location.requestBackgroundPermissionsAsync();
        } catch (e) {
          // Background permission optional
        }
      }
    } catch (error) {
      setLocationStatus('denied');
    }
  };

  const requestBluetoothPermission = async () => {
    setBluetoothStatus('granted');
  };

  const openSettings = () => {
    Linking.openSettings();
  };

  const allGranted = locationStatus === 'granted' && bluetoothStatus === 'granted';

  // Auto-complete when all granted
  useEffect(() => {
    if (allGranted && visible) {
      const timer = setTimeout(() => {
        onComplete();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [allGranted, visible]);

  return (
    <Modal visible={visible} animationType="slide">
      <View style={permStyles.container}>
        <View style={permStyles.header}>
          <LinearGradient colors={G.gold} style={permStyles.iconWrap}>
            <Ionicons name="shield-checkmark" size={40} color={C.bg} />
          </LinearGradient>
          <Text style={permStyles.title}>Enable Permissions</Text>
          <Text style={permStyles.subtitle}>
            For the best MOTA experience, we need access to your location and Bluetooth.
          </Text>
        </View>

        <View style={permStyles.permissionsList}>
          {/* Location Permission */}
          <View style={permStyles.permissionItem}>
            <View style={permStyles.permissionIcon}>
              <Ionicons name="location" size={24} color={C.gold} />
            </View>
            <View style={permStyles.permissionInfo}>
              <Text style={permStyles.permissionName}>Location</Text>
              <Text style={permStyles.permissionDesc}>
                Required for on-site notifications and wayfinding
              </Text>
            </View>
            {locationStatus === 'pending' ? (
              <TouchableOpacity 
                style={permStyles.enableBtn}
                onPress={requestLocationPermission}
              >
                <Text style={permStyles.enableText}>Enable</Text>
              </TouchableOpacity>
            ) : locationStatus === 'granted' ? (
              <View style={permStyles.grantedBadge}>
                <Ionicons name="checkmark-circle" size={24} color={C.success} />
              </View>
            ) : (
              <TouchableOpacity 
                style={permStyles.settingsBtn}
                onPress={openSettings}
              >
                <Text style={permStyles.settingsText}>Settings</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Bluetooth Permission */}
          <View style={permStyles.permissionItem}>
            <View style={permStyles.permissionIcon}>
              <Ionicons name="bluetooth" size={24} color={C.gold} />
            </View>
            <View style={permStyles.permissionInfo}>
              <Text style={permStyles.permissionName}>Bluetooth</Text>
              <Text style={permStyles.permissionDesc}>
                Required for proximity features and beacons
              </Text>
            </View>
            {bluetoothStatus === 'pending' ? (
              <TouchableOpacity 
                style={permStyles.enableBtn}
                onPress={requestBluetoothPermission}
              >
                <Text style={permStyles.enableText}>Enable</Text>
              </TouchableOpacity>
            ) : bluetoothStatus === 'granted' ? (
              <View style={permStyles.grantedBadge}>
                <Ionicons name="checkmark-circle" size={24} color={C.success} />
              </View>
            ) : (
              <TouchableOpacity 
                style={permStyles.settingsBtn}
                onPress={openSettings}
              >
                <Text style={permStyles.settingsText}>Settings</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={permStyles.notice}>
          <Ionicons name="information-circle" size={18} color={C.textMuted} />
          <Text style={permStyles.noticeText}>
            These permissions are mandatory for accurate on-site notifications and wayfinding within the resort.
          </Text>
        </View>

        {/* Refresh button when showing Settings */}
        {locationStatus === 'denied' && (
          <TouchableOpacity 
            style={permStyles.refreshBtn}
            onPress={checkPermissions}
          >
            <Ionicons name="refresh" size={18} color={C.gold} />
            <Text style={permStyles.refreshText}>I've enabled permissions, check again</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={[
            permStyles.continueBtn,
            !allGranted && permStyles.continueBtnDisabled,
          ]}
          onPress={onComplete}
          disabled={!allGranted}
        >
          <LinearGradient 
            colors={allGranted ? G.gold : ['#555', '#444']} 
            style={permStyles.continueBtnGrad}
          >
            <Text style={[
              permStyles.continueText,
              !allGranted && permStyles.continueTextDisabled,
            ]}>
              {allGranted ? 'Continue to MOTA' : 'Grant All Permissions'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Skip option for development/testing - ALWAYS VISIBLE FOR NOW */}
        <TouchableOpacity 
          style={permStyles.skipBtn}
          onPress={onComplete}
        >
          <Text style={permStyles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const permStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: C.text,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: C.textSec,
    textAlign: 'center',
    lineHeight: 22,
  },
  permissionsList: {
    gap: 16,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 16,
  },
  permissionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: C.cardLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  permissionInfo: {
    flex: 1,
  },
  permissionName: {
    fontSize: 16,
    fontWeight: '600',
    color: C.text,
  },
  permissionDesc: {
    fontSize: 13,
    color: C.textMuted,
    marginTop: 2,
  },
  enableBtn: {
    backgroundColor: C.gold,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  enableText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.bg,
  },
  grantedBadge: {},
  settingsBtn: {
    backgroundColor: C.cardLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  settingsText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.textSec,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: C.cardLight,
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  noticeText: {
    fontSize: 13,
    color: C.textMuted,
    flex: 1,
    lineHeight: 18,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    padding: 12,
  },
  refreshText: {
    fontSize: 14,
    color: C.gold,
    fontWeight: '500',
  },
  continueBtn: {
    marginTop: 'auto',
    marginBottom: 10,
  },
  continueBtnDisabled: {
    opacity: 0.7,
  },
  continueBtnGrad: {
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
  },
  continueText: {
    fontSize: 17,
    fontWeight: '700',
    color: C.bg,
  },
  continueTextDisabled: {
    color: C.textMuted,
  },
  skipBtn: {
    alignItems: 'center',
    padding: 12,
    marginBottom: 20,
  },
  skipText: {
    fontSize: 14,
    color: C.textMuted,
    textDecorationLine: 'underline',
  },
});


// =====================================================
// UPDATED SETTINGS MENU
// =====================================================
export const SettingsMenu = ({ user, onNavigate, onLogout }: {
  user: any;
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}) => {
  const isGuest = user?.accessLevel === 'guest';
  const isInvestor = user?.accessLevel === 'investor';
  const isMember = user?.accessLevel === 'member';
  
  const showAccountDeletion = isMember;

  const settingsItems = [
    {
      section: 'Account',
      items: [
        { icon: 'person-outline', label: 'Edit Profile', screen: 'editProfile' },
        { icon: 'notifications-outline', label: 'Notifications', screen: 'notifications' },
        { icon: 'card-outline', label: 'Payment Methods', screen: 'payment' },
        { icon: 'lock-closed-outline', label: 'Security', screen: 'security' },
      ],
    },
    {
      section: 'Preferences',
      items: [
        { icon: 'language-outline', label: 'Language', screen: 'language', value: 'English' },
        { icon: 'cash-outline', label: 'Currency', screen: 'currency', value: 'USD' },
      ],
    },
    {
      section: 'About',
      items: [
        { icon: 'help-circle-outline', label: 'Help & Support', screen: 'help' },
        { icon: 'document-text-outline', label: 'Privacy Policy', screen: 'privacy' },
        { icon: 'reader-outline', label: 'Terms of Service', screen: 'terms' },
        { icon: 'information-circle-outline', label: 'About MOTA', screen: 'about' },
      ],
    },
  ];

  return (
    <ScrollView style={settingsStyles.container} showsVerticalScrollIndicator={false}>
      {settingsItems.map((section) => (
        <View key={section.section} style={settingsStyles.section}>
          <Text style={settingsStyles.sectionTitle}>{section.section}</Text>
          <View style={settingsStyles.sectionContent}>
            {section.items.map((item, index) => (
              <TouchableOpacity
                key={item.label}
                style={[
                  settingsStyles.menuItem,
                  index === section.items.length - 1 && settingsStyles.menuItemLast,
                ]}
                onPress={() => onNavigate(item.screen)}
              >
                <View style={settingsStyles.menuItemIcon}>
                  <Ionicons name={item.icon as any} size={22} color={C.gold} />
                </View>
                <Text style={settingsStyles.menuItemLabel}>{item.label}</Text>
                {item.value && (
                  <Text style={settingsStyles.menuItemValue}>{item.value}</Text>
                )}
                <Ionicons name="chevron-forward" size={20} color={C.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {showAccountDeletion && (
        <View style={settingsStyles.section}>
          <Text style={settingsStyles.sectionTitle}>Account</Text>
          <View style={settingsStyles.sectionContent}>
            <TouchableOpacity
              style={settingsStyles.menuItem}
              onPress={() => onNavigate('accountDeletion')}
            >
              <View style={[settingsStyles.menuItemIcon, { backgroundColor: `${C.error}20` }]}>
                <Ionicons name="trash-outline" size={22} color={C.error} />
              </View>
              <Text style={[settingsStyles.menuItemLabel, { color: C.error }]}>
                Delete Account
              </Text>
              <Ionicons name="chevron-forward" size={20} color={C.error} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <TouchableOpacity style={settingsStyles.logoutBtn} onPress={onLogout}>
        <Ionicons name="log-out-outline" size={20} color={C.error} />
        <Text style={settingsStyles.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={settingsStyles.version}>MOTA v4.0.0</Text>
    </ScrollView>
  );
};

const settingsStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sectionContent: {
    backgroundColor: C.card,
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.cardLight,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.cardLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemLabel: {
    flex: 1,
    fontSize: 15,
    color: C.text,
  },
  menuItemValue: {
    fontSize: 14,
    color: C.textMuted,
    marginRight: 8,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 10,
    padding: 16,
    backgroundColor: C.card,
    borderRadius: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: C.error,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: C.textMuted,
    marginTop: 20,
    marginBottom: 40,
  },
});


// =====================================================
// ACCOUNT DELETION MODAL
// =====================================================
export const AccountDeletionModal = ({ visible, onClose, onDelete }: {
  visible: boolean;
  onClose: () => void;
  onDelete: (type: 'deactivate' | 'permanent') => void;
}) => {
  const [selectedOption, setSelectedOption] = useState<'deactivate' | 'permanent' | null>(null);
  const [confirmText, setConfirmText] = useState('');

  const handleDelete = () => {
    if (selectedOption === 'permanent' && confirmText !== 'DELETE') {
      Alert.alert('Confirmation Required', 'Please type DELETE to confirm permanent deletion.');
      return;
    }
    
    if (selectedOption) {
      onDelete(selectedOption);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={deleteStyles.overlay}>
        <View style={deleteStyles.modal}>
          <View style={deleteStyles.header}>
            <Ionicons name="warning" size={48} color={C.warning} />
            <Text style={deleteStyles.title}>Delete Account</Text>
            <Text style={deleteStyles.subtitle}>
              Choose how you'd like to proceed with your account
            </Text>
          </View>

          <View style={deleteStyles.options}>
            <TouchableOpacity
              style={[
                deleteStyles.option,
                selectedOption === 'deactivate' && deleteStyles.optionSelected,
              ]}
              onPress={() => setSelectedOption('deactivate')}
            >
              <View style={deleteStyles.optionRadio}>
                {selectedOption === 'deactivate' && (
                  <View style={deleteStyles.optionRadioInner} />
                )}
              </View>
              <View style={deleteStyles.optionContent}>
                <Text style={deleteStyles.optionTitle}>Take a Break</Text>
                <Text style={deleteStyles.optionDesc}>
                  Temporarily deactivate your account. Your data will be preserved
                  and you can reactivate anytime by logging in.
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                deleteStyles.option,
                deleteStyles.optionDanger,
                selectedOption === 'permanent' && deleteStyles.optionSelectedDanger,
              ]}
              onPress={() => setSelectedOption('permanent')}
            >
              <View style={[deleteStyles.optionRadio, deleteStyles.optionRadioDanger]}>
                {selectedOption === 'permanent' && (
                  <View style={[deleteStyles.optionRadioInner, deleteStyles.optionRadioInnerDanger]} />
                )}
              </View>
              <View style={deleteStyles.optionContent}>
                <Text style={[deleteStyles.optionTitle, { color: C.error }]}>
                  Delete Permanently
                </Text>
                <Text style={deleteStyles.optionDesc}>
                  Permanently delete your account and all associated data.
                  This action cannot be undone.
                </Text>
              </View>
            </TouchableOpacity>

            {selectedOption === 'permanent' && (
              <View style={deleteStyles.confirmSection}>
                <Text style={deleteStyles.confirmLabel}>
                  Type <Text style={{ color: C.error, fontWeight: '700' }}>DELETE</Text> to confirm:
                </Text>
                <TextInput
                  style={deleteStyles.confirmInput}
                  value={confirmText}
                  onChangeText={setConfirmText}
                  placeholder="DELETE"
                  placeholderTextColor={C.textMuted}
                  autoCapitalize="characters"
                />
              </View>
            )}
          </View>

          <View style={deleteStyles.footer}>
            <TouchableOpacity style={deleteStyles.cancelBtn} onPress={onClose}>
              <Text style={deleteStyles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                deleteStyles.deleteBtn,
                !selectedOption && deleteStyles.deleteBtnDisabled,
              ]}
              onPress={handleDelete}
              disabled={!selectedOption}
            >
              <Text style={deleteStyles.deleteText}>
                {selectedOption === 'deactivate' ? 'Deactivate' : 'Delete Account'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const deleteStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: C.bg,
    borderRadius: 20,
    overflow: 'hidden',
  },
  header: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: C.cardLight,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: C.text,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    color: C.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
  options: {
    padding: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: {
    borderColor: C.gold,
    backgroundColor: `${C.gold}10`,
  },
  optionDanger: {},
  optionSelectedDanger: {
    borderColor: C.error,
    backgroundColor: `${C.error}10`,
  },
  optionRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: C.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  optionRadioDanger: {
    borderColor: C.error,
  },
  optionRadioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: C.gold,
  },
  optionRadioInnerDanger: {
    backgroundColor: C.error,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: C.text,
    marginBottom: 4,
  },
  optionDesc: {
    fontSize: 13,
    color: C.textMuted,
    lineHeight: 18,
  },
  confirmSection: {
    marginTop: 8,
  },
  confirmLabel: {
    fontSize: 14,
    color: C.textSec,
    marginBottom: 8,
  },
  confirmInput: {
    backgroundColor: C.card,
    borderRadius: 10,
    padding: 14,
    color: C.text,
    fontSize: 16,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: C.error,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: C.cardLight,
  },
  cancelBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: C.cardLight,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: C.textSec,
  },
  deleteBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: C.error,
    alignItems: 'center',
  },
  deleteBtnDisabled: {
    opacity: 0.5,
  },
  deleteText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});


export default {
  NetGainCard,
  FavoritesSection,
  ProfilePicture,
  PermissionsModal,
  SettingsMenu,
  AccountDeletionModal,
};
