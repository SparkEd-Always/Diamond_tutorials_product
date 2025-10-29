"""
Fee Structure Models - Refactored for Parent-Child Architecture

This module implements a normalized fee structure design:
- FeeStructure (Parent): One complete fee package per class/year
- FeeStructureComponent (Child): Individual fee types within that structure
- StudentFeeAssignment: Links students to ONE fee structure

Example:
    FeeStructure: "Class 2 Q1 2024-25" (Total: ₹50,000)
    ├─ Component: Tuition Fee (₹30,000)
    ├─ Component: Library Fee (₹5,000)
    ├─ Component: Lab Fee (₹3,000)
    └─ Component: Transport Fee (₹12,000)

    Student Assignment: Student #123 → FeeStructure #1 (just ONE assignment!)
"""
from sqlalchemy import Column, Integer, String, Text, Numeric, Date, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ...core.database import Base


class FeeStructure(Base):
    """
    Fee Structure Model (Parent)
    Represents a complete fee package for a class in an academic year

    Each fee structure is a logical grouping of multiple fee types.
    This eliminates the need for multiple assignments per student.

    Example:
        - structure_name: "Class 2 Q1 2024-25"
        - structure_code: "CLS2-Q1-2024-25"
        - total_amount: ₹50,000 (sum of all components)
        - components: [Tuition ₹30k, Library ₹5k, Lab ₹3k, Transport ₹12k]
    """
    __tablename__ = "fee_structures"

    id = Column(Integer, primary_key=True, index=True)

    # Structure identification
    structure_name = Column(String(200), nullable=False, index=True)
    structure_code = Column(String(50), unique=True, nullable=False, index=True)
    structure_description = Column(Text, nullable=True)

    # Core references
    academic_year_id = Column(Integer, ForeignKey("academic_years.id", ondelete="CASCADE"), nullable=False, index=True)
    class_id = Column(Integer, ForeignKey("classes.id", ondelete="CASCADE"), nullable=False, index=True)

    # Total amount (calculated from components)
    total_amount = Column(Numeric(10, 2), nullable=False, default=0.00)

    # Payment configuration
    installments = Column(Integer, default=1)
    due_date = Column(Date, nullable=True)

    # Late fee configuration
    late_fee_applicable = Column(Boolean, default=True)
    late_fee_amount = Column(Numeric(10, 2), default=0.00)
    late_fee_percentage = Column(Numeric(5, 2), default=2.00)
    grace_period_days = Column(Integer, default=7)

    # Discount eligibility
    sibling_discount_applicable = Column(Boolean, default=True)
    early_payment_discount_applicable = Column(Boolean, default=False)
    early_payment_discount_percentage = Column(Numeric(5, 2), default=0.00)
    early_payment_days = Column(Integer, default=15)

    # Status
    is_active = Column(Boolean, default=True, index=True)

    # Metadata
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    academic_year = relationship("AcademicYear")
    class_info = relationship("Class")
    components = relationship(
        "FeeStructureComponent",
        back_populates="fee_structure",
        cascade="all, delete-orphan",
        order_by="FeeStructureComponent.display_order"
    )
    assignments = relationship(
        "StudentFeeAssignment",
        back_populates="fee_structure",
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<FeeStructure {self.structure_code}: {self.structure_name}>"

    def calculate_total_amount(self) -> float:
        """
        Calculate total amount from all components

        Returns:
            float: Sum of all component amounts
        """
        if not self.components:
            return 0.00
        return round(sum(float(component.amount) for component in self.components), 2)

    def recalculate_and_update_total(self):
        """
        Recalculate and update the total_amount field from components
        Call this after adding/removing/modifying components
        """
        self.total_amount = self.calculate_total_amount()


class FeeStructureComponent(Base):
    """
    Fee Structure Component Model (Child)
    Individual fee type within a fee structure

    Each component represents one fee type (e.g., Tuition, Library, Lab)
    with its specific amount within the parent structure.

    Example:
        - fee_structure_id: 1 (Class 2 Q1 2024-25)
        - fee_type_id: 2 (Library Fee)
        - amount: ₹5,000
        - is_mandatory: True
        - display_order: 2
    """
    __tablename__ = "fee_structure_components"

    id = Column(Integer, primary_key=True, index=True)

    # References
    fee_structure_id = Column(
        Integer,
        ForeignKey("fee_structures.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    fee_type_id = Column(
        Integer,
        ForeignKey("fee_types.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Amount for this component
    amount = Column(Numeric(10, 2), nullable=False)

    # Configuration
    is_mandatory = Column(Boolean, default=True)
    display_order = Column(Integer, default=0)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    fee_structure = relationship("FeeStructure", back_populates="components")
    fee_type = relationship("FeeType")

    def __repr__(self):
        return f"<FeeStructureComponent Structure:{self.fee_structure_id} FeeType:{self.fee_type_id} Amount:{self.amount}>"


class StudentFeeAssignment(Base):
    """
    Student Fee Assignment Model
    Links a student to ONE fee structure (not individual fee types)

    This model allows per-student customization:
    - Custom amounts (scholarships, waivers)
    - Custom due dates
    - Discounts (percentage or fixed amount)
    - Waivers (complete or partial)

    Key improvement: One row per student (not one per fee type!)

    Example:
        - student_id: 123
        - fee_structure_id: 1 (Class 2 Q1 2024-25 with ₹50,000 total)
        - discount_percentage: 10.0 (10% discount)
        - final_amount: ₹45,000
    """
    __tablename__ = "student_fee_assignments"

    id = Column(Integer, primary_key=True, index=True)

    # References
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    fee_structure_id = Column(Integer, ForeignKey("fee_structures.id", ondelete="CASCADE"), nullable=False, index=True)

    # Custom amount (overrides fee_structure.total_amount if set)
    custom_amount = Column(Numeric(10, 2), nullable=True)
    discount_percentage = Column(Numeric(5, 2), default=0.00)
    discount_amount = Column(Numeric(10, 2), default=0.00)
    discount_reason = Column(String(200), nullable=True)

    # Custom due date (overrides fee_structure.due_date if set)
    custom_due_date = Column(Date, nullable=True)

    # Waiver
    is_waived = Column(Boolean, default=False)
    waiver_percentage = Column(Numeric(5, 2), default=0.00)
    waiver_reason = Column(Text, nullable=True)
    waived_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    waived_at = Column(DateTime(timezone=True), nullable=True)

    # Status
    is_active = Column(Boolean, default=True, index=True)

    # Metadata
    assigned_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())
    remarks = Column(Text, nullable=True)

    # Relationships
    student = relationship("Student")
    fee_structure = relationship("FeeStructure", back_populates="assignments")
    assigned_by_user = relationship("User", foreign_keys=[assigned_by])
    waived_by_user = relationship("User", foreign_keys=[waived_by])

    def __repr__(self):
        return f"<StudentFeeAssignment Student:{self.student_id} FeeStructure:{self.fee_structure_id}>"

    def get_final_amount(self) -> float:
        """
        Calculate final amount after discounts and waivers

        Calculation order:
        1. Start with custom_amount or fee_structure.total_amount
        2. Apply percentage discount
        3. Apply fixed discount amount
        4. Apply waiver percentage

        Returns:
            float: Final amount after all discounts (minimum 0.00)
        """
        # Start with custom amount or fee structure total
        base_amount = float(self.custom_amount) if self.custom_amount else float(self.fee_structure.total_amount)

        # Apply percentage discount
        if self.discount_percentage > 0:
            base_amount -= base_amount * (float(self.discount_percentage) / 100)

        # Apply fixed discount
        if self.discount_amount > 0:
            base_amount -= float(self.discount_amount)

        # Apply waiver
        if self.is_waived and self.waiver_percentage > 0:
            base_amount -= base_amount * (float(self.waiver_percentage) / 100)

        return round(max(0, base_amount), 2)  # Ensure non-negative
