# Parent Communication System - Integration Approach
## Journey 24: Unified Parent-Teacher Communication Platform

**Version**: 1.0
**Last Updated**: October 15, 2025
**Status**: Ready for Implementation
**Integration Pattern**: Monolithic Integration with Modular Routes

---

## 📋 Table of Contents
1. [Integration Strategy Overview](#integration-strategy-overview)
2. [Fee Management Integration Analysis](#fee-management-integration-analysis)
3. [Parent Communication Integration Plan](#parent-communication-integration-plan)
4. [Implementation Phases](#implementation-phases)
5. [Technical Architecture](#technical-architecture)
6. [Development Roadmap](#development-roadmap)

---

## 1. Integration Strategy Overview

### ✅ Confirmed Pattern: "Monolithic Integration with Modular Routes"

After analyzing the existing fee management integration, we've confirmed that the parent communication system will follow the **exact same pattern**:

**Key Principle:** Single codebase with modular organization, shared authentication, single database, URL-based feature separation.

### Why This Pattern?
- ✅ **Consistency** - Same pattern as fee management (already proven)
- ✅ **Simplicity** - Single deployment, shared authentication, unified database
- ✅ **Code Reuse** - Shared components, services, utilities
- ✅ **User Experience** - Single login, seamless navigation between features
- ✅ **Development Speed** - No complex microservices orchestration

---

## 2. Fee Management Integration Analysis

### 2.1 Current Architecture (Analyzed from Codebase)

#### **Frontend: Single React Application**
**Location:** `admission-system/frontend/web-app/`

```
admission-system/frontend/web-app/
├── src/
│   ├── App.tsx                    # Single routing file with all features
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── ApplicationFormPage.tsx
│   │   ├── FeeTypesPage.tsx           # Fee module
│   │   ├── FeeStructuresPage.tsx      # Fee module
│   │   └── ParentFeeDashboard.tsx     # Fee module
│   ├── services/
│   │   ├── api.ts                     # Shared Axios instance
│   │   ├── admissionApi.ts            # Admission operations
│   │   └── feeApi.ts                  # Fee operations (uses shared api.ts)
│   ├── types/
│   │   ├── index.ts                   # Shared types
│   │   └── fees.ts                    # Fee-specific types
│   └── contexts/
│       └── AuthContext.tsx            # Shared auth across all features
```

**Key Routes (from App.tsx):**
```typescript
// Admission Routes
<Route path="/applications" element={<ApplicationListRoute />} />
<Route path="/apply" element={<ApplicationFormPage />} />

// Fee Management Routes - Admin
<Route path="/admin/fees/dashboard" element={<AdminFeeDashboard />} />
<Route path="/admin/fees/types" element={<FeeTypesPage />} />
<Route path="/admin/fees/structures" element={<FeeStructuresPage />} />
<Route path="/admin/fees/ledgers" element={<AdminStudentLedgers />} />

// Fee Management Routes - Parent
<Route path="/parent/fees" element={<ParentFeeDashboard />} />
<Route path="/parent/fees/pay" element={<ParentPaymentPage />} />
<Route path="/parent/fees/history" element={<ParentPaymentHistory />} />
```

#### **Backend: Single FastAPI Application**
**Location:** `admission-system/backend/`

```
admission-system/backend/
├── admission.db (643KB)          # Single SQLite database with ALL tables
├── app/
│   ├── main.py                   # Single FastAPI app entry point
│   ├── core/
│   │   ├── config.py
│   │   ├── database.py           # Shared database connection
│   │   └── security.py           # Shared JWT authentication
│   ├── models/
│   │   ├── admission.py          # Admission models
│   │   ├── student.py
│   │   ├── user.py
│   │   └── fee.py                # Fee models (added to same DB)
│   ├── api/v1/
│   │   ├── __init__.py           # Routes aggregation
│   │   ├── auth.py               # Shared auth endpoints
│   │   ├── admissions.py         # /api/v1/admissions/*
│   │   └── fees.py               # /api/v1/fees/* (added)
│   └── schemas/
│       ├── admission.py
│       └── fee.py
```

**API Endpoints Structure:**
```
http://localhost:8000/
├── /api/v1/auth/*              # Shared authentication
├── /api/v1/admissions/*        # Admission operations
├── /api/v1/fees/*              # Fee operations (integrated)
│   ├── /fees/types
│   ├── /fees/structures
│   ├── /fees/assignments
│   └── /fees/ledgers
└── /api/v1/communication/*     # To be added
```

#### **Database: Single SQLite File**
**File:** `admission-system/backend/admission.db` (643KB)

**Tables:**
```sql
-- Admission System Tables (Original)
users
user_profiles
students
parents
admission_applications
application_status_history
classes
academic_years
form_configurations
form_fields_master

-- Fee Management Tables (Added to same DB)
fee_types
fee_structures
student_fee_assignments
student_fee_ledger
invoices
invoice_items
payments
payment_receipts

-- Communication Tables (To be added)
messages
message_deliveries
message_read_receipts
communication_preferences
```

### 2.2 Key Integration Points

#### **Shared Authentication**
- Single JWT token works across all modules
- `AuthContext` manages authentication state
- Role-based access control (Parent/Teacher/Admin/Principal)
- Protected routes with `ProtectedRoute` component

#### **Shared Database Connection**
```python
# app/core/database.py
DATABASE_URL = "sqlite:///./admission.db"  # Single database for all modules
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()  # All models inherit from same Base
```

#### **Shared API Client**
```typescript
// src/services/api.ts
const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  headers: { 'Content-Type': 'application/json' }
});

// Add auth token interceptor (shared across all API calls)
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Both admissionApi and feeApi use this shared instance
```

---

## 3. Parent Communication Integration Plan

### 3.1 Backend Integration

#### **File Structure (Same Pattern)**
```
admission-system/backend/
├── admission.db                  # Extend with communication tables
├── app/
│   ├── models/
│   │   ├── admission.py
│   │   ├── fee.py
│   │   └── communication.py      # ← NEW
│   ├── api/v1/
│   │   ├── __init__.py           # Update to include communication routes
│   │   ├── admissions.py
│   │   ├── fees.py
│   │   └── communication.py      # ← NEW
│   ├── schemas/
│   │   ├── admission.py
│   │   ├── fee.py
│   │   └── communication.py      # ← NEW
│   └── services/
│       └── message_service.py    # ← NEW (business logic)
```

#### **New Database Models** (`app/models/communication.py`)
```python
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Enum
from sqlalchemy.orm import relationship
from ..core.database import Base
import enum

class MessageType(str, enum.Enum):
    BROADCAST = "broadcast"
    DIRECT = "direct"
    ANNOUNCEMENT = "announcement"

class DeliveryStatus(str, enum.Enum):
    SENT = "sent"
    DELIVERED = "delivered"
    READ = "read"
    FAILED = "failed"

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    school_id = Column(Integer, ForeignKey("schools.id"), nullable=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    message_type = Column(Enum(MessageType), default=MessageType.DIRECT)
    subject = Column(String(500))
    body = Column(Text, nullable=False)

    # Recipients (for broadcast, store as JSON or separate table)
    target_role = Column(String(50))  # 'parent', 'teacher', 'all'
    target_class_id = Column(Integer, ForeignKey("classes.id"), nullable=True)

    # Metadata
    scheduled_at = Column(DateTime, nullable=True)
    sent_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    sender = relationship("User", foreign_keys=[sender_id])
    deliveries = relationship("MessageDelivery", back_populates="message")

class MessageDelivery(Base):
    __tablename__ = "message_deliveries"

    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(Integer, ForeignKey("messages.id"), nullable=False)
    recipient_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Delivery tracking
    status = Column(Enum(DeliveryStatus), default=DeliveryStatus.SENT)
    delivered_at = Column(DateTime, nullable=True)
    read_at = Column(DateTime, nullable=True)

    # Channels used (for future multi-channel)
    channel_app = Column(Boolean, default=True)
    channel_sms = Column(Boolean, default=False)  # Coming soon
    channel_email = Column(Boolean, default=False)  # Coming soon

    # Relationships
    message = relationship("Message", back_populates="deliveries")
    recipient = relationship("User", foreign_keys=[recipient_id])

class CommunicationPreference(Base):
    __tablename__ = "communication_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)

    # Channel preferences
    app_notifications_enabled = Column(Boolean, default=True)
    email_notifications_enabled = Column(Boolean, default=False)  # Coming soon
    sms_notifications_enabled = Column(Boolean, default=False)  # Coming soon

    # Language preference (for future translation)
    preferred_language = Column(String(10), default='en')  # Coming soon: hi, ta, te, bn, etc.

    # Notification frequency
    daily_digest_enabled = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="communication_preference")
```

#### **New API Endpoints** (`app/api/v1/communication.py`)
```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from ...core.database import get_db
from ...core.security import get_current_user
from ...models.user import User
from ...schemas.communication import (
    MessageCreate, MessageResponse, MessageDeliveryResponse,
    CommunicationPreferenceUpdate
)
from ...services import message_service

router = APIRouter()

# ============================================================================
# Teacher/Admin Routes - Send Messages
# ============================================================================

@router.post("/messages", response_model=MessageResponse)
async def create_message(
    message: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create and send a message (broadcast or direct).

    Only teachers, admins, and principals can send messages.
    """
    if current_user.role not in ['teacher', 'admin', 'principal']:
        raise HTTPException(status_code=403, detail="Not authorized to send messages")

    return message_service.create_and_send_message(db, current_user.id, message)

@router.get("/messages", response_model=List[MessageResponse])
async def get_messages(
    message_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get messages - sent by user (if teacher/admin) or received (if parent).
    """
    if current_user.role in ['teacher', 'admin', 'principal']:
        # Teachers see sent messages
        return message_service.get_sent_messages(db, current_user.id, skip, limit)
    else:
        # Parents see received messages
        return message_service.get_received_messages(db, current_user.id, skip, limit)

@router.get("/messages/{message_id}", response_model=MessageResponse)
async def get_message(
    message_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get message details."""
    return message_service.get_message_by_id(db, message_id, current_user.id)

@router.get("/messages/{message_id}/delivery-status", response_model=List[MessageDeliveryResponse])
async def get_message_delivery_status(
    message_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get delivery status for a broadcast message.

    Only the sender can view delivery status.
    """
    return message_service.get_delivery_status(db, message_id, current_user.id)

@router.put("/messages/{message_id}/read")
async def mark_message_as_read(
    message_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark a message as read."""
    return message_service.mark_as_read(db, message_id, current_user.id)

@router.delete("/messages/{message_id}")
async def delete_message(
    message_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a draft message (only sender can delete)."""
    return message_service.delete_message(db, message_id, current_user.id)

# ============================================================================
# Communication Preferences
# ============================================================================

@router.get("/preferences")
async def get_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's communication preferences."""
    return message_service.get_user_preferences(db, current_user.id)

@router.put("/preferences")
async def update_preferences(
    preferences: CommunicationPreferenceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user's communication preferences."""
    return message_service.update_preferences(db, current_user.id, preferences)

# ============================================================================
# Statistics & Analytics (Admin Only)
# ============================================================================

@router.get("/stats/engagement")
async def get_engagement_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get message engagement statistics (admin only)."""
    if current_user.role not in ['admin', 'principal']:
        raise HTTPException(status_code=403, detail="Admin access required")

    return message_service.get_engagement_stats(db)
```

#### **Update Route Aggregation** (`app/api/v1/__init__.py`)
```python
from fastapi import APIRouter
from .auth import router as auth_router
from .admissions import router as admissions_router
from .fees import router as fees_router
from .communication import router as communication_router  # ← NEW

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(admissions_router, prefix="/admissions", tags=["admissions"])
api_router.include_router(fees_router, prefix="/fees", tags=["fees"])
api_router.include_router(communication_router, prefix="/communication", tags=["communication"])  # ← NEW
```

### 3.2 Frontend Integration

#### **File Structure**
```
admission-system/frontend/web-app/src/
├── App.tsx                       # Update with communication routes
├── pages/
│   ├── LoginPage.tsx
│   ├── ApplicationFormPage.tsx
│   ├── FeeTypesPage.tsx
│   ├── CommunicationDashboard.tsx       # ← NEW (Teacher/Admin)
│   ├── SendMessagePage.tsx              # ← NEW (Teacher)
│   ├── MessageHistoryPage.tsx           # ← NEW (Teacher)
│   ├── ParentMessagesPage.tsx           # ← NEW (Parent Inbox)
│   └── MessageDetailsPage.tsx           # ← NEW (View message)
├── services/
│   ├── api.ts                    # Shared Axios instance
│   ├── admissionApi.ts
│   ├── feeApi.ts
│   └── communicationApi.ts       # ← NEW
├── types/
│   ├── index.ts
│   ├── fees.ts
│   └── communication.ts          # ← NEW
└── components/
    └── communication/            # ← NEW
        ├── MessageComposer.tsx
        ├── MessageList.tsx
        ├── MessageCard.tsx
        └── DeliveryStatusTable.tsx
```

#### **New Routes in App.tsx**
```typescript
import CommunicationDashboard from './pages/CommunicationDashboard';
import SendMessagePage from './pages/SendMessagePage';
import MessageHistoryPage from './pages/MessageHistoryPage';
import ParentMessagesPage from './pages/ParentMessagesPage';
import MessageDetailsPage from './pages/MessageDetailsPage';

// In AppRoutes component:

{/* Communication Routes - Teacher/Admin */}
<Route
  path="/admin/communication/dashboard"
  element={
    <ProtectedRoute adminOnly={true}>
      <CommunicationDashboard />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/communication/send"
  element={
    <ProtectedRoute adminOnly={true}>
      <SendMessagePage />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/communication/history"
  element={
    <ProtectedRoute adminOnly={true}>
      <MessageHistoryPage />
    </ProtectedRoute>
  }
/>

{/* Communication Routes - Parent */}
<Route
  path="/parent/messages"
  element={
    <ProtectedRoute>
      <ParentMessagesPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/parent/messages/:id"
  element={
    <ProtectedRoute>
      <MessageDetailsPage />
    </ProtectedRoute>
  }
/>
```

#### **New API Service** (`src/services/communicationApi.ts`)
```typescript
import api from './api';  // Shared Axios instance
import type {
  Message,
  MessageCreate,
  MessageDelivery,
  CommunicationPreference,
  PaginatedResponse
} from '../types/communication';

// ============================================================================
// Message API
// ============================================================================

export const messageApi = {
  /**
   * Create and send a message (broadcast or direct)
   */
  send: async (data: MessageCreate): Promise<Message> => {
    const response = await api.post('/communication/messages', data);
    return response.data;
  },

  /**
   * Get messages (sent for teachers, received for parents)
   */
  list: async (params?: {
    message_type?: string;
    skip?: number;
    limit?: number;
  }): Promise<Message[]> => {
    const response = await api.get('/communication/messages', { params });
    return response.data;
  },

  /**
   * Get single message details
   */
  get: async (id: number): Promise<Message> => {
    const response = await api.get(`/communication/messages/${id}`);
    return response.data;
  },

  /**
   * Get delivery status for a broadcast message
   */
  getDeliveryStatus: async (messageId: number): Promise<MessageDelivery[]> => {
    const response = await api.get(`/communication/messages/${messageId}/delivery-status`);
    return response.data;
  },

  /**
   * Mark message as read
   */
  markAsRead: async (id: number): Promise<void> => {
    await api.put(`/communication/messages/${id}/read`);
  },

  /**
   * Delete draft message
   */
  delete: async (id: number): Promise<void> => {
    await api.delete(`/communication/messages/${id}`);
  },
};

// ============================================================================
// Preferences API
// ============================================================================

export const preferencesApi = {
  /**
   * Get current user's communication preferences
   */
  get: async (): Promise<CommunicationPreference> => {
    const response = await api.get('/communication/preferences');
    return response.data;
  },

  /**
   * Update communication preferences
   */
  update: async (data: Partial<CommunicationPreference>): Promise<CommunicationPreference> => {
    const response = await api.put('/communication/preferences', data);
    return response.data;
  },
};

// ============================================================================
// Statistics API (Admin Only)
// ============================================================================

export const communicationStatsApi = {
  /**
   * Get engagement statistics
   */
  getEngagement: async (): Promise<any> => {
    const response = await api.get('/communication/stats/engagement');
    return response.data;
  },
};

export default {
  message: messageApi,
  preferences: preferencesApi,
  stats: communicationStatsApi,
};
```

#### **New Types** (`src/types/communication.ts`)
```typescript
// ============================================================================
// Communication Types
// ============================================================================

export type MessageType = 'broadcast' | 'direct' | 'announcement';
export type DeliveryStatus = 'sent' | 'delivered' | 'read' | 'failed';
export type TargetRole = 'parent' | 'teacher' | 'all';

export interface Message {
  id: number;
  school_id?: number;
  sender_id: number;
  sender_name?: string;  // Populated by backend
  message_type: MessageType;
  subject: string;
  body: string;

  // Recipients
  target_role?: TargetRole;
  target_class_id?: number;
  target_class_name?: string;  // Populated by backend

  // Metadata
  scheduled_at?: string;
  sent_at?: string;
  created_at: string;
  updated_at?: string;

  // Delivery stats (for broadcasts)
  total_recipients?: number;
  delivered_count?: number;
  read_count?: number;
}

export interface MessageDelivery {
  id: number;
  message_id: number;
  recipient_id: number;
  recipient_name?: string;  // Populated by backend
  status: DeliveryStatus;
  delivered_at?: string;
  read_at?: string;

  // Channels
  channel_app: boolean;
  channel_sms: boolean;
  channel_email: boolean;
}

export interface CommunicationPreference {
  id: number;
  user_id: number;

  // Channel preferences
  app_notifications_enabled: boolean;
  email_notifications_enabled: boolean;  // Coming soon
  sms_notifications_enabled: boolean;  // Coming soon

  // Language preference
  preferred_language: string;  // Coming soon: 'en', 'hi', 'ta', etc.

  // Notification frequency
  daily_digest_enabled: boolean;

  created_at: string;
  updated_at?: string;
}

// ============================================================================
// Form Data Types
// ============================================================================

export interface MessageCreate {
  message_type: MessageType;
  subject: string;
  body: string;
  target_role?: TargetRole;
  target_class_id?: number;
  scheduled_at?: string;
}

export interface CommunicationPreferenceUpdate {
  app_notifications_enabled?: boolean;
  email_notifications_enabled?: boolean;
  sms_notifications_enabled?: boolean;
  preferred_language?: string;
  daily_digest_enabled?: boolean;
}

// ============================================================================
// Analytics Types
// ============================================================================

export interface EngagementStats {
  total_messages_sent: number;
  total_messages_delivered: number;
  total_messages_read: number;
  average_read_rate: number;
  messages_by_type: Record<MessageType, number>;
  recent_messages: Message[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
```

---

## 4. Implementation Phases

### Phase 1: MVP - Core Messaging (Weeks 1-3) ✅ **CURRENT FOCUS**

**Goal:** Basic teacher-to-parent broadcast messaging with in-app notifications only.

#### Week 1: Database & Backend Foundation
- ✅ Create database models (`communication.py`)
- ✅ Create database migration (Alembic)
- ✅ Seed initial data (preferences for existing users)
- ✅ Create API schemas (`communication.py`)
- ✅ Write business logic (`message_service.py`)

**Deliverables:**
- 3 new tables in `admission.db`
- Message, MessageDelivery, CommunicationPreference models

#### Week 2: Backend API Endpoints
- ✅ Implement `/communication/messages` endpoints
- ✅ Implement delivery tracking logic
- ✅ Implement read receipt tracking
- ✅ Write unit tests for message service
- ✅ Test with Postman/Swagger

**Deliverables:**
- 8+ API endpoints operational
- Unit tests passing (>90% coverage)

#### Week 3: Frontend Implementation
- ✅ Create `SendMessagePage.tsx` (Teacher)
- ✅ Create `ParentMessagesPage.tsx` (Parent Inbox)
- ✅ Create `MessageDetailsPage.tsx` (View message)
- ✅ Create `CommunicationDashboard.tsx` (Teacher overview)
- ✅ Update navigation with "Messages" menu
- ✅ Integrate with backend APIs

**Deliverables:**
- 4 new frontend pages
- Working end-to-end message flow

**MVP Features:**
- ✅ Teacher can send broadcast to all parents in a class
- ✅ Teacher can send direct message to individual parent
- ✅ Parents receive messages in app inbox
- ✅ Parents can read messages and mark as read
- ✅ Teachers see delivery/read status
- ✅ In-app notifications only (no SMS/email yet)

---

### Phase 2: Enhanced Features (Weeks 4-6) - **COMING SOON**

**Deferred Features:**
- ⏳ Real-time chat (WebSocket)
- ⏳ Multi-language translation (Google Translate API)
- ⏳ SMS notifications (MSG91/Twilio)
- ⏳ Email notifications (SendGrid)
- ⏳ File attachments (photos, PDFs)
- ⏳ Message templates (homework, announcement, etc.)

---

### Phase 3: Advanced Features (Weeks 7-9) - **COMING SOON**

**Deferred Features:**
- ⏳ Meeting scheduling (Calendly-style)
- ⏳ Query management (ticketing system)
- ⏳ Emergency alerts
- ⏳ Automated progress reports
- ⏳ Analytics dashboard

---

## 5. Technical Architecture

### 5.1 System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    admission-system/frontend/web-app/                │
│                    (Single React App - Port 5173)                    │
├─────────────────────────────────────────────────────────────────────┤
│  Admission Routes    │    Fee Routes    │  Communication Routes     │
│  /applications/*     │    /fees/*       │  /messages/*              │
│                      │                  │  /communication/*         │
└───────────────────────┬─────────────────┴───────────────────────────┘
                        │
                        │ HTTP Requests (Shared Axios Instance)
                        │ Authorization: Bearer <JWT>
                        │
┌───────────────────────┴─────────────────────────────────────────────┐
│                    admission-system/backend/                         │
│                    (Single FastAPI App - Port 8000)                  │
├─────────────────────────────────────────────────────────────────────┤
│  /api/v1/auth/*           │  Shared Authentication (JWT)            │
│  /api/v1/admissions/*     │  Admission operations                   │
│  /api/v1/fees/*           │  Fee operations                         │
│  /api/v1/communication/*  │  Communication operations ← NEW         │
└───────────────────────┬─────────────────────────────────────────────┘
                        │
                        │ SQLAlchemy ORM
                        │
┌───────────────────────┴─────────────────────────────────────────────┐
│              admission-system/backend/admission.db                   │
│                    (Single SQLite Database)                          │
├─────────────────────────────────────────────────────────────────────┤
│  Admission Tables    │  Fee Tables      │  Communication Tables     │
│  - users             │  - fee_types     │  - messages               │
│  - applications      │  - invoices      │  - message_deliveries     │
│  - students          │  - payments      │  - preferences            │
│  - parents           │  - ledgers       │                           │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.2 Data Flow - Send Broadcast Message

```
1. Teacher (Frontend)
   └─> Opens SendMessagePage.tsx
       └─> Fills form: subject, body, recipients (Class 3-A)
           └─> Clicks "Send"

2. Frontend (communicationApi.ts)
   └─> POST /api/v1/communication/messages
       Headers: Authorization: Bearer <JWT>
       Body: {
         message_type: "broadcast",
         subject: "Today's Homework",
         body: "Complete Math pg 42-43",
         target_class_id: 5
       }

3. Backend (communication.py)
   └─> Validates request
       └─> Calls message_service.create_and_send_message()

4. Message Service (message_service.py)
   └─> Creates Message record
       └─> Queries all parents in Class 3-A (35 students, 70 parents)
           └─> Creates 70 MessageDelivery records
               └─> Returns Message with delivery stats

5. Database (admission.db)
   └─> messages table: 1 new row
       └─> message_deliveries table: 70 new rows

6. Frontend Response
   └─> Displays success notification
       └─> Shows delivery status: "Sent to 70 parents"
           └─> Redirects to MessageHistoryPage
```

### 5.3 Data Flow - Parent Reads Message

```
1. Parent (Frontend)
   └─> Opens ParentMessagesPage.tsx
       └─> Sees list of unread messages (badge count)
           └─> Clicks message

2. Frontend (communicationApi.ts)
   └─> GET /api/v1/communication/messages/{id}
       └─> Displays MessageDetailsPage

3. Parent Reads Message
   └─> Frontend auto-marks as read after 2 seconds
       └─> PUT /api/v1/communication/messages/{id}/read

4. Backend (communication.py)
   └─> Updates MessageDelivery record
       status: 'sent' → 'read'
       read_at: current timestamp

5. Database (admission.db)
   └─> message_deliveries table: updated row

6. Teacher View (Real-time Update)
   └─> Teacher refreshes MessageHistoryPage
       └─> Sees "69/70 read (98.5%)"
```

---

## 6. Development Roadmap

### Sprint 1: Database & Backend Setup (Week 1)
**Duration:** 5 days
**Goal:** Complete backend foundation

| Day | Task | Deliverable |
|-----|------|-------------|
| 1 | Create database models | `communication.py` with 3 models |
| 2 | Create Alembic migration | Migration script, updated DB schema |
| 3 | Create Pydantic schemas | `communication.py` schemas |
| 4 | Write message service logic | `message_service.py` |
| 5 | Seed default preferences | All existing users have preferences |

### Sprint 2: API Endpoints (Week 2)
**Duration:** 5 days
**Goal:** Operational REST API

| Day | Task | Deliverable |
|-----|------|-------------|
| 1 | Implement POST /messages | Teachers can create messages |
| 2 | Implement GET /messages | Teachers/parents can list messages |
| 3 | Implement delivery tracking | Get delivery status endpoint |
| 4 | Implement read receipts | Mark as read endpoint |
| 5 | Write unit tests | >90% test coverage |

### Sprint 3: Frontend Pages (Week 3)
**Duration:** 5 days
**Goal:** Complete UI with end-to-end flow

| Day | Task | Deliverable |
|-----|------|-------------|
| 1 | Create SendMessagePage | Teachers can send broadcasts |
| 2 | Create ParentMessagesPage | Parents see inbox |
| 3 | Create MessageDetailsPage | View full message |
| 4 | Create CommunicationDashboard | Teacher overview with stats |
| 5 | Integration testing | End-to-end flow working |

### Sprint 4: Polish & Testing (Week 3-4)
**Duration:** 3 days
**Goal:** Production-ready MVP

| Day | Task | Deliverable |
|-----|------|-------------|
| 1 | UI/UX refinements | Polished interface |
| 2 | Bug fixes | All critical bugs resolved |
| 3 | User acceptance testing | UAT with real teachers/parents |

---

## 7. Testing Strategy

### 7.1 Backend Testing

**Unit Tests** (pytest)
```bash
cd admission-system/backend
pytest tests/test_communication.py -v --cov=app.services.message_service
```

**Test Coverage:**
- ✅ Message creation and sending
- ✅ Recipient filtering (by class, role)
- ✅ Delivery tracking
- ✅ Read receipt tracking
- ✅ Authorization (only teachers/admins can send)
- ✅ Permission checks (parents can only read their messages)

### 7.2 Frontend Testing

**Component Tests** (Jest + React Testing Library)
```bash
cd admission-system/frontend/web-app
npm test
```

**Test Coverage:**
- ✅ SendMessagePage form validation
- ✅ ParentMessagesPage message list rendering
- ✅ MessageDetailsPage read status update
- ✅ API integration tests (mocked)

### 7.3 Integration Testing

**Manual Test Cases:**
1. ✅ Teacher sends broadcast to Class 3-A → 70 parents receive
2. ✅ Parent logs in → Sees unread badge count
3. ✅ Parent opens message → Status updates to "read"
4. ✅ Teacher checks delivery status → Sees 70/70 delivered, 68/70 read
5. ✅ Teacher sends direct message → Only specific parent receives
6. ✅ Parent without app access → (Future: receives SMS/email)

---

## 8. Key Differences from Fee Management

| **Aspect** | **Fee Management** | **Parent Communication** |
|-----------|-------------------|-------------------------|
| **Data Volume** | Low (invoices, payments) | High (messages, chat history) |
| **Real-time** | Not required | Coming soon (Phase 2) |
| **External APIs** | Razorpay (payment gateway) | None in Phase 1 |
| **Channels** | Email/SMS for receipts only | In-app only (Phase 1) |
| **Translation** | Not required | Coming soon (Phase 2) |
| **User Interaction** | Occasional (3x/year) | Daily (teachers/parents) |
| **Notifications** | Transactional (invoice, receipt) | Conversational (messages) |

---

## 9. Migration & Deployment

### 9.1 Database Migration

```bash
# Create migration
cd admission-system/backend
alembic revision --autogenerate -m "Add communication tables"

# Review migration file in alembic/versions/

# Apply migration
alembic upgrade head
```

### 9.2 Seed Default Preferences

```bash
# Run seed script to create preferences for existing users
python -m app.utils.seed_communication_preferences
```

### 9.3 Deployment (Same as Existing)

**No changes to deployment process** - communication is part of the same app:

```bash
# Backend
cd admission-system/backend
python -m app.main
# → http://localhost:8000

# Frontend
cd admission-system/frontend/web-app
npm run dev
# → http://localhost:5173
```

---

## 10. Success Criteria

### Phase 1 MVP Acceptance Criteria

✅ **Backend:**
- [ ] All 8+ API endpoints operational
- [ ] Unit tests passing (>90% coverage)
- [ ] API documentation updated (Swagger)
- [ ] Database migration successful

✅ **Frontend:**
- [ ] 4 new pages implemented and integrated
- [ ] Routes added to App.tsx
- [ ] Navigation updated with "Messages" menu
- [ ] API service created and working

✅ **End-to-End Flow:**
- [ ] Teacher can send broadcast to all parents in a class
- [ ] Teacher can send direct message to individual parent
- [ ] Parents receive messages in app inbox
- [ ] Parents can read and mark messages as read
- [ ] Teachers can view delivery/read status
- [ ] Unread badge count shows correctly

✅ **Performance:**
- [ ] Message delivery: < 2 seconds for 100 recipients
- [ ] Message listing: < 500ms for 50 messages
- [ ] Read receipt update: < 200ms

✅ **Security:**
- [ ] Only teachers/admins can send messages
- [ ] Parents can only read messages sent to them
- [ ] JWT authentication working across all endpoints
- [ ] SQL injection prevention (Pydantic validation)

---

## 11. Future Enhancements (Phase 2+)

### Phase 2: Real-time & Multi-channel (Weeks 4-6)
- ⏳ WebSocket integration for real-time chat
- ⏳ SMS notifications (MSG91/Twilio)
- ⏳ Email notifications (SendGrid)
- ⏳ Multi-language translation (Google Translate API)
- ⏳ File attachments (photos, PDFs, videos)

### Phase 3: Advanced Features (Weeks 7-9)
- ⏳ Meeting scheduling (Calendly-style)
- ⏳ Query management (ticketing system)
- ⏳ Emergency alerts (multi-channel broadcast)
- ⏳ Automated progress reports
- ⏳ Analytics dashboard (engagement, response times)

### Phase 4: AI-Powered Features (Weeks 10-12)
- ⏳ Smart message categorization
- ⏳ Automated translation quality improvement
- ⏳ Sentiment analysis (detect urgent/negative messages)
- ⏳ Chatbot for common parent queries
- ⏳ Predictive engagement scoring

---

## 12. Documentation & Resources

### Internal Documentation
- **This file:** Integration approach and implementation guide
- **CLAUDE.md:** Overall project context (updated to include communication)
- **README.md:** Quick start guide (updated)
- **API.md:** API documentation (to be updated with new endpoints)

### External Documentation
- **[Journey 24 PRD](../docs/product/journey-24-parent-communication-prd.md)** - Product requirements (126 pages)
- **[Journey 24 User Stories](../docs/product/journey-24-user-stories.md)** - User stories and acceptance criteria

### Code Examples
- **Fee Management:** Reference implementation for integration pattern
- **Admission System:** Core authentication and routing patterns

---

## 13. Team & Responsibilities

### Backend Development
- **Models & Migrations:** Create and test database models
- **API Endpoints:** Implement REST APIs with proper validation
- **Business Logic:** Write service layer for message operations
- **Unit Tests:** Achieve >90% test coverage

### Frontend Development
- **Pages:** Build teacher and parent UI pages
- **Components:** Create reusable message components
- **API Integration:** Connect to backend APIs
- **Routing:** Update App.tsx with new routes

### QA & Testing
- **Manual Testing:** Execute test cases for all user flows
- **Automated Testing:** Write integration tests
- **Performance Testing:** Verify response times
- **Security Testing:** Check authorization and validation

---

## 14. Risk Assessment & Mitigation

### Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Database performance degradation with message volume | High | Medium | Add indexes, implement pagination, archive old messages |
| Frontend state management complexity | Medium | Low | Use React Context, keep state simple |
| API response time > 500ms | Medium | Low | Optimize queries, add caching (Redis) |

### Non-Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Teachers resist using new system | High | Medium | Provide training, show time savings |
| Parents don't check app regularly | Medium | High | Phase 2: Add SMS/email notifications |
| Message spam/abuse | Medium | Low | Add rate limiting, admin moderation |

---

## 15. Glossary

**Broadcast Message:** Message sent to multiple recipients (e.g., all parents in a class)

**Direct Message:** One-to-one message between teacher and parent

**Delivery Status:** Tracks whether message reached recipient (sent, delivered, read, failed)

**Read Receipt:** Confirmation that recipient opened and read the message

**In-app Notification:** Notification shown within the web application (not SMS/email)

**Communication Preference:** User settings for how they want to receive notifications

---

## 16. Appendix

### A. API Endpoint Summary

**Base URL:** `http://localhost:8000/api/v1/communication`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/messages` | Create and send message | Teacher/Admin |
| GET | `/messages` | List messages | All |
| GET | `/messages/{id}` | Get message details | All |
| GET | `/messages/{id}/delivery-status` | Get delivery status | Sender only |
| PUT | `/messages/{id}/read` | Mark as read | Recipient only |
| DELETE | `/messages/{id}` | Delete draft message | Sender only |
| GET | `/preferences` | Get preferences | All |
| PUT | `/preferences` | Update preferences | All |
| GET | `/stats/engagement` | Get engagement stats | Admin only |

### B. Database Schema Summary

**New Tables:**
1. `messages` - Message metadata (sender, subject, body, recipients)
2. `message_deliveries` - Delivery tracking per recipient
3. `communication_preferences` - User notification preferences

**Relationships:**
- `messages.sender_id` → `users.id`
- `message_deliveries.message_id` → `messages.id`
- `message_deliveries.recipient_id` → `users.id`
- `communication_preferences.user_id` → `users.id`

---

**End of Document**

*Last Updated: October 15, 2025*
*Version: 1.0*
*Status: Ready for Implementation*
*Next Step: Begin Sprint 1 - Database & Backend Setup*
