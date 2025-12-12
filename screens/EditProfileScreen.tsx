/**
 * Edit Profile Screen
 * Update user profile with backend sync
 */

import React, { useState } from 'react';
import {
  StyleSheet, View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { C, G } from '../constants/theme';
import api from '../services/api';

interface Props {
  onBack: () => void;
}

export default function EditProfileScreen({ onBack }: Props) {
  const insets = useSafeAreaInsets();
  const { user, refreshUser } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    setLoading(true);
    try {
      await api.put(`/users/${user?._id}`, {
        name: name.trim(),
        phone: phone.trim(),
      });
      
      // Refresh user data in context
      if (refreshUser) {
        await refreshUser();
      }
      
      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: onBack }
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await api.put(`/users/${user?._id}/password`, {
        currentPassword,
        newPassword,
      });
      
      Alert.alert('Success', 'Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setChangingPassword(false);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getTierGradient = () => {
    if (user?.investorTier === 'diamond') return G.diamond;
    if (user?.investorTier === 'platinum') return G.platinum;
    return G.gold;
  };

  return (
    <LinearGradient colors={G.dark} style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 20 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onBack} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={C.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Profile</Text>
            <View style={{ width: 44 }} />
          </View>

          {/* Avatar */}
          <View style={styles.avatarSection}>
            <LinearGradient colors={getTierGradient()} style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials()}</Text>
            </LinearGradient>
            <TouchableOpacity style={styles.changePhotoBtn}>
              <Ionicons name="camera-outline" size={18} color={C.gold} />
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
          </View>

          {/* Account Info Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color={C.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your name"
                  placeholderTextColor={C.textMuted}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={[styles.inputWrapper, styles.inputDisabled]}>
                <Ionicons name="mail-outline" size={20} color={C.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: C.textMuted }]}
                  value={email}
                  editable={false}
                />
                <Ionicons name="lock-closed-outline" size={16} color={C.textMuted} style={{ marginRight: 16 }} />
              </View>
              <Text style={styles.inputHint}>Email cannot be changed</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="call-outline" size={20} color={C.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your phone number"
                  placeholderTextColor={C.textMuted}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity onPress={handleSaveProfile} disabled={loading} activeOpacity={0.85}>
              <LinearGradient colors={G.gold} style={styles.saveBtn}>
                {loading && !changingPassword ? (
                  <ActivityIndicator color={C.bg} />
                ) : (
                  <>
                    <Text style={styles.saveBtnText}>Save Changes</Text>
                    <Ionicons name="checkmark" size={20} color={C.bg} style={{ marginLeft: 8 }} />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Change Password Section */}
          <View style={styles.section}>
            <TouchableOpacity 
              style={styles.sectionHeader}
              onPress={() => setChangingPassword(!changingPassword)}
            >
              <Text style={styles.sectionTitle}>Change Password</Text>
              <Ionicons 
                name={changingPassword ? 'chevron-up' : 'chevron-down'} 
                size={20} 
                color={C.textSec} 
              />
            </TouchableOpacity>

            {changingPassword && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Current Password</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="lock-closed-outline" size={20} color={C.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter current password"
                      placeholderTextColor={C.textMuted}
                      value={currentPassword}
                      onChangeText={setCurrentPassword}
                      secureTextEntry={!showPassword}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>New Password</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="lock-closed-outline" size={20} color={C.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter new password"
                      placeholderTextColor={C.textMuted}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                      <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={C.textMuted} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Confirm New Password</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="lock-closed-outline" size={20} color={C.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Confirm new password"
                      placeholderTextColor={C.textMuted}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showPassword}
                    />
                  </View>
                </View>

                <TouchableOpacity onPress={handleChangePassword} disabled={loading} activeOpacity={0.85}>
                  <View style={styles.changePasswordBtn}>
                    {loading && changingPassword ? (
                      <ActivityIndicator color={C.gold} />
                    ) : (
                      <>
                        <Ionicons name="key-outline" size={18} color={C.gold} />
                        <Text style={styles.changePasswordBtnText}>Update Password</Text>
                      </>
                    )}
                  </View>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Account Status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Status</Text>
            <View style={styles.statusCard}>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Access Level</Text>
                <View style={[styles.statusBadge, { backgroundColor: C.goldMuted }]}>
                  <Text style={[styles.statusBadgeText, { color: C.gold }]}>
                    {user?.accessLevel === 'investor' ? 'Investor' : user?.accessLevel === 'member' ? 'Member' : 'Guest'}
                  </Text>
                </View>
              </View>
              {user?.investorTier && (
                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>Investor Tier</Text>
                  <View style={[styles.statusBadge, { backgroundColor: 'rgba(72,187,120,0.2)' }]}>
                    <Ionicons name="diamond" size={14} color={C.success} />
                    <Text style={[styles.statusBadgeText, { color: C.success, marginLeft: 4 }]}>
                      {user.investorTier.charAt(0).toUpperCase() + user.investorTier.slice(1)}
                    </Text>
                  </View>
                </View>
              )}
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Member Since</Text>
                <Text style={styles.statusValue}>
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
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
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: C.bg,
  },
  changePhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: C.goldMuted,
  },
  changePhotoText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.gold,
    marginLeft: 6,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: C.textSec,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  inputDisabled: {
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  inputIcon: {
    marginLeft: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 15,
    color: C.text,
  },
  inputHint: {
    fontSize: 11,
    color: C.textMuted,
    marginTop: 6,
    marginLeft: 4,
  },
  eyeBtn: {
    padding: 14,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 8,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: C.bg,
  },
  changePasswordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.gold,
    marginTop: 8,
  },
  changePasswordBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.gold,
    marginLeft: 8,
  },
  statusCard: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  statusLabel: {
    fontSize: 14,
    color: C.textSec,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
    color: C.text,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
