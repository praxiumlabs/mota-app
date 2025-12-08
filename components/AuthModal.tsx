/**
 * MOTA Auth Modal Content
 * Sign up / Login form with biometric support
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth, MemberBenefits } from '../context/AuthContext';

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

interface AuthModalProps {
  onClose: () => void;
  triggerAction?: string;
  initialMode?: 'login' | 'signup';
}

export function AuthModal({ onClose, triggerAction, initialMode = 'signup' }: AuthModalProps) {
  const {
    login,
    loginWithBiometric,
    register,
    isLoading,
    error,
    biometricType,
    biometricAvailable,
    lastLoggedInEmail,
    canUseBiometric,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [enableBiometric, setEnableBiometric] = useState(true);
  const [localError, setLocalError] = useState('');
  const [canBiometric, setCanBiometric] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);

  useEffect(() => {
    checkBiometric();
  }, []);

  const checkBiometric = async () => {
    const can = await canUseBiometric();
    setCanBiometric(can);
  };

  const handleSubmit = async () => {
    setLocalError('');

    if (mode === 'signup') {
      if (!name.trim() || !email.trim() || !password) {
        setLocalError('Please fill in all fields');
        return;
      }
      if (password.length < 6) {
        setLocalError('Password must be at least 6 characters');
        return;
      }
      const result = await register(name.trim(), email.trim().toLowerCase(), password, enableBiometric);
      if (result.success) {
        onClose();
      } else {
        setLocalError(result.error || 'Registration failed');
      }
    } else {
      if (!email.trim() || !password) {
        setLocalError('Please fill in all fields');
        return;
      }
      const result = await login(email.trim().toLowerCase(), password);
      if (result.success) {
        onClose();
      } else {
        setLocalError(result.error || 'Login failed');
      }
    }
  };

  const handleBiometricLogin = async () => {
    setBiometricLoading(true);
    setLocalError('');
    
    const result = await loginWithBiometric();
    
    setBiometricLoading(false);
    
    if (result.success) {
      onClose();
    } else {
      setLocalError(result.error || 'Biometric authentication failed');
    }
  };

  const fillDemo = (type: 'member' | 'gold') => {
    setMode('login');
    if (type === 'member') {
      setEmail('member@mota.com');
      setPassword('member123');
    } else {
      setEmail('gold@mota.com');
      setPassword('gold123');
    }
  };

  const BiometricIcon = biometricType === 'faceId' ? 'face-recognition' : 'fingerprint';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <MaterialCommunityIcons name="diamond-stone" size={32} color={Colors.gold} />
        <Text style={styles.title}>
          {mode === 'signup' ? 'Create Free Account' : 'Welcome Back'}
        </Text>
        <Text style={styles.subtitle}>
          {triggerAction
            ? `Sign ${mode === 'signup' ? 'up' : 'in'} to ${triggerAction}`
            : 'Access all MOTA features'}
        </Text>
      </View>

      {/* Biometric Login (for returning users) */}
      {mode === 'login' && canBiometric && biometricAvailable && (
        <>
          <Pressable
            style={styles.biometricButton}
            onPress={handleBiometricLogin}
            disabled={biometricLoading}
          >
            <View style={styles.biometricIconWrapper}>
              {biometricLoading ? (
                <ActivityIndicator color={Colors.gold} />
              ) : (
                <MaterialCommunityIcons name={BiometricIcon} size={36} color={Colors.gold} />
              )}
            </View>
            <Text style={styles.biometricLabel}>
              {biometricLoading
                ? 'Verifying...'
                : `Login with ${biometricType === 'faceId' ? 'Face ID' : 'Fingerprint'}`}
            </Text>
            <View style={styles.biometricSecure}>
              <Feather name="shield" size={12} color={Colors.success} />
              <Text style={styles.biometricSecureText}>Secure & Private</Text>
            </View>
          </Pressable>

          <Text style={styles.biometricHint}>
            Quick login as {lastLoggedInEmail?.split('@')[0]}
          </Text>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or use password</Text>
            <View style={styles.dividerLine} />
          </View>
        </>
      )}

      {/* Benefits List (signup mode) */}
      {mode === 'signup' && (
        <View style={styles.benefitsList}>
          <Text style={styles.benefitsLabel}>✨ 100% FREE - Unlock these features:</Text>
          {MemberBenefits.map((benefit, idx) => (
            <View key={idx} style={styles.benefitItem}>
              <Feather name="check" size={16} color={Colors.success} />
              <Text style={styles.benefitText}>{benefit.title}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Error Message */}
      {(error || localError) && (
        <View style={styles.errorBox}>
          <Feather name="x-circle" size={16} color={Colors.error} />
          <Text style={styles.errorText}>{error || localError}</Text>
        </View>
      )}

      {/* Name Input (signup only) */}
      {mode === 'signup' && (
        <View style={styles.inputContainer}>
          <Feather name="user" size={18} color={Colors.mutedGrey} />
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor={Colors.mutedGrey}
            value={name}
            onChangeText={(text) => {
              setName(text);
              setLocalError('');
            }}
            autoCapitalize="words"
          />
        </View>
      )}

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <Feather name="mail" size={18} color={Colors.mutedGrey} />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={Colors.mutedGrey}
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setLocalError('');
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <Feather name="lock" size={18} color={Colors.mutedGrey} />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={Colors.mutedGrey}
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setLocalError('');
          }}
          secureTextEntry={!showPassword}
        />
        <Pressable onPress={() => setShowPassword(!showPassword)}>
          <Feather
            name={showPassword ? 'eye-off' : 'eye'}
            size={18}
            color={Colors.mutedGrey}
          />
        </Pressable>
      </View>

      {/* Biometric Toggle (signup only) */}
      {mode === 'signup' && biometricAvailable && (
        <Pressable
          style={styles.biometricToggle}
          onPress={() => setEnableBiometric(!enableBiometric)}
        >
          <View style={styles.biometricToggleInfo}>
            <MaterialCommunityIcons
              name={BiometricIcon}
              size={20}
              color={enableBiometric ? Colors.gold : Colors.mutedGrey}
            />
            <View style={styles.biometricToggleText}>
              <Text style={styles.biometricToggleLabel}>
                Enable {biometricType === 'faceId' ? 'Face ID' : 'Fingerprint'} Login
              </Text>
              <Text style={styles.biometricToggleHint}>Quick & secure sign in</Text>
            </View>
          </View>
          <Feather
            name={enableBiometric ? 'toggle-right' : 'toggle-left'}
            size={28}
            color={enableBiometric ? Colors.gold : Colors.mutedGrey}
          />
        </Pressable>
      )}

      {/* Submit Button */}
      <Pressable
        style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        <LinearGradient
          colors={[Colors.gold, Colors.goldDark]}
          style={styles.submitButtonGradient}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.deepNavy} />
          ) : (
            <Text style={styles.submitButtonText}>
              {mode === 'signup' ? 'Create Free Account' : 'Sign In'}
            </Text>
          )}
        </LinearGradient>
      </Pressable>

      {/* Switch Mode */}
      <Text style={styles.switchText}>
        {mode === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
        <Text
          style={styles.switchLink}
          onPress={() => {
            setMode(mode === 'signup' ? 'login' : 'signup');
            setLocalError('');
          }}
        >
          {mode === 'signup' ? 'Sign In' : 'Sign Up Free'}
        </Text>
      </Text>

      {/* Demo Accounts */}
      <View style={styles.demoSection}>
        <Text style={styles.demoLabel}>Quick Demo:</Text>
        <View style={styles.demoButtons}>
          <Pressable style={styles.demoButton} onPress={() => fillDemo('member')}>
            <Feather name="star" size={14} color={Colors.blue} />
            <Text style={[styles.demoButtonText, { color: Colors.blue }]}>Member</Text>
          </Pressable>
          <Pressable style={styles.demoButtonGold} onPress={() => fillDemo('gold')}>
            <Feather name="award" size={14} color={Colors.gold} />
            <Text style={[styles.demoButtonText, { color: Colors.gold }]}>Investor</Text>
          </Pressable>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.white,
    marginTop: 12,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.softGrey,
    textAlign: 'center',
  },

  // Biometric
  biometricButton: {
    alignItems: 'center',
    backgroundColor: Colors.cardElevated,
    borderRadius: 16,
    padding: 24,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  biometricIconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.goldSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  biometricLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.gold,
    marginBottom: 8,
  },
  biometricSecure: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  biometricSecureText: {
    fontSize: 11,
    color: Colors.success,
    marginLeft: 4,
  },
  biometricHint: {
    fontSize: 12,
    color: Colors.mutedGrey,
    textAlign: 'center',
    marginBottom: 16,
  },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.mutedGrey,
  },
  dividerText: {
    fontSize: 13,
    color: Colors.mutedGrey,
    marginHorizontal: 16,
  },

  // Benefits
  benefitsList: {
    backgroundColor: Colors.cardElevated,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  benefitsLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.gold,
    marginBottom: 10,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  benefitText: {
    fontSize: 13,
    color: Colors.white,
    marginLeft: 10,
  },

  // Error
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: Colors.error,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    color: Colors.error,
    marginLeft: 8,
    flex: 1,
  },

  // Inputs
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardElevated,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 15,
    color: Colors.white,
  },

  // Biometric Toggle
  biometricToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.cardElevated,
    borderRadius: 12,
    padding: 14,
    marginBottom: 18,
  },
  biometricToggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  biometricToggleText: {
    marginLeft: 12,
  },
  biometricToggleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  biometricToggleHint: {
    fontSize: 11,
    color: Colors.mutedGrey,
    marginTop: 2,
  },

  // Submit Button
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.deepNavy,
  },

  // Switch Mode
  switchText: {
    textAlign: 'center',
    fontSize: 14,
    color: Colors.softGrey,
    marginTop: 20,
  },
  switchLink: {
    color: Colors.gold,
    fontWeight: '600',
  },

  // Demo
  demoSection: {
    marginTop: 24,
    backgroundColor: Colors.cardElevated,
    borderRadius: 12,
    padding: 14,
  },
  demoLabel: {
    fontSize: 12,
    color: Colors.mutedGrey,
    textAlign: 'center',
    marginBottom: 10,
  },
  demoButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  demoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.cardDark,
    borderWidth: 1,
    borderColor: Colors.blue,
    borderRadius: 8,
    paddingVertical: 10,
  },
  demoButtonGold: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.cardDark,
    borderWidth: 1,
    borderColor: Colors.gold,
    borderRadius: 8,
    paddingVertical: 10,
  },
  demoButtonText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default AuthModal;
