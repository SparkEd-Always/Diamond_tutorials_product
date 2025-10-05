from fastapi import APIRouter
from .auth import router as auth_router
from .admissions import router as admissions_router
from .documents import router as documents_router
from .tests_interviews import router as tests_interviews_router

api_router = APIRouter()

# Include all routers
api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(admissions_router, prefix="/admissions", tags=["Admissions"])
api_router.include_router(documents_router, prefix="/documents", tags=["Documents"])
api_router.include_router(tests_interviews_router, prefix="/admissions", tags=["Tests & Interviews"])

__all__ = ["api_router"]
