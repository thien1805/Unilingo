"""
Blog API — Public endpoints for reading posts + Admin endpoints for CRUD.
"""
import uuid
import re
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Query, HTTPException, status, Body
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.database import get_db
from app.models.blog import BlogPost
from app.models.user import User
from app.api.deps import get_current_user

router = APIRouter(prefix="/blog", tags=["Blog"])


# ─── Schemas ───

class BlogPostCreate(BaseModel):
    title: str
    excerpt: str | None = None
    content: str
    cover_image_url: str | None = None
    author_name: str = "Unilingo Team"
    category: str = "tips"
    tags: list[str] | None = None
    read_time_minutes: int = 3
    is_published: bool = False
    is_featured: bool = False


class BlogPostUpdate(BaseModel):
    title: str | None = None
    excerpt: str | None = None
    content: str | None = None
    cover_image_url: str | None = None
    author_name: str | None = None
    category: str | None = None
    tags: list[str] | None = None
    read_time_minutes: int | None = None
    is_published: bool | None = None
    is_featured: bool | None = None


class BlogPostResponse(BaseModel):
    id: uuid.UUID
    title: str
    slug: str
    excerpt: str | None
    content: str
    cover_image_url: str | None
    author_name: str
    author_avatar: str | None
    category: str
    tags: list[str] | None
    read_time_minutes: int
    is_published: bool
    is_featured: bool
    view_count: int
    published_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}


class BlogPostSummary(BaseModel):
    id: uuid.UUID
    title: str
    slug: str
    excerpt: str | None
    cover_image_url: str | None
    author_name: str
    category: str
    tags: list[str] | None
    read_time_minutes: int
    is_featured: bool
    view_count: int
    published_at: datetime | None

    model_config = {"from_attributes": True}


# ─── Helpers ───

def generate_slug(title: str) -> str:
    slug = re.sub(r'[^a-zA-Z0-9\s-]', '', title.lower())
    slug = re.sub(r'[\s-]+', '-', slug).strip('-')
    return slug[:200]


# ─── Public Endpoints ───

@router.get("", response_model=dict)
async def list_blog_posts(
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=10, ge=1, le=50),
    category: str | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
):
    """List published blog posts (public)."""
    query = select(BlogPost).where(BlogPost.is_published == True)
    if category:
        query = query.where(BlogPost.category == category)
    
    # Count
    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar() or 0
    
    # Fetch
    query = query.order_by(BlogPost.published_at.desc().nullslast())
    query = query.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    posts = result.scalars().all()
    
    return {
        "items": [BlogPostSummary.model_validate(p) for p in posts],
        "total": total,
        "page": page,
        "per_page": per_page,
    }


@router.get("/featured", response_model=list[BlogPostSummary])
async def get_featured_posts(
    limit: int = Query(default=5, ge=1, le=10),
    db: AsyncSession = Depends(get_db),
):
    """Get featured blog posts for homepage carousel."""
    result = await db.execute(
        select(BlogPost)
        .where(BlogPost.is_published == True, BlogPost.is_featured == True)
        .order_by(BlogPost.published_at.desc().nullslast())
        .limit(limit)
    )
    return [BlogPostSummary.model_validate(p) for p in result.scalars().all()]


@router.get("/{slug}", response_model=BlogPostResponse)
async def get_blog_post(
    slug: str,
    db: AsyncSession = Depends(get_db),
):
    """Get a single blog post by slug (public)."""
    result = await db.execute(
        select(BlogPost).where(BlogPost.slug == slug, BlogPost.is_published == True)
    )
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    
    # Increment view count
    post.view_count += 1
    await db.commit()
    
    return BlogPostResponse.model_validate(post)


# ─── Admin Endpoints ───

@router.post("/admin/create", response_model=BlogPostResponse)
async def create_blog_post(
    payload: BlogPostCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new blog post (admin only)."""
    if not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    
    slug = generate_slug(payload.title)
    # Ensure unique slug
    existing = await db.execute(select(BlogPost).where(BlogPost.slug == slug))
    if existing.scalar_one_or_none():
        slug = f"{slug}-{uuid.uuid4().hex[:6]}"
    
    post = BlogPost(
        title=payload.title,
        slug=slug,
        excerpt=payload.excerpt,
        content=payload.content,
        cover_image_url=payload.cover_image_url,
        author_name=payload.author_name,
        category=payload.category,
        tags=payload.tags,
        read_time_minutes=payload.read_time_minutes,
        is_published=payload.is_published,
        is_featured=payload.is_featured,
        published_at=datetime.now(timezone.utc) if payload.is_published else None,
    )
    db.add(post)
    await db.commit()
    await db.refresh(post)
    
    return BlogPostResponse.model_validate(post)


@router.put("/admin/{post_id}", response_model=BlogPostResponse)
async def update_blog_post(
    post_id: uuid.UUID,
    payload: BlogPostUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a blog post (admin only)."""
    if not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    
    result = await db.execute(select(BlogPost).where(BlogPost.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(post, key, value)
    
    # If publishing for the first time
    if payload.is_published and not post.published_at:
        post.published_at = datetime.now(timezone.utc)
    
    await db.commit()
    await db.refresh(post)
    return BlogPostResponse.model_validate(post)


@router.delete("/admin/{post_id}")
async def delete_blog_post(
    post_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a blog post (admin only)."""
    if not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    
    result = await db.execute(select(BlogPost).where(BlogPost.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    
    await db.delete(post)
    await db.commit()
    return {"detail": "Post deleted"}


@router.get("/admin/all", response_model=dict)
async def list_all_posts_admin(
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all blog posts including drafts (admin only)."""
    if not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    
    count_q = select(func.count()).select_from(BlogPost)
    total = (await db.execute(count_q)).scalar() or 0
    
    result = await db.execute(
        select(BlogPost)
        .order_by(BlogPost.created_at.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
    )
    posts = result.scalars().all()
    
    return {
        "items": [BlogPostResponse.model_validate(p) for p in posts],
        "total": total,
        "page": page,
        "per_page": per_page,
    }
