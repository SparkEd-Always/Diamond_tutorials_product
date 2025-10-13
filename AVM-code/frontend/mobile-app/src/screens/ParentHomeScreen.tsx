import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearAuthData } from '../utils/secureStorage';

export default function ParentHomeScreen({ navigation, route }: any) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadUser();

    // Check if we need to navigate to a specific screen from notification
    const navigateTo = route?.params?.navigateTo;
    if (navigateTo) {
      console.log('📍 Auto-navigating to:', navigateTo);
      // Small delay to ensure screen is loaded
      setTimeout(() => {
        navigation.navigate(navigateTo);
      }, 300);
    }
  }, [route?.params?.navigateTo]);

  const loadUser = async () => {
    const userData = await AsyncStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            // Clear all auth data including PIN
            await clearAuthData();
            // Navigate back to OTP login screen
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  const ChildCard = ({ child }: any) => (
    <View style={styles.childCard}>
      <View style={styles.childAvatar}>
        <Text style={styles.childAvatarText}>
          {child.full_name?.charAt(0) || '👤'}
        </Text>
      </View>
      <View style={styles.childInfo}>
        <Text style={styles.childName}>{child.full_name}</Text>
        <Text style={styles.childClass}>
          {child.class_name} {child.section && child.section !== 'A' ? `- ${child.section}` : ''}
        </Text>
        <Text style={styles.childId}>ID: {child.unique_id}</Text>
      </View>
    </View>
  );

  const MenuCard = ({ title, subtitle, icon, onPress, badge }: any) => (
    <TouchableOpacity style={styles.menuCard} onPress={onPress}>
      <Text style={styles.menuIcon}>{icon}</Text>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      </View>
      {badge !== undefined && badge !== null && badge > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{String(badge)}</Text>
        </View>
      )}
      <Text style={styles.menuArrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome,</Text>
          <Text style={styles.name}>{user?.name || 'Parent'}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Children Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Children</Text>
          {user?.children?.map((child: any) => (
            <ChildCard key={child.id} child={child} />
          ))}
          {(!user?.children || user.children.length === 0) && (
            <Text style={styles.emptyText}>No children registered</Text>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <MenuCard
            icon="📨"
            title="Messages"
            subtitle="School announcements and updates"
            badge={0}
            onPress={() => navigation.navigate('Messages')}
          />

          <MenuCard
            icon="📋"
            title="Attendance"
            subtitle="View attendance history"
            onPress={() => navigation.navigate('AttendanceHistory')}
          />
        </View>

        {/* Coming Soon */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Coming Soon</Text>

          <MenuCard
            icon="📚"
            title="Homework"
            subtitle="View and submit homework"
            onPress={() => Alert.alert('Coming Soon', 'Homework feature')}
          />

          <MenuCard
            icon="💰"
            title="Fees"
            subtitle="View and pay school fees"
            onPress={() => Alert.alert('Coming Soon', 'Fees feature')}
          />

          <MenuCard
            icon="📅"
            title="Events"
            subtitle="School events and calendar"
            onPress={() => Alert.alert('Coming Soon', 'Events feature')}
          />
        </View>

        {/* Contact */}
        <View style={styles.contactCard}>
          <Text style={styles.contactIcon}>📞</Text>
          <View style={styles.contactInfo}>
            <Text style={styles.contactTitle}>Need Help?</Text>
            <Text style={styles.contactText}>
              Contact school administration
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>AVM Tutorials Parent App v1.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#34C759',
    padding: 24,
    paddingTop: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  childCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  childAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#34C759',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  childAvatarText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  childClass: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  childId: {
    fontSize: 12,
    color: '#999',
  },
  viewButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    padding: 32,
  },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  badge: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  menuArrow: {
    fontSize: 24,
    color: '#ccc',
  },
  contactCard: {
    backgroundColor: '#34C759',
    borderRadius: 12,
    padding: 20,
    margin: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  contactText: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});
