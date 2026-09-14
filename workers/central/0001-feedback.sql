CREATE TABLE IF NOT EXISTS central_feedback (
 id TEXT PRIMARY KEY,
 rating TEXT NOT NULL,
 note TEXT NOT NULL,
 question TEXT NOT NULL,
 answer TEXT NOT NULL,
 source_ids TEXT NOT NULL,
 created_at INTEGER NOT NULL
);
