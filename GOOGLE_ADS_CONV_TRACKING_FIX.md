# Google Ads Conversion Tracking Fix - Independent Audit Packet

Created for Sanjay Prabhu / Dolphin Centrifuge.

Date of fix: 2026-06-26  
Google Ads account: `3917484159` (`Dolphin Marine`)  
MCC / login customer: `6124315358`  
Website repo: `C:\Users\Sanjay Prabhu\Documents\GitHub\dolphin-centrifuge-website`  
Production site: `https://dolphincentrifuge.com`

This file is the starting point for an independent third-party audit of the Google Ads conversion tracking repair. The purpose is not to rubber-stamp prior work. The purpose is to prove, with live Google Ads API readback and live website verification, whether the conversion tracking setup is now correct.

## Executive Summary

The prior warning in Google Ads was real. Conversion tracking had multiple legacy and stale items that could confuse the UI and, more importantly, the call tracking path was still incorrectly wired.

The fix completed on 2026-06-26 did three things:

1. Repaired Google Ads call conversion wiring.
2. Added explicit website phone-click tracking for `tel:` links.
3. Deployed and committed the website tracking code so the live site and GitHub source match.

The main conversion setup now intended for the active Search campaign is:

- Form leads: `7606109730`
  - Name: `Dolphin Centrifuge - Astro Website - 2026 (web) generate_lead`
  - Type: `GOOGLE_ANALYTICS_4_GENERATE_LEAD`
  - Category: `SUBMIT_LEAD_FORM`
  - Status expected: `ENABLED`
  - Expected role: primary, included in `Conversions`

- Calls from ads: `7653799094`
  - Name: `Calls from ads (Dolphin 2026)`
  - Type: `AD_CALL`
  - Category: `PHONE_CALL_LEAD`
  - Status expected: `ENABLED`
  - Expected role: primary, included in `Conversions`
  - Expected duration threshold: 60 seconds

- Website phone-number clicks: `7662833941`
  - Name: `Website phone number clicks (Dolphin 2026)`
  - Type: `CLICK_TO_CALL`
  - Category: `PHONE_CALL_LEAD`
  - Status expected: `ENABLED`
  - Expected role: secondary, not included in main `Conversions`
  - Reason: observe website phone-click intent first, without changing bidding until Sanjay explicitly approves.

The active campaign-level custom conversion goal is:

- Custom goal: `6453560730`
  - Name: `Lead forms + calls (Dolphin 2026)`
  - Expected conversion actions:
    - `customers/3917484159/conversionActions/7606109730`
    - `customers/3917484159/conversionActions/7653799094`

The active Search campaign is:

- Campaign: `302594281`
  - Name: `Search - Dolphin Centrifuge (new)`
  - Expected status: `ENABLED`
  - Expected goal configuration: campaign-level custom goal `6453560730`

## What Was Wrong Before This Fix

The adversarial audit on 2026-06-26 found this specific failure:

- Account-level call reporting still pointed to removed call action `249575421`.
- Active campaign call asset `49438597584` also pointed to removed call action `249575421`.
- The correct live call action `7653799094` existed, but the call reporting hook was not using it.
- The site had many `tel:+12485222573` links but no explicit website phone-click conversion tracking.

This meant:

- Lead form tracking was mostly repaired already, but needed continued reconciliation.
- Calls from Google Ads were not cleanly proven because the live asset was wired to an old removed conversion action.
- Website phone clicks were not being tracked separately.

## What Was Changed

### Google Ads API changes

The following live Google Ads changes were applied through API write helper `google-ads-write.mjs`:

- Customer call reporting was changed to:
  - `callReportingEnabled = true`
  - `callConversionReportingEnabled = true`
  - `callConversionAction = customers/3917484159/conversionActions/7653799094`

- Active call asset `49438597584` was changed to:
  - Phone number: `(248) 522-2573`
  - `callConversionReportingState = USE_RESOURCE_LEVEL_CALL_CONVERSION_ACTION`
  - `callConversionAction = customers/3917484159/conversionActions/7653799094`

- New secondary website phone-click conversion action was created:
  - Resource: `customers/3917484159/conversionActions/7662833941`
  - Name: `Website phone number clicks (Dolphin 2026)`
  - Type: `CLICK_TO_CALL`
  - Primary: `false`
  - Include in conversions metric: expected `false`

### Website changes

File changed:

`src/layouts/BaseLayout.astro`

This shared layout is used site-wide. It now:

- Loads Google Ads conversion destination `AW-1018317879` under the existing production tracking guard.
- Adds a site-wide `tel:` link click listener.
- Sends GA4 event `phone_call_click` for phone-number clicks.
- Sends Google Ads conversion event to:
  - `AW-1018317879/rg8WCJWi9sUcELeYyeUD`

Important: the production tracking guard still suppresses Google tracking on non-production hosts unless an explicit staging test parameter is used.

### Commit and deployment

Git commit:

`14164ac0 Fix Google Ads conversion tracking wiring`

Production deployment verified:

`https://785869ff.dolphin-centrifuge-website.pages.dev/contact-for-alfa-laval-centrifuges/`

The active deployment URL was verified to contain:

- `AW-1018317879/rg8WCJWi9sUcELeYyeUD`
- `phone_call_click`

## Independent Audit Instructions

Run this audit as three independent passes. Each pass should record evidence before seeing the other passes' conclusions.

Do not click a live Google ad. Do not create fake ad clicks. Do not mutate Google Ads settings during audit unless Sanjay gives explicit approval.

### Agent 1 - Google Ads account and campaign wiring

Goal: prove the Google Ads account, active campaign, custom goal, call asset, and conversion actions are wired correctly.

Run from repo root:

`C:\Users\Sanjay Prabhu\Documents\GitHub\dolphin-centrifuge-website`

Expected helper:

`google-ads-check.mjs`

Credentials are intentionally stored outside the repo under `%APPDATA%\gcloud`. Do not move credentials into the repo, Obsidian, GitHub, or chat.

#### 1. Confirm account-level call reporting

Command:

```powershell
node google-ads-check.mjs query --customer-id 3917484159 --sql "SELECT customer.id, customer.descriptive_name, customer.call_reporting_setting.call_reporting_enabled, customer.call_reporting_setting.call_conversion_reporting_enabled, customer.call_reporting_setting.call_conversion_action FROM customer" --json
```

Pass condition:

- `callReportingEnabled` is `true`
- `callConversionReportingEnabled` is `true`
- `callConversionAction` equals `customers/3917484159/conversionActions/7653799094`

Fail condition:

- Any call setting points to `249575421`
- Call conversion reporting is disabled
- Call conversion action is blank or different from `7653799094`

#### 2. Confirm active campaign call asset

Command:

```powershell
node google-ads-check.mjs query --customer-id 3917484159 --sql "SELECT campaign.id, campaign.name, campaign_asset.status, asset.id, asset.type, asset.call_asset.phone_number, asset.call_asset.call_conversion_action, asset.call_asset.call_conversion_reporting_state FROM campaign_asset WHERE campaign.id = 302594281 AND asset.type = CALL ORDER BY asset.id" --json
```

Pass condition:

- Campaign `302594281` is returned.
- Call asset `49438597584` is returned.
- `campaignAsset.status` is `ENABLED`.
- Phone number is `(248) 522-2573`.
- `callConversionReportingState` is `USE_RESOURCE_LEVEL_CALL_CONVERSION_ACTION`.
- `callConversionAction` equals `customers/3917484159/conversionActions/7653799094`.

Fail condition:

- Active call asset points to `249575421`.
- There is a different enabled call asset on campaign `302594281` that points to a stale conversion action.
- No enabled call asset is attached to active campaign `302594281`.

#### 3. Confirm active custom conversion goal

Command:

```powershell
node google-ads-check.mjs query --customer-id 3917484159 --sql "SELECT custom_conversion_goal.id, custom_conversion_goal.name, custom_conversion_goal.status, custom_conversion_goal.conversion_actions FROM custom_conversion_goal WHERE custom_conversion_goal.id = 6453560730" --json
```

Pass condition:

- Goal `6453560730` exists.
- Name is `Lead forms + calls (Dolphin 2026)`.
- Status is `ENABLED`.
- Conversion actions are exactly:
  - `customers/3917484159/conversionActions/7606109730`
  - `customers/3917484159/conversionActions/7653799094`

Fail condition:

- Goal includes removed codeless actions such as `6997640059`, `7002976285`, or `6607689265`.
- Goal omits `7606109730`.
- Goal omits `7653799094`.

#### 4. Confirm conversion action statuses

Command:

```powershell
node google-ads-check.mjs query --customer-id 3917484159 --sql "SELECT conversion_action.id, conversion_action.name, conversion_action.type, conversion_action.status, conversion_action.category, conversion_action.primary_for_goal, conversion_action.include_in_conversions_metric, conversion_action.phone_call_duration_seconds FROM conversion_action WHERE conversion_action.id IN (249575421,7606109730,7653799094,7662833941) ORDER BY conversion_action.id" --json
```

Pass condition:

- `249575421` is `REMOVED`.
- `7606109730` is `ENABLED`, primary, included in conversions.
- `7653799094` is `ENABLED`, primary, included in conversions, 60 second phone duration.
- `7662833941` is `ENABLED`, secondary, not included in conversions.

Important interpretation:

- `7662833941` being secondary is intentional.
- It should not be part of the active campaign custom goal yet.
- Promoting it to primary would change optimization behavior and requires Sanjay approval.

#### 5. Confirm active campaign goal binding

Use the API or Google Ads UI to verify campaign `302594281` uses campaign-level custom goal `6453560730`.

Pass condition:

- Active Search campaign uses custom goal `6453560730`.

Fail condition:

- Active Search campaign uses account-default goals instead of the custom goal.
- Active Search campaign points to another custom goal.

Note: some Google Ads API fields for campaign conversion goal config can be version-sensitive. If a GAQL field fails, verify in Google Ads UI under campaign settings and conversion goals.

### Agent 2 - Website tracking hook and deployment audit

Goal: prove the live website contains and serves the phone-click tracking code, and prove the source code matches the deployed behavior.

#### 1. Source code check

Inspect:

`src/layouts/BaseLayout.astro`

Pass condition:

The file contains:

- `googleAdsConversionId`
- `googleAdsPhoneClickSendTo`
- `AW-1018317879`
- `AW-1018317879/rg8WCJWi9sUcELeYyeUD`
- `dolphinTrackPhoneClick`
- `phone_call_click`
- A click listener for `a[href^="tel:"]`

Suggested command:

```powershell
rg -n "googleAdsConversionId|googleAdsPhoneClickSendTo|AW-1018317879|rg8WCJWi9sUcELeYyeUD|dolphinTrackPhoneClick|phone_call_click|a\\[href\\^=\"tel:\"\\]" src/layouts/BaseLayout.astro
```

#### 2. Build check

Command:

```powershell
npm run build
```

Pass condition:

- Build exits successfully.
- Astro builds the site without syntax errors.

#### 3. Built output check

Command:

```powershell
rg -n "AW-1018317879|rg8WCJWi9sUcELeYyeUD|phone_call_click|dolphinTrackPhoneClick" dist\contact-for-alfa-laval-centrifuges\index.html dist\index.html
```

Pass condition:

- Built HTML contains the Ads conversion ID.
- Built HTML contains the phone-click send-to label.
- Built HTML contains `phone_call_click`.
- Built HTML contains `dolphinTrackPhoneClick`.

#### 4. Live deployment check

Known verified deployment URL:

`https://785869ff.dolphin-centrifuge-website.pages.dev/contact-for-alfa-laval-centrifuges/`

Pass condition:

- Page loads with HTTP 200.
- HTML contains `AW-1018317879/rg8WCJWi9sUcELeYyeUD`.
- HTML contains `phone_call_click`.

Suggested command:

```powershell
$headers = @{ 'User-Agent'='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36'; 'Accept'='text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' }
$html = (Invoke-WebRequest -Uri 'https://785869ff.dolphin-centrifuge-website.pages.dev/contact-for-alfa-laval-centrifuges/' -Headers $headers -UseBasicParsing).Content
$html -match 'AW-1018317879/rg8WCJWi9sUcELeYyeUD'
$html -match 'phone_call_click'
```

Note:

The apex domain may return a Cloudflare 403 to automated shell requests from some environments. That does not by itself prove tracking failure. Use a normal browser or Cloudflare Pages deployment readback if shell requests are blocked.

#### 5. Browser/tag check

Use a browser-based tag debugger, not a live ad click.

Recommended safe checks:

- Google Tag Assistant on `https://dolphincentrifuge.com/contact-for-alfa-laval-centrifuges/`
- Browser DevTools network and console
- GA4 DebugView if debug mode is intentionally enabled for a test

Pass condition:

- Google tag loads on production host.
- Phone link click triggers a `conversion` event with send-to label `AW-1018317879/rg8WCJWi9sUcELeYyeUD`.
- Phone link click also pushes or sends `phone_call_click`.

Do not click a live Google ad to test this.

### Agent 3 - Reporting and reconciliation audit

Goal: prove form leads reconcile between first-party D1 and GA4 for stable windows, then monitor Google Ads reporting after normal lag.

#### 1. Stable-window reconciliation

Run a date window that excludes the most recent 48 hours.

Known post-fix stable check:

```powershell
node reconcile-leads.mjs --start 2026-06-18 --end 2026-06-24 --json
```

Expected result from the fix session:

- D1 contact leads: `3`
- GA4 `centrifuge_contact_form`: `3`
- Alerts: `[]`
- Ads form conversions: `1`
- Ads phone conversions: `0`

Pass condition:

- D1 and GA4 match by form type for the stable window.
- No reconciliation alerts.

Important:

- Google Ads can lag and may use click-date versus conversion-date reporting.
- A D1 or GA4 lead does not guarantee an Ads conversion unless the user had an eligible prior ad interaction.
- The first test after this fix should be viewed as a wiring check, not proof of future call volume.

#### 2. Verify all three real forms still fire lead tracking

Inspect these source files:

- `src/pages/contact-for-alfa-laval-centrifuges.astro`
- `src/pages/alfa-laval-centrifuge-parts.astro`
- `src/pages/disc-centrifuge-parts-glossary.astro`

Pass condition:

- Each form fires `dolphinTrackLead` or dispatches `dolphin:generate-lead` only after a successful Worker response.
- Lead event name remains `generate_lead`.
- Lead form identifiers are preserved:
  - `centrifuge_contact_form`
  - `parts_request_form`
  - `disc_parts_glossary_form`

#### 3. Monitor next real events

After the next real form lead:

- Confirm it appears in D1.
- Confirm it appears in GA4 as `generate_lead`.
- If there was a prior eligible ad click, confirm Google Ads receives it after reporting lag.

After the next real ad call:

- Confirm Google Ads call asset metrics show the call.
- Confirm call conversion only counts if it meets the 60 second threshold.
- Confirm call conversion action is `7653799094`.

After the next real website phone click:

- Confirm GA4 `phone_call_click` appears.
- Confirm Google Ads tag diagnostics or conversion diagnostics see activity for `7662833941`.
- Do not expect `7662833941` to influence bidding because it is intentionally secondary.

## What Would Count As Audit Failure

Treat any of these as a serious failure:

- Active call asset `49438597584` points back to `249575421`.
- Account-level call reporting points back to `249575421`.
- Custom goal `6453560730` no longer contains both `7606109730` and `7653799094`.
- Custom goal `6453560730` contains old removed page-load actions again.
- Active campaign `302594281` no longer uses custom goal `6453560730`.
- Website no longer contains `AW-1018317879/rg8WCJWi9sUcELeYyeUD`.
- Website no longer contains `phone_call_click`.
- D1 and GA4 form leads diverge in a stable window with no obvious explanation.
- Google Ads UI shows warnings tied to the active campaign goal or active conversion actions, not just stale account-default/historical cards.

## UI Warning Interpretation

Google Ads overview cards can be confusing because they may show account-default goal groups and historical or inactive conversion actions. Do not rely only on the overview card.

Priority order for truth:

1. Active campaign `302594281` goal configuration.
2. Custom goal `6453560730` contents.
3. Conversion action statuses for `7606109730`, `7653799094`, and `7662833941`.
4. Active call asset `49438597584` conversion action.
5. Website source and live deployment code.
6. Stable reconciliation reports.
7. Google Ads UI cards as a final usability check.

If a UI card says `Needs attention`, identify the exact conversion action causing it. Do not assume the active campaign is broken until the IDs above have been checked.

## Fake Clicks and Safe Testing

Do not test by clicking a live Google ad. That can create spend and pollute data.

Google Ads does not provide a normal, free fake paid-click path that fully simulates a charged ad click and downstream conversion attribution. Safer options:

- Use Google Tag Assistant to verify tag firing.
- Use Google Ads tag diagnostics.
- Use GA4 DebugView for GA4 events when appropriate.
- Use Google Ads Ad Preview and Diagnosis to inspect ad appearance without clicking.
- Use direct production page visits to verify JavaScript events, understanding that without an eligible prior ad click, Google Ads may not attribute a conversion.
- Use real business events and reconcile after normal reporting lag.

Official docs for auditors:

- Google Ads API conversion action categories:
  `https://developers.google.com/google-ads/api/docs/conversions/categories`
- Track clicks on your website as conversions:
  `https://support.google.com/google-ads/answer/6331304`
- Use the Google tag for Google Ads conversion tracking:
  `https://support.google.com/google-ads/answer/7548399`

## Repo Files Auditors Should Read

Start here:

`GOOGLE_ADS_CONV_TRACKING_FIX.md`

Then inspect:

- `src/layouts/BaseLayout.astro`
- `google-ads-check.mjs`
- `google-ads-write.mjs`
- `reconcile-leads.mjs`
- `CONVERSION_TRACKING_VERIFICATION.md`

Related durable note:

`C:\Users\Sanjay Prabhu\Documents\Obsidian\Dolphin Brain\02 Projects\Dolphin Stats Dashboard.md`

Relevant section:

`Conversion tracking correction (2026-06-25)` and `Applied fixes (2026-06-26, Codex)`.

## Final Auditor Output Requested

Each independent auditor should return:

1. Evidence collected.
2. Pass/fail on Google Ads account wiring.
3. Pass/fail on active campaign custom goal.
4. Pass/fail on call asset wiring.
5. Pass/fail on website phone-click tracking.
6. Pass/fail on stable D1 versus GA4 reconciliation.
7. Any remaining Google Ads UI warnings, with exact conversion action IDs causing them.
8. Clear recommendation:
   - `PASS - tracking wiring confirmed`
   - `PASS WITH WATCH ITEM - wiring confirmed but reporting lag/event volume pending`
   - `FAIL - correction needed`

No auditor should mark this 100 percent proven by UI screenshots alone. The pass must be based on ID-level readback and live site/source verification.
