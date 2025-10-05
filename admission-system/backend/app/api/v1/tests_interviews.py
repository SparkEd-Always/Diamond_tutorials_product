from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date
from ...core.database import get_db
from ...core.security import get_current_user, require_role
from ...models.user import User
from ...models.admission import (
    AdmissionApplication,
    AdmissionTest,
    TestStatus,
    Interview,
    InterviewStatus
)
from ...schemas.admission import (
    TestSchedule,
    TestResult,
    InterviewSchedule,
    InterviewFeedback
)

router = APIRouter()

# ============================================================================
# Admission Tests
# ============================================================================

@router.post("/tests/schedule", response_model=dict, status_code=status.HTTP_201_CREATED)
async def schedule_test(
    test_data: TestSchedule,
    current_user: User = Depends(require_role(["admin", "super_admin"])),
    db: Session = Depends(get_db)
):
    """
    Schedule an admission test for an application (Admin only)
    """
    # Get application
    application = db.query(AdmissionApplication).filter(
        AdmissionApplication.id == test_data.application_id
    ).first()

    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    # Create test record
    test = AdmissionTest(
        application_id=test_data.application_id,
        test_type=test_data.test_type,
        test_date=test_data.test_date,
        test_time=test_data.test_time,
        duration_minutes=test_data.duration_minutes,
        venue=test_data.venue,
        conducted_by=current_user.id,
        status=TestStatus.SCHEDULED
    )
    db.add(test)
    db.commit()
    db.refresh(test)

    # Update application status if needed
    from ...models.admission import ApplicationStatus
    if application.application_status == ApplicationStatus.UNDER_REVIEW:
        application.application_status = ApplicationStatus.TEST_SCHEDULED
        db.commit()

    return {
        "message": "Test scheduled successfully",
        "test": {
            "id": test.id,
            "application_number": application.application_number,
            "test_type": test.test_type,
            "test_date": test.test_date,
            "test_time": test.test_time,
            "venue": test.venue,
            "status": test.status.value
        }
    }

@router.get("/tests", response_model=List[dict])
async def list_tests(
    test_date: Optional[date] = Query(None),
    status: Optional[str] = Query(None),
    current_user: User = Depends(require_role(["admin", "super_admin", "teacher"])),
    db: Session = Depends(get_db)
):
    """
    List all scheduled tests (Admin/Teacher only)
    """
    query = db.query(AdmissionTest)

    # Apply filters
    if test_date:
        query = query.filter(AdmissionTest.test_date == test_date)
    if status:
        query = query.filter(AdmissionTest.status == status)

    tests = query.order_by(AdmissionTest.test_date.desc()).all()

    result = []
    for test in tests:
        application = db.query(AdmissionApplication).filter(
            AdmissionApplication.id == test.application_id
        ).first()

        result.append({
            "id": test.id,
            "application_number": application.application_number if application else None,
            "test_type": test.test_type,
            "test_date": test.test_date,
            "test_time": test.test_time,
            "venue": test.venue,
            "status": test.status.value,
            "score_obtained": float(test.score_obtained) if test.score_obtained else None,
            "max_score": float(test.max_score) if test.max_score else None,
            "grade": test.grade
        })

    return result

@router.get("/tests/{test_id}", response_model=dict)
async def get_test_details(
    test_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get test details
    """
    test = db.query(AdmissionTest).filter(AdmissionTest.id == test_id).first()

    if not test:
        raise HTTPException(status_code=404, detail="Test not found")

    application = db.query(AdmissionApplication).filter(
        AdmissionApplication.id == test.application_id
    ).first()

    return {
        "id": test.id,
        "application_id": test.application_id,
        "application_number": application.application_number if application else None,
        "test_type": test.test_type,
        "test_date": test.test_date,
        "test_time": test.test_time,
        "duration_minutes": test.duration_minutes,
        "venue": test.venue,
        "max_score": float(test.max_score) if test.max_score else None,
        "score_obtained": float(test.score_obtained) if test.score_obtained else None,
        "grade": test.grade,
        "remarks": test.remarks,
        "status": test.status.value
    }

@router.put("/tests/{test_id}/result", response_model=dict)
async def record_test_result(
    test_id: int,
    result: TestResult,
    current_user: User = Depends(require_role(["admin", "super_admin", "teacher"])),
    db: Session = Depends(get_db)
):
    """
    Record test results (Admin/Teacher only)
    """
    test = db.query(AdmissionTest).filter(AdmissionTest.id == test_id).first()

    if not test:
        raise HTTPException(status_code=404, detail="Test not found")

    # Update test result
    test.score_obtained = result.score_obtained
    test.grade = result.grade
    test.remarks = result.remarks
    test.status = TestStatus(result.status)

    db.commit()

    # Update application status
    from ...models.admission import ApplicationStatus
    application = db.query(AdmissionApplication).filter(
        AdmissionApplication.id == test.application_id
    ).first()

    if application and result.status == "completed":
        application.application_status = ApplicationStatus.TEST_COMPLETED
        db.commit()

    return {
        "message": "Test result recorded successfully",
        "test_id": test.id,
        "score_obtained": float(test.score_obtained),
        "grade": test.grade,
        "status": test.status.value
    }

# ============================================================================
# Interviews
# ============================================================================

@router.post("/interviews/schedule", response_model=dict, status_code=status.HTTP_201_CREATED)
async def schedule_interview(
    interview_data: InterviewSchedule,
    current_user: User = Depends(require_role(["admin", "super_admin"])),
    db: Session = Depends(get_db)
):
    """
    Schedule an interview for an application (Admin only)
    """
    # Get application
    application = db.query(AdmissionApplication).filter(
        AdmissionApplication.id == interview_data.application_id
    ).first()

    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    # Create interview record
    interview = Interview(
        application_id=interview_data.application_id,
        interview_date=interview_data.interview_date,
        interview_time=interview_data.interview_time,
        duration_minutes=interview_data.duration_minutes,
        venue=interview_data.venue,
        interviewer_id=current_user.id,
        status=InterviewStatus.SCHEDULED
    )
    db.add(interview)
    db.commit()
    db.refresh(interview)

    # Update application status
    from ...models.admission import ApplicationStatus
    if application.application_status == ApplicationStatus.TEST_COMPLETED:
        application.application_status = ApplicationStatus.INTERVIEW_SCHEDULED
        db.commit()

    return {
        "message": "Interview scheduled successfully",
        "interview": {
            "id": interview.id,
            "application_number": application.application_number,
            "interview_date": interview.interview_date,
            "interview_time": interview.interview_time,
            "venue": interview.venue,
            "status": interview.status.value
        }
    }

@router.get("/interviews", response_model=List[dict])
async def list_interviews(
    interview_date: Optional[date] = Query(None),
    status: Optional[str] = Query(None),
    current_user: User = Depends(require_role(["admin", "super_admin"])),
    db: Session = Depends(get_db)
):
    """
    List all scheduled interviews (Admin only)
    """
    query = db.query(Interview)

    # Apply filters
    if interview_date:
        query = query.filter(Interview.interview_date == interview_date)
    if status:
        query = query.filter(Interview.status == status)

    interviews = query.order_by(Interview.interview_date.desc()).all()

    result = []
    for interview in interviews:
        application = db.query(AdmissionApplication).filter(
            AdmissionApplication.id == interview.application_id
        ).first()

        result.append({
            "id": interview.id,
            "application_number": application.application_number if application else None,
            "interview_date": interview.interview_date,
            "interview_time": interview.interview_time,
            "venue": interview.venue,
            "status": interview.status.value,
            "rating": float(interview.rating) if interview.rating else None,
            "recommendation": interview.recommendation if interview.recommendation else None
        })

    return result

@router.get("/interviews/{interview_id}", response_model=dict)
async def get_interview_details(
    interview_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get interview details
    """
    interview = db.query(Interview).filter(Interview.id == interview_id).first()

    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    application = db.query(AdmissionApplication).filter(
        AdmissionApplication.id == interview.application_id
    ).first()

    return {
        "id": interview.id,
        "application_id": interview.application_id,
        "application_number": application.application_number if application else None,
        "interview_date": interview.interview_date,
        "interview_time": interview.interview_time,
        "duration_minutes": interview.duration_minutes,
        "venue": interview.venue,
        "rating": float(interview.rating) if interview.rating else None,
        "communication_skills": interview.communication_skills,
        "confidence_level": interview.confidence_level,
        "general_knowledge": interview.general_knowledge,
        "parent_interaction": interview.parent_interaction,
        "overall_impression": interview.overall_impression if interview.overall_impression else None,
        "feedback": interview.feedback,
        "recommendation": interview.recommendation if interview.recommendation else None,
        "status": interview.status.value
    }

@router.put("/interviews/{interview_id}/feedback", response_model=dict)
async def record_interview_feedback(
    interview_id: int,
    feedback: InterviewFeedback,
    current_user: User = Depends(require_role(["admin", "super_admin"])),
    db: Session = Depends(get_db)
):
    """
    Record interview feedback (Admin only)
    """
    interview = db.query(Interview).filter(Interview.id == interview_id).first()

    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    # Update interview feedback
    interview.rating = feedback.rating
    interview.communication_skills = feedback.communication_skills
    interview.confidence_level = feedback.confidence_level
    interview.general_knowledge = feedback.general_knowledge
    interview.parent_interaction = feedback.parent_interaction
    interview.overall_impression = feedback.overall_impression
    interview.feedback = feedback.feedback
    interview.recommendation = feedback.recommendation
    interview.status = InterviewStatus(feedback.status)

    db.commit()

    # Update application status
    from ...models.admission import ApplicationStatus
    application = db.query(AdmissionApplication).filter(
        AdmissionApplication.id == interview.application_id
    ).first()

    if application and feedback.status == "completed":
        application.application_status = ApplicationStatus.INTERVIEW_COMPLETED
        db.commit()

    return {
        "message": "Interview feedback recorded successfully",
        "interview_id": interview.id,
        "rating": float(interview.rating),
        "recommendation": interview.recommendation,
        "status": interview.status.value
    }
