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
    def get_recent_activities(db: Session, limit: int = 10, user_id: int = None, unread_only: bool = False):
        """Get recent activities ordered by creation time (only important activities)"""
        # Only show important activities - exclude routine events like login, view, edit
        important_action_types = [
            'attendance_marked',
            'attendance_approved',
            'attendance_rejected',
            'teacher_attendance_marked',
            'teacher_attendance_locked',
            'message_sent',
            'notice_published',
            'communication_sent',
            'student_imported',
            'teacher_imported'
        ]

        query = db.query(ActivityLog).filter(
            ActivityLog.action_type.in_(important_action_types)
        )

        # Filter unread activities if requested
        if unread_only and user_id:
            # Get activities where user_id is not in viewed_by_user_ids
            all_activities = query.order_by(ActivityLog.created_at.desc()).all()
            activities = []
            for activity in all_activities:
                viewed_by = json.loads(activity.viewed_by_user_ids or '[]')
                if user_id not in viewed_by:
                    activities.append(activity)
                    if len(activities) >= limit:
                        break
        else:
            activities = query.order_by(ActivityLog.created_at.desc()).limit(limit).all()

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

            # Check if viewed by current user
            viewed_by = json.loads(activity.viewed_by_user_ids or '[]')
            is_viewed = user_id in viewed_by if user_id else False

            result.append({
                "id": activity.id,
                "user_name": activity.user_name,
                "action_type": activity.action_type,
                "description": activity.description,
                "entity_type": activity.entity_type,
                "entity_id": activity.entity_id,
                "time_ago": time_ago,
                "created_at": activity.created_at.isoformat(),
                "is_viewed": is_viewed
            })

        return result

    @staticmethod
    def mark_activities_as_viewed(db: Session, user_id: int, activity_ids: list = None):
        """Mark activities as viewed by a user"""
        try:
            if activity_ids:
                # Mark specific activities
                activities = db.query(ActivityLog).filter(ActivityLog.id.in_(activity_ids)).all()
            else:
                # Mark all recent important activities
                important_action_types = [
                    'attendance_marked',
                    'attendance_approved',
                    'attendance_rejected',
                    'teacher_attendance_marked',
                    'teacher_attendance_locked',
                    'message_sent',
                    'notice_published',
                    'communication_sent',
                    'student_imported',
                    'teacher_imported'
                ]
                activities = db.query(ActivityLog).filter(
                    ActivityLog.action_type.in_(important_action_types)
                ).order_by(ActivityLog.created_at.desc()).limit(50).all()

            for activity in activities:
                viewed_by = json.loads(activity.viewed_by_user_ids or '[]')
                if user_id not in viewed_by:
                    viewed_by.append(user_id)
                    activity.viewed_by_user_ids = json.dumps(viewed_by)

            db.commit()
            return len(activities)
        except Exception as e:
            db.rollback()
            raise e
