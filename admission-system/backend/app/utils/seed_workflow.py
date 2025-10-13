"""
Seed default admission workflow steps for ABC School.
This includes all steps in the admission process.
"""
from sqlalchemy.orm import Session
from app.models.workflow import AdmissionWorkflowStep
from app.core.database import SessionLocal


def seed_default_workflow_steps(db: Session):
    """
    Create default workflow steps for ABC School.
    Includes all steps: Application → Documents → Test → Interview → Decision → Fee → Enrollment
    """

    # Check if workflow steps already exist
    existing_steps = db.query(AdmissionWorkflowStep).count()
    if existing_steps > 0:
        print(f"[OK] Workflow steps already exist ({existing_steps} steps). Skipping seed.")
        return

    default_steps = [
        {
            "step_name": "Application Submitted",
            "step_description": "Student has submitted the admission application form",
            "step_order": 1,
            "is_required": True,
            "is_active": True
        },
        {
            "step_name": "Documents Verification",
            "step_description": "Uploaded documents are being verified by the admission team",
            "step_order": 2,
            "is_required": True,
            "is_active": True
        },
        {
            "step_name": "Entrance Test",
            "step_description": "Student needs to appear for the entrance test",
            "step_order": 3,
            "is_required": True,  # ABC School requires entrance test
            "is_active": True
        },
        {
            "step_name": "Interview",
            "step_description": "Parent and student interview with the admission committee",
            "step_order": 4,
            "is_required": True,  # ABC School requires interview
            "is_active": True
        },
        {
            "step_name": "Admission Decision",
            "step_description": "Admission committee has made a decision on the application",
            "step_order": 5,
            "is_required": True,
            "is_active": True
        },
        {
            "step_name": "Fee Payment",
            "step_description": "Admission fee payment is required to confirm enrollment",
            "step_order": 6,
            "is_required": True,
            "is_active": True
        },
        {
            "step_name": "Enrollment Complete",
            "step_description": "Student is successfully enrolled for the academic year",
            "step_order": 7,
            "is_required": True,
            "is_active": True
        }
    ]

    print("Seeding default admission workflow steps for ABC School...")

    for step_data in default_steps:
        step = AdmissionWorkflowStep(**step_data)
        db.add(step)
        print(f"  [+] Created: {step_data['step_order']}. {step_data['step_name']}")

    db.commit()
    print(f"[OK] Successfully seeded {len(default_steps)} workflow steps")


def main():
    """Run the seed function"""
    db = SessionLocal()
    try:
        seed_default_workflow_steps(db)
    finally:
        db.close()


if __name__ == "__main__":
    main()
