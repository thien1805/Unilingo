# Railway Storage, AI Scoring, And iOS Build Guide

## Recommended Storage On Railway

Use **Railway Storage Buckets** for production audio. They are S3-compatible and private by default, so the backend can upload recordings and workers/API processes can download them for AI scoring.

Avoid relying on `app/uploads` in production. Railway API and worker services can run in separate containers, so a local file written by the API may not exist in the worker container.

## Railway Bucket Setup

1. Open your Railway project.
2. Click **Create** / **New** and select **Bucket**.
3. Pick the same or nearest region to your API service.
4. Open the bucket **Credentials** tab.
5. In your API service variables, set:

```env
AUDIO_STORAGE_BACKEND=s3
S3_ENDPOINT_URL=${{Bucket.ENDPOINT}}
S3_ACCESS_KEY=${{Bucket.ACCESS_KEY_ID}}
S3_SECRET_KEY=${{Bucket.SECRET_ACCESS_KEY}}
S3_BUCKET_NAME=${{Bucket.BUCKET}}
S3_REGION=${{Bucket.REGION}}
S3_ADDRESSING_STYLE=virtual
S3_AUDIO_PREFIX=practice-audio
```

If Railway auto-injects the bucket variables, map them to the names above. Keep the bucket private; the app does not need public audio URLs.

## Cloudflare R2 Alternative

```env
AUDIO_STORAGE_BACKEND=s3
S3_ENDPOINT_URL=https://<account-id>.r2.cloudflarestorage.com
S3_ACCESS_KEY=<r2-access-key-id>
S3_SECRET_KEY=<r2-secret-access-key>
S3_BUCKET_NAME=unilingo-audio
S3_REGION=auto
S3_ADDRESSING_STYLE=auto
S3_AUDIO_PREFIX=practice-audio
```

## Local MinIO

For local development, the existing Docker Compose MinIO service can be used:

```env
AUDIO_STORAGE_BACKEND=s3
S3_ENDPOINT_URL=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET_NAME=unilingo-audio
S3_REGION=us-east-1
S3_ADDRESSING_STYLE=path
```

Create the `unilingo-audio` bucket in the MinIO console before testing uploads.

## MinIO On Railway

MinIO can run on Railway, but it is not the smoothest production path because you must manage a separate service, credentials, public/private endpoint, and a persistent volume. Use it only if you specifically need self-managed S3-compatible storage.

Minimum variables for a Railway MinIO service:

```env
MINIO_ROOT_USER=<strong-user>
MINIO_ROOT_PASSWORD=<strong-password>
```

Mount a Railway volume to MinIO's data directory. Then point the API variables at the MinIO endpoint and use:

```env
AUDIO_STORAGE_BACKEND=s3
S3_ADDRESSING_STYLE=path
```

## AI Scoring Speed Variables

The backend now supports fast scoring mode:

```env
AI_SCORING_DETAIL_MODE=fast
GROQ_TRANSCRIPTION_MODEL=whisper-large-v3
GROQ_SCORING_MODEL=llama-3.3-70b-versatile
GROQ_SCORING_MAX_TOKENS=900
SCORING_INLINE_ENABLED=true
SCORING_INLINE_TIMEOUT_SECONDS=150
SCORING_CELERY_FALLBACK_ENABLED=true
```

For a faster but less detailed score, switch `GROQ_SCORING_MODEL` to a smaller low-latency model available in your Groq account. Keep `AI_SCORING_DETAIL_MODE=fast` for the mobile flow.

## iOS Build With EAS

From `unilingo_frontend`:

```bash
npm install
npx eas-cli@latest login
npx eas-cli@latest init
```

Set your production API URL for EAS builds:

```bash
npx eas-cli@latest env:create --environment production --name EXPO_PUBLIC_API_URL --value https://<your-api>.up.railway.app/api/v1 --visibility plaintext
```

Build for TestFlight/App Store:

```bash
npm run build:ios
```

Submit the latest iOS build:

```bash
npm run submit:ios
```

Fast interactive TestFlight path:

```bash
npm run testflight
```

Local simulator run on macOS:

```bash
npm run ios
```

Requirements:

- Apple Developer Program membership for TestFlight/App Store.
- Bundle identifier is currently `com.unilingo.app` in `app.json`.
- Microphone and camera permission text is already configured in `app.json`.
