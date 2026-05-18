"""
Unilingo Backend - FastAPI Application Entry Point
"""
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI, Request, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.staticfiles import StaticFiles

from app.config import get_settings
from app.database import init_db
from app.api.openapi_docs import (
    OPENAPI_DESCRIPTION,
    OPENAPI_TAGS,
    SWAGGER_UI_PARAMETERS,
    configure_openapi,
)
from app.api.v1.router import router as v1_router

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle events."""
    # Startup
    print(f"🚀 Starting {settings.APP_NAME} v{settings.APP_VERSION}")

    if settings.DEBUG:
        # Auto-create tables in dev mode (use Alembic in production)
        await init_db()
        print("📦 Database tables created (dev mode)")

    # Initialize Firebase Admin SDK
    try:
        import firebase_admin
        from firebase_admin import credentials
        import os

        if os.path.exists(settings.FIREBASE_SERVICE_ACCOUNT_PATH):
            cred = credentials.Certificate(settings.FIREBASE_SERVICE_ACCOUNT_PATH)
            firebase_admin.initialize_app(cred)
            print("🔥 Firebase Admin SDK initialized")
        else:
            print("⚠️  Firebase service account file not found, social login will be unavailable")
    except Exception as e:
        print(f"⚠️  Firebase init skipped: {e}")

    yield

    # Shutdown
    print(f"👋 Shutting down {settings.APP_NAME}")


app = FastAPI(
    title=settings.APP_NAME,
    description=OPENAPI_DESCRIPTION,
    version=settings.APP_VERSION,
    lifespan=lifespan,
    openapi_tags=OPENAPI_TAGS,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    swagger_ui_parameters=SWAGGER_UI_PARAMETERS,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ──────────────────────────────── Exception Handlers ────────────────────────

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Convert HTTPException to standard error response."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.detail,
            "status_code": exc.status_code,
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Convert Pydantic validation errors to readable error response."""
    errors = exc.errors()
    if errors:
        first_error = errors[0]
        field = " → ".join(str(loc) for loc in first_error.get("loc", []) if loc != "body")
        msg = first_error.get("msg", "Validation error")
        detail = f"{field}: {msg}" if field else msg
    else:
        detail = "Validation error"
    
    return JSONResponse(
        status_code=422,
        content={
            "detail": detail,
            "status_code": 422,
        },
    )


# Include API router
app.include_router(v1_router)


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }


configure_openapi(app, title=settings.APP_NAME, version=settings.APP_VERSION)

admin_web_dir = Path(__file__).resolve().parent / "admin_web"
if admin_web_dir.exists():
    app.mount("/admin-web", StaticFiles(directory=str(admin_web_dir), html=True), name="admin-web")
