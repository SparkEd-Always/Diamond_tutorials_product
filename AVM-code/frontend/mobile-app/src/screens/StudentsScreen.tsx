import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';

// Use localhost with adb reverse for Android emulator, 192.168.1.4 for physical devices
const API_BASE_URL = 'http://localhost:8000/api/v1';

interface Student {
  id: number;
  unique_id: string;
  full_name: string;
  class_name: string;
  section: string;
  parent_phone: string;
  parent_name: string;
}

export default function StudentsScreen({ navigation }: any) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [showClassPicker, setShowClassPicker] = useState(false);
  const [classes, setClasses] = useState<string[]>(['All']);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      console.log('[StudentsScreen] Token from AsyncStorage:', token ? `${token.substring(0, 20)}...` : 'NULL');

      if (!token) {
        console.log('[StudentsScreen] No token found, redirecting to login');
        navigation.replace('Login');
        return;
      }

      console.log('[StudentsScreen] Making API call to:', `${API_BASE_URL}/students/`);
      const response = await axios.get(`${API_BASE_URL}/students/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('[StudentsScreen] API call successful, got', response.data.length, 'students');

      setStudents(response.data);

      // Extract unique classes from students (DYNAMIC)
      const uniqueClasses = Array.from(
        new Set(response.data.map((s: Student) => s.class_name).filter(Boolean))
      );
      setClasses(['All', ...uniqueClasses.sort()]);
    } catch (error: any) {
      console.error('Error loading students:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to load students');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadStudents();
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.unique_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.class_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.section.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesClass = selectedClass === 'All' || student.class_name === selectedClass;

    return matchesSearch && matchesClass;
  });

  const renderStudentItem = ({ item }: { item: Student }) => (
    <View style={styles.studentCard}>
      <View style={styles.studentAvatar}>
        <Text style={styles.avatarText}>
          {item.full_name
            .split(' ')
            .map((name) => name[0])
            .join('')
            .toUpperCase()
            .substring(0, 2)}
        </Text>
      </View>

      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{item.full_name}</Text>
        <Text style={styles.studentId}>{item.unique_id}</Text>
        <Text style={styles.studentClass}>
          {item.class_name}
        </Text>
      </View>

      <View style={styles.parentInfo}>
        <View style={styles.parentContact}>
          <MaterialIcons name="person" size={16} color="#6B7280" />
          <Text style={styles.parentName} numberOfLines={1}>
            {item.parent_name}
          </Text>
        </View>
        <View style={styles.parentContact}>
          <MaterialIcons name="phone" size={16} color="#6B7280" />
          <Text style={styles.parentPhone}>{item.parent_phone}</Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading students...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Students</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search students..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <MaterialIcons name="clear" size={20} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>

      {/* Class Filter */}
      <View style={styles.filterContainer}>
        <TouchableOpacity style={styles.classFilterButton} onPress={() => setShowClassPicker(true)}>
          <MaterialIcons name="filter-list" size={20} color="#4F46E5" />
          <Text style={styles.classFilterText}>
            {selectedClass === 'All' ? 'All Classes' : selectedClass}
          </Text>
          <MaterialIcons name="arrow-drop-down" size={20} color="#4F46E5" />
        </TouchableOpacity>

        <Text style={styles.resultsCount}>
          {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Stats Summary (only when no search) */}
      {searchQuery.trim() === '' && selectedClass === 'All' && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{students.length}</Text>
            <Text style={styles.statLabel}>Total Students</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{classes.length - 1}</Text>
            <Text style={styles.statLabel}>Classes</Text>
          </View>
        </View>
      )}

      {/* Students List */}
      <FlatList
        data={filteredStudents}
        renderItem={renderStudentItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.studentsList}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4F46E5']} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="people-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>
              {searchQuery.trim() !== '' ? 'No students found' : 'No students available'}
            </Text>
            <Text style={styles.emptyDescription}>
              {searchQuery.trim() !== ''
                ? 'Try adjusting your search terms'
                : 'Students will appear here once they are added to the system'}
            </Text>
          </View>
        )}
      />

      {/* Class Picker Modal */}
      <Modal visible={showClassPicker} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowClassPicker(false)}
        >
          <View style={styles.pickerModal}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Class</Text>
              <TouchableOpacity onPress={() => setShowClassPicker(false)}>
                <MaterialIcons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {classes.map((className) => (
                <TouchableOpacity
                  key={className}
                  style={[
                    styles.pickerItem,
                    selectedClass === className && styles.pickerItemSelected,
                  ]}
                  onPress={() => {
                    setSelectedClass(className);
                    setShowClassPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      selectedClass === className && styles.pickerItemTextSelected,
                    ]}
                  >
                    {className === 'All' ? 'All Classes' : className}
                  </Text>
                  {selectedClass === className && (
                    <MaterialIcons name="check" size={24} color="#4F46E5" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#1F2937',
  },
  clearButton: {
    padding: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  classFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  classFilterText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
    marginRight: 4,
  },
  resultsCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  studentsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  studentCard: {
    backgroundColor: '#FFFFFF',
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
  studentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  studentId: {
    fontSize: 12,
    color: '#4F46E5',
    marginTop: 2,
  },
  studentClass: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  parentInfo: {
    alignItems: 'flex-end',
  },
  parentContact: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  parentName: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
    maxWidth: 100,
  },
  parentPhone: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
    fontFamily: 'monospace',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
    maxHeight: '50%',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  pickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  pickerItemSelected: {
    backgroundColor: '#EEF2FF',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#1F2937',
  },
  pickerItemTextSelected: {
    fontWeight: '600',
    color: '#4F46E5',
  },
});
