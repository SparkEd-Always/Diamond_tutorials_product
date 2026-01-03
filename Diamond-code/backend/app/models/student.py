from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    unique_id = Column(String(20), unique=True, index=True)  # AVM-STU-001, AVM-STU-002, etc.
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    full_name = Column(String(100), nullable=False)
    date_of_birth = Column(Date)
    gender = Column(String(10))
    class_name = Column(String(20))  # Class 7, 8, 9, 10
    section = Column(String(10))  # A, B, C
    roll_number = Column(String(20))
    admission_date = Column(Date)
    parent_name = Column(String(100))
    parent_phone = Column(String(15))
    parent_email = Column(String(100))
    address = Column(Text)
    emergency_contact = Column(String(15))
    blood_group = Column(String(5))
    is_active = Column(String(10), default="Active")  # Active, Inactive, Graduated
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    attendance_records = relationship("Attendance", back_populates="student")
    communications = relationship("Communication", back_populates="student")

    def __repr__(self):
        return f"<Student(unique_id={self.unique_id}, full_name={self.full_name}, class={self.class_name})>"