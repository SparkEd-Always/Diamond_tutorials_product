/**
 * Workflow Types
 * TypeScript interfaces for configurable admission workflow system
 */

// ============= Workflow Step Types =============

export interface WorkflowStep {
  id: number;
  step_name: string;
  step_description: string | null;
  step_order: number;
  is_required: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: number;
}

export interface WorkflowStepCreate {
  step_name: string;
  step_description?: string;
  step_order: number;
  is_required: boolean;
  is_active: boolean;
}

export interface WorkflowStepUpdate {
  step_name?: string;
  step_description?: string;
  step_order?: number;
  is_required?: boolean;
  is_active?: boolean;
}

// ============= Application Workflow Progress Types =============

export interface WorkflowProgressStep {
  id: number;
  application_id: number;
  workflow_step_id: number;
  step_name: string;
  step_description: string | null;
  step_order: number;
  is_required: boolean;
  is_completed: boolean;
  is_current: boolean;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApplicationWorkflowTracker {
  application_id: number;
  application_number: string;
  current_step: string | null;
  current_step_order: number | null;
  total_steps: number;
  completed_steps: number;
  progress_percentage: number;
  steps: WorkflowProgressStep[];
}

// ============= API Request/Response Types =============

export interface MarkStepCompleteRequest {
  notes?: string;
}

export interface MarkStepCompleteResponse {
  message: string;
  progress: WorkflowProgressStep;
}
