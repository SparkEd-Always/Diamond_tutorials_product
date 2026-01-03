"""
Migration script to add viewed_by_user_ids column to activity_logs table
"""
import sqlite3

def migrate():
    conn = sqlite3.connect('sparked.db')
    cursor = conn.cursor()
    
    try:
        # Check if column already exists
        cursor.execute("PRAGMA table_info(activity_logs)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'viewed_by_user_ids' not in columns:
            # Add the new column
            cursor.execute("""
                ALTER TABLE activity_logs 
                ADD COLUMN viewed_by_user_ids TEXT DEFAULT '[]' NOT NULL
            """)
            conn.commit()
            print("✅ Successfully added viewed_by_user_ids column to activity_logs table")
        else:
            print("ℹ️ Column viewed_by_user_ids already exists in activity_logs table")
            
    except Exception as e:
        print(f"❌ Error during migration: {str(e)}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
