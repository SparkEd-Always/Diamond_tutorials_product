"""
Application Review API Endpoints - Field-level reviews and change requests
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user, require_admin
from app.models.user import User
from app.models.admission import AdmissionApplication, ApplicationStatus
from app.models.application_review import ApplicationFieldReview, ApplicationReview
from app.schemas.application_review import (
    ApplicationReviewCreate,
    ApplicationReviewResponse,
    FieldReviewCreate,
    FieldReviewResponse,
    FieldReviewUpdate,
    ApplicationReviewFullResponse,
)

router = APIRouter()


@router.post("/applications/{application_id}/review", response_model=ApplicationReviewResponse)
async def create_application_review(
    application_id: int,
    review_data: ApplicationReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Create or update application review with field-level comments
    Admin marks fields that need correction and adds overall remarks
    """
    # Check application exists
    application = db.query(AdmissionApplication).filter(
        AdmissionApplication.id == application_id
    ).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    # Get current version number
    latest_review = db.query(ApplicationReview).filter(
        ApplicationReview.application_id == application_id
    ).order_by(ApplicationReview.version_number.desc()).first()

    version_number = (latest_review.version_number + 1) if latest_review else 1

    # Create overall review
    review = ApplicationReview(
        application_id=application_id,
        review_status=review_data.review_status,
        overall_remarks=review_data.overall_remarks,
        version_number=version_number,
        reviewed_by=current_user.id,
    )
    db.add(review)
    db.flush()

    # Delete existing field reviews for this application
    db.query(ApplicationFieldReview).filter(
        ApplicationFieldReview.application_id == application_id
    ).delete()

    # Create field reviews
    field_reviews_list = []
    for field_review_data in review_data.field_reviews:
        field_review = ApplicationFieldReview(
            application_id=application_id,
            field_name=field_review_data.field_name,
            field_label=field_review_data.field_label,
            field_value=field_review_data.field_value,
            needs_correction=field_review_data.needs_correction,
            admin_comment=field_review_data.admin_comment,
            reviewed_by=current_user.id,
        )
        db.add(field_review)
        field_reviews_list.append(field_review)

    # Update application status if changes requested
    if review_data.review_status == "changes_requested":
        application.application_status = ApplicationStatus.CHANGES_REQUESTED
    elif review_data.review_status == "approved":
        application.application_status = ApplicationStatus.UNDER_REVIEW

    db.commit()
    db.refresh(review)

    # Load field reviews for response
    review.field_reviews = field_reviews_list

    return review


@router.get("/applications/{application_id}/review", response_model=ApplicationReviewFullResponse)
async def get_application_review(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get complete review information for an application
    Shows all field reviews and latest overall review
    """
    application = db.query(AdmissionApplication).filter(
        AdmissionApplication.id == application_id
    ).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    # Get latest review
    latest_review = db.query(ApplicationReview).filter(
        ApplicationReview.application_id == application_id
    ).order_by(ApplicationReview.reviewed_at.desc()).first()

    # Get all field reviews
    field_reviews = db.query(ApplicationFieldReview).filter(
        ApplicationFieldReview.application_id == application_id
    ).all()

    # Count corrections needed
    correction_count = sum(1 for fr in field_reviews if fr.needs_correction)

    return {
        "application_id": application_id,
        "application_number": application.application_number,
        "application_status": application.application_status.value,
        "current_review": latest_review,
        "field_reviews": field_reviews,
        "has_pending_corrections": correction_count > 0,
        "correction_count": correction_count,
    }


@router.get("/applications/{application_id}/field-reviews", response_model=List[FieldReviewResponse])
async def get_field_reviews(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all field reviews for an application"""
    application = db.query(AdmissionApplication).filter(
        AdmissionApplication.id == application_id
    ).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    field_reviews = db.query(ApplicationFieldReview).filter(
        ApplicationFieldReview.application_id == application_id
    ).all()

    return field_reviews


@router.put("/applications/{application_id}/field-reviews/{field_review_id}", response_model=FieldReviewResponse)
async def update_field_review(
    application_id: int,
    field_review_id: int,
    update_data: FieldReviewUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Update a specific field review"""
    field_review = db.query(ApplicationFieldReview).filter(
        ApplicationFieldReview.id == field_review_id,
        ApplicationFieldReview.application_id == application_id,
    ).first()

    if not field_review:
        raise HTTPException(status_code=404, detail="Field review not found")

    if update_data.needs_correction is not None:
        field_review.needs_correction = update_data.needs_correction
    if update_data.admin_comment is not None:
        field_review.admin_comment = update_data.admin_comment

    db.commit()
    db.refresh(field_review)
    return field_review


@router.post("/applications/{application_id}/resubmit")
async def resubmit_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Parent resubmits application after making corrections
    Changes status from changes_requested back to submitted
    """
    application = db.query(AdmissionApplication).filter(
        AdmissionApplication.id == application_id
    ).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    # Check if application is in changes_requested status
    if application.application_status != ApplicationStatus.CHANGES_REQUESTED:
        raise HTTPException(
            status_code=400,
            detail="Application is not in changes_requested status"
        )

    # Change status back to submitted for admin review
    application.application_status = ApplicationStatus.SUBMITTED

    # Clear field review flags (keep comments for history)
    field_reviews = db.query(ApplicationFieldReview).filter(
        ApplicationFieldReview.application_id == application_id
    ).all()
    for fr in field_reviews:
        fr.needs_correction = False

    db.commit()

    return {"message": "Application resubmitted successfully", "application_id": application_id}


@router.delete("/applications/{application_id}/review")
async def clear_application_review(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Clear all reviews for an application (admin only)"""
    db.query(ApplicationFieldReview).filter(
        ApplicationFieldReview.application_id == application_id
    ).delete()
    db.query(ApplicationReview).filter(
        ApplicationReview.application_id == application_id
    ).delete()
    db.commit()
    return {"message": "Application reviews cleared"}
