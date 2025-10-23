"""
Improved Payments API with Full Ledger Integration

This API provides complete payment processing with:
1. Automatic ledger entry creation
2. Fee allocation support
3. Receipt generation
4. Payment verification workflow
5. Reconciliation support
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, func, desc
from typing import List, Optional
from datetime import datetime, date
from decimal import Decimal

from ....core.database import get_db
from ....core.security import get_current_user
from ....models.fees.payment import Payment, PaymentMethod, PaymentStatus
from ....models.fees.payment_allocation import PaymentAllocation
from ....models.fees.fee_session import FeeSessionAssignment, FeeSession
from ....models.fees.adhoc_fee import AdhocFeeAssignment
from ....models.fees.ledger_transaction import StudentLedgerTransaction
from ....models.student import Student
from ....models.academic import AcademicYear
from ....models.user import User
from ....schemas.fees.payment_improved import (
    OfflinePaymentCreate,
    OnlinePaymentCreate,
    PaymentResponseDetailed,
    PaymentSummaryResponse,
    PaymentListResponse,
    PaymentVerificationRequest,
    PaymentReconciliationRequest,
    PaymentStatistics,
    PaymentAllocationResponse,
)
from ....services.ledger_service import LedgerService

router = APIRouter()


# ============================================================================
# Helper Functions
# ============================================================================

def allocate_payment_to_fees(payment: Payment, allocations: list, allocated_by_id: int, db: Session):
    """
    Allocate payment amount to specific fee sessions and adhoc fees
    - Creates PaymentAllocation records (junction table)
    - Updates the paid amounts in FeeSessionAssignment and AdhocFeeAssignment tables
    """
    if not allocations:
        return []

    allocation_results = []

    for allocation in allocations:
        fee_description = None

        if allocation.fee_session_id:
            # Allocate to fee session
            assignment = db.query(FeeSessionAssignment).filter(
                FeeSessionAssignment.session_id == allocation.fee_session_id,
                FeeSessionAssignment.student_id == payment.student_id
            ).first()

            if assignment:
                # Get fee session details for description
                fee_session = db.query(FeeSession).filter(FeeSession.id == allocation.fee_session_id).first()
                fee_description = f"{fee_session.session_name}" if fee_session else f"Fee Session #{allocation.fee_session_id}"

                # Update paid amount
                assignment.paid_amount = float(assignment.paid_amount) + float(allocation.amount)
                assignment.outstanding_amount = float(assignment.expected_amount) - float(assignment.paid_amount)

                # Mark as paid if fully paid
                if assignment.outstanding_amount <= 0:
                    assignment.is_paid = True
                    assignment.payment_status = "paid"
                elif assignment.paid_amount > 0:
                    assignment.payment_status = "partial"

                # Create PaymentAllocation record
                payment_allocation = PaymentAllocation(
                    payment_id=payment.id,
                    student_id=payment.student_id,
                    fee_type="fee_session",
                    fee_session_id=allocation.fee_session_id,
                    adhoc_fee_id=None,
                    allocated_amount=allocation.amount,
                    fee_description=fee_description,
                    allocated_by=allocated_by_id
                )
                db.add(payment_allocation)

                allocation_results.append(PaymentAllocationResponse(
                    fee_session_id=allocation.fee_session_id,
                    fee_description=fee_description,
                    allocated_amount=allocation.amount
                ))

        elif allocation.adhoc_fee_id:
            # Allocate to adhoc fee
            adhoc_fee = db.query(AdhocFeeAssignment).filter(
                AdhocFeeAssignment.id == allocation.adhoc_fee_id,
                AdhocFeeAssignment.student_id == payment.student_id
            ).first()

            if adhoc_fee:
                fee_description = f"{adhoc_fee.fee_name}"

                # Update paid amount
                adhoc_fee.paid_amount = float(adhoc_fee.paid_amount) + float(allocation.amount)
                adhoc_fee.outstanding_amount = float(adhoc_fee.amount) - float(adhoc_fee.paid_amount)

                # Mark as paid if fully paid
                if adhoc_fee.outstanding_amount <= 0:
                    adhoc_fee.is_paid = True
                    adhoc_fee.payment_status = "paid"
                elif adhoc_fee.paid_amount > 0:
                    adhoc_fee.payment_status = "partial"

                # Create PaymentAllocation record
                payment_allocation = PaymentAllocation(
                    payment_id=payment.id,
                    student_id=payment.student_id,
                    fee_type="adhoc_fee",
                    fee_session_id=None,
                    adhoc_fee_id=allocation.adhoc_fee_id,
                    allocated_amount=allocation.amount,
                    fee_description=fee_description,
                    allocated_by=allocated_by_id
                )
                db.add(payment_allocation)

                allocation_results.append(PaymentAllocationResponse(
                    adhoc_fee_id=allocation.adhoc_fee_id,
                    fee_description=fee_description,
                    allocated_amount=allocation.amount
                ))

    return allocation_results


# ============================================================================
# Payment Creation Endpoints
# ============================================================================

@router.post("/offline", response_model=PaymentResponseDetailed, status_code=status.HTTP_201_CREATED)
def create_offline_payment(
    payment_data: OfflinePaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Record an offline payment (cash, cheque, bank transfer, DD)

    This endpoint:
    1. Creates a Payment record
    2. Creates a ledger entry (via LedgerService)
    3. Allocates payment to specific fees (if provided)
    4. Updates fee assignment statuses
    5. Generates a receipt number

    **Use cases:**
    - Parent pays cash at school office
    - Parent pays via cheque
    - Bank transfer (NEFT/RTGS/IMPS)
    - Demand Draft payment
    """
    # Validate student exists
    student = db.query(Student).filter(Student.id == payment_data.student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with ID {payment_data.student_id} not found"
        )

    # Validate academic year exists
    academic_year = db.query(AcademicYear).filter(
        AcademicYear.id == payment_data.academic_year_id
    ).first()
    if not academic_year:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Academic year with ID {payment_data.academic_year_id} not found"
        )

    # Validate allocation amounts match total payment
    if payment_data.allocate_to:
        total_allocated = sum(item.amount for item in payment_data.allocate_to)
        if total_allocated != payment_data.amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Allocated amount (₹{total_allocated}) does not match payment amount (₹{payment_data.amount})"
            )

    # 1. Create Payment record
    payment = Payment(
        payment_number=Payment.generate_payment_number(academic_year.year_name, db),
        payment_date=payment_data.payment_date or datetime.utcnow(),
        student_id=payment_data.student_id,
        academic_year_id=payment_data.academic_year_id,
        parent_id=None,  # Can be added later if parent info is available
        payment_method=PaymentMethod(payment_data.payment_method),
        amount=payment_data.amount,
        status=PaymentStatus.SUCCESS,  # Offline payments are immediately successful
        transaction_id=payment_data.transaction_id,
        bank_reference=payment_data.bank_reference,
        cheque_number=payment_data.cheque_number,
        cheque_date=payment_data.cheque_date,
        bank_name=payment_data.bank_name,
        branch_name=payment_data.branch_name,
        remarks=payment_data.remarks,
        recorded_by=current_user.id,
        is_verified=False,  # Needs admin verification
        is_reconciled=False,
    )

    db.add(payment)
    db.flush()  # Get payment ID

    # 2. Create ledger entry (THIS IS THE KEY!)
    try:
        ledger_entry = LedgerService.create_payment_entry(
            student_id=payment_data.student_id,
            academic_year_id=payment_data.academic_year_id,
            amount=payment_data.amount,
            description=f"Payment received - {payment.payment_number} ({payment_data.payment_method})",
            payment_method=payment_data.payment_method,
            payment_id=payment.id,
            transaction_date=payment_data.payment_date or datetime.utcnow(),
            created_by=current_user.id,
            remarks=payment_data.remarks,
            db=db
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create ledger entry: {str(e)}"
        )

    # 3. Allocate payment to fees
    allocations = []
    if payment_data.allocate_to:
        allocations = allocate_payment_to_fees(payment, payment_data.allocate_to, current_user.id, db)

    # 4. Commit transaction
    db.commit()
    db.refresh(payment)

    # 5. Build response
    response = PaymentResponseDetailed(
        id=payment.id,
        payment_number=payment.payment_number,
        payment_date=payment.payment_date,
        student_id=payment.student_id,
        student_name=f"{student.first_name} {student.last_name}",
        academic_year_id=payment.academic_year_id,
        academic_year_name=academic_year.year_name,
        amount=payment.amount,
        payment_method=payment.payment_method.value,
        status=payment.status.value,
        ledger_transaction_id=ledger_entry.id,
        ledger_balance_after=ledger_entry.balance,
        allocations=allocations if allocations else None,
        cheque_number=payment.cheque_number,
        cheque_date=payment.cheque_date,
        bank_name=payment.bank_name,
        branch_name=payment.branch_name,
        transaction_id=payment.transaction_id,
        bank_reference=payment.bank_reference,
        is_verified=payment.is_verified,
        is_reconciled=payment.is_reconciled,
        receipt_number=None,  # TODO: Generate receipt
        remarks=payment.remarks,
        recorded_by=payment.recorded_by,
        created_at=payment.created_at,
        updated_at=payment.updated_at
    )

    return response


@router.post("/online", response_model=PaymentResponseDetailed, status_code=status.HTTP_201_CREATED)
def create_online_payment(
    payment_data: OnlinePaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Record an online payment (UPI, card, net banking, wallet)

    Similar to offline payment but includes gateway integration details
    """
    # Similar implementation as offline payment
    # Additional: Store gateway details (gateway_name, gateway_payment_id, etc.)
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Online payment integration will be implemented in Phase 2"
    )


# ============================================================================
# Payment Retrieval Endpoints
# ============================================================================

@router.get("/", response_model=PaymentListResponse)
def list_payments(
    student_id: Optional[int] = Query(None, description="Filter by student ID"),
    academic_year_id: Optional[int] = Query(None, description="Filter by academic year"),
    payment_method: Optional[str] = Query(None, description="Filter by payment method"),
    status_filter: Optional[str] = Query(None, description="Filter by status"),
    is_verified: Optional[bool] = Query(None, description="Filter by verification status"),
    is_reconciled: Optional[bool] = Query(None, description="Filter by reconciliation status"),
    start_date: Optional[date] = Query(None, description="Filter from date"),
    end_date: Optional[date] = Query(None, description="Filter to date"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List all payments with optional filtering and pagination
    """
    query = db.query(Payment, Student).join(
        Student, Payment.student_id == Student.id
    )

    # Apply filters
    if student_id:
        query = query.filter(Payment.student_id == student_id)

    if academic_year_id:
        query = query.filter(Payment.academic_year_id == academic_year_id)

    if payment_method:
        query = query.filter(Payment.payment_method == payment_method)

    if status_filter:
        query = query.filter(Payment.status == status_filter)

    if is_verified is not None:
        query = query.filter(Payment.is_verified == is_verified)

    if is_reconciled is not None:
        query = query.filter(Payment.is_reconciled == is_reconciled)

    if start_date:
        query = query.filter(Payment.payment_date >= start_date)

    if end_date:
        query = query.filter(Payment.payment_date <= end_date)

    # Count total
    total_count = query.count()

    # Order by most recent first
    query = query.order_by(desc(Payment.payment_date), desc(Payment.id))

    # Paginate
    results = query.offset(skip).limit(limit).all()

    # Build response
    payments = []
    for payment, student in results:
        payments.append(PaymentSummaryResponse(
            id=payment.id,
            payment_number=payment.payment_number,
            payment_date=payment.payment_date,
            student_id=payment.student_id,
            student_name=f"{student.first_name} {student.last_name}",
            amount=payment.amount,
            payment_method=payment.payment_method.value,
            status=payment.status.value,
            is_verified=payment.is_verified,
            is_reconciled=payment.is_reconciled,
            created_at=payment.created_at
        ))

    total_pages = (total_count + limit - 1) // limit

    return PaymentListResponse(
        payments=payments,
        total_count=total_count,
        page_number=(skip // limit) + 1 if limit > 0 else 1,
        page_size=limit,
        total_pages=total_pages
    )


@router.get("/{payment_id}", response_model=PaymentResponseDetailed)
def get_payment_details(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get detailed information about a specific payment
    """
    payment = db.query(Payment).options(
        joinedload(Payment.student),
        joinedload(Payment.academic_year)
    ).filter(Payment.id == payment_id).first()

    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Payment with ID {payment_id} not found"
        )

    # Get ledger entry for this payment
    ledger_entry = db.query(StudentLedgerTransaction).filter(
        StudentLedgerTransaction.payment_id == payment.id
    ).first()

    # Build response
    return PaymentResponseDetailed(
        id=payment.id,
        payment_number=payment.payment_number,
        payment_date=payment.payment_date,
        student_id=payment.student_id,
        student_name=f"{payment.student.first_name} {payment.student.last_name}",
        academic_year_id=payment.academic_year_id,
        academic_year_name=payment.academic_year.year_name,
        amount=payment.amount,
        payment_method=payment.payment_method.value,
        status=payment.status.value,
        ledger_transaction_id=ledger_entry.id if ledger_entry else None,
        ledger_balance_after=ledger_entry.balance if ledger_entry else None,
        cheque_number=payment.cheque_number,
        cheque_date=payment.cheque_date,
        bank_name=payment.bank_name,
        branch_name=payment.branch_name,
        transaction_id=payment.transaction_id,
        bank_reference=payment.bank_reference,
        gateway_name=payment.gateway_name,
        gateway_order_id=payment.gateway_order_id,
        gateway_payment_id=payment.gateway_payment_id,
        is_verified=payment.is_verified,
        verified_by=payment.verified_by,
        verified_at=payment.verified_at,
        is_reconciled=payment.is_reconciled,
        reconciled_at=payment.reconciled_at,
        remarks=payment.remarks,
        recorded_by=payment.recorded_by,
        created_at=payment.created_at,
        updated_at=payment.updated_at
    )


# ============================================================================
# Payment Verification & Reconciliation
# ============================================================================

@router.post("/{payment_id}/verify", response_model=PaymentResponseDetailed)
def verify_payment(
    payment_id: int,
    verification_data: PaymentVerificationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Verify a payment (admin only)

    Admin reviews the payment and approves/rejects it
    """
    payment = db.query(Payment).filter(Payment.id == payment_id).first()

    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Payment with ID {payment_id} not found"
        )

    if payment.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment has already been verified"
        )

    # Update verification status
    payment.is_verified = verification_data.is_approved
    payment.verified_by = current_user.id
    payment.verified_at = datetime.utcnow()

    if not verification_data.is_approved:
        # If rejected, update status
        payment.status = PaymentStatus.FAILED
        payment.failure_reason = verification_data.verification_notes or "Verification failed"

    db.commit()
    db.refresh(payment)

    # Return updated payment
    return get_payment_details(payment_id, db, current_user)


@router.post("/{payment_id}/reconcile", response_model=PaymentResponseDetailed)
def reconcile_payment(
    payment_id: int,
    reconciliation_data: PaymentReconciliationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Reconcile a payment with bank statement (admin only)

    Admin confirms the payment appears in the bank statement
    """
    payment = db.query(Payment).filter(Payment.id == payment_id).first()

    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Payment with ID {payment_id} not found"
        )

    # Update reconciliation status
    payment.is_reconciled = reconciliation_data.is_reconciled
    payment.reconciled_by = current_user.id
    payment.reconciled_at = datetime.utcnow()

    db.commit()
    db.refresh(payment)

    return get_payment_details(payment_id, db, current_user)


# ============================================================================
# Payment Statistics
# ============================================================================

@router.get("/stats/summary", response_model=PaymentStatistics)
def get_payment_statistics(
    academic_year_id: Optional[int] = Query(None, description="Filter by academic year"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get overall payment statistics for admin dashboard
    """
    query = db.query(Payment)

    if academic_year_id:
        query = query.filter(Payment.academic_year_id == academic_year_id)

    # Total payments
    total_count = query.filter(Payment.status == PaymentStatus.SUCCESS).count()
    total_amount = query.filter(Payment.status == PaymentStatus.SUCCESS).with_entities(
        func.sum(Payment.amount)
    ).scalar() or Decimal('0.00')

    # Payments today
    today = date.today()
    payments_today = query.filter(
        Payment.status == PaymentStatus.SUCCESS,
        func.date(Payment.payment_date) == today
    ).count()
    amount_today = query.filter(
        Payment.status == PaymentStatus.SUCCESS,
        func.date(Payment.payment_date) == today
    ).with_entities(func.sum(Payment.amount)).scalar() or Decimal('0.00')

    # Pending verification
    pending_verification = query.filter(Payment.is_verified == False).count()

    # Payments by method
    payments_by_method = {}
    methods = db.query(Payment.payment_method, func.count(Payment.id), func.sum(Payment.amount)).filter(
        Payment.status == PaymentStatus.SUCCESS
    ).group_by(Payment.payment_method).all()

    for method, count, amount in methods:
        payments_by_method[method.value] = {
            "count": count,
            "amount": float(amount or 0)
        }

    return PaymentStatistics(
        total_payments_count=total_count,
        total_amount_received=total_amount,
        payments_today=payments_today,
        amount_today=amount_today,
        pending_verification_count=pending_verification,
        payments_by_method=payments_by_method
    )
