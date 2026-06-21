# StatCounter Feature-Parity Plan — Dolphin Stats Dashboard

**Purpose:** decide which StatCounter features to build into Dolphin's own dashboard
(`/admin/submissions`), which to defer, and which to skip — tuned for a **lead-stage B2B**
business (~10-20 equipment sales/yr; optimize for qualified leads, not e-commerce/ROAS).

**How this was studied (2026-06-20, Claude):** live walkthrough of the real StatCounter
account `dolphinmarine` / project `9162316` (Dolphincentrifuge.com, 642K total sessions) via
the connected Chrome, screen-by-screen, plus StatCounter's official feature docs. Companion to
`SEO_MONITORING_DASHBOARD_MASTERPLAN.md`. Lead-stage focus per [[Dolphin Stats Dashboard]].

## Our edge over StatCounter (keep leaning into these)
- **Retention:** StatCounter's *detailed* visitor log is capped at ~**100,500 pageviews** on the
  current plan — older detail is purged unless you upgrade. Our **D1 holds years** (est. decades
  at current ~1 MB/day; see masterplan capacity note). Long-term: roll old events to BigQuery.
- **Real ad $ cost:** we join Google Ads API spend to the keyword; StatCounter only shows the keyword.
- **Identity resolution / "connected dots":** our scored anonymous→known fusion is our version of
  StatCounter "Magnify", and a differentiator.
- **One system:** form + phone leads + conversions + SEO/Ads intel in one dashboard.

## Feature inventory + decisions

Legend — Status: ✅ have · 🟡 partial · ❌ missing. Decision: **BUILD** (now/soon) · **LATER** · **SKIP**.

| StatCounter feature | What it does | Status | Decision |
|---|---|---|---|
| Visitor Activity (live per-visit log) | per-visitor sessions, pages, device, location, referrer | ✅ | — |
| Visitor locations (country→IP, + flag) | geo down to IP | ✅ | — (map = LATER) |
| Visitor labels / tagging | name/notes a visitor | ✅ (+ quick-tag) | — |
| Visitor alerts (return notify) | email when a visitor returns | ✅ | — |
| Google Ads integration | keyword/campaign + **$ cost** | ✅ better | — |
| Conversion tracking | goal completion % | ✅ + reconciliation monitor | — |
| Magnify (forensic ID) | identify anonymous as leads | ✅ identity-resolution | enhance |
| **Date range + pagination** | date presets/calendar, `N Per Page`, page X/Y prev-next | ❌ | **BUILD (wave 1)** |
| **Powerful filters** | segment by engagement/source/location/system/label/tag | ❌ (text search only) | **BUILD** |
| **Summary stats** | KPI tiles (pageviews/visitors/new/returning) + trend chart, date range | ❌ | **BUILD** |
| **Popular / Entry / Exit pages** | pages ranked by sessions, + bounce% + conversion% + trends | 🟡 (per-visitor only) | **BUILD** |
| **Traffic sources report** | organic/paid/referral/direct/social rollup | 🟡 | **BUILD** |
| **Visitor paths** | full click-path per visit | 🟡 (trail stored) | **BUILD** |
| **Download / exit-link tracking** | clicks on PDF/spec-sheet/manual + outbound links | ❌ | **BUILD** ⭐ high intent |
| Session length / visit duration | per-visit time on site | 🟡 | BUILD (small) |
| Bounce rate | single-page-visit % per page | ❌ | BUILD (with Pages) |
| Data export (CSV) | export current report | ❌ | LATER (cheap) |
| Email reports (scheduled summary) | daily/weekly/monthly digest | 🟡 (alerts only) | LATER |
| Visitor map (geo viz) | world map of visitors | ❌ | LATER |
| Aggregate system stats | browser/OS/device charts | 🟡 | LATER |
| Keyword analysis (aggregate) | search terms rollup | 🟡 (GSC API) | LATER |
| Custom tags | author/test_id/launch/etc. dimensions | ❌ | LATER (only if needed) |
| Blocking cookie (exclude own visits) | don't track your own browsing | ❌ | LATER (small, useful) |
| Heatmaps | click/scroll heat per page | ❌ | SKIP (revisit per-LP) |
| Session replay | record + replay sessions | ❌ | SKIP (heavy + privacy) |
| Paid-click fraud analysis | repeat ad clicks from same IP | ❌ | SKIP (Ads has protection) |
| Mobile apps | native iOS/Android | ❌ | SKIP (dashboard is responsive) |

## Decided first wave (owner, 2026-06-20)
**Filters + pagination** first (usability — the list is past 100 rows). Then summary tiles,
reporting rollups, download tracking (sequence TBD).

## Implementation notes (our stack: Astro admin page + Worker + D1)
- **Pagination/date:** add server-side `LIMIT/OFFSET` + a date-range filter to the Worker
  `/admin/submissions` + `/admin/visitors` GETs (currently `LIMIT 500`, client slices 100).
  UI: date presets (Today/7d/30d/Month/Custom calendar) + rows-per-page (25/50/100/200) +
  prev/next, mirroring StatCounter's footer controls.
- **Powerful filters:** dimensions to support → returning, identified, foreign, converted,
  source (organic/paid/direct), country, has-gclid, labelled. Client-side first (data already
  loaded), move server-side when volume needs it.
- **Summary tiles:** aggregate from D1 (events/profiles/submissions) over the selected range:
  pageviews, unique visitors, new vs returning, leads, conversion rate.
- **Pages rollup:** GROUP BY page_path over visitor_events for Top/Entry/Exit + bounce
  (single-pageview sessions) + conversion (sessions that led to a submission).
- **Download/exit tracking:** add a small client hook in BaseLayout that posts a `download`/
  `exit_link` event to `/track/pageview` (new event_type) when a visitor clicks a file link or
  outbound link; surface in the activity log + a Downloads report.
- **Session length:** derive from first→last event timestamp per session in visitor_events.

## Retention (long-term, from masterplan)
Keep raw `visitor_events` ~90-180 days in D1; roll older into BigQuery for Looker. Add a
`--purge-test-rows` + retention sweep to the maintenance tooling.
