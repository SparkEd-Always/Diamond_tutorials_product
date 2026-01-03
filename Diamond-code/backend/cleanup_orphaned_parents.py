"""
Script to clean up orphaned parents from the database
Run this once to remove parents whose students have been deleted
"""
import os
import sys

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.core.database import SessionLocal
from app.models.parent import Parent
from app.models.student import Student
from app.models.communication import Communication


def cleanup_orphaned_parents():
    """Remove parents who have no active students"""
    db: Session = SessionLocal()

    try:
        # Get all parents
        all_parents = db.query(Parent).all()
        total_parents = len(all_parents)
        deleted_count = 0

        print(f"\n🔍 Checking {total_parents} parents for orphans...")
        print("="*60)

        for parent in all_parents:
            phone = parent.phone_number
            phone_without_prefix = phone.replace('+91', '') if phone.startswith('+91') else phone
            phone_with_prefix = f"+91{phone_without_prefix}" if not phone.startswith('+91') else phone

            # Check if parent has any active students
            active_students = db.query(Student).filter(
                or_(
                    Student.parent_phone == phone,
                    Student.parent_phone == phone_with_prefix,
                    Student.parent_phone == phone_without_prefix
                ),
                Student.is_active == "Active"
            ).all()

            if len(active_students) == 0:
                print(f"\n❌ Orphaned parent found:")
                print(f"   Name: {parent.name}")
                print(f"   Phone: {parent.phone_number}")
                print(f"   ID: {parent.id}")

                # Delete parent's messages
                msg_count = db.query(Communication).filter(
                    Communication.recipient_type == "parent",
                    Communication.recipient_id == parent.id
                ).count()

                if msg_count > 0:
                    db.query(Communication).filter(
                        Communication.recipient_type == "parent",
                        Communication.recipient_id == parent.id
                    ).delete(synchronize_session=False)
                    print(f"   Deleted {msg_count} messages")

                # Delete parent
                db.delete(parent)
                deleted_count += 1
                print(f"   ✅ Parent deleted")
            else:
                print(f"✅ {parent.name} has {len(active_students)} active student(s) - keeping")

        if deleted_count > 0:
            db.commit()
            print("\n"+"="*60)
            print(f"🎉 Cleanup complete!")
            print(f"   Total parents checked: {total_parents}")
            print(f"   Orphaned parents removed: {deleted_count}")
            print(f"   Active parents remaining: {total_parents - deleted_count}")
        else:
            print("\n"+"="*60)
            print(f"✅ No orphaned parents found. Database is clean!")
            print(f"   Total active parents: {total_parents}")

        print("="*60 + "\n")

    except Exception as e:
        db.rollback()
        print(f"\n❌ Error during cleanup: {str(e)}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("\n" + "="*60)
    print("  ORPHANED PARENT CLEANUP SCRIPT")
    print("="*60)

    response = input("\n⚠️  This will delete parents with no active students. Continue? (yes/no): ")

    if response.lower() in ['yes', 'y']:
        cleanup_orphaned_parents()
    else:
        print("\n❌ Cleanup cancelled.")
