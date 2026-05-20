# Unilingo Production Readiness

## Core Services

- Railway API service with `ENVIRONMENT=production`, `DEBUG=false`, strong `JWT_SECRET_KEY`, and `APP_PUBLIC_URL`.
- Railway Postgres with backups enabled.
- Railway Redis wired to `REDIS_URL`, `CELERY_BROKER_URL`, and `CELERY_RESULT_BACKEND`.
- Railway Bucket or another S3-compatible store for recorded audio.

## Auth And Email

- OTP is stored in Redis when `REDIS_URL` is reachable. The in-memory store is only a fallback for local/dev or Redis outages.
- Use SendGrid for OTP emails on Railway. Set `SENDGRID_API_KEY`, verified `SENDGRID_FROM_EMAIL`, and `SENDGRID_FROM_NAME`.
- Set `APP_PUBLIC_URL` so OTP emails can show the hosted Unilingo image at `/admin-web/uni_icon.png`, or set `EMAIL_MASCOT_URL` to a hosted mascot image.
- Google OAuth needs matching client IDs on both API and Expo:
  - Backend: `GOOGLE_OAUTH_WEB_CLIENT_ID`, `GOOGLE_OAUTH_IOS_CLIENT_ID`, `GOOGLE_OAUTH_ANDROID_CLIENT_ID`.
  - Frontend: `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`, `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`.

## Speaking Quality

- Azure Speech TTS should be configured with `AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION`, `TTS_VOICE_NAME`, `TTS_VOICE_STYLE`, and `TTS_OUTPUT_FORMAT`.
- Groq transcription/scoring keys must be present for production scoring.
- Keep `SCORING_INLINE_ENABLED=true` for immediate results, with Celery fallback enabled for retries.

## Mobile Release

- Android: configure Firebase/FCM, Play signing, production API URL, and build with the production EAS profile.
- iOS: configure APNs push credentials in EAS/Apple, TestFlight, production API URL, and Google iOS OAuth client.
- Rebuild native apps after changing `app.json`, plugins, scheme, OAuth, or notification capabilities.

## Observability

- Add structured logs for auth failures, scoring timeouts, upload failures, and push notification failures.
- Track API latency, DB pool usage, Redis errors, AI vendor errors, and S3 upload/download errors.
- Keep admin dashboard actions audited before launch if multiple admins will manage content.
