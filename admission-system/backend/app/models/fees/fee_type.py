"""
Fee Type Model
Defines different types of fees (Tuition, Exam, Library, Sports, etc.)
"""
from sqlalchemy import Column, Integer, String, Text, Boolean, Numeric, DateTime, Enum as SQLEnum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from ...core.database import Base


class FeeFrequency(str, enum.Enum):
    """How often the fee is charged"""
    ONE_TIME = "one_time"          # Admission fee, registration
    MONTHLY = "monthly"            # Monthly tuition
    QUARTERLY = "quarterly"        # Quarterly fees
    HALF_YEARLY = "half_yearly"    # Half-yearly fees
    ANNUAL = "annual"              # Annual fees
    CUSTOM = "custom"              # Custom schedule


class FeeType(Base):
    """
    Fee Type Model
    Represents different categories of fees

    Examples:
    - Tuition Fee
    - Exam Fee
    - Library Fee
    - Sports Fee
    - Transport Fee
    - Hostel Fee
    - Lab Fee
    - Activity Fee
    """
    __tablename__ = "fee_types"

    id = Column(Integer, primary_key=True, index=True)
    type_name = Column(String(100), nullable=False, unique=True, index=True)
    description = Column(Text)
    code = Column(String(20), unique=True, index=True)  # FEE_TUITION, FEE_EXAM

    # Fee properties
    is_mandatory = Column(Boolean, default=True)        # Required for all students
    is_refundable = Column(Boolean, default=False)      # Can be refunded
    frequency = Column(SQLEnum(FeeFrequency), default=FeeFrequency.ANNUAL)

    # Tax configuration
    is_taxable = Column(Boolean, default=True)          # Subject to GST
    tax_rate = Column(Numeric(5, 2), default=18.00)     # 18% GST for India

    # Display settings
    display_order = Column(Integer, default=0)          # Order in invoices
    is_active = Column(Boolean, default=True, index=True)

    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    structures = relationship("FeeStructure", back_populates="fee_type", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<FeeType {self.code}: {self.type_name}>"

    def calculate_amount_with_tax(self, base_amount: float) -> dict:
        """Calculate total amount including tax"""
        if not self.is_taxable:
            return {
                "base_amount": base_amount,
                "tax_amount": 0.0,
                "tax_rate": 0.0,
                "total_amount": base_amount
            }

        tax_amount = base_amount * (float(self.tax_rate) / 100)
        total_amount = base_amount + tax_amount

        return {
            "base_amount": base_amount,
            "tax_amount": round(tax_amount, 2),
            "tax_rate": float(self.tax_rate),
            "total_amount": round(total_amount, 2)
        }
