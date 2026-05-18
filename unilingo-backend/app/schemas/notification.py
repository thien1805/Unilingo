"""
Pydantic schemas for notification preferences, inbox, and admin campaigns.
"""
import uuid
from datetime import datetime, time
from typing import Literal
from pydantic import BaseModel, Field


NotificationType = Literal[
    "event", "blog", "forecast", "tips", "news",
    "daily_reminder", "vocabulary", "streak", "leaderboard", "system",
]

NotificationCategory = Literal["event", "forecast", "tips", "news", "system"]


class NotificationSettingsResponse(BaseModel):
    daily_reminder: bool
    reminder_time: time
    new_words_reminder: bool
    streak_reminder: bool
    leaderboard_update: bool
    event_notifications: bool
    blog_notifications: bool
    forecast_notifications: bool
    tips_notifications: bool
    news_notifications: bool

    model_config = {"from_attributes": True}


class UpdateNotificationSettingsRequest(BaseModel):
    daily_reminder: bool | None = None
    reminder_time: time | None = None
    new_words_reminder: bool | None = None
    streak_reminder: bool | None = None
    leaderboard_update: bool | None = None
    event_notifications: bool | None = None
    blog_notifications: bool | None = None
    forecast_notifications: bool | None = None
    tips_notifications: bool | None = None
    news_notifications: bool | None = None


class RegisterDeviceRequest(BaseModel):
    fcm_token: str = Field(..., min_length=10, max_length=1000)
    device_type: Literal["ios", "android", "web"]
    device_name: str | None = Field(None, max_length=100)


class UserNotificationResponse(BaseModel):
    id: uuid.UUID
    campaign_id: uuid.UUID | None
    title: str
    body: str
    notification_type: str
    category: str | None
    data: dict | None
    is_read: bool
    read_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}


class NotificationListResponse(BaseModel):
    items: list[UserNotificationResponse]
    total: int
    unread: int
    page: int
    per_page: int


class UnreadCountResponse(BaseModel):
    unread: int


class AdminSendNotificationRequest(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    body: str = Field(..., min_length=2, max_length=2000)
    notification_type: NotificationType = "event"
    category: NotificationCategory | None = None
    audience: Literal["all", "active", "selected"] = "active"
    user_ids: list[uuid.UUID] | None = None
    data: dict | None = None
    respect_user_preferences: bool = True


class AdminSendNotificationResponse(BaseModel):
    campaign_id: uuid.UUID
    total_recipients: int
    stored_notifications: int
    push_sent: int
    push_failed: int
    push_skipped: bool
    status: str


class NotificationCampaignResponse(BaseModel):
    id: uuid.UUID
    title: str
    body: str
    notification_type: str
    category: str | None
    audience: str
    data: dict | None
    total_recipients: int
    sent_count: int
    failed_count: int
    status: str
    created_at: datetime
    sent_at: datetime | None

    model_config = {"from_attributes": True}
