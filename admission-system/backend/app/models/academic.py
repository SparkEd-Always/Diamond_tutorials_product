from sqlalchemy import Column, Integer, String, Date, DateTime, Boolean, ForeignKey, Numeric
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..core.database import Base

class AcademicYear(Base):
    __tablename__ = "academic_years"

    id = Column(Integer, primary_key=True, index=True)
    year_name = Column(String(20), nullable=False)  # e.g., "2024-25"
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    is_current = Column(Boolean, default=False)
    admission_start_date = Column(Date)
    admission_end_date = Column(Date)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<AcademicYear {self.year_name}>"

class Class(Base):
    __tablename__ = "classes"

    id = Column(Integer, primary_key=True, index=True)
    academic_year_id = Column(Integer, ForeignKey("academic_years.id"))
    class_name = Column(String(50), nullable=False)  # e.g., "Class 1", "Pre-KG"
    class_order = Column(Integer)  # For sorting: 1, 2, 3... 10, 11, 12
    capacity = Column(Integer, default=30)
    age_min = Column(Integer)
    age_max = Column(Integer)
    admission_fee = Column(Numeric(10, 2))
    annual_fee = Column(Numeric(10, 2))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    academic_year = relationship("AcademicYear", backref="classes")

    def __repr__(self):
        return f"<Class {self.class_name}>"

class Section(Base):
    __tablename__ = "sections"

    id = Column(Integer, primary_key=True, index=True)
    class_id = Column(Integer, ForeignKey("classes.id"))
    section_name = Column(String(10), nullable=False)  # A, B, C, etc.
    capacity = Column(Integer, default=30)
    class_teacher_id = Column(Integer, ForeignKey("users.id"))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    class_ = relationship("Class", backref="sections")
    class_teacher = relationship("User")

    def __repr__(self):
        return f"<Section {self.section_name}>"
