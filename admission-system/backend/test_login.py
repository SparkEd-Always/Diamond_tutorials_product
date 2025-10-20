"""
Test script to verify admin login credentials
"""
import bcrypt
from app.core.security import verify_password

# Password hash from database
stored_hash = "$2b$12$cMPan60UANYWRVoilK2douQwlJHdboX.oDT7bxpiVoLrZYHw5x4GS"

# Test password
test_password = "admin123"

# Verify using the verify_password function
result = verify_password(test_password, stored_hash)
print(f"Password verification result: {result}")

# Also test directly with bcrypt
direct_result = bcrypt.checkpw(test_password.encode('utf-8'), stored_hash.encode('utf-8'))
print(f"Direct bcrypt verification: {direct_result}")
