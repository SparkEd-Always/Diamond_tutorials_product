"""
Database initialization script
Creates default data for the admission system
"""
from sqlalchemy.orm import Session
from datetime import date
from ..core.database import SessionLocal, Base, engine
from ..core.security import get_password_hash
from ..models.user import User, UserRole
from ..models.user_profile import UserProfile, Gender
from ..models.academic import AcademicYear, Class, Section
from ..models.admission import DocumentType
from ..models.student import Student, Parent, StudentParent
from ..models.workflow import AdmissionWorkflowStep
from ..models.form_configuration import (
    FormFieldMaster,
    SchoolFormConfiguration,
    FormTemplate,
    FormTemplateField,
    School
)

def create_admin_user(db: Session):
    """Create default admin user"""
    # Check if admin exists
    admin = db.query(User).filter(User.email == "admin@school.com").first()
    if admin:
        print("Admin user already exists")
        return

    # Create admin user
    admin = User(
        email="admin@school.com",
        password_hash=get_password_hash("admin123"),
        role=UserRole.ADMIN,
        phone="+919999999999",
        is_active=True,
        is_verified=True
    )
    db.add(admin)
    db.commit()

    # Create admin profile
    admin_profile = UserProfile(
        user_id=admin.id,
        first_name="System",
        last_name="Administrator",
        gender=Gender.OTHER
    )
    db.add(admin_profile)
    db.commit()

    print(f"Admin user created: admin@school.com / admin123")

def create_academic_year(db: Session):
    """Create current academic year"""
    # Check if exists
    ay = db.query(AcademicYear).filter(AcademicYear.is_current == True).first()
    if ay:
        print("Academic year already exists")
        return

    # Create academic year
    academic_year = AcademicYear(
        year_name="2024-25",
        start_date=date(2024, 4, 1),
        end_date=date(2025, 3, 31),
        is_current=True,
        admission_start_date=date(2024, 1, 1),
        admission_end_date=date(2024, 3, 31)
    )
    db.add(academic_year)
    db.commit()
    db.refresh(academic_year)

    print(f"Academic year created: {academic_year.year_name}")

    # Create classes
    classes_data = [
        ("Pre-KG", 0, 25, 3, 4, 5000, 45000),
        ("LKG", 1, 30, 4, 5, 5000, 50000),
        ("UKG", 2, 30, 5, 6, 5000, 50000),
        ("Class 1", 3, 35, 6, 7, 6000, 55000),
        ("Class 2", 4, 35, 7, 8, 6000, 55000),
        ("Class 3", 5, 35, 8, 9, 6000, 60000),
        ("Class 4", 6, 35, 9, 10, 6000, 60000),
        ("Class 5", 7, 35, 10, 11, 7000, 65000),
        ("Class 6", 8, 35, 11, 12, 7000, 70000),
        ("Class 7", 9, 35, 12, 13, 7000, 70000),
        ("Class 8", 10, 35, 13, 14, 8000, 75000),
        ("Class 9", 11, 35, 14, 15, 8000, 80000),
        ("Class 10", 12, 35, 15, 16, 8000, 85000),
    ]

    for class_name, order, capacity, age_min, age_max, adm_fee, annual_fee in classes_data:
        class_obj = Class(
            academic_year_id=academic_year.id,
            class_name=class_name,
            class_order=order,
            capacity=capacity,
            age_min=age_min,
            age_max=age_max,
            admission_fee=adm_fee,
            annual_fee=annual_fee,
            is_active=True
        )
        db.add(class_obj)

    db.commit()
    print(f"Created {len(classes_data)} classes")

    # Create sections (A, B, C for each class)
    classes = db.query(Class).filter(Class.academic_year_id == academic_year.id).all()
    for class_obj in classes:
        for section_name in ['A', 'B', 'C']:
            section = Section(
                class_id=class_obj.id,
                section_name=section_name,
                capacity=30,
                is_active=True
            )
            db.add(section)

    db.commit()
    print(f"Created sections for all classes")

def create_document_types(db: Session):
    """Create default document types"""
    # Check if exists
    existing = db.query(DocumentType).first()
    if existing:
        print("Document types already exist")
        return

    document_types = [
        ("birth_certificate", True, "Student Birth Certificate", "pdf,jpg,jpeg,png"),
        ("previous_school_tc", True, "Transfer Certificate from Previous School", "pdf,jpg,jpeg,png"),
        ("photo_student", True, "Recent Passport Size Photo of Student", "jpg,jpeg,png"),
        ("photo_family", False, "Family Photo", "jpg,jpeg,png"),
        ("address_proof", True, "Address Proof (Electricity Bill/Rent Agreement)", "pdf,jpg,jpeg,png"),
        ("income_proof", False, "Income Certificate/Salary Slip", "pdf"),
        ("caste_certificate", False, "Caste Certificate (if applicable)", "pdf,jpg,jpeg,png"),
        ("medical_certificate", False, "Medical Fitness Certificate", "pdf"),
        ("aadhar_card", True, "Aadhar Card (Student)", "pdf,jpg,jpeg,png"),
        ("parent_id_proof", True, "Parent ID Proof", "pdf,jpg,jpeg,png"),
    ]

    for type_name, is_mandatory, description, formats in document_types:
        doc_type = DocumentType(
            type_name=type_name,
            is_mandatory=is_mandatory,
            description=description,
            allowed_formats=formats,
            max_file_size_mb=5
        )
        db.add(doc_type)

    db.commit()
    print(f"Created {len(document_types)} document types")

def create_default_school(db: Session):
    """Create default school record"""
    # Check if exists
    school = db.query(School).filter(School.id == 1).first()
    if school:
        print("Default school already exists")
        return school

    school = School(
        school_name="ABC International School",
        school_code="ABC001",
        address="123 Main Street, City",
        phone="+919876543210",
        email="contact@abcschool.com",
        subdomain="abc"
    )
    db.add(school)
    db.commit()
    db.refresh(school)
    print(f"Created default school: {school.school_name}")
    return school

def initialize_database():
    """Main initialization function"""
    print("Initializing database...")

    # Create all tables first
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully")

    db = SessionLocal()

    try:
        create_admin_user(db)
        create_academic_year(db)
        create_document_types(db)

        # Seed workflow steps
        from .seed_workflow import seed_default_workflow_steps
        seed_default_workflow_steps(db)

        # Create default school
        create_default_school(db)

        # Seed form configuration data (complete with all fields)
        from .seed_form_fields_complete import seed_all_form_fields
        from .seed_templates_complete import seed_comprehensive_templates

        seed_all_form_fields(db)
        seed_comprehensive_templates(db)

        print("\nDatabase initialization complete!")
        print("\nLogin credentials:")
        print("   Email: admin@school.com")
        print("   Password: admin123")

    except Exception as e:
        print(f"Error during initialization: {str(e)}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    initialize_database()
