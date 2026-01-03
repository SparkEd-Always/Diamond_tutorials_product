import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

import LoginOTPScreen from '../screens/LoginOTPScreen';
import SetupQuickLoginScreen from '../screens/SetupQuickLoginScreen';
import CreatePINScreen from '../screens/CreatePINScreen';
import PINLoginScreen from '../screens/PINLoginScreen';
import NavigateHomeScreen from '../screens/NavigateHomeScreen';
import TeacherHomeScreen from '../screens/TeacherHomeScreen';
import MessagesScreen from '../screens/MessagesScreen';
import AttendanceHistoryScreen from '../screens/AttendanceHistoryScreen';
import AttendanceScreen from '../screens/AttendanceScreen';
import StudentsScreen from '../screens/StudentsScreen';
import ProfileScreen from '../screens/ProfileScreen';

import {
  getAuthMethod,
  isTokenExpired,
  STORAGE_KEYS,
  clearAuthData,
} from '../utils/secureStorage';
import { setupNotificationListeners, getNotificationNavigationData } from '../services/firebaseNotificationService';

const Stack = createStackNavigator();

const UnifiedAppNavigator = () => {
  const [loading, setLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState<string>('Login');
  const navigationRef = useRef<any>(null);

  useEffect(() => {
    determineInitialRoute();

    // Set up global notification listeners
    const cleanup = setupNotificationListeners(
      (notification) => {
        console.log('📩 Notification received:', notification);
      },
      async (response) => {
        console.log('🔔 Notification tapped:', response);
        const navData = getNotificationNavigationData(response);

        if (navData.targetScreen) {
          console.log('📍 Navigating to:', navData.targetScreen);

          // If navigation is ready, navigate immediately
          if (navigationRef.current?.isReady()) {
            navigationRef.current.navigate(navData.targetScreen);
            console.log('✅ Navigated to:', navData.targetScreen);
          } else {
            // Store for later navigation if app is not ready
            await AsyncStorage.setItem('pendingNavigationTarget', navData.targetScreen);
            console.log('✅ Stored pending navigation target:', navData.targetScreen);
          }
        }
      }
    );

    return cleanup;
  }, []);

  const determineInitialRoute = async () => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

      // No token = first time user or logged out
      if (!token) {
        setInitialRoute('Login');
        setLoading(false);
        return;
      }

      // Check if token is expired (>30 days)
      const expired = await isTokenExpired();
      if (expired) {
        // Token expired, clear auth and force OTP login
        await clearAuthData();
        setInitialRoute('Login');
        setLoading(false);
        return;
      }

      // Token valid, check auth method
      const authMethod = await getAuthMethod();

      if (!authMethod || authMethod === 'otp_only') {
        // User skipped quick login setup, go directly to home
        setInitialRoute('NavigateHome');
      } else if (authMethod === 'pin' || authMethod === 'biometric') {
        // User has PIN/biometric set up, show PIN login screen
        setInitialRoute('PINLogin');
      } else {
        // Fallback
        setInitialRoute('Login');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setInitialRoute('Login');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  // Handle pending navigation when app becomes ready
  const handleNavigationReady = async () => {
    const pendingTarget = await AsyncStorage.getItem('pendingNavigationTarget');
    if (pendingTarget && navigationRef.current?.isReady()) {
      console.log('📍 Navigating to pending target:', pendingTarget);
      navigationRef.current.navigate(pendingTarget);
      await AsyncStorage.removeItem('pendingNavigationTarget');
      console.log('✅ Navigated and cleared pending target');
    }
  };

  return (
    <NavigationContainer ref={navigationRef} onReady={handleNavigationReady}>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false }}
      >
        {/* Auth Screens */}
        <Stack.Screen name="Login" component={LoginOTPScreen} />
        <Stack.Screen name="SetupQuickLogin" component={SetupQuickLoginScreen} />
        <Stack.Screen name="CreatePIN" component={CreatePINScreen} />
        <Stack.Screen name="PINLogin" component={PINLoginScreen} />
        <Stack.Screen name="NavigateHome" component={NavigateHomeScreen} />

        {/* Teacher Screens */}
        <Stack.Screen name="TeacherHome" component={TeacherHomeScreen} />

        {/* Shared Screens */}
        <Stack.Screen name="Messages" component={MessagesScreen} />
        <Stack.Screen name="AttendanceHistory" component={AttendanceHistoryScreen} />
        <Stack.Screen name="Attendance" component={AttendanceScreen} />
        <Stack.Screen name="Students" component={StudentsScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default UnifiedAppNavigator;
