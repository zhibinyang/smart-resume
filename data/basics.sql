DELETE FROM contents WHERE type='basic';

INSERT INTO contents (type, content, date) VALUES
('basic', '你的个人基本信息，包括姓名，邮箱，头像照片，性别，出生日期，电话，社交媒体账号，地址等', '2025-01-01'),
('basic', '你的个人介绍', '2025-01-01'),
('basic', '你擅长的语言，熟练程度', '2025-01-01'),
('basic', '你擅长的技能，及熟练程度', '2025-01-01'),
('basic', '你的认证，包括每个认证名，认证厂商和认证日期', '2025-01-01');

