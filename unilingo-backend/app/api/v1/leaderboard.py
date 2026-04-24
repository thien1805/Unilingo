"""
Leaderboard API routes
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.practice import TestAttempt
from app.schemas.leaderboard import LeaderboardResponse, LeaderboardEntry

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])


@router.get("", response_model=LeaderboardResponse)
async def get_leaderboard(
    period: str = Query(default="weekly", pattern=r"^(weekly|monthly|all_time)$"),
    limit: int = Query(default=50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get leaderboard rankings.
    
    In production, this should read from Redis Sorted Sets for performance.
    This implementation queries the database directly as a fallback.
    """
    # TODO: Replace with Redis ZREVRANGE for production
    # For now, compute from database

    # Get users ranked by total XP
    query = (
        select(
            User.id,
            User.username,
            User.full_name,
            User.avatar_url,
            User.total_xp,
            func.count(TestAttempt.id).label("total_tests"),
            func.coalesce(func.avg(TestAttempt.overall_band), 0).label("avg_band"),
        )
        .outerjoin(TestAttempt, (TestAttempt.user_id == User.id) & (TestAttempt.status == "completed"))
        .where(User.is_active == True)
        .group_by(User.id)
        .order_by(desc(User.total_xp))
        .limit(limit)
    )

    result = await db.execute(query)
    rows = result.all()

    entries = []
    for rank, row in enumerate(rows, 1):
        entries.append(LeaderboardEntry(
            rank=rank,
            user_id=row.id,
            username=row.username,
            full_name=row.full_name,
            avatar_url=row.avatar_url,
            avg_band_score=round(float(row.avg_band), 1),
            total_tests=row.total_tests,
            total_xp=row.total_xp,
        ))

    # Find current user's rank
    my_rank = None
    for entry in entries:
        if entry.user_id == current_user.id:
            my_rank = entry
            break

    if not my_rank:
        # User not in top N, calculate their rank
        rank_result = await db.execute(
            select(func.count(User.id)).where(
                User.is_active == True,
                User.total_xp > current_user.total_xp,
            )
        )
        user_rank = (rank_result.scalar() or 0) + 1

        total_tests_result = await db.execute(
            select(func.count(TestAttempt.id)).where(
                TestAttempt.user_id == current_user.id,
                TestAttempt.status == "completed",
            )
        )
        avg_band_result = await db.execute(
            select(func.avg(TestAttempt.overall_band)).where(
                TestAttempt.user_id == current_user.id,
                TestAttempt.status == "completed",
            )
        )

        my_rank = LeaderboardEntry(
            rank=user_rank,
            user_id=current_user.id,
            username=current_user.username,
            full_name=current_user.full_name,
            avatar_url=current_user.avatar_url,
            avg_band_score=round(float(avg_band_result.scalar() or 0), 1),
            total_tests=total_tests_result.scalar() or 0,
            total_xp=current_user.total_xp,
        )

    return LeaderboardResponse(period=period, entries=entries, my_rank=my_rank)


@router.get("/me")
async def get_my_rank(
    period: str = Query(default="weekly", pattern=r"^(weekly|monthly|all_time)$"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get current user's ranking."""
    rank_result = await db.execute(
        select(func.count(User.id)).where(
            User.is_active == True,
            User.total_xp > current_user.total_xp,
        )
    )
    rank = (rank_result.scalar() or 0) + 1

    return {
        "rank": rank,
        "total_xp": current_user.total_xp,
        "current_streak": current_user.current_streak,
    }
