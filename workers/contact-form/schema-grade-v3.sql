-- Lead grade column on visitor_profiles.
-- Run after schema-visitor-identity-v2.sql when upgrading an already-migrated D1 DB.
-- Run: wrangler d1 execute dolphin-submissions --command="ALTER TABLE visitor_profiles ADD COLUMN grade TEXT DEFAULT NULL" --remote
--   OR for a local dev DB:
--      wrangler d1 execute dolphin-submissions --command="ALTER TABLE visitor_profiles ADD COLUMN grade TEXT DEFAULT NULL" --local
-- Valid values: 'A' | 'B' | 'C' | NULL (ungraded).

ALTER TABLE visitor_profiles ADD COLUMN grade TEXT DEFAULT NULL;
CREATE INDEX IF NOT EXISTS idx_visitor_profiles_grade ON visitor_profiles(grade);
