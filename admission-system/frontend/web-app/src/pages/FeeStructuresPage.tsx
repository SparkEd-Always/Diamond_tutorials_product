import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { feeStructureApi, feeTypeApi } from '../services/feeApi';
import { academicApi } from '../services/api';
import type { FeeStructure, FeeStructureFormData, FeeType } from '../types/fees';
import type { AcademicYear, Class } from '../types';

const FeeStructuresPage: React.FC = () => {
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingStructure, setEditingStructure] = useState<FeeStructure | null>(null);

  // Filters
  const [filterAcademicYear, setFilterAcademicYear] = useState<number | ''>('');
  const [filterClass, setFilterClass] = useState<number | ''>('');
  const [filterFeeType, setFilterFeeType] = useState<number | ''>('');

  const [formData, setFormData] = useState<FeeStructureFormData>({
    academic_year_id: 0,
    class_id: 0,
    fee_type_id: 0,
    amount: 0,
    installments_allowed: 1,
    due_day_of_month: undefined,
    due_date_fixed: undefined,
    late_fee_applicable: true,
    late_fee_percentage: 2.0,
    late_fee_amount: undefined,
    late_fee_grace_period_days: 7,
    sibling_discount_applicable: true,
    early_payment_discount_percentage: undefined,
    early_payment_discount_days: undefined,
    is_active: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadFeeStructures();
  }, [filterAcademicYear, filterClass, filterFeeType]);

  const loadData = async () => {
    try {
      const [feeTypesData, academicYearsData, classesData] = await Promise.all([
        feeTypeApi.list({ is_active: true }),
        academicApi.getAcademicYears(),
        academicApi.getClasses(),
      ]);
      setFeeTypes(feeTypesData);
      setAcademicYears(academicYearsData);
      setClasses(classesData);

      // Set default academic year
      const currentYear = academicYearsData.find((y: AcademicYear) => y.is_current);
      if (currentYear) {
        setFilterAcademicYear(currentYear.id);
        setFormData(prev => ({ ...prev, academic_year_id: currentYear.id }));
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load data');
    }
  };

  const loadFeeStructures = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filterAcademicYear) params.academic_year_id = filterAcademicYear;
      if (filterClass) params.class_id = filterClass;
      if (filterFeeType) params.fee_type_id = filterFeeType;

      const data = await feeStructureApi.list(params);
      setFeeStructures(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load fee structures');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (structure?: FeeStructure) => {
    if (structure) {
      setEditingStructure(structure);
      setFormData({
        academic_year_id: structure.academic_year_id,
        class_id: structure.class_id,
        fee_type_id: structure.fee_type_id,
        amount: structure.amount,
        installments_allowed: structure.installments_allowed,
        due_day_of_month: structure.due_day_of_month,
        due_date_fixed: structure.due_date_fixed,
        late_fee_applicable: structure.late_fee_applicable,
        late_fee_percentage: structure.late_fee_percentage,
        late_fee_amount: structure.late_fee_amount,
        late_fee_grace_period_days: structure.late_fee_grace_period_days,
        sibling_discount_applicable: structure.sibling_discount_applicable,
        early_payment_discount_percentage: structure.early_payment_discount_percentage,
        early_payment_discount_days: structure.early_payment_discount_days,
        is_active: structure.is_active,
      });
    } else {
      setEditingStructure(null);
      const currentYear = academicYears.find(y => y.is_current);
      setFormData({
        academic_year_id: currentYear?.id || 0,
        class_id: 0,
        fee_type_id: 0,
        amount: 0,
        installments_allowed: 1,
        due_day_of_month: undefined,
        due_date_fixed: undefined,
        late_fee_applicable: true,
        late_fee_percentage: 2.0,
        late_fee_amount: undefined,
        late_fee_grace_period_days: 7,
        sibling_discount_applicable: true,
        early_payment_discount_percentage: undefined,
        early_payment_discount_days: undefined,
        is_active: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingStructure(null);
  };

  const handleSave = async () => {
    try {
      if (editingStructure) {
        await feeStructureApi.update(editingStructure.id, formData);
      } else {
        await feeStructureApi.create(formData);
      }
      handleCloseDialog();
      loadFeeStructures();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save fee structure');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this fee structure?')) {
      try {
        await feeStructureApi.delete(id);
        loadFeeStructures();
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to delete fee structure');
      }
    }
  };

  const getFeeTypeName = (feeTypeId: number) => {
    return feeTypes.find(ft => ft.id === feeTypeId)?.type_name || 'Unknown';
  };

  const getClassName = (classId: number) => {
    return classes.find(c => c.id === classId)?.class_name || 'Unknown';
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Fee Structures Management
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Add Fee Structure
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
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Academic Year"
              value={filterAcademicYear}
              onChange={(e) => setFilterAcademicYear(e.target.value === '' ? '' : Number(e.target.value))}
            >
              <MenuItem value="">All</MenuItem>
              {academicYears.map((year) => (
                <MenuItem key={year.id} value={year.id}>
                  {year.year_name} {year.is_current && '(Current)'}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Class"
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value === '' ? '' : Number(e.target.value))}
            >
              <MenuItem value="">All</MenuItem>
              {classes.map((cls) => (
                <MenuItem key={cls.id} value={cls.id}>
                  {cls.class_name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Fee Type"
              value={filterFeeType}
              onChange={(e) => setFilterFeeType(e.target.value === '' ? '' : Number(e.target.value))}
            >
              <MenuItem value="">All</MenuItem>
              {feeTypes.map((ft) => (
                <MenuItem key={ft.id} value={ft.id}>
                  {ft.type_name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Class</TableCell>
              <TableCell>Fee Type</TableCell>
              <TableCell align="right">Amount (₹)</TableCell>
              <TableCell>Installments</TableCell>
              <TableCell>Late Fee</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">Loading...</TableCell>
              </TableRow>
            ) : feeStructures.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">No fee structures found</TableCell>
              </TableRow>
            ) : (
              feeStructures.map((structure) => (
                <TableRow key={structure.id}>
                  <TableCell>{getClassName(structure.class_id)}</TableCell>
                  <TableCell>{getFeeTypeName(structure.fee_type_id)}</TableCell>
                  <TableCell align="right">₹{structure.amount.toLocaleString()}</TableCell>
                  <TableCell>{structure.installments_allowed}</TableCell>
                  <TableCell>
                    {structure.late_fee_applicable ? (
                      <Chip label={`${structure.late_fee_percentage}%`} size="small" color="warning" />
                    ) : (
                      <Chip label="No" size="small" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={structure.is_active ? 'Active' : 'Inactive'}
                      size="small"
                      color={structure.is_active ? 'success' : 'error'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleOpenDialog(structure)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(structure.id)} color="error">
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
        <DialogTitle>{editingStructure ? 'Edit Fee Structure' : 'Add Fee Structure'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  select
                  fullWidth
                  required
                  label="Academic Year"
                  value={formData.academic_year_id}
                  onChange={(e) => setFormData({ ...formData, academic_year_id: Number(e.target.value) })}
                >
                  {academicYears.map((year) => (
                    <MenuItem key={year.id} value={year.id}>
                      {year.year_name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  select
                  fullWidth
                  required
                  label="Class"
                  value={formData.class_id}
                  onChange={(e) => setFormData({ ...formData, class_id: Number(e.target.value) })}
                >
                  {classes.map((cls) => (
                    <MenuItem key={cls.id} value={cls.id}>
                      {cls.class_name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  select
                  fullWidth
                  required
                  label="Fee Type"
                  value={formData.fee_type_id}
                  onChange={(e) => setFormData({ ...formData, fee_type_id: Number(e.target.value) })}
                >
                  {feeTypes.map((ft) => (
                    <MenuItem key={ft.id} value={ft.id}>
                      {ft.type_name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  type="number"
                  label="Amount (₹)"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Installments Allowed"
                  value={formData.installments_allowed}
                  onChange={(e) => setFormData({ ...formData, installments_allowed: Number(e.target.value) })}
                  inputProps={{ min: 1, max: 12 }}
                />
              </Grid>
            </Grid>

            <Typography variant="subtitle2" sx={{ mt: 1 }}>Late Fee Settings</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Late Fee %"
                  value={formData.late_fee_percentage}
                  onChange={(e) => setFormData({ ...formData, late_fee_percentage: Number(e.target.value) })}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Grace Period (days)"
                  value={formData.late_fee_grace_period_days}
                  onChange={(e) => setFormData({ ...formData, late_fee_grace_period_days: Number(e.target.value) })}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.late_fee_applicable}
                      onChange={(e) => setFormData({ ...formData, late_fee_applicable: e.target.checked })}
                    />
                  }
                  label="Late Fee Applicable"
                />
              </Grid>
            </Grid>

            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.sibling_discount_applicable}
                    onChange={(e) => setFormData({ ...formData, sibling_discount_applicable: e.target.checked })}
                  />
                }
                label="Sibling Discount Applicable"
              />
            </Box>

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
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            {editingStructure ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default FeeStructuresPage;
