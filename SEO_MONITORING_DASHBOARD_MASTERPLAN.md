# Dolphin SEO / Ads / Analytics Monitoring Dashboard — Master Plan

Authoritative spec for the long-term, cloud-native monitoring and content-intelligence
system. This is a **planning document**, not a site implementation file.

- Author: Claude (with Sanjay), 2026-06-15
- Status: Approved direction; implementation gated by the active website repo lane lock
  (see `01 Operating Rules/Agent Coordination.md` in the Dolphin Brain vault).
- Companion vault note: `02 Projects/Dolphin Astro Website.md` → "SEO monitoring warehouse
  and dashboard consolidation" section.
- Research backing: a 106-agent, adversarially-verified deep-research pass (2026-06-15).
  Verified findings and refuted claims are recorded in the Appendix.

---

## 1. Purpose and end goal

Build a robust, mostly-autonomous monitoring + content-intelligence system that helps make
the new Astro website the most effective lead engine possible, with the long-term goal of
establishing Dolphin Centrifuge as the recognized world authority on industrial centrifuges
and 3-5X-ing the business.

The system must continuously:

1. Detect **slippage** on high-value keywords (we lose rank/visibility).
2. Detect **Google Ads waste** (money spent on the wrong searches / close-variant leakage).
3. Surface **content opportunities** ("striking distance" queries, blog-post ideas).
4. Surface **authority opportunities** (where to get cited, including by AI answer engines).
5. Recognize and tag **returning / identifiable visitors** (first-party tracking we already built).

## 2. Hard constraints (these shape every decision)

- **C1 — Lead-stage, not sales-conversion.** Dolphin closes only ~10-20 equipment sales/year.
  That is far too few to ever optimize on statistically. We optimize for **qualified leads and
  lead-quality signals**, and judge the sale tie manually. **Explicitly reject e-commerce /
  ROAS / Smart-Bidding playbooks.**
- **C2 — Not PC/laptop dependent.** Everything runs in the cloud on a schedule. Sanjay is
  frequently in Thailand; nothing may require the Detroit PC to be on.
- **C3 — Low-maintenance and robust.** Prefer managed/serverless, fewest moving parts,
  swappable layers. Minimize anything that can silently break.
- **C4 — Pluggable AI.** A thin AI "insight layer" sits on top of a stable data warehouse and
  is upgraded by swapping a model id as LLMs improve — never by re-plumbing the data.
- **C5 — Read-only by default.** No automated mutation of Ads, GSC, GA4, Gmail, Cloudflare,
  D1, BigQuery schemas, Git, or site files. Changes require Sanjay's explicit approval in the
  conversation where they are proposed. (Consistent with the standing "No to Google
  recommendations" rule.)

## 3. Guiding architecture (5 replaceable layers)

```
SOURCES  → INGEST (cloud, scheduled) → WAREHOUSE (BigQuery hub) → AI LAYER → SURFACES
```

1. **Sources:** GA4, Google Ads, Search Console, StatCounter (swappable), and our own
   first-party tracking (Cloudflare D1: form-fillers by IP, name tags, re-visitor cookies).
2. **Ingest:** native exports + BigQuery Data Transfer + Cloudflare Worker Cron. No laptop.
3. **Warehouse hub:** BigQuery `dolphin_seo_monitoring` — the stable centre. All detection
   logic lives here as scheduled SQL views.
4. **AI layer:** a Cloudflare Worker (Cron-triggered) that reads the action views and writes
   plain-English insights, blog drafts, and recommended negatives. Model is swappable.
5. **Surfaces:** Looker Studio dashboard (stats, phone-accessible) + the live `/admin/` page
   (lead identity) + email/push alerts.

Each layer is independently replaceable. StatCounter is wired as a swappable source — if we
drop it later, nothing else breaks.

## 4. What already exists (do not rebuild)

- **Live D1 ledger (Cloudflare):** `submissions`, `visitor_profiles`, `visitor_events`,
  attribution columns, manual "John called" identity tagging, return-visitor alerts. Schema in
  `workers/contact-form/schema-attribution-v1.sql` and `schema-visitor-identity-v2.sql`.
  NOTE: remote D1 migration not yet run; gated on Sanjay's approval.
- **First-party tracker:** `src/layouts/BaseLayout.astro` captures visitor id, attribution,
  GA ids, Google Ads click ids (gclid/gbraid/wbraid), StatCounter id, page trail.
- **BigQuery warehouse:** project `gen-lang-client-0409110854` ("AIS Website Redo"), dataset
  `dolphin_seo_monitoring`; GSC bulk-export dataset `searchconsole_dolphincentrifuge`; GA4 →
  BigQuery link for property `properties/536974508` (stream `G-9DCDDZTT9N`).
- **Existing views:** `v_gsc_query_weekly_anomalies`, `v_ga4_landing_weekly`,
  `v_google_ads_search_term_waste`, `v_seo_action_queue`, `v_seo_dashboard_summary`.
- **Helpers (currently PC-local):** `gsc-check.mjs`, `google-ads-check.mjs`.
- **Weekly automation:** Codex cron `Weekly SEO Performance Deep Dive` (Mon 8:00 AM).
  ⚠️ Currently `execution_environment = "local"` — i.e. **PC-dependent. Must be moved to the
  cloud (see Phase 1).**
- **Google Ads:** heavily cleaned by Codex (45 enabled positive keywords, 333 negatives,
  close-variant containment, manual CPC, $100/day). The standing rule is **No** to Google's
  spend-increasing recommendations.

## 5. The cloud cutover (Phase 1 — the load-bearing fix)

This removes the PC dependency (C2). Order of value:

| Source | Cloud ingestion method | Status |
|---|---|---|
| GA4 | Native GA4 → BigQuery daily export | Done |
| Search Console | GSC free **Bulk Data Export** to BigQuery (uncapped, daily) | Done (dataset exists) |
| Google Ads | **BigQuery Data Transfer Service** (native Google Ads connector, daily) | **To add** — replaces local `google-ads-check.mjs` for ongoing ingestion |
| StatCounter | Cloudflare **Worker Cron** → StatCounter API → BigQuery (swappable source) | To add |
| D1 first-party | Cloudflare **Worker Cron** mirrors safe lead/visitor summaries D1 → BigQuery | To add |
| Weekly deep-dive | Move the report off `execution_environment = "local"` to a cloud trigger (BigQuery scheduled query + alert, or a cloud agent) | **To change** |

Keep `gsc-check.mjs` / `google-ads-check.mjs` as **local diagnostic** tools (handy for
ad-hoc audits), but the *production pipeline* must not depend on them.

## 6. The detectors (Phase 2 — all as scheduled SQL views in BigQuery)

The research confirmed: **build these as plain SQL views over the GSC bulk export — no paid
SEO suite is needed for the monitoring job.** Each view returns rows only when there is
something to act on; an alert fires when rows appear (see Phase 3).

Proposed view set (names indicative):

- `v_gsc_query_slippage` — high-impression queries whose avg position dropped > N positions
  week-over-week. (Upgrades the existing `v_gsc_query_weekly_anomalies`.)
- `v_gsc_striking_distance` — queries ranking ~5-15 with high impressions and low CTR →
  the core blog/optimization opportunity feed.
- `v_gsc_cannibalization` — single query where 2+ URLs swap as the ranking page → fix/merge.
- `v_gsc_ctr_outliers` — good average position but low CTR → title/meta rewrite candidates.
- `v_gsc_indexation_drops` — pages that fell out of impressions/coverage vs prior period.
- `v_rank_daily` — true daily positions for the top ~50-200 money keywords (DataForSEO feed).
- `v_ads_search_term_waste` — existing; spend on off-intent search terms with no lead.
- `v_ads_close_variant_leakage` — close/"same-intent" variants Google matched that we did not
  target (negatives can't block close variants, so these must be surfaced deliberately).
- `v_ga4_funnel_health` — **alerts if `generate_lead` = 0 over a rolling window** (this caught
  a real tracking gap — recent GA4 windows showed 0 lead events; funnel integrity comes first).
- `v_ga4_landing_weekly`, `v_seo_action_queue`, `v_seo_dashboard_summary` — existing; keep.

## 7. Alerting (Phase 3 — cloud-native, no PC)

Mechanism (research-verified, primary-sourced):
**BigQuery scheduled query → Cloud Monitoring alert on the query's row-count gauge.**
When any detector view returns ≥ 1 row, the alert fires. Delivery via email (Resend, already
wired) and/or push.

- **Two cadences:** a **weekly digest** (the full picture) + **same-day urgent push** for true
  emergencies (a money keyword falls off page 1; a search term burns > $X with no lead;
  `generate_lead` flatlines).
- Thresholds are config, tuned to avoid noise. Start conservative.

## 8. AI insight layer (Phase 4 — pluggable)

Pattern (research-verified): a **Cloudflare Worker** authenticates to BigQuery (JWT, secrets),
reads the action views, calls an LLM, and is fired by a **Cron Trigger**.

- **Model: Claude API (primary)** for quality of insight and drafting; Cloudflare Workers AI
  is the free fallback. The model id is a one-line swap as models improve (C4).
- **Outputs:** (a) a plain-English weekly brief from `v_seo_action_queue`; (b) **blog-post
  drafts** in Sanjay's voice for top `v_gsc_striking_distance` rows, using the v7 Centrifuge
  Brain; (c) **recommended negatives / pauses** for Ads (presented for approval, never applied).
- **Maintenance trap (flagged):** Workers have tight CPU limits (10ms free / 30s paid). Use the
  AI layer for **small summaries over pre-aggregated view rows**, never to scan large tables.
  Heavy aggregation stays in SQL.

## 9. Surfaces (Phase 2+ — what Sanjay looks at)

- **Looker Studio** on the BigQuery views — the SEO/Ads/stats dashboard. Free, Google-hosted,
  phone-accessible from Thailand, near-zero maintenance. **This is the main dashboard.**
- **`/admin/` page** (live, reads D1) — the operational **lead-identity** surface: returning
  visitors, "John called" tagging, attribution. Looker is bad at this; keep it here.
- **Email/push** — the alert channel from Phase 3.

**Design language — StatCounter is the UX north star (Sanjay, 2026-06-15).** Sanjay has used
StatCounter for years and wants the dashboard to feel like it. The specific thing he values is
StatCounter's **Recent Visitor Activity** view: a chronological, one-row-per-visit log with
country flag + city/region, referrer / search keyword, entry & exit page, the visitor's full
page-by-page path on expand, a returning-visitor marker, and ISP/organization — plus drill-down
into a single visitor. Map it onto our two surfaces:

- **The live `/admin/` page (D1) IS our "Recent Visitor Activity."** It already holds the data
  model (`visitor_profiles`, `visitor_events`, page trail, geo, attribution, returning flag), so
  build it to look and feel like StatCounter's visit log — and it is *better*, because we add
  identity tagging ("John called"), company/contact linkage, and Google keyword/gclid attribution.
- **Looker Studio mirrors StatCounter's *report* pages** — Summary graph, Popular Pages, Came
  From, Keyword Analysis, Geo, System Stats — the aggregate left-menu reports.
- **Honest caveat:** Looker Studio is chart/report-oriented and is NOT good at a per-visitor
  chronological log with click-to-expand paths. That granular log must stay on the custom
  `/admin/` page. This reinforces the two-surface split.
- **Note:** StatCounter as a *data source* is swappable ("for now"); StatCounter as a *UX* is the
  north star we keep even if we drop the feed.

## 10. Content + authority engine (Phase 5 — the 3-5X lever)

- **Opportunity feed:** `v_gsc_striking_distance` → ranked blog/optimization ideas → AI drafts
  in voice (v7 brain) → Sanjay approves → publish. Closed loop from data to draft.
- **Topic clusters / pillar pages:** organize centrifuge content into pillar + cluster structure
  to build topical authority in a single deep niche.
- **AI-answer citation strategy (GEO/AEO), two-pronged** (research, directional):
  - **Encyclopedic technical reference content** → ChatGPT leans on Wikipedia-style depth.
  - **Authentic industry-forum presence** → Perplexity and Google AI Overviews lean on
    Reddit/forums.
- **AI share-of-voice tracking:** no clearly-best cheap tool surfaced. Candidate approach:
  script it via the same Cloudflare Worker hitting LLM/Perplexity APIs to check whether Dolphin
  is cited for key centrifuge questions. Treat as R&D in a later phase.

## 11. Rank tracking (small paid add — approved)

- **DataForSEO SERP API**, ~**$0.60 per 1,000 lookups**. Tracking ~200 keywords daily ≈
  **~$3.60/month**, pay-as-you-go, no subscription floor. Far cheaper than Ahrefs/Semrush
  ($100+/mo) for the monitoring job. Feeds `v_rank_daily`.
- This is the **only** new recurring cost in the plan.

## 12. Visitor identity — reality check (sets expectations)

- Reverse-IP identification tops out around **30-65% company-level / 5-20% person-level**, and
  person-level tools (RB2B etc.) are **US-only**. Dolphin's buyers are global.
- **Decision: do not buy a person-level visitor-ID tool** — it would miss most traffic and add
  cost/maintenance. Lean on the **first-party tracking already built** + optional *company-level*
  IP enrichment later. Expect most visitors to remain anonymous; treat IP/area-code/timing as
  confidence clues, not proof (already the design).

## 13. Google Ads governance (standing rules)

- Manual / Enhanced CPC Search only. **Never** Performance Max or Smart Bidding at this volume
  (they need ~50+ conv/mo and leak budget to Display/YouTube).
- **No** to Google's spend-increasing recommendations by default (existing durable rule).
- Tying spend → pipeline (offline conversion import) is a **later** nicety — currently blocked
  by (a) no automated QuickBooks→sale attribution (QB is desktop, ~10-20 sales/yr) and (b) the
  Google Ads API offline-conversion deprecation (must use Data Manager API going forward).

## 14. Phased roadmap

1. **Cut the PC cord** — Google Ads BigQuery Data Transfer; StatCounter + D1 Worker-Cron
   mirrors; move the weekly deep-dive off `local`. *Foundation.*
2. **Detectors + Looker** — build the SQL views; stand up the Looker Studio dashboard.
3. **Alerts** — scheduled-query + Cloud Monitoring row-count alerts; fix `generate_lead`
   tracking first (funnel integrity).
4. **AI insight layer** — Worker + Cron + Claude API: weekly brief, blog drafts, ad recs.
5. **Content + authority** — striking-distance → drafts; topic clusters; GEO/AEO; AI-SOV R&D.

## 15. Cost summary

- **~$4/month** (DataForSEO rank tracking). Everything else rides free tiers already in place
  (BigQuery, Looker Studio, GSC/GA4 exports, Cloudflare Workers, Resend). Claude API insight
  runs are pennies per execution.

## 16. Maintenance traps to avoid (per "low-maintenance" priority)

- **No dbt** for a handful of monitoring queries — native scheduled SQL is lower-maintenance.
- **Don't run the AI layer over large tables** — Worker CPU limits; summarize pre-aggregated rows.
- **No person-level visitor-ID tool** — low global coverage, ongoing cost.
- **No Performance Max / Smart Bidding** — budget leakage at low volume.
- **No production dependency on the local PC helpers** — diagnostics only.
- Keep all credentials outside the repo (Cloudflare secrets / `AppData`), never in Git/Obsidian.

## 17. Coordination / ownership

- The website repo is currently locked for the exec-review 8-point pass (Claude + Astro Agent).
  This master plan is a planning doc and does not touch site implementation.
- When the lane releases (or Sanjay overrides): implement against this spec. Warehouse / Looker
  / cloud-ingestion work is largely **outside** the repo lock and can proceed first.
- Do not create a second standalone dashboard; extend the warehouse + Looker + existing
  `/admin/` surface.

## 18. Open questions (carried forward)

- Best-value AI share-of-voice tracking (Profound / Otterly / Peec / Scrunch) vs scripting it
  via the Worker + LLM/Perplexity APIs.
- Confirm StatCounter retention horizon (it is "for now" / swappable).
- When/if to revisit offline conversion import once a QuickBooks→sale path is feasible.

---

## Appendix — research findings (deep-research pass, 2026-06-15, adversarially verified)

**Verified (high confidence unless noted):**

1. GSC free **Bulk Data Export** to BigQuery is daily and uncapped (escapes the 1,000-row UI
   limit). GSC, PageSpeed, and alpha Trends APIs are free.
   — support.google.com/webmasters/answer/12918484, developers.google.com/webmaster-tools/pricing
2. **DataForSEO SERP API** ~$0.60/1k results (Standard tier); ~$3.60/mo for 200 keywords daily;
   far cheaper than Ahrefs/Semrush for this job. — dataforseo.com/pricing/serp/google-organic-serp-api
3. **BigQuery scheduled queries** (15 min → months) + **Cloud Monitoring** row-count alerts give
   cloud-native, no-PC anomaly alerting. — cloud.google.com/bigquery/docs/create-alert-scheduled-query
4. **Cloudflare Worker** → BigQuery (REST/JWT, secrets) + Workers AI + **Cron Trigger** = a
   swappable, serverless AI insight layer. Trap: Worker CPU limits suit small summaries only.
   — developers.cloudflare.com/workers-ai/guides/tutorials/using-bigquery-with-workers-ai/
5. Smart Bidding / Performance Max need ~50+ conv/mo and are infeasible here; PMax leaks budget
   to Display/YouTube. Use manual/ECPC Search. — optmyzr.com, coseom.com, prospeo.io
6. For low-volume B2B, **shift measurement from form-fills to pipeline via offline conversion
   imports** (CRM stages matched to the click) — but optimization stays manual. — coseom.com,
   support.google.com/google-ads/answer/2998031
7. Reverse-IP visitor ID ≈ **30-65% company / 5-20% person**; person-level tools US-only;
   vendors overstate. Prioritize first-party + company enrichment. — factors.ai, rb2b.com/gdpr,
   leadpipe.com
8. **(Medium)** AI engines cite differently: ChatGPT → Wikipedia-style reference;
   Perplexity / Google AI Overviews → Reddit/forums. — tryprofound.com/blog/ai-platform-citation-patterns

**Refuted — DO NOT repeat these (killed 2/3+ in verification):**

- DataForSEO "$50 trial / blanket cheapest" framing (the $0.60/1k figure itself IS verified).
- "84% of advertisers use < 50 negative keywords" stat.
- Offline conversion import "near-100% match rate."
- "Target CPA needs 30 conversions / 30 days" specific threshold.
- "Stick with manual below 15-20 conv/mo" specific threshold.
- Any named per-vendor visitor-ID match-rate / pricing table.

**Pricing caveat:** all dollar figures are time-sensitive — re-verify before committing spend.
