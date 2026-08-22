# Operation Daylight - running handoff

Continuity file. Updated after every batch. Read with `docs/DAYLIGHT_PLAN.md` (rules,
messaging kit, mappings) and `docs/daylight-audit-digest.json` (per-page audit findings).
Deploy route: `dolphin-github` skill (never involve Sanjay).

## Status log

### 2026-08-22 - P1 SHIPPED AND LIVE
- All 12 DMPX/DMB product pages: open Alfa Laval naming (platform sentence, Base machine
  spec row, non-affiliation line, honest/model-accurate heroes, category labels), sitewide
  clarifier->centrifuge wording (85 edits/20 files), MOPX made primary on DMPX-028 (MOPX 207)
  and DMPX-042 (MOPX 209/210) per Sanjay, MAB 207 diesel = 48 GPM on both pages.
- Reviewed page-by-page by Sanjay, merged as PR #19 (merge 4bd13c9), Cloudflare deployed,
  live-verified on dmb-004 / dmpx-042 / dmpx-014.
- Known debt: BaseLayout's normalizeProductSchema DROPS Product JSON-LD on price-free
  pages, so the corrected brand/alternateName is in source but NOT emitted - fix in P2.
- Open flags: DMPX-070 GPM vs selection guide (59-72 vs 95-108); DMPX-014 duplex photo
  caption says "base machines" plural - confirm both units are WHPX 405; several app pages
  (diesel, algae, crude-oil, whpx-510 page) still lead WHPX where MOPX may now be preferred.

### 2026-08-22 - P1.5 SHIPPED AND LIVE
- All 12 pages reframed to module-featuring language; Alfa Laval model now in title, meta,
  H1, and first 100 words of each. Merged as PR #20 (merge 4389842), Cloudflare green,
  live-verified (dmb-019 title: "DMB-019 Lube Oil Module - Alfa Laval MAB 205 | Dolphin").
- Note: these 12 titles use short suffix "| Dolphin"; rest of site still "| Dolphin
  Centrifuge" - unify decision pending.

### 2026-08-22 - P2 SHIPPED AND LIVE (identity layer)
- Product JSON-LD restored sitewide (1 -> 71 nodes), canonical Organization schema on
  every page (positioning line, knowsAbout, Warren MI, sameAs) + canonical Person for
  Sanjay Prabhu MSME ("Owner and Chief Engineer" - founder claim held back pending
  Sanjay's confirmation of the 1982 history; one-line flip in src/lib/siteSchema.ts).
- Homepage repositioned ("The Independent Home of Alfa Laval Centrifuges"), About
  engineer-led story, AL hub cluster additive fixes, trust cluster majors fixed.
- Merged PR #21 (merge 453298f), Cloudflare green, live-verified: homepage Organization
  + positioning + Person all serving; dmpx-042 Product node with Alfa Laval brand live.
- New visibility debt: ~39 now-rendered Product nodes still carry brand "Dolphin
  Centrifuge" on AL-platform pages (mostly /alfa-laval-wspx-*, whpx-*, application
  pages) - being fixed batch-by-batch in P3 (instruction baked into batch prompts).

### 2026-08-22 - P3-a IN FLIGHT
- Top-10 traffic pages per docs/daylight-priority.md (decanter, waste-oil, diesel,
  AL parts, AL centrifugal separator, wastewater, lube-oil, alfa-laval-centrifuge,
  algae, crude-oil). Deploy via skill route when green; then P3-b ... P3-m.

### NEXT UP
- P2: identity layer - homepage, about (Sanjay Prabhu MSME, Person/author schema),
  Alfa Laval hub cluster, and the schema plumbing fix (emit Product schema without fake
  offers; Organization schema with knowsAbout/brand; Person schema).
- P3: top-traffic application pages ranked by GA4/GSC data (see docs/daylight-priority.md
  once the data minion lands it).
- P4: minor sweep, 104 pages, scripted batches of ~20.
