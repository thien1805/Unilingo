"""
Pydantic schemas for User and Profile
"""
import uuid
from datetime import date, datetime
from pydantic import BaseModel, EmailStr, Field


class UserProfileResponse(BaseModel):
    id: uuid.UUID
    email: EmailStr
    username: str | None
    full_name: str
    avatar_url: str | None
    auth_provider: str
    target_band_score: float | None
    target_exam_date: date | None
    current_level: str | None
    total_xp: int
    current_streak: int
    longest_streak: int
    created_at: datetime

    model_config = {"from_attributes": True}


class UpdateProfileRequest(BaseModel):
    full_name: str | None = Field(None, min_length=2, max_length=255)
    username: str | None = Field(None, min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_]+$")
    target_band_score: float | None = Field(None, ge=1.0, le=9.0)
    target_exam_date: date | None = None
    current_level: str | None = None


class UserPublicProfile(BaseModel):
    id: uuid.UUID
    username: str | None
    full_name: str
    avatar_url: str | None
    total_xp: int
    current_streak: int

    model_config = {"from_attributes": True}


class DashboardResponse(BaseModel):
    user: UserProfileResponse
    today_stats: "TodayStats"
    weekly_band_trend: list["BandTrendPoint"]
    skill_breakdown: "SkillBreakdown"
    vocabulary_stats: "VocabularyStats"
    total_practice_hours: float
    total_tests: int


class TodayStats(BaseModel):
    tests_completed: int = 0
    xp_earned: int = 0
    words_learned: int = 0
    study_minutes: int = 0
    daily_goal_met: bool = False


class BandTrendPoint(BaseModel):
    date: str
    band_score: float


class SkillBreakdown(BaseModel):
    fluency: float = 0.0
    lexical: float = 0.0
    grammar: float = 0.0
    pronunciation: float = 0.0


class VocabularyStats(BaseModel):
    total: int = 0
    mastered: int = 0
    learning: int = 0
    new: int = 0


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=128)
