import asyncio
from datetime import datetime, timezone
import random

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.config import get_settings
from app.models.blog import BlogPost
from app.models.forecast import DailyForecast
from app.api.v1.blog import generate_slug
from app.database import Base

settings = get_settings()
engine = create_async_engine(settings.DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

# Random English/Study images from Unsplash
IMAGES = [
    "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=800&auto=format&fit=crop", # Study books
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop", # Students
    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=800&auto=format&fit=crop", # Writing
    "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=800&auto=format&fit=crop", # Library
    "https://images.unsplash.com/photo-1473649085228-583485e6e4d7?q=80&w=800&auto=format&fit=crop", # Reading
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=800&auto=format&fit=crop", # Learning
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop", # Graduation
    "https://images.unsplash.com/photo-1455390582262-044cdead27d8?q=80&w=800&auto=format&fit=crop", # Desk
]

def get_img(): return random.choice(IMAGES)

BLOGS = [
    {
        "title": "Mastering Phrasal Verbs in English",
        "excerpt": "Phrasal verbs can be tricky. Here is a guide to mastering the most common ones.",
        "content": "## Phrasal Verbs\n\nPhrasal verbs consist of a verb and a particle (preposition or adverb).\n\n### 1. Give up\nMeaning: To stop trying.\nExample: *I will never give up on learning English.*\n\n### 2. Look forward to\nMeaning: To feel pleased and excited about something that is going to happen.\nExample: *I look forward to the weekend.*\n\nKeep practicing!",
        "category": "vocabulary",
        "tags": ["vocabulary", "phrasal verbs", "tips"],
    },
    {
        "title": "Speaking Test: How to expand your answers",
        "excerpt": "Don't just answer yes or no. Learn how to expand your answers in Part 1 and Part 3.",
        "content": "## Expanding Answers\n\nWhen the examiner asks a question, use the **A-R-E** method:\n- **A**nswer the question directly.\n- **R**eason: Give a reason for your answer.\n- **E**xample: Provide an example from your life.\n\n### Example\n**Examiner**: Do you like reading?\n**You**: Yes, I love reading (Answer). It helps me relax after a long day (Reason). For instance, last night I read a mystery novel before bed (Example).",
        "category": "speaking",
        "tags": ["speaking", "tips"],
    },
    {
        "title": "Latest IELTS Changes 2026",
        "excerpt": "Stay updated with the newest trends and formats in the IELTS examination.",
        "content": "## What's new in 2026?\n\nThe IELTS test format remains largely the same, but there is a stronger emphasis on **computer-delivered** testing. \n\nAlso, topics in the Speaking section are leaning more towards technology, AI, and remote work. Make sure to build vocabulary in these areas!",
        "category": "news",
        "tags": ["news", "ielts", "2026"],
    }
]

FORECASTS = [
    {
        "title": "Speaking Forecast - May 2026",
        "skill": "speaking",
        "excerpt": "Expected topics: Technology, AI, Home town, and Hobbies.",
        "content": "## Part 1\n- Do you use AI tools often?\n- Tell me about your hometown.\n\n## Part 2\nDescribe a time you used technology to solve a problem.\n*You should say:*\n- What the problem was\n- What technology you used\n- How it helped you\n\n## Part 3\n- How is AI changing education?",
    },
    {
        "title": "Writing Task 2 Forecast - Q2 2026",
        "skill": "writing",
        "excerpt": "Focus areas: Environment, Remote Work, and Education.",
        "content": "## Expected Topics\n\n1. **Environment**: Some people think that individuals cannot do anything to solve environmental problems, while others think that individuals can have a big impact. Discuss both views.\n\n2. **Remote Work**: In many countries, people are working from home rather than in an office. Do the advantages of this outweigh the disadvantages?\n\nMake sure to practice organizing your paragraphs clearly!",
    },
    {
        "title": "Listening Section 3 & 4 Trends",
        "skill": "listening",
        "excerpt": "Prepare for multiple choice and matching questions in academic contexts.",
        "content": "## What to expect\n\nSection 3 usually involves two or three speakers discussing an academic project. Pay close attention to **distractors**.\n\nSection 4 is typically a university lecture. Focus on signposting language like *'moving on to'*, *'finally'*, and *'the main reason is'*.",
    },
    {
        "title": "Reading Passages - Science & History",
        "skill": "reading",
        "excerpt": "Passage 3 is getting harder. Read about science and history to build vocabulary.",
        "content": "## Recommended Reading\n\nTo prepare for Passage 3, try reading articles from:\n- National Geographic\n- BBC Science\n- The Economist\n\nFocus on understanding the writer's claims and views for **Yes/No/Not Given** questions.",
    },
    {
        "title": "Speaking Forecast - June 2026",
        "skill": "speaking",
        "excerpt": "Expected topics: Travel, Food, and Childhood memories.",
        "content": "## Part 1\n- Do you like traveling?\n- What is your favorite food?\n\n## Part 2\nDescribe a memorable trip from your childhood.\n\n## Part 3\n- How has tourism changed in your country?",
    }
]

async def seed_data():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # Seed Blogs
        for b in BLOGS:
            post = BlogPost(
                title=b["title"],
                slug=generate_slug(b["title"]),
                excerpt=b["excerpt"],
                content=b["content"],
                cover_image_url=get_img(),
                author_name="Unilingo Tutors",
                category=b["category"],
                tags=b["tags"],
                read_time_minutes=3,
                is_published=True,
                is_featured=False,
                view_count=random.randint(10, 100),
                published_at=datetime.now(timezone.utc),
            )
            session.add(post)

        # Seed Forecasts
        for f in FORECASTS:
            forecast = DailyForecast(
                title=f["title"],
                skill_category=f["skill"],
                excerpt=f["excerpt"],
                content=f["content"],
                cover_image_url=get_img(),
            )
            session.add(forecast)

        await session.commit()
        print("Successfully seeded extra blogs and forecasts!")

if __name__ == "__main__":
    asyncio.run(seed_data())
