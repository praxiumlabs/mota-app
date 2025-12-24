/**
 * Login Screen
 * Full screen login with Demo Accounts for testing
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

// Colors
const C = {
  bg: '#0A122A',
  card: '#101C40',
  cardLight: '#1A2A50',
  gold: '#D4AF37',
  goldLight: '#E8C547',
  goldMuted: 'rgba(212,175,55,0.15)',
  text: '#F5F5F5',
  textSec: '#A0AEC0',
  textMuted: '#718096',
  border: '#2D3A5C',
  success: '#48BB78',
  error: '#FC8181',
};

const G = {
  dark: ['#0A122A', '#0D1528'] as const,
  gold: ['#E8C547', '#D4AF37', '#B8952F'] as const,
};

// Demo accounts data
const DEMO_ACCOUNTS = [
  { email: 'demo@demo.com', password: 'demo123', label: 'Member', icon: 'person', color: '#4299E1' },
  { email: 'guest@demo.com', password: 'demo123', label: 'Guest', icon: 'eye', color: '#A0AEC0' },
  { email: 'investor@demo.com', password: 'demo123', label: 'Gold', icon: 'trophy', color: '#D4AF37' },
  { email: 'platinum@demo.com', password: 'demo123', label: 'Platinum', icon: 'medal', color: '#E5E4E2' },
  { email: 'diamond@demo.com', password: 'demo123', label: 'Diamond', icon: 'diamond', color: '#81D4FA' },
];

interface Props {
  onBack: () => void;
  onSwitchToSignup: () => void;
}

export default function LoginScreen({ onBack, onSwitchToSignup }: Props) {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        onBack();
      } else {
        Alert.alert('Login Failed', result.error || 'Invalid credentials');
      }
    } catch (err: any) {
      Alert.alert('Login Failed', err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const selectDemoAccount = (demo: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(demo.email);
    setPassword(demo.password);
  };

  return (
    <LinearGradient colors={G.dark} style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView 
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onBack} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={C.text} />
            </TouchableOpacity>
          </View>

          {/* Logo & Title */}
          <View style={styles.logoSection}>
            <LinearGradient colors={G.gold} style={styles.logoCircle}>
              <Ionicons name="diamond" size={40} color={C.bg} />
            </LinearGradient>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to your MOTA account</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color={C.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={C.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color={C.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor={C.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={C.textMuted} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
              <LinearGradient colors={G.gold} style={styles.loginBtn}>
                {loading ? (
                  <ActivityIndicator color={C.bg} />
                ) : (
                  <>
                    <Text style={styles.loginBtnText}>Sign In</Text>
                    <Ionicons name="arrow-forward" size={20} color={C.bg} style={{ marginLeft: 8 }} />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* DEMO ACCOUNTS SECTION */}
            {/* ═══════════════════════════════════════════════════════ */}
            <View style={styles.demoSection}>
              <View style={styles.demoHeader}>
                <View style={styles.demoLine} />
                <Text style={styles.demoTitle}>Demo Accounts</Text>
                <View style={styles.demoLine} />
              </View>
              
              <View style={styles.demoGrid}>
                {DEMO_ACCOUNTS.map((demo, i) => (
                  <TouchableOpacity 
                    key={i}
                    style={[styles.demoBtn, { borderColor: demo.color + '60' }]}
                    onPress={() => selectDemoAccount(demo)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.demoIconWrap, { backgroundColor: demo.color + '20' }]}>
                      <Ionicons name={demo.icon as any} size={16} color={demo.color} />
                    </View>
                    <Text style={[styles.demoBtnText, { color: demo.color }]}>{demo.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <Text style={styles.demoHint}>
                Tap to auto-fill credentials, then Sign In
              </Text>
            </View>
            {/* ═══════════════════════════════════════════════════════ */}

          </View>

          {/* Switch to Signup */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={onSwitchToSignup}>
              <Text style={styles.footerLink}>Sign Up</Text>
            </TouchableOpacity>
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
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: C.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: C.textSec,
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: C.text,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 16,
    color: C.text,
  },
  eyeBtn: {
    padding: 8,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotText: {
    fontSize: 14,
    color: C.gold,
    fontWeight: '500',
  },
  loginBtn: {
    flexDirection: 'row',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: C.bg,
  },
  
  // ═══════════════════════════════════════════════════════
  // DEMO SECTION STYLES
  // ═══════════════════════════════════════════════════════
  demoSection: {
    marginTop: 32,
    paddingTop: 24,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  demoLine: {
    flex: 1,
    height: 1,
    backgroundColor: C.border,
  },
  demoTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginHorizontal: 12,
  },
  demoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  demoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: C.card,
    borderWidth: 1,
    minWidth: 100,
  },
  demoIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  demoBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  demoHint: {
    fontSize: 11,
    color: C.textMuted,
    textAlign: 'center',
    marginTop: 12,
  },
  // ═══════════════════════════════════════════════════════

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 14,
    color: C.textSec,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
    color: C.gold,
  },
});