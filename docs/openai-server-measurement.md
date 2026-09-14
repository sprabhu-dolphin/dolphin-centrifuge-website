# Website inquiry measurement

The Astro forms and Cloudflare contact Worker report `lead_created` with one shared ID. The Worker derives the ID from the successful D1 insert and returns it to all four contact/parts forms. Validation failures and failed database inserts do not produce an event. A saved inquiry remains a server conversion if subsequent email notification fails.

The existing browser helper is extended rather than initialized twice. Contact and parts handlers schedule CAPI through `waitUntil`; timeouts, serialization problems, provider failures and one retry cannot fail the inquiry. Both deliveries reuse the same pixel, event name and ID. The retry uses the original timestamp and body.

Configuration: the Worker secrets `OPENAI_ADS_PIXEL_ID` and `OPENAI_ADS_CAPI_KEY`; the Pages build value `PUBLIC_OPENAI_ADS_PIXEL_ID` must match. Keys never belong in source or browser bundles. Runtime sends real events by default; the exported sender supports validation-only smoke checks.

The browser forwards measurement permission and raw `__oppref` / `__obref` cookies through existing attribution context. The server prefers its own cookies when available. No decoding or rewriting of these values occurs. URLs are restricted to the two production Dolphin origins and stripped of queries and fragments. The canonical contact page is the fallback. SDK-selected browser context may be origin-only, while CAPI retains the trusted form pathname.

GPC, DNT and stored Pixel consent denial suppress measurement. The current SDK's `oaiq_consent` local-storage / `__oaiq_consent` cookie denial is honored, including queued consent commands. Personalization opt-out remains true. Optional customer email, name and phone hashes are intentionally omitted to preserve the existing no-form-content measurement policy; only browser reference, trusted Cloudflare client IP and user agent support matching.

Only successful website inquiries are in scope. Page views and content views are intentionally omitted from this lead goal. Commerce, registration, appointments, subscription, trial and native-app events have no confirmed business success boundary here and are not instrumented.

Verification: browser tests, CAPI payload/privacy/failure/retry tests, real Worker handler tests with mocked external services, Astro production build and Worker dry-run. Diagnostic receipts are not customer leads or proof of paid attribution. No historic inquiry is replayed. Review privacy and consent requirements when changing the data fields or consent policy; this installation preserves existing measurement opt-outs.
