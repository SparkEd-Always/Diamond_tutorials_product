"""
Invoice Model
Fee invoices generated for students
"""
from sqlalchemy import Column, Integer, String, Text, Numeric, Date, DateTime, ForeignKey, Boolean, Enum as SQLEnum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from datetime import datetime
from ...core.database import Base


class InvoiceStatus(str, enum.Enum):
    """Invoice payment status"""
    DRAFT = "draft"                # Not yet sent to parent
    SENT = "sent"                  # Sent to parent
    VIEWED = "viewed"              # Parent viewed invoice
    PARTIALLY_PAID = "partially_paid"  # Partial payment received
    PAID = "paid"                  # Fully paid
    OVERDUE = "overdue"            # Past due date
    CANCELLED = "cancelled"        # Cancelled by admin
    REFUNDED = "refunded"          # Payment refunded


class Invoice(Base):
    """
    Invoice Model
    Fee invoice generated for a student

    Invoice Number Format: INV/2024-25/000001
    """
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)

    # Invoice identification
    invoice_number = Column(String(30), unique=True, nullable=False, index=True)
    invoice_date = Column(Date, nullable=False, index=True)

    # References
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    academic_year_id = Column(Integer, ForeignKey("academic_years.id", ondelete="CASCADE"), nullable=False)
    parent_id = Column(Integer, ForeignKey("parents.id", ondelete="CASCADE"), nullable=True, index=True)

    # Amounts
    subtotal = Column(Numeric(10, 2), nullable=False, default=0.00)       # Sum of all items (before tax)
    tax_amount = Column(Numeric(10, 2), nullable=False, default=0.00)     # Total tax (GST)
    discount_amount = Column(Numeric(10, 2), nullable=False, default=0.00)  # Total discounts
    late_fee_amount = Column(Numeric(10, 2), nullable=False, default=0.00)  # Late fees
    total_amount = Column(Numeric(10, 2), nullable=False, default=0.00)   # Final amount
    paid_amount = Column(Numeric(10, 2), nullable=False, default=0.00)    # Amount paid so far
    balance_amount = Column(Numeric(10, 2), nullable=False, default=0.00) # Outstanding balance

    # Due date
    due_date = Column(Date, nullable=False, index=True)
    is_overdue = Column(Boolean, default=False, index=True)

    # Status
    status = Column(SQLEnum(InvoiceStatus), default=InvoiceStatus.DRAFT, index=True)

    # Delivery tracking
    sent_via_email = Column(Boolean, default=False)
    email_sent_at = Column(DateTime(timezone=True), nullable=True)
    sent_via_sms = Column(Boolean, default=False)
    sms_sent_at = Column(DateTime(timezone=True), nullable=True)
    viewed_at = Column(DateTime(timezone=True), nullable=True)

    # Payment tracking
    first_payment_date = Column(DateTime(timezone=True), nullable=True)
    last_payment_date = Column(DateTime(timezone=True), nullable=True)
    fully_paid_at = Column(DateTime(timezone=True), nullable=True)

    # GST details
    gstin = Column(String(15), nullable=True)  # School's GSTIN
    place_of_supply = Column(String(100), nullable=True)  # For GST compliance

    # Metadata
    remarks = Column(Text)
    generated_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    student = relationship("Student")
    academic_year = relationship("AcademicYear")
    parent = relationship("Parent")
    generated_by_user = relationship("User", foreign_keys=[generated_by])
    items = relationship("InvoiceItem", back_populates="invoice", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="invoice")

    def __repr__(self):
        return f"<Invoice {self.invoice_number} Student:{self.student_id} Total:{self.total_amount} Status:{self.status.value}>"

    def update_amounts(self):
        """Recalculate all amounts based on items"""
        self.subtotal = sum(item.amount for item in self.items)
        self.tax_amount = sum(item.tax_amount for item in self.items)
        self.total_amount = self.subtotal + self.tax_amount + self.late_fee_amount - self.discount_amount
        self.balance_amount = self.total_amount - self.paid_amount

    def update_status(self):
        """Update invoice status based on payment"""
        if self.balance_amount <= 0:
            self.status = InvoiceStatus.PAID
            if not self.fully_paid_at:
                self.fully_paid_at = datetime.now()
        elif self.paid_amount > 0:
            self.status = InvoiceStatus.PARTIALLY_PAID
        elif self.due_date < datetime.now().date():
            self.status = InvoiceStatus.OVERDUE
            self.is_overdue = True
        elif self.viewed_at:
            self.status = InvoiceStatus.VIEWED
        elif self.sent_via_email or self.sent_via_sms:
            self.status = InvoiceStatus.SENT


class InvoiceItem(Base):
    """
    Invoice Item Model
    Individual line items in an invoice (one per fee type)
    """
    __tablename__ = "invoice_items"

    id = Column(Integer, primary_key=True, index=True)

    # References
    invoice_id = Column(Integer, ForeignKey("invoices.id", ondelete="CASCADE"), nullable=False, index=True)
    fee_type_id = Column(Integer, ForeignKey("fee_types.id", ondelete="CASCADE"), nullable=False)
    fee_assignment_id = Column(Integer, ForeignKey("student_fee_assignments.id", ondelete="SET NULL"), nullable=True)

    # Item details
    description = Column(String(200), nullable=False)  # "Tuition Fee - Class 5 - Annual"
    quantity = Column(Integer, default=1)              # Usually 1, but can be multiple months

    # Amounts
    unit_price = Column(Numeric(10, 2), nullable=False)         # Price per unit (before tax)
    amount = Column(Numeric(10, 2), nullable=False)             # unit_price * quantity
    tax_rate = Column(Numeric(5, 2), default=18.00)             # GST rate
    tax_amount = Column(Numeric(10, 2), default=0.00)           # Calculated tax
    total_amount = Column(Numeric(10, 2), nullable=False)       # amount + tax_amount

    # Discount
    discount_percentage = Column(Numeric(5, 2), default=0.00)
    discount_amount = Column(Numeric(10, 2), default=0.00)

    # Display order
    line_number = Column(Integer, default=1)

    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    invoice = relationship("Invoice", back_populates="items")
    fee_type = relationship("FeeType")
    fee_assignment = relationship("StudentFeeAssignment")

    def __repr__(self):
        return f"<InvoiceItem Invoice:{self.invoice_id} {self.description} Amount:{self.total_amount}>"

    def calculate_amounts(self):
        """Calculate all amounts based on unit price, quantity, and tax"""
        self.amount = float(self.unit_price) * self.quantity

        # Apply discount
        if self.discount_percentage > 0:
            self.amount -= self.amount * (float(self.discount_percentage) / 100)
        if self.discount_amount > 0:
            self.amount -= float(self.discount_amount)

        # Calculate tax
        self.tax_amount = self.amount * (float(self.tax_rate) / 100)
        self.total_amount = self.amount + self.tax_amount

        # Round to 2 decimals
        self.amount = round(self.amount, 2)
        self.tax_amount = round(self.tax_amount, 2)
        self.total_amount = round(self.total_amount, 2)
