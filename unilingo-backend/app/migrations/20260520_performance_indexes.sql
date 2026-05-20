-- Speed up the read-heavy screens used by the mobile app.
-- Safe to run more than once.

CREATE INDEX IF NOT EXISTS idx_daily_streaks_user_date
    ON daily_streaks (user_id, streak_date);

CREATE INDEX IF NOT EXISTS idx_test_attempts_user_started
    ON test_attempts (user_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_test_attempts_user_part_started
    ON test_attempts (user_id, ielts_part, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_test_attempts_user_completed
    ON test_attempts (user_id, status, completed_at DESC)
    WHERE status = 'completed';

CREATE INDEX IF NOT EXISTS idx_vocabulary_notes_user_mastery
    ON vocabulary_notes (user_id, mastery_level);

CREATE INDEX IF NOT EXISTS idx_vocabulary_notes_user_next_review
    ON vocabulary_notes (user_id, next_review_at);

CREATE INDEX IF NOT EXISTS idx_user_notifications_user_read_created
    ON user_notifications (user_id, is_read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_blog_posts_published_recent
    ON blog_posts (is_published, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_blog_posts_published_category_recent
    ON blog_posts (is_published, category, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_blog_posts_featured_recent
    ON blog_posts (is_published, is_featured, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_topics_active_part_order
    ON topics (is_active, ielts_part, order_index);

CREATE INDEX IF NOT EXISTS idx_questions_topic_active_order
    ON questions (topic_id, is_active, order_index);

CREATE INDEX IF NOT EXISTS idx_questions_part_active
    ON questions (ielts_part, is_active);

CREATE INDEX IF NOT EXISTS idx_flashcard_decks_user_updated
    ON flashcard_decks (user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_flashcards_deck_order
    ON flashcards (deck_id, order_index);

CREATE INDEX IF NOT EXISTS idx_flashcard_reviews_card_reviewed
    ON flashcard_reviews (flashcard_id, reviewed_at DESC);
