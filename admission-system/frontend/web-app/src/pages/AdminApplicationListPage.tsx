/**
 * Admin Application List Page - Sophisticated view with advanced filtering, sorting, bulk actions
 */
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  Menu,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Badge,
  Stack,
  Divider,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  OpenInNew as OpenIcon,
  GetApp as ExportIcon,
  MoreVert as MoreIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useNotification } from '../contexts/NotificationContext';
import { admissionApi } from '../services/api';
import type { Application, ApplicationFilters } from '../types';

interface SortConfig {
  field: keyof Application | '';
  direction: 'asc' | 'desc';
}

const AdminApplicationListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showNotification, showSuccess, showError } = useNotification();

  // Read quickFilter from URL query parameter
  const urlQuickFilter = searchParams.get('quickFilter') as 'all' | 'pending' | 'active' | null;

  // State
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<number[]>([]);
  const [filters, setFilters] = useState<ApplicationFilters>({
    page: 1,
    page_size: 25,
  });
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: '', direction: 'desc' });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [quickFilter, setQuickFilter] = useState<'all' | 'pending' | 'active'>(urlQuickFilter || 'all');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    submitted: 0,
    under_review: 0,
    accepted: 0,
    rejected: 0,
  });

  useEffect(() => {
    loadApplications();
    loadStats();
  }, [filters]);

  // Apply quick filter from URL on mount
  useEffect(() => {
    if (urlQuickFilter && urlQuickFilter !== quickFilter) {
      handleQuickFilterChange(urlQuickFilter);
    }
  }, [urlQuickFilter]);

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

  const loadStats = async () => {
    try {
      // Calculate stats from applications (backend already excludes drafts for admins)
      const allApps = await admissionApi.listApplications({ page: 1, page_size: 1000 });
      const apps = allApps.applications;
      setStats({
        total: apps.length, // This already excludes drafts from backend
        draft: 0, // Admins don't see drafts
        submitted: apps.filter(a => a.application_status === 'submitted').length,
        under_review: apps.filter(a => a.application_status === 'under_review').length,
        accepted: apps.filter(a => ['accepted', 'enrolled', 'decision_made'].includes(a.application_status)).length,
        rejected: apps.filter(a => a.application_status === 'rejected').length,
      });
    } catch (error) {
      console.error('Failed to load stats', error);
    }
  };

  const handleSearch = () => {
    setFilters({ ...filters, search_query: searchQuery || undefined, page: 1 });
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setFilters({ ...filters, status: value || undefined, page: 1 });
  };

  const handleClassFilterChange = (value: string) => {
    setClassFilter(value);
    setFilters({ ...filters, class_id: value ? parseInt(value) : undefined, page: 1 });
  };

  const handleQuickFilterChange = (filter: 'all' | 'pending' | 'active') => {
    setQuickFilter(filter);

    if (filter === 'all') {
      // Show all applications - clear status filter
      setStatusFilter('');
      setFilters({ ...filters, status: undefined, page: 1 });
    } else if (filter === 'pending') {
      // Show submitted + under_review
      setStatusFilter('submitted,under_review');
      setFilters({ ...filters, status: 'submitted,under_review', page: 1 });
    } else if (filter === 'active') {
      // Show under_review + test_scheduled + test_completed + interview_scheduled
      setStatusFilter('under_review,test_scheduled,test_completed,interview_scheduled');
      setFilters({ ...filters, status: 'under_review,test_scheduled,test_completed,interview_scheduled', page: 1 });
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setClassFilter('');
    setQuickFilter('all');
    setFilters({ page: 1, page_size: 25 });
  };

  const handleSort = (field: keyof Application) => {
    const isAsc = sortConfig.field === field && sortConfig.direction === 'asc';
    setSortConfig({ field, direction: isAsc ? 'desc' : 'asc' });

    // Sort applications locally
    const sorted = [...applications].sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      if (aVal < bVal) return isAsc ? 1 : -1;
      if (aVal > bVal) return isAsc ? -1 : 1;
      return 0;
    });
    setApplications(sorted);
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelected(applications.map(app => app.id));
    } else {
      setSelected([]);
    }
  };

  const handleSelectOne = (id: number) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkAction = (action: string) => {
    setAnchorEl(null);
    showNotification(`Bulk ${action} for ${selected.length} applications`, 'info');
    // Implement bulk actions here
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, any> = {
      draft: 'default',
      submitted: 'info',
      under_review: 'warning',
      test_scheduled: 'primary',
      test_completed: 'primary',
      interview_scheduled: 'primary',
      interview_completed: 'primary',
      decision_made: 'success',
      accepted: 'success',
      enrolled: 'success',
      rejected: 'error',
      waitlisted: 'warning',
    };
    return colors[status] || 'default';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatRelativeTime = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  };

  return (
    <Box sx={{ py: 4, width: '100%', overflow: 'hidden' }}>
      <Box sx={{ px: 2 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate('/dashboard')} sx={{ mr: 2 }}>
            <BackIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" fontWeight={600}>
              Application Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Review, filter, and manage all admission applications
            </Typography>
          </Box>
          <Tooltip title="Refresh">
            <IconButton onClick={loadApplications} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            sx={{ ml: 2 }}
          >
            Export
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <TextField
            placeholder="Search by name, application #..."
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchQuery('')}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button variant="contained" onClick={handleSearch} sx={{ minWidth: 100 }}>
            Search
          </Button>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => handleStatusFilterChange(e.target.value)}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="submitted">Submitted</MenuItem>
              <MenuItem value="under_review">Under Review</MenuItem>
              <MenuItem value="changes_requested">Changes Requested</MenuItem>
              <MenuItem value="test_scheduled">Test Scheduled</MenuItem>
              <MenuItem value="interview_scheduled">Interview Scheduled</MenuItem>
              <MenuItem value="decision_made">Decision Made</MenuItem>
              <MenuItem value="accepted">Accepted</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Class</InputLabel>
            <Select
              value={classFilter}
              label="Class"
              onChange={(e) => handleClassFilterChange(e.target.value)}
            >
              <MenuItem value="">All Classes</MenuItem>
              <MenuItem value="1">Pre-KG</MenuItem>
              <MenuItem value="2">LKG</MenuItem>
              <MenuItem value="3">UKG</MenuItem>
              <MenuItem value="4">Class 1</MenuItem>
              <MenuItem value="5">Class 2</MenuItem>
              {/* Add more classes */}
            </Select>
          </FormControl>

          {/* Quick Filter Chips */}
          <Stack direction="row" spacing={1} sx={{ ml: 'auto' }}>
            <Chip
              label="All"
              variant={quickFilter === 'all' ? 'filled' : 'outlined'}
              onClick={() => handleQuickFilterChange('all')}
              sx={{
                borderColor: 'black',
                color: quickFilter === 'all' ? 'white' : 'black',
                bgcolor: quickFilter === 'all' ? 'black' : 'transparent',
                fontWeight: 600,
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: quickFilter === 'all' ? 'black' : 'rgba(0, 0, 0, 0.04)',
                },
              }}
            />
            <Chip
              label="Pending Review"
              variant={quickFilter === 'pending' ? 'filled' : 'outlined'}
              onClick={() => handleQuickFilterChange('pending')}
              sx={{
                borderColor: 'red',
                color: quickFilter === 'pending' ? 'white' : 'red',
                bgcolor: quickFilter === 'pending' ? 'red' : 'transparent',
                fontWeight: 600,
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: quickFilter === 'pending' ? 'red' : 'rgba(255, 0, 0, 0.04)',
                },
              }}
            />
            <Chip
              label="Active Applications"
              variant={quickFilter === 'active' ? 'filled' : 'outlined'}
              onClick={() => handleQuickFilterChange('active')}
              sx={{
                borderColor: 'orange',
                color: quickFilter === 'active' ? 'white' : 'orange',
                bgcolor: quickFilter === 'active' ? 'orange' : 'transparent',
                fontWeight: 600,
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: quickFilter === 'active' ? 'orange' : 'rgba(255, 165, 0, 0.04)',
                },
              }}
            />
          </Stack>

          {(searchQuery || statusFilter || classFilter) && (
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={handleClearFilters}
            >
              Clear Filters
            </Button>
          )}
        </Stack>
      </Paper>

      {/* Bulk Actions */}
      {selected.length > 0 && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'primary.50', borderLeft: 4, borderColor: 'primary.main' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="body2" fontWeight={600}>
              {selected.length} application{selected.length > 1 ? 's' : ''} selected
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<ApproveIcon />}
                onClick={() => handleBulkAction('approve')}
              >
                Approve
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<RejectIcon />}
                onClick={() => handleBulkAction('reject')}
              >
                Reject
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<ScheduleIcon />}
                onClick={() => handleBulkAction('schedule')}
              >
                Schedule Test
              </Button>
              <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
                <MoreIcon />
              </IconButton>
            </Stack>
          </Box>
        </Paper>
      )}

      {/* Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selected.length > 0 && selected.length < applications.length}
                    checked={applications.length > 0 && selected.length === applications.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.field === 'application_number'}
                    direction={sortConfig.field === 'application_number' ? sortConfig.direction : 'asc'}
                    onClick={() => handleSort('application_number')}
                  >
                    <strong>Application #</strong>
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.field === 'student_name'}
                    direction={sortConfig.field === 'student_name' ? sortConfig.direction : 'asc'}
                    onClick={() => handleSort('student_name')}
                  >
                    <strong>Student Name</strong>
                  </TableSortLabel>
                </TableCell>
                <TableCell><strong>Class</strong></TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.field === 'application_status'}
                    direction={sortConfig.field === 'application_status' ? sortConfig.direction : 'asc'}
                    onClick={() => handleSort('application_status')}
                  >
                    <strong>Status</strong>
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.field === 'submission_date'}
                    direction={sortConfig.field === 'submission_date' ? sortConfig.direction : 'asc'}
                    onClick={() => handleSort('submission_date')}
                  >
                    <strong>Submitted</strong>
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.field === 'updated_at'}
                    direction={sortConfig.field === 'updated_at' ? sortConfig.direction : 'asc'}
                    onClick={() => handleSort('updated_at')}
                  >
                    <strong>Last Updated</strong>
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    Loading applications...
                  </TableCell>
                </TableRow>
              ) : applications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No applications found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                applications.map((app) => (
                  <TableRow
                    key={app.id}
                    hover
                    selected={selected.includes(app.id)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selected.includes(app.id)}
                        onChange={() => handleSelectOne(app.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color="primary">
                        {app.application_number}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {app.student_name || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{app.class_name || '-'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={app.application_status?.replace('_', ' ').toUpperCase() || 'DRAFT'}
                        color={getStatusColor(app.application_status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{formatDate(app.submission_date)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={formatDate(app.updated_at)}>
                        <Typography variant="body2" color="text.secondary">
                          {formatRelativeTime(app.updated_at)}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<OpenIcon fontSize="small" />}
                        onClick={() => navigate(`/admin/applications/${app.id}/review`)}
                      >
                        Open
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          component="div"
          count={total}
          page={(filters.page || 1) - 1}
          onPageChange={(_, newPage) => setFilters({ ...filters, page: newPage + 1 })}
          rowsPerPage={filters.page_size || 25}
          onRowsPerPageChange={(e) => setFilters({ ...filters, page_size: parseInt(e.target.value), page: 1 })}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      </Paper>

      {/* Bulk Actions Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={() => handleBulkAction('export')}>
          <ListItemIcon>
            <ExportIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export Selected</ListItemText>
        </MenuItem>
      </Menu>
      </Box>
    </Box>
  );
};

export default AdminApplicationListPage;
