"""
Fee Structure Components API Routes

Endpoints for managing individual fee components within fee structures
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ....core.database import get_db
from ....core.security import get_current_user
from ....models.user import User, UserRole
from ....models.fees import FeeStructure, FeeStructureComponent, FeeType
from ....schemas.fees import (
    FeeStructureComponentCreate,
    FeeStructureComponentUpdate,
    FeeStructureComponentResponse
)

router = APIRouter()


def require_admin(current_user: User = Depends(get_current_user)):
    """Ensure current user is admin"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can manage fee structure components"
        )
    return current_user


@router.get("/{fee_structure_id}/components", response_model=List[FeeStructureComponentResponse])
async def list_components(
    fee_structure_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List all components for a specific fee structure
    """
    # Verify fee structure exists
    fee_structure = db.query(FeeStructure).filter(FeeStructure.id == fee_structure_id).first()
    if not fee_structure:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Fee structure with ID {fee_structure_id} not found"
        )

    components = db.query(FeeStructureComponent).filter(
        FeeStructureComponent.fee_structure_id == fee_structure_id
    ).order_by(FeeStructureComponent.display_order).all()

    # Enrich with fee type names
    results = []
    for component in components:
        comp_dict = FeeStructureComponentResponse.model_validate(component).model_dump()
        if component.fee_type:
            comp_dict['fee_type_name'] = component.fee_type.type_name
        results.append(comp_dict)

    return results


@router.post("/{fee_structure_id}/components", response_model=FeeStructureComponentResponse, status_code=status.HTTP_201_CREATED)
async def create_component(
    fee_structure_id: int,
    component_data: FeeStructureComponentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Add a new component to a fee structure

    **Permissions:** Admin only
    """
    # Verify fee structure exists
    fee_structure = db.query(FeeStructure).filter(FeeStructure.id == fee_structure_id).first()
    if not fee_structure:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Fee structure with ID {fee_structure_id} not found"
        )

    # Verify fee type exists
    fee_type = db.query(FeeType).filter(FeeType.id == component_data.fee_type_id).first()
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
            detail=f"Component for {fee_type.type_name} already exists in this fee structure"
        )

    # Create new component
    new_component = FeeStructureComponent(
        fee_structure_id=fee_structure_id,
        **component_data.model_dump()
    )

    db.add(new_component)

    # Recalculate fee structure total_amount
    fee_structure.recalculate_and_update_total()

    db.commit()
    db.refresh(new_component)

    # Enrich response
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
    Update an existing component

    **Permissions:** Admin only
    """
    # Get existing component
    component = db.query(FeeStructureComponent).filter(
        FeeStructureComponent.id == component_id,
        FeeStructureComponent.fee_structure_id == fee_structure_id
    ).first()

    if not component:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Component with ID {component_id} not found in fee structure {fee_structure_id}"
        )

    # Update fields
    update_data = component_data.model_dump(exclude_unset=True)

    # If fee_type_id is being changed, check for duplicates
    if 'fee_type_id' in update_data and update_data['fee_type_id'] != component.fee_type_id:
        existing = db.query(FeeStructureComponent).filter(
            FeeStructureComponent.fee_structure_id == fee_structure_id,
            FeeStructureComponent.fee_type_id == update_data['fee_type_id'],
            FeeStructureComponent.id != component_id
        ).first()

        if existing:
            fee_type = db.query(FeeType).filter(FeeType.id == update_data['fee_type_id']).first()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Component for {fee_type.type_name} already exists in this fee structure"
            )

    for field, value in update_data.items():
        setattr(component, field, value)

    # Recalculate fee structure total_amount
    fee_structure = component.fee_structure
    fee_structure.recalculate_and_update_total()

    db.commit()
    db.refresh(component)

    # Enrich response
    comp_dict = FeeStructureComponentResponse.model_validate(component).model_dump()
    if component.fee_type:
        comp_dict['fee_type_name'] = component.fee_type.type_name

    return comp_dict


@router.delete("/{fee_structure_id}/components/{component_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_component(
    fee_structure_id: int,
    component_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Delete a component from a fee structure

    **Permissions:** Admin only
    """
    component = db.query(FeeStructureComponent).filter(
        FeeStructureComponent.id == component_id,
        FeeStructureComponent.fee_structure_id == fee_structure_id
    ).first()

    if not component:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Component with ID {component_id} not found in fee structure {fee_structure_id}"
        )

    fee_structure = component.fee_structure

    db.delete(component)

    # Recalculate fee structure total_amount
    fee_structure.recalculate_and_update_total()

    db.commit()

    return None
