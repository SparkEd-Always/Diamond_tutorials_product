from sqlalchemy.orm import Session
from app.models.activity_log import ActivityLog
from app.models.user import User
from datetime import datetime
import json


class ActivityService:
    """Service for logging and retrieving system activities"""

    @staticmethod
    def log_activity(
        db: Session,
        user_id: int,
        user_name: str,
        action_type: str,
        description: str,
        entity_type: str = None,
        entity_id: int = None,
        metadata: dict = None
    ):
        """
        Log an activity in the system

        Args:
            db: Database session
            user_id: ID of user performing action
            user_name: Name of user (cached for performance)
            action_type: Type of action (attendance_marked, message_sent, etc.)
            description: Human-readable description
            entity_type: Type of entity affected (student, teacher, etc.)
            entity_id: ID of affected entity
            metadata: Additional data as dict (will be JSON stringified)
        """
        activity = ActivityLog(
            user_id=user_id,
            user_name=user_name,
            action_type=action_type,
            description=description,
            entity_type=entity_type,
            entity_id=entity_id,
            meta_data=json.dumps(metadata) if metadata else None,
            created_at=datetime.utcnow()
        )
        db.add(activity)
        db.commit()
        db.refresh(activity)
        return activity

    @staticmethod
    def get_recent_activities(db: Session, limit: int = 10):
        """Get recent activities ordered by creation time (excluding login activities)"""
        # Only show important activities - exclude login events
        important_action_types = ['attendance_marked', 'attendance_approved', 'message_sent', 'notice_published']

        activities = db.query(ActivityLog).filter(
            ActivityLog.action_type.in_(important_action_types)
        ).order_by(
            ActivityLog.created_at.desc()
        ).limit(limit).all()

        # Format activities with time ago
        result = []
        now = datetime.utcnow()
        for activity in activities:
            time_diff = now - activity.created_at

            # Calculate time ago
            if time_diff.total_seconds() < 60:
                time_ago = "Just now"
            elif time_diff.total_seconds() < 3600:
                minutes = int(time_diff.total_seconds() / 60)
                time_ago = f"{minutes} min ago"
            elif time_diff.total_seconds() < 86400:
                hours = int(time_diff.total_seconds() / 3600)
                time_ago = f"{hours} hour{'s' if hours > 1 else ''} ago"
            else:
                days = int(time_diff.total_seconds() / 86400)
                time_ago = f"{days} day{'s' if days > 1 else ''} ago"

            result.append({
                "id": activity.id,
                "user_name": activity.user_name,
                "action_type": activity.action_type,
                "description": activity.description,
                "entity_type": activity.entity_type,
                "entity_id": activity.entity_id,
                "time_ago": time_ago,
                "created_at": activity.created_at.isoformat()
            })

        return result
