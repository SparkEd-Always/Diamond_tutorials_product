import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { authApi, setAuthToken, removeAuthToken, getAuthToken } from '../services/api';
import type { User, LoginCredentials, RegisterData, AuthResponse } from '../types';
import config from '../config';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isParent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = getAuthToken();
      const storedUser = localStorage.getItem(config.userKey);

      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          // Optionally fetch fresh user data
          const profileData = await authApi.getProfile();
          setUser(profileData.user);
          localStorage.setItem(config.userKey, JSON.stringify(profileData.user));
        } catch (error) {
          console.error('Failed to load user:', error);
          removeAuthToken();
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response: AuthResponse = await authApi.login(credentials);
      setAuthToken(response.access_token);

      // Fetch user profile
      const profileData = await authApi.getProfile();
      setUser(profileData.user);
      localStorage.setItem(config.userKey, JSON.stringify(profileData.user));
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await authApi.register(data);
      setAuthToken(response.access_token);

      if (response.user) {
        setUser(response.user);
        localStorage.setItem(config.userKey, JSON.stringify(response.user));
      } else {
        // Fetch user profile
        const profileData = await authApi.getProfile();
        setUser(profileData.user);
        localStorage.setItem(config.userKey, JSON.stringify(profileData.user));
      }
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    isAdmin: user?.role === 'admin' || user?.role === 'super_admin',
    isParent: user?.role === 'parent',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
