import importlib
import random
import os
import smtplib
import time
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional, Dict, Tuple
from app.config import get_settings

settings = get_settings()

_redis_module = None
try:
    _redis_module = importlib.import_module("redis")
except ModuleNotFoundError:
    _redis_module = None


class _InMemoryOTPStore:
    def __init__(self) -> None:
        self._store: Dict[str, Tuple[str, float]] = {}

    def setex(self, key: str, ttl_seconds: int, value: str) -> None:
        self._store[key] = (value, time.time() + ttl_seconds)

    def get(self, key: str) -> Optional[str]:
        item = self._store.get(key)
        if not item:
            return None

        value, expires_at = item
        if time.time() >= expires_at:
            self._store.pop(key, None)
            return None

        return value

    def delete(self, key: str) -> None:
        self._store.pop(key, None)


def _build_redis_client():
    redis_url = settings.REDIS_URL or os.getenv("REDIS_URL", "redis://localhost:6379/0")
    if not _redis_module:
        print("⚠️ redis package not available, using in-memory OTP store.", flush=True)
        return _InMemoryOTPStore()

    try:
        return _redis_module.from_url(redis_url, decode_responses=True)
    except Exception as exc:
        print(f"⚠️ Failed to connect to Redis at {redis_url}: {exc}. Using in-memory OTP store.", flush=True)
        return _InMemoryOTPStore()


redis_client = _build_redis_client()

def generate_and_send_otp(email: str, prefix: str = "register") -> str:
    """Generate a 6-digit OTP, store in Redis for 5 minutes, and 'send' email."""
    email_clean = email.strip().lower()
    otp = str(random.randint(100000, 999999))
    key = f"otp:{prefix}:{email_clean}"
    redis_client.setex(key, 300, otp)  # Valid for 5 minutes
    
    # Print to console for dev/debugging
    print(f"\n" + "="*50, flush=True)
    print(f"📧 EMAIL: Sending OTP to {email}", flush=True)
    print(f"🔑 Your {prefix.upper()} OTP is: {otp}", flush=True)
    print(f"="*50 + "\n", flush=True)

    # Real SMTP email sending
    if settings.SMTP_SERVER and settings.SMTP_USERNAME and settings.SMTP_PASSWORD:
        try:
            msg = MIMEMultipart()
            msg['From'] = settings.SMTP_FROM_EMAIL
            msg['To'] = email
            msg['Subject'] = f"[{prefix.upper()}] Your Unilingo Verification Code"
            
            body = f"Hello,\n\nYour verification code is: {otp}\n\nThis code will expire in 5 minutes.\n\nThank you,\nUnilingo Team"
            msg.attach(MIMEText(body, 'plain'))
            
            # Using SMTP_SSL for port 465, or SMTP with starttls for port 587
            if settings.SMTP_PORT == 465:
                server = smtplib.SMTP_SSL(settings.SMTP_SERVER, settings.SMTP_PORT)
            else:
                server = smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT)
                server.starttls()
                
            server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            server.send_message(msg)
            server.quit()
            print("✅ Real email sent successfully via SMTP.", flush=True)
        except Exception as e:
            print(f"❌ Failed to send real email: {str(e)}", flush=True)
    else:
        print("⚠️ SMTP credentials not found, email sending skipped.", flush=True)
    
    return otp

def verify_otp(email: str, otp: str, prefix: str = "register") -> bool:
    """Verify the OTP from Redis and consume it."""
    email_clean = email.strip().lower()
    key = f"otp:{prefix}:{email_clean}"
    stored_otp = redis_client.get(key)
    
    if stored_otp and stored_otp == otp:
        redis_client.delete(key)  # OTP used
        return True
    return False

def verify_otp_only(email: str, otp: str, prefix: str = "register") -> bool:
    """Verify the OTP from Redis WITHOUT consuming it (for multi-step flows)."""
    email_clean = email.strip().lower()
    key = f"otp:{prefix}:{email_clean}"
    stored_otp = redis_client.get(key)
    
    if stored_otp and stored_otp == otp:
        return True
    return False
