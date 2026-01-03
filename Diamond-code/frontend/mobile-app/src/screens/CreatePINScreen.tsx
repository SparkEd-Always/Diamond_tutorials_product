import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Vibration,
  BackHandler,
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { savePIN, setBiometricEnabled, updateLastLogin } from '../utils/secureStorage';

export default function CreatePINScreen({ navigation, route }: any) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [stage, setStage] = useState<'create' | 'confirm'>('create');

  const { fromSetup, showBiometricOption, enableBiometric, isReset } = route.params || {};

  const handleNumberPress = (num: string) => {
    if (stage === 'create') {
      if (pin.length < 4) {
        setPin(pin + num);
        if (pin.length === 3) {
          // PIN complete, move to confirm
          setTimeout(() => setStage('confirm'), 300);
        }
      }
    } else {
      if (confirmPin.length < 4) {
        const newConfirmPin = confirmPin + num;
        setConfirmPin(newConfirmPin);
        if (newConfirmPin.length === 4) {
          // Confirm PIN complete, validate
          setTimeout(() => validatePIN(newConfirmPin), 300);
        }
      }
    }
  };

  const handleDelete = () => {
    if (stage === 'create') {
      setPin(pin.slice(0, -1));
    } else {
      setConfirmPin(confirmPin.slice(0, -1));
    }
  };

  const validatePIN = async (confirmedPin: string) => {
    if (pin !== confirmedPin) {
      Vibration.vibrate(500);
      Alert.alert(
        'PIN Mismatch',
        'The PINs you entered do not match. Please try again.',
        [
          {
            text: 'OK',
            onPress: () => {
              setPin('');
              setConfirmPin('');
              setStage('create');
            },
          },
        ]
      );
      return;
    }

    try {
      // Save PIN
      await savePIN(pin);
      await updateLastLogin();

      // Check if should enable biometric
      if (enableBiometric) {
        await setBiometricEnabled(true);
        navigateNext();
      } else if (showBiometricOption) {
        // Ask if user wants to enable biometric
        Alert.alert(
          'Enable Biometric Login?',
          'Would you also like to use Face ID/Fingerprint for login?',
          [
            {
              text: 'No, thanks',
              style: 'cancel',
              onPress: navigateNext,
            },
            {
              text: 'Yes, enable',
              onPress: async () => {
                const result = await LocalAuthentication.authenticateAsync({
                  promptMessage: 'Enable biometric authentication',
                  cancelLabel: 'Skip',
                });
                if (result.success) {
                  await setBiometricEnabled(true);
                }
                navigateNext();
              },
            },
          ]
        );
      } else {
        navigateNext();
      }
    } catch (error) {
      console.error('PIN save error:', error);
      Alert.alert('Error', 'Failed to save PIN. Please try again.');
    }
  };

  const navigateNext = () => {
    if (isReset) {
      // If resetting PIN, close the app after user clicks OK
      Alert.alert(
        'PIN Updated Successfully',
        'The app will now close. Please reopen it to login with your new PIN.',
        [
          {
            text: 'OK',
            onPress: () => BackHandler.exitApp(),
          },
        ]
      );
    } else {
      // Navigate to home based on user type
      navigation.replace('NavigateHome');
    }
  };

  const renderDots = () => {
    const currentPin = stage === 'create' ? pin : confirmPin;
    return (
      <View style={styles.dotsContainer}>
        {[0, 1, 2, 3].map((index) => (
          <View
            key={index}
            style={[
              styles.dot,
              currentPin.length > index && styles.dotFilled,
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
      ['', '0', 'delete'],
    ];

    return (
      <View style={styles.keypad}>
        {numbers.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keypadRow}>
            {row.map((num) => {
              if (num === '') {
                return <View key="empty" style={styles.keyButton} />;
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
                >
                  <Text style={styles.keyText}>{num}</Text>
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
          <Text style={styles.logo}>🔐</Text>
          <Text style={styles.title}>
            {stage === 'create' ? 'Create Your PIN' : 'Confirm Your PIN'}
          </Text>
          <Text style={styles.subtitle}>
            {stage === 'create'
              ? 'Enter a 4-digit PIN you\'ll remember'
              : 'Enter your PIN again to confirm'}
          </Text>
        </View>

        {/* PIN Dots */}
        {renderDots()}

        {/* Keypad */}
        {renderKeypad()}
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
  logo: {
    fontSize: 48,
    marginBottom: 16,
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
  deleteText: {
    fontSize: 28,
    color: '#6B7280',
  },
});
