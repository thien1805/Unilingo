"""
Flashcard models: FlashcardDeck, Flashcard, FlashcardReview
"""
import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, Integer, Float, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.database import Base


class FlashcardDeck(Base):
    __tablename__ = "flashcard_decks"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_public: Mapped[bool] = mapped_column(Boolean, default=False)
    card_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    user: Mapped["User"] = relationship(back_populates="flashcard_decks")
    cards: Mapped[list["Flashcard"]] = relationship(
        back_populates="deck", cascade="all, delete-orphan", order_by="Flashcard.order_index"
    )

    def __repr__(self) -> str:
        return f"<FlashcardDeck '{self.title}' cards={self.card_count}>"


class Flashcard(Base):
    __tablename__ = "flashcards"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    deck_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("flashcard_decks.id", ondelete="CASCADE"),
        nullable=False, index=True
    )
    vocabulary_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("vocabulary_notes.id", ondelete="SET NULL"), nullable=True
    )
    front_content: Mapped[str] = mapped_column(Text, nullable=False)
    # Typically the word
    back_content: Mapped[str] = mapped_column(Text, nullable=False)
    # Typically the definition + example
    audio_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    extra_info: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    # {"phonetic": "/...", "part_of_speech": "noun", "synonyms": [...]}
    order_index: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    deck: Mapped["FlashcardDeck"] = relationship(back_populates="cards")
    vocabulary: Mapped["VocabularyNote | None"] = relationship()
    reviews: Mapped[list["FlashcardReview"]] = relationship(
        back_populates="flashcard", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Flashcard '{self.front_content[:30]}'>"


class FlashcardReview(Base):
    """
    Stores each review event for SM-2 Spaced Repetition algorithm.
    """
    __tablename__ = "flashcard_reviews"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    flashcard_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("flashcards.id", ondelete="CASCADE"),
        nullable=False, index=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False, index=True
    )
    # SM-2 algorithm fields
    quality_rating: Mapped[int] = mapped_column(Integer, nullable=False)
    # 0=complete blackout, 1=incorrect, 2=incorrect but remembered, 3=correct with difficulty, 4=correct, 5=perfect
    easiness_factor: Mapped[float] = mapped_column(Float, default=2.5)
    interval_days: Mapped[int] = mapped_column(Integer, default=1)
    repetition_number: Mapped[int] = mapped_column(Integer, default=0)
    reviewed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    next_review_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # Relationships
    flashcard: Mapped["Flashcard"] = relationship(back_populates="reviews")

    def __repr__(self) -> str:
        return f"<FlashcardReview card={self.flashcard_id} q={self.quality_rating}>"


# Forward reference
from app.models.user import User  # noqa: E402, F811
from app.models.vocabulary import VocabularyNote  # noqa: E402, F811
