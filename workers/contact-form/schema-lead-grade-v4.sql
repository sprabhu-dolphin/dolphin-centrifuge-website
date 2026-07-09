-- Lead grade columns on form submissions.
-- Run once:
--   wrangler d1 execute dolphin-submissions --file=workers/contact-form/schema-lead-grade-v4.sql --remote
-- Valid grade values: 'A' | 'B' | 'C' | NULL.

ALTER TABLE submissions ADD COLUMN grade TEXT DEFAULT NULL;
ALTER TABLE submissions ADD COLUMN grade_source TEXT DEFAULT NULL;
ALTER TABLE submissions ADD COLUMN grade_reason TEXT DEFAULT '';
ALTER TABLE submissions ADD COLUMN graded_at TEXT DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_submissions_grade ON submissions(grade);
CREATE INDEX IF NOT EXISTS idx_submissions_grade_source ON submissions(grade_source);
