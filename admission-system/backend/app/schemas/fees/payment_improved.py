"""
Improved Payment Pydantic Schemas with Ledger Integration

These schemas support:
1. Direct payment (without invoice)
2. Fee allocation (to fee sessions and adhoc fees)
3. Automatic ledger entry creation
4. Receipt generation
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from decimal import Decimal


# ============================================================================
# Fee Allocation Schemas
# ============================================================================

class FeeAllocationItem(BaseModel):
    """Schema for allocating payment to a specific fee"""
    fee_session_id: Optional[int] = Field(None, description="Fee session ID (if paying for fee session)")
    adhoc_fee_id: Optional[int] = Field(None, description="Adhoc fee ID (if paying for adhoc fee)")
    amount: Decimal = Field(..., gt=0, description="Amount to allocate to this fee")

    @validator('amount')
    def validate_amount(cls, v):
        if v <= 0:
            raise ValueError('Amount must be positive')
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "fee_session_id": 45,
                "amount": 8000.00
            }
        }


# ============================================================================
# Payment Creation Schemas
# ============================================================================

class PaymentCreateBase(BaseModel):
    """Base schema for payment creation"""
    student_id: int = Field(..., gt=0, description="Student ID")
    academic_year_id: int = Field(..., gt=0, description="Academic year ID")
    amount: Decimal = Field(..., gt=0, description="Total payment amount")
    payment_method: str = Field(..., description="Payment method: cash, upi, credit_card, debit_card, net_banking, cheque, bank_transfer, demand_draft")
    payment_date: Optional[datetime] = Field(None, description="Payment date (defaults to now)")
    remarks: Optional[str] = Field(None, max_length=500, description="Payment remarks/notes")

    # Fee allocation (optional - can allocate to specific fees)
    allocate_to: Optional[List[FeeAllocationItem]] = Field(
        None,
        description="List of fees to allocate this payment to (optional)"
    )

    @validator('payment_method')
    def validate_payment_method(cls, v):
        allowed_methods = ['cash', 'upi', 'credit_card', 'debit_card', 'net_banking',
                          'wallet', 'cheque', 'bank_transfer', 'demand_draft']
        if v.lower() not in allowed_methods:
            raise ValueError(f'Payment method must be one of: {", ".join(allowed_methods)}')
        return v.lower()

    class Config:
        json_schema_extra = {
            "example": {
                "student_id": 123,
                "academic_year_id": 1,
                "amount": 10000.00,
                "payment_method": "cash",
                "payment_date": "2024-04-15T10:30:00",
                "remarks": "Cash payment received at school office",
                "allocate_to": [
                    {"fee_session_id": 45, "amount": 8000.00},
                    {"adhoc_fee_id": 12, "amount": 2000.00}
                ]
            }
        }


class OfflinePaymentCreate(PaymentCreateBase):
    """Schema for offline payment creation (cash, cheque, bank transfer)"""
    # Cheque details
    cheque_number: Optional[str] = Field(None, max_length=20, description="Cheque number (if cheque payment)")
    cheque_date: Optional[datetime] = Field(None, description="Cheque date")
    bank_name: Optional[str] = Field(None, max_length=100, description="Bank name")
    branch_name: Optional[str] = Field(None, max_length=100, description="Branch name")

    # Bank transfer details
    transaction_id: Optional[str] = Field(None, max_length=100, description="Bank transaction ID / UTR number")
    bank_reference: Optional[str] = Field(None, max_length=100, description="Bank reference number")


class OnlinePaymentCreate(PaymentCreateBase):
    """Schema for online payment creation (with gateway integration)"""
    # Gateway details
    gateway_name: Optional[str] = Field(None, description="Payment gateway (razorpay, payu, paytm)")
    gateway_order_id: Optional[str] = Field(None, description="Gateway order ID")
    gateway_payment_id: Optional[str] = Field(None, description="Gateway payment ID")
    gateway_signature: Optional[str] = Field(None, description="Payment signature for verification")

    # Card/UPI details
    card_last4: Optional[str] = Field(None, max_length=4, description="Last 4 digits of card")
    upi_id: Optional[str] = Field(None, description="UPI ID used")


# ============================================================================
# Payment Response Schemas
# ============================================================================

class PaymentAllocationResponse(BaseModel):
    """Response showing how payment was allocated"""
    fee_session_id: Optional[int] = None
    adhoc_fee_id: Optional[int] = None
    fee_description: str
    allocated_amount: Decimal

    class Config:
        from_attributes = True


class PaymentResponseDetailed(BaseModel):
    """Detailed payment response with all information"""
    # Basic info
    id: int
    payment_number: str
    payment_date: datetime
    student_id: int
    student_name: Optional[str] = None
    academic_year_id: int
    academic_year_name: Optional[str] = None

    # Payment details
    amount: Decimal
    payment_method: str
    status: str

    # Ledger integration
    ledger_transaction_id: Optional[int] = Field(None, description="Reference to ledger transaction")
    ledger_balance_after: Optional[Decimal] = Field(None, description="Student balance after this payment")

    # Fee allocation
    allocations: Optional[List[PaymentAllocationResponse]] = Field(None, description="How payment was allocated")

    # Offline payment details
    cheque_number: Optional[str] = None
    cheque_date: Optional[datetime] = None
    bank_name: Optional[str] = None
    branch_name: Optional[str] = None
    transaction_id: Optional[str] = None
    bank_reference: Optional[str] = None

    # Online payment details
    gateway_name: Optional[str] = None
    gateway_order_id: Optional[str] = None
    gateway_payment_id: Optional[str] = None

    # Verification & reconciliation
    is_verified: bool = False
    verified_by: Optional[int] = None
    verified_at: Optional[datetime] = None
    is_reconciled: bool = False
    reconciled_at: Optional[datetime] = None

    # Receipt
    receipt_number: Optional[str] = Field(None, description="Generated receipt number")

    # Metadata
    remarks: Optional[str] = None
    recorded_by: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "payment_number": "PAY/2024-25/000001",
                "payment_date": "2024-04-15T10:30:00",
                "student_id": 123,
                "student_name": "Rahul Kumar",
                "amount": 10000.00,
                "payment_method": "cash",
                "status": "success",
                "ledger_transaction_id": 567,
                "ledger_balance_after": 5000.00,
                "allocations": [
                    {
                        "fee_session_id": 45,
                        "fee_description": "Q1 Tuition Fee 2024-25",
                        "allocated_amount": 8000.00
                    },
                    {
                        "adhoc_fee_id": 12,
                        "fee_description": "Lost ID Card",
                        "allocated_amount": 2000.00
                    }
                ],
                "receipt_number": "RCP/2024-25/000001",
                "is_verified": True,
                "created_at": "2024-04-15T10:30:00"
            }
        }


class PaymentSummaryResponse(BaseModel):
    """Simplified payment response for lists"""
    id: int
    payment_number: str
    payment_date: datetime
    student_id: int
    student_name: Optional[str] = None
    amount: Decimal
    payment_method: str
    status: str
    is_verified: bool
    is_reconciled: bool
    created_at: datetime

    class Config:
        from_attributes = True


class PaymentListResponse(BaseModel):
    """Paginated payment list response"""
    payments: List[PaymentSummaryResponse]
    total_count: int
    page_number: int
    page_size: int
    total_pages: int


# ============================================================================
# Payment Verification & Update Schemas
# ============================================================================

class PaymentVerificationRequest(BaseModel):
    """Schema for verifying a payment (admin only)"""
    is_approved: bool = Field(..., description="True to approve, False to reject")
    verification_notes: Optional[str] = Field(None, max_length=500, description="Verification notes")


class PaymentReconciliationRequest(BaseModel):
    """Schema for reconciling a payment with bank statement"""
    is_reconciled: bool = Field(True, description="Mark as reconciled")
    reconciliation_notes: Optional[str] = Field(None, max_length=500, description="Reconciliation notes")
    bank_statement_date: Optional[datetime] = Field(None, description="Date on bank statement")


# ============================================================================
# Payment Statistics
# ============================================================================

class PaymentStatistics(BaseModel):
    """Overall payment statistics"""
    total_payments_count: int
    total_amount_received: Decimal
    payments_today: int
    amount_today: Decimal
    pending_verification_count: int
    payments_by_method: Dict[str, Dict[str, Any]]  # {method: {count, amount}}

    class Config:
        json_schema_extra = {
            "example": {
                "total_payments_count": 150,
                "total_amount_received": 1500000.00,
                "payments_today": 5,
                "amount_today": 50000.00,
                "pending_verification_count": 3,
                "payments_by_method": {
                    "cash": {"count": 80, "amount": 800000.00},
                    "upi": {"count": 50, "amount": 500000.00},
                    "cheque": {"count": 20, "amount": 200000.00}
                }
            }
        }
