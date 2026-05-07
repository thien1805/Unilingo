# 🔗 Unilingo — Frontend ↔ Backend API Mapping

> Tài liệu này ánh xạ (mapping) chính xác: **Screen nào** gọi **API nào** → **Backend xử lý ra sao**.
> Dùng để double-check và trace bugs.

---

## Tổng Quan Kết Nối

```
┌─────────────────────────┐         ┌──────────────────────────┐
│   React Native (Expo)   │  HTTP   │    FastAPI Backend        │
│   Axios + JWT           │ ──────→ │    PostgreSQL + Redis     │
│   Port: Mobile Device   │ ←────── │    Port: 8000             │
└─────────────────────────┘   JSON  └──────────────────────────┘
         │                                    │
         │ BASE_URL:                          │ Docker internal:
         │ http://10.0.0.249:8000/api/v1      │ db:5432, redis:6379
         │                                    │ minio:9000
```

---

## 1. Authentication

| Frontend Screen | Frontend API Call | Backend Route | Backend Logic |
|---|---|---|---|
| `LoginScreen` | `authAPI.login({email, password})` | `POST /api/v1/auth/login` | `authenticate_user()` → verify bcrypt → `generate_tokens()` |
| `LoginScreen` | `usersAPI.getMe()` | `GET /api/v1/users/me` | Query User by JWT sub → return profile |
| `RegisterScreen` | `authAPI.register({email, password, full_name})` | `POST /api/v1/auth/register` | `register_user()` → check duplicates → hash password → create User |
| `RegisterScreen` | `usersAPI.getMe()` | `GET /api/v1/users/me` | Query User by JWT sub |
| `client.ts` interceptor | `authAPI.refreshToken(refresh_token)` | `POST /api/v1/auth/refresh` | `decode_token()` → verify type=refresh → `generate_tokens()` |
| `SettingsScreen` | `authAPI.logout()` | `POST /api/v1/auth/logout` | Placeholder (invalidate server-side if needed) |

**Token Storage (Frontend):** `expo-secure-store` (encrypted)  
**Token Validation (Backend):** JWT decode with `python-jose` → check `exp`, `type`, `sub`

---

## 2. Home Dashboard

| Frontend Screen | Frontend API Call | Backend Route | Backend Logic |
|---|---|---|---|
| `HomeScreen` | `usersAPI.getDashboard()` | `GET /api/v1/users/me/dashboard` | Aggregate: today's tests, weekly band trend, skill breakdown, vocab stats |
| `HomeScreen` | `practiceAPI.getHistory({per_page: 5})` | `GET /api/v1/practice/history?per_page=5` | Query last 5 TestAttempts ordered by started_at DESC |
| `HomeScreen` | `vocabularyAPI.getReviewDue()` | `GET /api/v1/vocabulary/review-due` | Query VocabularyNotes where next_review_at ≤ now |

---

## 3. Practice Flow

| Frontend Screen | Frontend API Call | Backend Route | Backend Logic |
|---|---|---|---|
| `PracticeScreen` | `topicsAPI.list({ielts_part})` | `GET /api/v1/topics?ielts_part=part1` | Query Topics filtered, include question_count |
| `VirtualRoomScreen` | `practiceAPI.start({topic_id, ielts_part})` | `POST /api/v1/practice/start` | Create TestAttempt → random select Question → return question data |
| `RecordingScreen` | `practiceAPI.uploadAudio(attemptId, formData)` | `POST /api/v1/practice/{id}/upload-audio` | Save .m4a to MinIO → create AttemptPart → return audio_url |
| `RecordingScreen` | `practiceAPI.submit(attemptId)` | `POST /api/v1/practice/{id}/submit` | Set status="scoring" → enqueue `score_practice_attempt` Celery task |
| `ResultsScreen` | `practiceAPI.getResult(attemptId)` | `GET /api/v1/practice/{id}/result` | Load attempt + parts + AI scoring results → return structured response |
| `PracticeHistoryScreen` | `practiceAPI.getHistory({page, per_page, ielts_part})` | `GET /api/v1/practice/history` | Paginated query TestAttempts with filters |

### AI Scoring Pipeline (Backend, asynchronous)

```
Celery Worker:
  score_practice_attempt(attempt_id)
    → Load TestAttempt + AttemptParts
    → For each part:
        → transcribe_audio(audio_url) [OpenAI Whisper]
        → assess_pronunciation(audio_url) [Azure Speech]  
        → score_with_llm(transcript, question, part, pronunciation) [Google Gemini]
        → Save AIScoringResult to DB
    → Average scores across parts
    → Calculate XP = overall_band × 10
    → Update status = "completed"
```

**Frontend Polling:** ResultsScreen polls `getResult()` every 3 seconds when status="scoring" (max 90s).

---

## 4. Vocabulary

| Frontend Screen | Frontend API Call | Backend Route | Backend Logic |
|---|---|---|---|
| `VocabularyScreen` | `vocabularyAPI.list({mastery_level, search, per_page})` | `GET /api/v1/vocabulary` | Paginated query with filters (mastery, search ILIKE) |
| `VocabularyScreen` | `vocabularyAPI.list({mastery_level: 'new', per_page: 1})` | `GET /api/v1/vocabulary?mastery_level=new&per_page=1` | Count query for filter tabs |
| `VocabularyScreen` (Dictionary) | `vocabularyAPI.lookupDictionary(word)` | `GET /api/v1/vocabulary/dictionary/lookup?word=...` | Proxy call to Free Dictionary API → format response |
| `VocabularyScreen` (Add) | `vocabularyAPI.add({word, definitions, ...})` | `POST /api/v1/vocabulary` | Create VocabularyNote, set mastery_level="new" |

---

## 5. Flashcards

| Frontend Screen | Frontend API Call | Backend Route | Backend Logic |
|---|---|---|---|
| `FlashcardDecksScreen` | `flashcardsAPI.listDecks()` | `GET /api/v1/flashcards/decks` | Query FlashcardDecks where user_id = current |
| `FlashcardDecksScreen` | `flashcardsAPI.createDeck({title, description})` | `POST /api/v1/flashcards/decks` | Create FlashcardDeck |
| `FlashcardDecksScreen` | `flashcardsAPI.deleteDeck(deckId)` | `DELETE /api/v1/flashcards/decks/{id}` | Delete deck + cascade delete all cards |
| `FlashcardDecksScreen` | `flashcardsAPI.autoGenerateDeck({...})` | `POST /api/v1/flashcards/decks/auto-generate` | Query user's vocab → create deck + cards |
| `FlashcardStudyScreen` | `flashcardsAPI.getStudySession(deckId)` | `GET /api/v1/flashcards/decks/{id}/study` | Query cards where next_review_at ≤ now |
| `FlashcardStudyScreen` | `flashcardsAPI.reviewCard(cardId, quality)` | `POST /api/v1/flashcards/cards/{id}/review` | SM-2 algorithm → update interval, easiness_factor |

---

## 6. Leaderboard

| Frontend Screen | Frontend API Call | Backend Route | Backend Logic |
|---|---|---|---|
| `LeaderboardScreen` | `leaderboardAPI.get(period)` | `GET /api/v1/leaderboard?period=weekly` | Query users ranked by avg_band or total_xp |
| `LeaderboardScreen` | (included in `get` response) | — | `my_rank` included in response |

---

## 7. Profile & Settings

| Frontend Screen | Frontend API Call | Backend Route | Backend Logic |
|---|---|---|---|
| `ProfileScreen` | Reads from `authStore.user` | — | No API call, data from initial login |
| `SettingsScreen` | `usersAPI.updateProfile({...})` | `PATCH /api/v1/users/me` | Update User fields, return updated profile |
| `SettingsScreen` | `usersAPI.changePassword(current, new)` | `POST /api/v1/users/me/change-password` | Verify current password → hash new → update |

---

## 8. Checklist: Những Điểm Cần Double-Check

### Frontend
- [ ] `client.ts` BASE_URL: Đã đúng IP máy chạy backend chưa? (hiện: `10.0.0.249`)
- [ ] Token refresh flow: Khi 401, có retry đúng request gốc không?
- [ ] `users.ts` duplicate `leaderboardAPI` — có conflict với `leaderboard.ts`?
- [ ] Mock data fallback: Có screens nào silently fail mà user không biết?
- [ ] Audio upload FormData: Field name `file` có match backend endpoint?
- [ ] Polling ResultsScreen: Có cleanup interval khi unmount không?

### Backend
- [ ] `main.py`: CORS `allow_origins=["*"]` — cần restrict cho production
- [ ] `config.py`: Default secrets ("change-me-in-production") — phải thay
- [ ] `database.py`: `init_db()` auto-create tables — production cần Alembic migrations
- [ ] `auth_service.py`: `register_user()` có validate email format không?
- [ ] `scoring_service.py`: Mock data khi API keys trống — production cần real keys
- [ ] `notification_tasks.py`: Tất cả tasks đều TODO — chưa implement
- [ ] `scoring_tasks.py`: `asyncio.run()` trong Celery task — có đúng pattern không?
- [ ] S3/MinIO: Audio upload/download flow đã hoàn chỉnh chưa?

### Integration
- [ ] Schema match: Frontend TypeScript interfaces có khớp backend Pydantic schemas?
- [ ] Error handling: Backend error format có được frontend parse đúng?
- [ ] Date formats: Backend trả ISO string, frontend parse đúng timezone?
- [ ] Pagination: Frontend `page/per_page` params match backend query?
