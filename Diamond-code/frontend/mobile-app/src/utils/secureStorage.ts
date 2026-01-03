import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

// Storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  USER_TYPE: 'user_type',
  USER: 'user',
  AUTH_METHOD: 'auth_method',
  PIN_HASH: 'pin_hash',
  BIOMETRIC_ENABLED: 'biometric_enabled',
  LAST_LOGIN: 'last_login',
  PIN_ATTEMPTS: 'pin_attempts',
  PIN_LOCKED_UNTIL: 'pin_locked_until',
  PHONE_NUMBER: 'phone_number',
};

// Auth methods
export type AuthMethod = 'pin' | 'biometric' | 'otp_only' | null;

// Hash PIN using SHA256
export const hashPIN = async (pin: string): Promise<string> => {
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    pin
  );
  return digest;
};

// Verify PIN
export const verifyPIN = async (enteredPIN: string): Promise<boolean> => {
  try {
    const storedHash = await AsyncStorage.getItem(STORAGE_KEYS.PIN_HASH);
    if (!storedHash) return false;

    const enteredHash = await hashPIN(enteredPIN);
    return enteredHash === storedHash;
  } catch (error) {
    console.error('PIN verification error:', error);
    return false;
  }
};

// Save PIN
export const savePIN = async (pin: string): Promise<void> => {
  const hashedPIN = await hashPIN(pin);
  await AsyncStorage.setItem(STORAGE_KEYS.PIN_HASH, hashedPIN);
  await AsyncStorage.setItem(STORAGE_KEYS.AUTH_METHOD, 'pin');
  await resetPINAttempts();
};

// Get auth method
export const getAuthMethod = async (): Promise<AuthMethod> => {
  const method = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_METHOD);
  return method as AuthMethod;
};

// Set auth method
export const setAuthMethod = async (method: AuthMethod): Promise<void> => {
  if (method) {
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_METHOD, method);
  } else {
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_METHOD);
  }
};

// Check if token is expired (30 days)
export const isTokenExpired = async (): Promise<boolean> => {
  try {
    const lastLogin = await AsyncStorage.getItem(STORAGE_KEYS.LAST_LOGIN);
    if (!lastLogin) return true;

    const lastLoginDate = new Date(lastLogin);
    const now = new Date();
    const daysDiff = (now.getTime() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24);

    return daysDiff > 30;
  } catch (error) {
    console.error('Token expiry check error:', error);
    return true;
  }
};

// Update last login
export const updateLastLogin = async (): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEYS.LAST_LOGIN, new Date().toISOString());
};

// PIN attempts management
export const incrementPINAttempts = async (): Promise<number> => {
  const attempts = await getPINAttempts();
  const newAttempts = attempts + 1;
  await AsyncStorage.setItem(STORAGE_KEYS.PIN_ATTEMPTS, newAttempts.toString());

  // Lock PIN after 5 attempts for 5 minutes
  if (newAttempts >= 5) {
    const lockUntil = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    await AsyncStorage.setItem(STORAGE_KEYS.PIN_LOCKED_UNTIL, lockUntil.toISOString());
  }

  return newAttempts;
};

export const getPINAttempts = async (): Promise<number> => {
  const attempts = await AsyncStorage.getItem(STORAGE_KEYS.PIN_ATTEMPTS);
  return attempts ? parseInt(attempts, 10) : 0;
};

export const resetPINAttempts = async (): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEYS.PIN_ATTEMPTS, '0');
  await AsyncStorage.removeItem(STORAGE_KEYS.PIN_LOCKED_UNTIL);
};

export const isPINLocked = async (): Promise<{ locked: boolean; lockUntil?: Date }> => {
  const lockUntilStr = await AsyncStorage.getItem(STORAGE_KEYS.PIN_LOCKED_UNTIL);
  if (!lockUntilStr) return { locked: false };

  const lockUntil = new Date(lockUntilStr);
  const now = new Date();

  if (now < lockUntil) {
    return { locked: true, lockUntil };
  } else {
    // Lock period expired, reset
    await resetPINAttempts();
    return { locked: false };
  }
};

// Biometric settings
export const setBiometricEnabled = async (enabled: boolean): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEYS.BIOMETRIC_ENABLED, enabled.toString());
  if (enabled) {
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_METHOD, 'biometric');
  }
};

export const isBiometricEnabled = async (): Promise<boolean> => {
  const enabled = await AsyncStorage.getItem(STORAGE_KEYS.BIOMETRIC_ENABLED);
  return enabled === 'true';
};

// Save phone number
export const savePhoneNumber = async (phone: string): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEYS.PHONE_NUMBER, phone);
};

export const getPhoneNumber = async (): Promise<string | null> => {
  return await AsyncStorage.getItem(STORAGE_KEYS.PHONE_NUMBER);
};

// Clear auth data (logout)
export const clearAuthData = async (): Promise<void> => {
  await AsyncStorage.multiRemove([
    STORAGE_KEYS.ACCESS_TOKEN,
    STORAGE_KEYS.USER_TYPE,
    STORAGE_KEYS.USER,
    STORAGE_KEYS.AUTH_METHOD,
    STORAGE_KEYS.PIN_HASH,
    STORAGE_KEYS.BIOMETRIC_ENABLED,
    STORAGE_KEYS.LAST_LOGIN,
    STORAGE_KEYS.PIN_ATTEMPTS,
    STORAGE_KEYS.PIN_LOCKED_UNTIL,
  ]);
};

// Check if user has completed initial setup
export const hasCompletedSetup = async (): Promise<boolean> => {
  const authMethod = await getAuthMethod();
  return authMethod !== null;
};
