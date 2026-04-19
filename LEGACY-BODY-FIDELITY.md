# Legacy Body Fidelity - Dolphin Centrifuge

**Last updated:** 2026-04-19 by Sanjay
**Scope:** Body content of every `.astro` page migrated from the legacy WordPress site
**Authority:** This document is the source of truth for BODY content fidelity. It supersedes the body-related rows in the "GOLDEN RULE: LEGACY CONTENT ALWAYS WINS" table inside `SEO-AND-STANDARDS.md`.

> **Pair this file with:**
> - `SEO-AND-STANDARDS.md` for SEO-sensitive fields (title, h1, meta, image filenames, alt text)
> - `PAGE_APPEARANCE_LOOK.md` for layout rules
> - `LW.xml` at repo root - the authoritative legacy content database

---

## The split: what is body content, what is not

This file governs **body content**:
- Paragraphs
- Section headings `<h2>`, `<h3>`, `<h4>`
- Bullet and numbered lists
- Tables (data, structure, cell values)
- Blockquotes, callouts
- FAQ content and FAQ schema

This file does NOT govern:
- `<title>` tag - verbatim, see SEO-AND-STANDARDS.md
- `<h1>` heading - verbatim, see SEO-AND-STANDARDS.md
- `<meta name="description">` - verbatim, see SEO-AND-STANDARDS.md
- Image filenames and alt text - verbatim, see SEO-AND-STANDARDS.md
- Canonical URL and slug - verbatim, see SEO-AND-STANDARDS.md
- Image captions - verbatim, see SEO-AND-STANDARDS.md

The SEO-sensitive fields above stay verbatim because any change risks search ranking loss. Body content has a looser standard because rigid character-for-character copying tends to produce AI-stiff prose that readers (and Google) recognize as non-human.

---

## The two rules

### Rule 1: COVERAGE (every legacy block must appear on the astro page)

For every element below in `LW.xml` for this slug, a corresponding element must exist on the `.astro` page.

| Legacy element | Must appear on astro | Exact wording required? |
|---|---|---|
| Paragraph | Yes | No - paraphrase and light edits allowed |
| Section heading (`<h2>`/`<h3>`/`<h4>`) | Yes | No - reasonable wording variations allowed |
| Bullet list | Yes (every bullet) | No - per-bullet paraphrase OK |
| Numbered list | Yes (every item, same order) | No - per-item paraphrase OK |
| Table | Yes (every row, every data cell) | **YES for data cells** - see Rule 1a |
| Image reference | Yes (every image) | Filename verbatim - see SEO-AND-STANDARDS.md |
| Blockquote | Yes | No - minor paraphrase OK |
| FAQ question | Yes (if legacy has one) | No - paraphrase OK |
| FAQ answer | Yes (if legacy has one) | No - paraphrase OK |

**Coverage miss = P0 fix.** Any legacy paragraph, heading, list item, or table row missing from the astro page is a content deletion. Auditor flags it as P0.

### Rule 1a: TABLE DATA IS VERBATIM

Tables are the one body-content exception. Data cell values (numbers, specs, model codes, temperatures) must be **character-exact** to legacy. Why:
- A changed spec value is a factual error
- "1000 RPM" becoming "1,000 rpm" changes a data point
- Removing a blank cell changes table shape

Allowed differences in tables:
- Column order may be reorganized for readability
- Header phrasing may be lightly cleaned
- Hyphens may be styled as `-` (never em-dash, never en-dash)

Not allowed in tables:
- Changing any numeric value
- Adding spec rows not in legacy
- Deleting spec rows from legacy
- "Improving" units (e.g., `F` becoming `degrees F`)

### Rule 2: NO CONTAMINATION (nothing on astro may lack a legacy source)

For every paragraph, bullet, callout, FAQ entry, or major heading on the astro page, there must be a traceable corresponding block in `LW.xml` for this slug.

**Contamination = any content on astro that does NOT have a legacy source.** This is a P0 fix. The auditor removes the offending content, it does not "clean it up".

#### The red list (hard bans)

| Banned | Why |
|---|---|
| FAQ sections when legacy has no FAQ | Past Whole-Agent mistake. AI-generated FAQs were added to every page. These are all P0 removals. |
| "Key Benefits" or "Why Choose Us" lists not in legacy | Marketing fluff invented by AI. Removes trust signal. |
| Added `<a href>` links on plain text that was unlinked in legacy | Alters SEO juice distribution. |
| Added CTA buttons in the middle of body copy | Breaks flow. Legitimate CTAs belong in hero/mid/bottom/sidebar per SEO-AND-STANDARDS.md Section 8. |
| Added stats, percentages, throughput claims, or case numbers | Potentially fabricated data. Legal risk. |
| Added customer testimonials, names, or quotes | Risk of fake attribution. |
| Added schema properties not present in legacy (fake FAQ schema, invented Product specs) | Google penalizes fabricated structured data. |
| "As an expert in centrifuges" or "Our extensive experience" style preamble | AI tell. Sanjay did not write this. |
| Any paragraph that reads like a generic industry overview not tied to this specific page's legacy content | AI filler. |

---

## What IS allowed

These are acceptable edits, because they preserve meaning without adding new information:

1. **Paragraph splitting.** A 300-word wall-of-text legacy paragraph may be split into two or three paragraphs at natural sentence boundaries.
2. **Paragraph merging.** Two short legacy paragraphs covering the same sub-point may be merged into one.
3. **Light rewording.** Active voice swapped for passive, synonym substitution for clarity, removing stuttered phrasing. But: the factual content, the technical claims, and the meaning must be identical.
4. **Reformatting into lists.** A legacy paragraph that reads "The unit features X, Y, and Z, and also includes A and B" may be reformatted as a bullet list of the same items.
5. **Heading level changes** when the legacy structure is deeply nested and the astro layout benefits from flattening (e.g., `<h4>` -> `<h3>`). Coverage and order must still be preserved.
6. **Preserving legacy typos and quirks.** Do NOT auto-correct spelling, grammar, or punctuation errors in the legacy text. These are deliberate human-writing signals. The auditor will NOT flag them.
7. **Preserving Sanjay's voice.** Legacy pages often have a direct, engineer-to-engineer tone. Keep it. Do not "professionalize" it.

---

## What is NOT allowed

These are P0 fixes when the auditor finds them:

1. **Paraphrasing that changes meaning.** "Removes 95% of solids" becoming "is highly effective at solid removal" drops a data point.
2. **Dropping a sentence because it "seemed redundant".** Redundancy is in the eye of the SEO algorithm. Legacy stays.
3. **Substituting technical terms.** "Disc stack" and "disc stack separator" are not interchangeable. Match legacy's term choice.
4. **Modernizing units or formats.** `1000 rpm` stays as `1000 rpm`, not `1,000 RPM`. `50 C` stays as `50 C`, not `50 degrees C`.
5. **Generating a summary or TL;DR section.** If legacy didn't have one, astro doesn't get one.
6. **Adding section numbering, step numbering, or "Part 1 / Part 2" labels** not in legacy.
7. **Turning passive legacy text into call-to-action marketing copy.** "Available in 200 and 400 sizes" does not become "Choose from our versatile 200 and 400 sizes today!"

---

## FAQ section rules (special attention - past failure mode)

The previous migration agent fabricated FAQ sections for pages that had none in legacy. This caused two problems:
1. AI-authored content presented as authoritative centrifuge engineering
2. `FAQPage` schema attached to these fabrications, misleading Google

**New rule, zero exceptions:**

- FAQ section exists on astro **if and only if** the legacy page has a `<div class="faq">` / `<section>` / "Frequently Asked Questions" heading AND at least one Q/A pair in `LW.xml`.
- If legacy has no FAQ: astro has no FAQ section, no `FAQPage` schema, no hidden `itemprop="mainEntity"` blocks.
- If legacy has an FAQ: every Q and every A must appear on astro (coverage rule). Paraphrase is OK; invention is not.
- If the `<rankmath>` field in `LW.xml` shows an error about a missing FAQ schema: that is NOT a permission to fabricate one. Flag to Sanjay.

**Auditor behavior:** If the auditor finds an FAQ section on astro but finds no matching content in `LW.xml`, the report will include the entire FAQ as a P0 DELETE block.

---

## How the auditor checks this file

When Opus (the auditor) runs on a slug, this file drives the `body_score` (weighted 45% of overall).

**Pass A - Coverage check:**
- Parse LW.xml for this slug into blocks (paragraphs, headings, table rows, list items, FAQ pairs)
- For each legacy block, search the .astro page for a matching block using similarity matching (meaning-based, not character-based)
- Unmatched legacy blocks = P0 "content deletion" items

**Pass B - Contamination check:**
- Parse the .astro page into blocks
- For each astro block, search LW.xml for a legacy source
- Unmatched astro blocks = P0 "AI contamination" items, with the offending content quoted in the report

**Pass C - Red-list check:**
- Specifically scan astro for the banned patterns (FAQ without legacy FAQ, "Why Choose Us", added CTAs, etc.)
- Each red-list hit = P0 with explicit remove instruction

**Scoring:**
- Start at 100
- Subtract 10 per P0 coverage miss
- Subtract 15 per P0 contamination hit
- Subtract 20 per P0 red-list violation
- Subtract 2 per P1 (minor coverage drift, awkward paraphrase, etc.)
- Floor at 0

**Pass gate:** `body_score >= 90` is required for the page to PASS the overall audit.

---

## Summary in one sentence

Every word that was in the legacy page should be on the astro page (paraphrased is OK), and no word that wasn't in the legacy page should be on the astro page (zero AI invention).
