"""
Database Seeder - Populate initial IELTS topics and questions.
Run: python -m app.seed
"""
import asyncio
import uuid
from app.database import AsyncSessionLocal, init_db
from app.models.topic import Topic, Question


SEED_DATA = [
    # ─── PART 1: Introduction & Interview ───
    {
        "title": "Work & Studies",
        "title_vi": "Công việc & Học tập",
        "description": "Questions about your job, studies, and daily routine",
        "category": "daily_life",
        "ielts_part": "part1",
        "difficulty": "easy",
        "icon": "💼",
        "questions": [
            {"text": "Do you work or are you a student?", "text_vi": "Bạn đi làm hay đi học?"},
            {"text": "What do you do for work?", "text_vi": "Bạn làm công việc gì?"},
            {"text": "What subjects are you studying?", "text_vi": "Bạn đang học những môn gì?"},
            {"text": "Why did you choose this field of study?", "text_vi": "Tại sao bạn chọn ngành học này?"},
            {"text": "What do you enjoy most about your work/studies?", "text_vi": "Bạn thích điều gì nhất về công việc/học tập?"},
        ]
    },
    {
        "title": "Hometown",
        "title_vi": "Quê hương",
        "description": "Questions about the place you come from",
        "category": "daily_life",
        "ielts_part": "part1",
        "difficulty": "easy",
        "icon": "🏘️",
        "questions": [
            {"text": "Where are you from?", "text_vi": "Bạn đến từ đâu?"},
            {"text": "What do you like about your hometown?", "text_vi": "Bạn thích điều gì ở quê hương?"},
            {"text": "Has your hometown changed much recently?", "text_vi": "Quê hương bạn có thay đổi nhiều gần đây không?"},
            {"text": "Is your hometown a good place for young people?", "text_vi": "Quê bạn có phải nơi tốt cho người trẻ không?"},
        ]
    },
    {
        "title": "Hobbies & Free Time",
        "title_vi": "Sở thích & Thời gian rảnh",
        "description": "Questions about what you do in your spare time",
        "category": "daily_life",
        "ielts_part": "part1",
        "difficulty": "easy",
        "icon": "🎨",
        "questions": [
            {"text": "What do you do in your free time?", "text_vi": "Bạn làm gì trong thời gian rảnh?"},
            {"text": "Do you have any hobbies?", "text_vi": "Bạn có sở thích gì không?"},
            {"text": "Have your hobbies changed since you were a child?", "text_vi": "Sở thích của bạn có thay đổi từ khi còn nhỏ không?"},
            {"text": "Do you prefer to spend your free time alone or with others?", "text_vi": "Bạn thích dành thời gian rảnh một mình hay với người khác?"},
        ]
    },
    {
        "title": "Technology",
        "title_vi": "Công nghệ",
        "description": "Questions about technology use in daily life",
        "category": "technology",
        "ielts_part": "part1",
        "difficulty": "medium",
        "icon": "📱",
        "questions": [
            {"text": "How often do you use the internet?", "text_vi": "Bạn sử dụng internet bao lâu một lần?"},
            {"text": "What do you mainly use your phone for?", "text_vi": "Bạn chủ yếu dùng điện thoại để làm gì?"},
            {"text": "Do you think technology has improved our lives?", "text_vi": "Bạn có nghĩ công nghệ đã cải thiện cuộc sống không?"},
        ]
    },

    # ─── PART 2: Individual Long Turn (Cue Cards) ───
    {
        "title": "A Place You Visited",
        "title_vi": "Một nơi bạn đã đến thăm",
        "description": "Describe a memorable place you have visited",
        "category": "travel",
        "ielts_part": "part2",
        "difficulty": "medium",
        "icon": "✈️",
        "questions": [
            {
                "text": "Describe a place you have visited that you found very interesting.",
                "text_vi": "Mô tả một nơi bạn đã đến thăm mà bạn thấy rất thú vị.",
                "cue_card": "You should say:\n• where this place is\n• when you visited it\n• what you did there\nand explain why you found it interesting.",
                "sample_answer": {
                    "text": "I'd like to talk about Hoi An Ancient Town, which I visited last autumn. It's a UNESCO World Heritage Site located in central Vietnam. I spent four days exploring the narrow streets lined with centuries-old houses painted in vibrant yellow. What captivated me most was how well-preserved the architecture was — a harmonious blend of Vietnamese, Chinese, and Japanese influences. I found it particularly fascinating because every corner told a story of the town's rich trading history.",
                    "band_level": 7.5
                }
            }
        ]
    },
    {
        "title": "A Person Who Inspired You",
        "title_vi": "Một người truyền cảm hứng cho bạn",
        "description": "Describe someone who has had a significant influence on your life",
        "category": "people",
        "ielts_part": "part2",
        "difficulty": "medium",
        "icon": "🌟",
        "questions": [
            {
                "text": "Describe a person who has inspired you in your life.",
                "text_vi": "Mô tả một người đã truyền cảm hứng cho bạn trong cuộc sống.",
                "cue_card": "You should say:\n• who this person is\n• how you know them\n• what they have done that inspired you\nand explain why they were such an inspiration to you.",
            }
        ]
    },
    {
        "title": "A Book or Movie You Enjoyed",
        "title_vi": "Một cuốn sách hoặc bộ phim bạn thích",
        "description": "Describe a book or movie that left a strong impression on you",
        "category": "entertainment",
        "ielts_part": "part2",
        "difficulty": "medium",
        "icon": "📚",
        "questions": [
            {
                "text": "Describe a book or movie that you really enjoyed.",
                "text_vi": "Mô tả một cuốn sách hoặc bộ phim mà bạn thực sự thích.",
                "cue_card": "You should say:\n• what the book/movie was about\n• when you read/watched it\n• why you chose it\nand explain why you enjoyed it so much.",
            }
        ]
    },

    # ─── PART 3: Two-Way Discussion ───
    {
        "title": "Education & Learning",
        "title_vi": "Giáo dục & Học tập",
        "description": "Abstract discussion about education systems and learning methods",
        "category": "education",
        "ielts_part": "part3",
        "difficulty": "hard",
        "icon": "🎓",
        "questions": [
            {"text": "How has education changed in your country over the past few decades?", "text_vi": "Giáo dục ở nước bạn thay đổi thế nào trong vài thập kỷ qua?"},
            {"text": "Do you think online learning is as effective as traditional classroom learning?", "text_vi": "Bạn có nghĩ học trực tuyến hiệu quả như học truyền thống?"},
            {"text": "What role should technology play in education?", "text_vi": "Công nghệ nên đóng vai trò gì trong giáo dục?"},
            {"text": "Is a university degree still important for career success?", "text_vi": "Bằng đại học có còn quan trọng cho sự nghiệp không?"},
        ]
    },
    {
        "title": "Environment & Climate",
        "title_vi": "Môi trường & Khí hậu",
        "description": "Discussion about environmental challenges and sustainability",
        "category": "environment",
        "ielts_part": "part3",
        "difficulty": "hard",
        "icon": "🌍",
        "questions": [
            {"text": "What do you think are the biggest environmental challenges facing the world today?", "text_vi": "Bạn nghĩ thách thức môi trường lớn nhất hiện nay là gì?"},
            {"text": "Should governments or individuals take more responsibility for protecting the environment?", "text_vi": "Chính phủ hay cá nhân nên chịu trách nhiệm nhiều hơn về bảo vệ môi trường?"},
            {"text": "How can cities become more environmentally friendly?", "text_vi": "Các thành phố có thể trở nên thân thiện hơn với môi trường bằng cách nào?"},
        ]
    },
    {
        "title": "Technology & Society",
        "title_vi": "Công nghệ & Xã hội",
        "description": "Discussion about technology's impact on modern society",
        "category": "technology",
        "ielts_part": "part3",
        "difficulty": "hard",
        "icon": "🤖",
        "questions": [
            {"text": "How has technology changed the way people communicate?", "text_vi": "Công nghệ đã thay đổi cách con người giao tiếp như thế nào?"},
            {"text": "Do you think artificial intelligence will replace human jobs in the future?",  "text_vi": "Bạn có nghĩ AI sẽ thay thế công việc con người trong tương lai?"},
            {"text": "What are the advantages and disadvantages of social media?", "text_vi": "Ưu điểm và nhược điểm của mạng xã hội là gì?"},
        ]
    },
]


async def seed_database():
    """Populate the database with initial IELTS topics and questions."""
    await init_db()

    async with AsyncSessionLocal() as db:
        # Check if already seeded
        from sqlalchemy import select, func
        count = (await db.execute(select(func.count(Topic.id)))).scalar()
        if count and count > 0:
            print(f"⚠️  Database already has {count} topics. Skipping seed.")
            return

        for idx, topic_data in enumerate(SEED_DATA):
            topic = Topic(
                title=topic_data["title"],
                title_vi=topic_data.get("title_vi"),
                description=topic_data.get("description"),
                category=topic_data["category"],
                ielts_part=topic_data["ielts_part"],
                difficulty=topic_data["difficulty"],
                icon=topic_data.get("icon"),
                is_active=True,
                order_index=idx,
            )
            db.add(topic)
            await db.flush()

            for q_idx, q_data in enumerate(topic_data["questions"]):
                if isinstance(q_data, dict):
                    question = Question(
                        topic_id=topic.id,
                        question_text=q_data.get("text", q_data.get("question_text", "")),
                        question_text_vi=q_data.get("text_vi"),
                        ielts_part=topic_data["ielts_part"],
                        cue_card_content=q_data.get("cue_card"),
                        sample_answer=q_data.get("sample_answer"),
                        difficulty=topic_data["difficulty"],
                        is_active=True,
                        order_index=q_idx,
                    )
                    db.add(question)

        await db.commit()
        print(f"✅ Seeded {len(SEED_DATA)} topics with questions!")


if __name__ == "__main__":
    asyncio.run(seed_database())
