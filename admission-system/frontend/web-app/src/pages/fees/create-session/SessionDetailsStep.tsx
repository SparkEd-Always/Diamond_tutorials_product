import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
} from '@mui/material';
import api from '../../../services/api';

interface SessionDetailsStepProps {
  data: any;
  onChange: (updates: any) => void;
}

interface AcademicYear {
  id: number;
  year_name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
}

const SessionDetailsStep: React.FC<SessionDetailsStepProps> = ({ data, onChange }) => {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);

  useEffect(() => {
    loadAcademicYears();
  }, []);

  const loadAcademicYears = async () => {
    try {
      const response = await api.get('/academic/years');
      setAcademicYears(response.data);

      // Auto-select current academic year if available
      const currentYear = response.data.find((ay: AcademicYear) => ay.is_current);
      if (currentYear && !data.academic_year_id) {
        onChange({ academic_year_id: currentYear.id });
      }
    } catch (err) {
      console.error('Failed to load academic years:', err);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom fontWeight="medium">
        Session Information
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Provide basic details about the fee session
      </Typography>

      <Paper variant="outlined" sx={{ p: 3, mt: 3 }}>
        <Grid container spacing={3}>
          {/* Session Name */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Session Name"
              placeholder="e.g., Q1 2024-25 Tuition Fees"
              value={data.session_name || ''}
              onChange={(e) => onChange({ session_name: e.target.value })}
              required
              helperText="Give a descriptive name to identify this session"
            />
          </Grid>

          {/* Session Description */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Session Description"
              placeholder="Optional description..."
              value={data.session_description || ''}
              onChange={(e) => onChange({ session_description: e.target.value })}
              multiline
              rows={3}
              helperText="Optional: Add any additional details about this session"
            />
          </Grid>

          {/* Academic Year */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Academic Year</InputLabel>
              <Select
                value={data.academic_year_id || ''}
                label="Academic Year"
                onChange={(e) => onChange({ academic_year_id: e.target.value })}
              >
                {academicYears.map((year) => (
                  <MenuItem key={year.id} value={year.id}>
                    {year.year_name} {year.is_current && '(Current)'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Start Date */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={data.start_date || ''}
              onChange={(e) => onChange({ start_date: e.target.value })}
              required
              InputLabelProps={{ shrink: true }}
              helperText="When this fee becomes applicable"
            />
          </Grid>

          {/* Due Date */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Due Date"
              type="date"
              value={data.due_date || ''}
              onChange={(e) => onChange({ due_date: e.target.value })}
              required
              InputLabelProps={{ shrink: true }}
              helperText="Payment deadline for students"
              inputProps={{ min: data.start_date }}
            />
          </Grid>

          {/* Remarks */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Remarks"
              placeholder="Optional admin remarks..."
              value={data.remarks || ''}
              onChange={(e) => onChange({ remarks: e.target.value })}
              multiline
              rows={2}
              helperText="Internal notes for administrators"
            />
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default SessionDetailsStep;
