# Database Schema
## Fee Management System

**Last Updated**: October 13, 2025
**Database**: SQLite (dev) / PostgreSQL (prod)

---

## Overview

The fee management system database consists of **12 core tables** (plus existing tables from admission system).

### Tables Summary

| Table Name | Purpose | Related To |
|------------|---------|------------|
| `fee_types` | Fee categories (Tuition, Exam, etc.) | - |
| `fee_structures` | Class-wise fee configuration | `fee_types` |
| `student_fee_assignments` | Fees assigned to students | `students`, `fee_structures` |
| `invoices` | Fee invoices | `students` |
| `invoice_items` | Invoice line items | `invoices`, `fee_types` |
| `payments` | Payment transactions | `invoices` |
| `payment_receipts` | Payment receipts | `payments` |
| `student_fee_ledger` | Student fee ledger (balance) | `students` |
| `payment_reminders` | Reminder history | `students`, `invoices` |
| `reconciliation_logs` | Reconciliation tracking | - |
| `discount_policies` | Discount rules | - |
| `waiver_requests` | Waiver approval workflow | `students` |

---

## Table Definitions

### 1. fee_types

**Purpose**: Define fee categories (Tuition, Exam, Library, etc.)

```sql
CREATE TABLE fee_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_mandatory BOOLEAN DEFAULT TRUE,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_frequency VARCHAR(20),  -- 'monthly', 'quarterly', 'annual'
    gst_applicable BOOLEAN DEFAULT TRUE,
    gst_percentage DECIMAL(5,2) DEFAULT 18.00,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Example Data**:
| id | name | is_mandatory | recurring_frequency | gst_applicable |
|----|------|--------------|---------------------|----------------|
| 1 | Tuition | TRUE | annual | TRUE |
| 2 | Exam | TRUE | annual | TRUE |
| 3 | Library | TRUE | annual | TRUE |
| 4 | Sports | TRUE | annual | TRUE |
| 5 | Transport | FALSE | annual | TRUE |

---

### 2. fee_structures

**Purpose**: Define class-wise fee amounts

```sql
CREATE TABLE fee_structures (
    id SERIAL PRIMARY KEY,
    academic_year VARCHAR(10) NOT NULL,  -- '2025-26'
    class_id INTEGER NOT NULL,
    section VARCHAR(10),
    fee_type_id INTEGER REFERENCES fee_types(id),
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE,
    installment_number INTEGER,  -- 1, 2, 3 (Term 1, 2, 3)
    late_fee_percentage DECIMAL(5,2) DEFAULT 2.00,
    late_fee_grace_days INTEGER DEFAULT 7,
    status VARCHAR(20) DEFAULT 'active',
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(academic_year, class_id, fee_type_id, installment_number)
);
```

**Example**: Class 1, Academic Year 2025-26
| id | academic_year | class_id | fee_type_id | amount | due_date | installment |
|----|---------------|----------|-------------|--------|----------|-------------|
| 1 | 2025-26 | 1 | 1 (Tuition) | 20000.00 | 2025-07-15 | 1 |
| 2 | 2025-26 | 1 | 2 (Exam) | 2000.00 | 2025-07-15 | 1 |
| 3 | 2025-26 | 1 | 3 (Library) | 1000.00 | 2025-07-15 | 1 |

---

### 3. student_fee_assignments

**Purpose**: Assign fees to individual students

```sql
CREATE TABLE student_fee_assignments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    fee_structure_id INTEGER REFERENCES fee_structures(id),
    custom_amount DECIMAL(10,2),  -- Override amount if different
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    discount_reason VARCHAR(255),
    assigned_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'active',
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

For complete schema details, refer to the [Journey 2 PRD](../../docs/product/journey-2-fee-collection-prd.md#database-schema).

---

## Relationships

```
students → student_fee_assignments → fee_structures → fee_types
students → invoices → invoice_items
invoices → payments → payment_receipts
students → student_fee_ledger
students → payment_reminders
students → waiver_requests
```

---

## Indexes

**Performance Optimization**:
- `students.id` (primary key, indexed)
- `invoices.student_id` (indexed)
- `invoices.invoice_number` (unique, indexed)
- `payments.transaction_id` (unique, indexed)
- `payments.invoice_id` (indexed)
- `payment_receipts.receipt_number` (unique, indexed)
- `student_fee_ledger.student_id` (unique, indexed)

---

**See Full Schema**: [Journey 2 PRD - Database Schema Section](../../docs/product/journey-2-fee-collection-prd.md#62-database-schema-extends-admission-system)
