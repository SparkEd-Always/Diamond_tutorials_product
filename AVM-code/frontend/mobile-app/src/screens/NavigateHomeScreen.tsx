import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/secureStorage';

export default function NavigateHomeScreen({ navigation }: any) {
  useEffect(() => {
    navigateToHome();
  }, []);

  const navigateToHome = async () => {
    try {
      const userType = await AsyncStorage.getItem(STORAGE_KEYS.USER_TYPE);

      if (userType === 'teacher') {
        navigation.replace('TeacherHome');
      } else {
        navigation.replace('ParentHome');
      }
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback to login if something goes wrong
      navigation.replace('Login');
    }
  };

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
  },
});
