"""
Fee Management API Routes

This module contains all fee management API endpoints organized by domain.
"""

from fastapi import APIRouter
from .fee_types import router as fee_types_router
from .fee_structures import router as fee_structures_router
from .fee_structures_new import router as fee_structures_new_router
from .fee_sessions import router as fee_sessions_router
from .adhoc_fees import router as adhoc_fees_router
from .assignments import router as assignments_router
from .invoices import router as invoices_router
from .payments_improved import router as payments_router  # Using improved payments API
from .receipts import router as receipts_router
from .ledger import router as ledgers_router

# Create main fees router
router = APIRouter()

# Include all sub-routers with appropriate prefixes and tags
router.include_router(
    fee_types_router,
    prefix="/types",
    tags=["Fee Types"]
)

# Legacy fee structures endpoint (old design)
router.include_router(
    fee_structures_router,
    prefix="/structures/legacy",
    tags=["Fee Structures (Legacy)"]
)

# New fee structures endpoint (refactored with parent-child components)
router.include_router(
    fee_structures_new_router,
    prefix="/structures",
    tags=["Fee Structures"]
)

router.include_router(
    fee_sessions_router,
    prefix="/sessions",
    tags=["Fee Sessions"]
)

router.include_router(
    adhoc_fees_router,
    prefix="/adhoc",
    tags=["Adhoc Fees"]
)

router.include_router(
    assignments_router,
    prefix="/assignments",
    tags=["Student Fee Assignments"]
)

router.include_router(
    invoices_router,
    prefix="/invoices",
    tags=["Invoices"]
)

router.include_router(
    payments_router,
    prefix="/payments",
    tags=["Payments"]
)

router.include_router(
    receipts_router,
    prefix="/receipts",
    tags=["Payment Receipts"]
)

router.include_router(
    ledgers_router,
    prefix="/ledgers",
    tags=["Student Ledgers"]
)

__all__ = ["router"]
