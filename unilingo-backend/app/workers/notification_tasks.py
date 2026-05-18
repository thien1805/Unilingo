"""
Celery tasks for notifications.
"""
import asyncio
from datetime import date, datetime, timezone
from sqlalchemy import func, select

from app.database import AsyncSessionLocal
from app.models.leaderboard import LeaderboardCache
from app.models.practice import TestAttempt
from app.models.user import DailyStreak, NotificationSetting, User
from app.models.vocabulary import VocabularyNote
from app.services.notification_service import dispatch_notification_campaign
from app.workers.celery_app import celery_app


@celery_app.task
def send_daily_vocabulary_reminders():
    """Send push notifications to users who have vocabulary due for review."""
    return asyncio.run(_send_daily_vocabulary_reminders())


@celery_app.task
def send_streak_alerts():
    """Send push notifications to users who haven't practiced today (streak at risk)."""
    return asyncio.run(_send_streak_alerts())


@celery_app.task
def update_leaderboard_cache():
    """Update the leaderboard cache in Redis and database."""
    return asyncio.run(_update_leaderboard_cache())


async def _send_daily_vocabulary_reminders():
    now = datetime.now(timezone.utc)
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(User.id, func.count(VocabularyNote.id).label("due_count"))
            .join(VocabularyNote, VocabularyNote.user_id == User.id)
            .outerjoin(NotificationSetting, NotificationSetting.user_id == User.id)
            .where(
                User.is_active == True,
                VocabularyNote.mastery_level.in_(["new", "learning", "reviewing"]),
                (VocabularyNote.next_review_at <= now) | (VocabularyNote.next_review_at == None),
                (NotificationSetting.id == None) | (NotificationSetting.new_words_reminder == True),
            )
            .group_by(User.id)
        )
        rows = result.all()
        user_ids = [row.id for row in rows]
        total_due = sum(int(row.due_count or 0) for row in rows)

        if not user_ids:
            return {"sent": 0, "reason": "no_due_vocabulary"}

        dispatch = await dispatch_notification_campaign(
            db=db,
            title="Vocabulary review is ready",
            body=f"You have {total_due} saved words waiting for review.",
            notification_type="vocabulary",
            category="system",
            audience="selected",
            user_ids=user_ids,
            data={"route": "vocabulary/review", "due_count": total_due},
            respect_user_preferences=True,
        )
        await db.commit()
        return {
            "campaign_id": str(dispatch["campaign"].id),
            "recipients": dispatch["total_recipients"],
            "push_sent": dispatch["push_sent"],
            "status": dispatch["status"],
        }


async def _send_streak_alerts():
    today = date.today()
    async with AsyncSessionLocal() as db:
        active_today = select(DailyStreak.user_id).where(DailyStreak.streak_date == today)
        result = await db.execute(
            select(User.id)
            .outerjoin(NotificationSetting, NotificationSetting.user_id == User.id)
            .where(
                User.is_active == True,
                User.current_streak > 0,
                ~User.id.in_(active_today),
                (NotificationSetting.id == None) | (NotificationSetting.streak_reminder == True),
            )
        )
        user_ids = [row[0] for row in result.all()]

        if not user_ids:
            return {"sent": 0, "reason": "no_streaks_at_risk"}

        dispatch = await dispatch_notification_campaign(
            db=db,
            title="Your streak is waiting",
            body="Complete one short speaking practice today to keep your streak alive.",
            notification_type="streak",
            category="system",
            audience="selected",
            user_ids=user_ids,
            data={"route": "practice"},
            respect_user_preferences=True,
        )
        await db.commit()
        return {
            "campaign_id": str(dispatch["campaign"].id),
            "recipients": dispatch["total_recipients"],
            "push_sent": dispatch["push_sent"],
            "status": dispatch["status"],
        }


async def _update_leaderboard_cache():
    async with AsyncSessionLocal() as db:
        rows = await _leaderboard_rows(db)
        for rank, row in enumerate(rows, 1):
            existing = await db.execute(
                select(LeaderboardCache).where(
                    LeaderboardCache.user_id == row.id,
                    LeaderboardCache.period_type == "all_time",
                    LeaderboardCache.period_value == "all",
                )
            )
            cache = existing.scalar_one_or_none()
            if not cache:
                cache = LeaderboardCache(
                    user_id=row.id,
                    period_type="all_time",
                    period_value="all",
                )
                db.add(cache)

            cache.avg_band_score = round(float(row.avg_band or 0), 1)
            cache.total_tests = int(row.total_tests or 0)
            cache.total_xp = int(row.total_xp or 0)
            cache.rank = rank

        await db.commit()
        return {"updated": len(rows), "period": "all_time"}


async def _leaderboard_rows(db):
    result = await db.execute(
        select(
            User.id,
            User.total_xp,
            func.count(TestAttempt.id).label("total_tests"),
            func.coalesce(func.avg(TestAttempt.overall_band), 0).label("avg_band"),
        )
        .outerjoin(TestAttempt, (TestAttempt.user_id == User.id) & (TestAttempt.status == "completed"))
        .where(User.is_active == True)
        .group_by(User.id)
        .order_by(User.total_xp.desc())
    )
    return result.all()
