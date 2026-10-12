# Website inquiry measurement

Updated October 12, 2026. Owner decisions: D3 retains manual hashed-email matching; D4 retains DNT suppression. Neither decision changes the current live measurement policy.

## Saved inquiry and shared event ID

All five website inquiry forms use the Astro success signal and Cloudflare contact Worker: main contact, used-oil quote, parts request, disc-parts glossary and used Alfa Laval quick quote. The Worker derives `dolphin_lead_<saved-row-id>` from a successful D1 insert and returns `openai_event_id`. Browser and server send standard `lead_created` with that same ID and Pixel. Invalid requests and failed saves produce no OpenAI event. A saved inquiry can still receive server measurement if its later email notification fails.

The existing browser helper initializes once. Contact and parts handlers schedule CAPI through `waitUntil`. Timeouts, provider failures, serialization failures and the single bounded retry do not prevent inquiry completion. The retry reuses the original body, ID and timestamp. A successful transport response is delivery evidence, not proof of attribution to an ad.

## Matching data and D3

After a successful save, both routes trim and lowercase the submitted email and compute its SHA-256 hash. The browser passes `email_sha256` as Pixel user data; CAPI sends `user.emails_sha256`. Raw email, inquiry text, name and phone are not manually included in these measurement payloads or logs. An email hash remains a matching identifier; it is not anonymous data. Sanjay explicitly retained this manual hashed-email matching on October 12, 2026.

The manual implementation is distinct from any automatic advanced matching the Pixel/account may perform. This code and decision do not establish that automatic matching is disabled or expose an account toggle. No Ads Manager settings were changed.

CAPI can also use the genuine opaque click reference, SDK browser reference, Cloudflare-supplied client IP and user agent. Source URLs are restricted to the two production Dolphin origins and stripped of query strings and fragments. The canonical contact pathname is the fallback. Events carry `opt_out: true` for future user-level personalization; no revenue or conversion value is invented.

## Attribution and suppression

The browser captures a landing `oppref` independently of SDK loading. A permitted same-origin POST to `/api/ads-attribution` sets the host-only `dc_oppref` cookie with a requested 30-day lifetime. Form context forwards the original value to the cross-origin Worker. URI escaping is reversible cookie transport, not a rewritten identifier. Existing SDK `__oppref` and `__obref` values remain available as fallbacks; the server prefers its own SDK cookies when present. Browser storage restrictions and deletion can shorten lifetime.

First-touch JSON and current-session fields are saved separately. The three private D1 fields added by `schema-openai-attribution.sql` hold first touch, the OpenAI reference and the suppression reason. No historical data was backfilled or replayed. Identifiers and customer details stay outside Git and public reports.

GPC, DNT, stored Pixel denial, queued denial and storage failures suppress the OpenAI integration. The local-storage `oaiq_consent` and `__oaiq_consent` cookie are honored. D4 retained DNT on October 12. The server records bounded reason codes, not customer or reference values; historical records that omitted a reason cannot be diagnosed retrospectively. Suppression never prevents a customer inquiry from being saved.

## Configuration and evidence

Pages uses `PUBLIC_OPENAI_ADS_PIXEL_ID`; Worker secrets are `OPENAI_ADS_PIXEL_ID` and `OPENAI_ADS_CAPI_KEY`. Both pixel settings must represent the same Pixel for deduplication. Keys never belong in browser bundles, source or reports. The exported sender supports validation-only transport for controlled diagnostics, but routine tests use offline mocked transport and do not send fabricated conversions.

Only successful inquiries are conversion events. The authenticated weekly report's paid-session/form-reach metrics remain separate first-party behavioral evidence. The separate 404 page is intentionally outside Pixel measurement. Preview/localhost hosts are excluded.

Verification details and current reconciliation thresholds are in `CONVERSION_TRACKING_VERIFICATION.md`. Browser/CAPI tests cover shared IDs, permission controls, matching fields, failures and retries; form-handler tests mock all external services. Build and Worker dry-run are local checks. Genuine ad attribution can lag delivery and cannot be established by a synthetic test.

Sources: [Measurement Pixel](https://developers.openai.com/ads/measurement-pixel), [Measure Results](https://help.openai.com/en/articles/20001214-measure-results).
