from .user import User, UserRole
from .user_profile import UserProfile, Gender
from .academic import AcademicYear, Class, Section
from .student import Student, Parent, StudentParent, StudentStatus
from .admission import (
    AdmissionApplication,
    ApplicationStatus,
    DocumentType,
    ApplicationDocument,
    VerificationStatus,
    AdmissionTest,
    TestStatus,
    Interview,
    InterviewStatus,
    ApplicationStatusHistory
)

# Fee Management Models
from .fees import (
    FeeType,
    FeeFrequency,
    FeeStructure,
    StudentFeeAssignment,
    Invoice,
    InvoiceItem,
    InvoiceStatus,
    Payment,
    PaymentMethod,
    PaymentStatus,
    PaymentReceipt,
    StudentFeeLedger,
)

# Communication Models
from .communication import (
    Message,
    MessageType,
    MessageDelivery,
    DeliveryStatus,
    TargetRole,
    CommunicationPreference,
)

__all__ = [
    # User & Profile
    "User",
    "UserRole",
    "UserProfile",
    "Gender",

    # Academic
    "AcademicYear",
    "Class",
    "Section",

    # Students & Parents
    "Student",
    "Parent",
    "StudentParent",
    "StudentStatus",

    # Admission Module
    "AdmissionApplication",
    "ApplicationStatus",
    "DocumentType",
    "ApplicationDocument",
    "VerificationStatus",
    "AdmissionTest",
    "TestStatus",
    "Interview",
    "InterviewStatus",
    "ApplicationStatusHistory",

    # Fee Management Module
    "FeeType",
    "FeeFrequency",
    "FeeStructure",
    "StudentFeeAssignment",
    "Invoice",
    "InvoiceItem",
    "InvoiceStatus",
    "Payment",
    "PaymentMethod",
    "PaymentStatus",
    "PaymentReceipt",
    "StudentFeeLedger",

    # Communication Module
    "Message",
    "MessageType",
    "MessageDelivery",
    "DeliveryStatus",
    "TargetRole",
    "CommunicationPreference",
]
