"""
FeeStructure and StudentFeeAssignment Pydantic Schemas

Schemas for fee structure management and student fee assignments.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal


# ==================== FEE STRUCTURE COMPONENT SCHEMAS ====================

class FeeStructureComponentBase(BaseModel):
    """Base schema for FeeStructureComponent"""
    fee_type_id: int = Field(..., gt=0, description="Fee type ID")
    amount: Decimal = Field(..., gt=0, description="Component amount in INR")
    is_mandatory: bool = Field(True, description="Whether this component is mandatory")
    display_order: int = Field(0, ge=0, description="Display order for sorting")


class FeeStructureComponentCreate(FeeStructureComponentBase):
    """Schema for creating a new FeeStructureComponent"""
    pass


class FeeStructureComponentUpdate(BaseModel):
    """Schema for updating an existing FeeStructureComponent"""
    fee_type_id: Optional[int] = Field(None, gt=0)
    amount: Optional[Decimal] = Field(None, gt=0)
    is_mandatory: Optional[bool] = None
    display_order: Optional[int] = Field(None, ge=0)


class FeeStructureComponentResponse(FeeStructureComponentBase):
    """Schema for FeeStructureComponent response"""
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
    academic_year_id: int = Field(..., gt=0, description="Academic year ID")
    class_id: int = Field(..., gt=0, description="Class ID")
    fee_type_id: Optional[int] = Field(None, gt=0, description="Fee type ID (legacy, use components instead)")
    amount: Optional[Decimal] = Field(None, gt=0, description="Fee amount in INR (legacy, use total_amount instead)")
    total_amount: Optional[Decimal] = Field(None, ge=0, description="Total amount from all components")
    structure_name: Optional[str] = Field(None, max_length=200, description="Human-readable structure name")
    structure_code: Optional[str] = Field(None, max_length=50, description="Unique structure code")
    structure_description: Optional[str] = Field(None, description="Structure description")
    installments_allowed: int = Field(1, ge=1, le=12, description="Number of installments allowed")
    due_day_of_month: Optional[int] = Field(None, ge=1, le=31, description="Day of month for payment (e.g., 10 for 10th)")
    due_date_fixed: Optional[date] = Field(None, description="Fixed due date (if not recurring)")
    late_fee_applicable: bool = Field(True, description="Whether late fees apply")
    late_fee_percentage: Decimal = Field(Decimal("2.00"), ge=0, le=100, description="Late fee % per month")
    late_fee_amount: Optional[Decimal] = Field(None, ge=0, description="Fixed late fee amount")
    late_fee_grace_period_days: int = Field(7, ge=0, description="Grace period before late fees apply")
    sibling_discount_applicable: bool = Field(True, description="Whether sibling discount applies")
    early_payment_discount_percentage: Optional[Decimal] = Field(None, ge=0, le=100, description="Early payment discount %")
    early_payment_discount_days: Optional[int] = Field(None, ge=0, description="Days before due date for early discount")
    is_active: bool = Field(True, description="Whether this fee structure is active")


class FeeStructureCreate(FeeStructureBase):
    """Schema for creating a new FeeStructure"""
    pass


class FeeStructureUpdate(BaseModel):
    """Schema for updating an existing FeeStructure"""
    amount: Optional[Decimal] = Field(None, gt=0)
    total_amount: Optional[Decimal] = Field(None, ge=0)  # Added for refactored structures
    structure_name: Optional[str] = Field(None, max_length=200)  # Added for refactored structures
    structure_code: Optional[str] = Field(None, max_length=50)  # Added for refactored structures
    structure_description: Optional[str] = None  # Added for refactored structures
    installments_allowed: Optional[int] = Field(None, ge=1, le=12)
    due_day_of_month: Optional[int] = Field(None, ge=1, le=31)
    due_date_fixed: Optional[date] = None
    late_fee_applicable: Optional[bool] = None
    late_fee_percentage: Optional[Decimal] = Field(None, ge=0, le=100)
    late_fee_amount: Optional[Decimal] = Field(None, ge=0)
    late_fee_grace_period_days: Optional[int] = Field(None, ge=0)
    sibling_discount_applicable: Optional[bool] = None
    early_payment_discount_percentage: Optional[Decimal] = Field(None, ge=0, le=100)
    early_payment_discount_days: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None


class FeeStructureResponse(FeeStructureBase):
    """Schema for FeeStructure response"""
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    # Related entity names for display
    fee_type_name: Optional[str] = Field(None, description="Fee type name for display")
    class_name: Optional[str] = Field(None, description="Class name for display")
    academic_year_name: Optional[str] = Field(None, description="Academic year name for display")

    # Components (for refactored structures)
    components: Optional[List['FeeStructureComponentResponse']] = Field(None, description="Fee structure components")

    class Config:
        from_attributes = True


# ==================== STUDENT FEE ASSIGNMENT SCHEMAS ====================

class StudentFeeAssignmentBase(BaseModel):
    """Base schema for StudentFeeAssignment"""
    student_id: int = Field(..., gt=0, description="Student ID")
    fee_structure_id: int = Field(..., gt=0, description="Fee structure ID")
    custom_amount: Optional[Decimal] = Field(None, gt=0, description="Custom amount (overrides structure amount)")
    discount_percentage: Decimal = Field(Decimal("0.00"), ge=0, le=100, description="Discount percentage")
    discount_amount: Optional[Decimal] = Field(None, ge=0, description="Fixed discount amount")
    discount_reason: Optional[str] = Field(None, max_length=200, description="Reason for discount")
    custom_due_date: Optional[date] = Field(None, description="Custom due date for this student")
    is_waived: bool = Field(False, description="Whether fee is completely waived")
    waiver_percentage: Decimal = Field(Decimal("0.00"), ge=0, le=100, description="Waiver percentage")
    waiver_reason: Optional[str] = Field(None, description="Reason for waiver (scholarship, etc.)")
    is_active: bool = Field(True, description="Whether this assignment is active")
    remarks: Optional[str] = Field(None, description="Additional remarks")


class StudentFeeAssignmentCreate(StudentFeeAssignmentBase):
    """Schema for creating a new StudentFeeAssignment"""
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
    """Schema for StudentFeeAssignment response"""
    id: int
    waived_by: Optional[int] = None
    waived_at: Optional[datetime] = None
    assigned_by: Optional[int] = None
    assigned_at: datetime

    # Computed field
    final_amount: Optional[Decimal] = Field(None, description="Final amount after discounts and waivers")

    class Config:
        from_attributes = True
