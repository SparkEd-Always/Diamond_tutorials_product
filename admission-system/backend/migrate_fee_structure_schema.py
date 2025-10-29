"""
Database Migration Script: Fee Structure Refactoring
Adds new columns to fee_structures table and creates fee_structure_components table
"""
import sqlite3
from pathlib import Path

def migrate_database():
    """Run database migration to add new fee structure schema"""

    # Connect to database
    db_path = Path(__file__).parent / "admission.db"
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    print(">> Starting fee structure schema migration...")

    try:
        # Step 1: Add new columns to fee_structures table
        print("\n>> Step 1: Adding new columns to fee_structures table...")

        new_columns = [
            ("structure_name", "VARCHAR(200)"),
            ("structure_code", "VARCHAR(50)"),
            ("structure_description", "TEXT"),
            ("total_amount", "NUMERIC(10, 2) DEFAULT 0.00"),
        ]

        for column_name, column_type in new_columns:
            try:
                cursor.execute(f"ALTER TABLE fee_structures ADD COLUMN {column_name} {column_type}")
                print(f"   [OK] Added column: {column_name}")
            except sqlite3.OperationalError as e:
                if "duplicate column name" in str(e):
                    print(f"   [SKIP] Column {column_name} already exists, skipping")
                else:
                    raise

        conn.commit()

        # Step 2: Create fee_structure_components table
        print("\n>> Step 2: Creating fee_structure_components table...")

        create_table_sql = """
        CREATE TABLE IF NOT EXISTS fee_structure_components (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fee_structure_id INTEGER NOT NULL,
            fee_type_id INTEGER NOT NULL,
            amount NUMERIC(10, 2) NOT NULL,
            is_mandatory BOOLEAN DEFAULT TRUE,
            display_order INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (fee_structure_id) REFERENCES fee_structures(id) ON DELETE CASCADE,
            FOREIGN KEY (fee_type_id) REFERENCES fee_types(id) ON DELETE CASCADE
        )
        """

        cursor.execute(create_table_sql)
        print("   [OK] Table fee_structure_components created")

        # Create indexes
        print("\n>> Step 3: Creating indexes...")

        indexes = [
            "CREATE INDEX IF NOT EXISTS idx_components_structure ON fee_structure_components(fee_structure_id)",
            "CREATE INDEX IF NOT EXISTS idx_components_fee_type ON fee_structure_components(fee_type_id)",
            "CREATE INDEX IF NOT EXISTS idx_fee_structures_code ON fee_structures(structure_code)",
        ]

        for index_sql in indexes:
            cursor.execute(index_sql)
            print(f"   [OK] Index created")

        conn.commit()

        # Step 4: Migrate existing data
        print("\n>> Step 4: Migrating existing fee structure data...")

        # Check if there's existing data to migrate
        cursor.execute("SELECT COUNT(*) FROM fee_structures WHERE structure_name IS NULL")
        count_to_migrate = cursor.fetchone()[0]

        if count_to_migrate > 0:
            print(f"   Found {count_to_migrate} fee structures to migrate...")

            # For each old fee structure, generate structure_name and structure_code
            cursor.execute("""
                SELECT fs.id, fs.fee_type_id, fs.amount, fs.class_id, fs.academic_year_id,
                       ft.type_name, c.class_name, ay.year_name
                FROM fee_structures fs
                JOIN fee_types ft ON fs.fee_type_id = ft.id
                JOIN classes c ON fs.class_id = c.id
                JOIN academic_years ay ON fs.academic_year_id = ay.id
                WHERE fs.structure_name IS NULL
            """)

            old_structures = cursor.fetchall()

            for (fs_id, fee_type_id, amount, class_id, academic_year_id,
                 type_name, class_name, year_name) in old_structures:

                # Generate structure_name and structure_code
                structure_name = f"{class_name} - {type_name} ({year_name})"
                structure_code = f"{class_name.upper().replace(' ', '')}-{type_name.upper().replace(' ', '')}-{year_name.replace('-', '')}"

                # Update the fee structure with new columns
                cursor.execute("""
                    UPDATE fee_structures
                    SET structure_name = ?,
                        structure_code = ?,
                        structure_description = ?,
                        total_amount = ?
                    WHERE id = ?
                """, (structure_name, structure_code, f"Legacy structure: {type_name}", amount, fs_id))

                # Create a component for this fee structure
                cursor.execute("""
                    INSERT INTO fee_structure_components
                    (fee_structure_id, fee_type_id, amount, is_mandatory, display_order)
                    VALUES (?, ?, ?, TRUE, 0)
                """, (fs_id, fee_type_id, amount))

            conn.commit()
            print(f"   [OK] Migrated {count_to_migrate} fee structures to new schema")
        else:
            print("   [INFO] No existing data to migrate (all structures already have new schema)")

        # Step 5: Verify migration
        print("\n>> Step 5: Verifying migration...")

        cursor.execute("SELECT COUNT(*) FROM fee_structures WHERE structure_name IS NOT NULL")
        migrated_count = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM fee_structure_components")
        components_count = cursor.fetchone()[0]

        print(f"   [OK] Fee structures with new schema: {migrated_count}")
        print(f"   [OK] Fee structure components: {components_count}")

        print("\n[SUCCESS] Migration completed successfully!")

        return True

    except Exception as e:
        print(f"\n[ERROR] Migration failed: {str(e)}")
        conn.rollback()
        return False

    finally:
        conn.close()

if __name__ == "__main__":
    success = migrate_database()
    if success:
        print("\n[SUCCESS] Database is now ready for the new fee structure system!")
        print("   You can now restart the backend server.")
    else:
        print("\n[WARNING] Migration failed. Please check the error messages above.")
