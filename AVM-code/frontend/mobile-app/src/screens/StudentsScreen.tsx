import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';

import { AppDispatch, RootState } from '../store';
import { fetchStudents } from '../store/slices/studentsSlice';

interface Student {
  id: number;
  unique_id: string;
  full_name: string;
  class_name: string;
  section: string;
  parent_phone: string;
  parent_name: string;
}

const StudentsScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { students, isLoading } = useSelector((state: RootState) => state.students);

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);

  useEffect(() => {
    dispatch(fetchStudents());
  }, [dispatch]);

  useEffect(() => {
    // Filter students based on search query
    if (searchQuery.trim() === '') {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(student =>
        student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.unique_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.class_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.section.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  }, [students, searchQuery]);

  const onRefresh = () => {
    dispatch(fetchStudents());
  };

  const renderStudentItem = ({ item }: { item: Student }) => (
    <View style={styles.studentCard}>
      <View style={styles.studentAvatar}>
        <Text style={styles.avatarText}>
          {item.full_name.split(' ').map(name => name[0]).join('').toUpperCase()}
        </Text>
      </View>

      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{item.full_name}</Text>
        <Text style={styles.studentId}>{item.unique_id}</Text>
        <Text style={styles.studentClass}>
          {item.class_name} {item.section}
        </Text>
      </View>

      <View style={styles.parentInfo}>
        <View style={styles.parentContact}>
          <MaterialIcons name="person" size={16} color="#6B7280" />
          <Text style={styles.parentName}>{item.parent_name}</Text>
        </View>
        <View style={styles.parentContact}>
          <MaterialIcons name="phone" size={16} color="#6B7280" />
          <Text style={styles.parentPhone}>{item.parent_phone}</Text>
        </View>
      </View>
    </View>
  );

  const getClassStats = () => {
    const stats: { [key: string]: number } = {};
    filteredStudents.forEach(student => {
      const classKey = `${student.class_name} ${student.section}`;
      stats[classKey] = (stats[classKey] || 0) + 1;
    });
    return stats;
  };

  const classStats = getClassStats();

  return (
    <View style={styles.container}>
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

      {/* Stats Summary */}
      {searchQuery.trim() === '' && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{students.length}</Text>
            <Text style={styles.statLabel}>Total Students</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{Object.keys(classStats).length}</Text>
            <Text style={styles.statLabel}>Classes</Text>
          </View>
        </View>
      )}

      {/* Search Results Summary */}
      {searchQuery.trim() !== '' && (
        <View style={styles.searchSummary}>
          <Text style={styles.searchResults}>
            {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} found
          </Text>
        </View>
      )}

      {/* Students List */}
      <FlatList
        data={filteredStudents}
        renderItem={renderStudentItem}
        keyExtractor={item => item.id.toString()}
        style={styles.studentsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="people-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>
              {searchQuery.trim() !== '' ? 'No students found' : 'No students available'}
            </Text>
            <Text style={styles.emptyDescription}>
              {searchQuery.trim() !== ''
                ? 'Try adjusting your search terms'
                : 'Students will appear here once they are added to the system'
              }
            </Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 16,
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
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
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
  searchSummary: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchResults: {
    fontSize: 14,
    color: '#6B7280',
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
});

export default StudentsScreen;