"""
Leaderboard cache model.
"""
import uuid
from datetime import datetime
from sqlalchemy import String, Float, Integer, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class LeaderboardCache(Base):
    """
    Cached leaderboard rankings. Updated periodically by a Celery task.
    For real-time ranking, Redis Sorted Sets are used; this table provides persistence.
    """
    __tablename__ = "leaderboard_cache"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    period_type: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    # "weekly", "monthly", "all_time"
    period_value: Mapped[str] = mapped_column(String(20), nullable=False)
    # e.g.: "2025-W15", "2025-04", "all"
    avg_band_score: Mapped[float] = mapped_column(Float, default=0.0)
    total_tests: Mapped[int] = mapped_column(Integer, default=0)
    total_xp: Mapped[int] = mapped_column(Integer, default=0)
    rank: Mapped[int] = mapped_column(Integer, default=0)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    def __repr__(self) -> str:
        return f"<LeaderboardCache user={self.user_id} rank={self.rank} period={self.period_type}>"
