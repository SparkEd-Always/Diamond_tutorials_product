from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.core.dependencies import get_current_admin_user
from app.models.user import User
from app.services.activity_service import ActivityService

router = APIRouter()


@router.get("/recent")
async def get_recent_activities(
    limit: int = 10,
    unread_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get recent system activities (admin only)"""
    try:
        activities = ActivityService.get_recent_activities(
            db,
            limit=limit,
            user_id=current_user.id,
            unread_only=unread_only
        )
        return {
            "activities": activities,
            "count": len(activities)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching activities: {str(e)}"
        )


@router.post("/mark-viewed")
async def mark_activities_viewed(
    activity_ids: Optional[List[int]] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Mark activities as viewed by current user (admin only)"""
    try:
        count = ActivityService.mark_activities_as_viewed(
            db,
            user_id=current_user.id,
            activity_ids=activity_ids
        )
        return {
            "message": "Activities marked as viewed",
            "count": count
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error marking activities as viewed: {str(e)}"
        )
