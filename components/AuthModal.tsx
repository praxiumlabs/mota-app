/**
 * MOTA Auth Modal
 * 
 * Bottom sheet modal for Sign In / Sign Up
 * - Slides up from bottom (~70% screen height)
 * - Dismissible by tapping outside or drag
 * - Shows benefits of creating a FREE account
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

// Colors
const C = {
  bg: '#0A122A',
  card: '#101C40',
  gold: '#D4AF37',
  goldLight: '#E8C547',
  goldMuted: 'rgba(212,175,55,0.15)',
  text: '#F5F5F5',
  textSec: '#A0AEC0',
  textMuted: '#718096',
  success: '#48BB78',
  error: '#FC8181',
};

interface AuthModalProps {
  onClose: () => void;
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    if (mode === 'signup' && !name.trim()) {
      Alert.alert('Missing Name', 'Please enter your name');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Missing Email', 'Please enter your email');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Missing Password', 'Please enter a password');
      return;
    }

    setLoading(true);
    
    try {
      if (mode === 'signup') {
        const result = await register(name.trim(), email.trim(), password);
        if (result.success) {
          Alert.alert('Welcome to MOTA!', 'Your free account has been created.', [
            { text: 'Get Started', onPress: onClose }
          ]);
        } else {
          Alert.alert('Sign Up Failed', result.error || 'Please try again');
        }
      } else {
        const result = await login(email.trim(), password);
        if (result.success) {
          onClose();
        } else {
          Alert.alert('Sign In Failed', result.error || 'Please check your credentials');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const memberBenefits = [
    { icon: 'calendar', text: 'Book restaurants & activities' },
    { icon: 'heart', text: 'Save your favorites' },
    { icon: 'ticket', text: 'RSVP to exclusive events' },
    { icon: 'gift', text: 'Receive special offers' },
  ];

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconWrap}>
            <LinearGradient 
              colors={['#E8C547', '#D4AF37', '#B8952F']} 
              style={styles.iconGradient}
            >
              <MaterialCommunityIcons name="diamond-stone" size={32} color={C.bg} />
            </LinearGradient>
          </View>
          <Text style={styles.title}>
            {mode === 'signup' ? 'Create Free Account' : 'Welcome Back'}
          </Text>
          <Text style={styles.subtitle}>
            {mode === 'signup' 
              ? 'Join MOTA to unlock exclusive features'
              : 'Sign in to your MOTA account'
            }
          </Text>
        </View>

        {/* Benefits (only show on signup) */}
        {mode === 'signup' && (
          <View style={styles.benefits}>
            {memberBenefits.map((benefit, index) => (
              <View key={index} style={styles.benefitRow}>
                <View style={styles.benefitIcon}>
                  <Ionicons name={benefit.icon as any} size={18} color={C.gold} />
                </View>
                <Text style={styles.benefitText}>{benefit.text}</Text>
                <Ionicons name="checkmark-circle" size={18} color={C.success} />
              </View>
            ))}
          </View>
        )}

        {/* Form */}
        <View style={styles.form}>
          {mode === 'signup' && (
            <View style={styles.inputWrap}>
              <Ionicons name="person-outline" size={20} color={C.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor={C.textMuted}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={styles.inputWrap}>
            <Ionicons name="mail-outline" size={20} color={C.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor={C.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed-outline" size={20} color={C.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={C.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons 
                name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                size={20} 
                color={C.textMuted} 
              />
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            onPress={handleSubmit} 
            disabled={loading}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#E8C547', '#D4AF37', '#B8952F']}
              style={styles.submitBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color={C.bg} />
              ) : (
                <>
                  <Text style={styles.submitBtnText}>
                    {mode === 'signup' ? 'Create Free Account' : 'Sign In'}
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color={C.bg} />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Free Badge (signup only) */}
          {mode === 'signup' && (
            <View style={styles.freeBadge}>
              <Ionicons name="checkmark-circle" size={16} color={C.success} />
              <Text style={styles.freeBadgeText}>100% FREE • No credit card required</Text>
            </View>
          )}
        </View>

        {/* Toggle Mode */}
        <View style={styles.toggleWrap}>
          <Text style={styles.toggleText}>
            {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}
          </Text>
          <TouchableOpacity onPress={() => setMode(mode === 'signup' ? 'signin' : 'signup')}>
            <Text style={styles.toggleLink}>
              {mode === 'signup' ? 'Sign In' : 'Create Free Account'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconWrap: {
    marginBottom: 16,
  },
  iconGradient: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: C.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: C.textSec,
    textAlign: 'center',
  },
  benefits: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  benefitIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.goldMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  benefitText: {
    flex: 1,
    fontSize: 14,
    color: C.text,
    fontWeight: '500',
  },
  form: {
    marginBottom: 24,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 15,
    color: C.text,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    marginTop: 8,
  },
  submitBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: C.bg,
    marginRight: 8,
  },
  freeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  freeBadgeText: {
    fontSize: 13,
    color: C.success,
    marginLeft: 6,
    fontWeight: '500',
  },
  toggleWrap: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 14,
    color: C.textSec,
  },
  toggleLink: {
    fontSize: 14,
    color: C.gold,
    fontWeight: '600',
    marginLeft: 6,
  },
});
