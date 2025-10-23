import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  CurrencyRupee as RupeeIcon,
  TrendingUp as TrendingUpIcon,
  PendingActions as PendingIcon,
  CheckCircle as PaidIcon,
  Warning as OverdueIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { adhocFeeApi } from '../../services/feeApi';
import type { AdhocFeeListItem, AdhocFeeSummary } from '../../types/fees';

const AdhocFeeListPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [adhocFees, setAdhocFees] = useState<AdhocFeeListItem[]>([]);
  const [summary, setSummary] = useState<AdhocFeeSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFeeId, setSelectedFeeId] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    loadAdhocFees();
    loadSummary();

    // Show success message if coming from create page
    if (location.state?.message) {
      setSnackbar({
        open: true,
        message: location.state.message,
        severity: location.state.severity || 'success',
      });
      // Clear location state
      window.history.replaceState({}, document.title);
    }
  }, [statusFilter]);

  const loadAdhocFees = async () => {
    try {
      setLoading(true);
      const params: any = {
        search_query: searchQuery || undefined,
      };

      if (statusFilter && statusFilter !== 'all') {
        params.payment_status = statusFilter;
      }

      const data = await adhocFeeApi.list(params);
      setAdhocFees(data);
    } catch (err) {
      console.error('Failed to load adhoc fees:', err);
      setSnackbar({
        open: true,
        message: 'Failed to load adhoc fees',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const data = await adhocFeeApi.getSummary();
      setSummary(data);
    } catch (err) {
      console.error('Failed to load summary:', err);
    }
  };

  const handleSearch = () => {
    loadAdhocFees();
  };

  const handleDeleteClick = (feeId: number) => {
    setSelectedFeeId(feeId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedFeeId) return;

    try {
      await adhocFeeApi.delete(selectedFeeId);
      setSnackbar({
        open: true,
        message: 'Adhoc fee deleted successfully',
        severity: 'success',
      });
      loadAdhocFees();
      loadSummary();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.detail || 'Failed to delete adhoc fee',
        severity: 'error',
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedFeeId(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusChip = (status: string, isPaid: boolean) => {
    if (isPaid) {
      return <Chip label="Paid" color="success" size="small" icon={<PaidIcon />} />;
    }

    switch (status) {
      case 'pending':
        return <Chip label="Pending" color="warning" size="small" icon={<PendingIcon />} />;
      case 'partial':
        return <Chip label="Partial" color="info" size="small" />;
      case 'overdue':
        return <Chip label="Overdue" color="error" size="small" icon={<OverdueIcon />} />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedFees = adhocFees.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ py: 4, width: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ px: 2, mb: 4 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate('/admin/fees')}
          sx={{ mb: 2 }}
        >
          Back to Fee Dashboard
        </Button>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
              Adhoc Fee Assignments
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage individual fee assignments (lost items, fines, special fees)
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/admin/fees/adhoc/create')}
            size="large"
          >
            Create Adhoc Fee
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      {summary && (
        <Grid container spacing={3} sx={{ mb: 4, width: '100%', m: 0, px: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Total Assignments
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {summary.total_adhoc_fees}
                    </Typography>
                  </Box>
                  <RupeeIcon sx={{ fontSize: 48, color: 'primary.main', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Total Outstanding
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="error.main">
                      {formatCurrency(summary.total_outstanding)}
                    </Typography>
                  </Box>
                  <PendingIcon sx={{ fontSize: 48, color: 'error.main', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Total Collected
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="success.main">
                      {formatCurrency(summary.total_amount_paid)}
                    </Typography>
                  </Box>
                  <PaidIcon sx={{ fontSize: 48, color: 'success.main', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Collection Rate
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="primary.main">
                      {summary.collection_percentage.toFixed(1)}%
                    </Typography>
                  </Box>
                  <TrendingUpIcon sx={{ fontSize: 48, color: 'primary.main', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Box sx={{ px: 2, mb: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Search"
              placeholder="Search by fee name or student name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fullWidth
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Payment Status</InputLabel>
              <Select
                value={statusFilter}
                label="Payment Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="partial">Partial</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="overdue">Overdue</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Button
              variant="contained"
              onClick={handleSearch}
              fullWidth
              startIcon={<SearchIcon />}
            >
              Search
            </Button>
          </Grid>
        </Grid>
      </Paper>
      </Box>

      {/* Adhoc Fees Table */}
      <Box sx={{ px: 2 }}>
      <Paper>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
            <CircularProgress />
          </Box>
        ) : adhocFees.length === 0 ? (
          <Box p={6} textAlign="center">
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No adhoc fee assignments found
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Create your first adhoc fee assignment to get started
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/admin/fees/adhoc/create')}
            >
              Create Adhoc Fee
            </Button>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell><strong>Fee Name</strong></TableCell>
                    <TableCell><strong>Student</strong></TableCell>
                    <TableCell><strong>Admission No.</strong></TableCell>
                    <TableCell align="right"><strong>Amount</strong></TableCell>
                    <TableCell align="right"><strong>Paid</strong></TableCell>
                    <TableCell align="right"><strong>Outstanding</strong></TableCell>
                    <TableCell><strong>Due Date</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell align="center"><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedFees.map((fee) => (
                    <TableRow key={fee.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {fee.fee_name}
                        </Typography>
                      </TableCell>
                      <TableCell>{fee.student_name}</TableCell>
                      <TableCell>{fee.student_admission_number}</TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="medium">
                          {formatCurrency(fee.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="success.main">
                          {formatCurrency(fee.paid_amount)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="error.main">
                          {formatCurrency(fee.outstanding_amount)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(fee.due_date)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {getStatusChip(fee.payment_status, fee.is_paid)}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(fee.id)}
                          disabled={fee.paid_amount > 0}
                          title={fee.paid_amount > 0 ? "Cannot delete - payment received" : "Delete"}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={adhocFees.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </>
        )}
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Adhoc Fee Assignment</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this adhoc fee assignment? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      </Box>
    </Box>
  );
};

export default AdhocFeeListPage;
