-- ═══ FOOD Part 1 ═══
INSERT INTO questions (id, topic_id, question_text, question_text_vi, ielts_part, difficulty, is_active, order_index) VALUES
('d0050001-b0c0-4001-b001-000000000001','c0000005-a0c0-4001-a001-000000000001','What is your favorite food?','Món ăn yêu thích của bạn là gì?','part1','easy',true,1),
('d0050002-b0c0-4001-b001-000000000002','c0000005-a0c0-4001-a001-000000000001','Do you prefer eating at home or in restaurants?','Bạn thích ăn ở nhà hay nhà hàng?','part1','easy',true,2),
('d0050003-b0c0-4001-b001-000000000003','c0000005-a0c0-4001-a001-000000000001','Can you cook? What do you usually make?','Bạn có biết nấu ăn không? Bạn thường nấu gì?','part1','easy',true,3),
('d0050004-b0c0-4001-b001-000000000004','c0000005-a0c0-4001-a001-000000000001','Have you ever tried foreign food?','Bạn đã thử món ăn nước ngoài chưa?','part1','easy',true,4)
ON CONFLICT (id) DO NOTHING;

-- ═══ FOOD Part 2 (cue card) ═══
INSERT INTO questions (id, topic_id, question_text, question_text_vi, ielts_part, cue_card_content, difficulty, is_active, order_index) VALUES
('d0050005-b0c0-4002-b002-000000000001','c0000005-a0c0-4002-a002-000000000002','Describe a meal you had that you remember well.','Mô tả một bữa ăn đáng nhớ.','part2','You should say:
- Where you had the meal
- Who you ate with
- What you ate
- And explain why it was memorable','medium',true,1)
ON CONFLICT (id) DO NOTHING;

-- ═══ FOOD Part 3 ═══
INSERT INTO questions (id, topic_id, question_text, question_text_vi, ielts_part, difficulty, is_active, order_index) VALUES
('d0050006-b0c0-4003-b003-000000000001','c0000005-a0c0-4003-a003-000000000003','How have eating habits changed in your country?','Thói quen ăn uống ở nước bạn thay đổi thế nào?','part3','medium',true,1),
('d0050007-b0c0-4003-b003-000000000002','c0000005-a0c0-4003-a003-000000000003','Why is fast food so popular despite being unhealthy?','Tại sao đồ ăn nhanh phổ biến dù không tốt cho sức khỏe?','part3','medium',true,2),
('d0050008-b0c0-4003-b003-000000000003','c0000005-a0c0-4003-a003-000000000003','Should schools teach children about nutrition?','Trường học có nên dạy trẻ em về dinh dưỡng?','part3','hard',true,3),
('d0050009-b0c0-4003-b003-000000000004','c0000005-a0c0-4003-a003-000000000003','How might food production change in the future?','Sản xuất thực phẩm sẽ thay đổi thế nào trong tương lai?','part3','hard',true,4)
ON CONFLICT (id) DO NOTHING;

-- ═══ TECHNOLOGY Part 2 (cue card) ═══
INSERT INTO questions (id, topic_id, question_text, question_text_vi, ielts_part, cue_card_content, difficulty, is_active, order_index) VALUES
('d0060001-b0c0-4002-b002-000000000001','c0000006-a0c0-4002-a002-000000000002','Describe a piece of technology you use every day.','Mô tả một thiết bị công nghệ bạn dùng hàng ngày.','part2','You should say:
- What the technology is
- How long you have been using it
- What you use it for
- And explain how it has made your life easier','medium',true,1)
ON CONFLICT (id) DO NOTHING;

-- ═══ EDUCATION Part 2 (cue card) ═══
INSERT INTO questions (id, topic_id, question_text, question_text_vi, ielts_part, cue_card_content, difficulty, is_active, order_index) VALUES
('d0070001-b0c0-4002-b002-000000000001','c0000007-a0c0-4002-a002-000000000002','Describe a teacher who influenced you.','Mô tả một giáo viên đã ảnh hưởng đến bạn.','part2','You should say:
- Who the teacher was
- What subject they taught
- How they influenced you
- And explain why you still remember them','medium',true,1)
ON CONFLICT (id) DO NOTHING;

-- ═══ ENVIRONMENT Part 1 ═══
INSERT INTO questions (id, topic_id, question_text, question_text_vi, ielts_part, difficulty, is_active, order_index) VALUES
('d0080001-b0c0-4001-b001-000000000001','c0000008-a0c0-4001-a001-000000000001','Do you enjoy spending time in nature?','Bạn có thích dành thời gian ở thiên nhiên?','part1','easy',true,1),
('d0080002-b0c0-4001-b001-000000000002','c0000008-a0c0-4001-a001-000000000001','What environmental problems are common in your area?','Vấn đề môi trường phổ biến ở khu vực bạn?','part1','medium',true,2),
('d0080003-b0c0-4001-b001-000000000003','c0000008-a0c0-4001-a001-000000000001','Do you recycle? Why or why not?','Bạn có tái chế không? Tại sao?','part1','easy',true,3),
('d0080004-b0c0-4001-b001-000000000004','c0000008-a0c0-4001-a001-000000000001','How has the weather changed in your country recently?','Thời tiết ở nước bạn thay đổi thế nào gần đây?','part1','medium',true,4)
ON CONFLICT (id) DO NOTHING;

-- ═══ ENVIRONMENT Part 2 (cue card) ═══
INSERT INTO questions (id, topic_id, question_text, question_text_vi, ielts_part, cue_card_content, difficulty, is_active, order_index) VALUES
('d0080005-b0c0-4002-b002-000000000001','c0000008-a0c0-4002-a002-000000000002','Describe a natural place you have visited.','Mô tả một nơi thiên nhiên bạn đã đến.','part2','You should say:
- Where the place is
- When you visited it
- What you did there
- And explain why you liked it','medium',true,1)
ON CONFLICT (id) DO NOTHING;
