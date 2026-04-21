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

## Hero image not panoramic / needs Sanjay decision

Heroes are spec'd at ~1440x500 panoramic. These pages use portrait or non-hero-class images in the `heroImage` prop.

- [ ] **centrifugal-filter**: hero is `Oil-Centrifuge-Interior-Details` at 576x600 portrait AND it is embedded again inline at the top of the body. Two options - pick one: (a) remove the `heroImage` prop and let the inline image carry, or (b) commission/select a proper panoramic hero and keep both.
- [ ] **decanter-centrifuge-optimization** (commit 0f7bc15): hero is `Decanter-Weir-Plate-600.webp` at 600x299 (not panoramic) AND same image is embedded inline in body (line 112). Pick one: (a) drop the `heroImage` prop and let inline image carry, or (b) commission a panoramic hero (e.g., decanter centrifuge exterior shot).

## TOC const labels stale after h2 rename

When legacy h2 text is restored verbatim, the `toc` const needs matching labels so the sidebar nav reads the same as the headings.

- [ ] **centrifugal-filter** (0d142e6): lines 25, 27 - `"What Is a Centrifugal Filter?"` and `"Types of Centrifugal Filters"` still the old short forms. h2s are the legacy-verbatim questions. Update labels to match.

## Structural h2 scaffolding

- [ ] **disc-centrifuge-parts-glossary** (2297eeb): line 81 has an extra `<h2>Disc Centrifuge Parts Glossary</h2>` as a wrapper above the 20 part h3s. Legacy had this string only as the page title (h1). Low priority - consider dropping if the parts flow cleanly under the h1 without it.

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
- [RESOLVED 2026-04-21] lube-oil-centrifuge: MAB 205 caption `Centrifuge` drop
- [RESOLVED 2026-04-21] lube-oil-centrifuge: h2 `Advantages` shortened to legacy
