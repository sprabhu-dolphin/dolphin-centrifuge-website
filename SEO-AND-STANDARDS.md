# Dolphin Centrifuge — SEO, Standards & Best Practices Reference 041626 - Major Edit by Sanjay

## This file is the single source of truth for all quality standards across every page.
## Reference this before building or reviewing ANY page.

---

## 1. SEO FUNDAMENTALS (Every Page)

### Meta Tags
- `<title>` — Under 60 chars, primary keyword first, brand last. Example: "Waste Oil Centrifuge | Industrial Oil Recovery | Dolphin Centrifuge"
- ⚠️ **LEGACY TITLE EXCEPTION:** NEVER shorten or alter a title tag migrated from a legacy WordPress page. Legacy titles carry accumulated SEO authority (backlinks, index history, click-through rates). Changing them risks ranking loss. If a legacy title exceeds 60 chars, leave it exactly as-is and note it here. New pages only should follow the 60-char rule.
- `<meta name="description">` — 150-160 chars, include primary keyword + value prop + CTA hint.
- `<meta name="robots" content="index, follow">`
- Canonical URL on every page: `<link rel="canonical" href="https://dolphincentrifuge.com/[slug]/" />`
- Open Graph tags (og:title, og:description, og:image, og:url, og:type)
- Twitter card meta tags

### Heading Hierarchy
- ⚠️ **Legacy Exception** Never replace legacy headings, keep them verbatim. Only add the following if legacy page is missing them.
- One `<h1>` per page — contains primary keyword
- `<h2>` for major sections — contain secondary keywords
- `<h3>` for subsections — long-tail keywords where natural
- Never skip heading levels (no h1 → h3)

### URL Rules
- ALL legacy URLs preserved exactly (flat, no path prefixes)
- New pages: lowercase, hyphenated, descriptive slugs
- Trailing slashes on all URLs

---

## 2. IMAGE STANDARDS

### File Naming
- ⚠️ **Legacy Exception** Never replace legacy file-names, keep them verbatim. Only modify file-name if legacy image is missing a file-name or file-name is not relevant to page.
- Descriptive, keyword-rich, hyphenated lowercase
- BAD: `IMG_2847.jpg`, `photo1.jpg`
- GOOD: `waste-oil-centrifuge-3-phase-disc-stack-system.jpg`
- Include application/product context in filename

### Alt Text
- ⚠️ **Legacy Exception** Never replace legacy alt-text, keep them verbatim. Only modify alt-text if legacy image is missing a alt-text or alt-text is not relevant to page.
- Every `<img>` MUST have descriptive alt text
- Include primary keyword naturally
- Describe what's IN the image, not just the page topic
- BAD: `alt="centrifuge"`
- GOOD: `alt="Dolphin Centrifuge DMPX-042 three-phase disc stack centrifuge module for crude oil tank bottom recovery"`
- For decorative images only: `alt=""`

---

## 3. AI CITATION OPTIMIZATION

### Structured Data (Schema.org)
Every page type needs appropriate JSON-LD:
- **Application pages**: `Product` + `FAQPage` schemas
- **Product pages**: `Product` schema with offers, specs, images
- **Service pages**: `Service` schema
- **Blog/Knowledge**: `Article` + `HowTo` or `FAQPage` as appropriate
- **Homepage**: `Organization` + `LocalBusiness`
- **Contact**: `LocalBusiness` with full NAP (Name, Address, Phone)
- **Testimonials**: `Review` schema

### FAQ Sections
- Do NOT invent FAQ questions. Add FAQ Section ONLY if one existed on the legacy page. If you see RankMath error on Legacy page about missing FAQ, then Point this out to Sanjay. Do not add FAQ section just for the sake of it. Have Sanjay recover it from the backup if possible.

---

## 4. INTERNAL LINKING STRATEGY

### Cross-Connection Rules
Every page should link to:
- **2-3 related applications** (e.g., waste oil → used oil, black diesel, WVO)
- **1-2 relevant products** (e.g., waste oil → DMPX-042, DMPX-070)
- **1 relevant service** (e.g., → sample testing, centrifuge repair, spare parts)
- **1 knowledge article** (e.g., → selection guide, troubleshooting)
- **Contact page** (always, via CTA)

### Anchor Text Best Practices
- Use descriptive keyword-rich anchor text
- BAD: "click here", "learn more"
- GOOD: "our waste oil centrifuge systems", "disc stack centrifuge FAQ"
- Vary anchor text — don't use identical text for every link to the same page

### Sidebar Links (ApplicationLayout)
- Related Applications: 3-4 links
- Recommended Products: 2-3 links with Dolphin model numbers
- Quick Contact: phone + email + quote link
- Trust badge: 40+ years, Warren MI

### Breadcrumbs
- Every page should have breadcrumb navigation
- Schema markup: `BreadcrumbList`
- Pattern: Home > Applications > Oil & Fuel > Waste Oil Centrifuge

---

## 5. CTA PLACEMENT

### Every Page Must Have:
1. **Hero CTA** — "Get a Free Quote" button + phone number (above fold)
2. **Mid-page CTA** — Blockquote or callout box after 2-3 content sections
3. **Bottom CTA bar** — Navy banner with quote + sample testing buttons
4. **Sidebar CTA** — Quick Contact card (on ApplicationLayout pages)
5. **Sticky mobile CTA** — Consider floating phone/quote button on mobile

### CTA Hierarchy
- Primary: "Get a Free Quote" → `/contact-for-alfa-laval-centrifuges/`
- Secondary: "Free Sample Testing" → `/industrial-centrifuge-sample-testing/`
- Tertiary: Phone `(248) 522-2573` / Email `sales@dolphincentrifuge.com`

---

## 6. DEMO BOX / BEFORE-AFTER SECTION

### For Application Pages Where Sample Testing Data Exists:
Add a "Pilot Testing Results" or "See the Difference" section showing:
- Before photo (dirty/contaminated fluid)
- After photo (clean/separated product)
- Key metrics (% removal, clarity improvement, PPM reduction)
- Link to sample testing service

### Implementation:
```astro
<div class="demo-box bg-light-bg rounded-xl p-6 border">
  <h3>Pilot Testing Results</h3>
  <div class="grid grid-cols-2 gap-4">
    <div>
      <img src="before.jpg" alt="Contaminated waste oil sample before centrifuge processing" />
      <span>Before</span>
    </div>
    <div>
      <img src="after.jpg" alt="Clean recovered oil after disc stack centrifuge separation" />
      <span>After</span>
    </div>
  </div>
  <table></table>
  <a href="/industrial-centrifuge-sample-testing/">Send Us Your Sample →</a>
</div>

---

## 7. MANDATORY AGENT VERIFICATION PROTOCOL (Crucial)

To prevent agents from hallucinating progress or relying on outdated summaries, the following two steps are **HARD-CODED** into the workflow and MUST be executed at the start of every page task.

### **STEP 1: THE DISCOVERY LOCK (Mandatory live audit)**
Before starting any page, the agent MUST run a technical search (`grep` or `view_file`) and **explicitly report the raw code status to the user.**
- **CHECK:** Does the file use CSS Grid (`grid-cols-`) or legacy Flex/Centered layout (`flex`, `text-center`)?
- **CHECK:** Does it have "Rugged Industrial" containers (`rounded-xl border border-gray-100 shadow-sm`)?
- **ACTION:** Present line numbers proving the "As-Is" state before proposing the "To-Be" refactor.

### **STEP 2: THE STATUS SHIELD (Git Source of Truth)**
Agents must NEVER rely on the "Session Summary" for status reporting. 
1.  **THE ONLY SOURCE OF TRUTH** for "Finished" work is the `git status` and `git log`.
2.  If a page is not in a recent commit with a "Full Fidelity Refactor" message, it is considered **UNFINISHED**.

### **RULE: STOP-AND-CHECK**
If the "Project Summary" says a page is finished but the "Git Log" shows it is old, the Agent must **STOP** and inform the user of the discrepancy in ELI5 (Explain Like I'm 5) terms.

---

## 8. MANDATORY MAINTENANCE OF FINISHED_PAGES_LOG.md

To maintain a verifiable record of completion, the following rule is **HARD-CODED** into the project:

1.  **THE UNFINISHED RULE:** If a page is not listed in `FINISHED_PAGES_LOG.md`, it is **UNFINISHED**, even if it has been committed previously.
2.  **IMMEDIATE UPDATE:** The agent MUST update the log immediately after every commit with the slug, date, commit hash, and layout engine used.
 