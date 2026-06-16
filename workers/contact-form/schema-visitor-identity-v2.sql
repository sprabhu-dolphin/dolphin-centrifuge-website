-- Visitor identity ledger expansion.
-- Run after schema-attribution-v1.sql when upgrading an already-migrated D1 DB.

ALTER TABLE visitor_profiles ADD COLUMN contact_name TEXT NOT NULL DEFAULT '';
ALTER TABLE visitor_profiles ADD COLUMN contact_company TEXT NOT NULL DEFAULT '';
ALTER TABLE visitor_profiles ADD COLUMN contact_email TEXT NOT NULL DEFAULT '';
ALTER TABLE visitor_profiles ADD COLUMN contact_phone TEXT NOT NULL DEFAULT '';
ALTER TABLE visitor_profiles ADD COLUMN identity_source TEXT NOT NULL DEFAULT '';
ALTER TABLE visitor_profiles ADD COLUMN identity_confidence TEXT NOT NULL DEFAULT '';
ALTER TABLE visitor_profiles ADD COLUMN identity_updated_at TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_visitor_profiles_contact_email ON visitor_profiles(contact_email);
CREATE INDEX IF NOT EXISTS idx_visitor_profiles_contact_phone ON visitor_profiles(contact_phone);
