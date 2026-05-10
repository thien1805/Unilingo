import asyncio
import uuid
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.config import get_settings
from app.models.blog import BlogPost
from app.database import Base

settings = get_settings()
engine = create_async_engine(settings.DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def seed_blogs():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        post = BlogPost(
            title="How to achieve Band 7.5 in IELTS Speaking",
            slug="how-to-achieve-band-7-5-in-ielts-speaking",
            excerpt="A comprehensive guide to cracking the IELTS Speaking test with practical tips and strategies.",
            content="""# Achieving Band 7.5 in IELTS Speaking

To get a 7.5 in IELTS Speaking, you need to focus on four main criteria:

## 1. Fluency and Coherence
- Speak at length without noticeable effort.
- Use a variety of linking words naturally.

## 2. Lexical Resource
- Use less common idiomatic vocabulary.
- Paraphrase effectively.

> "The key is to sound natural, not robotic."

## 3. Grammatical Range and Accuracy
- Use complex structures (conditionals, relative clauses).
- Keep error rate low.

## 4. Pronunciation
- Use a range of pronunciation features (stress, intonation).
- Ensure your speech is easy to understand.

Keep practicing every day with Unilingo!
""",
            cover_image_url="https://images.unsplash.com/photo-1546410531-bb4caa6b424d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            author_name="Sarah Jenkins",
            author_avatar="👩🏼‍🏫",
            category="tips",
            tags=["IELTS", "Speaking", "Band 7.5"],
            read_time_minutes=4,
            is_published=True,
            is_featured=True,
            view_count=120,
            published_at=datetime.now(timezone.utc),
        )
        session.add(post)

        post2 = BlogPost(
            title="Top 5 Grammar Mistakes to Avoid",
            slug="top-5-grammar-mistakes-to-avoid",
            excerpt="Don't let these common grammar errors bring down your IELTS score.",
            content="""# Top 5 Grammar Mistakes

Avoid these common traps...
""",
            cover_image_url="https://images.unsplash.com/photo-1455390582262-044cdead27d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            author_name="Unilingo Team",
            author_avatar="📝",
            category="grammar",
            tags=["Grammar", "Mistakes"],
            read_time_minutes=3,
            is_published=True,
            is_featured=True,
            view_count=85,
            published_at=datetime.now(timezone.utc),
        )
        session.add(post2)

        await session.commit()
        print("Blogs seeded!")

if __name__ == "__main__":
    asyncio.run(seed_blogs())
