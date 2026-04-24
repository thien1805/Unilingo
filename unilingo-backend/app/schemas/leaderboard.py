"""
Pydantic schemas for Leaderboard & Notifications
"""
import uuid
from datetime import time
from pydantic import BaseModel


# ─── Leaderboard ───

class LeaderboardEntry(BaseModel):
    rank: int
    user_id: uuid.UUID
    username: str | None
    full_name: str
    avatar_url: str | None
    avg_band_score: float
    total_tests: int
    total_xp: int

    model_config = {"from_attributes": True}


class LeaderboardResponse(BaseModel):
    period: str  # "weekly", "monthly", "all_time"
    entries: list[LeaderboardEntry]
    my_rank: LeaderboardEntry | None


# ─── Notifications ───

class NotificationSettingsResponse(BaseModel):
    daily_reminder: bool
    reminder_time: time
    new_words_reminder: bool
    streak_reminder: bool
    leaderboard_update: bool

    model_config = {"from_attributes": True}


class UpdateNotificationSettingsRequest(BaseModel):
    daily_reminder: bool | None = None
    reminder_time: time | None = None
    new_words_reminder: bool | None = None
    streak_reminder: bool | None = None
    leaderboard_update: bool | None = None


class RegisterDeviceRequest(BaseModel):
    fcm_token: str
    device_type: str  # "ios" or "android"
    device_name: str | None = None


class NotificationItem(BaseModel):
    id: uuid.UUID
    title: str
    body: str
    type: str
    data: dict | None
    is_read: bool
    created_at: str
