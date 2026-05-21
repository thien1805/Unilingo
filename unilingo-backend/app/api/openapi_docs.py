"""
OpenAPI/Swagger documentation configuration for Unilingo.

This keeps API documentation details out of route business logic while still
making Swagger UI useful for frontend integration and backend review.
"""
from __future__ import annotations

from typing import Any

from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi


OPENAPI_DESCRIPTION = """
# Unilingo Backend API

Backend API cho ứng dụng luyện IELTS Speaking. Swagger này mô tả trực tiếp các
endpoint đang chạy trong FastAPI, bao gồm authentication, user profile, topic,
practice flow, AI scoring, vocabulary, flashcards, leaderboard, notification,
blog và admin CMS.

## Base URL

```txt
http://localhost:8000
```

Tất cả API version 1 nằm dưới prefix:

```txt
/api/v1
```

## Authentication

Các endpoint private yêu cầu JWT access token:

```http
Authorization: Bearer <access_token>
```

Lấy token từ:

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/social-login`
- `POST /api/v1/auth/refresh`

Admin endpoint yêu cầu user có `is_admin=true`.

## Practice Flow

Luồng luyện nói cơ bản:

1. `GET /api/v1/topics` để lấy chủ đề.
2. `POST /api/v1/practice/start` để tạo attempt và nhận câu hỏi.
3. `POST /api/v1/practice/{attempt_id}/upload-audio` để upload file ghi âm.
4. `POST /api/v1/practice/{attempt_id}/submit` để đưa attempt vào hàng đợi AI scoring.
5. `GET /api/v1/practice/{attempt_id}/result` để poll kết quả đến khi `status=completed`.

## Error Format

HTTP errors được trả theo dạng:

```json
{
  "detail": "Error message",
  "status_code": 400
}
```

Validation error `422` được rút gọn để dễ đọc trên frontend.
"""


OPENAPI_TAGS = [
    {
        "name": "Authentication",
        "description": (
            "Đăng ký, đăng nhập, social login, refresh token, forgot/reset "
            "password và logout. Các endpoint này tạo hoặc quản lý JWT."
        ),
    },
    {
        "name": "Users",
        "description": (
            "Profile người dùng, dashboard học tập, streak, avatar và đổi mật khẩu."
        ),
    },
    {
        "name": "Topics",
        "description": (
            "Chủ đề IELTS Speaking và danh sách câu hỏi theo part/topic."
        ),
    },
    {
        "name": "Practice",
        "description": (
            "Tạo attempt luyện nói, sinh câu hỏi, TTS, upload audio, submit scoring, "
            "xem kết quả và lịch sử luyện tập."
        ),
    },
    {
        "name": "Vocabulary",
        "description": (
            "Sổ từ vựng cá nhân, SRS review-due và dictionary lookup qua DictionaryAPI.dev."
        ),
    },
    {
        "name": "Flashcards",
        "description": (
            "Deck/card flashcard, study session và review theo thuật toán SM-2."
        ),
    },
    {
        "name": "Leaderboard",
        "description": (
            "Bảng xếp hạng theo XP và thông tin rank của current user."
        ),
    },
    {
        "name": "Notifications",
        "description": (
            "Notification settings và đăng ký/gỡ FCM device token."
        ),
    },
    {
        "name": "Blog",
        "description": (
            "Public blog reader endpoints và admin CRUD cho bài viết."
        ),
    },
    {
        "name": "Admin",
        "description": (
            "Dashboard quản trị, quản lý user, topic và question. Yêu cầu admin token."
        ),
    },
]


SWAGGER_UI_PARAMETERS = {
    "docExpansion": "none",
    "defaultModelsExpandDepth": 1,
    "defaultModelExpandDepth": 2,
    "displayRequestDuration": True,
    "filter": True,
    "persistAuthorization": True,
    "tryItOutEnabled": True,
}


COMMON_ERROR_RESPONSES = {
    "400": {
        "description": "Bad Request - request đúng format nhưng sai logic nghiệp vụ.",
        "content": {
            "application/json": {
                "example": {"detail": "Invalid or expired OTP", "status_code": 400}
            }
        },
    },
    "401": {
        "description": "Unauthorized - thiếu token, token hết hạn hoặc token không hợp lệ.",
        "content": {
            "application/json": {
                "example": {"detail": "Invalid token type", "status_code": 401}
            }
        },
    },
    "403": {
        "description": "Forbidden - tài khoản bị khóa hoặc không đủ quyền.",
        "content": {
            "application/json": {
                "example": {"detail": "Admin access required", "status_code": 403}
            }
        },
    },
    "404": {
        "description": "Not Found - resource không tồn tại hoặc không thuộc user hiện tại.",
        "content": {
            "application/json": {
                "example": {"detail": "Resource not found", "status_code": 404}
            }
        },
    },
    "422": {
        "description": "Validation Error - body/query/path params không đúng schema.",
        "content": {
            "application/json": {
                "example": {"detail": "email: value is not a valid email address", "status_code": 422}
            }
        },
    },
}


PUBLIC_OPERATIONS = {
    ("GET", "/health"),
    ("POST", "/api/v1/auth/register-send-otp"),
    ("POST", "/api/v1/auth/register"),
    ("POST", "/api/v1/auth/login"),
    ("POST", "/api/v1/auth/social-login"),
    ("POST", "/api/v1/auth/refresh"),
    ("POST", "/api/v1/auth/forgot-password"),
    ("POST", "/api/v1/auth/verify-reset-otp"),
    ("POST", "/api/v1/auth/reset-password"),
    ("POST", "/api/v1/auth/logout"),
    ("GET", "/api/v1/practice/tts"),
    ("GET", "/api/v1/vocabulary/dictionary/lookup"),
    ("GET", "/api/v1/blog"),
    ("GET", "/api/v1/blog/featured"),
    ("GET", "/api/v1/blog/{slug}"),
}


OPERATION_DOCS: dict[tuple[str, str], dict[str, Any]] = {
    ("GET", "/health"): {
        "summary": "Health check",
        "description": "Kiểm tra backend đang chạy và trả thông tin app/version.",
    },
    ("POST", "/api/v1/auth/register-send-otp"): {
        "summary": "Gửi OTP đăng ký",
        "description": "Kiểm tra email chưa tồn tại rồi gửi OTP đăng ký qua email.",
        "request_example": {"email": "student@example.com"},
    },
    ("POST", "/api/v1/auth/register"): {
        "summary": "Đăng ký tài khoản bằng OTP",
        "description": "Verify OTP, tạo user mới, hash password và trả JWT token pair.",
        "request_example": {
            "email": "student@example.com",
            "password": "password123",
            "full_name": "Nguyen Van A",
            "username": "nguyenvana",
            "otp": "123456",
        },
    },
    ("POST", "/api/v1/auth/login"): {
        "summary": "Đăng nhập email/password",
        "description": "Xác thực email/password và trả access token + refresh token.",
        "request_example": {"email": "student@example.com", "password": "password123"},
    },
    ("POST", "/api/v1/auth/social-login"): {
        "summary": "Đăng nhập Google/Apple qua Firebase",
        "description": "Verify Firebase ID token, tạo hoặc tìm user social và trả JWT token pair.",
        "request_example": {"firebase_token": "firebase-id-token", "provider": "google"},
    },
    ("POST", "/api/v1/auth/refresh"): {
        "summary": "Refresh JWT token",
        "description": "Nhận refresh token hợp lệ và trả cặp access/refresh token mới.",
        "request_example": {"refresh_token": "jwt-refresh-token"},
    },
    ("POST", "/api/v1/auth/forgot-password"): {
        "summary": "Gửi OTP reset password",
        "description": "Nếu email tồn tại, gửi OTP reset. Luôn trả success để tránh dò email.",
        "request_example": {"email": "student@example.com"},
    },
    ("POST", "/api/v1/auth/verify-reset-otp"): {
        "summary": "Verify OTP reset password",
        "description": "Kiểm tra OTP reset password nhưng chưa consume OTP.",
        "request_example": {"email": "student@example.com", "otp": "123456"},
    },
    ("POST", "/api/v1/auth/reset-password"): {
        "summary": "Reset password",
        "description": "Consume OTP reset, kiểm tra user, hash và lưu mật khẩu mới.",
        "request_example": {
            "email": "student@example.com",
            "otp": "123456",
            "new_password": "newpassword123",
        },
    },
    ("POST", "/api/v1/auth/logout"): {
        "summary": "Logout",
        "description": "Logout theo JWT hiện xử lý phía client bằng cách xóa token.",
    },
    ("GET", "/api/v1/users/me"): {
        "summary": "Lấy profile current user",
        "description": "Trả hồ sơ học viên hiện tại từ access token.",
    },
    ("PATCH", "/api/v1/users/me"): {
        "summary": "Cập nhật profile",
        "description": "Update một phần profile: tên, username, target band, ngày thi và level.",
        "request_example": {
            "full_name": "Nguyen Van B",
            "username": "nguyenvanb",
            "target_band_score": 7.5,
            "target_exam_date": "2026-09-01",
            "current_level": "upper_intermediate",
        },
    },
    ("PUT", "/api/v1/users/me/avatar"): {
        "summary": "Upload avatar",
        "description": "Upload file avatar bằng multipart/form-data. Hiện lưu placeholder URL.",
    },
    ("GET", "/api/v1/users/me/dashboard"): {
        "summary": "Dashboard học tập",
        "description": "Tổng hợp today stats, weekly band trend, skill breakdown, vocabulary stats và tổng giờ học.",
    },
    ("GET", "/api/v1/users/me/streaks"): {
        "summary": "Thông tin streak",
        "description": "Trả current streak, longest streak và total XP.",
    },
    ("GET", "/api/v1/users/me/streak-history"): {
        "summary": "Lịch sử streak 365 ngày",
        "description": "Trả dữ liệu daily streak để vẽ heatmap/commit graph.",
    },
    ("POST", "/api/v1/users/me/streak-goal"): {
        "summary": "Đặt streak goal",
        "description": "Đặt mục tiêu streak và cộng bonus XP theo số ngày cam kết.",
        "request_example": {"days": 30},
    },
    ("POST", "/api/v1/users/me/change-password"): {
        "summary": "Đổi mật khẩu",
        "description": "Verify current password rồi hash và lưu password mới.",
        "request_example": {
            "current_password": "oldpassword123",
            "new_password": "newpassword123",
        },
    },
    ("GET", "/api/v1/topics"): {
        "summary": "Danh sách topics",
        "description": "Lấy active topics, có thể lọc theo IELTS part, category và difficulty.",
    },
    ("GET", "/api/v1/topics/recommended"): {
        "summary": "Topics đề xuất",
        "description": "Hiện random 6 active topics. Recommendation theo weakness/history là TODO.",
    },
    ("GET", "/api/v1/topics/{topic_id}"): {
        "summary": "Chi tiết topic",
        "description": "Lấy topic và toàn bộ active questions thuộc topic đó.",
    },
    ("GET", "/api/v1/topics/{topic_id}/questions"): {
        "summary": "Questions của topic",
        "description": "Lấy danh sách active questions của một topic, sort theo order_index.",
    },
    ("POST", "/api/v1/practice/start"): {
        "summary": "Bắt đầu practice attempt",
        "description": (
            "Tạo TestAttempt status `in_progress`, chọn câu hỏi theo topic/part/question_id. "
            "Nếu DB thiếu câu hỏi và có GROQ_API_KEY, backend có thể sinh câu hỏi mới."
        ),
        "request_example": {
            "topic_id": "550e8400-e29b-41d4-a716-446655440000",
            "ielts_part": "part1",
            "question_id": None,
        },
    },
    ("POST", "/api/v1/practice/generate-questions"): {
        "summary": "Sinh/lấy nhiều câu hỏi",
        "description": "Lấy câu hỏi từ DB trước; nếu chưa đủ và có Groq key thì sinh thêm câu hỏi AI.",
    },
    ("GET", "/api/v1/practice/tts"): {
        "summary": "Text-to-Speech audio",
        "description": "Gọi Azure Neural TTS, cache theo text/voice/style và stream MP3 audio. Cần cấu hình AZURE_SPEECH_KEY.",
    },
    ("POST", "/api/v1/practice/transcribe-audio"): {
        "summary": "Transcribe mock-test audio",
        "description": "Upload một câu trả lời mock-test và trả transcript Groq Whisper. Trả 503 nếu thiếu GROQ_API_KEY.",
    },
    ("POST", "/api/v1/practice/{attempt_id}/upload-audio"): {
        "summary": "Upload audio ghi âm",
        "description": "Upload file ghi âm cho attempt đang in_progress và tạo AttemptPart. Hỗ trợ question_text cho mock/full-camera test không có question_id.",
    },
    ("POST", "/api/v1/practice/{attempt_id}/submit"): {
        "summary": "Submit attempt để AI scoring",
        "description": (
            "Set status `scoring`, cộng XP/streak, rồi enqueue Celery task "
            "`score_practice_attempt`. Frontend poll result endpoint sau khi submit."
        ),
    },
    ("GET", "/api/v1/practice/{attempt_id}/result"): {
        "summary": "Lấy kết quả scoring",
        "description": "Poll endpoint này đến khi status chuyển từ `scoring` sang `completed`.",
    },
    ("GET", "/api/v1/practice/history"): {
        "summary": "Lịch sử practice",
        "description": "Danh sách attempts của current user, có pagination và filter theo IELTS part.",
    },
    ("GET", "/api/v1/practice/stats"): {
        "summary": "Thống kê practice",
        "description": "Tổng hợp total tests, total hours, avg/best band và average theo từng IELTS part.",
    },
    ("GET", "/api/v1/vocabulary"): {
        "summary": "Danh sách vocabulary",
        "description": "Lấy vocabulary notes của current user, hỗ trợ search, filter mastery, sort và pagination.",
    },
    ("POST", "/api/v1/vocabulary"): {
        "summary": "Thêm vocabulary note",
        "description": "Lưu một từ mới vào sổ từ vựng cá nhân. Không cho trùng word trong cùng user.",
        "request_example": {
            "word": "coherent",
            "phonetic": "/koʊˈhɪrənt/",
            "audio_url": "https://example.com/audio.mp3",
            "definitions": [{"part_of_speech": "adjective", "definition": "Logical and consistent"}],
            "examples": ["She gave a coherent answer."],
            "user_note": "Useful IELTS word",
            "source_context": "AI feedback",
            "source_attempt_id": None,
            "tags": ["ielts", "speaking"],
        },
    },
    ("GET", "/api/v1/vocabulary/review-due"): {
        "summary": "Vocabulary đến hạn ôn",
        "description": "Lấy tối đa 20 từ new/learning/reviewing đã đến hạn SRS.",
    },
    ("PATCH", "/api/v1/vocabulary/{vocabulary_id}"): {
        "summary": "Cập nhật vocabulary note",
        "description": "Cập nhật user_note, examples, mastery_level hoặc tags.",
        "request_example": {
            "user_note": "Use in logical explanations.",
            "examples": ["My answer was coherent and well structured."],
            "mastery_level": "learning",
            "tags": ["ielts", "part3"],
        },
    },
    ("DELETE", "/api/v1/vocabulary/{vocabulary_id}"): {
        "summary": "Xóa vocabulary note",
        "description": "Xóa vocabulary note thuộc current user.",
    },
    ("GET", "/api/v1/vocabulary/dictionary/lookup"): {
        "summary": "Tra từ điển tiếng Anh",
        "description": "Proxy DictionaryAPI.dev, trả phonetic, audio và meanings đã rút gọn.",
    },
    ("GET", "/api/v1/flashcards/decks"): {
        "summary": "Danh sách flashcard decks",
        "description": "Lấy tất cả decks của current user, sort theo updated_at desc.",
    },
    ("POST", "/api/v1/flashcards/decks"): {
        "summary": "Tạo flashcard deck",
        "description": "Tạo deck mới cho current user.",
        "request_example": {
            "title": "IELTS Part 3 Ideas",
            "description": "Useful phrases and ideas",
            "is_public": False,
        },
    },
    ("GET", "/api/v1/flashcards/decks/{deck_id}"): {
        "summary": "Chi tiết deck",
        "description": "Lấy deck và toàn bộ cards thuộc deck của current user.",
    },
    ("PATCH", "/api/v1/flashcards/decks/{deck_id}"): {
        "summary": "Cập nhật deck",
        "description": "Update title, description hoặc is_public.",
        "request_example": {
            "title": "Updated IELTS Deck",
            "description": "Updated description",
            "is_public": True,
        },
    },
    ("DELETE", "/api/v1/flashcards/decks/{deck_id}"): {
        "summary": "Xóa deck",
        "description": "Xóa deck thuộc current user.",
    },
    ("POST", "/api/v1/flashcards/decks/{deck_id}/cards"): {
        "summary": "Thêm card vào deck",
        "description": "Tạo flashcard trong deck và tăng card_count.",
        "request_example": {
            "front_content": "coherent",
            "back_content": "Logical and consistent",
            "audio_url": None,
            "vocabulary_id": None,
            "extra_info": {"phonetic": "/koʊˈhɪrənt/"},
        },
    },
    ("DELETE", "/api/v1/flashcards/cards/{card_id}"): {
        "summary": "Xóa card",
        "description": "Xóa card thuộc deck của current user và giảm card_count.",
    },
    ("POST", "/api/v1/flashcards/cards/{card_id}/review"): {
        "summary": "Review card theo SM-2",
        "description": "Ghi nhận quality_rating 0-5 và tính next_review_at/interval/easiness_factor.",
        "request_example": {"quality_rating": 5},
    },
    ("GET", "/api/v1/flashcards/decks/{deck_id}/study"): {
        "summary": "Study session",
        "description": "Lấy tối đa 20 cards chưa review hoặc đã đến hạn review.",
    },
    ("POST", "/api/v1/flashcards/decks/auto-generate"): {
        "summary": "Auto-generate deck từ vocabulary",
        "description": "Tạo deck và cards từ vocabulary notes theo mastery_levels.",
        "request_example": {
            "title": "Auto IELTS Words",
            "mastery_levels": ["new", "learning"],
            "max_cards": 50,
        },
    },
    ("GET", "/api/v1/leaderboard"): {
        "summary": "Bảng xếp hạng",
        "description": "Rank users theo total_xp desc. `period` hiện được validate nhưng chưa lọc theo thời gian.",
    },
    ("GET", "/api/v1/leaderboard/me"): {
        "summary": "Rank của current user",
        "description": "Trả rank, total_xp và current_streak của current user.",
    },
    ("GET", "/api/v1/notifications/settings"): {
        "summary": "Lấy notification settings",
        "description": "Nếu user chưa có settings, backend tạo settings mặc định.",
    },
    ("PATCH", "/api/v1/notifications/settings"): {
        "summary": "Cập nhật notification settings",
        "description": "Update daily reminder, reminder time và các loại reminder.",
        "request_example": {
            "daily_reminder": True,
            "reminder_time": "21:30:00",
            "new_words_reminder": False,
            "streak_reminder": True,
            "leaderboard_update": False,
        },
    },
    ("POST", "/api/v1/notifications/devices/register"): {
        "summary": "Register FCM device token",
        "description": "Tạo hoặc cập nhật FCM token cho current user.",
        "request_example": {
            "fcm_token": "fcm-token",
            "device_type": "ios",
            "device_name": "iPhone 15",
        },
    },
    ("DELETE", "/api/v1/notifications/devices/{token}"): {
        "summary": "Gỡ FCM device token",
        "description": "Xóa device token thuộc current user. Nếu không tồn tại vẫn trả 204.",
    },
    ("GET", "/api/v1/blog"): {
        "summary": "Danh sách blog đã publish",
        "description": "Public endpoint lấy published posts, hỗ trợ category filter và pagination.",
    },
    ("GET", "/api/v1/blog/featured"): {
        "summary": "Featured blog posts",
        "description": "Public endpoint lấy featured published posts cho homepage carousel.",
    },
    ("GET", "/api/v1/blog/{slug}"): {
        "summary": "Chi tiết blog theo slug",
        "description": "Public endpoint lấy một published post và tăng view_count.",
    },
    ("POST", "/api/v1/blog/admin/create"): {
        "summary": "Admin tạo blog post",
        "description": "Tạo blog post mới, sinh slug tự động và set published_at nếu publish ngay.",
        "request_example": {
            "title": "New IELTS Tips",
            "excerpt": "Quick tips",
            "content": "Full content",
            "cover_image_url": "https://example.com/cover.jpg",
            "author_name": "Unilingo Team",
            "category": "tips",
            "tags": ["ielts", "speaking"],
            "read_time_minutes": 3,
            "is_published": True,
            "is_featured": False,
        },
    },
    ("PUT", "/api/v1/blog/admin/{post_id}"): {
        "summary": "Admin cập nhật blog post",
        "description": "Update post. Nếu chuyển sang published lần đầu, backend set published_at.",
    },
    ("DELETE", "/api/v1/blog/admin/{post_id}"): {
        "summary": "Admin xóa blog post",
        "description": "Xóa blog post theo id.",
    },
    ("GET", "/api/v1/blog/admin/all"): {
        "summary": "Admin list tất cả blog posts",
        "description": "Lấy cả draft và published posts, sort theo created_at desc.",
    },
    ("GET", "/api/v1/admin/dashboard"): {
        "summary": "Admin dashboard",
        "description": "Tổng hợp số users, active users, completed tests, topics, questions và vocabulary saved.",
    },
    ("GET", "/api/v1/admin/system-health"): {
        "summary": "Admin system health",
        "description": "Trả trạng thái cấu hình không chứa secret cho TTS, STT, scoring, pronunciation, storage và scoring runtime.",
    },
    ("GET", "/api/v1/admin/users"): {
        "summary": "Admin list users",
        "description": "Danh sách users có pagination và search theo email/full_name.",
    },
    ("PATCH", "/api/v1/admin/users/{user_id}/status"): {
        "summary": "Admin block/unblock user",
        "description": "Set is_active cho user theo query param.",
    },
    ("POST", "/api/v1/admin/topics"): {
        "summary": "Admin tạo topic",
        "description": "Tạo topic IELTS Speaking mới.",
    },
    ("PUT", "/api/v1/admin/topics/{topic_id}"): {
        "summary": "Admin cập nhật topic",
        "description": "Update topic metadata như title, category, difficulty, icon, active status.",
    },
    ("DELETE", "/api/v1/admin/topics/{topic_id}"): {
        "summary": "Admin xóa topic",
        "description": "Hard delete topic.",
    },
    ("POST", "/api/v1/admin/questions"): {
        "summary": "Admin tạo question",
        "description": "Tạo question mới sau khi kiểm tra topic tồn tại.",
    },
    ("PUT", "/api/v1/admin/questions/{question_id}"): {
        "summary": "Admin cập nhật question",
        "description": "Update question text, cue card, follow-up questions, sample answer, vocabulary và active status.",
    },
    ("DELETE", "/api/v1/admin/questions/{question_id}"): {
        "summary": "Admin xóa question",
        "description": "Hard delete question.",
    },
}


def configure_openapi(app: FastAPI, *, title: str, version: str) -> None:
    """Attach a custom OpenAPI generator to a FastAPI app."""

    def custom_openapi() -> dict[str, Any]:
        if app.openapi_schema:
            return app.openapi_schema

        schema = get_openapi(
            title=title,
            version=version,
            description=OPENAPI_DESCRIPTION,
            routes=app.routes,
            tags=OPENAPI_TAGS,
            servers=[
                {"url": "http://localhost:8000", "description": "Local development"},
                {"url": "/", "description": "Current server"},
            ],
        )

        _ensure_bearer_security(schema)
        _enhance_operations(schema)

        app.openapi_schema = schema
        return app.openapi_schema

    app.openapi = custom_openapi


def _ensure_bearer_security(schema: dict[str, Any]) -> None:
    components = schema.setdefault("components", {})
    security_schemes = components.setdefault("securitySchemes", {})
    security_schemes.setdefault(
        "HTTPBearer",
        {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": "Paste access_token lấy từ /api/v1/auth/login hoặc /api/v1/auth/register.",
        },
    )


def _enhance_operations(schema: dict[str, Any]) -> None:
    for path, path_item in schema.get("paths", {}).items():
        for method, operation in path_item.items():
            if method.upper() not in {"GET", "POST", "PUT", "PATCH", "DELETE"}:
                continue

            key = (method.upper(), path)
            docs = OPERATION_DOCS.get(key)
            if docs:
                operation["summary"] = docs.get("summary", operation.get("summary"))
                operation["description"] = docs.get("description", operation.get("description", ""))
                if "request_example" in docs:
                    _set_request_example(operation, docs["request_example"])

            _set_common_responses(operation)

            if key not in PUBLIC_OPERATIONS:
                operation.setdefault("security", [{"HTTPBearer": []}])


def _set_request_example(operation: dict[str, Any], example: dict[str, Any]) -> None:
    content = operation.get("requestBody", {}).get("content", {})
    json_content = content.get("application/json")
    if not json_content:
        return
    json_content.setdefault(
        "examples",
        {
            "default": {
                "summary": "Example request",
                "value": example,
            }
        },
    )


def _set_common_responses(operation: dict[str, Any]) -> None:
    responses = operation.setdefault("responses", {})
    for status_code, response in COMMON_ERROR_RESPONSES.items():
        responses.setdefault(status_code, response)
