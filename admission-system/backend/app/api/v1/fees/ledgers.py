"""
Student Ledgers API Routes

Endpoints for viewing student fee ledgers and outstanding balances
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ....core.database import get_db
from ....core.security import get_current_user
from ....models.user import User
from ....models.fees import StudentFeeLedger
from ....schemas.fees import StudentFeeLedgerResponse, StudentFeeLedgerSummary

router = APIRouter()


@router.get("/{student_id}", response_model=StudentFeeLedgerResponse)
async def get_student_ledger(
    student_id: int,
    academic_year_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get student fee ledger with complete details
    """
    query = db.query(StudentFeeLedger).filter(StudentFeeLedger.student_id == student_id)

    if academic_year_id:
        query = query.filter(StudentFeeLedger.academic_year_id == academic_year_id)

    ledger = query.first()

    if not ledger:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ledger for student ID {student_id} not found"
        )

    return ledger


@router.get("/summary/list", response_model=List[StudentFeeLedgerSummary])
async def list_ledger_summaries(
    academic_year_id: Optional[int] = None,
    has_outstanding: Optional[bool] = None,
    has_overdue: Optional[bool] = None,
    is_defaulter: Optional[bool] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List student ledger summaries with filtering

    **Query Parameters:**
    - `academic_year_id`: Filter by academic year
    - `has_outstanding`: Filter by outstanding balance status
    - `has_overdue`: Filter by overdue payment status
    - `is_defaulter`: Filter by defaulter status (90+ days overdue)
    - `skip`: Number of records to skip (pagination)
    - `limit`: Maximum records to return (max 100)
    """
    query = db.query(StudentFeeLedger)

    # Apply filters
    if academic_year_id:
        query = query.filter(StudentFeeLedger.academic_year_id == academic_year_id)

    if has_outstanding is not None:
        query = query.filter(StudentFeeLedger.has_outstanding == has_outstanding)

    if has_overdue is not None:
        query = query.filter(StudentFeeLedger.has_overdue == has_overdue)

    if is_defaulter is not None:
        query = query.filter(StudentFeeLedger.is_defaulter == is_defaulter)

    # Apply pagination
    ledgers = query.offset(skip).limit(limit).all()

    return ledgers


@router.get("/defaulters/list", response_model=List[StudentFeeLedgerSummary])
async def list_defaulters(
    academic_year_id: Optional[int] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List students with 90+ days overdue payments (defaulters)
    """
    query = db.query(StudentFeeLedger).filter(StudentFeeLedger.is_defaulter == True)

    if academic_year_id:
        query = query.filter(StudentFeeLedger.academic_year_id == academic_year_id)

    # Order by outstanding amount (highest first)
    query = query.order_by(StudentFeeLedger.total_outstanding.desc())

    # Apply pagination
    defaulters = query.offset(skip).limit(limit).all()

    return defaulters
