DELETE FROM contents WHERE type='education';

INSERT INTO contents (type, content, date) VALUES
('education', '学校，学位，专业，始末年和主要课程', '2025-01-01'), -- 最后一个字段填一个关键日期，用于排序，一条教育经历一行
('education', '学校，学位，专业，始末年和主要课程', '2025-02-01');
