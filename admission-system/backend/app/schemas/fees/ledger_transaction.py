"""
Student Ledger Transaction Schemas
Pydantic models for API requests/responses
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from decimal import Decimal


# Base Schemas
class LedgerTransactionBase(BaseModel):
    """Base schema for ledger transaction"""
    transaction_date: datetime = Field(..., description="Transaction date")
    student_id: int = Field(..., gt=0, description="Student ID")
    academic_year_id: int = Field(..., gt=0, description="Academic year ID")
    description: str = Field(..., min_length=3, description="Transaction description")
    remarks: Optional[str] = Field(None, description="Additional remarks")


class ManualLedgerEntryCreate(BaseModel):
    """Schema for creating manual ledger entry (admin only)"""
    student_id: int = Field(..., gt=0, description="Student ID")
    academic_year_id: int = Field(..., gt=0, description="Academic year ID")
    entry_type: str = Field(..., description="Entry type (payment_cash, discount, etc.)")
    amount: Decimal = Field(..., gt=0, description="Amount (always positive)")
    description: str = Field(..., min_length=5, description="Description of transaction")
    transaction_date: Optional[datetime] = Field(None, description="Transaction date (defaults to now)")
    remarks: Optional[str] = Field(None, description="Admin remarks")
    metadata: Optional[dict] = Field(None, description="Additional metadata")


class LedgerTransactionResponse(BaseModel):
    """Schema for ledger transaction response"""
    id: int
    transaction_number: str
    transaction_date: datetime
    student_id: int
    academic_year_id: int
    entry_type: str
    debit_amount: Decimal
    credit_amount: Decimal
    balance: Decimal
    reference_type: Optional[str] = None
    reference_id: Optional[int] = None
    fee_session_id: Optional[int] = None
    adhoc_fee_id: Optional[int] = None
    payment_id: Optional[int] = None
    invoice_id: Optional[int] = None
    description: str
    remarks: Optional[str] = None
    metadata: Optional[dict] = None
    created_by: Optional[int] = None
    created_at: datetime
    is_reversed: bool
    reversed_by: Optional[int] = None
    reversed_at: Optional[datetime] = None
    reversal_transaction_id: Optional[int] = None

    # Populated from relationships (optional)
    student_name: Optional[str] = None
    academic_year_name: Optional[str] = None
    created_by_name: Optional[str] = None

    class Config:
        from_attributes = True


class LedgerTimelineItem(BaseModel):
    """Simplified schema for ledger timeline display"""
    id: int
    transaction_number: str
    transaction_date: datetime
    entry_type: str
    debit_amount: Decimal
    credit_amount: Decimal
    balance: Decimal
    description: str
    remarks: Optional[str] = None
    is_reversed: bool
    created_at: datetime

    class Config:
        from_attributes = True


class LedgerSummary(BaseModel):
    """Summary of student ledger"""
    student_id: int
    academic_year_id: int
    total_debits: Decimal
    total_credits: Decimal
    current_balance: Decimal
    transaction_count: int
    first_transaction_date: Optional[datetime] = None
    last_transaction_date: Optional[datetime] = None

    # Additional calculated fields
    total_fees_assigned: Decimal = Field(default=Decimal('0.00'))
    total_paid: Decimal = Field(default=Decimal('0.00'))
    total_adjustments: Decimal = Field(default=Decimal('0.00'))


class ReversalRequest(BaseModel):
    """Schema for reversing a transaction"""
    transaction_id: int = Field(..., gt=0, description="Transaction ID to reverse")
    remarks: str = Field(..., min_length=10, description="Reason for reversal")


class LedgerStatistics(BaseModel):
    """Overall ledger statistics"""
    total_students_with_balance: int
    total_outstanding: Decimal
    total_collected: Decimal
    total_transactions: int
    average_balance: Decimal


class StudentLedgerDetail(BaseModel):
    """Detailed student ledger with transactions and summary"""
    student_id: int
    student_name: str
    student_admission_number: str
    academic_year_id: int
    academic_year_name: str
    summary: LedgerSummary
    recent_transactions: List[LedgerTimelineItem]
    total_transaction_count: int
