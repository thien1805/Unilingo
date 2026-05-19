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
    UploadAudioResponse, TranscribeAudioResponse, SubmitPracticeResponse,
    ScoringResultResponse, PartResultResponse, AIScoringResponse,
    PracticeHistoryResponse, PracticeHistoryItem,
    PracticeStatsResponse,
)

router = APIRouter(prefix="/practice", tags=["Practice"])


def normalize_band(value) -> float | None:
    """Clamp IELTS band to 0.0-9.0 and round to the nearest .0/.5 step."""
    if value is None:
        return None
    try:
        band = float(value)
    except (TypeError, ValueError):
        return None
    return max(0.0, min(9.0, round(band * 2) / 2))


def transcribe_audio_file(audio_path: str) -> str:
    """Transcribe a local audio file into English text for mock-test evaluation."""
    import os
    from app.config import get_settings

    settings = get_settings()
    if not settings.GROQ_API_KEY:
        return "[Mock transcript] Speech-to-text is not configured yet. Add GROQ_API_KEY to enable real transcription."

    if not os.path.exists(audio_path):
        return f"[Transcription failed] Audio file not found: {audio_path}"

    try:
        from groq import Groq

        client = Groq(api_key=settings.GROQ_API_KEY)
        with open(audio_path, "rb") as file:
            transcription = client.audio.transcriptions.create(
                file=(os.path.basename(audio_path), file.read()),
                model="whisper-large-v3",
                response_format="text",
                language="en",
            )

        return str(transcription).strip() or "No speech could be recognized."
    except Exception as exc:
        print(f"Mock test transcription failed: {exc}")
        return f"[Transcription failed] {exc}"


async def get_or_create_ai_topic(db: AsyncSession, ielts_part: str) -> Topic:
    """Return a valid synthetic topic used only when DB content is missing."""
    title = f"AI Generated Mock Test - {ielts_part.replace('part', 'Part ')}"
    ai_topic_result = await db.execute(
        select(Topic).where(Topic.title == title, Topic.ielts_part == ielts_part)
    )
    ai_topic = ai_topic_result.scalar_one_or_none()
    if ai_topic:
        return ai_topic

    ai_topic = Topic(
        title=title,
        description="Questions generated dynamically when no curated topic is available.",
        category="ai_generated",
        ielts_part=ielts_part,
        difficulty="medium",
        icon="wand",
        is_active=True,
        order_index=999,
    )
    db.add(ai_topic)
    await db.flush()
    return ai_topic


@router.post("/start", response_model=StartPracticeResponse, status_code=status.HTTP_201_CREATED)
async def start_practice(
    request: StartPracticeRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Start a new practice session."""
    from uuid import UUID as UUIDType
    
    # Parse topic_id — could be a UUID string or 'mock-id' or None
    raw_topic_id = request.topic_id
    parsed_topic_id = None
    if raw_topic_id and raw_topic_id != "mock-id":
        try:
            parsed_topic_id = UUIDType(raw_topic_id)
        except ValueError:
            parsed_topic_id = None
    
    topic = None
    if parsed_topic_id:
        topic_result = await db.execute(select(Topic).where(Topic.id == parsed_topic_id))
        topic = topic_result.scalar_one_or_none()
        if not topic:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Topic not found")

    # Get a question (specific or random)
    if request.question_id:
        q_result = await db.execute(
            select(Question).where(Question.id == request.question_id, Question.is_active == True)
        )
    else:
        # If no topic specified, pick any active question for the requested part
        stmt = select(Question).where(
            Question.ielts_part == request.ielts_part,
            Question.is_active == True,
        )
        if parsed_topic_id:
            stmt = stmt.where(Question.topic_id == parsed_topic_id)
            
        q_result = await db.execute(stmt.order_by(func.random()).limit(1))
        
    question = q_result.scalar_one_or_none()
    
    if not question:
        # DB is empty, use AI to generate a random question!
        from app.config import get_settings
        from groq import AsyncGroq
        import json as json_lib
        settings = get_settings()
        if settings.GROQ_API_KEY:
            client = AsyncGroq(api_key=settings.GROQ_API_KEY)
            prompt = f"""Generate a random, authentic IELTS Speaking {request.ielts_part} question.
            Return ONLY a valid JSON object with the following structure:
            {{
                "question_text": "The main question here",
                "cue_card_content": {{"prompt": "You should say:", "points": ["point 1", "point 2"]}}
            }}
            If {request.ielts_part} is part1 or part3, set cue_card_content to null.
            """
            try:
                response = await client.chat.completions.create(
                    messages=[{"role": "user", "content": prompt}],
                    model="llama3-70b-8192",
                    response_format={"type": "json_object"}
                )
                ai_data = json_lib.loads(response.choices[0].message.content)
                
                ai_topic = await get_or_create_ai_topic(db, request.ielts_part)
                topic = ai_topic  # Use AI topic as the topic reference
                
                question = Question(
                    topic_id=ai_topic.id,
                    ielts_part=request.ielts_part,
                    question_text=ai_data.get("question_text", "Describe a place you like."),
                    cue_card_content=json_lib.dumps(ai_data.get("cue_card_content")) if ai_data.get("cue_card_content") else None,
                    difficulty="medium",
                    is_active=True
                )
                db.add(question)
                await db.flush()
            except Exception as e:
                print(f"Error generating question: {e}")
                import traceback
                traceback.print_exc()
                
    if not question:
        import json as json_lib

        fallback_questions = {
            "part1": {
                "question_text": "Do you work or study?",
                "cue_card_content": None,
            },
            "part2": {
                "question_text": "Describe a mobile application that you find useful.",
                "cue_card_content": {
                    "prompt": "You should say:",
                    "points": [
                        "What the application is",
                        "When you started using it",
                        "What features it has",
                        "And explain why you find it useful",
                    ],
                },
            },
            "part3": {
                "question_text": "How have mobile applications changed the way students learn?",
                "cue_card_content": None,
            },
        }
        fallback = fallback_questions.get(request.ielts_part, fallback_questions["part1"])
        ai_topic = await get_or_create_ai_topic(db, request.ielts_part)
        topic = ai_topic
        question = Question(
            topic_id=ai_topic.id,
            ielts_part=request.ielts_part,
            question_text=fallback["question_text"],
            cue_card_content=json_lib.dumps(fallback["cue_card_content"]) if fallback["cue_card_content"] else None,
            difficulty="medium",
            is_active=True,
        )
        db.add(question)
        await db.flush()

    # Determine topic title
    final_topic_id = parsed_topic_id or (question.topic_id if question else None)
    topic_title = "Mock Test"
    if topic:
        topic_title = topic.title
    elif final_topic_id:
        # Load topic title from question's topic
        t_result = await db.execute(select(Topic).where(Topic.id == final_topic_id))
        t = t_result.scalar_one_or_none()
        if t:
            topic_title = t.title

    # Create test attempt
    attempt = TestAttempt(
        user_id=current_user.id,
        topic_id=final_topic_id,
        ielts_part=request.ielts_part,
        status="in_progress",
    )
    db.add(attempt)
    await db.flush()

    return StartPracticeResponse(
        attempt_id=attempt.id,
        topic_title=topic_title,
        ielts_part=request.ielts_part,
        question=QuestionDetail.model_validate(question),
        status="in_progress",
    )


@router.post("/generate-questions")
async def generate_questions(
    ielts_part: str = Query(..., pattern=r"^(part1|part2|part3)$"),
    count: int = Query(default=3, ge=1, le=5),
    topic_id: UUID | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate multiple random IELTS questions using AI for a multi-question exam flow."""
    from app.config import get_settings
    import json as json_lib
    settings = get_settings()

    questions = []
    
    # Get topic theme if provided
    theme = ""
    target_topic = None
    if topic_id:
        result = await db.execute(select(Topic).where(Topic.id == topic_id))
        target_topic = result.scalar_one_or_none()
        if target_topic:
            theme = f"The questions MUST ALL relate to the theme: '{target_topic.title}'. "

    # Try DB first
    query = select(Question).where(Question.ielts_part == ielts_part, Question.is_active == True)
    if topic_id:
        query = query.where(Question.topic_id == topic_id)
    
    db_result = await db.execute(query.order_by(func.random()).limit(count))
    db_questions = db_result.scalars().all()
    
    for q in db_questions:
        questions.append({
            "id": str(q.id),
            "question_text": q.question_text,
            "ielts_part": q.ielts_part,
            "cue_card_content": q.cue_card_content,
            "difficulty": q.difficulty,
        })

    # If not enough questions in DB, generate the rest with AI
    remaining = count - len(questions)
    if remaining > 0 and settings.GROQ_API_KEY:
        from groq import AsyncGroq
        client = AsyncGroq(api_key=settings.GROQ_API_KEY)
        
        part_desc = {
            "part1": "simple personal questions about everyday topics (hobbies, work, hometown, family, food, etc). Each should be a single direct question.",
            "part2": "a cue card topic with a main prompt and 3-4 bullet points of things to discuss. Include cue_card_content as JSON.",
            "part3": "abstract discussion questions that require the candidate to analyze, compare, or give opinions on societal topics.",
        }
        
        prompt = f"""Generate exactly {remaining} unique IELTS Speaking {ielts_part} questions.
{theme}{part_desc.get(ielts_part, '')}

Return ONLY a JSON object with this structure:
{{
    "questions": [
        {{
            "question_text": "The question text",
            "cue_card_content": null
        }}
    ]
}}

For part2, cue_card_content should be: {{"prompt": "You should say:", "points": ["point 1", "point 2", "point 3"]}}
For part1 and part3, cue_card_content must be null.
Make questions diverse and authentic. Do NOT repeat similar questions."""

        try:
            response = await client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="llama-3.3-70b-versatile",
                response_format={"type": "json_object"},
            )
            ai_data = json_lib.loads(response.choices[0].message.content)
            ai_questions = ai_data.get("questions", [])
            
            ai_topic = await get_or_create_ai_topic(db, ielts_part)
            
            for aq in ai_questions[:remaining]:
                cue = aq.get("cue_card_content")
                new_q = Question(
                    topic_id=target_topic.id if target_topic else ai_topic.id,
                    ielts_part=ielts_part,
                    question_text=aq.get("question_text", "Tell me about yourself."),
                    cue_card_content=json_lib.dumps(cue) if cue else None,
                    difficulty="medium",
                    is_active=True,
                )
                db.add(new_q)
                await db.flush()
                
                questions.append({
                    "id": str(new_q.id),
                    "question_text": new_q.question_text,
                    "ielts_part": ielts_part,
                    "cue_card_content": new_q.cue_card_content,
                    "difficulty": "medium",
                })
        except Exception as e:
            print(f"Error generating questions: {e}")
            import traceback
            traceback.print_exc()

    return {"questions": questions, "count": len(questions)}


@router.get("/tts")
async def get_tts(text: str = Query(...)):
    """Generate high-quality Text-to-Speech using Azure Neural TTS."""
    from fastapi.responses import StreamingResponse
    from app.config import get_settings
    import httpx
    import io
    
    settings = get_settings()
    if not settings.AZURE_SPEECH_KEY:
        raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Azure Speech key not configured")
        
    url = f"https://{settings.AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1"
    headers = {
        "Ocp-Apim-Subscription-Key": settings.AZURE_SPEECH_KEY,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
        "User-Agent": "UnilingoBackend"
    }
    
    # Use a highly expressive neural voice (Jenny is excellent for US English examiner)
    ssml = f"""<speak version='1.0' xml:lang='en-US'><voice xml:lang='en-US' xml:gender='Female' name='en-US-JennyNeural'><prosody rate="-5%">{text}</prosody></voice></speak>"""
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers, content=ssml)
        if response.status_code != 200:
            print(f"Azure TTS Error: {response.text}")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="TTS generation failed")
            
        audio_data = io.BytesIO(response.content)
        return StreamingResponse(audio_data, media_type="audio/mpeg")



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

    import os
    import shutil
    upload_dir = os.path.join(os.getcwd(), "app", "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    
    audio_filename = f"{attempt_id}_part{part_number}.m4a"
    audio_path = os.path.join(upload_dir, audio_filename)
    
    with open(audio_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    audio_url = audio_path

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


@router.post("/transcribe-audio", response_model=TranscribeAudioResponse)
async def transcribe_audio(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    """Upload one mock-test answer audio file and return its transcript."""
    import os
    import shutil
    import uuid

    upload_dir = os.path.join(os.getcwd(), "app", "uploads", "mock_test_transcripts")
    os.makedirs(upload_dir, exist_ok=True)

    safe_user_id = str(current_user.id)
    audio_filename = f"{safe_user_id}_{uuid.uuid4()}.m4a"
    audio_path = os.path.join(upload_dir, audio_filename)

    with open(audio_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    transcript = transcribe_audio_file(audio_path)
    return TranscribeAudioResponse(transcript=transcript)


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
    
    # Calculate XP (50 for part 1, 100 for part 2, 150 for part 3)
    xp = 50 if attempt.ielts_part == "part1" else 100 if attempt.ielts_part == "part2" else 150
    attempt.xp_earned = xp
    
    # Update user XP
    current_user.total_xp += xp
    
    # Update Daily Streak
    from app.models.user import DailyStreak
    from datetime import date, timedelta
    today = date.today()
    
    streak_result = await db.execute(
        select(DailyStreak).where(DailyStreak.user_id == current_user.id, DailyStreak.streak_date == today)
    )
    today_streak = streak_result.scalar_one_or_none()
    
    if not today_streak:
        today_streak = DailyStreak(
            user_id=current_user.id,
            streak_date=today,
            xp_earned=xp,
            tests_completed=1,
            study_minutes=int(attempt.duration_seconds / 60) if attempt.duration_seconds else 5
        )
        db.add(today_streak)
        
        # Check if yesterday had a streak
        yesterday = today - timedelta(days=1)
        yesterday_streak_result = await db.execute(
            select(DailyStreak).where(DailyStreak.user_id == current_user.id, DailyStreak.streak_date == yesterday)
        )
        if yesterday_streak_result.scalar_one_or_none():
            current_user.current_streak += 1
        else:
            current_user.current_streak = 1
            
        if current_user.current_streak > current_user.longest_streak:
            current_user.longest_streak = current_user.current_streak
    else:
        today_streak.xp_earned += xp
        today_streak.tests_completed += 1
        if attempt.duration_seconds:
            today_streak.study_minutes += int(attempt.duration_seconds / 60)

    await db.flush()

    # Enqueue Celery task for AI scoring
    from app.workers.scoring_tasks import score_practice_attempt
    score_practice_attempt.delay(str(attempt_id))

    return SubmitPracticeResponse(
        attempt_id=attempt.id,
        status="scoring",
        message=f"You earned {xp} XP! Your practice is being scored by AI.",
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
            selectinload(TestAttempt.parts).selectinload(AttemptPart.scoring_result),
            selectinload(TestAttempt.parts).selectinload(AttemptPart.question)
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
            scoring.fluency_band = normalize_band(scoring.fluency_band)
            scoring.lexical_band = normalize_band(scoring.lexical_band)
            scoring.grammar_band = normalize_band(scoring.grammar_band)
            scoring.pronunciation_band = normalize_band(scoring.pronunciation_band)
            scoring.overall_band = normalize_band(scoring.overall_band)
        parts_response.append(PartResultResponse(
            part_id=part.id,
            part_number=part.part_number,
            question_text=part.question.question_text if part.question else None,
            has_audio=bool(part.audio_url),
            transcript=part.transcript,
            duration_seconds=part.duration_seconds,
            scoring=scoring,
        ))

    return ScoringResultResponse(
        attempt_id=attempt.id,
        status=attempt.status,
        overall_band=normalize_band(attempt.overall_band),
        fluency_score=normalize_band(attempt.fluency_score),
        lexical_score=normalize_band(attempt.lexical_score),
        grammar_score=normalize_band(attempt.grammar_score),
        pronunciation_score=normalize_band(attempt.pronunciation_score),
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
