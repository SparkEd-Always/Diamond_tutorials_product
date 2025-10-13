from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional
from decimal import Decimal

class AcademicYearResponse(BaseModel):
    id: int
    year_name: str
    start_date: date
    end_date: date
    is_current: bool
    admission_start_date: Optional[date] = None
    admission_end_date: Optional[date] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ClassResponse(BaseModel):
    id: int
    academic_year_id: int
    class_name: str
    class_order: Optional[int] = None
    capacity: Optional[int] = 30
    age_min: Optional[int] = None
    age_max: Optional[int] = None
    admission_fee: Optional[Decimal] = None
    annual_fee: Optional[Decimal] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
