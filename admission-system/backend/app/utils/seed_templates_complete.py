"""
Seed comprehensive form templates with all fields
"""
from sqlalchemy.orm import Session
from ..models.form_configuration import FormTemplate, FormTemplateField, FormFieldMaster


def seed_comprehensive_templates(db: Session):
    """Seed 3 comprehensive templates: CBSE Standard, ICSE Standard, Minimal"""

    # Check if templates already exist
    existing = db.query(FormTemplate).count()
    if existing > 0:
        print(f"[INFO] Templates already exist ({existing} templates). Clearing and reseeding...")
        db.query(FormTemplateField).delete()
        db.query(FormTemplate).delete()
        db.commit()

    # ============= Template 1: CBSE Standard (Comprehensive) =============
    cbse_template = FormTemplate(
        template_name="CBSE Standard",
        template_code="cbse_standard",
        description="Comprehensive CBSE application form with 162 fields (100% coverage). Includes ALL student (20), parent (36), sibling (8), address (26), academic (23), additional (19), financial (6), document (18), and consent (6) fields for complete admission process.",
        is_active=True
    )
    db.add(cbse_template)
    db.commit()
    db.refresh(cbse_template)

    # CBSE Required fields (most comprehensive - 156+ fields)
    cbse_field_codes = [
        # Student Info (Step 1) - 20 fields (ALL)
        "student_first_name", "student_middle_name", "student_last_name",
        "student_dob", "student_gender", "student_blood_group",
        "student_place_of_birth", "student_nationality", "student_religion",
        "student_caste_category", "student_mother_tongue",
        "student_aadhar_number", "student_birth_certificate_number",
        "student_passport_number", "student_identification_number",
        "student_height", "student_weight", "student_identification_marks",
        "student_disabilities", "student_medical_conditions",

        # Parent Info (Step 2) - 36 fields (ALL)
        "father_full_name", "father_dob", "father_education", "father_occupation",
        "father_designation", "father_organization", "father_office_address",
        "father_office_phone", "father_mobile", "father_email", "father_annual_income",
        "father_aadhar", "father_pan", "father_photo",
        "mother_full_name", "mother_dob", "mother_education", "mother_occupation",
        "mother_designation", "mother_organization", "mother_office_address",
        "mother_office_phone", "mother_mobile", "mother_email", "mother_annual_income",
        "mother_aadhar", "mother_pan", "mother_photo",
        "guardian_full_name", "guardian_relationship", "guardian_contact",
        "guardian_email", "guardian_dob", "guardian_occupation",
        "guardian_address", "guardian_aadhar",

        # Address (Step 3) - 26 fields (ALL)
        "res_house_number", "res_building_name", "res_street_locality",
        "res_landmark", "res_city", "res_district", "res_state",
        "res_pincode", "res_country", "res_residence_type", "res_years_at_address",
        "perm_same_as_residential", "perm_house_number", "perm_building_name",
        "perm_street_locality", "perm_landmark", "perm_city", "perm_district",
        "perm_state", "perm_pincode", "perm_country",
        "emergency_contact_name", "emergency_contact_number",
        "whatsapp_number", "preferred_contact_number", "preferred_email",

        # Academic (Step 4) - 23 fields (ALL)
        "applying_for_class", "applying_for_academic_year", "stream_preference",
        "second_language", "third_language",
        "previous_school_name", "previous_school_address", "previous_school_board",
        "previous_school_contact", "last_class_attended", "tc_number",
        "year_of_leaving", "reason_for_leaving",
        "last_year_percentage", "last_year_division_rank", "best_subject",
        "academic_achievements", "participation_competitions", "awards_recognitions",
        "sibling_name", "sibling_class", "sibling_section", "sibling_admission_number",

        # Additional (Step 4) - 19 fields (ALL)
        "transport_required", "transport_mode", "bus_route", "distance_from_school",
        "allergies", "chronic_illness", "current_medications",
        "doctor_contact", "vaccination_status", "behavioral_issues",
        "learning_disabilities", "special_educational_needs", "language_support_required",
        "dietary_restrictions",
        "sports_interest", "arts_music_interest", "dance_interest",
        "hobbies", "special_talents",

        # Financial (Step 4) - 6 fields (ALL)
        "annual_family_income", "income_certificate_number",
        "fee_concession_required", "category_for_concession",
        "scholarship_request", "fee_payment_mode_preference",

        # Sibling (Step 4) - 8 fields (ALL)
        "has_sibling_in_school", "sibling_in_school_name", "sibling_in_school_class",
        "sibling_in_school_section", "other_sibling_name", "other_sibling_age",
        "other_sibling_school", "other_sibling_class",

        # Documents (Step 5) - 18 fields (ALL)
        "doc_birth_certificate", "doc_student_photo", "doc_address_proof",
        "doc_parent_id_proof", "doc_transfer_certificate", "doc_marksheet",
        "doc_character_certificate", "doc_migration_certificate",
        "doc_caste_certificate", "doc_income_certificate", "doc_disability_certificate",
        "doc_ews_certificate", "doc_sports_certificate", "doc_medical_certificate",
        "doc_vaccination_records", "doc_noc", "doc_affidavit", "doc_other",

        # Consent (Step 5) - 6 fields (ALL)
        "consent_true_information", "consent_school_rules",
        "consent_photo_video", "consent_medical_emergency",
        "consent_data_privacy", "terms_conditions_acceptance",
    ]

    # Add CBSE template fields
    for idx, field_code in enumerate(cbse_field_codes):
        field = db.query(FormFieldMaster).filter(FormFieldMaster.field_code == field_code).first()
        if field:
            template_field = FormTemplateField(
                template_id=cbse_template.id,
                field_id=field.id,
                is_enabled=True,
                is_required=field.is_required_by_default,
                step_number=field.default_step,
                display_order=idx + 1
            )
            db.add(template_field)

    db.commit()
    print(f"[OK] Created CBSE Standard template with {len(cbse_field_codes)} fields")

    # ============= Template 2: ICSE Standard (Moderate) =============
    icse_template = FormTemplate(
        template_name="ICSE Standard",
        template_code="icse_standard",
        description="ICSE board application form with 123 fields (76% coverage). Balanced selection: student (16), parent (28), sibling (5), address (20), academic (17), additional (14), financial (3), documents (14), consent (6). Excludes optional IDs and some achievements.",
        is_active=True
    )
    db.add(icse_template)
    db.commit()
    db.refresh(icse_template)

    # ICSE fields (moderate - focus on academics and extracurriculars - 108 fields)
    icse_field_codes = [
        # Student Info (Step 1) - 16 fields (skip passport, identification number, height, weight)
        "student_first_name", "student_middle_name", "student_last_name",
        "student_dob", "student_gender", "student_blood_group",
        "student_place_of_birth", "student_nationality", "student_religion",
        "student_caste_category", "student_mother_tongue",
        "student_aadhar_number", "student_birth_certificate_number",
        "student_identification_marks", "student_disabilities", "student_medical_conditions",

        # Parent Info (Step 2) - 26 fields (skip photos, some guardian details)
        "father_full_name", "father_dob", "father_education", "father_occupation",
        "father_designation", "father_organization", "father_office_address",
        "father_mobile", "father_email", "father_annual_income",
        "father_aadhar", "father_pan",
        "mother_full_name", "mother_dob", "mother_education", "mother_occupation",
        "mother_designation", "mother_organization", "mother_office_address",
        "mother_mobile", "mother_email", "mother_annual_income",
        "mother_aadhar", "mother_pan",
        "guardian_full_name", "guardian_relationship", "guardian_contact",
        "guardian_email",

        # Address (Step 3) - 20 fields (skip years at address, residence type)
        "res_house_number", "res_building_name", "res_street_locality",
        "res_landmark", "res_city", "res_district", "res_state",
        "res_pincode", "res_country",
        "perm_same_as_residential", "perm_house_number", "perm_street_locality",
        "perm_city", "perm_district", "perm_state", "perm_pincode",
        "emergency_contact_name", "emergency_contact_number",
        "whatsapp_number", "preferred_contact_number",

        # Academic (Step 4) - 17 fields (skip some achievement/sibling fields)
        "applying_for_class", "applying_for_academic_year", "stream_preference",
        "second_language", "third_language",
        "previous_school_name", "previous_school_address", "previous_school_board",
        "last_class_attended", "tc_number", "last_year_percentage",
        "academic_achievements", "participation_competitions", "awards_recognitions",
        "sibling_name", "sibling_class", "sibling_admission_number",

        # Additional (Step 4) - 14 fields (skip behavioral issues, language support)
        "transport_required", "transport_mode", "bus_route", "distance_from_school",
        "allergies", "chronic_illness", "current_medications",
        "vaccination_status", "learning_disabilities", "special_educational_needs",
        "dietary_restrictions",
        "sports_interest", "arts_music_interest", "hobbies",

        # Financial (Step 4) - 3 fields (skip income certificate, payment mode)
        "annual_family_income", "fee_concession_required",
        "scholarship_request",

        # Sibling (Step 4) - 5 fields (basic sibling info only)
        "has_sibling_in_school", "sibling_in_school_name", "sibling_in_school_class",
        "other_sibling_name", "other_sibling_age",

        # Documents (Step 5) - 14 fields (required + key optional docs)
        "doc_birth_certificate", "doc_student_photo", "doc_address_proof",
        "doc_parent_id_proof", "doc_transfer_certificate", "doc_marksheet",
        "doc_character_certificate", "doc_caste_certificate", "doc_income_certificate",
        "doc_disability_certificate", "doc_medical_certificate",
        "doc_vaccination_records", "doc_noc", "doc_affidavit",

        # Consent (Step 5) - 6 fields (ALL)
        "consent_true_information", "consent_school_rules",
        "consent_photo_video", "consent_medical_emergency",
        "consent_data_privacy", "terms_conditions_acceptance",
    ]

    for idx, field_code in enumerate(icse_field_codes):
        field = db.query(FormFieldMaster).filter(FormFieldMaster.field_code == field_code).first()
        if field:
            template_field = FormTemplateField(
                template_id=icse_template.id,
                field_id=field.id,
                is_enabled=True,
                is_required=field.is_required_by_default,
                step_number=field.default_step,
                display_order=idx + 1
            )
            db.add(template_field)

    db.commit()
    print(f"[OK] Created ICSE Standard template with {len(icse_field_codes)} fields")

    # ============= Template 3: Minimal (Basic) =============
    minimal_template = FormTemplate(
        template_name="Minimal",
        template_code="minimal",
        description="Essential application form with 45 fields (28% coverage). Streamlined for small schools: student (9), parent (10), address (9), academic (4), additional (2), financial (1), documents (4), consent (6). Core identity and contact information only.",
        is_active=True
    )
    db.add(minimal_template)
    db.commit()
    db.refresh(minimal_template)

    # Minimal fields (only essentials - 37 fields)
    minimal_field_codes = [
        # Student Info (Step 1) - 9 fields (core identity only)
        "student_first_name", "student_last_name", "student_dob",
        "student_gender", "student_blood_group", "student_nationality",
        "student_aadhar_number", "student_birth_certificate_number",
        "student_medical_conditions",

        # Parent Info (Step 2) - 10 fields (basic contact only)
        "father_full_name", "father_occupation", "father_mobile",
        "father_email", "father_annual_income",
        "mother_full_name", "mother_occupation", "mother_mobile",
        "mother_email", "mother_annual_income",

        # Address (Step 3) - 9 fields (residential only)
        "res_house_number", "res_street_locality", "res_city",
        "res_state", "res_pincode",
        "perm_same_as_residential",
        "emergency_contact_name", "emergency_contact_number",
        "whatsapp_number",

        # Academic (Step 4) - 4 fields (minimum academic info)
        "applying_for_class", "applying_for_academic_year",
        "previous_school_name", "last_class_attended",

        # Additional (Step 4) - 2 fields (critical only)
        "transport_required", "allergies",

        # Financial (Step 4) - 1 field
        "annual_family_income",

        # Documents (Step 5) - 4 fields (only required docs)
        "doc_birth_certificate", "doc_student_photo",
        "doc_address_proof", "doc_parent_id_proof",

        # Consent (Step 5) - 6 fields (ALL - required by law)
        "consent_true_information", "consent_school_rules",
        "consent_photo_video", "consent_medical_emergency",
        "consent_data_privacy", "terms_conditions_acceptance",
    ]

    for idx, field_code in enumerate(minimal_field_codes):
        field = db.query(FormFieldMaster).filter(FormFieldMaster.field_code == field_code).first()
        if field:
            template_field = FormTemplateField(
                template_id=minimal_template.id,
                field_id=field.id,
                is_enabled=True,
                is_required=field.is_required_by_default,
                step_number=field.default_step,
                display_order=idx + 1
            )
            db.add(template_field)

    db.commit()
    print(f"[OK] Created Minimal template with {len(minimal_field_codes)} fields")

    print(f"\n[SUCCESS] Seeded 3 comprehensive form templates!")
    print(f"  - CBSE Standard ({len(cbse_field_codes)} fields) - Comprehensive")
    print(f"  - ICSE Standard ({len(icse_field_codes)} fields) - Moderate")
    print(f"  - Minimal ({len(minimal_field_codes)} fields) - Basic")


if __name__ == "__main__":
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker

    engine = create_engine('sqlite:///./admission.db')
    Session = sessionmaker(bind=engine)
    db = Session()

    try:
        seed_comprehensive_templates(db)
    finally:
        db.close()
