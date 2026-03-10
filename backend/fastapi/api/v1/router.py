from fastapi import APIRouter
from api.v1.auth import router as auth_router
from api.v1.endpoints.admins import router as admin_router
from api.v1.endpoints.storage import router as storage_router
from api.v1.endpoints.users import router as users_router
from api.v1.endpoints.posts import router as posts_router
from api.v1.endpoints.reports import router as reports_router
from api.v1.endpoints.courses import router as courses_router
from api.v1.endpoints.tags import router as tags_router
from api.v1.endpoints.search import router as search_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["authentication"])
api_router.include_router(admin_router, prefix="/admins", tags=["admins"])
api_router.include_router(storage_router, prefix="/storage", tags=["storage"])
api_router.include_router(users_router, prefix="/users", tags=["users"])
api_router.include_router(posts_router, prefix="/posts", tags=["posts"])
api_router.include_router(reports_router, prefix="/reports", tags=["reports"])
api_router.include_router(courses_router, prefix="/courses", tags=["courses"])
api_router.include_router(tags_router, prefix="/tags", tags=["tags"])
api_router.include_router(search_router, prefix="/search", tags=["search"])
