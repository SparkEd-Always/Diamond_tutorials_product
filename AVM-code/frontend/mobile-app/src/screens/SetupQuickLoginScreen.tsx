import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { setAuthMethod } from '../utils/secureStorage';

export default function SetupQuickLoginScreen({ navigation }: any) {
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('');

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();

      if (compatible && enrolled) {
        setBiometricAvailable(true);

        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType('Face ID');
        } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType('Fingerprint');
        } else {
          setBiometricType('Biometric');
        }
      }
    } catch (error) {
      console.error('Biometric check error:', error);
    }
  };

  const handleSetupPIN = () => {
    navigation.replace('CreatePIN', {
      fromSetup: true,
      showBiometricOption: biometricAvailable
    });
  };

  const handleSetupBiometric = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Enable ${biometricType} for AVM Tutorial`,
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (result.success) {
        navigation.replace('CreatePIN', {
          fromSetup: true,
          enableBiometric: true,
          showBiometricOption: false
        });
      } else {
        Alert.alert(
          'Authentication Failed',
          'Please set up a PIN instead',
          [{ text: 'OK', onPress: handleSetupPIN }]
        );
      }
    } catch (error) {
      console.error('Biometric auth error:', error);
      Alert.alert('Error', 'Biometric authentication failed');
    }
  };

  const handleSkip = async () => {
    await setAuthMethod('otp_only');
    navigation.replace('NavigateHome');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🔐</Text>
        </View>

        {/* Title & Description */}
        <Text style={styles.title}>Set up Quick Access</Text>
        <Text style={styles.description}>
          Skip entering your phone number every time. Use a PIN or biometrics for faster, secure login.
        </Text>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {/* PIN Option */}
          <TouchableOpacity
            style={styles.optionCard}
            onPress={handleSetupPIN}
          >
            <View style={styles.optionIcon}>
              <Text style={styles.optionIconText}>🔢</Text>
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Set up PIN</Text>
              <Text style={styles.optionDescription}>
                Use a 4-digit PIN for quick login
              </Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          {/* Biometric Option */}
          {biometricAvailable && (
            <TouchableOpacity
              style={styles.optionCard}
              onPress={handleSetupBiometric}
            >
              <View style={styles.optionIcon}>
                <Text style={styles.optionIconText}>
                  {biometricType === 'Face ID' ? '👤' : '👆'}
                </Text>
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Use {biometricType}</Text>
                <Text style={styles.optionDescription}>
                  Login with {biometricType.toLowerCase()}
                </Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Skip Button */}
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
        >
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>

        {/* Info Text */}
        <Text style={styles.infoText}>
          You can always set this up later in Settings
        </Text>
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
    padding: 24,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 64,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionIconText: {
    fontSize: 24,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  arrow: {
    fontSize: 28,
    color: '#9CA3AF',
    fontWeight: '300',
  },
  skipButton: {
    alignItems: 'center',
    padding: 16,
  },
  skipText: {
    fontSize: 16,
    color: '#4F46E5',
    fontWeight: '500',
  },
  infoText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
  },
});
