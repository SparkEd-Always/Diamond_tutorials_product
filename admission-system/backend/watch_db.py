"""
Live Database Monitor for Admission System
Watch database changes in real-time
"""
import sqlite3
import time
import os
from datetime import datetime

def clear_screen():
    os.system('cls' if os.name == 'nt' else 'clear')

def format_timestamp(ts):
    if ts:
        try:
            dt = datetime.fromisoformat(ts.replace('Z', '+00:00'))
            return dt.strftime('%Y-%m-%d %H:%M:%S')
        except:
            return ts
    return 'N/A'

def watch_database(interval=2):
    """Watch database changes every N seconds"""
    print("=" * 80)
    print(" ADMISSION SYSTEM - LIVE DATABASE MONITOR")
    print("=" * 80)
    print(f"Refresh interval: {interval} seconds")
    print("Press Ctrl+C to stop\n")

    try:
        while True:
            conn = sqlite3.connect('admission.db')
            cursor = conn.cursor()

            clear_screen()
            print("=" * 80)
            print(f" LIVE DATABASE MONITOR - Last Updated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            print("=" * 80)

            # Applications
            print("\n[1] APPLICATIONS")
            print("-" * 80)
            cursor.execute('''
                SELECT id, application_number, application_status,
                       submission_date, updated_at
                FROM admission_applications
                ORDER BY updated_at DESC
                LIMIT 10
            ''')
            print(f"{'ID':<5} {'Number':<12} {'Status':<20} {'Submitted':<20} {'Updated':<20}")
            print("-" * 80)
            for row in cursor.fetchall():
                print(f"{row[0]:<5} {row[1]:<12} {row[2]:<20} {format_timestamp(row[3]):<20} {format_timestamp(row[4]):<20}")

            # Status History
            print("\n[2] STATUS HISTORY (Recent Changes)")
            print("-" * 80)
            cursor.execute('''
                SELECT h.id, h.application_id, a.application_number,
                       h.previous_status, h.new_status, h.change_date, h.change_reason
                FROM application_status_history h
                JOIN admission_applications a ON h.application_id = a.id
                ORDER BY h.change_date DESC
                LIMIT 10
            ''')
            print(f"{'ID':<5} {'App#':<12} {'Previous':<15} {'New':<15} {'Changed':<20} {'Reason':<20}")
            print("-" * 80)
            for row in cursor.fetchall():
                reason = (row[6] or 'N/A')[:20]
                print(f"{row[0]:<5} {row[2]:<12} {row[3]:<15} {row[4]:<15} {format_timestamp(row[5]):<20} {reason:<20}")

            # Users
            print("\n[3] USERS (Recent)")
            print("-" * 80)
            cursor.execute('''
                SELECT id, email, role, created_at
                FROM users
                ORDER BY created_at DESC
                LIMIT 5
            ''')
            print(f"{'ID':<5} {'Email':<30} {'Role':<15} {'Created':<20}")
            print("-" * 80)
            for row in cursor.fetchall():
                print(f"{row[0]:<5} {row[1]:<30} {row[2]:<15} {format_timestamp(row[3]):<20}")

            # Documents
            print("\n[4] DOCUMENTS (Recent Uploads)")
            print("-" * 80)
            cursor.execute('''
                SELECT id, application_id, file_name, verification_status, uploaded_at
                FROM application_documents
                ORDER BY uploaded_at DESC
                LIMIT 5
            ''')
            print(f"{'ID':<5} {'App ID':<8} {'Filename':<30} {'Status':<15} {'Uploaded':<20}")
            print("-" * 80)
            rows = cursor.fetchall()
            if rows:
                for row in rows:
                    filename = (row[2] or 'N/A')[:30]
                    print(f"{row[0]:<5} {row[1]:<8} {filename:<30} {row[3]:<15} {format_timestamp(row[4]):<20}")
            else:
                print("No documents uploaded yet")

            # Summary
            print("\n[5] DATABASE SUMMARY")
            print("-" * 80)
            cursor.execute('SELECT COUNT(*) FROM users')
            user_count = cursor.fetchone()[0]
            cursor.execute('SELECT COUNT(*) FROM admission_applications')
            app_count = cursor.fetchone()[0]
            cursor.execute('SELECT COUNT(*) FROM application_documents')
            doc_count = cursor.fetchone()[0]
            cursor.execute('SELECT COUNT(*) FROM application_status_history')
            history_count = cursor.fetchone()[0]

            print(f"Total Users: {user_count}")
            print(f"Total Applications: {app_count}")
            print(f"Total Documents: {doc_count}")
            print(f"Total Status Changes: {history_count}")

            print("\n" + "=" * 80)
            print(f"Next refresh in {interval} seconds... (Press Ctrl+C to stop)")

            conn.close()
            time.sleep(interval)

    except KeyboardInterrupt:
        print("\n\nMonitoring stopped by user.")
    except Exception as e:
        print(f"\nError: {e}")

if __name__ == "__main__":
    import sys
    interval = 2

    if len(sys.argv) > 1:
        try:
            interval = int(sys.argv[1])
        except ValueError:
            print("Usage: python watch_db.py [refresh_interval_seconds]")
            print("Example: python watch_db.py 5")
            sys.exit(1)

    watch_database(interval)
