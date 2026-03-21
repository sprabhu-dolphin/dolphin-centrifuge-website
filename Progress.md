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

### 2026-03-21 — Full Site Pipeline: Batches B through E (ALL 155 pages)

**Commits: a4afbdf → 8915a1a → 556c66c → 9382095**
**Deployed: https://master.dolphin-centrifuge-staging.pages.dev**

#### What was applied to EVERY page across the site:
- Title tag ≤60 chars
- Meta description 150-165 chars
- AI summary paragraph 30-50 words, brand-first
- FAQ: 5 items with `<details>/<summary>` + `border-l-4 border-gold/40` + gold chevron
- FAQPage JSON-LD matching 5 visible items
- Article JSON-LD: Person author, jobTitle "Centrifuge Applications Engineer", worksFor "Dolphin Centrifuge", url
- 5+ internal links per page
- Mid-page gold callout CTA → /industrial-centrifuge-sample-testing/
- Bottom navy CTA bar → /contact-for-alfa-laval-centrifuges/
- Color tokens normalized (no hardcoded hex)
- Dead links fixed
- img tags: width, height, alt, loading="lazy"

#### Pages processed by batch:

**Batch B (18 application pages):** fuel-oil, diesel, lube-oil, waste-oil, crude-oil, hydraulic-oil, food-grade, beer-wine, algae, fish-processing, wastewater, dewatering, manure-separator, stainless-steel, machine-coolant, cutting-oil, tramp-oil, yellow-grease

**Batch B cont. (19 more application pages):** explosion-proof (×2), extrusion, quench-oil, containerized, washer-fluid, liquid-humus, used-oil, pyrolysis, biodiesel, black-diesel, WVO, crude-tank-bottom, machining-coolant, waste-oil-emulsion, oil-centrifuge, used-oil-plant, decanter-hub, three-phase, dmpx-014

**Batch C (Service/Rental, 8 pages):** sample-testing, repair, training, controls, design, buyback, decanter-rental, disc-stack-rental

**Batch D (Disc stack knowledge, 9 pages):** options, parts, performance, installation, offshore, operating-water, lubrication, faq, industrial-centrifuges-faq

**Batch D (Troubleshooting, 12 pages):** bad-separation, bowl-leaking, mechanical-issues, sludge-ejection, vibration (×2), clogged-bowl, product-loss, backpressure, cannot-reach-speed, friction-clutch, troubleshoot-bowl

**Batch D (AL product pages, 27 pages):** All WHPX/WSPX/MAB/MOPX/NX/CHNX/G2/centrifuge-parts/btpx-205/lapx-404/clara-20/diesel/accessories + hub pages

**Batch D (Comparison/knowledge, 10 pages):** difference-between, disadvantages, parts-glossary, purifier-clarifier, paring-disc-block, liquid-seal-break, remove-metals, can-separate-salt, smallest, picking-right

**Batch E (Application hubs + case studies, 9 pages):** disc-stack-applications, decanter-applications, case-study, silicon-wafer, wastewater-types-photos, waste-oil-lp, centrifugal-filter, ethanol-comparison, al-diesel

**Batch E (About/info/knowledge hubs, 12 pages):** about, contact, testimonials, fluid-heating, knowledge-center, knowledge-guides, knowledge-comparisons, knowledge-case-studies, knowledge-product-brand, knowledge-troubleshooting, sharples-3000, sharples-3400

**Batch E (centrifuges/ subfolder, 11 pages):** dmpx-010/028/042/070, dmb-004/007/013/019/028/037/062

**Final batch (applications/ subfolder + accessories, 10 pages):** index, crude-oil, fuels, industrial-oils, oil-based-fluids, used-motor-oil, waste-veggie-oil, wastewater, water-based-fluids, al-disc-accessories

#### SVG Charts (Batch A specialty work):
- decanter-centrifuge-pond-depth: 3-curve SVG (clarity/dryness/torque)
- decanter-centrifuge-optimization: 2 SVGs (energy metrics + solids recovery)
- disc-stack-centrifuge-capacity: 2 SVGs (clarity vs flow + efficiency vs flow)
- disc-stack-centrifuge-efficiency: same 2 SVGs
- centrifuge-rcf-rpm: live RCF calculator (5-range color-coded)
- decanter-centrifuge-differential-speed: live differential speed calculator

#### Build status: 155 pages, 0 errors ✓
#### Git status: clean, pushed to origin/master ✓
#### Deploy: https://master.dolphin-centrifuge-staging.pages.dev ✓

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
