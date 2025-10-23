import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Grid,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { feeSessionApi } from '../../services/feeApi';
import type { FeeSessionDetail, StudentAssignmentDetail } from '../../types/fees';

const FeeSessionDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession] = useState<FeeSessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
    }
    loadSessionDetails();
  }, [id]);

  const loadSessionDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await feeSessionApi.get(Number(id));
      setSession(data);
    } catch (err: any) {
      console.error('Failed to load session details:', err);
      setError(err.response?.data?.detail || 'Failed to load session details');
    } finally {
      setLoading(false);
    }
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
      month: 'long',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      draft: 'default',
      active: 'success',
      closed: 'warning',
      archived: 'error',
    };
    return colors[status] || 'default';
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: any = {
      pending: 'warning',
      partial: 'info',
      paid: 'success',
      overdue: 'error',
    };
    return colors[status] || 'default';
  };

  const filteredStudents = session?.student_assignments.filter(student =>
    student.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.admission_number.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <Box sx={{ py: 4, width: '100%', overflow: 'hidden' }}>
        <Box sx={{ px: 2 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
        </Box>
      </Box>
    );
  }

  if (error || !session) {
    return (
      <Box sx={{ py: 4, width: '100%', overflow: 'hidden' }}>
        <Box sx={{ px: 2 }}>
        <Alert severity="error">{error || 'Session not found'}</Alert>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/admin/fees/sessions')} sx={{ mt: 2 }}>
          Back to Sessions
        </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4, width: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ px: 2, mb: 3 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate('/admin/fees/sessions')}
          sx={{ mb: 2 }}
        >
          Back to Sessions
        </Button>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
              {session.session_name}
            </Typography>
            <Box display="flex" gap={1} alignItems="center">
              <Chip
                label={session.status.toUpperCase()}
                color={getStatusColor(session.status)}
                size="small"
              />
              <Typography variant="body2" color="text.secondary">
                Created on {formatDate(session.created_at)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {successMessage && (
        <Alert severity="success" onClose={() => setSuccessMessage(null)} sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3, width: '100%', m: 0, px: 2 }}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center', borderTop: 4, borderColor: 'primary.main' }}>
            <Typography variant="h3" fontWeight="bold" color="primary.main">
              {session.total_students}
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              Total Students
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center', borderTop: 4, borderColor: 'success.main' }}>
            <Typography variant="h3" fontWeight="bold" color="success.main">
              {session.students_paid}
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              Paid
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center', borderTop: 4, borderColor: 'warning.main' }}>
            <Typography variant="h3" fontWeight="bold" color="warning.main">
              {session.students_pending}
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              Pending
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center', borderTop: 4, borderColor: 'info.main' }}>
            <Typography variant="h3" fontWeight="bold" color="info.main">
              {session.collection_percentage.toFixed(1)}%
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              Collection Rate
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Financial Summary */}
      <Box sx={{ px: 2, mb: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Financial Summary
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Typography variant="caption" color="text.secondary">Total Expected</Typography>
            <Typography variant="h5" fontWeight="bold">
              {formatCurrency(session.total_amount)}
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="caption" color="text.secondary">Collected</Typography>
            <Typography variant="h5" fontWeight="bold" color="success.main">
              {formatCurrency(session.collected_amount)}
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="caption" color="text.secondary">Outstanding</Typography>
            <Typography variant="h5" fontWeight="bold" color="error.main">
              {formatCurrency(session.outstanding_amount)}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="caption" color="text.secondary" display="block" mb={1}>
              Collection Progress
            </Typography>
            <LinearProgress
              variant="determinate"
              value={session.collection_percentage}
              color={session.collection_percentage >= 75 ? 'success' : session.collection_percentage >= 50 ? 'warning' : 'error'}
              sx={{ height: 12, borderRadius: 6 }}
            />
          </Grid>
        </Grid>
      </Paper>
      </Box>

      {/* Session Details */}
      <Box sx={{ px: 2, mb: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Session Details
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="caption" color="text.secondary">Fee Structure</Typography>
            <Typography variant="body1">{session.fee_structure_name || 'N/A'}</Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="caption" color="text.secondary">Academic Year</Typography>
            <Typography variant="body1">{session.academic_year_name || 'N/A'}</Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="caption" color="text.secondary">Start Date</Typography>
            <Typography variant="body1">{formatDate(session.start_date)}</Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="caption" color="text.secondary">Due Date</Typography>
            <Typography variant="body1" color="error.main" fontWeight="medium">
              {formatDate(session.due_date)}
            </Typography>
          </Grid>

          {session.session_description && (
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary">Description</Typography>
              <Typography variant="body2">{session.session_description}</Typography>
            </Grid>
          )}
        </Grid>
      </Paper>
      </Box>

      {/* Student Assignments */}
      <Box sx={{ px: 2 }}>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight="bold">
            Student Assignments ({session.student_assignments.length})
          </Typography>
          <TextField
            size="small"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: 300 }}
          />
        </Box>

        <Divider sx={{ mb: 2 }} />

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell><strong>Student Name</strong></TableCell>
                <TableCell><strong>Admission No.</strong></TableCell>
                <TableCell><strong>Class</strong></TableCell>
                <TableCell align="right"><strong>Expected Amount</strong></TableCell>
                <TableCell align="right"><strong>Paid Amount</strong></TableCell>
                <TableCell align="right"><strong>Outstanding</strong></TableCell>
                <TableCell align="center"><strong>Status</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No students found matching "{searchQuery}"
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => (
                  <TableRow key={student.student_id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        {student.is_paid ? (
                          <CheckCircleIcon color="success" fontSize="small" />
                        ) : (
                          <PendingIcon color="warning" fontSize="small" />
                        )}
                        <Typography variant="body2">{student.student_name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{student.admission_number}</TableCell>
                    <TableCell>
                      {student.class_name} {student.section && `- ${student.section}`}
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="medium">
                        {formatCurrency(student.expected_amount)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="success.main">
                        {formatCurrency(student.paid_amount)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="error.main">
                        {formatCurrency(student.outstanding_amount)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={student.payment_status.toUpperCase()}
                        color={getPaymentStatusColor(student.payment_status)}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      </Box>
    </Box>
  );
};

export default FeeSessionDetailsPage;
