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
CREATE INDEX IF NOT EXISTS idx_attribution_gclid ON submissions(attribution_gclid);
CREATE INDEX IF NOT EXISTS idx_attribution_source ON submissions(attribution_source);
CREATE INDEX IF NOT EXISTS idx_visitor_ip ON submissions(visitor_ip);
CREATE INDEX IF NOT EXISTS idx_visitor_country ON submissions(visitor_country);
