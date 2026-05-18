# Unilingo Deployment Guide - Backend, APK, Databases

Last verified: 2026-05-18

This guide deploys the current Unilingo stack with free or near-free services:

- Backend: FastAPI Docker service from `unilingo-backend/`
- Frontend: Expo React Native Android APK from `unilingo_frontend/`
- Databases/services: PostgreSQL, Redis, S3-compatible object storage
- Optional services: SMTP, Firebase service account, AI provider keys

Official free-tier/pricing references used:

- Render free web services: https://render.com/docs/free
- Render Docker deploys: https://render.com/docs/docker
- Koyeb free web service alternative: https://www.koyeb.com/docs/faqs/pricing
- Supabase pricing/free Postgres + Storage: https://supabase.com/pricing
- Neon free Postgres alternative: https://neon.com/pricing
- Upstash Redis pricing/free tier: https://upstash.com/pricing
- Cloudflare R2 free tier: https://developers.cloudflare.com/r2/pricing/
- Expo EAS plans: https://docs.expo.dev/billing/plans
- Expo EAS build setup: https://docs.expo.dev/build/setup/
- Expo `eas.json` build profiles: https://docs.expo.dev/build/eas-json/

## 1. Recommended Free Architecture

Use this for an MVP/demo deployment:

| Part | Recommended free provider | Why |
| --- | --- | --- |
| Backend API | Render Free Web Service | Simple Docker deploy from GitHub. Free services can spin down and have monthly limits. |
| PostgreSQL | Supabase Free or Neon Free | Managed Postgres. Avoid Render free Postgres for anything long-lived because Render free databases expire. |
| Redis / Celery broker | Upstash Redis Free | Serverless Redis endpoint; enough for light queue/cache usage. |
| Audio/object storage | Cloudflare R2 Free | S3-compatible, 10 GB-month free standard storage, no egress fee. |
| APK build | Expo EAS Build Free | Free low-priority cloud builds; APK can be built with a preview profile. |

Important limitations:

- Free backend instances may sleep, so the first request can be slow.
- Free databases/storage have quotas and no strong production SLA.
- Expo environment variables are baked into the APK at build time. If `EXPO_PUBLIC_API_URL` changes, rebuild the APK.
- Do not deploy `docker-compose.yml` as-is to production. Use managed Postgres, Redis, and object storage instead.

## 2. Prepare The Repository

Before deploying:

1. Push the repository to GitHub/GitLab/Bitbucket.
2. Make sure secrets are not committed:

```bash
git status --short
git check-ignore unilingo-backend/.env unilingo_frontend/.env
```

3. Keep production secrets in provider dashboards, not in git.
4. Generate strong secrets:

```bash
openssl rand -hex 32
```

Use generated values for `SECRET_KEY` and `JWT_SECRET_KEY`.

## 3. Create PostgreSQL Database

### Option A: Supabase Free

1. Go to https://supabase.com/dashboard.
2. Create a new project.
3. Save the database password securely.
4. Open `Project Settings` -> `Database`.
5. Copy a connection string.
6. Convert the driver prefix for this backend:

```text
postgresql://USER:PASSWORD@HOST:PORT/DB
```

to:

```text
postgresql+asyncpg://USER:PASSWORD@HOST:PORT/DB
```

If your provider requires SSL and the connection fails, try appending:

```text
?ssl=true
```

### Option B: Neon Free

1. Go to https://console.neon.tech.
2. Create a free project.
3. Copy the Postgres connection string.
4. Convert `postgresql://` to `postgresql+asyncpg://`.
5. Keep the SSL query parameter if Neon includes one.

## 4. Create Redis

Use Upstash Redis:

1. Go to https://console.upstash.com/redis.
2. Create a free Redis database.
3. Copy the Redis URL.
4. Use the same URL for:

```text
REDIS_URL=<upstash-redis-url>
CELERY_BROKER_URL=<upstash-redis-url>
CELERY_RESULT_BACKEND=<upstash-redis-url>
```

Notes:

- This backend uses Redis for OTP and Celery.
- If the Upstash URL starts with `rediss://`, keep it exactly as provided.

## 5. Create Object Storage For Audio

Use Cloudflare R2:

1. Go to Cloudflare Dashboard -> `R2 Object Storage`.
2. Create a bucket, for example:

```text
unilingo-audio
```

3. Create an R2 API token with read/write access to this bucket.
4. Copy:

```text
Account ID
Access Key ID
Secret Access Key
Bucket name
```

5. Backend environment values:

```text
S3_ENDPOINT_URL=https://<cloudflare-account-id>.r2.cloudflarestorage.com
S3_ACCESS_KEY=<r2-access-key-id>
S3_SECRET_KEY=<r2-secret-access-key>
S3_BUCKET_NAME=unilingo-audio
S3_REGION=auto
```

## 6. Deploy Backend On Render

### 6.1 Create Web Service

1. Go to https://dashboard.render.com.
2. Click `New` -> `Web Service`.
3. Connect the repository.
4. Configure:

```text
Name: unilingo-api
Root Directory: unilingo-backend
Language: Docker
Branch: main
Plan: Free
```

5. Use this Docker command instead of the Dockerfile default:

```bash
sh -c 'uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}'
```

Reason: the current `Dockerfile` uses `--reload` and hardcodes port `8000`, which is good for local development but not ideal for production.

### 6.2 Add Environment Variables

Set these in Render -> service -> `Environment`:

```text
APP_NAME=Unilingo
APP_VERSION=1.0.0
DEBUG=true
SECRET_KEY=<strong-random-secret>
API_V1_PREFIX=/api/v1

DATABASE_URL=postgresql+asyncpg://...

REDIS_URL=...
CELERY_BROKER_URL=...
CELERY_RESULT_BACKEND=...

JWT_SECRET_KEY=<strong-random-jwt-secret>
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60
JWT_REFRESH_TOKEN_EXPIRE_DAYS=30

FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json

OPENAI_API_KEY=
GOOGLE_GEMINI_API_KEY=
AZURE_SPEECH_KEY=<optional>
AZURE_SPEECH_REGION=southeastasia
GROQ_API_KEY=<optional>

S3_ENDPOINT_URL=https://<cloudflare-account-id>.r2.cloudflarestorage.com
S3_ACCESS_KEY=<r2-access-key-id>
S3_SECRET_KEY=<r2-secret-access-key>
S3_BUCKET_NAME=unilingo-audio
S3_REGION=auto

SMTP_SERVER=smtp.gmail.com
SMTP_PORT=465
SMTP_USERNAME=<optional>
SMTP_PASSWORD=<optional-app-password>
SMTP_FROM_EMAIL=<optional>
```

Bootstrap note:

- The repo currently creates tables in `init_db()` when `DEBUG=true`.
- For the first deploy, keep `DEBUG=true` so tables are created.
- After the first successful deploy and seed, change `DEBUG=false` and redeploy.
- A better production improvement is to add real Alembic migrations later.

### 6.3 Firebase Service Account For Social Login

The backend reads Firebase Admin credentials from `FIREBASE_SERVICE_ACCOUNT_PATH`.
On Render/Koyeb, that file is not automatically available.

For email/password login only:

- You can skip Firebase for now.
- Social login endpoints will fail until Firebase credentials are configured.

For Google/Apple social login:

1. In Firebase Console, create/download a service account JSON.
2. Do not commit the JSON file.
3. Recommended implementation improvement: update backend config to also support a `FIREBASE_SERVICE_ACCOUNT_JSON` environment variable and write it to a temp file on startup.
4. If using a paid provider feature that supports secret files, mount the JSON file and set:

```text
FIREBASE_SERVICE_ACCOUNT_PATH=/path/to/firebase-service-account.json
```

### 6.4 Deploy And Check Health

1. Click `Create Web Service`.
2. Wait until Render shows `Live`.
3. Open:

```text
https://<render-service-name>.onrender.com/health
```

Expected:

```json
{"status":"healthy","app":"Unilingo","version":"1.0.0"}
```

4. API docs:

```text
https://<render-service-name>.onrender.com/docs
```

### 6.5 Seed Database

Run from your local machine after configuring the remote `DATABASE_URL`.

```bash
cd unilingo-backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
DATABASE_URL='postgresql+asyncpg://...' DEBUG=true python -m app.seed
```

If your shell has trouble with special characters in the URL, wrap the URL in single quotes and URL-encode special characters in the password.

## 7. Backend Alternative: Koyeb

Use Koyeb if Render free slots are unavailable:

1. Go to https://app.koyeb.com.
2. Create `Web Service`.
3. Connect the Git repository.
4. Set root/build context to `unilingo-backend`.
5. Select Dockerfile deployment.
6. Use command:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

7. Add the same environment variables from section 6.2.
8. Deploy and check `/health`.

## 8. Build Frontend APK With Expo EAS

### 8.1 Set Production API URL

Edit `unilingo_frontend/.env` before building:

```text
EXPO_PUBLIC_API_URL=https://<render-service-name>.onrender.com/api/v1
EXPO_PUBLIC_API_URL_STRICT=true
```

Why `EXPO_PUBLIC_API_URL_STRICT=true`:

- During local Expo development, the app can auto-detect your LAN backend.
- For APK production/preview, the app must always use the public backend URL.

### 8.2 Install And Login To EAS

```bash
cd unilingo_frontend
npm install
npm install --global eas-cli
eas login
```

If you do not have an Expo account, create one at https://expo.dev.

### 8.3 Configure EAS

Run:

```bash
eas build:configure
```

If `eas.json` does not exist, create or edit it like this:

```json
{
  "cli": {
    "version": ">= 13.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

Use:

- `preview` for installable APK testing.
- `production` for Google Play `.aab`.

### 8.4 Build APK

```bash
eas build --platform android --profile preview
```

When prompted for Android credentials, let Expo manage/generate the keystore unless you already have one.

After the build finishes:

1. Open the EAS build URL shown in terminal.
2. Download the `.apk`.
3. Install on Android device.
4. Test:

```text
Login
Register
Practice recording/upload
Vocabulary
Flashcards
Leaderboard
```

### 8.5 Common APK Issues

If APK still calls localhost or a LAN IP:

1. Check `unilingo_frontend/.env`.
2. Make sure it contains the public HTTPS API URL.
3. Rebuild the APK. Expo public env vars are baked into the bundle.

If login fails with network error:

1. Open `https://<render-service-name>.onrender.com/health` from the phone browser.
2. If it is slow the first time, wait for Render free service to wake up.
3. Try login again.

If Android blocks cleartext HTTP:

- Use HTTPS Render/Koyeb URL in APK, not `http://`.

## 9. Production Checklist

Backend:

- `/health` returns healthy.
- `/docs` loads.
- `DEBUG=false` after first table creation.
- `SECRET_KEY` and `JWT_SECRET_KEY` are strong random values.
- `DATABASE_URL` points to managed Postgres.
- `REDIS_URL`, `CELERY_BROKER_URL`, `CELERY_RESULT_BACKEND` point to Upstash.
- `S3_*` points to Cloudflare R2.
- SMTP is configured if OTP/password reset email is required.
- Firebase service account is available if social login is required.

Frontend APK:

- `.env` uses public HTTPS API URL.
- `EXPO_PUBLIC_API_URL_STRICT=true`.
- APK was rebuilt after env changes.
- Login/register tested on a real Android device.

Database:

- Tables created.
- Seed data inserted with `python -m app.seed`.
- Provider dashboard usage is below free quotas.

Storage:

- R2 bucket exists.
- API token can write/read objects.
- Audio upload endpoint tested.

## 10. Recommended Follow-Up Improvements

These are not required for a free MVP deploy, but should be done before real production:

1. Add Alembic migration files and run migrations during deploy.
2. Remove `--reload` from the production Dockerfile or create a production Dockerfile.
3. Add a `/api/v1/health` route if frontend/API monitoring expects all endpoints under `/api/v1`.
4. Add structured logging for request IDs and auth failures.
5. Add separate staging and production `.env` values.
6. Add CI checks:

```bash
cd unilingo_frontend && npx tsc --noEmit
cd unilingo-backend && python -m compileall app
```

7. Consider paid plans once real users depend on the app. Free plans can sleep, throttle, expire, or change limits.
