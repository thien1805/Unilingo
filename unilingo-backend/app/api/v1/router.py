"""
V1 API Router - combines all route modules
"""
from fastapi import APIRouter
from app.api.v1 import auth, users, topics, practice, vocabulary, flashcards, leaderboard, notifications, admin, blog, forecast

router = APIRouter(prefix="/api/v1")

router.include_router(auth.router)
router.include_router(users.router)
router.include_router(topics.router)
router.include_router(practice.router)
router.include_router(vocabulary.router)
router.include_router(flashcards.router)
router.include_router(leaderboard.router)
router.include_router(notifications.router)
router.include_router(blog.router)
router.include_router(forecast.router)
router.include_router(admin.router)
