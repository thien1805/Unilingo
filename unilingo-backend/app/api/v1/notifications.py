"""
Notification API routes
"""
from datetime import datetime, timezone
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.api.deps import get_admin_user, get_current_user
from app.models.user import User, UserDevice, NotificationSetting
from app.models.notification import NotificationCampaign, UserNotification
from app.schemas.notification import (
    AdminSendNotificationRequest,
    AdminSendNotificationResponse,
    NotificationCampaignResponse,
    NotificationListResponse,
    NotificationSettingsResponse, UpdateNotificationSettingsRequest,
    RegisterDeviceRequest, UnreadCountResponse, UserNotificationResponse,
)
from app.services.notification_service import dispatch_notification_campaign

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("/settings", response_model=NotificationSettingsResponse)
async def get_notification_settings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get notification settings for the current user."""
    result = await db.execute(
        select(NotificationSetting).where(NotificationSetting.user_id == current_user.id)
    )
    settings = result.scalar_one_or_none()

    if not settings:
        # Create default settings
        settings = NotificationSetting(user_id=current_user.id)
        db.add(settings)
        await db.flush()

    return NotificationSettingsResponse.model_validate(settings)


@router.patch("/settings", response_model=NotificationSettingsResponse)
async def update_notification_settings(
    request: UpdateNotificationSettingsRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update notification settings."""
    result = await db.execute(
        select(NotificationSetting).where(NotificationSetting.user_id == current_user.id)
    )
    settings = result.scalar_one_or_none()

    if not settings:
        settings = NotificationSetting(user_id=current_user.id)
        db.add(settings)

    for field, value in request.model_dump(exclude_unset=True).items():
        setattr(settings, field, value)

    await db.flush()
    await db.refresh(settings)
    return NotificationSettingsResponse.model_validate(settings)


@router.get("", response_model=NotificationListResponse)
async def list_notifications(
    page: int = 1,
    per_page: int = 20,
    unread_only: bool = False,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List the current user's in-app notifications."""
    if page < 1:
        page = 1
    per_page = max(1, min(per_page, 100))

    query = select(UserNotification).where(UserNotification.user_id == current_user.id)
    if unread_only:
        query = query.where(UserNotification.is_read == False)

    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar() or 0
    unread = (await db.execute(
        select(func.count(UserNotification.id)).where(
            UserNotification.user_id == current_user.id,
            UserNotification.is_read == False,
        )
    )).scalar() or 0

    result = await db.execute(
        query.order_by(UserNotification.created_at.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
    )
    items = result.scalars().all()

    return NotificationListResponse(
        items=[UserNotificationResponse.model_validate(item) for item in items],
        total=total,
        unread=unread,
        page=page,
        per_page=per_page,
    )


@router.get("/unread-count", response_model=UnreadCountResponse)
async def get_unread_notification_count(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return the current user's unread in-app notification count."""
    unread = (await db.execute(
        select(func.count(UserNotification.id)).where(
            UserNotification.user_id == current_user.id,
            UserNotification.is_read == False,
        )
    )).scalar() or 0
    return UnreadCountResponse(unread=unread)


@router.patch("/read-all")
async def mark_all_notifications_read(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark all notifications as read for the current user."""
    result = await db.execute(
        select(UserNotification).where(
            UserNotification.user_id == current_user.id,
            UserNotification.is_read == False,
        )
    )
    notifications = result.scalars().all()
    now = datetime.now(timezone.utc)
    for notification in notifications:
        notification.is_read = True
        notification.read_at = now
    await db.flush()
    return {"updated": len(notifications)}


@router.patch("/{notification_id}/read", response_model=UserNotificationResponse)
async def mark_notification_read(
    notification_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark a single notification as read."""
    result = await db.execute(
        select(UserNotification).where(
            UserNotification.id == notification_id,
            UserNotification.user_id == current_user.id,
        )
    )
    notification = result.scalar_one_or_none()
    if not notification:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")

    notification.is_read = True
    notification.read_at = datetime.now(timezone.utc)
    await db.flush()
    await db.refresh(notification)
    return UserNotificationResponse.model_validate(notification)


# ─── Device Registration ───

@router.post("/devices/register", status_code=status.HTTP_201_CREATED)
async def register_device(
    request: RegisterDeviceRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Register a device for push notifications (FCM token)."""
    # Check if token already exists
    result = await db.execute(
        select(UserDevice).where(UserDevice.fcm_token == request.fcm_token)
    )
    existing = result.scalar_one_or_none()

    if existing:
        # Update ownership if different user
        existing.user_id = current_user.id
        existing.device_type = request.device_type
        existing.device_name = request.device_name
        await db.flush()
        return {"message": "Device token updated"}

    device = UserDevice(
        user_id=current_user.id,
        fcm_token=request.fcm_token,
        device_type=request.device_type,
        device_name=request.device_name,
    )
    db.add(device)
    await db.flush()
    return {"message": "Device registered successfully"}


@router.delete("/devices/{token}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_device(
    token: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Remove a device FCM token."""
    result = await db.execute(
        select(UserDevice).where(
            UserDevice.fcm_token == token,
            UserDevice.user_id == current_user.id,
        )
    )
    device = result.scalar_one_or_none()
    if device:
        await db.delete(device)


# ─── Admin Notification Campaigns ───

@router.post("/admin/send", response_model=AdminSendNotificationResponse)
async def admin_send_notification(
    request: AdminSendNotificationRequest,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    """Create in-app notifications and push them immediately to target users."""
    try:
        result = await dispatch_notification_campaign(
            db=db,
            title=request.title,
            body=request.body,
            notification_type=request.notification_type,
            category=request.category,
            audience=request.audience,
            user_ids=request.user_ids,
            data=request.data,
            respect_user_preferences=request.respect_user_preferences,
            created_by_id=admin.id,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    campaign = result["campaign"]

    return AdminSendNotificationResponse(
        campaign_id=campaign.id,
        total_recipients=result["total_recipients"],
        stored_notifications=result["stored_notifications"],
        push_sent=result["push_sent"],
        push_failed=result["push_failed"],
        push_skipped=result["push_skipped"],
        status=result["status"],
    )


@router.get("/admin/campaigns", response_model=dict)
async def list_notification_campaigns(
    page: int = 1,
    per_page: int = 20,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    """List notification campaigns created by admins."""
    page = max(page, 1)
    per_page = max(1, min(per_page, 100))
    base_query = select(NotificationCampaign)
    total = (await db.execute(select(func.count()).select_from(base_query.subquery()))).scalar() or 0
    result = await db.execute(
        base_query.order_by(NotificationCampaign.created_at.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
    )
    campaigns = result.scalars().all()

    return {
        "items": [NotificationCampaignResponse.model_validate(item) for item in campaigns],
        "total": total,
        "page": page,
        "per_page": per_page,
    }


@router.delete("/admin/campaigns/{campaign_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notification_campaign(
    campaign_id: UUID,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    """Delete an admin campaign and all in-app notifications created from it."""
    result = await db.execute(
        select(NotificationCampaign).where(NotificationCampaign.id == campaign_id)
    )
    campaign = result.scalar_one_or_none()
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification campaign not found",
        )

    await db.execute(
        delete(UserNotification).where(UserNotification.campaign_id == campaign_id)
    )
    await db.delete(campaign)
