/**
 * Manual Ledger Entry Form Page
 *
 * Admin-only page for creating manual ledger entries (discounts, waivers, refunds, etc.)
 * Used for offline adjustments and corrections to student ledgers.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  TextField,
  MenuItem,
  Button,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  IconButton,
  Autocomplete,
  InputAdornment,
  Divider,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { ledgerApi } from '../../../services/ledgerApi';
import { studentApi } from '../../../services/sisApi';
import type { ManualLedgerEntryCreate } from '../../../types/ledger';
import type { StudentSummary } from '../../../types/student';
import { formatCurrency } from '../../../types/ledger';

// Manual entry types (only credit/adjustment entries)
const MANUAL_ENTRY_TYPES = [
  { value: 'discount', label: 'Discount', description: 'General fee discount' },
  { value: 'waiver', label: 'Waiver', description: 'Complete fee waiver' },
  { value: 'refund', label: 'Refund', description: 'Fee refund to student' },
  { value: 'late_fee_reversal', label: 'Late Fee Reversal', description: 'Reverse late fee charges' },
  { value: 'write_off', label: 'Write Off', description: 'Write off outstanding amount' },
];

// Academic years (hardcoded for now - should come from API)
const ACADEMIC_YEARS = [
  { id: 1, name: '2024-25' },
  { id: 2, name: '2023-24' },
  { id: 3, name: '2025-26' },
];

const ManualEntryFormPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preSelectedStudentId = searchParams.get('studentId');

  // Form state
  const [formData, setFormData] = useState<ManualLedgerEntryCreate>({
    student_id: 0,
    academic_year_id: 1, // Default to current year
    entry_type: '',
    amount: 0,
    description: '',
    transaction_date: new Date().toISOString().split('T')[0], // Today's date
    remarks: '',
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Student search state
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [studentOptions, setStudentOptions] = useState<StudentSummary[]>([]);
  const [studentLoading, setStudentLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentSummary | null>(null);

  // Load pre-selected student if provided
  useEffect(() => {
    if (preSelectedStudentId) {
      loadStudent(preSelectedStudentId);
    }
  }, [preSelectedStudentId]);

  // Load student by ID
  const loadStudent = async (studentId: string) => {
    try {
      setStudentLoading(true);
      const student = await studentApi.getStudent(studentId);
      const studentSummary: StudentSummary = {
        id: student.id,
        admission_number: student.admission_number,
        first_name: student.first_name,
        last_name: student.last_name,
        full_name: `${student.first_name} ${student.last_name}`,
        roll_number: student.roll_number,
        gender: student.gender,
        date_of_birth: student.date_of_birth,
        age: 0, // Will be calculated by backend
        student_status: student.status,
        profile_completeness_percentage: 0,
      };
      setSelectedStudent(studentSummary);
      setFormData((prev) => ({ ...prev, student_id: parseInt(studentId) }));
    } catch (err) {
      console.error('Failed to load student:', err);
      setError('Failed to load student details');
    } finally {
      setStudentLoading(false);
    }
  };

  // Search students
  const handleStudentSearch = async (query: string) => {
    if (query.length < 2) {
      setStudentOptions([]);
      return;
    }

    try {
      setStudentLoading(true);
      const results = await studentApi.searchStudents(query, 20);
      setStudentOptions(results);
    } catch (err) {
      console.error('Student search failed:', err);
      setStudentOptions([]);
    } finally {
      setStudentLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (studentSearchQuery) {
        handleStudentSearch(studentSearchQuery);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [studentSearchQuery]);

  // Handle form field changes
  const handleChange = (field: keyof ManualLedgerEntryCreate, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.student_id || formData.student_id === 0) {
      errors.student_id = 'Please select a student';
    }

    if (!formData.academic_year_id) {
      errors.academic_year_id = 'Please select an academic year';
    }

    if (!formData.entry_type) {
      errors.entry_type = 'Please select an entry type';
    }

    if (!formData.amount || formData.amount <= 0) {
      errors.amount = 'Amount must be greater than 0';
    }

    if (!formData.description || formData.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }

    if (!formData.transaction_date) {
      errors.transaction_date = 'Please select a transaction date';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      setError('Please fix the validation errors');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await ledgerApi.createManualEntry(formData);
      setSuccess(true);

      // Redirect to student ledger page after 2 seconds
      setTimeout(() => {
        navigate(`/admin/ledger/student/${formData.student_id}`);
      }, 2000);
    } catch (err: any) {
      console.error('Failed to create manual entry:', err);
      setError(err.response?.data?.detail || 'Failed to create manual entry');
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (preSelectedStudentId) {
      navigate(`/admin/ledger/student/${preSelectedStudentId}`);
    } else {
      navigate(-1);
    }
  };

  // Get selected entry type details
  const selectedEntryType = MANUAL_ENTRY_TYPES.find((t) => t.value === formData.entry_type);

  return (
    <Box sx={{ py: 4, width: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ px: 2, mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={handleCancel}>
            <BackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" gutterBottom>
              Create Manual Ledger Entry
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create manual adjustments to student ledger (discounts, waivers, refunds, etc.)
            </Typography>
          </Box>
        </Box>
      </Box>

      <Container maxWidth="md" sx={{ px: 2 }}>
        {/* Success Message */}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Manual entry created successfully! Redirecting to student ledger...
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Info Card */}
        <Card sx={{ mb: 3, bgcolor: 'info.lighter', borderLeft: 4, borderColor: 'info.main' }}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <InfoIcon color="info" />
              <Box>
                <Typography variant="subtitle2" fontWeight={600} color="info.main">
                  Important Information
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Manual entries are used for adjustments that are not part of the normal payment flow.
                  All entries will be recorded with your admin credentials and timestamp.
                  Please ensure the details are accurate before submission.
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Form */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Student Selection */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Student Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                fullWidth
                options={studentOptions}
                getOptionLabel={(option) =>
                  `${option.full_name} (${option.admission_number}${
                    option.roll_number ? ` - Roll: ${option.roll_number}` : ''
                  })`
                }
                value={selectedStudent}
                onChange={(_, newValue) => {
                  setSelectedStudent(newValue);
                  handleChange('student_id', newValue?.id || 0);
                }}
                inputValue={studentSearchQuery}
                onInputChange={(_, newInputValue) => {
                  setStudentSearchQuery(newInputValue);
                }}
                loading={studentLoading}
                disabled={!!preSelectedStudentId || loading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search Student *"
                    placeholder="Type name, admission number, or roll number"
                    error={!!validationErrors.student_id}
                    helperText={
                      validationErrors.student_id ||
                      'Search by student name, admission number, or roll number'
                    }
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {studentLoading ? <CircularProgress size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {option.full_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.admission_number}
                        {option.roll_number && ` • Roll: ${option.roll_number}`}
                      </Typography>
                    </Box>
                  </li>
                )}
              />
            </Grid>

            {/* Academic Year */}
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Academic Year *"
                value={formData.academic_year_id}
                onChange={(e) => handleChange('academic_year_id', parseInt(e.target.value))}
                error={!!validationErrors.academic_year_id}
                helperText={validationErrors.academic_year_id || 'Select academic year for this entry'}
                disabled={loading}
              >
                {ACADEMIC_YEARS.map((year) => (
                  <MenuItem key={year.id} value={year.id}>
                    {year.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Entry Type */}
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Entry Type *"
                value={formData.entry_type}
                onChange={(e) => handleChange('entry_type', e.target.value)}
                error={!!validationErrors.entry_type}
                helperText={validationErrors.entry_type || 'Select type of adjustment'}
                disabled={loading}
              >
                {MANUAL_ENTRY_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    <Box>
                      <Typography variant="body2">{type.label}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {type.description}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Transaction Details */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mt: 2 }}>
                Transaction Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            {/* Amount */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Amount *"
                value={formData.amount || ''}
                onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
                error={!!validationErrors.amount}
                helperText={validationErrors.amount || 'Enter adjustment amount'}
                disabled={loading}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  inputProps: { min: 0, step: 0.01 },
                }}
              />
            </Grid>

            {/* Transaction Date */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Transaction Date *"
                value={formData.transaction_date}
                onChange={(e) => handleChange('transaction_date', e.target.value)}
                error={!!validationErrors.transaction_date}
                helperText={validationErrors.transaction_date || 'Date of adjustment'}
                disabled={loading}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description *"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                error={!!validationErrors.description}
                helperText={
                  validationErrors.description ||
                  `Provide detailed reason for this adjustment (min 10 characters) - ${formData.description.length}/10`
                }
                disabled={loading}
                placeholder="e.g., Discount approved by principal for academic excellence..."
              />
            </Grid>

            {/* Remarks (Optional) */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Remarks (Optional)"
                value={formData.remarks || ''}
                onChange={(e) => handleChange('remarks', e.target.value)}
                helperText="Additional notes or comments"
                disabled={loading}
                placeholder="Any additional information..."
              />
            </Grid>

            {/* Summary Card */}
            {selectedStudent && formData.entry_type && formData.amount > 0 && (
              <Grid item xs={12}>
                <Card sx={{ bgcolor: 'primary.lighter', borderLeft: 4, borderColor: 'primary.main' }}>
                  <CardContent>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Entry Summary
                    </Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Student:
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {selectedStudent.full_name}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Admission Number:
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {selectedStudent.admission_number}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Entry Type:
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {selectedEntryType?.label}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Amount:
                        </Typography>
                        <Typography variant="body2" fontWeight={600} color="success.main">
                          {formatCurrency(formData.amount)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Action Buttons */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                  disabled={loading}
                  size="large"
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                  onClick={handleSubmit}
                  disabled={loading || success}
                  size="large"
                >
                  {loading ? 'Creating...' : 'Create Entry'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default ManualEntryFormPage;
