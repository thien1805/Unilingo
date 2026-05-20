"""
Celery tasks for AI scoring pipeline.
Uses synchronous DB connections to avoid asyncio event loop conflicts.
"""
from app.workers.celery_app import celery_app


def _normalize_band(value) -> float | None:
    """Clamp IELTS band to 0.0-9.0 and round to the nearest .0/.5 step."""
    if value is None:
        return None
    try:
        band = float(value)
    except (TypeError, ValueError):
        return None
    return max(0.0, min(9.0, round(band * 2) / 2))


def _normalize_scoring_bands(scoring: dict) -> dict:
    for key in (
        "fluency_band",
        "lexical_band",
        "grammar_band",
        "pronunciation_band",
        "overall_band",
    ):
        scoring[key] = _normalize_band(scoring.get(key))
    return scoring


@celery_app.task(bind=True, max_retries=3, default_retry_delay=30)
def score_practice_attempt(self, attempt_id: str):
    """
    Run the full AI scoring pipeline for a practice attempt.
    Uses synchronous SQLAlchemy + synchronous Groq client.
    """
    try:
        result = score_practice_attempt_sync(attempt_id, raise_on_error=True)
        print(f"Scoring complete for attempt {attempt_id}: band={result.get('overall_band')}")
        return result
    except Exception as e:
        print(f"Scoring failed for attempt {attempt_id}: {e}")
        import traceback
        traceback.print_exc()
        raise self.retry(exc=e)


def _get_sync_database_url(database_url: str) -> str:
    if "+asyncpg" in database_url:
        return database_url.replace("+asyncpg", "+psycopg2")
    if database_url.startswith("postgresql://"):
        return database_url.replace("postgresql://", "postgresql+psycopg2://", 1)
    return database_url


def score_practice_attempt_sync(attempt_id: str, raise_on_error: bool = False) -> dict:
    """Score an attempt using a short-lived synchronous DB session."""
    from uuid import UUID
    from sqlalchemy import create_engine
    from sqlalchemy.orm import Session
    from app.config import get_settings

    settings = get_settings()

    sync_url = _get_sync_database_url(settings.DATABASE_URL)
    try:
        engine = create_engine(sync_url, echo=False, pool_pre_ping=True)
    except Exception:
        sync_url = settings.DATABASE_URL.replace("+asyncpg", "+psycopg")
        engine = create_engine(sync_url, echo=False, pool_pre_ping=True)

    try:
        with Session(engine) as db:
            result = score_practice_attempt_in_session(
                db=db,
                attempt_id=UUID(attempt_id),
                settings=settings,
                raise_on_error=raise_on_error,
            )
            db.commit()
            return result
    finally:
        engine.dispose()


def score_practice_attempt_in_session(db, attempt_id, settings, raise_on_error: bool = False) -> dict:
    """Run scoring and persist results inside an existing synchronous Session."""
    from concurrent.futures import ThreadPoolExecutor, as_completed
    from datetime import datetime, timezone
    from sqlalchemy import select
    from sqlalchemy.orm import selectinload
    from app.models.practice import TestAttempt, AttemptPart, AIScoringResult

    attempt = db.execute(
        select(TestAttempt)
        .options(
            selectinload(TestAttempt.parts).selectinload(AttemptPart.question),
            selectinload(TestAttempt.parts).selectinload(AttemptPart.scoring_result),
        )
        .where(TestAttempt.id == attempt_id)
    ).scalar_one_or_none()

    if not attempt:
        raise ValueError(f"Attempt {attempt_id} not found")

    try:
        scored_rows = []
        parts_to_score = [
            part for part in attempt.parts
            if part.audio_url and not part.scoring_result
        ]

        if not attempt.parts or not any(part.audio_url for part in attempt.parts):
            raise ValueError("No uploaded audio found for this attempt")

        for part in attempt.parts:
            if part.scoring_result:
                scored_rows.append({
                    "fluency_band": part.scoring_result.fluency_band,
                    "lexical_band": part.scoring_result.lexical_band,
                    "grammar_band": part.scoring_result.grammar_band,
                    "pronunciation_band": part.scoring_result.pronunciation_band,
                    "overall_band": part.scoring_result.overall_band,
                })

        part_by_id = {part.id: part for part in parts_to_score}
        ielts_part = attempt.ielts_part

        def score_part(part_id, audio_url, question_text):
            return part_id, _run_scoring_sync(
                audio_url=audio_url,
                question_text=question_text,
                ielts_part=ielts_part,
                settings=settings,
            )

        if parts_to_score:
            max_workers = max(1, min(3, len(parts_to_score)))
            with ThreadPoolExecutor(max_workers=max_workers) as executor:
                futures = [
                    executor.submit(
                        score_part,
                        part.id,
                        part.audio_url,
                        part.question.question_text if part.question else "General speaking",
                    )
                    for part in parts_to_score
                ]
                for future in as_completed(futures):
                    part_id, scoring = future.result()
                    part = part_by_id[part_id]
                    part.transcript = scoring.get("transcript", "")

                    ai_result = AIScoringResult(
                        attempt_part_id=part.id,
                        fluency_band=scoring.get("fluency_band"),
                        lexical_band=scoring.get("lexical_band"),
                        grammar_band=scoring.get("grammar_band"),
                        pronunciation_band=scoring.get("pronunciation_band"),
                        overall_band=scoring.get("overall_band"),
                        pronunciation_details=scoring.get("pronunciation_details"),
                        feedback=scoring.get("feedback"),
                        strengths=scoring.get("strengths"),
                        weaknesses=scoring.get("weaknesses"),
                        suggested_improvements=scoring.get("suggested_improvements"),
                        sample_better_answer=scoring.get("sample_better_answer"),
                        grammar_errors=scoring.get("grammar_errors"),
                        vocabulary_suggestions=scoring.get("vocabulary_suggestions"),
                    )
                    db.add(ai_result)
                    scored_rows.append(scoring)

        totals = {
            "fluency": 0,
            "lexical": 0,
            "grammar": 0,
            "pronunciation": 0,
            "overall": 0,
        }
        part_count = 0

        for scoring in scored_rows:
            if scoring.get("fluency_band") is None:
                continue
            totals["fluency"] += scoring.get("fluency_band") or 0
            totals["lexical"] += scoring.get("lexical_band") or 0
            totals["grammar"] += scoring.get("grammar_band") or 0
            totals["pronunciation"] += scoring.get("pronunciation_band") or 0
            totals["overall"] += scoring.get("overall_band") or 0
            part_count += 1

        if part_count == 0:
            raise ValueError("AI scoring returned no usable band scores")

        attempt.fluency_score = _normalize_band(totals["fluency"] / part_count)
        attempt.lexical_score = _normalize_band(totals["lexical"] / part_count)
        attempt.grammar_score = _normalize_band(totals["grammar"] / part_count)
        attempt.pronunciation_score = _normalize_band(totals["pronunciation"] / part_count)
        attempt.overall_band = _normalize_band(
            (attempt.fluency_score + attempt.lexical_score +
             attempt.grammar_score + attempt.pronunciation_score) / 4
        )
        attempt.xp_earned = int((attempt.overall_band or 0) * 10)
        attempt.status = "completed"
        attempt.completed_at = datetime.now(timezone.utc)

        return {
            "attempt_id": str(attempt.id),
            "status": attempt.status,
            "overall_band": attempt.overall_band,
            "scored_parts": part_count,
        }

    except Exception as e:
        attempt.status = "failed"
        db.flush()
        if raise_on_error:
            raise
        return {
            "attempt_id": str(attempt.id),
            "status": "failed",
            "error": str(e),
        }


def _run_scoring_sync(audio_url: str, question_text: str, ielts_part: str, settings) -> dict:
    """
    Run the scoring pipeline synchronously (no async).
    """
    from concurrent.futures import ThreadPoolExecutor
    from app.services.storage_service import materialize_audio_file

    with materialize_audio_file(audio_url, settings) as local_audio_path:
        with ThreadPoolExecutor(max_workers=2) as executor:
            transcript_future = executor.submit(_transcribe_sync, local_audio_path, settings)
            pronunciation_future = executor.submit(_assess_pronunciation_sync, local_audio_path, settings)
            transcript = transcript_future.result()
            pronunciation_data = pronunciation_future.result()

    scoring_result = _score_with_llm_sync(
        transcript=transcript,
        question_text=question_text,
        ielts_part=ielts_part,
        pronunciation_data=pronunciation_data,
        settings=settings,
    )

    return {
        "transcript": transcript,
        "pronunciation_details": pronunciation_data,
        **scoring_result,
    }


def _transcribe_sync(audio_url: str, settings) -> str:
    """Transcribe audio using Groq Whisper model (synchronous)."""
    if not settings.GROQ_API_KEY:
        return ""

    import os
    if not os.path.exists(audio_url):
        return f"[Error] Audio file not found: {audio_url}"

    try:
        from groq import Groq
        client = Groq(api_key=settings.GROQ_API_KEY)
        
        with open(audio_url, "rb") as file:
            transcription = client.audio.transcriptions.create(
                file=(os.path.basename(audio_url), file.read()),
                model=settings.GROQ_TRANSCRIPTION_MODEL,
                response_format="text",
                language="en"
            )
        
        # Groq returns plain text when response_format="text"
        return str(transcription).strip() or "No speech could be recognized."
    except Exception as e:
        print(f"Groq STT error: {e}")
        return ""


def _assess_pronunciation_sync(audio_url: str, settings) -> dict:
    """Assess pronunciation using Azure (synchronous)."""
    if not settings.AZURE_SPEECH_KEY:
        return {"accuracy_score": 78.5, "fluency_score": 72.3, "prosody_score": 68.9}

    import os
    if not os.path.exists(audio_url):
        return {"error": "Audio file not found"}

    try:
        import azure.cognitiveservices.speech as speechsdk
        speech_config = speechsdk.SpeechConfig(
            subscription=settings.AZURE_SPEECH_KEY,
            region=settings.AZURE_SPEECH_REGION,
        )
        pronunciation_config = speechsdk.PronunciationAssessmentConfig(
            grading_system=speechsdk.PronunciationAssessmentGradingSystem.HundredMark,
            granularity=speechsdk.PronunciationAssessmentGranularity.Phoneme,
            enable_miscue=True,
        )
        pronunciation_config.enable_prosody_assessment()
        audio_config = speechsdk.audio.AudioConfig(filename=audio_url)
        recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config, audio_config=audio_config)
        pronunciation_config.apply_to(recognizer)
        result = recognizer.recognize_once()

        if result.reason == speechsdk.ResultReason.RecognizedSpeech:
            pron_result = speechsdk.PronunciationAssessmentResult(result)
            return {
                "accuracy_score": pron_result.accuracy_score,
                "fluency_score": pron_result.fluency_score,
                "prosody_score": getattr(pron_result, "prosody_score", 0),
                "completeness_score": pron_result.completeness_score,
                "pronunciation_score": pron_result.pronunciation_score,
            }
        return {"error": f"Recognition failed: {result.reason}"}
    except Exception as e:
        print(f"Azure pronunciation error: {e}")
        return {"error": str(e)}


def _score_with_llm_sync(transcript, question_text, ielts_part, pronunciation_data, settings) -> dict:
    """Score using Groq synchronous client."""
    import json
    from app.ai.scoring_service import SCORING_PROMPT_TEMPLATE

    fast_prompt_template = """You are an IELTS Speaking examiner. Score this answer quickly and fairly.

Context:
- IELTS Part: {ielts_part}
- Question: {question_text}
- Transcript: {transcript}
- Pronunciation data: {pronunciation_data}

Return ONLY compact JSON with this exact shape:
{{
  "fluency_band": <float>,
  "lexical_band": <float>,
  "grammar_band": <float>,
  "pronunciation_band": <float>,
  "overall_band": <float>,
  "feedback": {{"summary": "<one sentence>", "detailed": "<2 short sentences>"}},
  "strengths": ["<max 2>"],
  "weaknesses": ["<max 2>"],
  "suggested_improvements": ["<max 2>"],
  "sample_better_answer": {{"text": "<short improved answer>", "explanation": "<one sentence>"}},
  "grammar_errors": [],
  "vocabulary_suggestions": []
}}
Use IELTS 0.0-9.0 bands in 0.5 increments."""

    detail_mode = (settings.AI_SCORING_DETAIL_MODE or "fast").strip().lower()
    template = fast_prompt_template if detail_mode == "fast" else SCORING_PROMPT_TEMPLATE

    prompt = template.format(
        ielts_part=ielts_part,
        question_text=question_text,
        transcript=transcript,
        pronunciation_data=json.dumps(pronunciation_data),
    )

    if not settings.GROQ_API_KEY:
        return _normalize_scoring_bands({
            "fluency_band": 6.5, "lexical_band": 6.0, "grammar_band": 6.5,
            "pronunciation_band": 6.0, "overall_band": 6.5,
            "feedback": {"summary": "Good attempt.", "detailed": "Solid performance."},
            "strengths": ["Good topic development"],
            "weaknesses": ["Limited vocabulary"],
            "suggested_improvements": ["Use more complex sentences"],
            "sample_better_answer": {"text": "Example answer...", "explanation": "Better vocabulary."},
            "grammar_errors": [],
            "vocabulary_suggestions": [],
        })

    from groq import Groq
    client = Groq(api_key=settings.GROQ_API_KEY)

    response = client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model=settings.GROQ_SCORING_MODEL,
        response_format={"type": "json_object"},
        temperature=0.2,
        max_tokens=settings.GROQ_SCORING_MAX_TOKENS,
    )

    try:
        text = response.choices[0].message.content
        return _normalize_scoring_bands(json.loads(text))
    except json.JSONDecodeError:
        text = response.choices[0].message.content
        start = text.find("{")
        end = text.rfind("}") + 1
        if start != -1 and end > start:
            return _normalize_scoring_bands(json.loads(text[start:end]))
        raise ValueError(f"Failed to parse LLM response: {text[:200]}")
