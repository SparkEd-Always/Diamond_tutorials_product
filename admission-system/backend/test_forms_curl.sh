#!/bin/bash

BASE_URL="http://localhost:8000/api/v1"

echo "================================"
echo "Getting admin token..."
echo "================================"
TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@school.com","password":"admin123"}' \
  | python -c "import sys, json; print(json.load(sys.stdin)['access_token'])")

echo "Token obtained: ${TOKEN:0:50}..."
echo ""

echo "================================"
echo "TEST 1: GET /forms"
echo "================================"
curl -s "$BASE_URL/form-config/forms" \
  -H "Authorization: Bearer $TOKEN" | python -m json.tool
echo ""

echo "================================"
echo "TEST 2: GET /forms/1"
echo "================================"
curl -s "$BASE_URL/form-config/forms/1" \
  -H "Authorization: Bearer $TOKEN" | python -m json.tool | head -30
echo ""

echo "================================"
echo "TEST 3: POST /forms (create new)"
echo "================================"
curl -s -X POST "$BASE_URL/form-config/forms" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"form_name":"Test Form - Class 11-12","form_description":"Science stream admission","is_active":true,"template_id":2}' \
  | python -m json.tool
echo ""

echo "================================"
echo "TEST 4: GET /forms (should show 2 forms now)"
echo "================================"
curl -s "$BASE_URL/form-config/forms" \
  -H "Authorization: Bearer $TOKEN" | python -m json.tool
echo ""

echo "================================"
echo "All tests completed!"
echo "================================"
