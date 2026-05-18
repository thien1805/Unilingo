"""
Helpers for sending push notifications through Firebase Admin SDK.
"""
import uuid
from typing import Any
from datetime import datetime, timezone
from sqlalchemy import and_, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import NotificationCampaign, UserNotification
from app.models.user import NotificationSetting, User, UserDevice


def _stringify_data(data: dict[str, Any] | None) -> dict[str, str]:
    if not data:
        return {}
    return {str(key): "" if value is None else str(value) for key, value in data.items()}


def send_push_to_tokens(
    tokens: list[str],
    title: str,
    body: str,
    data: dict[str, Any] | None = None,
) -> dict[str, int | bool | str | None]:
    """Send a multicast Firebase push notification.

    The API still stores in-app notifications when Firebase is not configured.
    This keeps admin messaging useful in local/dev environments.
    """
    cleaned_tokens = sorted({token for token in tokens if token})
    if not cleaned_tokens:
        return {"sent": 0, "failed": 0, "skipped": True, "reason": "no_tokens"}

    try:
        import firebase_admin
        from firebase_admin import messaging
    except Exception as exc:
        return {"sent": 0, "failed": 0, "skipped": True, "reason": str(exc)}

    if not getattr(firebase_admin, "_apps", None):
        return {"sent": 0, "failed": 0, "skipped": True, "reason": "firebase_not_initialized"}

    try:
        message = messaging.MulticastMessage(
            tokens=cleaned_tokens,
            notification=messaging.Notification(title=title, body=body),
            data=_stringify_data(data),
        )
        response = messaging.send_each_for_multicast(message)
        return {
            "sent": response.success_count,
            "failed": response.failure_count,
            "skipped": False,
            "reason": None,
        }
    except Exception as exc:
        return {"sent": 0, "failed": len(cleaned_tokens), "skipped": False, "reason": str(exc)}


def preference_conditions(notification_type: str, category: str | None):
    """Build opt-in filters for a notification type/category."""
    setting_fields: list[str] = []
    if notification_type == "event" or category == "event":
        setting_fields.append("event_notifications")
    elif category == "forecast" or notification_type == "forecast":
        setting_fields.extend(["blog_notifications", "forecast_notifications"])
    elif category == "tips" or notification_type == "tips":
        setting_fields.extend(["blog_notifications", "tips_notifications"])
    elif category == "news" or notification_type == "news":
        setting_fields.extend(["blog_notifications", "news_notifications"])
    elif notification_type == "blog":
        setting_fields.append("blog_notifications")
    elif notification_type == "daily_reminder":
        setting_fields.append("daily_reminder")
    elif notification_type == "vocabulary":
        setting_fields.append("new_words_reminder")
    elif notification_type == "streak":
        setting_fields.append("streak_reminder")
    elif notification_type == "leaderboard":
        setting_fields.append("leaderboard_update")

    return [
        or_(NotificationSetting.id.is_(None), getattr(NotificationSetting, field) == True)
        for field in setting_fields
    ]


async def dispatch_notification_campaign(
    db: AsyncSession,
    title: str,
    body: str,
    notification_type: str,
    category: str | None = None,
    audience: str = "active",
    user_ids: list[uuid.UUID] | None = None,
    data: dict[str, Any] | None = None,
    respect_user_preferences: bool = True,
    created_by_id: uuid.UUID | None = None,
) -> dict[str, Any]:
    """Store in-app notifications and send push for one campaign."""
    users_query = select(User).outerjoin(
        NotificationSetting, NotificationSetting.user_id == User.id
    )

    if audience == "active":
        users_query = users_query.where(User.is_active == True)
    elif audience == "selected":
        if not user_ids:
            raise ValueError("user_ids is required when audience is selected")
        users_query = users_query.where(User.id.in_(user_ids))

    if respect_user_preferences:
        conditions = preference_conditions(notification_type, category)
        if conditions:
            users_query = users_query.where(and_(*conditions))

    user_result = await db.execute(users_query)
    target_users = user_result.scalars().unique().all()

    campaign = NotificationCampaign(
        title=title,
        body=body,
        notification_type=notification_type,
        category=category,
        audience=audience,
        data=data,
        created_by_id=created_by_id,
        total_recipients=len(target_users),
        status="sending",
    )
    db.add(campaign)
    await db.flush()

    notifications = [
        UserNotification(
            user_id=user.id,
            campaign_id=campaign.id,
            title=title,
            body=body,
            notification_type=notification_type,
            category=category,
            data=data,
        )
        for user in target_users
    ]
    if notifications:
        db.add_all(notifications)
        await db.flush()

    tokens: list[str] = []
    target_user_ids = [user.id for user in target_users]
    if target_user_ids:
        token_result = await db.execute(
            select(UserDevice.fcm_token).where(UserDevice.user_id.in_(target_user_ids))
        )
        tokens = [row[0] for row in token_result.all()]

    push_result = send_push_to_tokens(
        tokens=tokens,
        title=title,
        body=body,
        data={
            **(data or {}),
            "notification_type": notification_type,
            "category": category or "",
            "campaign_id": str(campaign.id),
        },
    )

    push_sent = int(push_result.get("sent") or 0)
    push_failed = int(push_result.get("failed") or 0)
    campaign.sent_count = len(notifications)
    campaign.failed_count = push_failed
    if push_result.get("skipped"):
        campaign.status = "stored"
    elif push_failed and push_sent:
        campaign.status = "partial"
    elif push_failed and not push_sent:
        campaign.status = "failed"
    else:
        campaign.status = "sent"
    campaign.sent_at = datetime.now(timezone.utc)
    await db.flush()

    return {
        "campaign": campaign,
        "total_recipients": len(target_users),
        "stored_notifications": len(notifications),
        "push_sent": push_sent,
        "push_failed": push_failed,
        "push_skipped": bool(push_result.get("skipped")),
        "status": campaign.status,
        "push_reason": push_result.get("reason"),
    }
