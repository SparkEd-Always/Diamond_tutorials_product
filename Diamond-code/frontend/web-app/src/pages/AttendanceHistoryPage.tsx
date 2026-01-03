import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
  Button,
  Stack,
  Avatar,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Download as DownloadIcon,
  CalendarToday as CalendarIcon,
  CheckCircleOutline,
  HighlightOffOutlined,
  AccessTimeOutlined,
  EventNote,
  ErrorOutline,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import axios from 'axios';

const API_BASE_URL = '/api/v1';

interface AttendanceRecord {
  id: number;
  student_name: string;
  student_unique_id: string;
  class_name: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'leave';
  marked_by: string;
  approved_by: string;
  remarks?: string;
}

const AttendanceHistoryPage: React.FC = () => {
  const { token } = useSelector((state: RootState) => state.auth);

  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [startDate, setStartDate] = useState(format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  // Fetch attendance history from API
  useEffect(() => {
    fetchAttendanceHistory();
  }, [startDate, endDate]);

  const fetchAttendanceHistory = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/attendance/history`, {
        params: {
          start_date: startDate,
          end_date: endDate
        },
        headers: { Authorization: `Bearer ${token}` }
      });
      setAttendanceData(response.data || []);
    } catch (error) {
      console.error('Error fetching attendance history:', error);
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = attendanceData.filter(record => {
    const matchesSearch = searchQuery === '' ||
      record.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.student_unique_id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    const matchesClass = classFilter === 'all' || record.class_name === classFilter;

    const recordDate = new Date(record.date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    const matchesDateRange = recordDate >= start && recordDate <= end;

    return matchesSearch && matchesStatus && matchesClass && matchesDateRange;
  });

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
        return <CheckCircleOutline fontSize="small" />;
      case 'absent':
        return <HighlightOffOutlined fontSize="small" />;
      case 'late':
        return <AccessTimeOutlined fontSize="small" />;
      case 'leave':
        return <EventNote fontSize="small" />;
      default:
        return undefined;
    }
  };

  const classes = ['all', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];

  const exportToCSV = () => {
    if (filteredData.length === 0) {
      alert('No data to export');
      return;
    }

    // Prepare CSV headers
    const headers = ['Student Name', 'Student ID', 'Class', 'Date', 'Status', 'Marked By', 'Approved By', 'Remarks'];

    // Prepare CSV rows
    const rows = filteredData.map(record => [
      record.student_name,
      record.student_unique_id,
      record.class_name,
      format(new Date(record.date), 'dd MMM yyyy'),
      record.status.toUpperCase(),
      record.marked_by,
      record.approved_by,
      record.remarks || '-'
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `attendance_history_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Attendance History
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and analyze historical attendance records
        </Typography>
      </Box>

      {/* Filters Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={2}>
              <TextField
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <TextField
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
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

            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="present">Present</MenuItem>
                  <MenuItem value="absent">Absent</MenuItem>
                  <MenuItem value="late">Late</MenuItem>
                  <MenuItem value="leave">Leave</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Class</InputLabel>
                <Select
                  value={classFilter}
                  label="Class"
                  onChange={(e) => setClassFilter(e.target.value)}
                >
                  {classes.map((cls) => (
                    <MenuItem key={cls} value={cls}>
                      {cls === 'all' ? 'All Classes' : cls}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={1}>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={exportToCSV}
                fullWidth
                sx={{ height: '56px' }}
              >
                Export
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Records
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {filteredData.length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                  <CalendarIcon />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Present
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {filteredData.filter(r => r.status === 'present').length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.light', width: 56, height: 56 }}>
                  <CheckCircleOutline sx={{ color: 'success.main', fontSize: 36 }} />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Absent
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="error.main">
                    {filteredData.filter(r => r.status === 'absent').length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'error.light', width: 56, height: 56 }}>
                  <HighlightOffOutlined sx={{ color: 'error.main', fontSize: 36 }} />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Late/Leave
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {filteredData.filter(r => r.status === 'late' || r.status === 'leave').length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.light', width: 56, height: 56 }}>
                  <AccessTimeOutlined sx={{ color: 'warning.main', fontSize: 36 }} />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Attendance Records Table */}
      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Student ID</TableCell>
                <TableCell>Class</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Marked By</TableCell>
                <TableCell>Approved By</TableCell>
                <TableCell>Remarks</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Box py={4}>
                      <CircularProgress />
                      <Typography variant="body2" color="text.secondary" mt={2}>
                        Loading attendance records...
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Box py={4}>
                      <Typography variant="body1" color="text.secondary">
                        No attendance records found for the selected filters
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((record) => (
                  <TableRow key={record.id} hover>
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
                        color="primary"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={record.class_name}
                        size="small"
                        color="secondary"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {format(new Date(record.date), 'dd MMM yyyy')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(record.status) || undefined}
                        label={record.status.toUpperCase()}
                        color={getStatusColor(record.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {record.marked_by}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {record.approved_by}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {record.remarks || '-'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};

export default AttendanceHistoryPage;