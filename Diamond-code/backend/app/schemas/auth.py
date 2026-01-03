from pydantic import BaseModel, EmailStr
from typing import Optional
from app.models.user import UserRole

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

class TokenData(BaseModel):
    unique_id: Optional[str] = None
    role: Optional[str] = None

class UserBase(BaseModel):
    unique_id: str
    email: EmailStr
    phone_number: str
    username: str
    full_name: str
    role: UserRole

class UserCreate(UserBase):
    password: str
    hashed_password: Optional[str] = None

class UserResponse(UserBase):
    id: int
    is_active: bool
    is_verified: bool

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    full_name: Optional[str] = None
    is_active: Optional[bool] = None