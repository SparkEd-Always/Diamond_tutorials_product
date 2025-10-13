"""
Form Configuration Models
Manages customizable application forms for multi-tenant schools
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..core.database import Base


class FormFieldMaster(Base):
    """
    Master table containing all 162 predefined application form fields.
    Shared across all schools - defines what fields are available.
    """
    __tablename__ = "form_fields_master"

    id = Column(Integer, primary_key=True, index=True)
    field_code = Column(String(100), unique=True, nullable=False, index=True)  # e.g., 'student_first_name'
    field_label = Column(String(200), nullable=False)  # e.g., 'First Name'
    field_type = Column(String(50), nullable=False)  # 'text', 'number', 'date', 'dropdown', 'radio', 'checkbox', 'file', 'email', 'phone', 'textarea'
    category = Column(String(50), nullable=False)  # 'student_info', 'parent_info', 'address', 'academic', 'additional', 'financial', 'sibling', 'documents', 'consent'
    default_step = Column(Integer, default=1)  # Default step number (1-5)
    is_required_by_default = Column(Boolean, default=False)
    validation_rules = Column(JSON, nullable=True)  # {"min_length": 2, "max_length": 50, "pattern": "^[A-Za-z ]+$"}
    help_text = Column(Text, nullable=True)  # Helper text shown to parents
    placeholder = Column(String(200), nullable=True)  # Placeholder text for input field
    options = Column(JSON, nullable=True)  # For dropdown/radio: ["Option 1", "Option 2", "Option 3"]
    file_config = Column(JSON, nullable=True)  # For file upload: {"max_size_mb": 5, "allowed_types": ["pdf", "jpg", "png"]}
    is_active = Column(Boolean, default=True)  # Can be disabled globally
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    school_configurations = relationship("SchoolFormConfiguration", back_populates="field")

    def __repr__(self):
        return f"<FormFieldMaster {self.field_code}>"


class FormConfiguration(Base):
    """
    Named form configurations that admins create.
    E.g., "Class 1-5 Admission", "Class 11-12 Science Form", "Mid-year Transfer"
    Parents can choose which form to fill.
    """
    __tablename__ = "form_configurations"

    id = Column(Integer, primary_key=True, index=True)
    school_id = Column(Integer, ForeignKey("schools.id"), nullable=False, index=True)
    form_name = Column(String(200), nullable=False)  # "Class 1-5 Admission Form"
    form_description = Column(Text, nullable=True)  # Optional description
    is_active = Column(Boolean, default=True)  # Can be shown to parents
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)  # Admin who created it
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    school = relationship("School", back_populates="form_configs")
    field_configurations = relationship("SchoolFormConfiguration", back_populates="form_config", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<FormConfiguration {self.form_name}>"


class SchoolFormConfiguration(Base):
    """
    Per-form field configuration.
    Links a specific form to its enabled/disabled fields.
    """
    __tablename__ = "school_form_configurations"

    id = Column(Integer, primary_key=True, index=True)
    form_config_id = Column(Integer, ForeignKey("form_configurations.id"), nullable=False, index=True)  # NEW
    school_id = Column(Integer, ForeignKey("schools.id"), nullable=False, index=True)
    field_id = Column(Integer, ForeignKey("form_fields_master.id"), nullable=False)

    # Configuration options
    is_enabled = Column(Boolean, default=True)  # Is this field shown for this form?
    is_required = Column(Boolean, nullable=True)  # Override default requirement (None = use default)
    step_number = Column(Integer, nullable=False)  # Which step (1-5)
    display_order = Column(Integer, nullable=False)  # Order within the step

    # Advanced options
    conditional_logic = Column(JSON, nullable=True)  # {"show_if": {"field_code": "has_guardian", "operator": "equals", "value": "Yes"}}
    custom_label = Column(String(200), nullable=True)  # Override field label (optional)
    custom_help_text = Column(Text, nullable=True)  # Override help text (optional)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    form_config = relationship("FormConfiguration", back_populates="field_configurations")
    school = relationship("School", back_populates="form_configurations")
    field = relationship("FormFieldMaster", back_populates="school_configurations")

    def __repr__(self):
        return f"<SchoolFormConfig form_config_id={self.form_config_id} field_id={self.field_id}>"


class FormTemplate(Base):
    """
    Predefined form templates (CBSE, ICSE, State Board, Minimal, Comprehensive)
    Schools can start with a template and customize from there.
    """
    __tablename__ = "form_templates"

    id = Column(Integer, primary_key=True, index=True)
    template_name = Column(String(100), unique=True, nullable=False)  # 'CBSE Standard', 'ICSE Standard'
    template_code = Column(String(50), unique=True, nullable=False)  # 'cbse_standard', 'icse_standard'
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    template_fields = relationship("FormTemplateField", back_populates="template", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<FormTemplate {self.template_name}>"


class FormTemplateField(Base):
    """
    Fields included in each template with their configuration.
    """
    __tablename__ = "form_template_fields"

    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey("form_templates.id"), nullable=False)
    field_id = Column(Integer, ForeignKey("form_fields_master.id"), nullable=False)
    is_enabled = Column(Boolean, default=True)
    is_required = Column(Boolean, nullable=True)  # None = use field default
    step_number = Column(Integer, nullable=False)
    display_order = Column(Integer, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    template = relationship("FormTemplate", back_populates="template_fields")
    field = relationship("FormFieldMaster")

    def __repr__(self):
        return f"<FormTemplateField template_id={self.template_id} field_id={self.field_id}>"


class ApplicationFieldResponse(Base):
    """
    Normalized storage of application responses.
    Each field response is stored separately for better querying.
    """
    __tablename__ = "application_field_responses"

    id = Column(Integer, primary_key=True, index=True)
    school_id = Column(Integer, ForeignKey("schools.id"), nullable=False, index=True)
    application_id = Column(Integer, ForeignKey("admission_applications.id"), nullable=False, index=True)
    field_id = Column(Integer, ForeignKey("form_fields_master.id"), nullable=False)

    # Response data
    response_value = Column(Text, nullable=True)  # Actual answer from parent
    response_json = Column(JSON, nullable=True)  # For complex responses (multiple selections, file metadata)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    school = relationship("School")
    application = relationship("AdmissionApplication")
    field = relationship("FormFieldMaster")

    def __repr__(self):
        return f"<ApplicationFieldResponse app_id={self.application_id} field_id={self.field_id}>"


class School(Base):
    """
    School/Institution table for multi-tenancy.
    Each school can have its own form configuration.
    """
    __tablename__ = "schools"

    id = Column(Integer, primary_key=True, index=True)
    school_name = Column(String(200), nullable=False)
    school_code = Column(String(50), unique=True, nullable=False, index=True)  # e.g., 'abc_school'
    subdomain = Column(String(100), unique=True, nullable=True)  # e.g., 'abc.sparked.com'

    # Contact details
    email = Column(String(200))
    phone = Column(String(20))
    address = Column(Text)

    # Settings
    is_active = Column(Boolean, default=True)
    logo_url = Column(String(500), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    form_configs = relationship("FormConfiguration", back_populates="school", cascade="all, delete-orphan")
    form_configurations = relationship("SchoolFormConfiguration", back_populates="school", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<School {self.school_name}>"
