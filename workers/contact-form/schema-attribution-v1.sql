-- Dolphin Centrifuge - Lead Attribution V1 migration
-- Run only after approving the remote D1 schema update.
-- wrangler d1 execute dolphin-submissions --file=workers/contact-form/schema-attribution-v1.sql --remote

ALTER TABLE submissions ADD COLUMN form_type TEXT DEFAULT 'contact';
ALTER TABLE submissions ADD COLUMN attribution_session_id TEXT DEFAULT '';
ALTER TABLE submissions ADD COLUMN attribution_first_touch_id TEXT DEFAULT '';
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
CREATE INDEX IF NOT EXISTS idx_attribution_gclid ON submissions(attribution_gclid);
CREATE INDEX IF NOT EXISTS idx_attribution_source ON submissions(attribution_source);
CREATE INDEX IF NOT EXISTS idx_visitor_ip ON submissions(visitor_ip);
CREATE INDEX IF NOT EXISTS idx_visitor_country ON submissions(visitor_country);
