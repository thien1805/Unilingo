-- ============================================
-- Seed: Mock Speaking Test (from mockSpeakingTest.ts)
-- ============================================

-- Topic for Mock Test (Part 1)
INSERT INTO topics (id, title, title_vi, description, category, ielts_part, difficulty, icon, is_active, order_index, created_at)
VALUES (
  'a0000001-a0c0-4001-a001-000000000001',
  'Mock Speaking Test',
  'Bài thi nói mẫu',
  'A complete IELTS mock speaking test covering Part 1, 2, and 3. Topics include study, mobile applications, and technology in education.',
  'mock_test',
  'part1',
  'medium',
  'mic',
  true,
  100,
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Topic for Mock Test (Part 2)
INSERT INTO topics (id, title, title_vi, description, category, ielts_part, difficulty, icon, is_active, order_index, created_at)
VALUES (
  'a0000001-a0c0-4002-a002-000000000002',
  'Mock Speaking Test',
  'Bài thi nói mẫu',
  'Describe a mobile application that you find useful.',
  'mock_test',
  'part2',
  'medium',
  'mic',
  true,
  101,
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Topic for Mock Test (Part 3)
INSERT INTO topics (id, title, title_vi, description, category, ielts_part, difficulty, icon, is_active, order_index, created_at)
VALUES (
  'a0000001-a0c0-4003-a003-000000000003',
  'Mock Speaking Test',
  'Bài thi nói mẫu',
  'Discussion about technology, mobile apps, and education.',
  'mock_test',
  'part3',
  'medium',
  'mic',
  true,
  102,
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- ── Part 1 Questions ──
INSERT INTO questions (id, topic_id, question_text, question_text_vi, ielts_part, difficulty, is_active, order_index, created_at)
VALUES
  ('b0000001-b0c0-4001-b001-000000000001', 'a0000001-a0c0-4001-a001-000000000001',
   'Do you work or study?', 'Bạn đang đi làm hay đi học?', 'part1', 'medium', true, 1, NOW()),
  ('b0000001-b0c0-4002-b002-000000000002', 'a0000001-a0c0-4001-a001-000000000001',
   'Why did you choose your major?', 'Tại sao bạn chọn ngành học này?', 'part1', 'medium', true, 2, NOW()),
  ('b0000001-b0c0-4003-b003-000000000003', 'a0000001-a0c0-4001-a001-000000000001',
   'What do you usually do after class?', 'Bạn thường làm gì sau giờ học?', 'part1', 'medium', true, 3, NOW()),
  ('b0000001-b0c0-4004-b004-000000000004', 'a0000001-a0c0-4001-a001-000000000001',
   'Do you prefer studying alone or with other people?', 'Bạn thích học một mình hay học nhóm?', 'part1', 'medium', true, 4, NOW())
ON CONFLICT (id) DO NOTHING;

-- ── Part 2 Question (with cue card) ──
INSERT INTO questions (id, topic_id, question_text, question_text_vi, ielts_part, cue_card_content, difficulty, is_active, order_index, created_at)
VALUES
  ('b0000001-b0c0-4005-b005-000000000005', 'a0000001-a0c0-4002-a002-000000000002',
   'Describe a mobile application that you find useful.',
   'Mô tả một ứng dụng di động mà bạn thấy hữu ích.',
   'part2',
   'You should say:
- What the application is
- When you started using it
- What features it has
- And explain why you find it useful',
   'medium', true, 1, NOW())
ON CONFLICT (id) DO NOTHING;

-- ── Part 3 Questions ──
INSERT INTO questions (id, topic_id, question_text, question_text_vi, ielts_part, difficulty, is_active, order_index, created_at)
VALUES
  ('b0000001-b0c0-4006-b006-000000000006', 'a0000001-a0c0-4003-a003-000000000003',
   'How have mobile applications changed the way students learn?',
   'Ứng dụng di động đã thay đổi cách sinh viên học tập như thế nào?',
   'part3', 'medium', true, 1, NOW()),
  ('b0000001-b0c0-4007-b007-000000000007', 'a0000001-a0c0-4003-a003-000000000003',
   'Do you think educational apps can replace teachers?',
   'Bạn có nghĩ ứng dụng giáo dục có thể thay thế giáo viên không?',
   'part3', 'medium', true, 2, NOW()),
  ('b0000001-b0c0-4008-b008-000000000008', 'a0000001-a0c0-4003-a003-000000000003',
   'What are the disadvantages of relying too much on mobile apps?',
   'Nhược điểm của việc phụ thuộc quá nhiều vào ứng dụng di động là gì?',
   'part3', 'medium', true, 3, NOW()),
  ('b0000001-b0c0-4009-b009-000000000009', 'a0000001-a0c0-4003-a003-000000000003',
   'How might learning apps develop in the future?',
   'Ứng dụng học tập có thể phát triển như thế nào trong tương lai?',
   'part3', 'hard', true, 4, NOW())
ON CONFLICT (id) DO NOTHING;
