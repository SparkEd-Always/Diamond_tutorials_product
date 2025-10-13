"""
Pydantic schemas for Form Configuration API
"""
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


# ============= Form Field Schemas =============

class FormFieldMasterResponse(BaseModel):
    id: int
    field_code: str
    field_label: str
    field_type: str
    category: str
    default_step: int
    is_required_by_default: bool
    validation_rules: Optional[Dict[str, Any]] = None
    help_text: Optional[str] = None
    placeholder: Optional[str] = None
    options: Optional[List[str]] = None
    file_config: Optional[Dict[str, Any]] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ============= Form Configuration Schemas (Named Forms) =============

class FormConfigurationCreate(BaseModel):
    form_name: str
    form_description: Optional[str] = None
    is_active: bool = True
    template_id: Optional[int] = None  # Optional template to start from


class FormConfigurationUpdate(BaseModel):
    form_name: Optional[str] = None
    form_description: Optional[str] = None
    is_active: Optional[bool] = None


class FormConfigurationResponse(BaseModel):
    id: int
    school_id: int
    form_name: str
    form_description: Optional[str]
    is_active: bool
    created_by: Optional[int]
    created_at: datetime
    updated_at: Optional[datetime]
    field_count: int = 0  # Computed field

    class Config:
        from_attributes = True


class FormConfigurationDetailResponse(BaseModel):
    id: int
    school_id: int
    form_name: str
    form_description: Optional[str]
    is_active: bool
    created_by: Optional[int]
    created_at: datetime
    updated_at: Optional[datetime]
    field_configurations: List["SchoolFormConfigResponse"]

    class Config:
        from_attributes = True


# ============= School Form Configuration Schemas =============

class SchoolFormConfigCreate(BaseModel):
    field_id: int
    is_enabled: bool = True
    is_required: Optional[bool] = None
    step_number: int
    display_order: int
    conditional_logic: Optional[Dict[str, Any]] = None
    custom_label: Optional[str] = None
    custom_help_text: Optional[str] = None


class SchoolFormConfigUpdate(BaseModel):
    is_enabled: Optional[bool] = None
    is_required: Optional[bool] = None
    step_number: Optional[int] = None
    display_order: Optional[int] = None
    conditional_logic: Optional[Dict[str, Any]] = None
    custom_label: Optional[str] = None
    custom_help_text: Optional[str] = None


class SchoolFormConfigResponse(BaseModel):
    id: int
    form_config_id: int  # NEW - links to specific form
    school_id: int
    field_id: int
    is_enabled: bool
    is_required: Optional[bool]
    step_number: int
    display_order: int
    conditional_logic: Optional[Dict[str, Any]] = None
    custom_label: Optional[str] = None
    custom_help_text: Optional[str] = None
    created_at: datetime

    # Include field details
    field: FormFieldMasterResponse

    class Config:
        from_attributes = True


# ============= Template Schemas =============

class FormTemplateResponse(BaseModel):
    id: int
    template_name: str
    template_code: str
    description: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class FormTemplateFieldResponse(BaseModel):
    id: int
    template_id: int
    field_id: int
    is_enabled: bool
    is_required: Optional[bool]
    step_number: int
    display_order: int
    field: FormFieldMasterResponse

    class Config:
        from_attributes = True


class FormTemplateDetailResponse(BaseModel):
    id: int
    template_name: str
    template_code: str
    description: Optional[str]
    is_active: bool
    created_at: datetime
    template_fields: List[FormTemplateFieldResponse]

    class Config:
        from_attributes = True


# ============= Apply Template Request =============

class ApplyTemplateRequest(BaseModel):
    template_id: int


# ============= School Configuration Summary =============

class SchoolFormConfigSummary(BaseModel):
    total_fields: int
    enabled_fields: int
    required_fields: int
    fields_by_step: Dict[int, int]  # {step_number: field_count}
    fields_by_category: Dict[str, int]  # {category: field_count}


# ============= Bulk Update =============

class BulkFieldUpdate(BaseModel):
    field_configs: List[SchoolFormConfigCreate]
