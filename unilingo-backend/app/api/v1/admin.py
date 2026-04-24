"""
Admin API routes for content management and system monitoring.
"""
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.api.deps import get_admin_user
from app.models.user import User
from app.models.topic import Topic, Question
from app.models.practice import TestAttempt
from app.models.vocabulary import VocabularyNote
from app.schemas.topic import (
    CreateTopicRequest, UpdateTopicRequest, TopicResponse,
    CreateQuestionRequest, UpdateQuestionRequest, QuestionResponse,
)

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/dashboard")
async def admin_dashboard(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    """Get admin dashboard statistics."""
    total_users = (await db.execute(select(func.count(User.id)))).scalar() or 0
    active_users = (await db.execute(
        select(func.count(User.id)).where(User.is_active == True)
    )).scalar() or 0
    total_tests = (await db.execute(
        select(func.count(TestAttempt.id)).where(TestAttempt.status == "completed")
    )).scalar() or 0
    total_topics = (await db.execute(select(func.count(Topic.id)))).scalar() or 0
    total_questions = (await db.execute(select(func.count(Question.id)))).scalar() or 0
    total_vocab_saved = (await db.execute(select(func.count(VocabularyNote.id)))).scalar() or 0

    return {
        "total_users": total_users,
        "active_users": active_users,
        "total_tests_completed": total_tests,
        "total_topics": total_topics,
        "total_questions": total_questions,
        "total_vocabulary_saved": total_vocab_saved,
    }


# ─── User Management ───

@router.get("/users")
async def list_users(
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=20, ge=1, le=100),
    search: str | None = None,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    """List all users with pagination."""
    query = select(User)
    if search:
        query = query.where(
            User.email.ilike(f"%{search}%") | User.full_name.ilike(f"%{search}%")
        )
    
    count = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar() or 0
    query = query.order_by(User.created_at.desc()).offset((page - 1) * per_page).limit(per_page)
    
    result = await db.execute(query)
    users = result.scalars().all()
    
    return {
        "items": [
            {
                "id": str(u.id), "email": u.email, "full_name": u.full_name,
                "username": u.username, "is_active": u.is_active,
                "total_xp": u.total_xp, "created_at": str(u.created_at),
            }
            for u in users
        ],
        "total": count,
        "page": page,
        "per_page": per_page,
    }


@router.patch("/users/{user_id}/status")
async def toggle_user_status(
    user_id: UUID,
    is_active: bool,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    """Block or unblock a user."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.is_active = is_active
    await db.flush()
    return {"user_id": str(user_id), "is_active": is_active}


# ─── Topic Management ───

@router.post("/topics", response_model=TopicResponse, status_code=status.HTTP_201_CREATED)
async def create_topic(
    request: CreateTopicRequest,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    """Create a new topic."""
    topic = Topic(**request.model_dump())
    db.add(topic)
    await db.flush()
    return TopicResponse.model_validate(topic)


@router.put("/topics/{topic_id}", response_model=TopicResponse)
async def update_topic(
    topic_id: UUID,
    request: UpdateTopicRequest,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    """Update a topic."""
    result = await db.execute(select(Topic).where(Topic.id == topic_id))
    topic = result.scalar_one_or_none()
    if not topic:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Topic not found")
    for field, value in request.model_dump(exclude_unset=True).items():
        setattr(topic, field, value)
    await db.flush()
    return TopicResponse.model_validate(topic)


@router.delete("/topics/{topic_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_topic(
    topic_id: UUID,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    """Delete a topic (hard delete)."""
    result = await db.execute(select(Topic).where(Topic.id == topic_id))
    topic = result.scalar_one_or_none()
    if not topic:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Topic not found")
    await db.delete(topic)


# ─── Question Management ───

@router.post("/questions", response_model=QuestionResponse, status_code=status.HTTP_201_CREATED)
async def create_question(
    request: CreateQuestionRequest,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    """Create a new question."""
    # Verify topic exists
    topic_result = await db.execute(select(Topic).where(Topic.id == request.topic_id))
    if not topic_result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Topic not found")
    question = Question(**request.model_dump())
    db.add(question)
    await db.flush()
    return QuestionResponse.model_validate(question)


@router.put("/questions/{question_id}", response_model=QuestionResponse)
async def update_question(
    question_id: UUID,
    request: UpdateQuestionRequest,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    """Update a question."""
    result = await db.execute(select(Question).where(Question.id == question_id))
    question = result.scalar_one_or_none()
    if not question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
    for field, value in request.model_dump(exclude_unset=True).items():
        setattr(question, field, value)
    await db.flush()
    return QuestionResponse.model_validate(question)


@router.delete("/questions/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_question(
    question_id: UUID,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    """Delete a question."""
    result = await db.execute(select(Question).where(Question.id == question_id))
    question = result.scalar_one_or_none()
    if not question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
    await db.delete(question)
