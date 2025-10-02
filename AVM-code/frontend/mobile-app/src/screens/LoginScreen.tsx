import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';

import { AppDispatch, RootState } from '../store';
import { login, clearError } from '../store/slices/authSlice';
import { apiService } from '../services/apiService';

const LoginScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  useEffect(() => {
    // Test API connection on component mount
    checkConnection();
  }, []);

  useEffect(() => {
    if (error) {
      if (Platform.OS === 'web') {
        alert(`Login Error: ${error}`);
      } else {
        Alert.alert('Login Error', error);
      }
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const checkConnection = async () => {
    try {
      await apiService.testConnection();
      setConnectionStatus('connected');
    } catch (error) {
      setConnectionStatus('error');
      Alert.alert(
        'Connection Error',
        'Cannot connect to the server. Please check your internet connection and try again.'
      );
    }
  };

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'Please enter both username and password');
      return;
    }

    if (connectionStatus !== 'connected') {
      Alert.alert('Connection Error', 'Please check your connection and try again');
      return;
    }

    dispatch(login({ username: username.trim(), password }));
  };

  const renderConnectionStatus = () => {
    switch (connectionStatus) {
      case 'checking':
        return (
          <View style={styles.connectionStatus}>
            <ActivityIndicator size="small" color="#4F46E5" />
            <Text style={styles.connectionText}>Connecting to server...</Text>
          </View>
        );
      case 'connected':
        return (
          <View style={[styles.connectionStatus, styles.connectedStatus]}>
            <MaterialIcons name="check-circle" size={16} color="#10B981" />
            <Text style={[styles.connectionText, { color: '#10B981' }]}>
              Connected to AVM Tutorial Server
            </Text>
          </View>
        );
      case 'error':
        return (
          <View style={[styles.connectionStatus, styles.errorStatus]}>
            <MaterialIcons name="error" size={16} color="#EF4444" />
            <Text style={[styles.connectionText, { color: '#EF4444' }]}>
              Connection failed
            </Text>
            <TouchableOpacity onPress={checkConnection} style={styles.retryButton}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <MaterialIcons name="school" size={60} color="#4F46E5" />
          </View>
          <Text style={styles.title}>AVM Tutorial</Text>
          <Text style={styles.subtitle}>Teacher Portal</Text>
        </View>

        {/* Connection Status - only show if checking or error */}
        {connectionStatus !== 'connected' && renderConnectionStatus()}

        {/* Login Form */}
        <View style={styles.form}>
          <Text style={styles.formTitle}>Sign In to Continue</Text>

          <View style={styles.inputContainer}>
            <MaterialIcons name="person" size={20} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Username, Email, or Phone"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <MaterialIcons name="lock" size={20} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              editable={!isLoading}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <MaterialIcons
                name={showPassword ? 'visibility' : 'visibility-off'}
                size={20}
                color="#6B7280"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.loginButton,
              (isLoading || connectionStatus !== 'connected') && styles.disabledButton
            ]}
            onPress={handleLogin}
            disabled={isLoading || connectionStatus !== 'connected'}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

        </View>

        {/* Papaya Production Branding */}
        <View style={styles.branding}>
          <Text style={styles.brandingText}>A Papaya Production</Text>
          <Text style={styles.copyrightText}>© 2025 All Rights Reserved</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  connectedStatus: {
    backgroundColor: '#F0FDF4',
  },
  errorStatus: {
    backgroundColor: '#FEF2F2',
  },
  connectionText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  retryButton: {
    marginLeft: 10,
    padding: 4,
  },
  retryText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '500',
  },
  form: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
  },
  inputIcon: {
    marginLeft: 12,
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  eyeIcon: {
    padding: 12,
  },
  loginButton: {
    backgroundColor: '#4F46E5',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  branding: {
    alignItems: 'center',
    marginTop: 30,
    paddingVertical: 15,
    backgroundColor: '#FFF4E6',
    borderRadius: 8,
  },
  brandingText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
});

export default LoginScreen;