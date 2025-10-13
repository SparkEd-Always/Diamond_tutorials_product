"""
Common Schemas
Shared Pydantic schemas for API responses and pagination
"""

from pydantic import BaseModel, Field
from typing import Generic, TypeVar, Optional, Any, List, Dict
from datetime import datetime
from uuid import UUID


# Generic type for paginated responses
T = TypeVar('T')


class PaginatedResponse(BaseModel, Generic[T]):
    """
    Generic paginated response schema.

    Used for all list endpoints to provide consistent pagination structure.

    Example:
        ```python
        @router.get("/students", response_model=PaginatedResponse[StudentResponse])
        def list_students(page: int = 1, per_page: int = 50):
            # ... query logic
            return PaginatedResponse(
                data=students,
                total=total_count,
                page=page,
                per_page=per_page,
                total_pages=total_pages
            )
        ```
    """
    success: bool = Field(default=True, description="Request success status")
    data: List[T] = Field(description="List of items")
    total: int = Field(description="Total number of items")
    page: int = Field(description="Current page number")
    per_page: int = Field(description="Items per page")
    total_pages: int = Field(description="Total number of pages")
    message: Optional[str] = Field(default=None, description="Optional message")

    class Config:
        json_schema_extra = {
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


class SuccessResponse(BaseModel):
    """
    Standard success response schema.

    Used for single-item responses or operations without data.

    Example:
        ```python
        @router.post("/students", response_model=SuccessResponse)
        def create_student(student: StudentCreate):
            # ... create logic
            return SuccessResponse(
                success=True,
                data=created_student,
                message="Student created successfully"
            )
        ```
    """
    success: bool = Field(default=True, description="Request success status")
    data: Optional[Any] = Field(default=None, description="Response data")
    message: str = Field(description="Success message")

    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "data": {"id": "123e4567-e89b-12d3-a456-426614174000"},
                "message": "Operation completed successfully"
            }
        }


class ErrorResponse(BaseModel):
    """
    Standard error response schema.

    Used for all error responses to provide consistent error structure.

    Example:
        ```python
        raise HTTPException(
            status_code=400,
            detail=ErrorResponse(
                success=False,
                message="Validation failed",
                errors={"first_name": "First name is required"}
            ).dict()
        )
        ```
    """
    success: bool = Field(default=False, description="Request success status")
    message: str = Field(description="Error message")
    errors: Optional[Dict[str, Any]] = Field(default=None, description="Detailed errors")
    data: Optional[Any] = Field(default=None, description="Optional data")

    class Config:
        json_schema_extra = {
            "example": {
                "success": False,
                "message": "Validation failed",
                "errors": {
                    "first_name": "First name is required",
                    "date_of_birth": "Invalid date format"
                },
                "data": None
            }
        }


class TimestampMixin(BaseModel):
    """
    Mixin for models with timestamp fields.

    Provides created_at and updated_at fields for all models.
    """
    created_at: datetime = Field(description="Record creation timestamp")
    updated_at: datetime = Field(description="Last update timestamp")

    class Config:
        from_attributes = True


class SoftDeleteMixin(BaseModel):
    """
    Mixin for models with soft delete support.

    Provides deleted_at field for soft deletion.
    """
    deleted_at: Optional[datetime] = Field(default=None, description="Soft delete timestamp")

    class Config:
        from_attributes = True


class AuditMixin(BaseModel):
    """
    Mixin for models with audit trail.

    Provides created_by and updated_by fields for audit logging.
    """
    created_by: Optional[UUID] = Field(default=None, description="User who created the record")
    updated_by: Optional[UUID] = Field(default=None, description="User who last updated the record")

    class Config:
        from_attributes = True


class BaseSchema(TimestampMixin, SoftDeleteMixin, AuditMixin):
    """
    Base schema with timestamps, soft delete, and audit fields.

    All entity schemas should inherit from this for consistency.
    """
    pass


# Pagination helper function
def paginate(
    items: List[Any],
    total: int,
    page: int,
    per_page: int
) -> Dict[str, Any]:
    """
    Helper function to create paginated response.

    Args:
        items: List of items for current page
        total: Total number of items
        page: Current page number
        per_page: Items per page

    Returns:
        Dictionary with pagination data
    """
    import math

    total_pages = math.ceil(total / per_page) if per_page > 0 else 0

    return {
        "success": True,
        "data": items,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": total_pages
    }
