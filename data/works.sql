DELETE FROM contents WHERE type='work';

INSERT INTO contents (type, content, date) VALUES
('work', '公司，起止时间，职位，工作内容', '2025-01-01'), -- 最后一个字段填一个关键日期，用于排序，一条工作经历一行
('work', '公司，起止时间，职位，工作内容', '2025-01-01');
