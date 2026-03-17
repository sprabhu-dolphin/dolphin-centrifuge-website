# Image Gaps — Pages Needing Photos

Generated: 2026-03-16

## Summary

- **74 pages** have inline images
- **3 pages** had WebP images wired up in this session
- **48 pages** have JPG/PNG images in their `public/images/{slug}/` folder but need WebP conversion
- **15 pages** have no image assets at all (hub pages, FAQ, privacy, contact, etc.)

---

## Images Wired Up (this session)

These pages had WebP files in `public/images/{slug}/` but were not referencing them:

| Page | Image Added |
|------|------------|
| `/dmpx-014-self-cleaning-3-phase-disc-stack-centrifuge/` | `DMPX-014-Self-Cleaning-Centrifuge-modified-Alfa-Laval-Disc-Stack-Centrifuge-Hydraulic-Oil-600.webp` (content image) |
| `/extrusion-industry-centrifuge-application/` | Same WebP (hero image path fixed — was pointing to nonexistent `/images/applications/`) |
| `/hydraulic-oil-centrifuge/` | Same WebP (hero image added via `heroImage` prop) |

---

## Pages with JPG/PNG Images — Need WebP Conversion

These pages have image files in `public/images/{slug}/` but only in JPG/PNG format.
Convert to WebP before adding `<img>` tags.

| # | Page | Image Files Available |
|---|------|---------------------|
| 1 | `/alfa-laval-btpx-205-biotech-centrifuge/` | 3 JPGs (BTPX-205 product photos, bowl cross-section) |
| 2 | `/alfa-laval-centrifuges/` | 22 JPGs (product catalog photos — disc stacks, decanters, systems) |
| 3 | `/alfa-laval-chnx-418-decanter/` | 2 JPGs (decanter rotating assembly, cross-section) |
| 4 | `/alfa-laval-clara-20-food-grade-centrifuge/` | 1 JPG (LAPX-404 bowl cross-section) |
| 5 | `/alfa-laval-g2-40-decanter/` | 2 JPGs (decanter rotating assembly, cross-section) |
| 6 | `/alfa-laval-lapx-404-disc-centrifuge/` | 1 JPG (BTPX-205 bowl cross-section) |
| 7 | `/alfa-laval-mopx-209-centrifuge/` | 7 JPGs (MOPX-209 product photos, various applications) |
| 8 | `/alfa-laval-whpx-405/` | 8 JPGs (WHPX-405 product photos, ATEX system, quench oil) |
| 9 | `/alfa-laval-whpx-510-centrifuge/` | 7 JPGs (WHPX-510 product photos, crude oil, WVO) |
| 10 | `/alfa-laval-whpx-513-clarifier-centrifuge-module/` | 1 JPG (WHPX-513 wastewater clarification) |
| 11 | `/alfa-laval-whpx-513/` | 11 JPGs (WHPX-513 product photos, crude oil, HFO, used oil) |
| 12 | `/alfa-laval-wspx-207-self-cleaning-coolant-centrifuge/` | 2 JPGs (coolant centrifuge, stainless steel) |
| 13 | `/alfa-laval-wspx-307/` | 1 JPG (WSPX-307 coolant centrifuge) |
| 14 | `/alfa-laval-wspx-407/` | 1 JPG (WSPX-407 coolant centrifuge) |
| 15 | `/beer-wine-centrifuge/` | 4 JPGs (BRPX-309, BRPX-313, AFPX-213, hemp extraction) |
| 16 | `/biodiesel-centrifuge/` | 6 JPGs (MAB-206, MAB-205, MAB-207, MOPX-207, system diagram) |
| 17 | `/black-diesel-centrifuge/` | 2 JPGs (FOPX-613, MOPX-205) |
| 18 | `/cutting-oil-centrifuge/` | 4 JPGs (draw oil, MOPX-207, MOPX-209, cutting oil system) |
| 19 | `/decanter-centrifuge-rental/` | 7 JPGs (NX-416, NX-418, NX-314, ethanol decanter, wastewater) |
| 20 | `/diesel-centrifuge/` | 12 JPGs (extensive diesel centrifuge photos, C1D2, offshore, DMPX-014) |
| 21 | `/disc-stack-centrifuge-faq/` | 1 JPG (BRPX-213 stainless steel) |
| 22 | `/disc-stack-centrifuge-rental/` | 3 JPGs (rental centrifuge photos) |
| 23 | `/fluid-heating-systems/` | 3 JPGs (heater module, crude oil heater, fluid heating loop) |
| 24 | `/food-grade-centrifuge/` | 5 JPGs (CRPX-207, stainless steel, food-grade 3-phase) |
| 25 | `/fuel-oil-centrifuge/` | 5 JPGs (explosion-proof, FOPX-613, MOPX-205, fuel oil system) |
| 26 | `/industrial-centrifuge-controls/` | 3 JPGs (control panel, controls screen) |
| 27 | `/industrial-centrifuge-design/` | 3 JPGs (BRPX-213, NX-314 CAD, centrifugal filter decanter) |
| 28 | `/industrial-centrifuge-sample-testing/` | 2 JPGs (pilot testing results, sample testing header) |
| 29 | `/industrial-centrifuge-training/` | 2 JPGs (training, disc-stack repair) |
| 30 | `/industrial-washer-fluid-centrifuge/` | 8 JPGs (wash water centrifuge photos, WSB-104, WSPX models) |
| 31 | `/liquid-humus-centrifuge/` | 7 JPGs (algae centrifuge, before/after, humic acid testing, NX-314) |
| 32 | `/lube-oil-centrifuge/` | 6 JPGs (lubricating oil purifier, MAB-103, MAB-206, DMPX-014) |
| 33 | `/machine-coolant-centrifuge/` | 12 JPGs (extensive coolant centrifuge photos, multiple models) |
| 34 | `/machining-coolant-recovery-centrifuge/` | 4 JPGs (coolant pasteurizing, WSPX-307, recovery system) |
| 35 | `/manure-centrifuge-separator/` | 2 JPGs (manure decanter section, P-3000 wastewater) |
| 36 | `/quench-oil-centrifuge/` | 5 JPGs (WHPX-405, DMPX-014, quench oil centrifuge) |
| 37 | `/sharples-p-3000-decanter/` | 3 JPGs (P-3000 rotating assembly, waste oil, wastewater) |
| 38 | `/sharples-p-3400-decanter/` | 1 JPG (P-3400 oilfield decanter) |
| 39 | `/stainless-steel-centrifuge/` | 11 JPGs (extensive SS centrifuge photos, food-grade, ethanol) |
| 40 | `/used-oil-centrifuge/` | 6 JPGs (MOPX-207, WHPX-510, DMPX-014, plant layout) |
| 41 | `/waste-oil-centrifuges-lp/` | 4 files (3 JPGs + 1 PNG — MOPX-207, WHPX-407, DMPX-014) |
| 42 | `/waste-oil-emulsion-centrifuge/` | 6 files (5 JPGs + 1 PNG — waste oil emulsion photos) |
| 43 | `/wastewater-centrifuges-types-applications-amp-photos-dolphin-centrifuge/` | 11 JPGs (wastewater before/after, DMPX-070, DMPX-028, decanters) |
| 44 | `/wvo-centrifuge-separator/` | 10 JPGs (WVO processing, MAPX-207, MOPX-209, NX-314, plant layout) |
| 45 | `/yellow-grease-purification-centrifuge/` | 6 files (5 JPGs + 1 PNG — WVO/grease centrifuge photos) |

---

## Pages with No Images at All — Sanjay Needs to Supply Photos

These pages have no image directory or their directory is empty:

| # | Page | Notes |
|---|------|-------|
| 1 | `/alfa-laval-wspx-303-centrifuge/` | Product page — needs product photo |
| 2 | `/contact-for-alfa-laval-centrifuges/` | Contact page — may not need images |
| 3 | `/dolphin-centrifuge-customer-testimonials/` | Could use team/facility photos |
| 4 | `/dolphin-centrifuge-privacy-policy/` | Does not need images |
| 5 | `/industrial-centrifuge-buyback/` | Service page — could use facility/equipment photo |
| 6 | `/industrial-centrifuges-faq/` | FAQ page — optional |
| 7 | `/knowledge-case-studies/` | Hub page — intentionally text-based |
| 8 | `/knowledge-center/` | Hub page — intentionally text-based |
| 9 | `/knowledge-comparisons/` | Hub page — intentionally text-based |
| 10 | `/knowledge-guides/` | Hub page — intentionally text-based |
| 11 | `/knowledge-product-brand/` | Hub page — intentionally text-based |
| 12 | `/knowledge-troubleshooting/` | Hub page — intentionally text-based |
| 13 | `/applications/food-beverage/` | Hub page — intentionally text-based |
| 14 | `/applications/index/` | Hub page — intentionally text-based |
| 15 | `/applications/industrial-fluids/` | Hub page — intentionally text-based |
| 16 | `/applications/oil-fuel/` | Hub page — intentionally text-based |
| 17 | `/applications/water-environment/` | Hub page — intentionally text-based |
| 18 | `/index/` | Homepage — uses component-based images (slider), not inline `<img>` |
| 19 | `/waste-oil-centrifuges-lp/` | Landing page — has JPGs but no WebP (listed in conversion section above) |

---

## Recommended Next Steps

1. **Batch-convert all JPGs to WebP** — Run `cwebp -q 80` on all JPG files in `public/images/` to create WebP versions
2. **Wire up converted WebP images** into the 45 pages listed above
3. **Supply photos for product pages** missing any images (e.g., WSPX-303)
4. **Hub/knowledge pages** are intentionally minimal — no images needed unless Sanjay wants them
