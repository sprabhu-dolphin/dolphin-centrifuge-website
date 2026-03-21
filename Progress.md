## Pipeline Log

### 2026-03-21 — Batch A: Knowledge Pages with Hazy Charts (Full Pipeline)

| Page Slug | SEO | Template | Image | Checker | Build | Deployed | Commit |
|-----------|-----|----------|-------|---------|-------|----------|--------|
| decanter-centrifuge-pond-depth | ✓ | ✓ | ✓ SVG chart | PASS 11/11 | ✓ | ✓ CF Pages | 92f0116 |
| decanter-centrifuge-optimization | ✓ | ✓ | ✓ 2x SVG | PASS | ✓ | ✓ CF Pages | 92f0116 |
| disc-stack-centrifuge-capacity | ✓ | ✓ | ✓ 2x SVG | PASS | ✓ | ✓ CF Pages | 92f0116 |
| disc-stack-centrifuge-efficiency | ✓ | ✓ | ✓ 2x SVG | PASS | ✓ | ✓ CF Pages | 92f0116 |
| centrifuge-rcf-rpm-difference-calculation | ✓ | ✓ | ✓ Live Calc | PASS | ✓ | ✓ CF Pages | 92f0116 |

**What was done per page:**
- Hazy chart images replaced with inline SVG (brand colors: Navy #1B3A5C, Gold #E8A317)
- Live JS calculator added (RCF page + differential speed page)
- Title tags fixed to ≤60 chars
- Meta descriptions 150-160 chars
- FAQ expanded to 5 items with FAQPage JSON-LD
- Bottom CTA navy bar + mid-page gold callout CTA
- Dead links fixed, color tokens normalized (no hardcoded hex)
- JSON-LD Person schema fixed with jobTitle/worksFor

### Queue (Batch B — next up)
Application pages: food-grade-centrifuge, beer-wine-centrifuge, algae-centrifuge, wastewater-centrifuge, dewatering-centrifuge, manure-centrifuge-separator, fish-processing-centrifuge, stainless-steel-centrifuge, tramp-oil-centrifuge, quench-oil-centrifuge, extrusion-industry-centrifuge-application, yellow-grease-purification-centrifuge

---

### 2026-03-21 — Full Site Image Audit (All 154 pages)

#### Summary
Completed full 8-point image audit across all 154 non-homepage pages using programmatic Python scripts.

| Check | Result |
|-------|--------|
| C4: Hero image prop present | ✅ 0 failures |
| C5: WebP format (no .jpg/.png in img src) | ✅ 0 failures |
| C6: File sizes (<200KB) | ✅ 0 failures |
| C7: Dimensions (width/height attrs) | ✅ 0 failures |
| C8: Lazy loading attr | ✅ 0 failures |
| C1: Legacy images present | ✅ 123 PASS, 4 acceptable gaps, 26 no-legacy (new pages) |
| C3: Alt tags non-empty | ✅ 0 failures |

#### Batch changes committed

**Commit `69b284f`** — Added heroImage to 13 pages missing it:
dmb-019, dmb-028, dmb-037, dmb-062, decanter-centrifuge-optimization, decanter-centrifuge-vibration,
disc-stack-centrifuge-sludge-ejection-cycle-time, disc-stack-centrifuge-vibration,
dolphin-centrifuge-customer-testimonials, knowledge-case-studies, knowledge-product-brand,
knowledge-troubleshooting, disc-stack-centrifuge-applications (broken path fixed),
dmb-004/007/013 (broken paths fixed)

**Commit `134437a`** — Wire missing legacy images + fix attrs:
- diesel-centrifuge: 2 C1D2 images added
- difference-between-decanter-disc: NX-418 decanter image
- explosion-proof-stainless-steel: SS explosion-proof image
- food-grade-centrifuge: CRPX-207 image
- fish-processing-centrifuge: empty alt fixed
- industrial-washer-fluid: 4 images added
- waste-oil-centrifuge: WHPX-410 image
- wvo-centrifuge-separator: grease trap image
- alfa-laval-centrifuges: width/height attrs added to 7 img tags
- disc-stack-centrifuge-vibration: loading="lazy" added to gif
- dolphin-centrifuge-privacy-policy: heroImage added

**Other fixes (same session):**
- 801 JPG/PNG images batch-converted to WebP (quality 82) via convert_webp.mjs + sharp
- 19 meta descriptions trimmed to ≤165 chars via fix_descriptions.py

#### Acceptable image gaps (not fixable — no source images)
- explosion-proof-stainless-steel: cert logos (mark%20sample.png, atex_iecex_marking.jpg) — not in legacy image folder
- wvo-centrifuge-separator: NX-314 decanter WebP doesn't exist

#### Temp audit scripts (in site root, not committed)
audit_images.py, audit_sizes.py, audit_legacy.py, audit_legacy2.py, fix_descriptions.py, convert_webp.mjs

---

### 2026-03-20

| Page Slug | SEO | Template | Image | Build | Deployed | Notes |
|-----------|-----|----------|-------|-------|----------|-------|
| waste-oil-centrifuge | ✓ | ✓ | ✓ | ✓ | ✓ | Custom BaseLayout + Hero frost, DolphinCharts, Pattern A |
| fuel-oil-centrifuge | ✓ | ✓ | ✓ | ✓ | ✓ | Hero image added, 3 legacy images, fixed "21 Gs" typo |
| lube-oil-centrifuge | ✓ | ✓ | ✓ | ✓ | ✓ | Hero image added, 5 legacy images, fixed "5 Gs" typo |
| biodiesel-centrifuge | ✓ | ✓ | ✓ | ✓ | ✓ | Hero image added, 5 legacy images |
| hydraulic-oil-centrifuge | ✓ | ✓ | ✓ | ✓ | ✓ | 4 legacy images in alternating Pattern A |
| diesel-centrifuge | ✓ | ✓ | ✓ | ✓ | ✓ | Hero image, 4 legacy images, meta desc trimmed |
| crude-oil-centrifuge | ✓ | ✓ | ✓ | ✓ | ✓ | Converted BaseLayout→ApplicationLayout, 7 images Pattern A |
| cutting-oil-centrifuge | ✓ | ✓ | ✓ | ✓ | ✓ | Hero image, 3 legacy images, summary trimmed |
| used-oil-centrifuge | ✓ | ✓ | ✓ | ✓ | ✓ | Hero image, 5 legacy images, fixed "40 Gs" typo |
| machine-coolant-centrifuge | ✓ | ✓ | ✓ | ✓ | ✓ | Hero image, 3 legacy images, summary + meta trimmed |
| black-diesel-centrifuge | ✓ | ✓ | ✓ | ✓ | ✓ | Hero image, 2 legacy images, fixed "60 Gs" typo |
| wvo-centrifuge-separator | ✓ | ✓ | ✓ | ✓ | ✓ | Hero image, 6 legacy images, meta desc fixed |
| waste-oil-emulsion-centrifuge | ✓ | ✓ | ✓ | ✓ | ✓ | Fixed broken hero path, 4 legacy images, fixed "24248 Gs" |

### Foundation
- ApplicationLayout.astro → frosted-glass Hero (affects ~80 pages)
- Hero.astro → frost overlay mode working

### Queue (next up) — Batch 4 in progress
- food-grade-centrifuge ⏳
- beer-wine-centrifuge ⏳
- algae-centrifuge ⏳
- yellow-grease-purification-centrifuge ⏳
- wastewater-centrifuge
- dewatering-centrifuge
- manure-centrifuge-separator
- liquid-humus-centrifuge
- stainless-steel-centrifuge
- tramp-oil-centrifuge
- quench-oil-centrifuge
- industrial-washer-fluid-centrifuge
- extrusion-industry-centrifuge-application
