DROP TABLE IF EXISTS resumes;

CREATE TABLE resumes (
	uuid TEXT PRIMARY KEY,
	company TEXT NOT NULL,
	position TEXT NOT NULL,
	resume_json TEXT NOT NULL,
	created_at TEXT NOT NULL
);
