"""
Celery application configuration.
"""
from celery import Celery
from celery.schedules import crontab
from app.config import get_settings

settings = get_settings()

celery_app = Celery(
    "unilingo",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=[
        "app.workers.scoring_tasks",
        "app.workers.notification_tasks",
    ],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,  # 5 minutes max per task
    task_soft_time_limit=240,
)

# Scheduled tasks
celery_app.conf.beat_schedule = {
    # Daily vocabulary review reminder at 9 AM UTC
    "daily-vocab-reminder": {
        "task": "app.workers.notification_tasks.send_daily_vocabulary_reminders",
        "schedule": crontab(hour=9, minute=0),
    },
    # Streak alert at 6 PM UTC for users who haven't practiced
    "streak-alert": {
        "task": "app.workers.notification_tasks.send_streak_alerts",
        "schedule": crontab(hour=18, minute=0),
    },
    # Update leaderboard cache every hour
    "update-leaderboard": {
        "task": "app.workers.notification_tasks.update_leaderboard_cache",
        "schedule": crontab(minute=0),  # Every hour
    },
}
