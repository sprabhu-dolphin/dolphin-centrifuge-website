# CHANGE_NOTES.md — Structural Changes from Sanjay's Tree Review

**Date:** March 29, 2026
**Source:** Sanjay's markup of the interactive site tree visualization

---

## 1. Merges

### 1a. Rental Pages → Merge into single page
- `/disc-stack-centrifuge-rental/` (T3, 91 sessions)
- `/decanter-centrifuge-rental/` (T3, 79 sessions)
- **Action:** Merge both into a single rental page. Rewrite content (not just paste together). Remember: rental pages are SEO honey traps — keep for inbound traffic, downplay in nav, don't actively sell rental business.
- **301s needed:** One URL becomes canonical, the other 301s to it. Sanjay to decide which slug survives.
- **DECIDED:** New combined URL: `/industrial-centrifuge-rental/` — broader keyword, stronger page. 301 both old URLs to it. Use H2-level headings for "Disc Stack Centrifuge Rental" and "Decanter Centrifuge Rental" sections on the merged page.

### 1b. Calculator Disclaimer → Merge into calculator pages
- `/centrifuge-calculator-disclaimer/` (T4, no traffic)
- **Action:** Fold disclaimer text into whichever pages contain calculators (inline or footer). Kill as standalone page.
- **301:** Not needed — no traffic, no SEO value. Can simply remove or 410.

---

## 2. Removals

### 2a. Landing Page — Kill
- `/waste-oil-centrifuges-lp/` (T4, no traffic)
- **Action:** Delete. No redirect needed — no traffic, no value.
- **Status:** Sanjay confirmed: "def. gone!"

### 2b. Customer Testimonials — KEEP AND EXPAND (Reversed Apr 2)
- `/dolphin-centrifuge-customer-testimonials/` (T4, no traffic)
- **Action:** Keep page. Expand with testimonial tiles matching homepage layer + additional testimonials from customer emails Sanjay has. Homepage layer links to this page as the full testimonials destination.
- **Status:** Decision reversed Apr 2. Do NOT remove.

---

## 3. Reclassifications / Moves

### 3a. Case Studies → Knowledge Center
Both case study pages should live under the Knowledge Center, sub-categorized under "Case Studies":
- `/waste-oil-centrifuge-case-study-marine-and-industrial-waste-oil-recovery/` (T3, 121 sessions)
- `/industrial-wastewater-centrifuge-silicon-wafer-facility/` (T4, no traffic)
- **Action:** These keep their legacy URLs (no URL changes!) but are categorized and linked from the Knowledge Center under a "Case Studies" sub-category.
- **No 301 needed** — URLs stay the same, just the navigation/categorization changes.

### 3b. Knowledge Center Structure
The Knowledge Center (`/knowledge-center/`) replaces the old blog index and organizes all knowledge/blog content into ~5 sub-categories:
1. **Maintenance** — lubrication, installation, operating water, parts, etc.
2. **Learning** — how things work, comparisons, selection guides, FAQs
3. **Troubleshooting** — bowl issues, vibration, speed problems, seal break, etc.
4. **Case Studies** — the two case study pages above + any future ones
5. **Performance Optimization** (confirmed Apr 2)

~~**Open question:** Confirm the exact 5 sub-category names and which articles go where.~~ **RESOLVED Apr 2** — 5th category is Performance Optimization.

---

## 4. Centrifuge Model Pages — Strategy

### Legacy AL model pages: KEEP as-is
All existing `/alfa-laval-*` model pages stay with their legacy URLs. These are the SEO-bearing pages.

### DMPX module nomenclature: SPRINKLE into legacy pages
- Add a brief paragraph + image with DMPX model name in alt-text to relevant legacy AL pages
- Example: `/alfa-laval-whpx-510-centrifuge/` gets a paragraph mentioning it's available as the "DMPX-042 module" with a module photo
- This cross-pollinates the new Dolphin branding into the established SEO pages

### Existing LW DMPX pages: KEEP as-is
- Already created by CC, styled to new site look
- No new DMPX pages to be created for now
- `/dmpx-006-ws/` legacy page → fold content into DMPX-006 page as a section — **MAYBE** (decided Mar 29, uncertain Apr 2)

### Net result: Dual model page strategy
- Legacy AL pages = SEO inbound magnets (don't touch URLs)
- Existing LW DMPX pages = Dolphin-branded product pages (modern look, no new pages for now)
- Cross-linking between them creates internal link equity

---

## 5. Hemp/Cannabis Pages — 301 to Stainless Steel (Decided Mar 29)

These 3 legacy application pages were dropped by CC during migration. They have real traffic (522 sessions combined) but Sanjay has decided NOT to restore them — instead 301 all three to the stainless steel centrifuge page.

- `/hemp-extraction-centrifuge/` (T2, 237 sessions) → 301 to `/stainless-steel-centrifuge/`
- `/cannabis-thc-extraction-centrifuge/` (T2, 206 sessions) → 301 to `/stainless-steel-centrifuge/`
- `/hemp-biomass-centrifuge/` (T3, 79 sessions) → 301 to `/stainless-steel-centrifuge/`

**Rationale:** The stainless steel centrifuge page is the natural parent — these applications all use SS disc stack centrifuges. The 301s consolidate link equity into the stronger page.

---

## 6. DMPX-014-WO — Fold into DMPX-014 (Decided Mar 29)

- `/dmpx-014-wo-self-cleaning-disc-stack-centrifuge/` → 301 to `/dmpx-014-self-cleaning-3-phase-disc-stack-centrifuge/`
- **Rationale:** The -WO page was essentially a cut-sheet Sanjay dumped in. The DMPX-014 page should cover all variants (including -WO) as sections within one page.

---

## 7. URGENT: AI-Generated FAQs — Root Out Site-Wide (Flagged Mar 29)

CC generated fake FAQ sections on multiple pages during the migration. These are **legal liabilities** per Sanjay — they contain invented answers that could misrepresent Dolphin Centrifuge's expertise and services.

- The legacy 101 FAQ pages were lost on LW when RankMath was deleted from CMS. Content was recovered from LW backup.
- Both FAQ pages restored and staged on CC+CG master branch: `disc-stack-centrifuge-faq.astro` (543 lines) and `industrial-centrifuges-faq.astro` (422 lines). Content appears to be real Sanjay-written answers.
- Our cowork-audit branch has empty shells (disc-stack FAQ is just a dead RankMath shortcode). **Need to pull FAQ content from master when we merge.**
- Every CC-generated FAQ section across per-page staging must be identified and removed.
- **Bulk FAQ removal (144 pages, 5817 lines) completed Session 5.** Remaining work is per-page verification.

---

## 8. Summary of 301 Redirects (Complete)

| From | To | Reason |
|------|----|--------|
| `/alfa-laval-mab-104-centrifuge-small-manual-clean-disc-stack-centrifuge/` | `/alfa-laval-mab-104-centrifuge/` | Duplicate (decided Mar 29) |
| `/disc-stack-centrifuge-rental/` | `/industrial-centrifuge-rental/` | Rental merge — new combined URL |
| `/decanter-centrifuge-rental/` | `/industrial-centrifuge-rental/` | Rental merge — new combined URL |
| `/hemp-extraction-centrifuge/` | `/stainless-steel-centrifuge/` | Hemp/cannabis consolidation (decided Mar 29) |
| `/cannabis-thc-extraction-centrifuge/` | `/stainless-steel-centrifuge/` | Hemp/cannabis consolidation (decided Mar 29) |
| `/hemp-biomass-centrifuge/` | `/stainless-steel-centrifuge/` | Hemp/cannabis consolidation (decided Mar 29) |
| `/dmpx-014-wo-self-cleaning-disc-stack-centrifuge/` | `/dmpx-014-self-cleaning-3-phase-disc-stack-centrifuge/` | Variant fold-in (decided Mar 29) |
| `/dmpx-006-ws/` | TBD (flat URL, no `/centrifuges/` sub-path) | Variant fold-in — **MAYBE** (decided Mar 29, uncertain Apr 2) |
| `/waste-oil-centrifuges-lp/` | — (delete/410) | No traffic, no value |
| `/centrifuge-calculator-disclaimer/` | — (delete/410 or merge inline) | No traffic |
| ~~`/dolphin-centrifuge-customer-testimonials/`~~ | ~~(removed)~~ | REVERSED Apr 2 — keeping and expanding page |

---

## Open Questions for Sanjay

1. ~~**Rental merge — which URL survives?**~~ **RESOLVED:** New combined URL `/industrial-centrifuge-rental/`
2. ~~**Knowledge Center sub-categories** — confirm the 5 names (Maintenance, Learning, Troubleshooting, Case Studies, + ?)~~ **RESOLVED Apr 2:** 5th category is Performance Optimization.
3. ~~**Testimonials page** — need to check backlinks before killing. OK to 301 to homepage?~~ **RESOLVED Apr 2:** Keeping page, expanding with tiles + customer email testimonials.
