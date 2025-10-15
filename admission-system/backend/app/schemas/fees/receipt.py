"""
PaymentReceipt Pydantic Schemas

Schemas for payment receipt management.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from decimal import Decimal


class PaymentReceiptBase(BaseModel):
    """Base schema for PaymentReceipt"""
    payment_id: int = Field(..., gt=0, description="Payment ID")
    receipt_number: str = Field(..., description="Receipt number (format: REC/2024-25/000001)")
    amount: Decimal = Field(..., gt=0, description="Receipt amount")


class PaymentReceiptResponse(PaymentReceiptBase):
    """Schema for PaymentReceipt response"""
    id: int
    student_id: int
    invoice_id: int

    # PDF file details
    pdf_file_path: Optional[str] = None
    pdf_file_name: Optional[str] = None
    pdf_file_size: Optional[int] = None

    # Delivery tracking
    email_sent: bool
    email_sent_at: Optional[datetime] = None
    sms_sent: bool
    sms_sent_at: Optional[datetime] = None

    # Download tracking
    download_count: int
    first_download_at: Optional[datetime] = None
    last_download_at: Optional[datetime] = None

    # Re-generation tracking
    is_regenerated: bool
    regenerated_count: int
    last_regenerated_at: Optional[datetime] = None
    regenerated_by: Optional[int] = None
    regeneration_reason: Optional[str] = None

    # Tracking
    generated_by: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
