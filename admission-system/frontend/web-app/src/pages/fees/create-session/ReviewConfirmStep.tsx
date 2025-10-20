import React, { useEffect, useState } from 'react';
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
  CircularProgress,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Info as InfoIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import type { FeeSessionFormData, FeeStructure, FilteredStudent } from '../../../types/fees';
import { feeStructureApi } from '../../../services/feeApi';

interface ReviewConfirmStepProps {
  sessionData: FeeSessionFormData;
  feeStructure: FeeStructure | null;
  selectedStudents: FilteredStudent[];
}

const ReviewConfirmStep: React.FC<ReviewConfirmStepProps> = ({
  sessionData,
  feeStructure,
  selectedStudents,
}) => {
  const [allFeeStructures, setAllFeeStructures] = useState<FeeStructure[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Fetch all fee structures for the selected class and academic year
  useEffect(() => {
    const fetchAllFeeStructures = async () => {
      if (!feeStructure) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const structures = await feeStructureApi.list({
          class_id: feeStructure.class_id,
          academic_year_id: feeStructure.academic_year_id,
          is_active: true,
        });
        setAllFeeStructures(structures);
      } catch (error) {
        console.error('Error fetching fee structures:', error);
        // Fallback to single fee structure
        setAllFeeStructures(feeStructure ? [feeStructure] : []);
      } finally {
        setLoading(false);
      }
    };

    fetchAllFeeStructures();
  }, [feeStructure]);

  const totalFeeAmount = allFeeStructures.reduce((sum, fs) => sum + Number(fs.amount || 0), 0);
  const totalExpectedAmount = totalFeeAmount * selectedStudents.length;

  return (
    <Box>
      <Typography variant="h6" gutterBottom fontWeight="medium">
        Review & Confirm
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Please review all details before creating the fee session
      </Typography>

      {/* Session Details */}
      <Paper variant="outlined" sx={{ p: 3, mt: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <InfoIcon color="primary" />
          <Typography variant="h6" fontWeight="medium">
            Session Information
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="caption" color="text.secondary" display="block">
              Session Name
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {sessionData.session_name}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="caption" color="text.secondary" display="block">
              Academic Year
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {sessionData.academic_year_id}
            </Typography>
          </Grid>

          {sessionData.session_description && (
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary" display="block">
                Description
              </Typography>
              <Typography variant="body2">
                {sessionData.session_description}
              </Typography>
            </Grid>
          )}

          <Grid item xs={12} md={6}>
            <Typography variant="caption" color="text.secondary" display="block">
              Start Date
            </Typography>
            <Typography variant="body1">
              {formatDate(sessionData.start_date)}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="caption" color="text.secondary" display="block">
              Due Date
            </Typography>
            <Typography variant="body1" color="error.main" fontWeight="medium">
              {formatDate(sessionData.due_date)}
            </Typography>
          </Grid>

          {sessionData.remarks && (
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary" display="block">
                Admin Remarks
              </Typography>
              <Typography variant="body2">
                {sessionData.remarks}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Fee Structure Details - Bill Style */}
      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <ReceiptIcon color="primary" />
            <Typography variant="h6" fontWeight="medium">
              Fee Structure Breakdown
            </Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />

          {/* Bill-style table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Fee Type</strong></TableCell>
                  <TableCell align="right"><strong>Amount</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allFeeStructures.map((fs) => (
                  <TableRow key={fs.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {fs.fee_type_name || `Fee Type ${fs.fee_type_id}`}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="medium">
                        {formatCurrency(Number(fs.amount || 0))}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
                {/* Subtotal row */}
                <TableRow>
                  <TableCell>
                    <Typography variant="body1" fontWeight="bold" color="text.secondary">
                      Subtotal
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body1" fontWeight="bold" color="text.secondary">
                      {formatCurrency(totalFeeAmount)}
                    </Typography>
                  </TableCell>
                </TableRow>
                {/* Total row */}
                <TableRow sx={{ bgcolor: 'primary.50' }}>
                  <TableCell>
                    <Typography variant="h6" fontWeight="bold" color="primary.main">
                      Total Fee (Per Student)
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="h6" fontWeight="bold" color="primary.main">
                      {formatCurrency(totalFeeAmount)}
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {/* Additional info */}
          <Box mt={2} p={2} bgcolor="grey.50" borderRadius={1}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Class
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {feeStructure?.class_name || `Class ${feeStructure?.class_id}`}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Academic Year
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {feeStructure?.academic_year_name || `AY ${feeStructure?.academic_year_id}`}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      )}

      {/* Students Summary */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <CheckIcon color="success" />
          <Typography variant="h6" fontWeight="medium">
            Selected Students ({selectedStudents.length})
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />

        <TableContainer sx={{ maxHeight: 300 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell><strong>#</strong></TableCell>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Admission No.</strong></TableCell>
                <TableCell><strong>Roll No.</strong></TableCell>
                <TableCell><strong>Class</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedStudents.map((student, index) => (
                <TableRow key={student.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{student.full_name}</TableCell>
                  <TableCell>{student.admission_number}</TableCell>
                  <TableCell>{student.roll_number || '-'}</TableCell>
                  <TableCell>{student.class_name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Financial Summary */}
      <Paper sx={{ p: 3, bgcolor: 'primary.50', borderLeft: 4, borderColor: 'primary.main' }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Financial Summary
        </Typography>
        <Grid container spacing={2} mt={1}>
          <Grid item xs={12} md={4}>
            <Typography variant="caption" color="text.secondary" display="block">
              Total Students
            </Typography>
            <Typography variant="h5" fontWeight="bold" color="primary.main">
              {selectedStudents.length}
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="caption" color="text.secondary" display="block">
              Fee Per Student
            </Typography>
            <Typography variant="h5" fontWeight="bold" color="primary.main">
              {formatCurrency(totalFeeAmount)}
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="caption" color="text.secondary" display="block">
              Total Expected Amount
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="success.main">
              {formatCurrency(totalExpectedAmount)}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Confirmation Alert */}
      <Alert severity="warning" sx={{ mt: 3 }}>
        <Typography variant="body2" fontWeight="medium">
          Please review all details carefully before proceeding. Once created, the session will be active and students will be assigned the selected fee structure.
        </Typography>
      </Alert>
    </Box>
  );
};

export default ReviewConfirmStep;
