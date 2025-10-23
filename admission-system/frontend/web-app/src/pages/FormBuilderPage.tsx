/**
 * Form Builder Page - Admin interface to configure application form
 * Visual form preview with enable/disable controls
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Divider,
  Chip,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Settings as SettingsIcon,
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Visibility as PreviewIcon,
} from '@mui/icons-material';
import { useNotification } from '../contexts/NotificationContext';
import formConfigApi from '../services/formConfigApi';
import type {
  FormFieldMaster,
  SchoolFormConfig,
  FormTemplate,
  FormConfiguration,
} from '../types/formConfig';

const steps = ['Student Details', 'Parent Details', 'Address', 'Academic Details', 'Documents'];

const FormBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const formId = id ? parseInt(id) : undefined;
  const { showNotification } = useNotification();

  // State
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentForm, setCurrentForm] = useState<FormConfiguration | null>(null);
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [schoolConfig, setSchoolConfig] = useState<SchoolFormConfig[]>([]);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null);
  const [editNameDialogOpen, setEditNameDialogOpen] = useState(false);
  const [editedFormName, setEditedFormName] = useState('');
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewStep, setPreviewStep] = useState(0);

  useEffect(() => {
    loadData();
  }, [formId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // If formId is provided, load that specific form, otherwise load default (ID=1)
      const actualFormId = formId || 1;

      const [templatesData, configData, formData] = await Promise.all([
        formConfigApi.getTemplates(),
        formConfigApi.getSchoolFormConfig(actualFormId),
        formConfigApi.getFormById(actualFormId),
      ]);

      setTemplates(templatesData);
      setSchoolConfig(configData);
      setCurrentForm(formData);
      setEditedFormName(formData.form_name);
    } catch (error: any) {
      showNotification('Failed to load form configuration', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      await formConfigApi.applyTemplate({ template_id: selectedTemplate.id });
      showNotification(`Template "${selectedTemplate.template_name}" applied successfully`, 'success');
      setTemplateDialogOpen(false);
      loadData();
    } catch (error: any) {
      showNotification(error.response?.data?.detail || 'Failed to apply template', 'error');
    }
  };

  const handleSaveFormName = async () => {
    if (!currentForm || !editedFormName.trim()) return;

    try {
      await formConfigApi.updateForm(currentForm.id, { form_name: editedFormName });
      showNotification('Form name updated successfully', 'success');
      setEditNameDialogOpen(false);
      loadData();
    } catch (error: any) {
      showNotification('Failed to update form name', 'error');
    }
  };

  const handleToggleField = async (config: SchoolFormConfig) => {
    // Optimistic update - update UI immediately
    const updatedConfig = schoolConfig.map((c) =>
      c.id === config.id ? { ...c, is_enabled: !c.is_enabled } : c
    );
    setSchoolConfig(updatedConfig);

    try {
      await formConfigApi.updateFieldConfig(config.id, { is_enabled: !config.is_enabled });
      showNotification(
        `Field ${config.is_enabled ? 'disabled' : 'enabled'} successfully`,
        'success'
      );
    } catch (error: any) {
      // Revert on error
      setSchoolConfig(schoolConfig);
      showNotification('Failed to update field', 'error');
    }
  };

  const handleToggleRequired = async (config: SchoolFormConfig) => {
    const newRequired = !config.is_required;

    // Optimistic update - update UI immediately
    const updatedConfig = schoolConfig.map((c) =>
      c.id === config.id ? { ...c, is_required: newRequired } : c
    );
    setSchoolConfig(updatedConfig);

    try {
      await formConfigApi.updateFieldConfig(config.id, { is_required: newRequired });
      showNotification(
        `Field marked as ${newRequired ? 'required' : 'optional'}`,
        'success'
      );
    } catch (error: any) {
      // Revert on error
      setSchoolConfig(schoolConfig);
      showNotification('Failed to update field', 'error');
    }
  };

  // Helper function to render form field based on type
  const renderFormField = (config: SchoolFormConfig) => {
    const field = config.field;
    const commonProps = {
      fullWidth: true,
      disabled: true, // Preview only
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

  if (loading) {
    return (
      <Box sx={{ py: 4, width: '100%', overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Get fields for current step
  const currentStepFields = schoolConfig.filter((c) => c.step_number === currentStep + 1);
  const configuredCount = schoolConfig.length;

  return (
    <Box sx={{ py: 4, width: '100%', overflow: 'hidden' }}>
      <Box sx={{ px: 2 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={() => navigate('/admin/forms')} sx={{ mr: 2 }}>
            <BackIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h4" fontWeight={600}>
                {currentForm?.form_name || 'Application Form Builder'}
              </Typography>
              <IconButton
                size="small"
                onClick={() => setEditNameDialogOpen(true)}
                sx={{ color: 'text.secondary' }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {currentForm?.form_description || 'Preview and configure your admission application form'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={() => {
                showNotification('All changes have been saved', 'success');
              }}
            >
              Save Changes
            </Button>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<PreviewIcon />}
              onClick={() => {
                setPreviewStep(0);
                setPreviewDialogOpen(true);
              }}
            >
              Preview Form
            </Button>
            <Button
              variant="outlined"
              startIcon={<SettingsIcon />}
              onClick={() => setTemplateDialogOpen(true)}
            >
              Apply Template
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Alert if no configuration */}
      {configuredCount === 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          No fields configured yet. Click "Apply Template" to get started with a predefined form
          configuration.
        </Alert>
      )}

      {/* Step Progress */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={currentStep} alternativeLabel>
          {steps.map((label, index) => (
            <Step key={label} sx={{ cursor: 'pointer' }} onClick={() => setCurrentStep(index)}>
              <StepLabel sx={{ cursor: 'pointer' }}>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Form Preview */}
      <Paper sx={{ p: 4, mb: 3 }}>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              {steps[currentStep]}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Configure which fields appear in this step. Toggle to enable/disable fields.
            </Typography>
          </Box>

          {/* Navigation Buttons */}
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<PrevIcon />}
              onClick={() => setCurrentStep(currentStep - 1)}
              disabled={currentStep === 0}
              size="small"
            >
              Previous
            </Button>
            <Button
              variant="contained"
              endIcon={<NextIcon />}
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={currentStep === steps.length - 1}
              size="small"
            >
              Next
            </Button>
          </Stack>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {currentStepFields.length === 0 ? (
          <Alert severity="info">
            No fields configured for this step. Apply a template to get started.
          </Alert>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Stack spacing={2} sx={{ width: '100%', maxWidth: 800 }}>
              {currentStepFields.map((config) => (
                <Card
                  key={config.id}
                  variant="outlined"
                  sx={{
                    p: 3,
                    opacity: config.is_enabled ? 1 : 0.6,
                    border: 1,
                    borderColor: config.is_enabled ? 'primary.main' : 'divider',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: 2,
                    },
                  }}
                >
                  {/* Form Field Preview - Full Width */}
                  <Box sx={{ mb: 2 }}>
                    {renderFormField(config)}
                  </Box>

                  {/* Controls */}
                  <Stack
                    direction="row"
                    spacing={3}
                    sx={{
                      pt: 2,
                      borderTop: 1,
                      borderColor: 'divider',
                      alignItems: 'center',
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Switch
                          checked={config.is_enabled}
                          onChange={() => handleToggleField(config)}
                          color="success"
                          size="small"
                        />
                      }
                      label={
                        <Typography variant="body2" fontWeight={500}>
                          {config.is_enabled ? 'Enabled' : 'Disabled'}
                        </Typography>
                      }
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={config.is_required ?? false}
                          onChange={() => handleToggleRequired(config)}
                          color="warning"
                          size="small"
                          disabled={!config.is_enabled}
                        />
                      }
                      label={
                        <Typography variant="body2" fontWeight={500}>
                          {config.is_required ? 'Required' : 'Optional'}
                        </Typography>
                      }
                    />
                    <Box sx={{ flexGrow: 1 }} />
                    {/* Field Metadata */}
                    <Stack direction="row" spacing={1}>
                      <Chip label={config.field.field_type} size="small" variant="outlined" />
                      <Chip label={config.field.category.replace('_', ' ')} size="small" color="primary" variant="outlined" />
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Stack>
          </Box>
        )}
      </Paper>

      {/* Template Selection Dialog */}
      <Dialog
        open={templateDialogOpen}
        onClose={() => setTemplateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Select Form Template</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 3 }}>
            Applying a template will <strong>replace</strong> your current configuration.
          </Alert>

          <Grid container spacing={2}>
            {templates.map((template) => (
              <Grid item xs={12} key={template.id}>
                <Card
                  variant={selectedTemplate?.id === template.id ? 'elevation' : 'outlined'}
                  sx={{
                    cursor: 'pointer',
                    border: selectedTemplate?.id === template.id ? 2 : 1,
                    borderColor:
                      selectedTemplate?.id === template.id ? 'primary.main' : 'divider',
                  }}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {template.template_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {template.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setTemplateDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleApplyTemplate}
            variant="contained"
            disabled={!selectedTemplate}
          >
            Apply Template
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Form Name Dialog */}
      <Dialog
        open={editNameDialogOpen}
        onClose={() => setEditNameDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Form Name</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Form Name"
            fullWidth
            variant="outlined"
            value={editedFormName}
            onChange={(e) => setEditedFormName(e.target.value)}
            error={editedFormName.trim().length < 3}
            helperText={
              editedFormName.trim().length < 3
                ? 'Form name must be at least 3 characters'
                : ''
            }
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditNameDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSaveFormName}
            variant="contained"
            disabled={editedFormName.trim().length < 3}
          >
            Save
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
              Parent View
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Stepper activeStep={previewStep} alternativeLabel>
              {steps.map((label, index) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            {steps[previewStep]}
          </Typography>

          <Stack spacing={3}>
            {schoolConfig
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
            onClick={() => setPreviewStep(Math.min(steps.length - 1, previewStep + 1))}
            disabled={previewStep === steps.length - 1}
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

export default FormBuilderPage;
