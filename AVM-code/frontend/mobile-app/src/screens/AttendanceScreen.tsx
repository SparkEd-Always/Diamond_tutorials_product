import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';

// Use localhost with adb reverse for Android emulator, 192.168.1.4 for physical devices
const API_BASE_URL = 'http://localhost:8000/api/v1';

interface StudentAttendance {
  id: number;
  unique_id: string;
  full_name: string;
  class_name: string;
  section: string;
  status: 'present' | 'absent' | 'late' | 'leave' | null;
  remarks?: string;
}

export default function AttendanceScreen({ navigation }: any) {
  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [showClassPicker, setShowClassPicker] = useState(false);
  const [remarksModalVisible, setRemarksModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentAttendance | null>(null);
  const [remarksText, setRemarksText] = useState('');
  const [classes, setClasses] = useState<string[]>(['All']);
  const selectedDate = new Date();

  useEffect(() => {
    loadUserAndStudents();
  }, []);

  const loadUserAndStudents = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }

      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        navigation.replace('Login');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/students/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const studentsData = response.data.map((student: any) => ({
        id: student.id,
        unique_id: student.unique_id,
        full_name: student.full_name,
        class_name: student.class_name,
        section: student.section,
        status: null as StudentAttendance['status'],
        remarks: '',
      }));

      setStudents(studentsData);

      // Extract unique classes
      const uniqueClasses = Array.from(
        new Set(studentsData.map((s: any) => s.class_name).filter(Boolean))
      );
      setClasses(['All', ...uniqueClasses.sort()]);
    } catch (error: any) {
      console.error('Error loading students:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.unique_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = selectedClass === 'All' || student.class_name === selectedClass;
    return matchesSearch && matchesClass;
  });

  const handleStatusChange = (studentId: number, status: StudentAttendance['status']) => {
    setStudents((prev) =>
      prev.map((student) => (student.id === studentId ? { ...student, status } : student))
    );
  };

  const handleRemarksPress = (student: StudentAttendance) => {
    setSelectedStudent(student);
    setRemarksText(student.remarks || '');
    setRemarksModalVisible(true);
  };

  const saveRemarks = () => {
    if (selectedStudent) {
      setStudents((prev) =>
        prev.map((student) =>
          student.id === selectedStudent.id ? { ...student, remarks: remarksText } : student
        )
      );
    }
    setRemarksModalVisible(false);
    setSelectedStudent(null);
    setRemarksText('');
  };

  const handleSubmitAttendance = async () => {
    const attendanceData = students
      .filter((student) => student.status !== null)
      .map((student) => ({
        student_id: student.id,
        status: student.status as string,
        remarks: student.remarks || '',
      }));

    if (attendanceData.length === 0) {
      Alert.alert('No Attendance', 'Please mark attendance for at least one student');
      return;
    }

    Alert.alert(
      'Submit Attendance',
      `Submit attendance for ${attendanceData.length} students?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: async () => {
            setSubmitting(true);
            try {
              const token = await AsyncStorage.getItem('access_token');
              const formattedDate = selectedDate.toISOString().split('T')[0];

              await axios.post(
                `${API_BASE_URL}/attendance/mark`,
                {
                  date: formattedDate,
                  student_records: attendanceData,
                },
                { headers: { Authorization: `Bearer ${token}` } }
              );

              Alert.alert('Success', 'Attendance submitted successfully! Status remains visible for your reference.');
            } catch (error: any) {
              console.error('Error submitting attendance:', error.response?.data || error.message);
              const errorMessage = error.response?.data?.detail || 'Failed to submit attendance';
              // Show clean error message without status code prefix
              Alert.alert('Attendance Submission', errorMessage);
            } finally {
              setSubmitting(false);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: StudentAttendance['status']) => {
    switch (status) {
      case 'present':
        return '#10B981';
      case 'absent':
        return '#EF4444';
      case 'late':
        return '#F59E0B';
      case 'leave':
        return '#3B82F6';
      default:
        return '#9CA3AF';
    }
  };

  const renderStudentItem = ({ item }: { item: StudentAttendance }) => {
    const statuses: StudentAttendance['status'][] = ['present', 'absent', 'late', 'leave'];

    return (
      <View style={styles.studentCard}>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{item.full_name}</Text>
          <Text style={styles.studentDetails}>
            {item.unique_id} • {item.class_name}
          </Text>
        </View>

        <View style={styles.statusButtons}>
          {statuses.map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.statusButton,
                { backgroundColor: item.status === status ? getStatusColor(status) : '#F3F4F6' },
              ]}
              onPress={() => handleStatusChange(item.id, status)}
            >
              <Text
                style={[
                  styles.statusButtonText,
                  { color: item.status === status ? '#FFFFFF' : '#6B7280' },
                ]}
              >
                {status?.charAt(0).toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.remarksButton} onPress={() => handleRemarksPress(item)}>
          <MaterialIcons name="comment" size={20} color={item.remarks ? '#4F46E5' : '#9CA3AF'} />
          <Text style={[styles.remarksButtonText, { color: item.remarks ? '#4F46E5' : '#9CA3AF' }]}>
            {item.remarks ? 'Edit Note' : 'Add Note'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
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
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Mark Attendance</Text>
          <Text style={styles.headerDate}>
            {selectedDate.toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </Text>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or ID..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={styles.classSelector} onPress={() => setShowClassPicker(true)}>
          <MaterialIcons name="class" size={20} color="#4F46E5" />
          <Text style={styles.classSelectorText}>{selectedClass}</Text>
          <MaterialIcons name="arrow-drop-down" size={20} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      <View style={styles.resultsCount}>
        <Text style={styles.resultsCountText}>{filteredStudents.length} students</Text>
      </View>

      {/* Students List */}
      <FlatList
        data={filteredStudents}
        renderItem={renderStudentItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.studentsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="search-off" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>No students found</Text>
          </View>
        }
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
                    {className}
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

      {/* Submit Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.disabledButton]}
          onPress={handleSubmitAttendance}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <MaterialIcons name="send" size={20} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>Submit Attendance</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Remarks Modal */}
      <Modal visible={remarksModalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Note for {selectedStudent?.full_name}</Text>
            <TouchableOpacity onPress={() => setRemarksModalVisible(false)}>
              <MaterialIcons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.remarksInput}
            placeholder="Enter remarks (optional)"
            value={remarksText}
            onChangeText={setRemarksText}
            multiline
            numberOfLines={4}
            maxLength={200}
          />

          <Text style={styles.characterCount}>{remarksText.length}/200</Text>

          <TouchableOpacity style={styles.saveButton} onPress={saveRemarks}>
            <Text style={styles.saveButtonText}>Save Note</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
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
    padding: 20,
    paddingTop: 60,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerDate: {
    fontSize: 14,
    color: '#C7D2FE',
    marginTop: 4,
  },
  filtersContainer: {
    padding: 16,
    gap: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1F2937',
  },
  classSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  classSelectorText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#4F46E5',
  },
  resultsCount: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  resultsCountText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  studentsList: {
    flex: 1,
    padding: 16,
  },
  studentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  studentInfo: {
    marginBottom: 12,
  },
  studentName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  studentDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  statusButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statusButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  remarksButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  remarksButtonText: {
    fontSize: 14,
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12,
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
  buttonContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  submitButton: {
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  remarksInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  characterCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
  },
  saveButton: {
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
