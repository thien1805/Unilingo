import importlib
import random
import os
import smtplib
import time
import httpx
from html import escape
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


_memory_store = _InMemoryOTPStore()


def _build_redis_client():
    redis_url = settings.REDIS_URL or os.getenv("REDIS_URL", "redis://localhost:6379/0")
    if not _redis_module:
        print("⚠️ redis package not available, using in-memory OTP store.", flush=True)
        return _memory_store

    try:
        client = _redis_module.from_url(
            redis_url,
            decode_responses=True,
            socket_connect_timeout=2,
            socket_timeout=2,
        )
        client.ping()
        return client
    except Exception as exc:
        print(f"⚠️ Failed to connect to Redis at {redis_url}: {exc}. Using in-memory OTP store.", flush=True)
        return _memory_store


redis_client = _build_redis_client()


def _use_memory_store_after_error(exc: Exception) -> None:
    global redis_client
    if redis_client is not _memory_store:
        print(f"⚠️ OTP store failed: {exc}. Falling back to in-memory OTP store.", flush=True)
        redis_client = _memory_store


def _store_otp(key: str, ttl_seconds: int, otp: str) -> None:
    try:
        redis_client.setex(key, ttl_seconds, otp)
    except Exception as exc:
        _use_memory_store_after_error(exc)
        redis_client.setex(key, ttl_seconds, otp)


def _get_otp(key: str) -> Optional[str]:
    try:
        return redis_client.get(key)
    except Exception as exc:
        _use_memory_store_after_error(exc)
        return redis_client.get(key)


def _delete_otp(key: str) -> None:
    try:
        redis_client.delete(key)
    except Exception as exc:
        _use_memory_store_after_error(exc)
        redis_client.delete(key)


def _email_mascot_url() -> str:
    configured_url = settings.EMAIL_MASCOT_URL.strip()
    if configured_url:
        return configured_url

    public_url = settings.APP_PUBLIC_URL.strip().rstrip("/")
    if public_url:
        return f"{public_url}/admin-web/uni_icon.png"

    return ""


def _build_otp_email(prefix: str, otp: str) -> tuple[str, str, str]:
    flow_title = "Reset your password" if prefix == "reset" else "Verify your email"
    subject = f"Your Unilingo verification code: {otp}"
    mascot_url = _email_mascot_url()
    mascot_html = (
        f'<img src="{escape(mascot_url, quote=True)}" width="96" height="96" alt="Unilingo mascot" '
        'style="display:block;border-radius:24px;margin:0 auto 18px;object-fit:contain;" />'
        if mascot_url
        else ""
    )
    text = (
        "Hello,\n\n"
        f"Your verification code is: {otp}\n\n"
        "This code will expire in 5 minutes.\n\n"
        "Thank you,\n"
        "Unilingo Team"
    )
    html = f"""<!doctype html>
<html>
  <body style="margin:0;background:#f4f7fb;padding:28px 14px;font-family:Arial,Helvetica,sans-serif;color:#111827;">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:28px;padding:34px 28px;border:1px solid #e5e7eb;">
      {mascot_html}
      <h1 style="margin:0 0 10px;text-align:center;font-size:26px;line-height:32px;color:#1f2937;">{escape(flow_title)}</h1>
      <p style="margin:0 auto 24px;max-width:390px;text-align:center;font-size:15px;line-height:23px;color:#64748b;">
        Use this code to continue in Unilingo. It expires in 5 minutes.
      </p>
      <div style="letter-spacing:10px;text-align:center;font-size:34px;font-weight:800;color:#3350B2;background:#eff4ff;border-radius:18px;padding:18px 12px;">
        {escape(otp)}
      </div>
      <p style="margin:24px 0 0;text-align:center;font-size:13px;line-height:20px;color:#94a3b8;">
        If you did not request this code, you can safely ignore this email.
      </p>
    </div>
  </body>
</html>"""
    return subject, text, html


def _send_with_sendgrid(email: str, subject: str, text: str, html: str) -> bool:
    api_key = settings.SENDGRID_API_KEY.strip()
    from_email = (settings.SENDGRID_FROM_EMAIL or settings.SMTP_FROM_EMAIL).strip()
    if not api_key or not from_email:
        print("⚠️ SendGrid skipped: SENDGRID_API_KEY or SENDGRID_FROM_EMAIL is missing.", flush=True)
        return False

    from_payload = {"email": from_email}
    if settings.SENDGRID_FROM_NAME.strip():
        from_payload["name"] = settings.SENDGRID_FROM_NAME.strip()

    payload = {
        "personalizations": [{"to": [{"email": email}], "subject": subject}],
        "from": from_payload,
        "content": [
            {"type": "text/plain", "value": text},
            {"type": "text/html", "value": html},
        ],
    }
    html_size = len(html.encode("utf-8"))

    try:
        timeout = httpx.Timeout(20.0, connect=5.0, read=20.0, write=10.0)
        response = httpx.post(
            "https://api.sendgrid.com/v3/mail/send",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=timeout,
        )
        response.raise_for_status()
        message_id = response.headers.get("x-message-id", "unknown")
        print(f"✅ OTP email accepted by SendGrid. message_id={message_id}", flush=True)
        return True
    except httpx.TimeoutException as exc:
        print(f"❌ SendGrid timed out while sending OTP email. html_bytes={html_size} error={exc}", flush=True)
        return False
    except httpx.HTTPStatusError as exc:
        body = exc.response.text[:500] if exc.response is not None else ""
        status_code = exc.response.status_code if exc.response is not None else "unknown"
        print(f"❌ SendGrid rejected OTP email. status={status_code} body={body}", flush=True)
        return False
    except Exception as exc:
        print(f"❌ Failed to send OTP email via SendGrid: {str(exc)}", flush=True)
        return False


def _send_with_smtp(email: str, subject: str, text: str, html: str) -> bool:
    if not (settings.SMTP_SERVER and settings.SMTP_USERNAME and settings.SMTP_PASSWORD):
        return False

    try:
        msg = MIMEMultipart("alternative")
        msg['From'] = settings.SMTP_FROM_EMAIL or settings.SMTP_USERNAME
        msg['To'] = email
        msg['Subject'] = subject
        msg.attach(MIMEText(text, 'plain'))
        msg.attach(MIMEText(html, 'html'))

        # Using SMTP_SSL for port 465, or SMTP with starttls for port 587
        if settings.SMTP_PORT == 465:
            server = smtplib.SMTP_SSL(settings.SMTP_SERVER, settings.SMTP_PORT, timeout=10)
        else:
            server = smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT, timeout=10)
            server.starttls()

        server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        print("✅ OTP email sent successfully via SMTP.", flush=True)
        return True
    except Exception as exc:
        print(f"❌ Failed to send OTP email via SMTP: {str(exc)}", flush=True)
        return False


def generate_and_send_otp(email: str, prefix: str = "register", raise_on_email_failure: bool = False) -> str:
    """Generate a 6-digit OTP, store in Redis for 5 minutes, and 'send' email."""
    email_clean = email.strip().lower()
    otp = str(random.randint(100000, 999999))
    key = f"otp:{prefix}:{email_clean}"
    _store_otp(key, 300, otp)  # Valid for 5 minutes
    
    # Print to console for dev/debugging
    print(f"\n" + "="*50, flush=True)
    print(f"📧 EMAIL: Sending OTP to {email}", flush=True)
    print(f"🔑 Your {prefix.upper()} OTP is: {otp}", flush=True)
    print(f"="*50 + "\n", flush=True)

    subject, text, html = _build_otp_email(prefix, otp)
    sent = _send_with_sendgrid(email_clean, subject, text, html)
    if not sent:
        sent = _send_with_smtp(email_clean, subject, text, html)
    if not sent:
        print("⚠️ Email provider credentials not found or sending failed; OTP is available in logs.", flush=True)
        if raise_on_email_failure:
            raise RuntimeError("OTP email could not be sent")
    
    return otp

def verify_otp(email: str, otp: str, prefix: str = "register") -> bool:
    """Verify the OTP from Redis and consume it."""
    email_clean = email.strip().lower()
    key = f"otp:{prefix}:{email_clean}"
    stored_otp = _get_otp(key)
    
    if stored_otp and stored_otp == otp:
        _delete_otp(key)  # OTP used
        return True
    return False

def verify_otp_only(email: str, otp: str, prefix: str = "register") -> bool:
    """Verify the OTP from Redis WITHOUT consuming it (for multi-step flows)."""
    email_clean = email.strip().lower()
    key = f"otp:{prefix}:{email_clean}"
    stored_otp = _get_otp(key)
    
    if stored_otp and stored_otp == otp:
        return True
    return False
