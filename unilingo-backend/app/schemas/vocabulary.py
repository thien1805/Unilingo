"""
Pydantic schemas for Vocabulary
"""
import uuid
from datetime import datetime
from pydantic import BaseModel, Field


class AddVocabularyRequest(BaseModel):
    word: str = Field(..., min_length=1, max_length=100)
    phonetic: str | None = None
    audio_url: str | None = None
    definitions: list[dict] | None = None
    examples: list[str] | None = None
    user_note: str | None = None
    source_context: str | None = None
    source_attempt_id: uuid.UUID | None = None
    tags: list[str] | None = None


class UpdateVocabularyRequest(BaseModel):
    user_note: str | None = None
    examples: list[str] | None = None
    mastery_level: str | None = Field(None, pattern=r"^(new|learning|reviewing|mastered)$")
    tags: list[str] | None = None


class VocabularyResponse(BaseModel):
    id: uuid.UUID
    word: str
    phonetic: str | None
    audio_url: str | None
    definitions: list[dict] | None
    examples: list[str] | None
    user_note: str | None
    source_context: str | None
    mastery_level: str
    review_count: int
    next_review_at: datetime | None
    tags: list[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class VocabularyListResponse(BaseModel):
    items: list[VocabularyResponse]
    total: int
    page: int
    per_page: int


class DictionaryLookupResponse(BaseModel):
    word: str
    phonetic: str | None
    audio_url: str | None
    meanings: list["DictionaryMeaning"]


class DictionaryMeaning(BaseModel):
    part_of_speech: str
    definitions: list["DictionaryDefinition"]


class DictionaryDefinition(BaseModel):
    definition: str
    example: str | None = None
    synonyms: list[str] = []
    antonyms: list[str] = []
