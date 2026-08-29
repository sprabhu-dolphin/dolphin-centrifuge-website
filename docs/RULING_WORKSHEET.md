# RULING WORKSHEET - frozen numbers, names, photos and claims

**EVERY ITEM ON THIS SHEET IS RULED except F9 (warranty terms - deliberately parked).** The A-F
sections were ruled 2026-08-24; the final eight leftovers were ruled 2026-08-29 as R5-1 to R5-8
at the bottom of this file.

**Date: 2026-08-23. For Sanjay only.** Every frozen item on the site is one line here.

**How to use:** tick `[ ]` to accept the REC as written, or scribble a different value in the
RULING blank. Blank line = still frozen, nothing changes. Tick box or write a number, next line.
One editing pass applies everything on this sheet.

**Every REC is a proposal, not a fact.** Nothing here has been applied to the site. Where the
evidence does not support a proposal the line says `REC: none (need Sanjay)`.

Evidence shorthand: **model page** = the model's own `/alfa-laval-*` page in this repo.
**BRAIN** = CENTRIFUGE_BRAIN v7.0 cross-reference tables. **audit** = the 50 zero-context auditors.

Sources: `docs/DAYLIGHT_HANDOFF.md` (ruling list), `docs/zero-context-audit-top50.md` (section 4),
`docs/OVERNIGHT_ORDERS.md` (Track-2 items), `docs/DAYLIGHT_PLAN.md` (model cross-reference).

---

## A. Numeric spec rulings (24) - the original frozen list - ruled 2026-08-24

- [x] **A1.** WHPX 405 throughput on diesel: 5 / 10 / **15 [REC]** GPM - pages: waste-oil, fuel-oil, whpx-405 - why: model page says 15 GPM, BRAIN DMPX-014 diesel band 13-16 - RULING: 15 GPM on 13 cSt diesel
- [x] **A2.** WHPX 405 rated (max/water) capacity: 15 / 21 / **23 [REC]** GPM - pages: whpx-405, fuel-oil, disc-stack-applications - why: BRAIN DMPX-014 rated 22-24; 15 is the diesel number from A1, not the rating - RULING: 23 GPM rated (max); 15 GPM is the diesel duty per A1, labelled as such
- [x] **A3.** WHPX 405-frame bowl speed: 8,500 / **7,600 [REC]** RPM - pages: whpx-405, fuel-oil - why: model page says 7,600 RPM and its 7,200 G figure only computes at 7,600; 8,500 likely belongs to a MAB frame - RULING: 7,600 RPM on the WHPX 405 frame; genuine MAB-frame 8,500 RPM figures left alone
- [x] **A4.** WHPX 513 capacity: 50 / 60 / **72 [REC]** GPM on 13 cSt diesel - pages: whpx-513, whpx-513-module, top-10 pages - why: model page and its schema both say 72 GPM diesel; BRAIN DMPX-070 diesel band 59-72 - RULING: 72 GPM on 13 cSt diesel
- [x] **A5.** Waste-oil cluster G-force: 12,000 / 8,000 / **7,200 [REC]** Gs - pages: waste-oil cluster (P3-a) - why: 7,200 is the WHPX 405 model-page figure; 12,000 has no machine on the site behind it - note: if these pages mean disc-stacks generically, say so and we publish a range instead - RULING: 7,200 Gs on the WHPX 405 frame; quote per model, and "up to ~7,200 Gs depending on model" where a page speaks generically
- [x] **A6.** NX-314 capacity: **25 [REC]** / 40 / 50 / 60 GPM - pages: nx-314, capacity, used-oil-plant, decanter pages - why: model page says 25 GPM on hemp ethanol slurry; BRAIN says ~30 GPM generic - the fix is to state the fluid with the number - RULING: 25 GPM, always stated with the fluid ("on hemp ethanol slurry" or the page's real duty)
- [x] **A7.** NX-314 bowl speed: 3,250 / **4,000 [REC]** RPM - pages: four decanter pages (P3-c) - why: model page says 4,000 RPM in prose, table and schema - RULING: 4,000 RPM
- [x] **A8.** NX-314 G-force: 3,150 / 3,100 / **3,157 [REC]** Gs - pages: two pages (P3-j) - why: model page says 3,157, which is exactly what 353 mm at 4,000 RPM computes to - RULING: 3,157 Gs
- [x] **A9.** NX-314 motor: 15 kW / 15 HP / **10 HP [REC]** - pages: nx-314 plus decanter pages - why: model page table and schema both say 10 HP - RULING: 10 HP
- [x] **A10.** NX-314 bowl: **14" diameter / 34" length [REC]** vs pages saying "34 inch bowl" or "40 inch bowl" - pages: nx-314 plus decanter pages - why: model page says diameter 14" (353 mm), length 34" (860 mm); the "34 vs 40" fight looks like length being printed as diameter - RULING: 14" (353 mm) diameter, 34" (860 mm) length
- [x] **A11.** NX-418 bowl length: 58" / 68" - pages: nx-418, decanter-applications - REC: none (need Sanjay) - why: the NX-418 model page carries no bowl-length row and BRAIN has no dimension for it - RULING: 58" bowl length
- [x] **A12.** DMB-004 / MAB 103 diesel: **4 [REC]** / 3 GPM - pages: dmb-004, mab-103 - why: BRAIN gives DMB-004 diesel 4 GPM (rated 6) in both its tables; MAB 103 page says 3 - if 4 is the module and 3 is the bare machine, say that and we label both - RULING: 4 GPM on diesel, module and bare machine both labelled 4
- [x] **A13.** MAB 103 turbine lube: 1 / **2.5 [REC]** GPM - pages: mab-103 (prose vs table vs schema) - why: table and schema both say 2.5, prose alone says 1 - low confidence: BRAIN's DMB table gives 2 GPM lube and 4 GPM steam turbine, so it backs neither - RULING: 2.5 GPM turbine lube
- [x] **A14.** DMPX-042 rated: 68 / **69 [REC]** / 52-70 GPM - pages: dmpx-042 plus application pages - why: BRAIN DMPX-042 rated band 52-70; a single number reads better than a range but any of these sits inside it - alternative: publish "52-70 GPM depending on configuration" - RULING: 69 GPM rated, keeping honest "actual varies by duty" phrasing
- [x] **A15.** DMPX-042 sludge volume: 1.6 / 1.55 / **1.64 [REC]** gal - pages: dmpx-042 plus application pages - why: BRAIN sludge table says 1.64-1.66 gal for DMPX-042 - RULING: 1.64 gal
- [x] **A16.** DMPX-070 G-force plus its internal GPM contradiction (72 vs 95-108 already settled as actual-vs-rated) - pages: dmpx-070, used-oil-plant, selection-guide - REC: label as **72 GPM actual on diesel / 95-108 GPM rated [REC]**, G-force figure still needed - why: BRAIN DMPX-070 diesel 59-72, rated 95-108; no G-force in BRAIN or on the model page - RULING: 72 GPM actual on diesel / 95-108 GPM rated, both labelled. G-force: FROZEN - parked
- [x] **A17.** DMPX-028 quench service: 20 / **28 [REC]** GPM - pages: quench-oil, dmpx-028 - why: BRAIN DMPX-028 diesel band 20-26, rated 33-40; neither number is a quench-oil figure, so the honest fix is a fluid label on each - flag: if 20 is quench oil and 28 is diesel, tick and we label both - RULING: 28 GPM with the fluid label
- [x] **A18.** WVO rail 15 GPM attributed to DMPX-028 vs the spec table's DMPX-014: **DMPX-014 [REC]** - pages: wvo - why: 15 GPM sits inside BRAIN's DMPX-014 diesel band 13-16; DMPX-028 is a 20-26 GPM machine - RULING: DMPX-014 owns the 15 GPM WVO rail figure
- [x] **A19.** MAPX 207 on the same page: 22 / 28 GPM - pages: rental - REC: none (need Sanjay) - why: BRAIN maps MAPX 207 to DMPX-028 (diesel 20-26, rated 33-40) and neither number falls cleanly in a band - RULING: MAPX 207 = 28 GPM (the 22 GPM figure removed)
- [x] **A20.** MAPX 210: **42 [REC]** / 47 GPM - pages: rental, alfa-laval-diesel - why: the WHPX 510 model page (same DMPX-042 size class) publishes 42 GPM on diesel throughout - RULING: 42 GPM
- [x] **A21.** WSPX 207 rated: 20 / 32 / 8-12 GPM - pages: wspx-207 plus wastewater pages - REC: none (need Sanjay) - why: BRAIN has no WSPX mapping at all (see B9), so nothing corroborates any of the three - RULING: WSPX 207 = 20 GPM. WSPX 303 and 407: publish NO capacity numbers; every GPM claim for those two models replaced with "sized per application" phrasing (ruled 2026-08-24)
- [x] **A22.** WSPX 307: 22 / 28 GPM - pages: wspx-307, wastewater-types - REC: none (need Sanjay) - why: BRAIN lists WSPX-307 as "encountered but not yet mapped" with no capacity - RULING: WSPX 307 = 28 GPM
- [x] **A23.** WSPX series sizing story (207 called "entry" at 20 GPM vs 303 called "mid" at 8 GPM) - pages: wspx-207, wspx-303, wspx-307, wspx-407 - REC: none (need Sanjay) - why: needs the real series order from you; once A21/A22 land, the sizing prose follows from them - RULING: Series order 207 -> 303 -> 307 -> 407; 207 entry at 20 GPM, 307 above it at 28 GPM; the "303 mid at 8 GPM" claim removed; 303 and 407 publish no capacity numbers at all, "sized per application" instead (ruled 2026-08-24)
- [x] **A24.** Food-grade filtration claim 1.0 / **0.1 [REC]** micron, and bad-separation title "6 Causes" vs summary "five" - pages: food-grade, bad-separation - why: 0.5 micron is the site's standard disc-stack claim (whpx-405, mab-103), so 1.0 is the outlier; the bad-separation fix is just counting the causes in the body and matching both - RULING: 0.5 micron on food-grade, aligned to the E3 sitewide disc-stack ruling. Bad-separation: body carries six causes, so title stays "6 Causes" and the summary now says six

---

## B. Model-designation confirmations (10) - ruled 2026-08-24

- [x] **B1.** "CBPX-213-XP" (1 page) vs **"BRPX 213" [REC]** (4 pages) - pages: explosion-proof-ss + 4 BRPX pages - why: BRAIN names BRPX-213 as the clarifier; majority of pages already say BRPX 213 - RULING: BRPX 213
- [x] **B2.** DMSC-042 = acid-service build of DMPX-042, or retire the code - pages: P3-i set - REC: none (need Sanjay) - why: DMSC does not appear anywhere in BRAIN's variant list (which has -SS, -WS, -WW, -BO) - RULING: RETIRE the DMSC-042 code. Every reference now reads "DMPX-042 acid-service configuration" or its natural equivalent; no page presents DMSC-042 as a current designation
- [x] **B3.** "SSB-206" designation - confirm for the model map - pages: food-grade - REC: none (need Sanjay) - why: not in BRAIN; the nearest listed sibling is WSB-104 as the SS variant of MAB 104 - RULING: SSB-206 is NOT a real code. Reworded to "stainless steel configuration of the Alfa Laval MAB 206"; no replacement code invented
- [x] **B4.** MAPX-210 vs MOPX-210 owns that spec table - pages: alfa-laval-diesel - REC: **MOPX-210 [REC]** - why: BRAIN lists both under DMPX-042, and your 2026-08-21 ruling made MOPX primary for DMPX-042 - RULING: MOPX-210
- [x] **B5.** BDPX-207 mapped to MOPX 207 from hero photo and specs - confirm it is not a WHPX 407 - pages: bdpx-207 - REC: **MOPX 207 [REC]** - why: same 2026-08-21 ruling made MOPX 207 primary for DMPX-028; WHPX 407 stays the alternative - RULING: MOPX 207
- [x] **B6.** Sharples P-3400 brand set to "Alfa Laval (Sharples)" against the digest - confirm or revert - pages: sharples-p3400 - REC: **keep Alfa Laval (Sharples) [REC]** - why: matches the shipped P-3000 sibling; Alfa Laval owns the Sharples decanter line - RULING: Keep Alfa Laval (Sharples)
- [x] **B7.** DMPX-028 photo caption keeps WHPX-407 vs the MOPX 207 primary ruling - flip both or leave - pages: industrial-faq, industrial - REC: **leave the caption as WHPX-407 [REC]** if that is the machine actually in the photo - why: the primary-model ruling governs prose and schema; a caption must describe the photo, not the policy - RULING: Leave the caption as WHPX-407
- [x] **B8.** App pages still leading WHPX where MOPX may now be preferred - pages: alfa-laval-diesel, algae, crude-oil, whpx-510 - REC: **lead MOPX, keep WHPX named as the equivalent [REC]** - why: consistent with B4/B5; both are in BRAIN under the same Dolphin code so nothing becomes untrue - caution: whpx-510 is an additive-only slug, so WHPX stays in its title and H1 - RULING: Lead MOPX, keep WHPX named as the equivalent
- [ ] **B9.** No Dolphin house code maps to WSPX in BRAIN - confirm whether one exists - pages: all WSPX pages - REC: none (need Sanjay) - why: BRAIN records WSPX-307 as unmapped; this also unblocks A21-A23 - RULING: ______ - note 2026-08-24: A21-A23 were settled without needing a WSPX house code. WSPX 207 = 20 GPM, WSPX 307 = 28 GPM, and WSPX 303 and 407 publish no capacity numbers at all
- [x] **B10.** DMB-007 mapping: digest wanted DMB-007 on the MAB 103 page, **BRAIN says DMB-007 = MAB 104 [REC]** - pages: mab-103 - why: BRAIN's DMB table is explicit (DMB-004 = MAB 103, DMB-007 = MAB 104); the digest was wrong and only DMB-004 was named - RULING: DMB-007 = MAB 104

---

## C. Photo confirmations (10) - ruled 2026-08-24

- [x] **C1.** DMPX-014 duplex caption says "base machines" plural - are both units WHPX 405? - pages: dmpx-014 - REC: **yes, both WHPX 405 [REC]** - why: the explosion-proof page already captions the same duplex skid as two remanufactured WHPX 405s - RULING: Yes, both units are WHPX 405
- [x] **C2.** DMPX-014 / DMPX-042 skid photos captioned WHPX 405 / MOPX 209 per digest, never visually verified - pages: disc-stack-applications - REC: none (need Sanjay: one look at the photos) - RULING: CONFIRMED by eye 2026-08-24. The DMPX-042 photo is a MOPX 209. No caption change needed
- [x] **C3.** WHPX-510 cutaway sits inside the MOPX 310 section - confirm or move - pages: whpx-510 - REC: **move it above the MOPX 310 heading [REC]** - why: the figure is captioned "Alfa Laval WHPX 510 Cutaway View" and sits under a heading about a different machine - RULING: Move the cutaway above the MOPX 310 heading
- [x] **C4.** SS food-grade decanter photo left model-neutral pending a name - pages: 4 pages (P3-f) - REC: none (need Sanjay to name the machine) - RULING: The machine is an Alfa Laval NX 314. Captions and alts now name it on the four pages carrying that photo: decanter-centrifuge-applications, ethanol-extraction-centrifuges-technical-comparison, explosion-proof-centrifuge, explosion-proof-stainless-steel-centrifuge
- [x] **C5.** Containerized-page interior photos captioned Alfa Laval with no model (nameplates unreadable) - pages: containerized - REC: none (need Sanjay) - RULING: LEAVE the brand-only captions. No change
- [x] **C6.** Training-page photos named brand-only, nameplates unreadable - pages: training - REC: none (need Sanjay to name exact models) - RULING: LEAVE brand-only. No change
- [x] **C7.** Quench skid model plate unreadable - pages: quench-oil - REC: none (need Sanjay) - note: ties to A17; if the skid is a DMPX-028 the caption and the GPM should agree - RULING: CONFIRMED the quench-oil skid IS the DMPX-014 (WHPX 405); captions stay. The 28 GPM figure from A17 belongs to the DMPX-028 / MOPX 207 and is now attributed to it explicitly on the page so the photo and the number no longer conflict
- [x] **C8.** Shop photos assumed to be Alfa Laval NX - pages: decanter-vibration - REC: none (need Sanjay) - separate and more urgent: the auditors flagged this page's bearing photo as AI-generated (no Dolphin watermark, 182 KB vs ~21 KB for the real shop photos) - see F8 - RULING: CONFIRMED the shop photos are Alfa Laval NX machines; captions stand. No change
- [x] **C9.** MAB 209 photo refresh when the new skid arrives - pages: alfa-laval-mab-centrifuge (MAB 209 section), centrifuges/dmb-062 hero - REC: **hold until you shoot the new skid [REC]** - why: the current shot is a correct but dated MAB 209 - RULING: Hold until the new skid is shot
- [x] **C10.** Some DMB hero photos show a different MAB model than the page's base machine - swap or keep honest generic captions - pages: DMB product pages - REC: **swap where a correct-model photo exists in the library, otherwise generic caption [REC]** - why: that is the standing images rule in DAYLIGHT_PLAN - RULING: Swap where a correct-model photo exists in the library, otherwise a generic caption

---

## D. Misc decisions (6) - ruled 2026-08-24

- [x] **D1.** Title suffix: "| Dolphin" (12 P1.5 pages) vs **"| Dolphin Centrifuge" [REC]** (sitewide) - REC why: 12 pages against ~140; unify to the majority - RULING: "| Dolphin Centrifuge" sitewide
- [x] **D2.** Person schema: "Owner and Chief Engineer" (current) vs adding **founder [REC] only if 1982 is right** - pages: src/lib/siteSchema.ts - why: third-party directories list the entity as in business since 1995, and 43 pages carry a personal "40+ years" against a 1990 degree - the auditors called this the only claim the site's own data refutes - REC: keep "Owner and Chief Engineer", move "40+ years" onto the company, and confirm the founding year separately - RULING: Keep "Owner and Chief Engineer"; move "40+ years" onto the company
- [x] **D3.** MAB hub carries seven filename-style alternateName alts - **clean them up [REC]** - pages: alfa-laval-mab-centrifuge - why: they are filenames, not model names; only the additive-only rule held this back - RULING: Clean up the filename-style alternateName alts
- [x] **D4.** Clara 20 spec heading without LAPX-404 - **add LAPX-404 [REC]** - pages: clara-20 - why: additive-only allows adding it; the heading is incomplete without it - RULING: Add LAPX-404
- [x] **D5.** Dangling "This UL documentation" reference x2 with no link - pages: explosion-proof - REC: **drop the sentence [REC]** unless you have the document to link - why: it currently points at nothing and sits in the site's house-standard hazardous-area page - RULING: Drop the UL sentence
- [x] **D6.** Duplicate BreadcrumbList (pre-existing) - **approve the cleanup [REC]** - pages: backpressure, and also wvo and nx-418 per the audit - RULING: Dedupe the breadcrumbs

---

## E. New conflicts from the zero-context audit (22) - none of these are on the original list - ruled 2026-08-24

The auditors found ~35 distinct numeric conflicts; list A covers about 9. These are the rest.

- [x] **E1.** MOPX-205 21 / 25 GPM, same page same field - pages: disc-stack-centrifuge - REC: none (need Sanjay) - why: BRAIN's DMPX-014 rated band is 22-24, which straddles both numbers - RULING: 21 GPM. Both tables aligned, TBD resolved
- [x] **E2.** MOPX-207 30 / **34 [REC]** GPM, same page same field - pages: disc-stack-centrifuge - why: BRAIN DMPX-028 rated band 33-40 contains 34 and not 30 - RULING: 34 GPM
- [x] **E3.** Micron rating 1 / **0.5 [REC]** across hero, table, FAQ and HowTo schema - pages: waste-oil, disc-stack, diesel, lube-oil, wvo, black-diesel - why: 0.5 micron is what the whpx-405 and mab-103 model pages both state - ties to A24 - RULING: 0.5 micron sitewide
- [x] **E4.** Disc-stack G-force stated as 7,000 / 8,000 / 10,000 / 12,000 for the same class - pages: waste-oil, disc-stack, oil-centrifuge, algae, disc-stack-applications - REC: **quote per model, starting 7,200 for the WHPX 405 frame [REC]** - why: G-force is a function of bowl radius and RPM, so one class-wide number is wrong by construction - ties to A5 - RULING: Quote per model; 7,200 Gs on the WHPX 405 frame, class-wide 8,000/10,000/12,000 Gs claims removed
- [x] **E5.** MAB-206 25 GPM on 2 HP vs MOPX-205 10 GPM on 4 HP on the same page - pages: oil-centrifuge - REC: none (need Sanjay) - why: BRAIN gives MAB 206 (DMB-028) 28 GPM diesel / 42 rated, so the GPM is roughly right and the 2 HP looks like the error - RULING: MAB-206 motor = 5 HP (the 2 HP figure was the error)
- [x] **E6.** MAB 205 quoted at 18 / 15 / 10 GPM - pages: lube-oil - REC: **label by fluid: 19 diesel, 29 rated, 10 lube R&O [REC]** - why: BRAIN's DMB-019 row gives exactly those, so the three site numbers are three different duties printed without their fluid - RULING: 19 GPM diesel, 29 GPM rated, 10 GPM lube R&O, each printed with its fluid
- [x] **E7.** MAB 103 weight 800 / 1,500 lbs, and a 110 V option that vanished - pages: lube-oil, mab-103 - REC: **250 lbs for the bare machine [REC]**, skid weight stated separately - why: the mab-103 model page and schema both say 250 lbs net - the 110 V question needs you - RULING: 250 lbs bare machine, skid weight stated separately. 110 V: the MAB 103 110 V single-phase option EXISTS and is restored as an available option (no further specs claimed)
- [x] **E8.** AFPX 213 bowl speed 4,150 / 4,600 RPM - pages: stainless-steel - REC: none (need Sanjay) - why: 4,150 is the WHPX 513 frame's figure, not necessarily the AFPX 213's - RULING: 4,150 RPM. Prose, spec table and schema aligned
- [x] **E9.** Disc-stack maximum feed solids 5 / 8 / 10 / ~22 percent on one page, with an embedded Alfa Laval chart visibly showing ~22 - pages: decanter-vs-disc - REC: none (need Sanjay) - why: the auditors called this the single most decision-relevant spec on the page and the site contradicts itself four ways - RULING: Up to ~22% feed solids per the Alfa Laval chart, cited on the page
- [x] **E10.** WHPX-510 on coolant 32 / 50 GPM - pages: machining-coolant-recovery - REC: none (need Sanjay) - why: the model page publishes 42 GPM diesel and 24 GPM lube at 30 cSt but nothing for water-based coolant - RULING: REMOVE the coolant GPM numbers for the WHPX 510 class; the page now says "sized per application". The DMPX-028 / MOPX 207 28 GPM coolant figure stays
- [x] **E11.** BRPX 313 "over 7,000 Gs" vs its own **6,500 Gs [REC]** table - pages: biodiesel, beer-wine - why: the page's own spec table is the more specific source and the prose is the round-up - RULING: 6,500 Gs
- [x] **E12.** NX-418 / UVNX 418 motor 25 / **20 HP [REC]** - pages: nx-418, three-phase-decanter - why: the nx-418 page prose says 25 HP while its own table two lines below says 20 HP - RULING: 20 HP
- [x] **E13.** NX-418 G-force printed as 3,150 Gs, identical to the NX-314 - pages: nx-418, dewatering - REC: **recompute, do not copy [REC]** - why: at the stated 353 mm and 4,000 RPM the NX-314's 3,157 Gs checks out exactly; the NX-418's 418 mm bowl at the same 4,000 RPM computes to about 3,740 Gs, so one of the two published numbers is a copy-paste - RULING: 3,740 Gs, recomputed for the 418 mm bowl at 4,000 RPM
- [x] **E14.** UVNX 314 15 HP / UVNX 418 25 HP on one page vs 10 HP / 20 HP on the model pages - pages: three-phase-decanter - REC: **align to the model pages: 10 HP and 20 HP [REC]** - why: the model pages carry it in table and schema; ties to A9 and E12 - RULING: UVNX 314 = 10 HP, UVNX 418 = 20 HP
- [x] **E15.** P-660 motor 7.5 / 5-10 / 5 HP, and MAB-102 G-force 8,500 vs "over 9,000" - pages: smallest - REC: **8,500 Gs [REC]** for the MAB frame (mab-103 page states 8,500); P-660 motor: none (need Sanjay) - RULING: MAB-102 = 8,500 Gs. P-660 motor = 5 HP, aligned across all three variants
- [x] **E16.** Black diesel 80 GPM headline vs a 40 GPM table maximum, and 5 vs 2 GPM elsewhere - pages: black-diesel - REC: none (need Sanjay) - why: no machine on the site is rated 80 GPM on black diesel; BRAIN's largest standard is DMPX-070 at 59-72 diesel - RULING: top capacity = 72 GPM on the DMPX-070 (Alfa Laval WHPX 513) system, named on the page; the 80 GPM headline is gone and the spec table and module list now read 72. The small-system figure is 2 GPM on the Alfa Laval MAB 104 (DMB-007), which is the smallest machine this page actually offers; the 5 GPM claims are gone. TBD resolved
- [x] **E17.** Basket ethanol recovery 70 / 80 percent, plus a radius labelled where diameter is meant - pages: ethanol-comparison - REC: none for the percentage (need Sanjay); **fix the radius/diameter label [REC]** - why: the label error makes the table dimensionally impossible - RULING: Fix the radius/diameter label. Basket ethanol recovery = 70% (the 80% figure corrected), TBD resolved
- [x] **E18.** BS&W below 0.1 percent vs below 1 percent - pages: crude-oil - REC: none (need Sanjay) - why: a factor of ten on the spec buyers judge crude treatment by - RULING: Below 0.5% BS&W
- [x] **E19.** Decanter particle range 1 micron vs 50 micron - pages: decanter-centrifuge - REC: none (need Sanjay) - why: both appear on the site as the decanter cut point and they are two orders apart - RULING: ~50 micron cut point
- [x] **E20.** Decanter cutoff 50-100 GPM vs over 100 GPM as the decanter-vs-disc-stack threshold - pages: selection-guide, decanter-vs-disc - REC: none (need Sanjay) - why: this is a sizing rule of thumb only you can set - RULING: Published as the 50-100 GPM transition band
- [x] **E21.** CHNX 418: 100 GPM headline vs its own FAQ "5-20 m3/hr" (22-88 GPM) - pages: chnx-418 - REC: **state 5-20 m3/hr (22-88 GPM) and drop the 100 [REC]** - why: the FAQ figure is the Alfa Laval throughput band for the frame; 100 GPM sits outside it - RULING: 5-20 m3/hr (22-88 GPM depending on duty); all 100 GPM claims removed
- [x] **E22.** Parts provenance said three ways: "genuine parts" (homepage), "aftermarket parts manufacturer" (about), "Beyond-OEM Rebuild" (badge) - pages: index, about, decanter-vibration and the parts cluster - REC: **use the whpx-405 page's wording sitewide [REC]** ("genuine OEM parts are made by Alfa Laval; Dolphin's compatible parts are made by other manufacturers to the same fit and function") - why: it is already live, already honest, and already yours - RULING: Use the whpx-405 page's wording sitewide

---

## F. Safety, certification and claim wording (9) - confirm or refine - ruled 2026-08-24

- [x] **F1.** CHNX 418 certification chain, shipped 2026-08-23: currently reads "built on an Alfa Laval CHNX 418 originally manufactured for ATEX service; Dolphin remanufactures it and verifies the nitrogen purge system function in its Warren MI shop; certification documentation for the original Alfa Laval build is available on request" - REC: **confirm as shipped [REC]** - RULING: Confirmed as shipped, MINUS the documentation promise
- [x] **F2.** CHNX 418 spec row now reads "Hazardous-area design: ATEX (original Alfa Laval build)" with a TBD marker - REC: **confirm and remove the TBD marker [REC]** - alternative: give the current cert status and we state it plainly - RULING: Confirmed, and the TBD marker removed
- [x] **F3.** Do you actually hold certification documents for the original Alfa Laval ATEX build, and can you produce them on request? - REC: none (need Sanjay) - why: the sentence in F1 promises a document; if it does not exist the sentence has to change - **this is the highest-consequence line on the site** - RULING: NO DOCS - the sentence changes
- [x] **F4.** Intertek: today the site credits Intertek only as the source of a sample ATEX marking tag image on /explosion-proof-centrifuge/ - confirm Intertek certifies nothing of Dolphin's - REC: **confirm, and add "example marking, not a Dolphin certification" under the image [REC]** - RULING: Confirmed, and add "example marking, not a Dolphin certification" under the image
- [x] **F5.** Sample Ex marking "ATEX II 3 G (Zone 2) II B T3" on the explosion-proof page - REC: **keep, clearly labelled as a typical example [REC]** - why: it already reads "a typical example"; the risk is a reader taking it as Dolphin's own marking - RULING: Keep, clearly labelled as a typical example
- [x] **F6.** MAB 103 and MAB 104 pages say "explosion-proof ATEX Zone II" - REC: **reword to "ATEX Zone 2 (non-sparking) configuration" [REC]** - why: same terminology error as the Class 1 Div 2 fix shipped 2026-08-23 - Zone 2 equipment is non-sparking, "explosion-proof"/flameproof is Zone 1 - also "Zone II" should be "Zone 2" - note: both are additive-only slugs, so this needs your word - RULING: Reword to "ATEX Zone 2 (non-sparking) configuration"
- [x] **F7.** WHPX 405 page: "available in ATEX Zone 2 hazardous area configurations" - REC: **confirm as written [REC]** - why: the explosion-proof page already shows a real DMPX-014 ATEX Zone 2 skid built on WHPX 405s, so this one is backed by a photo - RULING: Confirmed as written
- [x] **F8.** Nine heroes the auditors read as AI-generated or composited (wastewater, parts, diesel, decanter-vibration bearing photo, algae, alfa-laval-centrifuges "our facility", fuel-oil renders, contact, smallest) - REC: **delete all nine and run those pages on the genuine shop photos already further down the same pages [REC]** - why: every auditor who found one said it made them re-audit the whole page - pyrolysis-oil and liquid-humus were already handled overnight - RULING: Delete all nine heroes
- [x] **F9.** "6-Month Mechanical Warranty" asserted on 26 pages with no terms, exclusions or document - REC: **publish the actual terms as one linked page [REC]** - why: raised on 26 pages / 23,621 sessions; the auditors' complaint is that it is asserted three or four times per page and defined nowhere - needs your terms text - RULING: SKIPPED - parked

---

## How this gets applied

1. You tick and scribble. Nothing else needed from you.
2. One minion pass takes this filled sheet and edits every affected page in a single batch:
   prose, spec table, figure caption, meta description and JSON-LD together, so a number never
   again lands in three of the four places.
3. The ruled numbers then move into **one authoritative spec source per model** in the repo, and
   every page renders its specs from that source. After that a spec conflict is impossible to
   create by editing a page, which is the fix 11 of the 50 auditors named as their single best.
4. Anything left blank stays frozen and stays on this sheet for the next pass.

---

## R5 - final eight (ruled 2026-08-29)

These were the eight live contradictions the spec-source build guard surfaced that no earlier
ruling covered. They were listed under "Open items needing an owner ruling" in
`docs/SPEC_SOURCE.md`. All eight are now ruled and applied, and every rejected value below is
enforced by `scripts/spec-consistency-check.mjs`.

- [x] **R5-1.** MAB-102 bowl speed: prose said 9,300 RPM, spec table said 9,375 RPM - RULING: **9,375 RPM**. The prose was corrected. 9,300 RPM is rejected for the MAB-102.
- [x] **R5-2.** Sharples P-660 G-force: prose said 3,070 Gs, spec table said 3,050 Gs - RULING: **3,050 Gs**. The prose was corrected. 3,070 Gs is rejected for the P-660.
- [x] **R5-3.** NX 416 motor: table said 15 HP, prose said 20 HP - RULING: **15 HP confirmed**. The table was right. 20 HP is rejected for the NX 416 only; 20 HP remains correct for the NX 418.
- [x] **R5-4.** MOPX 207 bowl speed: DMPX-028 case study said 8,000 RPM, model page said 6,325 RPM - RULING: **6,325 RPM**. The case study was corrected. 8,000 RPM is rejected for the MOPX 207 only; it stays legitimate for other frames.
- [x] **R5-5.** NX 314 / NX 418 rated rows on `/wastewater-centrifuge/`: 80 GPM and 170 GPM against 25 GPM and 110 GPM on the model pages - RULING: **align to the model pages. NX 314 = 25 GPM stated with its fluid; NX 418 = 110 GPM on water sludge thickening.** The 80 GPM and 170 GPM claims are removed and rejected.
- [x] **R5-6.** Homepage disc-stack card carried a class-wide "12,000 x g" badge - RULING: **"Up to 8,500 Gs depending on model"** (8,500 Gs = MAB-102, the highest disc-stack figure the site publishes). 12,000 is rejected as a disc-stack class G-force claim.
- [x] **R5-7.** G2-40 G-force 3,150 RCF and AE 1,565, both cloned from the pre-correction NX 418 - RULING: **remove both from the page. No replacement invented.** The data record now carries TBD markers for G-force and AE, and 3,150 RCF / 3,150 G / 1,565 are rejected for the G2-40.
- [x] **R5-8.** DMPX-070 G-force, frozen and parked since A16 - RULING: **officially NOT PUBLISHED.** The placeholder row and TBD comment are removed from `/centrifuges/dmpx-070/`, the data record marks `gForce` intentionally unpublished, and A16's leftover is closed.
