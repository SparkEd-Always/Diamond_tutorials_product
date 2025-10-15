"""
Fee Structures API Routes

Endpoints for managing class-wise fee configurations
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ....core.database import get_db
from ....core.security import get_current_user
from ....models.user import User, UserRole
from ....models.fees import FeeStructure, FeeType
from ....models.academic import AcademicYear, Class
from ....schemas.fees import (
    FeeStructureCreate,
    FeeStructureUpdate,
    FeeStructureResponse
)

router = APIRouter()


def require_admin(current_user: User = Depends(get_current_user)):
    """Ensure current user is admin"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can manage fee structures"
        )
    return current_user


@router.get("", response_model=List[FeeStructureResponse])
async def list_fee_structures(
    academic_year_id: Optional[int] = None,
    class_id: Optional[int] = None,
    fee_type_id: Optional[int] = None,
    is_active: Optional[bool] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List all fee structures with optional filtering

    **Query Parameters:**
    - `academic_year_id`: Filter by academic year
    - `class_id`: Filter by class
    - `fee_type_id`: Filter by fee type
    - `is_active`: Filter by active status
    - `skip`: Number of records to skip (pagination)
    - `limit`: Maximum records to return (max 100)
    """
    query = db.query(FeeStructure)

    # Apply filters
    if academic_year_id:
        query = query.filter(FeeStructure.academic_year_id == academic_year_id)

    if class_id:
        query = query.filter(FeeStructure.class_id == class_id)

    if fee_type_id:
        query = query.filter(FeeStructure.fee_type_id == fee_type_id)

    if is_active is not None:
        query = query.filter(FeeStructure.is_active == is_active)

    # Apply pagination
    fee_structures = query.offset(skip).limit(limit).all()

    return fee_structures


@router.get("/{fee_structure_id}", response_model=FeeStructureResponse)
async def get_fee_structure(
    fee_structure_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific fee structure by ID
    """
    fee_structure = db.query(FeeStructure).filter(FeeStructure.id == fee_structure_id).first()

    if not fee_structure:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Fee structure with ID {fee_structure_id} not found"
        )

    return fee_structure


@router.post("", response_model=FeeStructureResponse, status_code=status.HTTP_201_CREATED)
async def create_fee_structure(
    fee_structure_data: FeeStructureCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Create a new fee structure

    **Permissions:** Admin only
    """
    # Validate academic year exists
    academic_year = db.query(AcademicYear).filter(
        AcademicYear.id == fee_structure_data.academic_year_id
    ).first()
    if not academic_year:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Academic year with ID {fee_structure_data.academic_year_id} not found"
        )

    # Validate class exists
    class_obj = db.query(Class).filter(Class.id == fee_structure_data.class_id).first()
    if not class_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Class with ID {fee_structure_data.class_id} not found"
        )

    # Validate fee type exists
    fee_type = db.query(FeeType).filter(FeeType.id == fee_structure_data.fee_type_id).first()
    if not fee_type:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Fee type with ID {fee_structure_data.fee_type_id} not found"
        )

    # Check for duplicate (same year + class + fee type)
    existing = db.query(FeeStructure).filter(
        FeeStructure.academic_year_id == fee_structure_data.academic_year_id,
        FeeStructure.class_id == fee_structure_data.class_id,
        FeeStructure.fee_type_id == fee_structure_data.fee_type_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Fee structure already exists for {class_obj.class_name} - {fee_type.type_name} in {academic_year.year_name}"
        )

    # Create new fee structure
    new_fee_structure = FeeStructure(**fee_structure_data.model_dump())

    db.add(new_fee_structure)
    db.commit()
    db.refresh(new_fee_structure)

    return new_fee_structure


@router.put("/{fee_structure_id}", response_model=FeeStructureResponse)
async def update_fee_structure(
    fee_structure_id: int,
    fee_structure_data: FeeStructureUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Update an existing fee structure

    **Permissions:** Admin only
    """
    # Get existing fee structure
    fee_structure = db.query(FeeStructure).filter(FeeStructure.id == fee_structure_id).first()

    if not fee_structure:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Fee structure with ID {fee_structure_id} not found"
        )

    # Update fields
    update_data = fee_structure_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(fee_structure, field, value)

    db.commit()
    db.refresh(fee_structure)

    return fee_structure


@router.delete("/{fee_structure_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_fee_structure(
    fee_structure_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Delete a fee structure

    **Permissions:** Admin only

    **Note:** This will fail if the structure is referenced by student assignments.
    Consider deactivating (is_active=False) instead of deleting.
    """
    fee_structure = db.query(FeeStructure).filter(FeeStructure.id == fee_structure_id).first()

    if not fee_structure:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Fee structure with ID {fee_structure_id} not found"
        )

    try:
        db.delete(fee_structure)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete fee structure. It may be referenced by student assignments. Consider deactivating instead. Error: {str(e)}"
        )

    return None


@router.post("/bulk", response_model=List[FeeStructureResponse], status_code=status.HTTP_201_CREATED)
async def bulk_create_fee_structures(
    fee_structures_data: List[FeeStructureCreate],
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Bulk create fee structures for multiple classes

    **Permissions:** Admin only

    **Use case:** Creating the same fee type across all classes with different amounts
    """
    created_structures = []
    errors = []

    for idx, fee_data in enumerate(fee_structures_data):
        try:
            # Validate references
            academic_year = db.query(AcademicYear).filter(
                AcademicYear.id == fee_data.academic_year_id
            ).first()
            if not academic_year:
                errors.append(f"Item {idx}: Academic year {fee_data.academic_year_id} not found")
                continue

            class_obj = db.query(Class).filter(Class.id == fee_data.class_id).first()
            if not class_obj:
                errors.append(f"Item {idx}: Class {fee_data.class_id} not found")
                continue

            fee_type = db.query(FeeType).filter(FeeType.id == fee_data.fee_type_id).first()
            if not fee_type:
                errors.append(f"Item {idx}: Fee type {fee_data.fee_type_id} not found")
                continue

            # Check for duplicates
            existing = db.query(FeeStructure).filter(
                FeeStructure.academic_year_id == fee_data.academic_year_id,
                FeeStructure.class_id == fee_data.class_id,
                FeeStructure.fee_type_id == fee_data.fee_type_id
            ).first()

            if existing:
                errors.append(f"Item {idx}: Fee structure already exists for {class_obj.class_name} - {fee_type.type_name}")
                continue

            # Create new structure
            new_structure = FeeStructure(**fee_data.model_dump())
            db.add(new_structure)
            created_structures.append(new_structure)

        except Exception as e:
            errors.append(f"Item {idx}: {str(e)}")

    # Commit all successful creates
    if created_structures:
        try:
            db.commit()
            for structure in created_structures:
                db.refresh(structure)
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error during bulk create: {str(e)}"
            )

    # If there were errors, include them in response
    if errors:
        # Still return created structures, but also include error details
        response_message = {
            "created_count": len(created_structures),
            "error_count": len(errors),
            "errors": errors,
            "created_structures": created_structures
        }
        # For now, just return created structures (could enhance to return full details)

    return created_structures
