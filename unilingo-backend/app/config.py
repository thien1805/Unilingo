"""
Unilingo Backend - Application Configuration
"""
from pydantic import field_validator
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # ─── Application ───
    APP_NAME: str = "Unilingo"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "production"
    DEBUG: bool = False
    SECRET_KEY: str = "change-me-in-production"
    API_V1_PREFIX: str = "/api/v1"

    # ─── Database ───
    DATABASE_URL: str = "postgresql+asyncpg://unilingo:unilingo_password@localhost:5432/unilingo_db"
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 5
    DB_POOL_TIMEOUT: int = 30

    # ─── Redis ───
    REDIS_URL: str = "redis://localhost:6379/0"

    # ─── JWT ───
    JWT_SECRET_KEY: str = "change-me-jwt-secret"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # ─── Firebase ───
    FIREBASE_SERVICE_ACCOUNT_PATH: str = "./firebase-service-account.json"
    FIREBASE_SERVICE_ACCOUNT_JSON: str = ""  # JSON string for cloud deploy (Railway)

    # ─── AI Services ───
    OPENAI_API_KEY: str = ""
    GOOGLE_GEMINI_API_KEY: str = ""
    AZURE_SPEECH_KEY: str = ""
    AZURE_SPEECH_REGION: str = "eastus"
    GROQ_API_KEY: str = ""
    GROQ_TRANSCRIPTION_MODEL: str = "whisper-large-v3"
    GROQ_SCORING_MODEL: str = "llama-3.3-70b-versatile"
    GROQ_SCORING_MAX_TOKENS: int = 900
    AI_SCORING_DETAIL_MODE: str = "fast"

    # ─── Storage (S3/MinIO) ───
    AUDIO_STORAGE_BACKEND: str = "local"  # local | s3
    LOCAL_UPLOAD_DIR: str = "app/uploads"
    S3_ENDPOINT_URL: str = "http://localhost:9000"
    S3_ACCESS_KEY: str = "minioadmin"
    S3_SECRET_KEY: str = "minioadmin"
    S3_BUCKET_NAME: str = "unilingo-audio"
    S3_REGION: str = "us-east-1"
    S3_ADDRESSING_STYLE: str = "auto"  # auto | virtual | path
    S3_AUDIO_PREFIX: str = "practice-audio"

    # ─── Scoring Runtime ───
    SCORING_INLINE_ENABLED: bool = True
    SCORING_INLINE_TIMEOUT_SECONDS: int = 150
    SCORING_CELERY_FALLBACK_ENABLED: bool = True
    TTS_CACHE_DIR: str = "app/cache/tts"

    # ─── Celery ───
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"

    # ─── SMTP Email ───
    SENDGRID_API_KEY: str = ""
    SENDGRID_FROM_EMAIL: str = ""
    SENDGRID_FROM_NAME: str = "Unilingo"
    SMTP_SERVER: str = ""
    SMTP_PORT: int = 465
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = ""

    @field_validator("DEBUG", mode="before")
    @classmethod
    def parse_debug(cls, value):
        if isinstance(value, str):
            normalized = value.strip().lower()
            if normalized in {"release", "prod", "production", "false", "0", "no", "off"}:
                return False
            if normalized in {"debug", "dev", "development", "true", "1", "yes", "on"}:
                return True
        return value

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def normalize_database_url(cls, value):
        if isinstance(value, str):
            if value.startswith("postgresql://"):
                return value.replace("postgresql://", "postgresql+asyncpg://", 1)
            if value.startswith("postgres://"):
                return value.replace("postgres://", "postgresql+asyncpg://", 1)
        return value

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


@lru_cache()
def get_settings() -> Settings:
    return Settings()
