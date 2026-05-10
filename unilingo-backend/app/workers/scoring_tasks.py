"""
Celery tasks for AI scoring pipeline.
Uses synchronous DB connections to avoid asyncio event loop conflicts.
"""
from app.workers.celery_app import celery_app


@celery_app.task(bind=True, max_retries=3, default_retry_delay=30)
def score_practice_attempt(self, attempt_id: str):
    """
    Run the full AI scoring pipeline for a practice attempt.
    Uses synchronous SQLAlchemy + synchronous Groq client.
    """
    import json
    from uuid import UUID
    from datetime import datetime, timezone
    from sqlalchemy import create_engine, select
    from sqlalchemy.orm import Session, selectinload
    from app.config import get_settings

    settings = get_settings()

    # Create a SYNCHRONOUS engine (not async) to avoid event loop issues
    sync_url = settings.DATABASE_URL.replace("+asyncpg", "+psycopg2")
    # Install psycopg2 fallback
    try:
        engine = create_engine(sync_url, echo=False)
    except Exception:
        # psycopg2 not available, try psycopg
        sync_url = settings.DATABASE_URL.replace("+asyncpg", "+psycopg")
        engine = create_engine(sync_url, echo=False)

    from app.models.practice import TestAttempt, AttemptPart, AIScoringResult
    from app.models.topic import Question

    with Session(engine) as db:
        # Load attempt with parts
        attempt = db.execute(
            select(TestAttempt)
            .options(
                selectinload(TestAttempt.parts).selectinload(AttemptPart.question)
            )
            .where(TestAttempt.id == UUID(attempt_id))
        ).scalar_one_or_none()

        if not attempt:
            print(f"❌ Attempt {attempt_id} not found")
            return

        try:
            total_fluency = 0
            total_lexical = 0
            total_grammar = 0
            total_pronunciation = 0
            part_count = 0

            for part in attempt.parts:
                if not part.audio_url:
                    continue

                question_text = part.question.question_text if part.question else "General speaking"

                # Run scoring pipeline synchronously
                scoring = _run_scoring_sync(
                    audio_url=part.audio_url,
                    question_text=question_text,
                    ielts_part=attempt.ielts_part,
                    settings=settings,
                )

                # Save transcript
                part.transcript = scoring.get("transcript", "")
                
                print(f"DEBUG SCORING RESULT for part {part.id}: {scoring}")

                # Save scoring result
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

                if scoring.get("fluency_band") is not None:
                    total_fluency += scoring["fluency_band"]
                    total_lexical += scoring.get("lexical_band", 0)
                    total_grammar += scoring.get("grammar_band", 0)
                    total_pronunciation += scoring.get("pronunciation_band", 0)
                    part_count += 1

            # Update attempt with averaged scores
            if part_count > 0:
                attempt.fluency_score = round(total_fluency / part_count, 1)
                attempt.lexical_score = round(total_lexical / part_count, 1)
                attempt.grammar_score = round(total_grammar / part_count, 1)
                attempt.pronunciation_score = round(total_pronunciation / part_count, 1)
                attempt.overall_band = round(
                    (attempt.fluency_score + attempt.lexical_score +
                     attempt.grammar_score + attempt.pronunciation_score) / 4 * 2
                ) / 2  # Round to nearest 0.5

                attempt.xp_earned = int(attempt.overall_band * 10)

            attempt.status = "completed"
            attempt.completed_at = datetime.now(timezone.utc)

            db.commit()
            print(f"✅ Scoring complete for attempt {attempt_id}: band={attempt.overall_band}")

        except Exception as e:
            attempt.status = "failed"
            db.commit()
            print(f"❌ Scoring failed for attempt {attempt_id}: {e}")
            import traceback
            traceback.print_exc()
            raise self.retry(exc=e)


def _run_scoring_sync(audio_url: str, question_text: str, ielts_part: str, settings) -> dict:
    """
    Run the scoring pipeline synchronously (no async).
    """
    import json
    import os

    # Step 1: Speech-to-Text via Azure
    transcript = _transcribe_sync(audio_url, settings)

    # Step 2: Pronunciation Assessment via Azure
    pronunciation_data = _assess_pronunciation_sync(audio_url, settings)

    # Step 3: LLM Scoring via Groq (synchronous client)
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
        return "[Mock] I would like to talk about a place I visited recently. It was a beautiful beach."

    import os
    if not os.path.exists(audio_url):
        return f"[Error] Audio file not found: {audio_url}"

    try:
        from groq import Groq
        client = Groq(api_key=settings.GROQ_API_KEY)
        
        with open(audio_url, "rb") as file:
            transcription = client.audio.transcriptions.create(
                file=(os.path.basename(audio_url), file.read()),
                model="whisper-large-v3",
                response_format="text",
                language="en"
            )
        
        # Groq returns plain text when response_format="text"
        return str(transcription).strip() or "No speech could be recognized."
    except Exception as e:
        print(f"Groq STT error: {e}")
        return f"[Transcription failed: {e}]"


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

    prompt = SCORING_PROMPT_TEMPLATE.format(
        ielts_part=ielts_part,
        question_text=question_text,
        transcript=transcript,
        pronunciation_data=json.dumps(pronunciation_data),
    )

    if not settings.GROQ_API_KEY:
        return {
            "fluency_band": 6.5, "lexical_band": 6.0, "grammar_band": 6.5,
            "pronunciation_band": 6.0, "overall_band": 6.5,
            "feedback": {"summary": "Good attempt.", "detailed": "Solid performance."},
            "strengths": ["Good topic development"],
            "weaknesses": ["Limited vocabulary"],
            "suggested_improvements": ["Use more complex sentences"],
            "sample_better_answer": {"text": "Example answer...", "explanation": "Better vocabulary."},
            "grammar_errors": [],
            "vocabulary_suggestions": [],
        }

    from groq import Groq
    client = Groq(api_key=settings.GROQ_API_KEY)

    response = client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model="llama-3.3-70b-versatile",
        response_format={"type": "json_object"},
    )

    try:
        text = response.choices[0].message.content
        return json.loads(text)
    except json.JSONDecodeError:
        text = response.choices[0].message.content
        start = text.find("{")
        end = text.rfind("}") + 1
        if start != -1 and end > start:
            return json.loads(text[start:end])
        raise ValueError(f"Failed to parse LLM response: {text[:200]}")
