# API Documentation
## Fee Management System

**Base URL**: `http://localhost:8000/api/v1`
**Version**: 1.0
**Last Updated**: October 13, 2025

---

## Authentication

All protected endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

### Login

**POST** `/auth/login`

**Request Body**:
```json
{
  "email": "admin@school.com",
  "password": "admin123"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "user": {
      "id": 1,
      "email": "admin@school.com",
      "role": "admin"
    }
  }
}
```

---

## Fee Management Endpoints

### Create Fee Type

**POST** `/fees/types`

**Request Body**:
```json
{
  "name": "Tuition",
  "description": "Annual tuition fee",
  "is_mandatory": true,
  "is_recurring": true,
  "recurring_frequency": "annual",
  "gst_applicable": true,
  "gst_percentage": 18.00
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Tuition",
    "status": "active",
    "created_at": "2025-10-13T10:00:00"
  }
}
```

---

### List Fee Types

**GET** `/fees/types`

**Query Parameters**:
- `status` (optional): Filter by status (active/inactive)
- `limit` (optional): Number of results (default: 20)
- `offset` (optional): Offset for pagination (default: 0)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Tuition",
      "is_mandatory": true,
      "gst_percentage": 18.00,
      "status": "active"
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}
```

---

## Invoice Endpoints

### Generate Invoice

**POST** `/invoices/generate`

**Request Body**:
```json
{
  "student_id": 123,
  "academic_year": "2025-26",
  "term": 1
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "invoice_id": 456,
    "invoice_number": "FC/2025-26/000456",
    "student_id": 123,
    "total_amount": 24833.00,
    "due_date": "2025-07-15",
    "status": "pending"
  }
}
```

---

## Payment Endpoints

### Initiate Payment

**POST** `/payments/initiate`

**Request Body**:
```json
{
  "invoice_id": 456,
  "payment_method": "UPI"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "payment_id": "pay_abc123",
    "order_id": "order_xyz789",
    "amount": 24833.00,
    "currency": "INR",
    "razorpay_key_id": "rzp_test_xxxxx",
    "callback_url": "/api/v1/payments/verify"
  }
}
```

---

## Complete API Reference

See the interactive API documentation:

**Swagger UI**: http://localhost:8000/docs
**ReDoc**: http://localhost:8000/redoc

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "Additional error context"
    }
  }
}
```

### Common Error Codes

- `400`: Bad Request (invalid input)
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found (resource doesn't exist)
- `500`: Internal Server Error

---

**Full API Documentation**: Visit http://localhost:8000/docs when the backend is running
