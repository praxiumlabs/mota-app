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
import { Ionicons } from '@expo/vector-icons';
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
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
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
            style={styles.submitBtn} 
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#E8C547', '#D4AF37', '#B8952F']}
              style={styles.submitGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color={C.bg} />
              ) : (
                <>
                  <Text style={styles.submitText}>
                    {mode === 'signup' ? 'Create Account' : 'Sign In'}
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color={C.bg} style={{ marginLeft: 8 }} />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Toggle Mode */}
        <TouchableOpacity 
          style={styles.toggleBtn}
          onPress={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
        >
          <Text style={styles.toggleText}>
            {mode === 'signup' 
              ? 'Already have an account? ' 
              : "Don't have an account? "
            }
            <Text style={styles.toggleLink}>
              {mode === 'signup' ? 'Sign In' : 'Sign Up'}
            </Text>
          </Text>
        </TouchableOpacity>

        {/* Demo Accounts Info */}
        <View style={styles.demoInfo}>
          <Text style={styles.demoTitle}>Demo Accounts</Text>
          <Text style={styles.demoText}>Member: member@demo.com / demo123</Text>
          <Text style={styles.demoText}>Investor: investor@demo.com / demo123</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: C.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
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
    borderRadius: 12,
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
    marginBottom: 20,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: C.text,
  },
  submitBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 8,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '700',
    color: C.bg,
  },
  toggleBtn: {
    alignItems: 'center',
    marginBottom: 24,
  },
  toggleText: {
    fontSize: 14,
    color: C.textSec,
  },
  toggleLink: {
    color: C.gold,
    fontWeight: '600',
  },
  demoInfo: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
  },
  demoTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: C.textSec,
    marginBottom: 8,
  },
  demoText: {
    fontSize: 12,
    color: C.textMuted,
    marginBottom: 4,
  },
});
