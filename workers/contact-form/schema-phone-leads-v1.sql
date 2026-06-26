-- ============================================================
-- Dolphin Stats Dashboard - Phone Lead Ingestion V1
-- Source: Talkroute voicemail notification emails via Gmail.
-- Run after the base schema is live:
--   wrangler d1 execute dolphin-submissions --file=workers/contact-form/schema-phone-leads-v1.sql --remote
-- ============================================================

CREATE TABLE IF NOT EXISTS calls (
  id                      INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at              TEXT NOT NULL,
  ingested_at             TEXT NOT NULL DEFAULT '',
  updated_at              TEXT NOT NULL DEFAULT '',
  source                  TEXT NOT NULL DEFAULT 'talkroute_gmail',
  source_message_id       TEXT NOT NULL DEFAULT '',
  source_thread_id        TEXT NOT NULL DEFAULT '',
  source_email_ts         TEXT NOT NULL DEFAULT '',
  source_display_url      TEXT NOT NULL DEFAULT '',
  email_subject           TEXT NOT NULL DEFAULT '',
  email_from              TEXT NOT NULL DEFAULT '',
  email_to                TEXT NOT NULL DEFAULT '',
  caller_raw              TEXT NOT NULL DEFAULT '',
  caller_phone_e164       TEXT NOT NULL DEFAULT '',
  caller_phone_digits     TEXT NOT NULL DEFAULT '',
  mailbox                 TEXT NOT NULL DEFAULT '',
  duration_seconds        INTEGER NOT NULL DEFAULT 0,
  transcript_snippet      TEXT NOT NULL DEFAULT '',
  transcript_available    INTEGER NOT NULL DEFAULT 0,
  audio_filename          TEXT NOT NULL DEFAULT '',
  audio_mime_type         TEXT NOT NULL DEFAULT '',
  audio_size_bytes        INTEGER NOT NULL DEFAULT 0,
  matched_submission_id   INTEGER DEFAULT NULL,
  matched_visitor_id      TEXT NOT NULL DEFAULT '',
  match_status            TEXT NOT NULL DEFAULT 'unmatched',
  match_confidence        TEXT NOT NULL DEFAULT '',
  matched_at              TEXT NOT NULL DEFAULT '',
  raw_json                TEXT NOT NULL DEFAULT '',
  deleted                 INTEGER NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_calls_source_message ON calls(source, source_message_id);
CREATE INDEX IF NOT EXISTS idx_calls_created_at ON calls(created_at);
CREATE INDEX IF NOT EXISTS idx_calls_phone_digits ON calls(caller_phone_digits);
CREATE INDEX IF NOT EXISTS idx_calls_matched_visitor ON calls(matched_visitor_id);
CREATE INDEX IF NOT EXISTS idx_calls_match_status ON calls(match_status);
CREATE INDEX IF NOT EXISTS idx_calls_deleted ON calls(deleted);
