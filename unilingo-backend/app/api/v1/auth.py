"""
Authentication API routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.auth import (
    RegisterRequest, LoginRequest, SocialLoginRequest,
    TokenResponse, RefreshTokenRequest,
    ForgotPasswordRequest, ResetPasswordRequest,
)
from app.services.auth_service import (
    register_user, authenticate_user, social_login,
    generate_tokens, decode_token,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(request: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Register a new user with email and password."""
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
    The client sends the Firebase ID token, and the backend verifies it.
    """
    try:
        # Verify Firebase token
        # In production, use firebase_admin.auth.verify_id_token(request.firebase_token)
        # For now, we'll decode it and extract user info
        import firebase_admin.auth as firebase_auth
        decoded_token = firebase_auth.verify_id_token(request.firebase_token)

        firebase_uid = decoded_token["uid"]
        email = decoded_token.get("email", "")
        name = decoded_token.get("name", decoded_token.get("email", "User"))
        picture = decoded_token.get("picture")

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Firebase token: {str(e)}"
        )

    user = await social_login(
        db=db,
        firebase_uid=firebase_uid,
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
async def forgot_password(request: ForgotPasswordRequest):
    """Send password reset email."""
    # TODO: Implement email sending with reset token
    return {"message": "If the email exists, a reset link has been sent."}


@router.post("/reset-password", status_code=status.HTTP_200_OK)
async def reset_password(request: ResetPasswordRequest):
    """Reset password using a reset token."""
    # TODO: Implement password reset logic
    return {"message": "Password has been reset successfully."}


@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout():
    """Logout (client should discard tokens)."""
    # With JWT, logout is typically handled client-side.
    # For added security, implement a token blacklist in Redis.
    return {"message": "Logged out successfully."}
