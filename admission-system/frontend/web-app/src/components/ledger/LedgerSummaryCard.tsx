/**
 * Ledger Summary Card Component
 *
 * Displays student's current financial status at a glance.
 * Shows balance, total fees, payments, and payment progress.
 */

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Button,
  Divider,
  Grid,
} from '@mui/material';
import {
  AccountBalance as BalanceIcon,
  TrendingUp as DebitIcon,
  TrendingDown as CreditIcon,
  Receipt as OutstandingIcon,
} from '@mui/icons-material';
import type { LedgerSummary } from '../../types/ledger';
import { formatCurrency } from '../../types/ledger';

interface LedgerSummaryCardProps {
  summary: LedgerSummary;
  studentName?: string;
  onViewFullLedger?: () => void;
  loading?: boolean;
}

const LedgerSummaryCard: React.FC<LedgerSummaryCardProps> = ({
  summary,
  studentName,
  onViewFullLedger,
  loading = false,
}) => {
  // Calculate payment progress percentage
  const paymentProgress = summary.total_debits > 0
    ? (summary.total_credits / summary.total_debits) * 100
    : 0;

  // Determine if student has outstanding balance
  const hasOutstanding = summary.current_balance > 0;
  const isOverpaid = summary.current_balance < 0;

  return (
    <Card elevation={3} sx={{ height: '100%' }}>
      <CardContent>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BalanceIcon color="primary" />
            Financial Summary
          </Typography>
          {studentName && (
            <Typography variant="body2" color="text.secondary">
              {studentName}
            </Typography>
          )}
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Current Balance - Prominent Display */}
        <Box
          sx={{
            textAlign: 'center',
            py: 3,
            px: 2,
            mb: 3,
            borderRadius: 2,
            bgcolor: hasOutstanding ? 'error.50' : isOverpaid ? 'success.50' : 'grey.50',
            border: 1,
            borderColor: hasOutstanding ? 'error.200' : isOverpaid ? 'success.200' : 'grey.300',
          }}
        >
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Current Balance
          </Typography>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 'bold',
              color: hasOutstanding ? 'error.main' : isOverpaid ? 'success.main' : 'text.primary',
            }}
          >
            {formatCurrency(Math.abs(summary.current_balance))}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {hasOutstanding && 'Amount Due'}
            {isOverpaid && 'Credit Balance'}
            {!hasOutstanding && !isOverpaid && 'Fully Paid'}
          </Typography>
        </Box>

        {/* Financial Details Grid */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* Total Fees */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DebitIcon fontSize="small" color="error" />
                <Typography variant="body2" color="text.secondary">
                  Total Fees Assigned
                </Typography>
              </Box>
              <Typography variant="body1" fontWeight="medium">
                {formatCurrency(summary.total_debits)}
              </Typography>
            </Box>
          </Grid>

          {/* Total Paid */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CreditIcon fontSize="small" color="success" />
                <Typography variant="body2" color="text.secondary">
                  Total Paid
                </Typography>
              </Box>
              <Typography variant="body1" fontWeight="medium" color="success.main">
                {formatCurrency(summary.total_credits)}
              </Typography>
            </Box>
          </Grid>

          {/* Outstanding */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <OutstandingIcon fontSize="small" color="warning" />
                <Typography variant="body2" color="text.secondary">
                  Outstanding
                </Typography>
              </Box>
              <Typography
                variant="body1"
                fontWeight="medium"
                color={hasOutstanding ? 'error.main' : 'success.main'}
              >
                {formatCurrency(Math.max(0, summary.current_balance))}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Payment Progress Bar */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Payment Progress
            </Typography>
            <Typography variant="caption" fontWeight="medium">
              {paymentProgress.toFixed(1)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.min(paymentProgress, 100)}
            sx={{
              height: 8,
              borderRadius: 1,
              bgcolor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                bgcolor: paymentProgress >= 100 ? 'success.main' : paymentProgress >= 50 ? 'info.main' : 'warning.main',
                borderRadius: 1,
              },
            }}
          />
        </Box>

        {/* Transaction Count */}
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography variant="caption" color="text.secondary">
            {summary.transaction_count} {summary.transaction_count === 1 ? 'Transaction' : 'Transactions'}
          </Typography>
        </Box>

        {/* View Full Ledger Button */}
        {onViewFullLedger && (
          <Button
            variant="outlined"
            fullWidth
            onClick={onViewFullLedger}
            disabled={loading}
            sx={{ mt: 2 }}
          >
            View Full Ledger
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default LedgerSummaryCard;
