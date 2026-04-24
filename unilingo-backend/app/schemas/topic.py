"""
Pydantic schemas for Topics
"""
import uuid
from datetime import datetime
from pydantic import BaseModel, Field


class TopicResponse(BaseModel):
    id: uuid.UUID
    title: str
    title_vi: str | None
    description: str | None
    category: str
    ielts_part: str
    difficulty: str
    icon: str | None
    is_active: bool
    order_index: int
    question_count: int = 0

    model_config = {"from_attributes": True}


class TopicListResponse(BaseModel):
    items: list[TopicResponse]
    total: int


class TopicDetailResponse(BaseModel):
    topic: TopicResponse
    questions: list["QuestionResponse"]


class QuestionResponse(BaseModel):
    id: uuid.UUID
    question_text: str
    question_text_vi: str | None
    ielts_part: str
    cue_card_content: str | None
    follow_up_questions: dict | None
    difficulty: str
    key_vocabulary: list[dict] | None

    model_config = {"from_attributes": True}


# ─── Admin schemas ───

class CreateTopicRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    title_vi: str | None = None
    description: str | None = None
    category: str = Field(..., min_length=1, max_length=50)
    ielts_part: str = Field(..., pattern=r"^(part1|part2|part3)$")
    difficulty: str = Field(default="medium", pattern=r"^(easy|medium|hard)$")
    icon: str | None = None
    is_active: bool = True
    order_index: int = 0


class UpdateTopicRequest(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=255)
    title_vi: str | None = None
    description: str | None = None
    category: str | None = None
    difficulty: str | None = None
    icon: str | None = None
    is_active: bool | None = None
    order_index: int | None = None


class CreateQuestionRequest(BaseModel):
    topic_id: uuid.UUID
    question_text: str = Field(..., min_length=1)
    question_text_vi: str | None = None
    ielts_part: str = Field(..., pattern=r"^(part1|part2|part3)$")
    cue_card_content: str | None = None
    follow_up_questions: dict | None = None
    difficulty: str = Field(default="medium", pattern=r"^(easy|medium|hard)$")
    sample_answer: dict | None = None
    key_vocabulary: list[dict] | None = None
    is_active: bool = True
    order_index: int = 0


class UpdateQuestionRequest(BaseModel):
    question_text: str | None = None
    question_text_vi: str | None = None
    cue_card_content: str | None = None
    follow_up_questions: dict | None = None
    difficulty: str | None = None
    sample_answer: dict | None = None
    key_vocabulary: list[dict] | None = None
    is_active: bool | None = None
    order_index: int | None = None
