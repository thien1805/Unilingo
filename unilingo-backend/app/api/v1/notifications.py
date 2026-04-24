"""
Notification API routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.api.deps import get_current_user
from app.models.user import User, UserDevice, NotificationSetting
from app.schemas.leaderboard import (
    NotificationSettingsResponse, UpdateNotificationSettingsRequest,
    RegisterDeviceRequest,
)

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
