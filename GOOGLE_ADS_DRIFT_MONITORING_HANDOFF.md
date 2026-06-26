# Google Ads / GA4 / D1 Lead Drift Monitoring Handoff

Last updated: 2026-06-26

Purpose: give the main dashboard, Google Ads, and Google Analytics agents one consolidated handoff for the lead drift monitor work done in this session, so this effort can be merged into the broader dashboard/ads/analytics project without duplicated or conflicting work.

## Executive Summary

This session turned `reconcile-leads.mjs` from a local-only reconciliation script into the base of a cloud-ready daily drift monitor.

The monitor compares:

- D1 form submissions, which remain the source of truth for real website form leads.
- GA4 `generate_lead` events, grouped by `customEvent:lead_form`.
- Google Ads conversions, grouped by `segments.conversion_action_name`.

It is designed to warn early if:

- D1 has real leads but GA4 `generate_lead` goes silent.
- GA4 materially exceeds D1, suggesting phantom lead events or D1 write trouble.
- D1 materially exceeds GA4 beyond the normal undercount band.
- Google Ads form conversions exceed GA4 form leads, suggesting Ads conversion drift or page-view junk counting again.
- A new D1 `form_type` or GA4 `lead_form` appears without being mapped.

The work is implemented locally and bundles successfully, but it is not live yet.

## Current Activation State

Implemented locally:

- Shared monitor rules: `lead-reconciliation-core.mjs`
- Local diagnostic wrapper: `reconcile-leads.mjs`
- Cloudflare Worker cron and manual admin route: `workers/contact-form/index.js`
- Worker cron/default config: `workers/contact-form/wrangler.toml`
- Test file: `lead-reconciliation-core.test.mjs`
- npm shortcuts: `package.json`
- Runbook update: `CONVERSION_TRACKING_VERIFICATION.md`

Not activated live:

- The Worker currently has only these secrets:
  - `ADMIN_PASSWORD`
  - `RESEND_API_KEY`
- The Worker still needs Google read-only secrets before the cloud monitor can run:
  - `GOOGLE_OAUTH_CLIENT_ID`
  - `GOOGLE_OAUTH_CLIENT_SECRET`
  - `GA4_REFRESH_TOKEN`
  - `GOOGLE_ADS_REFRESH_TOKEN`
  - `GOOGLE_ADS_DEVELOPER_TOKEN`
- The repo worktree also contains unrelated active dashboard and phone-lead ingestion edits. Do not deploy the Worker blindly from the dirty working tree unless those changes are intentionally included.

## Files Changed Or Added For This Monitor

### `lead-reconciliation-core.mjs`

New shared, Worker-safe reconciliation module.

Important exports:

- `DEFAULT_GA4_PROPERTY_ID = "536974508"`
- `DEFAULT_ADS_CUSTOMER_ID = "3917484159"`
- `DEFAULT_ADS_LOGIN_CUSTOMER_ID = "6124315358"`
- `FORM_TYPES`
- `ADS_FORM_LEAD_ACTIONS`
- `ADS_PHONE_LEAD_ACTIONS`
- `D1_TEST_EXCLUSION_SQL`
- `buildLeadMonitorWindow`
- `reconcileLeadSources`
- `leadReconciliationVerdict`
- `formatLeadReconciliationText`

Key design details:

- No Node-only imports. This file can be used by both local Node scripts and Cloudflare Worker code.
- `FORM_TYPES` maps the same lead across D1 and GA4:
  - `contact`: D1 `contact` to GA4 `centrifuge_contact_form`
  - `parts`: D1 `parts_request_form` to GA4 `parts_request_form`
  - `disc-glossary`: D1 `disc_parts_glossary_form` to GA4 `disc_parts_glossary_form`
- Ads form conversions are detected by conversion action names matching `/generate[_ ]?lead/i`.
- Ads phone conversions are detected by conversion action names matching `/calls from ads/i`.
- D1 excludes precise known test markers:
  - `@example.com`
  - `@example.org`
  - `@example.net`
  - `codex` in email, first name, or last name
- It does not exclude a broad `%test%` pattern, because that can drop real names or companies.
- Date input is validated as `YYYY-MM-DD`.
- Default comparison window supports complete-day monitoring by ending one day before today.

Alert logic:

- `CRITICAL`: a mapped D1 form type has at least `minAbs` leads and GA4 has zero for that form.
- `WARN`: one real D1 lead and zero GA4 lead for that form, but below `minAbs`.
- `WARN`: GA4 is materially greater than D1 beyond tolerance and absolute threshold.
- `WARN`: D1 is materially greater than GA4 beyond tolerance and absolute threshold.
- `WARN`: Ads form conversions exceed GA4 form leads by at least `minAbs`.
- `WARN`: unmapped D1 form type or unmapped GA4 `lead_form` appears with volume.

Default thresholds:

- `undercountTolerance`: `0.30`
- `minAbs`: `2`

### `reconcile-leads.mjs`

Converted into a local diagnostic wrapper around `lead-reconciliation-core.mjs`.

It still reads the same sources as before:

- D1 via `npx wrangler d1 execute dolphin-submissions --remote --json`
- GA4 via `ga4-check.mjs`
- Google Ads via `google-ads-check.mjs`

It remains read-only.

Supported usage:

```bash
node reconcile-leads.mjs
node reconcile-leads.mjs --json
node reconcile-leads.mjs --complete-days
node reconcile-leads.mjs --start 2026-06-12 --end 2026-06-25 --json
node reconcile-leads.mjs --days 14 --complete-days
node reconcile-leads.mjs --undercount-tolerance 0.30 --min-abs 2
```

Exit codes:

- `0`: OK
- `1`: WARN
- `2`: CRITICAL
- `3`: command or source failure

### `workers/contact-form/index.js`

Added the cloud-monitor path to the existing Cloudflare Worker.

New route:

```text
GET /admin/lead-monitor
```

Authentication:

- Uses the same dashboard bearer token logic as the other admin routes.
- Unauthenticated callers get `401`.

Manual route behavior:

- By default, it runs a read-only check and returns JSON.
- It does not send email unless `?send=1` is provided.
- `?force=1` can force an email from a manual run, useful for final smoke testing after secrets are present.

Supported query parameters:

- `start=YYYY-MM-DD`
- `end=YYYY-MM-DD`
- `days=N`
- `end_offset_days=N`
- `endOffsetDays=N`
- `undercount_tolerance=0.30`
- `undercountTolerance=0.30`
- `min_abs=2`
- `minAbs=2`
- `send=1`
- `force=1`

Scheduled behavior:

- Adds `scheduled(controller, env, ctx)`.
- Calls `handleScheduledLeadMonitor`.
- Scheduled runs use `sendAlert: true`.
- If status is OK, no email is sent.
- If WARN or CRITICAL, a Resend email is sent.
- If the monitor itself fails, a Resend failure email is sent.

Worker source reads:

- D1 directly through the existing `env.DB` binding.
- GA4 through Analytics Data API `runReport`.
- Google Ads through Google Ads API `googleAds:searchStream`.

Google auth behavior:

- Refreshes access tokens from Worker secrets.
- Supports shared OAuth client secrets:
  - `GOOGLE_OAUTH_CLIENT_ID`
  - `GOOGLE_OAUTH_CLIENT_SECRET`
- Also supports source-specific overrides:
  - `GA4_CLIENT_ID`
  - `GA4_CLIENT_SECRET`
  - `GOOGLE_ADS_CLIENT_ID`
  - `GOOGLE_ADS_CLIENT_SECRET`
- Token URI can be overridden with:
  - `GOOGLE_OAUTH_TOKEN_URI`
  - `GA4_TOKEN_URI`
  - `GOOGLE_ADS_TOKEN_URI`

Email behavior:

- Uses existing `RESEND_API_KEY`.
- Sender:
  - `Dolphin Lead Monitor <noreply@dolphincentrifuge.com>`
- Default recipient:
  - `sales@dolphincentrifuge.com`
- Can be changed by Worker var:
  - `LEAD_MONITOR_ALERT_TO`
- Multiple recipients can be comma or semicolon separated.

Read-only boundary:

- The monitor does not mutate D1.
- The monitor does not mutate GA4.
- The monitor does not mutate Google Ads.
- The monitor does not mutate Cloudflare settings.
- The monitor does not mutate the site.
- The only write path is an alert email through Resend.

### `workers/contact-form/wrangler.toml`

Added a daily cron and non-secret defaults.

Cron:

```toml
[triggers]
crons = ["30 14 * * *"]
```

Meaning:

- Runs daily at 14:30 UTC.
- This was chosen to let the prior day's GA4 and Ads data settle.

Vars:

```toml
[vars]
GA4_PROPERTY_ID = "536974508"
GOOGLE_ADS_CUSTOMER_ID = "3917484159"
GOOGLE_ADS_LOGIN_CUSTOMER_ID = "6124315358"
GOOGLE_ADS_API_VERSION = "v24"
LEAD_MONITOR_DAYS = "14"
LEAD_MONITOR_END_OFFSET_DAYS = "1"
LEAD_MONITOR_UNDERCOUNT_TOLERANCE = "0.30"
LEAD_MONITOR_MIN_ABS = "2"
LEAD_MONITOR_ALERT_TO = "sales@dolphincentrifuge.com"
```

Documented required secrets:

```text
GOOGLE_OAUTH_CLIENT_ID
GOOGLE_OAUTH_CLIENT_SECRET
GA4_REFRESH_TOKEN
GOOGLE_ADS_REFRESH_TOKEN
GOOGLE_ADS_DEVELOPER_TOKEN
```

### `lead-reconciliation-core.test.mjs`

New focused tests for the shared logic.

Tests cover:

- Complete-day window building.
- Critical alert when D1 has sustained leads and GA4 is silent.
- Warn alert when Ads form conversions exceed GA4 form leads.

Run:

```bash
npm run lead:reconcile:test
```

### `package.json`

Added shortcuts:

```json
"lead:reconcile": "node reconcile-leads.mjs",
"lead:reconcile:json": "node reconcile-leads.mjs --json",
"lead:reconcile:complete": "node reconcile-leads.mjs --complete-days",
"lead:reconcile:test": "node --test lead-reconciliation-core.test.mjs"
```

### `CONVERSION_TRACKING_VERIFICATION.md`

Added an "Always-on cloud monitor" section.

It records:

- Shared rules live in `lead-reconciliation-core.mjs`.
- Cloud schedule lives in `workers/contact-form/wrangler.toml`.
- Manual admin route is `GET /admin/lead-monitor`.
- Manual dry run is default.
- `?send=1` sends an alert only if WARN or CRITICAL exists.
- Required Worker secrets.
- Read-only boundary.

## Live Read-Only Reconciliation Result From This Session

Command run:

```bash
node reconcile-leads.mjs --complete-days --json
```

Window:

```text
2026-06-12 through 2026-06-25
```

Source counts:

```json
{
  "d1": {
    "contact": 8
  },
  "ga4": {
    "centrifuge_contact_form": 6,
    "parts_request_form": 1
  },
  "ads": {
    "Dolphin Centrifuge - Astro Website - 2026 (web) generate_lead": 1
  }
}
```

Mapped totals:

```text
D1 form leads: 8
GA4 generate_lead events: 7
Ads form conversions: 1
Ads phone conversions: 0
Alerts: none
```

Interpretation:

- For this window, D1, GA4, and Ads reconcile within the configured tolerance.
- D1 remains the form-lead truth.
- GA4 is within the acceptable undercount band.
- Ads form conversions are below GA4 leads, which is expected because Ads should count only the ad-attributed subset.

## Verification Already Completed

Passed:

```bash
node --check lead-reconciliation-core.mjs
node --check reconcile-leads.mjs
node --check workers/contact-form/index.js
npm run lead:reconcile:test
npm run build
npx wrangler deploy --dry-run
git diff --check
node reconcile-leads.mjs --complete-days --json
```

Important detail:

- `npx wrangler deploy --dry-run` confirmed the Worker bundles with the new cron and non-secret monitor vars.
- It did not deploy anything.

## Why This Was Not Deployed

Do not treat this as a failure. It was intentionally not deployed.

Reasons:

1. The required Google read-only Worker secrets are not present yet.
2. `npx wrangler secret list` showed only:
   - `ADMIN_PASSWORD`
   - `RESEND_API_KEY`
3. The repo worktree currently includes unrelated active changes, including:
   - phone lead ingestion work
   - dashboard changes
   - Google Ads helper edits
   - schema additions for calls
4. Deploying the Worker from the dirty tree would ship more than the drift monitor.

Recommended activation path:

1. Merge or isolate the broader dashboard, phone-lead, and monitoring changes intentionally.
2. Set the required Google read-only Worker secrets.
3. Run Worker dry-run again.
4. Run the local reconciliation wrapper again.
5. Deploy the Worker only from an intentionally scoped tree.
6. Run `GET /admin/lead-monitor` manually.
7. Run `GET /admin/lead-monitor?send=1&force=1` once to verify the email channel.
8. Let the cron run daily after that.

## Required Worker Secrets

Set these with `wrangler secret put` from `workers/contact-form`.

```bash
npx wrangler secret put GOOGLE_OAUTH_CLIENT_ID
npx wrangler secret put GOOGLE_OAUTH_CLIENT_SECRET
npx wrangler secret put GA4_REFRESH_TOKEN
npx wrangler secret put GOOGLE_ADS_REFRESH_TOKEN
npx wrangler secret put GOOGLE_ADS_DEVELOPER_TOKEN
```

Do not store secret values in:

- this repo
- Obsidian
- GitHub
- chat
- markdown handoff files

Existing local helper credentials are under `%APPDATA%\gcloud`, outside the repo. Those are useful for local diagnostics but do not automatically give the Cloudflare Worker the same secrets.

## Manual Admin Route Expected Response

Example:

```text
GET /admin/lead-monitor
Authorization: Bearer <dashboard password>
```

Expected JSON shape:

```json
{
  "success": true,
  "skipped": false,
  "readOnly": true,
  "alertSent": false,
  "source": "manual",
  "window": {
    "start": "YYYY-MM-DD",
    "end": "YYYY-MM-DD"
  },
  "verdict": {
    "critical": 0,
    "warn": 0,
    "status": "OK"
  },
  "sources": {
    "d1": {},
    "ga4": {},
    "ads": {}
  },
  "report": {
    "perType": [],
    "totals": {},
    "alerts": []
  }
}
```

If secrets are missing, expected shape:

```json
{
  "success": false,
  "skipped": true,
  "reason": "missing required Worker secrets or bindings",
  "missing": [],
  "readOnly": true,
  "alertSent": false
}
```

## How This Should Fit The Main Dashboard Effort

This monitor is a detector and alert path, not the whole dashboard.

It should feed into the broader dashboard effort as:

- A daily "tracking health" card.
- A last-run status row.
- A list of current drift alerts.
- A link to the raw monitor JSON or latest run output.
- A warning source for `generate_lead` failure before Ads spend silently continues.

Recommended dashboard labels:

- D1 form leads
- GA4 `generate_lead`
- Ads form conversions
- Ads call conversions
- Drift status
- Last checked
- Alerts

Do not blur the source-of-truth roles:

- D1 is the truth for website form leads.
- GA4 is event telemetry and can undercount.
- Google Ads should be a subset of GA4 for form leads.
- Ads `Calls from ads` is a phone-ad signal, not the full phone-lead truth.
- Talkroute or Gmail voicemail ingestion is the future phone-truth path and is handled by the separate phone-lead ingestion work.

## Relationship To Phone Lead Ingestion

A separate file now exists:

```text
phone_lead_ingestion.md
```

That lane covers:

- Talkroute voicemail Gmail reads
- call records
- `/admin/calls`
- `/admin/calls/ingest`
- call matching to submissions or visitor profiles
- phone lead dashboard view

This drift monitor only reports Ads phone conversions as an Ads-side count.

Do not make this monitor responsible for deciding true phone leads until the Talkroute source is fully integrated and approved as the phone truth source.

Future integration idea:

- Add Talkroute call count to the monitor as a fourth source.
- Compare Talkroute calls over threshold duration against Ads `Calls from ads`.
- Keep that as a separate phone reconciliation section, not as part of form lead reconciliation.

## Relationship To Visitor Click Tracking

The visitor-event-circle work and the tel/mail click listener issue were handled separately.

Important facts for the main agents:

- A bug was found where the tel/mail click listener IIFE was not invoked.
- The one-token fix was released separately at commit `425623f4a433799c0a42b60e48e4dfdcea601ef6`.
- That fix affects website phone click tracking and GA4/Ads click events.
- The drift monitor described here is separate from that fix.
- The monitor can help detect future drift, but it does not itself fix client-side click tracking.

## Known Risks And Edges

GA4 and Ads reporting lag:

- The cloud cron uses a complete-day window ending one day before the run date.
- This reduces false alarms from late-arriving GA4 or Ads data.

Low volume:

- Dolphin lead volume is small.
- One missing event can matter, but a single-lead mismatch should not always be treated as a system outage.
- Current logic uses WARN for one D1 lead with zero GA4 and CRITICAL when the D1 count reaches `minAbs`.

Consent, blockers, and bots:

- GA4 can undercount due to consent, blockers, or browser behavior.
- D1 is still the form lead truth.
- The default undercount tolerance is 30 percent.

Ads conversion drift:

- If Ads form conversions exceed GA4 `generate_lead`, treat that as suspicious.
- That pattern is exactly what could happen if page-view or codeless conversion actions start counting again.

New form coverage:

- If a new form ships with a new D1 `form_type` or GA4 `lead_form`, this monitor will warn that it is unmapped.
- Main agents should update `FORM_TYPES` in `lead-reconciliation-core.mjs` when new lead forms are added.

Dirty worktree:

- The current worktree includes unrelated changes.
- Main agents should isolate, review, or intentionally merge lanes before committing or deploying.

## Suggested Next Steps For Main Agents

1. Review `lead-reconciliation-core.mjs` first. This is the core logic.
2. Review the Worker route and scheduled handler in `workers/contact-form/index.js`.
3. Decide whether the monitor should remain inside the contact-form Worker or move into a separate monitoring Worker later.
4. Coordinate with phone-lead ingestion before deploying the Worker, because those edits are currently in the same Worker file.
5. Set Google read-only Worker secrets.
6. Run manual `/admin/lead-monitor` and confirm JSON output.
7. Send one forced test email with `?send=1&force=1`.
8. Deploy the Worker only after the full dashboard and phone-lead changes are intentionally scoped.
9. Add a "Lead Tracking Health" section to the main dashboard using the same labels and source roles above.
10. Keep the local `reconcile-leads.mjs` wrapper as a fast diagnostic tool for audits and future debugging.

## Short Copy-Paste Handoff

The lead drift monitor is implemented locally but not live. Shared rules are in `lead-reconciliation-core.mjs`; local diagnostics run through `reconcile-leads.mjs`; the Worker has `/admin/lead-monitor` plus a daily cron in `wrangler.toml`. It compares D1 form leads, GA4 `generate_lead`, and Ads conversions, then emails via Resend only on WARN/CRITICAL or monitor failure. Live read-only check for 2026-06-12..2026-06-25 was clean: D1 8, GA4 7, Ads 1, no alerts. Activation needs Worker Google secrets and an intentional deploy from a scoped worktree, because current local Worker files also include phone/dashboard work.
