import React, { useState } from 'react';
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
import { adhocFeeApi } from '../../services/feeApi';
import type { AdhocFeeFormData, FilteredStudent } from '../../types/fees';

// Import step components
import AdhocFeeDetailsStep from './create-adhoc-fee/AdhocFeeDetailsStep';
import SelectStudentsStep from './create-session/SelectStudentsStep';
import AdhocReviewStep from './create-adhoc-fee/AdhocReviewStep';

const steps = [
  { label: 'Fee Details', instruction: 'Enter fee name, amount, and due date' },
  { label: 'Select Students', instruction: 'Filter and select students to assign this fee' },
  { label: 'Review & Confirm', instruction: 'Review all details before creating assignments' },
];

const CreateAdhocFeePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Form data state
  const [feeData, setFeeData] = useState<Partial<AdhocFeeFormData>>({
    fee_name: '',
    description: '',
    amount: 0,
    assigned_date: today,
    due_date: '',
    student_ids: [],
    remarks: '',
  });

  // Selected students state
  const [selectedStudents, setSelectedStudents] = useState<FilteredStudent[]>([]);

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
      case 0: // Fee Details
        if (!feeData.fee_name || feeData.fee_name.trim().length < 3) {
          setError('Fee name must be at least 3 characters');
          return false;
        }
        if (!feeData.amount || feeData.amount <= 0) {
          setError('Amount must be greater than 0');
          return false;
        }
        if (!feeData.assigned_date) {
          setError('Please select an assigned date');
          return false;
        }
        if (!feeData.due_date) {
          setError('Please select a due date');
          return false;
        }
        if (feeData.assigned_date && feeData.due_date && new Date(feeData.due_date) < new Date(feeData.assigned_date)) {
          setError('Due date must be on or after assigned date');
          return false;
        }
        return true;

      case 1: // Select Students
        if (!feeData.student_ids || feeData.student_ids.length === 0) {
          setError('Please select at least one student');
          return false;
        }
        return true;

      case 2: // Review
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

      const formData: AdhocFeeFormData = {
        fee_name: feeData.fee_name!,
        description: feeData.description,
        amount: feeData.amount!,
        assigned_date: feeData.assigned_date!,
        due_date: feeData.due_date!,
        student_ids: feeData.student_ids!,
        remarks: feeData.remarks,
      };

      const response = await adhocFeeApi.create(formData);

      // Success! Navigate to adhoc fees list page
      navigate('/admin/fees/adhoc', {
        state: {
          message: `Successfully created ${response.length} adhoc fee assignment${response.length !== 1 ? 's' : ''}!`,
          severity: 'success',
        }
      });
    } catch (err: any) {
      console.error('Failed to create adhoc fee assignments:', err);
      setError(err.response?.data?.detail || 'Failed to create adhoc fee assignments');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <AdhocFeeDetailsStep
            data={feeData}
            onChange={(updates) => setFeeData({ ...feeData, ...updates })}
          />
        );
      case 1:
        return (
          <SelectStudentsStep
            academicYearId={0} // Not required for adhoc fees
            selectedStudents={selectedStudents}
            onStudentsChange={(students) => {
              setSelectedStudents(students);
              setFeeData({
                ...feeData,
                student_ids: students.filter(s => s.is_selected).map(s => s.id)
              });
            }}
          />
        );
      case 2:
        return (
          <AdhocReviewStep
            feeData={feeData as AdhocFeeFormData}
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
          onClick={() => navigate('/admin/fees/adhoc')}
          sx={{ mb: 2 }}
        >
          Back to Adhoc Fees
        </Button>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Create Adhoc Fee Assignment
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Assign individual fees to specific students (lost items, fines, special exams, etc.)
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
                {loading ? 'Creating Assignments...' : 'Create Assignments'}
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
      </Box>
    </Box>
  );
};

export default CreateAdhocFeePage;
