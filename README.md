# Unilingo Mobile

Unilingo là nền tảng luyện IELTS Speaking gồm ứng dụng mobile Expo/React Native và backend FastAPI. Dự án tập trung vào workflow nói thật: examiner đọc câu hỏi bằng TTS, ứng dụng ghi âm câu trả lời, backend lưu audio, speech-to-text, đánh giá pronunciation và chấm band theo rubric IELTS.

Tài liệu này mô tả cách chạy dự án, công nghệ, cấu trúc thư mục, luồng dữ liệu, API liên quan và các điểm cấu hình quan trọng.

## Mục Lục

- [Tính năng chính](#tính-năng-chính)
- [Kiến trúc tổng quan](#kiến-trúc-tổng-quan)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Luồng IELTS Speaking](#luồng-ielts-speaking)
- [Yêu cầu môi trường](#yêu-cầu-môi-trường)
- [Cài đặt backend](#cài-đặt-backend)
- [Cài đặt frontend](#cài-đặt-frontend)
- [Biến môi trường quan trọng](#biến-môi-trường-quan-trọng)
- [Admin CMS](#admin-cms)
- [API và tài liệu liên quan](#api-và-tài-liệu-liên-quan)
- [Troubleshooting](#troubleshooting)
- [Kiểm thử và chất lượng](#kiểm-thử-và-chất-lượng)

## Tính Năng Chính

- IELTS Speaking Part 1, Part 2, Part 3 theo từng topic riêng lẻ.
- Full IELTS Speaking Test không camera.
- IELTS Speaking Mock Test có camera preview và microphone.
- Examiner TTS đọc intro, câu hỏi, transition và ending.
- Ghi âm audio bằng `expo-av`, upload lên backend theo từng attempt.
- Full mock test lưu nhiều câu trả lời, transcribe từng câu bằng Groq Whisper.
- Practice flow gửi attempt vào scoring pipeline, trả band score và feedback.
- Vocabulary notebook, flashcards SRS, leaderboard, blog, forecast và notifications.
- Admin CMS quản lý blog, forecast, IELTS topics/questions, user và notification campaign.
- Admin system-health panel để kiểm tra TTS/STT/scoring/storage đã cấu hình chưa.

## Kiến Trúc Tổng Quan

```text
Mobile app (Expo)
  -> Auth / Topic / Practice APIs
  -> TTS endpoint for examiner voice
  -> Upload audio answers
  -> Poll scoring result

FastAPI backend
  -> PostgreSQL data models
  -> Local/S3 audio storage
  -> Groq Whisper STT
  -> Azure Neural TTS + Pronunciation Assessment
  -> Groq LLM scoring
  -> Optional Celery + Redis background scoring

Admin web
  -> Served by backend at /admin-web
  -> Calls /api/v1/admin, /blog/admin, /forecast/admin, /notifications/admin
```

## Công Nghệ Sử Dụng

### Frontend

| Nhóm | Công nghệ |
|---|---|
| Framework | Expo SDK 54, React Native 0.81, React 19, TypeScript |
| Navigation | React Navigation native stack + bottom tabs |
| Server state | TanStack Query |
| Local state | Zustand |
| Audio | `expo-av` recording/playback |
| Camera | `expo-camera` |
| TTS fallback | `expo-speech` |
| UI | `expo-linear-gradient`, `@expo/vector-icons`, custom theme/components |
| Secure storage | `expo-secure-store`, `react-native-mmkv` |
| Notifications | `expo-notifications` |

### Backend

| Nhóm | Công nghệ |
|---|---|
| API | FastAPI, Pydantic, Uvicorn |
| Database | PostgreSQL hoặc SQLite local, SQLAlchemy async |
| Auth | JWT access/refresh token, Google OAuth token verify |
| Background jobs | Celery + Redis |
| Audio storage | Local filesystem hoặc S3-compatible bucket |
| STT | Groq Whisper (`GROQ_TRANSCRIPTION_MODEL`) |
| TTS | Azure Neural TTS |
| Pronunciation | Azure Speech Pronunciation Assessment |
| AI scoring | Groq Chat Completions |
| Admin web | Static HTML/CSS/JS served by FastAPI |

## Cấu Trúc Thư Mục

```text
unilingo_mobile/
├── README.md
├── docs/
│   ├── BACKEND_API_DOCS.md              # API reference chi tiết
│   ├── PROJECT_DOCUMENTATION_VI.md      # Tài liệu tổng hợp tiếng Việt
│   ├── API_MAPPING.md                   # Mapping màn hình frontend -> endpoint
│   ├── BACKEND_ARCHITECTURE.md          # Kiến trúc backend
│   ├── FRONTEND_ARCHITECTURE.md         # Kiến trúc frontend
│   └── RAILWAY_STORAGE_AND_IOS_BUILD.md # Deploy/storage/iOS notes
├── unilingo_frontend/
│   ├── App.tsx
│   ├── app.json
│   ├── package.json
│   ├── src/
│   │   ├── api/                         # Axios clients và API wrappers
│   │   ├── components/common/           # Shared UI components
│   │   ├── data/                        # Mock speaking fallback data
│   │   ├── hooks/                       # Audio recorder, timers, auth hooks
│   │   ├── navigation/                  # Root navigator, tabs/stacks
│   │   ├── screens/                     # App screens theo domain
│   │   ├── services/                    # Notification service
│   │   ├── store/                       # Zustand stores
│   │   ├── theme/                       # Colors, typography, spacing
│   │   └── utils/                       # Helpers
│   └── assets/                          # Icons, mascot, images
├── unilingo-backend/
│   ├── app/
│   │   ├── api/v1/                      # FastAPI route modules
│   │   ├── admin_web/                   # Admin CMS static page
│   │   ├── ai/                          # AI scoring service helpers
│   │   ├── models/                      # SQLAlchemy models
│   │   ├── schemas/                     # Pydantic schemas
│   │   ├── services/                    # Storage/auth/notification services
│   │   ├── workers/                     # Celery scoring/notification workers
│   │   ├── config.py                    # Env config
│   │   └── main.py                      # FastAPI app entry
│   ├── .env.example
│   ├── docker-compose.yml
│   ├── requirements.txt
│   └── seed_*.sql / seed_*.py           # Bootstrap content
└── unilingo-demo/                       # HTML UI demo
```

## Luồng IELTS Speaking

### Part riêng lẻ

1. Người dùng chọn Part 1/2/3 và topic trong `PracticeScreen`.
2. App gọi `POST /api/v1/practice/start`.
3. App vào `VirtualRoomScreen`.
4. Examiner đọc intro/câu hỏi bằng `GET /api/v1/practice/tts`.
5. Sau khi examiner TTS thật sự kết thúc, app mới bật recording.
6. Hết thời gian hoặc người dùng bấm stop, app stop recorder và upload audio:
   `POST /api/v1/practice/{attempt_id}/upload-audio`.
7. App submit scoring:
   `POST /api/v1/practice/{attempt_id}/submit`.
8. App mở `ResultsScreen` và poll:
   `GET /api/v1/practice/{attempt_id}/result`.

### Full IELTS Speaking Test

Full test chạy Part 1 -> Part 2 -> Part 3 bằng `VirtualRoomScreen`, mỗi part là một practice attempt riêng. `fullTestAttemptIds` được truyền qua navigation để kết quả có thể tổng hợp các attempt liên quan.

### IELTS Speaking Mock Test Có Camera

Mock test chạy trong `MockSpeakingTestScreen`:

1. `MockTestIntroScreen` xin quyền microphone và camera.
2. Camera preview luôn giữ active trong lúc recording.
3. Examiner dùng backend TTS trước; chỉ fallback native speech khi backend TTS fail/timeout.
4. Backend audio được load với `shouldPlay: false`, chỉ play khi load xong để tránh trường hợp TTS backend và native speech phát chồng.
5. Recording chỉ start sau khi `speakAndWait()` resolve, nghĩa là examiner đã ngừng nói hoặc đã bị stop bởi safety timeout.
6. Mỗi answer được upload tới `POST /api/v1/practice/transcribe-audio` để lấy script review.
7. Nếu STT chưa cấu hình hoặc provider lỗi, UI hiển thị transcript unavailable thay vì đưa thông báo cấu hình vào script.

## Yêu Cầu Môi Trường

- Node.js 20+ khuyến nghị.
- npm 10+.
- Python 3.11+.
- Docker Desktop nếu chạy PostgreSQL/Redis/MinIO bằng Docker Compose.
- Expo Go hoặc iOS/Android simulator.
- API keys nếu muốn chạy đầy đủ AI:
  - `GROQ_API_KEY`
  - `AZURE_SPEECH_KEY`
  - `AZURE_SPEECH_REGION`

## Cài Đặt Backend

```bash
cd unilingo-backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Chỉnh `.env`, tối thiểu:

```env
DEBUG=true
DATABASE_URL=sqlite+aiosqlite:///./unilingo.db
JWT_SECRET_KEY=change-this
GROQ_API_KEY=...
AZURE_SPEECH_KEY=...
AZURE_SPEECH_REGION=eastus
```

Chạy API local:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Chạy bằng Docker Compose:

```bash
cd unilingo-backend
docker-compose up -d
```

Seed dữ liệu mẫu:

```bash
python run_init_db.py
python seed_extra_data.py
python seed_blogs.py
```

Admin web:

```text
http://localhost:8000/admin-web
```

OpenAPI:

```text
http://localhost:8000/docs
http://localhost:8000/redoc
```

## Cài Đặt Frontend

```bash
cd unilingo_frontend
npm install
npm start
```

Expo sẽ mở QR code. Dùng Expo Go hoặc simulator để chạy app.

Nếu backend chạy trên máy local và test bằng điện thoại thật, cần đảm bảo API base URL trỏ tới IP LAN của máy thay vì `localhost`. Kiểm tra file:

```text
unilingo_frontend/src/api/client.ts
```

Các script chính:

```bash
npm start          # Expo dev server
npm run ios       # Native iOS run
npm run android   # Native Android run
npm run web       # Expo web
npx tsc --noEmit  # TypeScript check
```

## Biến Môi Trường Quan Trọng

### AI và media

| Biến | Bắt buộc cho | Ghi chú |
|---|---|---|
| `GROQ_API_KEY` | STT, generate questions, LLM scoring | Nếu thiếu, mock test không có transcript thật |
| `GROQ_TRANSCRIPTION_MODEL` | STT | Mặc định `whisper-large-v3` |
| `GROQ_SCORING_MODEL` | LLM scoring | Mặc định `llama-3.3-70b-versatile` |
| `AZURE_SPEECH_KEY` | Examiner TTS, pronunciation | Nếu thiếu, `/practice/tts` trả `501` |
| `AZURE_SPEECH_REGION` | Azure Speech | Ví dụ `eastus` |
| `TTS_VOICE_NAME` | Examiner voice | Mặc định `en-US-AvaMultilingualNeural` |
| `TTS_VOICE_STYLE` | Examiner voice style | Mặc định `chat` |
| `TTS_PROSODY_RATE` | Examiner speed | Mặc định `-3%` |

### Storage

| Biến | Ghi chú |
|---|---|
| `AUDIO_STORAGE_BACKEND` | `local` hoặc `s3` |
| `LOCAL_UPLOAD_DIR` | Nơi lưu audio local |
| `S3_ENDPOINT_URL` | S3/R2/MinIO/Railway bucket endpoint |
| `S3_BUCKET_NAME` | Bucket audio |
| `S3_ADDRESSING_STYLE` | `auto`, `virtual`, hoặc `path` |

### Runtime

| Biến | Ghi chú |
|---|---|
| `SCORING_INLINE_ENABLED` | Chấm inline trong request submit |
| `SCORING_INLINE_TIMEOUT_SECONDS` | Timeout chờ scoring inline |
| `SCORING_CELERY_FALLBACK_ENABLED` | Fallback qua Celery khi inline không xong |
| `CELERY_BROKER_URL` | Redis broker |
| `CELERY_RESULT_BACKEND` | Redis result backend |

## Admin CMS

Admin CMS nằm trong:

```text
unilingo-backend/app/admin_web/index.html
```

Các panel:

- Dashboard: metrics tổng quan và system health.
- Notifications: gửi push/in-app notification, chọn audience.
- Blogs: tạo/sửa/xóa bài markdown, featured/published, notify users.
- Daily Forecasts: tạo/sửa/xóa forecast theo skill.
- IELTS Exercises: tạo/sửa/xóa topics và questions cho Part 1/2/3.
- Users: tìm user, block/unblock, tạo admin account.

System health gọi:

```http
GET /api/v1/admin/system-health
```

Endpoint này chỉ trả trạng thái cấu hình, model/voice/region và không trả API key.

## API Và Tài Liệu Liên Quan

Tài liệu chính:

- [Backend API Docs](docs/BACKEND_API_DOCS.md)
- [Project Documentation VI](docs/PROJECT_DOCUMENTATION_VI.md)
- [API Mapping](docs/API_MAPPING.md)
- [Backend Architecture](docs/BACKEND_ARCHITECTURE.md)
- [Frontend Architecture](docs/FRONTEND_ARCHITECTURE.md)
- [Railway Storage And iOS Build](docs/RAILWAY_STORAGE_AND_IOS_BUILD.md)

Endpoint nổi bật:

| Mục đích | Endpoint |
|---|---|
| Auth login | `POST /api/v1/auth/login` |
| List topics | `GET /api/v1/topics?ielts_part=part1` |
| Start practice | `POST /api/v1/practice/start` |
| Generate multi-question exam | `POST /api/v1/practice/generate-questions` |
| Examiner TTS | `GET /api/v1/practice/tts?text=...` |
| Upload audio | `POST /api/v1/practice/{attempt_id}/upload-audio` |
| Mock answer transcript | `POST /api/v1/practice/transcribe-audio` |
| Submit scoring | `POST /api/v1/practice/{attempt_id}/submit` |
| Result polling | `GET /api/v1/practice/{attempt_id}/result` |
| Admin health | `GET /api/v1/admin/system-health` |

## Troubleshooting

### Examiner đọc lặp hoặc recording chen ngang examiner

Kiểm tra các file:

- `unilingo_frontend/src/screens/practice/MockSpeakingTestScreen.tsx`
- `unilingo_frontend/src/screens/practice/VirtualRoomScreen.tsx`

Nguyên tắc hiện tại:

- Backend TTS được load với `shouldPlay: false`.
- Chỉ một nguồn examiner được phép phát tại một thời điểm.
- Nếu backend TTS load timeout, audio đến muộn sẽ bị unload và không tự phát.
- Safety timeout luôn stop audio/speech trước khi cho phép recording start.
- Recording chỉ start sau khi `speakAndWait()` hoàn tất.

### UI hiện transcript kiểu `[Mock transcript] ...`

Không nên xuất hiện nữa. Nếu transcript unavailable:

- Backend `/practice/transcribe-audio` trả `503` khi thiếu `GROQ_API_KEY`.
- Frontend hiển thị transcript unavailable thay vì coi lỗi cấu hình là lời nói.
- Vào Admin Dashboard -> System health để kiểm tra Speech to Text.
- Nếu `.env` đã có key nhưng backend vẫn báo thiếu, restart backend vì settings được cache.

### TTS trả 501 hoặc giọng native máy

- Kiểm tra `AZURE_SPEECH_KEY` và `AZURE_SPEECH_REGION`.
- Vào Admin Dashboard -> System health -> Examiner TTS.
- Restart backend sau khi đổi `.env`.
- Xóa cache `unilingo-backend/app/cache/tts` nếu đổi voice/style mà vẫn nghe file cũ.

### Điện thoại không gọi được backend local

- Không dùng `localhost` trên điện thoại thật.
- Dùng IP LAN của máy chạy backend, ví dụ `http://192.168.1.10:8000/api/v1`.
- Đảm bảo điện thoại và máy dev cùng mạng.

## Kiểm Thử Và Chất Lượng

Frontend:

```bash
cd unilingo_frontend
npx tsc --noEmit
```

Backend compile check:

```bash
cd unilingo-backend
python -m compileall app
```

Manual test nên chạy:

- Part 1 riêng lẻ: examiner nói xong mới record, hết 30s auto-stop không lỗi.
- Part 2 riêng lẻ: prep 60s xong mới record, auto-stop 120s không lỗi.
- Part 3 riêng lẻ: examiner nói xong mới record, auto-stop không lỗi.
- Full IELTS Speaking Test: chuyển Part 1 -> 2 -> 3 không record chồng TTS.
- IELTS Speaking Mock Test: camera vẫn active khi record, không có 2 giọng examiner, transcript không hiện raw config message.

## License

Dự án phục vụ học tập, nghiên cứu và portfolio.
