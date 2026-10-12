# Conversion-tracking verification

Updated October 12, 2026. This guide describes the production `origin/master` implementation. Verification reads existing records and uses offline fixtures; it does not submit synthetic inquiries, replay old leads, or change advertising accounts.

## Success paths and all five forms

| Website form | Submission route | D1 form type | GA4 lead_form |
|---|---|---|---|
| Main contact | Contact Worker `/` | `contact` | `centrifuge_contact_form` |
| Used-oil quote | Contact Worker `/` | `contact` | `used_oil_landing_form` |
| Alfa Laval parts | Contact Worker `/parts` | `parts_request_form` | `parts_request_form` |
| Disc-parts glossary | Contact Worker `/parts` | `disc_parts_glossary_form` | `disc_parts_glossary_form` |
| Used Alfa Laval quick quote | Contact Worker `/` via `src/scripts/usedQuoteForm.ts` | `contact` | `centrifuge_contact_form` |

Every form requires both HTTP and application success before dispatching `dolphin:generate-lead`. `BaseLayout.astro` sends GA4 `generate_lead` independently and invokes the OpenAI helper with the saved server event ID. The Worker derives `dolphin_lead_<saved-row-id>` only from a successful D1 insert and returns `openai_event_id`; browser and CAPI use the same Pixel, event name and ID. An unsaved form cannot create an OpenAI conversion. A saved inquiry can still produce server measurement if the later notification fails. CAPI transport failure cannot prevent inquiry completion.

OpenAI uses standard `lead_created` with `type: customer_action`. Pageviews, form starts, phone/email clicks and visits to confirmation pages are not lead conversions. The used-equipment variant keeps its existing contact GA4 mapping while passing the shared ID through `usedQuoteLeadDetail(input, channel, result)`.

## Configuration and code

- Pages: `PUBLIC_OPENAI_ADS_PIXEL_ID`, `PUBLIC_CONTACT_WORKER_URL`, `PUBLIC_TRACKING_ALLOWED_HOSTS` (or legacy `PUBLIC_GOOGLE_TAG_ALLOWED_HOSTS`), `PUBLIC_GOOGLE_TAG_ID`, `PUBLIC_GA4_MEASUREMENT_ID`, and the existing Google Ads build values in `src/layouts/BaseLayout.astro`.
- Contact Worker: `OPENAI_ADS_PIXEL_ID`, `OPENAI_ADS_CAPI_KEY`, `TURNSTILE_SECRET_KEY`, `RESEND_API_KEY`; `DB` binds the existing `dolphin-submissions` database. Keep secrets outside source and reports.
- Google report reads: `GA4_SA_JSON`, `GADS_CLIENT_ID`, `GADS_CLIENT_SECRET`, `GADS_REFRESH_TOKEN`, `GADS_DEVELOPER_TOKEN`; IDs/API version come from `GA4_PROPERTY_ID`, `GADS_CUSTOMER_ID`, `GADS_LOGIN_CUSTOMER_ID`, `GOOGLE_ADS_API_VERSION` in `workers/contact-form/wrangler.toml`.
- Report authentication: `REPORT_TOKEN_HASH` or `DC_ADMIN_TOKEN_HASH`; use an existing protected credential route without displaying token values.
- Browser implementation: `src/lib/openaiAds.mjs`, `src/layouts/BaseLayout.astro`, form success handlers, `src/lib/usedQuote.mjs`, `src/scripts/usedQuoteForm.ts`.
- Server implementation: `workers/contact-form/index.js`, `workers/contact-form/openai-ads.mjs`; private attribution columns are defined in `schema-openai-attribution.sql`.

The Pages and Worker Pixel settings must identify the same logical Pixel. Presence of a configured variable is not proof of real conversion attribution. Configuration inventories may show names, never values.

## Attribution and privacy

The browser captures a genuine landing `oppref` before SDK loading. After its privacy checks, `/api/ads-attribution` sets the host-only `dc_oppref` cookie; `public/_routes.json` includes this Pages Function. The form context forwards the opaque reference to the cross-origin Worker. First-touch fields and current-session fields remain separate in the payload and private D1 record. Ordinary visits do not refresh the requested 30-day cookie lifetime, and browser restrictions can shorten it. The separate 404 layout intentionally excludes measurement.

D4, October 12: Sanjay retained DNT suppression. GPC, stored SDK denial, queued denial and storage-failure suppression also remain unchanged. Bounded suppression reasons distinguish future cases; the three historical denied forms lacked reasons and cannot be explained retrospectively. Matching fields and D3 are documented in `docs/openai-server-measurement.md` and the existing privacy page.

## Read-only verification

1. Select matching date bounds and record their time zone and reporting lag. D1 stores UTC timestamps. GA4 and ad reports have their own reporting zones; do not equate a UTC day with the account-local day. Allow at least 48 hours before interpreting ChatGPT conversion totals.
2. Read `GET /admin/lead-monitor` without `send=1` for the cloud comparison. Its default is a dry run. The existing Worker schedule is `30 14 * * *` UTC; a schedule declaration does not prove a particular execution occurred.
3. The local `node reconcile-leads.mjs --complete-days --days 14 --json` wrapper reads D1, GA4 and Google Ads. It uses the shared comparison rules, but currently supplies form counts only: it does not supply the cloud monitor's paid-lead IDs or spend to the Google zero-conversion warning. Do not describe it as identical cloud coverage.
4. Use exact read-only D1 queries with `--remote` and `--config workers/contact-form/wrangler.toml`. Exclude deleted/test submissions using `D1_TEST_EXCLUSION_SQL`; retain only anonymous totals outside private records. Count stored inquiries separately from platform-attributed conversions and sales-qualified inquiries.
5. For ChatGPT intermediate behavior, read the existing `/admin/api/weekly-report` with explicit `funnel_start` and `funnel_end` ISO timestamps including Z/offset. `chatgpt_funnel` separates observed paid sessions, form-page reach and form starts, with missing/invalid/conflicting-tag coverage. Parts landing pages already contain a form; reach alone is not engagement. Default funnel bounds are completed UTC days, not an account-local comparison.
6. Inspect existing genuine conversion-source results through the read-only Ads Manager connection. HTTP acceptance, a Pixel queue call or a provider diagnostic is not an attributed customer inquiry. Do not manufacture an ad click to verify macros.

## Implemented reconciliation tolerances

These are the current values in `lead-reconciliation-core.mjs`, not a universal expected loss percentage:

- Per form, when D1 exceeds GA4: warn at D1 count at least 10 and GA4/D1 below 70%; smaller counts are informational. A GA4 surplus uses the symmetric count/ratio rule.
- Across all mapped forms: GA4 zero with at least three D1 inquiries is critical.
- Google Ads: warn on zero form-lead conversions only when spend is positive and at least three same-window Google-paid D1 leads exist. Google click IDs or a Google source plus paid medium provide that classification. ChatGPT paid traffic is excluded from this Google-specific comparison; all-channel paid summaries still include it.
- Unknown form mappings produce a coverage warning. Ads conversions exceeding GA4 are informational, not a rule that the two systems must form a strict subset.
- These thresholds are operational diagnostics. ChatGPT CPL comparisons still require the Ads program's evidence minimum and matched periods; zero conversions alone does not establish broken tracking.

## Offline checks for changes

Run the relevant tests rather than create live conversions:

```text
node --test openai-ads.test.mjs openai-capi.test.mjs
npm run lead:reconcile:test
node --test chatgpt-funnel.test.mjs used-alfa-laval-page.test.mjs
npm run build
wrangler deploy --config workers/contact-form/wrangler.toml --dry-run
```

The built-page tests require a current build. Browser tests assert actual `oaiq('measure', ...)` calls with shared saved IDs and suppression controls. CAPI tests mock provider transport and verify privacy, retry and database-failure behavior. Funnel tests exercise SQLite aggregation and the authenticated report handler. These are offline implementation evidence, not live paid-attribution proof.

For authorized deployments, use the protected repository's normal merge route, the exact Pages project and Worker config, and distinguish the merge commit, Pages deployment, Worker deployment and any migration. Never infer a production deployment from a local build alone.
