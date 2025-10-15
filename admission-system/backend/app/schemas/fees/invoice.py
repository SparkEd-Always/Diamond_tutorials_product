"""
Invoice and InvoiceItem Pydantic Schemas

Schemas for invoice management and invoice items.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal


# ==================== INVOICE ITEM SCHEMAS ====================

class InvoiceItemBase(BaseModel):
    """Base schema for InvoiceItem"""
    fee_type_id: int = Field(..., gt=0, description="Fee type ID")
    description: str = Field(..., min_length=2, max_length=200, description="Item description")
    unit_price: Decimal = Field(..., gt=0, description="Unit price per item")
    quantity: Decimal = Field(Decimal("1.00"), gt=0, description="Quantity")
    discount_percentage: Decimal = Field(Decimal("0.00"), ge=0, le=100, description="Discount percentage")
    discount_amount: Decimal = Field(Decimal("0.00"), ge=0, description="Discount amount")
    tax_percentage: Decimal = Field(Decimal("18.00"), ge=0, le=100, description="Tax percentage (GST)")
    student_fee_assignment_id: Optional[int] = Field(None, gt=0, description="Related fee assignment")


class InvoiceItemCreate(InvoiceItemBase):
    """Schema for creating a new InvoiceItem"""
    pass


class InvoiceItemResponse(InvoiceItemBase):
    """Schema for InvoiceItem response"""
    id: int
    invoice_id: int
    subtotal: Decimal = Field(..., description="Subtotal before tax")
    tax_amount: Decimal = Field(..., description="Tax amount")
    total_amount: Decimal = Field(..., description="Total amount including tax")

    class Config:
        from_attributes = True


# ==================== INVOICE SCHEMAS ====================

class InvoiceBase(BaseModel):
    """Base schema for Invoice"""
    student_id: int = Field(..., gt=0, description="Student ID")
    academic_year_id: int = Field(..., gt=0, description="Academic year ID")
    parent_id: Optional[int] = Field(None, gt=0, description="Parent ID")
    invoice_title: str = Field(..., min_length=2, max_length=200, description="Invoice title")
    invoice_date: date = Field(..., description="Invoice generation date")
    due_date: date = Field(..., description="Payment due date")
    notes: Optional[str] = Field(None, description="Additional notes")
    terms_and_conditions: Optional[str] = Field(None, description="Terms and conditions")


class InvoiceCreate(InvoiceBase):
    """Schema for creating a new Invoice"""
    items: List[InvoiceItemCreate] = Field(..., min_length=1, description="Invoice line items")


class InvoiceUpdate(BaseModel):
    """Schema for updating an existing Invoice"""
    invoice_title: Optional[str] = Field(None, min_length=2, max_length=200)
    due_date: Optional[date] = None
    notes: Optional[str] = None
    terms_and_conditions: Optional[str] = None
    status: Optional[str] = Field(None, description="Invoice status: draft, sent, viewed, partially_paid, paid, overdue, cancelled")


class InvoiceResponse(InvoiceBase):
    """Schema for Invoice response"""
    id: int
    invoice_number: str
    status: str
    subtotal_amount: Decimal
    tax_amount: Decimal
    discount_amount: Decimal
    late_fee_amount: Decimal
    total_amount: Decimal
    paid_amount: Decimal
    balance_amount: Decimal
    is_overdue: bool
    days_overdue: Optional[int] = None
    payment_count: int
    first_payment_date: Optional[datetime] = None
    last_payment_date: Optional[datetime] = None
    fully_paid_at: Optional[datetime] = None
    sent_at: Optional[datetime] = None
    viewed_at: Optional[datetime] = None
    email_sent: bool
    sms_sent: bool
    generated_by: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    # Include items in response
    items: Optional[List[InvoiceItemResponse]] = None

    class Config:
        from_attributes = True


class InvoiceListResponse(BaseModel):
    """Schema for paginated invoice list"""
    invoices: List[InvoiceResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
