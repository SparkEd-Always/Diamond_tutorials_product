"""
FeeType Pydantic Schemas

Schemas for fee type management API validation.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from decimal import Decimal


class FeeTypeBase(BaseModel):
    """Base schema for FeeType"""
    type_name: str = Field(..., min_length=2, max_length=100, description="Fee type name (e.g., Tuition Fee)")
    code: str = Field(..., min_length=2, max_length=20, description="Fee type code (e.g., FEE_TUITION)")
    description: Optional[str] = Field(None, max_length=500, description="Detailed description")
    frequency: str = Field(..., description="Payment frequency: one_time, monthly, quarterly, half_yearly, annual, custom")
    is_mandatory: bool = Field(True, description="Whether this fee is mandatory")
    is_taxable: bool = Field(True, description="Whether GST is applicable")
    tax_rate: Decimal = Field(Decimal("18.00"), ge=0, le=100, description="GST percentage (default 18%)")
    is_refundable: bool = Field(False, description="Whether this fee can be refunded")
    is_active: bool = Field(True, description="Whether this fee type is currently active")
    display_order: Optional[int] = Field(None, ge=0, description="Display order in UI")


class FeeTypeCreate(FeeTypeBase):
    """Schema for creating a new FeeType"""
    pass


class FeeTypeUpdate(BaseModel):
    """Schema for updating an existing FeeType"""
    type_name: Optional[str] = Field(None, min_length=2, max_length=100)
    code: Optional[str] = Field(None, min_length=2, max_length=20)
    description: Optional[str] = Field(None, max_length=500)
    frequency: Optional[str] = None
    is_mandatory: Optional[bool] = None
    is_taxable: Optional[bool] = None
    tax_rate: Optional[Decimal] = Field(None, ge=0, le=100)
    is_refundable: Optional[bool] = None
    is_active: Optional[bool] = None
    display_order: Optional[int] = Field(None, ge=0)


class FeeTypeResponse(FeeTypeBase):
    """Schema for FeeType response"""
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
