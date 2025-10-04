import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Vibration,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import {
  verifyPIN,
  incrementPINAttempts,
  resetPINAttempts,
  isPINLocked,
  isBiometricEnabled,
  updateLastLogin,
  STORAGE_KEYS,
  getPhoneNumber,
} from '../utils/secureStorage';

export default function PINLoginScreen({ navigation }: any) {
  const [pin, setPin] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [lockTime, setLockTime] = useState<Date | null>(null);
  const [showBiometric, setShowBiometric] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    checkLockStatus();
    checkBiometric();
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      const userStr = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserName(user.name || 'User');
      }
    } catch (error) {
      console.error('Load user info error:', error);
    }
  };

  const checkLockStatus = async () => {
    const lockStatus = await isPINLocked();
    if (lockStatus.locked) {
      setLocked(true);
      setLockTime(lockStatus.lockUntil || null);
    }
  };

  const checkBiometric = async () => {
    const enabled = await isBiometricEnabled();
    if (enabled) {
      setShowBiometric(true);
      // Auto-trigger biometric on load
      setTimeout(() => handleBiometricAuth(), 500);
    }
  };

  const handleBiometricAuth = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Verify to access AVM Tutorial',
        cancelLabel: 'Use PIN',
        disableDeviceFallback: true,
      });

      if (result.success) {
        await updateLastLogin();
        navigateToHome();
      }
    } catch (error) {
      console.error('Biometric auth error:', error);
    }
  };

  const handleNumberPress = async (num: string) => {
    if (locked) {
      Alert.alert('Locked', 'Too many attempts. Please use "Forgot PIN"');
      return;
    }

    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);

      if (newPin.length === 4) {
        // Validate PIN
        setTimeout(() => validatePIN(newPin), 300);
      }
    }
  };

  const validatePIN = async (enteredPin: string) => {
    const isValid = await verifyPIN(enteredPin);

    if (isValid) {
      await resetPINAttempts();
      await updateLastLogin();
      navigateToHome();
    } else {
      Vibration.vibrate(500);
      const newAttempts = await incrementPINAttempts();
      setAttempts(newAttempts);
      setPin('');

      if (newAttempts >= 5) {
        setLocked(true);
        Alert.alert(
          'Too Many Attempts',
          'PIN locked for 5 minutes. Please use "Forgot PIN" to reset via OTP.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Incorrect PIN',
          `${5 - newAttempts} attempts remaining`,
          [{ text: 'OK' }]
        );
      }
    }
  };

  const navigateToHome = async () => {
    const userType = await AsyncStorage.getItem(STORAGE_KEYS.USER_TYPE);
    if (userType === 'teacher') {
      navigation.replace('TeacherHome');
    } else {
      navigation.replace('ParentHome');
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  const handleForgotPIN = async () => {
    Alert.alert(
      'Reset PIN',
      'You will receive an OTP to verify your identity and create a new PIN.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: async () => {
            const phone = await getPhoneNumber();
            navigation.replace('Login', { resetPIN: true, phone });
          },
        },
      ]
    );
  };

  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {[0, 1, 2, 3].map((index) => (
          <View
            key={index}
            style={[
              styles.dot,
              pin.length > index && styles.dotFilled,
            ]}
          />
        ))}
      </View>
    );
  };

  const renderKeypad = () => {
    const numbers = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      [showBiometric ? 'biometric' : '', '0', 'delete'],
    ];

    return (
      <View style={styles.keypad}>
        {numbers.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keypadRow}>
            {row.map((num) => {
              if (num === '') {
                return <View key="empty" style={styles.keyButton} />;
              }
              if (num === 'biometric') {
                return (
                  <TouchableOpacity
                    key="biometric"
                    style={styles.keyButton}
                    onPress={handleBiometricAuth}
                  >
                    <Text style={styles.biometricText}>👆</Text>
                  </TouchableOpacity>
                );
              }
              if (num === 'delete') {
                return (
                  <TouchableOpacity
                    key="delete"
                    style={styles.keyButton}
                    onPress={handleDelete}
                  >
                    <Text style={styles.deleteText}>⌫</Text>
                  </TouchableOpacity>
                );
              }
              return (
                <TouchableOpacity
                  key={num}
                  style={styles.keyButton}
                  onPress={() => handleNumberPress(num)}
                  disabled={locked}
                >
                  <Text style={[styles.keyText, locked && styles.keyTextDisabled]}>
                    {num}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>🎓</Text>
          </View>
          <Text style={styles.title}>Welcome back{userName ? `, ${userName}` : ''}!</Text>
          <Text style={styles.subtitle}>Enter your PIN to continue</Text>
          {attempts > 0 && !locked && (
            <Text style={styles.attemptWarning}>
              {5 - attempts} attempts remaining
            </Text>
          )}
          {locked && (
            <Text style={styles.lockedText}>
              PIN locked. Use "Forgot PIN" to reset.
            </Text>
          )}
        </View>

        {/* PIN Dots */}
        {renderDots()}

        {/* Keypad */}
        {renderKeypad()}

        {/* Forgot PIN */}
        <TouchableOpacity
          style={styles.forgotButton}
          onPress={handleForgotPIN}
        >
          <Text style={styles.forgotText}>Forgot PIN?</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logo: {
    fontSize: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  attemptWarning: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 8,
    fontWeight: '500',
  },
  lockedText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 8,
    fontWeight: '600',
    textAlign: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 48,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginHorizontal: 12,
  },
  dotFilled: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  keypad: {
    flex: 1,
    justifyContent: 'center',
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  keyButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  keyText: {
    fontSize: 28,
    fontWeight: '500',
    color: '#1F2937',
  },
  keyTextDisabled: {
    color: '#D1D5DB',
  },
  deleteText: {
    fontSize: 28,
    color: '#6B7280',
  },
  biometricText: {
    fontSize: 28,
  },
  forgotButton: {
    alignItems: 'center',
    padding: 16,
    marginTop: 8,
  },
  forgotText: {
    fontSize: 16,
    color: '#4F46E5',
    fontWeight: '500',
  },
});
