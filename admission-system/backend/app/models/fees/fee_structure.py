"""
Fee Structure Model
Defines class-wise and academic year-wise fee amounts
"""
from sqlalchemy import Column, Integer, String, Text, Numeric, Date, DateTime, ForeignKey, Boolean, Enum as SQLEnum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from ...core.database import Base


class FeeStructure(Base):
    """
    Fee Structure Model
    Defines class-wise and academic year-wise fee amounts

    Links: Academic Year + Class + Fee Type → Amount

    Example:
    - Class 1, 2024-25, Tuition Fee → ₹30,000
    - Class 1, 2024-25, Library Fee → ₹1,000
    """
    __tablename__ = "fee_structures"

    id = Column(Integer, primary_key=True, index=True)

    # Core references
    academic_year_id = Column(Integer, ForeignKey("academic_years.id", ondelete="CASCADE"), nullable=False, index=True)
    class_id = Column(Integer, ForeignKey("classes.id", ondelete="CASCADE"), nullable=False, index=True)
    fee_type_id = Column(Integer, ForeignKey("fee_types.id", ondelete="CASCADE"), nullable=False, index=True)

    # Amount for this fee type
    amount = Column(Numeric(10, 2), nullable=False)

    # Payment configuration
    installments = Column(Integer, default=1)             # Number of installments (1-12)

    # Due date configuration
    due_date = Column(Date, nullable=True)                # Single due date
    due_day_of_month = Column(Integer, nullable=True)     # For recurring (1-31)

    # Late fee configuration
    late_fee_applicable = Column(Boolean, default=True)
    late_fee_amount = Column(Numeric(10, 2), default=0.00)
    late_fee_percentage = Column(Numeric(5, 2), default=2.00)  # 2% per month
    grace_period_days = Column(Integer, default=7)

    # Discount eligibility
    sibling_discount_applicable = Column(Boolean, default=True)
    early_payment_discount_applicable = Column(Boolean, default=False)
    early_payment_discount_percentage = Column(Numeric(5, 2), default=0.00)
    early_payment_days = Column(Integer, default=15)     # Pay 15 days early for discount

    # Status
    is_active = Column(Boolean, default=True, index=True)

    # Metadata
    remarks = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    academic_year = relationship("AcademicYear")
    class_info = relationship("Class")
    fee_type = relationship("FeeType")
    assignments = relationship("StudentFeeAssignment", back_populates="fee_structure", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<FeeStructure Class:{self.class_id} FeeType:{self.fee_type_id}>"

    def calculate_installment_amount(self) -> float:
        """Calculate per-installment amount"""
        if self.installments <= 0:
            return float(self.amount)
        return round(float(self.amount) / self.installments, 2)


# Note: FeeStructureComponent model is for future refactoring
# Currently not used - fee_structures table directly links to fee_types
# Temporarily disabled to avoid relationship errors
# class FeeStructureComponent(Base):
#     """
#     Fee Structure Component Model
#     Individual fee type within a fee structure
#
#     Example:
#     - FeeStructure: "Class 1 Annual Fees"
#       - Component 1: Tuition Fee, ₹30,000
#       - Component 2: Library Fee, ₹1,000
#       - Component 3: Sports Fee, ₹1,500
#     """
#     __tablename__ = "fee_structure_components"
#
#     id = Column(Integer, primary_key=True, index=True)
#
#     # References
#     fee_structure_id = Column(Integer, ForeignKey("fee_structures.id", ondelete="CASCADE"), nullable=False, index=True)
#     fee_type_id = Column(Integer, ForeignKey("fee_types.id", ondelete="CASCADE"), nullable=False, index=True)
#
#     # Amount for this specific fee type
#     amount = Column(Numeric(10, 2), nullable=False)
#
#     # Metadata
#     display_order = Column(Integer, default=0)  # For sorting in UI
#     is_mandatory = Column(Boolean, default=True)  # Can this component be waived?
#     created_at = Column(DateTime(timezone=True), server_default=func.now())
#
#     # Relationships
#     fee_structure = relationship("FeeStructure", back_populates="components")
#     fee_type = relationship("FeeType")
#
#     def __repr__(self):
#         return f"<FeeStructureComponent Structure:{self.fee_structure_id} FeeType:{self.fee_type_id} Amount:{self.amount}>"


class StudentFeeAssignment(Base):
    """
    Student Fee Assignment Model
    Links students to fee structures with custom amounts/discounts

    Allows per-student customization:
    - Custom amounts (scholarship, waiver)
    - Custom due dates
    - Special discounts
    """
    __tablename__ = "student_fee_assignments"

    id = Column(Integer, primary_key=True, index=True)

    # References
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    fee_structure_id = Column(Integer, ForeignKey("fee_structures.id", ondelete="CASCADE"), nullable=False, index=True)

    # Custom amount (overrides fee_structure.amount if set)
    custom_amount = Column(Numeric(10, 2), nullable=True)
    discount_percentage = Column(Numeric(5, 2), default=0.00)
    discount_amount = Column(Numeric(10, 2), default=0.00)
    discount_reason = Column(String(200))                 # Sibling discount, Merit scholarship, etc.

    # Custom due date (overrides fee_structure.due_date if set)
    custom_due_date = Column(Date, nullable=True)

    # Waiver
    is_waived = Column(Boolean, default=False)
    waiver_percentage = Column(Numeric(5, 2), default=0.00)
    waiver_reason = Column(Text)
    waived_by = Column(Integer, ForeignKey("users.id"), nullable=True)  # Admin who approved waiver
    waived_at = Column(DateTime(timezone=True), nullable=True)

    # Status
    is_active = Column(Boolean, default=True, index=True)

    # Metadata
    assigned_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())
    remarks = Column(Text)

    # Relationships
    student = relationship("Student")
    fee_structure = relationship("FeeStructure", back_populates="assignments")
    assigned_by_user = relationship("User", foreign_keys=[assigned_by])
    waived_by_user = relationship("User", foreign_keys=[waived_by])

    def __repr__(self):
        return f"<StudentFeeAssignment Student:{self.student_id} Fee:{self.fee_structure_id}>"

    def get_final_amount(self) -> float:
        """Calculate final amount after discounts and waivers"""
        # Start with custom amount or fee structure amount
        base_amount = float(self.custom_amount) if self.custom_amount else float(self.fee_structure.amount)

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
