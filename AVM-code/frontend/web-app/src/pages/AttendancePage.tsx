import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  CircularProgress,
  Stack,
  Badge,
  TextField,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  WhatsApp as WhatsAppIcon,
  Schedule as ScheduleIcon,
  Group as GroupIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';

import { AppDispatch, RootState } from '../store/store';
import {
  fetchPendingAttendance,
  approveAttendance,
  clearError,
} from '../store/slices/attendanceSlice';
import { useToast } from '../contexts/ToastContext';

const AttendancePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();
  const {
    groupedByClass,
    isLoading,
    error,
    approvalInProgress,
  } = useSelector((state: RootState) => state.attendance);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedRecords, setSelectedRecords] = useState<Set<number>>(new Set());
  const [expandedClasses, setExpandedClasses] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [classFilter, setClassFilter] = useState<string>('all');

  useEffect(() => {
    // Fetch pending attendance for today by default
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    dispatch(fetchPendingAttendance(dateStr));
  }, [dispatch, selectedDate]);

  const handleDateChange = (newDate: Date | null) => {
    if (newDate) {
      setSelectedDate(newDate);
      setSelectedRecords(new Set()); // Clear selections when date changes
    }
  };

  const handleSelectRecord = (recordId: number) => {
    const newSelected = new Set(selectedRecords);
    if (newSelected.has(recordId)) {
      newSelected.delete(recordId);
    } else {
      newSelected.add(recordId);
    }
    setSelectedRecords(newSelected);
  };

  const handleSelectAllInClass = (className: string) => {
    const classRecords = groupedByClass[className] || [];
    const classRecordIds = classRecords.map(record => record.id);
    const newSelected = new Set(selectedRecords);

    const allSelected = classRecordIds.every(id => newSelected.has(id));

    if (allSelected) {
      // Deselect all in this class
      classRecordIds.forEach(id => newSelected.delete(id));
    } else {
      // Select all in this class
      classRecordIds.forEach(id => newSelected.add(id));
    }

    setSelectedRecords(newSelected);
  };

  const handleSelectAll = () => {
    // Get all record IDs from all filtered classes
    const allRecordIds = Object.values(filteredGroupedByClass)
      .flat()
      .map(record => record.id);

    const allSelected = allRecordIds.every(id => selectedRecords.has(id));

    if (allSelected) {
      // Deselect all
      setSelectedRecords(new Set());
    } else {
      // Select all
      setSelectedRecords(new Set(allRecordIds));
    }
  };

  const handleApprovalSubmit = async () => {
    if (selectedRecords.size === 0) return;

    const recordIds = Array.from(selectedRecords);
    const result = await dispatch(approveAttendance(recordIds));

    if (result.meta.requestStatus === 'fulfilled') {
      // Refresh data after successful approval
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      dispatch(fetchPendingAttendance(dateStr));
      setSelectedRecords(new Set());
      showToast(`Successfully approved ${recordIds.length} attendance record(s)`, 'success');
    } else if (result.meta.requestStatus === 'rejected') {
      showToast('Failed to approve attendance records', 'error');
    }
  };

  const handleClassExpansion = (className: string) => {
    const newExpanded = new Set(expandedClasses);
    if (newExpanded.has(className)) {
      newExpanded.delete(className);
    } else {
      newExpanded.add(className);
    }
    setExpandedClasses(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'success';
      case 'absent':
        return 'error';
      case 'late':
        return 'warning';
      case 'leave':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return '✅';
      case 'absent':
        return '❌';
      case 'late':
        return '⏰';
      case 'leave':
        return '📝';
      default:
        return '❓';
    }
  };

  // Filter records based on search and status
  const filterRecords = (records: any[]) => {
    return records.filter(record => {
      const matchesSearch = searchQuery === '' ||
        record.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.student_unique_id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || record.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  };

  // Get available classes from groupedByClass
  const availableClasses = ['all', ...Object.keys(groupedByClass)];

  const filteredGroupedByClass = Object.entries(groupedByClass).reduce((acc, [className, records]) => {
    const matchesClass = classFilter === 'all' || className === classFilter;
    if (!matchesClass) return acc;

    const filteredRecords = filterRecords(records);
    if (filteredRecords.length > 0) {
      acc[className] = filteredRecords;
    }
    return acc;
  }, {} as typeof groupedByClass);

  const totalRecords = Object.values(filteredGroupedByClass).reduce(
    (total, records) => total + records.length,
    0
  );

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Attendance Approval
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review and approve daily attendance records before sending WhatsApp notifications to parents
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert
          severity="error"
          onClose={() => dispatch(clearError())}
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
      )}

      {/* Filters Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Select Date"
                type="date"
                value={format(selectedDate, 'yyyy-MM-dd')}
                onChange={(e) => handleDateChange(new Date(e.target.value))}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Action Bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={2}>
              <Badge badgeContent={totalRecords} color="primary">
                <Chip
                  icon={<ScheduleIcon />}
                  label="Pending Records"
                  color="warning"
                  variant="outlined"
                />
              </Badge>

              <Badge badgeContent={selectedRecords.size} color="secondary">
                <Chip
                  icon={<CheckCircleIcon />}
                  label="Selected"
                  color="info"
                  variant="outlined"
                />
              </Badge>
            </Stack>

            <Button
              variant="outlined"
              color="primary"
              onClick={handleSelectAll}
              disabled={totalRecords === 0}
              size="large"
            >
              {selectedRecords.size === totalRecords && totalRecords > 0 ? 'Deselect All' : 'Select All'}
            </Button>

            <Button
              variant="contained"
              color="success"
              startIcon={<WhatsAppIcon />}
              onClick={handleApprovalSubmit}
              disabled={selectedRecords.size === 0 || approvalInProgress}
              size="large"
            >
              {approvalInProgress ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                `Approve & Send WhatsApp (${selectedRecords.size})`
              )}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Attendance Records by Class */}
      {Object.keys(filteredGroupedByClass).length === 0 ? (
        <Card>
          <CardContent>
            <Box textAlign="center" py={4}>
              <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No Pending Attendance Records
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {Object.keys(groupedByClass).length === 0
                  ? `All attendance for ${format(selectedDate, 'dd MMM yyyy')} has been approved`
                  : 'No records match your filters'}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={2}>
          {Object.entries(filteredGroupedByClass).map(([className, records]) => {
            const classRecordIds = records.map(record => record.id);
            const allSelected = classRecordIds.every(id => selectedRecords.has(id));
            const someSelected = classRecordIds.some(id => selectedRecords.has(id));

            return (
              <Accordion
                key={className}
                expanded={expandedClasses.has(className)}
                onChange={() => handleClassExpansion(className)}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box display="flex" alignItems="center" width="100%">
                    <Checkbox
                      checked={allSelected}
                      indeterminate={someSelected && !allSelected}
                      onChange={() => handleSelectAllInClass(className)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <GroupIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                      {className}
                    </Typography>
                    <Badge badgeContent={records.length} color="primary">
                      <Chip
                        label={`${records.length} students`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Badge>
                  </Box>
                </AccordionSummary>

                <AccordionDetails>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell padding="checkbox">Select</TableCell>
                          <TableCell>Student</TableCell>
                          <TableCell>ID</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Remarks</TableCell>
                          <TableCell>Parent Phone</TableCell>
                          <TableCell>Marked At</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {records.map((record) => (
                          <TableRow
                            key={record.id}
                            selected={selectedRecords.has(record.id)}
                            hover
                          >
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={selectedRecords.has(record.id)}
                                onChange={() => handleSelectRecord(record.id)}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight="500">
                                {record.student_name}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={record.student_unique_id}
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={`${getStatusIcon(record.status)} ${record.status.toUpperCase()}`}
                                color={getStatusColor(record.status) as any}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {record.remarks || '-'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontFamily="monospace">
                                {record.parent_phone}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption" color="text.secondary">
                                {format(new Date(record.marked_at), 'HH:mm:ss')}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Stack>
      )}
    </Box>
  );
};

export default AttendancePage;