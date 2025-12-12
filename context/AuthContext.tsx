/**
 * MOTA Auth Context
 * Manages user authentication state with investor tiers
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

// ============================================
// TYPES
// ============================================
export type AccessLevel = 'guest' | 'member' | 'investor';

export type InvestorTier = 'gold' | 'platinum' | 'diamond';

export interface User {
  _id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  accessLevel: AccessLevel;
  investorTier?: InvestorTier | null;
  investmentAmount?: number;
  portfolioValue?: number;
  memberSince?: string;
  favorites?: string[];
  biometricEnabled?: boolean;
}

export interface TierConfigType {
  id: string;
  name: string;
  investment: string;
  phase: string;
  color: string;
  gradient: readonly string[];
  benefits: string[];
}

// ============================================
// TIER CONFIGURATIONS
// ============================================
export const TierConfig: Record<InvestorTier, TierConfigType> = {
  gold: {
    id: 'gold',
    name: 'Gold',
    investment: '$2.5M',
    phase: 'Phase 2 Investment',
    color: '#D4AF37',
    gradient: ['#E8C547', '#D4AF37', '#B8952F'],
    benefits: [
      'Complimentary chips: $50K annually',
      '7 complimentary nights per year',
      '2 business-class plane tickets annually',
      'Priority reservations & concierge',
      'Exclusive event access',
      'Annual membership renewal',
      'Flexible credit line of $2,500,000',
    ]
  },
  platinum: {
    id: 'platinum',
    name: 'Platinum',
    investment: '$15M',
    phase: 'Phase 2 Investment',
    color: '#E5E4E2',
    gradient: ['#E8E8E8', '#E5E4E2', '#D4D4D4'],
    benefits: [
      'All Gold benefits plus:',
      'Complimentary chips: $300K annually',
      '30 complimentary nights per year',
      'Private jet access (shared)',
      'VIP gaming floor access',
      'Personal account manager',
      'Priority villa reservations',
      'Flexible credit line of $15,000,000',
    ]
  },
  diamond: {
    id: 'diamond',
    name: 'Diamond',
    investment: '$70M',
    phase: 'Phase 2 Investment',
    color: '#B9F2FF',
    gradient: ['#E0F7FA', '#B9F2FF', '#81D4FA'],
    benefits: [
      'All Platinum benefits plus:',
      'Complimentary chips: $1.4M annually',
      '90+ complimentary nights per year',
      'Dedicated private aircraft',
      'Resort ownership privileges',
      '24/7 dedicated concierge team',
      'Bespoke experience curation',
      'Flexible credit line of $70,000,000',
    ]
  },
};

export const TierThresholds: Record<InvestorTier, number> = {
  gold: 2500000,
  platinum: 15000000,
  diamond: 70000000,
};

// ============================================
// CONTEXT
// ============================================
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isGuest: boolean;
  isInvestor: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  getDiscountPercent: () => number;
  getNextTierInfo: () => any;
  biometricType: string | null;
  biometricAvailable: boolean;
  enableBiometric: () => Promise<boolean>;
  disableBiometric: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// PROVIDER
// ============================================
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [biometricType, setBiometricType] = useState<string | null>(null);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    loadUser();
    checkBiometricSupport();
  }, []);

  const loadUser = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user');
      
      if (token && userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkBiometricSupport = async () => {
    // In production, use expo-local-authentication
    setBiometricAvailable(true);
    setBiometricType('faceId');
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await api.login(email, password);
      
      if (response.token && response.user) {
        await AsyncStorage.setItem('token', response.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
        return { success: true };
      }
      
      return { success: false, error: response.error || 'Login failed' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await api.register(name, email, password);
      
      if (response.token && response.user) {
        await AsyncStorage.setItem('token', response.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
        return { success: true };
      }
      
      return { success: false, error: response.error || 'Registration failed' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const refreshUser = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const userData = await api.getProfile();
        if (userData) {
          await AsyncStorage.setItem('user', JSON.stringify(userData));
          setUser(userData);
        }
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const getDiscountPercent = (): number => {
    if (!user?.investorTier) return 0;
    
    const discounts: Record<InvestorTier, number> = {
      gold: 10,
      platinum: 20,
      diamond: 30,
    };
    
    return discounts[user.investorTier] || 0;
  };

  const getNextTierInfo = () => {
    if (!user?.investorTier) return null;
    
    const tiers: InvestorTier[] = ['gold', 'platinum', 'diamond'];
    const currentIndex = tiers.indexOf(user.investorTier);
    
    if (currentIndex === -1 || currentIndex === tiers.length - 1) return null;
    
    const nextTier = tiers[currentIndex + 1];
    const currentAmount = user.investmentAmount || 0;
    const nextThreshold = TierThresholds[nextTier];
    const progress = (currentAmount / nextThreshold) * 100;
    
    return {
      nextTierName: TierConfig[nextTier].name,
      amountToNext: nextThreshold - currentAmount,
      progress: Math.min(progress, 100),
      benefits: TierConfig[nextTier].benefits,
    };
  };

  const enableBiometric = async (): Promise<boolean> => {
    // In production, implement actual biometric authentication
    if (user) {
      const updatedUser = { ...user, biometricEnabled: true };
      setUser(updatedUser);
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      return true;
    }
    return false;
  };

  const disableBiometric = async () => {
    if (user) {
      const updatedUser = { ...user, biometricEnabled: false };
      setUser(updatedUser);
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const isGuest = !user;
  const isInvestor = user?.accessLevel === 'investor';

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isGuest,
        isInvestor,
        login,
        register,
        logout,
        refreshUser,
        getDiscountPercent,
        getNextTierInfo,
        biometricType,
        biometricAvailable,
        enableBiometric,
        disableBiometric,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
