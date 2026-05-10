# TOP_20_PAGES_REAUDIT

## Purpose
This file is the standing instruction set for Astro-Agent (AA) to re-audit and fix Top 20 pages one page at a time.

## Priority
Fix only structural SEO issues that can impact search performance:
- SEO title
- Visible H1
- Meta description
- Canonical
- Required schema type and schema accuracy
- BreadcrumbList presence
- FAQ authenticity and FAQ schema parity
- Duplicate TOC
- Duplicate bottom CTA
- Missing alt attributes only

Ignore image quality, image dimensions, filename swaps, visual polish, typos, and cosmetic cleanup unless explicitly requested by Sanjay.

## Non-Negotiable Guardrails
1. One page per run. Do not touch other pages.
2. Keep edits page-local whenever possible.
3. Do not edit global CSS.
4. Do not edit shared layouts/components unless Sanjay explicitly approves a GLOBAL exception.
5. Do not restore legacy images or do image replacement work in this flow.
6. File-based verification only.

## Conflict Resolution (Important)
For this Top 20 re-audit campaign, Astro-Agent is expected to make fixes and commit each completed page.

If any older instruction file says "do not commit/push/pull/stage," treat that as superseded for Astro-Agent page-fix runs under this file.

Required commit rule for this campaign:
- One commit per completed page.
- Return both full SHA and short SHA after each page.
- If Astro-Agent is blocked from committing, stop and report the blocker instead of skipping SHA.

## Required Per-Page Workflow
1. Bind to one slug and one page file.
2. Review the page against:
   - TOP_20_PAGE_AUDIT_FINDINGS.xlsx (matching tab)
   - TOP_20_PAGES_REAUDIT.md (this file)
   - SEO-AND-STANDARDS.md
3. Fix structural SEO blockers only.
4. Re-check final rendered title logic (not only local props).
5. Re-check duplicate TOC and duplicate bottom CTA through shared layout chain.
6. Re-check FAQ authenticity against legacy source before keeping FAQ or FAQPage schema.
7. Finish with one commit for that page only.

## Structural Rules That Must Be Enforced
- Exact title handling:
  - If legacy RankMath title exists, render exact match.
  - Use page-local title controls such as pageTitle and disableTitleSuffix when needed.
- H1 is checked separately from SEO title.
- Meta description must match legacy/approved target for that page.
- Canonical must be correct for the page URL.
- Required schema must be present and truthful for page type.
- BreadcrumbList must be present.
- FAQ must be removed if no visible legacy FAQ exists and no explicit Sanjay approval exists.
- If FAQ is removed, remove FAQPage schema and FAQ TOC entry in same pass.
- Do not allow duplicate TOCs.
- Do not allow duplicate bottom CTAs:
  - If page has its own bottom CTA and shared footer CTA exists, remove page-level duplicate behavior (often hideBottomCTA={true} or remove page CTA based on page pattern).
- Alt attribute presence is required on img tags in page content.

## Output Format Required From AA (Every Page)
AA must return all of the following after each page run:

1. Page slug
2. Status: PASS or NEEDS FIXES
3. Files changed
4. Structural fixes completed (short list)
5. Open issues (if any)
6. Commit SHA:
   - Full SHA
   - Short SHA
7. Confirmation that only intended files were changed

## Handoff Template (Use Per Page)
Use this exact template and fill values for the current slug:

```
Follow TOP_20_PAGES_REAUDIT.md exactly.

Page for this run:
- Slug: <slug>
- URL: <url>
- File: <path>

Scope lock:
- Structural SEO only
- One page only
- No image work
- No global CSS/shared layout/component edits unless explicitly approved

Required fixes:
- <list only the blockers for this page>

Verification before finishing:
- Title final render verified
- H1 verified
- Meta description verified
- Canonical verified
- Required schema + BreadcrumbList verified
- FAQ authenticity/schema parity verified
- No duplicate TOC
- No duplicate bottom CTA
- Alt attributes present

Required return:
- Status: PASS or NEEDS FIXES
- Files changed
- Structural fixes completed
- Open issues
- Commit SHA (full + short)
- Confirmation of file scope
```

## Standing Note
If a direct instruction from Sanjay conflicts with this file for a specific page, follow Sanjay's direct instruction for that page and document the exception in the return.
