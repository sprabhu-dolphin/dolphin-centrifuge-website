# Operation Daylight - running handoff

Continuity file. Updated after every batch. Read with `docs/DAYLIGHT_PLAN.md` (rules,
messaging kit, mappings) and `docs/daylight-audit-digest.json` (per-page audit findings).
Deploy route: `dolphin-github` skill (never involve Sanjay).

## SANJAY'S ONE-SHOT RULING LIST (2026-08-22)

Every open flag raised across P1 -> P3-m, deduplicated and grouped. Nothing in this list
has been changed on the site - each item is waiting on one ruling from Sanjay, and one
answer pass clears the whole backlog. 50 items: A=24, B=10, C=10, D=6.

### A. Numeric spec rulings (24)

1. WHPX 405 throughput 5 vs 10 vs 15 GPM - top-10 traffic pages, waste-oil, fuel-oil, whpx-405.
2. WHPX 405 rated/frame capacity 15 vs 21 vs 23 GPM - whpx-405, fuel-oil, disc-stack-applications.
3. WHPX 405-frame bowl speed 8,500 vs 7,600 RPM (may be a real FOPX-vs-WHPX difference) - whpx-405, fuel-oil.
4. WHPX 513 capacity 50 vs 60 GPM - whpx-513, whpx-513-module, top-10 pages.
5. Waste-oil G-force 12,000 vs 8,000 vs 7,200 - waste-oil cluster (P3-a pages).
6. NX-314 capacity 25 vs 40 vs 50 vs 60 GPM - nx-314, capacity, used-oil-plant, decanter pages.
7. NX-314 bowl speed 3,250 vs 4,000 RPM - four decanter pages (P3-c set).
8. NX-314 G-force 3,150 vs 3,100 - two pages (P3-j set).
9. NX-314 motor 15 kW vs 15 HP vs 10 HP - nx-314 plus decanter pages.
10. NX-314 bowl diameter 34" vs 40" - nx-314 plus decanter pages.
11. NX-418 bowl length 58" vs 68" - nx-418, decanter-applications.
12. DMB-004 diesel 4 vs 3 GPM (BRAIN table says 4) - dmb-004, alfa-laval-mab-103-centrifuge.
13. MAB 103 turbine lube 1 GPM prose vs 2.5 GPM table/schema - mab-103.
14. DMPX-042 rated 68 vs 69 vs 52-70 GPM - dmpx-042 plus application pages.
15. DMPX-042 sludge volume 1.6 vs 1.55 vs 1.64 gal - dmpx-042 plus application pages.
16. DMPX-070 G-force and internal GPM self-contradiction (72 vs 95-108 already settled as actual-vs-rated) - dmpx-070, used-oil-plant, selection guide.
17. DMPX-028 quench-service 20 vs 28 GPM (likely a fluid difference - confirm) - quench-oil, dmpx-028.
18. WVO rail 15 GPM attributed to DMPX-028 vs spec table's DMPX-014 - wvo.
19. MAPX 207 22 vs 28 GPM on the same page - rental.
20. MAPX 210 42 vs 47 GPM - rental, alfa-laval-diesel.
21. WSPX 207 rated 20 vs 32 vs 8-12 GPM - wspx-207 plus wastewater pages.
22. WSPX 307 22 vs 28 GPM - wspx-307, wastewater-types.
23. WSPX series sizing story inconsistent (207 "entry" at 20 GPM vs 303 "mid" at 8 GPM) - wspx-207, wspx-303, wspx-307, wspx-407.
24. Food-grade filtration claim 1.0 vs 0.1 micron, and bad-separation title "6 Causes" vs summary "five" - food-grade, bad-separation.

### B. Model-designation confirmations (10)

1. "CBPX-213-XP" (one page) vs "BRPX 213" (four pages) - pick the designation once: explosion-proof-ss plus the four BRPX pages.
2. DMSC-042 = acid-service build of DMPX-042, or retire the code - DMSC-042 references (P3-i pages).
3. "SSB-206" designation - confirm for the model map: food-grade.
4. MAPX-210 vs MOPX-210 spec-table ownership - alfa-laval-diesel.
5. BDPX-207 mapped to MOPX 207 from hero photo and specs - confirm it is not a WHPX 407: bdpx-207.
6. Sharples P-3400 brand set to Alfa Laval ("Alfa Laval (Sharples)") against the digest - confirm or revert: sharples-p3400.
7. DMPX-028 caption keeps WHPX-407 vs the MOPX 207 primary ruling - flip both or leave: industrial-faq, industrial.
8. App pages still leading WHPX where MOPX may now be preferred - alfa-laval-diesel, algae, crude-oil, whpx-510.
9. No Dolphin house code maps to WSPX in BRAIN - confirm whether one exists: WSPX pages.
10. DMB-007 mapping - digest wanted DMB-007 on the MAB 103 page, BRAIN says DMB-007 = MAB 104: mab-103.

### C. Photo confirmations (10)

1. DMPX-014 duplex caption says "base machines" plural - confirm both units are WHPX 405: dmpx-014.
2. DMPX-014 / DMPX-042 skid photos captioned WHPX 405 / MOPX 209 per digest, not visually verified - disc-stack-applications.
3. WHPX-510 cutaway sits in the MOPX 310 section - confirm or move: whpx-510.
4. SS food-grade decanter photo left model-neutral pending a name - 4 pages (P3-f set).
5. Containerized-page interior photos captioned Alfa Laval with no model (nameplates unreadable) - containerized.
6. Training-page photos named brand-only, nameplates unreadable - name exact models: training.
7. Quench skid model plate unreadable - confirm model: quench-oil.
8. Shop photos assumed to be Alfa Laval NX - confirm: decanter-vibration.
9. MAB 209 photo refresh when the new skid arrives - alfa-laval-mab-centrifuge (MAB 209 section) and centrifuges/dmb-062 hero.
10. Some DMB hero photos show a different MAB model than the page's base machine - swap photos or keep honest generic captions: DMB product pages.

### D. Misc decisions (6)

1. Title suffix unification - "| Dolphin" on the 12 P1.5 pages vs "| Dolphin Centrifuge" sitewide.
2. Founder vs owner in Person schema - "Owner and Chief Engineer" now; founder claim needs the 1982 history confirmed (one-line flip in src/lib/siteSchema.ts).
3. MAB hub carries seven filename-style alternateName alts - say the word to clean them up (additive rule blocked it): alfa-laval-mab-centrifuge.
4. Clara 20 spec heading left without LAPX-404 by the additive-only rule - approve adding it: clara-20.
5. Dangling "This UL documentation" reference x2 with no link - supply the doc or drop the sentence: explosion-proof.
6. Duplicate BreadcrumbList emitted (pre-existing) - approve the P4 cleanup: backpressure.

## Status log

### 2026-08-23 - OVERNIGHT NON-SITE WORK (ads, GSC, docs)
- Google Ads: 6 exact-match account-level negatives added (phone number / customer
  service / contact number / email address / careers / golbey), per orders item 18.
  Notable: the current 90-day search-terms report shows ZERO navigational bleed - all 81
  Alfa Laval terms are product-intent - so no siblings were added. Nothing else touched.
- April index cliff: RESOLVED AS A GHOST (docs/april-cliff-findings.md). The 337->154
  figures were "pages with impressions", not indexed pages; GSC indexed count is flat at
  ~149 = the entire live site; all 5 money pages verified indexed; the decline was
  Google retiring WP-era junk URLs (CTR +25% through the window). Real defect found
  instead: 6 invalid Product snippets incl. /waste-oil-centrifuge/ and
  /industrial-centrifuge/ - follow-up candidate. performance-review lines 41-56 need
  correcting so nobody chases this again.
- New docs: docs/RULING_WORKSHEET.md (81 one-line fillable rulings for Sanjay's hour,
  incl. new sections E audit-conflicts and F safety wording) and
  docs/ads-budget-proposal-2026-08.md (6 checkbox budget decisions, morning approval).

### 2026-08-23 - TRUST & PROOF P3 SHIPPED (funnel work)
- CTR rewrites (titles+metas only, H1s/slugs untouched): decanter-centrifuge -> "Decanter
  Centrifuge | Remanufactured Alfa Laval NX, In Stock"; industrial-centrifuge ->
  "Industrial Centrifuge | Remanufactured Alfa Laval, In Stock"; metas lead informational,
  close commercial (warranty phrasing = site standard; no "150+" claims). Hero copy kept
  byte-identical via new heroDescription prop.
- Money-page routing: 16 in-context links from 7 zero-lead traffic pages (industrial,
  decanter, disc-stack, wastewater, al-centrifugal-separator, used-oil, oil-centrifuge)
  to the converting cluster (wvo, waste-oil, WHPX-513, BTPX-205, NX-418). 2-3 per page,
  natural placement, no new claims.

### 2026-08-23 - TRUST & PROOF P2b + P2c SHIPPED AND LIVE (PRs #39 merge cbe9bb5, #40 merge d972eb1)
- P2b: 89 pages got clean H1s via the existing additive heroTitle prop (raw SEO-title
  pipes gone from every rendered H1; titles byte-identical). Live-verified.
- P2c: new ArticleByline component on 145 pages: "By Sanjay Prabhu, M.S.M.E. | Owner and
  Chief Engineer, Dolphin Centrifuge | Last reviewed: <Month Year>" (date only from the
  page's own Article dateModified; placeholders never surfaced). Two conflicting
  hand-rolled "Engineering Manager" bylines removed. Live-verified.

### 2026-08-23 - TRUST & PROOF P2a SHIPPED (crawler bugs + adjudicated contradictions)
- TrustSignals counters now server-render real values (crawlers no longer see "0+ Years
  Experience"); JS animation kept, reduced-motion respected. Testimonials Review/ItemList
  JSON-LD stripped (untruthful publisher/author/no-ratings shape); quotes stay as content.
  NX-314 page: AVNX 414 "three-phase... for 2-phase" sentence fixed, cloned spec rows
  (bowl dims/HP/AE) removed with TBD markers, NX 416 prose HP contradiction TBD-marked.
  liquid-humus: heading "40 GPM" made number-free (A6 frozen), NX 314 motor aligned to
  model page 10 HP, "<5% moisture" cake claim replaced with honest generic + TBD.
  CHNX 418 FAQ "5-20 m3/hr" removed (TBD comment). WHPX-510 page MOPX 310 table capacity
  set to prose-corroborated 25 GPM used oil (42 GPM was a clone of the WHPX row) + TBD.
- Also ready (uncommitted docs): docs/RULING_WORKSHEET.md (81 fillable ruling lines,
  A24/B10/C10/D6 + E22 new audit conflicts + F9 safety wording) and
  docs/ads-budget-proposal-2026-08.md (6 checkbox decisions for Sanjay's morning).

### 2026-08-23 - TRUST & PROOF P1 SHIPPED AND LIVE (PR #37, merge 7e8780f)
- Pyrolysis: AI-generated hero deleted; real Dolphin MOPX 210 (NEWGEN) hero at 2000x667;
  the actual REK tire-pyrolysis MOPX 210 now the in-context installation photo (replacing
  the mislabeled 250px MOPX205 thumb). liquid-humus: composting-yard fake hero deleted,
  real NX-314 module hero (honest alt, no facility claim). three-phase-decanter +
  decanter-centrifuge-applications: visible "Cutaway diagram (c) Alfa Laval Inc" credit
  restored under the OEM cutaway on both pages. Live-verified all three URLs.

### 2026-08-23 - TRUST & PROOF P0 SHIPPED AND LIVE (PR #36, merge bef4ba1)
- Overnight campaign per docs/OVERNIGHT_ORDERS.md. P0 safety/liability batch, 26 files:
  CHNX 418 all 8 bare "ATEX Certified" claims rewritten to the honest chain (original
  Alfa Laval ATEX build, Dolphin rebuild + purge verification in Warren MI, cert docs on
  request; spec row = "Hazardous-area design: ATEX (original Alfa Laval build)" with
  Track-2 TBD marker). alfa-laval-diesel: "Class 1 Div 2 explosion-proof" corrected to
  non-incendive/pressurized wording (5x), ASTM D975 restoration claim removed. Sitewide
  Class 1 -> Class I (108 occurrences, 24 files, NEC contexts only). Homepage +
  FeaturedProducts bare "ATEX certified systems" softened to NEC controls + ATEX-rated
  base machines. Build green; live-verified chnx-418, diesel, explosion-proof.
- New Track-2 flag from the pass: MAB 103/104 pages say "explosion-proof ATEX Zone II"
  (same Div-2-style terminology error in ATEX form) - left alone (additive-only pages).

### 2026-08-22 - CAMPAIGN CLOSED (final mop-up PR #35, merge 1f56169, live-verified)
- Full-site verification: 148/148 in-scope pages name Alfa Laval; 147/153 carry the
  independence disclaimer (remainder: 404/admin/privacy/tour); last two Product brand
  misses fixed; live checks 8/8. Only open work: the ruling list above, and P4-class
  polish items noted in batch entries (duplicate breadcrumb, UL reference, MAB hub alts).

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

### 2026-08-22 - P3-m (FINAL BATCH) SHIPPED (pending merge)
- 8 pages: alfa-laval-diesel (two digest-ordered model corrections: WHPX 510 wrongly
  equated to DMPX-070, now DMPX-042), knowledge hub cluster (case-studies, center,
  comparisons, guides, product-brand, troubleshooting), sample-testing-case-studies.
- 72 vs 95-108 GPM resolved as actual-vs-rated labeling, no numbers changed.

### 2026-08-22 - P3-l SHIPPED AND LIVE (PR #33, merge 577e54d)
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

### 2026-08-22 - ALL BATCHES COMPLETE (P1, P1.5, P2, P3-a..P3-m shipped and live; 144-page worklist done)
- Supersedes the NEXT UP list above. The only work left is Sanjay's answers to the
  50-item ruling list at the top of this file (A=24 numeric, B=10 designations,
  C=10 photos, D=6 misc), which one editing pass will apply.
