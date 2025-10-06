/**
 * WorkflowStepEditor Dialog
 * Dialog component for creating and editing workflow steps
 * Features: Form validation, order management, required/optional toggle
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Box,
  Typography,
  Alert,
} from '@mui/material';
import { useNotification } from '../contexts/NotificationContext';
import workflowApi from '../services/workflowApi';
import type { WorkflowStep, WorkflowStepCreate, WorkflowStepUpdate } from '../types/workflow';

interface WorkflowStepEditorProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  step: WorkflowStep | null; // null = create new, non-null = edit existing
  existingSteps?: WorkflowStep[]; // For order validation
}

const WorkflowStepEditor: React.FC<WorkflowStepEditorProps> = ({
  open,
  onClose,
  step,
  onSave,
  existingSteps = [],
}) => {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);

  // Form state
  const [stepName, setStepName] = useState('');
  const [stepDescription, setStepDescription] = useState('');
  const [stepOrder, setStepOrder] = useState(1);
  const [isRequired, setIsRequired] = useState(true);
  const [isActive, setIsActive] = useState(true);

  // Validation errors
  const [errors, setErrors] = useState<{
    stepName?: string;
    stepOrder?: string;
  }>({});

  // Initialize form when dialog opens or step changes
  useEffect(() => {
    if (open) {
      if (step) {
        // Editing existing step
        setStepName(step.step_name);
        setStepDescription(step.step_description || '');
        setStepOrder(step.step_order);
        setIsRequired(step.is_required);
        setIsActive(step.is_active);
      } else {
        // Creating new step - set order to last + 1
        const maxOrder = existingSteps.length > 0
          ? Math.max(...existingSteps.map(s => s.step_order))
          : 0;
        setStepName('');
        setStepDescription('');
        setStepOrder(maxOrder + 1);
        setIsRequired(true);
        setIsActive(true);
      }
      setErrors({});
    }
  }, [open, step, existingSteps]);

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    // Step name validation
    if (!stepName.trim()) {
      newErrors.stepName = 'Step name is required';
    } else if (stepName.length > 100) {
      newErrors.stepName = 'Step name must be 100 characters or less';
    }

    // Step order validation
    if (stepOrder < 1) {
      newErrors.stepOrder = 'Step order must be at least 1';
    }

    // Check for duplicate order (only when creating or changing order)
    const isDuplicateOrder = existingSteps.some(
      (s) => s.step_order === stepOrder && s.id !== step?.id
    );
    if (isDuplicateOrder) {
      newErrors.stepOrder = 'This order number is already in use';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      if (step) {
        // Update existing step
        const updateData: WorkflowStepUpdate = {
          step_name: stepName,
          step_description: stepDescription || undefined,
          step_order: stepOrder,
          is_required: isRequired,
          is_active: isActive,
        };
        await workflowApi.updateWorkflowStep(step.id, updateData);
        showNotification('Workflow step updated successfully', 'success');
      } else {
        // Create new step
        const createData: WorkflowStepCreate = {
          step_name: stepName,
          step_description: stepDescription || undefined,
          step_order: stepOrder,
          is_required: isRequired,
          is_active: isActive,
        };
        await workflowApi.createWorkflowStep(createData);
        showNotification('Workflow step created successfully', 'success');
      }

      onSave();
      onClose();
    } catch (error: any) {
      showNotification(
        error.response?.data?.detail || 'Failed to save workflow step',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {step ? 'Edit Workflow Step' : 'Create New Workflow Step'}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          {/* Info Alert */}
          <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
            Workflow steps are shown to parents to track their application progress.
          </Alert>

          {/* Step Name */}
          <TextField
            label="Step Name"
            value={stepName}
            onChange={(e) => setStepName(e.target.value)}
            error={!!errors.stepName}
            helperText={errors.stepName || 'E.g., Application Submitted, Documents Verification'}
            required
            fullWidth
            inputProps={{ maxLength: 100 }}
          />

          {/* Step Description */}
          <TextField
            label="Description"
            value={stepDescription}
            onChange={(e) => setStepDescription(e.target.value)}
            helperText="Optional description shown to parents"
            multiline
            rows={3}
            fullWidth
          />

          {/* Step Order */}
          <TextField
            label="Step Order"
            type="number"
            value={stepOrder}
            onChange={(e) => setStepOrder(parseInt(e.target.value) || 1)}
            error={!!errors.stepOrder}
            helperText={errors.stepOrder || 'The sequence number for this step (1, 2, 3...)'}
            required
            fullWidth
            InputProps={{ inputProps: { min: 1 } }}
          />

          {/* Required Checkbox */}
          <FormControlLabel
            control={
              <Checkbox
                checked={isRequired}
                onChange={(e) => setIsRequired(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Box>
                <Typography variant="body2">Required Step</Typography>
                <Typography variant="caption" color="text.secondary">
                  If checked, this step must be completed before enrollment
                </Typography>
              </Box>
            }
          />

          {/* Active Checkbox */}
          <FormControlLabel
            control={
              <Checkbox
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                color="success"
              />
            }
            label={
              <Box>
                <Typography variant="body2">Active</Typography>
                <Typography variant="caption" color="text.secondary">
                  Only active steps are shown to parents
                </Typography>
              </Box>
            }
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading}
          sx={{ minWidth: 100 }}
        >
          {loading ? 'Saving...' : step ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WorkflowStepEditor;
