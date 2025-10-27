import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
} from 'react-native';
import axios from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerForPushNotificationsAsync, setupNotificationListeners } from '../services/notificationService';
import { savePhoneNumber, updateLastLogin, hasCompletedSetup } from '../utils/secureStorage';

const API_BASE_URL = `${Constants.expoConfig?.extra?.apiUrl || 'http://localhost:8000'}/api/v1`;

export default function LoginOTPScreen({ navigation, route }: any) {
  const { resetPIN, phone: prefilledPhone } = route?.params || {};
  const [phone, setPhone] = useState(prefilledPhone || '');
  const [otp, setOTP] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);
  const [pushToken, setPushToken] = useState<string | null>(null);

  useEffect(() => {
    // Register for push notifications on mount
    registerForPushNotificationsAsync().then(token => {
      setPushToken(token);
      console.log('Push token registered:', token);
    });

    // Setup notification listeners
    const cleanup = setupNotificationListeners(
      (notification) => {
        console.log('Notification received:', notification);
      },
      (response) => {
        console.log('Notification tapped:', response);
        // Handle navigation based on notification data
      }
    );

    return cleanup;
  }, []);

  const sendOTP = async () => {
    if (!phone || phone.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      console.log('[LoginOTPScreen] API_BASE_URL:', API_BASE_URL);
      console.log('[LoginOTPScreen] Full URL:', `${API_BASE_URL}/mobile/auth/send-otp`);
      const response = await axios.post(`${API_BASE_URL}/mobile/auth/send-otp`, {
        phone_number: phone.startsWith('+') ? phone : `+91${phone}`,
      });

      if (response.data.success) {
        setOtpSent(true);
        setUserType(response.data.user_type);
        Alert.alert(
          'Success',
          'OTP sent'
        );
      }
    } catch (error: any) {
      console.log('[LoginOTPScreen] Error occurred:', error);
      console.log('[LoginOTPScreen] Error message:', error.message);
      console.log('[LoginOTPScreen] Error code:', error.code);
      console.log('[LoginOTPScreen] Error response:', error.response);

      const errorMessage = error.response?.data?.detail || error.message || 'Failed to send OTP';
      const isNotRegistered = errorMessage.includes('not registered');

      Alert.alert(
        isNotRegistered ? 'Not Registered' : 'Error',
        errorMessage
      );
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Please enter 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/mobile/auth/verify-otp`, {
        phone_number: phone.startsWith('+') ? phone : `+91${phone}`,
        otp_code: otp,
        push_token: pushToken,
        device_type: Platform.OS,
      });

      if (response.data.success) {
        // Save token and user data
        await AsyncStorage.setItem('access_token', response.data.access_token);
        await AsyncStorage.setItem('user_type', response.data.user_type);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
        await savePhoneNumber(phone.startsWith('+') ? phone : `+91${phone}`);
        await updateLastLogin();

        // Check if this is a PIN reset flow
        if (resetPIN) {
          navigation.replace('CreatePIN', { isReset: true });
          return;
        }

        // Check if user has completed quick login setup
        const setupComplete = await hasCompletedSetup();

        if (!setupComplete) {
          // First-time user, show setup quick login screen
          navigation.replace('SetupQuickLogin');
        } else {
          // Returning user (token expired), navigate to home
          if (response.data.user_type === 'teacher') {
            navigation.replace('TeacherHome');
          } else {
            navigation.replace('ParentHome');
          }
        }
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.detail || 'Invalid OTP'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.content}>
        {/* Logo/Header */}
        <View style={styles.header}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Sparky</Text>
        </View>

        {/* Card Container */}
        <View style={styles.card}>
          {/* Instruction Text */}
          <Text style={styles.instructionTitle}>
            {otpSent ? 'Enter Verification Code' : 'Sign In to Your Account'}
          </Text>
          <Text style={styles.instructionText}>
            {otpSent
              ? `Enter the 6-digit code sent to ${phone}`
              : 'Enter the phone number registered'}
          </Text>

          {/* Phone Input */}
          {!otpSent ? (
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.phoneInput}
                placeholder="Phone number"
                placeholderTextColor="#D1D5DB"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                maxLength={10}
                editable={!loading}
              />
            </View>
          ) : (
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.otpInput}
                placeholder="Enter 6-digit OTP"
                placeholderTextColor="#D1D5DB"
                value={otp}
                onChangeText={setOTP}
                keyboardType="number-pad"
                maxLength={6}
                editable={!loading}
              />
            </View>
          )}

          {/* Action Button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={otpSent ? verifyOTP : sendOTP}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {otpSent ? 'Verify OTP' : 'Send OTP'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Resend/Change Number */}
          {otpSent && (
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => {
                setOtpSent(false);
                setOTP('');
              }}
              disabled={loading}
            >
              <Text style={styles.linkText}>Change Phone Number</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerBrand}>© 2025 Sparky from SparkEd</Text>
        </View>
      </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C4E8A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  instructionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  phoneInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
  },
  otpInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    padding: 14,
    fontSize: 20,
    textAlign: 'center',
    letterSpacing: 6,
    fontWeight: '600',
    color: '#1F2937',
  },
  button: {
    backgroundColor: '#2C4E8A',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#2C4E8A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    alignItems: 'center',
    padding: 12,
    marginTop: 8,
  },
  linkText: {
    color: '#2C4E8A',
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    marginTop: 32,
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  footerBrand: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
    textAlign: 'center',
  },
});
