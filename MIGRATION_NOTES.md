# Fee Structure Migration Notes

## Overview

This document outlines the migration process from the old fee structure design to the new parent-child architecture.

**Migration Date:** TBD
**Database:** SQLite (admission.db)
**Estimated Downtime:** 5-10 minutes

---

## Changes Summary

### Old Design (Before Migration)
- **fee_structures** table with `fee_type_id` and `amount` columns
- One row per fee type per class (e.g., 10 fee types = 10 rows)
- Student assignments: Multiple rows per student (one per fee type)

### New Design (After Migration)
- **fee_structures** table with `structure_name`, `structure_code`, `total_amount` (no `fee_type_id`, no `amount`)
- **fee_structure_components** table (new child table) with `fee_type_id` and `amount`
- One structure row per class/year with multiple component rows
- Student assignments: ONE row per student (references structure)

---

## Database Schema Changes

### 1. Drop Columns from `fee_structures`
- Remove: `fee_type_id` (moved to components table)
- Remove: `amount` (moved to components table)

### 2. Add Columns to `fee_structures`
- Add: `structure_name` VARCHAR(200) NOT NULL
- Add: `structure_code` VARCHAR(50) UNIQUE NOT NULL
- Add: `structure_description` TEXT
- Add: `total_amount` NUMERIC(10,2) NOT NULL DEFAULT 0.00

### 3. Create New Table `fee_structure_components`
```sql
CREATE TABLE fee_structure_components (
    id INTEGER PRIMARY KEY,
    fee_structure_id INTEGER NOT NULL,
    fee_type_id INTEGER NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    is_mandatory BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fee_structure_id) REFERENCES fee_structures(id) ON DELETE CASCADE,
    FOREIGN KEY (fee_type_id) REFERENCES fee_types(id) ON DELETE CASCADE
);

CREATE INDEX idx_fee_structure_components_structure_id ON fee_structure_components(fee_structure_id);
CREATE INDEX idx_fee_structure_components_fee_type_id ON fee_structure_components(fee_type_id);
```

---

## Migration SQL Script

### Step 1: Backup Database

```bash
# CRITICAL: Always backup before migration
cp admission.db admission.db.backup_$(date +%Y%m%d_%H%M%S)
```

### Step 2: Create New Components Table

```sql
-- Create fee_structure_components table
CREATE TABLE fee_structure_components (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fee_structure_id INTEGER NOT NULL,
    fee_type_id INTEGER NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    is_mandatory BOOLEAN DEFAULT 1,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fee_structure_id) REFERENCES fee_structures_new(id) ON DELETE CASCADE,
    FOREIGN KEY (fee_type_id) REFERENCES fee_types(id) ON DELETE CASCADE
);

CREATE INDEX idx_fee_structure_components_structure_id
    ON fee_structure_components(fee_structure_id);
CREATE INDEX idx_fee_structure_components_fee_type_id
    ON fee_structure_components(fee_type_id);
```

### Step 3: Rename Old Table and Create New Structure

```sql
-- Rename old table
ALTER TABLE fee_structures RENAME TO fee_structures_old;

-- Create new fee_structures table
CREATE TABLE fee_structures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    structure_name VARCHAR(200) NOT NULL,
    structure_code VARCHAR(50) UNIQUE NOT NULL,
    structure_description TEXT,
    academic_year_id INTEGER NOT NULL,
    class_id INTEGER NOT NULL,
    total_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    installments INTEGER DEFAULT 1,
    due_date DATE,
    late_fee_applicable BOOLEAN DEFAULT 1,
    late_fee_amount NUMERIC(10,2) DEFAULT 0.00,
    late_fee_percentage NUMERIC(5,2) DEFAULT 2.00,
    grace_period_days INTEGER DEFAULT 7,
    sibling_discount_applicable BOOLEAN DEFAULT 1,
    early_payment_discount_applicable BOOLEAN DEFAULT 0,
    early_payment_discount_percentage NUMERIC(5,2) DEFAULT 0.00,
    early_payment_days INTEGER DEFAULT 15,
    is_active BOOLEAN DEFAULT 1,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);

CREATE INDEX idx_fee_structures_structure_name ON fee_structures(structure_name);
CREATE INDEX idx_fee_structures_structure_code ON fee_structures(structure_code);
CREATE INDEX idx_fee_structures_academic_year_id ON fee_structures(academic_year_id);
CREATE INDEX idx_fee_structures_class_id ON fee_structures(class_id);
CREATE INDEX idx_fee_structures_is_active ON fee_structures(is_active);
```

### Step 4: Migrate Data

```sql
-- Step 4a: Group old fee_structures by (academic_year_id, class_id)
-- Create one new FeeStructure per group

INSERT INTO fee_structures (
    structure_name,
    structure_code,
    academic_year_id,
    class_id,
    total_amount,
    installments,
    due_date,
    late_fee_applicable,
    late_fee_amount,
    late_fee_percentage,
    grace_period_days,
    sibling_discount_applicable,
    early_payment_discount_applicable,
    early_payment_discount_percentage,
    early_payment_days,
    is_active,
    remarks,
    created_at,
    updated_at
)
SELECT DISTINCT
    -- Generate structure name from class and academic year
    c.class_name || ' ' || ay.year_name AS structure_name,

    -- Generate unique structure code
    'CLS' || fs_old.class_id || '-' || fs_old.academic_year_id AS structure_code,

    -- Core references
    fs_old.academic_year_id,
    fs_old.class_id,

    -- Calculate total (will be recalculated from components)
    0.00 AS total_amount,

    -- Copy other fields from first row in group
    MAX(fs_old.installments) AS installments,
    MAX(fs_old.due_date) AS due_date,
    MAX(fs_old.late_fee_applicable) AS late_fee_applicable,
    MAX(fs_old.late_fee_amount) AS late_fee_amount,
    MAX(fs_old.late_fee_percentage) AS late_fee_percentage,
    MAX(fs_old.grace_period_days) AS grace_period_days,
    MAX(fs_old.sibling_discount_applicable) AS sibling_discount_applicable,
    MAX(fs_old.early_payment_discount_applicable) AS early_payment_discount_applicable,
    MAX(fs_old.early_payment_discount_percentage) AS early_payment_discount_percentage,
    MAX(fs_old.early_payment_days) AS early_payment_days,
    MAX(fs_old.is_active) AS is_active,
    MAX(fs_old.remarks) AS remarks,
    MIN(fs_old.created_at) AS created_at,
    MAX(fs_old.updated_at) AS updated_at
FROM fee_structures_old fs_old
LEFT JOIN classes c ON fs_old.class_id = c.id
LEFT JOIN academic_years ay ON fs_old.academic_year_id = ay.id
GROUP BY fs_old.academic_year_id, fs_old.class_id;

-- Step 4b: Create components from old fee_structures rows
INSERT INTO fee_structure_components (
    fee_structure_id,
    fee_type_id,
    amount,
    is_mandatory,
    display_order,
    created_at
)
SELECT
    fs_new.id AS fee_structure_id,
    fs_old.fee_type_id,
    fs_old.amount,
    1 AS is_mandatory,  -- All old fees considered mandatory
    ROW_NUMBER() OVER (
        PARTITION BY fs_old.academic_year_id, fs_old.class_id
        ORDER BY fs_old.fee_type_id
    ) - 1 AS display_order,
    fs_old.created_at
FROM fee_structures_old fs_old
INNER JOIN fee_structures fs_new
    ON fs_old.academic_year_id = fs_new.academic_year_id
    AND fs_old.class_id = fs_new.class_id;

-- Step 4c: Update total_amount for each structure
UPDATE fee_structures
SET total_amount = (
    SELECT COALESCE(SUM(amount), 0.00)
    FROM fee_structure_components
    WHERE fee_structure_id = fee_structures.id
);
```

### Step 5: Update Student Fee Assignments

```sql
-- Create temporary mapping table (old_structure_id -> new_structure_id)
CREATE TEMPORARY TABLE structure_mapping AS
SELECT
    fs_old.id AS old_id,
    fs_new.id AS new_id
FROM fee_structures_old fs_old
INNER JOIN fee_structures fs_new
    ON fs_old.academic_year_id = fs_new.academic_year_id
    AND fs_old.class_id = fs_new.class_id;

-- Rename old assignments table
ALTER TABLE student_fee_assignments RENAME TO student_fee_assignments_old;

-- Create new assignments table (if schema changed)
CREATE TABLE student_fee_assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    fee_structure_id INTEGER NOT NULL,
    custom_amount NUMERIC(10,2),
    discount_percentage NUMERIC(5,2) DEFAULT 0.00,
    discount_amount NUMERIC(10,2) DEFAULT 0.00,
    discount_reason VARCHAR(200),
    custom_due_date DATE,
    is_waived BOOLEAN DEFAULT 0,
    waiver_percentage NUMERIC(5,2) DEFAULT 0.00,
    waiver_reason TEXT,
    waived_by INTEGER,
    waived_at TIMESTAMP,
    is_active BOOLEAN DEFAULT 1,
    assigned_by INTEGER NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    remarks TEXT,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (fee_structure_id) REFERENCES fee_structures(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id),
    FOREIGN KEY (waived_by) REFERENCES users(id)
);

CREATE INDEX idx_student_fee_assignments_student_id ON student_fee_assignments(student_id);
CREATE INDEX idx_student_fee_assignments_fee_structure_id ON student_fee_assignments(fee_structure_id);
CREATE INDEX idx_student_fee_assignments_is_active ON student_fee_assignments(is_active);

-- Migrate assignments: Keep only ONE row per student
-- Choose the first assignment for each student's class/year combination
INSERT INTO student_fee_assignments (
    student_id,
    fee_structure_id,
    custom_amount,
    discount_percentage,
    discount_amount,
    discount_reason,
    custom_due_date,
    is_waived,
    waiver_percentage,
    waiver_reason,
    waived_by,
    waived_at,
    is_active,
    assigned_by,
    assigned_at,
    remarks
)
SELECT DISTINCT
    sfa_old.student_id,
    sm.new_id AS fee_structure_id,
    NULL AS custom_amount,  -- Reset custom amounts
    sfa_old.discount_percentage,
    sfa_old.discount_amount,
    sfa_old.discount_reason,
    sfa_old.custom_due_date,
    sfa_old.is_waived,
    sfa_old.waiver_percentage,
    sfa_old.waiver_reason,
    sfa_old.waived_by,
    sfa_old.waived_at,
    sfa_old.is_active,
    sfa_old.assigned_by,
    MIN(sfa_old.assigned_at) AS assigned_at,
    'Migrated from old structure' AS remarks
FROM student_fee_assignments_old sfa_old
INNER JOIN structure_mapping sm ON sfa_old.fee_structure_id = sm.old_id
GROUP BY sfa_old.student_id, sm.new_id;

-- Drop temporary mapping
DROP TABLE structure_mapping;
```

### Step 6: Verification Queries

```sql
-- Verify new structures count
SELECT 'New Structures:', COUNT(*) FROM fee_structures;
SELECT 'Old Structures:', COUNT(*) FROM fee_structures_old;

-- Verify components
SELECT 'Total Components:', COUNT(*) FROM fee_structure_components;
SELECT 'Components per Structure:',
    structure_name, COUNT(fsc.id) AS component_count
FROM fee_structures fs
LEFT JOIN fee_structure_components fsc ON fs.id = fsc.fee_structure_id
GROUP BY fs.id;

-- Verify total amounts
SELECT
    fs.structure_name,
    fs.total_amount AS calculated_total,
    SUM(fsc.amount) AS component_sum,
    CASE
        WHEN fs.total_amount = SUM(fsc.amount) THEN 'OK'
        ELSE 'MISMATCH'
    END AS status
FROM fee_structures fs
LEFT JOIN fee_structure_components fsc ON fs.id = fsc.fee_structure_id
GROUP BY fs.id;

-- Verify student assignments
SELECT 'New Assignments:', COUNT(*) FROM student_fee_assignments;
SELECT 'Old Assignments:', COUNT(*) FROM student_fee_assignments_old;

-- Verify assignment reduction (should be ~90% fewer)
SELECT
    (SELECT COUNT(*) FROM student_fee_assignments_old) AS old_count,
    (SELECT COUNT(*) FROM student_fee_assignments) AS new_count,
    ROUND(
        (1.0 - (SELECT COUNT(*) FROM student_fee_assignments) * 1.0 /
         (SELECT COUNT(*) FROM student_fee_assignments_old)) * 100, 2
    ) AS reduction_percentage;
```

---

## Rollback Plan

If migration fails or issues are discovered:

### Rollback Step 1: Restore from Backup

```bash
# Stop the application
# Restore backup
cp admission.db.backup_YYYYMMDD_HHMMSS admission.db
# Restart application
```

### Rollback Step 2: Manual Rollback (if backup unavailable)

```sql
-- Drop new tables
DROP TABLE IF EXISTS fee_structure_components;
DROP TABLE IF EXISTS fee_structures;
DROP TABLE IF EXISTS student_fee_assignments;

-- Restore old tables
ALTER TABLE fee_structures_old RENAME TO fee_structures;
ALTER TABLE student_fee_assignments_old RENAME TO student_fee_assignments;
```

---

## Post-Migration Tasks

### 1. Update API Clients
- Update frontend to use new `/api/v1/fees/structures` endpoint
- Old endpoint available at `/api/v1/fees/structures/legacy` during transition

### 2. Test All Workflows
- [ ] Create new fee structure with components
- [ ] Assign fee structure to students (verify only ONE assignment per student)
- [ ] Create fee session (update to use new structure)
- [ ] Generate invoices
- [ ] Process payments
- [ ] Verify total amounts calculation

### 3. Monitor Performance
- Check database query performance
- Verify 90% reduction in student_fee_assignments rows
- Monitor API response times (should be faster)

### 4. Clean Up Old Tables (After 1 Week)

```sql
-- Once migration is verified successful, remove old tables
DROP TABLE IF EXISTS fee_structures_old;
DROP TABLE IF EXISTS student_fee_assignments_old;
```

---

## Migration Checklist

- [ ] Backup database (CRITICAL!)
- [ ] Stop application
- [ ] Run migration SQL script
- [ ] Verify data integrity (run verification queries)
- [ ] Update application code (deploy new version)
- [ ] Start application
- [ ] Test core workflows
- [ ] Monitor for errors
- [ ] Update API documentation
- [ ] Notify users of changes
- [ ] Clean up old tables (after 1 week)

---

## Benefits After Migration

1. **90% Fewer Database Inserts**: 300 inserts → 30 inserts (for 30 students with 10 fee types)
2. **Simplified Assignment Logic**: One assignment per student instead of multiple
3. **Easier Maintenance**: Single fee structure entity instead of scattered rows
4. **Better Performance**: Fewer joins, faster queries
5. **Proper Normalization**: Follows database design best practices
6. **Scalability**: Better for 1000+ students

---

## Support & Troubleshooting

### Common Issues

**Issue 1: Duplicate structure codes**
```sql
-- Find duplicates
SELECT structure_code, COUNT(*)
FROM fee_structures
GROUP BY structure_code
HAVING COUNT(*) > 1;

-- Fix: Append academic_year_id to make unique
UPDATE fee_structures
SET structure_code = structure_code || '-AY' || academic_year_id
WHERE id IN (
    SELECT MIN(id)
    FROM fee_structures
    GROUP BY structure_code
    HAVING COUNT(*) > 1
);
```

**Issue 2: Total amount mismatch**
```sql
-- Recalculate all totals
UPDATE fee_structures
SET total_amount = (
    SELECT COALESCE(SUM(amount), 0.00)
    FROM fee_structure_components
    WHERE fee_structure_id = fee_structures.id
);
```

**Issue 3: Orphaned components**
```sql
-- Find components without structure
SELECT * FROM fee_structure_components
WHERE fee_structure_id NOT IN (SELECT id FROM fee_structures);

-- Delete orphaned components
DELETE FROM fee_structure_components
WHERE fee_structure_id NOT IN (SELECT id FROM fee_structures);
```

---

## Contact

For migration support, contact:
- **Tech Lead**: [Your Name]
- **Database Admin**: [DBA Name]
- **Emergency**: [Contact Info]

---

*Document Version: 1.0*
*Last Updated: October 29, 2025*
*Author: Claude AI*
