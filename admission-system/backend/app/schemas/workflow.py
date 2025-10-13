from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# Admission Workflow Step Schemas
class WorkflowStepBase(BaseModel):
    step_name: str
    step_description: Optional[str] = None
    step_order: int
    is_required: bool = True
    is_active: bool = True


class WorkflowStepCreate(WorkflowStepBase):
    """Schema for creating a new workflow step"""
    pass


class WorkflowStepUpdate(BaseModel):
    """Schema for updating a workflow step"""
    step_name: Optional[str] = None
    step_description: Optional[str] = None
    step_order: Optional[int] = None
    is_required: Optional[bool] = None
    is_active: Optional[bool] = None


class WorkflowStepResponse(WorkflowStepBase):
    """Schema for workflow step response"""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Application Workflow Progress Schemas
class WorkflowProgressBase(BaseModel):
    workflow_step_id: int
    is_completed: bool = False
    is_current: bool = False
    notes: Optional[str] = None


class WorkflowProgressCreate(WorkflowProgressBase):
    """Schema for creating workflow progress"""
    application_id: int


class WorkflowProgressUpdate(BaseModel):
    """Schema for updating workflow progress"""
    is_completed: Optional[bool] = None
    is_current: Optional[bool] = None
    notes: Optional[str] = None


class WorkflowProgressResponse(BaseModel):
    """Schema for workflow progress response"""
    id: int
    application_id: int
    workflow_step_id: int
    step_name: str
    step_description: Optional[str]
    step_order: int
    is_required: bool
    is_completed: bool
    is_current: bool
    completed_at: Optional[datetime]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ApplicationWorkflowTracker(BaseModel):
    """
    Complete workflow tracking for an application.
    Shows all steps and current progress.
    """
    application_id: int
    application_number: str
    current_step: Optional[str] = None
    current_step_order: Optional[int] = None
    total_steps: int
    completed_steps: int
    progress_percentage: int
    steps: list[WorkflowProgressResponse]

    class Config:
        from_attributes = True
