"""
Application Review Models - Field-level reviews and overall application reviews
"""
from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class ApplicationFieldReview(Base):
    """Field-level review comments and correction requests"""
    __tablename__ = "application_field_reviews"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("admission_applications.id", ondelete="CASCADE"), nullable=False, index=True)
    field_name = Column(String(100), nullable=False)  # e.g., "student_first_name", "father_occupation"
    field_label = Column(String(200), nullable=True)  # Human-readable label
    field_value = Column(Text, nullable=True)  # Current value when reviewed
    needs_correction = Column(Boolean, default=False, nullable=False)
    admin_comment = Column(Text, nullable=True)
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    reviewed_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    application = relationship("AdmissionApplication", backref="field_reviews")
    reviewer = relationship("User", foreign_keys=[reviewed_by])


class ApplicationReview(Base):
    """Overall application review with status and remarks"""
    __tablename__ = "application_reviews"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("admission_applications.id", ondelete="CASCADE"), nullable=False, index=True)
    review_status = Column(String(50), nullable=False)  # "in_review", "changes_requested", "approved"
    overall_remarks = Column(Text, nullable=True)
    version_number = Column(Integer, default=1, nullable=False)  # Track resubmissions
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    reviewed_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    application = relationship("AdmissionApplication", backref="reviews")
    reviewer = relationship("User", foreign_keys=[reviewed_by])
