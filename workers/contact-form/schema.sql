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
