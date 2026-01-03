import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, clearAuthData } from '../utils/secureStorage';

export default function NavigateHomeScreen({ navigation }: any) {
  const [isParent, setIsParent] = useState(false);

  useEffect(() => {
    navigateToHome();
  }, []);

  const navigateToHome = async () => {
    try {
      const userType = await AsyncStorage.getItem(STORAGE_KEYS.USER_TYPE);

      if (userType === 'teacher') {
        navigation.replace('TeacherHome');
      } else {
        // Parent users can no longer use the app
        setIsParent(true);
      }
    } catch (error) {
      console.error('Navigation error:', error);
      navigation.replace('Login');
    }
  };

  const handleLogout = async () => {
    await clearAuthData();
    navigation.replace('Login');
  };

  // Show message for parent users
  if (isParent) {
    return (
      <View style={styles.container}>
        <View style={styles.messageBox}>
          <Text style={styles.icon}>📱</Text>
          <Text style={styles.title}>Parent App Not Available</Text>
          <Text style={styles.message}>
            The parent mobile app is no longer available. You will receive attendance updates via WhatsApp.
          </Text>
          <Text style={styles.subMessage}>
            If you have any questions, please contact the school.
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleLogout}>
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#4F46E5" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  messageBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    maxWidth: 320,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  subMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
