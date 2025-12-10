/**
 * MOTA Auth Context
 * Production-ready authentication with proper backend integration
 * 
 * Access Levels (from backend):
 * - Guest: Not logged in (user = null)
 * - Member: Logged in, free account (accessLevel = 'member')
 * - Investor: Logged in + verified (accessLevel = 'investor')
 * 
 * @version 2.0
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';
import api from '../services/api';

// ============================================
// TYPE DEFINITIONS
// ============================================

// User type matching backend schema
interface User {
  _id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  accessLevel: 'guest' | 'member' | 'investor';
  investorTier?: 'gold' | 'platinum' | 'diamond' | 'black' | 'founders' | null;
  investmentAmount?: number;
  portfolioValue?: number;
  memberSince?: string;
  favorites?: string[];
  isActive?: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Auth context type
interface AuthContextType {
  user: User | null;
  loading: boolean;
  isGuest: boolean;
  isMember: boolean;
  isInvestor: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  getDiscountPercent: () => number;
}

// ============================================
// CONTEXT CREATION
// ============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// PROVIDER COMPONENT
// ============================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // ==========================================
  // COMPUTED PROPERTIES
  // ==========================================
  
  // Guest: No user logged in
  const isGuest = user === null;
  
  // Member: Logged in with accessLevel = 'member'
  const isMember = user !== null && user.accessLevel === 'member';
  
  // Investor: Logged in with accessLevel = 'investor' AND has tier
  const isInvestor = user !== null && user.accessLevel === 'investor' && !!user.investorTier;

  // ==========================================
  // DISCOUNT CALCULATION
  // ==========================================
  
  const getDiscountPercent = (): number => {
    if (!user) return 0;
    
    // Members get 5% discount
    if (user.accessLevel === 'member') return 5;
    
    // Investor discounts based on tier
    if (user.accessLevel === 'investor' && user.investorTier) {
      const discounts: Record<string, number> = {
        gold: 10,
        platinum: 20,
        diamond: 30,
        black: 40,
        founders: 50,
      };
      return discounts[user.investorTier] || 5;
    }
    
    return 0;
  };

  // ==========================================
  // REFRESH USER DATA
  // ==========================================
  
  const refreshUser = async (): Promise<void> => {
    if (!user?._id) {
      console.log('AuthContext: No user to refresh');
      return;
    }
    
    try {
      console.log('AuthContext: Refreshing user data...');
      const response = await api.getProfile();
      
      if (response && response._id) {
        console.log('AuthContext: User refreshed:', response.name, response.accessLevel, response.investorTier);
        setUser(response);
      }
    } catch (error) {
      console.error('AuthContext: Error refreshing user:', error);
    }
  };

  // ==========================================
  // LOGIN FUNCTION
  // ==========================================
  
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      console.log('AuthContext: Attempting login...');
      
      const response = await api.login(email, password);
      
      console.log('AuthContext: Login response received:', {
        hasToken: !!response.token,
        hasUser: !!response.user,
        userName: response.user?.name,
        accessLevel: response.user?.accessLevel,
      });
      
      if (response.token && response.user) {
        setUser(response.user);
        console.log('AuthContext: Login successful!');
        return { success: true };
      }
      
      return { success: false, error: 'Invalid response from server' };
    } catch (error: any) {
      console.error('AuthContext: Login error:', error.message);
      return { success: false, error: error.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // REGISTER FUNCTION
  // ==========================================
  
  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      console.log('AuthContext: Attempting registration...');
      
      const response = await api.register(name, email, password);
      
      console.log('AuthContext: Registration response received:', {
        hasToken: !!response.token,
        hasUser: !!response.user,
      });
      
      if (response.token && response.user) {
        setUser(response.user);
        console.log('AuthContext: Registration successful!');
        return { success: true };
      }
      
      return { success: false, error: 'Invalid response from server' };
    } catch (error: any) {
      console.error('AuthContext: Registration error:', error.message);
      return { success: false, error: error.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOGOUT FUNCTION
  // ==========================================
  
  const logout = async (): Promise<void> => {
    console.log('AuthContext: Logging out...');
    setLoading(true);
    api.setToken(null);
    setUser(null);
    setLoading(false);
    console.log('AuthContext: Logged out successfully');
  };

  // ==========================================
  // CONTEXT VALUE
  // ==========================================
  
  const value: AuthContextType = {
    user,
    loading,
    isGuest,
    isMember,
    isInvestor,
    login,
    register,
    logout,
    refreshUser,
    getDiscountPercent,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================
// HOOK FOR CONSUMING CONTEXT
// ============================================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
