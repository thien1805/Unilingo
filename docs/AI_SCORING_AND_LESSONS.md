# Unilingo - Bài học (Lessons) & AI Scoring (Chấm chữa bằng AI)

Tài liệu này hướng dẫn chi tiết cách hệ thống quản lý các bài học (Lessons/Topics/Questions) và cách luồng chấm chữa bằng AI (AI Scoring) hoạt động trong ứng dụng Unilingo.

---

## 1. Cách Thêm Bài Học (Lessons)

Các bài học (IELTS Speaking Topics) trong Unilingo được quản lý thông qua 2 bảng chính trong cơ sở dữ liệu: `topics` và `questions`.
File tham khảo: `app/models/topic.py`

### 1.1 Cấu trúc Dữ liệu

**Bảng `topics`**:
- `id`: UUID
- `title`: Tên chủ đề (vd: "Hometown", "Technology")
- `title_vi`: Tên chủ đề tiếng Việt
- `category`: Phân loại (vd: "daily_life", "education")
- `ielts_part`: Phần thi IELTS ("part1", "part2", "part3")
- `difficulty`: Độ khó ("easy", "medium", "hard")
- `icon`: Icon hiển thị
- `is_active`: Trạng thái hiển thị (True/False)

**Bảng `questions`**:
- `id`: UUID
- `topic_id`: Khóa ngoại liên kết tới bảng `topics`
- `question_text`: Nội dung câu hỏi
- `ielts_part`: Phần thi IELTS
- `cue_card_content`: Nội dung thẻ Cue Card (chỉ dành cho Part 2)
- `follow_up_questions`: Câu hỏi phụ (Part 3) lưu dạng JSON
- `sample_answer`: Câu trả lời mẫu & từ vựng (JSON)
- `key_vocabulary`: Từ vựng quan trọng cần dùng (JSON)
- `is_active`: Trạng thái

### 1.2 Cách Thêm Dữ Liệu
Hiện tại, để thêm bài học mới, bạn có thể thực hiện thông qua **Database Seeding** hoặc **PostgreSQL Script**:

```sql
-- Ví dụ thêm một Topic Part 1
INSERT INTO topics (id, title, title_vi, category, ielts_part, difficulty, icon, is_active)
VALUES ('uuid-topic-1', 'Hometown', 'Quê hương', 'daily_life', 'part1', 'easy', '🏠', true);

-- Ví dụ thêm Question cho Topic trên
INSERT INTO questions (id, topic_id, question_text, ielts_part, difficulty)
VALUES ('uuid-question-1', 'uuid-topic-1', 'Where is your hometown?', 'part1', 'easy');
```

Hoặc bạn có thể viết một script Python sử dụng SQLAlchemy session để đọc dữ liệu từ một file JSON (ví dụ `seed_data.json`) và thêm vào CSDL.

---

## 2. Luồng Chấm Chữa AI (AI Scoring Workflow)

Quá trình chấm điểm tự động bằng AI trong Unilingo được thiết kế bất đồng bộ (Asynchronous) để đảm bảo trải nghiệm mượt mà, không khóa (block) ứng dụng khi AI đang xử lý file ghi âm.

File tham khảo: 
- `app/api/v1/practice.py`
- `app/models/practice.py`

### 2.1 Các bước thực hiện

1. **Start Practice (Bắt đầu luyện tập)**
   - API: `POST /practice/start`
   - Client gửi `topic_id` và `ielts_part`.
   - Backend sẽ tạo một bản ghi `TestAttempt` với `status="in_progress"` và trả về một câu hỏi ngẫu nhiên thuộc Topic đó.

2. **Upload Audio (Tải file ghi âm)**
   - API: `POST /practice/{attempt_id}/upload-audio`
   - Client tải lên file ghi âm (`.webm` hoặc `.mp4`).
   - Backend lưu file (có thể lưu trên server hoặc AWS S3) và tạo một bản ghi `AttemptPart`.

3. **Submit (Nộp bài)**
   - API: `POST /practice/{attempt_id}/submit`
   - Backend chuyển trạng thái của `TestAttempt` sang `status="scoring"`.
   - Backend **đẩy một tác vụ chấm điểm (task) vào Celery Queue** (Ví dụ: `score_practice_attempt.delay(attempt_id)`).
   - Cộng điểm XP tạm thời cho User và ghi nhận Streak.

4. **Quá trình xử lý của AI Worker (Background Task)**
   - **Speech-to-Text (STT):** Worker tải file audio và dùng mô hình AI (như OpenAI Whisper) để dịch file âm thanh sang văn bản (Transcript).
   - **Scoring (LLM):** Worker gửi Transcript cùng với Câu hỏi cho một mô hình Ngôn ngữ Lớn (như GPT-4o hoặc Claude 3.5 Sonnet) với prompt yêu cầu chấm điểm IELTS Speaking theo 4 tiêu chí (Fluency, Lexical, Grammar, Pronunciation).
   - **Lưu Database:** Lưu kết quả vào bảng `AIScoringResult` và cập nhật điểm trung bình `overall_band` vào `TestAttempt`. Đổi `status="completed"`.

5. **Polling Results (Nhận kết quả)**
   - API: `GET /practice/{attempt_id}/result`
   - Trong lúc AI đang chấm, Client gọi API này mỗi 3-5 giây.
   - Khi API trả về `status="completed"`, Client sẽ ngừng gọi và hiển thị trang Kết quả (Overall Band, Chi tiết 4 tiêu chí, Nhận xét, và transcript sửa lỗi).

### 2.2 Kiến trúc AI Worker (Celery)
Để tích hợp, bạn cần thiết lập một worker bằng **Celery** + **Redis/RabbitMQ**.

Ví dụ logic của `app/workers/scoring_tasks.py`:
```python
from celery import shared_task
from app.services.ai_scoring import score_audio_file

@shared_task
def score_practice_attempt(attempt_id: str):
    # 1. Fetch Attempt & Audio URLs from DB
    # 2. Call Whisper API -> Transcript
    # 3. Call LLM (GPT) -> JSON Score (Fluency, Lexical, Grammar, Pronunciation, Feedback)
    # 4. Save to AIScoringResult
    # 5. Update TestAttempt status to "completed"
    pass
```

### 2.3 Cách Ứng Dụng (Client-side)
Trên Mobile (React Native), luồng sẽ như sau:
1. Mở màn hình `PracticeScreen`, chọn Topic.
2. Bấm Record -> Nói -> Bấm Stop.
3. Gọi API `/upload-audio`.
4. Gọi API `/submit`.
5. Hiển thị Lottie Animation "Đang chấm điểm bằng AI...". Dùng `setInterval` gọi API `/result` mỗi 3s.
6. Khi nhận được kết quả, chuyển sang màn hình `PracticeResultScreen`.

---

## 3. Ứng Dụng AI Miễn Phí (Azure AI Speech + Groq/Llama 3)

Để triển khai hệ thống AI chấm điểm mà không tốn chi phí lớn ban đầu, bạn có thể kết hợp **Azure AI Speech (Free Tier)** cho Speech-to-Text và **Groq (chạy Llama 3)** cho việc chấm điểm (LLM).

### 3.1 Cài đặt Azure AI Speech (Speech-to-Text)
Azure cung cấp gói miễn phí (Free Tier - F0) cho phép nhận dạng giọng nói lên đến 5 giờ âm thanh mỗi tháng.
- **Bước 1:** Tạo tài khoản Microsoft Azure và tạo một resource `Speech Services`.
- **Bước 2:** Lấy `Subscription Key` và `Region`.
- **Bước 3:** Sử dụng thư viện `azure-cognitiveservices-speech` trong worker của bạn để chuyển đổi Audio thành Text.

```python
import azure.cognitiveservices.speech as speechsdk

def speech_to_text(audio_file_path, key, region):
    speech_config = speechsdk.SpeechConfig(subscription=key, region=region)
    audio_config = speechsdk.audio.AudioConfig(filename=audio_file_path)
    speech_recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config, audio_config=audio_config)
    
    result = speech_recognizer.recognize_once_async().get()
    if result.reason == speechsdk.ResultReason.RecognizedSpeech:
        return result.text
    return None
```

### 3.2 Cài đặt Groq + Llama 3 (AI Scoring)
Groq hiện tại cung cấp API cực kỳ nhanh và hoàn toàn miễn phí cho các model open-source như Llama 3 (70B hoặc 8B).
- **Bước 1:** Đăng ký tài khoản tại [GroqCloud](https://console.groq.com/) và tạo API Key.
- **Bước 2:** Viết Prompt yêu cầu LLM chấm điểm dựa trên transcript (đã lấy được từ Azure) và trả về định dạng JSON phù hợp với Schema của `AIScoringResult`.
- **Bước 3:** Dùng thư viện `groq` (hoặc `openai` sdk cấu hình lại base url) để gọi API.

```python
import os
from groq import Groq
import json

def score_with_groq(transcript, question_text):
    client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
    prompt = f"""
    You are an expert IELTS examiner. Score the following response.
    Question: {question_text}
    Transcript: {transcript}
    
    Return ONLY a JSON object with the following keys:
    - fluency_band (float 1-9)
    - lexical_band (float 1-9)
    - grammar_band (float 1-9)
    - pronunciation_band (float 1-9)
    - overall_band (float 1-9)
    - feedback (object with 'summary' and 'detailed')
    - strengths (list of strings)
    - weaknesses (list of strings)
    - suggested_improvements (list of strings)
    - grammar_errors (list of objects with 'original', 'corrected', 'rule')
    - vocabulary_suggestions (list of objects with 'basic_word', 'better_alternatives')
    - sample_better_answer (object with 'text' and 'explanation')
    """

    chat_completion = client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model="llama3-70b-8192",
        response_format={"type": "json_object"}
    )
    
    return json.loads(chat_completion.choices[0].message.content)
```

### 3.3 Tích hợp vào Worker
Bạn gọi hàm `speech_to_text()` trước, kiểm tra nếu thành công thì tiếp tục gọi `score_with_groq()`. Sau đó map dữ liệu JSON trả về vào model `AIScoringResult` và lưu xuống database.
Đừng quên lưu các giá trị API Key vào file `.env` (ví dụ `AZURE_SPEECH_KEY`, `GROQ_API_KEY`) để bảo mật.
