"""
Practice-related models: TestAttempt, AttemptPart, AIScoringResult
"""
import uuid
from datetime import datetime
from sqlalchemy import String, Float, Integer, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.database import Base


class TestAttempt(Base):
    __tablename__ = "test_attempts"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    topic_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("topics.id", ondelete="SET NULL"), nullable=True, index=True
    )
    ielts_part: Mapped[str] = mapped_column(String(10), nullable=False)
    # Status: "in_progress", "submitted", "scoring", "completed", "failed"
    status: Mapped[str] = mapped_column(String(20), default="in_progress", index=True)
    # Overall scores (computed from AI scoring)
    overall_band: Mapped[float | None] = mapped_column(Float, nullable=True)
    fluency_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    lexical_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    grammar_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    pronunciation_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    duration_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)
    # XP earned for this attempt
    xp_earned: Mapped[int] = mapped_column(Integer, default=0)
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # Relationships
    user: Mapped["User"] = relationship(back_populates="test_attempts")
    topic: Mapped["Topic | None"] = relationship()
    parts: Mapped[list["AttemptPart"]] = relationship(
        back_populates="attempt", cascade="all, delete-orphan", order_by="AttemptPart.part_number"
    )

    def __repr__(self) -> str:
        return f"<TestAttempt {self.id} user={self.user_id} status={self.status}>"


class AttemptPart(Base):
    __tablename__ = "attempt_parts"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    attempt_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("test_attempts.id", ondelete="CASCADE"), nullable=False, index=True
    )
    question_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("questions.id", ondelete="SET NULL"), nullable=True
    )
    audio_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    transcript: Mapped[str | None] = mapped_column(Text, nullable=True)
    duration_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)
    part_number: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    attempt: Mapped["TestAttempt"] = relationship(back_populates="parts")
    question: Mapped["Question | None"] = relationship()
    scoring_result: Mapped["AIScoringResult | None"] = relationship(
        back_populates="attempt_part", cascade="all, delete-orphan", uselist=False
    )

    def __repr__(self) -> str:
        return f"<AttemptPart {self.id} part_number={self.part_number}>"


class AIScoringResult(Base):
    __tablename__ = "ai_scoring_results"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    attempt_part_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("attempt_parts.id", ondelete="CASCADE"),
        unique=True, nullable=False
    )
    # Individual band scores
    fluency_band: Mapped[float | None] = mapped_column(Float, nullable=True)
    lexical_band: Mapped[float | None] = mapped_column(Float, nullable=True)
    grammar_band: Mapped[float | None] = mapped_column(Float, nullable=True)
    pronunciation_band: Mapped[float | None] = mapped_column(Float, nullable=True)
    overall_band: Mapped[float | None] = mapped_column(Float, nullable=True)
    # Detailed pronunciation analysis from Azure Speech
    pronunciation_details: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    # {"accuracy": 85, "fluency": 78, "prosody": 72, "word_scores": [...]}
    # Structured feedback from LLM
    feedback: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    # {"summary": "...", "detailed": "..."}
    strengths: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    # ["Good topic vocabulary", "Natural pacing"]
    weaknesses: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    # ["Limited complex sentences", "Pronunciation of 'th' sounds"]
    suggested_improvements: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    # ["Try using more conditional sentences", "Practice linking sounds"]
    sample_better_answer: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    # {"text": "...", "explanation": "..."}
    grammar_errors: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    # [{"original": "...", "corrected": "...", "rule": "..."}]
    vocabulary_suggestions: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    # [{"basic_word": "good", "better_alternatives": ["excellent", "outstanding"]}]
    raw_llm_response: Mapped[str | None] = mapped_column(Text, nullable=True)
    scored_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    attempt_part: Mapped["AttemptPart"] = relationship(back_populates="scoring_result")

    def __repr__(self) -> str:
        return f"<AIScoringResult {self.id} band={self.overall_band}>"


# Forward reference
from app.models.user import User  # noqa: E402, F811
from app.models.topic import Topic, Question  # noqa: E402, F811
