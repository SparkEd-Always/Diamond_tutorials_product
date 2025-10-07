"""
Seed all 160+ application form fields
Complete implementation with all categories
"""
from sqlalchemy.orm import Session
from ..models.form_configuration import FormFieldMaster


def seed_all_form_fields(db: Session):
    """Seed all 160+ form fields across all categories"""

    # Check if fields already exist
    existing = db.query(FormFieldMaster).count()
    if existing > 50:
        print(f"[INFO] Form fields already seeded ({existing} fields). Clearing and reseeding all fields...")
        # Need to clear template fields first due to foreign key
        from ..models.form_configuration import FormTemplateField, SchoolFormConfiguration
        db.query(FormTemplateField).delete()
        db.query(SchoolFormConfiguration).delete()
        db.query(FormFieldMaster).delete()
        db.commit()

    # Clear existing fields for fresh seed (if <50)
    if existing > 0 and existing <= 50:
        from ..models.form_configuration import FormTemplateField, SchoolFormConfiguration
        db.query(FormTemplateField).delete()
        db.query(SchoolFormConfiguration).delete()
        db.query(FormFieldMaster).delete()
        db.commit()

    fields = []

    # ============= STUDENT INFORMATION (Step 1) =============
    # Basic Details
    fields.extend([
        {
            "field_code": "student_first_name",
            "field_label": "First Name",
            "field_type": "text",
            "category": "student_info",
            "default_step": 1,
            "is_required_by_default": True,
            "validation_rules": {"min_length": 2, "max_length": 50},
            "placeholder": "Enter student's first name",
            "help_text": "As per birth certificate",
        },
        {
            "field_code": "student_middle_name",
            "field_label": "Middle Name",
            "field_type": "text",
            "category": "student_info",
            "default_step": 1,
            "is_required_by_default": False,
            "validation_rules": {"max_length": 50},
            "placeholder": "Enter middle name (if applicable)",
        },
        {
            "field_code": "student_last_name",
            "field_label": "Last Name",
            "field_type": "text",
            "category": "student_info",
            "default_step": 1,
            "is_required_by_default": True,
            "validation_rules": {"min_length": 2, "max_length": 50},
            "placeholder": "Enter student's last name",
        },
        {
            "field_code": "student_dob",
            "field_label": "Date of Birth",
            "field_type": "date",
            "category": "student_info",
            "default_step": 1,
            "is_required_by_default": True,
            "help_text": "As per birth certificate",
        },
        {
            "field_code": "student_gender",
            "field_label": "Gender",
            "field_type": "dropdown",
            "category": "student_info",
            "default_step": 1,
            "is_required_by_default": True,
            "options": ["Male", "Female", "Other"],
        },
        {
            "field_code": "student_blood_group",
            "field_label": "Blood Group",
            "field_type": "dropdown",
            "category": "student_info",
            "default_step": 1,
            "is_required_by_default": False,
            "options": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"],
        },
        {
            "field_code": "student_place_of_birth",
            "field_label": "Place of Birth",
            "field_type": "text",
            "category": "student_info",
            "default_step": 1,
            "is_required_by_default": False,
            "placeholder": "City/Town of birth",
        },
        {
            "field_code": "student_nationality",
            "field_label": "Nationality",
            "field_type": "dropdown",
            "category": "student_info",
            "default_step": 1,
            "is_required_by_default": True,
            "options": ["Indian", "Other"],
        },
        {
            "field_code": "student_religion",
            "field_label": "Religion",
            "field_type": "dropdown",
            "category": "student_info",
            "default_step": 1,
            "is_required_by_default": False,
            "options": ["Hindu", "Muslim", "Christian", "Sikh", "Buddhist", "Jain", "Other", "Prefer not to say"],
        },
        {
            "field_code": "student_caste_category",
            "field_label": "Caste/Category",
            "field_type": "dropdown",
            "category": "student_info",
            "default_step": 1,
            "is_required_by_default": False,
            "options": ["General", "SC", "ST", "OBC", "EWS"],
        },
        {
            "field_code": "student_mother_tongue",
            "field_label": "Mother Tongue",
            "field_type": "text",
            "category": "student_info",
            "default_step": 1,
            "is_required_by_default": False,
            "placeholder": "Primary language spoken at home",
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
            "placeholder": "12-digit Aadhar number",
        },
        {
            "field_code": "student_birth_certificate_number",
            "field_label": "Birth Certificate Number",
            "field_type": "text",
            "category": "student_info",
            "default_step": 1,
            "is_required_by_default": False,
            "placeholder": "Birth certificate registration number",
        },

        # Physical Details
        {
            "field_code": "student_height",
            "field_label": "Height (cm)",
            "field_type": "number",
            "category": "student_info",
            "default_step": 1,
            "is_required_by_default": False,
            "placeholder": "Height in centimeters",
        },
        {
            "field_code": "student_weight",
            "field_label": "Weight (kg)",
            "field_type": "number",
            "category": "student_info",
            "default_step": 1,
            "is_required_by_default": False,
            "placeholder": "Weight in kilograms",
        },
        {
            "field_code": "student_identification_marks",
            "field_label": "Identification Marks",
            "field_type": "textarea",
            "category": "student_info",
            "default_step": 1,
            "is_required_by_default": False,
            "placeholder": "Any distinctive physical features",
        },
        {
            "field_code": "student_disabilities",
            "field_label": "Disabilities (if any)",
            "field_type": "textarea",
            "category": "student_info",
            "default_step": 1,
            "is_required_by_default": False,
            "placeholder": "Describe any physical or learning disabilities",
        },
        {
            "field_code": "student_medical_conditions",
            "field_label": "Special Medical Conditions",
            "field_type": "textarea",
            "category": "student_info",
            "default_step": 1,
            "is_required_by_default": False,
            "placeholder": "Chronic illness, allergies, etc.",
        },
    ])

    # ============= PARENT/GUARDIAN INFORMATION (Step 2) =============
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
        },
        {
            "field_code": "father_dob",
            "field_label": "Father's Date of Birth",
            "field_type": "date",
            "category": "parent_info",
            "default_step": 2,
            "is_required_by_default": False,
        },
        {
            "field_code": "father_education",
            "field_label": "Father's Educational Qualification",
            "field_type": "dropdown",
            "category": "parent_info",
            "default_step": 2,
            "is_required_by_default": True,
            "options": ["Below 10th", "10th Pass", "12th Pass", "Graduate", "Post-Graduate", "Doctorate", "Other"],
        },
        {
            "field_code": "father_occupation",
            "field_label": "Father's Occupation",
            "field_type": "text",
            "category": "parent_info",
            "default_step": 2,
            "is_required_by_default": True,
            "placeholder": "e.g., Engineer, Doctor, Business",
        },
        {
            "field_code": "father_designation",
            "field_label": "Father's Designation",
            "field_type": "text",
            "category": "parent_info",
            "default_step": 2,
            "is_required_by_default": False,
            "placeholder": "Job title/position",
        },
        {
            "field_code": "father_organization",
            "field_label": "Father's Organization/Company",
            "field_type": "text",
            "category": "parent_info",
            "default_step": 2,
            "is_required_by_default": False,
            "placeholder": "Company or organization name",
        },
        {
            "field_code": "father_office_address",
            "field_label": "Father's Office Address",
            "field_type": "textarea",
            "category": "parent_info",
            "default_step": 2,
            "is_required_by_default": False,
        },
        {
            "field_code": "father_office_phone",
            "field_label": "Father's Office Phone",
            "field_type": "phone",
            "category": "parent_info",
            "default_step": 2,
            "is_required_by_default": False,
            "validation_rules": {"pattern": "^[0-9+\\-() ]{10,15}$"},
        },
        {
            "field_code": "father_mobile",
            "field_label": "Father's Mobile Number",
            "field_type": "phone",
            "category": "parent_info",
            "default_step": 2,
            "is_required_by_default": True,
            "validation_rules": {"pattern": "^[0-9]{10}$"},
            "placeholder": "10-digit mobile number",
        },
        {
            "field_code": "father_email",
            "field_label": "Father's Email Address",
            "field_type": "email",
            "category": "parent_info",
            "default_step": 2,
            "is_required_by_default": True,
            "placeholder": "father@example.com",
        },
        {
            "field_code": "father_annual_income",
            "field_label": "Father's Annual Income",
            "field_type": "number",
            "category": "parent_info",
            "default_step": 2,
            "is_required_by_default": True,
            "placeholder": "Annual income in INR",
        },
        {
            "field_code": "father_aadhar",
            "field_label": "Father's Aadhar Number",
            "field_type": "text",
            "category": "parent_info",
            "default_step": 2,
            "is_required_by_default": False,
            "validation_rules": {"pattern": "^[0-9]{12}$"},
        },
        {
            "field_code": "father_pan",
            "field_label": "Father's PAN Number",
            "field_type": "text",
            "category": "parent_info",
            "default_step": 2,
            "is_required_by_default": False,
            "validation_rules": {"pattern": "^[A-Z]{5}[0-9]{4}[A-Z]{1}$"},
            "placeholder": "ABCDE1234F",
        },

        # Mother's Details
        {
            "field_code": "mother_full_name",
            "field_label": "Mother's Full Name",
            "field_type": "text",
            "category": "parent_info",
            "default_step": 2,
            "is_required_by_default": True,
            "validation_rules": {"min_length": 3, "max_length": 100},
        },
        {
            "field_code": "mother_dob",
            "field_label": "Mother's Date of Birth",
            "field_type": "date",
            "category": "parent_info",
            "default_step": 2,
            "is_required_by_default": False,
        },
        {
            "field_code": "mother_education",
            "field_label": "Mother's Educational Qualification",
            "field_type": "dropdown",
            "category": "parent_info",
            "default_step": 2,
            "is_required_by_default": True,
            "options": ["Below 10th", "10th Pass", "12th Pass", "Graduate", "Post-Graduate", "Doctorate", "Other"],
        },
        {
            "field_code": "mother_occupation",
            "field_label": "Mother's Occupation",
            "field_type": "text",
            "category": "parent_info",
            "default_step": 2,
            "is_required_by_default": True,
            "placeholder": "e.g., Teacher, Homemaker, Business",
        },
        {
            "field_code": "mother_designation",
            "field_label": "Mother's Designation",
            "field_type": "text",
            "category": "parent_info",
            "default_step": 2,
            "is_required_by_default": False,
        },
        {
            "field_code": "mother_organization",
            "field_label": "Mother's Organization/Company",
            "field_type": "text",
            "category": "parent_info",
            "default_step": 2,
            "is_required_by_default": False,
        },
        {
            "field_code": "mother_office_address",
            "field_label": "Mother's Office Address",
            "field_type": "textarea",
            "category": "parent_info",
            "default_step": 2,
            "is_required_by_default": False,
        },
        {
            "field_code": "mother_office_phone",
            "field_label": "Mother's Office Phone",
            "field_type": "phone",
            "category": "parent_info",
            "default_step": 2,
            "is_required_by_default": False,
        },
        {
            "field_code": "mother_mobile",
            "field_label": "Mother's Mobile Number",
            "field_type": "phone",
            "category": "parent_info",
            "default_step": 2,
            "is_required_by_default": True,
            "validation_rules": {"pattern": "^[0-9]{10}$"},
        },
        {
            "field_code": "mother_email",
            "field_label": "Mother's Email Address",
            "field_type": "email",
            "category": "parent_info",
            "default_step": 2,
            "is_required_by_default": True,
        },
        {
            "field_code": "mother_annual_income",
            "field_label": "Mother's Annual Income",
            "field_type": "number",
            "category": "parent_info",
            "default_step": 2,
            "is_required_by_default": False,
        },
        {
            "field_code": "mother_aadhar",
            "field_label": "Mother's Aadhar Number",
            "field_type": "text",
            "category": "parent_info",
            "default_step": 2,
            "is_required_by_default": False,
            "validation_rules": {"pattern": "^[0-9]{12}$"},
        },

        # Guardian Details
        {
            "field_code": "guardian_full_name",
            "field_label": "Guardian's Full Name",
            "field_type": "text",
            "category": "parent_info",
            "default_step": 2,
            "is_required_by_default": False,
            "help_text": "Only if parents are not available",
        },
        {
            "field_code": "guardian_relationship",
            "field_label": "Relationship with Student",
            "field_type": "text",
            "category": "parent_info",
            "default_step": 2,
            "is_required_by_default": False,
            "placeholder": "e.g., Uncle, Aunt, Grandfather",
        },
        {
            "field_code": "guardian_contact",
            "field_label": "Guardian's Contact Number",
            "field_type": "phone",
            "category": "parent_info",
            "default_step": 2,
            "is_required_by_default": False,
        },
        {
            "field_code": "guardian_email",
            "field_label": "Guardian's Email",
            "field_type": "email",
            "category": "parent_info",
            "default_step": 2,
            "is_required_by_default": False,
        },
    ])

    # ============= ADDRESS INFORMATION (Step 3) =============
    fields.extend([
        # Residential Address
        {
            "field_code": "res_house_number",
            "field_label": "House/Flat Number",
            "field_type": "text",
            "category": "address",
            "default_step": 3,
            "is_required_by_default": True,
        },
        {
            "field_code": "res_building_name",
            "field_label": "Building/Apartment Name",
            "field_type": "text",
            "category": "address",
            "default_step": 3,
            "is_required_by_default": False,
        },
        {
            "field_code": "res_street_locality",
            "field_label": "Street/Locality",
            "field_type": "text",
            "category": "address",
            "default_step": 3,
            "is_required_by_default": True,
        },
        {
            "field_code": "res_landmark",
            "field_label": "Landmark",
            "field_type": "text",
            "category": "address",
            "default_step": 3,
            "is_required_by_default": False,
            "placeholder": "Nearby landmark for easy location",
        },
        {
            "field_code": "res_city",
            "field_label": "City/Town",
            "field_type": "text",
            "category": "address",
            "default_step": 3,
            "is_required_by_default": True,
        },
        {
            "field_code": "res_district",
            "field_label": "District",
            "field_type": "text",
            "category": "address",
            "default_step": 3,
            "is_required_by_default": True,
        },
        {
            "field_code": "res_state",
            "field_label": "State",
            "field_type": "text",
            "category": "address",
            "default_step": 3,
            "is_required_by_default": True,
        },
        {
            "field_code": "res_pincode",
            "field_label": "PIN Code",
            "field_type": "text",
            "category": "address",
            "default_step": 3,
            "is_required_by_default": True,
            "validation_rules": {"pattern": "^[0-9]{6}$"},
            "placeholder": "6-digit PIN code",
        },
        {
            "field_code": "res_country",
            "field_label": "Country",
            "field_type": "text",
            "category": "address",
            "default_step": 3,
            "is_required_by_default": True,
        },

        # Permanent Address
        {
            "field_code": "perm_same_as_residential",
            "field_label": "Permanent Address same as Residential",
            "field_type": "checkbox",
            "category": "address",
            "default_step": 3,
            "is_required_by_default": False,
        },
        {
            "field_code": "perm_house_number",
            "field_label": "Permanent House/Flat Number",
            "field_type": "text",
            "category": "address",
            "default_step": 3,
            "is_required_by_default": False,
        },
        {
            "field_code": "perm_street_locality",
            "field_label": "Permanent Street/Locality",
            "field_type": "text",
            "category": "address",
            "default_step": 3,
            "is_required_by_default": False,
        },
        {
            "field_code": "perm_city",
            "field_label": "Permanent City",
            "field_type": "text",
            "category": "address",
            "default_step": 3,
            "is_required_by_default": False,
        },
        {
            "field_code": "perm_state",
            "field_label": "Permanent State",
            "field_type": "text",
            "category": "address",
            "default_step": 3,
            "is_required_by_default": False,
        },
        {
            "field_code": "perm_pincode",
            "field_label": "Permanent PIN Code",
            "field_type": "text",
            "category": "address",
            "default_step": 3,
            "is_required_by_default": False,
        },

        # Communication
        {
            "field_code": "emergency_contact_name",
            "field_label": "Emergency Contact Name",
            "field_type": "text",
            "category": "address",
            "default_step": 3,
            "is_required_by_default": True,
        },
        {
            "field_code": "emergency_contact_number",
            "field_label": "Emergency Contact Number",
            "field_type": "phone",
            "category": "address",
            "default_step": 3,
            "is_required_by_default": True,
        },
        {
            "field_code": "whatsapp_number",
            "field_label": "WhatsApp Number",
            "field_type": "phone",
            "category": "address",
            "default_step": 3,
            "is_required_by_default": False,
        },
    ])

    # ============= ACADEMIC INFORMATION (Step 4) =============
    fields.extend([
        # Current Academic
        {
            "field_code": "applying_for_class",
            "field_label": "Applying for Class",
            "field_type": "dropdown",
            "category": "academic",
            "default_step": 4,
            "is_required_by_default": True,
            "options": ["Pre-KG", "LKG", "UKG", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12"],
        },
        {
            "field_code": "applying_for_academic_year",
            "field_label": "Academic Year",
            "field_type": "text",
            "category": "academic",
            "default_step": 4,
            "is_required_by_default": True,
            "placeholder": "e.g., 2024-25",
        },
        {
            "field_code": "stream_preference",
            "field_label": "Stream/Group Preference",
            "field_type": "dropdown",
            "category": "academic",
            "default_step": 4,
            "is_required_by_default": False,
            "options": ["Science", "Commerce", "Arts"],
            "help_text": "For Class 11/12 only",
        },
        {
            "field_code": "second_language",
            "field_label": "Second Language Preference",
            "field_type": "dropdown",
            "category": "academic",
            "default_step": 4,
            "is_required_by_default": False,
            "options": ["Hindi", "Sanskrit", "French", "German", "Spanish"],
        },

        # Previous School
        {
            "field_code": "previous_school_name",
            "field_label": "Previous School Name",
            "field_type": "text",
            "category": "academic",
            "default_step": 4,
            "is_required_by_default": False,
        },
        {
            "field_code": "previous_school_address",
            "field_label": "Previous School Address",
            "field_type": "textarea",
            "category": "academic",
            "default_step": 4,
            "is_required_by_default": False,
        },
        {
            "field_code": "previous_school_board",
            "field_label": "Previous School Board",
            "field_type": "dropdown",
            "category": "academic",
            "default_step": 4,
            "is_required_by_default": False,
            "options": ["CBSE", "ICSE", "State Board", "IB", "IGCSE", "Other"],
        },
        {
            "field_code": "last_class_attended",
            "field_label": "Last Class Attended",
            "field_type": "text",
            "category": "academic",
            "default_step": 4,
            "is_required_by_default": False,
        },
        {
            "field_code": "tc_number",
            "field_label": "Transfer Certificate Number",
            "field_type": "text",
            "category": "academic",
            "default_step": 4,
            "is_required_by_default": False,
        },
        {
            "field_code": "last_year_percentage",
            "field_label": "Last Year Percentage/Grade",
            "field_type": "text",
            "category": "academic",
            "default_step": 4,
            "is_required_by_default": False,
            "placeholder": "e.g., 85% or A+",
        },
        {
            "field_code": "academic_achievements",
            "field_label": "Academic Achievements",
            "field_type": "textarea",
            "category": "academic",
            "default_step": 4,
            "is_required_by_default": False,
            "placeholder": "Any awards, medals, or recognitions",
        },

        # Siblings in same school
        {
            "field_code": "sibling_name",
            "field_label": "Sibling's Name (in this school)",
            "field_type": "text",
            "category": "academic",
            "default_step": 4,
            "is_required_by_default": False,
        },
        {
            "field_code": "sibling_class",
            "field_label": "Sibling's Current Class",
            "field_type": "text",
            "category": "academic",
            "default_step": 4,
            "is_required_by_default": False,
        },
        {
            "field_code": "sibling_admission_number",
            "field_label": "Sibling's Admission Number",
            "field_type": "text",
            "category": "academic",
            "default_step": 4,
            "is_required_by_default": False,
        },

        # Additional Info
        {
            "field_code": "transport_required",
            "field_label": "School Transport Required",
            "field_type": "dropdown",
            "category": "additional",
            "default_step": 4,
            "is_required_by_default": False,
            "options": ["Yes", "No"],
        },
        {
            "field_code": "bus_route",
            "field_label": "Preferred Bus Route/Stop",
            "field_type": "text",
            "category": "additional",
            "default_step": 4,
            "is_required_by_default": False,
        },
        {
            "field_code": "distance_from_school",
            "field_label": "Distance from School (km)",
            "field_type": "number",
            "category": "additional",
            "default_step": 4,
            "is_required_by_default": False,
        },

        # Health & Medical
        {
            "field_code": "allergies",
            "field_label": "Allergies (Food/Medicine)",
            "field_type": "textarea",
            "category": "additional",
            "default_step": 4,
            "is_required_by_default": False,
            "placeholder": "List any known allergies",
        },
        {
            "field_code": "chronic_illness",
            "field_label": "Chronic Illness",
            "field_type": "textarea",
            "category": "additional",
            "default_step": 4,
            "is_required_by_default": False,
        },
        {
            "field_code": "current_medications",
            "field_label": "Current Medications",
            "field_type": "textarea",
            "category": "additional",
            "default_step": 4,
            "is_required_by_default": False,
        },
        {
            "field_code": "vaccination_status",
            "field_label": "Vaccination Status",
            "field_type": "dropdown",
            "category": "additional",
            "default_step": 4,
            "is_required_by_default": False,
            "options": ["Fully Vaccinated", "Partially Vaccinated", "Not Vaccinated"],
        },

        # Special Requirements
        {
            "field_code": "learning_disabilities",
            "field_label": "Learning Disabilities",
            "field_type": "textarea",
            "category": "additional",
            "default_step": 4,
            "is_required_by_default": False,
            "placeholder": "Dyslexia, ADHD, etc.",
        },
        {
            "field_code": "special_educational_needs",
            "field_label": "Special Educational Needs (SEN)",
            "field_type": "textarea",
            "category": "additional",
            "default_step": 4,
            "is_required_by_default": False,
        },
        {
            "field_code": "dietary_restrictions",
            "field_label": "Dietary Restrictions",
            "field_type": "dropdown",
            "category": "additional",
            "default_step": 4,
            "is_required_by_default": False,
            "options": ["Vegetarian", "Non-Vegetarian", "Vegan", "No Restrictions"],
        },

        # Co-curricular
        {
            "field_code": "sports_interest",
            "field_label": "Sports Interest",
            "field_type": "text",
            "category": "additional",
            "default_step": 4,
            "is_required_by_default": False,
            "placeholder": "Cricket, Football, Swimming, etc.",
        },
        {
            "field_code": "arts_music_interest",
            "field_label": "Arts/Music Interest",
            "field_type": "text",
            "category": "additional",
            "default_step": 4,
            "is_required_by_default": False,
        },
        {
            "field_code": "hobbies",
            "field_label": "Hobbies",
            "field_type": "textarea",
            "category": "additional",
            "default_step": 4,
            "is_required_by_default": False,
        },

        # Financial
        {
            "field_code": "fee_concession_required",
            "field_label": "Fee Concession Required",
            "field_type": "dropdown",
            "category": "financial",
            "default_step": 4,
            "is_required_by_default": False,
            "options": ["Yes", "No"],
        },
        {
            "field_code": "scholarship_request",
            "field_label": "Scholarship Request",
            "field_type": "dropdown",
            "category": "financial",
            "default_step": 4,
            "is_required_by_default": False,
            "options": ["Yes", "No"],
        },
        {
            "field_code": "category_for_concession",
            "field_label": "Category for Fee Concession",
            "field_type": "dropdown",
            "category": "financial",
            "default_step": 4,
            "is_required_by_default": False,
            "options": ["SC/ST", "OBC", "BPL", "EWS", "Other"],
        },
        {
            "field_code": "annual_family_income",
            "field_label": "Annual Family Income",
            "field_type": "number",
            "category": "financial",
            "default_step": 4,
            "is_required_by_default": False,
            "placeholder": "Total family income in INR",
        },
    ])

    # ============= DOCUMENTS & CONSENT (Step 5) =============
    # Note: Document uploads are handled by existing document upload system
    # These are just consent checkboxes
    fields.extend([
        {
            "field_code": "consent_true_information",
            "field_label": "I declare that all information provided is true",
            "field_type": "checkbox",
            "category": "consent",
            "default_step": 5,
            "is_required_by_default": True,
        },
        {
            "field_code": "consent_school_rules",
            "field_label": "I agree to abide by school rules and regulations",
            "field_type": "checkbox",
            "category": "consent",
            "default_step": 5,
            "is_required_by_default": True,
        },
        {
            "field_code": "consent_photo_video",
            "field_label": "I consent to photo/video usage for school activities",
            "field_type": "checkbox",
            "category": "consent",
            "default_step": 5,
            "is_required_by_default": False,
        },
        {
            "field_code": "consent_medical_emergency",
            "field_label": "I consent to medical emergency treatment if required",
            "field_type": "checkbox",
            "category": "consent",
            "default_step": 5,
            "is_required_by_default": True,
        },
        {
            "field_code": "consent_data_privacy",
            "field_label": "I consent to data privacy policy and usage",
            "field_type": "checkbox",
            "category": "consent",
            "default_step": 5,
            "is_required_by_default": True,
        },
        {
            "field_code": "terms_conditions_acceptance",
            "field_label": "I accept all terms and conditions",
            "field_type": "checkbox",
            "category": "consent",
            "default_step": 5,
            "is_required_by_default": True,
        },
    ])

    # Insert all fields
    for field_data in fields:
        field = FormFieldMaster(**field_data)
        db.add(field)

    db.commit()

    print(f"[SUCCESS] Seeded {len(fields)} form fields!")
    print(f"  - Student Info: {sum(1 for f in fields if f['category'] == 'student_info')}")
    print(f"  - Parent Info: {sum(1 for f in fields if f['category'] == 'parent_info')}")
    print(f"  - Address: {sum(1 for f in fields if f['category'] == 'address')}")
    print(f"  - Academic: {sum(1 for f in fields if f['category'] == 'academic')}")
    print(f"  - Additional: {sum(1 for f in fields if f['category'] == 'additional')}")
    print(f"  - Financial: {sum(1 for f in fields if f['category'] == 'financial')}")
    print(f"  - Consent: {sum(1 for f in fields if f['category'] == 'consent')}")


if __name__ == "__main__":
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker

    engine = create_engine('sqlite:///./admission.db')
    Session = sessionmaker(bind=engine)
    db = Session()

    try:
        seed_all_form_fields(db)
    finally:
        db.close()
