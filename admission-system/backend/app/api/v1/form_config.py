"""
Form Configuration API Endpoints
Allows admins to configure application forms by selecting fields from master list
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from ...core.database import get_db
from ...core.security import get_current_user
from ...models.user import User, UserRole
from ...models.form_configuration import (
    FormFieldMaster,
    SchoolFormConfiguration,
    FormConfiguration,
    FormTemplate,
    FormTemplateField
)
from ...schemas.form_config import (
    FormFieldMasterResponse,
    SchoolFormConfigCreate,
    SchoolFormConfigUpdate,
    SchoolFormConfigResponse,
    FormConfigurationCreate,
    FormConfigurationUpdate,
    FormConfigurationResponse,
    FormConfigurationDetailResponse,
    FormTemplateResponse,
    FormTemplateDetailResponse,
    ApplyTemplateRequest,
    SchoolFormConfigSummary,
    BulkFieldUpdate
)

router = APIRouter()

# For now, we'll use school_id = 1 (default school)
# In production, extract from JWT token or subdomain
DEFAULT_SCHOOL_ID = 1


# ============= Form Configuration Management Endpoints =============

@router.get("/forms", response_model=List[FormConfigurationResponse])
async def get_all_forms(
    is_active: bool = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all form configurations for the current school"""
    school_id = DEFAULT_SCHOOL_ID
    query = db.query(FormConfiguration).filter(FormConfiguration.school_id == school_id)

    if is_active is not None:
        query = query.filter(FormConfiguration.is_active == is_active)

    forms = query.order_by(FormConfiguration.created_at.desc()).all()

    # Add field_count to each form
    result = []
    for form in forms:
        form_dict = {
            "id": form.id,
            "school_id": form.school_id,
            "form_name": form.form_name,
            "form_description": form.form_description,
            "is_active": form.is_active,
            "created_by": form.created_by,
            "created_at": form.created_at,
            "updated_at": form.updated_at,
            "field_count": db.query(SchoolFormConfiguration).filter(SchoolFormConfiguration.form_config_id == form.id).count()
        }
        result.append(FormConfigurationResponse(**form_dict))

    return result


@router.get("/forms/{form_id}", response_model=FormConfigurationDetailResponse)
async def get_form_by_id(
    form_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get specific form with all its field configurations"""
    school_id = DEFAULT_SCHOOL_ID
    form = db.query(FormConfiguration).filter(
        FormConfiguration.id == form_id,
        FormConfiguration.school_id == school_id
    ).first()

    if not form:
        raise HTTPException(status_code=404, detail="Form not found")

    return form


@router.post("/forms", response_model=FormConfigurationResponse)
async def create_form(
    form_data: FormConfigurationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new form configuration, optionally from a template"""
    school_id = DEFAULT_SCHOOL_ID

    # Create form
    new_form = FormConfiguration(
        school_id=school_id,
        form_name=form_data.form_name,
        form_description=form_data.form_description,
        is_active=form_data.is_active,
        created_by=current_user.id
    )
    db.add(new_form)
    db.commit()
    db.refresh(new_form)

    # If template_id provided, copy fields from template
    if form_data.template_id:
        template_fields = db.query(FormTemplateField).filter(
            FormTemplateField.template_id == form_data.template_id
        ).all()

        for template_field in template_fields:
            field_config = SchoolFormConfiguration(
                form_config_id=new_form.id,
                school_id=school_id,
                field_id=template_field.field_id,
                is_enabled=template_field.is_enabled,
                is_required=template_field.is_required,
                step_number=template_field.step_number,
                display_order=template_field.display_order
            )
            db.add(field_config)

        db.commit()

    # Return with field_count
    field_count = db.query(SchoolFormConfiguration).filter(
        SchoolFormConfiguration.form_config_id == new_form.id
    ).count()

    return FormConfigurationResponse(
        id=new_form.id,
        school_id=new_form.school_id,
        form_name=new_form.form_name,
        form_description=new_form.form_description,
        is_active=new_form.is_active,
        created_by=new_form.created_by,
        created_at=new_form.created_at,
        updated_at=new_form.updated_at,
        field_count=field_count
    )


@router.put("/forms/{form_id}", response_model=FormConfigurationResponse)
async def update_form(
    form_id: int,
    form_data: FormConfigurationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update form name, description, or active status"""
    school_id = DEFAULT_SCHOOL_ID
    form = db.query(FormConfiguration).filter(
        FormConfiguration.id == form_id,
        FormConfiguration.school_id == school_id
    ).first()

    if not form:
        raise HTTPException(status_code=404, detail="Form not found")

    # Update fields
    if form_data.form_name is not None:
        form.form_name = form_data.form_name
    if form_data.form_description is not None:
        form.form_description = form_data.form_description
    if form_data.is_active is not None:
        form.is_active = form_data.is_active

    db.commit()
    db.refresh(form)

    field_count = db.query(SchoolFormConfiguration).filter(
        SchoolFormConfiguration.form_config_id == form.id
    ).count()

    return FormConfigurationResponse(
        id=form.id,
        school_id=form.school_id,
        form_name=form.form_name,
        form_description=form.form_description,
        is_active=form.is_active,
        created_by=form.created_by,
        created_at=form.created_at,
        updated_at=form.updated_at,
        field_count=field_count
    )


@router.delete("/forms/{form_id}")
async def delete_form(
    form_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a form configuration and all its field configurations"""
    school_id = DEFAULT_SCHOOL_ID
    form = db.query(FormConfiguration).filter(
        FormConfiguration.id == form_id,
        FormConfiguration.school_id == school_id
    ).first()

    if not form:
        raise HTTPException(status_code=404, detail="Form not found")

    # Delete form (cascade will delete field_configurations)
    db.delete(form)
    db.commit()

    return {"message": f"Form '{form.form_name}' deleted successfully"}


# ============= Master Fields Endpoints =============

@router.get("/fields/master", response_model=List[FormFieldMasterResponse])
async def get_master_fields(
    category: str = None,
    is_active: bool = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all master fields available for configuration.
    Optional filtering by category.
    """
    query = db.query(FormFieldMaster)

    if is_active is not None:
        query = query.filter(FormFieldMaster.is_active == is_active)

    if category:
        query = query.filter(FormFieldMaster.category == category)

    fields = query.order_by(FormFieldMaster.category, FormFieldMaster.default_step).all()
    return fields


@router.get("/fields/categories")
async def get_field_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get list of all field categories
    """
    categories = db.query(FormFieldMaster.category, func.count(FormFieldMaster.id))\
        .group_by(FormFieldMaster.category)\
        .all()

    return [{"category": cat, "field_count": count} for cat, count in categories]


# ============= School Configuration Endpoints =============

@router.get("/school/config", response_model=List[SchoolFormConfigResponse])
async def get_school_form_config(
    form_config_id: int = None,
    step_number: int = None,
    category: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get current school's form configuration.
    Returns fields configured for this school with their settings.
    """
    school_id = DEFAULT_SCHOOL_ID  # TODO: Get from user context

    query = db.query(SchoolFormConfiguration)\
        .filter(SchoolFormConfiguration.school_id == school_id)\
        .join(FormFieldMaster)

    if form_config_id:
        query = query.filter(SchoolFormConfiguration.form_config_id == form_config_id)

    if step_number:
        query = query.filter(SchoolFormConfiguration.step_number == step_number)

    if category:
        query = query.filter(FormFieldMaster.category == category)

    configs = query.order_by(
        SchoolFormConfiguration.step_number,
        SchoolFormConfiguration.display_order
    ).all()

    return configs


@router.get("/school/config/summary", response_model=SchoolFormConfigSummary)
async def get_school_config_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get summary statistics of school's form configuration
    """
    school_id = DEFAULT_SCHOOL_ID

    configs = db.query(SchoolFormConfiguration)\
        .join(FormFieldMaster)\
        .filter(SchoolFormConfiguration.school_id == school_id)\
        .all()

    total_fields = len(configs)
    enabled_fields = sum(1 for c in configs if c.is_enabled)
    required_fields = sum(1 for c in configs if c.is_required)

    # Count by step
    fields_by_step = {}
    for config in configs:
        if config.is_enabled:
            step = config.step_number
            fields_by_step[step] = fields_by_step.get(step, 0) + 1

    # Count by category
    fields_by_category = {}
    for config in configs:
        if config.is_enabled:
            cat = config.field.category
            fields_by_category[cat] = fields_by_category.get(cat, 0) + 1

    return SchoolFormConfigSummary(
        total_fields=total_fields,
        enabled_fields=enabled_fields,
        required_fields=required_fields,
        fields_by_step=fields_by_step,
        fields_by_category=fields_by_category
    )


@router.post("/school/config", response_model=SchoolFormConfigResponse)
async def create_field_config(
    config: SchoolFormConfigCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Add a field to school's form configuration (Admin only)
    """
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
        raise HTTPException(status_code=403, detail="Admin access required")

    school_id = DEFAULT_SCHOOL_ID

    # Check if field already configured
    existing = db.query(SchoolFormConfiguration)\
        .filter(
            SchoolFormConfiguration.school_id == school_id,
            SchoolFormConfiguration.field_id == config.field_id
        ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Field already configured for this school")

    # Create configuration
    new_config = SchoolFormConfiguration(
        school_id=school_id,
        **config.dict()
    )
    db.add(new_config)
    db.commit()
    db.refresh(new_config)

    return new_config


@router.put("/school/config/{config_id}", response_model=SchoolFormConfigResponse)
async def update_field_config(
    config_id: int,
    config_update: SchoolFormConfigUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update a field's configuration (Admin only)
    """
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
        raise HTTPException(status_code=403, detail="Admin access required")

    school_id = DEFAULT_SCHOOL_ID

    config = db.query(SchoolFormConfiguration)\
        .filter(
            SchoolFormConfiguration.id == config_id,
            SchoolFormConfiguration.school_id == school_id
        ).first()

    if not config:
        raise HTTPException(status_code=404, detail="Configuration not found")

    # Update fields
    for field, value in config_update.dict(exclude_unset=True).items():
        setattr(config, field, value)

    db.commit()
    db.refresh(config)

    return config


@router.delete("/school/config/{config_id}")
async def delete_field_config(
    config_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Remove a field from school's configuration (Admin only)
    """
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
        raise HTTPException(status_code=403, detail="Admin access required")

    school_id = DEFAULT_SCHOOL_ID

    config = db.query(SchoolFormConfiguration)\
        .filter(
            SchoolFormConfiguration.id == config_id,
            SchoolFormConfiguration.school_id == school_id
        ).first()

    if not config:
        raise HTTPException(status_code=404, detail="Configuration not found")

    db.delete(config)
    db.commit()

    return {"message": "Field configuration deleted successfully"}


@router.post("/school/config/bulk")
async def bulk_update_config(
    bulk_update: BulkFieldUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Bulk update/create field configurations
    Useful for applying templates or reordering multiple fields
    """
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
        raise HTTPException(status_code=403, detail="Admin access required")

    school_id = DEFAULT_SCHOOL_ID

    created_count = 0
    updated_count = 0

    for field_config in bulk_update.field_configs:
        # Check if exists
        existing = db.query(SchoolFormConfiguration)\
            .filter(
                SchoolFormConfiguration.school_id == school_id,
                SchoolFormConfiguration.field_id == field_config.field_id
            ).first()

        if existing:
            # Update
            for field, value in field_config.dict(exclude={'field_id'}).items():
                setattr(existing, field, value)
            updated_count += 1
        else:
            # Create
            new_config = SchoolFormConfiguration(
                school_id=school_id,
                **field_config.dict()
            )
            db.add(new_config)
            created_count += 1

    db.commit()

    return {
        "message": "Bulk update successful",
        "created": created_count,
        "updated": updated_count
    }


# ============= Template Endpoints =============

@router.get("/templates", response_model=List[FormTemplateResponse])
async def get_templates(
    is_active: bool = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all available form templates
    """
    query = db.query(FormTemplate)

    if is_active is not None:
        query = query.filter(FormTemplate.is_active == is_active)

    templates = query.all()
    return templates


@router.get("/templates/{template_id}", response_model=FormTemplateDetailResponse)
async def get_template_detail(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get detailed template configuration including all fields
    """
    template = db.query(FormTemplate)\
        .filter(FormTemplate.id == template_id)\
        .first()

    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    return template


@router.post("/templates/apply")
async def apply_template(
    request: ApplyTemplateRequest,
    form_config_id: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Apply a template to school's form configuration.
    This will replace current configuration with template fields.
    """
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
        raise HTTPException(status_code=403, detail="Admin access required")

    school_id = DEFAULT_SCHOOL_ID

    # Get template
    template = db.query(FormTemplate)\
        .filter(FormTemplate.id == request.template_id)\
        .first()

    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    # If form_config_id provided, apply to that form, otherwise use/create default
    if not form_config_id:
        # Find default form or create one
        form = db.query(FormConfiguration).filter(FormConfiguration.school_id == school_id).first()
        if not form:
            form = FormConfiguration(
                school_id=school_id,
                form_name="Default Application Form",
                form_description="Default admission form",
                is_active=True,
                created_by=current_user.id
            )
            db.add(form)
            db.commit()
            db.refresh(form)
        form_config_id = form.id

    # Delete existing field configurations for this form
    db.query(SchoolFormConfiguration)\
        .filter(SchoolFormConfiguration.form_config_id == form_config_id)\
        .delete()

    # Apply template fields to school configuration
    template_fields = db.query(FormTemplateField)\
        .filter(FormTemplateField.template_id == template.id)\
        .all()

    for tf in template_fields:
        school_config = SchoolFormConfiguration(
            form_config_id=form_config_id,
            school_id=school_id,
            field_id=tf.field_id,
            is_enabled=tf.is_enabled,
            is_required=tf.is_required,
            step_number=tf.step_number,
            display_order=tf.display_order
        )
        db.add(school_config)

    db.commit()

    return {
        "message": f"Template '{template.template_name}' applied successfully",
        "fields_configured": len(template_fields)
    }
