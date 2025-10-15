"""
Fee Management Test Data Seeder
Populates the database with sample fee data for testing

Run this script after migration to populate fee management tables with test data.
"""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from datetime import datetime, date, timedelta
from decimal import Decimal
from sqlalchemy.orm import Session

from app.core.database import SessionLocal, engine
from app.models import (
    # Core models
    AcademicYear, Class, Student, Parent, User,
    # Fee models
    FeeType, FeeFrequency, FeeStructure, StudentFeeAssignment,
    Invoice, InvoiceItem, InvoiceStatus, StudentFeeLedger
)


def get_or_create_academic_year(db: Session) -> AcademicYear:
    """Get or create current academic year"""
    year = db.query(AcademicYear).filter(
        AcademicYear.year_name == "2024-25"
    ).first()

    if not year:
        year = AcademicYear(
            year_name="2024-25",
            start_date=date(2024, 4, 1),
            end_date=date(2025, 3, 31),
            is_current=True
        )
        db.add(year)
        db.commit()
        db.refresh(year)
        print(f"✓ Created academic year: {year.year_name}")
    else:
        print(f"✓ Using existing academic year: {year.year_name}")

    return year


def create_fee_types(db: Session) -> list[FeeType]:
    """Create 8 standard fee types"""

    fee_types_data = [
        {
            "type_name": "Tuition Fee",
            "code": "FEE_TUITION",
            "description": "Annual tuition fee for academic instruction",
            "frequency": FeeFrequency.ANNUAL,
            "is_mandatory": True,
            "is_refundable": False,
            "is_taxable": True,
            "tax_rate": Decimal("18.00"),
            "display_order": 1
        },
        {
            "type_name": "Exam Fee",
            "code": "FEE_EXAM",
            "description": "Fee for term-end examinations and assessments",
            "frequency": FeeFrequency.QUARTERLY,
            "is_mandatory": True,
            "is_refundable": False,
            "is_taxable": True,
            "tax_rate": Decimal("18.00"),
            "display_order": 2
        },
        {
            "type_name": "Library Fee",
            "code": "FEE_LIBRARY",
            "description": "Annual library membership and book access fee",
            "frequency": FeeFrequency.ANNUAL,
            "is_mandatory": True,
            "is_refundable": False,
            "is_taxable": True,
            "tax_rate": Decimal("18.00"),
            "display_order": 3
        },
        {
            "type_name": "Sports Fee",
            "code": "FEE_SPORTS",
            "description": "Fee for sports activities and equipment",
            "frequency": FeeFrequency.ANNUAL,
            "is_mandatory": False,
            "is_refundable": True,
            "is_taxable": True,
            "tax_rate": Decimal("18.00"),
            "display_order": 4
        },
        {
            "type_name": "Transport Fee",
            "code": "FEE_TRANSPORT",
            "description": "Monthly bus/van transportation fee",
            "frequency": FeeFrequency.MONTHLY,
            "is_mandatory": False,
            "is_refundable": True,
            "is_taxable": True,
            "tax_rate": Decimal("18.00"),
            "display_order": 5
        },
        {
            "type_name": "Lab Fee",
            "code": "FEE_LAB",
            "description": "Laboratory and practical work fee (Science/Computer)",
            "frequency": FeeFrequency.ANNUAL,
            "is_mandatory": False,
            "is_refundable": False,
            "is_taxable": True,
            "tax_rate": Decimal("18.00"),
            "display_order": 6
        },
        {
            "type_name": "Activity Fee",
            "code": "FEE_ACTIVITY",
            "description": "Co-curricular activities, field trips, cultural events",
            "frequency": FeeFrequency.ANNUAL,
            "is_mandatory": True,
            "is_refundable": False,
            "is_taxable": True,
            "tax_rate": Decimal("18.00"),
            "display_order": 7
        },
        {
            "type_name": "Admission Fee",
            "code": "FEE_ADMISSION",
            "description": "One-time admission/registration fee for new students",
            "frequency": FeeFrequency.ONE_TIME,
            "is_mandatory": True,
            "is_refundable": False,
            "is_taxable": True,
            "tax_rate": Decimal("18.00"),
            "display_order": 8
        }
    ]

    fee_types = []
    for data in fee_types_data:
        # Check if already exists
        existing = db.query(FeeType).filter(FeeType.code == data["code"]).first()
        if existing:
            print(f"  - {data['type_name']} (already exists)")
            fee_types.append(existing)
        else:
            fee_type = FeeType(**data)
            db.add(fee_type)
            fee_types.append(fee_type)
            print(f"  + {data['type_name']}")

    db.commit()
    print(f"\n✓ Created {len(fee_types)} fee types")
    return fee_types


def create_fee_structures(db: Session, academic_year: AcademicYear, fee_types: list[FeeType]) -> list[FeeStructure]:
    """Create fee structures for all classes"""

    # Get all classes
    classes = db.query(Class).order_by(Class.class_order).all()

    if not classes:
        print("⚠ No classes found in database. Please create classes first.")
        return []

    print(f"\n✓ Found {len(classes)} classes")

    # Fee amounts by class level (in Rupees)
    fee_amounts = {
        "FEE_TUITION": {
            "Pre-KG": 25000, "LKG": 25000, "UKG": 25000,
            "Class 1": 30000, "Class 2": 30000, "Class 3": 32000,
            "Class 4": 32000, "Class 5": 35000, "Class 6": 38000,
            "Class 7": 38000, "Class 8": 40000, "Class 9": 45000,
            "Class 10": 45000
        },
        "FEE_EXAM": {
            "Pre-KG": 1000, "LKG": 1000, "UKG": 1000,
            "Class 1": 1500, "Class 2": 1500, "Class 3": 1500,
            "Class 4": 1500, "Class 5": 2000, "Class 6": 2000,
            "Class 7": 2000, "Class 8": 2500, "Class 9": 3000,
            "Class 10": 3000
        },
        "FEE_LIBRARY": {
            "Pre-KG": 500, "LKG": 500, "UKG": 500,
            "Class 1": 1000, "Class 2": 1000, "Class 3": 1000,
            "Class 4": 1000, "Class 5": 1500, "Class 6": 1500,
            "Class 7": 1500, "Class 8": 1500, "Class 9": 2000,
            "Class 10": 2000
        },
        "FEE_SPORTS": {
            "Pre-KG": 1000, "LKG": 1000, "UKG": 1000,
            "Class 1": 1500, "Class 2": 1500, "Class 3": 1500,
            "Class 4": 1500, "Class 5": 2000, "Class 6": 2000,
            "Class 7": 2000, "Class 8": 2500, "Class 9": 2500,
            "Class 10": 2500
        },
        "FEE_TRANSPORT": {
            "Pre-KG": 1500, "LKG": 1500, "UKG": 1500,
            "Class 1": 1500, "Class 2": 1500, "Class 3": 1500,
            "Class 4": 1500, "Class 5": 1500, "Class 6": 1500,
            "Class 7": 1500, "Class 8": 1500, "Class 9": 1500,
            "Class 10": 1500
        },
        "FEE_LAB": {
            "Pre-KG": 0, "LKG": 0, "UKG": 0,
            "Class 1": 0, "Class 2": 0, "Class 3": 0,
            "Class 4": 0, "Class 5": 1000, "Class 6": 1500,
            "Class 7": 1500, "Class 8": 2000, "Class 9": 2500,
            "Class 10": 2500
        },
        "FEE_ACTIVITY": {
            "Pre-KG": 2000, "LKG": 2000, "UKG": 2000,
            "Class 1": 2500, "Class 2": 2500, "Class 3": 2500,
            "Class 4": 2500, "Class 5": 3000, "Class 6": 3000,
            "Class 7": 3000, "Class 8": 3500, "Class 9": 4000,
            "Class 10": 4000
        },
        "FEE_ADMISSION": {
            "Pre-KG": 5000, "LKG": 5000, "UKG": 5000,
            "Class 1": 7500, "Class 2": 7500, "Class 3": 7500,
            "Class 4": 7500, "Class 5": 10000, "Class 6": 10000,
            "Class 7": 10000, "Class 8": 10000, "Class 9": 12500,
            "Class 10": 12500
        }
    }

    fee_structures = []

    for class_obj in classes:
        print(f"\n{class_obj.class_name}:")

        for fee_type in fee_types:
            # Skip if amount is 0 (not applicable)
            amount = fee_amounts.get(fee_type.code, {}).get(class_obj.class_name, 0)
            if amount == 0:
                continue

            # Check if already exists
            existing = db.query(FeeStructure).filter(
                FeeStructure.academic_year_id == academic_year.id,
                FeeStructure.class_id == class_obj.id,
                FeeStructure.fee_type_id == fee_type.id
            ).first()

            if existing:
                print(f"  - {fee_type.type_name}: ₹{amount:,} (exists)")
                fee_structures.append(existing)
                continue

            # Create fee structure
            fee_structure = FeeStructure(
                academic_year_id=academic_year.id,
                class_id=class_obj.id,
                fee_type_id=fee_type.id,
                amount=Decimal(str(amount)),
                installments=3 if fee_type.frequency == FeeFrequency.QUARTERLY else 1,
                due_date=date(2024, 6, 30) if fee_type.frequency == FeeFrequency.ANNUAL else None,
                due_day_of_month=10 if fee_type.frequency == FeeFrequency.MONTHLY else None,
                late_fee_applicable=True,
                late_fee_percentage=Decimal("2.00"),
                grace_period_days=7,
                sibling_discount_applicable=True,
                early_payment_discount_applicable=True,
                early_payment_discount_percentage=Decimal("5.00"),
                early_payment_days=15,
                is_active=True
            )

            db.add(fee_structure)
            fee_structures.append(fee_structure)
            print(f"  + {fee_type.type_name}: ₹{amount:,}")

    db.commit()
    print(f"\n✓ Created {len(fee_structures)} fee structures")
    return fee_structures


def assign_fees_to_students(db: Session, fee_structures: list[FeeStructure]) -> list[StudentFeeAssignment]:
    """Assign fees to all enrolled students"""

    # Get all students
    students = db.query(Student).all()

    if not students:
        print("\n⚠ No students found in database.")
        return []

    print(f"\n✓ Found {len(students)} students")

    # Get admin user for assignment tracking
    admin = db.query(User).filter(User.email == "admin@school.com").first()
    if not admin:
        print("⚠ Admin user not found, using user_id=1")
        admin_id = 1
    else:
        admin_id = admin.id

    assignments = []

    for student in students:
        # Get student's class from their application
        if not hasattr(student, 'applications') or not student.applications:
            print(f"  - Student {student.id}: No application found")
            continue

        # Get the most recent application
        application = student.applications[0]
        if not application.class_applying_id:
            print(f"  - Student {student.id}: No class assigned")
            continue

        # Get fee structures for student's class
        student_structures = [fs for fs in fee_structures if fs.class_id == application.class_applying_id]

        if not student_structures:
            print(f"  - Student {student.id}: No fee structures found for class")
            continue

        print(f"\n  Student {student.id}:")

        for fee_structure in student_structures:
            # Check if already assigned
            existing = db.query(StudentFeeAssignment).filter(
                StudentFeeAssignment.student_id == student.id,
                StudentFeeAssignment.fee_structure_id == fee_structure.id
            ).first()

            if existing:
                assignments.append(existing)
                continue

            # Apply sibling discount for 2nd child (10%)
            discount_percentage = Decimal("10.00") if student.id % 3 == 0 else Decimal("0.00")
            discount_reason = "Sibling discount (2nd child)" if discount_percentage > 0 else None

            assignment = StudentFeeAssignment(
                student_id=student.id,
                fee_structure_id=fee_structure.id,
                custom_amount=None,  # Use fee structure amount
                discount_percentage=discount_percentage,
                discount_amount=Decimal("0.00"),
                discount_reason=discount_reason,
                custom_due_date=None,
                is_waived=False,
                is_active=True,
                assigned_by=admin_id,
                assigned_at=datetime.now()
            )

            db.add(assignment)
            assignments.append(assignment)

            # Get fee type name and calculate amount
            fee_type = db.query(FeeType).filter(FeeType.id == fee_structure.fee_type_id).first()
            if fee_type:
                fee_name = fee_type.type_name
                # Calculate amount manually since object not yet committed
                base_amount = float(fee_structure.amount)
                if discount_percentage > 0:
                    base_amount -= base_amount * (float(discount_percentage) / 100)
                final_amount = round(base_amount, 2)
                print(f"    + {fee_name}: Rs.{final_amount:,.2f}")

    db.commit()
    print(f"\n✓ Created {len(assignments)} fee assignments")
    return assignments


def initialize_student_ledgers(db: Session, academic_year: AcademicYear):
    """Initialize student fee ledgers"""

    students = db.query(Student).all()

    if not students:
        print("\n⚠ No students found.")
        return

    print(f"\n✓ Initializing ledgers for {len(students)} students")

    for student in students:
        # Check if ledger already exists
        existing = db.query(StudentFeeLedger).filter(
            StudentFeeLedger.student_id == student.id,
            StudentFeeLedger.academic_year_id == academic_year.id
        ).first()

        if existing:
            continue

        # Calculate total assigned fees
        assignments = db.query(StudentFeeAssignment).filter(
            StudentFeeAssignment.student_id == student.id,
            StudentFeeAssignment.is_active == True
        ).all()

        total_assigned = sum(assignment.get_final_amount() for assignment in assignments)

        ledger = StudentFeeLedger(
            student_id=student.id,
            academic_year_id=academic_year.id,
            total_fees_assigned=Decimal(str(total_assigned)),
            total_invoiced=Decimal("0.00"),
            total_paid=Decimal("0.00"),
            total_outstanding=Decimal(str(total_assigned)),
            total_refunded=Decimal("0.00"),
            total_waived=Decimal("0.00"),
            total_discounts=Decimal("0.00"),
            has_outstanding=True,
            has_overdue=False,
            is_defaulter=False
        )

        db.add(ledger)
        print(f"  + Student {student.id}: ₹{total_assigned:,.2f} assigned")

    db.commit()
    print(f"\n✓ Student ledgers initialized")


def print_summary(db: Session):
    """Print summary of seeded data"""

    print("\n" + "="*60)
    print("FEE DATA SEEDING SUMMARY")
    print("="*60)

    fee_types_count = db.query(FeeType).count()
    fee_structures_count = db.query(FeeStructure).count()
    assignments_count = db.query(StudentFeeAssignment).count()
    ledgers_count = db.query(StudentFeeLedger).count()

    print(f"\n✓ Fee Types:            {fee_types_count}")
    print(f"✓ Fee Structures:       {fee_structures_count}")
    print(f"✓ Student Assignments:  {assignments_count}")
    print(f"✓ Student Ledgers:      {ledgers_count}")

    # Sample data
    print(f"\n{'='*60}")
    print("SAMPLE FEE STRUCTURE (Class 5)")
    print("="*60)

    class_5 = db.query(Class).filter(Class.class_name == "Class 5").first()
    if class_5:
        structures = db.query(FeeStructure).filter(
            FeeStructure.class_id == class_5.id
        ).all()

        total = Decimal("0.00")
        for structure in structures:
            fee_type = db.query(FeeType).filter(FeeType.id == structure.fee_type_id).first()
            print(f"{fee_type.type_name:20s}: ₹{structure.amount:>10,.2f}")
            total += structure.amount

        print(f"{'─'*35}")
        print(f"{'Total (before tax)':20s}: ₹{total:>10,.2f}")
        tax = total * Decimal("0.18")
        print(f"{'GST @ 18%':20s}: ₹{tax:>10,.2f}")
        print(f"{'Grand Total':20s}: ₹{(total + tax):>10,.2f}")

    print(f"\n{'='*60}")
    print("✅ Fee data seeding completed successfully!")
    print("="*60)
    print("\nNext steps:")
    print("  1. Create Pydantic schemas for API validation")
    print("  2. Implement fee management APIs")
    print("  3. Build admin UI for fee management")
    print("="*60 + "\n")


def main():
    """Main seeding function"""
    print("\n" + "="*60)
    print("FEE MANAGEMENT DATA SEEDER")
    print("="*60)

    db = SessionLocal()

    try:
        # Step 1: Get or create academic year
        print("\n[1/6] Academic Year...")
        academic_year = get_or_create_academic_year(db)

        # Step 2: Create fee types
        print("\n[2/6] Fee Types...")
        fee_types = create_fee_types(db)

        # Step 3: Create fee structures
        print("\n[3/6] Fee Structures...")
        fee_structures = create_fee_structures(db, academic_year, fee_types)

        # Step 4: Assign fees to students
        print("\n[4/6] Student Fee Assignments...")
        assignments = assign_fees_to_students(db, fee_structures)

        # Step 5: Initialize student ledgers
        print("\n[5/6] Student Ledgers...")
        initialize_student_ledgers(db, academic_year)

        # Step 6: Print summary
        print("\n[6/6] Summary...")
        print_summary(db)

    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    main()
