"""
Celery tasks for AI scoring pipeline.
"""
from app.workers.celery_app import celery_app


@celery_app.task(bind=True, max_retries=3, default_retry_delay=30)
def score_practice_attempt(self, attempt_id: str):
    """
    Run the full AI scoring pipeline for a practice attempt.
    
    This task is enqueued when a user submits their practice.
    It runs: STT → Pronunciation Assessment → LLM Scoring → Save Results
    """
    import asyncio
    from uuid import UUID

    async def _score():
        from sqlalchemy import select
        from sqlalchemy.orm import selectinload
        from app.database import AsyncSessionLocal
        from app.models.practice import TestAttempt, AttemptPart, AIScoringResult
        from app.models.topic import Question
        from app.ai.scoring_service import run_scoring_pipeline
        from datetime import datetime, timezone

        async with AsyncSessionLocal() as db:
            # Load attempt with parts
            result = await db.execute(
                select(TestAttempt)
                .options(
                    selectinload(TestAttempt.parts).selectinload(AttemptPart.question)
                )
                .where(TestAttempt.id == UUID(attempt_id))
            )
            attempt = result.scalar_one_or_none()

            if not attempt:
                print(f"Attempt {attempt_id} not found")
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

                    # Run AI pipeline
                    scoring = await run_scoring_pipeline(
                        audio_url=part.audio_url,
                        question_text=question_text,
                        ielts_part=attempt.ielts_part,
                    )

                    # Save transcript
                    part.transcript = scoring.get("transcript", "")

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

                    if scoring.get("fluency_band"):
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

                    # Calculate XP (10 XP per band point)
                    attempt.xp_earned = int(attempt.overall_band * 10)

                attempt.status = "completed"
                attempt.completed_at = datetime.now(timezone.utc)

                await db.commit()
                print(f"✅ Scoring complete for attempt {attempt_id}: band={attempt.overall_band}")

            except Exception as e:
                attempt.status = "failed"
                await db.commit()
                print(f"❌ Scoring failed for attempt {attempt_id}: {e}")
                raise self.retry(exc=e)

    asyncio.run(_score())
