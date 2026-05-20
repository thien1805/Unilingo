import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.database import get_db
from app.models.forecast import DailyForecast
from app.models.user import User
from app.api.deps import get_current_user

router = APIRouter(prefix="/forecast", tags=["Forecast"])

class ForecastCreate(BaseModel):
    title: str
    skill_category: str
    excerpt: str | None = None
    content: str
    cover_image_url: str | None = None

class ForecastUpdate(BaseModel):
    title: str | None = None
    skill_category: str | None = None
    excerpt: str | None = None
    content: str | None = None
    cover_image_url: str | None = None

class ForecastResponse(BaseModel):
    id: uuid.UUID
    title: str
    skill_category: str
    excerpt: str | None
    content: str
    cover_image_url: str | None
    created_at: datetime
    updated_at: datetime | None

    model_config = {"from_attributes": True}

@router.get("", response_model=dict)
async def list_forecasts(
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=20, ge=1, le=100),
    skill: str | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
):
    query = select(DailyForecast)
    if skill:
        query = query.where(DailyForecast.skill_category == skill)
    
    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar() or 0
    
    query = query.order_by(DailyForecast.created_at.desc())
    query = query.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    posts = result.scalars().all()
    
    return {
        "items": [ForecastResponse.model_validate(p) for p in posts],
        "total": total,
        "page": page,
        "per_page": per_page,
    }

@router.post("/admin/create", response_model=ForecastResponse)
async def create_forecast(
    payload: ForecastCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    
    post = DailyForecast(
        title=payload.title,
        skill_category=payload.skill_category,
        excerpt=payload.excerpt,
        content=payload.content,
        cover_image_url=payload.cover_image_url,
    )
    db.add(post)
    await db.commit()
    await db.refresh(post)
    return ForecastResponse.model_validate(post)

@router.put("/admin/{post_id}", response_model=ForecastResponse)
async def update_forecast(
    post_id: uuid.UUID,
    payload: ForecastUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    
    result = await db.execute(select(DailyForecast).where(DailyForecast.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Forecast not found")
    
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(post, key, value)
    
    await db.commit()
    await db.refresh(post)
    return ForecastResponse.model_validate(post)

@router.delete("/admin/{post_id}")
async def delete_forecast(
    post_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    
    result = await db.execute(select(DailyForecast).where(DailyForecast.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Forecast not found")
    
    await db.delete(post)
    await db.commit()
    return {"detail": "Forecast deleted"}
