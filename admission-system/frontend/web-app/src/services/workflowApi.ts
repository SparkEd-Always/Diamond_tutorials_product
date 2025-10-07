/**
 * Workflow API Service
 * Handles all API calls for configurable admission workflow system
 */

import api from './api';
import type {
  WorkflowStep,
  WorkflowStepCreate,
  WorkflowStepUpdate,
  ApplicationWorkflowTracker,
  MarkStepCompleteRequest,
  MarkStepCompleteResponse,
} from '../types/workflow';

// ============= Admin Workflow Step Management =============

/**
 * Get all workflow steps
 * @param includeInactive - Include inactive steps (default: false)
 */
export const getWorkflowSteps = async (includeInactive: boolean = false): Promise<WorkflowStep[]> => {
  const response = await api.get<WorkflowStep[]>('/workflow/workflow-steps', {
    params: { include_inactive: includeInactive },
  });
  return response.data;
};

/**
 * Create a new workflow step (Admin only)
 */
export const createWorkflowStep = async (step: WorkflowStepCreate): Promise<WorkflowStep> => {
  const response = await api.post<WorkflowStep>('/workflow/workflow-steps', step);
  return response.data;
};

/**
 * Update an existing workflow step (Admin only)
 */
export const updateWorkflowStep = async (
  stepId: number,
  stepUpdate: WorkflowStepUpdate
): Promise<WorkflowStep> => {
  const response = await api.put<WorkflowStep>(`/workflow/workflow-steps/${stepId}`, stepUpdate);
  return response.data;
};

/**
 * Delete a workflow step (Admin only)
 */
export const deleteWorkflowStep = async (stepId: number): Promise<void> => {
  await api.delete(`/workflow/workflow-steps/${stepId}`);
};

/**
 * Reset workflow steps to default configuration (Admin only)
 * Deletes all existing steps and recreates the 7 default steps
 */
export const resetWorkflowToDefault = async (): Promise<WorkflowStep[]> => {
  const response = await api.post<WorkflowStep[]>('/workflow/workflow-steps/reset-to-default');
  return response.data;
};

// ============= Application Workflow Tracking =============

/**
 * Get workflow tracking for a specific application
 * Shows all steps and the application's progress through them
 */
export const getApplicationWorkflow = async (
  applicationId: number
): Promise<ApplicationWorkflowTracker> => {
  const response = await api.get<ApplicationWorkflowTracker>(
    `/workflow/applications/${applicationId}/workflow`
  );
  return response.data;
};

/**
 * Mark a workflow step as complete for an application (Admin only)
 */
export const markStepComplete = async (
  applicationId: number,
  stepId: number,
  request?: MarkStepCompleteRequest
): Promise<MarkStepCompleteResponse> => {
  const response = await api.post<MarkStepCompleteResponse>(
    `/workflow/applications/${applicationId}/workflow/${stepId}/complete`,
    request
  );
  return response.data;
};

// ============= Workflow API Object (Alternative Export Style) =============

const workflowApi = {
  // Admin workflow step management
  getWorkflowSteps,
  createWorkflowStep,
  updateWorkflowStep,
  deleteWorkflowStep,
  resetWorkflowToDefault,

  // Application workflow tracking
  getApplicationWorkflow,
  markStepComplete,
};

export default workflowApi;
