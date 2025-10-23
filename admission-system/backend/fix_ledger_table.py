"""
Fix student_ledger_transactions table to use INTEGER PRIMARY KEY for autoincrement
"""
import sqlite3

conn = sqlite3.connect('admission.db')
cursor = conn.cursor()

print("Dropping old table...")
cursor.execute("DROP TABLE IF EXISTS student_ledger_transactions")

print("Creating new table with INTEGER PRIMARY KEY...")
cursor.execute("""
CREATE TABLE student_ledger_transactions (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	transaction_number VARCHAR(30) NOT NULL UNIQUE,
	transaction_date DATETIME NOT NULL,
	student_id INTEGER NOT NULL,
	academic_year_id INTEGER NOT NULL,
	entry_type VARCHAR(30) NOT NULL,
	debit_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
	credit_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
	balance NUMERIC(12, 2) NOT NULL,
	reference_type VARCHAR(30),
	reference_id INTEGER,
	fee_session_id INTEGER,
	adhoc_fee_id INTEGER,
	payment_id INTEGER,
	invoice_id INTEGER,
	description TEXT NOT NULL,
	remarks TEXT,
	transaction_metadata JSON,
	payment_method VARCHAR(50),
	payment_reference VARCHAR(100),
	reverses_transaction_id INTEGER,
	created_by INTEGER,
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
	is_reversed BOOLEAN NOT NULL DEFAULT 0,
	reversed_by INTEGER,
	reversed_at DATETIME,
	reversal_transaction_id INTEGER,
	is_locked BOOLEAN NOT NULL DEFAULT 1,
	FOREIGN KEY(student_id) REFERENCES students (id) ON DELETE CASCADE,
	FOREIGN KEY(academic_year_id) REFERENCES academic_years (id) ON DELETE CASCADE,
	FOREIGN KEY(fee_session_id) REFERENCES fee_sessions (id) ON DELETE SET NULL,
	FOREIGN KEY(adhoc_fee_id) REFERENCES adhoc_fee_assignments (id) ON DELETE SET NULL,
	FOREIGN KEY(payment_id) REFERENCES payments (id) ON DELETE SET NULL,
	FOREIGN KEY(invoice_id) REFERENCES invoices (id) ON DELETE SET NULL,
	FOREIGN KEY(reverses_transaction_id) REFERENCES student_ledger_transactions (id),
	FOREIGN KEY(created_by) REFERENCES users (id),
	FOREIGN KEY(reversed_by) REFERENCES users (id),
	FOREIGN KEY(reversal_transaction_id) REFERENCES student_ledger_transactions (id)
)
""")

print("Creating indexes...")
indexes = [
    "CREATE INDEX ix_student_ledger_transactions_id ON student_ledger_transactions (id)",
    "CREATE INDEX ix_student_ledger_transactions_transaction_date ON student_ledger_transactions (transaction_date)",
    "CREATE INDEX ix_student_ledger_transactions_student_id ON student_ledger_transactions (student_id)",
    "CREATE INDEX ix_student_ledger_transactions_academic_year_id ON student_ledger_transactions (academic_year_id)",
    "CREATE INDEX ix_student_ledger_transactions_entry_type ON student_ledger_transactions (entry_type)",
    "CREATE INDEX ix_student_ledger_transactions_balance ON student_ledger_transactions (balance)",
    "CREATE INDEX ix_student_ledger_transactions_reference_type ON student_ledger_transactions (reference_type)",
    "CREATE INDEX ix_student_ledger_transactions_reference_id ON student_ledger_transactions (reference_id)",
    "CREATE INDEX ix_student_ledger_transactions_fee_session_id ON student_ledger_transactions (fee_session_id)",
    "CREATE INDEX ix_student_ledger_transactions_adhoc_fee_id ON student_ledger_transactions (adhoc_fee_id)",
    "CREATE INDEX ix_student_ledger_transactions_payment_id ON student_ledger_transactions (payment_id)",
    "CREATE INDEX ix_student_ledger_transactions_invoice_id ON student_ledger_transactions (invoice_id)",
    "CREATE INDEX ix_student_ledger_transactions_payment_reference ON student_ledger_transactions (payment_reference)",
    "CREATE INDEX ix_student_ledger_transactions_created_at ON student_ledger_transactions (created_at)",
    "CREATE INDEX ix_student_ledger_transactions_is_reversed ON student_ledger_transactions (is_reversed)",
    "CREATE INDEX idx_student_date ON student_ledger_transactions (student_id, transaction_date)",
    "CREATE INDEX idx_student_year ON student_ledger_transactions (student_id, academic_year_id)",
    "CREATE INDEX idx_type_date ON student_ledger_transactions (entry_type, transaction_date)",
    "CREATE INDEX idx_reference ON student_ledger_transactions (reference_type, reference_id)",
]

for idx_sql in indexes:
    cursor.execute(idx_sql)

conn.commit()
conn.close()

print("✓ Table fixed successfully!")
print("  - Changed id from BIGINT to INTEGER PRIMARY KEY AUTOINCREMENT")
print("  - All indexes recreated")
