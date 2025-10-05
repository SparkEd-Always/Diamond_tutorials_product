from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import datetime, date, time
from decimal import Decimal

# ============================================================================
# Student & Parent Schemas
# ============================================================================

class StudentDetailsSchema(BaseModel):
    first_name: str = Field(..., min_length=2, max_length=100)
    middle_name: Optional[str] = None
    last_name: str = Field(..., min_length=2, max_length=100)
    date_of_birth: date
    gender: str  # male, female, other
    blood_group: Optional[str] = None
    medical_conditions: Optional[str] = None
    previous_school_name: Optional[str] = None
    previous_school_address: Optional[str] = None
    transport_required: bool = False

class ParentDetailsSchema(BaseModel):
    first_name: str = Field(..., min_length=2, max_length=100)
    last_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., pattern=r'^\+?[1-9]\d{1,14}$')
    relationship_type: str  # father, mother, guardian, other
    occupation: Optional[str] = None
    employer_name: Optional[str] = None
    annual_income: Optional[Decimal] = None
    education_qualification: Optional[str] = None
    is_primary_contact: bool = True

class AddressSchema(BaseModel):
    address_line1: str
    address_line2: Optional[str] = None
    city: str
    state: str
    postal_code: str
    country: str = "India"

# Draft schemas with all optional fields
class StudentDetailsDraftSchema(BaseModel):
    first_name: Optional[str] = ""
    middle_name: Optional[str] = ""
    last_name: Optional[str] = ""
    date_of_birth: Optional[date] = None
    gender: Optional[str] = ""
    blood_group: Optional[str] = ""
    medical_conditions: Optional[str] = ""
    previous_school_name: Optional[str] = ""
    previous_school_address: Optional[str] = ""
    transport_required: bool = False

    @validator('date_of_birth', pre=True)
    def empty_string_to_none(cls, v):
        if v == '' or v is None:
            return None
        return v

    class Config:
        # Allow empty strings to be treated as None for optional fields
        anystr_strip_whitespace = True

class ParentDetailsDraftSchema(BaseModel):
    first_name: Optional[str] = ""
    last_name: Optional[str] = ""
    email: Optional[str] = ""
    phone: Optional[str] = ""
    relationship_type: Optional[str] = ""
    occupation: Optional[str] = ""
    employer_name: Optional[str] = ""
    annual_income: Optional[Decimal] = None
    education_qualification: Optional[str] = ""
    is_primary_contact: bool = True

    class Config:
        anystr_strip_whitespace = True

class AddressDraftSchema(BaseModel):
    address_line1: Optional[str] = ""
    address_line2: Optional[str] = ""
    city: Optional[str] = ""
    state: Optional[str] = ""
    postal_code: Optional[str] = ""
    country: str = "India"

    class Config:
        anystr_strip_whitespace = True

# ============================================================================
# Application Schemas
# ============================================================================

class ApplicationCreate(BaseModel):
    """Schema for creating a new admission application"""
    # Student details
    student_details: StudentDetailsSchema

    # Parent details
    parent_details: ParentDetailsSchema

    # Address
    address: AddressSchema

    # Academic details
    class_applying_id: int
    academic_year_id: int

    # Additional info
    source: Optional[str] = "online"
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None

class ApplicationDraftCreate(BaseModel):
    """Schema for creating a draft admission application with optional fields"""
    # Student details (all optional for drafts)
    student_details: StudentDetailsDraftSchema

    # Parent details (all optional for drafts)
    parent_details: ParentDetailsDraftSchema

    # Address (all optional for drafts)
    address: AddressDraftSchema

    # Academic details
    class_applying_id: Optional[int] = 1  # Default to class 1
    academic_year_id: Optional[int] = 1  # Default to current year

    # Additional info
    source: Optional[str] = "online"
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None

class ApplicationUpdate(BaseModel):
    """Schema for updating an existing application"""
    student_details: Optional[StudentDetailsSchema] = None
    parent_details: Optional[ParentDetailsSchema] = None
    address: Optional[AddressSchema] = None
    class_applying_id: Optional[int] = None
    remarks: Optional[str] = None

class ApplicationStatusUpdate(BaseModel):
    """Schema for updating application status"""
    status: str
    reason: Optional[str] = None

class ApplicationResponse(BaseModel):
    """Schema for application response"""
    id: int
    application_number: str
    application_status: str
    submission_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    # Nested data
    student_name: Optional[str] = None
    parent_name: Optional[str] = None
    class_name: Optional[str] = None

    class Config:
        from_attributes = True

class ApplicationListResponse(BaseModel):
    """Schema for paginated application list"""
    total: int
    page: int
    page_size: int
    applications: List[ApplicationResponse]

# ============================================================================
# Document Schemas
# ============================================================================

class DocumentUploadResponse(BaseModel):
    """Response after document upload"""
    id: int
    application_id: int
    document_type_id: int
    original_filename: str
    stored_filename: str
    file_size_kb: int
    verification_status: str
    uploaded_at: datetime

    class Config:
        from_attributes = True

class DocumentVerification(BaseModel):
    """Schema for document verification"""
    verification_status: str  # verified, rejected, requires_resubmission
    verification_notes: Optional[str] = None

# ============================================================================
# Test & Interview Schemas
# ============================================================================

class TestSchedule(BaseModel):
    """Schema for scheduling admission test"""
    application_id: int
    test_type: str  # entrance, aptitude, oral, written
    test_date: date
    test_time: time
    duration_minutes: int = 60
    venue: Optional[str] = None

class TestResult(BaseModel):
    """Schema for recording test results"""
    score_obtained: Decimal
    grade: Optional[str] = None
    remarks: Optional[str] = None
    status: str = "completed"

class InterviewSchedule(BaseModel):
    """Schema for scheduling interview"""
    application_id: int
    interview_date: date
    interview_time: time
    duration_minutes: int = 30
    venue: Optional[str] = None

class InterviewFeedback(BaseModel):
    """Schema for interview feedback"""
    rating: Decimal = Field(..., ge=0, le=5)
    communication_skills: int = Field(..., ge=1, le=5)
    confidence_level: int = Field(..., ge=1, le=5)
    general_knowledge: int = Field(..., ge=1, le=5)
    parent_interaction: int = Field(..., ge=1, le=5)
    overall_impression: str  # excellent, good, average, poor
    feedback: Optional[str] = None
    recommendation: str  # strongly_recommend, recommend, neutral, not_recommend
    status: str = "completed"

# ============================================================================
# Filter & Search Schemas
# ============================================================================

class ApplicationFilter(BaseModel):
    """Schema for filtering applications"""
    status: Optional[str] = None
    class_applying_id: Optional[int] = None
    academic_year_id: Optional[int] = None
    date_from: Optional[date] = None
    date_to: Optional[date] = None
    search_query: Optional[str] = None  # Search by name, application number
    page: int = 1
    page_size: int = 20
