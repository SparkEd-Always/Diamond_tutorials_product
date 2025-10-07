"""
Seed script for creating form templates (CBSE Standard, ICSE Standard, Minimal)
Based on the 56 seeded fields
"""
from sqlalchemy.orm import Session
from app.models.form_configuration import FormTemplate, FormTemplateField, FormFieldMaster
from app.core.database import SessionLocal


def seed_templates(db: Session):
    """
    Create predefined form templates for quick setup
    """

    # Check if already seeded
    existing_count = db.query(FormTemplate).count()
    if existing_count > 0:
        print(f"[OK] Templates already seeded ({existing_count} templates). Skipping.")
        return

    # Get all fields
    all_fields = db.query(FormFieldMaster).all()
    field_map = {f.field_code: f for f in all_fields}

    # ============= Template 1: CBSE Standard (Most comprehensive) =============
    cbse_template = FormTemplate(
        template_name="CBSE Standard",
        template_code="cbse_standard",
        description="Comprehensive application form based on CBSE admission requirements. Includes all essential student, parent, and academic information.",
        is_active=True
    )
    db.add(cbse_template)
    db.flush()

    # CBSE Standard fields (45 fields enabled)
    cbse_fields = [
        # Step 1: Student Information (18 fields)
        ("student_first_name", 1, 1, True),
        ("student_middle_name", 1, 2, False),
        ("student_last_name", 1, 3, True),
        ("student_dob", 1, 4, True),
        ("student_gender", 1, 5, True),
        ("student_blood_group", 1, 6, False),
        ("student_place_of_birth", 1, 7, False),
        ("student_nationality", 1, 8, True),
        ("student_religion", 1, 9, False),
        ("student_caste_category", 1, 10, False),
        ("student_mother_tongue", 1, 11, False),
        ("student_aadhar_number", 1, 12, False),
        ("student_birth_certificate_number", 1, 13, False),
        ("student_height", 1, 14, False),
        ("student_weight", 1, 15, False),
        ("student_identification_marks", 1, 16, False),
        ("student_disabilities", 1, 17, False),
        ("student_photo", 5, 1, True),

        # Step 2: Parent Information (14 fields - core only)
        ("father_full_name", 2, 1, True),
        ("father_qualification", 2, 2, True),
        ("father_occupation", 2, 3, True),
        ("father_mobile", 2, 4, True),
        ("father_email", 2, 5, True),
        ("father_annual_income", 2, 6, True),
        ("father_aadhar", 2, 7, False),

        ("mother_full_name", 2, 8, True),
        ("mother_qualification", 2, 9, True),
        ("mother_occupation", 2, 10, True),
        ("mother_mobile", 2, 11, True),
        ("mother_email", 2, 12, True),
        ("mother_aadhar", 2, 13, False),

        ("emergency_contact_name", 2, 14, True),
        ("emergency_contact_number", 2, 15, True),
    ]

    for field_code, step, order, required in cbse_fields:
        if field_code in field_map:
            template_field = FormTemplateField(
                template_id=cbse_template.id,
                field_id=field_map[field_code].id,
                is_enabled=True,
                is_required=required,
                step_number=step,
                display_order=order
            )
            db.add(template_field)

    print(f"[OK] Created CBSE Standard template with {len(cbse_fields)} fields")

    # ============= Template 2: ICSE Standard (Slightly different) =============
    icse_template = FormTemplate(
        template_name="ICSE Standard",
        template_code="icse_standard",
        description="ICSE board compliant application form with focus on academic and extracurricular details.",
        is_active=True
    )
    db.add(icse_template)
    db.flush()

    # ICSE fields (similar to CBSE but some differences)
    icse_fields = [
        # Student info (core fields only)
        ("student_first_name", 1, 1, True),
        ("student_middle_name", 1, 2, False),
        ("student_last_name", 1, 3, True),
        ("student_dob", 1, 4, True),
        ("student_gender", 1, 5, True),
        ("student_blood_group", 1, 6, True),  # ICSE requires blood group
        ("student_nationality", 1, 7, True),
        ("student_religion", 1, 8, False),
        ("student_caste_category", 1, 9, False),
        ("student_mother_tongue", 1, 10, True),  # ICSE emphasizes mother tongue
        ("student_aadhar_number", 1, 11, False),
        ("student_photo", 5, 1, True),

        # Parent info
        ("father_full_name", 2, 1, True),
        ("father_qualification", 2, 2, True),
        ("father_occupation", 2, 3, True),
        ("father_mobile", 2, 4, True),
        ("father_email", 2, 5, True),
        ("father_annual_income", 2, 6, True),

        ("mother_full_name", 2, 7, True),
        ("mother_qualification", 2, 8, True),
        ("mother_occupation", 2, 9, True),
        ("mother_mobile", 2, 10, True),
        ("mother_email", 2, 11, True),

        ("emergency_contact_name", 2, 12, True),
        ("emergency_contact_number", 2, 13, True),
    ]

    for field_code, step, order, required in icse_fields:
        if field_code in field_map:
            template_field = FormTemplateField(
                template_id=icse_template.id,
                field_id=field_map[field_code].id,
                is_enabled=True,
                is_required=required,
                step_number=step,
                display_order=order
            )
            db.add(template_field)

    print(f"[OK] Created ICSE Standard template with {len(icse_fields)} fields")

    # ============= Template 3: Minimal (Basic requirements only) =============
    minimal_template = FormTemplate(
        template_name="Minimal",
        template_code="minimal",
        description="Basic application form with only essential fields. Quick setup for small schools.",
        is_active=True
    )
    db.add(minimal_template)
    db.flush()

    # Minimal fields (20 fields - bare minimum)
    minimal_fields = [
        # Student basics
        ("student_first_name", 1, 1, True),
        ("student_last_name", 1, 2, True),
        ("student_dob", 1, 3, True),
        ("student_gender", 1, 4, True),
        ("student_nationality", 1, 5, True),
        ("student_photo", 5, 1, True),

        # Parent basics
        ("father_full_name", 2, 1, True),
        ("father_mobile", 2, 2, True),
        ("father_email", 2, 3, True),
        ("father_occupation", 2, 4, True),

        ("mother_full_name", 2, 5, True),
        ("mother_mobile", 2, 6, True),
        ("mother_email", 2, 7, True),

        ("emergency_contact_name", 2, 8, True),
        ("emergency_contact_number", 2, 9, True),
    ]

    for field_code, step, order, required in minimal_fields:
        if field_code in field_map:
            template_field = FormTemplateField(
                template_id=minimal_template.id,
                field_id=field_map[field_code].id,
                is_enabled=True,
                is_required=required,
                step_number=step,
                display_order=order
            )
            db.add(template_field)

    print(f"[OK] Created Minimal template with {len(minimal_fields)} fields")

    db.commit()
    print(f"\n[SUCCESS] Seeded 3 form templates successfully!")
    print("  - CBSE Standard (comprehensive)")
    print("  - ICSE Standard (board-specific)")
    print("  - Minimal (basic requirements)")


def main():
    """Run seed script"""
    db = SessionLocal()
    try:
        seed_templates(db)
    finally:
        db.close()


if __name__ == "__main__":
    main()
