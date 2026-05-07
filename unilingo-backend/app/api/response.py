"""
Standard API Response Utilities
- Success: { status_code, message, data }
- Error:   { status_code, message }
"""
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError


def success_response(data=None, message: str = "Success", status_code: int = 200) -> JSONResponse:
    """Wrap a successful response in the standard envelope."""
    return JSONResponse(
        status_code=status_code,
        content={
            "status_code": status_code,
            "message": message,
            "data": data,
        },
    )


def error_response(message: str, status_code: int) -> JSONResponse:
    """Wrap an error in the standard envelope."""
    return JSONResponse(
        status_code=status_code,
        content={
            "status_code": status_code,
            "message": message,
        },
    )


# ── Global exception handlers ────────────────────────────────────────────────

async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """Convert FastAPI HTTPException → standard error envelope."""
    return error_response(message=str(exc.detail), status_code=exc.status_code)


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Convert Pydantic validation errors → standard error envelope."""
    errors = exc.errors()
    # Surface the first validation message in a human-readable way
    if errors:
        field = " → ".join(str(loc) for loc in errors[0].get("loc", []) if loc != "body")
        msg = errors[0].get("msg", "Validation error")
        message = f"{field}: {msg}" if field else msg
    else:
        message = "Validation error"
    return error_response(message=message, status_code=422)
