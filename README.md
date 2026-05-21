# Unilingo Mobile

Unilingo is an IELTS Speaking practice platform with an Expo/React Native mobile app and a FastAPI backend. The app simulates real speaking workflows: the examiner reads questions with text-to-speech, the user records spoken answers, the backend stores audio, transcribes speech, assesses pronunciation, and returns IELTS-style band scores with feedback.

This root README explains how the project is structured, how to run it locally, how API links are built, which third-party services are used, and how Redis fits into OTP, scoring, and worker runtime.

## Table Of Contents

- [Main Features](#main-features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Repository Layout](#repository-layout)
- [Local URLs And API Links](#local-urls-and-api-links)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [Redis Explained](#redis-explained)
- [Third-Party Services](#third-party-services)
- [IELTS Speaking Flow](#ielts-speaking-flow)
- [API Map](#api-map)
- [Admin CMS](#admin-cms)
- [Troubleshooting](#troubleshooting)
- [Checks](#checks)

## Main Features

- IELTS Speaking Part 1, Part 2, and Part 3 practice by topic.
- Full IELTS Speaking Test flow across Part 1, Part 2, and Part 3.
- Camera-enabled mock speaking test with microphone recording.
- Azure Neural TTS examiner voice for intros, transitions, questions, and endings.
- Audio recording with `expo-av`, uploaded as practice attempt audio.
- Groq Whisper transcription for mock-test answer review and scoring input.
- Azure Speech Pronunciation Assessment for pronunciation metrics.
- Groq Chat Completions for IELTS band scoring and feedback generation.
- Vocabulary notebook, dictionary lookup, flashcards, leaderboard, blogs, forecasts, and notifications.
- Admin CMS for blogs, forecasts, topics, questions, users, notification campaigns, and system health.

## Architecture

```text
Expo mobile app
  -> /api/v1/auth
  -> /api/v1/topics
  -> /api/v1/practice
  -> /api/v1/vocabulary
  -> /api/v1/flashcards
  -> /api/v1/notifications

FastAPI backend
  -> PostgreSQL database
  -> Redis for OTP storage and Celery broker/result backend
  -> Local or S3-compatible audio storage
  -> Groq Whisper for speech-to-text
  -> Azure Speech for TTS and pronunciation assessment
  -> Groq Chat Completions for IELTS scoring
  -> Firebase Admin SDK and Expo Push Service for notifications
  -> SendGrid or SMTP for OTP emails

Admin web
  -> Served by FastAPI at /admin-web
  -> Calls /api/v1/admin, /api/v1/blog/admin, /api/v1/forecast/admin,
     and /api/v1/notifications/admin
```

## Tech Stack

### Frontend

| Area | Technology |
| --- | --- |
| Framework | Expo SDK 54, React Native 0.81, React 19, TypeScript |
| Navigation | React Navigation native stack and bottom tabs |
| Server state | TanStack Query |
| Local state | Zustand |
| HTTP client | Axios with JWT refresh interceptor |
| Audio | `expo-av` recording/playback |
| Camera | `expo-camera` |
| TTS fallback | `expo-speech` |
| Notifications | `expo-notifications` |
| Secure storage | `expo-secure-store`, `react-native-mmkv` |

### Backend

| Area | Technology |
| --- | --- |
| API | FastAPI, Pydantic, Uvicorn |
| Database | PostgreSQL by default, SQLAlchemy async |
| Auth | JWT access/refresh tokens, password hashing, Google/Firebase social login |
| Redis | OTP store, Celery broker, Celery result backend |
| Workers | Celery worker and Celery beat |
| Storage | Local filesystem or S3-compatible object storage |
| AI/STT | Groq Whisper |
| TTS | Azure Neural TTS |
| Pronunciation | Azure Speech Pronunciation Assessment |
| Email | SendGrid first, SMTP fallback |
| Push | Expo Push Service and Firebase Cloud Messaging |

## Repository Layout

```text
unilingo_mobile/
|-- README.md
|-- docs/
|   |-- BACKEND_API_DOCS.md
|   |-- API_MAPPING.md
|   |-- BACKEND_ARCHITECTURE.md
|   |-- FRONTEND_ARCHITECTURE.md
|   |-- PROJECT_DOCUMENTATION_VI.md
|   |-- DEPLOYMENT_FREE_GUIDE.md
|   `-- RAILWAY_STORAGE_AND_IOS_BUILD.md
|-- unilingo_frontend/
|   |-- App.tsx
|   |-- app.json
|   |-- eas.json
|   |-- package.json
|   |-- src/
|   |   |-- api/
|   |   |-- components/
|   |   |-- hooks/
|   |   |-- navigation/
|   |   |-- screens/
|   |   |-- services/
|   |   |-- store/
|   |   |-- theme/
|   |   `-- utils/
|   `-- assets/
`-- unilingo-backend/
    |-- app/
    |   |-- api/v1/
    |   |-- admin_web/
    |   |-- ai/
    |   |-- models/
    |   |-- schemas/
    |   |-- services/
    |   |-- workers/
    |   |-- config.py
    |   `-- main.py
    |-- .env.example
    |-- Dockerfile
    |-- docker-compose.yml
    |-- requirements.txt
    |-- run_init_db.py
    `-- seed_*.py / seed_*.sql
```

## Local URLs And API Links

The backend root URL and API prefix are different:

| Purpose | Local URL |
| --- | --- |
| Backend root | `http://localhost:8000` |
| API v1 base URL | `http://localhost:8000/api/v1` |
| Health check | `http://localhost:8000/health` |
| Swagger UI | `http://localhost:8000/docs` |
| ReDoc | `http://localhost:8000/redoc` |
| OpenAPI JSON | `http://localhost:8000/openapi.json` |
| Admin CMS | `http://localhost:8000/admin-web` |
| MinIO console | `http://localhost:9001` |
| Redis local port | `localhost:6379` |
| PostgreSQL local host port | `localhost:5434` |

Frontend API links must include the `/api/v1` prefix:

```env
EXPO_PUBLIC_API_URL=http://localhost:8000/api/v1
```

For a real phone on the same Wi-Fi network, do not use `localhost`; use the LAN IP of the machine running the backend:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.10:8000/api/v1
```

For production:

```env
EXPO_PUBLIC_API_URL=https://<your-api-domain>/api/v1
```

The frontend builds the TTS link from the same API base URL:

```ts
`${baseURL}/practice/tts?text=${encodeURIComponent(text)}`
```

So if `EXPO_PUBLIC_API_URL=https://api.example.com/api/v1`, the examiner TTS URL becomes:

```text
https://api.example.com/api/v1/practice/tts?text=Hello%20candidate
```

Backend `APP_PUBLIC_URL` is different. It should be the public backend root without `/api/v1`, for example:

```env
APP_PUBLIC_URL=https://api.example.com
```

The backend uses `APP_PUBLIC_URL` for public links such as email images and admin assets. The mobile app uses `EXPO_PUBLIC_API_URL` for API calls.

## Backend Setup

### Option A: Python Environment

```bash
cd unilingo-backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Edit `.env`, then run:

```bash
python run_init_db.py
python -m app.seed
python seed_extra_data.py
python seed_blogs.py
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Option B: Docker Compose

Docker Compose starts FastAPI, PostgreSQL, Redis, MinIO, Celery worker, and Celery beat:

```bash
cd unilingo-backend
cp .env.example .env
docker-compose up -d
```

Seed the database in the API container:

```bash
docker-compose exec api python run_init_db.py
docker-compose exec api python -m app.seed
docker-compose exec api python seed_extra_data.py
docker-compose exec api python seed_blogs.py
```

Useful Docker commands:

```bash
docker-compose logs -f api
docker-compose logs -f celery-worker
docker-compose ps
docker-compose down
```

## Frontend Setup

```bash
cd unilingo_frontend
npm install
cp .env.example .env
npm start
```

Common commands:

```bash
npm start
npm run ios
npm run android
npm run web
npx tsc --noEmit
```

For release builds, `EXPO_PUBLIC_API_URL` is required because the value is baked into the app bundle.

## Environment Variables

### Backend Minimum

```env
DEBUG=true
DATABASE_URL=postgresql+asyncpg://unilingo:unilingo_password@localhost:5434/unilingo_db
JWT_SECRET_KEY=change-this
APP_PUBLIC_URL=http://localhost:8000
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2
```

If you run the backend inside Docker Compose, the API container receives internal service URLs automatically:

```env
DATABASE_URL=postgresql+asyncpg://unilingo:unilingo_password@db:5432/unilingo_db
REDIS_URL=redis://redis:6379/0
CELERY_BROKER_URL=redis://redis:6379/1
CELERY_RESULT_BACKEND=redis://redis:6379/2
S3_ENDPOINT_URL=http://minio:9000
```

### AI And Speech

| Variable | Used by | Notes |
| --- | --- | --- |
| `GROQ_API_KEY` | STT, AI question generation, scoring | Required for real transcripts and real AI scoring. |
| `GROQ_TRANSCRIPTION_MODEL` | STT | Default: `whisper-large-v3`. |
| `GROQ_SCORING_MODEL` | Scoring | Default: `llama-3.3-70b-versatile`. |
| `GROQ_SCORING_MAX_TOKENS` | Scoring | Default: `900`. |
| `AI_SCORING_DETAIL_MODE` | Scoring prompt size | `fast` uses compact feedback; any other value uses the detailed prompt. |
| `AZURE_SPEECH_KEY` | TTS and pronunciation | Required for `/practice/tts` and real pronunciation assessment. |
| `AZURE_SPEECH_REGION` | Azure Speech | Example: `eastus`. |
| `TTS_VOICE_NAME` | Examiner voice | Default: `en-US-AvaMultilingualNeural`. |
| `TTS_VOICE_STYLE` | Examiner style | Default: `chat`; backend retries without style if Azure rejects it. |
| `TTS_PROSODY_RATE` | Examiner speaking speed | Default: `-3%`. |
| `TTS_OUTPUT_FORMAT` | Azure TTS output | Default: `audio-48khz-96kbitrate-mono-mp3`. |

### Storage

| Variable | Notes |
| --- | --- |
| `AUDIO_STORAGE_BACKEND` | `local` or `s3`. |
| `LOCAL_UPLOAD_DIR` | Local audio directory, default `app/uploads`. |
| `S3_ENDPOINT_URL` | S3-compatible endpoint for MinIO, Railway Bucket, Cloudflare R2, or AWS S3. |
| `S3_ACCESS_KEY` | Object storage access key. |
| `S3_SECRET_KEY` | Object storage secret key. |
| `S3_BUCKET_NAME` | Audio bucket name. |
| `S3_REGION` | Region, or `auto` for providers such as Cloudflare R2. |
| `S3_ADDRESSING_STYLE` | `auto`, `virtual`, or `path`. Local MinIO usually uses `path`; Railway Bucket often uses `virtual`. |
| `S3_AUDIO_PREFIX` | Prefix for uploaded answer audio, default `practice-audio`. |

### Email, Auth, And Notifications

| Variable | Used by | Notes |
| --- | --- | --- |
| `SENDGRID_API_KEY` | OTP email | Preferred email provider. |
| `SENDGRID_FROM_EMAIL` | OTP email | Must be a verified sender/domain in SendGrid. |
| `SENDGRID_FROM_NAME` | OTP email | Defaults to `Unilingo`. |
| `SMTP_SERVER` / `SMTP_PORT` | Email fallback | Optional fallback, for example Gmail SMTP with an app password. |
| `SMTP_USERNAME` / `SMTP_PASSWORD` | Email fallback | Optional fallback credentials. |
| `SMTP_FROM_EMAIL` | Email fallback | Sender address for SMTP. |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | Firebase Admin SDK | Local JSON file path. |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Firebase Admin SDK | JSON string for cloud deployment. |
| `GOOGLE_OAUTH_WEB_CLIENT_ID` | Google sign-in | Backend accepts Google ID tokens issued to this client. |
| `GOOGLE_OAUTH_IOS_CLIENT_ID` | Google sign-in | iOS client ID. |
| `GOOGLE_OAUTH_ANDROID_CLIENT_ID` | Google sign-in | Android client ID. |

### Frontend

```env
EXPO_PUBLIC_API_URL=http://localhost:8000/api/v1
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=
```

## Redis Explained

Redis is not the primary database. PostgreSQL stores users, topics, attempts, vocabulary, notifications, blogs, and forecasts. Redis is a runtime service for short-lived and background-job data.

### What Redis Is Used For

| Redis URL | Logical DB | Used by | Purpose |
| --- | --- | --- | --- |
| `REDIS_URL` | `/0` | `app/services/otp_service.py` | Stores registration and reset-password OTP codes with a 5-minute TTL. |
| `CELERY_BROKER_URL` | `/1` | Celery | Queues background tasks such as scoring and scheduled notifications. |
| `CELERY_RESULT_BACKEND` | `/2` | Celery | Stores task state/result metadata. |

The OTP service writes keys like:

```text
otp:register:<email>
otp:reset:<email>
```

Each OTP is stored with `SETEX` for 300 seconds. When verification succeeds, the OTP key is deleted so it cannot be reused.

### Local Redis

With Docker Compose:

```yaml
redis:
  image: redis:7-alpine
  ports:
    - "6379:6379"
```

Inside Docker, backend containers use the service hostname:

```env
REDIS_URL=redis://redis:6379/0
CELERY_BROKER_URL=redis://redis:6379/1
CELERY_RESULT_BACKEND=redis://redis:6379/2
```

From your host machine, use:

```env
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2
```

### Cloud Redis

For Railway, use the private Redis URL when the API, worker, and Redis are in the same Railway project/environment. Use the public Redis URL only when the backend connects from another project/account or from outside Railway.

Example:

```env
REDIS_URL=redis://default:<password>@<redis-host>:6379/0
CELERY_BROKER_URL=redis://default:<password>@<redis-host>:6379/1
CELERY_RESULT_BACKEND=redis://default:<password>@<redis-host>:6379/2
```

If the provider gives separate public/private variables such as `REDIS_PUBLIC_URL`, choose the one reachable from the service that runs FastAPI and Celery.

Some managed Redis providers do not support multiple logical databases. If your provider rejects `/1` or `/2`, use the same Redis protocol URL for all three variables and rely on the app/Celery key prefixes. For Upstash, copy the Redis protocol URL, not only the REST URL. Many Upstash URLs use TLS, so the scheme may be `rediss://...`.

### In-Memory Fallback

If the `redis` Python package is missing or Redis is unreachable, the OTP service falls back to an in-memory store. This is only acceptable for local development because:

- OTPs disappear when the API process restarts.
- OTPs are not shared across multiple API instances.
- Celery still needs Redis when background workers are enabled.

If logs show a message like "Failed to connect to Redis ... Using in-memory OTP store", fix `REDIS_URL` before using registration or password reset in production.

### Scoring And Redis

Practice scoring currently prefers inline scoring when:

```env
SCORING_INLINE_ENABLED=true
```

If inline scoring times out or Celery fallback is enabled, the app can use Celery:

```env
SCORING_CELERY_FALLBACK_ENABLED=true
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2
```

Run the worker when using Celery:

```bash
celery -A app.workers.celery_app worker --loglevel=info
celery -A app.workers.celery_app beat --loglevel=info
```

Docker Compose already defines `celery-worker` and `celery-beat`.

## Third-Party Services

| Service | Link | Used for | Backend integration |
| --- | --- | --- | --- |
| GroqCloud | `https://console.groq.com/` | Whisper STT, AI question generation, IELTS scoring | `GROQ_API_KEY`, `GROQ_TRANSCRIPTION_MODEL`, `GROQ_SCORING_MODEL`; used in `/practice/transcribe-audio`, `/practice/generate-questions`, and scoring workers. |
| Azure AI Speech | `https://learn.microsoft.com/en-us/azure/ai-services/speech-service/` | Neural TTS and pronunciation assessment | `AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION`; TTS calls `https://<region>.tts.speech.microsoft.com/cognitiveservices/v1`. |
| SendGrid | `https://www.twilio.com/docs/sendgrid/api-reference/mail-send/mail-send` | OTP emails | `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`; backend posts to `https://api.sendgrid.com/v3/mail/send`. |
| SMTP provider | Provider-specific | OTP email fallback | `SMTP_SERVER`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_FROM_EMAIL`. |
| Firebase Admin SDK | `https://firebase.google.com/docs/admin/setup` | Firebase ID token verification and FCM push | `FIREBASE_SERVICE_ACCOUNT_PATH` or `FIREBASE_SERVICE_ACCOUNT_JSON`. |
| Google OAuth | `https://console.cloud.google.com/apis/credentials` | Google ID token validation | `GOOGLE_OAUTH_WEB_CLIENT_ID`, `GOOGLE_OAUTH_IOS_CLIENT_ID`, `GOOGLE_OAUTH_ANDROID_CLIENT_ID`; used by `/auth/social-login`. |
| Expo Push Service | `https://docs.expo.dev/push-notifications/overview/` | Sending push notifications to Expo push tokens | Backend posts Expo token payloads to `https://exp.host/--/api/v2/push/send`. |
| DictionaryAPI.dev | `https://dictionaryapi.dev/` | English dictionary lookup | Backend proxies `https://api.dictionaryapi.dev/api/v2/entries/en/<word>` through `/vocabulary/dictionary/lookup`. |
| S3-compatible storage | MinIO, Railway Bucket, Cloudflare R2, AWS S3 | Practice audio storage | `AUDIO_STORAGE_BACKEND=s3` plus `S3_*` variables; local development can use MinIO. |
| PostgreSQL provider | Railway, Supabase, Neon, local Docker | Main relational database | `DATABASE_URL`. |
| Redis provider | Railway Redis, Upstash, local Docker | OTP and Celery runtime | `REDIS_URL`, `CELERY_BROKER_URL`, `CELERY_RESULT_BACKEND`. |

`OPENAI_API_KEY` and `GOOGLE_GEMINI_API_KEY` still exist in configuration for compatibility/experimentation, but the active practice routes and scoring worker currently use Groq for STT and LLM scoring.

## IELTS Speaking Flow

### Single-Part Practice

1. The app requests topics with `GET /api/v1/topics`.
2. The user starts a session with `POST /api/v1/practice/start`.
3. The app opens the virtual room screen.
4. The examiner audio is requested with `GET /api/v1/practice/tts?text=...`.
5. Recording starts only after examiner audio finishes.
6. The app uploads the answer with `POST /api/v1/practice/{attempt_id}/upload-audio`.
7. The app submits scoring with `POST /api/v1/practice/{attempt_id}/submit`.
8. The app reads the result from `GET /api/v1/practice/{attempt_id}/result`.

### Full IELTS Speaking Test

The full test runs Part 1, Part 2, and Part 3 in sequence. Each part can have its own practice attempt, and the frontend passes attempt IDs through navigation so results can be shown together.

### Camera Mock Test

The mock test keeps camera preview active while recording audio. Each answer can be transcribed with:

```http
POST /api/v1/practice/transcribe-audio
```

If `GROQ_API_KEY` is missing, the backend returns `503` for transcription instead of pretending to have a transcript.

## API Map

Full API documentation is available at:

- [docs/BACKEND_API_DOCS.md](docs/BACKEND_API_DOCS.md)
- Runtime Swagger: `http://localhost:8000/docs`
- Runtime ReDoc: `http://localhost:8000/redoc`
- Runtime OpenAPI JSON: `http://localhost:8000/openapi.json`

### Authentication

| Purpose | Endpoint |
| --- | --- |
| Send register OTP | `POST /api/v1/auth/register-send-otp` |
| Register | `POST /api/v1/auth/register` |
| Login | `POST /api/v1/auth/login` |
| Social login | `POST /api/v1/auth/social-login` |
| Refresh token | `POST /api/v1/auth/refresh` |
| Forgot password | `POST /api/v1/auth/forgot-password` |
| Verify reset OTP | `POST /api/v1/auth/verify-reset-otp` |
| Reset password | `POST /api/v1/auth/reset-password` |
| Logout | `POST /api/v1/auth/logout` |

Private endpoints require:

```http
Authorization: Bearer <access_token>
```

### Practice

| Purpose | Endpoint |
| --- | --- |
| Start practice | `POST /api/v1/practice/start` |
| Generate questions | `POST /api/v1/practice/generate-questions` |
| Examiner TTS | `GET /api/v1/practice/tts?text=...` |
| Upload audio | `POST /api/v1/practice/{attempt_id}/upload-audio` |
| Transcribe mock answer | `POST /api/v1/practice/transcribe-audio` |
| Submit scoring | `POST /api/v1/practice/{attempt_id}/submit` |
| Get result | `GET /api/v1/practice/{attempt_id}/result` |
| Practice history | `GET /api/v1/practice/history` |
| Practice stats | `GET /api/v1/practice/stats` |

### Learning Content

| Area | Endpoints |
| --- | --- |
| Topics | `GET /api/v1/topics`, `GET /api/v1/topics/recommended`, `GET /api/v1/topics/mock-test`, `GET /api/v1/topics/{topic_id}`, `GET /api/v1/topics/{topic_id}/questions` |
| Vocabulary | `GET /api/v1/vocabulary`, `POST /api/v1/vocabulary`, `GET /api/v1/vocabulary/review-due`, `PATCH /api/v1/vocabulary/{vocabulary_id}`, `DELETE /api/v1/vocabulary/{vocabulary_id}` |
| Dictionary | `GET /api/v1/vocabulary/dictionary/lookup?word=hello` |
| Flashcards | `GET /api/v1/flashcards/decks`, `POST /api/v1/flashcards/decks`, `GET /api/v1/flashcards/decks/{deck_id}`, `PATCH /api/v1/flashcards/decks/{deck_id}`, `DELETE /api/v1/flashcards/decks/{deck_id}`, `POST /api/v1/flashcards/decks/{deck_id}/cards`, `POST /api/v1/flashcards/cards/{card_id}/review`, `GET /api/v1/flashcards/decks/{deck_id}/study`, `POST /api/v1/flashcards/decks/auto-generate` |
| Leaderboard | `GET /api/v1/leaderboard`, `GET /api/v1/leaderboard/me` |
| Blog | `GET /api/v1/blog`, `GET /api/v1/blog/featured`, `GET /api/v1/blog/{slug}` |
| Forecast | `GET /api/v1/forecast` |

### Notifications

| Purpose | Endpoint |
| --- | --- |
| Get settings | `GET /api/v1/notifications/settings` |
| Update settings | `PATCH /api/v1/notifications/settings` |
| List notifications | `GET /api/v1/notifications` |
| Unread count | `GET /api/v1/notifications/unread-count` |
| Mark all read | `PATCH /api/v1/notifications/read-all` |
| Mark one read | `PATCH /api/v1/notifications/{notification_id}/read` |
| Register device token | `POST /api/v1/notifications/devices/register` |
| Delete device token | `DELETE /api/v1/notifications/devices/{token}` |
| Admin send campaign | `POST /api/v1/notifications/admin/send` |
| Admin campaign list | `GET /api/v1/notifications/admin/campaigns` |

### Admin

Admin endpoints require an authenticated user with `is_admin=true`.

| Purpose | Endpoint |
| --- | --- |
| Dashboard metrics | `GET /api/v1/admin/dashboard` |
| System health | `GET /api/v1/admin/system-health` |
| Users | `GET /api/v1/admin/users`, `PATCH /api/v1/admin/users/{user_id}/status` |
| Topics | `GET /api/v1/admin/topics`, `POST /api/v1/admin/topics`, `PUT /api/v1/admin/topics/{topic_id}`, `DELETE /api/v1/admin/topics/{topic_id}` |
| Questions | `GET /api/v1/admin/questions`, `POST /api/v1/admin/questions`, `PUT /api/v1/admin/questions/{question_id}`, `DELETE /api/v1/admin/questions/{question_id}` |
| Blog admin | `POST /api/v1/blog/admin/create`, `PUT /api/v1/blog/admin/{post_id}`, `DELETE /api/v1/blog/admin/{post_id}`, `GET /api/v1/blog/admin/all` |
| Forecast admin | `POST /api/v1/forecast/admin/create`, `PUT /api/v1/forecast/admin/{post_id}`, `DELETE /api/v1/forecast/admin/{post_id}` |

## Admin CMS

The static admin CMS is served from:

```text
unilingo-backend/app/admin_web/index.html
```

Open it locally at:

```text
http://localhost:8000/admin-web
```

The system-health panel calls:

```http
GET /api/v1/admin/system-health
```

It returns non-secret status only, including provider names, model names, voice, region, storage backend, inline scoring status, and required environment variable names. It never returns API keys.

## Troubleshooting

### The phone cannot call the local backend

- Do not use `localhost` on a physical phone.
- Use the development machine LAN IP, for example `http://192.168.1.10:8000/api/v1`.
- Make sure the phone and development machine are on the same network.
- In Android emulator, the fallback URL is `http://10.0.2.2:8000/api/v1`.

### TTS returns 501

- Set `AZURE_SPEECH_KEY` and `AZURE_SPEECH_REGION`.
- Restart the backend after editing `.env`.
- Check Admin CMS -> System health -> TTS.

### TTS still uses old voice/style

TTS output is cached in:

```text
unilingo-backend/app/cache/tts
```

Delete cached files after changing voice, style, rate, or output format.

### Transcript is unavailable

- Set `GROQ_API_KEY`.
- Restart the backend because settings are cached.
- Check Admin CMS -> System health -> Speech to Text.

### OTP email is not received

- Configure SendGrid first: `SENDGRID_API_KEY` and `SENDGRID_FROM_EMAIL`.
- Verify the sender/domain inside SendGrid.
- If using SMTP fallback, use an app password where required.
- Check backend logs. In local development, OTP is also printed to logs.
- Make sure Redis is reachable so OTPs survive across requests.

### Redis is not being used

Check backend logs for Redis connection warnings. Then verify:

```bash
redis-cli -u redis://localhost:6379/0 ping
redis-cli -u redis://localhost:6379/1 ping
redis-cli -u redis://localhost:6379/2 ping
```

Expected response:

```text
PONG
```

### Celery jobs do not run

- Start `celery-worker` and `celery-beat`.
- Verify `CELERY_BROKER_URL` and `CELERY_RESULT_BACKEND`.
- Check worker logs.
- If you only want inline scoring during development, keep `SCORING_INLINE_ENABLED=true`.

## Checks

Frontend type check:

```bash
cd unilingo_frontend
npx tsc --noEmit
```

Backend compile check:

```bash
cd unilingo-backend
python -m compileall app
```

Manual flows to test:

- Register with OTP, then login.
- Start Part 1 practice, hear examiner TTS, record, upload, submit, and view result.
- Run Part 2 with prep time and long-turn recording.
- Run camera mock test and verify camera preview stays active while recording.
- Open dictionary lookup from a result vocabulary word.
- Register a push token and send a notification campaign from Admin CMS.
- Open Admin CMS system health and verify third-party service configuration.

## License

This project is used for learning, research, and portfolio work.
