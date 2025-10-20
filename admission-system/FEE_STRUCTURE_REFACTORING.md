# Fee Structure Refactoring Plan

**Status:** ⏳ **PENDING** - Postponed for Later Implementation
**Priority:** Medium
**Estimated Effort:** 15-20 hours
**Created:** October 19, 2025

---

## Background

### Current Data Model (As-Is)

The current fee structure implementation treats each `FeeStructure` as a **single fee type**:

```
FeeStructure
├─ id: 1
├─ fee_type_id: 1 (Tuition Fee)
├─ amount: ₹30,000
├─ class_id: 4 (informational)
└─ academic_year_id: 1 (informational)

FeeStructure
├─ id: 2
├─ fee_type_id: 2 (Library Fee)
├─ amount: ₹1,000
├─ class_id: 4 (informational)
└─ academic_year_id: 1 (informational)

... (7 separate records for Class 1)
```

**Issues:**
- Need to fetch multiple `FeeStructure` records to get total fee for a class
- Confusing that `class_id` and `academic_year_id` appear to be constraints but aren't
- When creating a fee session, only one fee structure is selected, missing others

### Desired Data Model (To-Be)

A `FeeStructure` should be a **container/bundle** of multiple fee types:

```
FeeStructure
├─ id: 1
├─ structure_name: "Class 1 Annual Fees 2024-25"
├─ description: "Standard fee structure for Class 1"
├─ class_id: 4 (informational label only)
├─ academic_year_id: 1 (informational label only)
├─ installments: 4
└─ components: [
    ├─ FeeStructureComponent
    │   ├─ fee_type_id: 1 (Tuition)
    │   ├─ amount: ₹30,000
    │   └─ display_order: 1
    ├─ FeeStructureComponent
    │   ├─ fee_type_id: 2 (Library)
    │   ├─ amount: ₹1,000
    │   └─ display_order: 2
    └─ ... (7 components)
    ]
Total: ₹45,000
```

**Benefits:**
- Clear that fee structure is a bundle of fee types
- One record represents the complete fee for a student
- `class_id` and `academic_year_id` are clearly informational
- Fee structure can be assigned to any class/year (flexible)
- UI shows complete fee breakdown in one view

---

## Current Implementation Status

### ✅ Completed

1. **Database Models** (Oct 19, 2025)
   - Created `FeeStructureComponent` model in `app/models/fees/fee_structure.py`
   - Updated `FeeStructure` model:
     - Added `structure_name` field
     - Added `description` field
     - Added `components` relationship
     - Added `get_total_amount()` method
     - Changed `class_id` and `academic_year_id` to nullable (informational only)
   - Exported new model in `app/models/fees/__init__.py`

2. **Database Schema**
   - Created `fee_structure_components` table with columns:
     - `id`, `fee_structure_id`, `fee_type_id`, `amount`
     - `display_order`, `is_mandatory`, `created_at`
   - Added `structure_name` and `description` columns to `fee_structures` table
   - **Note:** Old columns (`fee_type_id`, `amount`) still exist in database for backward compatibility

3. **Migration Script**
   - Created `alembic/versions/fee_structure_components.py`
   - **Status:** Not yet applied (can be applied later)

### ⏳ Pending Work

#### Backend Changes (8-10 hours)

**1. Pydantic Schemas** (`app/schemas/fees/fee_structure.py`)
- [ ] Create `FeeStructureComponentResponse` schema
- [ ] Create `FeeStructureComponentCreate` schema
- [ ] Update `FeeStructureResponse` to include `components: List[FeeStructureComponentResponse]`
- [ ] Update `FeeStructureCreate` to accept `components: List[FeeStructureComponentCreate]`
- [ ] Add `total_amount` as computed field in response

**2. API Endpoints** (`app/api/v1/fees/fee_structures.py`)
- [ ] Update `list_fee_structures()` - Include components in response
- [ ] Update `get_fee_structure()` - Include components in response
- [ ] Rewrite `create_fee_structure()` - Accept and create components
- [ ] Rewrite `update_fee_structure()` - Update components (add/remove/modify)
- [ ] Update `delete_fee_structure()` - Cascade delete components (already handled by model)

**3. Fee Session Creation** (`app/api/v1/fees/fee_sessions.py`)
- [ ] Update `create_fee_session()` to use `fee_structure.get_total_amount()`
- [ ] Update student assignment logic to create assignments for all components
- [ ] Calculate total expected amount from components sum

**4. Data Migration**
- [ ] Create script to migrate existing fee structures to new model:
  ```python
  # For each class + academic_year combination:
  # 1. Create one FeeStructure with structure_name
  # 2. Convert each old FeeStructure to FeeStructureComponent
  # 3. Link components to new structure
  ```

**5. Tests**
- [ ] Update unit tests for fee structure CRUD operations
- [ ] Add tests for component creation/update/delete
- [ ] Test fee session creation with new model

#### Frontend Changes (4-6 hours)

**1. Type Definitions** (`src/types/fees.ts`)
- [ ] Add `FeeStructureComponent` interface:
  ```typescript
  export interface FeeStructureComponent {
    id: number;
    fee_type_id: number;
    fee_type_name?: string;
    amount: number;
    display_order: number;
    is_mandatory: boolean;
  }
  ```
- [ ] Update `FeeStructure` interface:
  ```typescript
  export interface FeeStructure {
    id: number;
    structure_name: string;
    description?: string;
    academic_year_id?: number;  // Optional/informational
    class_id?: number;  // Optional/informational
    components: FeeStructureComponent[];
    total_amount: number;  // Computed
    installments: number;
    // ... other fields
  }
  ```

**2. Fee Structure List Page** (`src/pages/FeeStructuresPage.tsx`)
- [ ] Update table to show `structure_name` instead of fee type
- [ ] Add expandable row to show components breakdown
- [ ] Display total amount (sum of components)
- [ ] Update filters/search to work with new structure

**3. Fee Structure Create/Edit Page** (New or update existing)
- [ ] Create form with structure name and description
- [ ] Add component management section:
  - Select fee type from dropdown
  - Enter amount
  - Add/Remove components
  - Reorder components
- [ ] Show running total of all components
- [ ] Validate at least one component required

**4. Review & Confirm Step** (`src/pages/fees/create-session/ReviewConfirmStep.tsx`)
- [ ] Update to fetch components from single fee structure
- [ ] Display components in bill-style table (already implemented)
- [ ] Calculate total from components

**5. Select Fee Structure Step** (`src/pages/fees/create-session/SelectFeeStructureStep.tsx`)
- [ ] Update to show structure name instead of fee type
- [ ] Display total amount and component count
- [ ] Show component preview in selection card

**6. Fee Session Details Page** (`src/pages/fees/FeeSessionDetailsPage.tsx`)
- [ ] Update to display fee structure components
- [ ] Show per-student breakdown by component

#### Database Migration (1-2 hours)

**1. Backup Current Data**
```bash
# Backup current admission.db
cp admission.db admission.db.backup
```

**2. Run Migration Script**
```python
# Script to migrate old data to new structure
# See: migration_scripts/migrate_fee_structures.py
```

**3. Verify Data**
- [ ] Check all fee structures migrated correctly
- [ ] Verify component totals match old amounts
- [ ] Test fee session creation with migrated data

---

## Migration Strategy

### Phase 1: Preparation (1 hour)
1. Document all existing fee structures and their amounts
2. Backup production database
3. Create migration script and test on copy

### Phase 2: Backend Implementation (8 hours)
1. Update Pydantic schemas
2. Update API endpoints
3. Update fee session creation logic
4. Write and run tests

### Phase 3: Frontend Implementation (5 hours)
1. Update type definitions
2. Update fee structure pages
3. Update fee session wizard
4. Update fee session details page

### Phase 4: Migration & Testing (2 hours)
1. Run data migration script
2. Verify all existing data
3. End-to-end testing
4. Create sample fee structures

### Phase 5: Cleanup (1 hour)
1. Remove old columns from database (optional)
2. Update documentation
3. Deploy changes

---

## Rollback Plan

If issues arise, the system can be rolled back because:

1. **Old columns still exist** - `fee_type_id` and `amount` in `fee_structures` table
2. **Old code still works** - API endpoints still use old schema
3. **No data loss** - New tables/columns added, nothing removed

**Rollback Steps:**
1. Revert code changes to previous commit
2. Restore database backup if needed
3. Drop `fee_structure_components` table (optional)

---

## Testing Checklist

### Backend API Tests
- [ ] Create fee structure with components
- [ ] Get fee structure with components
- [ ] Update fee structure components
- [ ] Delete fee structure (cascade deletes components)
- [ ] List fee structures with component counts
- [ ] Create fee session using fee structure with components
- [ ] Verify student assignments have correct total amount

### Frontend UI Tests
- [ ] Create new fee structure with 7 components
- [ ] View fee structure showing all components
- [ ] Edit fee structure (add/remove/update components)
- [ ] Create fee session selecting fee structure
- [ ] Review step shows component breakdown
- [ ] Fee session details shows correct totals

### Data Migration Tests
- [ ] Migrate existing 7 fee structures for Class 1
- [ ] Verify total amounts match
- [ ] Verify existing fee sessions still work
- [ ] Verify existing student assignments intact

---

## Known Issues & Considerations

1. **SQLite Limitation**: Cannot easily drop columns in SQLite. Old columns (`fee_type_id`, `amount`) will remain in database but unused.

2. **Existing Fee Sessions**: Fee sessions created before refactoring will still reference old fee structure records. Migration script should handle this.

3. **Breaking Changes**: This is a breaking change for any external integrations or APIs that depend on the old fee structure format.

4. **Data Validation**: Need to ensure at least one component per fee structure, and component amounts are positive.

---

## Success Criteria

- [ ] One `FeeStructure` record contains multiple fee type components
- [ ] Total amount calculated correctly from components
- [ ] Fee session creation uses component total
- [ ] UI shows clear breakdown of all fee types
- [ ] All existing fee sessions and data preserved
- [ ] No regressions in existing functionality

---

## References

**Files Modified:**
- `admission-system/backend/app/models/fees/fee_structure.py`
- `admission-system/backend/app/models/fees/__init__.py`
- `admission-system/backend/alembic/versions/fee_structure_components.py`

**Files to Modify (Pending):**
- `admission-system/backend/app/schemas/fees/fee_structure.py`
- `admission-system/backend/app/api/v1/fees/fee_structures.py`
- `admission-system/backend/app/api/v1/fees/fee_sessions.py`
- `admission-system/frontend/web-app/src/types/fees.ts`
- `admission-system/frontend/web-app/src/pages/FeeStructuresPage.tsx`
- `admission-system/frontend/web-app/src/pages/fees/create-session/*.tsx`

---

## Contact & Questions

For questions or to prioritize this work, please update this document or create a task in the project tracker.

**Last Updated:** October 19, 2025
**Status:** Planning & Partial Implementation - Ready for Full Implementation When Needed
