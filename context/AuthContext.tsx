/**
 * MOTA Auth Context
 * 
 * Access Levels:
 * - Guest: Not logged in (user = null)
 * - Member: Logged in, free account (user exists, isInvestor = false)
 * - Investor: Logged in + verified (user exists, isInvestor = true)
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';

// User type definition
interface User {
  _id: string;
  name: string;
  email: string;
  role: 'member' | 'investor' | 'admin';
  investorTier?: 'silver' | 'gold' | 'platinum' | 'diamond' | 'black' | 'founders';
  investmentAmount?: number;
  portfolioValue?: number;
  memberSince?: string;
}

// Auth context type
interface AuthContextType {
  user: User | null;
  loading: boolean;
  isInvestor: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  getDiscountPercent: () => number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // Check if user is an investor (role must be 'investor')
  const isInvestor = user?.role === 'investor' && !!user?.investorTier;

  // Calculate discount based on tier
  const getDiscountPercent = (): number => {
    if (!user) return 0;
    if (!isInvestor) return 5; // Members get 5% discount
    
    // Investor discounts based on tier
    const discounts: Record<string, number> = {
      silver: 5,
      gold: 10,
      platinum: 20,
      diamond: 30,
      black: 40,
      founders: 50,
    };
    return discounts[user.investorTier || 'silver'] || 5;
  };

  // Refresh user data from backend
  const refreshUser = async (): Promise<void> => {
    if (!user?._id) return;
    
    try {
      const response = await api.getProfile();
      if (response && response._id) {
        console.log('Refreshed user data:', response);
        setUser(response);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  // Login function
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      const response = await api.login(email, password);
      
      if (response.token && response.user) {
        console.log('Login response user:', response.user);
        // Token is stored in api service automatically
        setUser(response.user);
        return { success: true };
      }
      
      return { success: false, error: 'Invalid response from server' };
    } catch (error: any) {
      const message = error.message || 'Login failed';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Register function (creates a Member account)
  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      const response = await api.register(name, email, password);
      
      if (response.token && response.user) {
        // Token is stored in api service automatically
        setUser(response.user);
        return { success: true };
      }
      
      return { success: false, error: 'Invalid response from server' };
    } catch (error: any) {
      const message = error.message || 'Registration failed';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    setLoading(true);
    api.setToken(null); // Clear token
    setUser(null);
    setLoading(false);
  };

  const value: AuthContextType = {
    user,
    loading,
    isInvestor,
    login,
    register,
    logout,
    refreshUser,
    getDiscountPercent,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
