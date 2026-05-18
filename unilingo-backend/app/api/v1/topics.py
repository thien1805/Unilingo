"""
Topics & Questions API routes
"""
from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.topic import Topic, Question
from app.schemas.topic import (
    TopicResponse, TopicListResponse, TopicDetailResponse,
    QuestionResponse,
)

router = APIRouter(prefix="/topics", tags=["Topics"])


@router.get("/mock-test")
async def get_mock_test(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a full mock speaking test (part1 + part2 + part3) from the database."""
    # Fetch all mock_test topics with their questions
    result = await db.execute(
        select(Topic)
        .options(selectinload(Topic.questions))
        .where(Topic.category == "mock_test", Topic.is_active == True)
        .order_by(Topic.order_index)
    )
    topics = result.scalars().all()

    part1_questions = []
    part2_data = None
    part3_questions = []

    for topic in topics:
        active_qs = sorted([q for q in topic.questions if q.is_active], key=lambda q: q.order_index)
        if topic.ielts_part == "part1":
            part1_questions.extend([q.question_text for q in active_qs])
        elif topic.ielts_part == "part2" and active_qs:
            q = active_qs[0]
            # Parse cue card points from cue_card_content
            points = []
            if q.cue_card_content:
                for line in q.cue_card_content.split("\n"):
                    line = line.strip()
                    if line.startswith("- "):
                        points.append(line[2:])
            part2_data = {
                "topic": q.question_text,
                "points": points,
                "preparationTime": 60,
                "speakingTime": 120,
            }
        elif topic.ielts_part == "part3":
            part3_questions.extend([q.question_text for q in active_qs])

    return {
        "part1": part1_questions,
        "part2": part2_data or {
            "topic": "No Part 2 topic available",
            "points": [],
            "preparationTime": 60,
            "speakingTime": 120,
        },
        "part3": part3_questions,
        "limits": {
            "part1Question": 30,
            "part3Question": 45,
        },
    }


@router.get("", response_model=TopicListResponse)
async def list_topics(
    ielts_part: str | None = Query(None, pattern=r"^(part1|part2|part3)$"),
    category: str | None = None,
    difficulty: str | None = Query(None, pattern=r"^(easy|medium|hard)$"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all active topics with optional filters."""
    query = select(Topic).where(Topic.is_active == True).order_by(Topic.order_index)

    if ielts_part:
        query = query.where(Topic.ielts_part == ielts_part)
    if category:
        query = query.where(Topic.category == category)
    if difficulty:
        query = query.where(Topic.difficulty == difficulty)

    result = await db.execute(query)
    topics = result.scalars().all()

    # Get question counts
    topic_responses = []
    for topic in topics:
        count_result = await db.execute(
            select(func.count(Question.id)).where(
                Question.topic_id == topic.id,
                Question.is_active == True,
            )
        )
        question_count = count_result.scalar() or 0
        topic_dict = TopicResponse.model_validate(topic)
        topic_dict.question_count = question_count
        topic_responses.append(topic_dict)

    return TopicListResponse(items=topic_responses, total=len(topic_responses))


@router.get("/recommended")
async def get_recommended_topics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get recommended topics based on user's practice history and weaknesses."""
    # TODO: Implement recommendation logic based on:
    # - Topics the user hasn't practiced
    # - Topics where user scored low
    # - User's target band score
    result = await db.execute(
        select(Topic)
        .where(Topic.is_active == True)
        .order_by(func.random())
        .limit(6)
    )
    topics = result.scalars().all()
    return [TopicResponse.model_validate(t) for t in topics]


@router.get("/{topic_id}", response_model=TopicDetailResponse)
async def get_topic_detail(
    topic_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get topic detail with all questions."""
    result = await db.execute(
        select(Topic)
        .options(selectinload(Topic.questions))
        .where(Topic.id == topic_id, Topic.is_active == True)
    )
    topic = result.scalar_one_or_none()

    if not topic:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Topic not found")

    active_questions = [q for q in topic.questions if q.is_active]

    return TopicDetailResponse(
        topic=TopicResponse.model_validate(topic),
        questions=[QuestionResponse.model_validate(q) for q in active_questions],
    )


@router.get("/{topic_id}/questions", response_model=list[QuestionResponse])
async def get_topic_questions(
    topic_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all questions for a topic."""
    result = await db.execute(
        select(Question)
        .where(Question.topic_id == topic_id, Question.is_active == True)
        .order_by(Question.order_index)
    )
    questions = result.scalars().all()
    return [QuestionResponse.model_validate(q) for q in questions]
