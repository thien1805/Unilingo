# Unilingo Backend API Documentation

Tài liệu này mô tả chi tiết API của `unilingo-backend` dựa trên source code FastAPI hiện tại. Backend phục vụ app luyện IELTS Speaking, gồm xác thực, quản lý hồ sơ, chủ đề câu hỏi, practice flow, AI scoring, vocabulary, flashcards, leaderboard, notification, blog và admin CMS.

## 1. Tổng Quan

### Base URL

Local backend:

```txt
http://localhost:8000
```

API version prefix:

```txt
/api/v1
```

Ví dụ endpoint đầy đủ:

```txt
POST http://localhost:8000/api/v1/auth/login
```

### Công Nghệ Chính

- Framework: FastAPI async.
- Database: PostgreSQL, SQLAlchemy async.
- Auth: JWT Bearer token.
- Background job: Celery qua Redis.
- AI services: Groq để sinh câu hỏi, Azure Speech cho TTS/pronunciation, Gemini/OpenAI trong scoring pipeline.
- Push notification: FCM token, Firebase Admin SDK.

### Tài Liệu Swagger

Khi `DEBUG=true`, FastAPI mở tài liệu tự động:

```txt
GET /docs
GET /redoc
```

### Health Check

```http
GET /health
```

Response:

```json
{
  "status": "healthy",
  "app": "Unilingo",
  "version": "1.0.0"
}
```

## 2. Quy Ước Chung

### Authentication

Các API private yêu cầu header:

```http
Authorization: Bearer <access_token>
```

`access_token` lấy từ:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/social-login`
- `POST /api/v1/auth/refresh`

Backend decode JWT và kiểm tra:

- Token type phải là `access`.
- `sub` phải là UUID user hợp lệ.
- User tồn tại và `is_active=true`.

Admin API yêu cầu thêm `current_user.is_admin=true`.

### Response Format

Phần lớn route trả trực tiếp Pydantic model hoặc object JSON. Exception handler hiện trả lỗi theo dạng:

```json
{
  "detail": "Error message",
  "status_code": 400
}
```

Validation error `422` được rút gọn thành lỗi dễ đọc:

```json
{
  "detail": "email: value is not a valid email address",
  "status_code": 422
}
```

### Kiểu Dữ Liệu Thường Gặp

- UUID: string dạng `550e8400-e29b-41d4-a716-446655440000`.
- Datetime/date: ISO string.
- IELTS part: `part1`, `part2`, `part3`.
- Difficulty: `easy`, `medium`, `hard`.
- Mastery level: `new`, `learning`, `reviewing`, `mastered`.
- Leaderboard period: `weekly`, `monthly`, `all_time`.

### Pagination

Các endpoint dạng list thường dùng:

```txt
page=1
per_page=20
```

Response thường có:

```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "per_page": 20
}
```

## 3. Authentication API

Prefix:

```txt
/api/v1/auth
```

### 3.1 Gửi OTP Đăng Ký

```http
POST /api/v1/auth/register-send-otp
```

Auth: Không cần.

Body:

```json
{
  "email": "student@example.com"
}
```

Xử lý:

- Kiểm tra email đã tồn tại chưa.
- Nếu chưa tồn tại, gọi OTP service với prefix `register`.
- Gửi OTP đến email.

Response `200`:

```json
{
  "message": "OTP sent to your email."
}
```

Lỗi chính:

- `400`: Email đã được đăng ký.

### 3.2 Đăng Ký Tài Khoản

```http
POST /api/v1/auth/register
```

Auth: Không cần.

Body:

```json
{
  "email": "student@example.com",
  "password": "password123",
  "full_name": "Nguyen Van A",
  "username": "nguyenvana",
  "otp": "123456"
}
```

Validate:

- `email`: email hợp lệ.
- `password`: 8 đến 128 ký tự.
- `full_name`: 2 đến 255 ký tự.
- `username`: optional, 3 đến 50 ký tự, chỉ chữ/số/underscore.
- `otp`: đúng 6 ký tự.

Xử lý:

- Verify OTP với prefix `register`.
- Tạo user mới.
- Hash password.
- Trả access token và refresh token.

Response `201`:

```json
{
  "access_token": "jwt-access-token",
  "refresh_token": "jwt-refresh-token",
  "token_type": "bearer"
}
```

Lỗi chính:

- `400`: OTP sai/hết hạn hoặc email trùng.
- `422`: Body không hợp lệ.

### 3.3 Đăng Nhập Email/Password

```http
POST /api/v1/auth/login
```

Auth: Không cần.

Body:

```json
{
  "email": "student@example.com",
  "password": "password123"
}
```

Xử lý:

- Tìm user theo email.
- Verify password bằng bcrypt.
- Tạo cặp JWT mới.

Response `200`:

```json
{
  "access_token": "jwt-access-token",
  "refresh_token": "jwt-refresh-token",
  "token_type": "bearer"
}
```

Lỗi chính:

- `401`: Sai email/password.

### 3.4 Đăng Nhập Social

```http
POST /api/v1/auth/social-login
```

Auth: Không cần.

Body:

```json
{
  "firebase_token": "firebase-id-token",
  "provider": "google"
}
```

Validate:

- `provider`: `google` hoặc `apple`.

Xử lý:

- Verify Firebase ID token.
- Lấy `uid`, `email`, `name`, `picture`.
- Nếu user chưa tồn tại thì tạo user social.
- Nếu đã tồn tại thì đăng nhập user đó.
- Trả JWT.

Response `200`: giống login.

Lỗi chính:

- `401`: Firebase token không hợp lệ.

### 3.5 Refresh Token

```http
POST /api/v1/auth/refresh
```

Auth: Không cần access token, nhưng cần refresh token trong body.

Body:

```json
{
  "refresh_token": "jwt-refresh-token"
}
```

Xử lý:

- Decode token.
- Kiểm tra `type=refresh`.
- Tạo access token và refresh token mới.

Response `200`:

```json
{
  "access_token": "new-access-token",
  "refresh_token": "new-refresh-token",
  "token_type": "bearer"
}
```

Lỗi chính:

- `401`: Sai token type, token hết hạn hoặc payload không hợp lệ.

### 3.6 Quên Mật Khẩu

```http
POST /api/v1/auth/forgot-password
```

Auth: Không cần.

Body:

```json
{
  "email": "student@example.com"
}
```

Xử lý:

- Nếu email tồn tại, gửi OTP với prefix `reset`.
- Luôn trả success để tránh dò email.

Response `200`:

```json
{
  "message": "If the email exists, an OTP has been sent."
}
```

### 3.7 Verify Reset OTP

```http
POST /api/v1/auth/verify-reset-otp
```

Auth: Không cần.

Body:

```json
{
  "email": "student@example.com",
  "otp": "123456"
}
```

Xử lý:

- Verify OTP reset nhưng chưa consume OTP.
- Dùng cho bước xác minh trước khi nhập mật khẩu mới.

Response `200`:

```json
{
  "message": "OTP verified successfully."
}
```

Lỗi chính:

- `400`: OTP sai/hết hạn.

### 3.8 Reset Password

```http
POST /api/v1/auth/reset-password
```

Auth: Không cần.

Body:

```json
{
  "email": "student@example.com",
  "otp": "123456",
  "new_password": "newpassword123"
}
```

Xử lý:

- Consume OTP reset.
- Tìm user theo email.
- Không cho đặt mật khẩu mới trùng mật khẩu hiện tại.
- Hash và lưu mật khẩu mới.

Response `200`:

```json
{
  "message": "Password has been reset successfully."
}
```

Lỗi chính:

- `400`: OTP sai/hết hạn hoặc mật khẩu mới trùng mật khẩu cũ.
- `404`: Không tìm thấy user.

### 3.9 Logout

```http
POST /api/v1/auth/logout
```

Auth: Không bắt buộc trong code hiện tại.

Xử lý:

- JWT logout đang xử lý phía client bằng cách xóa token.
- Backend chưa blacklist token trong Redis.

Response `200`:

```json
{
  "message": "Logged out successfully."
}
```

## 4. Users/Profile API

Prefix:

```txt
/api/v1/users
```

Tất cả endpoint trong nhóm này yêu cầu Bearer token.

### 4.1 Lấy Profile Hiện Tại

```http
GET /api/v1/users/me
```

Response `200`:

```json
{
  "id": "uuid",
  "email": "student@example.com",
  "username": "student01",
  "full_name": "Nguyen Van A",
  "avatar_url": null,
  "auth_provider": "email",
  "target_band_score": 7.0,
  "target_exam_date": "2026-08-01",
  "current_level": "intermediate",
  "total_xp": 120,
  "current_streak": 3,
  "longest_streak": 8,
  "goal_target": 30,
  "goal_start_date": "2026-05-17",
  "created_at": "2026-05-17T10:00:00"
}
```

### 4.2 Cập Nhật Profile

```http
PATCH /api/v1/users/me
```

Body, truyền field nào thì update field đó:

```json
{
  "full_name": "Nguyen Van B",
  "username": "nguyenvanb",
  "target_band_score": 7.5,
  "target_exam_date": "2026-09-01",
  "current_level": "upper_intermediate"
}
```

Validate:

- `full_name`: optional, 2 đến 255 ký tự.
- `username`: optional, 3 đến 50 ký tự, chữ/số/underscore.
- `target_band_score`: optional, 1.0 đến 9.0.
- `target_exam_date`: date ISO.

Response `200`: `UserProfileResponse`.

### 4.3 Upload Avatar

```http
PUT /api/v1/users/me/avatar
```

Content-Type:

```txt
multipart/form-data
```

Form data:

| Field | Type | Required |
|---|---|---|
| file | file | Yes |

Xử lý hiện tại:

- Chưa upload S3/MinIO thực sự.
- Backend set placeholder path `/avatars/{user_id}/{filename}`.

Response `200`:

```json
{
  "avatar_url": "/avatars/user-id/avatar.png"
}
```

### 4.4 Dashboard Cá Nhân

```http
GET /api/v1/users/me/dashboard
```

Xử lý:

- Lấy thống kê học hôm nay từ `DailyStreak`.
- Tính trend band score 7 ngày gần nhất.
- Tính trung bình 4 kỹ năng.
- Tính thống kê vocabulary.
- Tính tổng giờ luyện và tổng bài test đã hoàn thành.

Response `200`:

```json
{
  "user": {},
  "today_stats": {
    "tests_completed": 1,
    "xp_earned": 50,
    "words_learned": 0,
    "study_minutes": 5,
    "daily_goal_met": false
  },
  "weekly_band_trend": [
    {
      "date": "2026-05-17",
      "band_score": 6.5
    }
  ],
  "skill_breakdown": {
    "fluency": 6.0,
    "lexical": 6.5,
    "grammar": 6.0,
    "pronunciation": 7.0
  },
  "vocabulary_stats": {
    "total": 20,
    "mastered": 3,
    "learning": 10,
    "new": 7
  },
  "total_practice_hours": 2.5,
  "total_tests": 12
}
```

### 4.5 Streak Summary

```http
GET /api/v1/users/me/streaks
```

Response:

```json
{
  "current_streak": 3,
  "longest_streak": 8,
  "total_xp": 120
}
```

### 4.6 Streak History

```http
GET /api/v1/users/me/streak-history
```

Xử lý:

- Lấy lịch sử `DailyStreak` trong 365 ngày gần nhất.
- Dùng cho commit graph / heatmap học tập.

Response:

```json
{
  "history": [
    {
      "date": "2026-05-17",
      "xp": 50,
      "tests": 1
    }
  ],
  "current_streak": 3
}
```

### 4.7 Đặt Streak Goal

```http
POST /api/v1/users/me/streak-goal
```

Body:

```json
{
  "days": 30
}
```

Validate:

- `days`: 1 đến 365.

Xử lý:

- Set `goal_target`.
- Set `goal_start_date` là ngày hiện tại.
- Cộng bonus XP:
  - 7 ngày: 20 XP.
  - 14 ngày: 50 XP.
  - 30 ngày: 120 XP.
  - Khác: `days * 2`.

Response:

```json
{
  "message": "Goal set for 30 days! You earned 120 bonus XP.",
  "goal_target": 30,
  "total_xp": 240
}
```

### 4.8 Đổi Mật Khẩu

```http
POST /api/v1/users/me/change-password
```

Body:

```json
{
  "current_password": "oldpassword123",
  "new_password": "newpassword123"
}
```

Validate:

- `new_password`: 8 đến 128 ký tự.

Lỗi chính:

- `400`: Social login account không có password.
- `400`: Current password sai.

Response:

```json
{
  "message": "Password changed successfully"
}
```

## 5. Topics & Questions API

Prefix:

```txt
/api/v1/topics
```

Tất cả endpoint yêu cầu Bearer token.

### 5.1 Danh Sách Topics

```http
GET /api/v1/topics
```

Query params:

| Param | Type | Required | Notes |
|---|---|---:|---|
| ielts_part | string | No | `part1`, `part2`, `part3` |
| category | string | No | Lọc theo category |
| difficulty | string | No | `easy`, `medium`, `hard` |

Xử lý:

- Chỉ lấy topic `is_active=true`.
- Sort theo `order_index`.
- Mỗi topic được tính thêm `question_count`.

Response:

```json
{
  "items": [
    {
      "id": "uuid",
      "title": "Hometown",
      "title_vi": "Quê hương",
      "description": "Common IELTS Part 1 topic",
      "category": "daily_life",
      "ielts_part": "part1",
      "difficulty": "easy",
      "icon": "home",
      "is_active": true,
      "order_index": 1,
      "question_count": 12
    }
  ],
  "total": 1
}
```

### 5.2 Topics Đề Xuất

```http
GET /api/v1/topics/recommended
```

Xử lý hiện tại:

- Chưa có recommendation logic theo weakness.
- Random 6 active topics.

Response:

```json
[
  {
    "id": "uuid",
    "title": "Travel",
    "question_count": 0
  }
]
```

### 5.3 Chi Tiết Topic

```http
GET /api/v1/topics/{topic_id}
```

Response:

```json
{
  "topic": {},
  "questions": [
    {
      "id": "uuid",
      "question_text": "Where is your hometown?",
      "question_text_vi": "Quê bạn ở đâu?",
      "ielts_part": "part1",
      "cue_card_content": null,
      "follow_up_questions": null,
      "difficulty": "easy",
      "key_vocabulary": []
    }
  ]
}
```

Lỗi chính:

- `404`: Topic không tồn tại hoặc inactive.

### 5.4 Danh Sách Câu Hỏi Của Topic

```http
GET /api/v1/topics/{topic_id}/questions
```

Xử lý:

- Lấy active questions thuộc topic.
- Sort theo `order_index`.

Response:

```json
[
  {
    "id": "uuid",
    "question_text": "Do you like your hometown?",
    "ielts_part": "part1",
    "difficulty": "easy"
  }
]
```

## 6. Practice API

Prefix:

```txt
/api/v1/practice
```

Tất cả endpoint trong nhóm practice yêu cầu Bearer token, trừ code hiện tại của `/tts` không inject `get_current_user`.

### 6.1 Bắt Đầu Practice

```http
POST /api/v1/practice/start
```

Body:

```json
{
  "topic_id": "uuid-or-null",
  "ielts_part": "part1",
  "question_id": "uuid-or-null"
}
```

Validate:

- `ielts_part`: `part1`, `part2`, `part3`.
- `topic_id`: string, có thể là UUID, `mock-id`, hoặc null.
- `question_id`: optional UUID.

Xử lý:

- Nếu có `topic_id` hợp lệ, kiểm tra topic tồn tại.
- Nếu có `question_id`, lấy câu hỏi cụ thể.
- Nếu không có `question_id`, random active question theo IELTS part và topic.
- Nếu DB không có câu hỏi, backend có thể dùng Groq để sinh câu hỏi mới khi `GROQ_API_KEY` được cấu hình.
- Tạo `TestAttempt` với status `in_progress`.

Response `201`:

```json
{
  "attempt_id": "uuid",
  "topic_title": "Hometown",
  "ielts_part": "part1",
  "question": {
    "id": "uuid",
    "question_text": "Where is your hometown?",
    "question_text_vi": null,
    "ielts_part": "part1",
    "cue_card_content": null,
    "follow_up_questions": null,
    "sample_answer": null
  },
  "status": "in_progress"
}
```

Lỗi chính:

- `404`: Topic không tồn tại hoặc không có câu hỏi.

### 6.2 Sinh Nhiều Câu Hỏi

```http
POST /api/v1/practice/generate-questions
```

Query params:

| Param | Type | Required | Notes |
|---|---|---:|---|
| ielts_part | string | Yes | `part1`, `part2`, `part3` |
| count | int | No | Default `3`, min `1`, max `5` |
| topic_id | UUID | No | Nếu có thì sinh/lấy câu hỏi theo topic |

Xử lý:

- Lấy câu hỏi trong DB trước.
- Nếu chưa đủ số lượng và có `GROQ_API_KEY`, gọi Groq để sinh phần còn thiếu.
- Câu hỏi AI sinh ra được lưu vào DB.

Response:

```json
{
  "questions": [
    {
      "id": "uuid",
      "question_text": "What do you usually do on weekends?",
      "ielts_part": "part1",
      "cue_card_content": null,
      "difficulty": "medium"
    }
  ],
  "count": 1
}
```

### 6.3 Text To Speech

```http
GET /api/v1/practice/tts?text=Hello
```

Auth: Không yêu cầu trong code hiện tại.

Xử lý:

- Gọi Azure Neural TTS.
- Cache audio theo `region + voice + style + rate + output_format + text` trong `TTS_CACHE_DIR`.
- Voice mặc định: `en-US-AvaMultilingualNeural`.
- Style mặc định: `chat`; nếu Azure không hỗ trợ style đó, backend retry không dùng style.
- Output format mặc định: `audio-48khz-96kbitrate-mono-mp3`.

Response:

```txt
Content-Type: audio/mpeg
```

Lỗi chính:

- `501`: Chưa cấu hình `AZURE_SPEECH_KEY`.
- `500`: Azure TTS failed.

### 6.4 Upload Audio

```http
POST /api/v1/practice/{attempt_id}/upload-audio
```

Content-Type:

```txt
multipart/form-data
```

Path params:

| Param | Type |
|---|---|
| attempt_id | UUID |

Query params:

| Param | Type | Required | Notes |
|---|---|---:|---|
| part_number | int | No | Default `1`, min `1`, max `3` |
| question_id | UUID | No | Gắn audio với câu hỏi cụ thể |

Form data:

| Field | Type | Required |
|---|---|---:|
| file | file | Yes |

Xử lý:

- Kiểm tra attempt thuộc current user.
- Chỉ cho upload nếu attempt đang `in_progress`.
- Lưu file vào `app/uploads/{attempt_id}_part{part_number}.m4a`.
- Tạo `AttemptPart`.

Response:

```json
{
  "part_id": "uuid",
  "audio_url": "/path/to/app/uploads/attempt_part1.m4a",
  "duration_seconds": null
}
```

Lỗi chính:

- `404`: Attempt không tồn tại.
- `400`: Attempt không còn `in_progress`.

### 6.4.1 Transcribe Audio Cho Mock Test

```http
POST /api/v1/practice/transcribe-audio
```

Auth: Bearer token.

Content-Type:

```txt
multipart/form-data
```

Form data:

| Field | Type | Required |
|---|---|---:|
| file | file | Yes |

Xử lý:

- Lưu file tạm vào `LOCAL_UPLOAD_DIR/mock_test_transcripts`.
- Gọi Groq Whisper theo `GROQ_TRANSCRIPTION_MODEL`.
- Endpoint này dùng cho màn full mock test để hiện script từng câu, không thay thế scoring pipeline của practice attempt.

Response:

```json
{
  "transcript": "I usually study in the evening because..."
}
```

Lỗi chính:

- `503`: Chưa cấu hình `GROQ_API_KEY`; frontend phải xem transcript là unavailable, không hiển thị lỗi cấu hình như lời nói của thí sinh.
- `502`: Provider STT lỗi.

### 6.5 Submit Practice

```http
POST /api/v1/practice/{attempt_id}/submit
```

Xử lý:

- Kiểm tra attempt thuộc user.
- Kiểm tra đã upload ít nhất một audio.
- Set status `scoring`.
- Cộng XP ngay:
  - Part 1: 50 XP.
  - Part 2: 100 XP.
  - Part 3: 150 XP.
- Cập nhật `DailyStreak`.
- Enqueue Celery task `score_practice_attempt`.

Response:

```json
{
  "attempt_id": "uuid",
  "status": "scoring",
  "message": "You earned 50 XP! Your practice is being scored by AI."
}
```

Lỗi chính:

- `404`: Attempt không tồn tại.
- `400`: Chưa upload audio.

### 6.6 Lấy Kết Quả Scoring

```http
GET /api/v1/practice/{attempt_id}/result
```

Xử lý:

- Frontend nên poll endpoint này trong lúc `status=scoring`.
- Khi worker hoàn tất, `status=completed`, các band score và feedback sẽ có dữ liệu.

Response:

```json
{
  "attempt_id": "uuid",
  "status": "completed",
  "overall_band": 6.5,
  "fluency_score": 6.0,
  "lexical_score": 6.5,
  "grammar_score": 6.0,
  "pronunciation_score": 7.0,
  "duration_seconds": 120,
  "xp_earned": 50,
  "parts": [
    {
      "part_id": "uuid",
      "part_number": 1,
      "question_text": "Where is your hometown?",
      "transcript": "My hometown is...",
      "duration_seconds": 60,
      "scoring": {
        "fluency_band": 6.0,
        "lexical_band": 6.5,
        "grammar_band": 6.0,
        "pronunciation_band": 7.0,
        "overall_band": 6.5,
        "pronunciation_details": {},
        "feedback": {},
        "strengths": ["Clear answer"],
        "weaknesses": ["Limited complex grammar"],
        "suggested_improvements": ["Use more linking words"],
        "sample_better_answer": {},
        "grammar_errors": [],
        "vocabulary_suggestions": []
      }
    }
  ]
}
```

### 6.7 Practice History

```http
GET /api/v1/practice/history
```

Query params:

| Param | Type | Required | Notes |
|---|---|---:|---|
| page | int | No | Default `1` |
| per_page | int | No | Default `20`, max `50` |
| ielts_part | string | No | `part1`, `part2`, `part3` |

Response:

```json
{
  "items": [
    {
      "attempt_id": "uuid",
      "topic_title": "Hometown",
      "ielts_part": "part1",
      "overall_band": 6.5,
      "status": "completed",
      "duration_seconds": 120,
      "started_at": "2026-05-17T10:00:00",
      "completed_at": "2026-05-17T10:03:00"
    }
  ],
  "total": 1,
  "page": 1,
  "per_page": 20
}
```

### 6.8 Practice Stats

```http
GET /api/v1/practice/stats
```

Response:

```json
{
  "total_tests": 12,
  "total_hours": 2.5,
  "avg_band_score": 6.4,
  "best_band_score": 7.5,
  "part1_avg": 6.5,
  "part2_avg": 6.0,
  "part3_avg": 6.5,
  "tests_this_week": 0,
  "improvement_pct": 0.0
}
```

Ghi chú:

- `tests_this_week` và `improvement_pct` hiện đang TODO, luôn trả `0`/`0.0`.

## 7. Vocabulary API

Prefix:

```txt
/api/v1/vocabulary
```

Hầu hết endpoint yêu cầu Bearer token. Riêng dictionary lookup là public trong code hiện tại.

### 7.1 Danh Sách Vocabulary Notes

```http
GET /api/v1/vocabulary
```

Query params:

| Param | Type | Required | Notes |
|---|---|---:|---|
| page | int | No | Default `1` |
| per_page | int | No | Default `20`, max `100` |
| mastery_level | string | No | `new`, `learning`, `reviewing`, `mastered` |
| search | string | No | Search theo word |
| sort_by | string | No | `created_at`, `word`, `mastery_level` |
| order | string | No | `asc`, `desc` |

Response:

```json
{
  "items": [
    {
      "id": "uuid",
      "word": "coherent",
      "phonetic": "/koʊˈhɪrənt/",
      "audio_url": "https://audio-url",
      "definitions": [
        {
          "part_of_speech": "adjective",
          "definition": "Logical and consistent"
        }
      ],
      "examples": ["She gave a coherent answer."],
      "user_note": "Good IELTS word",
      "source_context": "Practice result",
      "mastery_level": "new",
      "review_count": 0,
      "next_review_at": null,
      "tags": ["ielts"],
      "created_at": "2026-05-17T10:00:00"
    }
  ],
  "total": 1,
  "page": 1,
  "per_page": 20
}
```

### 7.2 Thêm Vocabulary Note

```http
POST /api/v1/vocabulary
```

Body:

```json
{
  "word": "coherent",
  "phonetic": "/koʊˈhɪrənt/",
  "audio_url": "https://audio-url",
  "definitions": [
    {
      "part_of_speech": "adjective",
      "definition": "Logical and consistent"
    }
  ],
  "examples": ["She gave a coherent answer."],
  "user_note": "Use this in Part 3.",
  "source_context": "AI feedback",
  "source_attempt_id": "uuid",
  "tags": ["ielts", "writing"]
}
```

Xử lý:

- Word được lưu lowercase.
- Không cho lưu trùng word trong cùng user.
- Tags được lưu lowercase.
- Mastery mặc định nằm ở model, thường là `new`.

Response `201`: `VocabularyResponse`.

Lỗi chính:

- `409`: Word đã tồn tại trong vocabulary của user.

### 7.3 Các Từ Đến Hạn Ôn Tập

```http
GET /api/v1/vocabulary/review-due
```

Xử lý:

- Lấy tối đa 20 từ có `mastery_level` trong `new`, `learning`, `reviewing`.
- `next_review_at <= now` hoặc `next_review_at=null`.

Response:

```json
[
  {
    "id": "uuid",
    "word": "coherent",
    "mastery_level": "new"
  }
]
```

### 7.4 Cập Nhật Vocabulary Note

```http
PATCH /api/v1/vocabulary/{vocabulary_id}
```

Body:

```json
{
  "user_note": "Use for logical answers.",
  "examples": ["My answer was coherent and well structured."],
  "mastery_level": "learning",
  "tags": ["ielts", "speaking"]
}
```

Chỉ các field sau được update:

- `user_note`
- `examples`
- `mastery_level`
- `tags`

Response `200`: `VocabularyResponse`.

Lỗi chính:

- `404`: Vocabulary note không tồn tại hoặc không thuộc user.

### 7.5 Xóa Vocabulary Note

```http
DELETE /api/v1/vocabulary/{vocabulary_id}
```

Response:

```txt
204 No Content
```

### 7.6 Dictionary Lookup

```http
GET /api/v1/vocabulary/dictionary/lookup?word=coherent
```

Auth: Không yêu cầu.

Xử lý:

- Proxy sang `https://api.dictionaryapi.dev/api/v2/entries/en/{word}`.
- Lấy phonetic/audio đầu tiên có dữ liệu.
- Giới hạn mỗi part of speech tối đa 3 definitions.
- Mỗi definition lấy tối đa 5 synonyms và 5 antonyms.

Response:

```json
{
  "word": "coherent",
  "phonetic": "/koʊˈhɪrənt/",
  "audio_url": "https://audio-url",
  "meanings": [
    {
      "part_of_speech": "adjective",
      "definitions": [
        {
          "definition": "Logical and consistent.",
          "example": "A coherent argument.",
          "synonyms": ["logical"],
          "antonyms": ["incoherent"]
        }
      ]
    }
  ]
}
```

Lỗi chính:

- `404`: Không tìm thấy word.
- `504`: Dictionary API timeout.
- `502`: Dictionary API lỗi khác.

## 8. Flashcards API

Prefix:

```txt
/api/v1/flashcards
```

Tất cả endpoint yêu cầu Bearer token.

### 8.1 Danh Sách Decks

```http
GET /api/v1/flashcards/decks
```

Xử lý:

- Lấy deck của current user.
- Sort theo `updated_at desc`.

Response:

```json
{
  "items": [
    {
      "id": "uuid",
      "title": "IELTS Vocabulary",
      "description": "Auto-generated from vocabulary notes",
      "is_public": false,
      "card_count": 20,
      "created_at": "2026-05-17T10:00:00",
      "updated_at": "2026-05-17T10:00:00"
    }
  ],
  "total": 1
}
```

### 8.2 Tạo Deck

```http
POST /api/v1/flashcards/decks
```

Body:

```json
{
  "title": "IELTS Part 3 Ideas",
  "description": "Useful phrases and ideas",
  "is_public": false
}
```

Response `201`: `DeckResponse`.

### 8.3 Chi Tiết Deck

```http
GET /api/v1/flashcards/decks/{deck_id}
```

Response:

```json
{
  "deck": {},
  "cards": [
    {
      "id": "uuid",
      "front_content": "coherent",
      "back_content": "Logical and consistent",
      "audio_url": null,
      "extra_info": {
        "phonetic": "/koʊˈhɪrənt/"
      },
      "order_index": 0
    }
  ]
}
```

Lỗi chính:

- `404`: Deck không tồn tại hoặc không thuộc user.

### 8.4 Cập Nhật Deck

```http
PATCH /api/v1/flashcards/decks/{deck_id}
```

Body:

```json
{
  "title": "Updated title",
  "description": "Updated description",
  "is_public": true
}
```

Response `200`: `DeckResponse`.

### 8.5 Xóa Deck

```http
DELETE /api/v1/flashcards/decks/{deck_id}
```

Response:

```txt
204 No Content
```

### 8.6 Thêm Card Vào Deck

```http
POST /api/v1/flashcards/decks/{deck_id}/cards
```

Body:

```json
{
  "front_content": "coherent",
  "back_content": "Logical and consistent",
  "audio_url": "https://audio-url",
  "vocabulary_id": "uuid",
  "extra_info": {
    "phonetic": "/koʊˈhɪrənt/"
  }
}
```

Xử lý:

- Kiểm tra deck thuộc user.
- Tạo card.
- Tăng `deck.card_count`.

Response `201`: `CardResponse`.

### 8.7 Xóa Card

```http
DELETE /api/v1/flashcards/cards/{card_id}
```

Xử lý:

- Kiểm tra card thuộc deck của current user.
- Giảm `deck.card_count`, không nhỏ hơn 0.

Response:

```txt
204 No Content
```

### 8.8 Review Card

```http
POST /api/v1/flashcards/cards/{card_id}/review
```

Body:

```json
{
  "quality_rating": 5
}
```

Validate:

- `quality_rating`: từ 0 đến 5.

Ý nghĩa rating:

- `0`: không nhớ.
- `1`: sai.
- `2`: sai nhưng có nhớ lại.
- `3`: khó.
- `4`: đúng.
- `5`: dễ.

Xử lý:

- Áp dụng thuật toán SM-2.
- Nếu rating dưới 3 thì reset repetition.
- Nếu rating từ 3 trở lên thì tăng repetition và interval.
- Tạo `FlashcardReview`.

Response:

```json
{
  "flashcard_id": "uuid",
  "next_review_at": "2026-05-23T10:00:00Z",
  "interval_days": 6,
  "easiness_factor": 2.6,
  "repetition_number": 2
}
```

### 8.9 Study Session

```http
GET /api/v1/flashcards/decks/{deck_id}/study
```

Xử lý:

- Lấy deck thuộc current user.
- Lấy các card chưa review hoặc đã đến hạn `next_review_at <= now`.
- Trả tối đa 20 cards.

Response:

```json
{
  "deck": {},
  "cards_to_study": [],
  "total_due": 0
}
```

### 8.10 Auto Generate Deck

```http
POST /api/v1/flashcards/decks/auto-generate
```

Body:

```json
{
  "title": "Auto IELTS Words",
  "mastery_levels": ["new", "learning"],
  "max_cards": 50
}
```

Validate:

- `title`: required.
- `max_cards`: 1 đến 200.

Xử lý:

- Lấy vocabulary notes của current user theo `mastery_levels`.
- Tạo deck.
- Mỗi vocabulary note thành một card.
- `front_content` là word.
- `back_content` là 1-2 definitions đầu tiên.
- `extra_info.phonetic` lấy từ vocabulary note.

Response `201`: `DeckResponse`.

Lỗi chính:

- `400`: Không có vocabulary note phù hợp.

## 9. Leaderboard API

Prefix:

```txt
/api/v1/leaderboard
```

Tất cả endpoint yêu cầu Bearer token.

### 9.1 Bảng Xếp Hạng

```http
GET /api/v1/leaderboard
```

Query params:

| Param | Type | Required | Notes |
|---|---|---:|---|
| period | string | No | `weekly`, `monthly`, `all_time`, default `weekly` |
| limit | int | No | Default `50`, max `100` |

Xử lý hiện tại:

- `period` được nhận nhưng chưa lọc thời gian trong query.
- Rank theo `User.total_xp desc`.
- Tính thêm `total_tests` và `avg_band_score` từ completed attempts.
- Nếu current user không nằm trong top `limit`, backend vẫn tính `my_rank` riêng.

Response:

```json
{
  "period": "weekly",
  "entries": [
    {
      "rank": 1,
      "user_id": "uuid",
      "username": "student01",
      "full_name": "Student One",
      "avatar_url": null,
      "avg_band_score": 7.0,
      "total_tests": 12,
      "total_xp": 900
    }
  ],
  "my_rank": {
    "rank": 10,
    "user_id": "uuid",
    "username": "me",
    "full_name": "My Name",
    "avatar_url": null,
    "avg_band_score": 6.5,
    "total_tests": 5,
    "total_xp": 300
  }
}
```

### 9.2 Rank Của Tôi

```http
GET /api/v1/leaderboard/me
```

Query params:

| Param | Type | Required |
|---|---|---:|
| period | string | No |

Response:

```json
{
  "rank": 10,
  "total_xp": 300,
  "current_streak": 3
}
```

Ghi chú:

- `period` hiện chưa ảnh hưởng đến kết quả.

## 10. Notifications API

Prefix:

```txt
/api/v1/notifications
```

Tất cả endpoint yêu cầu Bearer token.

### 10.1 Lấy Notification Settings

```http
GET /api/v1/notifications/settings
```

Xử lý:

- Nếu user chưa có settings, tạo settings mặc định.

Response:

```json
{
  "daily_reminder": true,
  "reminder_time": "20:00:00",
  "new_words_reminder": true,
  "streak_reminder": true,
  "leaderboard_update": true
}
```

### 10.2 Cập Nhật Notification Settings

```http
PATCH /api/v1/notifications/settings
```

Body:

```json
{
  "daily_reminder": true,
  "reminder_time": "21:30:00",
  "new_words_reminder": false,
  "streak_reminder": true,
  "leaderboard_update": false
}
```

Response `200`: `NotificationSettingsResponse`.

### 10.3 Register Device

```http
POST /api/v1/notifications/devices/register
```

Body:

```json
{
  "fcm_token": "fcm-token",
  "device_type": "ios",
  "device_name": "iPhone 15"
}
```

Xử lý:

- Nếu token đã tồn tại, update owner/device info.
- Nếu token chưa tồn tại, tạo `UserDevice`.

Response `201`:

```json
{
  "message": "Device registered successfully"
}
```

Hoặc:

```json
{
  "message": "Device token updated"
}
```

### 10.4 Remove Device

```http
DELETE /api/v1/notifications/devices/{token}
```

Response:

```txt
204 No Content
```

Ghi chú:

- Nếu token không tồn tại, endpoint vẫn trả `204`.

## 11. Blog API

Prefix:

```txt
/api/v1/blog
```

Public read endpoints không yêu cầu auth. Admin endpoints yêu cầu Bearer token và `is_admin=true`.

### 11.1 Danh Sách Blog Đã Publish

```http
GET /api/v1/blog
```

Query params:

| Param | Type | Required | Notes |
|---|---|---:|---|
| page | int | No | Default `1` |
| per_page | int | No | Default `10`, max `50` |
| category | string | No | Lọc theo category |

Response:

```json
{
  "items": [
    {
      "id": "uuid",
      "title": "How to improve IELTS Speaking",
      "slug": "how-to-improve-ielts-speaking",
      "excerpt": "Short intro",
      "cover_image_url": null,
      "author_name": "Unilingo Team",
      "category": "tips",
      "tags": ["ielts", "speaking"],
      "read_time_minutes": 3,
      "is_featured": true,
      "view_count": 10,
      "published_at": "2026-05-17T10:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "per_page": 10
}
```

### 11.2 Featured Posts

```http
GET /api/v1/blog/featured
```

Query params:

| Param | Type | Required | Notes |
|---|---|---:|---|
| limit | int | No | Default `5`, max `10` |

Response:

```json
[
  {
    "id": "uuid",
    "title": "Featured post",
    "slug": "featured-post",
    "is_featured": true
  }
]
```

### 11.3 Chi Tiết Blog Theo Slug

```http
GET /api/v1/blog/{slug}
```

Xử lý:

- Chỉ lấy post `is_published=true`.
- Tăng `view_count` mỗi lần gọi.

Response:

```json
{
  "id": "uuid",
  "title": "How to improve IELTS Speaking",
  "slug": "how-to-improve-ielts-speaking",
  "excerpt": "Short intro",
  "content": "Full markdown/html content",
  "cover_image_url": null,
  "author_name": "Unilingo Team",
  "author_avatar": null,
  "category": "tips",
  "tags": ["ielts"],
  "read_time_minutes": 3,
  "is_published": true,
  "is_featured": false,
  "view_count": 11,
  "published_at": "2026-05-17T10:00:00Z",
  "created_at": "2026-05-17T09:00:00Z"
}
```

Lỗi chính:

- `404`: Post không tồn tại hoặc chưa publish.

### 11.4 Admin Tạo Blog Post

```http
POST /api/v1/blog/admin/create
```

Auth: Admin.

Body:

```json
{
  "title": "New IELTS Tips",
  "excerpt": "Quick tips",
  "content": "Full content",
  "cover_image_url": "https://image-url",
  "author_name": "Unilingo Team",
  "category": "tips",
  "tags": ["ielts", "speaking"],
  "read_time_minutes": 3,
  "is_published": true,
  "is_featured": false
}
```

Xử lý:

- Sinh slug từ title.
- Nếu slug trùng, thêm suffix random 6 ký tự.
- Nếu publish ngay, set `published_at=now`.

Response: `BlogPostResponse`.

Lỗi chính:

- `403`: Không phải admin.

### 11.5 Admin Cập Nhật Blog Post

```http
PUT /api/v1/blog/admin/{post_id}
```

Auth: Admin.

Body: tất cả field đều optional.

```json
{
  "title": "Updated title",
  "is_published": true,
  "is_featured": true
}
```

Xử lý:

- Update field được gửi.
- Nếu publish lần đầu, set `published_at=now`.

Response: `BlogPostResponse`.

### 11.6 Admin Xóa Blog Post

```http
DELETE /api/v1/blog/admin/{post_id}
```

Auth: Admin.

Response:

```json
{
  "detail": "Post deleted"
}
```

### 11.7 Admin List Tất Cả Posts

```http
GET /api/v1/blog/admin/all
```

Auth: Admin.

Query params:

| Param | Type | Required |
|---|---|---:|
| page | int | No |
| per_page | int | No |

Xử lý:

- Lấy cả draft và published.
- Sort theo `created_at desc`.

Response:

```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "per_page": 20
}
```

## 12. Admin API

Prefix:

```txt
/api/v1/admin
```

Tất cả endpoint yêu cầu Bearer token và admin role.

### 12.1 Admin Dashboard

```http
GET /api/v1/admin/dashboard
```

Response:

```json
{
  "total_users": 100,
  "active_users": 95,
  "total_tests_completed": 300,
  "total_topics": 20,
  "total_questions": 200,
  "total_vocabulary_saved": 1000
}
```

### 12.1.1 Admin System Health

```http
GET /api/v1/admin/system-health
```

Mục đích:

- Kiểm tra nhanh cấu hình runtime mà không lộ secret.
- Admin web dùng endpoint này để báo `ready` hoặc `needs config` cho TTS, STT, scoring, pronunciation, storage và scoring runtime.

Response:

```json
{
  "environment": "production",
  "debug": false,
  "api_public_url": "https://api.example.com",
  "services": {
    "speech_to_text": {
      "configured": true,
      "provider": "Groq Whisper",
      "model": "whisper-large-v3",
      "required_env": "GROQ_API_KEY"
    },
    "tts": {
      "configured": true,
      "provider": "Azure Neural TTS",
      "region": "eastus",
      "voice": "en-US-AvaMultilingualNeural",
      "style": "chat",
      "required_env": "AZURE_SPEECH_KEY"
    }
  }
}
```

### 12.2 List Users

```http
GET /api/v1/admin/users
```

Query params:

| Param | Type | Required | Notes |
|---|---|---:|---|
| page | int | No | Default `1` |
| per_page | int | No | Default `20`, max `100` |
| search | string | No | Search email hoặc full_name |

Response:

```json
{
  "items": [
    {
      "id": "uuid",
      "email": "student@example.com",
      "full_name": "Student",
      "username": "student01",
      "is_active": true,
      "total_xp": 120,
      "created_at": "2026-05-17 10:00:00"
    }
  ],
  "total": 1,
  "page": 1,
  "per_page": 20
}
```

### 12.3 Block/Unblock User

```http
PATCH /api/v1/admin/users/{user_id}/status?is_active=false
```

Query params:

| Param | Type | Required |
|---|---|---:|
| is_active | bool | Yes |

Response:

```json
{
  "user_id": "uuid",
  "is_active": false
}
```

### 12.4 Tạo Topic

```http
POST /api/v1/admin/topics
```

Body:

```json
{
  "title": "Hometown",
  "title_vi": "Quê hương",
  "description": "Common IELTS Part 1 topic",
  "category": "daily_life",
  "ielts_part": "part1",
  "difficulty": "easy",
  "icon": "home",
  "is_active": true,
  "order_index": 1
}
```

Response `201`: `TopicResponse`.

### 12.5 Cập Nhật Topic

```http
PUT /api/v1/admin/topics/{topic_id}
```

Body: các field optional.

```json
{
  "title": "Updated Hometown",
  "difficulty": "medium",
  "is_active": true
}
```

Response: `TopicResponse`.

### 12.6 Xóa Topic

```http
DELETE /api/v1/admin/topics/{topic_id}
```

Response:

```txt
204 No Content
```

### 12.7 Tạo Question

```http
POST /api/v1/admin/questions
```

Body:

```json
{
  "topic_id": "uuid",
  "question_text": "Where is your hometown?",
  "question_text_vi": "Quê bạn ở đâu?",
  "ielts_part": "part1",
  "cue_card_content": null,
  "follow_up_questions": null,
  "difficulty": "easy",
  "sample_answer": {
    "band_7": "My hometown is..."
  },
  "key_vocabulary": [
    {
      "word": "located",
      "meaning": "situated"
    }
  ],
  "is_active": true,
  "order_index": 1
}
```

Xử lý:

- Kiểm tra topic tồn tại.
- Tạo question mới.

Response `201`: `QuestionResponse`.

### 12.8 Cập Nhật Question

```http
PUT /api/v1/admin/questions/{question_id}
```

Body: các field optional.

```json
{
  "question_text": "Could you describe your hometown?",
  "difficulty": "medium",
  "is_active": true
}
```

Response: `QuestionResponse`.

### 12.9 Xóa Question

```http
DELETE /api/v1/admin/questions/{question_id}
```

Response:

```txt
204 No Content
```

## 13. Practice Scoring Pipeline

Luồng scoring chính:

```txt
Client
  -> POST /practice/start
  -> POST /practice/{attempt_id}/upload-audio
  -> POST /practice/{attempt_id}/submit
  -> GET /practice/{attempt_id}/result polling

Backend
  -> Set attempt status = scoring
  -> Celery score_practice_attempt(attempt_id)
  -> Transcribe audio
  -> Pronunciation assessment
  -> LLM IELTS scoring
  -> Save AIScoringResult
  -> Update TestAttempt status = completed
```

Các field score:

- `overall_band`
- `fluency_score`
- `lexical_score`
- `grammar_score`
- `pronunciation_score`

Các feedback chi tiết:

- `pronunciation_details`
- `feedback`
- `strengths`
- `weaknesses`
- `suggested_improvements`
- `sample_better_answer`
- `grammar_errors`
- `vocabulary_suggestions`

## 14. Cấu Hình Môi Trường Liên Quan API

Các biến quan trọng trong `app/config.py`:

```txt
APP_NAME
APP_VERSION
DEBUG
DATABASE_URL
REDIS_URL
JWT_SECRET_KEY
JWT_ACCESS_TOKEN_EXPIRE_MINUTES
JWT_REFRESH_TOKEN_EXPIRE_DAYS
FIREBASE_SERVICE_ACCOUNT_PATH
OPENAI_API_KEY
GOOGLE_GEMINI_API_KEY
AZURE_SPEECH_KEY
AZURE_SPEECH_REGION
GROQ_API_KEY
S3_ENDPOINT_URL
S3_ACCESS_KEY
S3_SECRET_KEY
S3_BUCKET_NAME
CELERY_BROKER_URL
CELERY_RESULT_BACKEND
SMTP_SERVER
SMTP_USERNAME
SMTP_PASSWORD
SMTP_FROM_EMAIL
```

## 15. Lỗi HTTP Thường Gặp

| Status | Ý nghĩa |
|---:|---|
| 400 | Request hợp lệ về format nhưng sai logic, ví dụ OTP sai, chưa upload audio, password sai rule |
| 401 | Token sai/hết hạn, sai login credentials, Firebase token không hợp lệ |
| 403 | Account bị deactivate hoặc không có quyền admin |
| 404 | Resource không tồn tại hoặc không thuộc user |
| 409 | Conflict, ví dụ word vocabulary đã tồn tại |
| 422 | Validation error từ Pydantic/FastAPI |
| 500 | Lỗi server hoặc external service |
| 502 | Dictionary upstream lỗi |
| 504 | Dictionary timeout |

## 16. Ghi Chú Triển Khai Và Hạn Chế Hiện Tại

- `logout` chưa blacklist JWT server-side, client cần xóa token.
- `upload_avatar` chưa upload storage thật, đang trả placeholder path.
- `practice/upload-audio` đang lưu local file trong `app/uploads`, chưa dùng S3/MinIO dù config đã có.
- `leaderboard.period` hiện được validate nhưng chưa lọc theo weekly/monthly/all_time.
- `practice/stats.tests_this_week` và `improvement_pct` đang TODO.
- `topics/recommended` đang random, chưa dựa trên weakness/history.
- `notifications` mới quản lý settings/device token, chưa có endpoint list notification items.
- Một số response không dùng envelope `{status_code, message, data}` dù `app/api/response.py` có helper.

## 17. Ví Dụ Flow Tích Hợp Frontend

### Login Flow

```txt
POST /auth/login
  -> lưu access_token và refresh_token
GET /users/me
  -> lưu user profile vào auth store
```

### Register Flow

```txt
POST /auth/register-send-otp
  -> user nhập OTP
POST /auth/register
  -> nhận token
GET /users/me
  -> lấy profile
```

### Practice Flow

```txt
GET /topics?ielts_part=part1
POST /practice/start
POST /practice/{attempt_id}/upload-audio
POST /practice/{attempt_id}/submit
GET /practice/{attempt_id}/result
  -> poll đến khi status = completed
```

### Vocabulary + Flashcard Flow

```txt
GET /vocabulary/dictionary/lookup?word=coherent
POST /vocabulary
POST /flashcards/decks/auto-generate
GET /flashcards/decks/{deck_id}/study
POST /flashcards/cards/{card_id}/review
```
