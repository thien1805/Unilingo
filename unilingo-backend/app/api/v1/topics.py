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


def _parse_cue_card_points(cue_card_content: str | None) -> list[str]:
    if not cue_card_content:
        return []

    import json

    try:
        parsed = json.loads(cue_card_content)
        if isinstance(parsed, dict):
            points = parsed.get("points")
            if isinstance(points, list):
                return [str(point).strip() for point in points if str(point).strip()]
    except Exception:
        pass

    points: list[str] = []
    for line in cue_card_content.split("\n"):
        line = line.strip()
        if line.startswith("- "):
            points.append(line[2:].strip())
    return points


@router.get("/mock-test")
async def get_mock_test(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generate a randomized IELTS mock speaking test.

    - Part 1: 4 random questions from all part1 topics
    - Part 2: 1 random cue card topic (with related theme)
    - Part 3: 4 random questions from part3 topics matching the Part 2 category
    
    Each call returns a different combination, just like a real IELTS exam.
    """
    part1_result = await db.execute(
        select(Question.question_text)
        .join(Topic, Question.topic_id == Topic.id)
        .where(
            Topic.is_active == True,
            Question.is_active == True,
            Question.ielts_part == "part1",
        )
        .order_by(func.random())
        .limit(4)
    )
    part1_questions = [row[0] for row in part1_result.all()]

    part2_result = await db.execute(
        select(Question, Topic.category)
        .join(Topic, Question.topic_id == Topic.id)
        .where(
            Topic.is_active == True,
            Question.is_active == True,
            Question.ielts_part == "part2",
        )
        .order_by(func.random())
        .limit(1)
    )
    part2_row = part2_result.first()
    selected_category = part2_row[1] if part2_row else None
    selected_part2_question = part2_row[0] if part2_row else None
    part2_data = {
        "topic": selected_part2_question.question_text if selected_part2_question else "No Part 2 topic available",
        "points": _parse_cue_card_points(selected_part2_question.cue_card_content) if selected_part2_question else [],
        "preparationTime": 60,
        "speakingTime": 120,
    }

    part3_questions: list[str] = []
    if selected_category:
        matching_part3 = await db.execute(
            select(Question.question_text)
            .join(Topic, Question.topic_id == Topic.id)
            .where(
                Topic.is_active == True,
                Topic.category == selected_category,
                Question.is_active == True,
                Question.ielts_part == "part3",
            )
            .order_by(func.random())
            .limit(4)
        )
        part3_questions.extend([row[0] for row in matching_part3.all()])

    if len(part3_questions) < 4:
        other_part3_filters = [
            Topic.is_active == True,
            Question.is_active == True,
            Question.ielts_part == "part3",
        ]
        if selected_category:
            other_part3_filters.append(Topic.category != selected_category)

        other_part3 = await db.execute(
            select(Question.question_text)
            .join(Topic, Question.topic_id == Topic.id)
            .where(*other_part3_filters)
            .order_by(func.random())
            .limit(4 - len(part3_questions))
        )
        part3_questions.extend([row[0] for row in other_part3.all()])

    return {
        "part1": part1_questions,
        "part2": part2_data,
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
    question_counts = (
        select(
            Question.topic_id.label("topic_id"),
            func.count(Question.id).label("question_count"),
        )
        .where(Question.is_active == True)
        .group_by(Question.topic_id)
        .subquery()
    )

    query = (
        select(Topic, func.coalesce(question_counts.c.question_count, 0).label("question_count"))
        .outerjoin(question_counts, Topic.id == question_counts.c.topic_id)
        .where(Topic.is_active == True)
        .order_by(Topic.order_index)
    )

    if ielts_part:
        query = query.where(Topic.ielts_part == ielts_part)
    if category:
        query = query.where(Topic.category == category)
    if difficulty:
        query = query.where(Topic.difficulty == difficulty)

    topic_responses = []
    result = await db.execute(query)
    rows = result.all()

    for topic, question_count in rows:
        topic_dict = TopicResponse.model_validate(topic)
        topic_dict.question_count = int(question_count or 0)
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
