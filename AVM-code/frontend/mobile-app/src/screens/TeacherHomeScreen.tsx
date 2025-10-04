import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TeacherHomeScreen({ navigation }: any) {
  const [user, setUser] = useState<any>(null);
  const [showClassesModal, setShowClassesModal] = useState(false);
  const [showSubjectsModal, setShowSubjectsModal] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

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
            // Only clear token and user data, keep PIN/biometric settings
            await AsyncStorage.multiRemove(['access_token', 'user_type', 'user']);
            navigation.replace('PINLogin');
          },
        },
      ]
    );
  };

  const MenuCard = ({ title, subtitle, icon, onPress }: any) => (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.cardIcon}>{icon}</Text>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSubtitle}>{subtitle}</Text>
      </View>
      <Text style={styles.cardArrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.name}>{user?.full_name || 'Teacher'}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Stats - NOW TAPPABLE */}
        <View style={styles.statsContainer}>
          <TouchableOpacity
            style={styles.statBox}
            onPress={() => setShowClassesModal(true)}
          >
            <Text style={styles.statNumber}>
              {user?.classes?.length || 0}
            </Text>
            <Text style={styles.statLabel}>Classes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.statBox}
            onPress={() => setShowSubjectsModal(true)}
          >
            <Text style={styles.statNumber}>
              {user?.subjects?.length || 0}
            </Text>
            <Text style={styles.statLabel}>Subjects</Text>
          </TouchableOpacity>
        </View>

        {/* Menu Cards */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <MenuCard
            icon="📋"
            title="Mark Attendance"
            subtitle="Take student attendance"
            onPress={() => navigation.navigate('Attendance')}
          />

          <MenuCard
            icon="👥"
            title="My Students"
            subtitle="View student list and details"
            onPress={() => navigation.navigate('Students')}
          />

          <MenuCard
            icon="📜"
            title="Attendance History"
            subtitle="View past attendance records"
            onPress={() => navigation.navigate('AttendanceHistory')}
          />

          <MenuCard
            icon="📨"
            title="Messages"
            subtitle="School announcements and updates"
            onPress={() => navigation.navigate('Messages')}
          />

          <MenuCard
            icon="👤"
            title="My Profile"
            subtitle="View and edit your profile"
            onPress={() => navigation.navigate('Profile')}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>AVM Tutorials Teacher App v1.0</Text>
        </View>
      </ScrollView>

      {/* Classes Modal */}
      <Modal
        visible={showClassesModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowClassesModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowClassesModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>My Classes</Text>
            {user?.classes && user.classes.length > 0 ? (
              user.classes.map((cls: string, index: number) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.listItemIcon}>🏫</Text>
                  <Text style={styles.listItemText}>{cls}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No classes assigned</Text>
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowClassesModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Subjects Modal */}
      <Modal
        visible={showSubjectsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSubjectsModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSubjectsModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>My Subjects</Text>
            {user?.subjects && user.subjects.length > 0 ? (
              user.subjects.map((subject: string, index: number) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.listItemIcon}>📚</Text>
                  <Text style={styles.listItemText}>{subject}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No subjects assigned</Text>
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowSubjectsModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
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
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  menuSection: {
    padding: 16,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  card: {
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
  cardIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  cardArrow: {
    fontSize: 24,
    color: '#ccc',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  listItemIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  listItemText: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    padding: 20,
  },
  closeButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
