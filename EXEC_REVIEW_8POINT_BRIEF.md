# Executive Review — 8-Point Implementation Brief

Source: owner-led executive review session (Claude, 2026-06-14), four buyer-persona
reviews (CEO, CFO, careful engineer, startup founder) + owner decisions + adversarially
verified market research. This is the authoritative handoff for the Astro Agent (AG +
Sonnet) implementation pass. Every decision below is **owner-approved**.

---

## How this relates to the existing AEO/GEO workflow

- The Codex AEO/GEO top-30 pre-live queue is **complete** (all 30 PASS, snapshot 2026-05-14
  in `handoff.md`). No active page queue collides with this work.
- This 8-point pass is a **separate, owner-approved enhancement layer**, run
  **feature-by-feature** (Point #1 across all affected pages, then #2, etc.), not by GA4 rank.
- **Roles for this pass (owner-directed, differs from `handoff.md`):**
  - **Astro Agent (AG + Sonnet)** = implementer. Commits, returns exact SHA.
  - **Claude + sub-agents** = auditors (quality, content, syntax, SEO, AEO/GEO). Multi-agent
    auditing is explicitly authorized for this pass.
- Still follow all `.agents/rules/*` conventions, `DOLPHIN_NOMENCLATURE_POLICY_REVERSAL.md`
  (WHPX-first naming), preserve URL slugs, and the build must stay green.

### Guardrail deltas (owner-approved exceptions to `handoff.md` AEO/GEO guardrails)

The AEO/GEO guardrails forbade inventing prices/testimonials/guarantees and editing global
layouts/components. Those were correct for the unverified pre-live pass. This pass
**deliberately overrides them**, because:

1. **Numbers are now sourced or owner-confirmed** (warranty term, stock count, founding year,
   price ranges, ROI inputs, feasibility thresholds). Nothing here is invented.
2. **Global/component edits are required and approved** (trust strip, stats bar, founding-year
   and stock-count corrections across 130+ files, reusable blocks). Owner has approved global
   risk for this pass.
3. **Warranty + reconditioning detail is being published deliberately** (competitive research
   confirmed it is the industry norm among real reconditioners, not a trade-secret leak).

**Still forbidden:** inventing any figure not in this brief; publishing a recovery-% or
payback number as third-party fact (see #3); changing image choices unless owner opens image
work; breaking slugs.

---

## #1 — Warranty term + Reconditioning Standard (+ test report as differentiator)

**Decision:** Publish outcomes, hide methods. Competitive research: publishing warranty term +
outcome-level recon scope is the norm among real reconditioners (Separator Spares 180-day,
Gforce 1-3 yr, Centrimax 13-mo, GreySun 6-mo). The **test report** is where Dolphin out-discloses
nearly every direct competitor.

**Build:**
1. **New page: Warranty Statement** (canonical, single source of truth).
   - Headline term: **6-month mechanical warranty + lifetime technical support.**
   - Binding terms: coverage, wear-item exclusions, claim process.
2. **New page: "Our Reconditioning Standard"** (permanent page, not a dated blog post).
   - Outcome-level checklist ONLY:
     - Bowl & critical components inspected / NDT-checked
     - Worn parts replaced with OEM-spec components
     - Rotating assembly dynamically balanced to spec
     - Full test-run at rated speed before shipment
     - **Test report ships with every unit** ← lead with this
     - Lifetime technical support
   - **Lead disclaimer:** "This describes our general reconditioning standard. It is not a
     binding specification; actual scope varies by unit condition and is defined in your quote."
   - **Do NOT publish:** balancing tolerances, test durations/criteria, inspection thresholds,
     vendor sources, rebuild sequence. Methods stay secret.
3. **Reusable badge** on every product/model page: "6-Month Mechanical Warranty + Lifetime
   Technical Support" linking to the Warranty Statement page.
4. Optional later: a redacted sample test report as a gated download.

**Audit:** term present + linked sitewide; recon page is outcome-only (no methods/tolerances);
disclaimer present; test-report promise prominent.

---

## #2 — Value-bundled price ranges on the money pages

**Decision:** Publishing indicative ranges is rare among competitors (confirmed: direct
competitors + OEMs are quote-only; only Kyte/Centrimax show partial signals) — so it is a
**differentiator, not a liability**. Extend it consistently; never a naked number.

**Build:**
- Add a **value-bundled** range to waste-oil, lube-oil, and other money pages currently dark on
  price (decanter/industrial already show ranges — keep them):
  > "Complete plug-and-play modules run roughly **$50K–$150K** (to ~70 GPM), EXW Warren MI — and
  > every system includes a 6-month mechanical warranty, a documented test report, US-based
  > engineering support, on-site startup, and lifetime technical support."
- **Floor-frame the low end** ("from around $50K") — never hand competitors the exact entry point.
- Always pair the number with what it includes (defends premium vs. bare cheap imports).

**Audit:** ranges are bundled with included value; low end floor-framed; consistent with
decanter/industrial pages; EXW Warren MI + Incoterm present.

---

## #3 — Two real ROI case studies (WVO + UMO), strengthened

**Decision:** Don't build a synthetic ROI box. Strengthen the **two real installs already on the
site**, presented as Dolphin's own measured results, backed by the test report (ties #1).

**CRITICAL honesty rule (from adversarial research):** Every centrifuge recovery-% and payback
figure tested — INCLUDING our own published "+20% recovery" and "$380K/yr" — was *refuted* for
lack of third-party support. Refuted ≠ false; they are self-published. So:
- Present recovery-% and payback ONLY as **"Dolphin's own measured results from this
  installation,"** never as industry fact.
- Build the payback as a **transparent illustrative model**: sourced commodity value +
  sourced disposal-avoided × recovered gallons − equipment/operating cost. Label illustrative.
- Disclaimer + free-analysis CTA on both (legal cover + lead magnet).

**The two trains (make explicit — credibility for engineers):**

| | WVO (yellow grease) | UMO (marine) |
|---|---|---|
| Real install | Midwest UCO collector, 6M gal/yr | Guam US Navy facility, 4.8M gal/yr |
| Contaminants | water + emulsion (rag layer) + TSS | fine metals/ash + water/glycol |
| Pre-treatment | **decanter (NX-314) de-sludging upstream** | basic pre-straining only |
| Polishing centrifuge | WHPX-510 disc stack | DMPX-028 / MOPX 207 |
| Train | two-stage | single-stage |
| Real result (label as ours) | "<6-month payback," ~30% throughput gain | "$380K/yr savings," ~20% recovery gain |

**Files:** `yellow-grease-purification-centrifuge.astro` (WVO),
`waste-oil-centrifuge-case-study-marine-and-industrial-waste-oil-recovery.astro` (UMO).
Add: payback box (lead), recovered-oil revenue line ($/yr), itemized before/after cost table,
explicit train description, disclaimer + CTA. Fix UMO page electricity unit inconsistency
($0.015/gal vs ~0.06¢/gal elsewhere).

**Cross-link:** add "See the real numbers →" callouts from waste-oil-centrifuge,
wvo-centrifuge-separator, used-oil-centrifuge, biodiesel-centrifuge to the matching case study.

### Sourced reference numbers (cite as dated ranges, never guarantees)

- **WVO/UCO/yellow grease recovered value:** conservative floor **~$1.50–$3.00/gal**
  (USDA yellow grease 21–41¢/lb, 2024), realistic 2024 band **~$3.00–$3.75/gal**
  (The Jacobsen, Fastmarkets). Clean UCO generators often *paid* $0.10–$0.55/gal.
  Brown grease/GTW only **2–4% recoverable** — do not overstate yield on trap waste.
- **UMO/used oil value:** anchor as a **discount to No. 2 fuel oil** (BLS/FRED APU000072511,
  ~$3.40–$4.30/gal retail 2023–2025 = ceiling). When crude is soft, collectors *charge*
  generators (Clean Harbors/Safety-Kleen CFO fees) — so for UMO the **disposal-avoided lever
  is stronger** than resale.
- **Disposal avoided (UMO esp.):** the **10× ratio** (clean vs. contaminated) is the defensible
  lever; realistic industrial contaminated disposal **~$1.29–$5/gal**. Regulatory driver:
  **40 CFR 279.63** (≥1,000 ppm halogens → presumed hazardous) — the "why dewatering pays."
- **Legacy-method + recovery-% figures:** no third-party source survived; use Dolphin's own
  field data, clearly labeled, or omit.

**Audit:** no recovery-%/payback stated as third-party fact; all commodity figures dated +
sourced; disclaimer present; trains explicit; cross-links live.

---

## #4 — Kill the contradictions (canonical numbers) — FULL SWEEP DONE

| Claim | Canonical value | Current bad instances to fix |
|---|---|---|
| In stock | **150+ centrifuges in stock** | "200+/over 200" (about, contact, buyback, disc-repair); "300+" (testimonials, industrial-centrifuges-faq) |
| Founding | **Established 1982 · 40+ years in the centrifuge business** | kill ALL "1981" (about ×5, testimonials); harmonize stray "30+/35/over 35 years" → "40+ years" |
| Parts quote | **1–2 business days; in-stock parts ship same day** | — |
| Equipment quote | **Respond within 1 business day; full quote in 1–10 days (complex/ATEX up to ~2 weeks)** | kill blanket "Same-Day Response" (contact ×2, mab-104); fix "within a few business days" ×5 on contact page |
| Systems delivered | **500+ centrifuge systems delivered** (provable: 465 project folders + pre-system work) | keep on homepage; safe |
| Schema foundingDate | **1982** (owner: keep simple) | `about-dolphin-centrifuge.astro` foundingDate "1981" → 1982 |

Real basis: actual stock ~135–140 (publish 150); founding India 1982 / MI incorporated 1994
(owner chose simple "est. 1982"); 465 customer project folders in `C:\Dolphin Marine
Services\Skids` confirm 500+.

**Audit:** grep the whole repo — zero "1981", zero "200+/300+" stock claims, zero blanket
"Same-Day Response"; "40+ years" and "150+ in stock" consistent sitewide.

---

## #5 — Rental: de-emphasize (owner: does NOT want rental)

**Decision:** Owner does not want rental — tried it, unprofitable, operational pain (e.g. tech
to California for a stopped 3-month rental). The persona "make rental real" recommendation is
**rejected.**

**Build:**
- **Keep rental pages for SEO** (capture "centrifuge rental" search traffic) but turn them into
  **purchase funnels** — lean harder on the existing "buying beats renting" framing.
- **KILL rent-to-own** entirely on `disc-stack-centrifuge-rental.astro` (remove the
  "payments may apply toward purchase" offer). Owner: emphatic.
- **Pivot the de-risk path to SAMPLE TESTING** everywhere a persona wanted "rent before you buy"
  → point to `industrial-centrifuge-sample-testing.astro` instead.
- Do not promote rental on any application/product/home page.
- Fix the thin decanter rental page to match the steer-to-purchase framing.

**Audit:** no rent-to-own anywhere; rental pages route to purchase + sample testing; no rental
promotion on application/product/home pages.

---

## #6 — Show the proof you already have (Buy + Trust + Proven)

**Decision:** Category-only — **no company names** (no permission ever obtained). Testimonials
go to **"Tom G." style** (first name + initial + non-identifying role/industry/region).

**Build (reusable components, place sitewide):**
1. **Trust Strip** (category badges): "Trusted by the U.S. Military, O&G majors, Fortune 500
   manufacturers, and international EPC contractors — 500+ systems delivered since 1982."
   → homepage under hero + top of every application & product page.
2. **Stats Bar:** 40+ years · 500+ systems delivered · 150+ centrifuges in stock · in-house
   engineering. → homepage, About, Contact, case studies.
3. **"Proven Results" block** (3 cards w/ hard numbers): Guam US Navy (UMO), Midwest UCO
   collector (<6-mo payback), railcar-wash diesel ($2M+/yr). → homepage + cross-linked from #3.
4. **Featured testimonial** — the startup quote ("we are not Exxon Mobil… you get it") on
   homepage + small-buyer pages (feeds #8). Other 4 → "Tom G." style carousel.
5. **Micro-proof** near every CTA: "Backed by 40+ years and a 6-month warranty" (ties #1).

**Rule:** every landing page carries ≥1 of these five within the first screen.
**Category badge vocabulary:** U.S. Military · O&G Major · Multinational Beverage/Packaging
Producer · Major International EPC Contractor · Fortune 500 Steel Producer.

**Audit:** zero real company names published; testimonials de-identified to "Tom G." + role;
trust strip/stats bar/proven-results render on target pages; startup testimonial featured.

---

## #7 — Engineer's kit (gated datasheet, model selector, install requirements)

**Decisions:**
- (a) **NO open PDFs** (owner: avoid competitor misuse). Add a prominent **"Request spec sheet
  (PDF) →"** lead-capture button on each model page (name + email + model). Fast email fulfillment.
- (b) **No comparison table** (each capacity = one model). Build a **"Find your model by flow
  rate" selector** instead — columns: *Flow rate (GPM) | Model | Self-clean or Manual | Typical
  applications*. On the `/alfa-laval-centrifuges/` hub + `alfa-laval-centrifuge-selection-guide`
  (currently all prose, no lookup table).
- (c) **Installation Requirements block** (reusable; owner-supplied data):

> **Installation Requirements — Disc-Stack Centrifuge Module** (typical MOPX 207 / DMPX-028 class)
> - **Electrical:** 460 V / 3-phase standard; 240 V / 3-phase available. Single-phase sites: add a phase converter.
> - **Operating water:** 50 psig, clean potable filtered water — city water works best, soft water only.
> - **Compressed air:** 100 psig, ~15 cfm (portable compressor fine). Primary use: AODD sludge pumps on self-cleaning machines.
> - **Feed:** Hotter separates better — WVO/thick/emulsified oils ideal ~180°F; HFO 200°F+. Pre-strain dirty feed to <250 microns. PLC-controlled feed pump usually built into skid; if customer-supplied, use PD/AODD pumps — avoid centrifugal pumps on emulsion-prone fluids.
> - **Drain:** Separated sludge via AODD pump, 1"–1.5" outlet. Separated water: 1"–1.5" pressurized, or 3"–4" gravity drain.
> - **Foundation & environment:** Level concrete pad usually sufficient; small units on portable cart skids. Indoor preferred. **Outdoor installs must be in a climate-controlled/heated enclosure to prevent freezing — freezing is a safety hazard.**

Place install block on workhorse model pages (MOPX 207, DMPX-028, `/centrifuges/*`) + top
application pages (waste-oil, decanter, disc-stack, WVO).

**Audit:** datasheet button captures lead (no open PDF); selector table maps GPM→model;
install block present + accurate on target pages.

---

## #8 — Small-buyer on-ramp = honest self-qualifier (owner: don't turn down, don't encourage)

**Decision:** Centrifuge has an economic floor; below it, no copy makes it viable. The qualifier
is **fluid value × volume**, anchored to a **~2-year payback** (compelling; 3 yr = max tenable).
Smallest self-cleaner ~$55K needs ~$25–30K/yr benefit.

**Feasibility / machine-routing matrix (the #8 centerpiece — "Is a centrifuge right for you?"):**

| Fluid value | Example | Right machine | Min volume for ~2-yr payback |
|---|---|---|---|
| Very high ($20–25+/gal) | Turbine / hydraulic lube oil | MAB 103 (~$20K, 1 GPM) | A few gal/day — one reservoir reclaim pays it |
| High ($3–5/gal) | Clean diesel, fuel polishing | MAB 103 (~$20K, 2 GPM) | Tens of GPD |
| Mid ($1.50–3/gal) | WVO / UCO / yellow grease | Self-cleaner (~$55K+, 5+ GPM) | ~500–1,000 GPD |
| Low (~$0.05–0.15/gal net) | Marginal used oil, wastewater | Self-cleaner (~$55K+) | 2,000+ GPD |
| Very low + low volume | <500 GPD dilute/low-value | — none yet — | Heat/settle/filter; scale up first |

**Build:**
1. Publish the matrix as an "Is a centrifuge right for you?" tool/section.
2. MAB 103 page: claim "smallest unit we sell" + honest scale note (very low volume/low-value →
   simpler methods more cost-effective).
3. Replace "Starting small?" with "Is a centrifuge right for your scale?" honest qualifier on
   application pages → low-volume operators to simpler methods / sample testing / "come back
   when you scale."
4. Knowledge Center "New to centrifuges? Start here" box → 9 Steps to Picking → 101 FAQ →
   parts glossary.
5. Contact form: make flow-rate/condition optional + "Not sure? Leave it blank — our engineers
   will tell you honestly whether a centrifuge fits your volume."

**Soft public floor:** "A centrifuge typically makes sense once it recovers/saves ~$25–30K/yr
(≈2-yr payback on our ~$55K smallest system): often ~500–1,000 GPD for high-value clean
WVO/UCO, or 2,000+ GPD for low-value/dilute fluids. Below that, heat/settle/filter is usually
better — tell us your volume and fluid and we'll give you an honest answer."

**Audit:** matrix accurate to owner bands; MAB 103 entry framing present; honest qualifier
replaces rental as de-risk path; contact form flow-rate optional.

---

## Suggested execution order (feature-by-feature)

1. **#4** (canonical numbers) — site-wide find/replace, unblocks consistent copy for everything else.
2. **#1** (warranty + recon pages + badge) — referenced by #2, #3, #6.
3. **#6** (trust components) — reusable, used everywhere.
4. **#2** (price ranges) — needs #1 badge language.
5. **#3** (case studies) — needs #1 test-report + sourced numbers.
6. **#7** (engineer kit) — model pages.
7. **#8** (feasibility matrix + on-ramp) — needs #2 prices + #3 ROI logic.
8. **#5** (rental de-emphasis + kill rent-to-own) — independent, can run anytime.

Each feature: AG implements from a strict instruction block → returns SHA → Claude + sub-agent
auditors verify (content accuracy, syntax/build, internal links, SEO/AEO-GEO, schema validity)
→ PASS or correction block. One feature at a time.
