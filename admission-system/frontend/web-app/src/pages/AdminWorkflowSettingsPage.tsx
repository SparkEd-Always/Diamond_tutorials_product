/**
 * AdminWorkflowSettingsPage
 * Admin interface for managing admission workflow steps
 * Features: View all steps, create, edit, reorder, activate/deactivate, delete
 */

import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Switch,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
} from '@mui/icons-material';
import { useNotification } from '../contexts/NotificationContext';
import workflowApi from '../services/workflowApi';
import type { WorkflowStep } from '../types/workflow';
import WorkflowStepEditor from '../components/WorkflowStepEditor';

const AdminWorkflowSettingsPage: React.FC = () => {
  const { showNotification } = useNotification();
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<WorkflowStep | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [stepToDelete, setStepToDelete] = useState<WorkflowStep | null>(null);

  // Load workflow steps on mount
  useEffect(() => {
    loadWorkflowSteps();
  }, []);

  const loadWorkflowSteps = async () => {
    try {
      setLoading(true);
      const data = await workflowApi.getWorkflowSteps(true); // Include inactive
      setSteps(data);
    } catch (error: any) {
      showNotification('Failed to load workflow steps', 'error');
      console.error('Error loading workflow steps:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStep = () => {
    setEditingStep(null);
    setEditorOpen(true);
  };

  const handleEditStep = (step: WorkflowStep) => {
    setEditingStep(step);
    setEditorOpen(true);
  };

  const handleDeleteClick = (step: WorkflowStep) => {
    setStepToDelete(step);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!stepToDelete) return;

    try {
      await workflowApi.deleteWorkflowStep(stepToDelete.id);
      showNotification('Workflow step deleted successfully', 'success');
      setDeleteConfirmOpen(false);
      setStepToDelete(null);
      loadWorkflowSteps();
    } catch (error: any) {
      showNotification(error.response?.data?.detail || 'Failed to delete workflow step', 'error');
    }
  };

  const handleToggleActive = async (step: WorkflowStep) => {
    try {
      await workflowApi.updateWorkflowStep(step.id, {
        is_active: !step.is_active,
      });
      showNotification(
        `Workflow step ${step.is_active ? 'deactivated' : 'activated'} successfully`,
        'success'
      );
      loadWorkflowSteps();
    } catch (error: any) {
      showNotification('Failed to update workflow step', 'error');
    }
  };

  const handleSaveStep = async () => {
    // This will be called from WorkflowStepEditor dialog
    setEditorOpen(false);
    loadWorkflowSteps();
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Workflow Settings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage admission workflow steps. Configure the steps that applications go through.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddStep}>
          Add New Step
        </Button>
      </Box>

      {/* Info Alert */}
      <Alert severity="info" sx={{ mb: 3 }}>
        These workflow steps will be shown to parents on their dashboard to track application
        progress. You can reorder, edit, activate/deactivate, or delete steps.
      </Alert>

      {/* Workflow Steps Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width={50}></TableCell>
              <TableCell width={80}>Order</TableCell>
              <TableCell>Step Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell width={120} align="center">
                Required
              </TableCell>
              <TableCell width={120} align="center">
                Active
              </TableCell>
              <TableCell width={150} align="center">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {steps.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                  <Typography variant="body1" color="text.secondary">
                    No workflow steps configured yet.
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleAddStep}
                    sx={{ mt: 2 }}
                  >
                    Add First Step
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              steps.map((step) => (
                <TableRow
                  key={step.id}
                  sx={{
                    opacity: step.is_active ? 1 : 0.5,
                    backgroundColor: step.is_active ? 'inherit' : 'action.hover',
                  }}
                >
                  {/* Drag Handle */}
                  <TableCell>
                    <IconButton size="small" sx={{ cursor: 'grab' }}>
                      <DragIcon />
                    </IconButton>
                  </TableCell>

                  {/* Step Order */}
                  <TableCell>
                    <Chip label={step.step_order} color="primary" size="small" />
                  </TableCell>

                  {/* Step Name */}
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {step.step_name}
                    </Typography>
                  </TableCell>

                  {/* Description */}
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {step.step_description || '-'}
                    </Typography>
                  </TableCell>

                  {/* Required Badge */}
                  <TableCell align="center">
                    {step.is_required ? (
                      <Chip label="Required" color="error" size="small" />
                    ) : (
                      <Chip label="Optional" variant="outlined" size="small" />
                    )}
                  </TableCell>

                  {/* Active Toggle */}
                  <TableCell align="center">
                    <Switch
                      checked={step.is_active}
                      onChange={() => handleToggleActive(step)}
                      color="success"
                    />
                  </TableCell>

                  {/* Actions */}
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleEditStep(step)}
                      title="Edit Step"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteClick(step)}
                      title="Delete Step"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Live Preview Section */}
      {steps.filter((s) => s.is_active).length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Live Preview (Parent View)
          </Typography>
          <Paper sx={{ p: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              This is how parents will see the workflow steps on their dashboard:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
              {steps
                .filter((s) => s.is_active)
                .map((step, index) => (
                  <Chip
                    key={step.id}
                    label={`${index + 1}. ${step.step_name}`}
                    variant={index === 0 ? 'filled' : 'outlined'}
                    color={index === 0 ? 'primary' : 'default'}
                  />
                ))}
            </Box>
          </Paper>
        </Box>
      )}

      {/* WorkflowStepEditor Dialog */}
      <WorkflowStepEditor
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSave={handleSaveStep}
        step={editingStep}
        existingSteps={steps}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Delete Workflow Step?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the step "{stepToDelete?.step_name}"?
            <br />
            <br />
            <strong>Warning:</strong> This will remove the step from all applications currently
            using it. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminWorkflowSettingsPage;
