import sqlite3

conn = sqlite3.connect('school.db')
cursor = conn.cursor()

print("=== Parents with Push Tokens ===")
cursor.execute("SELECT full_name, phone_number, push_token FROM parents WHERE push_token IS NOT NULL")
for row in cursor.fetchall():
    name, phone, token = row
    print(f"Parent: {name}")
    print(f"Phone: {phone}")
    print(f"Token: {token[:30]}..." if token else "No token")
    print()

print("\n=== All Parents ===")
cursor.execute("SELECT full_name, phone_number, push_token FROM parents")
for row in cursor.fetchall():
    name, phone, token = row
    has_token = "✅ HAS TOKEN" if token else "❌ NO TOKEN"
    print(f"{name} ({phone}): {has_token}")

conn.close()
