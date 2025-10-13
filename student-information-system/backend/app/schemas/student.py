"""
Student Schemas
Pydantic schemas for student-related requests and responses
"""

from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Optional, List
from datetime import date, datetime
from uuid import UUID

from app.models.student import GenderEnum, CasteCategoryEnum, StudentStatusEnum


class StudentBase(BaseModel):
    """Base student schema with common fields"""
    admission_number: str = Field(..., min_length=1, max_length=50, description="School admission number")
    roll_number: Optional[str] = Field(None, max_length=20, description="Class roll number")
    first_name: str = Field(..., min_length=1, max_length=100, description="Student first name")
    middle_name: Optional[str] = Field(None, max_length=100, description="Student middle name")
    last_name: str = Field(..., min_length=1, max_length=100, description="Student last name")
    date_of_birth: date = Field(..., description="Date of birth")
    gender: GenderEnum = Field(..., description="Gender")
    blood_group: Optional[str] = Field(None, max_length=10, description="Blood group (A+, O-, etc.)")
    nationality: str = Field(default="Indian", max_length=50, description="Nationality")
    religion: Optional[str] = Field(None, max_length=50, description="Religion")
    caste_category: Optional[CasteCategoryEnum] = Field(None, description="Caste category")
    aadhar_number: Optional[str] = Field(None, max_length=12, description="Aadhaar number")
    photo_url: Optional[str] = Field(None, max_length=500, description="Photo URL")

    @field_validator('aadhar_number')
    @classmethod
    def validate_aadhar(cls, v: Optional[str]) -> Optional[str]:
        """Validate Aadhaar number (12 digits)"""
        if v is not None:
            # Remove spaces and hyphens
            v = v.replace(" ", "").replace("-", "")
            if not v.isdigit() or len(v) != 12:
                raise ValueError("Aadhaar number must be 12 digits")
        return v

    @field_validator('date_of_birth')
    @classmethod
    def validate_dob(cls, v: date) -> date:
        """Validate date of birth is not in the future"""
        if v > date.today():
            raise ValueError("Date of birth cannot be in the future")
        return v


class StudentCreate(StudentBase):
    """
    Schema for creating a new student.

    Used in POST /api/v1/students endpoint.

    Example:
        ```json
        {
            "admission_number": "STU2025001",
            "first_name": "Rahul",
            "last_name": "Sharma",
            "date_of_birth": "2010-05-15",
            "gender": "Male",
            "blood_group": "O+",
            "nationality": "Indian",
            "admission_date": "2025-04-01",
            "current_class_id": "123e4567-e89b-12d3-a456-426614174000"
        }
        ```
    """
    current_class_id: Optional[UUID] = Field(None, description="Current class ID")
    current_section_id: Optional[UUID] = Field(None, description="Current section ID")
    house_id: Optional[UUID] = Field(None, description="House ID")
    admission_date: date = Field(..., description="Date of admission")
    student_status: StudentStatusEnum = Field(
        default=StudentStatusEnum.ACTIVE,
        description="Student status"
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "admission_number": "STU2025001",
                "roll_number": "1",
                "first_name": "Rahul",
                "middle_name": "Kumar",
                "last_name": "Sharma",
                "date_of_birth": "2010-05-15",
                "gender": "Male",
                "blood_group": "O+",
                "nationality": "Indian",
                "religion": "Hindu",
                "caste_category": "General",
                "aadhar_number": "123456789012",
                "current_class_id": "123e4567-e89b-12d3-a456-426614174000",
                "current_section_id": "223e4567-e89b-12d3-a456-426614174001",
                "house_id": "323e4567-e89b-12d3-a456-426614174002",
                "admission_date": "2025-04-01",
                "student_status": "Active"
            }
        }
    )


class StudentUpdate(BaseModel):
    """
    Schema for updating an existing student.

    Used in PUT /api/v1/students/{id} endpoint.
    All fields are optional for partial updates.
    """
    roll_number: Optional[str] = Field(None, max_length=20)
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    middle_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    date_of_birth: Optional[date] = None
    gender: Optional[GenderEnum] = None
    blood_group: Optional[str] = Field(None, max_length=10)
    nationality: Optional[str] = Field(None, max_length=50)
    religion: Optional[str] = Field(None, max_length=50)
    caste_category: Optional[CasteCategoryEnum] = None
    aadhar_number: Optional[str] = Field(None, max_length=12)
    photo_url: Optional[str] = Field(None, max_length=500)
    current_class_id: Optional[UUID] = None
    current_section_id: Optional[UUID] = None
    house_id: Optional[UUID] = None
    student_status: Optional[StudentStatusEnum] = None

    @field_validator('aadhar_number')
    @classmethod
    def validate_aadhar(cls, v: Optional[str]) -> Optional[str]:
        """Validate Aadhaar number (12 digits)"""
        if v is not None:
            v = v.replace(" ", "").replace("-", "")
            if not v.isdigit() or len(v) != 12:
                raise ValueError("Aadhaar number must be 12 digits")
        return v

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "roll_number": "2",
                "current_class_id": "123e4567-e89b-12d3-a456-426614174000",
                "student_status": "Active"
            }
        }
    )


class StudentResponse(StudentBase):
    """
    Schema for student response.

    Used in all endpoints that return student data.
    Includes all fields from the database model.
    """
    id: UUID = Field(..., description="Student unique identifier")
    current_class_id: Optional[UUID] = Field(None, description="Current class ID")
    current_section_id: Optional[UUID] = Field(None, description="Current section ID")
    house_id: Optional[UUID] = Field(None, description="House ID")
    admission_date: date = Field(..., description="Date of admission")
    student_status: StudentStatusEnum = Field(..., description="Student status")
    profile_completeness_percentage: int = Field(..., description="Profile completion percentage")
    created_at: datetime = Field(..., description="Record creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    deleted_at: Optional[datetime] = Field(None, description="Soft delete timestamp")
    created_by: Optional[UUID] = Field(None, description="User who created the record")
    updated_by: Optional[UUID] = Field(None, description="User who last updated the record")

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "admission_number": "STU2025001",
                "roll_number": "1",
                "first_name": "Rahul",
                "middle_name": "Kumar",
                "last_name": "Sharma",
                "date_of_birth": "2010-05-15",
                "gender": "Male",
                "blood_group": "O+",
                "nationality": "Indian",
                "religion": "Hindu",
                "caste_category": "General",
                "aadhar_number": "123456789012",
                "photo_url": "https://s3.amazonaws.com/sis/photos/student1.jpg",
                "current_class_id": "123e4567-e89b-12d3-a456-426614174000",
                "current_section_id": "223e4567-e89b-12d3-a456-426614174001",
                "house_id": "323e4567-e89b-12d3-a456-426614174002",
                "admission_date": "2025-04-01",
                "student_status": "Active",
                "profile_completeness_percentage": 85,
                "created_at": "2025-10-13T10:00:00Z",
                "updated_at": "2025-10-13T10:00:00Z",
                "deleted_at": None,
                "created_by": "423e4567-e89b-12d3-a456-426614174003",
                "updated_by": None
            }
        }
    )


class StudentListResponse(BaseModel):
    """
    Schema for paginated student list response.

    Used in GET /api/v1/students endpoint.
    """
    success: bool = Field(default=True, description="Request success status")
    data: List[StudentResponse] = Field(..., description="List of students")
    total: int = Field(..., description="Total number of students")
    page: int = Field(..., description="Current page number")
    per_page: int = Field(..., description="Items per page")
    total_pages: int = Field(..., description="Total number of pages")
    message: Optional[str] = Field(default="Students retrieved successfully", description="Response message")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "success": True,
                "data": [],
                "total": 100,
                "page": 1,
                "per_page": 50,
                "total_pages": 2,
                "message": "Students retrieved successfully"
            }
        }
    )


class StudentSearchQuery(BaseModel):
    """
    Schema for student search query parameters.

    Used for advanced search functionality.
    """
    query: str = Field(..., min_length=2, description="Search query")
    class_id: Optional[UUID] = Field(None, description="Filter by class")
    section_id: Optional[UUID] = Field(None, description="Filter by section")
    status: Optional[StudentStatusEnum] = Field(None, description="Filter by status")
    gender: Optional[GenderEnum] = Field(None, description="Filter by gender")
    page: int = Field(default=1, ge=1, description="Page number")
    per_page: int = Field(default=50, ge=1, le=100, description="Items per page")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "query": "Rahul",
                "class_id": "123e4567-e89b-12d3-a456-426614174000",
                "status": "Active",
                "page": 1,
                "per_page": 50
            }
        }
    )


class StudentSummary(BaseModel):
    """
    Schema for student summary (minimal fields).

    Used for dropdowns, autocomplete, and quick references.
    """
    id: UUID = Field(..., description="Student unique identifier")
    admission_number: str = Field(..., description="Admission number")
    full_name: str = Field(..., description="Full name")
    current_class_id: Optional[UUID] = Field(None, description="Current class ID")
    photo_url: Optional[str] = Field(None, description="Photo URL")
    student_status: StudentStatusEnum = Field(..., description="Student status")

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "admission_number": "STU2025001",
                "full_name": "Rahul Kumar Sharma",
                "current_class_id": "123e4567-e89b-12d3-a456-426614174000",
                "photo_url": "https://s3.amazonaws.com/sis/photos/student1.jpg",
                "student_status": "Active"
            }
        }
    )
