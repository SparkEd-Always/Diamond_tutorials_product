from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class AdmissionWorkflowStep(Base):
    """
    Configurable admission workflow steps.
    Admins can customize the admission process by adding/editing/reordering steps.
    """
    __tablename__ = "admission_workflow_steps"

    id = Column(Integer, primary_key=True, index=True)
    step_name = Column(String(100), nullable=False)
    step_description = Column(Text)
    step_order = Column(Integer, nullable=False, index=True)  # Sequence in the workflow
    is_required = Column(Boolean, default=True)  # Required or optional step
    is_active = Column(Boolean, default=True)  # Active steps are shown in the workflow

    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_by = Column(Integer, ForeignKey("users.id"))

    # Relationships
    creator = relationship("User", foreign_keys=[created_by])

    def __repr__(self):
        return f"<AdmissionWorkflowStep {self.step_order}. {self.step_name}>"


class ApplicationWorkflowProgress(Base):
    """
    Tracks an application's progress through the workflow steps.
    Each application will have multiple progress records (one per step).
    """
    __tablename__ = "application_workflow_progress"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("admission_applications.id", ondelete="CASCADE"), index=True)
    workflow_step_id = Column(Integer, ForeignKey("admission_workflow_steps.id"), index=True)

    # Status of this step for this application
    is_completed = Column(Boolean, default=False)
    is_current = Column(Boolean, default=False)  # Currently active step
    completed_at = Column(DateTime(timezone=True))
    completed_by = Column(Integer, ForeignKey("users.id"))

    # Additional notes for this step
    notes = Column(Text)

    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    application = relationship("AdmissionApplication", backref="workflow_progress")
    workflow_step = relationship("AdmissionWorkflowStep")
    completed_by_user = relationship("User", foreign_keys=[completed_by])

    def __repr__(self):
        return f"<ApplicationWorkflowProgress App:{self.application_id} Step:{self.workflow_step_id} Completed:{self.is_completed}>"
