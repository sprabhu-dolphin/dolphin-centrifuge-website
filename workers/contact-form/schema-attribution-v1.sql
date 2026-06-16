-- Dolphin Centrifuge - Lead Attribution V1 migration
-- Run only after approving the remote D1 schema update.
-- wrangler d1 execute dolphin-submissions --file=workers/contact-form/schema-attribution-v1.sql --remote

ALTER TABLE submissions ADD COLUMN form_type TEXT DEFAULT 'contact';
ALTER TABLE submissions ADD COLUMN attribution_session_id TEXT DEFAULT '';
ALTER TABLE submissions ADD COLUMN attribution_first_touch_id TEXT DEFAULT '';
ALTER TABLE submissions ADD COLUMN attribution_visitor_id TEXT DEFAULT '';
ALTER TABLE submissions ADD COLUMN attribution_visitor_first_seen_at TEXT DEFAULT '';
ALTER TABLE submissions ADD COLUMN attribution_visitor_last_seen_at TEXT DEFAULT '';
ALTER TABLE submissions ADD COLUMN attribution_visit_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE submissions ADD COLUMN attribution_is_returning INTEGER NOT NULL DEFAULT 0;
ALTER TABLE submissions ADD COLUMN attribution_landing_page TEXT DEFAULT '';
ALTER TABLE submissions ADD COLUMN attribution_current_page TEXT DEFAULT '';
ALTER TABLE submissions ADD COLUMN attribution_referrer TEXT DEFAULT '';
ALTER TABLE submissions ADD COLUMN attribution_source TEXT DEFAULT '';
ALTER TABLE submissions ADD COLUMN attribution_medium TEXT DEFAULT '';
ALTER TABLE submissions ADD COLUMN attribution_campaign TEXT DEFAULT '';
ALTER TABLE submissions ADD COLUMN attribution_term TEXT DEFAULT '';
ALTER TABLE submissions ADD COLUMN attribution_content TEXT DEFAULT '';
ALTER TABLE submissions ADD COLUMN attribution_gclid TEXT DEFAULT '';
ALTER TABLE submissions ADD COLUMN attribution_gbraid TEXT DEFAULT '';
ALTER TABLE submissions ADD COLUMN attribution_wbraid TEXT DEFAULT '';
ALTER TABLE submissions ADD COLUMN attribution_msclkid TEXT DEFAULT '';
ALTER TABLE submissions ADD COLUMN attribution_ga_client_id TEXT DEFAULT '';
ALTER TABLE submissions ADD COLUMN attribution_ga_session_id TEXT DEFAULT '';
ALTER TABLE submissions ADD COLUMN attribution_statcounter_visitor_id TEXT DEFAULT '';
ALTER TABLE submissions ADD COLUMN attribution_first_seen_at TEXT DEFAULT '';
ALTER TABLE submissions ADD COLUMN attribution_form_started_at TEXT DEFAULT '';
ALTER TABLE submissions ADD COLUMN attribution_form_submitted_at TEXT DEFAULT '';
ALTER TABLE submissions ADD COLUMN attribution_page_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE submissions ADD COLUMN attribution_pages_json TEXT DEFAULT '';
ALTER TABLE submissions ADD COLUMN attribution_raw_json TEXT DEFAULT '';
ALTER TABLE submissions ADD COLUMN parts_json TEXT DEFAULT '';
ALTER TABLE submissions ADD COLUMN parts_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE submissions ADD COLUMN visitor_ip TEXT DEFAULT '';
ALTER TABLE submissions ADD COLUMN visitor_user_agent TEXT DEFAULT '';
ALTER TABLE submissions ADD COLUMN visitor_accept_language TEXT DEFAULT '';
ALTER TABLE submissions ADD COLUMN visitor_country TEXT DEFAULT '';
ALTER TABLE submissions ADD COLUMN visitor_region TEXT DEFAULT '';
ALTER TABLE submissions ADD COLUMN visitor_city TEXT DEFAULT '';
ALTER TABLE submissions ADD COLUMN visitor_timezone TEXT DEFAULT '';
ALTER TABLE submissions ADD COLUMN visitor_asn TEXT DEFAULT '';
ALTER TABLE submissions ADD COLUMN visitor_as_organization TEXT DEFAULT '';
ALTER TABLE submissions ADD COLUMN visitor_cf_ray TEXT DEFAULT '';

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

CREATE INDEX IF NOT EXISTS idx_visitor_profiles_last_seen ON visitor_profiles(last_seen_at);
CREATE INDEX IF NOT EXISTS idx_visitor_profiles_alert ON visitor_profiles(alert_enabled);
CREATE INDEX IF NOT EXISTS idx_visitor_profiles_contact_email ON visitor_profiles(contact_email);
CREATE INDEX IF NOT EXISTS idx_visitor_profiles_contact_phone ON visitor_profiles(contact_phone);
CREATE INDEX IF NOT EXISTS idx_visitor_events_visitor_id ON visitor_events(visitor_id);
CREATE INDEX IF NOT EXISTS idx_visitor_events_session_id ON visitor_events(session_id);
CREATE INDEX IF NOT EXISTS idx_visitor_events_created_at ON visitor_events(created_at);
