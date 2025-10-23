import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  Divider,
  Checkbox,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  InputAdornment,
  Chip,
  Stack,
  Card,
  CardContent,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import PaymentIcon from '@mui/icons-material/Payment';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { type PaymentMethod, type OfflinePaymentFormData, type OutstandingFeeItem, type PaymentAllocation } from '../../types/fees';
import api, { academicApi } from '../../services/api';

const PAYMENT_METHODS: { value: PaymentMethod; label: string; needsDetails: string[] }[] = [
  { value: 'cash', label: 'Cash', needsDetails: [] },
  { value: 'upi', label: 'UPI', needsDetails: ['transaction_id'] },
  { value: 'cheque', label: 'Cheque', needsDetails: ['cheque_number', 'cheque_date', 'bank_name', 'branch_name'] },
  { value: 'demand_draft', label: 'Demand Draft', needsDetails: ['transaction_id', 'bank_name'] },
  { value: 'bank_transfer', label: 'Bank Transfer (NEFT/RTGS/IMPS)', needsDetails: ['transaction_id', 'bank_reference', 'bank_name'] },
  { value: 'credit_card', label: 'Credit Card', needsDetails: [] },
  { value: 'debit_card', label: 'Debit Card', needsDetails: [] },
  { value: 'net_banking', label: 'Net Banking', needsDetails: ['transaction_id', 'bank_name'] },
  { value: 'wallet', label: 'Digital Wallet', needsDetails: ['transaction_id'] },
  { value: 'other', label: 'Other', needsDetails: [] },
];

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  admission_number: string;
  roll_number?: string;
  class_name?: string;
}

interface AcademicYear {
  id: number;
  year_name: string;
}

const RecordPaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form data
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<number | ''>('');
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [paymentDate, setPaymentDate] = useState<Date | null>(new Date());
  const [remarks, setRemarks] = useState('');

  // Payment method specific fields
  const [chequeNumber, setChequeNumber] = useState('');
  const [chequeDate, setChequeDate] = useState<Date | null>(null);
  const [bankName, setBankName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [bankReference, setBankReference] = useState('');

  // Fee allocation
  const [showAllocation, setShowAllocation] = useState(false);
  const [outstandingFees, setOutstandingFees] = useState<OutstandingFeeItem[]>([]);
  const [allocations, setAllocations] = useState<Map<number, number>>(new Map());

  // Load academic years on mount
  useEffect(() => {
    const loadAcademicYears = async () => {
      try {
        const years = await academicApi.getAcademicYears();
        setAcademicYears(years);
        // Auto-select first academic year
        if (years.length > 0) {
          setSelectedAcademicYear(years[0].id);
        }
      } catch (err) {
        console.error('Failed to load academic years:', err);
        // Set a default academic year if the backend endpoint doesn't exist yet
        setAcademicYears([{ id: 1, year_name: '2024-2025' }]);
        setSelectedAcademicYear(1);
      }
    };
    loadAcademicYears();
  }, []);

  // Load students when searching
  useEffect(() => {
    const searchStudents = async () => {
      if (!studentSearch || studentSearch.length < 2) {
        setStudents([]);
        return;
      }

      try {
        // TODO: Implement student search endpoint in backend
        // For now, create a mock student for testing
        setStudents([
          {
            id: 1,
            first_name: 'John',
            last_name: 'Doe',
            admission_number: 'ADM001',
            roll_number: '101',
            class_name: 'Class 10A'
          }
        ]);
      } catch (err) {
        console.error('Failed to search students:', err);
      }
    };

    const debounce = setTimeout(searchStudents, 300);
    return () => clearTimeout(debounce);
  }, [studentSearch]);

  // Load outstanding fees when student is selected
  useEffect(() => {
    const loadOutstandingFees = async () => {
      if (!selectedStudent || !selectedAcademicYear) return;

      try {
        // Load fee sessions
        const sessionsResponse = await api.get('/api/v1/fees/sessions', {
          params: {
            student_id: selectedStudent.id,
            academic_year_id: selectedAcademicYear,
          },
        });

        // Load adhoc fees
        const adhocResponse = await api.get('/api/v1/fees/adhoc', {
          params: {
            student_id: selectedStudent.id,
            is_paid: false,
          },
        });

        const outstandingItems: OutstandingFeeItem[] = [];

        // Add fee sessions
        if (sessionsResponse.data) {
          sessionsResponse.data.forEach((session: any) => {
            if (session.outstanding_amount > 0) {
              outstandingItems.push({
                id: session.id,
                fee_type: 'fee_session',
                description: session.session_name,
                total_amount: session.expected_amount,
                paid_amount: session.paid_amount,
                outstanding_amount: session.outstanding_amount,
                due_date: session.due_date,
                is_overdue: new Date(session.due_date) < new Date(),
              });
            }
          });
        }

        // Add adhoc fees
        if (adhocResponse.data) {
          adhocResponse.data.forEach((adhoc: any) => {
            if (adhoc.outstanding_amount > 0) {
              outstandingItems.push({
                id: adhoc.id,
                fee_type: 'adhoc_fee',
                description: adhoc.fee_name,
                total_amount: adhoc.amount,
                paid_amount: adhoc.paid_amount,
                outstanding_amount: adhoc.outstanding_amount,
                due_date: adhoc.due_date,
                is_overdue: new Date(adhoc.due_date) < new Date(),
              });
            }
          });
        }

        setOutstandingFees(outstandingItems);
      } catch (err) {
        console.error('Failed to load outstanding fees:', err);
      }
    };

    if (showAllocation) {
      loadOutstandingFees();
    }
  }, [selectedStudent, selectedAcademicYear, showAllocation]);

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    setStudentSearch(`${student.first_name} ${student.last_name} (${student.admission_number})`);
    setStudents([]);
  };

  const handleAllocationChange = (feeId: number, amount: string) => {
    const numAmount = parseFloat(amount);
    if (!isNaN(numAmount) && numAmount >= 0) {
      const newAllocations = new Map(allocations);
      if (numAmount > 0) {
        newAllocations.set(feeId, numAmount);
      } else {
        newAllocations.delete(feeId);
      }
      setAllocations(newAllocations);
    }
  };

  const getTotalAllocated = (): number => {
    return Array.from(allocations.values()).reduce((sum, amount) => sum + amount, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!selectedStudent) {
      setError('Please select a student');
      return;
    }

    if (!selectedAcademicYear) {
      setError('Please select an academic year');
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid payment amount');
      return;
    }

    // Validate allocation if enabled
    if (showAllocation) {
      const totalAllocated = getTotalAllocated();
      if (Math.abs(totalAllocated - amount) > 0.01) {
        setError(`Allocated amount (₹${totalAllocated.toFixed(2)}) does not match payment amount (₹${amount.toFixed(2)})`);
        return;
      }
    }

    // Build payload
    const payload: OfflinePaymentFormData = {
      student_id: selectedStudent.id,
      academic_year_id: selectedAcademicYear as number,
      amount,
      payment_method: paymentMethod,
      payment_date: paymentDate?.toISOString(),
      remarks,
    };

    // Add method-specific details
    if (paymentMethod === 'cheque') {
      payload.cheque_number = chequeNumber;
      payload.cheque_date = chequeDate?.toISOString();
      payload.bank_name = bankName;
      payload.branch_name = branchName;
    } else if (paymentMethod === 'bank_transfer' || paymentMethod === 'net_banking' || paymentMethod === 'upi' || paymentMethod === 'wallet' || paymentMethod === 'demand_draft') {
      payload.transaction_id = transactionId;
      payload.bank_name = bankName;
      if (paymentMethod === 'bank_transfer') {
        payload.bank_reference = bankReference;
        payload.branch_name = branchName;
      }
    }

    // Add allocations
    if (showAllocation && allocations.size > 0) {
      const allocationArray: PaymentAllocation[] = [];
      outstandingFees.forEach((fee) => {
        const allocatedAmount = allocations.get(fee.id);
        if (allocatedAmount && allocatedAmount > 0) {
          if (fee.fee_type === 'fee_session') {
            allocationArray.push({
              fee_session_id: fee.id,
              amount: allocatedAmount,
            });
          } else {
            allocationArray.push({
              adhoc_fee_id: fee.id,
              amount: allocatedAmount,
            });
          }
        }
      });
      payload.allocate_to = allocationArray;
    }

    setLoading(true);
    try {
      const response = await api.post('/api/v1/fees/payments/offline/', payload);
      setSuccess(`Payment recorded successfully! Payment Number: ${response.data.payment_number}`);

      // Reset form
      setTimeout(() => {
        navigate('/admin/fees/payments');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  const needsDetails = PAYMENT_METHODS.find((m) => m.value === paymentMethod)?.needsDetails || [];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ py: 4, width: '100%', overflow: 'hidden' }}>
        <Box sx={{ px: 2 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/admin/fees')}
              sx={{ mr: 2 }}
            >
              Back
            </Button>
            <PaymentIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
            <Typography variant="h4" component="h1">
              Record Payment
            </Typography>
          </Box>

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

          <Paper sx={{ p: 4 }}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Student Selection */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    1. Student Information
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Search Student"
                    placeholder="Enter name or admission number"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    helperText="Type at least 2 characters to search"
                  />
                  {students.length > 0 && (
                    <Paper sx={{ mt: 1, maxHeight: 200, overflow: 'auto' }}>
                      {students.map((student) => (
                        <Box
                          key={student.id}
                          sx={{ p: 1, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                          onClick={() => handleStudentSelect(student)}
                        >
                          <Typography>
                            {student.first_name} {student.last_name} ({student.admission_number})
                          </Typography>
                          {student.class_name && (
                            <Typography variant="caption" color="text.secondary">
                              {student.class_name} {student.roll_number ? `- Roll: ${student.roll_number}` : ''}
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Paper>
                  )}
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Academic Year</InputLabel>
                    <Select
                      value={selectedAcademicYear}
                      label="Academic Year"
                      onChange={(e) => setSelectedAcademicYear(e.target.value as number)}
                    >
                      {academicYears.map((year) => (
                        <MenuItem key={year.id} value={year.id}>
                          {year.year_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    2. Payment Details
                  </Typography>
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    required
                    label="Payment Amount"
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    }}
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControl fullWidth required>
                    <InputLabel>Payment Method</InputLabel>
                    <Select
                      value={paymentMethod}
                      label="Payment Method"
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    >
                      {PAYMENT_METHODS.map((method) => (
                        <MenuItem key={method.value} value={method.value}>
                          {method.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                  <DatePicker
                    label="Payment Date"
                    value={paymentDate}
                    onChange={(newValue) => setPaymentDate(newValue)}
                    slotProps={{ textField: { fullWidth: true, required: true } }}
                  />
                </Grid>

                {/* Method-specific fields */}
                {needsDetails.includes('cheque_number') && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      required
                      label="Cheque Number"
                      value={chequeNumber}
                      onChange={(e) => setChequeNumber(e.target.value)}
                    />
                  </Grid>
                )}

                {needsDetails.includes('cheque_date') && (
                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="Cheque Date"
                      value={chequeDate}
                      onChange={(newValue) => setChequeDate(newValue)}
                      slotProps={{ textField: { fullWidth: true, required: true } }}
                    />
                  </Grid>
                )}

                {needsDetails.includes('bank_name') && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      required
                      label="Bank Name"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                    />
                  </Grid>
                )}

                {needsDetails.includes('branch_name') && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Branch Name"
                      value={branchName}
                      onChange={(e) => setBranchName(e.target.value)}
                    />
                  </Grid>
                )}

                {needsDetails.includes('transaction_id') && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      required
                      label="Transaction ID / Reference Number"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                    />
                  </Grid>
                )}

                {needsDetails.includes('bank_reference') && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Bank Reference Number"
                      value={bankReference}
                      onChange={(e) => setBankReference(e.target.value)}
                    />
                  </Grid>
                )}

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Remarks (Optional)"
                    multiline
                    rows={2}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Add any additional notes about this payment"
                  />
                </Grid>

                {/* Fee Allocation */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={showAllocation}
                        onChange={(e) => setShowAllocation(e.target.checked)}
                      />
                    }
                    label="Allocate payment to specific fees"
                  />
                </Grid>

                {showAllocation && (
                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          3. Fee Allocation
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          Allocate the payment amount to specific outstanding fees
                        </Typography>

                        {outstandingFees.length === 0 ? (
                          <Alert severity="info">
                            {selectedStudent
                              ? 'No outstanding fees found for this student'
                              : 'Please select a student to view outstanding fees'}
                          </Alert>
                        ) : (
                          <>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Fee Description</TableCell>
                                  <TableCell align="right">Total</TableCell>
                                  <TableCell align="right">Paid</TableCell>
                                  <TableCell align="right">Outstanding</TableCell>
                                  <TableCell align="center">Due Date</TableCell>
                                  <TableCell align="right" width={150}>
                                    Allocate Amount
                                  </TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {outstandingFees.map((fee) => (
                                  <TableRow key={`${fee.fee_type}-${fee.id}`}>
                                    <TableCell>
                                      {fee.description}
                                      {fee.is_overdue && (
                                        <Chip label="Overdue" size="small" color="error" sx={{ ml: 1 }} />
                                      )}
                                    </TableCell>
                                    <TableCell align="right">₹{fee.total_amount.toFixed(2)}</TableCell>
                                    <TableCell align="right">₹{fee.paid_amount.toFixed(2)}</TableCell>
                                    <TableCell align="right">
                                      <strong>₹{fee.outstanding_amount.toFixed(2)}</strong>
                                    </TableCell>
                                    <TableCell align="center">
                                      {new Date(fee.due_date).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell align="right">
                                      <TextField
                                        size="small"
                                        type="number"
                                        value={allocations.get(fee.id) || ''}
                                        onChange={(e) => handleAllocationChange(fee.id, e.target.value)}
                                        InputProps={{
                                          startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                        }}
                                        inputProps={{ min: 0, max: fee.outstanding_amount, step: 0.01 }}
                                      />
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>

                            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                              <Stack direction="row" spacing={4} justifyContent="flex-end">
                                <Typography>
                                  <strong>Payment Amount:</strong> ₹{paymentAmount || '0.00'}
                                </Typography>
                                <Typography>
                                  <strong>Total Allocated:</strong> ₹{getTotalAllocated().toFixed(2)}
                                </Typography>
                                <Typography
                                  color={
                                    Math.abs(getTotalAllocated() - parseFloat(paymentAmount || '0')) < 0.01
                                      ? 'success.main'
                                      : 'error.main'
                                  }
                                >
                                  <strong>Remaining:</strong> ₹
                                  {(parseFloat(paymentAmount || '0') - getTotalAllocated()).toFixed(2)}
                                </Typography>
                              </Stack>
                            </Box>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                )}

                {/* Submit Button */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button variant="outlined" onClick={() => navigate('/admin/fees/payments')}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={loading ? <ReceiptIcon /> : <SaveIcon />}
                      disabled={loading || !selectedStudent || !selectedAcademicYear}
                    >
                      {loading ? 'Recording Payment...' : 'Record Payment'}
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default RecordPaymentPage;
