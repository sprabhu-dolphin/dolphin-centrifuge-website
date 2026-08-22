# Operation Daylight - P3+ priority ranking

Data-driven fix order for the pages not yet touched by P1 or P2. Companion to
`docs/DAYLIGHT_PLAN.md` (rules and messaging) and `docs/daylight-audit-digest.json`
(per-page findings and fix text). Generated 2026-08-22.

## Scope

- **Excluded (P1, shipped 2026-08-21/22):** the 11 `/centrifuges/` DMPX-DMB product pages
  plus `/dmpx-014-self-cleaning-3-phase-disc-stack-centrifuge/`.
- **Excluded (P2, already assigned):** the 8 identity-layer pages, listed below for reference.
- **Ranked here: 128 pages** - 124 audited pages from the digest plus 4 live pages the audit
  never covered (flagged `unaudited`).

## Data sources

| Source | What it contributed | Freshness |
|---|---|---|
| `ga4-landing-pages-top160.xlsx` (repo root) | Sessions, key events per landing page (161 rows) | GA4 export, top 160 landing pages |
| `public/_redirects` | Folded legacy 301 traffic into its live target (matters for `/stainless-steel-centrifuge/`) | current |
| `docs/daylight-audit-digest.json` | Verdict (40 major / 104 minor) and issue types per page | audit 2026-08-21 |
| `Dolphin SEO DOE/metrics-history.csv` | GSC clicks/impressions per page, latest snapshot 2026-07-29 | 2026-07-29 |
| `Dolphin SEO DOE/executor-blocks/Executor_Block_AP-0810-03.md` | D1 lead attribution by landing page, 28d to 2026-08-09 | 2026-08-10 |
| `dolphin-growth-ops/ai-sov/runs/2026-07-18/` | Which Dolphin URLs the 5 AI engines actually cite, and the 10 buyer prompts where rivals get named and Dolphin does not | baseline run 2026-07-18 |

## How the rank was computed

Traffic leads, severity is the strong second, AI visibility is the tie-breaker that
promotes pages that are already an AI landing spot or that should be one.

```
score = 30 * log10(GA4 sessions + 1)          # traffic, dominant term
      + 22 if verdict = major, 8 if unaudited  # audit severity
      + 3 per AI citation (cap 12)             # pages AI engines already cite
      + 8 if the page answers an AI-gap prompt # pages AI engines should cite
      + 10 per grade-A D1 lead (cap 15), 3 per B
      + small GA4 key-event bonus (cap 6)
```

A `major` verdict is worth roughly a 5x traffic gap, so a high-traffic `minor` page
still outranks a low-traffic `major` one - which is the intent.

## P2 (assigned) - identity layer, not ranked here

| Page | Traffic signal | Verdict | Main issues |
|---|---|---|---|
| `/` | 6368, GSC 52 clk, **3 A-leads** | minor<br>AI-cited x29 | manufacturer claim x2, contradiction, scrubbed captions, schema |
| `/alfa-laval-centrifuges/` | 542, GSC 2 clk | major | manufacturer claim, AL platform hidden, contradiction |
| `/alfa-laval-centrifuge-selection-guide/` | 302, GSC 6 clk | major<br>AI-cited x2 | AL platform hidden x2, contradiction, no AL model named |
| `/contact-for-alfa-laval-centrifuges/` | 371, GSC 1 clk | major | manufacturer claim, contradiction, scrubbed captions, schema |
| `/about-dolphin-centrifuge/` | 257, GSC 2 clk, **1 A-lead** | minor<br>AI-cited x3 | manufacturer claim, AL platform hidden, no AL model named, schema |
| `/dolphin-centrifuge-customer-testimonials/` | 51 | major | manufacturer claim, AL platform hidden, contradiction, schema |
| `/industrial-centrifuge/` | 1892, GSC 29 clk, 1 B-lead | major | manufacturer claim, contradiction, scrubbed captions x3, schema |
| `/disc-stack-centrifuge/` | 1642, GSC 44 clk | major<br>AI-cited x13 | manufacturer claim, scrubbed captions x2, schema |

P2 also carries the schema plumbing fix noted in `DAYLIGHT_HANDOFF.md`: `BaseLayout`'s
`normalizeProductSchema` drops Product JSON-LD on price-free pages, so every corrected
`brand` / `alternateName` below stays invisible to crawlers until that is fixed. Do it in
P2 or the whole P3 schema column is wasted work.

## P3 batches

128 pages, ranked. Batches of 10 (last one 8), in fix order.

### P3-a (10 pages)

| Rank | Page | Traffic signal | Verdict | Main issues |
|---|---|---|---|---|
| 1 | `/decanter-centrifuge/` | 1722, GSC 36 clk | major<br>AI-cited x2<br>AI gap: F30/H37 decanter supply | manufacturer claim, scrubbed captions x2, schema, other |
| 2 | `/waste-oil-centrifuge/` | 1989, GSC 27 clk, **3 A-leads** | minor<br>AI-cited x26 | manufacturer claim, contradiction x2, scrubbed captions, schema, other |
| 3 | `/diesel-centrifuge/` | 1065, GSC 34 clk, 1 B-lead | major<br>AI-cited x12 | manufacturer claim, AL platform hidden x2, contradiction x2, schema |
| 4 | `/alfa-laval-centrifuge-parts/` | 1503, GSC 8 clk, 2 B-leads | minor<br>AI-cited x6<br>AI gap: B10/I41 parts+service | manufacturer claim x2 |
| 5 | `/alfa-laval-centrifugal-separator/` | 2893, GSC 13 clk | minor<br>AI-cited x3 | scrubbed captions x3, schema |
| 6 | `/wastewater-centrifuge/` | 1821, GSC 9 clk | minor<br>AI-cited x1<br>AI gap: F31 produced water | manufacturer claim x2, contradiction, scrubbed captions x2, schema |
| 7 | `/lube-oil-centrifuge/` | 769, GSC 15 clk | minor<br>AI-cited x4<br>AI gap: E26 turbine oil | manufacturer claim, AL platform hidden, contradiction, schema |
| 8 | `/alfa-laval-centrifuge/` | 1585, GSC 2 clk | minor<br>AI gap: C14 buy used AL | contradiction x2, scrubbed captions x2 |
| 9 | `/algae-centrifuge/` | 544, GSC 18 clk, 1 B-lead | major | manufacturer claim, contradiction, no AL model named, scrubbed captions, schema, other |
| 10 | `/crude-oil-centrifuge/` | 825, GSC 16 clk | minor<br>AI-cited x2<br>AI gap: F31 produced water | contradiction, scrubbed captions, schema |

### P3-b (10 pages)

| Rank | Page | Traffic signal | Verdict | Main issues |
|---|---|---|---|---|
| 11 | `/decanter-centrifuge-differential-speed/` | 1719, GSC 29 clk | minor | AL platform hidden, no AL model named, schema |
| 12 | `/fuel-oil-centrifuge/` | 449, GSC 13 clk | minor<br>AI-cited x8<br>AI gap: B09 marine recon | contradiction, no AL model named, schema |
| 13 | `/disc-stack-centrifuge-applications/` | 255, GSC 8 clk | major<br>AI-cited x1 | manufacturer claim, AL platform hidden x2, scrubbed captions x2, schema |
| 14 | `/wvo-centrifuge-separator/` | 280, GSC 21 clk, **5 A-leads** | minor<br>AI-cited x2 | manufacturer claim, AL platform hidden, no AL model named, scrubbed captions, schema, other x2 |
| 15 | `/beer-wine-centrifuge/` | 256, GSC 3 clk | major | AL platform hidden, scrubbed captions x2, schema, other |
| 16 | `/used-oil-centrifuge/` | 152, GSC 6 clk | major<br>AI gap: D23 re-refining | manufacturer claim, contradiction, no AL model named, scrubbed captions, schema, other |
| 17 | `/difference-between-decanter-centrifuge-disc-centrifuge/` | 657, GSC 15 clk | minor<br>AI-cited x3 | no AL model named, scrubbed captions, schema |
| 18 | `/disc-centrifuge-parts-glossary/` | 1073, GSC 33 clk | minor<br>AI-cited x1 | contradiction, scrubbed captions, schema |
| 19 | `/centrifugal-filter/` | 1049, GSC 45 clk | minor<br>AI-cited x1 | AL platform hidden, contradiction, no AL model named |
| 20 | `/oil-centrifuge/` | 980, GSC 28 clk | minor<br>AI-cited x1 | manufacturer claim x2, schema |

### P3-c (10 pages)

| Rank | Page | Traffic signal | Verdict | Main issues |
|---|---|---|---|---|
| 21 | `/industrial-disc-centrifuge-repair/` | 220 | minor<br>AI-cited x7<br>AI gap: B10 marine service | manufacturer claim, AL platform hidden, contradiction, schema |
| 22 | `/biodiesel-centrifuge/` | 448, GSC 10 clk, 1 B-lead | minor<br>AI-cited x3 | manufacturer claim, no AL model named, scrubbed captions, schema |
| 23 | `/dewatering-centrifuge/` | 642, GSC 4 clk | minor<br>AI gap: H39 sludge dewatering | contradiction, scrubbed captions, schema |
| 24 | `/disc-centrifuge-troubleshoot-bowl/` | 740, GSC 29 clk | minor<br>AI-cited x1 | no AL model named, scrubbed captions, schema |
| 25 | `/decanter-centrifuge-optimization/` | 864, GSC 21 clk | minor | AL platform hidden, no AL model named, schema |
| 26 | `/disc-centrifuge-purifier-clarifier-difference/` | 988, GSC 61 clk | minor | contradiction, scrubbed captions, schema |
| 27 | `/alfa-laval-nx-418-decanter-centrifuge/` | 224, GSC 18 clk, **1 A-lead** | minor<br>AI gap: H37 used decanters | contradiction, scrubbed captions x2, schema |
| 28 | `/stainless-steel-centrifuge/` | 752 (230 + 522 via 301), GSC 3 clk | minor | AL platform hidden, scrubbed captions x2, schema |
| 29 | `/alfa-laval-mab-104-centrifuge/` | 153, GSC 4 clk | major | manufacturer claim, contradiction, schema |
| 30 | `/machine-coolant-centrifuge/` | 563, GSC 5 clk | minor | manufacturer claim, contradiction x2, scrubbed captions x2, schema |

### P3-d (10 pages)

| Rank | Page | Traffic signal | Verdict | Main issues |
|---|---|---|---|---|
| 31 | `/quench-oil-centrifuge/` | 50, GSC 3 clk | major<br>AI-cited x5 | manufacturer claim, AL platform hidden, no AL model named x2, scrubbed captions x2, schema |
| 32 | `/decanter-centrifuge-vibration/` | 583, GSC 15 clk | minor | AL platform hidden x2, no AL model named, scrubbed captions, schema |
| 33 | `/alfa-laval-whpx-405/` | 98, GSC 8 clk | major<br>AI-cited x1 | manufacturer claim x2, schema |
| 34 | `/disc-stack-centrifuge-rental/` | 91, GSC 6 clk | major | AL platform hidden, contradiction x3, schema |
| 35 | `/decanter-centrifuge-pond-depth/` | 626, GSC 13 clk | minor | scrubbed captions x2, schema |
| 36 | `/disc-stack-centrifuge-faq/` | 410, GSC 7 clk | minor<br>AI-cited x1 | AL platform hidden, schema, other |
| 37 | `/disc-stack-centrifuge-mechanical-issues-fixes/` | 111, GSC 5 clk | major | AL platform hidden, no AL model named, scrubbed captions, schema |
| 38 | `/alfa-laval-whpx-513/` | 119, GSC 3 clk, **1 A-lead** | minor<br>AI-cited x3 | scrubbed captions x2, schema, other |
| 39 | `/centrifuge-rcf-rpm-difference-calculation/` | 490, GSC 3 clk | minor | contradiction x2 |
| 40 | `/three-phase-decanter/` | 250, GSC 2 clk | minor<br>AI gap: F30 oilfield decanter | contradiction, schema, other |

### P3-e (10 pages)

| Rank | Page | Traffic signal | Verdict | Main issues |
|---|---|---|---|---|
| 41 | `/disc-stack-centrifuge-bad-separation/` | 95, GSC 4 clk | major | AL platform hidden, no AL model named, scrubbed captions, schema |
| 42 | `/alfa-laval-clara-20-food-grade-centrifuge/` | 92, GSC 2 clk | major | manufacturer claim, no AL model named, scrubbed captions |
| 43 | `/containerized-industrial-centrifuge/` | 90, GSC 1 clk | major | manufacturer claim, AL platform hidden, no AL model named, scrubbed captions, schema |
| 44 | `/disc-centrifuge-backpressure/` | 405, GSC 10 clk | minor | no AL model named, scrubbed captions, schema |
| 45 | `/machining-coolant-recovery-centrifuge/` | 86, GSC 5 clk | major | manufacturer claim, AL platform hidden x2, contradiction x2, scrubbed captions, schema |
| 46 | `/disc-stack-centrifuge-operating-water/` | 246, GSC 15 clk | unaudited | NOT AUDITED - digest has no entry |
| 47 | `/sharples-p-3000-decanter/` | 198, GSC 7 clk | minor<br>AI gap: H37 used decanters | contradiction, schema, other |
| 48 | `/yellow-grease-purification-centrifuge/` | 83, GSC 3 clk | major | manufacturer claim, contradiction x2, scrubbed captions, schema, other |
| 49 | `/alfa-laval-g2-40-decanter/` | 189, GSC 4 clk | minor<br>AI gap: H38 recon AL decanter | contradiction, scrubbed captions |
| 50 | `/pyrolysis-oil-centrifuge/` | 69, GSC 2 clk | major | manufacturer claim, contradiction x2, schema |

### P3-f (10 pages)

| Rank | Page | Traffic signal | Verdict | Main issues |
|---|---|---|---|---|
| 51 | `/alfa-laval-btpx-205-biotech-centrifuge/` | 152, GSC 4 clk, **1 A-lead** | minor | schema x2 |
| 52 | `/alfa-laval-whpx-510-centrifuge/` | 61, GSC 7 clk | major | manufacturer claim x2, contradiction, scrubbed captions |
| 53 | `/sharples-p-3400-decanter/` | 164, GSC 12 clk | minor<br>AI gap: H37 used decanters | schema, other x2 |
| 54 | `/ethanol-extraction-centrifuges-technical-comparison/` | 280, GSC 4 clk | minor | no AL model named, scrubbed captions x2, schema |
| 55 | `/disc-stack-centrifuge-efficiency/` | 217, GSC 11 clk | minor | AL platform hidden, schema |
| 56 | `/disc-stack-centrifuge-sludge-ejection-cycle-time/` | 217, GSC 4 clk | minor | scrubbed captions, schema |
| 57 | `/alfa-laval-mopx-207-centrifuge/` | 135, GSC 15 clk | minor<br>AI gap: B09/B11 MOPX-WHPX | schema x2 |
| 58 | `/smallest-industrial-centrifuges/` | 238, GSC 8 clk | minor | scrubbed captions, other x2 |
| 59 | `/disc-stack-centrifuge-liquid-seal-break/` | 290, GSC 10 clk | minor | AL platform hidden, no AL model named, schema |
| 60 | `/crude-oil-tank-bottom-recovery-centrifuge/` | 155, GSC 5 clk | minor<br>AI gap: F32 tank farm | AL platform hidden, no AL model named, scrubbed captions, schema |

### P3-g (10 pages)

| Rank | Page | Traffic signal | Verdict | Main issues |
|---|---|---|---|---|
| 61 | `/disc-stack-centrifuge-options/` | 251, GSC 1 clk | minor | manufacturer claim, schema |
| 62 | `/explosion-proof-centrifuge/` | 127, GSC 8 clk, **1 A-lead** | minor | manufacturer claim, AL platform hidden, scrubbed captions, schema |
| 63 | `/disc-stack-centrifuge-troubleshooting-bowl-leaking/` | 264, GSC 12 clk | minor | AL platform hidden, no AL model named, scrubbed captions, schema |
| 64 | `/alfa-laval-mab-103-centrifuge/` | 157, GSC 3 clk | minor<br>AI-cited x1 | contradiction, scrubbed captions, schema |
| 65 | `/alfa-laval-mopx-209-centrifuge/` | 35, GSC 3 clk | major<br>AI-cited x1 | manufacturer claim, schema |
| 66 | `/alfa-laval-chnx-418-decanter/` | 43, GSC 1 clk | major | manufacturer claim, scrubbed captions, schema |
| 67 | `/decanter-centrifuge-rental/` | 79, GSC 5 clk | unaudited | NOT AUDITED - digest has no entry |
| 68 | `/alfa-laval-disc-centrifuge-accessories/` | 42 | major | AL platform hidden, contradiction, no AL model named, scrubbed captions |
| 69 | `/fish-processing-centrifuge/` | 132, GSC 4 clk | minor<br>AI-cited x2 | contradiction, scrubbed captions x2, schema |
| 70 | `/black-diesel-centrifuge/` | 208, GSC 7 clk | minor | AL platform hidden, schema |

### P3-h (10 pages)

| Rank | Page | Traffic signal | Verdict | Main issues |
|---|---|---|---|---|
| 71 | `/hydraulic-oil-centrifuge/` | 111, GSC 7 clk | minor<br>AI gap: E25 hydraulic water | AL platform hidden, no AL model named, scrubbed captions, schema |
| 72 | `/disc-stack-centrifuge-vibration/` | 178, GSC 2 clk | minor<br>AI-cited x1 | no AL model named, scrubbed captions, schema |
| 73 | `/industrial-centrifuges-faq/` | 39, GSC 1 clk | major | AL platform hidden, contradiction x2, no AL model named x2, schema |
| 74 | `/disc-centrifuge-friction-clutch/` | 194, GSC 11 clk | minor | scrubbed captions, schema |
| 75 | `/disc-stack-centrifuge-remove-metals-ash-used-oil/` | 175, GSC 7 clk | minor | AL platform hidden, scrubbed captions x2, schema |
| 76 | `/disadvantages-disc-stack-centrifuge/` | 173, GSC 2 clk | minor | scrubbed captions, schema |
| 77 | `/industrial-centrifuge-sample-testing/` | 163, GSC 3 clk | minor | no AL model named x2, schema |
| 78 | `/picking-the-right-industrial-centrifuge/` | 71, GSC 1 clk | minor<br>AI-cited x4 | contradiction, schema |
| 79 | `/alfa-laval-nx-314-decanter-centrifuge/` | 148, GSC 8 clk | minor | contradiction x2, scrubbed captions |
| 80 | `/disc-stack-centrifuge-capacity/` | 107, GSC 4 clk | minor<br>AI-cited x2 | no AL model named, schema |

### P3-i (10 pages)

| Rank | Page | Traffic signal | Verdict | Main issues |
|---|---|---|---|---|
| 81 | `/industrial-wastewater-centrifuge-silicon-wafer-facility/` | 29 | major | manufacturer claim, AL platform hidden, contradiction, scrubbed captions, schema |
| 82 | `/disc-centrifuge-cannot-reach-operating-speed/` | 144, GSC 12 clk | minor | no AL model named, scrubbed captions, schema |
| 83 | `/food-grade-centrifuge/` | 82, GSC 6 clk | unaudited | NOT AUDITED - digest has no entry |
| 84 | `/used-oil-centrifuge-plant/` | 73, GSC 1 clk | minor<br>AI gap: D23 re-refining | AL platform hidden, contradiction, no AL model named, other |
| 85 | `/can-a-centrifuge-separate-salt-from-water/` | 130, GSC 1 clk | minor | schema |
| 86 | `/alfa-laval-industrial-centrifuges/` | 109, GSC 2 clk | minor | contradiction x2, scrubbed captions, schema |
| 87 | `/alfa-laval-lapx-404-disc-centrifuge/` | 126, GSC 12 clk | minor | scrubbed captions |
| 88 | `/disc-stack-centrifuge-installation/` | 115, GSC 5 clk | minor | manufacturer claim, AL platform hidden, schema |
| 89 | `/waste-oil-centrifuge-case-study-marine-and-industrial-waste-oil-recovery/` | 121, GSC 3 clk | minor | manufacturer claim, contradiction, scrubbed captions, schema, other |
| 90 | `/liquid-humus-centrifuge/` | 120, GSC 1 clk | minor | AL platform hidden, contradiction, scrubbed captions x2, schema |

### P3-j (10 pages)

| Rank | Page | Traffic signal | Verdict | Main issues |
|---|---|---|---|---|
| 91 | `/decanter-centrifuge-applications/` | 112, GSC 6 clk | minor | scrubbed captions x3 |
| 92 | `/manure-centrifuge-separator/` | 101, GSC 1 clk | minor | no AL model named, scrubbed captions, schema |
| 93 | `/alfa-laval-mab-centrifuge/` | 79, GSC 4 clk | minor<br>AI-cited x1 | AL platform hidden, schema |
| 94 | `/explosion-proof-stainless-steel-centrifuge/` | 88 | minor | contradiction, scrubbed captions x2, schema |
| 95 | `/alfa-laval-wspx-303-centrifuge/` | 102, GSC 1 clk | minor | manufacturer claim, contradiction, schema, other |
| 96 | `/waste-oil-emulsion-centrifuge/` | 97, GSC 3 clk | minor | AL platform hidden, scrubbed captions x2, schema |
| 97 | `/cutting-oil-centrifuge/` | 93, GSC 5 clk | minor | manufacturer claim, contradiction, scrubbed captions, schema |
| 98 | `/centrifuge-product-loss-during-discharge/` | 91, GSC 7 clk | minor | AL platform hidden, no AL model named, other |
| 99 | `/industrial-washer-fluid-centrifuge/` | 90, GSC 2 clk | minor | contradiction, no AL model named, scrubbed captions, schema |
| 100 | `/disc-centrifuge-troubleshooting-paring-disc-block/` | 76, GSC 9 clk | minor | manufacturer claim, no AL model named, schema |

### P3-k (10 pages)

| Rank | Page | Traffic signal | Verdict | Main issues |
|---|---|---|---|---|
| 101 | `/centrifuge-clogged-bowl-discs/` | 75, GSC 4 clk | minor | AL platform hidden, no AL model named, schema |
| 102 | `/industrial-centrifuge-training/` | 73, GSC 2 clk | minor | scrubbed captions x2, schema |
| 103 | `/disc-stack-centrifuge-performance/` | 71, GSC 2 clk | minor | no AL model named, schema |
| 104 | `/industrial-centrifuge-design/` | 55, GSC 3 clk | minor<br>AI-cited x1 | manufacturer claim, AL platform hidden x2, schema |
| 105 | `/industrial-centrifuge-controls/` | 63, GSC 4 clk | minor | no AL model named x2 |
| 106 | `/disc-stack-centrifuge-parts/` | 62, GSC 2 clk | minor | scrubbed captions, schema |
| 107 | `/disc-stack-centrifuge-lubrication/` | 58, GSC 2 clk | minor | AL platform hidden, no AL model named, schema |
| 108 | `/alfa-laval-whpx-513-clarifier-centrifuge-module/` | 53, GSC 2 clk | minor | manufacturer claim, AL platform hidden, schema |
| 109 | `/extrusion-industry-centrifuge-application/` | 43, GSC 2 clk | minor | manufacturer claim, AL platform hidden, no AL model named, schema |
| 110 | `/disc-stack-centrifuge-offshore-applications/` | 36 | minor | AL platform hidden, scrubbed captions, schema |

### P3-l (10 pages)

| Rank | Page | Traffic signal | Verdict | Main issues |
|---|---|---|---|---|
| 111 | `/tramp-oil-centrifuge/` | 36, GSC 2 clk | minor | manufacturer claim, no AL model named, scrubbed captions, schema |
| 112 | `/alfa-laval-wspx-307/` | 34 | minor | manufacturer claim x2, contradiction, schema |
| 113 | `/alfa-laval-wspx-207-self-cleaning-coolant-centrifuge/` | 32 | minor | manufacturer claim x2, contradiction, schema |
| 114 | `/fluid-heating-systems/` | 31, GSC 1 clk | minor | AL platform hidden, no AL model named |
| 115 | `/dolphin-centrifuge-privacy-policy/` | 16 | unaudited | NOT AUDITED - digest has no entry |
| 116 | `/alfa-laval-wspx-407/` | 17, GSC 3 clk | minor | manufacturer claim x2, contradiction, schema |
| 117 | `/industrial-centrifuge-buyback/` | 7, GSC 1 clk | minor | manufacturer claim x2, schema |
| 118 | `/epc-industrial-centrifuge-systems/` | 0, GSC 1 clk | major | manufacturer claim, AL platform hidden, contradiction, scrubbed captions x2, schema |
| 119 | `/wastewater-centrifuges-types-applications-amp-photos-dolphin-centrifuge/` | 0, GSC 1 clk | major | manufacturer claim, AL platform hidden x2, contradiction x2, no AL model named x2, scrubbed captions x2, schema |
| 120 | `/centrifuge-reconditioning-standard/` | 0 | minor<br>AI-cited x4<br>AI gap: C14/J48 recon proof | manufacturer claim, AL platform hidden, contradiction, scrubbed captions |

### P3-m (8 pages)

| Rank | Page | Traffic signal | Verdict | Main issues |
|---|---|---|---|---|
| 121 | `/alfa-laval-diesel-centrifuge/` | 0 | minor<br>AI-cited x2 | AL platform hidden, contradiction x2, scrubbed captions |
| 122 | `/knowledge-case-studies/` | 0, GSC 1 clk | minor | AL platform hidden, contradiction, no AL model named, schema |
| 123 | `/knowledge-center/` | 0 | minor | AL platform hidden, contradiction |
| 124 | `/knowledge-comparisons/` | 0 | minor | AL platform hidden, contradiction, no AL model named |
| 125 | `/knowledge-guides/` | 0, GSC 3 clk | minor | AL platform hidden, no AL model named |
| 126 | `/knowledge-product-brand/` | 0 | minor | manufacturer claim, AL platform hidden |
| 127 | `/knowledge-troubleshooting/` | 0, GSC 2 clk | minor | AL platform hidden |
| 128 | `/sample-testing-case-studies/` | 0 | minor | no AL model named, schema, other |

## Notes and flags

- **`/stainless-steel-centrifuge/` carries hidden weight.** Three retired cannabis/hemp
  slugs 301 into it (`cannabis-thc-extraction-centrifuge` 206, `hemp-extraction-centrifuge`
  237, `hemp-biomass-centrifuge` 79), so its true landing traffic is 752 sessions, not 230.
  Ranked on the folded number.
- **Four live pages are missing from the audit digest** and are ranked as `unaudited`:
  `/decanter-centrifuge-rental/`, `/disc-stack-centrifuge-operating-water/`,
  `/food-grade-centrifuge/`, `/dolphin-centrifuge-privacy-policy/`. Audit them when their
  batch comes up.
- **Decanters are the weakest AI category.** claude-sonnet-5 and grok-4.3 both scored 0% on
  category H (decanters); three of the ten worst GEO-gap prompts are decanter or oilfield
  questions. Every decanter page from P3-a through P3-f should get explicit "reconditioned
  Alfa Laval NX / G2 decanters, sold and rebuilt in the US" language, not just schema patches.
- **Two pages rank low on traffic but high on AI value - consider pulling them forward.**
  `/centrifuge-reconditioning-standard/` (rank 120) has zero GA4 sessions because it is
  newer than the export, yet it is cited 4 times by AI engines and is the natural answer to
  C14 ("where can I buy a used Alfa Laval centrifuge") and J48 ("are reconditioned
  centrifuges as good as new") - both prompts where 4-5 of 5 models named a rival and none
  named Dolphin. `/epc-industrial-centrifuge-systems/` (rank 118) is a `major` verdict with
  no traffic history at all. Both are cheap fixes; slot them into an earlier batch if there
  is room.
- `/dolphin-centrifuge-privacy-policy/` (rank 115) is a legal page. It needs a read-through,
  not Daylight messaging work.
- **`/waste-oil-centrifuge/` is the single most-cited Dolphin URL in AI answers** (26
  citations across the 5 engines) and produced 3 grade-A leads. It is `minor` in the digest
  but sits at rank 2 for that reason - do not let the minor verdict push it into P4.
- **D1 says `/wvo-centrifuge-separator/` is the top A-lead producer sitewide** (5 A-leads in
  28 days, more than the homepage and `/waste-oil-centrifuge/` combined) on only 280 GA4
  sessions. Its rank is lead-driven, not traffic-driven. Treat it as a money page.
- GSC numbers come from the SEO DOE snapshot dated 2026-07-29. The live `gsc-weekly` route has
  been 401ing for four weeks (see the 2026-08-10 weekly report), so there is no fresher
  organic-click source; GA4 sessions carry the traffic signal.
- The AI SOV baseline is 2026-07-18, before any Daylight edits. Re-run it after P3 lands to
  measure whether open Alfa Laval naming moves citations.
