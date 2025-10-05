from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_token
from app.models.user import User, UserRole
from app.models.teacher import Teacher
from app.models.parent import Parent

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = verify_token(token)
    if payload is None:
        raise credentials_exception

    unique_id: str = payload.get("sub")
    if unique_id is None:
        raise credentials_exception

    user = db.query(User).filter(User.unique_id == unique_id).first()
    if user is None:
        raise credentials_exception

    return user

async def get_current_admin_user(
    current_user: User = Depends(get_current_user)
) -> User:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

async def get_current_teacher_user(
    current_user: User = Depends(get_current_user)
) -> User:
    if current_user.role not in [UserRole.ADMIN, UserRole.TEACHER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Teacher or Admin access required"
        )
    return current_user

async def get_current_mobile_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    """
    Get current user from mobile app (teacher or parent)
    Mobile tokens have phone_number in 'sub' and user type in 'type'
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = verify_token(token)
    if payload is None:
        raise credentials_exception

    phone_number: str = payload.get("sub")
    user_type: str = payload.get("type")

    if phone_number is None or user_type is None:
        raise credentials_exception

    # Check if this is a regular web user (has unique_id in sub)
    if user_type not in ["teacher", "parent"]:
        # Try web auth
        user = db.query(User).filter(User.unique_id == phone_number).first()
        if user:
            return user

    # Mobile user - teacher or parent
    if user_type == "teacher":
        teacher = db.query(Teacher).filter(
            (Teacher.phone == phone_number) | (Teacher.phone_number == phone_number)
        ).first()
        if teacher is None:
            raise credentials_exception
        return teacher

    elif user_type == "parent":
        parent = db.query(Parent).filter(Parent.phone_number == phone_number).first()
        if parent is None:
            raise credentials_exception
        return parent

    raise credentials_exception