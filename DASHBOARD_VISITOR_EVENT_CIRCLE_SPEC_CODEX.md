# Spec: Close the Visitor Event Circle on the Dashboard

Author: Claude (planning doc, NOT a site implementation file - same class as `EXEC_REVIEW_8POINT_BRIEF.md`).
Date: 2026-06-26.
Owner to implement: Codex (website repo + Worker + D1 + dashboard is Codex's lane).
Auditor after: Claude.

## Goal (Sanjay's ask)

Every visitor intent signal must land in the first-party tracking dashboard, connected to ONE visitor:
pageview -> phone click (click-to-call) -> email click (mailto) -> form submit -> (and the Google Ads
origin). "Connect the dots" = a single per-visitor activity timeline. Today phone clicks go ONLY to
Google/GA4, mailto clicks are untracked, and the dashboard has no per-visitor event timeline.

## Current state (verified 2026-06-26, read-only architecture map)

Already connected (the circle is half-built):
- Visitor identity: `dc_vid` cookie + `dolphin_visitor_v1` localStorage; session `dolphin_attribution_v1`.
- Pageviews: client POSTs to `TRACKER_URL/track/pageview` (Worker `dolphin-contact-form`), which writes
  `visitor_events` (event_type='pageview') + upserts `visitor_profiles` (IP/geo/UA/counts).
- Form submits: stored in `submissions` with `attribution_visitor_id` linking to the same visitor;
  identity enrichment (`updateVisitorIdentityFromSubmission`) fills contact name/email/phone on the profile.
- Google Ads origin already captured per visitor: `gclid`/`gbraid`/`wbraid`/source/medium are in the
  pageview attribution and on the profile.

NOT connected (the gap):
- Phone clicks (`BaseLayout.astro` ~lines 588-661): fire `gtag` GA4 `phone_call_click` + the Ads conversion
  ONLY. No first-party POST to the Worker. Nothing in D1.
- Email (`mailto:`) clicks: no listener at all (only `a[href^="tel:"]` is handled).
- Dashboard (`src/pages/admin/submissions.astro`): renders form submissions + a profile/attribution panel
  + a "visit trail" derived from `attribution.pages` embedded in the submission - it does NOT read or
  render individual `visitor_events` rows. There is no per-visitor activity timeline UI.

Key good news: **NO D1 migration needed.** `visitor_events.event_type` already exists (TEXT, only ever
'pageview' so far). We just write new event_type values and store click target in `attribution_json`.

## Design

### 1. Client - `src/layouts/BaseLayout.astro`

a) Phone click (extend existing handler ~lines 610-661): in addition to the existing GA4 + Ads fire, send
   a first-party event. Mirror exactly how pageviews are sent (same TRACKER_URL, same visitor_id/session_id
   from the attribution profile). Use `navigator.sendBeacon` because a `tel:` click can navigate/blur:
   ```js
   function dolphinTrackFirstPartyEvent(eventType, target, linkText) {
     try {
       const prof = /* same visitor profile used by pageview: visitor_id, session_id */;
       const body = JSON.stringify({
         event_type: eventType,              // 'phone_click' | 'email_click'
         target: target,                     // '+12485222573' or 'sales@dolphincentrifuge.com'
         link_text: linkText,
         page: { at: new Date().toISOString(), path: currentPath(), title: document.title },
         attribution: { visitor_id: prof.visitorId, session_id: prof.sessionId }
       });
       const url = TRACKER_URL + '/track/event';
       if (navigator.sendBeacon) navigator.sendBeacon(url, new Blob([body], {type:'application/json'}));
       else fetch(url, { method:'POST', body, keepalive:true, headers:{'Content-Type':'application/json'} });
     } catch (e) { /* never block navigation */ }
   }
   ```
   Call it inside the existing `tel:` handler alongside the GA4 fire.

b) Email click: add a sibling delegated listener for `a[href^="mailto:"]` that calls
   `dolphinTrackFirstPartyEvent('email_click', emailFromHref, linkText)` and (optional) a GA4
   `email_click` event for parity. Strip the `mailto:` prefix and any `?subject=` query for `target`.

c) Gating: first-party event tracking must follow the SAME host rule as the existing `/track/pageview`
   call (first-party tracker, independent of the Google prod-host guard). Do NOT put it behind the
   `googleTagBootstrap` Google-only guard. Confirm pageview gating and match it so localhost/preview
   don't pollute D1 (if pageviews are sent everywhere today, events should match that exact behavior).

### 2. Worker - `workers/contact-form/index.js`

a) New route `POST /track/event` (sibling of `/track/pageview`, ~line 60 routing + new handler):
   - Parse `{ event_type, target, link_text, page, attribution }`.
   - WHITELIST event_type to `['phone_click','email_click']` (reject/ignore others, and never accept
     'pageview' here to avoid double counting).
   - Capture CF IP/geo/UA exactly like `handlePageview` (`CF-Connecting-IP`, `cf.country/region/city`, UA).
   - INSERT into `visitor_events` reusing the pageview insert: set `event_type` to the whitelisted value,
     `page_path`/`page_title` from `page`, `visitor_id`/`session_id` from attribution, IP/geo columns from
     CF. Store the click target + link text in `attribution_json` as `{"target":...,"link_text":...}`
     (no schema change). Leave source/medium/campaign blank or copy from profile if cheaply available.
   - Upsert `visitor_profiles.last_seen_at` (so a click keeps the visitor "fresh"); do NOT increment
     `pageview_count`. Optional: add a generic `event_count` only if you want it (would need a column -
     skip for v1 to avoid migration).
   - Return 204. Keep it cheap and fire-and-forget friendly (sendBeacon ignores the response).

b) New route `GET /admin/visitors/:visitorId/events` (same admin auth as the other `/admin/*` routes):
   - `SELECT created_at, event_type, page_path, page_title, attribution_json FROM visitor_events
      WHERE visitor_id = ? ORDER BY created_at ASC LIMIT 500`.
   - Return the rows; the dashboard merges them with the visitor's form submission(s) client-side.

### 3. Dashboard - `src/pages/admin/submissions.astro`

a) For the selected visitor (or per submission row's `attribution_visitor_id`), fetch
   `/admin/visitors/:visitorId/events` and build a single chronological timeline merging:
   - pageview        -> "Viewed {page_path}"
   - phone_click     -> "Clicked to call {target}"  (parse target from attribution_json)
   - email_click     -> "Clicked email {target}"
   - form submit     -> "Submitted {form_name}" (from the submission record's created_at)
   Sort by timestamp ascending; show date/time, plus IP/geo + gclid/source as the visitor header so the
   Ads origin is visible on the same card.
b) Event-type icons/labels are the only new render logic. Keep it inside the existing visitor/activity
   panel so it reads as one connected story.

### 4. Google Ads "conversions" on the dashboard - the honest limit

Google does NOT expose per-click visitor identity, so an individual Ads-counted conversion cannot be tied
to a specific visitor row/IP. The achievable, honest connection is already in our data: each visitor's
`gclid` + source/medium shows whether they came from a Google Ad. So the timeline header should surface
"Origin: Google Ads (gclid ...)" when present. Account-level Ads conversion COUNTS stay in Google and are
reconciled by `reconcile-leads.mjs` (D1 x GA4 x Ads). Do not imply we can attribute a Google conversion to
a single dashboard visitor - we connect via gclid, which is the real link.

## No migration / data model

- `visitor_events` already supports new `event_type` values; click target rides in `attribution_json`.
- If later you want first-class columns (e.g. `event_target`), that's an additive migration - not required
  for v1.

## Testing (don't pollute prod)

1. Local/preview: confirm event gating matches pageview gating (no D1 writes from localhost if pageviews
   don't write from localhost).
2. Controlled prod test: click a `tel:` and a `mailto:` link yourself, then verify a `phone_click` /
   `email_click` row appears in `visitor_events` for your `dc_vid`, and that it renders on the dashboard
   timeline for that visitor. Remove the test rows if desired.
3. Confirm `sendBeacon` fires before navigation (network panel) and that nothing blocks the `tel:`/`mailto:`
   default action.

## Acceptance criteria (Claude will audit these)

1. Clicking any site-wide `tel:` link writes a `phone_click` `visitor_events` row tied to the visitor_id,
   with IP/geo, AND still fires the existing GA4 + Google Ads conversion (no regression).
2. Clicking any `mailto:` link writes an `email_click` `visitor_events` row tied to the visitor_id.
3. The dashboard shows a per-visitor chronological timeline merging pageviews + phone_click + email_click
   + form submit, with the Ads origin (gclid/source) visible on the visitor.
4. No D1 migration; `npm run build` passes; Worker deploys; localhost/preview do not write junk events.
5. No regression to `/track/pageview`, form submit, or existing dashboard rendering.

## Files to touch

- `src/layouts/BaseLayout.astro` (client listeners + first-party event send)
- `workers/contact-form/index.js` (POST /track/event, GET /admin/visitors/:id/events)
- `src/pages/admin/submissions.astro` (per-visitor timeline render)
- No schema file change required.
