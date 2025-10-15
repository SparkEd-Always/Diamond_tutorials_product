"""
Payment Pydantic Schemas

Schemas for payment processing and management.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from decimal import Decimal


class PaymentBase(BaseModel):
    """Base schema for Payment"""
    invoice_id: int = Field(..., gt=0, description="Invoice ID")
    amount: Decimal = Field(..., gt=0, description="Payment amount")
    payment_method: str = Field(..., description="Payment method: upi, credit_card, debit_card, net_banking, cash, cheque, dd, bank_transfer")
    payment_date: datetime = Field(..., description="Payment date and time")
    notes: Optional[str] = Field(None, description="Payment notes")


class PaymentCreate(PaymentBase):
    """Schema for creating a new Payment"""
    # Online payment fields (for Razorpay/PayU)
    gateway_name: Optional[str] = Field(None, description="Payment gateway name (razorpay, payu)")
    gateway_order_id: Optional[str] = Field(None, description="Gateway order ID")
    gateway_payment_id: Optional[str] = Field(None, description="Gateway payment ID")
    gateway_signature: Optional[str] = Field(None, description="Payment signature for verification")

    # Offline payment fields
    transaction_id: Optional[str] = Field(None, description="Bank transaction ID")
    bank_reference_number: Optional[str] = Field(None, description="Bank reference number")
    cheque_number: Optional[str] = Field(None, description="Cheque number (if cheque payment)")
    cheque_date: Optional[datetime] = Field(None, description="Cheque date")
    cheque_bank: Optional[str] = Field(None, description="Cheque bank name")
    cheque_branch: Optional[str] = Field(None, description="Cheque bank branch")
    dd_number: Optional[str] = Field(None, description="DD number (if DD payment)")
    dd_date: Optional[datetime] = Field(None, description="DD date")
    dd_bank: Optional[str] = Field(None, description="DD bank name")


class PaymentUpdate(BaseModel):
    """Schema for updating an existing Payment"""
    status: Optional[str] = Field(None, description="Payment status: initiated, pending, success, failed, refunded")
    verification_status: Optional[str] = Field(None, description="Verification status: pending, verified, rejected")
    verification_notes: Optional[str] = Field(None, description="Verification notes from admin")
    reconciliation_status: Optional[str] = Field(None, description="Reconciliation status: pending, reconciled, mismatch")
    reconciliation_notes: Optional[str] = Field(None, description="Reconciliation notes")
    is_refund: Optional[bool] = None
    refund_amount: Optional[Decimal] = Field(None, ge=0)
    refund_reason: Optional[str] = None
    refund_date: Optional[datetime] = None


class PaymentResponse(PaymentBase):
    """Schema for Payment response"""
    id: int
    student_id: int
    parent_id: Optional[int] = None
    payment_number: str
    status: str

    # Online payment details
    gateway_name: Optional[str] = None
    gateway_order_id: Optional[str] = None
    gateway_payment_id: Optional[str] = None
    gateway_response: Optional[Dict[str, Any]] = None

    # Offline payment details
    transaction_id: Optional[str] = None
    bank_reference_number: Optional[str] = None
    cheque_number: Optional[str] = None
    cheque_date: Optional[datetime] = None
    cheque_bank: Optional[str] = None
    cheque_branch: Optional[str] = None
    dd_number: Optional[str] = None
    dd_date: Optional[datetime] = None
    dd_bank: Optional[str] = None

    # Verification
    verification_status: str
    is_verified: bool
    verified_by: Optional[int] = None
    verified_at: Optional[datetime] = None
    verification_notes: Optional[str] = None

    # Reconciliation
    reconciliation_status: str
    is_reconciled: bool
    reconciled_by: Optional[int] = None
    reconciled_at: Optional[datetime] = None
    reconciliation_notes: Optional[str] = None

    # Refund
    is_refund: bool
    refund_amount: Optional[Decimal] = None
    refund_reason: Optional[str] = None
    refund_date: Optional[datetime] = None
    refund_reference_number: Optional[str] = None
    refunded_by: Optional[int] = None

    # Tracking
    recorded_by: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PaymentListResponse(BaseModel):
    """Schema for paginated payment list"""
    payments: List[PaymentResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
