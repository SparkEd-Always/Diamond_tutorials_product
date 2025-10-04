from fastapi import APIRouter

# Import routers
try:
    from .auth import router as auth_router
except ImportError:
    auth_router = APIRouter()

try:
    from .students import router as students_router
except ImportError:
    students_router = APIRouter()

try:
    from .teachers import router as teachers_router
except ImportError:
    teachers_router = APIRouter()

try:
    from .attendance import router as attendance_router
except ImportError:
    attendance_router = APIRouter()

try:
    from .communications import router as communications_router
except ImportError:
    communications_router = APIRouter()

try:
    from .notices import router as notices_router
except ImportError:
    notices_router = APIRouter()

try:
    from .whatsapp import router as whatsapp_router
except ImportError:
    whatsapp_router = APIRouter()

try:
    from .imports import router as imports_router
except ImportError:
    imports_router = APIRouter()

try:
    from .activities import router as activities_router
except ImportError:
    activities_router = APIRouter()

try:
    from .teacher_attendance import router as teacher_attendance_router
except ImportError:
    teacher_attendance_router = APIRouter()

api_router = APIRouter()

# Include routers
api_router.include_router(auth_router, prefix="/auth", tags=["authentication"])
api_router.include_router(students_router, prefix="/students", tags=["students"])
api_router.include_router(teachers_router, prefix="/teachers", tags=["teachers"])
api_router.include_router(attendance_router, prefix="/attendance", tags=["attendance"])
api_router.include_router(teacher_attendance_router, prefix="/teacher-attendance", tags=["teacher-attendance"])
api_router.include_router(communications_router, prefix="/communications", tags=["communications"])
api_router.include_router(notices_router, prefix="/notices", tags=["notices"])
api_router.include_router(whatsapp_router, prefix="/whatsapp", tags=["whatsapp"])
api_router.include_router(imports_router, prefix="/import", tags=["import"])
api_router.include_router(activities_router, prefix="/activities", tags=["activities"])