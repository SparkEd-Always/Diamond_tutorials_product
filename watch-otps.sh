#!/bin/bash
# Watch for OTP codes in backend logs

LOG_FILE="/Users/koustubskulkarni/AVM/product/backend-logs.txt"

echo "=================================================="
echo "   AVM Tutorial - Live OTP Monitor"
echo "=================================================="
echo ""
echo "Watching: $LOG_FILE"
echo "Press Ctrl+C to stop"
echo "=================================================="
echo ""

# Watch the log file and filter for OTP lines
tail -f "$LOG_FILE" | grep --line-buffered "🔐 OTP\|⏰ Valid"
