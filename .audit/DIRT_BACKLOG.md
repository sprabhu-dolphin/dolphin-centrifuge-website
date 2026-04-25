# Page Dirt Log - v2.2 Refactor

Open cleanup items carried forward from fast-mode audits. These are findings we deliberately deferred (P1/P2 polish) so we can keep per-page velocity high. After 10 pages, we stop and knock this whole list out in a single cleanup pass.

**Batch window:** 2026-04-19 forward. Stop and clean when either (a) 10 pages have passed fast-mode audit, or (b) any single item here appears on 5+ pages.

**Rule:** Opus adds rows here during each audit. Sonnet does not read this file during per-page work - she reads only the per-page fix lists in chat.

---

## Image filename convention drift (.webp -> .jpg.webp)

The convention is `<legacy-stem>.jpg.webp` so a 301 from `/wp-content/.../foo.jpg` preserves image-search ranking. Bare `.webp` still renders (file exists on disk) but breaks the SEO continuity.

- [ ] **disc-centrifuge-parts-glossary** (commit 2297eeb, passed 2026-04-19): rename 6 files on disk and update src attributes:
  - `disc-centrifuge-bowl-body-250.webp` (line 119)
  - `disc-centrifuge-bowl-hood-250.webp` (line 141)
  - `disc-centrifuge-control-paring-disc-250.webp` (line 196)
  - `disc-centrifuge-distributing-cone-250.webp` (line 218)
  - `disc-centrifuge-distributing-cover-250.webp` (line 242)
  - `disc-centrifuge-sliding-piston-250.webp` (line 444)
- [ ] **centrifugal-filter** (commit 0d142e6, passed 2026-04-19): rename 3 files on disk and update src attributes:
  - `Oil-Centrifuge-Interior-Details.webp` (lines 52, 69 - hero + inline)
  - `Filtration-Sedimentation-Centrifuge-Difference-800.webp` (line 107)
  - `Basket-and-Decanter-Centrifuge-Comparison-600.webp` (line 126)
- [ ] **disc-centrifuge-purifier-clarifier-difference** (commit 5201128, passed 2026-04-20): rename 1 file on disk and update src:
  - `Bowl-Cross-Section-Purifier-1000.webp` (line 82, hero)
- [ ] **decanter-centrifuge-optimization** (commit 0f7bc15, passed 2026-04-20): rename 8 files on disk and update src attributes:
  - `Decanter-Weir-Plate-600.webp` (lines 65 hero + 112 inline)
  - `decanter-pond-depth-versus-torque-cake-dryness-600.webp` (line 96)
  - `decanter-deep-pond-depth.webp` (line 125)
  - `decanter-shallow-pond-depth.webp` (line 152)
  - `decanter-energy-torque-wear-noise-versus-bowl-speed.webp` (line 189)
  - `decanter-solids-recovery-versus-bowl-speed.webp` (line 211)
  - `decanter-bowl-scroll-rotation-800.webp` (line 270)
  - `Decanter-Centrifuge-Gearbox-and-Torque-Clutch-Assembly-600.webp` (line 288)
- [ ] **crude-oil-centrifuge** (commit 6e19b8c, passed 2026-04-20): rename body image files on disk and update src attributes:
  - `Alfa-Laval-3-Phase-Centrifuge-Class-1-Div-2-Crude-Oil-Hawaii-600.webp` (line 89)
  - `Crude-Oil-Tank-Bottom-Recovery-System.webp` (line 182)
  - `DMPX-042-Self-Cleaning-Disc-Stack-Centrifuge-for-Crude-Oil-Slop.webp` (line 229)
  - Four modules grid images (lines 348, 360, 372, 384)
  - Note: hero at `/images/alfa-laval-centrifuge/crude-oil-tank-bottom-centrifuge-1-e1605467045511.webp` lives in cross-folder `alfa-laval-centrifuge/` instead of `crude-oil-centrifuge/`. Verify intended folder during cleanup.
- [ ] **disc-centrifuge-troubleshoot-bowl** (commit e26128f, passed 2026-04-21): image srcs in this page use bare `.webp` instead of the `<legacy-stem>.jpg.webp` convention, and some dropped the native-width suffix (`-600` / `-800`). Verify on-disk filenames and rename to match legacy stem so 301 redirects preserve image-search ranking.
- [ ] **difference-between-decanter-centrifuge-disc-centrifuge** (commit 2c9c99d, passed 2026-04-21): all body image srcs use bare `.webp` (no `.jpg.webp`). Files to rename on disk + update srcs:
  - `decanter-bowl-scroll-rotation-400.webp` (line 67)
  - `alfa-laval-decanter-centrifuge-NX416-op6dx368c3ttxix1m81x56xt7zl05q59p69e4347ts.webp` (line 94)
  - `decanter-centrifuge-alfa-laval-nx-418.webp` (line 104)
  - `alfa-laval-disc-centrifuge-bowl-cross-section-400-1.webp` (line 117)
  - hero `disc-centrifuge-alfa-laval-whpx-510-300.webp` (line 19)
- [ ] **dewatering-centrifuge** (commit 3096099, passed 2026-04-22): body + hero image srcs use bare `.webp` (no `.jpg.webp`). Rename on disk + update srcs:
  - hero `Dewatering-Centrifuge-Cross-Section-600.webp` (line 81)
  - `Basket-and-Decanter-Centrifuge-Comparison-600.webp` (line 149)
  - Note: the animation at `/images/shared/Dewatering-Centrifuge-Animation.gif` is a `.gif`, not a `.webp` - leave it alone.
- [ ] **decanter-centrifuge-pond-depth** (commit 99c21a2, passed 2026-04-22): body + hero image srcs use bare `.webp` (no `.jpg.webp`). Rename on disk + update srcs:
  - hero `Decanter-Pond-Depth-1000.webp` (line 49) + same file re-used inline at line 95
  - `Decanter-Weir-Plate-600.webp` (line 81)
  - `Decanter-Pond-Depth-Deep-600.webp` (line 108)
  - `Decanter-Pond-Depth-Weir-Plate-500.webp` (line 282)
- [ ] **decanter-centrifuge-vibration** (commit 3931fa8, passed 2026-04-22): body + hero image srcs use bare `.webp` (no `.jpg.webp`). Rename on disk + update srcs:
  - hero `decanter-bowl-sludge-fall-over-1400.webp` (line 62)
  - `decanter-conveyor-wear-600.webp` (line 102)
  - `decanter-auger-broken-tiles-400.webp` (line 151)
  - `decanter-bowl-sludge-fall-over-600.webp` (line 172)
  - `decanter-centrifuge-bearing-failure-800.webp` (line 194)
- [ ] **machine-coolant-centrifuge** (commit c198354, passed 2026-04-22): body + hero image srcs use bare `.webp` (no `.jpg.webp`). Rename on disk + update srcs:
  - hero `Machine_Coolant_Centrifuge_CNC_Machine_Shop_1440.webp` (in ApplicationLayout prop)
  - `Alfa-Laval-Industrial-Centrifuge-for-Coolant-Recovery-700.webp` (line 147)
  - `Alfa-Laval-WSPX-207-Coolant-Centrifuge-rotated.webp` (line 160)
  - `Alfa-Laval-Industrial-Centrifuge-Coolant-600.webp` (line 193)
  - `Alfa-Laval-WSPX303-Coolant-Centrifuge.webp` (line 239)
  - `Alfa-Laval-WSB-104-Concentrator-Coolant-Centrifuge-1000.webp` (line 281)
  - 6 gallery thumbs (lines 348, 352, 356, 360, 364, 368)

## Hero image not panoramic / needs Sanjay decision

Heroes are spec'd at ~1440x500 panoramic. These pages use portrait or non-hero-class images in the `heroImage` prop.

- [ ] **centrifugal-filter**: hero is `Oil-Centrifuge-Interior-Details` at 576x600 portrait AND it is embedded again inline at the top of the body. Two options - pick one: (a) remove the `heroImage` prop and let the inline image carry, or (b) commission/select a proper panoramic hero and keep both.
- [ ] **decanter-centrifuge-optimization** (commit 0f7bc15): hero is `Decanter-Weir-Plate-600.webp` at 600x299 (not panoramic) AND same image is embedded inline in body (line 112). Pick one: (a) drop the `heroImage` prop and let inline image carry, or (b) commission a panoramic hero (e.g., decanter centrifuge exterior shot).

## TOC const labels stale after h2 rename

When legacy h2 text is restored verbatim, the `toc` const needs matching labels so the sidebar nav reads the same as the headings.

- [ ] **centrifugal-filter** (0d142e6): lines 25, 27 - `"What Is a Centrifugal Filter?"` and `"Types of Centrifugal Filters"` still the old short forms. h2s are the legacy-verbatim questions. Update labels to match.
- [ ] **difference-between-decanter-centrifuge-disc-centrifuge** (commit 2c9c99d, passed 2026-04-21): two TOC labels do not match the h2 text at their target ids:
  - `id: "physical"` label says `"Physical Characteristics (Orientation, Dimensions, Power, MOC)"` but the h2 at that id (line 153) reads `"Comparison of Decanter and Disc Centrifuges"`. Decision needed: change h2 to match label, or change label to match h2.
  - `id: "operating"` label says `"Operating Considerations (Solids Discharge, Design, Controls)"` but the h2 at that id (line 423) reads `"Operating Considerations"` (no parenthetical). Trim the label or add the parenthetical to the h2.
- [ ] **decanter-centrifuge-pond-depth** (commit 99c21a2, passed 2026-04-22): TOC entry `id: "nx314-table"` label says `"NX-314-B31 Pond Depth & Bowl Volume"` but the h4 at that id (line 212) reads `"Alfa Laval NX-314-B31 Pond Depth and Bowl Volume"`. Trim or expand to match.

## Structural h2 scaffolding

- [ ] **disc-centrifuge-parts-glossary** (2297eeb): line 81 has an extra `<h2>Disc Centrifuge Parts Glossary</h2>` as a wrapper above the 20 part h3s. Legacy had this string only as the page title (h1). Low priority - consider dropping if the parts flow cleanly under the h1 without it.

## Author byline inside body prose (not present in legacy visible body)

Legacy pages carry author on the JSON-LD / metadata only, not as an inline "by Sanjay Prabhu MSME..." line in body prose. If Sonnet adds one, flag for removal during batch cleanup.

- [ ] **disc-centrifuge-troubleshoot-bowl** (commit e26128f, passed 2026-04-21): line ~298 has `by Sanjay Prabhu MSME, Engineering Manager, Dolphin Centrifuge` inline in body. Legacy body does not contain this. Remove during batch cleanup (author stays in JSON-LD only).
- [ ] **dewatering-centrifuge** (commit 3096099, passed 2026-04-22): line 293 has `By Sanjay Prabhu MSME, Engineering Manager, Dolphin Centrifuge` inline in body. Remove during batch cleanup.
- [ ] **decanter-centrifuge-pond-depth** (commit 99c21a2, passed 2026-04-22): line 292 has `by Sanjay Prabhu MSME, Engineering Manager, Dolphin Centrifuge` inline in body. Remove during batch cleanup (author stays in JSON-LD only).

## En-dashes (–, U+2013) in body headings - convert to regular hyphen

Sanjay's preference is regular `-` everywhere. Em-dashes are zero-tolerance during per-page audits; en-dashes carry through from legacy WordPress and are deferred to batch cleanup.

- [ ] **difference-between-decanter-centrifuge-disc-centrifuge** (commit 2c9c99d, passed 2026-04-21): 6 en-dashes in h4/h5 headings - lines 183, 191, 298, 304, 320, 330. Replace `–` with ` - ` in each.

---

## Body images using inline style instead of img-cap-N utility class

Per PAGE_APPEARANCE_LOOK.md Step 4 (simplified 2026-04-20), body images on ApplicationLayout pages must use an `img-cap-N` utility class on the `<img>` tag, never inline `style="max-width:..."`. This is the single source of truth for body-image sizing.

- [x] **crude-oil-centrifuge** (resolved at commit e0557d3, 2026-04-20): three body images now use `img-cap-400` / `img-cap-600` classes. Only remaining inline-style images are the four 200-px module grid thumbs (acceptable - they live in a `not-prose` wrapper and the 200px size has no matching utility class).

## Invisible text on dark CTA boxes (contrast failure)

Per new PAGE_APPEARANCE_LOOK.md Step 5: any `bg-navy` / `bg-slate-8|9` / `bg-gray-8|9` block with inline `<a>` tags that lack an explicit light color class renders links as invisible dark-on-dark text (only the gold underline is visible).

Confirmed broken (Sanjay screenshots 2026-04-20):
- [ ] "Get a Quote / Sample Testing" CTA box - appears site-wide via shared component. Locate the component in `src/components/` (likely `CtaBox.astro`, `QuoteSampleBox.astro`, or similar); give paragraph text `text-white` / `text-gray-100`; give inline `<a>` tags `text-white underline hover:text-gold` (or `text-gold` directly).
- [ ] "If you have simple, routine questions... 40+ years of disc-stack centrifuge experience into [link] [link]" FAQ callout box - also appears across multiple pages. Same fix pattern as above.

Once the shared components are fixed, ALL passed pages using them are fixed at once - no need to touch individual slug files unless they define their own inline dark boxes.

**Part of 10-page batch cleanup.** Grep sweep after cleanup:
```
grep -rn "bg-navy\|bg-slate-8\|bg-slate-9\|bg-gray-8\|bg-gray-9" src/
```
For every hit, verify the block has `text-white` (or equivalent) on paragraphs and an explicit light class on every `<a>`.

---

## Batch cleanup checklist (run when list is full)

- [ ] Run the image rename pass: `git mv <old>.webp <old>.jpg.webp` for every file above, then find-and-replace in src attributes across all astro files.
- [ ] Update TOC label consts to match restored legacy h2 text.
- [ ] Resolve each hero decision with Sanjay.
- [ ] Fix the shared dark-CTA components (Get a Quote box, FAQ callout box) per Step 5 contrast rule; then grep-sweep `src/` for any remaining dark-bg blocks lacking explicit light text classes.
- [ ] Re-audit each touched slug in fast-mode to confirm nothing else regressed.
- [ ] Single commit: `chore(v2.2): dirt-log cleanup batch N`.
- [ ] Archive this log to `.audit/_history/DIRT_BACKLOG-batch-N.md` and start a fresh one.

---

## Dark navy CTA/info box vertical spacing - pre-launch punch list

**Status: DEFERRED. Not a blocker. Do not revisit during page-by-page migration.**
**Opened: 2026-04-25. Reopen only on Sanjay's explicit instruction.**

Dark navy cards and CTA boxes still run slightly too tall vertically across several pages. Current state is acceptable for shipping but not at the target "compact, information-dense" visual density.

**Scope:** GLOBAL - affects shared components used on every page.

**Files already tightened (commits 1f6c7cb, a098fba):**
- `src/styles/global.css` - semantic contact link utility classes
- `src/layouts/ApplicationLayout.astro` - bottom CTA and sidebar contact card
- `src/pages/contact-for-alfa-laval-centrifuges.astro` - Reach Us Directly tile + bottom CTA

**Remaining work for pre-launch pass:**
- [ ] Verify all application pages: sidebar card and bottom CTA feel compact enough after `a098fba`
- [ ] Verify product pages with dark sidebar cards
- [ ] Verify knowledge/article pages with dark bottom CTA
- [ ] Verify Footer.astro CTA banner (full-width banner - may warrant slightly more padding than card tiles)
- [ ] Review Hero.astro dark overlay CTA button stack if padding there is also too generous
- [ ] Confirm address wrapped line in "Reach Us Directly" tile does not break icon alignment on narrow viewports
- [ ] Regression check: nav dropdown links, inline phone/email in dark boxes, FAQ-adjacent dark CTAs

**Target design rule:**
Navy information tiles and dark CTA/contact cards should feel compact and information-dense.
Prefer py-4 to py-6 for card-format tiles. Reserve py-8+ for full-width section banners only.

