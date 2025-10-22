from fastapi import APIRouter
import logging

logger = logging.getLogger(__name__)

# Import routers
try:
    from .auth import router as auth_router
    logger.info("✅ Successfully imported auth router")
except ImportError as e:
    logger.error(f"❌ Failed to import auth router: {e}")
    auth_router = APIRouter()

try:
    from .students import router as students_router
    logger.info("✅ Successfully imported students router")
except ImportError as e:
    logger.error(f"❌ Failed to import students router: {e}")
    students_router = APIRouter()

try:
    from .teachers import router as teachers_router
    logger.info("✅ Successfully imported teachers router")
except ImportError as e:
    logger.error(f"❌ Failed to import teachers router: {e}")
    teachers_router = APIRouter()

try:
    from .attendance import router as attendance_router
    logger.info("✅ Successfully imported attendance router")
except ImportError as e:
    logger.error(f"❌ Failed to import attendance router: {e}")
    attendance_router = APIRouter()

try:
    from .communications import router as communications_router
    logger.info("✅ Successfully imported communications router")
except ImportError as e:
    logger.error(f"❌ Failed to import communications router: {e}")
    communications_router = APIRouter()

try:
    from .notices import router as notices_router
    logger.info("✅ Successfully imported notices router")
except ImportError as e:
    logger.error(f"❌ Failed to import notices router: {e}")
    notices_router = APIRouter()

try:
    from .whatsapp import router as whatsapp_router
    logger.info("✅ Successfully imported whatsapp router")
except ImportError as e:
    logger.error(f"❌ Failed to import whatsapp router: {e}")
    whatsapp_router = APIRouter()

try:
    from .imports import router as imports_router
    logger.info("✅ Successfully imported imports router")
except ImportError as e:
    logger.error(f"❌ Failed to import imports router: {e}")
    imports_router = APIRouter()

try:
    from .activities import router as activities_router
    logger.info("✅ Successfully imported activities router")
except ImportError as e:
    logger.error(f"❌ Failed to import activities router: {e}")
    activities_router = APIRouter()

try:
    from .teacher_attendance import router as teacher_attendance_router
    logger.info("✅ Successfully imported teacher_attendance router")
except ImportError as e:
    logger.error(f"❌ Failed to import teacher_attendance router: {e}")
    teacher_attendance_router = APIRouter()

try:
    from .auth_mobile import router as auth_mobile_router
    logger.info("✅ Successfully imported auth_mobile router")
except ImportError as e:
    logger.error(f"❌ Failed to import auth_mobile router: {e}")
    auth_mobile_router = APIRouter()

try:
    from .messages import router as messages_router
    logger.info("✅ Successfully imported messages router")
except ImportError as e:
    logger.error(f"❌ Failed to import messages router: {e}")
    messages_router = APIRouter()

api_router = APIRouter()

# Include routers
api_router.include_router(auth_router, prefix="/auth", tags=["authentication"])
api_router.include_router(auth_mobile_router, prefix="/mobile/auth", tags=["mobile-auth"])
api_router.include_router(messages_router, prefix="/messages", tags=["messages"])
api_router.include_router(students_router, prefix="/students", tags=["students"])
api_router.include_router(teachers_router, prefix="/teachers", tags=["teachers"])
api_router.include_router(attendance_router, prefix="/attendance", tags=["attendance"])
api_router.include_router(teacher_attendance_router, prefix="/teacher-attendance", tags=["teacher-attendance"])
api_router.include_router(communications_router, prefix="/communications", tags=["communications"])
api_router.include_router(notices_router, prefix="/notices", tags=["notices"])
api_router.include_router(whatsapp_router, prefix="/whatsapp", tags=["whatsapp"])
api_router.include_router(imports_router, prefix="/import", tags=["import"])
api_router.include_router(activities_router, prefix="/activities", tags=["activities"])