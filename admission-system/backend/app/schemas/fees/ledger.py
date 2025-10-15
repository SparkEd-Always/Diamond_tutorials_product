"""
StudentFeeLedger Pydantic Schemas

Schemas for student fee ledger and outstanding balance tracking.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from decimal import Decimal


class StudentFeeLedgerResponse(BaseModel):
    """Schema for StudentFeeLedger response"""
    id: int
    student_id: int
    academic_year_id: int

    # Financial summary
    total_fees_assigned: Decimal = Field(..., description="Total fees assigned to student")
    total_invoiced: Decimal = Field(..., description="Total amount invoiced")
    total_paid: Decimal = Field(..., description="Total amount paid")
    total_outstanding: Decimal = Field(..., description="Total outstanding balance")
    total_refunded: Decimal = Field(..., description="Total refunded amount")
    total_waived: Decimal = Field(..., description="Total waived amount")
    total_discounts: Decimal = Field(..., description="Total discounts applied")

    # Aging analysis
    overdue_0_30_days: Decimal = Field(..., description="Outstanding amount: 0-30 days overdue")
    overdue_30_60_days: Decimal = Field(..., description="Outstanding amount: 30-60 days overdue")
    overdue_60_90_days: Decimal = Field(..., description="Outstanding amount: 60-90 days overdue")
    overdue_90_plus_days: Decimal = Field(..., description="Outstanding amount: 90+ days overdue")

    # Late fees
    total_late_fees: Decimal = Field(..., description="Total late fees charged")
    late_fees_paid: Decimal = Field(..., description="Late fees paid")
    late_fees_outstanding: Decimal = Field(..., description="Late fees outstanding")

    # Payment tracking
    last_payment_date: Optional[datetime] = None
    last_payment_amount: Optional[Decimal] = None
    payment_count: int = Field(..., description="Total number of payments made")

    # Invoice tracking
    invoice_count: int = Field(..., description="Total invoices generated")
    pending_invoice_count: int = Field(..., description="Number of pending invoices")
    paid_invoice_count: int = Field(..., description="Number of fully paid invoices")
    overdue_invoice_count: int = Field(..., description="Number of overdue invoices")

    # Status flags
    has_outstanding: bool = Field(..., description="Whether student has outstanding balance")
    has_overdue: bool = Field(..., description="Whether student has overdue payments")
    is_defaulter: bool = Field(..., description="Whether student is marked as defaulter (90+ days overdue)")

    # Tracking
    last_updated_at: datetime
    created_at: datetime
    remarks: Optional[str] = None

    class Config:
        from_attributes = True


class StudentFeeLedgerSummary(BaseModel):
    """Summary schema for StudentFeeLedger (for dashboard/list views)"""
    id: int
    student_id: int
    academic_year_id: int
    total_fees_assigned: Decimal
    total_paid: Decimal
    total_outstanding: Decimal
    overdue_0_30_days: Decimal
    overdue_30_60_days: Decimal
    overdue_60_90_days: Decimal
    overdue_90_plus_days: Decimal
    has_outstanding: bool
    has_overdue: bool
    is_defaulter: bool
    overdue_invoice_count: int
    last_payment_date: Optional[datetime] = None

    class Config:
        from_attributes = True
