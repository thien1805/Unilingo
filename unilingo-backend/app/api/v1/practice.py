"""
Practice & Test API routes
"""
from uuid import UUID
from fastapi import APIRouter, Depends, UploadFile, File, Query, HTTPException, status
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.topic import Topic, Question
from app.models.practice import TestAttempt, AttemptPart, AIScoringResult
from app.schemas.practice import (
    StartPracticeRequest, StartPracticeResponse, QuestionDetail,
    UploadAudioResponse, SubmitPracticeResponse,
    ScoringResultResponse, PartResultResponse, AIScoringResponse,
    PracticeHistoryResponse, PracticeHistoryItem,
    PracticeStatsResponse,
)

router = APIRouter(prefix="/practice", tags=["Practice"])


@router.post("/start", response_model=StartPracticeResponse, status_code=status.HTTP_201_CREATED)
async def start_practice(
    request: StartPracticeRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Start a new practice session."""
    # Verify topic exists
    topic_result = await db.execute(select(Topic).where(Topic.id == request.topic_id))
    topic = topic_result.scalar_one_or_none()
    if not topic:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Topic not found")

    # Get a question (specific or random)
    if request.question_id:
        q_result = await db.execute(
            select(Question).where(Question.id == request.question_id, Question.is_active == True)
        )
    else:
        q_result = await db.execute(
            select(Question)
            .where(
                Question.topic_id == request.topic_id,
                Question.ielts_part == request.ielts_part,
                Question.is_active == True,
            )
            .order_by(func.random())
            .limit(1)
        )
    question = q_result.scalar_one_or_none()
    if not question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No questions available for this topic")

    # Create test attempt
    attempt = TestAttempt(
        user_id=current_user.id,
        topic_id=request.topic_id,
        ielts_part=request.ielts_part,
        status="in_progress",
    )
    db.add(attempt)
    await db.flush()

    return StartPracticeResponse(
        attempt_id=attempt.id,
        topic_title=topic.title,
        ielts_part=request.ielts_part,
        question=QuestionDetail.model_validate(question),
        status="in_progress",
    )


@router.post("/{attempt_id}/upload-audio", response_model=UploadAudioResponse)
async def upload_audio(
    attempt_id: UUID,
    file: UploadFile = File(...),
    part_number: int = Query(default=1, ge=1, le=3),
    question_id: UUID | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload audio recording for a practice attempt."""
    # Verify attempt belongs to user
    result = await db.execute(
        select(TestAttempt).where(
            TestAttempt.id == attempt_id,
            TestAttempt.user_id == current_user.id,
        )
    )
    attempt = result.scalar_one_or_none()
    if not attempt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attempt not found")

    if attempt.status not in ("in_progress",):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Attempt is not in progress")

    # TODO: Upload audio file to S3/MinIO
    # For now, simulate the upload
    audio_url = f"/audio/{current_user.id}/{attempt_id}/part{part_number}.webm"

    # Create attempt part
    attempt_part = AttemptPart(
        attempt_id=attempt_id,
        question_id=question_id,
        audio_url=audio_url,
        part_number=part_number,
    )
    db.add(attempt_part)
    await db.flush()

    return UploadAudioResponse(
        part_id=attempt_part.id,
        audio_url=audio_url,
        duration_seconds=None,  # Will be extracted from audio file
    )


@router.post("/{attempt_id}/submit", response_model=SubmitPracticeResponse)
async def submit_practice(
    attempt_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Submit a practice attempt for AI scoring."""
    result = await db.execute(
        select(TestAttempt)
        .options(selectinload(TestAttempt.parts))
        .where(
            TestAttempt.id == attempt_id,
            TestAttempt.user_id == current_user.id,
        )
    )
    attempt = result.scalar_one_or_none()
    if not attempt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attempt not found")

    if not attempt.parts:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No audio uploaded")

    # Update status to "scoring"
    attempt.status = "scoring"
    await db.flush()

    # TODO: Enqueue Celery task for AI scoring
    # from app.workers.scoring_tasks import score_practice_attempt
    # score_practice_attempt.delay(str(attempt_id))

    return SubmitPracticeResponse(
        attempt_id=attempt.id,
        status="scoring",
        message="Your practice is being scored by AI. This usually takes 15-30 seconds.",
    )


@router.get("/{attempt_id}/result", response_model=ScoringResultResponse)
async def get_practice_result(
    attempt_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get the scoring result for a practice attempt. Poll this endpoint until status is 'completed'."""
    result = await db.execute(
        select(TestAttempt)
        .options(
            selectinload(TestAttempt.parts).selectinload(AttemptPart.scoring_result)
        )
        .where(
            TestAttempt.id == attempt_id,
            TestAttempt.user_id == current_user.id,
        )
    )
    attempt = result.scalar_one_or_none()
    if not attempt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attempt not found")

    parts_response = []
    for part in attempt.parts:
        scoring = None
        if part.scoring_result:
            scoring = AIScoringResponse.model_validate(part.scoring_result)
        parts_response.append(PartResultResponse(
            part_id=part.id,
            part_number=part.part_number,
            transcript=part.transcript,
            duration_seconds=part.duration_seconds,
            scoring=scoring,
        ))

    return ScoringResultResponse(
        attempt_id=attempt.id,
        status=attempt.status,
        overall_band=attempt.overall_band,
        fluency_score=attempt.fluency_score,
        lexical_score=attempt.lexical_score,
        grammar_score=attempt.grammar_score,
        pronunciation_score=attempt.pronunciation_score,
        duration_seconds=attempt.duration_seconds,
        xp_earned=attempt.xp_earned,
        parts=parts_response,
    )


@router.get("/history", response_model=PracticeHistoryResponse)
async def get_practice_history(
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=20, ge=1, le=50),
    ielts_part: str | None = Query(None, pattern=r"^(part1|part2|part3)$"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get practice history with pagination."""
    query = (
        select(TestAttempt)
        .options(selectinload(TestAttempt.topic))
        .where(TestAttempt.user_id == current_user.id)
    )
    if ielts_part:
        query = query.where(TestAttempt.ielts_part == ielts_part)

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar() or 0

    # Paginate
    query = query.order_by(desc(TestAttempt.started_at)).offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    attempts = result.scalars().all()

    items = [
        PracticeHistoryItem(
            attempt_id=a.id,
            topic_title=a.topic.title if a.topic else "Unknown",
            ielts_part=a.ielts_part,
            overall_band=a.overall_band,
            status=a.status,
            duration_seconds=a.duration_seconds,
            started_at=a.started_at,
            completed_at=a.completed_at,
        )
        for a in attempts
    ]

    return PracticeHistoryResponse(items=items, total=total, page=page, per_page=per_page)


@router.get("/stats", response_model=PracticeStatsResponse)
async def get_practice_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get aggregated practice statistics."""
    # Overall stats
    result = await db.execute(
        select(
            func.count(TestAttempt.id),
            func.coalesce(func.sum(TestAttempt.duration_seconds), 0),
            func.coalesce(func.avg(TestAttempt.overall_band), 0),
            func.coalesce(func.max(TestAttempt.overall_band), 0),
        ).where(
            TestAttempt.user_id == current_user.id,
            TestAttempt.status == "completed",
        )
    )
    row = result.one()

    # Per-part averages
    part_avgs = {}
    for part in ["part1", "part2", "part3"]:
        part_result = await db.execute(
            select(func.avg(TestAttempt.overall_band)).where(
                TestAttempt.user_id == current_user.id,
                TestAttempt.ielts_part == part,
                TestAttempt.status == "completed",
            )
        )
        avg = part_result.scalar()
        part_avgs[part] = round(avg, 1) if avg else None

    return PracticeStatsResponse(
        total_tests=row[0],
        total_hours=round(row[1] / 3600, 1),
        avg_band_score=round(row[2], 1),
        best_band_score=round(row[3], 1),
        part1_avg=part_avgs.get("part1"),
        part2_avg=part_avgs.get("part2"),
        part3_avg=part_avgs.get("part3"),
        tests_this_week=0,  # TODO: Calculate
        improvement_pct=0.0,  # TODO: Calculate
    )
