from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum as SQLEnum, Numeric, Date, Time, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from ..core.database import Base

class ApplicationStatus(str, enum.Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    CHANGES_REQUESTED = "changes_requested"  # NEW: Admin requested changes
    DOCUMENTS_PENDING = "documents_pending"
    TEST_SCHEDULED = "test_scheduled"
    TEST_COMPLETED = "test_completed"
    INTERVIEW_SCHEDULED = "interview_scheduled"
    INTERVIEW_COMPLETED = "interview_completed"
    DECISION_MADE = "decision_made"
    FEE_PENDING = "fee_pending"
    ENROLLED = "enrolled"
    REJECTED = "rejected"
    WAITLISTED = "waitlisted"

class AdmissionApplication(Base):
    __tablename__ = "admission_applications"

    id = Column(Integer, primary_key=True, index=True)
    application_number = Column(String(20), unique=True, nullable=False, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    parent_id = Column(Integer, ForeignKey("parents.id"))
    academic_year_id = Column(Integer, ForeignKey("academic_years.id"))
    class_applying_id = Column(Integer, ForeignKey("classes.id"))
    application_status = Column(SQLEnum(ApplicationStatus), default=ApplicationStatus.DRAFT, index=True)
    submission_date = Column(DateTime(timezone=True))
    review_date = Column(DateTime(timezone=True))
    decision_date = Column(DateTime(timezone=True))
    decision_reason = Column(Text)
    assigned_section_id = Column(Integer, ForeignKey("sections.id"))
    priority_level = Column(Integer, default=1)  # 1=High, 2=Medium, 3=Low
    source = Column(String(50))  # online, walk-in, referral, etc.
    remarks = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    student = relationship("Student", backref="applications")
    parent = relationship("Parent", backref="applications")
    academic_year = relationship("AcademicYear")
    class_applying = relationship("Class")
    assigned_section = relationship("Section")
    # field_reviews = relationship("ApplicationFieldReview", back_populates="application", cascade="all, delete-orphan")
    # reviews = relationship("ApplicationReview", back_populates="application", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<AdmissionApplication {self.application_number} - {self.application_status}>"

class DocumentType(Base):
    __tablename__ = "document_types"

    id = Column(Integer, primary_key=True, index=True)
    type_name = Column(String(100), nullable=False)
    is_mandatory = Column(Boolean, default=True)
    description = Column(Text)
    allowed_formats = Column(String(100))  # pdf,jpg,png
    max_file_size_mb = Column(Integer, default=5)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<DocumentType {self.type_name}>"

class VerificationStatus(str, enum.Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"
    REQUIRES_RESUBMISSION = "requires_resubmission"

class ApplicationDocument(Base):
    __tablename__ = "application_documents"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("admission_applications.id", ondelete="CASCADE"), index=True)
    document_type_id = Column(Integer, ForeignKey("document_types.id"))
    original_filename = Column(String(255))
    stored_filename = Column(String(255), unique=True, nullable=False)
    file_path = Column(Text, nullable=False)
    file_size_kb = Column(Integer)
    mime_type = Column(String(100))
    verification_status = Column(SQLEnum(VerificationStatus), default=VerificationStatus.PENDING)
    verification_notes = Column(Text)
    verified_by = Column(Integer, ForeignKey("users.id"))
    verified_at = Column(DateTime(timezone=True))
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    application = relationship("AdmissionApplication", backref="documents")
    document_type = relationship("DocumentType")
    verifier = relationship("User")

    def __repr__(self):
        return f"<ApplicationDocument {self.original_filename}>"

class TestStatus(str, enum.Enum):
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    ABSENT = "absent"
    CANCELLED = "cancelled"

class AdmissionTest(Base):
    __tablename__ = "admission_tests"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("admission_applications.id"))
    test_type = Column(String(50), nullable=False)  # entrance, aptitude, oral, written
    test_date = Column(Date, nullable=False, index=True)
    test_time = Column(Time, nullable=False)
    duration_minutes = Column(Integer, default=60)
    venue = Column(Text)
    max_score = Column(Numeric(5, 2), default=100.00)
    score_obtained = Column(Numeric(5, 2))
    grade = Column(String(10))  # A+, A, B+, B, C, F
    conducted_by = Column(Integer, ForeignKey("users.id"))
    remarks = Column(Text)
    status = Column(SQLEnum(TestStatus), default=TestStatus.SCHEDULED)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    application = relationship("AdmissionApplication", backref="tests")
    conductor = relationship("User")

    def __repr__(self):
        return f"<AdmissionTest {self.test_type} - {self.test_date}>"

class InterviewStatus(str, enum.Enum):
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    RESCHEDULED = "rescheduled"
    CANCELLED = "cancelled"

class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("admission_applications.id"))
    interview_date = Column(Date, nullable=False, index=True)
    interview_time = Column(Time, nullable=False)
    duration_minutes = Column(Integer, default=30)
    interviewer_id = Column(Integer, ForeignKey("users.id"))
    venue = Column(Text)
    rating = Column(Numeric(3, 2))  # Out of 5.00
    communication_skills = Column(Integer)  # 1-5
    confidence_level = Column(Integer)  # 1-5
    general_knowledge = Column(Integer)  # 1-5
    parent_interaction = Column(Integer)  # 1-5
    overall_impression = Column(SQLEnum(enum.Enum("Impression", {
        "EXCELLENT": "excellent",
        "GOOD": "good",
        "AVERAGE": "average",
        "POOR": "poor"
    })))
    feedback = Column(Text)
    recommendation = Column(SQLEnum(enum.Enum("Recommendation", {
        "STRONGLY_RECOMMEND": "strongly_recommend",
        "RECOMMEND": "recommend",
        "NEUTRAL": "neutral",
        "NOT_RECOMMEND": "not_recommend"
    })))
    status = Column(SQLEnum(InterviewStatus), default=InterviewStatus.SCHEDULED)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    application = relationship("AdmissionApplication", backref="interviews")
    interviewer = relationship("User")

    def __repr__(self):
        return f"<Interview {self.interview_date} - {self.status}>"

class ApplicationStatusHistory(Base):
    __tablename__ = "application_status_history"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("admission_applications.id", ondelete="CASCADE"), index=True)
    previous_status = Column(String(50))
    new_status = Column(String(50), nullable=False)
    changed_by = Column(Integer, ForeignKey("users.id"))
    change_reason = Column(Text)
    change_date = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    application = relationship("AdmissionApplication", backref="status_history")
    user = relationship("User")

    def __repr__(self):
        return f"<StatusHistory {self.previous_status} -> {self.new_status}>"
