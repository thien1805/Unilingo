-- Extra topics to fill gaps (each category needs part1+part2+part3)

-- ═══ TRAVEL category: add part1 + part3 ═══
INSERT INTO topics (id, title, title_vi, description, category, ielts_part, difficulty, icon, is_active, order_index)
VALUES ('c0000001-a0c0-4001-a001-000000000001', 'Travel & Holidays', 'Du lịch & Kỳ nghỉ', 'Questions about travel experiences', 'travel', 'part1', 'easy', 'airplane', true, 5)
ON CONFLICT (id) DO NOTHING;

INSERT INTO topics (id, title, title_vi, description, category, ielts_part, difficulty, icon, is_active, order_index)
VALUES ('c0000001-a0c0-4003-a003-000000000003', 'Travel & Globalization', 'Du lịch & Toàn cầu hóa', 'Discussion about travel impact', 'travel', 'part3', 'hard', 'globe', true, 13)
ON CONFLICT (id) DO NOTHING;

-- ═══ ENTERTAINMENT: add part1 + part3 ═══
INSERT INTO topics (id, title, title_vi, description, category, ielts_part, difficulty, icon, is_active, order_index)
VALUES ('c0000002-a0c0-4001-a001-000000000001', 'Entertainment & Media', 'Giải trí & Truyền thông', 'Questions about movies, music, books', 'entertainment', 'part1', 'easy', 'film', true, 6)
ON CONFLICT (id) DO NOTHING;

INSERT INTO topics (id, title, title_vi, description, category, ielts_part, difficulty, icon, is_active, order_index)
VALUES ('c0000002-a0c0-4003-a003-000000000003', 'Media & Entertainment', 'Truyền thông & Giải trí', 'Discussion about media influence', 'entertainment', 'part3', 'hard', 'tv', true, 14)
ON CONFLICT (id) DO NOTHING;

-- ═══ PEOPLE: add part1 + part3 ═══
INSERT INTO topics (id, title, title_vi, description, category, ielts_part, difficulty, icon, is_active, order_index)
VALUES ('c0000003-a0c0-4001-a001-000000000001', 'People & Relationships', 'Con người & Các mối quan hệ', 'Questions about family, friends', 'people', 'part1', 'easy', 'people', true, 7)
ON CONFLICT (id) DO NOTHING;

INSERT INTO topics (id, title, title_vi, description, category, ielts_part, difficulty, icon, is_active, order_index)
VALUES ('c0000003-a0c0-4003-a003-000000000003', 'Role Models & Influence', 'Hình mẫu & Ảnh hưởng', 'Discussion about people who inspire', 'people', 'part3', 'hard', 'star', true, 15)
ON CONFLICT (id) DO NOTHING;

-- ═══ HEALTH: full set ═══
INSERT INTO topics (id, title, title_vi, description, category, ielts_part, difficulty, icon, is_active, order_index)
VALUES ('c0000004-a0c0-4001-a001-000000000001', 'Health & Fitness', 'Sức khỏe & Thể dục', 'Questions about health habits', 'health', 'part1', 'easy', 'fitness', true, 8)
ON CONFLICT (id) DO NOTHING;

INSERT INTO topics (id, title, title_vi, description, category, ielts_part, difficulty, icon, is_active, order_index)
VALUES ('c0000004-a0c0-4002-a002-000000000002', 'A Healthy Habit You Have', 'Một thói quen lành mạnh', 'Describe a healthy habit', 'health', 'part2', 'medium', 'heart', true, 9)
ON CONFLICT (id) DO NOTHING;

INSERT INTO topics (id, title, title_vi, description, category, ielts_part, difficulty, icon, is_active, order_index)
VALUES ('c0000004-a0c0-4003-a003-000000000003', 'Public Health & Lifestyle', 'Sức khỏe cộng đồng', 'Discussion about health systems', 'health', 'part3', 'hard', 'medkit', true, 16)
ON CONFLICT (id) DO NOTHING;

-- ═══ FOOD: full set ═══
INSERT INTO topics (id, title, title_vi, description, category, ielts_part, difficulty, icon, is_active, order_index)
VALUES ('c0000005-a0c0-4001-a001-000000000001', 'Food & Cooking', 'Ẩm thực & Nấu ăn', 'Questions about food preferences', 'food', 'part1', 'easy', 'restaurant', true, 10)
ON CONFLICT (id) DO NOTHING;

INSERT INTO topics (id, title, title_vi, description, category, ielts_part, difficulty, icon, is_active, order_index)
VALUES ('c0000005-a0c0-4002-a002-000000000002', 'A Meal You Remember', 'Một bữa ăn đáng nhớ', 'Describe a memorable meal', 'food', 'part2', 'medium', 'pizza', true, 11)
ON CONFLICT (id) DO NOTHING;

INSERT INTO topics (id, title, title_vi, description, category, ielts_part, difficulty, icon, is_active, order_index)
VALUES ('c0000005-a0c0-4003-a003-000000000003', 'Food Culture & Nutrition', 'Văn hóa ẩm thực & Dinh dưỡng', 'Discussion about food trends', 'food', 'part3', 'hard', 'nutrition', true, 17)
ON CONFLICT (id) DO NOTHING;

-- ═══ TECHNOLOGY: add part2 ═══
INSERT INTO topics (id, title, title_vi, description, category, ielts_part, difficulty, icon, is_active, order_index)
VALUES ('c0000006-a0c0-4002-a002-000000000002', 'A Piece of Technology You Use', 'Một thiết bị công nghệ', 'Describe technology you use daily', 'technology', 'part2', 'medium', 'phone-portrait', true, 12)
ON CONFLICT (id) DO NOTHING;

-- ═══ EDUCATION: add part1 + part2 ═══
INSERT INTO topics (id, title, title_vi, description, category, ielts_part, difficulty, icon, is_active, order_index)
VALUES ('c0000007-a0c0-4002-a002-000000000002', 'A Teacher Who Influenced You', 'Một giáo viên ảnh hưởng bạn', 'Describe a memorable teacher', 'education', 'part2', 'medium', 'school', true, 18)
ON CONFLICT (id) DO NOTHING;

-- ═══ ENVIRONMENT: add part1 + part2 ═══
INSERT INTO topics (id, title, title_vi, description, category, ielts_part, difficulty, icon, is_active, order_index)
VALUES ('c0000008-a0c0-4001-a001-000000000001', 'Nature & Environment', 'Thiên nhiên & Môi trường', 'Questions about nature', 'environment', 'part1', 'easy', 'leaf', true, 19)
ON CONFLICT (id) DO NOTHING;

INSERT INTO topics (id, title, title_vi, description, category, ielts_part, difficulty, icon, is_active, order_index)
VALUES ('c0000008-a0c0-4002-a002-000000000002', 'A Natural Place You Visited', 'Một nơi thiên nhiên', 'Describe a natural place', 'environment', 'part2', 'medium', 'earth', true, 20)
ON CONFLICT (id) DO NOTHING;
