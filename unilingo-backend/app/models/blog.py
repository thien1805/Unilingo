"""
Blog model for IELTS tips, learning content, and announcements.
"""
import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, Integer, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from app.database import Base


class BlogPost(Base):
    __tablename__ = "blog_posts"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    slug: Mapped[str] = mapped_column(String(500), nullable=False, unique=True, index=True)
    excerpt: Mapped[str | None] = mapped_column(Text, nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    cover_image_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    author_name: Mapped[str] = mapped_column(String(255), default="Unilingo Team")
    author_avatar: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    category: Mapped[str] = mapped_column(
        String(50), nullable=False, default="tips", index=True
    )
    # e.g.: "tips", "grammar", "vocabulary", "speaking", "news"
    tags: Mapped[list | None] = mapped_column(JSONB, nullable=True)
    # e.g.: ["IELTS", "Speaking", "Band 7"]
    read_time_minutes: Mapped[int] = mapped_column(Integer, default=3)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    view_count: Mapped[int] = mapped_column(Integer, default=0)
    published_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    def __repr__(self) -> str:
        return f"<BlogPost {self.title[:50]}>"
