"""
Fee Session Schemas
Pydantic models for API requests/responses
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import date, datetime
from decimal import Decimal


# Enums
class FeeSessionStatusEnum(str):
    DRAFT = "draft"
    ACTIVE = "active"
    CLOSED = "closed"
    ARCHIVED = "archived"


# Fee Session Schemas
class FeeSessionBase(BaseModel):
    session_name: str = Field(..., min_length=3, max_length=200, description="Session name")
    session_description: Optional[str] = Field(None, description="Session description")
    academic_year_id: int = Field(..., gt=0, description="Academic year ID")
    fee_structure_id: int = Field(..., gt=0, description="Fee structure ID")
    start_date: date = Field(..., description="Session start date")
    due_date: date = Field(..., description="Payment due date")
    remarks: Optional[str] = Field(None, description="Admin remarks")

    @field_validator('due_date')
    @classmethod
    def validate_due_date(cls, v, info):
        if 'start_date' in info.data and v < info.data['start_date']:
            raise ValueError('due_date must be after start_date')
        return v


class FeeSessionCreate(FeeSessionBase):
    """Schema for creating a new fee session"""
    student_ids: List[int] = Field(..., min_length=1, description="List of student IDs to assign")


class FeeSessionUpdate(BaseModel):
    """Schema for updating a fee session"""
    session_name: Optional[str] = Field(None, min_length=3, max_length=200)
    session_description: Optional[str] = None
    start_date: Optional[date] = None
    due_date: Optional[date] = None
    status: Optional[str] = None
    remarks: Optional[str] = None


class FeeSessionResponse(FeeSessionBase):
    """Schema for fee session response"""
    id: int
    status: str
    total_students: int = 0
    total_amount: Decimal = Decimal('0.00')
    collected_amount: Decimal = Decimal('0.00')
    outstanding_amount: Decimal = Decimal('0.00')
    students_paid: int = 0
    students_pending: int = 0
    created_by: int
    created_at: datetime
    updated_at: datetime
    closed_at: Optional[datetime] = None
    closed_by: Optional[int] = None
    collection_percentage: float = 0.0

    class Config:
        from_attributes = True


class FeeSessionListResponse(BaseModel):
    """Schema for fee session list item"""
    id: int
    session_name: str
    status: str
    academic_year_id: int
    fee_structure_id: int
    start_date: date
    due_date: date
    total_students: int
    students_paid: int
    students_pending: int
    total_amount: Decimal
    collected_amount: Decimal
    outstanding_amount: Decimal
    collection_percentage: float
    created_at: datetime

    class Config:
        from_attributes = True


# Fee Session Assignment Schemas
class FeeSessionAssignmentBase(BaseModel):
    session_id: int = Field(..., gt=0)
    student_id: int = Field(..., gt=0)
    expected_amount: Decimal = Field(..., ge=0)


class FeeSessionAssignmentCreate(FeeSessionAssignmentBase):
    student_fee_assignment_id: int = Field(..., gt=0)


class FeeSessionAssignmentResponse(FeeSessionAssignmentBase):
    """Schema for fee session assignment response"""
    id: int
    student_fee_assignment_id: int
    expected_amount: Decimal
    paid_amount: Decimal
    outstanding_amount: Decimal
    is_paid: bool
    payment_status: str
    assigned_at: datetime
    paid_at: Optional[datetime] = None
    last_payment_at: Optional[datetime] = None
    remarks: Optional[str] = None

    class Config:
        from_attributes = True


class StudentAssignmentDetail(BaseModel):
    """Detailed student info within a session"""
    student_id: int
    student_name: str
    admission_number: str
    roll_number: Optional[str] = None
    class_name: str
    section: Optional[str] = None
    expected_amount: Decimal
    paid_amount: Decimal
    outstanding_amount: Decimal
    payment_status: str
    is_paid: bool


class FeeSessionDetailResponse(FeeSessionResponse):
    """Detailed fee session response with student assignments"""
    student_assignments: List[StudentAssignmentDetail] = []
    fee_structure_name: Optional[str] = None
    academic_year_name: Optional[str] = None


# Bulk Assignment Schema
class BulkStudentAssignment(BaseModel):
    """Schema for bulk assigning students to a session"""
    session_id: int = Field(..., gt=0)
    student_ids: List[int] = Field(..., min_length=1)
    remarks: Optional[str] = None


# Filter Schema for Creating Sessions
class StudentFilterCriteria(BaseModel):
    """Criteria for filtering students during session creation"""
    class_id: Optional[int] = None
    section: Optional[str] = None
    academic_year_id: Optional[int] = None
    search_query: Optional[str] = None  # Search by name


class FilteredStudentResponse(BaseModel):
    """Student info for selection in session creation wizard"""
    id: int
    full_name: str
    admission_number: str
    roll_number: Optional[str] = None
    class_id: int
    class_name: str
    section: Optional[str] = None
    is_selected: bool = False  # For UI selection state

    class Config:
        from_attributes = True
