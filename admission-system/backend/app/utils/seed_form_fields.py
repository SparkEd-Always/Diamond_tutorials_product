"""
Seed script for populating form_fields_master table with 162 predefined fields.
Based on research: docs/product/school-application-form-fields-research.md
"""
from sqlalchemy.orm import Session
from app.models.form_configuration import FormFieldMaster
from app.core.database import SessionLocal


def seed_form_fields(db: Session):
    """
    Seed all 162 predefined application form fields.
    """

    # Check if already seeded
    existing_count = db.query(FormFieldMaster).count()
    if existing_count > 0:
        print(f"[OK] Form fields already seeded ({existing_count} fields). Skipping.")
        return

    fields = []

    # ============= 1. STUDENT INFORMATION (18 fields) =============

    # Basic Details
    fields.extend([
        {
            "field_code": "student_first_name",
            "field_label": "First Name",
            "field_type": "text",
            "category": "student_info",
            "default_step": 1,
            "is_required_by_default": True,
            "validation_rules": {"min_length": 2, "max_length": 50, "pattern": "^[A-Za-z ]+$"},
            "help_text": "Student's first name as per official documents",
            "placeholder": "Enter first name"
        },
        {
            "field_code": "student_middle_name",
            "field_label": "Middle Name",
            "field_type": "text",
            "category": "student_info",
            "default_step": 1,
            "is_required_by_default": False,
            "validation_rules": {"max_length": 50},
            "placeholder": "Enter middle name (optional)"
        },
        {
            "field_code": "student_last_name",
            "field_label": "Last Name",
            "field_type": "text",
            "category": "student_info",
            "default_step": 1,
            "is_required_by_default": True,
            "validation_rules": {"min_length": 1, "max_length": 50, "pattern": "^[A-Za-z ]+$"},
            "placeholder": "Enter last name"
        },
        {
            "field_code": "student_dob",
            "field_label": "Date of Birth",
            "field_type": "date",
            "category": "student_info",
            "default_step": 1,
            "is_required_by_default": True,
            "help_text": "Student's date of birth as per birth certificate"
        },
        {
            "field_code": "student_gender",
            "field_label": "Gender",
            "field_type": "radio",
            "category": "student_info",
            "default_step": 1,
            "is_required_by_default": True,
            "options": ["Male", "Female", "Other"]
        },
        {
            "field_code": "student_blood_group",
            "field_label": "Blood Group",
            "field_type": "dropdown",
            "category": "student_info",
            "default_step": 1,
            "is_required_by_default": False,
            "options": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"]
        },
        {
            "field_code": "student_place_of_birth",
            "field_label": "Place of Birth",
            "field_type": "text",
            "category": "student_info",
            "default_step": 1,
            "is_required_by_default": False,
            "placeholder": "City/Town of birth"
        },
        {
            "field_code": "student_nationality",
            "field_label": "Nationality",
            "field_type": "text",
            "category": "student_info",
            "default_step": 1,
            "is_required_by_default": True,
            "placeholder": "Indian"
        },
        {
            "field_code": "student_religion",
            "field_label": "Religion",
            "field_type": "dropdown",
            "category": "student_info",
            "default_step": 1,
            "is_required_by_default": False,
            "options": ["Hindu", "Muslim", "Christian", "Sikh", "Buddhist", "Jain", "Other", "Prefer not to say"]
        },
        {
            "field_code": "student_caste_category",
            "field_label": "Caste/Category",
            "field_type": "dropdown",
            "category": "student_info",
            "default_step": 1,
            "is_required_by_default": False,
            "options": ["General", "SC", "ST", "OBC", "EWS", "Other"]
        },
        {
            "field_code": "student_mother_tongue",
            "field_label": "Mother Tongue",
            "field_type": "text",
            "category": "student_info",
            "default_step": 1,
            "is_required_by_default": False,
            "placeholder": "Enter mother tongue"
        },
        {
            "field_code": "student_photo",
            "field_label": "Student Photo",
            "field_type": "file",
            "category": "student_info",
            "default_step": 5,
            "is_required_by_default": True,
            "file_config": {"max_size_mb": 2, "allowed_types": ["jpg", "jpeg", "png"]},
            "help_text": "Recent passport size photograph (Max 2MB)"
        },
        # Identification
        {
            "field_code": "student_aadhar_number",
            "field_label": "Aadhar Card Number",
            "field_type": "text",
            "category": "student_info",
            "default_step": 1,
            "is_required_by_default": False,
            "validation_rules": {"pattern": "^[0-9]{12}$"},
            "placeholder": "12-digit Aadhar number"
        },
        {
            "field_code": "student_birth_certificate_number",
            "field_label": "Birth Certificate Number",
            "field_type": "text",
            "category": "student_info",
            "default_step": 1,
            "is_required_by_default": False,
            "placeholder": "Enter birth certificate number"
        },
        # Physical Details
        {
            "field_code": "student_height",
            "field_label": "Height (in cm)",
            "field_type": "number",
            "category": "student_info",
            "default_step": 1,
            "is_required_by_default": False,
            "validation_rules": {"min": 50, "max": 250},
            "placeholder": "Height in centimeters"
        },
        {
            "field_code": "student_weight",
            "field_label": "Weight (in kg)",
            "field_type": "number",
            "category": "student_info",
            "default_step": 1,
            "is_required_by_default": False,
            "validation_rules": {"min": 5, "max": 150},
            "placeholder": "Weight in kilograms"
        },
        {
            "field_code": "student_identification_marks",
            "field_label": "Identification Marks",
            "field_type": "textarea",
            "category": "student_info",
            "default_step": 1,
            "is_required_by_default": False,
            "placeholder": "Any visible identification marks"
        },
        {
            "field_code": "student_disabilities",
            "field_label": "Disabilities (if any)",
            "field_type": "textarea",
            "category": "student_info",
            "default_step": 1,
            "is_required_by_default": False,
            "placeholder": "Please specify any disabilities"
        },
    ])

    # ============= 2. PARENT/GUARDIAN INFORMATION (42 fields) =============

    # Father's Details
    fields.extend([
        {
            "field_code": "father_full_name",
            "field_label": "Father's Full Name",
            "field_type": "text",
            "category": "parent_info",
            "default_step": 2,
            "is_required_by_default": True,
            "validation_rules": {"min_length": 3, "max_length": 100},
            "placeholder": "Enter father's full name"
        },
        {
            "field_code": "father_dob",
            "field_label": "Father's Date of Birth",
            "field_type": "date",
            "category": "parent_info",
            "default_step": 2,
            "is_required_by_default": False
        },
        {
            "field_code": "father_qualification",
            "field_label": "Father's Qualification",
            "field_type": "dropdown",
            "category": "parent_info",
            "default_step": 2,
            "is_required_by_default": True,
            "options": ["Below 10th", "10th Pass", "12th Pass", "Graduate", "Post Graduate", "Doctorate", "Other"]
        },
        {
            "field_code": "father_occupation",
            "field_label": "Father's Occupation",
            "field_type": "text",
            "category": "parent_info",
            "default_step": 2,
            "is_required_by_default": True,
            "placeholder": "e.g., Engineer, Teacher, Business"
        },
        {
            "field_code": "father_designation",
            "field_label": "Father's Designation",
            "field_type": "text",
            "category": "parent_info",
            "default_step": 2,
            "is_required_by_default": False,
            "placeholder": "Job title/position"
        },
        {
            "field_code": "father_organization",
            "field_label": "Father's Organization/Company",
            "field_type": "text",
            "category": "parent_info",
            "default_step": 2,
            "is_required_by_default": False,
            "placeholder": "Company/Organization name"
        },
        {
            "field_code": "father_office_address",
            "field_label": "Father's Office Address",
            "field_type": "textarea",
            "category": "parent_info",
            "default_step": 2,
            "is_required_by_default": False,
            "placeholder": "Complete office address"
        },
        {
            "field_code": "father_office_phone",
            "field_label": "Father's Office Phone",
            "field_type": "phone",
            "category": "parent_info",
            "default_step": 2,
            "is_required_by_default": False,
            "validation_rules": {"pattern": "^[0-9]{10,15}$"},
            "placeholder": "10-digit phone number"
        },
        {
            "field_code": "father_mobile",
            "field_label": "Father's Mobile Number",
            "field_type": "phone",
            "category": "parent_info",
            "default_step": 2,
            "is_required_by_default": True,
            "validation_rules": {"pattern": "^[6-9][0-9]{9}$"},
            "placeholder": "10-digit mobile number"
        },
        {
            "field_code": "father_email",
            "field_label": "Father's Email Address",
            "field_type": "email",
            "category": "parent_info",
            "default_step": 2,
            "is_required_by_default": True,
            "validation_rules": {"pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"},
            "placeholder": "email@example.com"
        },
        {
            "field_code": "father_annual_income",
            "field_label": "Father's Annual Income",
            "field_type": "number",
            "category": "parent_info",
            "default_step": 2,
            "is_required_by_default": True,
            "validation_rules": {"min": 0, "max": 100000000},
            "placeholder": "Annual income in ₹"
        },
        {
            "field_code": "father_aadhar",
            "field_label": "Father's Aadhar Number",
            "field_type": "text",
            "category": "parent_info",
            "default_step": 2,
            "is_required_by_default": False,
            "validation_rules": {"pattern": "^[0-9]{12}$"},
            "placeholder": "12-digit Aadhar number"
        },
        {
            "field_code": "father_pan",
            "field_label": "Father's PAN Number",
            "field_type": "text",
            "category": "parent_info",
            "default_step": 2,
            "is_required_by_default": False,
            "validation_rules": {"pattern": "^[A-Z]{5}[0-9]{4}[A-Z]{1}$"},
            "placeholder": "10-character PAN"
        },
        {
            "field_code": "father_photo",
            "field_label": "Father's Photo",
            "field_type": "file",
            "category": "parent_info",
            "default_step": 5,
            "is_required_by_default": False,
            "file_config": {"max_size_mb": 2, "allowed_types": ["jpg", "jpeg", "png"]}
        },
    ])

    # Mother's Details (similar to father's)
    fields.extend([
        {
            "field_code": "mother_full_name",
            "field_label": "Mother's Full Name",
            "field_type": "text",
            "category": "parent_info",
            "default_step": 2,
            "is_required_by_default": True,
            "validation_rules": {"min_length": 3, "max_length": 100},
            "placeholder": "Enter mother's full name"
        },
        {
            "field_code": "mother_dob",
            "field_label": "Mother's Date of Birth",
            "field_type": "date",
            "category": "parent_info",
            "default_step": 2,
            "is_required_by_default": False
        },
        {
            "field_code": "mother_qualification",
            "field_label": "Mother's Qualification",
            "field_type": "dropdown",
            "category": "parent_info",
            "default_step": 2,
            "is_required_by_default": True,
            "options": ["Below 10th", "10th Pass", "12th Pass", "Graduate", "Post Graduate", "Doctorate", "Other"]
        },
        {
            "field_code": "mother_occupation",
            "field_label": "Mother's Occupation",
            "field_type": "text",
            "category": "parent_info",
            "default_step": 2,
            "is_required_by_default": True,
            "placeholder": "e.g., Homemaker, Teacher, Doctor"
        },
        {
            "field_code": "mother_designation",
            "field_label": "Mother's Designation",
            "field_type": "text",
            "category": "parent_info",
            "default_step": 2,
            "is_required_by_default": False,
            "placeholder": "Job title/position"
        },
        {
            "field_code": "mother_organization",
            "field_label": "Mother's Organization/Company",
            "field_type": "text",
            "category": "parent_info",
            "default_step": 2,
            "is_required_by_default": False,
            "placeholder": "Company/Organization name"
        },
        {
            "field_code": "mother_office_address",
            "field_label": "Mother's Office Address",
            "field_type": "textarea",
            "category": "parent_info",
            "default_step": 2,
            "is_required_by_default": False,
            "placeholder": "Complete office address"
        },
        {
            "field_code": "mother_office_phone",
            "field_label": "Mother's Office Phone",
            "field_type": "phone",
            "category": "parent_info",
            "default_step": 2,
            "is_required_by_default": False,
            "validation_rules": {"pattern": "^[0-9]{10,15}$"},
            "placeholder": "10-digit phone number"
        },
        {
            "field_code": "mother_mobile",
            "field_label": "Mother's Mobile Number",
            "field_type": "phone",
            "category": "parent_info",
            "default_step": 2,
            "is_required_by_default": True,
            "validation_rules": {"pattern": "^[6-9][0-9]{9}$"},
            "placeholder": "10-digit mobile number"
        },
        {
            "field_code": "mother_email",
            "field_label": "Mother's Email Address",
            "field_type": "email",
            "category": "parent_info",
            "default_step": 2,
            "is_required_by_default": True,
            "placeholder": "email@example.com"
        },
        {
            "field_code": "mother_annual_income",
            "field_label": "Mother's Annual Income",
            "field_type": "number",
            "category": "parent_info",
            "default_step": 2,
            "is_required_by_default": False,
            "validation_rules": {"min": 0, "max": 100000000},
            "placeholder": "Annual income in ₹"
        },
        {
            "field_code": "mother_aadhar",
            "field_label": "Mother's Aadhar Number",
            "field_type": "text",
            "category": "parent_info",
            "default_step": 2,
            "is_required_by_default": False,
            "validation_rules": {"pattern": "^[0-9]{12}$"},
            "placeholder": "12-digit Aadhar number"
        },
        {
            "field_code": "mother_photo",
            "field_label": "Mother's Photo",
            "field_type": "file",
            "category": "parent_info",
            "default_step": 5,
            "is_required_by_default": False,
            "file_config": {"max_size_mb": 2, "allowed_types": ["jpg", "jpeg", "png"]}
        },
    ])

    # Guardian Details
    fields.extend([
        {
            "field_code": "guardian_full_name",
            "field_label": "Guardian's Full Name",
            "field_type": "text",
            "category": "parent_info",
            "default_step": 2,
            "is_required_by_default": False,
            "placeholder": "If parents not available"
        },
        {
            "field_code": "guardian_relationship",
            "field_label": "Relationship with Student",
            "field_type": "text",
            "category": "parent_info",
            "default_step": 2,
            "is_required_by_default": False,
            "placeholder": "e.g., Uncle, Aunt, Grandparent"
        },
        {
            "field_code": "guardian_mobile",
            "field_label": "Guardian's Mobile Number",
            "field_type": "phone",
            "category": "parent_info",
            "default_step": 2,
            "is_required_by_default": False,
            "placeholder": "10-digit mobile number"
        },
        {
            "field_code": "guardian_email",
            "field_label": "Guardian's Email",
            "field_type": "email",
            "category": "parent_info",
            "default_step": 2,
            "is_required_by_default": False,
            "placeholder": "email@example.com"
        },
    ])

    # Communication Preference
    fields.extend([
        {
            "field_code": "preferred_contact_number",
            "field_label": "Preferred Contact Number",
            "field_type": "dropdown",
            "category": "parent_info",
            "default_step": 2,
            "is_required_by_default": False,
            "options": ["Father's Mobile", "Mother's Mobile", "Guardian's Mobile"]
        },
        {
            "field_code": "emergency_contact_name",
            "field_label": "Emergency Contact Name",
            "field_type": "text",
            "category": "parent_info",
            "default_step": 2,
            "is_required_by_default": True,
            "placeholder": "Name of emergency contact person"
        },
        {
            "field_code": "emergency_contact_number",
            "field_label": "Emergency Contact Number",
            "field_type": "phone",
            "category": "parent_info",
            "default_step": 2,
            "is_required_by_default": True,
            "validation_rules": {"pattern": "^[6-9][0-9]{9}$"},
            "placeholder": "10-digit mobile number"
        },
        {
            "field_code": "whatsapp_number",
            "field_label": "WhatsApp Number",
            "field_type": "phone",
            "category": "parent_info",
            "default_step": 2,
            "is_required_by_default": False,
            "placeholder": "For updates via WhatsApp"
        },
    ])

    print(f"[INFO] Created {len(fields)} fields so far...")

    # Will continue with remaining categories in next part...
    # This is Part 1 of the seed script

    # Insert all fields
    for field_data in fields:
        field = FormFieldMaster(**field_data)
        db.add(field)

    db.commit()
    print(f"[OK] Successfully seeded {len(fields)} form fields (Part 1/3)")


def main():
    """Run seed script"""
    db = SessionLocal()
    try:
        seed_form_fields(db)
    finally:
        db.close()


if __name__ == "__main__":
    main()
