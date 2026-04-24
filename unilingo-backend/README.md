# Unilingo Backend

IELTS Speaking Practice Platform - API Backend

## Tech Stack
- **FastAPI** (Python 3.11+) with async support
- **PostgreSQL 16** with SQLAlchemy 2.0 (async)
- **Redis** for caching & Celery broker
- **Celery** for background AI scoring tasks
- **MinIO** for audio file storage
- **Docker Compose** for local development

## Quick Start

### 1. Clone & Setup
```bash
cp .env.example .env
# Edit .env with your API keys
```

### 2. Start with Docker
```bash
docker-compose up -d
```

### 3. Seed Database
```bash
docker-compose exec api python -m app.seed
```

### 4. Access
- API Docs: http://localhost:8000/docs
- MinIO Console: http://localhost:9001

## Project Structure
```
app/
├── main.py           # FastAPI entry point
├── config.py         # Settings (env vars)
├── database.py       # SQLAlchemy async setup
├── api/v1/           # REST API routes
├── models/           # SQLAlchemy ORM models
├── schemas/          # Pydantic schemas
├── services/         # Business logic
├── ai/               # AI scoring pipeline
├── workers/          # Celery tasks
└── seed.py           # Database seeder
```

## API Endpoints
- `POST /api/v1/auth/register` - Register
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/topics` - List topics
- `POST /api/v1/practice/start` - Start practice
- `POST /api/v1/practice/{id}/upload-audio` - Upload recording
- `POST /api/v1/practice/{id}/submit` - Submit for AI scoring
- `GET /api/v1/practice/{id}/result` - Get results
- `GET /api/v1/vocabulary` - Vocabulary notes
- `GET /api/v1/vocabulary/dictionary/lookup` - Dictionary
- `GET /api/v1/flashcards/decks` - Flashcard decks
- `GET /api/v1/leaderboard` - Rankings

See full docs at `/docs` when running.
