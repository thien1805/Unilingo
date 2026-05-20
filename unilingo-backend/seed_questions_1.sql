-- ═══ TRAVEL Part 1 ═══
INSERT INTO questions (id, topic_id, question_text, question_text_vi, ielts_part, difficulty, is_active, order_index) VALUES
('d0010001-b0c0-4001-b001-000000000001','c0000001-a0c0-4001-a001-000000000001','Do you like traveling?','Bạn có thích du lịch không?','part1','easy',true,1),
('d0010002-b0c0-4001-b001-000000000002','c0000001-a0c0-4001-a001-000000000001','What is the most interesting place you have visited?','Nơi thú vị nhất bạn đã đến là đâu?','part1','medium',true,2),
('d0010003-b0c0-4001-b001-000000000003','c0000001-a0c0-4001-a001-000000000001','Do you prefer traveling alone or with friends?','Bạn thích đi du lịch một mình hay với bạn bè?','part1','easy',true,3),
('d0010004-b0c0-4001-b001-000000000004','c0000001-a0c0-4001-a001-000000000001','How do you usually plan your trips?','Bạn thường lên kế hoạch du lịch như thế nào?','part1','medium',true,4)
ON CONFLICT (id) DO NOTHING;

-- ═══ TRAVEL Part 3 ═══
INSERT INTO questions (id, topic_id, question_text, question_text_vi, ielts_part, difficulty, is_active, order_index) VALUES
('d0010005-b0c0-4003-b003-000000000001','c0000001-a0c0-4003-a003-000000000003','How has international travel changed in recent years?','Du lịch quốc tế đã thay đổi như thế nào?','part3','hard',true,1),
('d0010006-b0c0-4003-b003-000000000002','c0000001-a0c0-4003-a003-000000000003','Do you think tourism can damage local cultures?','Bạn có nghĩ du lịch có thể phá hủy văn hóa địa phương?','part3','hard',true,2),
('d0010007-b0c0-4003-b003-000000000003','c0000001-a0c0-4003-a003-000000000003','What are the benefits of eco-tourism?','Lợi ích của du lịch sinh thái là gì?','part3','medium',true,3),
('d0010008-b0c0-4003-b003-000000000004','c0000001-a0c0-4003-a003-000000000003','Should governments invest more in tourism infrastructure?','Chính phủ có nên đầu tư thêm vào cơ sở hạ tầng du lịch?','part3','hard',true,4)
ON CONFLICT (id) DO NOTHING;

-- ═══ ENTERTAINMENT Part 1 ═══
INSERT INTO questions (id, topic_id, question_text, question_text_vi, ielts_part, difficulty, is_active, order_index) VALUES
('d0020001-b0c0-4001-b001-000000000001','c0000002-a0c0-4001-a001-000000000001','What kind of movies do you enjoy watching?','Bạn thích xem thể loại phim nào?','part1','easy',true,1),
('d0020002-b0c0-4001-b001-000000000002','c0000002-a0c0-4001-a001-000000000001','Do you prefer watching movies at home or in the cinema?','Bạn thích xem phim ở nhà hay rạp?','part1','easy',true,2),
('d0020003-b0c0-4001-b001-000000000003','c0000002-a0c0-4001-a001-000000000001','What kind of music do you listen to?','Bạn nghe thể loại nhạc nào?','part1','easy',true,3),
('d0020004-b0c0-4001-b001-000000000004','c0000002-a0c0-4001-a001-000000000001','Do you read books often?','Bạn có hay đọc sách không?','part1','easy',true,4)
ON CONFLICT (id) DO NOTHING;

-- ═══ ENTERTAINMENT Part 3 ═══
INSERT INTO questions (id, topic_id, question_text, question_text_vi, ielts_part, difficulty, is_active, order_index) VALUES
('d0020005-b0c0-4003-b003-000000000001','c0000002-a0c0-4003-a003-000000000003','How has streaming changed the entertainment industry?','Streaming đã thay đổi ngành giải trí như thế nào?','part3','hard',true,1),
('d0020006-b0c0-4003-b003-000000000002','c0000002-a0c0-4003-a003-000000000003','Do you think social media influences what people watch?','Mạng xã hội có ảnh hưởng đến nội dung người ta xem?','part3','medium',true,2),
('d0020007-b0c0-4003-b003-000000000003','c0000002-a0c0-4003-a003-000000000003','Should governments censor violent content in media?','Chính phủ có nên kiểm duyệt nội dung bạo lực?','part3','hard',true,3),
('d0020008-b0c0-4003-b003-000000000004','c0000002-a0c0-4003-a003-000000000003','What role does traditional entertainment play in modern society?','Giải trí truyền thống có vai trò gì trong xã hội hiện đại?','part3','hard',true,4)
ON CONFLICT (id) DO NOTHING;

-- ═══ PEOPLE Part 1 ═══
INSERT INTO questions (id, topic_id, question_text, question_text_vi, ielts_part, difficulty, is_active, order_index) VALUES
('d0030001-b0c0-4001-b001-000000000001','c0000003-a0c0-4001-a001-000000000001','Who is the most important person in your life?','Ai là người quan trọng nhất trong đời bạn?','part1','easy',true,1),
('d0030002-b0c0-4001-b001-000000000002','c0000003-a0c0-4001-a001-000000000001','Do you spend a lot of time with your family?','Bạn có dành nhiều thời gian cho gia đình không?','part1','easy',true,2),
('d0030003-b0c0-4001-b001-000000000003','c0000003-a0c0-4001-a001-000000000001','What qualities do you value most in a friend?','Bạn trân trọng phẩm chất nào nhất ở bạn bè?','part1','medium',true,3),
('d0030004-b0c0-4001-b001-000000000004','c0000003-a0c0-4001-a001-000000000001','How do you usually keep in touch with friends?','Bạn thường giữ liên lạc với bạn bè bằng cách nào?','part1','easy',true,4)
ON CONFLICT (id) DO NOTHING;

-- ═══ PEOPLE Part 3 ═══
INSERT INTO questions (id, topic_id, question_text, question_text_vi, ielts_part, difficulty, is_active, order_index) VALUES
('d0030005-b0c0-4003-b003-000000000001','c0000003-a0c0-4003-a003-000000000003','Why do people admire celebrities so much?','Tại sao mọi người ngưỡng mộ người nổi tiếng?','part3','medium',true,1),
('d0030006-b0c0-4003-b003-000000000002','c0000003-a0c0-4003-a003-000000000003','Should famous people be role models for young people?','Người nổi tiếng có nên làm hình mẫu cho giới trẻ?','part3','hard',true,2),
('d0030007-b0c0-4003-b003-000000000003','c0000003-a0c0-4003-a003-000000000003','How has social media changed the way we maintain relationships?','Mạng xã hội thay đổi cách duy trì các mối quan hệ?','part3','hard',true,3),
('d0030008-b0c0-4003-b003-000000000004','c0000003-a0c0-4003-a003-000000000003','Do you think older generations had stronger friendships?','Thế hệ trước có tình bạn bền chặt hơn không?','part3','medium',true,4)
ON CONFLICT (id) DO NOTHING;

-- ═══ HEALTH Part 1 ═══
INSERT INTO questions (id, topic_id, question_text, question_text_vi, ielts_part, difficulty, is_active, order_index) VALUES
('d0040001-b0c0-4001-b001-000000000001','c0000004-a0c0-4001-a001-000000000001','Do you exercise regularly?','Bạn có tập thể dục đều đặn không?','part1','easy',true,1),
('d0040002-b0c0-4001-b001-000000000002','c0000004-a0c0-4001-a001-000000000001','What do you do to stay healthy?','Bạn làm gì để giữ sức khỏe?','part1','easy',true,2),
('d0040003-b0c0-4001-b001-000000000003','c0000004-a0c0-4001-a001-000000000001','Do you think people today are healthier than before?','Bạn nghĩ người ngày nay khỏe hơn trước không?','part1','medium',true,3),
('d0040004-b0c0-4001-b001-000000000004','c0000004-a0c0-4001-a001-000000000001','How important is sleep to you?','Giấc ngủ quan trọng thế nào với bạn?','part1','easy',true,4)
ON CONFLICT (id) DO NOTHING;

-- ═══ HEALTH Part 2 (cue card) ═══
INSERT INTO questions (id, topic_id, question_text, question_text_vi, ielts_part, cue_card_content, difficulty, is_active, order_index) VALUES
('d0040005-b0c0-4002-b002-000000000001','c0000004-a0c0-4002-a002-000000000002','Describe a healthy habit you have.','Mô tả một thói quen lành mạnh.','part2','You should say:
- What the habit is
- When you started doing it
- How you maintain it
- And explain why you think it is healthy','medium',true,1)
ON CONFLICT (id) DO NOTHING;

-- ═══ HEALTH Part 3 ═══
INSERT INTO questions (id, topic_id, question_text, question_text_vi, ielts_part, difficulty, is_active, order_index) VALUES
('d0040006-b0c0-4003-b003-000000000001','c0000004-a0c0-4003-a003-000000000003','Should governments do more to promote healthy lifestyles?','Chính phủ có nên làm nhiều hơn để khuyến khích lối sống lành mạnh?','part3','hard',true,1),
('d0040007-b0c0-4003-b003-000000000002','c0000004-a0c0-4003-a003-000000000003','Why do some people find it difficult to maintain healthy habits?','Tại sao một số người khó duy trì thói quen lành mạnh?','part3','medium',true,2),
('d0040008-b0c0-4003-b003-000000000003','c0000004-a0c0-4003-a003-000000000003','How has technology affected peoples health?','Công nghệ ảnh hưởng đến sức khỏe con người thế nào?','part3','hard',true,3),
('d0040009-b0c0-4003-b003-000000000004','c0000004-a0c0-4003-a003-000000000003','Do you think mental health is as important as physical health?','Sức khỏe tinh thần có quan trọng như sức khỏe thể chất?','part3','medium',true,4)
ON CONFLICT (id) DO NOTHING;
