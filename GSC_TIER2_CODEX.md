# GSC Tier-2 Traffic Expansion — Codex Instruction Pack

**Source:** GSC "Insights" opportunity pull (recent 28d). These pages have HIGH impressions but LOW CTR and/or page-2/3 rankings — big untapped traffic. Diagnosed by 4 analyst sub-agents + Claude.

**Scope (same discipline as Tier-1):** TITLE/META rewrites + surface exact high-impression search phrases + internal links. Two clearly-marked OPTIONAL larger adds at the end (don't do unless approved).

**Hard guardrails (do NOT violate):**
- Never invent specs, prices, or claims. Items marked ⚠️ VERIFY must be confirmed present on the page before publishing — **drop any clause that isn't on-page.**
- "Free" rule: advice/consultation/tech-support may be called free; nothing physical/sample/shipping is ever free.
- **Preserve each field's existing HTML-entity style** (these pages use a raw `&` in title/pageTitle — keep raw `&`, do NOT convert to `&amp;`).
- Preserve all existing classes/attributes when editing a heading — change only the text.
- Cannibalization is resolved below — follow the ownership map exactly so pages stop competing.

After each page: commit + report SHA. Claude audits (git diff + build + zero-context read).

---

## ★ 1. /decanter-centrifuge/  — CENTERPIECE (13,638 impr/28d, ~0.3% CTR — biggest untapped page on the site)
File: `src/pages/decanter-centrifuge.astro` (note: `disableTitleSuffix={true}` — title is the full SERP title)

**1a. Title + pageTitle (lines 184-185)** — both lines
FROM: `Decanter Centrifuge | Working, Types, Benefits, Cost, Specs, Uses`
TO:   `Decanter Centrifuge - Reconditioned Alfa Laval | Dolphin`

**1b. Description (line 186)** — ⚠️ VERIFY on page: "50+ units in stock", "40+ years", "Warren MI", warranty, on-site startup, free ongoing tech support. Drop any not present; if the in-stock count differs, use the real one.
FROM: `description="Working, types, benefits, cost, specifications, and uses of a decanter centrifuge. Illustrated guide to everything you want to know about these centrifuges!"`
TO:   `description="Reconditioned Alfa Laval decanter centrifuges from Dolphin - 40+ years' expertise, units in stock in Warren, MI. Warranty, ongoing tech support, and on-site startup. Get a quote."`

**1c. Surface "decanter centrifuge manufacturer" (173 impr, pos 13.7) — H2 (line 493)**
FROM: `<h2 id="manufacturers" ...>Manufacturers</h2>`  (keep all existing attributes)
TO:   change inner text to `Decanter Centrifuge Manufacturers`

**1d. Surface "industrial decanter centrifuge" (302 impr) — opening (line 208)**
FROM: `A decanter centrifuge is an industrial centrifuge that continuously separates solids from liquids.`
TO:   `A decanter centrifuge is an industrial centrifuge that continuously separates solids from liquids. An industrial decanter centrifuge does this continuously, at scale, with no filter media.`

**1e. Surface "decanter machine" (254 impr, pos 7.6) + "centrifugal decanter" (173 impr)** — in the AEO capsule / opening (~lines 201-208), add ONE natural alias clause, e.g.: `Also called a decanter machine or centrifugal decanter, it ...`. Do not over-repeat.

**1f. Internal links IN** — anchor → `/decanter-centrifuge/` from:
- `/three-phase-decanter/` (anchor: **decanter centrifuge**)
- `/alfa-laval-nx-418-decanter-centrifuge/` + `/alfa-laval-nx-314-decanter-centrifuge/` (anchor: **Alfa Laval decanter centrifuge**)
- `/industrial-centrifuge/` (anchor: **industrial decanter centrifuge**)

---

## 2. /centrifugal-filter/  (4,398 impr, ranks pos 5-7 for head terms at ~0% CTR)
File: `src/pages/centrifugal-filter.astro`

**2a. Title (line 91)**
FROM: `Centrifugal Filter | Working Principle, Types, Benefits, Applications`
TO:   `Centrifugal Filter & Centrifugal Filtration | How It Works`

**2b. Description (line 92)**
FROM: `description="A centrifugal filter separates a range of particles based on their density, whereas a conventional filter separates particles based on their size."`
TO:   `description="How a centrifugal filter works: it separates solids and water from oil, fuel, and process liquids by density using centrifugal force - no replaceable filter media. See types, pros and cons, and applications."`

**2c. Headings** — surface exact queries:
- H2 `Working Principle` → `Centrifugal Filter Working Principle` (this query already gets 8.7% CTR at pos 4.1)
- H2 `What is a centrifuge or centrifugal filter?` → `What is a Centrifugal Filter? (Centrifuge Filter Basics)`

**2d. DO NOT** title-target "centrifugal oil filter" (different product — spin-on/cartridge intent) or "centrifugal separator" (owned by `/oil-centrifuge/`).

---

## 3. /alfa-laval-centrifugal-separator/  (4,159 impr; owns the BRANDED separator cluster)
File: `src/pages/alfa-laval-centrifugal-separator.astro`

**3a. Title + pageTitle (lines 113-114)** — both lines
FROM: `Alfa Laval Centrifugal Separator | Working, Uses, Benefits, Types & Size`
TO:   `Alfa Laval Centrifugal Separator | Models, Specs & How It Works`

**3b. Description (line 116)** — ⚠️ VERIFY "12,000 Gs" + "0.5-micron" are on the page (sub-agent cites ~lines 140/160). Drop figures if absent.
FROM: `description="An Alfa Laval centrifugal separator is a mechanical device that leverages high centrifugal force to separate liquid from solids and liquids from liquids."`
TO:   `description="Alfa Laval centrifugal separators explained: disc-stack and decanter types, up to 12,000 Gs and 0.5-micron separation, model specs, and applications. Remanufactured Alfa Laval separators from Dolphin Centrifuge."`

**3c. Headings:**
- H2 `Types of Centrifugal Separators` → `Types of Alfa Laval Centrifugal Separators`
- H-tag `Disc Stack Separators` (~line 692) → `Alfa Laval Disc Stack Separators (Disk Stack Centrifuge)`

**3d. Internal link OUT (cannibalization resolver):** add a contextual link to `/oil-centrifuge/` with anchor **centrifugal separator** (cedes the generic term to the Tier-1 owner). This page keeps only the BRANDED "alfa laval …" terms — do NOT title-target generic "centrifugal separator".

---

## 4. /lube-oil-centrifuge/  (pos ~26 — worst underperformer; bleeds the "separator/purifier" variants)
File: `src/pages/lube-oil-centrifuge.astro`  (NOTE: `pageTitle` line 164 = visible H1; `title` line 163 = meta/schema — edit BOTH)

**4a. pageTitle (line 164)**
FROM: `Lube Oil Centrifuge | Continuous Water & Solids Separation`
TO:   `Lube Oil Centrifuge & Separator | Water & Solids Removal`

**4b. title (line 163)**
FROM: `Lube Oil Centrifuge | Benefits, Specs, and Operation`
TO:   `Lube Oil Centrifuge | Lube Oil Purifier & Separator Systems`

**4c. Description (line 165)**
FROM: `description="Lube oil centrifuge systems separate fine sediment and free water from lubricating oil. Call Dolphin for portable Alfa Laval lube oil centrifuge systems."`
TO:   `description="A lube oil centrifuge (lube oil purifier / separator) removes free water, soot, and fine wear particles from turbine and lubricating oil - no filter media. Portable & skid-mounted Alfa Laval systems from Dolphin."`

**4d. Surface "separator"/"purifier"/"lubrication oil" variants — alias line (line 185)**
FROM: `These centrifuges are also known as Lube Oil Purifiers or Lube Oil Conditioning Modules.`
TO:   `These centrifuges are also known as Lube Oil Separators, Lube Oil Purifiers, or Lubrication Oil Conditioning Modules. A lube oil centrifuge and a lube oil separator are the same machine.`

**4e. Overview H2 (line 205)** `What is a Lube Oil Centrifuge?` → `What is a Lube Oil Centrifuge (Lube Oil Purifier)?` and add "...also called a lube oil separator or centrifugal oil separator..." in the first sentence.

**4f. Internal links IN** (concentrate lube anchors here, fix cannibalization with /oil-centrifuge/):
- from `/oil-centrifuge/` anchor **lube oil purifier**
- from `/alfa-laval-centrifugal-separator/` anchor **lube oil separator**

---

## 5. /fuel-oil-centrifuge/  (2,061 impr, pos ~19; ranks well for HFO/marine, bleeds "separator/purifier")
File: `src/pages/fuel-oil-centrifuge.astro`

**5a. Title (line 128)**
FROM: `Fuel Oil Centrifuge | HFO Sludge & Water Separator`
TO:   `Fuel Oil Centrifuge & Separator | HFO Purifier Systems`

**5b. Description (line 129)** — ⚠️ VERIFY "21-105 GPM" on page; drop if absent.
FROM: `description="A fuel oil centrifuge is a disc-stack centrifuge configured to separate fuel from water and sludge. Untreated fuel oil cannot be used directly in engines."`
TO:   `description="A fuel oil centrifuge (HFO purifier / separator) removes water, sludge, and metals from heavy & marine fuel oil before it reaches the engine. Self-cleaning Alfa Laval systems from Dolphin."`

**5c. Surface phrases:** add "...also called a **heavy fuel oil purifier**..." near the HFO H2; add one sentence: "Because it removes free water as well as sludge, a fuel oil centrifuge also acts as an **oil water separator** for the fuel system."

**5d. Internal links:** reciprocal strong link with `/diesel-centrifuge/` (anchor **fuel oil centrifuge**); inbound from `/alfa-laval-centrifugal-separator/` anchor **fuel oil separator**.

---

## 6. /wastewater-centrifuge/  (4,682 impr, 0 clicks; = the COMMERCIAL sludge hub)
File: `src/pages/wastewater-centrifuge.astro`

**6a. Title + pageTitle (lines 120-121)** — both lines
FROM: `Wastewater Centrifuge | Sludge Dewatering & Thickening`
TO:   `Sludge Dewatering Centrifuge | Wastewater Sludge Thickening`

**6b. Description (line 122)** — ⚠️ VERIFY "US-built, test-run, on-site startup" consistent with page.
FROM: `description="A wastewater centrifuge is a separation machine that utilizes high centrifugal force to dewater sludge. The separated sludge being continuously discharged."`
TO:   `description="Industrial sludge dewatering centrifuges and wastewater decanters that thicken sludge, cut disposal volume, and recover clean water. US-built, test-run, with on-site startup. Get a quote."`

**6c. AEO capsule (~lines 138-140)** — surface "sludge centrifuge": open with `A sludge dewatering centrifuge (also called a wastewater centrifuge or sludge centrifuge) is a continuous industrial separator...`

**6d. Fix the cannibalizing anchor (line 241)** — stop handing the commercial term to the dewatering page:
FROM: `<a href="/dewatering-centrifuge/">sludge dewatering or sludge thickening centrifuge</a>`
TO:   `<a href="/dewatering-centrifuge/">how a dewatering centrifuge works</a>`

---

## 7. /dewatering-centrifuge/  (1,939 impr, pos ~24; = the EDUCATIONAL "how it works" page)
File: `src/pages/dewatering-centrifuge.astro`

**7a. Title (line 142)**
FROM: `Dewatering Centrifuge | Operation, Animation, Uses, Benefits`
TO:   `Dewatering Centrifuge: How Centrifuge Dewatering Works`

**7b. Description (line 143)**
FROM: `description="A dewatering centrifuge is an industrial separator that thickens sludge from slurries to reduce sludge volume and recover the water."`
TO:   `description="How a dewatering centrifuge works: the decanter dewatering process, main components, G-force, and step-by-step operation that thickens sludge and recovers water."`

**7c. H2 `Operation` (line 163)** → `Centrifuge Dewatering Operation`

**7d. Internal links:** add an upward COMMERCIAL link to `/wastewater-centrifuge/` with anchor **sludge dewatering centrifuge systems** (in the Industrial Sludge Thickening section); add a link to `/manure-centrifuge-separator/` from the Applications section (anchor **manure separator**).

---

## 8. /decanter-centrifuge-differential-speed/  (DOE find — ranks pos 3-5 for many decanter terms, ~0% CTR)
File: `src/pages/decanter-centrifuge-differential-speed.astro`

> ⚠️ **CANNIBALIZATION GUARDRAIL:** this calculator page ranks **pos 4.3 for "decanter centrifuge"** — ABOVE the main `/decanter-centrifuge/` hub (pos 10.3). Do NOT broaden this title to chase the generic head term harder. Keep it **technical** — capture its strong technical-query rankings (differential speed 132, scroll speed 67, decanter scroll 107, centrifuge speed 140) and route commercial intent to the hub via an internal link.

**8a. Title + pageTitle (lines 90-91)** — both lines
FROM: `Decanter Centrifuge Differential Speed Calculator | Dolphin Centrifuge`
TO:   `Decanter Centrifuge Differential & Scroll Speed | Formula + Calculator`

**8b. Description (line 92)** — current is good; optionally append "and scroll/differential speed". Low priority.

**8c. Internal link (cannibalization resolver):** ensure a prominent contextual link to `/decanter-centrifuge/` with anchor **decanter centrifuge** high in the body, so head-term visitors reach the commercial hub.

---

## 9. /algae-centrifuge/  (DOE find — pos 11-13 for head terms, ~0% CTR; title misses "algae separator")
File: `src/pages/algae-centrifuge.astro`  (NOTE: title/description are CONSTS at lines 5-6, not inline props)

**9a. Title const (line 5)** — "algae separator" (139 impr — nearly as big as "algae centrifuge" 168) is absent from the title.
FROM: `const title = "Algae Centrifuge | Large Scale Algae Cell Harvesting";`
TO:   `const title = "Algae Centrifuge & Separator | Commercial Algae Harvesting";`

**9b. Description const (line 6)** — ⚠️ VERIFY "12,000 g" and "stainless/seawater" are on the page; drop if absent.
FROM: `const description = "Algae harvesting on commercial scale with flow-through, disc stack algae centrifuge. High centrifugal force (12000 g) concentrates the algae biomass.";`
TO:   `const description = "Harvest and dewater algae at commercial scale with a flow-through disc-stack algae centrifuge (algae separator) - up to 12,000 g concentrates the biomass. Stainless options for seawater algae.";`

**9c. Phrase:** surface "algae separator" once in the body where natural. **Do NOT add "230V"** (unconfirmed by owner).

---

## OWNERSHIP MAP (enforce — stops pages competing)
| Term cluster | Owner page |
|---|---|
| "centrifugal separator" (generic) | /oil-centrifuge/ (Tier-1) |
| "centrifugal filter / filtration" | /centrifugal-filter/ |
| "alfa laval [centrifugal] separator/purifier" (branded) | /alfa-laval-centrifugal-separator/ |
| "lube oil separator/purifier" | /lube-oil-centrifuge/ |
| "fuel oil separator/purifier", HFO | /fuel-oil-centrifuge/ |
| "sludge centrifuge / sludge dewatering centrifuge / wastewater" | /wastewater-centrifuge/ |
| "centrifuge dewatering (process/operation), how it works" | /dewatering-centrifuge/ |
| "manure separator" | /manure-centrifuge-separator/ |
| "centrifugal oil filter" (spin-on/cartridge) | NONE — intent mismatch, don't chase |

---

## OPTIONAL larger adds (do NOT do unless owner approves separately)
- **A. /fuel-oil-centrifuge/ FAQ + FAQPage schema** — the lube-oil page has one, this doesn't. Add honest Q&As ("What is a heavy fuel oil purifier?", "Can a fuel oil centrifuge be used on a ship?", "Difference between a fuel oil purifier and separator?"). Rich-result eligibility + captures purifier queries. [Med effort]
- **B. /decanter-centrifuge/ surface a trust line higher** (40+ yrs / in stock / warranty / Warren MI) above the fold, to protect the new title's CTR promise on landing. [Low-med effort]

## Audit criteria
1. git diff = only specified edits; no stray files/WIP.
2. `npm run build` 159 pages OK; titles/meta render; entities preserved per field (raw `&` kept).
3. No invented specs/prices/claims; all ⚠️ VERIFY items confirmed on-page or dropped; no new "free physical/sample" language.
4. Internal anchors exact-match, placed naturally; ownership map respected (no new cannibalization).
