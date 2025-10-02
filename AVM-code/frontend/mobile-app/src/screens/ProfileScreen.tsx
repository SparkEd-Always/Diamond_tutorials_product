import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';

import { AppDispatch, RootState } from '../store';
import { logout } from '../store/slices/authSlice';

const ProfileScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      // Use window.confirm for web
      if (window.confirm('Are you sure you want to logout?')) {
        dispatch(logout());
      }
    } else {
      // Use Alert.alert for native
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Logout',
            style: 'destructive',
            onPress: () => dispatch(logout()),
          },
        ]
      );
    }
  };

  const ProfileItem = ({
    icon,
    title,
    value,
    onPress
  }: {
    icon: keyof typeof MaterialIcons.glyphMap;
    title: string;
    value?: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity
      style={styles.profileItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.profileItemLeft}>
        <MaterialIcons name={icon} size={24} color="#4F46E5" />
        <View style={styles.profileItemText}>
          <Text style={styles.profileItemTitle}>{title}</Text>
          {value && <Text style={styles.profileItemValue}>{value}</Text>}
        </View>
      </View>
      {onPress && (
        <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.profilePicture}>
          <MaterialIcons name="person" size={40} color="#4F46E5" />
        </View>
        <Text style={styles.userName}>{user?.full_name}</Text>
        <Text style={styles.userRole}>{user?.role?.toUpperCase()}</Text>
        <Text style={styles.userId}>{user?.unique_id}</Text>
      </View>

      {/* Profile Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile Information</Text>

        <ProfileItem
          icon="person"
          title="Full Name"
          value={user?.full_name}
        />

        <ProfileItem
          icon="email"
          title="Email"
          value={user?.email}
        />

        <ProfileItem
          icon="badge"
          title="Employee ID"
          value={user?.unique_id}
        />

        <ProfileItem
          icon="work"
          title="Role"
          value={user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
        />
      </View>

      {/* App Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Application</Text>

        <ProfileItem
          icon="info"
          title="About AVM Tutorial"
          onPress={() => {
            if (Platform.OS === 'web') {
              alert('AVM Tutorial Teacher App\n\nVersion 1.0.0\n\nThis app helps teachers mark attendance efficiently and communicate with the administration.');
            } else {
              Alert.alert(
                'AVM Tutorial Teacher App',
                'Version 1.0.0\n\nThis app helps teachers mark attendance efficiently and communicate with the administration.',
                [{ text: 'OK' }]
              );
            }
          }}
        />

        <ProfileItem
          icon="help"
          title="Help & Support"
          onPress={() => {
            if (Platform.OS === 'web') {
              alert('Help & Support\n\nFor technical support, please contact the school administration.');
            } else {
              Alert.alert(
                'Help & Support',
                'For technical support, please contact the school administration.',
                [{ text: 'OK' }]
              );
            }
          }}
        />

        <ProfileItem
          icon="security"
          title="Privacy Policy"
          onPress={() => {
            if (Platform.OS === 'web') {
              alert('Privacy Policy\n\nYour data is secure and only used for educational purposes within AVM Tutorial.');
            } else {
              Alert.alert(
                'Privacy Policy',
                'Your data is secure and only used for educational purposes within AVM Tutorial.',
                [{ text: 'OK' }]
              );
            }
          }}
        />
      </View>

      {/* System Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>System Status</Text>

        <View style={styles.statusCard}>
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.statusText}>API Connected</Text>
          </View>

          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.statusText}>Data Synced</Text>
          </View>
        </View>
      </View>

      {/* Logout Section */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialIcons name="logout" size={24} color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          AVM Tutorial Management System
        </Text>
        <Text style={styles.footerVersion}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: '#C7D2FE',
    marginBottom: 4,
  },
  userId: {
    fontSize: 12,
    color: '#E0E7FF',
  },
  section: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  profileItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileItemText: {
    marginLeft: 16,
    flex: 1,
  },
  profileItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  profileItemValue: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  statusText: {
    fontSize: 14,
    color: '#6B7280',
  },
  logoutButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  footerVersion: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
});

export default ProfileScreen;