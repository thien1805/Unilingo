"""
Authentication API routes
"""
import os

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.database import get_db
from app.schemas.auth import (
    RegisterRequest, LoginRequest, SocialLoginRequest,
    TokenResponse, RefreshTokenRequest,
    ForgotPasswordRequest, ResetPasswordRequest,
    SendOTPRequest, VerifyOTPRequest
)
from app.services.auth_service import (
    register_user, authenticate_user, social_login,
    generate_tokens, decode_token,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


from app.services.otp_service import generate_and_send_otp, verify_otp, verify_otp_only
from sqlalchemy import select
from app.models.user import User

settings = get_settings()


def _is_development_environment() -> bool:
    env_value = getattr(settings, "ENVIRONMENT", None) or os.getenv("APP_ENV")
    return str(env_value).lower() == "development"


def _google_oauth_client_ids() -> list[str]:
    return [
        client_id.strip()
        for client_id in (
            settings.GOOGLE_OAUTH_WEB_CLIENT_ID,
            settings.GOOGLE_OAUTH_IOS_CLIENT_ID,
            settings.GOOGLE_OAUTH_ANDROID_CLIENT_ID,
        )
        if client_id.strip()
    ]


def _verify_google_id_token(token: str) -> dict:
    client_ids = _google_oauth_client_ids()
    if not client_ids:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google OAuth client IDs are not configured",
        )

    try:
        from google.auth.transport import requests as google_requests
        from google.oauth2 import id_token as google_id_token
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Google token verifier is unavailable: {exc}",
        ) from exc

    verifier_request = google_requests.Request()
    last_error: Exception | None = None
    for client_id in client_ids:
        try:
            decoded = google_id_token.verify_oauth2_token(
                token,
                verifier_request,
                client_id,
            )
            if decoded.get("email_verified") is False:
                raise ValueError("Google email is not verified")
            return decoded
        except Exception as exc:
            last_error = exc

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=f"Invalid Google token: {last_error}",
    )


@router.post("/register-send-otp", status_code=status.HTTP_200_OK)
async def register_send_otp(request: SendOTPRequest, db: AsyncSession = Depends(get_db)):
    """Send OTP for registration."""
    # Check if user already exists
    result = await db.execute(select(User).where(User.email == request.email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    try:
        generate_and_send_otp(request.email, prefix="register", raise_on_email_failure=True)
    except RuntimeError:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not send OTP email. Please check email provider configuration.",
        )
    return {"message": "OTP sent to your email."}


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(request: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Register a new user with email, password, and OTP."""
    # local development only, do not use in production
    if _is_development_environment() and request.otp == "000000":
        pass
    elif not verify_otp(request.email, request.otp, prefix="register"):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
        
    user = await register_user(
        db=db,
        email=request.email,
        password=request.password,
        full_name=request.full_name,
        username=request.username,
    )
    return generate_tokens(user.id)


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Login with email and password."""
    user = await authenticate_user(db=db, email=request.email, password=request.password)
    return generate_tokens(user.id)


@router.post("/social-login", response_model=TokenResponse)
async def social_login_endpoint(
    request: SocialLoginRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Login or register via Firebase social auth (Google/Apple).
    The client sends a Firebase ID token, or a Google ID token when provider=google.
    """
    try:
        try:
            import firebase_admin.auth as firebase_auth
            decoded_token = firebase_auth.verify_id_token(request.firebase_token)
            provider_uid = decoded_token["uid"]
        except Exception:
            if request.provider != "google":
                raise
            decoded_token = _verify_google_id_token(request.firebase_token)
            provider_uid = f"google:{decoded_token['sub']}"

        email = decoded_token.get("email", "")
        name = decoded_token.get("name", decoded_token.get("email", "User"))
        picture = decoded_token.get("picture")
        if not email:
            raise ValueError("Social provider did not return an email")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid social token: {str(e)}"
        )

    user = await social_login(
        db=db,
        firebase_uid=provider_uid,
        email=email,
        full_name=name,
        provider=request.provider,
        avatar_url=picture,
    )
    return generate_tokens(user.id)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(request: RefreshTokenRequest):
    """Refresh access token using a valid refresh token."""
    payload = decode_token(request.refresh_token)

    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type"
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

    from app.services.auth_service import create_access_token, create_refresh_token
    return {
        "access_token": create_access_token(user_id),
        "refresh_token": create_refresh_token(user_id),
        "token_type": "bearer",
    }


@router.post("/forgot-password", status_code=status.HTTP_200_OK)
async def forgot_password(request: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    """Send password reset OTP email."""
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalars().first()
    
    if user:
        generate_and_send_otp(request.email, prefix="reset")
        
    # Always return success to prevent email enumeration
    return {"message": "If the email exists, an OTP has been sent."}


@router.post("/verify-reset-otp", status_code=status.HTTP_200_OK)
async def verify_reset_otp_endpoint(request: VerifyOTPRequest):
    """Verify OTP without consuming it (step 2 of forgot password)."""
    if not verify_otp_only(request.email, request.otp, prefix="reset"):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    return {"message": "OTP verified successfully."}


@router.post("/reset-password", status_code=status.HTTP_200_OK)
async def reset_password(request: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    """Reset password using OTP (step 3 of forgot password)."""
    if not verify_otp(request.email, request.otp, prefix="reset"):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
        
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    from app.services.auth_service import hash_password, verify_password
    
    # Check if new password is the same as current password
    if user.hashed_password and verify_password(request.new_password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Mật khẩu mới không được trùng với mật khẩu hiện tại")
    
    user.hashed_password = hash_password(request.new_password)
    await db.flush()
    
    return {"message": "Password has been reset successfully."}


@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout():
    """Logout (client should discard tokens)."""
    # With JWT, logout is typically handled client-side.
    # For added security, implement a token blacklist in Redis.
    return {"message": "Logged out successfully."}
