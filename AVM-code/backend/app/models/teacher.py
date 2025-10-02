from sqlalchemy import Column, Integer, String, DateTime, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base

class Teacher(Base):
    __tablename__ = "teachers"

    id = Column(Integer, primary_key=True, index=True)
    unique_id = Column(String(20), unique=True, index=True)  # AVM-TCH-001, AVM-TCH-002, etc.
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    full_name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True)
    phone_number = Column(String(15), unique=True)
    subjects = Column(JSON)  # ["Mathematics", "Science"]
    classes_assigned = Column(JSON)  # ["Class 7A", "Class 8B"]
    qualification = Column(String(200))
    experience_years = Column(Integer)
    address = Column(Text)
    emergency_contact = Column(String(15))
    joining_date = Column(DateTime(timezone=True))
    is_active = Column(String(10), default="Active")  # Active, Inactive, On Leave
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    attendance_marked = relationship("Attendance", back_populates="teacher")
    attendance_records = relationship("TeacherAttendance", back_populates="teacher", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Teacher(unique_id={self.unique_id}, full_name={self.full_name}, subjects={self.subjects})>"