-- ============================================================
-- Dolphin Centrifuge — Contact Form Submissions
-- Cloudflare D1 Database Schema
-- Run: wrangler d1 execute dolphin-submissions --file=schema.sql --remote
-- ============================================================

CREATE TABLE IF NOT EXISTS submissions (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at           TEXT    NOT NULL,

  -- Customer Details
  first_name           TEXT    NOT NULL DEFAULT '',
  last_name            TEXT    NOT NULL DEFAULT '',
  company              TEXT    NOT NULL DEFAULT '',
  email                TEXT    NOT NULL DEFAULT '',
  phone                TEXT    NOT NULL DEFAULT '',
  contact_method       TEXT             DEFAULT '',
  country              TEXT             DEFAULT '',
  us_state             TEXT             DEFAULT '',

  -- Application Details
  fluid_type           TEXT             DEFAULT '',
  capacity             TEXT             DEFAULT '',
  solids_percentage    TEXT             DEFAULT '',
  centrifuge_condition TEXT             DEFAULT '',
  additional_details   TEXT             DEFAULT '',

  -- Lead Attribution V1
  form_type                         TEXT             DEFAULT 'contact',
  attribution_session_id            TEXT             DEFAULT '',
  attribution_first_touch_id        TEXT             DEFAULT '',
  attribution_visitor_id            TEXT             DEFAULT '',
  attribution_visitor_first_seen_at TEXT             DEFAULT '',
  attribution_visitor_last_seen_at  TEXT             DEFAULT '',
  attribution_visit_count           INTEGER NOT NULL DEFAULT 0,
  attribution_is_returning          INTEGER NOT NULL DEFAULT 0,
  attribution_landing_page          TEXT             DEFAULT '',
  attribution_current_page          TEXT             DEFAULT '',
  attribution_referrer              TEXT             DEFAULT '',
  attribution_source                TEXT             DEFAULT '',
  attribution_medium                TEXT             DEFAULT '',
  attribution_campaign              TEXT             DEFAULT '',
  attribution_term                  TEXT             DEFAULT '',
  attribution_content               TEXT             DEFAULT '',
  attribution_gclid                 TEXT             DEFAULT '',
  attribution_gbraid                TEXT             DEFAULT '',
  attribution_wbraid                TEXT             DEFAULT '',
  attribution_msclkid               TEXT             DEFAULT '',
  attribution_ga_client_id          TEXT             DEFAULT '',
  attribution_ga_session_id         TEXT             DEFAULT '',
  attribution_statcounter_visitor_id TEXT            DEFAULT '',
  attribution_first_seen_at         TEXT             DEFAULT '',
  attribution_form_started_at       TEXT             DEFAULT '',
  attribution_form_submitted_at     TEXT             DEFAULT '',
  attribution_page_count            INTEGER NOT NULL DEFAULT 0,
  attribution_pages_json            TEXT             DEFAULT '',
  attribution_raw_json              TEXT             DEFAULT '',

  -- Parts RFQ Details
  parts_json           TEXT             DEFAULT '',
  parts_count          INTEGER NOT NULL DEFAULT 0,

  -- Visitor Context
  visitor_ip           TEXT             DEFAULT '',
  visitor_user_agent   TEXT             DEFAULT '',
  visitor_accept_language TEXT          DEFAULT '',
  visitor_country      TEXT             DEFAULT '',
  visitor_region       TEXT             DEFAULT '',
  visitor_city         TEXT             DEFAULT '',
  visitor_timezone     TEXT             DEFAULT '',
  visitor_asn          TEXT             DEFAULT '',
  visitor_as_organization TEXT          DEFAULT '',
  visitor_cf_ray       TEXT             DEFAULT '',

  -- Admin Metadata
  is_reconnect         INTEGER NOT NULL DEFAULT 0,  -- 1 = returning customer detected
  reconnect_match_id   INTEGER          DEFAULT NULL, -- id of the previous matching entry
  deleted              INTEGER NOT NULL DEFAULT 0,  -- 1 = soft-deleted (hidden from dashboard)
  admin_notes          TEXT             DEFAULT ''
);

-- Index for fast reconnect lookups
CREATE INDEX IF NOT EXISTS idx_email   ON submissions(email);
CREATE INDEX IF NOT EXISTS idx_phone   ON submissions(phone);
CREATE INDEX IF NOT EXISTS idx_company ON submissions(company);
CREATE INDEX IF NOT EXISTS idx_deleted ON submissions(deleted);
CREATE INDEX IF NOT EXISTS idx_form_type ON submissions(form_type);
CREATE INDEX IF NOT EXISTS idx_attribution_session_id ON submissions(attribution_session_id);
CREATE INDEX IF NOT EXISTS idx_attribution_visitor_id ON submissions(attribution_visitor_id);
CREATE INDEX IF NOT EXISTS idx_attribution_gclid ON submissions(attribution_gclid);
CREATE INDEX IF NOT EXISTS idx_attribution_source ON submissions(attribution_source);
CREATE INDEX IF NOT EXISTS idx_visitor_ip ON submissions(visitor_ip);
CREATE INDEX IF NOT EXISTS idx_visitor_country ON submissions(visitor_country);

CREATE TABLE IF NOT EXISTS visitor_profiles (
  visitor_id              TEXT PRIMARY KEY,
  first_seen_at           TEXT NOT NULL DEFAULT '',
  last_seen_at            TEXT NOT NULL DEFAULT '',
  last_session_id         TEXT NOT NULL DEFAULT '',
  first_landing_page      TEXT NOT NULL DEFAULT '',
  last_page               TEXT NOT NULL DEFAULT '',
  last_title              TEXT NOT NULL DEFAULT '',
  referrer                TEXT NOT NULL DEFAULT '',
  source                  TEXT NOT NULL DEFAULT '',
  medium                  TEXT NOT NULL DEFAULT '',
  campaign                TEXT NOT NULL DEFAULT '',
  term                    TEXT NOT NULL DEFAULT '',
  gclid                   TEXT NOT NULL DEFAULT '',
  gbraid                  TEXT NOT NULL DEFAULT '',
  wbraid                  TEXT NOT NULL DEFAULT '',
  ga_client_id            TEXT NOT NULL DEFAULT '',
  statcounter_visitor_id  TEXT NOT NULL DEFAULT '',
  visitor_ip              TEXT NOT NULL DEFAULT '',
  visitor_user_agent      TEXT NOT NULL DEFAULT '',
  visitor_country         TEXT NOT NULL DEFAULT '',
  visitor_region          TEXT NOT NULL DEFAULT '',
  visitor_city            TEXT NOT NULL DEFAULT '',
  visitor_timezone        TEXT NOT NULL DEFAULT '',
  visitor_asn             TEXT NOT NULL DEFAULT '',
  visitor_as_organization TEXT NOT NULL DEFAULT '',
  visit_count             INTEGER NOT NULL DEFAULT 0,
  pageview_count          INTEGER NOT NULL DEFAULT 0,
  label                   TEXT NOT NULL DEFAULT '',
  contact_name            TEXT NOT NULL DEFAULT '',
  contact_company         TEXT NOT NULL DEFAULT '',
  contact_email           TEXT NOT NULL DEFAULT '',
  contact_phone           TEXT NOT NULL DEFAULT '',
  identity_source         TEXT NOT NULL DEFAULT '',
  identity_confidence     TEXT NOT NULL DEFAULT '',
  identity_updated_at     TEXT NOT NULL DEFAULT '',
  alert_enabled           INTEGER NOT NULL DEFAULT 0,
  alert_email             TEXT NOT NULL DEFAULT '',
  last_alerted_session_id TEXT NOT NULL DEFAULT '',
  notes                   TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS visitor_events (
  id                      INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at              TEXT NOT NULL,
  visitor_id              TEXT NOT NULL DEFAULT '',
  session_id              TEXT NOT NULL DEFAULT '',
  event_type              TEXT NOT NULL DEFAULT 'pageview',
  page_path               TEXT NOT NULL DEFAULT '',
  page_title              TEXT NOT NULL DEFAULT '',
  referrer                TEXT NOT NULL DEFAULT '',
  source                  TEXT NOT NULL DEFAULT '',
  medium                  TEXT NOT NULL DEFAULT '',
  campaign                TEXT NOT NULL DEFAULT '',
  term                    TEXT NOT NULL DEFAULT '',
  visitor_ip              TEXT NOT NULL DEFAULT '',
  visitor_country         TEXT NOT NULL DEFAULT '',
  visitor_region          TEXT NOT NULL DEFAULT '',
  visitor_city            TEXT NOT NULL DEFAULT '',
  attribution_json        TEXT NOT NULL DEFAULT '',
  visitor_context_json    TEXT NOT NULL DEFAULT ''
);

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

CREATE INDEX IF NOT EXISTS idx_visitor_profiles_last_seen ON visitor_profiles(last_seen_at);
CREATE INDEX IF NOT EXISTS idx_visitor_profiles_alert ON visitor_profiles(alert_enabled);
CREATE INDEX IF NOT EXISTS idx_visitor_profiles_contact_email ON visitor_profiles(contact_email);
CREATE INDEX IF NOT EXISTS idx_visitor_profiles_contact_phone ON visitor_profiles(contact_phone);
CREATE INDEX IF NOT EXISTS idx_visitor_events_visitor_id ON visitor_events(visitor_id);
CREATE INDEX IF NOT EXISTS idx_visitor_events_session_id ON visitor_events(session_id);
CREATE INDEX IF NOT EXISTS idx_visitor_events_created_at ON visitor_events(created_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_calls_source_message ON calls(source, source_message_id);
CREATE INDEX IF NOT EXISTS idx_calls_created_at ON calls(created_at);
CREATE INDEX IF NOT EXISTS idx_calls_phone_digits ON calls(caller_phone_digits);
CREATE INDEX IF NOT EXISTS idx_calls_matched_visitor ON calls(matched_visitor_id);
CREATE INDEX IF NOT EXISTS idx_calls_match_status ON calls(match_status);
CREATE INDEX IF NOT EXISTS idx_calls_deleted ON calls(deleted);
