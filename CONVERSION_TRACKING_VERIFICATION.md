# Conversion-Tracking Verification Runbook — for an INDEPENDENT agent

**Purpose:** a zero-context agent runs this to independently confirm Dolphin's lead/conversion
tracking reconciles across all systems, and that the 2026-06-18/19 fixes are live.
**Mode:** READ-ONLY. Do not mutate anything. **API-first:** use the helper scripts/CLI, never UIs.
**Repo root:** `C:\Users\Sanjay Prabhu\Documents\GitHub\dolphin-centrifuge-website`
**Creds:** outside the repo — Google in `%APPDATA%\gcloud`, Cloudflare via `wrangler` (already authed).
**Window for this run:** 2026-06-05 → 2026-06-19 (last 14 days). Adjust on re-run.

## Systems + IDs
| System | What it holds | How to read it |
|---|---|---|
| **Website D1** | the SOURCE OF TRUTH for form leads | `wrangler d1 execute dolphin-submissions` (db id `a5396fba-3578-4d7b-a802-8bcce711b77b`) |
| **GA4** | events incl. `generate_lead` | `ga4-check.mjs` (property `536974508`, stream `G-9DCDDZTT9N`) |
| **Google Ads** | conversions | `google-ads-check.mjs` (account `3917484159` / MCC `6124315358`) |
| **StatCounter** | paid-traffic corroboration | browser, logged in, project `9162316` |
| **Phone** | calls | Ads AD_CALL action + (future) Talkroute API |

---

## Check 1 — Ads conversion actions are configured correctly (the fixes)
```
node google-ads-check.mjs query --customer-id 3917484159 --sql "SELECT conversion_action.id, conversion_action.name, conversion_action.type, conversion_action.status, conversion_action.category, conversion_action.primary_for_goal, conversion_action.include_in_conversions_metric FROM conversion_action WHERE conversion_action.status != 'REMOVED' ORDER BY conversion_action.type" --json
```
**PASS if:**
- `7606109730` generate_lead → ENABLED, primary=true, include=true, category **SUBMIT_LEAD_FORM**
- `7653799094` Calls from ads → AD_CALL, ENABLED, primary=true, include=true, category **PHONE_CALL_LEAD**
- `7002976285` Contact Page Load → primary=false (secondary), not counting
**FAIL if** generate_lead or Calls-from-ads is HIDDEN / secondary / not included.

## Check 2 — Account goals are biddable for the lead categories
```
node google-ads-check.mjs query --customer-id 3917484159 --sql "SELECT customer_conversion_goal.category, customer_conversion_goal.biddable FROM customer_conversion_goal" --json
```
**PASS if** `SUBMIT_LEAD_FORM` and `PHONE_CALL_LEAD` biddable=true; `PAGE_VIEW`/`CONTACT` not biddable.

## Check 3 — Ads conversions are starting to register (forward-looking)
```
node google-ads-check.mjs query --customer-id 3917484159 --sql "SELECT segments.conversion_action_name, metrics.conversions, metrics.all_conversions FROM campaign WHERE segments.date DURING LAST_14_DAYS AND metrics.all_conversions > 0" --json
```
generate_lead + Calls-from-ads only accrue data AFTER 2026-06-18/19. Expect page-view junk to taper and these to appear. Not a hard FAIL early — record what's accruing.

## Check 4 — GA4 `generate_lead` is firing
```
node ga4-check.mjs report --dimensions "eventName" --metrics "eventCount" --filter "eventName=generate_lead" --start 2026-06-05 --end 2026-06-19 --json
node ga4-check.mjs report --dimensions "sessionDefaultChannelGroup" --metrics "keyEvents" --start 2026-06-05 --end 2026-06-19 --json
```
**PASS if** generate_lead eventCount > 0, and key events break down by channel (Paid Search included).

## Check 5 — Website D1 (source of truth for form leads)
```
cd workers/contact-form
wrangler d1 execute dolphin-submissions --remote --json --command "SELECT COUNT(*) AS active_leads FROM submissions WHERE deleted=0"
wrangler d1 execute dolphin-submissions --remote --json --command "SELECT COUNT(*) AS last14 FROM submissions WHERE deleted=0 AND created_at >= '2026-06-05'"
wrangler d1 execute dolphin-submissions --remote --json --command "SELECT COUNT(*) AS visitors FROM visitor_profiles"
wrangler d1 execute dolphin-submissions --remote --json --command "SELECT COUNT(*) AS events FROM visitor_events"
```
**PASS if** the table is reachable, counts plausible, and `visitor_events` > 0 (first-party tracking alive).

## Check 6 — THE RECONCILIATION (the real test)
Over the same window compute three numbers:
- `N_d1` = D1 form submissions (deleted=0) in window [Check 5]
- `N_ga4` = GA4 generate_lead eventCount in window [Check 4]
- `N_ads` = Ads generate_lead conversions in window [Check 3]

**Expected:** `N_ga4 ≈ N_d1` (every form submit should fire generate_lead; GA4 may undercount ~10–30% from consent/adblock/bots — a small gap is OK). `N_ads ≤ N_ga4` (Ads counts only the ad-attributed subset).

**RED FLAG (tracking broken again):** D1 has many new submissions but `N_ga4 ≈ 0` → the site's `generate_lead` stopped firing → investigate `BaseLayout.astro` `dolphinTrackLead` + the form success handlers.

## Check 7 — The site actually fires the events (code)
```
grep -rn "dolphinTrackLead" src/
```
**PASS if** defined in `src/layouts/BaseLayout.astro` and called on submit-success in `contact-for-alfa-laval-centrifuges.astro` + the two parts pages (committed/live).

## Check 8 — StatCounter (traffic corroboration only)
Log into StatCounter project `9162316` → Recent Activity → Keyword Activity → confirm paid visits carry `vt_keyword=` + "Ad Details", landing on the form pages.
**Note:** StatCounter sees TRAFFIC, not form-submit conversions — it corroborates paid clicks, not lead counts.

## Phone calls
- Ads side is covered by Check 1 (Calls-from-ads AD_CALL, primary, counting, 60s min).
- The CALL TRUTH source is the phone system (**Talkroute**). Once the Talkroute API is wired (see plan), reconcile Talkroute inbound calls ≥60s against the Ads "Calls from ads" conversions, and match caller numbers to `visitor_profiles` where possible.

## Overall verdict
**PASS** = Checks 1, 2, 4, 5, 7 pass AND Check 6 reconciles (`N_ga4 ≈ N_d1`, `N_ads ≤ N_ga4`).
Forward-looking: within ~1–2 weeks of the 2026-06-18/19 fixes, Ads conversions (Check 3) should show generate_lead + Calls-from-ads accruing real leads, not page views.

---
*Context for the verifier:* the 2026-06-18/19 fixes — (a) enabled GA4 `generate_lead` (was HIDDEN) as primary; (b) created the AD_CALL "Calls from ads" action (the old one was REMOVED); the old "conversions" were codeless page-load actions broken by the WordPress→Astro migration (which is why Ads showed ~97 "conversions" vs ~1 real GA4 lead). Full detail in the Dolphin Brain `01 Operating Rules/Agent Coordination.md` and memory `google-ads-account.md`.
