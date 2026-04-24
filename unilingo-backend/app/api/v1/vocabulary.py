"""
Vocabulary & Dictionary API routes
"""
from uuid import UUID
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
import httpx

from app.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.vocabulary import VocabularyNote, VocabularyTag
from app.schemas.vocabulary import (
    AddVocabularyRequest, UpdateVocabularyRequest,
    VocabularyResponse, VocabularyListResponse,
    DictionaryLookupResponse, DictionaryMeaning, DictionaryDefinition,
)

router = APIRouter(prefix="/vocabulary", tags=["Vocabulary"])

DICTIONARY_API_URL = "https://api.dictionaryapi.dev/api/v2/entries/en"


@router.get("", response_model=VocabularyListResponse)
async def list_vocabulary(
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=20, ge=1, le=100),
    mastery_level: str | None = Query(None, pattern=r"^(new|learning|reviewing|mastered)$"),
    search: str | None = None,
    sort_by: str = Query(default="created_at", pattern=r"^(created_at|word|mastery_level)$"),
    order: str = Query(default="desc", pattern=r"^(asc|desc)$"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List user's saved vocabulary with filters."""
    query = select(VocabularyNote).where(VocabularyNote.user_id == current_user.id)

    if mastery_level:
        query = query.where(VocabularyNote.mastery_level == mastery_level)
    if search:
        query = query.where(VocabularyNote.word.ilike(f"%{search}%"))

    # Count
    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar() or 0

    # Sort & paginate
    sort_col = getattr(VocabularyNote, sort_by)
    if order == "desc":
        query = query.order_by(desc(sort_col))
    else:
        query = query.order_by(sort_col)
    query = query.offset((page - 1) * per_page).limit(per_page)

    result = await db.execute(query)
    notes = result.scalars().all()

    items = []
    for note in notes:
        # Get tags for this note
        tags_result = await db.execute(
            select(VocabularyTag.tag).where(VocabularyTag.vocabulary_id == note.id)
        )
        tags = [row[0] for row in tags_result.all()]

        resp = VocabularyResponse(
            id=note.id,
            word=note.word,
            phonetic=note.phonetic,
            audio_url=note.audio_url,
            definitions=note.definitions,
            examples=note.examples,
            user_note=note.user_note,
            source_context=note.source_context,
            mastery_level=note.mastery_level,
            review_count=note.review_count,
            next_review_at=note.next_review_at,
            tags=tags,
            created_at=note.created_at,
        )
        items.append(resp)

    return VocabularyListResponse(items=items, total=total, page=page, per_page=per_page)


@router.post("", response_model=VocabularyResponse, status_code=status.HTTP_201_CREATED)
async def add_vocabulary(
    request: AddVocabularyRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Add a word to user's vocabulary notes."""
    # Check if word already saved
    existing = await db.execute(
        select(VocabularyNote).where(
            VocabularyNote.user_id == current_user.id,
            func.lower(VocabularyNote.word) == request.word.lower(),
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Word already saved in your vocabulary"
        )

    note = VocabularyNote(
        user_id=current_user.id,
        word=request.word.lower(),
        phonetic=request.phonetic,
        audio_url=request.audio_url,
        definitions=request.definitions,
        examples=request.examples,
        user_note=request.user_note,
        source_context=request.source_context,
        source_attempt_id=request.source_attempt_id,
    )
    db.add(note)
    await db.flush()

    # Add tags
    tags = []
    if request.tags:
        for tag_name in request.tags:
            tag = VocabularyTag(vocabulary_id=note.id, tag=tag_name.lower())
            db.add(tag)
            tags.append(tag_name.lower())
    await db.flush()

    return VocabularyResponse(
        id=note.id,
        word=note.word,
        phonetic=note.phonetic,
        audio_url=note.audio_url,
        definitions=note.definitions,
        examples=note.examples,
        user_note=note.user_note,
        source_context=note.source_context,
        mastery_level=note.mastery_level,
        review_count=note.review_count,
        next_review_at=note.next_review_at,
        tags=tags,
        created_at=note.created_at,
    )


@router.get("/review-due")
async def get_review_due(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get words that are due for review today (SRS)."""
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)

    result = await db.execute(
        select(VocabularyNote)
        .where(
            VocabularyNote.user_id == current_user.id,
            VocabularyNote.mastery_level.in_(["new", "learning", "reviewing"]),
            (VocabularyNote.next_review_at <= now) | (VocabularyNote.next_review_at == None),
        )
        .order_by(VocabularyNote.next_review_at.asc().nullsfirst())
        .limit(20)
    )
    notes = result.scalars().all()
    return [{"id": str(n.id), "word": n.word, "mastery_level": n.mastery_level} for n in notes]


@router.patch("/{vocabulary_id}", response_model=VocabularyResponse)
async def update_vocabulary(
    vocabulary_id: UUID,
    request: UpdateVocabularyRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a vocabulary note."""
    result = await db.execute(
        select(VocabularyNote).where(
            VocabularyNote.id == vocabulary_id,
            VocabularyNote.user_id == current_user.id,
        )
    )
    note = result.scalar_one_or_none()
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vocabulary note not found")

    update_data = request.model_dump(exclude_unset=True, exclude={"tags"})
    for field, value in update_data.items():
        setattr(note, field, value)

    # Update tags if provided
    if request.tags is not None:
        await db.execute(
            select(VocabularyTag).where(VocabularyTag.vocabulary_id == vocabulary_id)
        )
        # Delete existing tags
        existing_tags = await db.execute(
            select(VocabularyTag).where(VocabularyTag.vocabulary_id == vocabulary_id)
        )
        for tag in existing_tags.scalars().all():
            await db.delete(tag)

        for tag_name in request.tags:
            db.add(VocabularyTag(vocabulary_id=vocabulary_id, tag=tag_name.lower()))

    await db.flush()
    await db.refresh(note)

    tags_result = await db.execute(
        select(VocabularyTag.tag).where(VocabularyTag.vocabulary_id == note.id)
    )
    tags = [row[0] for row in tags_result.all()]

    return VocabularyResponse(
        id=note.id, word=note.word, phonetic=note.phonetic, audio_url=note.audio_url,
        definitions=note.definitions, examples=note.examples, user_note=note.user_note,
        source_context=note.source_context, mastery_level=note.mastery_level,
        review_count=note.review_count, next_review_at=note.next_review_at,
        tags=tags, created_at=note.created_at,
    )


@router.delete("/{vocabulary_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_vocabulary(
    vocabulary_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a vocabulary note."""
    result = await db.execute(
        select(VocabularyNote).where(
            VocabularyNote.id == vocabulary_id,
            VocabularyNote.user_id == current_user.id,
        )
    )
    note = result.scalar_one_or_none()
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vocabulary note not found")
    await db.delete(note)


# ─── Dictionary Lookup (proxy to free API) ───

@router.get("/dictionary/lookup", response_model=DictionaryLookupResponse)
async def dictionary_lookup(
    word: str = Query(..., min_length=1, max_length=100),
):
    """Look up word definition from DictionaryAPI.dev."""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{DICTIONARY_API_URL}/{word.strip().lower()}", timeout=10)
        except httpx.TimeoutException:
            raise HTTPException(status_code=status.HTTP_504_GATEWAY_TIMEOUT, detail="Dictionary API timeout")

    if response.status_code == 404:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Word '{word}' not found in dictionary")
    if response.status_code != 200:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Dictionary API error")

    data = response.json()
    entry = data[0] if isinstance(data, list) and data else {}

    # Extract phonetic
    phonetic = entry.get("phonetic", "")
    audio_url = None
    for ph in entry.get("phonetics", []):
        if ph.get("audio"):
            audio_url = ph["audio"]
            if not phonetic and ph.get("text"):
                phonetic = ph["text"]
            break

    # Extract meanings
    meanings = []
    for meaning in entry.get("meanings", []):
        defs = []
        for d in meaning.get("definitions", []):
            defs.append(DictionaryDefinition(
                definition=d.get("definition", ""),
                example=d.get("example"),
                synonyms=d.get("synonyms", [])[:5],
                antonyms=d.get("antonyms", [])[:5],
            ))
        meanings.append(DictionaryMeaning(
            part_of_speech=meaning.get("partOfSpeech", ""),
            definitions=defs[:3],  # Limit to 3 definitions per part of speech
        ))

    return DictionaryLookupResponse(
        word=word.strip().lower(),
        phonetic=phonetic or None,
        audio_url=audio_url,
        meanings=meanings,
    )
