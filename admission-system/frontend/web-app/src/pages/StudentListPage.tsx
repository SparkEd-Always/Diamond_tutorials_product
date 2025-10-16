import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Pagination,
  Grid,
  Card,
  CardContent,
  Tooltip,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { studentApi } from '../services/sisApi';
import type { StudentSummary, StudentStatus, Gender, StudentStats } from '../types/student';
import SchoolIcon from '@mui/icons-material/School';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FilterListIcon from '@mui/icons-material/FilterList';
import config from '../config';

const StudentListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // State
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StudentStatus | ''>('');
  const [genderFilter, setGenderFilter] = useState<Gender | ''>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const perPage = 20;

  useEffect(() => {
    loadStudents();
    loadStats();
  }, [page, statusFilter, genderFilter]);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      if (page === 1) {
        loadStudents();
      } else {
        setPage(1); // Reset to page 1 on search
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await studentApi.getStudents({
        page,
        per_page: perPage,
        search: searchTerm || undefined,
        status: statusFilter || undefined,
        gender: genderFilter || undefined,
      });

      setStudents(response.data.students);
      setTotal(response.data.total);
      setTotalPages(response.data.total_pages);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load students:', err);
      setError('Failed to load students');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await studentApi.getStudentStats();
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const getStatusColor = (status: StudentStatus): 'success' | 'info' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Alumni':
        return 'info';
      case 'Transferred':
        return 'warning';
      case 'Expelled':
      case 'Withdrawn':
        return 'error';
      default:
        return 'default';
    }
  };

  const getGenderColor = (gender: Gender): 'primary' | 'secondary' | 'default' => {
    switch (gender) {
      case 'Male':
        return 'primary';
      case 'Female':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const handleExport = async () => {
    try {
      const blob = await studentApi.bulkExportStudents({
        search: searchTerm || undefined,
        status: statusFilter || undefined,
        gender: genderFilter || undefined,
      });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `students-${new Date().toISOString().split('T')[0]}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export students:', err);
      setError('Failed to export students');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
          <SchoolIcon sx={{ ml: 1, mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {config.schoolName} - Student Management
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.email}
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Page Title & Actions */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" gutterBottom fontWeight={600}>
              <PeopleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Student Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage all student profiles and information
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<UploadIcon />}
              onClick={() => navigate('/admin/students/import')}
            >
              Import
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
            >
              Export
            </Button>
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={() => navigate('/admin/students/create')}
            >
              Add Student
            </Button>
          </Stack>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Statistics Cards */}
        {stats && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h4" fontWeight={600} color="primary.main">
                    {stats.total_students}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total Students
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h4" fontWeight={600} color="success.main">
                    {stats.active_students}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Active Students
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h4" fontWeight={600} color="info.main">
                    {stats.new_admissions_this_month}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    New This Month
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h4" fontWeight={600} color="warning.main">
                    {Math.round(stats.average_profile_completeness)}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Avg Profile Completeness
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Search and Filters */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search by name, admission number, or roll number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StudentStatus | '')}
                  label="Status"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Alumni">Alumni</MenuItem>
                  <MenuItem value="Transferred">Transferred</MenuItem>
                  <MenuItem value="Withdrawn">Withdrawn</MenuItem>
                  <MenuItem value="Expelled">Expelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value as Gender | '')}
                  label="Gender"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Students Table */}
        <Paper>
          {loading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CircularProgress />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Loading students...
              </Typography>
            </Box>
          ) : students.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <PeopleIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                {searchTerm || statusFilter || genderFilter
                  ? 'No students found matching your criteria'
                  : 'No students yet'}
              </Typography>
              {!searchTerm && !statusFilter && !genderFilter && (
                <Button
                  variant="contained"
                  startIcon={<PersonAddIcon />}
                  onClick={() => navigate('/admin/students/create')}
                  sx={{ mt: 2 }}
                >
                  Add First Student
                </Button>
              )}
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      <TableCell width="60px"></TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>
                          Admission No
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>
                          Name
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>
                          Class/Section
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>
                          Gender
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>
                          Status
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>
                          Profile
                        </Typography>
                      </TableCell>
                      <TableCell width="120px" align="center">
                        <Typography variant="subtitle2" fontWeight={600}>
                          Actions
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id} hover>
                        <TableCell>
                          <Avatar
                            src={student.photo_url || undefined}
                            alt={student.full_name}
                            sx={{ width: 40, height: 40 }}
                          >
                            {student.first_name[0]}{student.last_name[0]}
                          </Avatar>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {student.admission_number}
                          </Typography>
                          {student.roll_number && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              Roll: {student.roll_number}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {student.full_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Age: {student.age} years
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {student.current_class_name || '-'}
                            {student.current_section_name && ` / ${student.current_section_name}`}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={student.gender}
                            size="small"
                            color={getGenderColor(student.gender)}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={student.student_status}
                            size="small"
                            color={getStatusColor(student.student_status)}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                              sx={{
                                width: 60,
                                height: 6,
                                bgcolor: 'grey.200',
                                borderRadius: 1,
                                overflow: 'hidden',
                              }}
                            >
                              <Box
                                sx={{
                                  width: `${student.profile_completeness_percentage}%`,
                                  height: '100%',
                                  bgcolor:
                                    student.profile_completeness_percentage > 80
                                      ? 'success.main'
                                      : student.profile_completeness_percentage > 50
                                      ? 'warning.main'
                                      : 'error.main',
                                }}
                              />
                            </Box>
                            <Typography variant="caption">
                              {student.profile_completeness_percentage}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => navigate(`/admin/students/${student.id}`)}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                color="secondary"
                                onClick={() => navigate(`/admin/students/${student.id}/edit`)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Showing {((page - 1) * perPage) + 1} - {Math.min(page * perPage, total)} of {total} students
                </Typography>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  color="primary"
                  showFirstButton
                  showLastButton
                />
              </Box>
            </>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default StudentListPage;
