"""
Fee Types API Routes

Endpoints for managing fee type definitions (Tuition, Exam, Library, etc.)
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ....core.database import get_db
from ....core.security import get_current_user
from ....models.user import User, UserRole
from ....models.fees import FeeType
from ....schemas.fees import (
    FeeTypeCreate,
    FeeTypeUpdate,
    FeeTypeResponse
)

router = APIRouter()


def require_admin(current_user: User = Depends(get_current_user)):
    """Ensure current user is admin"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can manage fee types"
        )
    return current_user


@router.get("", response_model=List[FeeTypeResponse])
async def list_fee_types(
    is_active: Optional[bool] = None,
    frequency: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List all fee types with optional filtering

    **Query Parameters:**
    - `is_active`: Filter by active status
    - `frequency`: Filter by frequency (one_time, monthly, quarterly, annual, etc.)
    - `skip`: Number of records to skip (pagination)
    - `limit`: Maximum records to return (max 100)
    """
    query = db.query(FeeType)

    # Apply filters
    if is_active is not None:
        query = query.filter(FeeType.is_active == is_active)

    if frequency:
        query = query.filter(FeeType.frequency == frequency)

    # Order by display_order and name
    query = query.order_by(FeeType.display_order, FeeType.type_name)

    # Apply pagination
    fee_types = query.offset(skip).limit(limit).all()

    return fee_types


@router.get("/{fee_type_id}", response_model=FeeTypeResponse)
async def get_fee_type(
    fee_type_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific fee type by ID
    """
    fee_type = db.query(FeeType).filter(FeeType.id == fee_type_id).first()

    if not fee_type:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Fee type with ID {fee_type_id} not found"
        )

    return fee_type


@router.post("", response_model=FeeTypeResponse, status_code=status.HTTP_201_CREATED)
async def create_fee_type(
    fee_type_data: FeeTypeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Create a new fee type

    **Permissions:** Admin only
    """
    # Check if code already exists
    existing_code = db.query(FeeType).filter(FeeType.code == fee_type_data.code).first()
    if existing_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Fee type with code '{fee_type_data.code}' already exists"
        )

    # Check if type_name already exists
    existing_name = db.query(FeeType).filter(FeeType.type_name == fee_type_data.type_name).first()
    if existing_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Fee type with name '{fee_type_data.type_name}' already exists"
        )

    # Create new fee type
    new_fee_type = FeeType(**fee_type_data.model_dump())

    db.add(new_fee_type)
    db.commit()
    db.refresh(new_fee_type)

    return new_fee_type


@router.put("/{fee_type_id}", response_model=FeeTypeResponse)
async def update_fee_type(
    fee_type_id: int,
    fee_type_data: FeeTypeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Update an existing fee type

    **Permissions:** Admin only
    """
    # Get existing fee type
    fee_type = db.query(FeeType).filter(FeeType.id == fee_type_id).first()

    if not fee_type:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Fee type with ID {fee_type_id} not found"
        )

    # Check for duplicate code if code is being updated
    if fee_type_data.code and fee_type_data.code != fee_type.code:
        existing_code = db.query(FeeType).filter(
            FeeType.code == fee_type_data.code,
            FeeType.id != fee_type_id
        ).first()
        if existing_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Fee type with code '{fee_type_data.code}' already exists"
            )

    # Check for duplicate type_name if name is being updated
    if fee_type_data.type_name and fee_type_data.type_name != fee_type.type_name:
        existing_name = db.query(FeeType).filter(
            FeeType.type_name == fee_type_data.type_name,
            FeeType.id != fee_type_id
        ).first()
        if existing_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Fee type with name '{fee_type_data.type_name}' already exists"
            )

    # Update fields
    update_data = fee_type_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(fee_type, field, value)

    db.commit()
    db.refresh(fee_type)

    return fee_type


@router.delete("/{fee_type_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_fee_type(
    fee_type_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Delete a fee type

    **Permissions:** Admin only

    **Note:** This will fail if the fee type is referenced by any fee structures.
    Consider deactivating (is_active=False) instead of deleting.
    """
    fee_type = db.query(FeeType).filter(FeeType.id == fee_type_id).first()

    if not fee_type:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Fee type with ID {fee_type_id} not found"
        )

    try:
        db.delete(fee_type)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete fee type. It may be referenced by existing fee structures. Consider deactivating instead. Error: {str(e)}"
        )

    return None
