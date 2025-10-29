"""
Fee Structure Pydantic Schemas - Refactored for Parent-Child Architecture

Schemas for the new fee structure design with components.
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal


# ==================== FEE STRUCTURE COMPONENT SCHEMAS ====================

class FeeStructureComponentBase(BaseModel):
    """Base schema for FeeStructureComponent"""
    fee_type_id: int = Field(..., gt=0, description="Fee type ID")
    amount: Decimal = Field(..., gt=0, description="Amount for this component in INR")
    is_mandatory: bool = Field(True, description="Whether this component is mandatory")
    display_order: int = Field(0, ge=0, description="Display order in UI (0-based)")


class FeeStructureComponentCreate(FeeStructureComponentBase):
    """
    Schema for creating a new FeeStructureComponent

    Example:
        {
            "fee_type_id": 1,
            "amount": 30000.00,
            "is_mandatory": true,
            "display_order": 0
        }
    """
    pass


class FeeStructureComponentUpdate(BaseModel):
    """Schema for updating an existing FeeStructureComponent"""
    amount: Optional[Decimal] = Field(None, gt=0)
    is_mandatory: Optional[bool] = None
    display_order: Optional[int] = Field(None, ge=0)


class FeeStructureComponentResponse(FeeStructureComponentBase):
    """
    Schema for FeeStructureComponent response

    Includes the ID and related entity names for display
    """
    id: int
    fee_structure_id: int
    created_at: datetime

    # Related entity names for display
    fee_type_name: Optional[str] = Field(None, description="Fee type name for display")

    class Config:
        from_attributes = True


# ==================== FEE STRUCTURE SCHEMAS ====================

class FeeStructureBase(BaseModel):
    """Base schema for FeeStructure"""
    structure_name: str = Field(..., min_length=1, max_length=200, description="Fee structure name")
    structure_code: str = Field(..., min_length=1, max_length=50, description="Unique structure code")
    structure_description: Optional[str] = Field(None, description="Detailed description")

    academic_year_id: int = Field(..., gt=0, description="Academic year ID")
    class_id: int = Field(..., gt=0, description="Class ID")

    installments: int = Field(1, ge=1, le=12, description="Number of installments")
    due_date: Optional[date] = Field(None, description="Due date for payment")

    # Late fee configuration
    late_fee_applicable: bool = Field(True, description="Whether late fees apply")
    late_fee_amount: Decimal = Field(Decimal("0.00"), ge=0, description="Fixed late fee amount")
    late_fee_percentage: Decimal = Field(Decimal("2.00"), ge=0, le=100, description="Late fee % per month")
    grace_period_days: int = Field(7, ge=0, description="Grace period before late fees apply")

    # Discount configuration
    sibling_discount_applicable: bool = Field(True, description="Whether sibling discount applies")
    early_payment_discount_applicable: bool = Field(False, description="Whether early payment discount applies")
    early_payment_discount_percentage: Decimal = Field(Decimal("0.00"), ge=0, le=100, description="Early payment discount %")
    early_payment_days: int = Field(15, ge=0, description="Days before due date for early discount")

    is_active: bool = Field(True, description="Whether this fee structure is active")
    remarks: Optional[str] = Field(None, description="Additional remarks")


class FeeStructureCreate(FeeStructureBase):
    """
    Schema for creating a new FeeStructure with components

    Example:
        {
            "structure_name": "Class 2 Q1 2024-25",
            "structure_code": "CLS2-Q1-2024-25",
            "academic_year_id": 1,
            "class_id": 2,
            "components": [
                {"fee_type_id": 1, "amount": 30000.00, "is_mandatory": true, "display_order": 0},
                {"fee_type_id": 2, "amount": 5000.00, "is_mandatory": true, "display_order": 1},
                {"fee_type_id": 3, "amount": 3000.00, "is_mandatory": true, "display_order": 2}
            ],
            "installments": 4,
            "due_date": "2024-07-15"
        }
    """
    components: List[FeeStructureComponentCreate] = Field(
        ...,
        min_length=1,
        description="List of fee components (at least one required)"
    )

    @field_validator('components')
    @classmethod
    def validate_components(cls, v):
        """Ensure at least one component is provided"""
        if not v or len(v) == 0:
            raise ValueError("At least one fee component is required")
        return v


class FeeStructureUpdate(BaseModel):
    """
    Schema for updating an existing FeeStructure

    Note: To update components, use the separate component endpoints
    """
    structure_name: Optional[str] = Field(None, min_length=1, max_length=200)
    structure_description: Optional[str] = None

    installments: Optional[int] = Field(None, ge=1, le=12)
    due_date: Optional[date] = None

    late_fee_applicable: Optional[bool] = None
    late_fee_amount: Optional[Decimal] = Field(None, ge=0)
    late_fee_percentage: Optional[Decimal] = Field(None, ge=0, le=100)
    grace_period_days: Optional[int] = Field(None, ge=0)

    sibling_discount_applicable: Optional[bool] = None
    early_payment_discount_applicable: Optional[bool] = None
    early_payment_discount_percentage: Optional[Decimal] = Field(None, ge=0, le=100)
    early_payment_days: Optional[int] = Field(None, ge=0)

    is_active: Optional[bool] = None
    remarks: Optional[str] = None


class FeeStructureResponse(FeeStructureBase):
    """
    Schema for FeeStructure response with components

    Includes all components and calculated total amount
    """
    id: int
    total_amount: Decimal
    created_at: datetime
    updated_at: Optional[datetime] = None

    # Components (populated from relationship)
    components: List[FeeStructureComponentResponse] = Field(default_factory=list)

    # Related entity names for display
    class_name: Optional[str] = Field(None, description="Class name for display")
    academic_year_name: Optional[str] = Field(None, description="Academic year name for display")

    class Config:
        from_attributes = True


class FeeStructureListResponse(BaseModel):
    """
    Schema for FeeStructure list response (summary without components)

    Used for list views where full component details aren't needed
    """
    id: int
    structure_name: str
    structure_code: str
    structure_description: Optional[str] = None

    academic_year_id: int
    class_id: int

    total_amount: Decimal
    installments: int
    due_date: Optional[date] = None

    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    # Related entity names
    class_name: Optional[str] = None
    academic_year_name: Optional[str] = None

    # Summary info
    component_count: Optional[int] = Field(None, description="Number of fee components")

    class Config:
        from_attributes = True


# ==================== STUDENT FEE ASSIGNMENT SCHEMAS (Updated) ====================

class StudentFeeAssignmentBase(BaseModel):
    """Base schema for StudentFeeAssignment"""
    student_id: int = Field(..., gt=0, description="Student ID")
    fee_structure_id: int = Field(..., gt=0, description="Fee structure ID")

    custom_amount: Optional[Decimal] = Field(None, gt=0, description="Custom amount (overrides structure total)")
    discount_percentage: Decimal = Field(Decimal("0.00"), ge=0, le=100, description="Discount percentage")
    discount_amount: Decimal = Field(Decimal("0.00"), ge=0, description="Fixed discount amount")
    discount_reason: Optional[str] = Field(None, max_length=200, description="Reason for discount")

    custom_due_date: Optional[date] = Field(None, description="Custom due date for this student")

    is_waived: bool = Field(False, description="Whether fee is waived")
    waiver_percentage: Decimal = Field(Decimal("0.00"), ge=0, le=100, description="Waiver percentage")
    waiver_reason: Optional[str] = Field(None, description="Reason for waiver")

    is_active: bool = Field(True, description="Whether this assignment is active")
    remarks: Optional[str] = Field(None, description="Additional remarks")


class StudentFeeAssignmentCreate(StudentFeeAssignmentBase):
    """
    Schema for creating a new StudentFeeAssignment

    Example:
        {
            "student_id": 123,
            "fee_structure_id": 1,
            "discount_percentage": 10.00,
            "discount_reason": "Sibling discount"
        }
    """
    pass


class StudentFeeAssignmentUpdate(BaseModel):
    """Schema for updating an existing StudentFeeAssignment"""
    custom_amount: Optional[Decimal] = Field(None, gt=0)
    discount_percentage: Optional[Decimal] = Field(None, ge=0, le=100)
    discount_amount: Optional[Decimal] = Field(None, ge=0)
    discount_reason: Optional[str] = Field(None, max_length=200)
    custom_due_date: Optional[date] = None

    is_waived: Optional[bool] = None
    waiver_percentage: Optional[Decimal] = Field(None, ge=0, le=100)
    waiver_reason: Optional[str] = None

    is_active: Optional[bool] = None
    remarks: Optional[str] = None


class StudentFeeAssignmentResponse(StudentFeeAssignmentBase):
    """
    Schema for StudentFeeAssignment response

    Includes calculated final amount and audit trail
    """
    id: int

    waived_by: Optional[int] = None
    waived_at: Optional[datetime] = None
    assigned_by: int
    assigned_at: datetime

    # Computed field
    final_amount: Decimal = Field(..., description="Final amount after discounts and waivers")

    # Related entity names
    student_name: Optional[str] = Field(None, description="Student name for display")
    fee_structure_name: Optional[str] = Field(None, description="Fee structure name for display")

    class Config:
        from_attributes = True


# ==================== BULK OPERATIONS ====================

class BulkFeeStructureAssignment(BaseModel):
    """
    Schema for bulk assigning fee structure to multiple students

    Example:
        {
            "fee_structure_id": 1,
            "student_ids": [101, 102, 103, 104],
            "apply_sibling_discount": true,
            "sibling_discount_percentage": 10.00
        }
    """
    fee_structure_id: int = Field(..., gt=0, description="Fee structure to assign")
    student_ids: List[int] = Field(..., min_length=1, description="List of student IDs")

    apply_sibling_discount: bool = Field(False, description="Auto-apply sibling discount")
    sibling_discount_percentage: Decimal = Field(Decimal("0.00"), ge=0, le=100, description="Sibling discount %")

    remarks: Optional[str] = Field(None, description="Assignment remarks")


class BulkAssignmentResponse(BaseModel):
    """Response for bulk assignment operations"""
    total_requested: int = Field(..., description="Total assignments requested")
    successful: int = Field(..., description="Successful assignments")
    failed: int = Field(..., description="Failed assignments")

    assignments: List[StudentFeeAssignmentResponse] = Field(default_factory=list)
    errors: List[str] = Field(default_factory=list, description="Error messages for failed assignments")
