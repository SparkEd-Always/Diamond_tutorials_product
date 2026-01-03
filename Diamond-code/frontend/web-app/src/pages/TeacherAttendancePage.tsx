import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import axios from 'axios';

interface Teacher {
  teacher_id: number;
  teacher_name: string;
  teacher_unique_id: string;
  email: string;
  phone_number: string;
  date: string;
  status: 'present' | 'absent' | 'half_day' | 'on_leave' | 'not_marked';
  check_in_time: string | null;
  check_out_time: string | null;
  remarks: string;
  marked_at: string | null;
  is_locked: boolean;
  locked_at: string | null;
}

interface AttendanceData {
  date: string;
  total_teachers: number;
  marked_attendance: number;
  pending_count: number;
  teachers: Teacher[];
  is_locked?: boolean;
}

const TeacherAttendancePage: React.FC = () => {
  const { token } = useSelector((state: RootState) => state.auth);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [teacherStatuses, setTeacherStatuses] = useState<{ [key: number]: string }>({});
  const [teacherRemarks, setTeacherRemarks] = useState<{ [key: number]: string }>({});
  const [remarksDialog, setRemarksDialog] = useState<{
    open: boolean;
    teacherId: number | null;
    teacherName: string;
    remarks: string;
  }>({
    open: false,
    teacherId: null,
    teacherName: '',
    remarks: '',
  });

  useEffect(() => {
    fetchTeacherAttendance();
  }, [selectedDate]);

  const fetchTeacherAttendance = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `/api/v1/teacher-attendance/date/${selectedDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAttendanceData(response.data);

      // Initialize teacher statuses and remarks
      const statuses: { [key: number]: string } = {};
      const remarks: { [key: number]: string } = {};
      response.data.teachers.forEach((teacher: Teacher) => {
        statuses[teacher.teacher_id] = teacher.status;
        remarks[teacher.teacher_id] = teacher.remarks || '';
      });
      setTeacherStatuses(statuses);
      setTeacherRemarks(remarks);

      // Check if any teacher has locked attendance for this date
      const isLocked = response.data.teachers.some((teacher: Teacher) => teacher.is_locked);
      setAttendanceData({ ...response.data, is_locked: isLocked });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch teacher attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (teacherId: number, status: string) => {
    setTeacherStatuses({
      ...teacherStatuses,
      [teacherId]: status,
    });
  };

  const handleRemarksOpen = (teacher: Teacher) => {
    setRemarksDialog({
      open: true,
      teacherId: teacher.teacher_id,
      teacherName: teacher.teacher_name,
      remarks: teacherRemarks[teacher.teacher_id] || '',
    });
  };

  const handleRemarksClose = () => {
    setRemarksDialog({
      open: false,
      teacherId: null,
      teacherName: '',
      remarks: '',
    });
  };

  const handleRemarksSave = async () => {
    if (remarksDialog.teacherId === null) return;

    // Update local state immediately
    setTeacherRemarks({
      ...teacherRemarks,
      [remarksDialog.teacherId]: remarksDialog.remarks,
    });

    // Save remarks to backend immediately
    try {
      await axios.post(
        '/api/v1/teacher-attendance/update-remarks',
        {
          teacher_id: remarksDialog.teacherId,
          date: selectedDate,
          remarks: remarksDialog.remarks,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuccess('Remarks saved successfully');
      fetchTeacherAttendance();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save remarks');
    }

    handleRemarksClose();
  };

  const handleSaveAttendance = async () => {
    if (!attendanceData) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const teacherRecords = attendanceData.teachers
        .filter((teacher) => teacherStatuses[teacher.teacher_id] !== 'not_marked')
        .map((teacher) => ({
          teacher_id: teacher.teacher_id,
          status: teacherStatuses[teacher.teacher_id],
          remarks: teacherRemarks[teacher.teacher_id] || '',
          check_in_time: null,
          check_out_time: null,
        }));

      if (teacherRecords.length === 0) {
        setError('Please mark attendance for at least one teacher');
        setLoading(false);
        return;
      }

      await axios.post(
        '/api/v1/teacher-attendance/mark',
        {
          teacher_records: teacherRecords,
          date: selectedDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess(`Attendance saved successfully for ${teacherRecords.length} teachers!`);
      fetchTeacherAttendance();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save teacher attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleLockAttendance = async () => {
    if (!attendanceData) return;

    if (window.confirm('Are you sure you want to lock attendance for this date? This action cannot be undone!')) {
      setLoading(true);
      setError(null);
      setSuccess(null);

      try {
        await axios.post(
          `/api/v1/teacher-attendance/lock/${selectedDate}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setSuccess(`Attendance locked successfully for ${selectedDate}. No further edits allowed.`);
        fetchTeacherAttendance();
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to lock teacher attendance');
      } finally {
        setLoading(false);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'success';
      case 'absent':
        return 'error';
      case 'half_day':
        return 'warning';
      case 'on_leave':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'present':
        return 'Present';
      case 'absent':
        return 'Absent';
      case 'half_day':
        return 'Half Day';
      case 'on_leave':
        return 'On Leave';
      case 'not_marked':
        return 'Not Marked';
      default:
        return status;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600, color: '#1F2937' }}>
        Teacher Attendance
      </Typography>

      {/* Date Selector */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                type="date"
                label="Select Date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            {attendanceData && (
              <>
                <Grid item xs={12} md={8}>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Chip
                      label={`Total Teachers: ${attendanceData.total_teachers}`}
                      color="primary"
                      sx={{ fontSize: '0.95rem', fontWeight: 500 }}
                    />
                    <Chip
                      label={`Marked: ${attendanceData.marked_attendance}`}
                      color="success"
                      sx={{ fontSize: '0.95rem', fontWeight: 500 }}
                    />
                    <Chip
                      label={`Pending: ${attendanceData.pending_count}`}
                      color="warning"
                      sx={{ fontSize: '0.95rem', fontWeight: 500 }}
                    />
                  </Box>
                </Grid>
              </>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Loading State */}
      {loading && !attendanceData && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Teacher Attendance Table */}
      {attendanceData && (
        <Card>
          <CardContent>
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#F3F4F6' }}>
                    <TableCell sx={{ fontWeight: 600, color: '#1F2937' }}>Teacher ID</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1F2937' }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1F2937' }}>Phone</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1F2937' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1F2937' }}>Remarks</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attendanceData.teachers.map((teacher) => (
                    <TableRow key={teacher.teacher_id} hover>
                      <TableCell>{teacher.teacher_unique_id}</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{teacher.teacher_name}</TableCell>
                      <TableCell>{teacher.phone_number}</TableCell>
                      <TableCell>
                        <FormControl size="small" sx={{ minWidth: 140 }}>
                          <Select
                            value={teacherStatuses[teacher.teacher_id] || 'not_marked'}
                            onChange={(e) =>
                              handleStatusChange(teacher.teacher_id, e.target.value)
                            }
                            disabled={teacher.is_locked}
                          >
                            <MenuItem value="not_marked" disabled>
                              -- Select --
                            </MenuItem>
                            <MenuItem value="present">Present</MenuItem>
                            <MenuItem value="absent">Absent</MenuItem>
                            <MenuItem value="half_day">Half Day</MenuItem>
                            <MenuItem value="on_leave">On Leave</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <Box
                          onClick={() => handleRemarksOpen(teacher)}
                          sx={{
                            cursor: 'pointer',
                            color: teacherRemarks[teacher.teacher_id] ? 'primary.main' : 'text.secondary',
                            '&:hover': {
                              textDecoration: 'underline',
                              color: 'primary.dark'
                            },
                            fontStyle: teacherRemarks[teacher.teacher_id] ? 'normal' : 'italic',
                            minHeight: '20px',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          {teacherRemarks[teacher.teacher_id] || 'Notes'}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Action Buttons */}
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {attendanceData.is_locked && (
                <Alert severity="warning" sx={{ flex: 1, mr: 2 }}>
                  Attendance for this date is locked and cannot be modified
                </Alert>
              )}
              <Box sx={{ display: 'flex', gap: 2, ml: 'auto' }}>
                <Button
                  variant="outlined"
                  color="primary"
                  size="large"
                  onClick={handleSaveAttendance}
                  disabled={loading || attendanceData.is_locked}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Save Attendance'}
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  size="large"
                  onClick={handleLockAttendance}
                  disabled={loading || attendanceData.is_locked || attendanceData.marked_attendance === 0}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Lock Attendance'}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Remarks Dialog */}
      <Dialog open={remarksDialog.open} onClose={handleRemarksClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add Remarks for {remarksDialog.teacherName}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Remarks"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={remarksDialog.remarks}
            onChange={(e) =>
              setRemarksDialog({ ...remarksDialog, remarks: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRemarksClose}>Cancel</Button>
          <Button onClick={handleRemarksSave} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeacherAttendancePage;
