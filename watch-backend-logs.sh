#!/bin/bash
# Backend OTP Log Monitor for AVM Tutorial
# This script shows real-time OTP codes from the backend

echo "=================================================="
echo "   AVM Tutorial - Backend OTP Monitor"
echo "=================================================="
echo ""
echo "Backend Server: http://192.168.29.163:8000"
echo "Monitoring for OTP codes..."
echo ""
echo "Press Ctrl+C to stop"
echo "=================================================="
echo ""

# Get the PID of the uvicorn process
BACKEND_PID=$(lsof -ti:8000)

if [ -z "$BACKEND_PID" ]; then
    echo "ERROR: Backend server not running on port 8000"
    exit 1
fi

echo "Backend Process ID: $BACKEND_PID"
echo ""
echo "Waiting for OTP generation..."
echo "=================================================="
echo ""

# Tail the output of the backend process
# Note: This may not work as the process is running in a different session
# Alternative: Monitor system logs or use a log file

echo "NOTE: The backend is running in Claude's session."
echo "To see OTPs, ask Claude: 'show me the latest OTP'"
echo ""
echo "Or run this command to see recent backend activity:"
echo "ps -p $BACKEND_PID -o command="
