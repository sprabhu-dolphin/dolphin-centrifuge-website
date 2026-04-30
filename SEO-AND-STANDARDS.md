# Dolphin Centrifuge — SEO, Standards & Best Practices Reference
# Last Major Edit: 2026-04-16 by Sanjay

## This file is the single source of truth for all quality standards across every page.
## Reference this before building or reviewing ANY page.

## CRITICAL: NO AGENT BROWSER PREVIEWS

Agents must not launch a browser, open localhost, run browser previews, use browser testing tools, or tell another agent to do so. Browser/localhost previewing can crash Sanjay's PC due to memory limits. All agent-side verification must be file-based only. If visual confirmation is required, ask Sanjay to preview locally.

---

## GOLDEN RULE: LEGACY CONTENT ALWAYS WINS

**Legacy content is SUPREME and overrides every other rule in this document.**

## CRITICAL TITLE-FIELD DISTINCTION (added 2026-04-27)

Legacy WordPress pages can store three different title-like fields, and they are not always the same. Agents must check each field separately and map it to the correct Astro output.

Source-of-truth mapping:
- SEO `<title>` tag: use legacy `rank_math_title` when present. If no `rank_math_title` exists, fall back to the legacy page title field.
- Visible page `<h1>`: use the legacy visible page `<h1>` / page title, not the RankMath SEO title.
- `<meta name="description">`: use legacy `rank_math_description` when present. If there is no legacy meta description, follow the missing-field rule unless a standing exception already applies.

Important:
- Do not assume the legacy SEO title and legacy visible H1 are the same.
- Do not force the visible H1 to match the SEO title when the legacy source used different values.
- Do not audit the Astro SEO title against the legacy visible H1. Compare SEO title to SEO title, and H1 to H1.
- In Astro pages that support separate values, use `title=` for the SEO title tag and `pageTitle=` for the visible page heading when needed.

For any page migrated from the legacy WordPress site, the following fields are **FROZEN** — they must be copied verbatim into the .astro page and NEVER altered, shortened, paraphrased, or "improved":

| Field | Rule |
|---|---|
| `<title>` tag | Copy verbatim — even if over 60 chars |
| `<h1>` heading | Copy verbatim — do not reword |
| `<meta name="description">` | Copy verbatim |
| Image file names | Copy verbatim — do not rename |
| Image `alt` text | Copy verbatim |
| **Image captions** | Copy verbatim — do not add em-dashes, "Click to Enlarge", or any text not in legacy |
| Body copy / headings | Copy verbatim — do not rewrite |
| **Table cell text** | Copy verbatim — every cell, including blanks, punctuation, spacing, and symbols |
| **Punctuation & symbols** | Copy verbatim — do NOT "improve" dashes to em-dashes, add ° degree symbols, or change any character |
| Slug / URL path | Copy verbatim — no changes |

**Why:** Legacy fields carry accumulated SEO authority — backlinks, index history, click-through rates. Any change risks ranking loss. Do not "fix" them.

**The only time you may add or fill a field is when the legacy page is MISSING it entirely.** In that case, flag it in the Report Table and wait for Sanjay's approval before writing new content.

⚠️ **DO NOT:**
- Invent paragraphs, sentences, or sections that do not exist in legacy
- Add `<a href>` links to text that was plain text in legacy
- Merge or split table cells differently than legacy
- Change `-` to `—` (em-dash) or `F` to `°F`
- Add captions like "Click to Enlarge" that were not in legacy

---

## ⛔ FACTUAL ACCURACY — PERMANENT RULES (Confirmed by Sanjay 2026-04-18)

These are business facts. Getting them wrong = legal and reputational risk.

| Claim | CORRECT | DO NOT SAY |
|---|---|---|
| OEM parts status | Dolphin Centrifuge **can source and supply** OEM Alfa Laval parts (as a distributor/reseller) | ~~"Dolphin Centrifuge is an **authorized** source for OEM Alfa Laval parts"~~ — **FALSE. Never say this.** |

**Why it matters:** "Authorized" implies an official Alfa Laval dealership agreement. Dolphin Centrifuge does NOT hold this status. Using this language is a misrepresentation that could expose the business to legal risk.

**Safe language to use:**
- "We can source OEM Alfa Laval parts for your model"
- "Contact us to discuss OEM parts sourcing"
- "We supply OEM and aftermarket parts for Alfa Laval centrifuges"

---

## 1. MANDATORY PRE-EDIT REPORT TABLE

Before touching a single line of code, the agent MUST:

1. Open the .astro file and read its current state (grep for title, h1, meta description, image srcs and alts)
2. Open or fetch the legacy page source and read the same fields
3. Generate the Report Table below and **show it to Sanjay before proceeding**

### Report Table Format

| Field | Legacy Page Value | .astro Current Value | Status |
|---|---|---|---|
| `SEO <title>` | _legacy `rank_math_title` if present, else legacy page title_ | _actual rendered title tag_ | ✅ Match / ⚠️ Mismatch / ❌ Missing in Legacy |
| `<h1>` | _legacy visible H1 / page title_ | _visible Astro page title / H1_ | ✅ / ⚠️ / ❌ |
| `<meta description>` | _legacy `rank_math_description`_ | _actual rendered meta description_ | ✅ / ⚠️ / ❌ |
| Image 1 filename | _paste verbatim_ | _paste verbatim_ | ✅ / ⚠️ / ❌ |
| Image 1 alt text | _paste verbatim_ | _paste verbatim_ | ✅ / ⚠️ / ❌ |
| Image 2 filename | ... | ... | ... |
| Image 2 alt text | ... | ... | ... |
| Canonical URL | _paste verbatim_ | _paste verbatim_ | ✅ / ⚠️ / ❌ |
| FAQ Section | Present / Absent | Present / Absent | ✅ / ⚠️ / ❌ |
| Hero CTA button | Present / Absent | Present / Absent | ✅ / ⚠️ / ❌ |
| Mid-page CTA | Present / Absent | Present / Absent | ✅ / ⚠️ / ❌ |
| Bottom CTA bar | Present / Absent | Present / Absent | ✅ / ⚠️ / ❌ |
| Sidebar CTA | Present / Absent | Present / Absent | ✅ / ⚠️ / ❌ |

### Status Key

- ✅ **Match** — .astro value is identical to legacy. No action needed.
- ⚠️ **Mismatch** — .astro value differs from legacy. Fix the .astro to match legacy exactly.
- ❌ **Missing in Legacy** — Legacy page has no value for this field. **STOP. Inform Sanjay.** Do not invent a value. Wait for approval.
- ℹ️ **New Page** — No legacy equivalent exists. Follow new-page rules (see Section 3).

---

## 2. LEGACY FIELD RULES (Detailed)

### Title Tag
- Copy the legacy SEO title into the Astro `<title>` tag verbatim, character-for-character.
- Use `rank_math_title` as the first source of truth when it exists.
- If the layout appends a brand suffix by default, override that behavior so the final rendered title tag still matches legacy exactly.
- Do NOT shorten, even if it exceeds 60 characters.
- Do NOT reorder keywords.
- Do NOT append or prepend anything.

### H1 Heading
- Copy the legacy visible `<h1>` verbatim.
- Do not replace the visible H1 with the RankMath SEO title unless the legacy page actually used the same value for both.
- Do not substitute synonyms or "cleaner" wording.

### Meta Description
- Copy the legacy `rank_math_description` / meta description verbatim.
- Length does not matter — preserve it exactly.

### Image File Names
- Do not rename any image that existed on the legacy page.
- If an image is new (no legacy equivalent), use descriptive hyphenated lowercase: `waste-oil-centrifuge-disc-stack-recovery.jpg`

### Image Alt Text
- Copy the legacy alt text verbatim for every legacy image.
- If the legacy image had NO alt text: flag in Report Table as ❌ Missing in Legacy — do not invent text without Sanjay's approval.
- For brand-new images with no legacy counterpart: write descriptive alt text including product context.
  - BAD: `alt="centrifuge"`
  - GOOD: `alt="Dolphin Centrifuge DMPX-042 three-phase disc stack centrifuge module for crude oil tank bottom recovery"`

### Canonical URL
- Must match the legacy slug exactly.
- Format: `<link rel="canonical" href="https://dolphincentrifuge.com/[slug]/" />`

---

## 3. NEW PAGE RULES (No Legacy Equivalent)

Only applies when a page has NO WordPress predecessor.

- `<title>` — Under 60 chars, primary keyword first, brand last.
- `<meta description>` — 150–160 chars, primary keyword + value prop + CTA hint.
- `<meta name="robots" content="index, follow">`
- URL: lowercase, hyphenated, descriptive slug with trailing slash.
- One `<h1>` per page containing primary keyword.
- `<h2>` for major sections, `<h3>` for subsections — never skip levels.
- Open Graph tags: og:title, og:description, og:image, og:url, og:type.
- Twitter card meta tags.

---

## 4. URL RULES

- **ALL legacy URLs preserved exactly** — flat, no path prefixes, no changes.
- New pages: lowercase, hyphenated, descriptive slugs.
- Trailing slashes on ALL URLs.

---

## 5. FAQ SECTIONS

- **Do NOT invent FAQ questions.**
- Add a FAQ section **only** if one existed on the legacy page.
- If the legacy page has a RankMath error about a missing FAQ schema, note it in the Report Table as ⚠️ and inform Sanjay. Do not fabricate questions to fix the schema error.
- If the FAQ content appears to be missing from the legacy page but should exist, ask Sanjay to recover it from backup.

---

## 6. STRUCTURED DATA (Schema.org)

Every page type needs appropriate JSON-LD. Schema content must reflect legacy copy — do not invent product specs, prices, or descriptions.

| Page Type | Schema |
|---|---|
| Application pages | `Product` + `FAQPage` (only if FAQ exists) |
| Product pages | `Product` with offers, specs, images |
| Service pages | `Service` |
| Blog / Knowledge | `Article` + `HowTo` or `FAQPage` as appropriate |
| Homepage | `Organization` + `LocalBusiness` |
| Contact | `LocalBusiness` with full NAP |
| Testimonials | `Review` |
| All pages | `BreadcrumbList` |

---

## 7. INTERNAL LINKING STRATEGY

### Cross-Connection Rules
Every page should link to:
- **2–3 related applications** (e.g., waste oil → used oil, black diesel, WVO)
- **1–2 relevant products** (e.g., waste oil → DMPX-042, DMPX-070)
- **1 relevant service** (e.g., → sample testing, centrifuge repair, spare parts)
- **1 knowledge article** (e.g., → selection guide, troubleshooting)
- **Contact page** (always, via CTA)

### Anchor Text Best Practices
- Use descriptive keyword-rich anchor text.
- BAD: "click here", "learn more"
- GOOD: "our waste oil centrifuge systems", "disc stack centrifuge FAQ"
- Vary anchor text — do not use identical text for every link to the same page.

### Sidebar Links (ApplicationLayout)
- Related Applications: 3–4 links
- Recommended Products: 2–3 links with Dolphin model numbers
- Related Articles / Knowledge links: include relevant article links when the page is informational or when no application list is enough by itself
- Quick Contact: phone + email + quote link
- Trust badge: 40+ years, Warren MI
- Audit rule: an `ApplicationLayout` page should not ship with only the Quick Contact and Trust cards in the right sidebar unless Sanjay explicitly approves that page-specific exception. The page must pass non-empty `relatedApplications` and/or `relatedProducts` props, and informational pages should also provide related article links in the approved page pattern.

### Breadcrumbs
- Every page must have breadcrumb navigation.
- Schema markup: `BreadcrumbList`
- Pattern: Home > Applications > Oil & Fuel > Waste Oil Centrifuge

### Table Of Contents
- Do not duplicate TOCs on Astro pages.
- The accepted sitewide pattern is the standard Astro TOC component driven by the page `toc` prop.
- A single standard Astro TOC is allowed even when the legacy page did not have a visible TOC. Do not treat this as AI contamination or a fidelity failure.
- If legacy includes a visible `Table Of Contents`, preserve its items, hierarchy, and order in that standard Astro TOC format by default.
- Do not replace the accepted Astro TOC with a pasted legacy bullet-list TOC unless Sanjay explicitly asks for that page.
- Do not keep both the standard Astro TOC and a second pasted legacy TOC on the same page.
- If legacy does not include a body TOC, the standard Astro TOC may remain; do not add an extra pasted/list-like body TOC.
- Final rule: exactly one visible TOC pattern per page section, and the default should be the accepted Astro TOC format already used across the site.

---

## 8. CTA PLACEMENT

### Every Page Must Have:
1. **Hero CTA** — "Get a Free Quote" button + phone number (above fold)
2. **Mid-page CTA** — Blockquote or callout box after 2–3 content sections
3. **Bottom CTA bar** — Navy banner with quote + sample testing buttons
4. **Sidebar CTA** — Quick Contact card (on ApplicationLayout pages)
5. **Sticky mobile CTA** — Consider floating phone/quote button on mobile

### CTA Hierarchy
- Primary: "Get a Quote" → `/contact-for-alfa-laval-centrifuges/`
- Secondary: "Testing Service" → `/industrial-centrifuge-sample-testing/`
- Tertiary: Phone `(248) 522-2573` / Email `sales@dolphincentrifuge.com`

---

## 8A. LOCAL-FIRST CSS / FONT / INVISIBLE-TEXT SAFETY RULE (critical)

If a page has invisible text, disappearing links, wrong text color, contrast failure, odd underline-only links, or a reported "font issue", the default fix must be LOCAL to that page unless Sanjay explicitly approves a shared fix.

Local-first means:
- change the current page's classes
- change the current page's wrapper markup
- add explicit text-color classes on the current page
- remove or rename a page-local class that is accidentally triggering a shared selector

Do NOT jump straight to changing:
- `src/styles/global.css`
- shared prose rules
- shared layout CSS
- shared CTA/link components

Why:
- One shared CSS tweak can quietly break many completed pages.
- A fix that helps one page but regresses 35 others is a failed fix.

If a shared/global fix is truly needed, the agent must:
1. Say `Scope: GLOBAL`
2. Name the shared file
3. Explain why a page-local fix is not enough
4. Warn that completed pages may regress
5. Require regression checks on representative completed pages before closing the task

Mandatory handoff line:
- `Local change only - file-based verification only for this page.`
or
- `Global/shared change - file-based verification only; ask Sanjay to visually preview representative completed pages before closing if needed.`

## 9. MANDATORY AGENT VERIFICATION PROTOCOL

### STEP 1: THE STATUS SHIELD (Git Source of Truth)
Agents must NEVER rely on a "Session Summary" for status reporting.
- The ONLY source of truth for "Finished" work is `git status` and `git log`.
- If a page is not in a recent commit with a "Full Fidelity Refactor" message, it is **UNFINISHED**.

### RULE: STOP-AND-CHECK
If the "Project Summary" says a page is finished but the "Git Log" shows it is old, the agent MUST **STOP** and inform Sanjay of the discrepancy in plain language before proceeding.

---

## 10. MANDATORY MAINTENANCE OF FINISHED_PAGES_LOG.md

1. **THE UNFINISHED RULE:** If a page is not listed in `FINISHED_PAGES_LOG.md`, it is **UNFINISHED**, even if previously committed.
2. **IMMEDIATE UPDATE:** The agent MUST update the log immediately after every commit with: slug, date, commit hash, and layout engine used.
