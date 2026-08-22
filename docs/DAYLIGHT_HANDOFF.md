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

### 2026-08-22 - P1.5 IN FLIGHT
- Reframing pass on the same 12 pages to Sanjay's module-featuring language ("a Dolphin
  module featuring a remanufactured Alfa Laval <model>"), per the messaging ruling in the
  plan. Deploy via skill route when green.

### NEXT UP
- P2: identity layer - homepage, about (Sanjay Prabhu MSME, Person/author schema),
  Alfa Laval hub cluster, and the schema plumbing fix (emit Product schema without fake
  offers; Organization schema with knowsAbout/brand; Person schema).
- P3: top-traffic application pages ranked by GA4/GSC data (see docs/daylight-priority.md
  once the data minion lands it).
- P4: minor sweep, 104 pages, scripted batches of ~20.
