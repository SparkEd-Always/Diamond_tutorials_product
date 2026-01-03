from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.database import get_db
from app.core.security import verify_password, create_access_token, get_password_hash
from app.core.config import settings
from app.models.user import User
from app.schemas.auth import Token, UserCreate, UserResponse
from app.core.dependencies import get_current_user
from app.services.activity_service import ActivityService

router = APIRouter()

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        (User.username == form_data.username) |
        (User.email == form_data.username) |
        (User.phone_number == form_data.username)
    ).first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is deactivated"
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.unique_id, "role": user.role.value},
        expires_delta=access_token_expires
    )

    # Log activity
    try:
        ActivityService.log_activity(
            db=db,
            user_id=user.id,
            user_name=user.full_name,
            action_type="login",
            description=f"{user.full_name} logged in as {user.role.value}",
            entity_type="user",
            entity_id=user.id
        )
    except Exception as e:
        print(f"Error logging activity: {str(e)}")
        # Don't fail login if activity logging fails

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "unique_id": user.unique_id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role.value
        }
    }

@router.post("/register", response_model=UserResponse)
async def register(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    # Check if user already exists
    existing_user = db.query(User).filter(
        (User.email == user_data.email) |
        (User.phone_number == user_data.phone_number) |
        (User.username == user_data.username)
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email, phone number, or username already exists"
        )

    # Create new user
    new_user = User(
        unique_id=user_data.unique_id,
        email=user_data.email,
        phone_number=user_data.phone_number,
        username=user_data.username,
        full_name=user_data.full_name,
        hashed_password=user_data.hashed_password,
        role=user_data.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

@router.get("/me", response_model=UserResponse)
async def get_current_user(
    current_user: User = Depends(get_current_user),
):
    return current_user

@router.post("/change-password")
async def change_password(
    password_data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify current password
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )

    # Validate new password
    if len(password_data.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 6 characters"
        )

    # Update password
    current_user.hashed_password = get_password_hash(password_data.new_password)
    db.commit()

    # Log activity
    try:
        ActivityService.log_activity(
            db=db,
            user_id=current_user.id,
            user_name=current_user.full_name,
            action_type="update",
            description=f"{current_user.full_name} changed their password",
            entity_type="user",
            entity_id=current_user.id
        )
    except Exception as e:
        print(f"Error logging activity: {str(e)}")

    return {"message": "Password changed successfully"}