/**
 * Student Ledger Timeline Page
 *
 * Displays complete financial transaction history for a student.
 * Shows chronological timeline with balance summary and filtering options.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  Button,
  Chip,
  Pagination,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Download as ExportIcon,
  Refresh as RefreshIcon,
  TrendingUp as DebitIcon,
  TrendingDown as CreditIcon,
  Block as ReversedIcon,
} from '@mui/icons-material';
import LedgerSummaryCard from '../../components/ledger/LedgerSummaryCard';
import { ledgerApi } from '../../services/ledgerApi';
import type {
  StudentLedgerDetail,
  LedgerTimelineItem,
  LedgerQueryParams,
} from '../../types/ledger';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  getEntryTypeConfig,
  LEDGER_ENTRY_TYPES,
} from '../../types/ledger';

const StudentLedgerTimelinePage: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();

  // State
  const [ledgerData, setLedgerData] = useState<StudentLedgerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [filters, setFilters] = useState<LedgerQueryParams>({
    skip: 0,
    limit: 50,
  });
  const [entryTypeFilter, setEntryTypeFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 50;

  // Load ledger data
  const loadLedgerData = async () => {
    if (!studentId) return;

    setLoading(true);
    setError(null);

    try {
      const params: LedgerQueryParams = {
        skip: (page - 1) * itemsPerPage,
        limit: itemsPerPage,
      };

      if (entryTypeFilter && entryTypeFilter !== 'all') {
        params.entry_type = entryTypeFilter as any;
      }

      if (startDate) {
        params.start_date = startDate;
      }

      if (endDate) {
        params.end_date = endDate;
      }

      const data = await ledgerApi.getStudentLedger(parseInt(studentId), params);
      setLedgerData(data);
    } catch (err: any) {
      console.error('Failed to load ledger:', err);
      setError(err.response?.data?.detail || 'Failed to load ledger data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLedgerData();
  }, [studentId, page, entryTypeFilter, startDate, endDate]);

  // Handle filter changes
  const handleEntryTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEntryTypeFilter(event.target.value);
    setPage(1); // Reset to first page
  };

  const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(event.target.value);
    setPage(1);
  };

  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(event.target.value);
    setPage(1);
  };

  const handleClearFilters = () => {
    setEntryTypeFilter('all');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExport = async () => {
    if (!studentId) return;
    try {
      const blob = await ledgerApi.exportLedgerPDF(parseInt(studentId));
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ledger_${ledgerData?.student_name}_${new Date().toISOString().split('T')[0]}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export functionality is not yet implemented');
    }
  };

  // Render transaction card
  const renderTransactionCard = (transaction: LedgerTimelineItem) => {
    const config = getEntryTypeConfig(transaction.entry_type);
    const isDebit = transaction.debit_amount > 0;
    const amount = isDebit ? transaction.debit_amount : transaction.credit_amount;

    return (
      <Card
        key={transaction.id}
        variant="outlined"
        sx={{
          mb: 2,
          borderLeft: 4,
          borderLeftColor: transaction.is_reversed
            ? 'grey.300'
            : isDebit
            ? 'error.main'
            : 'success.main',
          opacity: transaction.is_reversed ? 0.6 : 1,
        }}
      >
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            {/* Date & Transaction Number */}
            <Grid item xs={12} md={3}>
              <Typography variant="caption" color="text.secondary" display="block">
                {formatDate(transaction.transaction_date)}
              </Typography>
              <Typography variant="body2" fontFamily="monospace" color="text.secondary">
                {transaction.transaction_number}
              </Typography>
            </Grid>

            {/* Description & Type */}
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                {isDebit ? (
                  <DebitIcon fontSize="small" color="error" />
                ) : (
                  <CreditIcon fontSize="small" color="success" />
                )}
                <Chip
                  label={config?.label || transaction.entry_type}
                  size="small"
                  color={config?.color || 'default'}
                  sx={{ fontSize: '0.7rem' }}
                />
                {transaction.is_reversed && (
                  <Chip
                    icon={<ReversedIcon />}
                    label="Reversed"
                    size="small"
                    color="default"
                    variant="outlined"
                    sx={{ fontSize: '0.7rem' }}
                  />
                )}
              </Box>
              <Typography variant="body2">
                {transaction.description}
              </Typography>
              {transaction.payment_method && (
                <Typography variant="caption" color="text.secondary">
                  Payment Method: {transaction.payment_method.toUpperCase()}
                </Typography>
              )}
            </Grid>

            {/* Amount */}
            <Grid item xs={6} md={2}>
              <Typography variant="caption" color="text.secondary" display="block">
                {isDebit ? 'Debit' : 'Credit'}
              </Typography>
              <Typography
                variant="h6"
                color={isDebit ? 'error.main' : 'success.main'}
                fontWeight="bold"
              >
                {isDebit ? '+' : '-'} {formatCurrency(amount)}
              </Typography>
            </Grid>

            {/* Balance */}
            <Grid item xs={6} md={3}>
              <Typography variant="caption" color="text.secondary" display="block">
                Balance After
              </Typography>
              <Typography
                variant="h6"
                fontWeight="bold"
                color={transaction.balance > 0 ? 'error.main' : 'success.main'}
              >
                {formatCurrency(transaction.balance)}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  if (loading && !ledgerData) {
    return (
      <Box sx={{ py: 4, width: '100%', overflow: 'hidden' }}>
        <Box sx={{ px: 2, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Loading ledger data...
        </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 4, width: '100%', overflow: 'hidden' }}>
        <Box sx={{ px: 2 }}>
        <Alert severity="error">{error}</Alert>
        <Button startIcon={<BackIcon />} onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Go Back
        </Button>
        </Box>
      </Box>
    );
  }

  if (!ledgerData) {
    return null;
  }

  const totalPages = Math.ceil(ledgerData.total_transactions / itemsPerPage);

  return (
    <Box sx={{ py: 4, width: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ px: 2, mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate(-1)}>
            <BackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" gutterBottom>
              Financial Ledger
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {ledgerData.student_name} • {ledgerData.admission_number}
              {ledgerData.roll_number && ` • Roll No: ${ledgerData.roll_number}`}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={loadLedgerData} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            onClick={handleExport}
            disabled={loading}
          >
            Export PDF
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ width: '100%', m: 0, px: 2 }}>
        {/* Left Side - Summary Card */}
        <Grid item xs={12} md={4}>
          <LedgerSummaryCard
            summary={ledgerData.summary}
            studentName={ledgerData.student_name}
            loading={loading}
          />
        </Grid>

        {/* Right Side - Timeline */}
        <Grid item xs={12} md={8}>
          {/* Filters */}
          <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <FilterIcon color="action" />
              <Typography variant="h6">Filters</Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
                  label="Entry Type"
                  value={entryTypeFilter}
                  onChange={handleEntryTypeChange}
                  size="small"
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="fee_assignment">Fee Assignments</MenuItem>
                  <MenuItem value="adhoc_fee">Adhoc Fees</MenuItem>
                  <MenuItem value="payment_online">Online Payments</MenuItem>
                  <MenuItem value="payment_cash">Cash Payments</MenuItem>
                  <MenuItem value="discount">Discounts</MenuItem>
                  <MenuItem value="waiver">Waivers</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  type="date"
                  label="Start Date"
                  value={startDate}
                  onChange={handleStartDateChange}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  type="date"
                  label="End Date"
                  value={endDate}
                  onChange={handleEndDateChange}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleClearFilters}
                  size="small"
                  sx={{ height: '40px' }}
                >
                  Clear
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Transaction Timeline */}
          {ledgerData.timeline.length === 0 ? (
            <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No transactions found for the selected filters.
              </Typography>
            </Paper>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Showing {ledgerData.timeline.length} of {ledgerData.total_transactions} transactions
              </Typography>

              {ledgerData.timeline.map((transaction) => renderTransactionCard(transaction))}

              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}
            </>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentLedgerTimelinePage;
