"""
Fee Structures API Routes - Refactored for Parent-Child Architecture

Endpoints for managing fee structures with components.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from decimal import Decimal

from ....core.database import get_db
from ....core.security import get_current_user
from ....models.user import User, UserRole
from ....models.fees import FeeStructure, FeeStructureComponent, FeeType
from ....models.academic import AcademicYear, Class
from ....schemas.fees.fee_structure_new import (
    FeeStructureCreate,
    FeeStructureUpdate,
    FeeStructureResponse,
    FeeStructureListResponse,
    FeeStructureComponentCreate,
    FeeStructureComponentUpdate,
    FeeStructureComponentResponse,
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


# ==================== FEE STRUCTURE ENDPOINTS ====================

@router.get("", response_model=List[FeeStructureListResponse])
async def list_fee_structures(
    academic_year_id: Optional[int] = None,
    class_id: Optional[int] = None,
    is_active: Optional[bool] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List all fee structures with optional filtering

    Returns summary information without full component details.
    Use GET /{id} to get full details with components.

    **Query Parameters:**
    - `academic_year_id`: Filter by academic year
    - `class_id`: Filter by class
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

    if is_active is not None:
        query = query.filter(FeeStructure.is_active == is_active)

    # Apply pagination
    fee_structures = query.offset(skip).limit(limit).all()

    # Build response with related names
    results = []
    for fs in fee_structures:
        fs_dict = {
            "id": fs.id,
            "structure_name": fs.structure_name,
            "structure_code": fs.structure_code,
            "structure_description": fs.structure_description,
            "academic_year_id": fs.academic_year_id,
            "class_id": fs.class_id,
            "total_amount": fs.total_amount,
            "installments": fs.installments,
            "due_date": fs.due_date,
            "is_active": fs.is_active,
            "created_at": fs.created_at,
            "updated_at": fs.updated_at,
            "component_count": len(fs.components) if fs.components else 0,
        }

        # Add related names
        if fs.class_info:
            fs_dict['class_name'] = fs.class_info.class_name
        if fs.academic_year:
            fs_dict['academic_year_name'] = fs.academic_year.year_name

        results.append(fs_dict)

    return results


@router.get("/{fee_structure_id}", response_model=FeeStructureResponse)
async def get_fee_structure(
    fee_structure_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific fee structure by ID with all components

    Returns complete details including all fee components.
    """
    fee_structure = db.query(FeeStructure).filter(
        FeeStructure.id == fee_structure_id
    ).first()

    if not fee_structure:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Fee structure with ID {fee_structure_id} not found"
        )

    # Build response with components
    fs_dict = FeeStructureResponse.model_validate(fee_structure).model_dump()

    # Add related names
    if fee_structure.class_info:
        fs_dict['class_name'] = fee_structure.class_info.class_name
    if fee_structure.academic_year:
        fs_dict['academic_year_name'] = fee_structure.academic_year.year_name

    # Enrich components with fee type names
    enriched_components = []
    for component in fee_structure.components:
        comp_dict = FeeStructureComponentResponse.model_validate(component).model_dump()
        if component.fee_type:
            comp_dict['fee_type_name'] = component.fee_type.type_name
        enriched_components.append(comp_dict)

    fs_dict['components'] = enriched_components

    return fs_dict


@router.post("", response_model=FeeStructureResponse, status_code=status.HTTP_201_CREATED)
async def create_fee_structure(
    fee_structure_data: FeeStructureCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Create a new fee structure with components

    **Permissions:** Admin only

    **Request Body Example:**
    ```json
    {
        "structure_name": "Class 2 Q1 2024-25",
        "structure_code": "CLS2-Q1-2024-25",
        "academic_year_id": 1,
        "class_id": 2,
        "components": [
            {"fee_type_id": 1, "amount": 30000.00, "is_mandatory": true, "display_order": 0},
            {"fee_type_id": 2, "amount": 5000.00, "is_mandatory": true, "display_order": 1}
        ],
        "installments": 4,
        "due_date": "2024-07-15"
    }
    ```
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
    class_obj = db.query(Class).filter(
        Class.id == fee_structure_data.class_id
    ).first()
    if not class_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Class with ID {fee_structure_data.class_id} not found"
        )

    # Check for duplicate structure code
    existing = db.query(FeeStructure).filter(
        FeeStructure.structure_code == fee_structure_data.structure_code
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Fee structure with code '{fee_structure_data.structure_code}' already exists"
        )

    # Validate all fee types exist
    fee_type_ids = [comp.fee_type_id for comp in fee_structure_data.components]
    fee_types = db.query(FeeType).filter(FeeType.id.in_(fee_type_ids)).all()

    if len(fee_types) != len(fee_type_ids):
        found_ids = {ft.id for ft in fee_types}
        missing_ids = set(fee_type_ids) - found_ids
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Fee types with IDs {missing_ids} not found"
        )

    # Calculate total amount from components
    total_amount = sum(Decimal(str(comp.amount)) for comp in fee_structure_data.components)

    # Create fee structure (without components in the model_dump)
    structure_data = fee_structure_data.model_dump(exclude={'components'})
    structure_data['total_amount'] = total_amount

    new_fee_structure = FeeStructure(**structure_data)
    db.add(new_fee_structure)
    db.flush()  # Get the ID for components

    # Create components
    for component_data in fee_structure_data.components:
        component = FeeStructureComponent(
            fee_structure_id=new_fee_structure.id,
            **component_data.model_dump()
        )
        db.add(component)

    db.commit()
    db.refresh(new_fee_structure)

    # Return enriched response
    return await get_fee_structure(new_fee_structure.id, db, current_user)


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

    **Note:** To update components, use the component-specific endpoints.
    This endpoint updates only the structure-level fields.
    """
    # Get existing fee structure
    fee_structure = db.query(FeeStructure).filter(
        FeeStructure.id == fee_structure_id
    ).first()

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

    # Return enriched response
    return await get_fee_structure(fee_structure_id, db, current_user)


@router.delete("/{fee_structure_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_fee_structure(
    fee_structure_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Delete a fee structure

    **Permissions:** Admin only

    **Note:** This will cascade delete all components and fail if the structure
    is referenced by student assignments. Consider deactivating (is_active=False)
    instead of deleting.
    """
    fee_structure = db.query(FeeStructure).filter(
        FeeStructure.id == fee_structure_id
    ).first()

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
            detail=f"Cannot delete fee structure. It may be referenced by student assignments. "
                   f"Consider deactivating instead. Error: {str(e)}"
        )

    return None


# ==================== COMPONENT MANAGEMENT ENDPOINTS ====================

@router.post("/{fee_structure_id}/components", response_model=FeeStructureComponentResponse)
async def add_component_to_structure(
    fee_structure_id: int,
    component_data: FeeStructureComponentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Add a new component to an existing fee structure

    **Permissions:** Admin only

    Automatically recalculates the structure's total_amount.
    """
    # Validate fee structure exists
    fee_structure = db.query(FeeStructure).filter(
        FeeStructure.id == fee_structure_id
    ).first()
    if not fee_structure:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Fee structure with ID {fee_structure_id} not found"
        )

    # Validate fee type exists
    fee_type = db.query(FeeType).filter(
        FeeType.id == component_data.fee_type_id
    ).first()
    if not fee_type:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Fee type with ID {component_data.fee_type_id} not found"
        )

    # Check for duplicate fee type in this structure
    existing = db.query(FeeStructureComponent).filter(
        FeeStructureComponent.fee_structure_id == fee_structure_id,
        FeeStructureComponent.fee_type_id == component_data.fee_type_id
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Component with fee type '{fee_type.type_name}' already exists in this structure"
        )

    # Create new component
    new_component = FeeStructureComponent(
        fee_structure_id=fee_structure_id,
        **component_data.model_dump()
    )
    db.add(new_component)

    # Recalculate total amount
    fee_structure.recalculate_and_update_total()

    db.commit()
    db.refresh(new_component)

    # Build response with fee type name
    comp_dict = FeeStructureComponentResponse.model_validate(new_component).model_dump()
    if new_component.fee_type:
        comp_dict['fee_type_name'] = new_component.fee_type.type_name

    return comp_dict


@router.put("/{fee_structure_id}/components/{component_id}", response_model=FeeStructureComponentResponse)
async def update_component(
    fee_structure_id: int,
    component_id: int,
    component_data: FeeStructureComponentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Update a component in a fee structure

    **Permissions:** Admin only

    Automatically recalculates the structure's total_amount if amount is changed.
    """
    # Get component
    component = db.query(FeeStructureComponent).filter(
        FeeStructureComponent.id == component_id,
        FeeStructureComponent.fee_structure_id == fee_structure_id
    ).first()

    if not component:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Component with ID {component_id} not found in fee structure {fee_structure_id}"
        )

    # Track if amount changed
    amount_changed = False
    update_data = component_data.model_dump(exclude_unset=True)

    if 'amount' in update_data and update_data['amount'] != component.amount:
        amount_changed = True

    # Update component fields
    for field, value in update_data.items():
        setattr(component, field, value)

    # Recalculate total if amount changed
    if amount_changed:
        component.fee_structure.recalculate_and_update_total()

    db.commit()
    db.refresh(component)

    # Build response
    comp_dict = FeeStructureComponentResponse.model_validate(component).model_dump()
    if component.fee_type:
        comp_dict['fee_type_name'] = component.fee_type.type_name

    return comp_dict


@router.delete("/{fee_structure_id}/components/{component_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_component_from_structure(
    fee_structure_id: int,
    component_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Remove a component from a fee structure

    **Permissions:** Admin only

    Automatically recalculates the structure's total_amount.

    **Note:** Cannot remove the last component from a structure.
    A fee structure must have at least one component.
    """
    # Get component
    component = db.query(FeeStructureComponent).filter(
        FeeStructureComponent.id == component_id,
        FeeStructureComponent.fee_structure_id == fee_structure_id
    ).first()

    if not component:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Component with ID {component_id} not found in fee structure {fee_structure_id}"
        )

    # Check if this is the last component
    component_count = db.query(func.count(FeeStructureComponent.id)).filter(
        FeeStructureComponent.fee_structure_id == fee_structure_id
    ).scalar()

    if component_count <= 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot remove the last component. A fee structure must have at least one component."
        )

    # Get fee structure for recalculation
    fee_structure = component.fee_structure

    # Delete component
    db.delete(component)

    # Recalculate total
    fee_structure.recalculate_and_update_total()

    db.commit()

    return None


# ==================== UTILITY ENDPOINTS ====================

@router.get("/{fee_structure_id}/total", response_model=dict)
async def recalculate_structure_total(
    fee_structure_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Recalculate and update the total_amount for a fee structure

    **Permissions:** Admin only

    Useful if components were modified outside the API or to verify calculations.

    Returns the updated total amount.
    """
    fee_structure = db.query(FeeStructure).filter(
        FeeStructure.id == fee_structure_id
    ).first()

    if not fee_structure:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Fee structure with ID {fee_structure_id} not found"
        )

    old_total = float(fee_structure.total_amount)
    fee_structure.recalculate_and_update_total()
    new_total = float(fee_structure.total_amount)

    db.commit()

    return {
        "fee_structure_id": fee_structure_id,
        "old_total": old_total,
        "new_total": new_total,
        "difference": new_total - old_total,
        "component_count": len(fee_structure.components)
    }
