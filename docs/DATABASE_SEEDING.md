# Unilingo Database Seeding Guide

This document explains how administrators can add new content directly to the database via SQL or Python scripts.

## 1. Adding Practice Topics & Questions

The Practice section relies on two main tables: `topics` and `questions`.

### Structure

- **Topic**: Represents a specific exam topic (e.g., "Daily Life", "Technology"). It belongs to a specific `ielts_part` (`part1`, `part2`, `part3`).
- **Question**: Represents an individual question. Each question links to a `Topic`.

### Adding via SQL

You can connect to your PostgreSQL instance and run the following queries. Ensure you use `gen_random_uuid()` for IDs.

```sql
-- 1. Create a Topic
INSERT INTO topics (id, title, title_vi, category, ielts_part, difficulty, is_active)
VALUES (
    gen_random_uuid(),
    'Hobbies and Leisure',
    'Sở thích và thời gian rảnh',
    'daily_life',
    'part1',
    'easy',
    true
) RETURNING id;

-- 2. Add Questions to the Topic (Replace the topic_id with the one generated above)
INSERT INTO questions (id, topic_id, question_text, ielts_part, order_index)
VALUES 
    (gen_random_uuid(), '<TOPIC_ID>', 'What do you usually do in your free time?', 'part1', 1),
    (gen_random_uuid(), '<TOPIC_ID>', 'Do you prefer spending your free time alone or with others?', 'part1', 2),
    (gen_random_uuid(), '<TOPIC_ID>', 'Has your free time changed since you were a child?', 'part1', 3);
```

### Important Notes:
- `ielts_part`: Must be exactly `'part1'`, `'part2'`, or `'part3'`.
- `order_index`: Determines the sequence of questions in the exam room.
- `cue_card_content` (For Part 2 only): Must be a valid JSON string, e.g.,
  `'{"prompt": "Describe a hobby", "points": ["what it is", "when you do it"]}'`

---

## 2. Adding Blog Posts (Tips & Insights)

Blog posts appear on the Home Screen and help users learn grammar, vocabulary, or exam tips.

```sql
INSERT INTO blog_posts (
    id, title, slug, content, category, read_time_minutes, 
    is_published, is_featured, published_at
) VALUES (
    gen_random_uuid(),
    'Understanding Past Perfect Tense',
    'understanding-past-perfect',
    '# Past Perfect Tense\n\nThe past perfect tense is used to...',
    'grammar',
    5,
    true,
    true,
    now()
);
```

> **Note**: The `content` field supports full Markdown syntax (`#`, `**`, `*`, `> `, etc.).

---

## 3. Adding Vocabulary & Flashcards

To populate vocabulary flashcard decks, use the `flashcard_decks` and `flashcards` tables.

```sql
-- 1. Create a Deck
INSERT INTO flashcard_decks (id, title, description, level, tag)
VALUES (
    gen_random_uuid(),
    'Essential Academic Words',
    'Crucial words for IELTS Writing Task 2 and Reading.',
    'Advanced',
    'Academic'
) RETURNING id;

-- 2. Add Flashcards
INSERT INTO flashcards (id, deck_id, front_text, back_text, phonetic, part_of_speech)
VALUES (
    gen_random_uuid(), 
    '<DECK_ID>', 
    'Ubiquitous', 
    'Present, appearing, or found everywhere.', 
    '/juːˈbɪk.wɪ.təs/', 
    'adjective'
);
```

By following these patterns, you can write external automated scripts (in Python or Node.js) to periodically bulk insert thousands of topics or posts directly into the database.
