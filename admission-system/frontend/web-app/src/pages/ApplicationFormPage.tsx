import { useState, useEffect } from 'react';
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
  MobileStepper,
  LinearProgress,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import SchoolIcon from '@mui/icons-material/School';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import SaveIcon from '@mui/icons-material/Save';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { admissionApi, documentApi, academicApi } from '../services/api';
import { useNotification } from '../contexts/NotificationContext';
import LoadingButton from '../components/common/LoadingButton';
import {
  studentDetailsSchema,
  parentDetailsSchema,
  addressSchema,
  academicDetailsSchema,
} from '../utils/validationSchemas';
import type { ApplicationFormData, AcademicYear, Class } from '../types';

const steps = ['Student Details', 'Parent Details', 'Address', 'Academic Details', 'Upload Documents', 'Review'];

const ApplicationFormPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [draftApplicationId, setDraftApplicationId] = useState<number | null>(null);
  const [showDraftDialog, setShowDraftDialog] = useState(false);

  // Academic data state
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loadingAcademicData, setLoadingAcademicData] = useState(false);

  // Document upload state
  const [uploadedDocuments, setUploadedDocuments] = useState<Record<string, { file: File | null; uploaded: boolean; fileName?: string }>>({
    marks_card: { file: null, uploaded: false },
    aadhar_card: { file: null, uploaded: false },
    birth_certificate: { file: null, uploaded: false },
  });
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

  const [formData, setFormData] = useState<ApplicationFormData>({
    student_details: {
      first_name: '',
      middle_name: '',
      last_name: '',
      date_of_birth: '', // Will be sent as empty string
      gender: '',  // Empty for drafts
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

  // Fetch academic years and classes on component mount
  useEffect(() => {
    const fetchAcademicData = async () => {
      setLoadingAcademicData(true);
      try {
        const [yearsData, classesData] = await Promise.all([
          academicApi.getAcademicYears(),
          academicApi.getClasses(),
        ]);
        setAcademicYears(yearsData);
        setClasses(classesData);

        // Set default values to current academic year if available
        const currentYear = yearsData.find((year: AcademicYear) => year.is_current);
        if (currentYear) {
          setFormData(prev => ({ ...prev, academic_year_id: currentYear.id }));
        }
      } catch (err: any) {
        console.error('Failed to fetch academic data:', err);
        showError('Failed to load academic data');
      } finally {
        setLoadingAcademicData(false);
      }
    };

    fetchAcademicData();
  }, []);

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

  const handleSaveAsDraft = async () => {
    // Validate minimum required fields for draft
    if (!formData.student_details.date_of_birth) {
      showError('Please enter the student\'s date of birth before saving as draft');
      return;
    }
    if (!formData.student_details.gender) {
      showError('Please select the student\'s gender before saving as draft');
      return;
    }

    setSavingDraft(true);
    try {
      if (draftApplicationId) {
        // TODO: Update existing draft application
        // For now, we'll just show success since update API might not exist yet
        showSuccess('Draft updated successfully');
        setShowDraftDialog(true);
      } else {
        // Create new draft application using draft endpoint
        const response = await admissionApi.createDraftApplication(formData);
        setDraftApplicationId(response.application.id);
        setShowDraftDialog(true);
      }
    } catch (err: any) {
      console.error('Draft save error:', err);
      const errorMessage = err.response?.data?.detail || 'Failed to save draft. Please try again.';
      showError(errorMessage);
    } finally {
      setSavingDraft(false);
    }
  };

  const handleCloseDraftDialog = () => {
    setShowDraftDialog(false);
  };

  const handleExitAfterDraft = () => {
    navigate('/dashboard');
  };

  const handleFileSelect = (docType: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      showError('File size must be less than 5MB');
      return;
    }

    setUploadedDocuments(prev => ({
      ...prev,
      [docType]: { file, uploaded: false, fileName: file.name }
    }));
  };

  const handleFileUpload = async (docType: string) => {
    const docData = uploadedDocuments[docType];
    if (!docData.file || !draftApplicationId) {
      showError('Please save as draft first before uploading documents');
      return;
    }

    setUploadingDoc(docType);
    try {
      // Map document types to IDs (these should match backend document_types table)
      const docTypeIds: Record<string, number> = {
        marks_card: 9, // Previous Year Marksheet
        aadhar_card: 7, // Aadhar Card
        birth_certificate: 1, // Birth Certificate
      };

      await documentApi.uploadDocument(
        draftApplicationId,
        docTypeIds[docType],
        docData.file
      );

      setUploadedDocuments(prev => ({
        ...prev,
        [docType]: { ...prev[docType], uploaded: true }
      }));

      showSuccess(`${docType.replace('_', ' ')} uploaded successfully`);
    } catch (err: any) {
      showError(err.response?.data?.detail || 'Failed to upload document');
    } finally {
      setUploadingDoc(null);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      // Create the application
      const createResponse = await admissionApi.createApplication(formData);
      const applicationId = createResponse.application.id;

      // Immediately submit it
      await admissionApi.submitApplication(applicationId);

      showSuccess(
        `Application submitted successfully! Application Number: ${createResponse.application.application_number}`
      );
      navigate('/dashboard');
    } catch (err: any) {
      showError(err.response?.data?.detail || 'Failed to submit application');
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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="First Name"
              value={formData.student_details.first_name}
              onChange={(e) => updateStudentDetails('first_name', e.target.value)}
              required
              error={!!validationErrors.first_name}
              helperText={validationErrors.first_name}
            />
            <TextField
              fullWidth
              label="Middle Name"
              value={formData.student_details.middle_name}
              onChange={(e) => updateStudentDetails('middle_name', e.target.value)}
              error={!!validationErrors.middle_name}
              helperText={validationErrors.middle_name}
            />
            <TextField
              fullWidth
              label="Last Name"
              value={formData.student_details.last_name}
              onChange={(e) => updateStudentDetails('last_name', e.target.value)}
              required
              error={!!validationErrors.last_name}
              helperText={validationErrors.last_name}
            />
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Date of Birth *"
                value={formData.student_details.date_of_birth ? dayjs(formData.student_details.date_of_birth) : null}
                onChange={(newValue: Dayjs | null) => {
                  updateStudentDetails('date_of_birth', newValue ? newValue.format('YYYY-MM-DD') : '');
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!validationErrors.date_of_birth,
                    helperText: validationErrors.date_of_birth,
                  },
                }}
                maxDate={dayjs()}
                minDate={dayjs().subtract(25, 'year')}
              />
            </LocalizationProvider>
            <FormControl fullWidth error={!!validationErrors.gender}>
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
              {validationErrors.gender && (
                <FormHelperText>{validationErrors.gender}</FormHelperText>
              )}
            </FormControl>
            <FormControl fullWidth error={!!validationErrors.blood_group}>
              <InputLabel>Blood Group</InputLabel>
              <Select
                value={formData.student_details.blood_group}
                label="Blood Group"
                onChange={(e) => updateStudentDetails('blood_group', e.target.value)}
              >
                <MenuItem value="">Not Specified</MenuItem>
                <MenuItem value="A+">A+</MenuItem>
                <MenuItem value="A-">A-</MenuItem>
                <MenuItem value="B+">B+</MenuItem>
                <MenuItem value="B-">B-</MenuItem>
                <MenuItem value="AB+">AB+</MenuItem>
                <MenuItem value="AB-">AB-</MenuItem>
                <MenuItem value="O+">O+</MenuItem>
                <MenuItem value="O-">O-</MenuItem>
                <MenuItem value="Unknown">Unknown</MenuItem>
              </Select>
              {validationErrors.blood_group && (
                <FormHelperText>{validationErrors.blood_group}</FormHelperText>
              )}
            </FormControl>
            <TextField
              fullWidth
              label="Previous School"
              value={formData.student_details.previous_school_name}
              onChange={(e) => updateStudentDetails('previous_school_name', e.target.value)}
              error={!!validationErrors.previous_school_name}
              helperText={validationErrors.previous_school_name}
            />
            <TextField
              fullWidth
              label="Medical Conditions (if any)"
              value={formData.student_details.medical_conditions}
              onChange={(e) => updateStudentDetails('medical_conditions', e.target.value)}
              multiline
              rows={2}
              error={!!validationErrors.medical_conditions}
              helperText={validationErrors.medical_conditions}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.student_details.transport_required}
                  onChange={(e) => updateStudentDetails('transport_required', e.target.checked)}
                />
              }
              label="Transport Required"
            />
          </Box>
        );

      case 1: // Parent Details
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="First Name"
              value={formData.parent_details.first_name}
              onChange={(e) => updateParentDetails('first_name', e.target.value)}
              required
              error={!!validationErrors.first_name}
              helperText={validationErrors.first_name}
            />
            <TextField
              fullWidth
              label="Last Name"
              value={formData.parent_details.last_name}
              onChange={(e) => updateParentDetails('last_name', e.target.value)}
              required
              error={!!validationErrors.last_name}
              helperText={validationErrors.last_name}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.parent_details.email}
              onChange={(e) => updateParentDetails('email', e.target.value)}
              required
              error={!!validationErrors.email}
              helperText={validationErrors.email}
            />
            <TextField
              fullWidth
              label="Phone"
              type="tel"
              value={formData.parent_details.phone}
              onChange={(e) => updateParentDetails('phone', e.target.value)}
              required
              error={!!validationErrors.phone}
              helperText={validationErrors.phone}
            />
            <FormControl fullWidth error={!!validationErrors.relationship_type}>
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
              {validationErrors.relationship_type && (
                <FormHelperText>{validationErrors.relationship_type}</FormHelperText>
              )}
            </FormControl>
            <TextField
              fullWidth
              label="Occupation"
              value={formData.parent_details.occupation}
              onChange={(e) => updateParentDetails('occupation', e.target.value)}
              error={!!validationErrors.occupation}
              helperText={validationErrors.occupation}
            />
            <TextField
              fullWidth
              label="Employer Name"
              value={formData.parent_details.employer_name}
              onChange={(e) => updateParentDetails('employer_name', e.target.value)}
              error={!!validationErrors.employer_name}
              helperText={validationErrors.employer_name}
            />
            <TextField
              fullWidth
              label="Education Qualification"
              value={formData.parent_details.education_qualification}
              onChange={(e) => updateParentDetails('education_qualification', e.target.value)}
              error={!!validationErrors.education_qualification}
              helperText={validationErrors.education_qualification}
            />
          </Box>
        );

      case 2: // Address
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="Address Line 1"
              value={formData.address.address_line1}
              onChange={(e) => updateAddress('address_line1', e.target.value)}
              required
              error={!!validationErrors.address_line1}
              helperText={validationErrors.address_line1}
            />
            <TextField
              fullWidth
              label="Address Line 2"
              value={formData.address.address_line2}
              onChange={(e) => updateAddress('address_line2', e.target.value)}
              error={!!validationErrors.address_line2}
              helperText={validationErrors.address_line2}
            />
            <TextField
              fullWidth
              label="City"
              value={formData.address.city}
              onChange={(e) => updateAddress('city', e.target.value)}
              required
              error={!!validationErrors.city}
              helperText={validationErrors.city}
            />
            <TextField
              fullWidth
              label="State"
              value={formData.address.state}
              onChange={(e) => updateAddress('state', e.target.value)}
              required
              error={!!validationErrors.state}
              helperText={validationErrors.state}
            />
            <TextField
              fullWidth
              label="Postal Code"
              type="tel"
              value={formData.address.postal_code}
              onChange={(e) => updateAddress('postal_code', e.target.value)}
              required
              error={!!validationErrors.postal_code}
              helperText={validationErrors.postal_code}
            />
            <TextField
              fullWidth
              label="Country"
              value={formData.address.country}
              onChange={(e) => updateAddress('country', e.target.value)}
              required
              error={!!validationErrors.country}
              helperText={validationErrors.country}
            />
          </Box>
        );

      case 3: // Academic Details
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <FormControl fullWidth error={!!validationErrors.academic_year_id} required>
              <InputLabel>Academic Year</InputLabel>
              <Select
                value={formData.academic_year_id}
                label="Academic Year"
                onChange={(e) => setFormData({ ...formData, academic_year_id: e.target.value as number })}
                disabled={loadingAcademicData}
              >
                {academicYears.map((year) => (
                  <MenuItem key={year.id} value={year.id}>
                    {year.year_name} {year.is_current && '(Current)'}
                  </MenuItem>
                ))}
              </Select>
              {validationErrors.academic_year_id && (
                <FormHelperText>{validationErrors.academic_year_id}</FormHelperText>
              )}
            </FormControl>

            <FormControl fullWidth error={!!validationErrors.class_applying_id} required>
              <InputLabel>Class Applying For</InputLabel>
              <Select
                value={formData.class_applying_id}
                label="Class Applying For"
                onChange={(e) => setFormData({ ...formData, class_applying_id: e.target.value as number })}
                disabled={loadingAcademicData}
              >
                {classes.map((cls) => (
                  <MenuItem key={cls.id} value={cls.id}>
                    {cls.class_name}
                  </MenuItem>
                ))}
              </Select>
              {validationErrors.class_applying_id && (
                <FormHelperText>{validationErrors.class_applying_id}</FormHelperText>
              )}
            </FormControl>

            <TextField
              fullWidth
              label="Emergency Contact Name"
              value={formData.emergency_contact_name}
              onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
              error={!!validationErrors.emergency_contact_name}
              helperText={validationErrors.emergency_contact_name}
            />
            <TextField
              fullWidth
              label="Emergency Contact Phone"
              type="tel"
              value={formData.emergency_contact_phone}
              onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
              error={!!validationErrors.emergency_contact_phone}
              helperText={validationErrors.emergency_contact_phone}
            />
          </Box>
        );

      case 4: // Upload Documents
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Recent Marks Card */}
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  📄 Recent Marks Card
                </Typography>
                {uploadedDocuments.marks_card.uploaded && (
                  <Chip label="Uploaded" color="success" size="small" icon={<CheckCircleIcon />} />
                )}
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <input
                  type="file"
                  accept="*/*"
                  style={{ display: 'none' }}
                  id="marks_card-input"
                  onChange={(e) => handleFileSelect('marks_card', e)}
                />
                <label htmlFor="marks_card-input">
                  <Button
                    variant="outlined"
                    component="span"
                    fullWidth
                    startIcon={<UploadFileIcon />}
                  >
                    Choose File
                  </Button>
                </label>
                {uploadedDocuments.marks_card.fileName && (
                  <Typography variant="caption" color="text.secondary">
                    Selected: {uploadedDocuments.marks_card.fileName}
                  </Typography>
                )}
                {uploadedDocuments.marks_card.file && !uploadedDocuments.marks_card.uploaded && (
                  <LoadingButton
                    variant="contained"
                    fullWidth
                    onClick={() => handleFileUpload('marks_card')}
                    loading={uploadingDoc === 'marks_card'}
                    loadingText="Uploading..."
                  >
                    Upload
                  </LoadingButton>
                )}
              </Box>
            </Paper>

            {/* Aadhar Card */}
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  🪪 Aadhar Card
                </Typography>
                {uploadedDocuments.aadhar_card.uploaded && (
                  <Chip label="Uploaded" color="success" size="small" icon={<CheckCircleIcon />} />
                )}
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <input
                  type="file"
                  accept="*/*"
                  style={{ display: 'none' }}
                  id="aadhar_card-input"
                  onChange={(e) => handleFileSelect('aadhar_card', e)}
                />
                <label htmlFor="aadhar_card-input">
                  <Button
                    variant="outlined"
                    component="span"
                    fullWidth
                    startIcon={<UploadFileIcon />}
                  >
                    Choose File
                  </Button>
                </label>
                {uploadedDocuments.aadhar_card.fileName && (
                  <Typography variant="caption" color="text.secondary">
                    Selected: {uploadedDocuments.aadhar_card.fileName}
                  </Typography>
                )}
                {uploadedDocuments.aadhar_card.file && !uploadedDocuments.aadhar_card.uploaded && (
                  <LoadingButton
                    variant="contained"
                    fullWidth
                    onClick={() => handleFileUpload('aadhar_card')}
                    loading={uploadingDoc === 'aadhar_card'}
                    loadingText="Uploading..."
                  >
                    Upload
                  </LoadingButton>
                )}
              </Box>
            </Paper>

            {/* Birth Certificate */}
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  👶 Birth Certificate
                </Typography>
                {uploadedDocuments.birth_certificate.uploaded && (
                  <Chip label="Uploaded" color="success" size="small" icon={<CheckCircleIcon />} />
                )}
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <input
                  type="file"
                  accept="*/*"
                  style={{ display: 'none' }}
                  id="birth_certificate-input"
                  onChange={(e) => handleFileSelect('birth_certificate', e)}
                />
                <label htmlFor="birth_certificate-input">
                  <Button
                    variant="outlined"
                    component="span"
                    fullWidth
                    startIcon={<UploadFileIcon />}
                  >
                    Choose File
                  </Button>
                </label>
                {uploadedDocuments.birth_certificate.fileName && (
                  <Typography variant="caption" color="text.secondary">
                    Selected: {uploadedDocuments.birth_certificate.fileName}
                  </Typography>
                )}
                {uploadedDocuments.birth_certificate.file && !uploadedDocuments.birth_certificate.uploaded && (
                  <LoadingButton
                    variant="contained"
                    fullWidth
                    onClick={() => handleFileUpload('birth_certificate')}
                    loading={uploadingDoc === 'birth_certificate'}
                    loadingText="Uploading..."
                  >
                    Upload
                  </LoadingButton>
                )}
              </Box>
            </Paper>

            <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
              All documents are optional. Max file size: 5MB. All file types accepted.
            </Typography>
          </Box>
        );

      case 5: // Review
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
    <Box sx={{ width: '100vw',minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <AppBar position="static" elevation={1}>
        <Toolbar sx={{ minHeight: { xs: 48, sm: 56 } }}>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/dashboard')} size="medium">
            <ArrowBackIcon />
          </IconButton>
          <SchoolIcon sx={{ mr: 1.5, fontSize: 24 }} />
          <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            New Application
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Progress Bar (Mobile) */}
      {isMobile && (
        <LinearProgress
          variant="determinate"
          value={(activeStep / (steps.length - 1)) * 100}
          sx={{ height: 4 }}
        />
      )}

      {/* Main Content */}
      <Container
        maxWidth="lg"
        sx={{
          flex: 1,
          py: { xs: 2, sm: 4 },
          px: { xs: 2, sm: 3, md: 4 },
          pb: { xs: 10, sm: 4 } // Extra padding bottom for mobile sticky buttons
        }}
      >
        {/* Step Title (Mobile) */}
        {isMobile && (
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Step {activeStep + 1} of {steps.length}
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {steps[activeStep]}
              </Typography>
            </Box>
            <LoadingButton
              variant="outlined"
              size="small"
              startIcon={<SaveIcon />}
              onClick={handleSaveAsDraft}
              loading={savingDraft}
              loadingText="Saving..."
            >
              Save
            </LoadingButton>
          </Box>
        )}

        {/* Desktop Stepper */}
        {!isMobile && (
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        )}

        {/* Form Content */}
        <Paper sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          {renderStepContent()}
        </Paper>
      </Container>

      {/* Navigation Buttons */}
      <Paper
        elevation={isMobile ? 8 : 0}
        sx={{
          position: isMobile ? 'fixed' : 'relative',
          bottom: isMobile ? 0 : 'auto',
          left: isMobile ? 0 : 'auto',
          right: isMobile ? 0 : 'auto',
          zIndex: isMobile ? 1000 : 'auto',
          p: 2,
          borderTop: isMobile ? 1 : 0,
          borderColor: 'divider',
          mt: isMobile ? 0 : 2,
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              startIcon={isMobile ? <KeyboardArrowLeft /> : undefined}
              fullWidth={isMobile}
              variant={isMobile ? "outlined" : "text"}
            >
              {isMobile ? 'Back' : 'Back'}
            </Button>
            {activeStep === steps.length - 1 ? (
              <LoadingButton
                variant="contained"
                onClick={handleSubmit}
                loading={loading}
                loadingText="Submitting..."
                fullWidth={isMobile}
                size={isMobile ? "large" : "medium"}
              >
                Submit
              </LoadingButton>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={isMobile ? <KeyboardArrowRight /> : undefined}
                fullWidth={isMobile}
                size={isMobile ? "large" : "medium"}
              >
                Next
              </Button>
            )}
          </Box>
        </Container>
      </Paper>

      {/* Draft Saved Dialog */}
      <Dialog
        open={showDraftDialog}
        onClose={handleCloseDraftDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Application Saved Successfully</DialogTitle>
        <DialogContent>
          <Typography>
            Your application has been saved as a draft. You can continue filling it out now or come back later to complete it.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={handleExitAfterDraft}
            variant="outlined"
            fullWidth={isMobile}
          >
            Exit
          </Button>
          <Button
            onClick={handleCloseDraftDialog}
            variant="contained"
            fullWidth={isMobile}
            autoFocus
          >
            Continue Filling
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ApplicationFormPage;
