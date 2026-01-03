from sqlalchemy import Column, Integer, String, DateTime, Boolean, Enum
from sqlalchemy.sql import func
import enum
from ..core.database import Base

class ChatType(enum.Enum):
    INDIVIDUAL = "individual"
    ANNOUNCEMENT = "announcement"

class WhatsAppChat(Base):
    __tablename__ = "whatsapp_chats"

    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String(15), nullable=False)
    chat_type = Column(Enum(ChatType), nullable=False)
    chat_id = Column(String(100), unique=True, nullable=False)

    # Parent/Student association
    parent_name = Column(String(100))
    student_unique_id = Column(String(20))  # AVM-STU-001
    student_name = Column(String(100))

    # Chat status
    is_active = Column(Boolean, default=True)
    last_message_sent = Column(DateTime(timezone=True))
    last_message_received = Column(DateTime(timezone=True))

    # Message counts for analytics
    messages_sent_count = Column(Integer, default=0)
    messages_received_count = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<WhatsAppChat(phone={self.phone_number}, type={self.chat_type}, student={self.student_name})>"