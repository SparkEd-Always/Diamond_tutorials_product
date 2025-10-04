from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ParentBase(BaseModel):
    phone_number: str = Field(..., pattern=r'^\+?[1-9]\d{9,14}$')
    name: Optional[str] = None
    email: Optional[str] = None


class SendOTPRequest(BaseModel):
    phone_number: str = Field(..., pattern=r'^\+?[1-9]\d{9,14}$')


class VerifyOTPRequest(BaseModel):
    phone_number: str = Field(..., pattern=r'^\+?[1-9]\d{9,14}$')
    otp_code: str = Field(..., min_length=6, max_length=6)
    push_token: Optional[str] = None
    device_type: Optional[str] = None


class ParentResponse(BaseModel):
    id: int
    phone_number: str
    name: Optional[str]
    email: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ParentLoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    parent: ParentResponse


class ChildInfo(BaseModel):
    id: int
    unique_id: str
    full_name: str
    class_name: str
    section: Optional[str]
    roll_number: Optional[str]
    is_active: str

    class Config:
        from_attributes = True


class ParentMessage(BaseModel):
    id: int
    subject: Optional[str]
    message: str
    message_type: str
    sent_at: Optional[datetime]
    is_read: bool = False
    sender_name: Optional[str]

    class Config:
        from_attributes = True
