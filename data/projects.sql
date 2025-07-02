DELETE FROM contents WHERE type='project';

INSERT INTO contents (type, content, date) VALUES
	('project', '项目名，持续时间，角色，项目概述', '2025-01-01'), -- 最后一个字段填一个关键日期，用于排序，一条项目一行
	('project', '项目名，持续时间，角色，项目概述', '2025-01-01');
