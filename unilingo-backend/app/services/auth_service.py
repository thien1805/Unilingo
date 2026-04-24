"""
Authentication service - JWT tokens, password hashing, Firebase verification
"""
import uuid
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.config import get_settings
from app.models.user import User, NotificationSetting

settings = get_settings()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(user_id: str, expires_delta: timedelta | None = None) -> str:
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode = {"sub": user_id, "exp": expire, "type": "access"}
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode = {"sub": user_id, "exp": expire, "type": "refresh"}
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def register_user(
    db: AsyncSession,
    email: str,
    password: str,
    full_name: str,
    username: str | None = None,
) -> User:
    """Register a new user with email/password."""
    # Check if email already exists
    result = await db.execute(select(User).where(User.email == email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )

    # Check username uniqueness
    if username:
        result = await db.execute(select(User).where(User.username == username))
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username already taken"
            )

    user = User(
        email=email,
        hashed_password=hash_password(password),
        full_name=full_name,
        username=username,
        auth_provider="email",
    )
    db.add(user)
    await db.flush()  # Populate user.id

    # Create default notification settings
    notif_setting = NotificationSetting(user_id=user.id)
    db.add(notif_setting)
    await db.flush()

    return user


async def authenticate_user(db: AsyncSession, email: str, password: str) -> User:
    """Authenticate a user with email/password."""
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user or not user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    if not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated"
        )

    return user


async def social_login(
    db: AsyncSession,
    firebase_uid: str,
    email: str,
    full_name: str,
    provider: str,
    avatar_url: str | None = None,
) -> User:
    """Login or register via social provider (Google/Apple)."""
    # Try to find existing user by firebase_uid
    result = await db.execute(select(User).where(User.firebase_uid == firebase_uid))
    user = result.scalar_one_or_none()

    if user:
        return user

    # Try to find by email (link accounts)
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if user:
        user.firebase_uid = firebase_uid
        user.auth_provider = provider
        if avatar_url and not user.avatar_url:
            user.avatar_url = avatar_url
        await db.flush()
        return user

    # Create new user
    user = User(
        email=email,
        full_name=full_name,
        firebase_uid=firebase_uid,
        auth_provider=provider,
        avatar_url=avatar_url,
    )
    db.add(user)
    await db.flush()  # Populate user.id

    notif_setting = NotificationSetting(user_id=user.id)
    db.add(notif_setting)
    await db.flush()

    return user


def generate_tokens(user_id: uuid.UUID) -> dict:
    """Generate access and refresh token pair."""
    user_id_str = str(user_id)
    return {
        "access_token": create_access_token(user_id_str),
        "refresh_token": create_refresh_token(user_id_str),
        "token_type": "bearer",
    }
