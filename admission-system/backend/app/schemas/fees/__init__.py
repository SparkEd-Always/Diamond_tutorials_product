"""
Fee Management Schemas

This module contains Pydantic schemas for fee management API validation.
"""

from .fee_type import (
    FeeTypeBase,
    FeeTypeCreate,
    FeeTypeUpdate,
    FeeTypeResponse,
)

from .fee_structure import (
    FeeStructureBase,
    FeeStructureCreate,
    FeeStructureUpdate,
    FeeStructureResponse,
    StudentFeeAssignmentBase,
    StudentFeeAssignmentCreate,
    StudentFeeAssignmentUpdate,
    StudentFeeAssignmentResponse,
)

from .invoice import (
    InvoiceItemBase,
    InvoiceItemCreate,
    InvoiceItemResponse,
    InvoiceBase,
    InvoiceCreate,
    InvoiceUpdate,
    InvoiceResponse,
    InvoiceListResponse,
)

from .payment import (
    PaymentBase,
    PaymentCreate,
    PaymentUpdate,
    PaymentResponse,
    PaymentListResponse,
)

from .receipt import (
    PaymentReceiptBase,
    PaymentReceiptResponse,
)

from .ledger import (
    StudentFeeLedgerResponse,
    StudentFeeLedgerSummary,
)

__all__ = [
    # Fee Type
    "FeeTypeBase",
    "FeeTypeCreate",
    "FeeTypeUpdate",
    "FeeTypeResponse",

    # Fee Structure
    "FeeStructureBase",
    "FeeStructureCreate",
    "FeeStructureUpdate",
    "FeeStructureResponse",

    # Student Fee Assignment
    "StudentFeeAssignmentBase",
    "StudentFeeAssignmentCreate",
    "StudentFeeAssignmentUpdate",
    "StudentFeeAssignmentResponse",

    # Invoice
    "InvoiceItemBase",
    "InvoiceItemCreate",
    "InvoiceItemResponse",
    "InvoiceBase",
    "InvoiceCreate",
    "InvoiceUpdate",
    "InvoiceResponse",
    "InvoiceListResponse",

    # Payment
    "PaymentBase",
    "PaymentCreate",
    "PaymentUpdate",
    "PaymentResponse",
    "PaymentListResponse",

    # Receipt
    "PaymentReceiptBase",
    "PaymentReceiptResponse",

    # Ledger
    "StudentFeeLedgerResponse",
    "StudentFeeLedgerSummary",
]
