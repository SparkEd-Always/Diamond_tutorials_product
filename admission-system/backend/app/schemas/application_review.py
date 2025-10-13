"""
Application Review Schemas - Request and response models for reviews
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# Field Review Schemas
class FieldReviewCreate(BaseModel):
    field_name: str = Field(..., max_length=100)
    field_label: Optional[str] = Field(None, max_length=200)
    field_value: Optional[str] = None
    needs_correction: bool = False
    admin_comment: Optional[str] = None


class FieldReviewUpdate(BaseModel):
    needs_correction: Optional[bool] = None
    admin_comment: Optional[str] = None


class FieldReviewResponse(BaseModel):
    id: int
    application_id: int
    field_name: str
    field_label: Optional[str]
    field_value: Optional[str]
    needs_correction: bool
    admin_comment: Optional[str]
    reviewed_by: int
    reviewed_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# Application Review Schemas
class ApplicationReviewCreate(BaseModel):
    review_status: str = Field(..., max_length=50)  # "in_review", "changes_requested", "approved"
    overall_remarks: Optional[str] = None
    field_reviews: List[FieldReviewCreate] = []


class ApplicationReviewUpdate(BaseModel):
    review_status: Optional[str] = Field(None, max_length=50)
    overall_remarks: Optional[str] = None


class ApplicationReviewResponse(BaseModel):
    id: int
    application_id: int
    review_status: str
    overall_remarks: Optional[str]
    version_number: int
    reviewed_by: int
    reviewed_at: datetime
    updated_at: Optional[datetime]
    field_reviews: List[FieldReviewResponse] = []

    class Config:
        from_attributes = True


# Combined response for full review data
class ApplicationReviewFullResponse(BaseModel):
    application_id: int
    application_number: str
    application_status: str
    current_review: Optional[ApplicationReviewResponse]
    field_reviews: List[FieldReviewResponse]
    has_pending_corrections: bool
    correction_count: int

    class Config:
        from_attributes = True
