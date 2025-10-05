from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from ...core.database import get_db
from ...core.security import (
    create_access_token,
    verify_password,
    get_password_hash,
    get_current_user
)
from ...core.config import settings
from ...models.user import User, UserRole
from ...models.user_profile import UserProfile
from ...models.student import Parent
from ...schemas.auth import UserCreate, UserLogin, Token, UserResponse

router = APIRouter()

@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
async def register_parent(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new parent user
    """
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create new user
    new_user = User(
        email=user_data.email,
        password_hash=get_password_hash(user_data.password),
        role=UserRole.PARENT,
        phone=user_data.phone,
        is_active=True,
        is_verified=False
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create parent record
    parent = Parent(user_id=new_user.id)
    db.add(parent)
    db.commit()

    # Create access token
    access_token = create_access_token(
        data={"user_id": new_user.id, "email": new_user.email, "role": new_user.role.value}
    )

    return {
        "message": "Registration successful",
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "role": new_user.role.value
        },
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """
    User login - returns JWT access token
    """
    # Find user by email
    user = db.query(User).filter(User.email == credentials.email).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Verify password
    if not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive. Please contact administrator."
        )

    # Create access token
    access_token = create_access_token(
        data={"user_id": user.id, "email": user.email, "role": user.role.value}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.get("/profile", response_model=dict)
async def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Get current user profile
    """
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()

    return {
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "role": current_user.role.value,
            "phone": current_user.phone,
            "is_verified": current_user.is_verified
        },
        "profile": {
            "first_name": profile.first_name if profile else None,
            "last_name": profile.last_name if profile else None,
            "date_of_birth": profile.date_of_birth if profile else None,
            "gender": profile.gender.value if profile and profile.gender else None,
            "city": profile.city if profile else None,
            "state": profile.state if profile else None
        } if profile else None
    }

@router.put("/profile", response_model=dict)
async def update_profile(
    profile_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update user profile
    """
    # Get or create profile
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()

    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)

    # Update profile fields
    for key, value in profile_data.items():
        if hasattr(profile, key) and value is not None:
            setattr(profile, key, value)

    db.commit()
    db.refresh(profile)

    return {
        "message": "Profile updated successfully",
        "profile": {
            "first_name": profile.first_name,
            "last_name": profile.last_name,
            "city": profile.city,
            "state": profile.state
        }
    }

@router.post("/verify-email")
async def verify_email(token: str, db: Session = Depends(get_db)):
    """
    Verify user email address (placeholder for email verification logic)
    """
    # TODO: Implement email verification logic with token
    return {"message": "Email verification endpoint - to be implemented"}

@router.post("/forgot-password")
async def forgot_password(email: str, db: Session = Depends(get_db)):
    """
    Send password reset email (placeholder)
    """
    # TODO: Implement password reset logic
    return {"message": "Password reset email sent (to be implemented)"}
