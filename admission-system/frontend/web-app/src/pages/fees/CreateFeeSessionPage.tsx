import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepButton,
  Box,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  ArrowForward as NextIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { feeSessionApi, feeStructureApi } from '../../services/feeApi';
import type { FeeSessionFormData, FeeStructure, FilteredStudent } from '../../types/fees';

// Import step components
import SessionDetailsStep from './create-session/SessionDetailsStep';
import SelectFeeStructureStep from './create-session/SelectFeeStructureStep';
import SelectStudentsStep from './create-session/SelectStudentsStep';
import ReviewConfirmStep from './create-session/ReviewConfirmStep';

const steps = [
  { label: 'Session Details', instruction: 'Provide session name, academic year, and dates' },
  { label: 'Select Fee Structure', instruction: 'Choose the fee structure to assign to students' },
  { label: 'Select Students', instruction: 'Filter and select students for this session' },
  { label: 'Review & Confirm', instruction: 'Review all details before creating the session' },
];

const CreateFeeSessionPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data state
  const [sessionData, setSessionData] = useState<Partial<FeeSessionFormData>>({
    session_name: '',
    session_description: '',
    academic_year_id: 0,
    fee_structure_id: 0,
    start_date: '',
    due_date: '',
    student_ids: [],
    remarks: '',
  });

  // Additional state for UI
  const [selectedFeeStructure, setSelectedFeeStructure] = useState<FeeStructure | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<FilteredStudent[]>([]);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);

  // Load fee structures on mount
  useEffect(() => {
    loadFeeStructures();
  }, []);

  const loadFeeStructures = async () => {
    try {
      const data = await feeStructureApi.list({ is_active: true });
      setFeeStructures(data);
    } catch (err: any) {
      console.error('Failed to load fee structures:', err);
    }
  };

  const handleNext = () => {
    // Validate current step before proceeding
    if (!validateStep(activeStep)) {
      return;
    }
    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
    setError(null);
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
    setError(null);
  };

  const handleStepClick = (stepIndex: number) => {
    // Allow clicking on completed steps only
    if (stepIndex < activeStep) {
      setActiveStep(stepIndex);
      setError(null);
    }
  };

  const validateStep = (step: number): boolean => {
    setError(null);

    switch (step) {
      case 0: // Session Details
        if (!sessionData.session_name || sessionData.session_name.trim().length < 3) {
          setError('Session name must be at least 3 characters');
          return false;
        }
        if (!sessionData.academic_year_id || sessionData.academic_year_id <= 0) {
          setError('Please select an academic year');
          return false;
        }
        if (!sessionData.start_date) {
          setError('Please select a start date');
          return false;
        }
        if (!sessionData.due_date) {
          setError('Please select a due date');
          return false;
        }
        if (sessionData.start_date && sessionData.due_date && new Date(sessionData.due_date) < new Date(sessionData.start_date)) {
          setError('Due date must be after start date');
          return false;
        }
        return true;

      case 1: // Select Fee Structure
        if (!sessionData.fee_structure_id || sessionData.fee_structure_id <= 0) {
          setError('Please select a fee structure');
          return false;
        }
        return true;

      case 2: // Select Students
        if (!sessionData.student_ids || sessionData.student_ids.length === 0) {
          setError('Please select at least one student');
          return false;
        }
        return true;

      case 3: // Review
        return true;

      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const formData: FeeSessionFormData = {
        session_name: sessionData.session_name!,
        session_description: sessionData.session_description,
        academic_year_id: sessionData.academic_year_id!,
        fee_structure_id: sessionData.fee_structure_id!,
        start_date: sessionData.start_date!,
        due_date: sessionData.due_date!,
        student_ids: sessionData.student_ids!,
        remarks: sessionData.remarks,
      };

      const response = await feeSessionApi.create(formData);

      // Success! Navigate to the session details page
      navigate(`/admin/fees/sessions/${response.id}`, {
        state: { message: 'Fee session created successfully!' }
      });
    } catch (err: any) {
      console.error('Failed to create fee session:', err);
      setError(err.response?.data?.detail || 'Failed to create fee session');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <SessionDetailsStep
            data={sessionData}
            onChange={(updates) => setSessionData({ ...sessionData, ...updates })}
          />
        );
      case 1:
        return (
          <SelectFeeStructureStep
            feeStructures={feeStructures}
            selectedStructureId={sessionData.fee_structure_id || 0}
            onSelect={(structure) => {
              setSessionData({ ...sessionData, fee_structure_id: structure.id });
              setSelectedFeeStructure(structure);
            }}
          />
        );
      case 2:
        return (
          <SelectStudentsStep
            academicYearId={sessionData.academic_year_id || 0}
            selectedStudents={selectedStudents}
            onStudentsChange={(students) => {
              setSelectedStudents(students);
              setSessionData({
                ...sessionData,
                student_ids: students.filter(s => s.is_selected).map(s => s.id)
              });
            }}
          />
        );
      case 3:
        return (
          <ReviewConfirmStep
            sessionData={sessionData as FeeSessionFormData}
            feeStructure={selectedFeeStructure}
            selectedStudents={selectedStudents.filter(s => s.is_selected)}
          />
        );
      default:
        return null;
    }
  };

  const isLastStep = activeStep === steps.length - 1;
  const isFirstStep = activeStep === 0;

  return (
    <Box sx={{ py: 4, width: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ px: 2, mb: 4 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate('/admin/fees/sessions')}
          sx={{ mb: 2 }}
        >
          Back to Sessions
        </Button>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Create New Fee Session
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Follow the steps below to create a new fee session and assign students
        </Typography>
      </Box>

      {/* Stepper */}
      <Box sx={{ px: 2 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((step, index) => (
            <Step key={step.label} completed={index < activeStep}>
              <StepButton onClick={() => handleStepClick(index)}>
                <StepLabel>
                  <Typography variant="subtitle2">{step.label}</Typography>
                </StepLabel>
              </StepButton>
            </Step>
          ))}
        </Stepper>

        {/* Instruction Text */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Step {activeStep + 1}:</strong> {steps[activeStep].instruction}
          </Typography>
        </Alert>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Step Content */}
        <Box sx={{ minHeight: 400 }}>
          {renderStepContent()}
        </Box>

        {/* Navigation Buttons */}
        <Box display="flex" justifyContent="space-between" mt={4}>
          <Button
            onClick={handleBack}
            disabled={isFirstStep || loading}
            startIcon={<BackIcon />}
            size="large"
          >
            Back
          </Button>

          <Box display="flex" gap={2}>
            {!isLastStep ? (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={loading}
                endIcon={<NextIcon />}
                size="large"
              >
                Next
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                size="large"
              >
                {loading ? 'Creating Session...' : 'Create Session'}
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
      </Box>
    </Box>
  );
};

export default CreateFeeSessionPage;
