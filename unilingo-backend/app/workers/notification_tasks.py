"""
Celery tasks for notifications.
"""
from app.workers.celery_app import celery_app


@celery_app.task
def send_daily_vocabulary_reminders():
    """Send push notifications to users who have vocabulary due for review."""
    # TODO: Implement
    # 1. Query users with notification_setting.new_words_reminder=True
    # 2. Check if they have vocabulary due for review
    # 3. Send FCM notification via firebase_admin.messaging
    print("📖 Sending daily vocabulary reminders...")


@celery_app.task
def send_streak_alerts():
    """Send push notifications to users who haven't practiced today (streak at risk)."""
    # TODO: Implement
    # 1. Query users with active streaks who haven't practiced today
    # 2. Send FCM notification
    print("🔥 Sending streak alerts...")


@celery_app.task
def update_leaderboard_cache():
    """Update the leaderboard cache in Redis and database."""
    # TODO: Implement
    # 1. Calculate rankings from test_attempts
    # 2. Update Redis Sorted Sets
    # 3. Update leaderboard_cache table
    print("🏆 Updating leaderboard cache...")
