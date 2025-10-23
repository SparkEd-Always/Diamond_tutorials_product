import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  CurrencyRupee as RupeeIcon,
  Group as GroupIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import type { AdhocFeeFormData, FilteredStudent } from '../../../types/fees';

interface AdhocReviewStepProps {
  feeData: AdhocFeeFormData;
  selectedStudents: FilteredStudent[];
}

const AdhocReviewStep: React.FC<AdhocReviewStepProps> = ({
  feeData,
  selectedStudents,
}) => {
  const totalAmount = (feeData.amount || 0) * selectedStudents.length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom fontWeight="medium">
        Review & Confirm
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Please review all details before creating the adhoc fee assignments
      </Typography>

      {/* Fee Details Summary */}
      <Paper variant="outlined" sx={{ p: 3, mt: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Fee Details
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Fee Name
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {feeData.fee_name}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Amount per Student
            </Typography>
            <Typography variant="body1" fontWeight="medium" color="primary.main">
              {formatCurrency(feeData.amount || 0)}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Assigned Date
            </Typography>
            <Typography variant="body1">
              {feeData.assigned_date ? formatDate(feeData.assigned_date) : '-'}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Due Date
            </Typography>
            <Typography variant="body1">
              {feeData.due_date ? formatDate(feeData.due_date) : '-'}
            </Typography>
          </Grid>

          {feeData.description && (
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Description
              </Typography>
              <Typography variant="body1">
                {feeData.description}
              </Typography>
            </Grid>
          )}

          {feeData.remarks && (
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Admin Remarks
              </Typography>
              <Typography variant="body1">
                {feeData.remarks}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Students Summary */}
      <Paper variant="outlined" sx={{ p: 3, mt: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="subtitle1" fontWeight="bold">
            Selected Students
          </Typography>
          <Chip
            icon={<GroupIcon />}
            label={`${selectedStudents.length} student${selectedStudents.length !== 1 ? 's' : ''}`}
            color="primary"
            variant="outlined"
          />
        </Box>
        <Divider sx={{ mb: 2 }} />

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell><strong>#</strong></TableCell>
                <TableCell><strong>Student Name</strong></TableCell>
                <TableCell><strong>Admission No.</strong></TableCell>
                <TableCell><strong>Class</strong></TableCell>
                <TableCell align="right"><strong>Amount</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedStudents.map((student, index) => (
                <TableRow key={student.id} hover>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {student.full_name}
                    </Typography>
                  </TableCell>
                  <TableCell>{student.admission_number}</TableCell>
                  <TableCell>{student.class_name}</TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" color="primary.main" fontWeight="medium">
                      {formatCurrency(feeData.amount || 0)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Total Summary */}
      <Paper
        sx={{
          mt: 3,
          p: 3,
          bgcolor: 'success.50',
          borderLeft: 4,
          borderColor: 'success.main',
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <CheckIcon color="success" sx={{ fontSize: 40 }} />
          </Grid>
          <Grid item xs>
            <Typography variant="h6" color="success.main" fontWeight="bold">
              Total Expected Amount
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''} × {formatCurrency(feeData.amount || 0)}
            </Typography>
          </Grid>
          <Grid item>
            <Typography variant="h4" color="success.main" fontWeight="bold">
              {formatCurrency(totalAmount)}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Info Alert */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>What happens next:</strong>
        </Typography>
        <Box component="ul" sx={{ m: 0, mt: 1, pl: 2 }}>
          <li>
            <Typography variant="body2">
              {selectedStudents.length} adhoc fee assignment{selectedStudents.length !== 1 ? 's' : ''} will be created
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              Students/parents will see this fee in their fee dashboard
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              Payment can be made online or at the school office
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              You can track payment status in the Adhoc Fees management section
            </Typography>
          </li>
        </Box>
      </Alert>
    </Box>
  );
};

export default AdhocReviewStep;
