/**
 * Manual Ledger Entry Page
 *
 * Admin creates manual ledger entries for offline payments, adjustments, etc.
 * Used for cash payments, cheque payments, bank transfers, waivers, etc.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  MenuItem,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Autocomplete,
  InputAdornment,
  Divider,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Save as SaveIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { ledgerApi } from '../../services/ledgerApi';
import api from '../../services/api';
import type { ManualLedgerEntryCreate, LedgerEntryType } from '../../types/ledger';

interface Student {
  id: number;
  full_name: string;
  admission_number: string;
  roll_number?: string;
  class_name?: string;
}

interface AcademicYear {
  id: number;
  year_name: string;
  is_current: boolean;
}

const ManualLedgerEntryPage: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form data
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [academicYearId, setAcademicYearId] = useState<number>(0);
  const [entryType, setEntryType] = useState<LedgerEntryType>('payment_cash');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [transactionDate, setTransactionDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [paymentReference, setPaymentReference] = useState<string>('');

  // Options
  const [students, setStudents] = useState<Student[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Load academic years
  useEffect(() => {
    const loadAcademicYears = async () => {
      try {
        const response = await api.get('/api/v1/academic/years');
        setAcademicYears(response.data);
        const currentYear = response.data.find((year: AcademicYear) => year.is_current);
        if (currentYear) {
          setAcademicYearId(currentYear.id);
        }
      } catch (err) {
        console.error('Failed to load academic years:', err);
      }
    };
    loadAcademicYears();
  }, []);

  // Load students (search)
  const searchStudents = async (searchQuery: string) => {
    if (searchQuery.length < 2) return;

    setLoadingStudents(true);
    try {
      const response = await api.get('/api/v1/students', {
        params: { search: searchQuery, limit: 20 },
      });
      setStudents(response.data);
    } catch (err) {
      console.error('Failed to search students:', err);
    } finally {
      setLoadingStudents(false);
    }
  };

  // Entry type options
  const entryTypeOptions = [
    { value: 'payment_cash', label: 'Cash Payment', category: 'Payment' },
    { value: 'payment_cheque', label: 'Cheque Payment', category: 'Payment' },
    { value: 'payment_dd', label: 'Demand Draft', category: 'Payment' },
    { value: 'payment_bank_transfer', label: 'Bank Transfer (NEFT/RTGS/IMPS)', category: 'Payment' },
    { value: 'payment_upi', label: 'UPI Payment', category: 'Payment' },
    { value: 'discount', label: 'Discount', category: 'Adjustment' },
    { value: 'waiver', label: 'Fee Waiver', category: 'Adjustment' },
    { value: 'scholarship', label: 'Scholarship', category: 'Adjustment' },
    { value: 'refund', label: 'Refund', category: 'Adjustment' },
    { value: 'adjustment_credit', label: 'Adjustment (Credit)', category: 'Adjustment' },
    { value: 'adjustment_debit', label: 'Adjustment (Debit)', category: 'Adjustment' },
    { value: 'fine', label: 'Fine', category: 'Charge' },
    { value: 'late_fee', label: 'Late Fee', category: 'Charge' },
  ];

  const paymentMethodOptions = [
    { value: 'cash', label: 'Cash' },
    { value: 'cheque', label: 'Cheque' },
    { value: 'dd', label: 'Demand Draft' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'upi', label: 'UPI' },
  ];

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStudent) {
      setError('Please select a student');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!description) {
      setError('Please enter a description');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const entryData: ManualLedgerEntryCreate = {
        student_id: selectedStudent.id,
        academic_year_id: academicYearId,
        entry_type: entryType,
        amount: parseFloat(amount),
        description,
        transaction_date: transactionDate,
      };

      // Add payment details if this is a payment entry
      if (entryType.startsWith('payment_')) {
        entryData.payment_method = paymentMethod as any;
        if (paymentReference) {
          entryData.payment_reference = paymentReference;
        }
      }

      const result = await ledgerApi.createManualEntry(entryData);

      setSuccess(`Ledger entry created successfully! Transaction #${result.transaction_number}`);

      // Reset form
      setSelectedStudent(null);
      setAmount('');
      setDescription('');
      setPaymentReference('');
      setEntryType('payment_cash');
      setTransactionDate(new Date().toISOString().split('T')[0]);

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate(`/admin/ledger/student/${selectedStudent.id}`);
      }, 2000);
    } catch (err: any) {
      console.error('Failed to create ledger entry:', err);
      setError(err.response?.data?.detail || 'Failed to create ledger entry');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <Box sx={{ py: 4, width: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ px: 2, mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button startIcon={<BackIcon />} onClick={handleCancel}>
          Back
        </Button>
        <Box>
          <Typography variant="h4" gutterBottom>
            Create Manual Ledger Entry
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Record offline payments, adjustments, and other financial transactions
          </Typography>
        </Box>
      </Box>

      {/* Success/Error Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Form */}
      <Box sx={{ px: 2 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Student Selection */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ReceiptIcon color="primary" />
                Student Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <Autocomplete
                options={students}
                getOptionLabel={(option) =>
                  `${option.full_name} (${option.admission_number})${
                    option.class_name ? ` - ${option.class_name}` : ''
                  }`
                }
                value={selectedStudent}
                onChange={(event, newValue) => setSelectedStudent(newValue)}
                onInputChange={(event, value) => {
                  if (value.length >= 2) {
                    searchStudents(value);
                  }
                }}
                loading={loadingStudents}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search Student *"
                    placeholder="Type name or admission number"
                    helperText="Start typing to search students"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingStudents ? <CircularProgress size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Academic Year *"
                value={academicYearId}
                onChange={(e) => setAcademicYearId(parseInt(e.target.value))}
                required
              >
                {academicYears.map((year) => (
                  <MenuItem key={year.id} value={year.id}>
                    {year.year_name} {year.is_current && '(Current)'}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Transaction Details */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Transaction Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Entry Type *"
                value={entryType}
                onChange={(e) => setEntryType(e.target.value as LedgerEntryType)}
                required
                helperText="Select the type of transaction"
              >
                <MenuItem disabled value="">
                  <em>Select entry type</em>
                </MenuItem>
                {entryTypeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label} ({option.category})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Amount (₹) *"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
                helperText="Enter the transaction amount"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description *"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                multiline
                rows={2}
                placeholder="E.g., Cash payment for Q1 tuition fees"
                helperText="Enter a clear description of this transaction"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Transaction Date *"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                required
                InputLabelProps={{ shrink: true }}
                helperText="Date when this transaction occurred"
              />
            </Grid>

            {/* Payment Method Fields (only for payment entries) */}
            {entryType.startsWith('payment_') && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    fullWidth
                    label="Payment Method *"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    required
                  >
                    {paymentMethodOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Receipt/Reference Number"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    placeholder="E.g., RCPT/001 or Cheque #123456"
                    helperText="Enter receipt number, cheque number, or transaction ID"
                  />
                </Grid>
              </>
            )}

            {/* Action Buttons */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  disabled={loading}
                  size="large"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                  disabled={loading || !selectedStudent}
                  size="large"
                >
                  {loading ? 'Creating...' : 'Create Entry'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
      </Box>
    </Box>
  );
};

export default ManualLedgerEntryPage;
