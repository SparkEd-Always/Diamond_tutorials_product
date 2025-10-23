/**
 * Form List Page - Admin interface to view and manage application forms
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Badge,
  Stack,
  Switch,
  FormControlLabel,
  Tooltip,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Description as FormIcon,
  CheckCircle as CheckIcon,
  Visibility as PreviewIcon,
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
} from '@mui/icons-material';
import { useNotification } from '../contexts/NotificationContext';
import formConfigApi from '../services/formConfigApi';
import type {
  FormConfiguration,
  FormConfigurationCreate,
  FormTemplate,
  SchoolFormConfig,
  FormFieldMaster,
} from '../types/formConfig';

interface FormDialogState {
  open: boolean;
  formName: string;
  formDescription: string;
  templateId: number | null;
}

const FormListPage: React.FC = () => {
  const navigate = useNavigate();
  const { showNotification, showSuccess, showError } = useNotification();

  // State
  const [forms, setForms] = useState<FormConfiguration[]>([]);
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState<FormConfiguration | null>(null);
  const [dialogState, setDialogState] = useState<FormDialogState>({
    open: false,
    formName: '',
    formDescription: '',
    templateId: null,
  });
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewForm, setPreviewForm] = useState<FormConfiguration | null>(null);
  const [previewStep, setPreviewStep] = useState(0);
  const [previewFields, setPreviewFields] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [formsData, templatesData] = await Promise.all([
        formConfigApi.getAllForms(),
        formConfigApi.getTemplates(),
      ]);
      setForms(formsData);
      setTemplates(templatesData);
    } catch (error: any) {
      showError('Failed to load forms');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setDialogState({
      open: true,
      formName: '',
      formDescription: '',
      templateId: null,
    });
  };

  const handleCloseDialog = () => {
    setDialogState({
      open: false,
      formName: '',
      formDescription: '',
      templateId: null,
    });
  };

  const handleCreateForm = async () => {
    if (!dialogState.formName || dialogState.formName.trim().length < 3) {
      showError('Form name must be at least 3 characters');
      return;
    }

    try {
      const formData: FormConfigurationCreate = {
        form_name: dialogState.formName.trim(),
        form_description: dialogState.formDescription.trim() || undefined,
        is_active: true,
        template_id: dialogState.templateId || undefined,
      };

      const newForm = await formConfigApi.createForm(formData);
      showSuccess(`Form "${newForm.form_name}" created successfully`);
      handleCloseDialog();
      loadData();
    } catch (error: any) {
      showError(error.response?.data?.detail || 'Failed to create form');
      console.error(error);
    }
  };

  const handleDeleteClick = (form: FormConfiguration) => {
    setFormToDelete(form);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!formToDelete) return;

    try {
      await formConfigApi.deleteForm(formToDelete.id);
      showSuccess(`Form "${formToDelete.form_name}" deleted successfully`);
      setDeleteConfirmOpen(false);
      setFormToDelete(null);
      loadData();
    } catch (error: any) {
      showError(error.response?.data?.detail || 'Failed to delete form');
      console.error(error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setFormToDelete(null);
  };

  const handleToggleAvailability = async (form: FormConfiguration) => {
    const newIsActive = !form.is_active;

    // Optimistic update
    setForms(forms.map(f =>
      f.id === form.id ? { ...f, is_active: newIsActive } : f
    ));

    try {
      await formConfigApi.updateForm(form.id, { is_active: newIsActive });
      showSuccess(
        newIsActive
          ? `Form "${form.form_name}" is now available for parents to fill`
          : `Form "${form.form_name}" is no longer available for parents`
      );
    } catch (error: any) {
      // Revert on error
      setForms(forms);
      showError('Failed to update form availability');
      console.error(error);
    }
  };

  const handlePreviewForm = async (form: FormConfiguration) => {
    try {
      const fieldsData = await formConfigApi.getSchoolFormConfig(form.id);
      setPreviewForm(form);
      setPreviewFields(fieldsData);
      setPreviewStep(0);
      setPreviewDialogOpen(true);
    } catch (error: any) {
      showError('Failed to load form preview');
      console.error(error);
    }
  };

  const renderFormField = (config: SchoolFormConfig) => {
    const field = config.field;
    const commonProps = {
      fullWidth: true,
      disabled: true,
      label: field.field_label,
      placeholder: field.placeholder || '',
      helperText: field.help_text || '',
    };

    switch (field.field_type) {
      case 'dropdown':
      case 'select':
        return (
          <FormControl fullWidth disabled>
            <InputLabel>{field.field_label}</InputLabel>
            <Select label={field.field_label}>
              {field.options?.map((option, idx) => (
                <MenuItem key={idx} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      case 'textarea':
        return <TextField {...commonProps} multiline rows={3} />;
      case 'number':
        return <TextField {...commonProps} type="number" />;
      case 'email':
        return <TextField {...commonProps} type="email" />;
      case 'phone':
        return <TextField {...commonProps} type="tel" />;
      case 'date':
        return <TextField {...commonProps} type="date" InputLabelProps={{ shrink: true }} />;
      case 'file':
        return (
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {field.field_label}
            </Typography>
            <Button variant="outlined" disabled component="label">
              Choose File
            </Button>
            {field.help_text && (
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                {field.help_text}
              </Typography>
            )}
          </Box>
        );
      default:
        return <TextField {...commonProps} />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Box sx={{ py: 4, width: '100%', overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4, width: '100%', overflow: 'hidden' }}>
      <Box sx={{ px: 2 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={() => navigate('/dashboard')} sx={{ mr: 2 }}>
            <BackIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" gutterBottom fontWeight={600}>
              Application Forms
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage and configure admission application forms
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
            size="large"
          >
            Create New Form
          </Button>
        </Box>
      </Box>

      {/* Empty State */}
      {forms.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <FormIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom color="text.secondary">
            No Forms Created Yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create your first application form to get started
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenDialog}>
            Create New Form
          </Button>
        </Paper>
      ) : (
        /* Forms Table */
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Form Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">
                  Fields
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Available for Parents</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Last Updated</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {forms.map((form) => (
                <TableRow key={form.id} hover>
                  <TableCell>
                    <Typography fontWeight={600}>{form.form_name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        maxWidth: 300,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {form.form_description || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={form.is_active ? 'Active' : 'Inactive'}
                      color={form.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Badge badgeContent={form.field_count} color="primary" showZero>
                      <FormIcon color="action" />
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Tooltip
                      title={form.is_active
                        ? "Parents can see and fill this form"
                        : "Parents cannot see this form"
                      }
                    >
                      <FormControlLabel
                        control={
                          <Switch
                            checked={form.is_active}
                            onChange={() => handleToggleAvailability(form)}
                            color="success"
                          />
                        }
                        label={form.is_active ? "Yes" : "No"}
                      />
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {form.updated_at ? formatDate(form.updated_at) : formatDate(form.created_at)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <IconButton
                        size="small"
                        color="secondary"
                        onClick={() => handlePreviewForm(form)}
                        title="Preview Form"
                      >
                        <PreviewIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => navigate(`/admin/forms/${form.id}/edit`)}
                        title="Edit Form"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(form)}
                        title="Delete Form"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create Form Dialog */}
      <Dialog open={dialogState.open} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Application Form</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3, mt: 1 }}>
            You can start with a blank form or choose a template to pre-populate fields.
          </Alert>

          <TextField
            autoFocus
            fullWidth
            label="Form Name"
            value={dialogState.formName}
            onChange={(e) => setDialogState({ ...dialogState, formName: e.target.value })}
            helperText="Required (minimum 3 characters)"
            error={dialogState.formName.length > 0 && dialogState.formName.length < 3}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="Form Description"
            value={dialogState.formDescription}
            onChange={(e) => setDialogState({ ...dialogState, formDescription: e.target.value })}
            multiline
            rows={3}
            helperText="Optional description for internal reference"
            sx={{ mb: 3 }}
          />

          <FormControl fullWidth>
            <InputLabel>Start from Template</InputLabel>
            <Select
              value={dialogState.templateId || ''}
              onChange={(e) =>
                setDialogState({
                  ...dialogState,
                  templateId: e.target.value ? Number(e.target.value) : null,
                })
              }
              label="Start from Template"
            >
              <MenuItem value="">
                <em>None (Blank Form)</em>
              </MenuItem>
              {templates.map((template) => (
                <MenuItem key={template.id} value={template.id}>
                  {template.template_name}
                  {template.description && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ ml: 1, display: 'inline' }}
                    >
                      - {template.description}
                    </Typography>
                  )}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleCreateForm}
            variant="contained"
            disabled={!dialogState.formName || dialogState.formName.trim().length < 3}
          >
            Create Form
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={handleDeleteCancel} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Form?</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone.
          </Alert>
          <Typography variant="body2">
            Are you sure you want to delete the form <strong>"{formToDelete?.form_name}"</strong>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog
        open={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { minHeight: '80vh' }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h5">Form Preview</Typography>
            <Typography variant="body2" color="text.secondary">
              {previewForm?.form_name}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Stepper activeStep={previewStep} alternativeLabel>
              {['Student Details', 'Parent Details', 'Address', 'Academic Details', 'Documents'].map((label, index) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            {['Student Details', 'Parent Details', 'Address', 'Academic Details', 'Documents'][previewStep]}
          </Typography>

          <Stack spacing={3}>
            {previewFields
              .filter((c) => c.step_number === previewStep + 1 && c.is_enabled)
              .sort((a, b) => a.display_order - b.display_order)
              .map((config) => (
                <Box key={config.id}>
                  <Typography variant="body2" gutterBottom fontWeight={500}>
                    {config.field.field_label}
                    {config.is_required && <span style={{ color: 'red' }}> *</span>}
                  </Typography>
                  {renderFormField(config)}
                </Box>
              ))}
          </Stack>

          {previewFields.filter((c) => c.step_number === previewStep + 1 && c.is_enabled).length === 0 && (
            <Alert severity="info">
              No fields enabled for this step
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
          <Button
            onClick={() => setPreviewStep(Math.max(0, previewStep - 1))}
            disabled={previewStep === 0}
            startIcon={<PrevIcon />}
          >
            Previous
          </Button>
          <Button onClick={() => setPreviewDialogOpen(false)}>Close Preview</Button>
          <Button
            onClick={() => setPreviewStep(Math.min(4, previewStep + 1))}
            disabled={previewStep === 4}
            endIcon={<NextIcon />}
          >
            Next
          </Button>
        </DialogActions>
      </Dialog>
      </Box>
    </Box>
  );
};

export default FormListPage;
