import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoginOTPScreen from '../screens/LoginOTPScreen';
import SetupQuickLoginScreen from '../screens/SetupQuickLoginScreen';
import CreatePINScreen from '../screens/CreatePINScreen';
import PINLoginScreen from '../screens/PINLoginScreen';
import NavigateHomeScreen from '../screens/NavigateHomeScreen';
import TeacherHomeScreen from '../screens/TeacherHomeScreen';
import ParentHomeScreen from '../screens/ParentHomeScreen';
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

const Stack = createStackNavigator();

const UnifiedAppNavigator = () => {
  const [loading, setLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState<string>('Login');

  useEffect(() => {
    determineInitialRoute();
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

  return (
    <NavigationContainer>
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

        {/* Parent Screens */}
        <Stack.Screen name="ParentHome" component={ParentHomeScreen} />

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
