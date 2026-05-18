# Unilingo Mobile - Documentation Chi Tiết

Tài liệu này mô tả toàn bộ dự án Unilingo theo đúng source code hiện tại: mobile frontend React Native, backend FastAPI, database, API, phần seed/bootstrap, cách deploy production cho backend, admin web CMS và hướng cải thiện tiếp theo.

## 1. Tổng Quan Dự Án

Unilingo là ứng dụng luyện IELTS Speaking trên mobile. Người dùng chọn part/topic, vào phòng luyện nói, ghi âm câu trả lời, gửi backend xử lý AI scoring, nhận band score và feedback. App còn có vocabulary notebook, flashcards, leaderboard, blog học IELTS và notification.

Repo hiện chia thành:

```txt
unilingo_mobile/
├── unilingo_frontend/      # Mobile app React Native + Expo
├── unilingo-backend/       # FastAPI backend + Celery workers
├── unilingo-demo/          # Demo HTML/prototype
├── docs/                   # Documentation
└── implementation_plan.md  # Plan cũ
```

## 2. Frontend Mobile Dùng Công Nghệ Gì

Frontend nằm trong `unilingo_frontend/`.

### Công nghệ chính

| Nhóm | Công nghệ | Vai trò |
|---|---|---|
| Mobile framework | React Native 0.81 + Expo SDK 54 | Xây UI native iOS/Android, chạy bằng Expo |
| Ngôn ngữ | TypeScript | Type-safe cho component, API response, store |
| Navigation | React Navigation v7 | Bottom tabs + nested native stacks |
| State | Zustand | Lưu auth token, user profile, theme |
| Network | Axios | Gọi REST API backend, tự gắn JWT, refresh token |
| Data cache | TanStack Query | Đã setup provider, chưa dùng rộng rãi |
| Storage bảo mật | expo-secure-store | Lưu access/refresh token |
| Notification | expo-notifications | Local reminder + lấy device push token |
| UI/visual | expo-linear-gradient, Ionicons, react-native-svg | Card gradient, icon, progress ring |
| Animation | React Native Animated | Fade/slide home dashboard, scale pressable blog cards |
| Audio | expo-av | Ghi âm trong practice flow |

### Cấu trúc frontend

```txt
unilingo_frontend/
├── App.tsx
├── index.ts
├── app.json
├── package.json
└── src/
    ├── api/
    │   ├── client.ts
    │   ├── auth.ts
    │   ├── users.ts
    │   ├── topics.ts
    │   ├── practice.ts
    │   ├── vocabulary.ts
    │   ├── flashcards.ts
    │   ├── blog.ts
    │   └── notifications.ts
    ├── components/common/
    ├── navigation/RootNavigator.tsx
    ├── screens/
    │   ├── auth/
    │   ├── home/
    │   ├── practice/
    │   ├── vocabulary/
    │   ├── flashcards/
    │   ├── leaderboard/
    │   └── profile/
    ├── services/NotificationService.ts
    ├── store/
    └── theme/
```

### Frontend chạy như thế nào

1. `index.ts` gọi Expo `registerRootComponent(App)`.
2. `App.tsx` load font Plus Jakarta Sans, hydrate auth token từ `SecureStore`, setup `QueryClientProvider`, `NavigationContainer`.
3. Nếu user chưa đăng nhập, `RootNavigator` hiển thị auth stack.
4. Nếu user đã đăng nhập, app hiển thị main bottom tabs:
   - Home
   - Practice
   - Vocab
   - Rank
   - Profile
5. `src/api/client.ts` tạo Axios instance với `BASE_URL`.
6. Request interceptor tự gắn `Authorization: Bearer <accessToken>`.
7. Response interceptor nếu gặp `401` sẽ gọi `/auth/refresh`, lưu token mới và retry request.

### Các màn hình quan trọng

| Screen | File | Chức năng |
|---|---|---|
| Home | `src/screens/home/HomeScreen.tsx` | Dashboard, daily goal, recent activity, blog forecast/tips/news, unread notification count |
| Blog Detail | `src/screens/home/BlogDetailScreen.tsx` | Render markdown blog post |
| Practice | `src/screens/practice/PracticeScreen.tsx` | Chọn IELTS part, lấy topic từ backend CMS |
| Virtual Room | `src/screens/practice/VirtualRoomScreen.tsx` | Phòng thi giả lập, TTS câu hỏi, ghi âm nhiều câu |
| Recording | `src/screens/practice/RecordingScreen.tsx` | Ghi âm một câu, upload audio |
| Results | `src/screens/practice/ResultsScreen.tsx` | Poll kết quả AI scoring |
| Settings | `src/screens/profile/SettingsScreen.tsx` | Profile, password, theme, custom notification settings |

### Notification trong app hiện tại

Đã có luồng mới:

- `notificationsAPI.getSettings()` đọc preference từ backend.
- User chỉnh trong Settings:
  - Daily practice reminder
  - Reminder time
  - Vocabulary review
  - Streak reminder
  - Leaderboard update
  - Event push từ admin
  - Blog notification
  - Forecast / Tips / News
- `syncNotificationPreferences()` hủy local schedule cũ rồi tạo lại lịch nhắc theo preference.
- `registerDeviceForPush()` lấy native device push token và gửi về backend `/notifications/devices/register`.
- Home hiển thị badge gồm unread in-app notifications + số vocab cần review.

## 3. Backend Dùng Công Nghệ Gì

Backend nằm trong `unilingo-backend/`.

### Công nghệ chính

| Nhóm | Công nghệ | Vai trò |
|---|---|---|
| API framework | FastAPI | REST API async, Swagger/OpenAPI |
| Ngôn ngữ | Python 3.11 | Backend service |
| ORM | SQLAlchemy 2 async | Mapping model Python sang PostgreSQL |
| DB driver | asyncpg | Kết nối PostgreSQL async |
| Database | PostgreSQL | Lưu users, topics, attempts, blog, notification |
| Auth | JWT + python-jose + bcrypt | Access/refresh token, password hashing |
| Social auth | Firebase Admin SDK | Verify Firebase token cho Google/Apple login |
| Queue | Celery | Chấm bài AI và scheduled jobs |
| Broker/cache | Redis | Celery broker/result backend |
| Storage | Local upload hiện tại, MinIO/S3 được cấu hình | Audio recordings |
| AI | Groq, OpenAI, Azure Speech, Google Gemini | Sinh câu hỏi, speech, scoring |
| Container | Docker, Docker Compose | Local/dev deployment |

### Cấu trúc backend

```txt
unilingo-backend/
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── seed_blogs.py
└── app/
    ├── main.py
    ├── config.py
    ├── database.py
    ├── seed.py
    ├── admin_web/index.html
    ├── migrations/20260518_notifications_and_admin.sql
    ├── api/
    │   ├── deps.py
    │   ├── openapi_docs.py
    │   └── v1/
    ├── models/
    ├── schemas/
    ├── services/
    ├── ai/
    └── workers/
```

### Backend code hoạt động như thế nào

1. `app/main.py` tạo FastAPI app.
2. Lifespan startup:
   - Nếu `DEBUG=true`, gọi `init_db()` để tạo bảng từ SQLAlchemy models.
   - Thử initialize Firebase Admin SDK từ `FIREBASE_SERVICE_ACCOUNT_PATH`.
3. `app/api/v1/router.py` include toàn bộ route dưới prefix `/api/v1`.
4. Mỗi request private đi qua dependency:
   - `get_current_user()` đọc JWT, decode, query user, kiểm tra `is_active`.
   - `get_admin_user()` kiểm tra thêm `is_admin=true`.
5. `app/database.py` cung cấp `AsyncSession`; sau request thành công tự `commit`, lỗi thì `rollback`.
6. Các route nhận Pydantic schema, thao tác SQLAlchemy model, trả Pydantic response.
7. Các tác vụ nặng như AI scoring được đẩy sang Celery worker.

## 4. Database Structure

Backend dùng SQLAlchemy models. Production DB dự kiến là PostgreSQL.

### Users và notification settings

| Table | Mục đích | Field chính |
|---|---|---|
| `users` | Tài khoản user/admin | email, username, full_name, hashed_password, is_admin, total_xp, streak |
| `user_devices` | Device token để push | user_id, fcm_token, device_type, last_active_at |
| `notification_settings` | Preference notification từng user | daily_reminder, reminder_time, event_notifications, blog_notifications, forecast/tips/news |
| `daily_streaks` | Hoạt động mỗi ngày | streak_date, xp_earned, tests_completed, study_minutes |

### IELTS content

| Table | Mục đích | Field chính |
|---|---|---|
| `topics` | Topic IELTS theo part | title, title_vi, category, ielts_part, difficulty, is_active |
| `questions` | Câu hỏi thuộc topic | topic_id, question_text, cue_card_content, follow_up_questions |

### Practice và AI scoring

| Table | Mục đích | Field chính |
|---|---|---|
| `test_attempts` | Một lần luyện tập | user_id, topic_id, ielts_part, status, overall_band, xp_earned |
| `attempt_parts` | Audio/câu trả lời trong attempt | attempt_id, question_id, audio_url, transcript |
| `ai_scoring_results` | Kết quả AI | fluency_band, lexical_band, grammar_band, pronunciation_band, feedback, weaknesses |

### Vocabulary và flashcards

| Table | Mục đích |
|---|---|
| `vocabulary_notes` | Từ user lưu, definition, examples, mastery level |
| `vocabulary_tags` | Tags cho từ vựng |
| `flashcard_decks` | Bộ flashcard |
| `flashcards` | Card trong deck |
| `flashcard_reviews` | Lịch sử review, phục vụ SRS |

### Blog và notification campaign

| Table | Mục đích | Field chính |
|---|---|---|
| `blog_posts` | Blog hiện ở Home | title, slug, content, category, is_published, is_featured |
| `notification_campaigns` | Lần gửi notification bởi admin | title, body, type, category, audience, sent_count |
| `user_notifications` | Inbox notification của từng user | user_id, campaign_id, title, body, is_read |

### Quan hệ chính

```mermaid
erDiagram
    users ||--o{ user_devices : has
    users ||--|| notification_settings : has
    users ||--o{ daily_streaks : has
    users ||--o{ test_attempts : practices
    topics ||--o{ questions : contains
    topics ||--o{ test_attempts : selected_for
    test_attempts ||--o{ attempt_parts : contains
    attempt_parts ||--|| ai_scoring_results : scored_by
    users ||--o{ vocabulary_notes : saves
    users ||--o{ flashcard_decks : owns
    notification_campaigns ||--o{ user_notifications : creates
    users ||--o{ user_notifications : receives
```

## 5. API Tổng Quan

Base URL local:

```txt
http://localhost:8000/api/v1
```

### Auth

| Method | Endpoint | Chức năng |
|---|---|---|
| POST | `/auth/register-send-otp` | Gửi OTP đăng ký |
| POST | `/auth/register` | Đăng ký |
| POST | `/auth/login` | Đăng nhập |
| POST | `/auth/social-login` | Firebase social login |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Logout |
| POST | `/auth/forgot-password` | Quên mật khẩu |

### User

| Method | Endpoint | Chức năng |
|---|---|---|
| GET | `/users/me` | Profile user |
| PATCH | `/users/me` | Update profile |
| GET | `/users/me/dashboard` | Dashboard |
| POST | `/users/me/streak-goal` | Set streak goal |
| POST | `/users/me/change-password` | Đổi mật khẩu |

### Topics và practice

| Method | Endpoint | Chức năng |
|---|---|---|
| GET | `/topics` | List active topics |
| GET | `/topics/recommended` | Recommended topics, hiện vẫn random |
| GET | `/topics/{topic_id}` | Topic detail |
| POST | `/practice/start` | Bắt đầu luyện tập |
| GET | `/practice/generate-questions` | Generate nhiều câu hỏi |
| POST | `/practice/{attempt_id}/upload-audio` | Upload audio |
| POST | `/practice/{attempt_id}/submit` | Submit để chấm AI |
| GET | `/practice/{attempt_id}/result` | Lấy kết quả |
| GET | `/practice/history` | Lịch sử |

### Blog

| Method | Endpoint | Chức năng |
|---|---|---|
| GET | `/blog` | List published posts, filter category |
| GET | `/blog/featured` | Featured posts cho Home |
| GET | `/blog/{slug}` | Blog detail |
| GET | `/blog/admin/all` | Admin list tất cả post |
| POST | `/blog/admin/create` | Admin tạo post |
| PUT | `/blog/admin/{post_id}` | Admin cập nhật post |
| DELETE | `/blog/admin/{post_id}` | Admin xóa post |

Blog categories chính cho CMS: `forecast`, `tips`, `news`. Backend vẫn cho thêm `grammar`, `vocabulary`, `speaking` để giữ tương thích nội dung cũ.

### Notifications

| Method | Endpoint | Chức năng |
|---|---|---|
| GET | `/notifications/settings` | Lấy preference |
| PATCH | `/notifications/settings` | Update preference |
| POST | `/notifications/devices/register` | Đăng ký device push token |
| GET | `/notifications` | In-app notification inbox |
| GET | `/notifications/unread-count` | Count unread |
| PATCH | `/notifications/{notification_id}/read` | Mark read |
| PATCH | `/notifications/read-all` | Mark all read |
| POST | `/notifications/admin/send` | Admin gửi notification ngay |
| GET | `/notifications/admin/campaigns` | Admin xem lịch sử campaign |

### Admin CMS

Admin web một trang được serve bởi backend:

```txt
http://localhost:8000/admin-web
```

Admin có thể đăng nhập bằng email/password hoặc paste JWT của tài khoản có `is_admin=true`.

CMS hiện có các module:

- Dashboard metrics.
- Users: tìm user, block/unblock, chọn user để gửi notification.
- Notifications: gửi ngay cho all/active/selected users, tôn trọng preference của user, xem campaign history.
- Blogs: tạo/sửa/xóa blog, publish/draft, featured on Home, category `forecast`, `tips`, `news`, gửi notification sau khi đăng.
- IELTS Exercises: tạo/sửa/xóa topic và question cho Part 1/2/3; đây là đường thay thế seed khi vận hành production.

| Method | Endpoint | Chức năng |
|---|---|---|
| GET | `/admin/dashboard` | Metrics tổng quan |
| GET | `/admin/users` | List users |
| PATCH | `/admin/users/{user_id}/status` | Block/unblock user |
| GET | `/admin/topics` | List topics gồm inactive |
| POST | `/admin/topics` | Tạo topic |
| PUT | `/admin/topics/{topic_id}` | Update topic |
| DELETE | `/admin/topics/{topic_id}` | Delete topic |
| GET | `/admin/questions` | List questions |
| POST | `/admin/questions` | Tạo question |
| PUT | `/admin/questions/{question_id}` | Update question |
| DELETE | `/admin/questions/{question_id}` | Delete question |

## 6. Seed/Bootstrap Và TODO Trong Dự Án

### Seed topic/question

File:

```txt
unilingo-backend/app/seed.py
```

Nội dung seed IELTS topics/questions ban đầu. Đây là bootstrap data, không nên là cách vận hành production lâu dài. Sau cải thiện, admin có thể thêm topic/question qua:

- Web: `/admin-web`
- API: `/api/v1/admin/topics`, `/api/v1/admin/questions`

### Seed blog

File:

```txt
unilingo-backend/seed_blogs.py
```

Dùng để tạo một số blog demo. Production nên đăng blog bằng admin web/API để có category `forecast`, `tips`, `news`, publish state và featured state.

### Mock/fallback trên frontend

Đã cải thiện:

- `PracticeScreen` không còn fallback topic mock khi API lỗi. Nếu backend không có topic, app hiển thị empty state và nhắc thêm content trong admin CMS.
- `VirtualRoomScreen` không tự sinh mock question khi start/generate lỗi; app chuyển sang error state và cho retry/back.
- `RecordingScreen` không còn nhánh submit/upload đặc biệt cho `mock-id`.
- `ResultsScreen` không còn mock scoring result; nếu backend chưa có kết quả thì hiển thị pending/empty state rõ ràng.
- `PracticeHistoryScreen` không còn mock history khi API lỗi; có error state và retry.
- `FlashcardDecksScreen` không còn mock decks khi API lỗi; có error state và retry.
- `FlashcardStudyScreen` không còn mock cards khi study session lỗi; có error state và retry.

Kết quả rà soát hiện tại: trong các thư mục `src/screens` và `src/api` không còn pattern `MOCK_`, `mock-id`, `mock-1` cho các luồng chính.

### TODO backend quan trọng

| File | TODO |
|---|---|
| `app/ai/scoring_service.py` | Download audio từ S3/MinIO và audio config thật |
| `app/api/v1/users.py` | Avatar upload hiện vẫn placeholder |
| `app/api/v1/leaderboard.py` | Nên thay query trực tiếp bằng Redis cache/ZSET |
| `app/api/v1/topics.py` | Recommended topics hiện random, chưa dựa weakness/history |
| `app/api/v1/practice.py` | stats weekly/improvement vẫn TODO |
| `app/workers/notification_tasks.py` | Đã có logic reminders/cache; cần bổ sung monitoring, retry policy và dashboard trạng thái job |

## 7. Cải Thiện Đã Thực Hiện Theo Yêu Cầu

### Admin web một trang

Đã thêm:

```txt
unilingo-backend/app/admin_web/index.html
```

Chức năng:

- Xem dashboard metrics.
- Đăng nhập admin bằng email/password hoặc paste JWT.
- Quản lý user: search, chọn user, block/unblock.
- Gửi notification campaign ngay cho all/active/selected users, có chọn type/category/route và respect preferences.
- Xem campaign history.
- Tạo/sửa/xóa blog, publish/draft, featured on Home, category `forecast`, `tips`, `news`.
- Gửi notification sau khi đăng/sửa blog.
- Tạo/sửa/xóa IELTS topic theo part1/part2/part3.
- Tạo/sửa/xóa question theo topic.

Backend serve admin web tại:

```txt
/admin-web
```

### Blog categories

Backend validate category:

```txt
forecast, tips, news, grammar, vocabulary, speaking
```

Home mobile có category chips:

```txt
All | Forecast | Tips | News
```

### Topic CMS thay seed

Đã thêm:

- `GET /admin/topics`
- `GET /admin/questions`
- Form admin web để tạo topic/question.
- `PracticeScreen` lấy topic từ backend, không che lỗi bằng mock topic.

### Notification cải thiện

Đã thêm database:

- `notification_campaigns`
- `user_notifications`
- mở rộng `notification_settings`

Đã thêm API:

- user inbox
- unread count
- mark read/all read
- admin send notification now
- admin campaign history

Preference mới:

- event_notifications
- blog_notifications
- forecast_notifications
- tips_notifications
- news_notifications

Backend admin send sẽ:

1. Lọc user theo audience.
2. Tôn trọng user preference nếu `respect_user_preferences=true`.
3. Tạo in-app notification cho từng user.
4. Lấy device token từ `user_devices`.
5. Gửi Firebase push nếu Firebase Admin đã được cấu hình.
6. Nếu Firebase chưa cấu hình, vẫn lưu inbox notification và trả `status=stored`.

Worker notification đã có logic thực thi:

- `send_daily_vocabulary_reminders`: tìm user có vocabulary due và gửi nhắc review.
- `send_streak_alerts`: tìm user có streak nhưng chưa học hôm nay và gửi cảnh báo.
- `update_leaderboard_cache`: tính lại cache all-time leaderboard vào `leaderboard_cache`.

Mobile đã có màn hình inbox notification:

- Home bell mở `NotificationsScreen`.
- User có thể xem all/unread.
- Tap notification sẽ mark read và deep-link tới blog/practice/vocabulary nếu `data.route` phù hợp.
- Mark all read từ icon check.

### UI sinh động hơn

Đã thêm:

- Home fade/slide animation khi vào dashboard.
- Blog cards scale nhẹ khi press.
- Blog filter chips.
- Settings notification controls dùng Switch và chips.

## 8. Migration Cần Chạy Cho Database Đã Tồn Tại

Vì repo có dependency Alembic nhưng chưa có folder Alembic migration thực tế, thay đổi DB mới được cung cấp bằng SQL thủ công:

```txt
unilingo-backend/app/migrations/20260518_notifications_and_admin.sql
```

Chạy trên production/staging:

```bash
psql "$DATABASE_URL" -f app/migrations/20260518_notifications_and_admin.sql
```

Nếu dùng Docker Compose local:

```bash
docker-compose exec db psql -U unilingo -d unilingo_db -f /path/in/container/20260518_notifications_and_admin.sql
```

Khuyến nghị tiếp theo: scaffold Alembic chuẩn để mọi migration versioned và rollback được.

## 9. Deploy Backend Lên Production

### Chuẩn bị môi trường

Các service cần có:

- PostgreSQL managed hoặc VPS PostgreSQL.
- Redis managed hoặc Redis container.
- Object storage S3/MinIO.
- Firebase service account JSON nếu dùng push/social login.
- Domain + HTTPS reverse proxy.

### Biến môi trường production

Tối thiểu:

```env
APP_NAME=Unilingo
APP_VERSION=1.0.0
DEBUG=false
JWT_SECRET_KEY=long-random-secret
SECRET_KEY=long-random-secret
DATABASE_URL=postgresql+asyncpg://user:password@host:5432/unilingo_db
REDIS_URL=redis://redis-host:6379/0
CELERY_BROKER_URL=redis://redis-host:6379/1
CELERY_RESULT_BACKEND=redis://redis-host:6379/2
FIREBASE_SERVICE_ACCOUNT_PATH=/secrets/firebase-service-account.json
S3_ENDPOINT_URL=https://s3-or-minio.example.com
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
S3_BUCKET_NAME=unilingo-audio
OPENAI_API_KEY=...
GOOGLE_GEMINI_API_KEY=...
AZURE_SPEECH_KEY=...
AZURE_SPEECH_REGION=eastus
GROQ_API_KEY=...
```

### Build image

```bash
cd unilingo-backend
docker build -t unilingo-backend:prod .
```

### Run API production

Dockerfile hiện dùng:

```txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Production nên bỏ `--reload` và dùng nhiều worker:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2
```

Hoặc dùng Gunicorn:

```bash
gunicorn app.main:app \
  -k uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  --workers 2 \
  --timeout 120
```

### Run Celery worker và beat

```bash
celery -A app.workers.celery_app worker --loglevel=info
celery -A app.workers.celery_app beat --loglevel=info
```

### Deploy flow đề xuất

1. Build image.
2. Push image lên registry.
3. Backup database.
4. Chạy SQL migration.
5. Deploy API container.
6. Deploy Celery worker.
7. Deploy Celery beat.
8. Check:

```bash
curl https://api.example.com/health
```

9. Mở:

```txt
https://api.example.com/docs
https://api.example.com/admin-web
```

### Reverse proxy Nginx mẫu

```nginx
server {
  server_name api.example.com;

  location / {
    proxy_pass http://127.0.0.1:8000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

### Production hardening cần làm

- Không để `allow_origins=["*"]`; giới hạn domain mobile/admin.
- Không commit `.env` thật.
- Bỏ `--reload`.
- Thêm Alembic migrations.
- Lưu audio lên S3/MinIO thay vì local filesystem.
- Thêm rate limit cho auth/OTP.
- Thêm logging structured và monitoring.
- Tách admin web ra domain riêng nếu cần bảo mật hơn.

## 10. Hướng Đi Cải Thiện Tiếp Theo

### Ưu tiên 1 - Production readiness

- Tạo Alembic chuẩn:
  - `alembic init alembic`
  - generate migration từ models
  - đưa migration notification mới vào Alembic
- Đổi Dockerfile CMD production không `--reload`.
- Thêm config CORS theo env.
- Upload audio thật lên S3/MinIO.
- Tạo CI chạy `tsc`, `python -m compileall`, backend tests.

### Ưu tiên 2 - Admin CMS nâng cao tiếp

- Rich markdown preview cho blog.
- Bulk import topics từ CSV/XLSX.
- Lịch sử audit: admin nào sửa gì, lúc nào.
- Role/permission chi tiết nếu có nhiều loại admin.
- Media upload cho blog cover image.

### Ưu tiên 3 - Notification thông minh

- Thêm scheduled campaign từ admin.
- Thêm analytics: sent/open/click/read rate theo campaign.
- Mở rộng deep link handler để bấm push mở đúng blog/topic/exercise cụ thể từ cold start.
- Phân biệt Expo push token và native FCM token rõ ràng nếu build production bằng EAS/Firebase.
- Tạo template notification reusable cho event, blog, streak, vocabulary.

### Ưu tiên 4 - AI và learning personalization

- Recommended topic dựa vào:
  - topic chưa học
  - band thấp theo skill
  - target band
  - lịch sử làm bài
- Scoring result giải thích rõ rubric IELTS hơn.
- Tự sinh practice plan 7 ngày/14 ngày/30 ngày.
- Tạo vocabulary suggestions tự động từ transcript và lưu vào notebook.

### Ưu tiên 5 - Frontend UX

- Dùng React Query rộng hơn cho caching/polling.
- Skeleton loading thay ActivityIndicator đơn giản.
- Haptic feedback cho chọn part/topic/save settings.
- Interactive charts cho band trend và skill radar.
- Animation chuyển trạng thái mượt hơn trong Practice/Results.

## 11. Quick Start Sau Khi Update

Backend:

```bash
cd unilingo-backend
cp .env.example .env
docker-compose up -d
docker-compose exec api python -m app.seed
```

Nếu DB đã tồn tại, chạy migration SQL notification trước khi dùng API mới.

Frontend:

```bash
cd unilingo_frontend
npm install
npm start
```

Admin web:

```txt
http://localhost:8000/admin-web
```

Yêu cầu tài khoản admin:

```sql
UPDATE users SET is_admin = true WHERE email = 'admin@example.com';
```
