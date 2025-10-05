#!/bin/bash
# Get latest OTPs from database

DB_PATH="/Users/koustubskulkarni/AVM/product/AVM-code/backend/avm_tutorial.db"

echo "=================================================="
echo "   AVM Tutorial - Latest OTPs"
echo "=================================================="
echo ""
sqlite3 "$DB_PATH" <<EOF
.mode column
.headers on
SELECT
    phone_number as Phone,
    otp_code as OTP,
    datetime(expires_at, 'localtime') as 'Expires At',
    CASE is_verified
        WHEN 0 THEN '❌ Not Used'
        WHEN 1 THEN '✅ Used'
    END as Status
FROM otps
ORDER BY id DESC
LIMIT 10;
EOF
echo ""
echo "=================================================="
echo "To get fresh OTP, request login in mobile app"
echo "=================================================="
