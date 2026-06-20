# GSC Ranking Recovery — Tier 1 Codex Instruction Pack

**Scope (owner-approved):** Title/meta rewrites + restore exact missing search phrases + internal links.
**NOT in this pass:** new H2 content sections, FAQ blocks, FAQPage schema (deferred to a possible Tier-2 content pass).

**Diagnosis basis:** 6 analyst sub-agents reviewed query-level GSC deltas (recent 2026-05-17..06-13 vs prior 2026-04-19..05-16) + page source. Track-1 index check (2026-06-18) confirmed ALL pages are indexed, self-canonical, crawled, sitemap clean — so these are **organic ranking slips**, not migration breakage. Fix = on-page relevance/CTR.

**Hard guardrails (do NOT violate):**
- Never invent specs, prices, or claims. Every phrase below reuses facts already on the page or states a definitionally-true synonym.
- "Free" rule: nothing physical/sample/shipping is ever free. Do not add any "free analysis/assessment" language.
- Keep existing HTML entity conventions (`title=` uses raw `&`; `pageTitle=` uses `&amp;`).
- Preserve all existing classes/attributes when editing a heading — change only the text.

After each page, commit and report the SHA. Claude + sub-agents will audit (git diff + built HTML + zero-context sub-agent).

---

## 1. /oil-centrifuge/  — HIGHEST LEVERAGE (−1,869 impr; one demoted term = ~1/3 of loss)
File: `src/pages/oil-centrifuge.astro`

**1a. Title (line 115)**
FROM:
`  title="Oil Centrifuge | Working, Benefits, Size, Types, Examples, Cost"`
TO:
`  title="Oil Centrifuge & Centrifugal Separator | Working, Specs & Cost"`
(Description line 116 already contains "Centrifugal Separator" — leave it.)

**1b. Reinforce "centrifugal separator" in body (line 142)**
FROM:
`    An Industrial Oil Water Centrifuge uses discs in the bowl to magnify the effective g-force, making them highly efficient at separating small traces of water and sludge from oil or the other way around. These centrifuges are also known as Disc Stack Separators.`
TO:
`    An Industrial Oil Water Centrifuge uses discs in the bowl to magnify the effective g-force, making them highly efficient at separating small traces of water and sludge from oil or the other way around. These centrifuges are also known as centrifugal separators or disc stack separators.`

**1c. Restore "oil centrifuge machine" (lines 225-227)**
FROM:
`    Oil centrifuges are available in different sizes from Alfa Laval and other centrifuge manufacturers. The size typically ranges from <strong>1 GPM to over 300 GPM</strong>. The physical size is proportional to the processing capacity of the centrifuge.`
TO:
`    Oil centrifuges are available in different sizes from Alfa Laval and other centrifuge manufacturers. An oil centrifuge machine is sized by throughput, typically ranging from <strong>1 GPM to over 300 GPM</strong>. The physical size is proportional to the processing capacity of the centrifuge.`

**1d. (Optional, low) Recover "hydraulic oil centrifuge"** — in the existing Applications/Examples list (~line 412), add ONE list item for **Hydraulic Oil** (e.g. "Hydraulic Oil — remove water and fine particles to protect pumps and valves and extend fluid life"). Only because hydraulic oil is a genuine application Dolphin serves. If a `/hydraulic-oil-centrifuge/` page exists, link the anchor.

**Cannibalization rule:** `/oil-centrifuge/` OWNS "oil centrifuge machine" and "centrifugal separator". (Waste-oil targets the *waste*-qualified variants — see §6.)

---

## 2. /industrial-centrifuge/  — ✅ APPROVED (dive complete)
File: `src/pages/industrial-centrifuge.astro`

> **Crown deep-dive verdict (2026-06-18):** the page lost US #1 in Dec 2025 because the OLD WordPress site served Googlebot a Cloudflare bot-challenge interstitial (content went invisible) — NOT a content problem and NOT the migration. The page is the category-best; **do NOT rebuild it.** Just apply the light TLC below. Recovery is mainly re-crawl + time now that the blocker is gone.

**2a. Title + pageTitle (lines 176-177)** — both lines, same change
FROM:
`Industrial Centrifuge | Types, Applications, Cost & Benefits`
TO:
`Industrial Centrifuge | Types, Continuous Separation, Cost & Applications`

**2b. Restore "continuous centrifuge" (line 214)**
FROM:
`  <p>That means the separated solids and liquid(s) continuously exit the centrifuge.</p>`
TO:
`  <p>That means the separated solids and liquid(s) continuously exit the centrifuge. Because the feed and discharge are uninterrupted, a flow-through industrial centrifuge is also called a continuous centrifuge.</p>`

**2c. Restore "price" in Cost section (lines 454 + 456)**
Line 454 FROM: `  <h2 id="cost">Cost</h2>`
Line 454 TO:   `  <h2 id="cost">Industrial Centrifuge Cost & Price</h2>`
Line 456 FROM: `  <p>The cost of an industrial centrifuge is dependent on several factors. The primary factors that determine the cost of industrial centrifuges are as follows.</p>`
Line 456 TO:   `  <p>The price of an industrial centrifuge depends on several factors. The primary factors that determine the cost of an industrial centrifuge are as follows.</p>`

---

## 3. /disc-stack-centrifuge/  — FLAGSHIP (fell off page 1 for its own name: 10.7→15.1; "price" 5.3→16.6)
File: `src/pages/disc-stack-centrifuge.astro`

**3a. Title + pageTitle (lines 171-172)** — both lines
FROM:
`Disc Stack Centrifuge | Benefits, Costs, Operation, Specs, Sizing, etc.`
TO:
`Disc Stack Centrifuge: How It Works, Cost & Sizing Guide`

**3b. Description (line 174)**
FROM:
`  description="Everything you wanted to know about a disc-stack centrifuge! From disc stack centrifuge operation, cost, sizing, capacity, efficiency, benefits, and types."`
TO:
`  description="How a disc stack centrifuge works, with real specs, sizing tables, and cost ranges. 40+ years of Alfa Laval centrifuge experience from Dolphin Centrifuge."`

**3c. Restore exact "price" phrase in Cost heading (line 338)**
FROM: `  <h2 id="cost">Cost</h2>`
TO:   `  <h2 id="cost">Disc Stack Centrifuge Price &amp; Cost</h2>`

**3d. (Low) "disk" spelling** — in the Sizing and Capacity section prose (~line 556), use "disk stack centrifuge" once, naturally. Do not over-repeat.

**3e. Internal links IN (HIGH value — this page is under-linked for its own name).**
On each page below, ensure ONE contextual link to `/disc-stack-centrifuge/` using the EXACT anchor text **disc stack centrifuge** (place where it reads naturally; do not force):
- `/disc-centrifuge-purifier-clarifier-difference/`
- `/industrial-centrifuge/`
- `/disc-stack-centrifuge-applications/`
- `/disadvantages-disc-stack-centrifuge/`

---

## 4. /three-phase-decanter/  — (−2,525 impr; ONE term = 95%: 3.7→5.8)
File: `src/pages/three-phase-decanter.astro`

**4a. Title (line 60)**
FROM: `  title="Three Phase Decanter | Working, Benefits, Specs, Applications"`
TO:   `  title="Three Phase Decanter Centrifuge | Working Principle & Specs"`
(Description line 61 is fine — leave.)

**4b. Typo fixes (3) — quality signal on a head-term page**
- Line 108: `pushed the solids` → `pushes the solids`
- Line 119: `liquid phases exist the bowl` → `liquid phases exit the bowl`
- Line 224: `Sitckwater` → `Stickwater`

**4c. Internal links IN** — anchor **three phase decanter centrifuge** to `/three-phase-decanter/` from:
- `/decanter-centrifuge/` (the hub)
- `/alfa-laval-nx-418-decanter-centrifuge/` (its UVNX 418 is the 3-phase model — strong relevance)
- `/decanter-centrifuge-applications/`

---

## 5. /diesel-centrifuge/  — PURE CTR (impressions UP +187, clicks DOWN — title/snippet problem)
File: `src/pages/diesel-centrifuge.astro`

**5a. Title (line 122) + pageTitle (line 123)** — note entity convention
Line 122 FROM: `  title="Diesel Fuel Centrifuge | Sludge & Water Separator"`
Line 122 TO:   `  title="Alfa Laval Diesel Fuel Centrifuge | Removes Water, Sludge & Rust"`
Line 123 FROM: `  pageTitle="Diesel Fuel Centrifuge | Sludge &amp; Water Separator"`
Line 123 TO:   `  pageTitle="Alfa Laval Diesel Fuel Centrifuge | Removes Water, Sludge &amp; Rust"`

**5b. Description (line 124)** — ⚠️ VERIFY each claim is already on the page before publishing (0.5 micron, mid-$30s, US-built/Michigan, reconditioned Alfa Laval). If any is NOT on-page, drop that clause.
FROM:
`  description="Diesel fuel centrifuges separate solid and liquid (water) impurities from the diesel. These are self-cleaning separators with G-force over 8,000 Gs."`
TO:
`  description="Remove water, sludge, and rust from diesel down to 0.5 microns with a reconditioned Alfa Laval disc-stack centrifuge. Skid-mounted systems from the mid-$30s, US-built in Michigan."`

**5c. Recover "marine diesel fuel centrifuge" (slipped 3.7→12.4)** — locate the H2 "Diesel Purification on Work-boats" (~line 300). Change it to: `Marine Diesel Fuel Centrifuge — Workboats & Vessels` and add one sentence in that section using "marine diesel" naturally. Reuse existing facts only.

**5d. Internal links IN** — anchor **diesel fuel centrifuge** to `/diesel-centrifuge/` from `/waste-oil-centrifuge/` and `/fuel-oil-centrifuge/`.

---

## 6. /waste-oil-centrifuge/  — (clicks 44→20; lost "for sale" + "used motor oil" phrases entirely)
File: `src/pages/waste-oil-centrifuge.astro`

**6a. Title + pageTitle (lines 215-216)** — both lines
FROM:
`Waste Oil Centrifuge | Large Scale | Operation, Benefits & Specs`
TO:
`Waste Oil Centrifuge for Sale | 3-Phase Systems & Specs`

**6b. Description (line 218)** — ⚠️ verify "US-built, test-run, warrantied" is consistent with current site copy (it is per the recon-standard work).
FROM:
`  description="A waste oil centrifuge works by exerting gravitational forces up to 12,000 Gs to separate particles down to 1-micron and water from waste oil."`
TO:
`  description="Industrial waste oil centrifuges for sale - 3-phase Alfa Laval systems that remove water, sludge, and solids down to 1 micron. US-built, test-run, and warrantied by Dolphin Centrifuge."`

**6c. Restore "for sale" heading (line 956)** — change ONLY the inner text, keep classes
FROM:
`    <h2 class="text-2xl md:text-3xl font-bold text-navy mb-4">Used / Remanufactured Alfa Laval Centrifuges for Waste Oil Recovery</h2>`
TO:
`    <h2 class="text-2xl md:text-3xl font-bold text-navy mb-4">Waste Oil Centrifuges for Sale - Used &amp; Remanufactured Alfa Laval Models</h2>`

**6d. Restore "used motor oil" / "waste motor oil" (line 958)** — add one sentence
FROM (the sentence ending the paragraph):
`...class="text-navy underline hover:text-gold">Used Engine Oil</a>. Hover on each model for technical specifications.`
TO:
`...class="text-navy underline hover:text-gold">Used Engine Oil</a>. These Alfa Laval models are widely used as a used motor oil centrifuge or waste motor oil centrifuge for high-volume oil recovery. Hover on each model for technical specifications.`

**6e. Internal link IN** — anchor **waste oil centrifuge for sale** to `/waste-oil-centrifuge/` from `/used-oil-centrifuge/` (if that page exists).

**Cannibalization rule:** waste-oil targets the *waste*-qualified terms; `/oil-centrifuge/` keeps bare "oil centrifuge machine".

---

## 7. / (homepage) — ONE internal-link tweak only (crown-recovery support)
File: `src/pages/index.astro`

> Supports `/industrial-centrifuge/` reclaiming its lost US #1. **DO NOT change the homepage title (line 131) or Hero H1 (line 141)** — owner decision (too risky on the top page; cannibalization is shallow).

**7a. Link the first prominent "industrial centrifuge" mention (line 180).** Currently the most prominent occurrence is plain text; a less-prominent later one (line 183) is already linked. Make the FIRST one the exact-anchor link.
FROM (line 180):
`          Dolphin Centrifuge builds turnkey Alfa Laval industrial centrifuge systems for oil, fuel, wastewater, food, and industrial-fluid separation.`
TO:
`          Dolphin Centrifuge builds turnkey Alfa Laval <a href="/industrial-centrifuge/">industrial centrifuge</a> systems for oil, fuel, wastewater, food, and industrial-fluid separation.`
(Leave line 183's existing link as-is. No other homepage changes.)

---

## Audit criteria (Claude + sub-agents)
1. `git diff` shows ONLY the specified edits — no swept-in WIP, no unrelated files.
2. Built HTML (`npm run build`) renders the new `<title>` / meta / headings correctly; entities show as `&` not `&amp;` in visible text.
3. No invented specs/prices/claims; no "free" language introduced.
4. Internal-link anchors are exact-match and placed naturally (not stuffed).
5. Zero-context sub-agent re-reads 2-3 pages cold to confirm copy reads naturally and claims are page-supported.
