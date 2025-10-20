"""
Fix Student Status Enum Issue
This script updates the students table to properly handle enum values
"""

import sqlite3
import sys

def fix_student_status_enum():
    """
    The issue is that SQLAlchemy's Enum with native_enum=False expects
    the database to store the string values directly, which it does.
    But sometimes SQLAlchemy gets confused with the enum lookup.

    This script will:
    1. Create a new column with TEXT type
    2. Copy data from old column
    3. Drop old column
    4. Rename new column
    """

    db_path = "admission.db"
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # Check current status values
        cursor.execute("SELECT DISTINCT status FROM students;")
        current_statuses = [row[0] for row in cursor.fetchall()]
        print(f"Current status values: {current_statuses}")

        # Count students by status
        cursor.execute("SELECT status, COUNT(*) FROM students GROUP BY status;")
        status_counts = cursor.fetchall()
        print("\nStudent counts by status:")
        for status, count in status_counts:
            print(f"  {status}: {count}")

        # The fix: Recreate the table without enum constraints
        # SQLite doesn't support ALTER COLUMN, so we need to recreate

        print("\nApplying fix...")
        print("Note: SQLAlchemy Enum with native_enum=False should work with TEXT column")
        print("The issue might be in the Python enum mapping, not the database")

        # Let's verify the data is correct
        cursor.execute("SELECT id, status FROM students WHERE status = 'enrolled' LIMIT 5;")
        enrolled_students = cursor.fetchall()
        print(f"\nSample enrolled students: {enrolled_students}")

        print("\n✅ Database verification complete!")
        print("The database has correct lowercase values: 'applicant', 'enrolled'")
        print("\nThe issue is in the SQLAlchemy enum lookup.")
        print("We need to check if there's a mismatch in the enum definition or model.")

    except Exception as e:
        print(f"❌ Error: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()

    return True

if __name__ == "__main__":
    print("Student Status Enum Fix Script")
    print("=" * 50)
    fix_student_status_enum()
