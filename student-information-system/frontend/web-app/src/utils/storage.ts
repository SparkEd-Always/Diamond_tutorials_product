/**
 * Local storage utility functions
 */

import { STORAGE_KEYS } from '@/constants';

export const storage = {
  // Generic storage methods
  set: <T>(key: string, value: T): void => {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  get: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },

  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },

  // Auth-specific methods
  setAccessToken: (token: string): void => {
    storage.set(STORAGE_KEYS.ACCESS_TOKEN, token);
  },

  getAccessToken: (): string | null => {
    return storage.get<string>(STORAGE_KEYS.ACCESS_TOKEN);
  },

  setRefreshToken: (token: string): void => {
    storage.set(STORAGE_KEYS.REFRESH_TOKEN, token);
  },

  getRefreshToken: (): string | null => {
    return storage.get<string>(STORAGE_KEYS.REFRESH_TOKEN);
  },

  setUser: (user: any): void => {
    storage.set(STORAGE_KEYS.USER, user);
  },

  getUser: (): any | null => {
    return storage.get(STORAGE_KEYS.USER);
  },

  clearAuth: (): void => {
    storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
    storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
    storage.remove(STORAGE_KEYS.USER);
  },

  // Theme
  setTheme: (theme: 'light' | 'dark'): void => {
    storage.set(STORAGE_KEYS.THEME, theme);
  },

  getTheme: (): 'light' | 'dark' | null => {
    return storage.get<'light' | 'dark'>(STORAGE_KEYS.THEME);
  },
};
