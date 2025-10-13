from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ...core.database import get_db
from ...models.academic import AcademicYear, Class
from ...schemas.academic import AcademicYearResponse, ClassResponse

router = APIRouter()

@router.get("/years", response_model=List[AcademicYearResponse])
async def get_academic_years(db: Session = Depends(get_db)):
    """
    Get all academic years
    """
    academic_years = db.query(AcademicYear).order_by(AcademicYear.start_date.desc()).all()
    return academic_years

@router.get("/classes", response_model=List[ClassResponse])
async def get_classes(
    academic_year_id: int = None,
    db: Session = Depends(get_db)
):
    """
    Get all classes, optionally filtered by academic year
    """
    query = db.query(Class).filter(Class.is_active == True)

    if academic_year_id:
        query = query.filter(Class.academic_year_id == academic_year_id)

    classes = query.order_by(Class.class_order).all()
    return classes
