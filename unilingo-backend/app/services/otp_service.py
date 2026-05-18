import redis
import random
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from app.config import get_settings

settings = get_settings()

# Connect to Redis
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
redis_client = redis.from_url(REDIS_URL, decode_responses=True)

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
