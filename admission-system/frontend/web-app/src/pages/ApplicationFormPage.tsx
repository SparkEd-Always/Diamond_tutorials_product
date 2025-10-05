import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Container,
  Box,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormControlLabel,
  Checkbox,
  FormHelperText,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { admissionApi } from '../services/api';
import { useNotification } from '../contexts/NotificationContext';
import LoadingButton from '../components/common/LoadingButton';
import {
  studentDetailsSchema,
  parentDetailsSchema,
  addressSchema,
  academicDetailsSchema,
} from '../utils/validationSchemas';
import type { ApplicationFormData } from '../types';

const steps = ['Student Details', 'Parent Details', 'Address', 'Academic Details', 'Review'];

const ApplicationFormPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<ApplicationFormData>({
    student_details: {
      first_name: '',
      middle_name: '',
      last_name: '',
      date_of_birth: '',
      gender: 'male',
      blood_group: '',
      medical_conditions: '',
      previous_school_name: '',
      previous_school_address: '',
      transport_required: false,
    },
    parent_details: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      relationship_type: 'father',
      occupation: '',
      employer_name: '',
      education_qualification: '',
      is_primary_contact: true,
    },
    address: {
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'India',
    },
    class_applying_id: 1,
    academic_year_id: 1,
    source: 'online',
    emergency_contact_name: '',
    emergency_contact_phone: '',
  });

  const handleNext = async () => {
    // Validate current step before proceeding
    const validationResult = await validateCurrentStep();
    if (validationResult) {
      setActiveStep((prev) => prev + 1);
      setValidationErrors({});
    }
  };

  const validateCurrentStep = async () => {
    try {
      switch (activeStep) {
        case 0:
          await studentDetailsSchema.validate(formData.student_details, { abortEarly: false });
          break;
        case 1:
          await parentDetailsSchema.validate(formData.parent_details, { abortEarly: false });
          break;
        case 2:
          await addressSchema.validate(formData.address, { abortEarly: false });
          break;
        case 3:
          await academicDetailsSchema.validate({
            class_applying_id: formData.class_applying_id,
            academic_year_id: formData.academic_year_id,
            emergency_contact_name: formData.emergency_contact_name,
            emergency_contact_phone: formData.emergency_contact_phone,
          }, { abortEarly: false });
          break;
        default:
          return true;
      }
      return true;
    } catch (err: any) {
      if (err.inner) {
        const errors: Record<string, string> = {};
        err.inner.forEach((error: any) => {
          if (error.path) {
            errors[error.path] = error.message;
          }
        });
        setValidationErrors(errors);
        showError('Please fix the validation errors before proceeding');
      }
      return false;
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const response = await admissionApi.createApplication(formData);
      showSuccess(
        `Application created successfully! Application Number: ${response.application.application_number}`
      );
      navigate('/dashboard');
    } catch (err: any) {
      showError(err.response?.data?.detail || 'Failed to create application');
    } finally {
      setLoading(false);
    }
  };

  const updateStudentDetails = (field: string, value: any) => {
    setFormData({
      ...formData,
      student_details: { ...formData.student_details, [field]: value },
    });
  };

  const updateParentDetails = (field: string, value: any) => {
    setFormData({
      ...formData,
      parent_details: { ...formData.parent_details, [field]: value },
    });
  };

  const updateAddress = (field: string, value: any) => {
    setFormData({
      ...formData,
      address: { ...formData.address, [field]: value },
    });
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0: // Student Details
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.student_details.first_name}
                onChange={(e) => updateStudentDetails('first_name', e.target.value)}
                required
                error={!!validationErrors.first_name}
                helperText={validationErrors.first_name}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Middle Name"
                value={formData.student_details.middle_name}
                onChange={(e) => updateStudentDetails('middle_name', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.student_details.last_name}
                onChange={(e) => updateStudentDetails('last_name', e.target.value)}
                required
                error={!!validationErrors.last_name}
                helperText={validationErrors.last_name}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                value={formData.student_details.date_of_birth}
                onChange={(e) => updateStudentDetails('date_of_birth', e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
                error={!!validationErrors.date_of_birth}
                helperText={validationErrors.date_of_birth}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select
                  value={formData.student_details.gender}
                  label="Gender"
                  onChange={(e) => updateStudentDetails('gender', e.target.value)}
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Blood Group"
                value={formData.student_details.blood_group}
                onChange={(e) => updateStudentDetails('blood_group', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Previous School"
                value={formData.student_details.previous_school_name}
                onChange={(e) => updateStudentDetails('previous_school_name', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Medical Conditions (if any)"
                value={formData.student_details.medical_conditions}
                onChange={(e) => updateStudentDetails('medical_conditions', e.target.value)}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.student_details.transport_required}
                    onChange={(e) => updateStudentDetails('transport_required', e.target.checked)}
                  />
                }
                label="Transport Required"
              />
            </Grid>
          </Grid>
        );

      case 1: // Parent Details
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.parent_details.first_name}
                onChange={(e) => updateParentDetails('first_name', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.parent_details.last_name}
                onChange={(e) => updateParentDetails('last_name', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.parent_details.email}
                onChange={(e) => updateParentDetails('email', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.parent_details.phone}
                onChange={(e) => updateParentDetails('phone', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Relationship</InputLabel>
                <Select
                  value={formData.parent_details.relationship_type}
                  label="Relationship"
                  onChange={(e) => updateParentDetails('relationship_type', e.target.value)}
                >
                  <MenuItem value="father">Father</MenuItem>
                  <MenuItem value="mother">Mother</MenuItem>
                  <MenuItem value="guardian">Guardian</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Occupation"
                value={formData.parent_details.occupation}
                onChange={(e) => updateParentDetails('occupation', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Employer Name"
                value={formData.parent_details.employer_name}
                onChange={(e) => updateParentDetails('employer_name', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Education Qualification"
                value={formData.parent_details.education_qualification}
                onChange={(e) => updateParentDetails('education_qualification', e.target.value)}
              />
            </Grid>
          </Grid>
        );

      case 2: // Address
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address Line 1"
                value={formData.address.address_line1}
                onChange={(e) => updateAddress('address_line1', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address Line 2"
                value={formData.address.address_line2}
                onChange={(e) => updateAddress('address_line2', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                value={formData.address.city}
                onChange={(e) => updateAddress('city', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="State"
                value={formData.address.state}
                onChange={(e) => updateAddress('state', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Postal Code"
                value={formData.address.postal_code}
                onChange={(e) => updateAddress('postal_code', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Country"
                value={formData.address.country}
                onChange={(e) => updateAddress('country', e.target.value)}
                required
              />
            </Grid>
          </Grid>
        );

      case 3: // Academic Details
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" paragraph>
                Note: Class and Academic Year selection will be enhanced with actual API data
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Class Applying For (ID)"
                type="number"
                value={formData.class_applying_id}
                onChange={(e) => setFormData({ ...formData, class_applying_id: parseInt(e.target.value) })}
                helperText="Enter class ID (e.g., 1 for Class 1)"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Academic Year (ID)"
                type="number"
                value={formData.academic_year_id}
                onChange={(e) => setFormData({ ...formData, academic_year_id: parseInt(e.target.value) })}
                helperText="Enter academic year ID (e.g., 1 for 2024-25)"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Emergency Contact Name"
                value={formData.emergency_contact_name}
                onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Emergency Contact Phone"
                value={formData.emergency_contact_phone}
                onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
              />
            </Grid>
          </Grid>
        );

      case 4: // Review
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Please review your application
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Student Details
              </Typography>
              <Typography variant="body2">
                {formData.student_details.first_name} {formData.student_details.last_name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                DOB: {formData.student_details.date_of_birth} | Gender: {formData.student_details.gender}
              </Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Parent Details
              </Typography>
              <Typography variant="body2">
                {formData.parent_details.first_name} {formData.parent_details.last_name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Email: {formData.parent_details.email} | Phone: {formData.parent_details.phone}
              </Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Address
              </Typography>
              <Typography variant="body2">
                {formData.address.address_line1}, {formData.address.city}, {formData.address.state} - {formData.address.postal_code}
              </Typography>
            </Paper>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/dashboard')}>
            <ArrowBackIcon />
          </IconButton>
          <SchoolIcon sx={{ mr: 2 }} />
          <Typography variant="h6">
            New Application
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Paper sx={{ p: 4 }}>
          {renderStepContent()}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>
            {activeStep === steps.length - 1 ? (
              <LoadingButton
                variant="contained"
                onClick={handleSubmit}
                loading={loading}
                loadingText="Submitting..."
              >
                Submit Application
              </LoadingButton>
            ) : (
              <Button variant="contained" onClick={handleNext}>
                Next
              </Button>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ApplicationFormPage;
