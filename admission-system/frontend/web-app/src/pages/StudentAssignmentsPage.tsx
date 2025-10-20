import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Chip,
  Box,
  Alert,
  Grid,
  FormControlLabel,
  Switch,
  Card,
  CardContent,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { assignmentApi, feeStructureApi } from '../services/feeApi';
import type { StudentFeeAssignment, StudentFeeAssignmentFormData, FeeStructure } from '../types/fees';

const StudentAssignmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<StudentFeeAssignment[]>([]);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<StudentFeeAssignment | null>(null);

  // Filters
  const [filterStudentId, setFilterStudentId] = useState<string>('');

  const [formData, setFormData] = useState<StudentFeeAssignmentFormData>({
    student_id: 0,
    fee_structure_id: 0,
    custom_amount: undefined,
    discount_percentage: 0,
    discount_amount: undefined,
    discount_reason: '',
    custom_due_date: undefined,
    is_waived: false,
    waiver_percentage: 0,
    waiver_reason: '',
    is_active: true,
    remarks: '',
  });

  useEffect(() => {
    loadFeeStructures();
    loadAssignments();
  }, []);

  useEffect(() => {
    loadAssignments();
  }, [filterStudentId]);

  const loadFeeStructures = async () => {
    try {
      const data = await feeStructureApi.list({ is_active: true });
      setFeeStructures(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load fee structures');
    }
  };

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filterStudentId) params.student_id = parseInt(filterStudentId);

      const data = await assignmentApi.list(params);
      setAssignments(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (assignment?: StudentFeeAssignment) => {
    if (assignment) {
      setEditingAssignment(assignment);
      setFormData({
        student_id: assignment.student_id,
        fee_structure_id: assignment.fee_structure_id,
        custom_amount: assignment.custom_amount,
        discount_percentage: assignment.discount_percentage,
        discount_amount: assignment.discount_amount,
        discount_reason: assignment.discount_reason || '',
        custom_due_date: assignment.custom_due_date,
        is_waived: assignment.is_waived,
        waiver_percentage: assignment.waiver_percentage,
        waiver_reason: assignment.waiver_reason || '',
        is_active: assignment.is_active,
        remarks: assignment.remarks || '',
      });
    } else {
      setEditingAssignment(null);
      setFormData({
        student_id: filterStudentId ? parseInt(filterStudentId) : 0,
        fee_structure_id: 0,
        custom_amount: undefined,
        discount_percentage: 0,
        discount_amount: undefined,
        discount_reason: '',
        custom_due_date: undefined,
        is_waived: false,
        waiver_percentage: 0,
        waiver_reason: '',
        is_active: true,
        remarks: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAssignment(null);
  };

  const handleSave = async () => {
    try {
      if (editingAssignment) {
        await assignmentApi.update(editingAssignment.id, formData);
      } else {
        await assignmentApi.create(formData);
      }
      handleCloseDialog();
      loadAssignments();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save assignment');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        await assignmentApi.delete(id);
        loadAssignments();
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to delete assignment');
      }
    }
  };

  const calculateFinalAmount = () => {
    const structure = feeStructures.find(fs => fs.id === formData.fee_structure_id);
    if (!structure) return 0;

    let amount = formData.custom_amount || structure.amount;

    // Apply discount
    if (formData.discount_percentage > 0) {
      amount -= amount * (formData.discount_percentage / 100);
    }
    if (formData.discount_amount) {
      amount -= formData.discount_amount;
    }

    // Apply waiver
    if (formData.is_waived && formData.waiver_percentage > 0) {
      amount -= amount * (formData.waiver_percentage / 100);
    }

    return Math.max(0, amount);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/admin/fees/dashboard')}
        sx={{ mb: 2 }}
      >
        Back to Fee Dashboard
      </Button>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Student Fee Assignments
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Assign Fee
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Filter by Student ID"
              value={filterStudentId}
              onChange={(e) => setFilterStudentId(e.target.value)}
              placeholder="Enter student ID"
            />
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student ID</TableCell>
              <TableCell>Fee Structure ID</TableCell>
              <TableCell align="right">Discount</TableCell>
              <TableCell align="right">Waiver</TableCell>
              <TableCell align="right">Final Amount (₹)</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">Loading...</TableCell>
              </TableRow>
            ) : assignments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">No assignments found</TableCell>
              </TableRow>
            ) : (
              assignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell>{assignment.student_id}</TableCell>
                  <TableCell>{assignment.fee_structure_id}</TableCell>
                  <TableCell align="right">
                    {assignment.discount_percentage > 0 ? (
                      <Chip label={`${assignment.discount_percentage}%`} size="small" color="info" />
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {assignment.is_waived ? (
                      <Chip label={`${assignment.waiver_percentage}%`} size="small" color="warning" />
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell align="right">
                    ₹{assignment.final_amount?.toLocaleString() || '0'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={assignment.is_active ? 'Active' : 'Inactive'}
                      size="small"
                      color={assignment.is_active ? 'success' : 'error'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleOpenDialog(assignment)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(assignment.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingAssignment ? 'Edit Assignment' : 'Assign Fee to Student'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  type="number"
                  label="Student ID"
                  value={formData.student_id}
                  onChange={(e) => setFormData({ ...formData, student_id: Number(e.target.value) })}
                  disabled={!!editingAssignment}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  required
                  label="Fee Structure"
                  value={formData.fee_structure_id}
                  onChange={(e) => setFormData({ ...formData, fee_structure_id: Number(e.target.value) })}
                  disabled={!!editingAssignment}
                >
                  {feeStructures.map((fs) => (
                    <MenuItem key={fs.id} value={fs.id}>
                      ID {fs.id} - ₹{fs.amount.toLocaleString()}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            <TextField
              fullWidth
              type="number"
              label="Custom Amount (Optional)"
              value={formData.custom_amount || ''}
              onChange={(e) => setFormData({ ...formData, custom_amount: e.target.value ? Number(e.target.value) : undefined })}
              helperText="Override the structure amount for this student"
            />

            <Typography variant="subtitle2" sx={{ mt: 1 }}>Discount Settings</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Discount %"
                  value={formData.discount_percentage}
                  onChange={(e) => setFormData({ ...formData, discount_percentage: Number(e.target.value) })}
                  inputProps={{ min: 0, max: 100 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Discount Amount (₹)"
                  value={formData.discount_amount || ''}
                  onChange={(e) => setFormData({ ...formData, discount_amount: e.target.value ? Number(e.target.value) : undefined })}
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="Discount Reason"
              value={formData.discount_reason}
              onChange={(e) => setFormData({ ...formData, discount_reason: e.target.value })}
              placeholder="e.g., Sibling discount, Merit scholarship"
            />

            <Typography variant="subtitle2" sx={{ mt: 1 }}>Waiver Settings</Typography>
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_waived}
                    onChange={(e) => setFormData({ ...formData, is_waived: e.target.checked })}
                  />
                }
                label="Fee Waived"
              />
            </Box>

            {formData.is_waived && (
              <>
                <TextField
                  fullWidth
                  type="number"
                  label="Waiver %"
                  value={formData.waiver_percentage}
                  onChange={(e) => setFormData({ ...formData, waiver_percentage: Number(e.target.value) })}
                  inputProps={{ min: 0, max: 100 }}
                />
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Waiver Reason"
                  value={formData.waiver_reason}
                  onChange={(e) => setFormData({ ...formData, waiver_reason: e.target.value })}
                  placeholder="e.g., Economic hardship, Merit scholarship"
                />
              </>
            )}

            <TextField
              fullWidth
              multiline
              rows={2}
              label="Remarks"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            />

            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                }
                label="Active"
              />
            </Box>

            {/* Final Amount Display */}
            <Card variant="outlined" sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
              <CardContent>
                <Typography variant="h6">
                  Final Amount: ₹{calculateFinalAmount().toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            {editingAssignment ? 'Update' : 'Assign'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StudentAssignmentsPage;
