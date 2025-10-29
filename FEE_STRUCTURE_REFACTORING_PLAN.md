# Fee Structure Refactoring Plan

## 🎯 Objective

Refactor the fee structure model to follow proper data normalization:
- **One FeeStructure** = One complete fee package for a class (e.g., "Class 2 Q1 Fees")
- **Multiple FeeStructureComponents** = Individual fee types within that structure
- **One StudentFeeAssignment per student** = Reference to the single fee structure ID

---

## 🔴 Current Problem

### Current Database Schema (Incorrect)

```sql
-- Current: Each fee type is a separate fee structure
CREATE TABLE fee_structures (
    id INT PRIMARY KEY,
    academic_year_id INT,
    class_id INT,
    fee_type_id INT,          -- ❌ This makes each row a single fee type
    amount DECIMAL(10,2),
    ...
);

-- Result: For Class 2 with 10 fee types
-- Row 1: Class 2, Tuition Fee, ₹30,000
-- Row 2: Class 2, Library Fee, ₹5,000
-- Row 3: Class 2, Lab Fee, ₹3,000
-- ... (10 rows total)
```

### Current Assignment (Inefficient)

```sql
-- When assigning Class 2 fees to a student:
INSERT INTO student_fee_assignments VALUES (student_id=123, fee_structure_id=1); -- Tuition
INSERT INTO student_fee_assignments VALUES (student_id=123, fee_structure_id=2); -- Library
INSERT INTO student_fee_assignments VALUES (student_id=123, fee_structure_id=3); -- Lab
... (10 INSERT statements per student!)
```

**Problem**: For 30 students × 10 fee types = **300 database inserts** 😱

---

## ✅ Correct Design (Your Approach)

### New Database Schema

```sql
-- 1. FeeStructure: One row per fee package
CREATE TABLE fee_structures (
    id INT PRIMARY KEY,
    structure_name VARCHAR(200),          -- ✅ "Class 2 Q1 2024-25"
    structure_code VARCHAR(50) UNIQUE,    -- ✅ "CLS2-Q1-2024-25"
    academic_year_id INT,
    class_id INT,
    total_amount DECIMAL(10,2),           -- ✅ Total of all components
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    ...
);

-- 2. FeeStructureComponents: Multiple fee types per structure
CREATE TABLE fee_structure_components (
    id INT PRIMARY KEY,
    fee_structure_id INT,                 -- ✅ Foreign key to fee_structures
    fee_type_id INT,                      -- ✅ Reference to fee_types
    amount DECIMAL(10,2),                 -- ✅ Amount for this fee type
    is_mandatory BOOLEAN DEFAULT TRUE,    -- ✅ Can be waived?
    display_order INT DEFAULT 0,          -- ✅ For UI sorting
    created_at TIMESTAMP,
    FOREIGN KEY (fee_structure_id) REFERENCES fee_structures(id),
    FOREIGN KEY (fee_type_id) REFERENCES fee_types(id)
);

-- 3. StudentFeeAssignment: One row per student per structure
CREATE TABLE student_fee_assignments (
    id INT PRIMARY KEY,
    student_id INT,
    fee_structure_id INT,                 -- ✅ References parent structure
    custom_amount DECIMAL(10,2),          -- ✅ Override total if needed
    discount_percentage DECIMAL(5,2),
    discount_amount DECIMAL(10,2),
    is_active BOOLEAN DEFAULT TRUE,
    assigned_at TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (fee_structure_id) REFERENCES fee_structures(id)
);
```

### New Assignment (Efficient)

```sql
-- When assigning Class 2 fees to a student:
INSERT INTO student_fee_assignments VALUES (
    student_id=123,
    fee_structure_id=1        -- ✅ Just ONE insert!
);
```

**Benefit**: For 30 students = **30 database inserts** ✅ (90% reduction!)

---

## 📊 Data Model Comparison

### Before (Current):

```
Class 2 Q1 Fees:
├─ FeeStructure #1: Tuition Fee (₹30,000)
├─ FeeStructure #2: Library Fee (₹5,000)
├─ FeeStructure #3: Lab Fee (₹3,000)
├─ FeeStructure #4: Transport Fee (₹8,000)
├─ FeeStructure #5: Computer Fee (₹2,000)
...
└─ FeeStructure #10: Sports Fee (₹2,000)

Student Assignment:
├─ StudentFeeAssignment (student_id=123, fee_structure_id=1)
├─ StudentFeeAssignment (student_id=123, fee_structure_id=2)
├─ StudentFeeAssignment (student_id=123, fee_structure_id=3)
...
└─ StudentFeeAssignment (student_id=123, fee_structure_id=10)  ❌ 10 rows!
```

### After (Correct):

```
FeeStructure #1: "Class 2 Q1 2024-25" (Total: ₹50,000)
├─ Component #1: Tuition Fee (₹30,000)
├─ Component #2: Library Fee (₹5,000)
├─ Component #3: Lab Fee (₹3,000)
├─ Component #4: Transport Fee (₹8,000)
├─ Component #5: Computer Fee (₹2,000)
...
└─ Component #10: Sports Fee (₹2,000)

Student Assignment:
└─ StudentFeeAssignment (student_id=123, fee_structure_id=1)  ✅ 1 row!
```

---

## 🔨 Implementation Plan

### Phase 1: Update Models (1 hour)

**File**: `app/models/fees/fee_structure.py`

```python
class FeeStructure(Base):
    """
    Fee Structure Model (Parent)
    One structure = One complete fee package

    Example: "Class 2 Q1 2024-25" with total ₹50,000
    """
    __tablename__ = "fee_structures"

    id = Column(Integer, primary_key=True)
    structure_name = Column(String(200), nullable=False)  # NEW
    structure_code = Column(String(50), unique=True)      # NEW
    structure_description = Column(Text)                  # NEW

    # Core references
    academic_year_id = Column(Integer, ForeignKey("academic_years.id"))
    class_id = Column(Integer, ForeignKey("classes.id"))

    # Totals
    total_amount = Column(Numeric(10, 2), nullable=False)  # NEW: Sum of all components

    # Payment configuration
    installments = Column(Integer, default=1)
    due_date = Column(Date)

    # Status
    is_active = Column(Boolean, default=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    academic_year = relationship("AcademicYear")
    class_info = relationship("Class")
    components = relationship("FeeStructureComponent", back_populates="fee_structure", cascade="all, delete-orphan")  # NEW
    assignments = relationship("StudentFeeAssignment", back_populates="fee_structure")


class FeeStructureComponent(Base):
    """
    Fee Structure Component Model (Child)
    Individual fee type within a structure

    Example: Tuition Fee ₹30,000 within "Class 2 Q1 2024-25"
    """
    __tablename__ = "fee_structure_components"

    id = Column(Integer, primary_key=True)

    # References
    fee_structure_id = Column(Integer, ForeignKey("fee_structures.id", ondelete="CASCADE"), nullable=False)
    fee_type_id = Column(Integer, ForeignKey("fee_types.id"), nullable=False)

    # Amount for this component
    amount = Column(Numeric(10, 2), nullable=False)

    # Configuration
    is_mandatory = Column(Boolean, default=True)      # Can be waived?
    display_order = Column(Integer, default=0)        # For UI sorting

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    fee_structure = relationship("FeeStructure", back_populates="components")
    fee_type = relationship("FeeType")


class StudentFeeAssignment(Base):
    """
    Student Fee Assignment Model
    Links student to ONE fee structure (not individual fee types)
    """
    __tablename__ = "student_fee_assignments"

    id = Column(Integer, primary_key=True)

    # References
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"))
    fee_structure_id = Column(Integer, ForeignKey("fee_structures.id", ondelete="CASCADE"))  # ✅ Just one reference!

    # Customization
    custom_amount = Column(Numeric(10, 2))           # Override total if needed
    discount_percentage = Column(Numeric(5, 2), default=0.00)
    discount_amount = Column(Numeric(10, 2), default=0.00)
    discount_reason = Column(String(200))

    # Status
    is_active = Column(Boolean, default=True)
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    student = relationship("Student")
    fee_structure = relationship("FeeStructure", back_populates="assignments")

    def get_final_amount(self) -> float:
        """Calculate final amount after discounts"""
        base_amount = float(self.custom_amount) if self.custom_amount else float(self.fee_structure.total_amount)

        # Apply percentage discount
        if self.discount_percentage > 0:
            base_amount -= base_amount * (float(self.discount_percentage) / 100)

        # Apply fixed discount
        if self.discount_amount > 0:
            base_amount -= float(self.discount_amount)

        return round(max(0, base_amount), 2)
```

---

### Phase 2: Create Migration Script (30 mins)

**File**: `alembic/versions/xxx_refactor_fee_structures.py`

```python
"""Refactor fee structures to parent-child model

Revision ID: xxx
Revises: yyy
Create Date: 2025-10-29
"""

def upgrade():
    # 1. Create new fee_structures table (parent)
    op.create_table(
        'fee_structures_new',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('structure_name', sa.String(200), nullable=False),
        sa.Column('structure_code', sa.String(50), unique=True),
        sa.Column('structure_description', sa.Text()),
        sa.Column('academic_year_id', sa.Integer(), sa.ForeignKey('academic_years.id')),
        sa.Column('class_id', sa.Integer(), sa.ForeignKey('classes.id')),
        sa.Column('total_amount', sa.Numeric(10, 2), nullable=False),
        sa.Column('installments', sa.Integer(), default=1),
        sa.Column('due_date', sa.Date()),
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.func.now())
    )

    # 2. Create fee_structure_components table (child)
    op.create_table(
        'fee_structure_components',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('fee_structure_id', sa.Integer(), sa.ForeignKey('fee_structures_new.id', ondelete='CASCADE')),
        sa.Column('fee_type_id', sa.Integer(), sa.ForeignKey('fee_types.id')),
        sa.Column('amount', sa.Numeric(10, 2), nullable=False),
        sa.Column('is_mandatory', sa.Boolean(), default=True),
        sa.Column('display_order', sa.Integer(), default=0),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now())
    )

    # 3. Migrate existing data
    # Group old fee_structures by (academic_year_id, class_id)
    # Create one new FeeStructure per group
    # Create FeeStructureComponents for each old row

    # 4. Update student_fee_assignments to reference new structure

    # 5. Drop old fee_structures table
    op.drop_table('fee_structures')

    # 6. Rename fee_structures_new to fee_structures
    op.rename_table('fee_structures_new', 'fee_structures')


def downgrade():
    # Reverse the migration if needed
    pass
```

---

### Phase 3: Update API Endpoints (2 hours)

**File**: `app/api/v1/fees/fee_sessions.py`

**OLD CODE** (Lines 127-163):
```python
# Create assignments for each student
for student in students:
    # Create StudentFeeAssignment for EACH fee structure (all fee types)  ❌ INEFFICIENT
    for fee_struct in all_fee_structures:
        student_fee_assignment = StudentFeeAssignment(
            student_id=student.id,
            fee_structure_id=fee_struct.id,
            ...
        )
        db.add(student_fee_assignment)  # ❌ Multiple inserts per student
```

**NEW CODE**:
```python
# Create assignments for each student
for student in students:
    # Create ONE StudentFeeAssignment per student  ✅ EFFICIENT
    student_fee_assignment = StudentFeeAssignment(
        student_id=student.id,
        fee_structure_id=session_data.fee_structure_id,  # ✅ Just one reference!
        assigned_by=current_user.id,
        is_active=True
    )
    db.add(student_fee_assignment)
    db.flush()

    # Get total amount from fee structure
    total_expected_amount = student_fee_assignment.get_final_amount()

    # Rest of the code remains same...
```

---

### Phase 4: Create Fee Structure Creation API (1 hour)

**New Endpoint**: `POST /api/v1/fees/structures`

```python
@router.post("/structures", response_model=FeeStructureResponse)
def create_fee_structure(
    structure_data: FeeStructureCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new fee structure with components

    Example:
    {
      "structure_name": "Class 2 Q1 2024-25",
      "structure_code": "CLS2-Q1-2024-25",
      "academic_year_id": 1,
      "class_id": 2,
      "components": [
        {"fee_type_id": 1, "amount": 30000},  // Tuition
        {"fee_type_id": 2, "amount": 5000},   // Library
        {"fee_type_id": 3, "amount": 3000},   // Lab
        ...
      ]
    }
    """
    # Calculate total
    total_amount = sum(c.amount for c in structure_data.components)

    # Create fee structure
    fee_structure = FeeStructure(
        structure_name=structure_data.structure_name,
        structure_code=structure_data.structure_code,
        academic_year_id=structure_data.academic_year_id,
        class_id=structure_data.class_id,
        total_amount=total_amount,
        is_active=True
    )
    db.add(fee_structure)
    db.flush()

    # Create components
    for idx, component_data in enumerate(structure_data.components):
        component = FeeStructureComponent(
            fee_structure_id=fee_structure.id,
            fee_type_id=component_data.fee_type_id,
            amount=component_data.amount,
            is_mandatory=component_data.is_mandatory,
            display_order=idx
        )
        db.add(component)

    db.commit()
    db.refresh(fee_structure)

    return fee_structure
```

---

## 📈 Performance Comparison

### Scenario: Assign fees to 30 students (10 fee types per student)

| Metric | Current (Inefficient) | New (Efficient) | Improvement |
|--------|----------------------|-----------------|-------------|
| StudentFeeAssignment inserts | 300 | 30 | **90% reduction** |
| Ledger transaction inserts | 30 | 30 | Same |
| Total DB operations | 330 | 60 | **82% reduction** |
| API response time (estimated) | ~5 seconds | ~1 second | **80% faster** |

---

## ✅ Benefits of New Design

1. **Data Normalization**: Follows proper database design principles
2. **Performance**: 90% fewer database inserts
3. **Maintainability**: Easier to update fee structures
4. **Scalability**: Better for 1000+ students
5. **Flexibility**: Easy to add/remove fee types from a structure
6. **Clarity**: One fee structure = one logical entity
7. **Consistency**: Matches your mental model

---

## 🚀 Migration Steps

1. **Backup Database** (CRITICAL!)
2. **Create new models** (fee_structures, fee_structure_components)
3. **Create migration script** (Alembic)
4. **Migrate existing data**:
   - Group old fee_structures by class
   - Create new FeeStructure for each group
   - Create FeeStructureComponents from old rows
5. **Update API endpoints**
6. **Update frontend code**
7. **Test thoroughly**
8. **Deploy**

---

## ⚠️ Breaking Changes

**APIs that will change:**
- `POST /api/v1/fees/sessions` - Request body changes
- `GET /api/v1/fees/structures` - Response structure changes
- Fee structure creation workflow

**Frontend pages that need updates:**
- Fee structure creation wizard
- Fee session wizard
- Student fee assignment page

---

## 📝 Implementation Checklist

- [ ] Backup database
- [ ] Update FeeStructure model
- [ ] Create FeeStructureComponent model
- [ ] Update StudentFeeAssignment model
- [ ] Create Alembic migration script
- [ ] Test migration on dev database
- [ ] Update fee_sessions.py endpoint
- [ ] Create fee structure creation API
- [ ] Update fee structure schemas
- [ ] Update frontend fee structure wizard
- [ ] Test end-to-end flow
- [ ] Update documentation
- [ ] Deploy to production

---

## 🎯 Next Steps

Would you like me to:
1. ✅ Implement the new FeeStructure and FeeStructureComponent models?
2. ✅ Create the migration script?
3. ✅ Update the fee_sessions.py endpoint?
4. ✅ Create the fee structure creation API?
5. ✅ Update the frontend?

**Estimated Total Time**: 6-8 hours for complete implementation

---

*Document Created: October 29, 2025*
*Status: Ready for Implementation*
