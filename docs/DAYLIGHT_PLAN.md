# Operation Daylight - website fix plan

Owner ruling (Sanjay, 2026-08-21): stop hiding Alfa Laval. DMPX/DMB codes stay as Dolphin
system names, but every page is open that the machines are remanufactured Alfa Lavals -
brand, model numbers, photo captions, schema. Full background:
`DOLPHIN_NOMENCLATURE_POLICY_REVERSAL.md` (repo root). Audit of all 149 pages (2026-08-21,
per-page findings and fix text): `docs/daylight-audit-digest.json`. Published worklist:
the "Operation Daylight" artifact in Sanjay's claude.ai gallery.

## Working rules (apply to every batch)

- URL slugs NEVER change.
- Legacy `/alfa-laval-*` pages: ADDITIVE edits only - never reword existing content.
- Never claim Dolphin is authorized by or affiliated with Alfa Laval; one non-affiliation
  sentence per product page ("Dolphin is an independent remanufacturer...").
- Product JSON-LD: brand = Alfa Laval, alternateName = base machine, Dolphin = seller,
  never manufacturer.
- Customer-facing copy: concise, natural, no em dashes, no invented claims.
- Numeric spec conflicts between pages: flag for Sanjay, do not pick a number.
- Wording: "centrifuge", never "clarifier", as the machine noun (clarifier only when explaining the 2-phase configuration).
- Images (Sanjay, 2026-08-21, corrected): no compositing/editing of photos. But a photo of the
  WRONG model on a model page is a blocker - find a genuine photo of the correct model in the
  repo or in Dolphin's photo library (C:\Dolphin Marine Services, N:\) and swap it in, so the
  page reads legitimate to buyers and AI crawlers. Only if no correct-model photo exists
  anywhere: keep the existing photo with an honest model-neutral caption and flag it.
- Small batches; build must pass after every batch; Sanjay reviews before deploy.

## Model cross-reference (from CENTRIFUGE_BRAIN v7.0 - authoritative)

DMB-004=MAB 103, DMB-007=MAB 104, DMB-013=MAB 204, DMB-019=MAB 205, DMB-028=MAB 206,
DMB-037=MAB 207, DMB-062=MAB 209. DMPX-010=MMPX 304 (also MMPX 404/MAPX 204),
DMPX-014=WHPX 405 (MOPX 205), DMPX-028=MOPX 207 primary per Sanjay 2026-08-21 (WHPX 407 alternative),
DMPX-042=MOPX 209/210 primary per Sanjay 2026-08-21 (WHPX 410/510, MAPX 210 alternatives),
DMPX-070=WHPX 513 (MOPX 213, MAPX 313, FOPX 613).

## Batches, in priority order

- [x] **P1 - 12 DMPX/DMB product pages** (done 2026-08-21 in the root-out session:
  platform sentence, Base machine spec row, honest alts, schema, category labels;
  uncommitted in working tree - review, commit, deploy).
- [ ] **P2 - entry pages (~8):** index, alfa-laval-centrifuges, alfa-laval-centrifuge-selection-guide,
  contact-for-alfa-laval-centrifuges, about-dolphin-centrifuge,
  dolphin-centrifuge-customer-testimonials, industrial-centrifuge, disc-stack-centrifuge.
  Fix per digest: misleading manufacturer claims, hidden platform, contradictions.
- [ ] **P3 - remaining ~20 "major" pages** (see digest, verdict=major, not covered above).
- [ ] **P4 - minor sweep (104 pages, verdict=minor):** mostly Product/Article schema
  (brand/alternateName) and alt-text restorations. Batches of ~20, largely scriptable.
- [ ] **P5 - after each deploy:** live spot-checks; watch inquiries and AI-search
  citations for the DMPX pages.

## Known flags awaiting Sanjay

- MAB 209 photo refresh (2026-08-21): Sanjay has a beautiful MAB 209 skid arriving shortly
  and will shoot a new photo. When available, update BOTH the MAB 209 section of
  /alfa-laval-mab-centrifuge/ and the /centrifuges/dmb-062/ hero (current photo is a
  correct but dated MAB 209 shot).

- DMB-004 page says ~4 GPM diesel; /alfa-laval-mab-103-centrifuge/ says 3 GPM (BRAIN
  table says 4). Decide the number once, apply everywhere.
- Some DMB hero photos show a different MAB model than the page's base machine
  (see P1 batch report) - swap photos or keep honest generic captions.
