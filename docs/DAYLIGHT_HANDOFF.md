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

### 2026-08-22 - P3-a SHIPPED AND LIVE
- Top-10 traffic pages fixed and merged (PR #22, merge a8ff848), Cloudflare green,
  live-verified (decanter positioning + waste-oil Alfa Laval brand schema serving).
- Numeric conflicts collected for Sanjay's batch ruling (NOT changed): WHPX-405 GPM
  shown as 10 vs 5 vs 15 across pages; WHPX-513 50 vs 60 GPM; G-force 12,000 vs 8,000
  vs 7,200 on waste-oil pages; NX-314 50 vs 40 GPM; MAPX-210/MOPX-210 spec-table
  ownership on diesel page; DMB-004 4 vs 3 GPM (pre-existing).

### 2026-08-22 - P3-l SHIPPED (pending merge)
- 10 pages: tramp-oil, wspx-307 (additive), wspx-207 (additive), fluid-heating (brand
  stays Dolphin - genuinely Dolphin-built skid), privacy-policy, wspx-407 (additive),
  buyback, epc, wastewater-types, reconditioning-standard.
- New WSPX flags: 207 rated 20 vs 32 vs 8-12 GPM across pages; 307 22 vs 28 GPM;
  series sizing story inconsistent (207 "entry" at 20 GPM vs 303 "mid" at 8 GPM);
  no Dolphin code maps to WSPX in BRAIN - confirm if one exists.

### 2026-08-22 - P3-k SHIPPED AND LIVE (PR #32, merge 46ba646)
- 10 pages: clogged-bowl, training, performance, design, controls (panel brand stays
  Dolphin - genuinely Dolphin-built), parts (manufacturer node removed), lubrication,
  whpx-513-module (additive), extrusion, offshore.
- Flag: training-page photos are Alfa Laval machines with unreadable nameplates -
  named brand-only; Sanjay can name exact models for a one-pass tightening.

### 2026-08-22 - P3-j SHIPPED AND LIVE (PR #31, merge fe4c7f8)
- 10 pages: decanter-applications, manure, mab hub (additive), explosion-proof-ss,
  wspx-303 (additive, got genuine WSPX 303 photos), waste-oil-emulsion, cutting-oil,
  product-loss, washer-fluid, paring-disc-block.
- Decision needed: "CBPX-213-XP" (one page) vs "BRPX 213" (four pages) - pick the
  designation once. MAB hub has seven filename-style alts (additive rule blocked
  cleanup - say the word). NX-314 G-force 3,150 vs 3,100 across two pages.

### 2026-08-22 - P3-i SHIPPED AND LIVE (PR #30, merge 4406640)
- 10 pages: silicon-wafer case study, cannot-reach-speed, food-grade (fresh pass),
  used-oil-plant, salt-from-water, alfa-laval-industrial (additive), lapx-404
  (additive), installation, marine waste-oil case study, liquid-humus.
- Notable: DMSC-042 reconciled as the acid-service build of DMPX-042 (confirm, or
  retire the code); "SSB-206" found on food-grade page - confirm designation for the
  model map; more self-contradictions logged (NX-314 40 vs 60 GPM on one page,
  DMPX-070 G-force and GPM, food-grade 1.0 vs 0.1 micron).

### 2026-08-22 - P3-h SHIPPED AND LIVE (PR #29, merge 089171e)
- 10 pages: hydraulic-oil, disc-vibration, industrial-faq, friction-clutch,
  remove-metals-ash, disadvantages, sample-testing, picking-the-right, nx-314
  (additive), capacity.
- FAQ page gained a lead Q&A "What brand does Dolphin supply?" answering Alfa Laval
  openly (also in FAQPage schema). Flag: DMPX-028 photo caption kept WHPX-407 on
  FAQ/industrial pages (matching identical photo) vs MOPX 207 primary ruling - decide
  whether to flip both. Photo-confirmation list keeps growing in the flags.

### 2026-08-22 - P3-g SHIPPED AND LIVE (PR #28, merge f8197be)
- 10 pages: options, explosion-proof, bowl-leaking, mab-103 (additive), mopx-209
  (additive), chnx-418 (additive), decanter-rental, disc-accessories, fish-processing,
  black-diesel.
- Caught a digest error: digest wanted DMB-007 named on the MAB 103 page; BRAIN table
  says DMB-007 = MAB 104, so only DMB-004 was named. New flag: MAB 103 page contradicts
  itself on turbine lube (1 GPM prose vs 2.5 GPM table/schema). Explosion-proof page has
  a dangling "This UL documentation" reference (x2, no link) - P4 cleanup item.

### 2026-08-22 - P3-f SHIPPED AND LIVE (PR #27, merge ca2aeb4)
- 10 pages: btpx-205 (additive), whpx-510 (additive), sharples-p3400, ethanol-comparison,
  efficiency, sludge-ejection, mopx-207 (additive), smallest, liquid-seal-break,
  crude-oil-tank-bottom.
- Notable: Sharples P-3400 brand set to Alfa Laval (manufacturer "Alfa Laval (Sharples)")
  to match the shipped P-3000 sibling - digest had said keep Sharples; revert if wrong.
  MOPX 310 "3 cSt" typo fixed to 13 cSt per digest. Photo flags: WHPX-510 cutaway sits
  in the MOPX 310 section; SS food-grade decanter photo (4 pages) left model-neutral
  pending Sanjay naming the machine.

### 2026-08-22 - P3-e SHIPPED AND LIVE (PR #26, merge 6f88eba)
- 10 pages: bad-separation, clara-20 (additive), containerized, backpressure,
  machining-coolant-recovery, operating-water, sharples-p3000, yellow-grease,
  g2-40 (additive), pyrolysis-oil.
- New flags: bad-separation title "6 Causes" vs summary "five"; containerized-page
  interior photos captioned Alfa Laval without model (nameplates unreadable - confirm);
  backpressure page emits duplicate BreadcrumbList (pre-existing, P4 cleanup); Clara 20
  spec heading left without LAPX-404 (additive-only slug).

### 2026-08-22 - P3-d SHIPPED AND LIVE (PR #25, merge 027f9cd)
- 10 pages: quench-oil, decanter-vibration, whpx-405 (additive), rental, pond-depth,
  disc-faq, mechanical-issues, whpx-513 (additive), rcf-rpm, three-phase-decanter.
- New flags: rental page MAPX 207 22 vs 28 GPM on the same page; MAPX 210 42 vs 47 GPM;
  WHPX-405 15 vs 21 GPM rated (vs fuel-oil page); quench DMPX-028 20 vs 28 GPM (likely
  fluid difference); two photo confirmations (quench skid model plate unreadable;
  vibration-page shop photos assumed Alfa Laval NX).

### 2026-08-22 - P3-c SHIPPED AND LIVE (PR #24, merge 21b7ad0)
- 10 pages: disc-repair, biodiesel, dewatering, troubleshoot-bowl, decanter-optimization,
  purifier-clarifier-difference, NX-418 page (additive), stainless-steel, MAB-104 page
  (additive), machine-coolant. Build clean.
- New flags for Sanjay: NX-314 specs disagree across four pages (bowl RPM 3,250 vs
  4,000; capacity 60/50/40/25 GPM; motor 15 kW vs 15 HP vs 10 HP; bowl 34" vs 40");
  NX-418 bowl length 58" vs 68"; BDPX-207 mapped to MOPX 207 from its hero photo and
  specs - confirm it is not a WHPX 407.

### 2026-08-22 - P3-b SHIPPED AND LIVE (PR #23, merge 31b817f, live-verified fuel-oil)
- 10 pages: decanter-differential-speed, fuel-oil, disc-stack-applications, wvo,
  beer-wine, used-oil, decanter-vs-disc difference, parts-glossary, centrifugal-filter,
  oil-centrifuge. Schema brands to Alfa Laval, hidden platforms named, captions
  restored, positioning added. Build clean.
- New numeric flags for Sanjay (not changed): WHPX 405 frame 21 vs 23 GPM; DMPX-042
  rated 68 vs 69 vs 52-70 GPM and sludge 1.6 vs 1.55 vs 1.64 gal; WVO rail 15 GPM
  attributed to DMPX-028 vs spec table's DMPX-014; 405-frame bowl speed 8,500 vs
  7,600 RPM (may be FOPX-vs-WHPX real difference).
- Photo flag: DMPX-014/DMPX-042 skid photos on disc-stack-applications now captioned
  WHPX 405 / MOPX 209 per digest; machines not visually verified - drop to model-neutral
  if wrong.

P3-a page list:
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
