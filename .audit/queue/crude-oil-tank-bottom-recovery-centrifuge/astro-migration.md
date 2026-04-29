# Astro Migration Plan — `crude-oil-tank-bottom-recovery-centrifuge`

**Source of truth:** `legacy-content/crude-oil-tank-bottom-recovery-centrifuge.md` (NOT in LW.xml — page is a custom-content post)  
**Current Astro file:** `src/pages/crude-oil-tank-bottom-recovery-centrifuge.astro` (813 lines, 46 KB)  
**Date:** 2026-04-29

---

## 1. SEO Field Map (Rule #1 — Critical SEO Mapping)

| Field | Legacy Value | Current Astro | Status |
|---|---|---|---|
| `rank_math_title` | Not in LW.xml. Legacy MD title: `Crude Oil Tank Bottom Recovery by Industrial Centrifuges` | `"Crude Oil Tank Bottom Recovery by Industrial Centrifuges"` | ✅ OK |
| Visible H1 / page title | `Crude Oil Tank Bottom Recovery by Industrial Centrifuges` | Same (via hero area) | ✅ OK |
| `rank_math_description` | Legacy MD `meta_description`: **empty** (`''`) | `"Dolphin's 3-step ORS recovers crude oil from tank bottoms. Decanter and disc stack reduce BSW from 60% to under 0.5% continuously. Skid or containerized."` | ❌ MISSING in legacy — Sanjay-approved generated description OK per Rule #1 |
| Canonical URL | `https://dolphincentrifuge.com/crude-oil-tank-bottom-recovery-centrifuge/` | Same | ✅ OK |

> **Note:** Legacy has NO meta description (empty string). Current Astro description is a generated factual summary. Per Rule #1, empty legacy meta → Sanjay approves a short factual generated meta by default. Current description is acceptable.

---

## 2. Legacy TOC — Full Nested Hierarchy (Rule #1 — Mandatory TOC)

Legacy has a visible **Table of Contents** block. All items and nesting must be preserved in the Astro `toc` prop.

```
Level 1: Dolphin Centrifuge's Oil Recovery System (ORS)
  Level 2: Advantages of Dolphin Centrifuge's ORS
    Level 3: Significant Reduction in Processing Time
    Level 3: Reduced Tank Bottom Sludge Volume
    Level 3: Reduced Transportation & Disposal Costs
    Level 3: Tank Cleaning Cost Savings
    Level 3: Emulsified Oil Recovery
    Level 3: Paraffin and Asphaltene Remediation
  Level 2: Oil Sludge Treatment System – 3-Step Process Overview
    Level 3: Step 1: Pre-treatment of incoming raw crude waste oil (grading) from the day tank.
    Level 3: Step 2: De-sludging of Heavy Solids (down to 200µ)
    Level 3: Step 3: Polishing Crude Oil for final recovery (down to 1µ; < 1% BS&W)
  Level 2: Crude Oil Tank Bottom Recovery System Configurations (Fixed and Mobile)
    Level 3: Skid Mounted Crude Oil Recovery System
    Level 3: Containerized Crude Oil Recovery System
  Level 2: Operating and Utility Cost
    Level 3: Labor
    Level 3: Chemicals
    Level 3: Utilities
  Level 2: Key factors affecting ORS efficiency
    Level 3: Processing Temperature
    Level 3: Homogeneity of Process Crude Oil
    Level 3: Chemical / Polymer / Demulsifier
  Level 2: Unique Features and Upgrades Specific to Dolphin's ORS
    Level 3: Builtin Pump Upgrade
    Level 3: Salt-water Handling
    Level 3: Electrical Upgrades
    Level 3: Service Features
  Level 2: Dolphin Centrifuge's ORS Flow-Diagram
Level 1: Tank Bottom Recovery – Case Study
  Level 2: Crude oil producer's background
  Level 2: Issues with the producers' current process
    Level 3: Time to Process
    Level 3: Tank Bottom Sludge Volume Loss
    Level 3: Transportation and Disposal Costs
    Level 3: Emulsified Oil Loss
    Level 3: Crude Oil tank Cleaning Costs
  Level 2: Enter Dolphin Centrifuge's Crude Oil Recovery System (ORS)
  Level 2: ORS Process Details
  Level 2: Results
    Level 3: Crude Oil Processing – Fluid Balance Calculation
    Level 3: Crude Oil Recovery – ROI Calculation
Level 1: Summary
```

**Current Astro toc prop is FLAT — all Level 2 and Level 3 sub-entries are MISSING.** This is a content-fidelity failure. Must restore full nested hierarchy.

---

## 3. Body Content Fidelity Findings (Rule #1)

### 3a. Headings — Delta vs Legacy MD

| Legacy Heading (verbatim) | Current Astro | Status |
|---|---|---|
| `Dolphin Centrifuge's Oil Recovery System (ORS)` | `Dolphin Centrifuge's Oil Recovery System (ORS)` | ✅ OK |
| `Advantages of crude oil centrifuges for tank bottom processing` | `Advantages of Crude Oil Centrifuges for Tank Bottom Processing` | ⚠️ Capitalisation differs — legacy uses `Advantages of crude oil centrifuges for tank bottom processing` (h3). Restore verbatim |
| `Oil Sludge Treatment System – 3-Step Process Overview` | `Oil Sludge Treatment System — 3-Step Process Overview` | ⚠️ Legacy uses en-dash `–`, Astro uses em-dash `—`. Restore legacy dash |
| `Step 1: Pre-treatment of incoming raw crude waste oil (grading) from day tank.` | `Step 1: Pre-treatment of incoming raw crude waste oil (grading) from day tank` | ⚠️ Legacy has trailing period — preserve |
| `Step 2: De-sludging of Heavy Solids (down to 200µ)` | `Step 2: De-sludging of Heavy Solids (down to 200 microns)` | ⚠️ Legacy uses `200µ`, Astro changed to `200 microns` — revert |
| `Step 3: Polishing Crude Oil for final recovery (down to 1µ; < 1% BS&W)` | `Step 3: Polishing Crude Oil for final recovery (down to 1 micron; less than 1% BS&W)` | ⚠️ Legacy uses `1µ` and `<`, Astro changed — revert to verbatim |
| `Crude Oil Tank Bottom Recovery System Configurations (Fixed and Mobile)` | Same | ✅ OK |
| `Operating and Utility Cost` | Same | ✅ OK |
| `Key factors affecting ORS efficiency` | `Key Factors Affecting ORS Efficiency` | ⚠️ Capitalisation differs — restore legacy verbatim |
| `Unique Features and Upgrades Specific to Dolphin's ORS` | Same | ✅ OK |
| `Dolphin Centrifuge's ORS Flow-Diagram` | `Dolphin Centrifuge's ORS Flow Diagram` | ⚠️ Missing hyphen — legacy has `Flow-Diagram` |
| `Tank Bottom Oil Recovery – Case Study` | `Tank Bottom Oil Recovery — Case Study` | ⚠️ Legacy uses en-dash `–`, Astro uses em-dash `—` |
| `Producer's background` | `Crude Oil Producer's Background` | ⚠️ Legacy is just `Producer's background` — AI added `Crude Oil` prefix |
| `Issues with the producers' current process` | `Issues with the Producers' Current Process` | ⚠️ Capitalisation |
| `Enter Dolphin Centrifuge's Crude Oil Recovery System (ORS)` | Same but legacy says just `Dolphin Centrifuge's Crude Oil Recovery System (ORS)` with prefix `Enter` | ✅ OK |
| `Crude Oil tank Cleaning Costs` | `Crude Oil Tank Cleaning Costs` | ⚠️ Legacy has lowercase `tank` |
| `Results` | Legacy has `## Results` (h2) | ⚠️ Current Astro has `Results` as h3 — should be h2 per legacy |

### 3b. Body Paragraphs — Key Deltas

**ORS intro (line 135 in current Astro):**
- Legacy: `"Our ORS features an Alfa Laval decanter and disc stack centrifuges."`
- Current Astro: `"Our ORS features a decanter and disc stack centrifuges operating together in a proven three-step process."`
- ❌ AI-modified. Removed `Alfa Laval`, added `operating together in a proven three-step process`. Revert to legacy verbatim.

**Advantages heading (h3 in legacy):**
- Legacy: `### Advantages of crude oil centrifuges for tank bottom processing`
- Current Astro: `Advantages of Crude Oil Centrifuges for Tank Bottom Processing` — ⚠️ restore legacy capitalisation

**Processing Temperature section:**
- Legacy: `"Heavier oils are best processed at 180F. Lighter oils processed at 145F produce acceptable BS&W levels."`
- Current Astro: `"Heavier oils are best processed at 180 degrees Fahrenheit. Lighter oils processed at 145 degrees Fahrenheit produce acceptable BS&W levels."`
- ❌ Changed `180F` to `180 degrees Fahrenheit` — this violates Rule #1 (do NOT "improve" F to °F). Revert.

**Case Study pre-straining paragraph:**
- Legacy: `"the temperature for straining was 120 F."`
- Current Astro: `"the temperature for straining was 120 degrees Fahrenheit."`
- ❌ Same issue — revert to `120 F`

**Decanter temperature:**
- Legacy: `"the temperature for de-sludging through the decanter is at 150 F."`
- Current Astro: `"150 degrees Fahrenheit"`
- ❌ Revert to `150 F`

**HSDC temperature:**
- Legacy: `"The temperature for polishing through the HSDC is 180F."`
- Current Astro: `"180 degrees Fahrenheit"`
- ❌ Revert to `180F`

**Case study heating:**
- Legacy: `"heating the oil to about 180 F"`
- Current Astro: `"180 degrees Fahrenheit"`
- ❌ Revert

**Results heading:**
- Legacy has `## Results` (h2 level). Current Astro demoted to h3 inside the case study div.
- ❌ Restore as h2 per legacy

**Summary paragraph:**
- Legacy: `"And finally, Dolphin Centrifuge has the experience and expertise to customize the ORS to match any site's unique needs."`
- Current Astro adds: `"Learn more about our centrifuge sample testing service or explore our disc stack centrifuge FAQ for additional technical guidance."`
- ❌ AI contamination — extra sentence with links not in legacy. Remove.

### 3c. AI-Fabricated Content to REMOVE

1. **AI Summary box** (lines 123–126) — the `bg-navy/5` callout starting "Dolphin Centrifuge supplies modular Oil Recovery Systems…" — NOT in legacy. **Remove.**

2. **Mid-page CTA block** (lines 198–207) — the navy `Need a crude oil tank bottom recovery solution?` box — NOT in legacy. **Remove.**

3. **FAQ section** (lines 723–776) — five fabricated Q&A entries with `<details>` elements. Legacy has NO FAQ section. **Remove entirely**, including `faqJsonLd` from schema.

4. **Bottom CTA bar** (lines 797–810) — `"Recover More Oil From Your Tank Bottoms"` navy CTA box. ApplicationLayout already provides bottom CTA. This is a **duplicate bottom CTA** — remove per Rule #11 duplicate-pattern gate.

5. **Related Articles section** (lines 778–795) — this bullet list is not in legacy. ApplicationLayout sidebar already provides related links via `relatedApplications` and `relatedProducts` props. **Remove** the in-body "Related Articles & Pages" section.

6. **Extra links in Summary** — `"Learn more about our centrifuge sample testing service or explore our disc stack centrifuge FAQ"` — not in legacy. **Remove.**

7. **3-Step Process numbered badges** (lines 214–252) — legacy presents steps as plain `#### h4` headings with `ol` numbered lists. Current Astro uses styled card boxes with numbered circles. Restore as plain headings/lists per legacy.

---

## 4. Image Audit (Rule #5 — Image Quality Gate)

### 4a. Hero Image

| Item | Value |
|---|---|
| **Current hero path** | `/images/crude-oil-tank-bottom-recovery-centrifuge/crude-oil-centrifuge-1380.webp` |
| **Current file size** | 62,644 bytes (63 KB) |
| **Filename suggests** | 1380 px wide |
| **Required spec** | 1440 × 500 px minimum · WebP · max 200 KB |
| **Status** | ⚠️ Borderline — 1380 px is close to 1440 px min. Flag for review. |

**Action:** Copy current hero to `_Old_Hero_Image\crude-oil-tank-bottom-recovery-centrifuge\` for Sanjay's review.

### 4b. Body Images (ALL to be copied to _Image_Repair per Rule #5)

| Image | File | Size | Status |
|---|---|---|---|
| Crude Oil Recovery System – Modular Skids | `crude-oil-recovery-system-skids.webp` | 24,566 B | ⚠️ Review |
| Containerized Crude Oil Recovery System | `crude-oil-recovery-system-containerized.webp` | 48,000 B | ⚠️ Review |
| Centrifuge Operating Cost Calculator | `crude-oil-recovery-cost-calculator.webp` | 19,230 B | ⚠️ Review |
| Crude Oil Tank Bottom Centrifuge Process Diagram | `crude-oil-tank-bottom-centrifuge-process-diagram-400.webp` | 30,518 B | ⚠️ Review |
| crude oil tank bottom 1 (storage tanks) | `crude-oil-tank-bottom-1.webp` | 37,216 B | ⚠️ Review |
| crude oil tank heat loop shaker 1 | `crude-oil-tank-heat-loop-shaker-1.webp` | 25,610 B | ⚠️ Review |
| crude oil tank bottom decanter centrifuge | `crude-oil-tank-bottom-decanter-centrifuge.webp` | 34,672 B | ⚠️ Review |
| crude oil tank bottom disc stack centrifuge | `crude-oil-tank-bottom-disc-stack-centrifuge.webp` | 31,170 B | ⚠️ Review |
| Crude Oil Tank Centrifuge Fluid Balance | `Crude-Oil-Tank-Centrifuge-Fluid-Balance.webp` | 19,150 B | ⚠️ Review |

**Unused images in slug folder (not referenced in legacy or current page):**
- `Dolphin-Centrifuge.png` / `.webp` — logo assets, not body images

---

## 5. Image File Move Commands

### 5a. Create all four staging folders

```powershell
New-Item -ItemType Directory -Force `
  "_Old_Hero_Image\crude-oil-tank-bottom-recovery-centrifuge", `
  "_New_Hero_Image\crude-oil-tank-bottom-recovery-centrifuge", `
  "_Image_Repair\crude-oil-tank-bottom-recovery-centrifuge", `
  "_Image_NB_Fixed\crude-oil-tank-bottom-recovery-centrifuge"
```

### 5b. Archive old hero (COPY ONLY)

```powershell
Copy-Item "public\images\crude-oil-tank-bottom-recovery-centrifuge\crude-oil-centrifuge-1380.webp" `
  "_Old_Hero_Image\crude-oil-tank-bottom-recovery-centrifuge\crude-oil-centrifuge-1380.webp"
Copy-Item "public\images\crude-oil-tank-bottom-recovery-centrifuge\crude-oil-centrifuge-1380.jpg" `
  "_Old_Hero_Image\crude-oil-tank-bottom-recovery-centrifuge\crude-oil-centrifuge-1380.jpg"
```

### 5c. Copy ALL body images to _Image_Repair

```powershell
$slug = "crude-oil-tank-bottom-recovery-centrifuge"
$heroFile = "crude-oil-centrifuge-1380"
Get-ChildItem "public\images\$slug\*" -Include *.webp,*.jpg | Where-Object { $_.BaseName -notmatch $heroFile } | ForEach-Object {
  Copy-Item $_.FullName "_Image_Repair\$slug\$($_.Name)"
}
```

### 5d. Verify handoff folders

```powershell
Get-ChildItem "_Old_Hero_Image\crude-oil-tank-bottom-recovery-centrifuge",
  "_New_Hero_Image\crude-oil-tank-bottom-recovery-centrifuge",
  "_Image_Repair\crude-oil-tank-bottom-recovery-centrifuge",
  "_Image_NB_Fixed\crude-oil-tank-bottom-recovery-centrifuge"
```

---

## 6. Schema Fixes Required

### Product schema
- `name` → keep as-is (factual)
- `description` → keep as-is (factual from legacy content)

### FAQPage schema — REMOVE ENTIRELY
The 5 FAQ items in `faqJsonLd` are AI-fabricated. Legacy has NO FAQ section. Remove `faqJsonLd` from the `jsonLd` array.

### Article schema
- `headline` → `"Crude Oil Tank Bottom Recovery by Industrial Centrifuges"` ✅ OK
- `description` → align with page meta description

---

## 7. Fix Checklist (Execute in Order)

### Step 1 — Image archiving (Rule #5, mandatory BEFORE first-pass page work)
- [ ] Run PowerShell commands in Section 5 above
- [ ] Verify all copies landed

### Step 2 — SEO fields
- [ ] `title=` → ✅ Already correct
- [ ] `description=` → ✅ Acceptable (legacy had empty meta)
- [ ] Remove `faqJsonLd` from `jsonLd` array

### Step 3 — TOC prop — restore full nested hierarchy
- [ ] Replace current flat `toc` array with the full 3-level nested structure from Section 2
- [ ] All `id` attributes on headings in the page body must match the anchors

### Step 4 — Remove AI-fabricated content
- [ ] Remove AI Summary callout box (lines 123–126)
- [ ] Remove mid-page CTA navy box (lines 198–207)
- [ ] Remove FAQ section + `faqJsonLd` (lines 723–776)
- [ ] Remove duplicate bottom CTA bar (lines 797–810)
- [ ] Remove in-body "Related Articles & Pages" section (lines 778–795)
- [ ] Remove AI-added links in Summary paragraph
- [ ] Remove styled step-number badges — restore as plain h4/ol per legacy

### Step 5 — Restore headings verbatim
- [ ] `Advantages of crude oil centrifuges for tank bottom processing` (lowercase)
- [ ] `Oil Sludge Treatment System – 3-Step Process Overview` (en-dash)
- [ ] `Step 1:` — restore trailing period
- [ ] `Step 2: De-sludging of Heavy Solids (down to 200µ)` — restore µ
- [ ] `Step 3: Polishing Crude Oil for final recovery (down to 1µ; < 1% BS&W)` — restore µ and <
- [ ] `Key factors affecting ORS efficiency` (lowercase)
- [ ] `Dolphin Centrifuge's ORS Flow-Diagram` (hyphenated)
- [ ] `Tank Bottom Oil Recovery – Case Study` (en-dash, note: legacy says `Tank Bottom Recovery – Case Study`)
- [ ] `Producer's background` — remove AI-added "Crude Oil" prefix
- [ ] `Crude Oil tank Cleaning Costs` — lowercase `tank`
- [ ] `Results` → restore to h2 level per legacy

### Step 6 — Restore body paragraphs verbatim
- [ ] ORS intro: restore `"Our ORS features an Alfa Laval decanter and disc stack centrifuges."`
- [ ] Temperature units: revert all `degrees Fahrenheit` back to `F` per legacy (`180F`, `145F`, `120 F`, `150 F`, `180F`, `180 F`)
- [ ] Summary: remove AI-added sentence with sample testing / FAQ links

### Step 7 — Table data verification (Rule #1a)
- [ ] Verify ROI table cell values are character-exact to legacy
- [ ] Verify table footnote text matches legacy verbatim

### Step 8 — Rule #12 post-commit check
- [ ] `git diff -w --stat` → must return empty
- [ ] `git status` → must show clean working tree
- [ ] Report commit SHA to Sanjay

---

## 8. Scope Declaration (Rule #6A)

All changes are **Scope: LOCAL** — only `src/pages/crude-oil-tank-bottom-recovery-centrifuge.astro` is modified.  
No shared layouts, components, or CSS files are touched.

`Local change only - file-based verification only for this page.`

---

## 9. Open Questions for Sanjay

1. **Hero image:** The current hero (`crude-oil-centrifuge-1380.webp`) is 1380 px wide — just below the 1440 px minimum spec. **Do you want a replacement hero, or is 1380 px acceptable as a close exception?**

2. **FAQ section:** Legacy has NO FAQ. Current Astro has 5 fabricated Q&A entries. **Confirm:** OK to remove the entire FAQ section and schema?

3. **Results heading level:** Legacy has `## Results` (h2). Current Astro demoted it to h3 inside the case study section. **Restore to h2 per legacy?**

4. **Bottom CTA bar:** ApplicationLayout already provides a bottom CTA. The page has a second one ("Recover More Oil From Your Tank Bottoms"). **Confirm:** OK to remove the duplicate?
