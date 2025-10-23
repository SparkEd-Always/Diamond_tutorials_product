import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Grid,
  Paper,
  InputAdornment,
  Alert,
} from '@mui/material';
import {
  Description as DescriptionIcon,
  CurrencyRupee as RupeeIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import type { AdhocFeeFormData } from '../../../types/fees';

interface AdhocFeeDetailsStepProps {
  data: Partial<AdhocFeeFormData>;
  onChange: (updates: Partial<AdhocFeeFormData>) => void;
}

const AdhocFeeDetailsStep: React.FC<AdhocFeeDetailsStepProps> = ({
  data,
  onChange,
}) => {
  const handleChange = (field: keyof AdhocFeeFormData, value: any) => {
    onChange({ [field]: value });
  };

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  return (
    <Box>
      <Typography variant="h6" gutterBottom fontWeight="medium">
        Fee Details
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Enter the details of the adhoc fee you want to assign to students
      </Typography>

      <Paper variant="outlined" sx={{ p: 3, mt: 3 }}>
        <Grid container spacing={3}>
          {/* Fee Name */}
          <Grid item xs={12}>
            <TextField
              label="Fee Name"
              value={data.fee_name || ''}
              onChange={(e) => handleChange('fee_name', e.target.value)}
              fullWidth
              required
              placeholder="e.g., Lost ID Card Fee, Olympiad Exam Fee, Library Fine"
              helperText="Enter a descriptive name for this fee"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <DescriptionIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Amount */}
          <Grid item xs={12} md={6}>
            <TextField
              label="Amount (₹)"
              type="number"
              value={data.amount || ''}
              onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
              fullWidth
              required
              inputProps={{ min: 0, step: 0.01 }}
              placeholder="0.00"
              helperText="Enter the fee amount"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <RupeeIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Assigned Date */}
          <Grid item xs={12} md={6}>
            <TextField
              label="Assigned Date"
              type="date"
              value={data.assigned_date || today}
              onChange={(e) => handleChange('assigned_date', e.target.value)}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              helperText="Date when fee is assigned"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Due Date */}
          <Grid item xs={12} md={6}>
            <TextField
              label="Due Date"
              type="date"
              value={data.due_date || ''}
              onChange={(e) => handleChange('due_date', e.target.value)}
              fullWidth
              required
              inputProps={{ min: data.assigned_date || today }}
              InputLabelProps={{ shrink: true }}
              helperText="Payment due date"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Description */}
          <Grid item xs={12}>
            <TextField
              label="Description (Optional)"
              value={data.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              fullWidth
              multiline
              rows={3}
              placeholder="e.g., Replacement charge for lost student ID card issued on 10th Jan 2024"
              helperText="Detailed description of the fee (optional)"
            />
          </Grid>

          {/* Remarks */}
          <Grid item xs={12}>
            <TextField
              label="Admin Remarks (Optional)"
              value={data.remarks || ''}
              onChange={(e) => handleChange('remarks', e.target.value)}
              fullWidth
              multiline
              rows={2}
              placeholder="Internal notes (not visible to students/parents)"
              helperText="Internal admin remarks (optional)"
            />
          </Grid>
        </Grid>

        {/* Info Alert */}
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>Note:</strong> This fee will be assigned to the students you select in the next step.
            Each student will be charged the same amount.
          </Typography>
        </Alert>
      </Paper>

      {/* Examples Section */}
      <Paper sx={{ p: 2, mt: 3, bgcolor: 'grey.50' }}>
        <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
          Common Use Cases:
        </Typography>
        <Box component="ul" sx={{ m: 0, pl: 3 }}>
          <li><Typography variant="body2">Lost Items: ID Card (₹500), Uniform (₹800), Books (₹300)</Typography></li>
          <li><Typography variant="body2">Fines: Library Late Fee (₹50), Damage Fee (₹1,000)</Typography></li>
          <li><Typography variant="body2">Special Exams: Olympiad (₹1,200), Competitive Exam (₹800)</Typography></li>
          <li><Typography variant="body2">Events: Annual Day Costume (₹600), Field Trip (₹2,000)</Typography></li>
        </Box>
      </Paper>
    </Box>
  );
};

export default AdhocFeeDetailsStep;
