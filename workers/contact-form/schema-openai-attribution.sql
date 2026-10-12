-- Private lead attribution. Apply once before deploying the corresponding Worker.
ALTER TABLE submissions ADD COLUMN attribution_first_touch_json TEXT;
ALTER TABLE submissions ADD COLUMN attribution_openai_click_ref TEXT;
ALTER TABLE submissions ADD COLUMN attribution_openai_suppression_reason TEXT;
