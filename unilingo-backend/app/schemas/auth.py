"""
Pydantic schemas for Authentication
"""
from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    full_name: str = Field(..., min_length=2, max_length=255)
    username: str | None = Field(None, min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_]+$")


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class SocialLoginRequest(BaseModel):
    firebase_token: str
    provider: str = Field(..., pattern=r"^(google|apple)$")


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8, max_length=128)


class SetTargetRequest(BaseModel):
    target_band_score: float = Field(..., ge=1.0, le=9.0)
    target_exam_date: str | None = None  # ISO date string
    current_level: str | None = Field(None, pattern=r"^(beginner|elementary|intermediate|upper_intermediate|advanced)$")
