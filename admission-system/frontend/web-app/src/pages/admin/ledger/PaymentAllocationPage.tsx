/**
 * Payment Allocation Page
 *
 * Admin page for allocating a payment to specific fees (fee sessions and adhoc fees).
 * Ensures payment amount is correctly distributed across outstanding fees.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Checkbox,
  TextField,
  Alert,
  CircularProgress,
  IconButton,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  InputAdornment,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { formatCurrency, formatDate } from '../../../types/ledger';
import type { OutstandingFeeItem, Payment } from '../../../types/fees';
import type { PaymentAllocationRequest } from '../../../types/ledger';

// Mock payment API (replace with actual API)
const mockPaymentApi = {
  getPayment: async (paymentId: number): Promise<Payment> => {
    // Mock data - replace with actual API call
    return {
      id: paymentId,
      payment_number: `PAY-2024-${paymentId.toString().padStart(5, '0')}`,
      payment_date: '2024-10-29',
      student_id: 1,
      student_name: 'Rahul Kumar',
      academic_year_id: 1,
      academic_year_name: '2024-25',
      amount: 15000,
      payment_method: 'cash',
      status: 'success',
      is_verified: false,
      is_reconciled: false,
      created_at: '2024-10-29T10:00:00',
    };
  },

  getOutstandingFees: async (_studentId: number): Promise<OutstandingFeeItem[]> => {
    // Mock data - replace with actual API call
    return [
      {
        id: 1,
        fee_type: 'fee_session',
        description: 'Tuition Fee - Term 1 2024-25',
        total_amount: 10000,
        paid_amount: 0,
        outstanding_amount: 10000,
        due_date: '2024-10-15',
        is_overdue: true,
      },
      {
        id: 2,
        fee_type: 'fee_session',
        description: 'Sports Fee - Annual 2024-25',
        total_amount: 3000,
        paid_amount: 0,
        outstanding_amount: 3000,
        due_date: '2024-11-01',
        is_overdue: false,
      },
      {
        id: 3,
        fee_type: 'adhoc_fee',
        description: 'Science Lab Fee - October',
        total_amount: 2000,
        paid_amount: 0,
        outstanding_amount: 2000,
        due_date: '2024-10-20',
        is_overdue: true,
      },
      {
        id: 4,
        fee_type: 'fee_session',
        description: 'Library Fee - Annual 2024-25',
        total_amount: 1500,
        paid_amount: 500,
        outstanding_amount: 1000,
        due_date: '2024-11-15',
        is_overdue: false,
      },
    ];
  },

  allocatePayment: async (
    paymentId: number,
    allocations: PaymentAllocationRequest[]
  ): Promise<void> => {
    // Mock API call - replace with actual implementation
    console.log('Allocating payment:', paymentId, allocations);
    return new Promise((resolve) => setTimeout(resolve, 1000));
  },
};

interface FeeAllocation {
  feeId: number;
  feeType: 'fee_session' | 'adhoc_fee';
  description: string;
  outstandingAmount: number;
  allocatedAmount: number;
  isSelected: boolean;
}

const PaymentAllocationPage: React.FC = () => {
  const { paymentId } = useParams<{ paymentId: string }>();
  const navigate = useNavigate();

  // State
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Payment data
  const [payment, setPayment] = useState<Payment | null>(null);
  const [outstandingFees, setOutstandingFees] = useState<OutstandingFeeItem[]>([]);

  // Allocation state
  const [allocations, setAllocations] = useState<FeeAllocation[]>([]);

  // Load payment and outstanding fees
  useEffect(() => {
    if (paymentId) {
      loadPaymentData();
    }
  }, [paymentId]);

  const loadPaymentData = async () => {
    if (!paymentId) return;

    setLoading(true);
    setError(null);

    try {
      const paymentData = await mockPaymentApi.getPayment(parseInt(paymentId));
      setPayment(paymentData);

      const fees = await mockPaymentApi.getOutstandingFees(paymentData.student_id);
      setOutstandingFees(fees);

      // Initialize allocations
      const initialAllocations: FeeAllocation[] = fees.map((fee) => ({
        feeId: fee.id,
        feeType: fee.fee_type,
        description: fee.description,
        outstandingAmount: fee.outstanding_amount,
        allocatedAmount: 0,
        isSelected: false,
      }));

      setAllocations(initialAllocations);
    } catch (err: any) {
      console.error('Failed to load payment data:', err);
      setError('Failed to load payment details');
    } finally {
      setLoading(false);
    }
  };

  // Handle fee selection
  const handleFeeSelection = (feeId: number, selected: boolean) => {
    setAllocations((prev) =>
      prev.map((allocation) => {
        if (allocation.feeId === feeId) {
          return {
            ...allocation,
            isSelected: selected,
            allocatedAmount: selected ? allocation.outstandingAmount : 0,
          };
        }
        return allocation;
      })
    );
  };

  // Handle allocation amount change
  const handleAmountChange = (feeId: number, amount: number) => {
    setAllocations((prev) =>
      prev.map((allocation) => {
        if (allocation.feeId === feeId) {
          // Ensure amount doesn't exceed outstanding
          const validAmount = Math.min(amount, allocation.outstandingAmount);
          return {
            ...allocation,
            allocatedAmount: validAmount,
          };
        }
        return allocation;
      })
    );
  };

  // Calculate totals
  const totalAllocated = allocations.reduce((sum, a) => sum + (a.isSelected ? a.allocatedAmount : 0), 0);
  const unallocatedAmount = payment ? payment.amount - totalAllocated : 0;
  const isValidAllocation = totalAllocated === (payment?.amount || 0) && totalAllocated > 0;
  const hasSelectedFees = allocations.some((a) => a.isSelected);

  // Handle auto-allocate (allocate to overdue fees first)
  const handleAutoAllocate = () => {
    if (!payment) return;

    let remainingAmount = payment.amount;
    const sortedFees = [...outstandingFees].sort((a, b) => {
      // Prioritize overdue fees
      if (a.is_overdue && !b.is_overdue) return -1;
      if (!a.is_overdue && b.is_overdue) return 1;
      // Then sort by due date
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    });

    const newAllocations: FeeAllocation[] = allocations.map((allocation) => {
      const fee = sortedFees.find((f) => f.id === allocation.feeId);
      if (!fee || remainingAmount <= 0) {
        return { ...allocation, isSelected: false, allocatedAmount: 0 };
      }

      const amountToAllocate = Math.min(remainingAmount, fee.outstanding_amount);
      remainingAmount -= amountToAllocate;

      return {
        ...allocation,
        isSelected: amountToAllocate > 0,
        allocatedAmount: amountToAllocate,
      };
    });

    setAllocations(newAllocations);
  };

  // Handle submission
  const handleSubmit = async () => {
    if (!isValidAllocation || !paymentId) {
      setError('Please ensure all payment amount is allocated correctly');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const allocationRequests: PaymentAllocationRequest[] = allocations
        .filter((a) => a.isSelected && a.allocatedAmount > 0)
        .map((a) => ({
          fee_session_id: a.feeType === 'fee_session' ? a.feeId : undefined,
          adhoc_fee_id: a.feeType === 'adhoc_fee' ? a.feeId : undefined,
          amount: a.allocatedAmount,
        }));

      await mockPaymentApi.allocatePayment(parseInt(paymentId), allocationRequests);
      setSuccess(true);

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate(`/admin/fees/payments/${paymentId}`);
      }, 2000);
    } catch (err: any) {
      console.error('Failed to allocate payment:', err);
      setError(err.response?.data?.detail || 'Failed to allocate payment');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (paymentId) {
      navigate(`/admin/fees/payments/${paymentId}`);
    } else {
      navigate(-1);
    }
  };

  if (loading) {
    return (
      <Box sx={{ py: 4, width: '100%', overflow: 'hidden', textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Loading payment details...
        </Typography>
      </Box>
    );
  }

  if (error && !payment) {
    return (
      <Box sx={{ py: 4, width: '100%', overflow: 'hidden' }}>
        <Container maxWidth="md" sx={{ px: 2 }}>
          <Alert severity="error">{error}</Alert>
          <Button startIcon={<BackIcon />} onClick={() => navigate(-1)} sx={{ mt: 2 }}>
            Go Back
          </Button>
        </Container>
      </Box>
    );
  }

  if (!payment) {
    return null;
  }

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
              Allocate Payment
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Allocate payment amount to specific fees for {payment.student_name}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Container maxWidth="xl" sx={{ px: 2 }}>
        {/* Success Message */}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }} icon={<CheckCircleIcon />}>
            Payment allocated successfully! Redirecting to payment details...
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Left Column - Payment Details */}
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 3, position: 'sticky', top: 20 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                <PaymentIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                Payment Details
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Payment Number
                </Typography>
                <Typography variant="body1" fontWeight={600} fontFamily="monospace">
                  {payment.payment_number}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Student
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {payment.student_name}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Payment Date
                </Typography>
                <Typography variant="body1">{formatDate(payment.payment_date)}</Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Payment Method
                </Typography>
                <Chip
                  label={payment.payment_method.toUpperCase()}
                  size="small"
                  color="primary"
                  sx={{ mt: 0.5 }}
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Total Amount
                </Typography>
                <Typography variant="h5" fontWeight={700} color="primary.main">
                  {formatCurrency(payment.amount)}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Allocated Amount
                </Typography>
                <Typography variant="h6" fontWeight={600} color="success.main">
                  {formatCurrency(totalAllocated)}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Unallocated Amount
                </Typography>
                <Typography
                  variant="h6"
                  fontWeight={600}
                  color={unallocatedAmount > 0 ? 'error.main' : 'success.main'}
                >
                  {formatCurrency(unallocatedAmount)}
                </Typography>
              </Box>

              {unallocatedAmount !== 0 && (
                <Alert
                  severity={unallocatedAmount > 0 ? 'warning' : 'error'}
                  icon={<WarningIcon />}
                  sx={{ mt: 2 }}
                >
                  {unallocatedAmount > 0
                    ? 'Please allocate the remaining amount'
                    : 'Allocated amount exceeds payment amount'}
                </Alert>
              )}

              {isValidAllocation && (
                <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mt: 2 }}>
                  Allocation is valid and ready to submit
                </Alert>
              )}
            </Paper>
          </Grid>

          {/* Right Column - Fee Allocation */}
          <Grid item xs={12} md={8}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Allocate to Fees
                </Typography>
                <Button variant="outlined" size="small" onClick={handleAutoAllocate} disabled={submitting}>
                  Auto Allocate
                </Button>
              </Box>

              <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 2 }}>
                Select fees and enter allocation amounts. Total must equal payment amount.
                Auto-allocate prioritizes overdue fees.
              </Alert>

              <Divider sx={{ mb: 2 }} />

              {outstandingFees.length === 0 ? (
                <Alert severity="info">No outstanding fees found for this student.</Alert>
              ) : (
                <Box>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell padding="checkbox" width={50}>
                          Select
                        </TableCell>
                        <TableCell>Fee Description</TableCell>
                        <TableCell align="right">Outstanding</TableCell>
                        <TableCell align="right" width={180}>
                          Allocate Amount
                        </TableCell>
                        <TableCell align="center" width={100}>
                          Status
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {allocations.map((allocation) => {
                        const fee = outstandingFees.find((f) => f.id === allocation.feeId);
                        if (!fee) return null;

                        return (
                          <TableRow
                            key={allocation.feeId}
                            hover
                            selected={allocation.isSelected}
                            sx={{
                              bgcolor: allocation.isSelected ? 'action.selected' : 'inherit',
                            }}
                          >
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={allocation.isSelected}
                                onChange={(e) => handleFeeSelection(allocation.feeId, e.target.checked)}
                                disabled={submitting}
                              />
                            </TableCell>
                            <TableCell>
                              <Box>
                                <Typography variant="body2" fontWeight={600}>
                                  {allocation.description}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Due: {formatDate(fee.due_date)}
                                  {fee.is_overdue && (
                                    <Chip
                                      label="OVERDUE"
                                      size="small"
                                      color="error"
                                      sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                                    />
                                  )}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight={600}>
                                {formatCurrency(allocation.outstandingAmount)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <TextField
                                type="number"
                                size="small"
                                value={allocation.allocatedAmount || ''}
                                onChange={(e) =>
                                  handleAmountChange(allocation.feeId, parseFloat(e.target.value) || 0)
                                }
                                disabled={!allocation.isSelected || submitting}
                                inputProps={{
                                  min: 0,
                                  max: allocation.outstandingAmount,
                                  step: 0.01,
                                }}
                                InputProps={{
                                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                }}
                                sx={{ width: 160 }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              {allocation.isSelected && allocation.allocatedAmount > 0 ? (
                                allocation.allocatedAmount === allocation.outstandingAmount ? (
                                  <Chip label="FULL" color="success" size="small" />
                                ) : (
                                  <Chip label="PARTIAL" color="warning" size="small" />
                                )
                              ) : (
                                <Chip label="NONE" color="default" size="small" variant="outlined" />
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>

                  {!hasSelectedFees && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      Please select at least one fee to allocate the payment
                    </Alert>
                  )}
                </Box>
              )}

              {/* Action Buttons */}
              <Divider sx={{ my: 3 }} />
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                  disabled={submitting}
                  size="large"
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  startIcon={submitting ? <CircularProgress size={20} /> : <SaveIcon />}
                  onClick={handleSubmit}
                  disabled={!isValidAllocation || submitting || success}
                  size="large"
                >
                  {submitting ? 'Allocating...' : 'Allocate Payment'}
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default PaymentAllocationPage;
