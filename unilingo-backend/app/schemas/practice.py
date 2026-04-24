"""
Pydantic schemas for Practice & AI Scoring
"""
import uuid
from datetime import datetime
from pydantic import BaseModel, Field


class StartPracticeRequest(BaseModel):
    topic_id: uuid.UUID
    ielts_part: str = Field(..., pattern=r"^(part1|part2|part3)$")
    question_id: uuid.UUID | None = None


class StartPracticeResponse(BaseModel):
    attempt_id: uuid.UUID
    topic_title: str
    ielts_part: str
    question: "QuestionDetail"
    status: str

    model_config = {"from_attributes": True}


class QuestionDetail(BaseModel):
    id: uuid.UUID
    question_text: str
    question_text_vi: str | None
    ielts_part: str
    cue_card_content: str | None
    follow_up_questions: dict | None
    sample_answer: dict | None

    model_config = {"from_attributes": True}


class UploadAudioResponse(BaseModel):
    part_id: uuid.UUID
    audio_url: str
    duration_seconds: int | None


class SubmitPracticeResponse(BaseModel):
    attempt_id: uuid.UUID
    status: str  # "scoring"
    message: str


class ScoringResultResponse(BaseModel):
    attempt_id: uuid.UUID
    status: str
    overall_band: float | None
    fluency_score: float | None
    lexical_score: float | None
    grammar_score: float | None
    pronunciation_score: float | None
    duration_seconds: int | None
    xp_earned: int
    parts: list["PartResultResponse"]

    model_config = {"from_attributes": True}


class PartResultResponse(BaseModel):
    part_id: uuid.UUID
    part_number: int
    transcript: str | None
    duration_seconds: int | None
    scoring: "AIScoringResponse | None"

    model_config = {"from_attributes": True}


class AIScoringResponse(BaseModel):
    fluency_band: float | None
    lexical_band: float | None
    grammar_band: float | None
    pronunciation_band: float | None
    overall_band: float | None
    pronunciation_details: dict | None
    feedback: dict | None
    strengths: list[str] | None
    weaknesses: list[str] | None
    suggested_improvements: list[str] | None
    sample_better_answer: dict | None
    grammar_errors: list[dict] | None
    vocabulary_suggestions: list[dict] | None

    model_config = {"from_attributes": True}


class PracticeHistoryItem(BaseModel):
    attempt_id: uuid.UUID
    topic_title: str
    ielts_part: str
    overall_band: float | None
    status: str
    duration_seconds: int | None
    started_at: datetime
    completed_at: datetime | None

    model_config = {"from_attributes": True}


class PracticeHistoryResponse(BaseModel):
    items: list[PracticeHistoryItem]
    total: int
    page: int
    per_page: int


class PracticeStatsResponse(BaseModel):
    total_tests: int
    total_hours: float
    avg_band_score: float
    best_band_score: float
    part1_avg: float | None
    part2_avg: float | None
    part3_avg: float | None
    tests_this_week: int
    improvement_pct: float  # % improvement over last month
