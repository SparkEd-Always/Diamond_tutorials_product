import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
  CircularProgress,
  Alert,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { feeSessionApi } from '../../services/feeApi';
import type { FeeSession, FeeSessionStatus } from '../../types/fees';

const ManageFeeSessionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<FeeSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    loadSessions();
  }, [statusFilter]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await feeSessionApi.list({
        status_filter: statusFilter || undefined,
      });
      setSessions(data);
    } catch (err: any) {
      console.error('Failed to load fee sessions:', err);
      setError(err.response?.data?.detail || 'Failed to load fee sessions');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: FeeSessionStatus) => {
    const colors = {
      draft: 'default',
      active: 'success',
      closed: 'warning',
      archived: 'error',
    };
    return colors[status] || 'default';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleCreateSession = () => {
    navigate('/admin/fees/sessions/create');
  };

  const handleViewSession = (sessionId: number) => {
    console.log('Navigating to session:', sessionId);
    navigate(`/admin/fees/sessions/${sessionId}`);
  };

  const handleCloseSession = async (sessionId: number) => {
    if (!window.confirm('Are you sure you want to close this session? No more payments will be accepted.')) {
      return;
    }

    try {
      await feeSessionApi.close(sessionId);
      loadSessions(); // Reload list
    } catch (err: any) {
      console.error('Failed to close session:', err);
      alert(err.response?.data?.detail || 'Failed to close session');
    }
  };

  if (loading) {
    return (
      <Box sx={{ py: 4, width: '100%', overflow: 'hidden' }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4, width: '100%', overflow: 'hidden' }}>
      {/* Back Button */}
      <Box sx={{ px: 2, mb: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/fees/dashboard')}
        >
          Back to Fee Dashboard
        </Button>
      </Box>

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} px={2}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Manage Fee Sessions
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateSession}
          size="large"
        >
          Create New Session
        </Button>
      </Box>

      {error && (
        <Box sx={{ px: 2, mb: 3 }}>
          <Alert severity="error">
            {error}
          </Alert>
        </Box>
      )}

      {/* Filters */}
      <Box sx={{ px: 2, mb: 3 }}>
        <Paper sx={{ p: 2 }}>
          <Box display="flex" gap={2} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={statusFilter}
                label="Filter by Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="body2" color="text.secondary">
              Total Sessions: {sessions.length}
            </Typography>
          </Box>
        </Paper>
      </Box>

      {/* Sessions Table */}
      <Box sx={{ px: 2 }}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell><strong>Session Name</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell align="right"><strong>Students</strong></TableCell>
                <TableCell align="right"><strong>Total Amount</strong></TableCell>
                <TableCell align="right"><strong>Collected</strong></TableCell>
                <TableCell align="right"><strong>Outstanding</strong></TableCell>
                <TableCell align="center"><strong>Collection %</strong></TableCell>
                <TableCell><strong>Due Date</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No fee sessions found. Create your first session to get started.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                sessions.map((session) => (
                  <TableRow
                    key={session.id}
                    hover
                    onClick={() => handleViewSession(session.id)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {session.session_name}
                      </Typography>
                      {session.session_description && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {session.session_description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={session.status.toUpperCase()}
                        color={getStatusColor(session.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {session.total_students}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {session.students_paid} paid, {session.students_pending} pending
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="medium">
                        {formatCurrency(session.total_amount)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="success.main">
                        {formatCurrency(session.collected_amount)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="error.main">
                        {formatCurrency(session.outstanding_amount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={session.collection_percentage}
                          color={session.collection_percentage >= 75 ? 'success' : session.collection_percentage >= 50 ? 'warning' : 'error'}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                        <Typography variant="caption" display="block" align="center" mt={0.5}>
                          {session.collection_percentage.toFixed(1)}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(session.due_date)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                      <Box display="flex" gap={0.5} justifyContent="center">
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewSession(session.id);
                            }}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {session.status === 'active' && (
                          <Tooltip title="Close Session">
                            <IconButton
                              size="small"
                              color="warning"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCloseSession(session.id);
                              }}
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default ManageFeeSessionsPage;
