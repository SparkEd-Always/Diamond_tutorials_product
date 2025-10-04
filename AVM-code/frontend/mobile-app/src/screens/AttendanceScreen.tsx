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
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';

import { AppDispatch, RootState } from '../store';
import { fetchStudents } from '../store/slices/studentsSlice';
import { updateStudentAttendance, markAttendance, clearTodayAttendance } from '../store/slices/attendanceSlice';

interface StudentAttendance {
  id: number;
  unique_id: string;
  full_name: string;
  class_name: string;
  section: string;
  status: 'present' | 'absent' | 'late' | 'leave' | null;
  remarks?: string;
}

const AttendanceScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { students, isLoading: studentsLoading } = useSelector((state: RootState) => state.students);
  const { todayAttendance, submitting } = useSelector((state: RootState) => state.attendance);
  const { user } = useSelector((state: RootState) => state.auth);

  const [selectedDate] = useState(new Date()); // Always today's date
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [showClassPicker, setShowClassPicker] = useState(false);
  const [studentAttendanceList, setStudentAttendanceList] = useState<StudentAttendance[]>([]);
  const [remarksModalVisible, setRemarksModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentAttendance | null>(null);
  const [remarksText, setRemarksText] = useState('');
  const [classes, setClasses] = useState<string[]>(['All']);

  useEffect(() => {
    dispatch(fetchStudents());
  }, [dispatch]);

  // Show success/error messages
  useEffect(() => {
    if (submitting === false && !studentsLoading) {
      // Check if submission was successful (no error and attendance list was cleared)
      if (studentAttendanceList.length === 0 && filteredStudents.length > 0) {
        if (Platform.OS === 'web') {
          alert('Attendance submitted successfully! It will be sent to admin for approval.');
        } else {
          Alert.alert(
            'Success',
            'Attendance submitted successfully! It will be sent to admin for approval.',
            [{ text: 'OK' }]
          );
        }
      }
    }
  }, [submitting, studentAttendanceList.length]);

  useEffect(() => {
    // Initialize attendance list when students are loaded
    if (students.length > 0) {
      const attendanceList = students.map(student => ({
        id: student.id,
        unique_id: student.unique_id,
        full_name: student.full_name,
        class_name: student.class_name,
        section: student.section,
        status: null as StudentAttendance['status'],
        remarks: '',
      }));
      setStudentAttendanceList(attendanceList);

      // Extract unique classes from students and populate dropdown
      const uniqueClasses = Array.from(new Set(students.map(s => s.class_name).filter(Boolean)));
      const sortedClasses = uniqueClasses.sort();
      setClasses(['All', ...sortedClasses]);
    }
  }, [students]);

  const filteredStudents = studentAttendanceList.filter(student => {
    const matchesSearch = student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.unique_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = selectedClass === 'All' || student.class_name === selectedClass;
    return matchesSearch && matchesClass;
  });

  const handleStatusChange = (studentId: number, status: StudentAttendance['status']) => {
    setStudentAttendanceList(prev =>
      prev.map(student =>
        student.id === studentId
          ? { ...student, status }
          : student
      )
    );
  };

  const handleRemarksPress = (student: StudentAttendance) => {
    setSelectedStudent(student);
    setRemarksText(student.remarks || '');
    setRemarksModalVisible(true);
  };

  const saveRemarks = () => {
    if (selectedStudent) {
      setStudentAttendanceList(prev =>
        prev.map(student =>
          student.id === selectedStudent.id
            ? { ...student, remarks: remarksText }
            : student
        )
      );
    }
    setRemarksModalVisible(false);
    setSelectedStudent(null);
    setRemarksText('');
  };

  const handleSaveAttendance = () => {
    // Save as draft - can be edited later
    const attendanceData = studentAttendanceList
      .filter(student => student.status !== null)
      .map(student => ({
        student_id: student.id,
        status: student.status as string,
        remarks: student.remarks || '',
      }));

    if (attendanceData.length === 0) {
      if (Platform.OS === 'web') {
        alert('Please mark attendance for at least one student');
      } else {
        Alert.alert('No Attendance', 'Please mark attendance for at least one student');
      }
      return;
    }

    const formattedDate = selectedDate.toISOString().split('T')[0];

    // Dispatch save draft action with is_draft flag
    dispatch(markAttendance({
      attendanceData,
      date: formattedDate,
      is_draft: true  // Mark as draft
    }));
  };

  const handleSubmitAttendance = () => {
    const attendanceData = studentAttendanceList
      .filter(student => student.status !== null)
      .map(student => ({
        student_id: student.id,
        student_name: student.full_name,
        status: student.status!,
        remarks: student.remarks,
      }));

    if (attendanceData.length === 0) {
      if (Platform.OS === 'web') {
        alert('Please mark attendance for at least one student.');
      } else {
        Alert.alert('No Attendance Marked', 'Please mark attendance for at least one student.');
      }
      return;
    }

    const formattedDate = selectedDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD

    const submitAction = () => {
      dispatch(markAttendance({ attendanceData, date: formattedDate }));
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Submit attendance for ${attendanceData.length} students?\n\nNote: This will be sent for admin approval before WhatsApp notifications are sent to parents.`)) {
        submitAction();
      }
    } else {
      Alert.alert(
        'Submit Attendance',
        `Submit attendance for ${attendanceData.length} students?\n\nNote: This will be sent for admin approval before WhatsApp notifications are sent to parents.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Submit',
            onPress: submitAction,
          },
        ]
      );
    }
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

  const getStatusIcon = (status: StudentAttendance['status']) => {
    switch (status) {
      case 'present':
        return 'check-circle';
      case 'absent':
        return 'cancel';
      case 'late':
        return 'schedule';
      case 'leave':
        return 'event-note';
      default:
        return 'radio-button-unchecked';
    }
  };

  const renderAttendanceButtons = (student: StudentAttendance) => {
    const statuses: StudentAttendance['status'][] = ['present', 'absent', 'late', 'leave'];

    return (
      <View style={styles.statusButtons}>
        {statuses.map(status => (
          <TouchableOpacity
            key={status}
            style={[
              styles.statusButton,
              { backgroundColor: student.status === status ? getStatusColor(status) : '#F3F4F6' }
            ]}
            onPress={() => handleStatusChange(student.id, status)}
          >
            <MaterialIcons
              name={getStatusIcon(status)}
              size={20}
              color={student.status === status ? '#FFFFFF' : '#6B7280'}
            />
            <Text
              style={[
                styles.statusButtonText,
                { color: student.status === status ? '#FFFFFF' : '#6B7280' }
              ]}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderStudentItem = ({ item }: { item: StudentAttendance }) => (
    <View style={styles.studentCard}>
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{item.full_name}</Text>
        <Text style={styles.studentDetails}>
          {item.unique_id} • {item.class_name} {item.section}
        </Text>
      </View>

      {renderAttendanceButtons(item)}

      <TouchableOpacity
        style={styles.remarksButton}
        onPress={() => handleRemarksPress(item)}
      >
        <MaterialIcons
          name="comment"
          size={20}
          color={item.remarks ? '#4F46E5' : '#9CA3AF'}
        />
        <Text style={[styles.remarksButtonText, { color: item.remarks ? '#4F46E5' : '#9CA3AF' }]}>
          {item.remarks ? 'Edit Note' : 'Add Note'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (studentsLoading) {
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
        <Text style={styles.headerTitle}>Mark Attendance</Text>
        <Text style={styles.headerTeacher}>Teacher: {user?.full_name}</Text>
        <Text style={styles.headerDate}>
          Today: {selectedDate.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          })}
        </Text>
      </View>

      {/* Filters Section */}
      <View style={styles.filtersContainer}>
        {/* Search Bar */}
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

        {/* Class Selector */}
        <TouchableOpacity
          style={styles.classSelector}
          onPress={() => setShowClassPicker(true)}
        >
          <MaterialIcons name="class" size={20} color="#4F46E5" />
          <Text style={styles.classSelectorText}>{selectedClass}</Text>
          <MaterialIcons name="arrow-drop-down" size={20} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      {/* Results Count */}
      <View style={styles.resultsCount}>
        <Text style={styles.resultsCountText}>
          {filteredStudents.length} students
        </Text>
      </View>

      {/* Students List */}
      <FlatList
        data={filteredStudents}
        renderItem={renderStudentItem}
        keyExtractor={item => item.id.toString()}
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
      <Modal
        visible={showClassPicker}
        transparent
        animationType="slide"
      >
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

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        {/* Save Button (Draft) */}
        <TouchableOpacity
          style={[styles.saveButton, submitting && styles.disabledButton]}
          onPress={handleSaveAttendance}
          disabled={submitting}
        >
          <MaterialIcons name="save" size={20} color="#4F46E5" />
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>

        {/* Submit for Approval Button */}
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
              <Text style={styles.submitButtonText}>Submit for Approval</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Remarks Modal */}
      <Modal
        visible={remarksModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Add Note for {selectedStudent?.full_name}
            </Text>
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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerTeacher: {
    fontSize: 14,
    color: '#C7D2FE',
    marginTop: 4,
  },
  headerDate: {
    fontSize: 14,
    color: '#C7D2FE',
    marginTop: 4,
    marginBottom: 12,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
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
  buttonContainer: {
    flexDirection: 'column',
    gap: 12,
    padding: 16,
    paddingBottom: 24,
  },
  saveButton: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  saveButtonText: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  submitButton: {
    width: '100%',
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
});

export default AttendanceScreen;