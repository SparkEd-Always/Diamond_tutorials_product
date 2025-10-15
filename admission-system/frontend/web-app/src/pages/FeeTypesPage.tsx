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
  FormControlLabel,
  Switch,
  MenuItem,
  IconButton,
  Chip,
  Box,
  Alert,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { feeTypeApi } from '../services/feeApi';
import type { FeeType, FeeTypeFormData } from '../types/fees';

const FeeTypesPage: React.FC = () => {
  const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingFeeType, setEditingFeeType] = useState<FeeType | null>(null);
  const [formData, setFormData] = useState<FeeTypeFormData>({
    type_name: '',
    code: '',
    description: '',
    frequency: 'annual',
    is_mandatory: true,
    is_taxable: true,
    tax_rate: 18.0,
    is_refundable: false,
    is_active: true,
    display_order: 0,
  });

  useEffect(() => {
    loadFeeTypes();
  }, []);

  const loadFeeTypes = async () => {
    try {
      setLoading(true);
      const data = await feeTypeApi.list();
      setFeeTypes(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load fee types');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (feeType?: FeeType) => {
    if (feeType) {
      setEditingFeeType(feeType);
      setFormData({
        type_name: feeType.type_name,
        code: feeType.code,
        description: feeType.description || '',
        frequency: feeType.frequency,
        is_mandatory: feeType.is_mandatory,
        is_taxable: feeType.is_taxable,
        tax_rate: feeType.tax_rate,
        is_refundable: feeType.is_refundable,
        is_active: feeType.is_active,
        display_order: feeType.display_order || 0,
      });
    } else {
      setEditingFeeType(null);
      setFormData({
        type_name: '',
        code: '',
        description: '',
        frequency: 'annual',
        is_mandatory: true,
        is_taxable: true,
        tax_rate: 18.0,
        is_refundable: false,
        is_active: true,
        display_order: 0,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingFeeType(null);
  };

  const handleSave = async () => {
    try {
      if (editingFeeType) {
        await feeTypeApi.update(editingFeeType.id, formData);
      } else {
        await feeTypeApi.create(formData);
      }
      handleCloseDialog();
      loadFeeTypes();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save fee type');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this fee type?')) {
      try {
        await feeTypeApi.delete(id);
        loadFeeTypes();
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to delete fee type');
      }
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Fee Types Management
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Add Fee Type
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Code</TableCell>
              <TableCell>Frequency</TableCell>
              <TableCell>Tax Rate</TableCell>
              <TableCell>Mandatory</TableCell>
              <TableCell>Taxable</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : feeTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No fee types found
                </TableCell>
              </TableRow>
            ) : (
              feeTypes.map((feeType) => (
                <TableRow key={feeType.id}>
                  <TableCell>{feeType.type_name}</TableCell>
                  <TableCell>{feeType.code}</TableCell>
                  <TableCell sx={{ textTransform: 'capitalize' }}>
                    {feeType.frequency.replace('_', ' ')}
                  </TableCell>
                  <TableCell>{feeType.tax_rate}%</TableCell>
                  <TableCell>
                    <Chip label={feeType.is_mandatory ? 'Yes' : 'No'} size="small" color={feeType.is_mandatory ? 'primary' : 'default'} />
                  </TableCell>
                  <TableCell>
                    <Chip label={feeType.is_taxable ? 'Yes' : 'No'} size="small" color={feeType.is_taxable ? 'success' : 'default'} />
                  </TableCell>
                  <TableCell>
                    <Chip label={feeType.is_active ? 'Active' : 'Inactive'} size="small" color={feeType.is_active ? 'success' : 'error'} />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleOpenDialog(feeType)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(feeType.id)} color="error">
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
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingFeeType ? 'Edit Fee Type' : 'Add Fee Type'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Fee Type Name"
              value={formData.type_name}
              onChange={(e) => setFormData({ ...formData, type_name: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              required
              fullWidth
              helperText="e.g., FEE_TUITION"
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
            <TextField
              label="Frequency"
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
              select
              required
              fullWidth
            >
              <MenuItem value="one_time">One Time</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="quarterly">Quarterly</MenuItem>
              <MenuItem value="half_yearly">Half Yearly</MenuItem>
              <MenuItem value="annual">Annual</MenuItem>
              <MenuItem value="custom">Custom</MenuItem>
            </TextField>
            <TextField
              label="Tax Rate (%)"
              type="number"
              value={formData.tax_rate}
              onChange={(e) => setFormData({ ...formData, tax_rate: parseFloat(e.target.value) })}
              fullWidth
            />
            <TextField
              label="Display Order"
              type="number"
              value={formData.display_order}
              onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
              fullWidth
            />
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_mandatory}
                    onChange={(e) => setFormData({ ...formData, is_mandatory: e.target.checked })}
                  />
                }
                label="Mandatory Fee"
              />
            </Box>
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_taxable}
                    onChange={(e) => setFormData({ ...formData, is_taxable: e.target.checked })}
                  />
                }
                label="Taxable"
              />
            </Box>
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_refundable}
                    onChange={(e) => setFormData({ ...formData, is_refundable: e.target.checked })}
                  />
                }
                label="Refundable"
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
            {editingFeeType ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default FeeTypesPage;
