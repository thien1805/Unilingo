"""
Topic and Question models for IELTS practice content.
"""
import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, Integer, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.database import Base


class Topic(Base):
    __tablename__ = "topics"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    title_vi: Mapped[str | None] = mapped_column(String(255), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    category: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    # e.g.: "daily_life", "education", "technology", "environment", "health"
    ielts_part: Mapped[str] = mapped_column(String(10), nullable=False, index=True)
    # e.g.: "part1", "part2", "part3"
    difficulty: Mapped[str] = mapped_column(String(20), default="medium")
    # e.g.: "easy", "medium", "hard"
    icon: Mapped[str | None] = mapped_column(String(50), nullable=True)
    # e.g.: emoji or icon name
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    order_index: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    questions: Mapped[list["Question"]] = relationship(
        back_populates="topic", cascade="all, delete-orphan", order_by="Question.order_index"
    )

    def __repr__(self) -> str:
        return f"<Topic {self.title} ({self.ielts_part})>"


class Question(Base):
    __tablename__ = "questions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    topic_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("topics.id", ondelete="CASCADE"), nullable=False, index=True
    )
    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    question_text_vi: Mapped[str | None] = mapped_column(Text, nullable=True)
    ielts_part: Mapped[str] = mapped_column(String(10), nullable=False, index=True)
    # Part 2 specific: cue card content
    cue_card_content: Mapped[str | None] = mapped_column(Text, nullable=True)
    # Part 3 specific: follow-up questions list
    follow_up_questions: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    difficulty: Mapped[str] = mapped_column(String(20), default="medium")
    # Sample answer for reference
    sample_answer: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    # {"text": "...", "band_level": 7.0, "key_phrases": [...]}
    # Key vocabulary for this question
    key_vocabulary: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    # [{"word": "sustainable", "definition": "...", "example": "..."}]
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    order_index: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    topic: Mapped["Topic"] = relationship(back_populates="questions")

    def __repr__(self) -> str:
        return f"<Question {self.question_text[:50]}...>"
