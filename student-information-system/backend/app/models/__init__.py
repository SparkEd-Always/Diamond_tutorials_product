"""
Database Models
SQLAlchemy ORM models for the Student Information System
"""

from app.models.student import Student
from app.models.parent import Parent, StudentParentRelationship
from app.models.academic import AcademicRecord
from app.models.attendance import AttendanceRecord

__all__ = [
    "Student",
    "Parent",
    "StudentParentRelationship",
    "AcademicRecord",
    "AttendanceRecord",
]
