# Configurable Workflow Steps - Implementation Plan

**Date Created:** October 6, 2025
**Status:** Backend Complete ✅ | Frontend Pending
**Related Files:**
- Backend: `app/models/workflow.py`, `app/api/v1/workflow.py`, `app/schemas/workflow.py`
- Database: `admission_workflow_steps`, `application_workflow_progress`

---

## Overview

Implementing a configurable admission workflow system where:
1. **Admins** can customize the admission process steps (add/edit/reorder/disable)
2. **Parents** can track their application progress through these steps
3. **System** automatically tracks progress as applications move through the workflow

---

## Current Status

### ✅ Completed Backend Work

#### 1. Database Models (`app/models/workflow.py`)
- **AdmissionWorkflowStep** - Configurable workflow steps
  - Fields: step_name, step_description, step_order, is_required, is_active
- **ApplicationWorkflowProgress** - Tracks application progress
  - Fields: application_id, workflow_step_id, is_completed, is_current, completed_at, notes

#### 2. API Endpoints (`/api/v1/workflow`)
- `GET /workflow-steps` - Get all workflow steps (with optional include_inactive)
- `POST /workflow-steps` - Create new step (admin only)
- `PUT /workflow-steps/{id}` - Update step (admin only)
- `DELETE /workflow-steps/{id}` - Delete step (admin only)
- `GET /applications/{id}/workflow` - Get workflow tracking for an application
- `POST /applications/{id}/workflow/{step_id}/complete` - Mark step complete (admin only)

#### 3. Default Workflow Steps for ABC School
1. **Application Submitted** - Student has submitted the admission application form
2. **Documents Verification** - Uploaded documents are being verified by the admission team
3. **Entrance Test** - Student needs to appear for the entrance test (Required)
4. **Interview** - Parent and student interview with the admission committee (Required)
5. **Admission Decision** - Admission committee has made a decision on the application
6. **Fee Payment** - Admission fee payment is required to confirm enrollment
7. **Enrollment Complete** - Student is successfully enrolled for the academic year

---

## Implementation Phases

### Phase 1: Admin Management Interface 🔧

**Goal:** Allow admins to view, create, edit, and reorder workflow steps

#### Components to Build:
1. **Admin Workflow Settings Page** (`/admin/workflow-settings`)
   - **URL:** `/admin/workflow-settings`
   - **Access:** Admin/Super Admin only
   - **Features:**
     - Table showing all workflow steps with columns:
       - Order Number
       - Step Name
       - Description
       - Required/Optional badge
       - Active/Inactive toggle
       - Edit/Delete action buttons
     - Drag-and-drop to reorder steps (updates step_order)
     - "Add New Step" button (opens dialog)
     - Live preview of how parents will see the workflow

2. **Step Editor Dialog/Modal**
   - **Form Fields:**
     - Step Name (required, max 100 chars)
     - Description (optional, textarea)
     - Step Order (number input)
     - Is Required (checkbox)
     - Is Active (checkbox)
   - **Validation:**
     - Step name cannot be empty
     - Step order must be unique
     - Confirmation before deleting (check if any applications are using this step)
   - **Actions:** Save, Cancel

#### API Integration:
```typescript
// Get all steps
GET /api/v1/workflow/workflow-steps?include_inactive=true

// Create step
POST /api/v1/workflow/workflow-steps
Body: {
  step_name: string,
  step_description?: string,
  step_order: number,
  is_required: boolean,
  is_active: boolean
}

// Update step
PUT /api/v1/workflow/workflow-steps/{id}
Body: (same as create, all fields optional)

// Delete step
DELETE /api/v1/workflow/workflow-steps/{id}
```

#### UI/UX Considerations:
- Use Material-UI DataGrid or Table for step listing
- React Beautiful DnD for drag-and-drop reordering
- Confirmation dialogs before delete operations
- Toast notifications for success/error feedback
- Optimistic UI updates for better UX

---

### Phase 2: Parent Dashboard Tracker 📊

**Goal:** Show parents their application's progress through the workflow

#### Components to Build:

1. **WorkflowTracker Component** (`components/WorkflowTracker.tsx`)
   - **Location:** Parent Dashboard (above "Recent Applications")
   - **Also shown on:** Application Details Page

   - **Visual Elements:**
     - **Progress Header:**
       - Large progress percentage: "43% Complete"
       - Text: "3 of 7 steps completed"
       - Progress bar (linear, colored gradient)

     - **Stepper Component:** Material-UI Stepper (vertical or horizontal)
       - ✅ **Completed steps:** Green checkmark, step name, completion date
       - 🔄 **Current step:** Blue highlight, step name, description
       - ⏸️ **Pending steps:** Gray, step name only

     - **Step Details:**
       - Step name (bold)
       - Step description (smaller text, gray)
       - Status indicator (icon + color)
       - Completion date (if completed): "Completed on: Oct 6, 2025"
       - Notes (if any, from admin)

2. **Data Structure:**
```typescript
interface WorkflowStep {
  step_name: string;
  step_description: string;
  step_order: number;
  is_required: boolean;
  is_completed: boolean;
  is_current: boolean;
  completed_at?: string;
  notes?: string;
}

interface ApplicationWorkflowTracker {
  application_id: number;
  application_number: string;
  current_step?: string;
  current_step_order?: number;
  total_steps: number;
  completed_steps: number;
  progress_percentage: number;
  steps: WorkflowStep[];
}
```

#### API Integration:
```typescript
// Get workflow for specific application
GET /api/v1/workflow/applications/{application_id}/workflow

Response: {
  "application_id": 24,
  "application_number": "APP240024",
  "current_step": "Documents Verification",
  "current_step_order": 2,
  "total_steps": 7,
  "completed_steps": 1,
  "progress_percentage": 14,
  "steps": [
    {
      "step_name": "Application Submitted",
      "step_order": 1,
      "is_completed": true,
      "is_current": false,
      "completed_at": "2025-10-06T04:09:00",
      "notes": null
    },
    {
      "step_name": "Documents Verification",
      "step_order": 2,
      "is_completed": false,
      "is_current": true,
      "completed_at": null,
      "notes": "Please upload birth certificate"
    },
    ...
  ]
}
```

#### UI/UX Considerations:
- Responsive design (horizontal stepper on desktop, vertical on mobile)
- Smooth animations when steps are completed
- Empty state: "No active applications" if parent has no applications
- Loading skeleton while fetching data
- Auto-refresh when application status changes
- Color coding:
  - Completed: Green (#4caf50)
  - Current: Blue (#2196f3)
  - Pending: Gray (#9e9e9e)
  - Required: Red asterisk

---

### Phase 3: Automatic Workflow Initialization 🚀

**Goal:** When an application is created/submitted, auto-create workflow progress records

#### Implementation Location:
`backend/app/api/v1/admissions.py` - In the submit application endpoint

#### Logic:
```python
async def submit_application(application_id: int):
    # 1. Change application status from draft to submitted
    application.application_status = ApplicationStatus.SUBMITTED

    # 2. Get all active workflow steps
    workflow_steps = db.query(AdmissionWorkflowStep).filter(
        AdmissionWorkflowStep.is_active == True
    ).order_by(AdmissionWorkflowStep.step_order).all()

    # 3. Create progress records for each step
    for step in workflow_steps:
        progress = ApplicationWorkflowProgress(
            application_id=application_id,
            workflow_step_id=step.id,
            is_completed=(step.step_order == 1),  # First step auto-completed
            is_current=(step.step_order == 2)     # Second step is current
        )
        db.add(progress)

    # 4. Mark first step as completed
    if workflow_steps:
        first_step_progress = db.query(ApplicationWorkflowProgress).filter(
            ApplicationWorkflowProgress.application_id == application_id,
            ApplicationWorkflowProgress.workflow_step_id == workflow_steps[0].id
        ).first()
        if first_step_progress:
            first_step_progress.completed_at = datetime.now()

    db.commit()
```

#### When to Trigger:
- **Application Submission:** When status changes from `draft` → `submitted`
- **Initial Creation:** Optionally create progress records immediately on draft creation

---

### Phase 4: Admin Workflow Controls 👨‍💼

**Goal:** Allow admins to manually advance applications through workflow

#### Components to Build:

1. **Admin Application Details - Workflow Section**
   - **Location:** AdminApplicationDetailsPage, after Status History
   - **Features:**
     - Table of all workflow steps for this application
     - Columns: Order, Step Name, Status, Completed Date, Actions
     - Each incomplete step has "Mark Complete" button
     - Completed steps show completion date and completed by user
     - Text area for adding notes when marking complete
     - Visual indicator of current step

2. **Mark Complete Dialog**
   - Opens when admin clicks "Mark Complete"
   - Fields:
     - Step Name (readonly, display only)
     - Notes (optional textarea): "Add any notes about this step..."
     - Buttons: Cancel, Mark Complete
   - API call on confirm

#### API Integration:
```typescript
// Mark step as complete
POST /api/v1/workflow/applications/{application_id}/workflow/{step_id}/complete
Body: {
  notes?: string
}

Response: {
  message: "Step marked as complete",
  progress: {...}
}
```

#### Business Logic:
- Only admins can mark steps complete
- When a step is marked complete:
  - Set `is_completed = true`
  - Set `completed_at = now()`
  - Set `completed_by = current_user.id`
  - Save notes if provided
  - Move `is_current` to next step
  - **Optional:** Auto-update application status based on step (e.g., "Documents Verification" complete → status = "under_review")

#### Bulk Actions (Future Enhancement):
- Select multiple applications
- "Advance All to Next Step" button
- Useful for batch processing (e.g., mark all as "Test Scheduled")

---

### Phase 5: Smart Workflow Automation 🤖 (Future Enhancement)

**Goal:** Auto-advance workflow based on application status changes

#### Mapping Status → Workflow Steps:
```python
STATUS_TO_STEP_MAPPING = {
    ApplicationStatus.SUBMITTED: "Application Submitted",
    ApplicationStatus.UNDER_REVIEW: "Documents Verification",
    ApplicationStatus.TEST_SCHEDULED: "Entrance Test",
    ApplicationStatus.INTERVIEW_SCHEDULED: "Interview",
    ApplicationStatus.ACCEPTED: "Admission Decision",
    ApplicationStatus.FEE_PENDING: "Fee Payment",
    ApplicationStatus.ENROLLED: "Enrollment Complete"
}
```

#### Implementation:
- Create a background job or hook into status update endpoint
- When application status changes:
  1. Check mapping table
  2. Find corresponding workflow step
  3. Auto-mark as complete
  4. Advance to next step

#### Benefits:
- Reduces manual work for admins
- Keeps workflow in sync with application status
- Ensures consistency

---

## Implementation Order

### Option A: Parent-First Approach ✅ (Recommended)

**Why?** Immediate value for parents, easier to test and demo

1. ✅ Backend API (Done)
2. ✅ Seed workflow steps (Done)
3. **Next:** Parent Dashboard Tracker Component
4. Then: Automatic workflow initialization
5. Then: Admin Management Interface
6. Then: Admin workflow controls
7. Future: Smart automation

**Pros:**
- Parents see value immediately
- Easier to test with existing applications
- Admin can customize later without blocking parent experience
- Simpler component to build first (read-only view)

**Cons:**
- Admins can't customize before launch
- Need to manually initialize workflow for existing applications

---

### Option B: Admin-First Approach

**Why?** Admins can fully customize before parents see it

1. ✅ Backend API (Done)
2. ✅ Seed workflow steps (Done)
3. **Next:** Admin Management Interface
4. Then: Automatic workflow initialization
5. Then: Parent Dashboard Tracker
6. Then: Admin workflow controls
7. Future: Smart automation

**Pros:**
- Full admin control before launch
- Can test customization before parents see
- More logical feature progression

**Cons:**
- Takes longer to show value to end users (parents)
- More complex CRUD UI to build first
- Testing is harder without parent view

---

## Technical Decisions

### Frontend Technology:
- **UI Library:** Material-UI v7 (already in use)
- **Stepper Component:** `@mui/material/Stepper` (horizontal/vertical)
- **Progress Bar:** `@mui/material/LinearProgress`
- **Drag-and-Drop:** `react-beautiful-dnd` (for admin reordering)
- **Form Management:** React Hook Form + Yup (consistent with existing forms)
- **State Management:** React Context API (for workflow data)

### API Design Decisions:
- **RESTful endpoints** - Standard CRUD operations
- **Nested routes** - `/applications/{id}/workflow` for application-specific data
- **Filtering** - `?include_inactive=true` for admin views
- **Response format** - Includes calculated fields (progress_percentage, current_step)

### Database Design Decisions:
- **Two tables approach:**
  - `admission_workflow_steps` - Template/configuration
  - `application_workflow_progress` - Instance data per application
- **Soft delete:** Use `is_active=false` instead of deleting steps
- **Audit trail:** Track who completed each step and when
- **Flexibility:** Steps can be added/removed without breaking existing applications

---

## Migration Plan for Existing Applications

### Challenge:
17 existing applications in database don't have workflow progress records

### Solution:
Create a migration script to initialize workflow for existing applications

```python
# migration_script.py
def initialize_workflow_for_existing_applications():
    applications = db.query(AdmissionApplication).all()
    workflow_steps = db.query(AdmissionWorkflowStep).filter(
        AdmissionWorkflowStep.is_active == True
    ).order_by(AdmissionWorkflowStep.step_order).all()

    for app in applications:
        # Check if workflow already initialized
        existing_progress = db.query(ApplicationWorkflowProgress).filter(
            ApplicationWorkflowProgress.application_id == app.id
        ).first()

        if existing_progress:
            continue  # Skip if already initialized

        # Create progress records based on application status
        current_step_order = determine_current_step_from_status(app.application_status)

        for step in workflow_steps:
            is_completed = step.step_order < current_step_order
            is_current = step.step_order == current_step_order

            progress = ApplicationWorkflowProgress(
                application_id=app.id,
                workflow_step_id=step.id,
                is_completed=is_completed,
                is_current=is_current,
                completed_at=app.submission_date if is_completed else None
            )
            db.add(progress)

    db.commit()
```

---

## Testing Strategy

### Unit Tests:
- Test workflow step CRUD operations
- Test progress calculation logic
- Test step completion logic

### Integration Tests:
- Test workflow initialization on application submission
- Test workflow tracker API responses
- Test admin marking steps complete

### E2E Tests:
- Parent views workflow tracker on dashboard
- Admin creates/edits/reorders workflow steps
- Admin marks application step as complete
- Workflow updates are reflected for parent

### Manual Testing Checklist:
- [ ] Create new application → Workflow auto-initialized
- [ ] Parent sees workflow on dashboard
- [ ] Workflow shows correct progress percentage
- [ ] Current step is highlighted
- [ ] Admin can view all steps in admin panel
- [ ] Admin can create new step
- [ ] Admin can edit existing step
- [ ] Admin can delete step (with confirmation)
- [ ] Admin can reorder steps
- [ ] Admin can mark step complete on application
- [ ] Notes are saved when marking complete
- [ ] Parent sees updated workflow after admin action

---

## Success Metrics

### For Parents:
- Reduced "Where is my application?" support tickets by 70%
- Parents can self-serve application status information
- Clear expectations on next steps

### For Admins:
- Faster application processing (visual checklist)
- Consistent workflow across all applications
- Easy to customize process per school needs
- Track bottlenecks (which step takes longest)

### For System:
- < 500ms API response time for workflow tracker
- Zero downtime during workflow configuration changes
- Support for 1000+ concurrent applications

---

## Future Enhancements

1. **Email Notifications:**
   - Send email when application moves to next step
   - Reminder emails for pending actions

2. **Workflow Analytics:**
   - Dashboard showing average time per step
   - Bottleneck identification
   - Conversion funnel (how many applicants drop at each step)

3. **Conditional Workflows:**
   - Different workflows for different grades/classes
   - Skip optional steps based on conditions (e.g., transfer students skip entrance test)

4. **Workflow Templates:**
   - Pre-defined templates for common admission processes
   - Import/export workflow configurations

5. **Multi-language Support:**
   - Workflow steps in multiple languages
   - Based on parent's language preference

6. **Mobile App:**
   - Push notifications for workflow updates
   - Native stepper UI

---

## Files Created/Modified

### Backend:
- ✅ `app/models/workflow.py` - Database models
- ✅ `app/schemas/workflow.py` - Pydantic schemas
- ✅ `app/api/v1/workflow.py` - API endpoints
- ✅ `app/api/v1/__init__.py` - Register workflow router
- ✅ `app/utils/seed_workflow.py` - Seed default steps
- ✅ `app/utils/init_db.py` - Call seed function

### Frontend (Pending):
- `src/types/workflow.ts` - TypeScript types
- `src/services/workflowApi.ts` - API client
- `src/components/WorkflowTracker.tsx` - Parent workflow component
- `src/pages/AdminWorkflowSettingsPage.tsx` - Admin management UI
- `src/components/admin/WorkflowStepEditor.tsx` - Step editor dialog
- `src/pages/ParentDashboard.tsx` - Add workflow tracker
- `src/pages/AdminApplicationDetailsPage.tsx` - Add workflow controls

---

## Next Steps

**Recommended Path:** Parent-First Approach (Option A)

### Immediate Next Task:
**Build Parent Dashboard Workflow Tracker Component**

1. Create TypeScript types for workflow data
2. Create API service methods
3. Build WorkflowTracker component
4. Add to ParentDashboard page
5. Test with existing applications

**Estimated Time:** 2-3 hours

---

**Last Updated:** October 6, 2025
**Document Owner:** Development Team
**Status:** Backend Complete | Ready for Frontend Development
