import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface AttendanceRecord {
  id: number;
  student_name: string;
  student_unique_id: string;
  class_name: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'leave';
  remarks?: string;
  marked_at: string;
}

const AttendanceHistoryScreen = () => {
  const navigation = useNavigation();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)); // 7 days ago
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showClassPicker, setShowClassPicker] = useState(false);

  const statuses = ['all', 'present', 'absent', 'late', 'leave'];
  const classes = ['all', 'Class 7 A', 'Class 7 B', 'Class 8 A', 'Class 8 B', 'Class 9 A', 'Class 10 A'];

  // Sample data for demonstration since the backend endpoints aren't fully implemented
  const sampleData: AttendanceRecord[] = [
    {
      id: 1,
      student_name: "Rahul Sharma",
      student_unique_id: "AVM-STU-001",
      class_name: "Class 7 A",
      date: "2024-09-28",
      status: "present",
      marked_at: "2024-09-28T09:15:00Z"
    },
    {
      id: 2,
      student_name: "Priya Singh",
      student_unique_id: "AVM-STU-002",
      class_name: "Class 7 A",
      date: "2024-09-28",
      status: "absent",
      remarks: "Sick leave",
      marked_at: "2024-09-28T09:15:00Z"
    },
    {
      id: 3,
      student_name: "Arjun Patel",
      student_unique_id: "AVM-STU-003",
      class_name: "Class 7 A",
      date: "2024-09-27",
      status: "late",
      remarks: "Traffic delay",
      marked_at: "2024-09-27T09:30:00Z"
    },
    {
      id: 4,
      student_name: "Kavya Gupta",
      student_unique_id: "AVM-STU-004",
      class_name: "Class 7 A",
      date: "2024-09-27",
      status: "present",
      marked_at: "2024-09-27T09:15:00Z"
    },
    {
      id: 5,
      student_name: "Rohan Kumar",
      student_unique_id: "AVM-STU-005",
      class_name: "Class 7 A",
      date: "2024-09-26",
      status: "leave",
      remarks: "Family event",
      marked_at: "2024-09-26T09:15:00Z"
    }
  ];

  useEffect(() => {
    loadAttendanceHistory();
  }, []);

  const loadAttendanceHistory = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call when backend is fully implemented
      // const response = await attendanceService.getAttendanceHistory();
      // setAttendanceRecords(response.data);

      // For now, use sample data
      setTimeout(() => {
        setAttendanceRecords(sampleData);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading attendance history:', error);
      setAttendanceRecords(sampleData); // Fallback to sample data
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return '#10B981';
      case 'absent': return '#EF4444';
      case 'late': return '#F59E0B';
      case 'leave': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return 'check-circle';
      case 'absent': return 'cancel';
      case 'late': return 'schedule';
      case 'leave': return 'event-busy';
      default: return 'help';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleStartDateChange = (event: any, date?: Date) => {
    setShowStartDatePicker(false);
    if (date) {
      setStartDate(date);
    }
  };

  const handleEndDateChange = (event: any, date?: Date) => {
    setShowEndDatePicker(false);
    if (date) {
      setEndDate(date);
    }
  };

  // Filter records based on all filters
  const filteredRecords = attendanceRecords.filter(record => {
    const matchesSearch = searchQuery === '' ||
      record.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.student_unique_id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    const matchesClass = classFilter === 'all' || record.class_name === classFilter;

    const recordDate = new Date(record.date);
    const matchesDateRange = recordDate >= startDate && recordDate <= endDate;

    return matchesSearch && matchesStatus && matchesClass && matchesDateRange;
  });

  const renderAttendanceItem = ({ item }: { item: AttendanceRecord }) => (
    <View style={styles.recordCard}>
      <View style={styles.recordHeader}>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{item.student_name}</Text>
          <Text style={styles.studentId}>{item.student_unique_id}</Text>
          <Text style={styles.className}>{item.class_name}</Text>
        </View>
        <View style={styles.dateInfo}>
          <Text style={styles.date}>{formatDate(item.date)}</Text>
        </View>
      </View>

      <View style={styles.statusSection}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <MaterialIcons
            name={getStatusIcon(item.status) as any}
            size={16}
            color="#FFFFFF"
          />
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>

        {item.remarks && (
          <Text style={styles.remarks}>"{item.remarks}"</Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Attendance History</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Filters Section */}
      <View style={styles.filtersContainer}>
        {/* Date Range */}
        <View style={styles.dateRangeContainer}>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowStartDatePicker(true)}
          >
            <MaterialIcons name="calendar-today" size={18} color="#4F46E5" />
            <Text style={styles.dateButtonText}>
              {startDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
            </Text>
          </TouchableOpacity>

          <Text style={styles.dateRangeSeparator}>to</Text>

          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowEndDatePicker(true)}
          >
            <MaterialIcons name="calendar-today" size={18} color="#4F46E5" />
            <Text style={styles.dateButtonText}>
              {endDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
            </Text>
          </TouchableOpacity>
        </View>

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

        {/* Filter Buttons Row */}
        <View style={styles.filterButtonsRow}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowStatusPicker(true)}
          >
            <MaterialIcons name="filter-list" size={18} color="#4F46E5" />
            <Text style={styles.filterButtonText}>
              {statusFilter === 'all' ? 'Status' : statusFilter}
            </Text>
            <MaterialIcons name="arrow-drop-down" size={18} color="#4F46E5" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowClassPicker(true)}
          >
            <MaterialIcons name="class" size={18} color="#4F46E5" />
            <Text style={styles.filterButtonText}>
              {classFilter === 'all' ? 'Class' : classFilter}
            </Text>
            <MaterialIcons name="arrow-drop-down" size={18} color="#4F46E5" />
          </TouchableOpacity>
        </View>

        {/* Results Count */}
        <Text style={styles.resultsCount}>
          {filteredRecords.length} records found
        </Text>
      </View>

      {/* Date Pickers */}
      {showStartDatePicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleStartDateChange}
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleEndDateChange}
        />
      )}

      {/* Status Picker Modal */}
      <Modal
        visible={showStatusPicker}
        transparent
        animationType="slide"
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowStatusPicker(false)}
        >
          <View style={styles.pickerModal}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Status</Text>
              <TouchableOpacity onPress={() => setShowStatusPicker(false)}>
                <MaterialIcons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {statuses.map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.pickerItem,
                    statusFilter === status && styles.pickerItemSelected,
                  ]}
                  onPress={() => {
                    setStatusFilter(status);
                    setShowStatusPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      statusFilter === status && styles.pickerItemTextSelected,
                    ]}
                  >
                    {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                  {statusFilter === status && (
                    <MaterialIcons name="check" size={24} color="#4F46E5" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

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
              {classes.map((cls) => (
                <TouchableOpacity
                  key={cls}
                  style={[
                    styles.pickerItem,
                    classFilter === cls && styles.pickerItemSelected,
                  ]}
                  onPress={() => {
                    setClassFilter(cls);
                    setShowClassPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      classFilter === cls && styles.pickerItemTextSelected,
                    ]}
                  >
                    {cls === 'all' ? 'All Classes' : cls}
                  </Text>
                  {classFilter === cls && (
                    <MaterialIcons name="check" size={24} color="#4F46E5" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Attendance List */}
      <FlatList
        data={filteredRecords}
        renderItem={renderAttendanceItem}
        keyExtractor={item => item.id.toString()}
        style={styles.list}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadAttendanceHistory} />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="history" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No attendance records found</Text>
            <Text style={styles.emptyDescription}>
              Attendance records will appear here once you start marking attendance
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
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  dateRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
    maxWidth: '45%',
  },
  dateButtonText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  dateRangeSeparator: {
    fontSize: 14,
    color: '#6B7280',
    marginHorizontal: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#1F2937',
  },
  filterButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
  },
  filterButtonText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
    marginRight: 4,
    flex: 1,
  },
  resultsCount: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
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
  list: {
    flex: 1,
    padding: 16,
  },
  recordCard: {
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
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
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
  className: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  dateInfo: {
    alignItems: 'flex-end',
  },
  date: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  remarks: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    flex: 1,
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

export default AttendanceHistoryScreen;