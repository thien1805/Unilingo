"""
User & Profile API routes
"""
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.api.deps import get_current_user
from app.models.user import User, DailyStreak
from app.models.practice import TestAttempt
from app.models.vocabulary import VocabularyNote
from app.schemas.user import (
    UserProfileResponse, UpdateProfileRequest, DashboardResponse,
    TodayStats, BandTrendPoint, SkillBreakdown, VocabularyStats,
    ChangePasswordRequest,
)

from datetime import date, timedelta

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserProfileResponse)
async def get_my_profile(current_user: User = Depends(get_current_user)):
    """Get current user's profile."""
    return current_user


@router.patch("/me", response_model=UserProfileResponse)
async def update_my_profile(
    request: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update current user's profile."""
    update_data = request.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)
    await db.flush()
    await db.refresh(current_user)
    return current_user


@router.put("/me/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Upload user avatar."""
    # TODO: Upload to S3/MinIO and update avatar_url
    # For now, return a placeholder
    current_user.avatar_url = f"/avatars/{current_user.id}/{file.filename}"
    await db.flush()
    return {"avatar_url": current_user.avatar_url}


@router.get("/me/dashboard", response_model=DashboardResponse)
async def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get user's learning dashboard data."""
    today = date.today()

    # Today's stats
    today_streak = await db.execute(
        select(DailyStreak).where(
            DailyStreak.user_id == current_user.id,
            DailyStreak.streak_date == today,
        )
    )
    today_record = today_streak.scalar_one_or_none()

    today_stats = TodayStats(
        tests_completed=today_record.tests_completed if today_record else 0,
        xp_earned=today_record.xp_earned if today_record else 0,
        words_learned=today_record.words_learned if today_record else 0,
        study_minutes=today_record.study_minutes if today_record else 0,
    )

    # Weekly band score trend (last 7 days)
    week_ago = today - timedelta(days=7)
    trend_result = await db.execute(
        select(
            func.date(TestAttempt.completed_at).label("day"),
            func.avg(TestAttempt.overall_band).label("avg_band"),
        )
        .where(
            TestAttempt.user_id == current_user.id,
            TestAttempt.status == "completed",
            TestAttempt.completed_at >= week_ago,
        )
        .group_by(func.date(TestAttempt.completed_at))
        .order_by(func.date(TestAttempt.completed_at))
    )
    weekly_trend = [
        BandTrendPoint(date=str(row.day), band_score=round(row.avg_band, 1))
        for row in trend_result.all()
    ]

    # Skill breakdown (average of all completed tests)
    skill_result = await db.execute(
        select(
            func.avg(TestAttempt.fluency_score),
            func.avg(TestAttempt.lexical_score),
            func.avg(TestAttempt.grammar_score),
            func.avg(TestAttempt.pronunciation_score),
        ).where(
            TestAttempt.user_id == current_user.id,
            TestAttempt.status == "completed",
        )
    )
    skill_row = skill_result.one()
    skill_breakdown = SkillBreakdown(
        fluency=round(skill_row[0] or 0, 1),
        lexical=round(skill_row[1] or 0, 1),
        grammar=round(skill_row[2] or 0, 1),
        pronunciation=round(skill_row[3] or 0, 1),
    )

    # Vocabulary stats
    vocab_result = await db.execute(
        select(
            func.count(VocabularyNote.id).label("total"),
            func.count(VocabularyNote.id).filter(VocabularyNote.mastery_level == "mastered").label("mastered"),
            func.count(VocabularyNote.id).filter(VocabularyNote.mastery_level == "learning").label("learning"),
            func.count(VocabularyNote.id).filter(VocabularyNote.mastery_level == "new").label("new_words"),
        ).where(VocabularyNote.user_id == current_user.id)
    )
    vocab_row = vocab_result.one()
    vocab_stats = VocabularyStats(
        total=vocab_row.total,
        mastered=vocab_row.mastered,
        learning=vocab_row.learning,
        new=vocab_row.new_words,
    )

    # Total stats
    total_result = await db.execute(
        select(
            func.count(TestAttempt.id),
            func.coalesce(func.sum(TestAttempt.duration_seconds), 0),
        ).where(
            TestAttempt.user_id == current_user.id,
            TestAttempt.status == "completed",
        )
    )
    total_row = total_result.one()
    total_tests = total_row[0]
    total_hours = round(total_row[1] / 3600, 1) if total_row[1] else 0.0

    return DashboardResponse(
        user=current_user,
        today_stats=today_stats,
        weekly_band_trend=weekly_trend,
        skill_breakdown=skill_breakdown,
        vocabulary_stats=vocab_stats,
        total_practice_hours=total_hours,
        total_tests=total_tests,
    )


@router.get("/me/streaks")
async def get_streak_info(
    current_user: User = Depends(get_current_user),
):
    """Get current streak information."""
    return {
        "current_streak": current_user.current_streak,
        "longest_streak": current_user.longest_streak,
        "total_xp": current_user.total_xp,
    }


@router.post("/me/change-password")
async def change_password(
    request: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Change user's password (requires current password)."""
    from app.services.auth_service import verify_password, hash_password

    if not current_user.hashed_password:
        raise HTTPException(
            status_code=400,
            detail="Cannot change password for social login accounts"
        )

    if not verify_password(request.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    current_user.hashed_password = hash_password(request.new_password)
    await db.flush()
    return {"message": "Password changed successfully"}
