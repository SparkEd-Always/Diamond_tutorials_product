"""
Student Fee Assignments API Routes

Endpoints for managing student-specific fee assignments with custom amounts and discounts
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from decimal import Decimal
from ....core.database import get_db
from ....core.security import get_current_user
from ....models.user import User, UserRole
from ....models.fees import StudentFeeAssignment, FeeStructure
from ....models.student import Student
from ....schemas.fees import (
    StudentFeeAssignmentCreate,
    StudentFeeAssignmentUpdate,
    StudentFeeAssignmentResponse
)

router = APIRouter()


def require_admin(current_user: User = Depends(get_current_user)):
    """Ensure current user is admin"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can manage student fee assignments"
        )
    return current_user


@router.get("", response_model=List[StudentFeeAssignmentResponse])
async def list_assignments(
    student_id: Optional[int] = None,
    fee_structure_id: Optional[int] = None,
    is_active: Optional[bool] = None,
    is_waived: Optional[bool] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List all student fee assignments with optional filtering

    **Query Parameters:**
    - `student_id`: Filter by student
    - `fee_structure_id`: Filter by fee structure
    - `is_active`: Filter by active status
    - `is_waived`: Filter by waived status
    - `skip`: Number of records to skip (pagination)
    - `limit`: Maximum records to return (max 100)
    """
    query = db.query(StudentFeeAssignment)

    # Apply filters
    if student_id:
        query = query.filter(StudentFeeAssignment.student_id == student_id)

    if fee_structure_id:
        query = query.filter(StudentFeeAssignment.fee_structure_id == fee_structure_id)

    if is_active is not None:
        query = query.filter(StudentFeeAssignment.is_active == is_active)

    if is_waived is not None:
        query = query.filter(StudentFeeAssignment.is_waived == is_waived)

    # Apply pagination
    assignments = query.offset(skip).limit(limit).all()

    # Calculate final_amount for each assignment
    for assignment in assignments:
        # Load the fee_structure relationship
        db.refresh(assignment, ["fee_structure"])

        if assignment.fee_structure:
            # Calculate final amount
            base_amount = float(assignment.custom_amount or assignment.fee_structure.amount)

            # Apply discount
            if assignment.discount_percentage > 0:
                base_amount -= base_amount * (float(assignment.discount_percentage) / 100)

            if assignment.discount_amount:
                base_amount -= float(assignment.discount_amount)

            # Apply waiver
            if assignment.is_waived:
                if assignment.waiver_percentage > 0:
                    base_amount -= base_amount * (float(assignment.waiver_percentage) / 100)

            assignment.final_amount = Decimal(str(round(base_amount, 2)))

    return assignments


@router.get("/{assignment_id}", response_model=StudentFeeAssignmentResponse)
async def get_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific student fee assignment by ID
    """
    assignment = db.query(StudentFeeAssignment).filter(
        StudentFeeAssignment.id == assignment_id
    ).first()

    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Assignment with ID {assignment_id} not found"
        )

    # Calculate final amount
    db.refresh(assignment, ["fee_structure"])

    if assignment.fee_structure:
        base_amount = float(assignment.custom_amount or assignment.fee_structure.amount)

        if assignment.discount_percentage > 0:
            base_amount -= base_amount * (float(assignment.discount_percentage) / 100)

        if assignment.discount_amount:
            base_amount -= float(assignment.discount_amount)

        if assignment.is_waived and assignment.waiver_percentage > 0:
            base_amount -= base_amount * (float(assignment.waiver_percentage) / 100)

        assignment.final_amount = Decimal(str(round(base_amount, 2)))

    return assignment


@router.post("", response_model=StudentFeeAssignmentResponse, status_code=status.HTTP_201_CREATED)
async def create_assignment(
    assignment_data: StudentFeeAssignmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Assign a fee to a student with optional custom amount/discounts

    **Permissions:** Admin only
    """
    # Validate student exists
    student = db.query(Student).filter(Student.id == assignment_data.student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with ID {assignment_data.student_id} not found"
        )

    # Validate fee structure exists
    fee_structure = db.query(FeeStructure).filter(
        FeeStructure.id == assignment_data.fee_structure_id
    ).first()
    if not fee_structure:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Fee structure with ID {assignment_data.fee_structure_id} not found"
        )

    # Check for duplicate assignment
    existing = db.query(StudentFeeAssignment).filter(
        StudentFeeAssignment.student_id == assignment_data.student_id,
        StudentFeeAssignment.fee_structure_id == assignment_data.fee_structure_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Fee already assigned to this student. Use PUT to update existing assignment."
        )

    # Create new assignment
    new_assignment = StudentFeeAssignment(
        **assignment_data.model_dump(),
        assigned_by=current_user.id
    )

    db.add(new_assignment)
    db.commit()
    db.refresh(new_assignment)

    # Calculate and set final amount
    db.refresh(new_assignment, ["fee_structure"])
    base_amount = float(new_assignment.custom_amount or new_assignment.fee_structure.amount)

    if new_assignment.discount_percentage > 0:
        base_amount -= base_amount * (float(new_assignment.discount_percentage) / 100)

    if new_assignment.discount_amount:
        base_amount -= float(new_assignment.discount_amount)

    if new_assignment.is_waived and new_assignment.waiver_percentage > 0:
        base_amount -= base_amount * (float(new_assignment.waiver_percentage) / 100)

    new_assignment.final_amount = Decimal(str(round(base_amount, 2)))

    return new_assignment


@router.put("/{assignment_id}", response_model=StudentFeeAssignmentResponse)
async def update_assignment(
    assignment_id: int,
    assignment_data: StudentFeeAssignmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Update an existing student fee assignment

    **Permissions:** Admin only
    """
    # Get existing assignment
    assignment = db.query(StudentFeeAssignment).filter(
        StudentFeeAssignment.id == assignment_id
    ).first()

    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Assignment with ID {assignment_id} not found"
        )

    # If waiver is being applied/updated, track who did it
    if assignment_data.is_waived is not None and assignment_data.is_waived:
        assignment.waived_by = current_user.id
        from datetime import datetime
        assignment.waived_at = datetime.utcnow()

    # Update fields
    update_data = assignment_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(assignment, field, value)

    db.commit()
    db.refresh(assignment)

    # Calculate final amount
    db.refresh(assignment, ["fee_structure"])
    base_amount = float(assignment.custom_amount or assignment.fee_structure.amount)

    if assignment.discount_percentage > 0:
        base_amount -= base_amount * (float(assignment.discount_percentage) / 100)

    if assignment.discount_amount:
        base_amount -= float(assignment.discount_amount)

    if assignment.is_waived and assignment.waiver_percentage > 0:
        base_amount -= base_amount * (float(assignment.waiver_percentage) / 100)

    assignment.final_amount = Decimal(str(round(base_amount, 2)))

    return assignment


@router.delete("/{assignment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Delete a student fee assignment

    **Permissions:** Admin only

    **Note:** This will fail if the assignment is referenced by invoices.
    Consider deactivating (is_active=False) instead of deleting.
    """
    assignment = db.query(StudentFeeAssignment).filter(
        StudentFeeAssignment.id == assignment_id
    ).first()

    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Assignment with ID {assignment_id} not found"
        )

    try:
        db.delete(assignment)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete assignment. It may be referenced by invoices. Consider deactivating instead. Error: {str(e)}"
        )

    return None
