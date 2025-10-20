from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, DateTime, Numeric, Enum as SQLEnum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from ..core.database import Base

class StudentStatus(str, enum.Enum):
    APPLICANT = "applicant"
    ENROLLED = "enrolled"
    GRADUATED = "graduated"
    TRANSFERRED = "transferred"
    DROPPED = "dropped"

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    student_id = Column(String(20), unique=True, index=True)  # Generated student ID
    admission_number = Column(String(20), unique=True, index=True)  # Official admission number

    # Student personal information (added for fee sessions)
    first_name = Column(String(100))
    last_name = Column(String(100))
    roll_number = Column(String(20))

    # Class assignment
    current_class_id = Column(Integer, ForeignKey("classes.id"))

    # Status
    status = Column(SQLEnum(StudentStatus, native_enum=False, values_callable=lambda x: [e.value for e in x]), default=StudentStatus.APPLICANT)
    is_active = Column(Boolean, default=True)

    # Other information
    blood_group = Column(String(10))
    medical_conditions = Column(Text)
    emergency_contact_name = Column(String(100))
    emergency_contact_phone = Column(String(20))
    previous_school_name = Column(String(200))
    previous_school_address = Column(Text)
    transport_required = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", backref="student")
    current_class = relationship("Class", foreign_keys=[current_class_id])

    def __repr__(self):
        return f"<Student {self.student_id}>"

class Parent(Base):
    __tablename__ = "parents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    occupation = Column(String(100))
    employer_name = Column(String(200))
    annual_income = Column(Numeric(12, 2))
    education_qualification = Column(String(100))
    is_primary_contact = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", backref="parent")

    def __repr__(self):
        return f"<Parent ID:{self.id}>"

class StudentParent(Base):
    __tablename__ = "student_parents"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"))
    parent_id = Column(Integer, ForeignKey("parents.id", ondelete="CASCADE"))
    relationship_type = Column(SQLEnum(enum.Enum("RelationType", {
        "FATHER": "father",
        "MOTHER": "mother",
        "GUARDIAN": "guardian",
        "OTHER": "other"
    })), nullable=False)
    is_primary = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    student = relationship("Student", backref="parent_relationships")
    parent = relationship("Parent", backref="student_relationships")

    def __repr__(self):
        return f"<StudentParent Student:{self.student_id} Parent:{self.parent_id}>"
