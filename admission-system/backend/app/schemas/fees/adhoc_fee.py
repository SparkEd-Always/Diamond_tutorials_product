"""
Adhoc Fee Assignment Schemas
Pydantic models for API requests/responses
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import date, datetime
from decimal import Decimal


# Base Schemas
class AdhocFeeBase(BaseModel):
    """Base schema for adhoc fee assignment"""
    fee_name: str = Field(..., min_length=3, max_length=200, description="Name of the fee")
    description: Optional[str] = Field(None, description="Detailed description of the fee")
    amount: Decimal = Field(..., gt=0, description="Fee amount (must be positive)")
    assigned_date: date = Field(..., description="Date when fee is assigned")
    due_date: date = Field(..., description="Payment due date")
    remarks: Optional[str] = Field(None, description="Admin remarks")

    @field_validator('due_date')
    @classmethod
    def validate_due_date(cls, v, info):
        """Ensure due date is after assigned date"""
        if 'assigned_date' in info.data and v < info.data['assigned_date']:
            raise ValueError('due_date must be on or after assigned_date')
        return v


class AdhocFeeCreate(AdhocFeeBase):
    """Schema for creating adhoc fee assignments (bulk)"""
    student_ids: List[int] = Field(..., min_length=1, description="List of student IDs to assign this fee")

    @field_validator('student_ids')
    @classmethod
    def validate_student_ids(cls, v):
        """Ensure all student IDs are positive integers"""
        if not all(sid > 0 for sid in v):
            raise ValueError('All student IDs must be positive integers')
        return v


class AdhocFeeSingleCreate(AdhocFeeBase):
    """Schema for creating a single adhoc fee assignment"""
    student_id: int = Field(..., gt=0, description="Student ID")


class AdhocFeeUpdate(BaseModel):
    """Schema for updating adhoc fee assignment"""
    fee_name: Optional[str] = Field(None, min_length=3, max_length=200)
    description: Optional[str] = None
    amount: Optional[Decimal] = Field(None, gt=0)
    assigned_date: Optional[date] = None
    due_date: Optional[date] = None
    remarks: Optional[str] = None


class AdhocFeeResponse(BaseModel):
    """Schema for adhoc fee assignment response"""
    id: int
    fee_name: str
    description: Optional[str] = None
    amount: Decimal
    assigned_date: date
    due_date: date
    student_id: int
    paid_amount: Decimal
    outstanding_amount: Decimal
    payment_status: str
    is_paid: bool
    paid_at: Optional[datetime] = None
    assigned_by: int
    assigned_at: datetime
    remarks: Optional[str] = None
    is_active: bool

    # Populated from relationships (optional)
    student_name: Optional[str] = None
    student_admission_number: Optional[str] = None
    assigned_by_name: Optional[str] = None

    class Config:
        from_attributes = True


class AdhocFeeListResponse(BaseModel):
    """Schema for adhoc fee list item (lighter weight)"""
    id: int
    fee_name: str
    amount: Decimal
    assigned_date: date
    due_date: date
    student_id: int
    student_name: str
    student_admission_number: str
    paid_amount: Decimal
    outstanding_amount: Decimal
    payment_status: str
    is_paid: bool
    assigned_at: datetime

    class Config:
        from_attributes = True


class AdhocFeeDetailResponse(AdhocFeeResponse):
    """Detailed adhoc fee response with all relationships"""
    student_class: Optional[str] = None
    student_roll_number: Optional[str] = None


class AdhocFeeSummary(BaseModel):
    """Summary statistics for adhoc fees"""
    total_adhoc_fees: int
    total_amount_assigned: Decimal
    total_amount_paid: Decimal
    total_outstanding: Decimal
    pending_count: int
    paid_count: int
    overdue_count: int
    collection_percentage: float


class AdhocFeePaymentRecord(BaseModel):
    """Schema for recording payment against adhoc fee"""
    adhoc_fee_id: int = Field(..., gt=0)
    payment_amount: Decimal = Field(..., gt=0)
    payment_date: date
    payment_method: str = Field(..., description="Cash, Online, Cheque, etc.")
    transaction_reference: Optional[str] = None
    remarks: Optional[str] = None
