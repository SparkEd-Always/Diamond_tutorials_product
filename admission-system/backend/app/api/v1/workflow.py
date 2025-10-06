from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User, UserRole
from app.models.workflow import AdmissionWorkflowStep, ApplicationWorkflowProgress
from app.models.admission import AdmissionApplication
from app.schemas.workflow import (
    WorkflowStepCreate,
    WorkflowStepUpdate,
    WorkflowStepResponse,
    WorkflowProgressResponse,
    ApplicationWorkflowTracker
)

router = APIRouter()


# ============= ADMIN ENDPOINTS =============

@router.get("/workflow-steps", response_model=List[WorkflowStepResponse])
async def get_workflow_steps(
    include_inactive: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all workflow steps (ordered by step_order).
    By default, only active steps are returned.
    """
    query = db.query(AdmissionWorkflowStep).order_by(AdmissionWorkflowStep.step_order)

    if not include_inactive:
        query = query.filter(AdmissionWorkflowStep.is_active == True)

    steps = query.all()
    return steps


@router.post("/workflow-steps", response_model=WorkflowStepResponse)
async def create_workflow_step(
    step: WorkflowStepCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new workflow step (Admin only).
    """
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
        raise HTTPException(status_code=403, detail="Admin access required")

    new_step = AdmissionWorkflowStep(
        **step.dict(),
        created_by=current_user.id
    )
    db.add(new_step)
    db.commit()
    db.refresh(new_step)
    return new_step


@router.put("/workflow-steps/{step_id}", response_model=WorkflowStepResponse)
async def update_workflow_step(
    step_id: int,
    step_update: WorkflowStepUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update a workflow step (Admin only).
    """
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
        raise HTTPException(status_code=403, detail="Admin access required")

    step = db.query(AdmissionWorkflowStep).filter(AdmissionWorkflowStep.id == step_id).first()
    if not step:
        raise HTTPException(status_code=404, detail="Workflow step not found")

    # Update only provided fields
    for field, value in step_update.dict(exclude_unset=True).items():
        setattr(step, field, value)

    db.commit()
    db.refresh(step)
    return step


@router.delete("/workflow-steps/{step_id}")
async def delete_workflow_step(
    step_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a workflow step (Admin only).
    """
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
        raise HTTPException(status_code=403, detail="Admin access required")

    step = db.query(AdmissionWorkflowStep).filter(AdmissionWorkflowStep.id == step_id).first()
    if not step:
        raise HTTPException(status_code=404, detail="Workflow step not found")

    db.delete(step)
    db.commit()
    return {"message": "Workflow step deleted successfully"}


# ============= APPLICATION WORKFLOW TRACKING =============

@router.get("/applications/{application_id}/workflow", response_model=ApplicationWorkflowTracker)
async def get_application_workflow(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get workflow tracking for a specific application.
    Shows all steps and the application's progress through them.
    """
    application = db.query(AdmissionApplication).filter(
        AdmissionApplication.id == application_id
    ).first()

    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    # Get all active workflow steps
    workflow_steps = db.query(AdmissionWorkflowStep).filter(
        AdmissionWorkflowStep.is_active == True
    ).order_by(AdmissionWorkflowStep.step_order).all()

    # Get progress for this application
    progress_records = db.query(ApplicationWorkflowProgress).filter(
        ApplicationWorkflowProgress.application_id == application_id
    ).all()

    # Create a map of step_id -> progress
    progress_map = {p.workflow_step_id: p for p in progress_records}

    # Build response with all steps and their progress
    steps_response = []
    current_step = None
    current_step_order = None
    completed_count = 0

    for step in workflow_steps:
        progress = progress_map.get(step.id)

        step_data = {
            "id": progress.id if progress else 0,
            "application_id": application_id,
            "workflow_step_id": step.id,
            "step_name": step.step_name,
            "step_description": step.step_description,
            "step_order": step.step_order,
            "is_required": step.is_required,
            "is_completed": progress.is_completed if progress else False,
            "is_current": progress.is_current if progress else False,
            "completed_at": progress.completed_at if progress else None,
            "notes": progress.notes if progress else None,
            "created_at": progress.created_at if progress else step.created_at,
            "updated_at": progress.updated_at if progress else step.updated_at,
        }

        steps_response.append(WorkflowProgressResponse(**step_data))

        if progress and progress.is_completed:
            completed_count += 1

        if progress and progress.is_current:
            current_step = step.step_name
            current_step_order = step.step_order

    total_steps = len(workflow_steps)
    progress_percentage = int((completed_count / total_steps) * 100) if total_steps > 0 else 0

    return ApplicationWorkflowTracker(
        application_id=application_id,
        application_number=application.application_number,
        current_step=current_step,
        current_step_order=current_step_order,
        total_steps=total_steps,
        completed_steps=completed_count,
        progress_percentage=progress_percentage,
        steps=steps_response
    )


@router.post("/applications/{application_id}/workflow/{step_id}/complete")
async def mark_step_complete(
    application_id: int,
    step_id: int,
    notes: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Mark a workflow step as complete for an application (Admin only).
    """
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
        raise HTTPException(status_code=403, detail="Admin access required")

    # Check if progress record exists
    progress = db.query(ApplicationWorkflowProgress).filter(
        ApplicationWorkflowProgress.application_id == application_id,
        ApplicationWorkflowProgress.workflow_step_id == step_id
    ).first()

    if not progress:
        # Create new progress record
        progress = ApplicationWorkflowProgress(
            application_id=application_id,
            workflow_step_id=step_id,
            is_completed=True,
            completed_by=current_user.id,
            notes=notes
        )
        from datetime import datetime
        progress.completed_at = datetime.now()
        db.add(progress)
    else:
        # Update existing record
        progress.is_completed = True
        progress.completed_by = current_user.id
        from datetime import datetime
        progress.completed_at = datetime.now()
        if notes:
            progress.notes = notes

    db.commit()
    db.refresh(progress)

    return {"message": "Step marked as complete", "progress": progress}
