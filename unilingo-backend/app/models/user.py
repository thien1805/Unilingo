"""
User-related models: User, UserDevice, NotificationSetting, DailyStreak
"""
import uuid
from datetime import datetime, date, time
from sqlalchemy import (
    String, Boolean, Float, Integer, Date, Time,
    DateTime, ForeignKey, Text, func
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    username: Mapped[str | None] = mapped_column(String(50), unique=True, nullable=True, index=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    hashed_password: Mapped[str | None] = mapped_column(String(255), nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    auth_provider: Mapped[str] = mapped_column(String(20), default="email")  # email, google, apple
    firebase_uid: Mapped[str | None] = mapped_column(String(128), unique=True, nullable=True, index=True)
    target_band_score: Mapped[float | None] = mapped_column(Float, nullable=True, default=7.0)
    target_exam_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    current_level: Mapped[str | None] = mapped_column(String(20), nullable=True, default="intermediate")
    total_xp: Mapped[int] = mapped_column(Integer, default=0)
    current_streak: Mapped[int] = mapped_column(Integer, default=0)
    longest_streak: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    devices: Mapped[list["UserDevice"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    notification_setting: Mapped["NotificationSetting | None"] = relationship(
        back_populates="user", cascade="all, delete-orphan", uselist=False
    )
    daily_streaks: Mapped[list["DailyStreak"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    test_attempts: Mapped[list["TestAttempt"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    vocabulary_notes: Mapped[list["VocabularyNote"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    flashcard_decks: Mapped[list["FlashcardDeck"]] = relationship(back_populates="user", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<User {self.email}>"


class UserDevice(Base):
    __tablename__ = "user_devices"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    fcm_token: Mapped[str] = mapped_column(String(500), unique=True, nullable=False)
    device_type: Mapped[str] = mapped_column(String(20), nullable=False)  # ios, android
    device_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    last_active_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    user: Mapped["User"] = relationship(back_populates="devices")

    def __repr__(self) -> str:
        return f"<UserDevice {self.device_type} for user={self.user_id}>"


class NotificationSetting(Base):
    __tablename__ = "notification_settings"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    daily_reminder: Mapped[bool] = mapped_column(Boolean, default=True)
    reminder_time: Mapped[time] = mapped_column(Time, default=time(9, 0))  # 9:00 AM default
    new_words_reminder: Mapped[bool] = mapped_column(Boolean, default=True)
    streak_reminder: Mapped[bool] = mapped_column(Boolean, default=True)
    leaderboard_update: Mapped[bool] = mapped_column(Boolean, default=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    user: Mapped["User"] = relationship(back_populates="notification_setting")

    def __repr__(self) -> str:
        return f"<NotificationSetting user={self.user_id}>"


class DailyStreak(Base):
    __tablename__ = "daily_streaks"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    streak_date: Mapped[date] = mapped_column(Date, nullable=False)
    xp_earned: Mapped[int] = mapped_column(Integer, default=0)
    tests_completed: Mapped[int] = mapped_column(Integer, default=0)
    words_learned: Mapped[int] = mapped_column(Integer, default=0)
    study_minutes: Mapped[int] = mapped_column(Integer, default=0)

    # Relationships
    user: Mapped["User"] = relationship(back_populates="daily_streaks")

    # Unique constraint: one streak record per user per day
    __table_args__ = (
        {"schema": None},
    )

    def __repr__(self) -> str:
        return f"<DailyStreak user={self.user_id} date={self.streak_date}>"


# Forward references for type hints (imported at runtime by other models)
from app.models.practice import TestAttempt  # noqa: E402, F811
from app.models.vocabulary import VocabularyNote  # noqa: E402, F811
from app.models.flashcard import FlashcardDeck  # noqa: E402, F811
