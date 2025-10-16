"""
Parent and Guardian Models
Manages parent/guardian information and student-parent relationships
"""

from sqlalchemy import Column, String, Boolean, Enum as SQLAlchemyEnum, DateTime, ForeignKey, Numeric, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from app.database import Base


class RelationshipTypeEnum(str, enum.Enum):
    """Relationship type enumeration"""
    FATHER = "Father"
    MOTHER = "Mother"
    GUARDIAN = "Guardian"
    GRANDFATHER = "Grandfather"
    GRANDMOTHER = "Grandmother"
    UNCLE = "Uncle"
    AUNT = "Aunt"
    OTHER = "Other"


class CustodyStatusEnum(str, enum.Enum):
    """Custody status enumeration"""
    FULL = "Full"
    JOINT = "Joint"
    NON_CUSTODIAL = "Non-custodial"
    LEGAL_GUARDIAN = "Legal Guardian"


class Parent(Base):
    """
    Parent/Guardian model for storing parent and guardian information.

    A parent can be linked to multiple students, and a student can have
    multiple parents/guardians through the StudentParentRelationship table.
    """
    __tablename__ = "parents_guardians"

    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Personal Information
    title = Column(String(10), nullable=True)  # Mr., Mrs., Ms., Dr.
    first_name = Column(String(100), nullable=False, index=True)
    middle_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=False, index=True)

    # Contact Information
    email = Column(String(255), unique=True, nullable=True, index=True)
    phone_primary = Column(String(20), nullable=False)
    phone_secondary = Column(String(20), nullable=True)

    # Professional Information
    occupation = Column(String(100), nullable=True)
    employer_name = Column(String(200), nullable=True)
    annual_income = Column(Numeric(12, 2), nullable=True)  # For fee concession purposes
    education_level = Column(String(50), nullable=True)

    # Access and Permissions
    is_primary_contact = Column(Boolean, default=False, nullable=False)
    can_pickup_student = Column(Boolean, default=True, nullable=False)

    # Government IDs
    aadhar_number = Column(String(12), unique=True, nullable=True)
    pan_number = Column(String(10), unique=True, nullable=True)

    # Profile Photo
    photo_url = Column(String(500), nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    deleted_at = Column(DateTime, nullable=True, index=True)  # Soft delete

    # Audit Fields
    created_by = Column(UUID(as_uuid=True), nullable=True)
    updated_by = Column(UUID(as_uuid=True), nullable=True)

    # Relationships
    # students = relationship("StudentParentRelationship", back_populates="parent")

    def __repr__(self):
        return f"<Parent(id={self.id}, name={self.first_name} {self.last_name}, email={self.email})>"

    @property
    def full_name(self) -> str:
        """Get full name of the parent"""
        if self.middle_name:
            return f"{self.first_name} {self.middle_name} {self.last_name}"
        return f"{self.first_name} {self.last_name}"

    @property
    def display_name(self) -> str:
        """Get display name with title"""
        if self.title:
            return f"{self.title} {self.full_name}"
        return self.full_name


class StudentParentRelationship(Base):
    """
    Many-to-many relationship table between Students and Parents/Guardians.

    This table manages the relationships between students and their parents/guardians,
    including custody status, emergency contact priority, and relationship type.
    """
    __tablename__ = "student_parent_relationships"

    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Foreign Keys
    student_id = Column(
        UUID(as_uuid=True),
        ForeignKey("students.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    parent_id = Column(
        UUID(as_uuid=True),
        ForeignKey("parents_guardians.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Relationship Details
    relationship_type = Column(
        SQLAlchemyEnum(RelationshipTypeEnum),
        nullable=False
    )

    # Custody and Contact Information
    is_custodial_parent = Column(Boolean, default=True, nullable=False)
    is_emergency_contact = Column(Boolean, default=True, nullable=False)
    custody_status = Column(
        SQLAlchemyEnum(CustodyStatusEnum),
        nullable=True
    )

    # Priority for emergency contacts (1 = highest priority)
    emergency_contact_priority = Column(Integer, default=1, nullable=False)

    # Living with student
    lives_with_student = Column(Boolean, default=True, nullable=False)

    # Additional Notes
    notes = Column(String(500), nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    # student = relationship("Student", back_populates="parents")
    # parent = relationship("Parent", back_populates="students")

    def __repr__(self):
        return f"<StudentParentRelationship(student_id={self.student_id}, parent_id={self.parent_id}, type={self.relationship_type})>"


# Indexes
from sqlalchemy import Index

# Composite index for student-parent lookups
Index('idx_student_parent', StudentParentRelationship.student_id, StudentParentRelationship.parent_id)

# Index for parent name searches
Index('idx_parent_name', Parent.first_name, Parent.last_name)

# Index for email lookups
Index('idx_parent_email', Parent.email)
