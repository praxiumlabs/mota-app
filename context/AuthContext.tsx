/**
 * MOTA Authentication Context
 * Manages user authentication, access levels, and investor tiers
 * 
 * TIERS: Gold (entry) → Platinum → Diamond → Black → Founders
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

// ============================================
// TYPES & CONSTANTS
// ============================================

export const AccessLevel = {
  GUEST: 'guest',
  MEMBER: 'member',
  INVESTOR: 'investor',
} as const;

// NO SILVER - Gold is entry level
export const InvestorTier = {
  GOLD: 'gold',
  PLATINUM: 'platinum',
  DIAMOND: 'diamond',
  BLACK: 'black',
  FOUNDERS: 'founders',
} as const;

export type AccessLevelType = typeof AccessLevel[keyof typeof AccessLevel];
export type InvestorTierType = typeof InvestorTier[keyof typeof InvestorTier];

export interface User {
  id: string;
  email: string;
  name: string;
  accessLevel: AccessLevelType;
  investorTier?: InvestorTierType;
  investmentAmount?: number;
  portfolioValue?: number;
  memberSince?: string;
  favorites?: string[];
  bookings?: string[];
  biometricEnabled?: boolean;
}

export interface NextTierInfo {
  nextTier: InvestorTierType;
  nextTierName: string;
  amountToNext: number;
  progress: number;
  benefits: TierBenefit[];
}

export interface TierBenefit {
  icon: string;
  title: string;
  description: string;
}

// Tier thresholds - Gold is now entry level
export const TierThresholds: Record<string, number | null> = {
  [InvestorTier.GOLD]: 0,           // Entry level (was Silver)
  [InvestorTier.PLATINUM]: 250000,
  [InvestorTier.DIAMOND]: 500000,
  [InvestorTier.BLACK]: null,       // Invitation only
  [InvestorTier.FOUNDERS]: null,    // Invitation only
};

// Tier configuration
export const TierConfig: Record<string, {
  name: string;
  color: string;
  bgGradient: [string, string];
  icon: string;
  textColor?: string;
  benefits: string[];
  discountPercent: number;
}> = {
  [InvestorTier.GOLD]: {
    name: 'Gold Card',
    color: '#D4AF37',
    bgGradient: ['#D4AF37', '#B8960C'],
    icon: 'award',
    benefits: ['Priority restaurant reservations', 'Member events access', 'Quarterly investor updates', 'VIP event invitations'],
    discountPercent: 10,
  },
  [InvestorTier.PLATINUM]: {
    name: 'Platinum Card',
    color: '#E5E4E2',
    bgGradient: ['#E5E4E2', '#C9C9C9'],
    icon: 'shield',
    benefits: ['All Gold benefits', 'Helicopter transfers', 'Private yacht access', 'Platinum-only events', 'Complimentary spa credits'],
    discountPercent: 15,
  },
  [InvestorTier.DIAMOND]: {
    name: 'Diamond Card',
    color: '#B9F2FF',
    bgGradient: ['#B9F2FF', '#87CEEB'],
    icon: 'diamond',
    benefits: ['All Platinum benefits', 'Private jet access', 'Dedicated personal team', '24/7 global concierge'],
    discountPercent: 25,
  },
  [InvestorTier.BLACK]: {
    name: 'Black Card',
    color: '#1a1a1a',
    bgGradient: ['#2a2a2a', '#1a1a1a'],
    textColor: '#D4AF37',
    icon: 'shield',
    benefits: ['All Diamond benefits', 'Invitation-only experiences', 'Board meeting access', 'Ultimate priority'],
    discountPercent: 35,
  },
  [InvestorTier.FOUNDERS]: {
    name: 'Founders Card',
    color: '#D4AF37',
    bgGradient: ['#D4AF37', '#1a1a1a'],
    icon: 'star',
    benefits: ['Ultimate access', 'Original investor recognition', 'Lifetime benefits', 'Legacy privileges'],
    discountPercent: 50,
  },
};

// Benefits unlocked at each tier (for FOMO teasers)
export const TierBenefitsUnlock: Record<string, TierBenefit[]> = {
  [InvestorTier.PLATINUM]: [
    { icon: 'navigation', title: 'Helicopter Transfers', description: 'Complimentary airport transfers' },
    { icon: 'anchor', title: 'Private Yacht Access', description: 'Reserve MOTA yacht for day trips' },
    { icon: 'award', title: 'Platinum Events', description: 'Ultra-exclusive galas & experiences' },
  ],
  [InvestorTier.DIAMOND]: [
    { icon: 'send', title: 'Private Jet Access', description: 'Charter flights to MOTA' },
    { icon: 'users', title: 'Personal Team', description: 'Dedicated concierge & assistant' },
    { icon: 'clock', title: '24/7 Global Concierge', description: 'Worldwide luxury arrangements' },
  ],
};

// Member benefits (for Guest FOMO)
export const MemberBenefits: TierBenefit[] = [
  { icon: 'calendar', title: 'Book Restaurants', description: 'Reserve tables at all MOTA venues' },
  { icon: 'heart', title: 'Save Favorites', description: 'Create your personalized lists' },
  { icon: 'mail', title: 'RSVP Events', description: 'Get invited to member events' },
  { icon: 'gift', title: 'Exclusive Offers', description: 'Member-only deals & promotions' },
];

// Investor benefits (for Member FOMO)
export const InvestorBenefits: TierBenefit[] = [
  { icon: 'bar-chart-2', title: 'Portfolio Dashboard', description: 'Track your investment & returns' },
  { icon: 'shield', title: 'VIP Benefits', description: 'Luxury perks based on tier' },
  { icon: 'phone', title: 'Concierge Service', description: '24/7 personal assistance' },
  { icon: 'file-text', title: 'Document Vault', description: 'Access all legal & financial docs' },
];

// ============================================
// API BASE URL - Change this for production
// ============================================
export const API_BASE_URL = 'http://localhost:3001/api';

// ============================================
// MOCK DATABASE (Will be replaced by API calls)
// ============================================

const mockUsers: User[] = [
  {
    id: '1',
    email: 'member@mota.com',
    name: 'Sarah Chen',
    accessLevel: AccessLevel.MEMBER,
    favorites: ['rest_1', 'act_2'],
    bookings: [],
  },
  {
    id: '2',
    email: 'gold@mota.com',
    name: 'James Wilson',
    accessLevel: AccessLevel.INVESTOR,
    investorTier: InvestorTier.GOLD,
    investmentAmount: 150000,
    portfolioValue: 172000,
    memberSince: '2024-01-20',
  },
  {
    id: '3',
    email: 'platinum@mota.com',
    name: 'Victoria Chang',
    accessLevel: AccessLevel.INVESTOR,
    investorTier: InvestorTier.PLATINUM,
    investmentAmount: 350000,
    portfolioValue: 412000,
    memberSince: '2023-09-10',
  },
  {
    id: '4',
    email: 'diamond@mota.com',
    name: 'Robert Sterling',
    accessLevel: AccessLevel.INVESTOR,
    investorTier: InvestorTier.DIAMOND,
    investmentAmount: 750000,
    portfolioValue: 892000,
    memberSince: '2023-03-05',
  },
  {
    id: '5',
    email: 'founder@mota.com',
    name: 'Alexander Reyes',
    accessLevel: AccessLevel.INVESTOR,
    investorTier: InvestorTier.FOUNDERS,
    investmentAmount: 2500000,
    portfolioValue: 3200000,
    memberSince: '2022-01-01',
  },
];

// Password storage (in production, use proper backend auth)
const mockPasswords: Record<string, string> = {
  'member@mota.com': 'member123',
  'gold@mota.com': 'gold123',
  'platinum@mota.com': 'plat123',
  'diamond@mota.com': 'diamond123',
  'founder@mota.com': 'founder123',
};

// ============================================
// BIOMETRIC SERVICE
// ============================================

export const BiometricService = {
  isAvailable: async (): Promise<boolean> => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return hasHardware && isEnrolled;
    } catch {
      return false;
    }
  },

  getBiometricType: async (): Promise<'faceId' | 'fingerprint' | 'none'> => {
    try {
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        return 'faceId';
      }
      if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        return 'fingerprint';
      }
      return 'none';
    } catch {
      return 'none';
    }
  },

  authenticate: async (promptMessage: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        fallbackLabel: 'Use Password',
        disableDeviceFallback: false,
      });
      return { success: result.success, error: result.error };
    } catch (error) {
      return { success: false, error: 'Biometric authentication failed' };
    }
  },

  storeCredentials: async (email: string, token: string): Promise<boolean> => {
    try {
      await SecureStore.setItemAsync(`mota_biometric_${email}`, token);
      return true;
    } catch {
      return false;
    }
  },

  getCredentials: async (email: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(`mota_biometric_${email}`);
    } catch {
      return null;
    }
  },

  removeCredentials: async (email: string): Promise<boolean> => {
    try {
      await SecureStore.deleteItemAsync(`mota_biometric_${email}`);
      return true;
    } catch {
      return false;
    }
  },

  hasStoredCredentials: async (email: string): Promise<boolean> => {
    try {
      const token = await SecureStore.getItemAsync(`mota_biometric_${email}`);
      return !!token;
    } catch {
      return false;
    }
  },
};

// ============================================
// AUTH CONTEXT
// ============================================

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  biometricType: 'faceId' | 'fingerprint' | 'none';
  biometricAvailable: boolean;
  lastLoggedInEmail: string | null;
  
  // Auth methods
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithBiometric: () => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, enableBiometric?: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  
  // Biometric methods
  enableBiometric: () => Promise<boolean>;
  disableBiometric: () => Promise<boolean>;
  canUseBiometric: () => Promise<boolean>;
  
  // Access control
  canAccess: (feature: string) => boolean;
  getNextTierInfo: () => NextTierInfo | null;
  getDiscountPercent: () => number;
  
  // Helpers
  isGuest: boolean;
  isMember: boolean;
  isInvestor: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// ============================================
// AUTH PROVIDER
// ============================================

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [biometricType, setBiometricType] = useState<'faceId' | 'fingerprint' | 'none'>('none');
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [lastLoggedInEmail, setLastLoggedInEmail] = useState<string | null>(null);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    const available = await BiometricService.isAvailable();
    setBiometricAvailable(available);
    
    if (available) {
      const type = await BiometricService.getBiometricType();
      setBiometricType(type);
    }

    try {
      const savedEmail = await SecureStore.getItemAsync('mota_last_email');
      if (savedEmail) {
        setLastLoggedInEmail(savedEmail);
      }
    } catch {}

    // Start as guest
    setUser({
      id: 'guest_session',
      email: '',
      name: 'Guest',
      accessLevel: AccessLevel.GUEST,
    });
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);

    await new Promise(r => setTimeout(r, 800));

    const correctPassword = mockPasswords[email.toLowerCase()];
    if (!correctPassword || correctPassword !== password) {
      setError('Invalid email or password');
      setIsLoading(false);
      return { success: false, error: 'Invalid email or password' };
    }

    const foundUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!foundUser) {
      setError('User not found');
      setIsLoading(false);
      return { success: false, error: 'User not found' };
    }

    setUser(foundUser);
    setLastLoggedInEmail(email);
    
    try {
      await SecureStore.setItemAsync('mota_last_email', email);
    } catch {}

    setIsLoading(false);
    return { success: true };
  };

  const loginWithBiometric = async (): Promise<{ success: boolean; error?: string }> => {
    if (!lastLoggedInEmail) {
      return { success: false, error: 'No previous login found' };
    }

    const hasCredentials = await BiometricService.hasStoredCredentials(lastLoggedInEmail);
    if (!hasCredentials) {
      return { success: false, error: 'Biometric not enabled for this account' };
    }

    setIsLoading(true);
    setError(null);

    const biometricResult = await BiometricService.authenticate(
      biometricType === 'faceId' 
        ? 'Verify your identity to login to MOTA'
        : 'Touch the fingerprint sensor to login to MOTA'
    );

    if (!biometricResult.success) {
      setError(biometricResult.error || 'Biometric authentication failed');
      setIsLoading(false);
      return { success: false, error: biometricResult.error };
    }

    const foundUser = mockUsers.find(u => u.email.toLowerCase() === lastLoggedInEmail.toLowerCase());
    if (!foundUser) {
      setIsLoading(false);
      return { success: false, error: 'User not found' };
    }

    setUser({ ...foundUser, biometricEnabled: true });
    setIsLoading(false);
    return { success: true };
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    enableBiometric: boolean = false
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);

    await new Promise(r => setTimeout(r, 800));

    if (mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      setError('Email already exists');
      setIsLoading(false);
      return { success: false, error: 'Email already exists' };
    }

    const newUser: User = {
      id: String(mockUsers.length + 1),
      email,
      name,
      accessLevel: AccessLevel.MEMBER,
      favorites: [],
      bookings: [],
      biometricEnabled: enableBiometric,
    };

    mockUsers.push(newUser);
    mockPasswords[email.toLowerCase()] = password;

    if (enableBiometric) {
      const token = `mota_auth_${newUser.id}_${Date.now()}`;
      await BiometricService.storeCredentials(email, token);
    }

    setUser(newUser);
    setLastLoggedInEmail(email);
    
    try {
      await SecureStore.setItemAsync('mota_last_email', email);
    } catch {}

    setIsLoading(false);
    return { success: true };
  };

  const logout = () => {
    setUser({
      id: 'guest_session',
      email: '',
      name: 'Guest',
      accessLevel: AccessLevel.GUEST,
    });
    setError(null);
  };

  const enableBiometric = async (): Promise<boolean> => {
    if (!user || user.accessLevel === AccessLevel.GUEST) return false;

    setIsLoading(true);
    const result = await BiometricService.authenticate('Verify to enable biometric login');
    
    if (result.success) {
      const token = `mota_auth_${user.id}_${Date.now()}`;
      await BiometricService.storeCredentials(user.email, token);
      setUser({ ...user, biometricEnabled: true });
      setIsLoading(false);
      return true;
    }

    setIsLoading(false);
    return false;
  };

  const disableBiometric = async (): Promise<boolean> => {
    if (!user) return false;

    setIsLoading(true);
    await BiometricService.removeCredentials(user.email);
    setUser({ ...user, biometricEnabled: false });
    setIsLoading(false);
    return true;
  };

  const canUseBiometric = async (): Promise<boolean> => {
    if (!biometricAvailable || !lastLoggedInEmail) return false;
    return await BiometricService.hasStoredCredentials(lastLoggedInEmail);
  };

  const canAccess = (feature: string): boolean => {
    if (!user) return false;

    const featureRequirements: Record<string, string[]> = {
      'browse': [AccessLevel.GUEST, AccessLevel.MEMBER, AccessLevel.INVESTOR],
      'booking': [AccessLevel.MEMBER, AccessLevel.INVESTOR],
      'favorites': [AccessLevel.MEMBER, AccessLevel.INVESTOR],
      'rsvp': [AccessLevel.MEMBER, AccessLevel.INVESTOR],
      'dashboard': [AccessLevel.INVESTOR],
      'portfolio': [AccessLevel.INVESTOR],
      'documents': [AccessLevel.INVESTOR],
      'concierge': [AccessLevel.INVESTOR],
      'helicopter': [InvestorTier.PLATINUM, InvestorTier.DIAMOND, InvestorTier.BLACK, InvestorTier.FOUNDERS],
      'yacht': [InvestorTier.PLATINUM, InvestorTier.DIAMOND, InvestorTier.BLACK, InvestorTier.FOUNDERS],
      'privateJet': [InvestorTier.DIAMOND, InvestorTier.BLACK, InvestorTier.FOUNDERS],
      'dedicatedTeam': [InvestorTier.DIAMOND, InvestorTier.BLACK, InvestorTier.FOUNDERS],
    };

    const requirements = featureRequirements[feature];
    if (!requirements) return true;

    if (requirements.includes(user.accessLevel)) return true;
    if (user.investorTier && requirements.includes(user.investorTier)) return true;

    return false;
  };

  const getNextTierInfo = (): NextTierInfo | null => {
    if (!user || user.accessLevel !== AccessLevel.INVESTOR || !user.investorTier) return null;

    const tierOrder = [InvestorTier.GOLD, InvestorTier.PLATINUM, InvestorTier.DIAMOND];
    const currentIndex = tierOrder.indexOf(user.investorTier as typeof tierOrder[number]);

    if (user.investorTier === InvestorTier.BLACK || user.investorTier === InvestorTier.FOUNDERS) {
      return null;
    }

    if (currentIndex === -1 || currentIndex === tierOrder.length - 1) return null;

    const nextTier = tierOrder[currentIndex + 1];
    const threshold = TierThresholds[nextTier] as number;
    const currentThreshold = TierThresholds[user.investorTier] as number;
    const investmentAmount = user.investmentAmount || 0;
    
    const amountToNext = threshold - investmentAmount;
    const progress = ((investmentAmount - currentThreshold) / (threshold - currentThreshold)) * 100;

    return {
      nextTier,
      nextTierName: TierConfig[nextTier].name,
      amountToNext: Math.max(0, amountToNext),
      progress: Math.min(Math.max(progress, 0), 100),
      benefits: TierBenefitsUnlock[nextTier] || [],
    };
  };

  // Get discount percentage based on tier
  const getDiscountPercent = (): number => {
    if (!user || !user.investorTier) return 0;
    return TierConfig[user.investorTier]?.discountPercent || 0;
  };

  const value: AuthContextType = {
    user,
    isLoading,
    error,
    biometricType,
    biometricAvailable,
    lastLoggedInEmail,
    login,
    loginWithBiometric,
    register,
    logout,
    enableBiometric,
    disableBiometric,
    canUseBiometric,
    canAccess,
    getNextTierInfo,
    getDiscountPercent,
    isGuest: user?.accessLevel === AccessLevel.GUEST,
    isMember: user?.accessLevel === AccessLevel.MEMBER,
    isInvestor: user?.accessLevel === AccessLevel.INVESTOR,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
