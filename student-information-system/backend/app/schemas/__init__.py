"""
Pydantic Schemas
Request/response validation and serialization schemas
"""

from app.schemas.common import PaginatedResponse, SuccessResponse, ErrorResponse
from app.schemas.student import (
    StudentCreate,
    StudentUpdate,
    StudentResponse,
    StudentListResponse
)

__all__ = [
    # Common
    "PaginatedResponse",
    "SuccessResponse",
    "ErrorResponse",
    # Student
    "StudentCreate",
    "StudentUpdate",
    "StudentResponse",
    "StudentListResponse",
]
