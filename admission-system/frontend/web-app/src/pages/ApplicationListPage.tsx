import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TablePagination,
  Button,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { admissionApi } from '../services/api';
import { TableSkeleton } from '../components/common/SkeletonLoader';
import type { Application, ApplicationFilters } from '../types';
import SchoolIcon from '@mui/icons-material/School';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';

const ApplicationListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showError } = useNotification();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<ApplicationFilters>({
    page: 1,
    page_size: 10,
  });

  useEffect(() => {
    loadApplications();
  }, [filters]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const response = await admissionApi.listApplications(filters);
      setApplications(response.applications);
      setTotal(response.total);
    } catch (error: any) {
      showError(error.response?.data?.detail || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (_: unknown, newPage: number) => {
    setFilters({ ...filters, page: newPage + 1 });
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, page_size: parseInt(event.target.value, 10), page: 1 });
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, search_query: event.target.value, page: 1 });
  };

  const handleStatusChange = (event: any) => {
    setFilters({ ...filters, status: event.target.value || undefined, page: 1 });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, any> = {
      draft: 'default',
      submitted: 'info',
      under_review: 'warning',
      test_scheduled: 'primary',
      interview_scheduled: 'primary',
      enrolled: 'success',
      rejected: 'error',
      waitlisted: 'warning',
    };
    return colors[status] || 'default';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  return (
    <Box sx={{ width: '100vw',minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <AppBar position="static" elevation={1}>
        <Toolbar sx={{ minHeight: { xs: 48, sm: 56 } }}>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/dashboard')} size="medium">
            <ArrowBackIcon />
          </IconButton>
          <SchoolIcon sx={{ mr: 1.5, fontSize: 24 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            Applications
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Filters */}
        <Box sx={{ mb: 2, display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
          <TextField
            placeholder="Search applications..."
            variant="outlined"
            size="small"
            onChange={handleSearchChange}
            fullWidth={isMobile}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            sx={{ flexGrow: 1, minWidth: { xs: 'auto', sm: 300 } }}
          />
          <FormControl size="small" fullWidth={isMobile} sx={{ minWidth: { xs: 'auto', sm: 200 } }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status || ''}
              label="Status"
              onChange={handleStatusChange}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="submitted">Submitted</MenuItem>
              <MenuItem value="under_review">Under Review</MenuItem>
              <MenuItem value="test_scheduled">Test Scheduled</MenuItem>
              <MenuItem value="interview_scheduled">Interview Scheduled</MenuItem>
              <MenuItem value="enrolled">Enrolled</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Mobile List View */}
        {isMobile ? (
          <Box>
            {loading ? (
              <Typography>Loading...</Typography>
            ) : applications.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">No applications found</Typography>
              </Paper>
            ) : (
              <>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {applications.map((app) => (
                    <Card
                      key={app.id}
                      sx={{
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: 'translateX(4px)',
                          boxShadow: 3
                        },
                      }}
                      onClick={() => navigate(`/applications/${app.id}`)}
                    >
                      <CardContent sx={{ py: 2, px: 2.5, '&:last-child': { pb: 2 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="subtitle2" fontWeight={600} color="primary" noWrap>
                              {app.application_number}
                            </Typography>
                            <Typography variant="body2" fontWeight={600} noWrap>
                              {app.student_name || '-'}
                            </Typography>
                          </Box>
                          <Chip
                            label={app.application_status?.replace('_', ' ').toUpperCase() || 'DRAFT'}
                            color={getStatusColor(app.application_status)}
                            size="small"
                            sx={{ ml: 2, flexShrink: 0 }}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                          <Typography variant="caption" color="text.secondary">
                            Class: {app.class_name || '-'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Parent: {app.parent_name || '-'}
                          </Typography>
                          {app.submission_date && (
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(app.submission_date)}
                            </Typography>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
                {/* Mobile Pagination */}
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                  <TablePagination
                    component="div"
                    count={total}
                    page={(filters.page || 1) - 1}
                    onPageChange={handlePageChange}
                    rowsPerPage={filters.page_size || 10}
                    onRowsPerPageChange={handleRowsPerPageChange}
                    rowsPerPageOptions={[10, 25, 50]}
                  />
                </Box>
              </>
            )}
          </Box>
        ) : (
          /* Desktop Table View */
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Application #</strong></TableCell>
                    <TableCell><strong>Student Name</strong></TableCell>
                    <TableCell><strong>Class</strong></TableCell>
                    <TableCell><strong>Parent</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Submitted Date</strong></TableCell>
                    <TableCell><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7}>
                        <TableSkeleton rows={5} />
                      </TableCell>
                    </TableRow>
                  ) : applications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No applications found
                      </TableCell>
                    </TableRow>
                  ) : (
                    applications.map((app) => (
                      <TableRow
                        key={app.id}
                        hover
                        sx={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/applications/${app.id}`)}
                      >
                        <TableCell>{app.application_number}</TableCell>
                        <TableCell>{app.student_name || '-'}</TableCell>
                        <TableCell>{app.class_name || '-'}</TableCell>
                        <TableCell>{app.parent_name || '-'}</TableCell>
                        <TableCell>
                          <Chip
                            label={app.application_status?.replace('_', ' ').toUpperCase() || 'DRAFT'}
                            color={getStatusColor(app.application_status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{formatDate(app.submission_date)}</TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/applications/${app.id}`);
                            }}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={total}
              page={(filters.page || 1) - 1}
              onPageChange={handlePageChange}
              rowsPerPage={filters.page_size || 10}
              onRowsPerPageChange={handleRowsPerPageChange}
              rowsPerPageOptions={[10, 25, 50, 100]}
            />
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default ApplicationListPage;
