from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.dependencies import get_current_admin_user, get_current_teacher_user
from app.models.notice import Notice
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[dict])
async def get_notices(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_teacher_user)
):
    """Get all published notices"""
    notices = db.query(Notice).filter(Notice.is_published == True).order_by(Notice.published_at.desc()).all()
    return [
        {
            "id": notice.id,
            "title": notice.title,
            "content": notice.content,
            "published_at": notice.published_at,
            "priority": notice.priority,
            "target_audience": notice.target_audience
        }
        for notice in notices
    ]

@router.post("/")
async def create_notice(
    notice_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Create new notice (admin only)"""
    return {"message": "Notice creation endpoint - to be implemented"}

@router.post("/{notice_id}/publish")
async def publish_notice(
    notice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Publish notice and send notifications"""
    return {"message": "Notice publishing endpoint - to be implemented"}