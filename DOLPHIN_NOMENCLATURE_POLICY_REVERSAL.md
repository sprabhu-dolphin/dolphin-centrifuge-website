# Centrifuge Nomenclature Policy — REVERSAL (May 2026)

**Purpose:** Paste-ready replacement language for the nomenclature policy in `CENTRIFUGE_BRAIN.md` (v3.0) and `CENTRIFUGE_SKILLS.md` (v4.0).

**Why this document exists:** The earlier policy required Dolphin nomenclature (DMPX-XXX, DMB-XXX) on all customer-facing material to prevent price-shopping. As of May 2026, that policy is **reversed**. Alfa Laval model names are now used everywhere — on the website, in quotes, in proposals, in email correspondence, in social posts, and in Jake's outreach copy. **Specifically, the WHPX series (partial discharge, current production) is the default recommendation** at every capacity tier; the older full-discharge MOPX and MAPX series are end-of-life and should only be referenced for legacy installations or applications that specifically require full-discharge operation. The rationale is global recognition, current product availability, and AI entity matching for the generative-search era.

**How to apply:** Each section below has two parts — (1) text to find and remove, (2) text to insert in its place. Apply to the file named in each section. After applying, increment the file's version number and update its `Last Modified` line.

---

## SECTION 1 — For `CENTRIFUGE_BRAIN.md`

### 1.1 Find this language (or anything substantially similar) anywhere in the file:

```
NEVER expose Alfa Laval model numbers (MOPX, WHPX, NX, etc.) to customers.
All customer-facing references use Dolphin nomenclature (DMPX-XXX, DMB-XXX).
A Dolphin model numbering system (DMPX-XXX ≈ diesel GPM capacity) is used
to prevent price-shopping.
```

Also look for any of these phrases:
- "never expose Alfa Laval"
- "replace with Dolphin nomenclature"
- "DMPX naming required"
- "prevent price-shopping"
- "Dolphin model numbering system"
- "DMB-XXX" or "DMPX-XXX" used as a *required* convention

### 1.2 Replace with the following policy block:

```markdown
## Brand Nomenclature Policy (May 2026 — current)

**Policy:** All customer-facing content — website, quotes, proposals, emails,
social posts, marketing collateral, and Jake's outreach — uses Alfa Laval
model names (MOPX, WHPX, NX-series, BTPX, BRPX, P3, G2, etc.). This includes
references to reconditioned, remanufactured, and used Alfa Laval centrifuges
that Dolphin sells.

**Why the policy reversed:** The earlier rule (use DMPX/DMB naming to prevent
price-shopping) is OBSOLETE. It is replaced for three reasons:

1. **AI search era.** Generative engines (ChatGPT, Perplexity, Claude,
   Gemini, Google AI Overviews) build entity associations from text. When
   millions of pages worldwide reference "Alfa Laval MOPX-207" — engineering
   forums, OEM docs, industry publications, competitor sites — that becomes
   the canonical entity. Dolphin captures citation share by aligning *with*
   the canonical entity, not fighting against it.

2. **Buyer search behavior.** Engineers and buyers searching for centrifuge
   solutions search by Alfa Laval model number, not by Dolphin's internal
   designation. Using Alfa Laval names puts Dolphin in the result set.

3. **Differentiation moves to expertise, not naming.** Dolphin's
   competitive moat is 40+ years of engineering, reconditioning capability,
   service network, and turnkey integration — not opaque model names.
   Pricing protection comes from value selling and service depth, not from
   hiding the underlying platform.

### Required usage in customer-facing content

- **First mention on a page or in a document:** Include the full brand
  prefix → `Alfa Laval MOPX-207`
- **Subsequent mentions in the same section:** May abbreviate → `MOPX-207`
- **Always use hyphen, not space:** `MOPX-207`, never `MOPX 207` or `MOPX207`
- **Always reference reconditioned/remanufactured status when relevant:**
  e.g., "reconditioned Alfa Laval MOPX-207 centrifuge from Dolphin"
- **Dolphin's role:** Always position Dolphin as the *engineered system
  integrator* and *trusted reconditioning supplier* — not as a competing
  manufacturer of look-alike units

### DMPX → Alfa Laval cross-reference (use this for migration)

Two technical dimensions matter beyond capacity:

- **Discharge mechanism:** *partial* discharge ejects only the sludge layer
  (low product loss, current Alfa Laval design); *full* discharge ejects the
  entire bowl contents (older design, only needed for very high sludge loads).
- **Current availability:** WHPX (partial-discharge) series is in active
  production. MOPX and MAPX (full-discharge) series are largely end-of-life.

| Legacy Dolphin | Recommended (Partial / Current) | Legacy (Full / EOL) | Capacity |
|---|---|---|---|
| DMPX-014 | **WHPX-405** ✅ available | MOPX-205 (rare) | 5–10 GPM |
| DMPX-028 | **WHPX-407** ✅ available | MOPX-207 (rare) | ~30 GPM |
| DMPX-042 | **WHPX-410** ✅ available | MOPX-210 (rare) | ~45 GPM |
| DMPX-070 | **WHPX-513** ✅ available | MOPX-213, MAPX-313 (rare) | 50–60 GPM @ 180°F |

**Default behavior:** Recommend the **WHPX** model for every new customer
interaction — quote, proposal, email, sample report, website page. Reference
MOPX or MAPX only when:

1. The customer specifically asks about a full-discharge unit
2. The application has very high sludge loads where full-discharge is
   technically required
3. You're describing a legacy installation Dolphin currently services
4. You're showing historical performance data from a MOPX or MAPX unit (in
   which case, also offer the WHPX equivalent as the modern path forward)

**Special-purpose series (no DMPX cross-reference):**

- Beverage clarification (beer, wine) → **BRPX** series
- Biotech / cell harvesting → **BTPX** series
- Decanter applications (high solids) → **NX-series** (NX-314, NX-418, etc.),
  G2-series, or P3-series

### What does NOT change

- **Pricing is still confidential.** Public pages may list price ranges
  ($30K–$300K, etc.) and "starts at" anchors, but specific quote pricing
  remains private and customer-specific.
- **Dolphin's value proposition remains the same:** 40+ years engineering,
  turnkey integration, reconditioning warranty, service network,
  sample-testing program, custom skid design.
- **The 133-URL preservation rule remains in force.** URL slugs do NOT
  change even when page content migrates from DMPX to Alfa Laval naming.
  Use `Product.alternateName` in schema to retain the legacy DMPX entity
  alias.

### Effective date

This policy is effective immediately and supersedes all prior nomenclature
rules in this document, in `CENTRIFUGE_SKILLS.md`, and in any earlier
versions of either file.
```

### 1.3 Version bump

After applying this change to `CENTRIFUGE_BRAIN.md`:
- Bump version to **v4.0** (the previous version was v3.0)
- Add to the file's changelog (or top of file): `v4.0 — 2026-05-XX — Nomenclature policy reversed: Alfa Laval names now used everywhere on customer-facing content. See "Brand Nomenclature Policy" section.`

---

## SECTION 2 — For `CENTRIFUGE_SKILLS.md`

### 2.1 Find and remove

Look for the same DMPX-mandatory language as in §1.1 above, plus any application-playbook-specific instructions that say things like:

- "When generating proposals, replace MOPX-XXX with DMPX-XXX in the model column"
- "Quote templates must use Dolphin nomenclature for all line items"
- "Email drafts to customers must NOT mention Alfa Laval model numbers"
- "Sample test reports use DMPX naming"
- "Customer-facing case studies anonymize equipment as DMPX-XXX"

All of those instructions are now obsolete and must be removed or reversed.

### 2.2 Insert this policy block near the top of the file (right after the file header / version line):

```markdown
## Brand Nomenclature Policy — Skills File (v5.0, May 2026)

This file follows the brand nomenclature policy defined in
`CENTRIFUGE_BRAIN.md` v4.0. Summary:

- **All proposals, quotes, emails, case studies, sample-test reports, and
  outreach use Alfa Laval model names** (MOPX, WHPX, NX-series, BTPX, BRPX,
  P3, G2). The earlier rule requiring Dolphin DMPX/DMB nomenclature is
  reversed and obsolete.

- **Format:** Always `Alfa Laval MOPX-207` on first reference; `MOPX-207`
  on subsequent references in the same document. Always hyphenated.

- **Position Dolphin as:** *Engineered system integrator and reconditioning
  specialist for Alfa Laval centrifuges* — not as an independent brand
  competing with Alfa Laval.

- **Legacy DMPX references in this file:** Cross-reference using the table
  in `CENTRIFUGE_BRAIN.md`. When in doubt about oil-side (MOPX) vs
  water-side (WHPX) variant, use the application's primary fluid as the
  decision rule (oil → MOPX, water → WHPX).
```

### 2.3 Update each of the 13 application playbooks

Each playbook in `CENTRIFUGE_SKILLS.md` (waste oil, pyrolysis oil, coolant/tramp oil, diesel polishing, hydraulic oil, transformer oil, crude oil tank bottoms, cutting/quench/draw/rolling oil, lube oil, wastewater/metal finishing, biodiesel/glycerol, industrial wash water, food/beverage) needs the following review:

**For each playbook, do this:**

1. Search the playbook section for `DMPX-` and `DMB-` model references
2. Replace each one using the cross-reference table (§1.2 above). **Default to the WHPX (partial-discharge, current-production) model.** Only reference MOPX or MAPX when the application requires full-discharge or when describing a legacy installation. Per-playbook guidance:

| Playbook | Primary recommendation | Notes |
|---|---|---|
| Waste oil | WHPX-405 / 407 / 410 / 513 | Default to WHPX. Only mention MOPX-213/MAPX-313 for very high-sludge applications. |
| Used motor oil / black diesel | WHPX series | WHPX handles 3-phase oil-water-sludge with continuous partial discharge — ideal here. |
| Pyrolysis oil | WHPX series | Same logic. Add a note about chemical compatibility (VITON if needed). |
| Diesel polishing / fuel | WHPX series | Lower sludge loads favor partial discharge. |
| Hydraulic oil | WHPX series | Closed-loop kidney configurations benefit from partial discharge / low product loss. |
| Transformer oil | WHPX series | Very low sludge — partial discharge is the right choice. |
| Crude oil tank bottoms | NX-series decanter (primary) + WHPX-513 polishing | Two-stage system: decanter for bulk sludge, WHPX for finishing. |
| Cutting / quench / draw / rolling oil | WHPX series | Continuous partial discharge keeps the clean-oil reservoir at low contaminant level. |
| Lube oil reconditioning | WHPX series | Standard configuration. |
| Wastewater / metal finishing | NX-series decanter (primary) + WHPX (polishing) | High solids → decanter first. |
| Biodiesel / glycerol | WHPX-series 3-phase variants | With VITON elastomers and C1D2 electrical for methanol. |
| Industrial wash water | WHPX series | Standard. |
| Food / beverage | BRPX or BTPX (sanitary) | No WHPX/MOPX cross-reference applies. |

**When in doubt:** WHPX is the default. Customer will rarely ask for full-discharge specifically; if they do, route to Sanjay or Jim Kraft for technical confirmation before quoting MOPX/MAPX.

3. If the playbook has example quote text or proposal text with DMPX models, regenerate the examples with the Alfa Laval equivalent (use the cross-reference table; pick the row that matches the playbook's variant).

4. Where a playbook references a specific model size by GPM (e.g., "for 30 GPM applications, recommend the DMPX-028"), change to "for 30 GPM applications, recommend the Alfa Laval MOPX-207 (or WHPX-407 for water-phase applications)."

### 2.4 Update quote and proposal templates

If `CENTRIFUGE_SKILLS.md` contains quote line-item templates or proposal boilerplate:

- Replace any `DMPX-XXX` in the model column with the Alfa Laval equivalent
- Add a column or footer line: "Reconditioned Alfa Laval [model] — fully inspected, remanufactured, warrantied by Dolphin Centrifuge"
- Keep all pricing logic confidential / customer-specific as before

### 2.5 Version bump

After applying changes to `CENTRIFUGE_SKILLS.md`:
- Bump version to **v5.0** (previous was v4.0)
- Add to the file's changelog: `v5.0 — 2026-05-XX — Nomenclature policy reversed in line with CENTRIFUGE_BRAIN.md v4.0. All 13 application playbooks updated to use Alfa Laval naming.`

---

## SECTION 3 — For Jake (operational notes)

Jake's outreach, email drafts, and task-queue actions inherit these policies via the skill files above. After applying §1 and §2:

- **Restart Jake** (or trigger a skill reload) so the new policies take effect immediately
- **Sweep Jake's outbox / drafts** for any pending messages that still reference DMPX/DMB. Regenerate them with Alfa Laval naming before sending.
- **Check `JAKE_IDENTITY.md`** for any prompt-level instructions that mention DMPX or Dolphin nomenclature as a required output. Update those too.
- **Re-run any prospecting templates** that produced DMPX-based talking points — the new templates should reference Alfa Laval models and emphasize Dolphin's reconditioning + service value.

---

## SECTION 4 — For the Website (Astro / Cloud agent)

The website rebuild policy follows the same change. The agent should:

1. Reference Appendix C of `DOLPHIN_GEO_ROADMAP.md` for the cross-reference table
2. Migrate DMPX-named content on customer-facing pages to Alfa Laval naming, choosing MOPX vs WHPX per the application context rule
3. Preserve URL slugs (the 133-URL rule remains in force)
4. Add `Product.alternateName` schema entries to keep legacy DMPX entity associations searchable
5. Update the page-level `Article` schema's `dateModified` whenever a migration happens

---

## Quick-paste version (for chat / Cowork task descriptions)

If you need a one-paragraph version to drop into a task or DM:

> **Nomenclature policy reversed (May 2026):** All customer-facing content now uses Alfa Laval model names — not DMPX/DMB. **Default to the WHPX series** (partial discharge, current production): DMPX-014 → WHPX-405; DMPX-028 → WHPX-407; DMPX-042 → WHPX-410; DMPX-070 → WHPX-513. The legacy full-discharge MOPX/MAPX equivalents (MOPX-205/207/210/213, MAPX-313) are largely end-of-life — reference them only when the application specifically requires full discharge, when describing a legacy installation, or as `Product.alternateName` schema aliases for AI entity matching. Special-purpose: BRPX (beverage), BTPX (biotech), NX/G2/P3 (decanter). Format: `Alfa Laval WHPX-513` on first reference, `WHPX-513` after, always hyphenated. URL slugs stay the same.

---

*End of policy reversal document. Apply §1 to BRAIN, §2 to SKILLS, then bump version numbers and notify Jake.*
