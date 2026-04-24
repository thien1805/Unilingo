"""
Vocabulary models: VocabularyNote, VocabularyTag
"""
import uuid
from datetime import datetime
from sqlalchemy import String, Integer, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.database import Base


class VocabularyNote(Base):
    __tablename__ = "vocabulary_notes"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    word: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    phonetic: Mapped[str | None] = mapped_column(String(200), nullable=True)
    audio_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    # Structured definitions from dictionary API
    definitions: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    # [{"part_of_speech": "adjective", "definition": "...", "example": "..."}]
    # User's own example sentences or usage
    examples: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    # ["I want to live a sustainable life.", ...]
    user_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    # Where this word was encountered
    source_context: Mapped[str | None] = mapped_column(Text, nullable=True)
    # e.g.: "Found in Part 2 practice about Environment"
    source_attempt_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("test_attempts.id", ondelete="SET NULL"), nullable=True
    )
    # Spaced Repetition fields
    mastery_level: Mapped[str] = mapped_column(String(20), default="new")
    # "new", "learning", "reviewing", "mastered"
    review_count: Mapped[int] = mapped_column(Integer, default=0)
    next_review_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    user: Mapped["User"] = relationship(back_populates="vocabulary_notes")
    tags: Mapped[list["VocabularyTag"]] = relationship(
        back_populates="vocabulary", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<VocabularyNote '{self.word}' user={self.user_id}>"


class VocabularyTag(Base):
    __tablename__ = "vocabulary_tags"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    vocabulary_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("vocabulary_notes.id", ondelete="CASCADE"),
        nullable=False, index=True
    )
    tag: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    # e.g.: "ielts", "environment", "part2", "academic"

    # Relationships
    vocabulary: Mapped["VocabularyNote"] = relationship(back_populates="tags")

    def __repr__(self) -> str:
        return f"<VocabularyTag '{self.tag}'>"


# Forward reference
from app.models.user import User  # noqa: E402, F811
