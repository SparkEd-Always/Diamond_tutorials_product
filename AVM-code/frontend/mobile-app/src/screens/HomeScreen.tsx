import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { AppDispatch, RootState } from '../store';
import { fetchStudents } from '../store/slices/studentsSlice';

const HomeScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<any>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { students, isLoading } = useSelector((state: RootState) => state.students);

  useEffect(() => {
    dispatch(fetchStudents());
  }, [dispatch]);

  const onRefresh = () => {
    dispatch(fetchStudents());
  };

  const todayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const getClassGroups = () => {
    const groups: { [key: string]: number } = {};
    students.forEach(student => {
      const classKey = `${student.class_name} ${student.section}`;
      groups[classKey] = (groups[classKey] || 0) + 1;
    });
    return groups;
  };

  const classGroups = getClassGroups();

  const StatCard = ({ title, value, icon, color }: {
    title: string;
    value: string | number;
    icon: keyof typeof MaterialIcons.glyphMap;
    color: string;
  }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color }]}>
        <MaterialIcons name={icon} size={24} color="#FFFFFF" />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </View>
  );

  const QuickActionCard = ({ title, description, icon, onPress, color }: {
    title: string;
    description: string;
    icon: keyof typeof MaterialIcons.glyphMap;
    onPress: () => void;
    color: string;
  }) => (
    <TouchableOpacity style={styles.quickActionCard} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: color }]}>
        <MaterialIcons name={icon} size={28} color="#FFFFFF" />
      </View>
      <View style={styles.quickActionContent}>
        <Text style={styles.quickActionTitle}>{title}</Text>
        <Text style={styles.quickActionDescription}>{description}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
      }
    >
      {/* Welcome Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.full_name}</Text>
          <Text style={styles.dateText}>{todayDate}</Text>
        </View>
        <View style={styles.profilePicture}>
          <MaterialIcons name="person" size={32} color="#4F46E5" />
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <StatCard
          title="Total Students"
          value={students.length}
          icon="people"
          color="#4F46E5"
        />
        <StatCard
          title="Classes"
          value={Object.keys(classGroups).length}
          icon="class"
          color="#10B981"
        />
      </View>

      {/* Class Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Class Distribution</Text>
        <View style={styles.classBreakdown}>
          {Object.entries(classGroups).map(([className, count]) => (
            <View key={className} style={styles.classCard}>
              <Text style={styles.className}>{className}</Text>
              <Text style={styles.classCount}>{count} students</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <QuickActionCard
          title="Mark Attendance"
          description="Mark today's attendance for your students"
          icon="how-to-reg"
          color="#EF4444"
          onPress={() => navigation.navigate('Attendance')}
        />
        <QuickActionCard
          title="View Students"
          description="Browse and manage student information"
          icon="people"
          color="#3B82F6"
          onPress={() => navigation.navigate('Students')}
        />
        <QuickActionCard
          title="Attendance History"
          description="View past attendance records"
          icon="history"
          color="#8B5CF6"
          onPress={() => navigation.navigate('AttendanceHistory')}
        />
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Summary</Text>
        <View style={styles.summaryCard}>
          <MaterialIcons name="info" size={20} color="#6B7280" />
          <Text style={styles.summaryText}>
            Ready to mark attendance for {students.length} students across {Object.keys(classGroups).length} classes.
          </Text>
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#4F46E5',
  },
  welcomeText: {
    fontSize: 16,
    color: '#E0E7FF',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 4,
  },
  dateText: {
    fontSize: 14,
    color: '#C7D2FE',
    marginTop: 4,
  },
  profilePicture: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statTitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  classBreakdown: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  classCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    minWidth: 100,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  className: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
  classCount: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  quickActionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  quickActionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryText: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 12,
    lineHeight: 20,
  },
});

export default HomeScreen;