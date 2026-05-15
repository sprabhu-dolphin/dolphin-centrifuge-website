# Dolphin AEO/GEO Operating Plan

## Purpose

This plan controls the AEO/GEO optimization phase for the Dolphin Centrifuge Astro website.

Goal: make the site easier for AI answer engines and search systems to understand, cite, and trust, without weakening the existing migration rules around legacy fidelity, truthful schema, image handling, or page appearance.

## Hard Roles

### Codex

Codex is the auditor, dispatcher, queue owner, and log keeper.

Codex may:
- Read any repo file needed for audit and planning.
- Read `ga4-landing-pages-top160.xlsx` in the Git root.
- Pick the next page by traffic priority.
- Find the matching source file under `src/pages`.
- Write exact Astro-Pass-On-Instructions for one page.
- Verify the exact commit SHA returned by Astro Agent.
- Update `CODE_AEO_GEO_LOG.md` after session steps and after verified PASS or FAIL.
- Edit AEO/GEO control docs when Sanjay asks.

Codex must not:
- Edit site implementation files during AEO/GEO page work.
- Edit `src/pages`, `src/layouts`, `src/components`, `src/lib`, `public`, or image assets as part of a page fix.
- Commit, stage, push, pull, reset, checkout, or run destructive git actions.
- Start or coordinate multi-agent work.

### Astro Agent

Astro Agent is the only implementation agent.

Astro Agent may:
- Implement only the exact Astro-Pass-On-Instructions provided by Codex.
- Edit only files explicitly listed under `Allowed files to edit`.
- Commit the completed work.
- Return the exact commit SHA and stop.

Astro Agent must not:
- Pick its own slug.
- Add side fixes.
- Broaden the scope.
- Touch `CODE_AEO_GEO_LOG.md`.
- Work at the same time as another implementation agent.
- Spawn subagents or use multi-agent mode.

## Required Read Order

For Codex before choosing or auditing a page:
1. `handoff.md`
2. `CODE_AEO_GEO_LOG.md`
3. `AEO_GEO_OPERATING_PLAN.md`
4. `AEO_GEO_SKILL.md`
5. `ga4-landing-pages-top160.xlsx`
6. `DOLPHIN_GEO_ROADMAP.md`
7. `DOLPHIN_NOMENCLATURE_POLICY_REVERSAL.md`
8. Existing migration rule docs as needed.

For Astro Agent before implementing an AEO/GEO handoff:
1. `.agents/rules/astro-migration.md`
2. `.agents/rules/aeo_geo_pathway.md`
3. The exact Astro-Pass-On-Instructions from Codex
4. Any source docs named in the instructions

## Traffic Queue

The canonical ranking file is:

`ga4-landing-pages-top160.xlsx`

Codex uses these columns:
- `Rank`
- `Landing Page`
- `Sessions`

Queue rules:
- `/` is the homepage.
- `/` maps to `src/pages/index.astro`.
- Built homepage output is `dist/index.html`, but edits happen in `src/pages/index.astro`.
- `(not set)` is skipped unless Sanjay explicitly asks to inspect it.
- Normal landing pages map from `/slug` to `src/pages/slug.astro` unless repo inspection proves a different route file.
- Codex chooses the highest-ranked page not already marked PASS in `CODE_AEO_GEO_LOG.md`.
- Work proceeds one page at a time.
- After Codex records a PASS, Codex must immediately select, inspect, log, and output the next page's Astro-Pass-On-Instructions in the same response. Do not wait for Sanjay to ask for the next slug.

## Launch Gate

Sanjay's primary business priority is to go live as soon as safely possible.

Pre-live AEO/GEO scope is limited to the first 30 highest-traffic real pages from `ga4-landing-pages-top160.xlsx`, including `/` as the homepage and skipping `(not set)`.

After those top 30 pages pass Codex audit, AEO/GEO must not block launch unless Sanjay explicitly reopens the launch gate. Continue the remaining AEO/GEO work after the site is live.

## AEO/GEO Priority Ladder

For each selected page, Codex decides which must-do items are appropriate. Do not force every item onto every page.

Priority order:
1. Truthful indexing basics: SEO title, visible H1, meta description, canonical, and schema must not conflict.
2. Freshness: `dateModified` belongs in page schema when the page content has actually been reviewed or changed.
3. Entity clarity: customer-facing model references follow the May 2026 Alfa Laval naming reversal.
4. WHPX-first policy: default to WHPX current-production models where the policy applies.
5. Author and trust: default to schema-level author/review signals, not visible visitor-facing bylines, unless Sanjay explicitly asks for visible author treatment on that page.
6. Answer extraction: short answer capsules only when they can be written from existing verified facts.
7. Structured data: add or repair FAQPage, HowTo, VideoObject, Product, Dataset, BreadcrumbList, and Organization schema only when truthful and supported by visible content or global site identity.
8. Page-local link integrity: every Astro handoff must include the quick link check for internal hrefs, same-page anchors, and obvious label/href mismatches in the selected page file only.
9. AI crawler access: `llms.txt` and `robots.txt` are foundation tasks, not side quests during an unrelated page pass.

## Schema-Only Author Enrichment

Add schema-only author enrichment. Do not add any visible author or reviewed-by text unless Sanjay explicitly asks for visible author treatment on that page.

For every selected AEO/GEO page, identify Sanjay Prabhu MSME in hidden schema where truthful. Use `Article.author` when an Article schema exists. If the page has no Article schema, use `WebPage.author`. Do not create an Article schema only to carry author data.

Canonical hidden Sanjay author object:
- name: Sanjay Prabhu MSME
- role/title: Founder and Chief Engineer, Dolphin Centrifuge, or the existing site-consistent title
- worksFor: Dolphin Centrifuge
- description: 40+ years of specialized experience in industrial centrifuge systems
- url: use the existing Dolphin about page unless a dedicated author page exists
- alumniOf: University of Arkansas, Fayetteville
- hasCredential: Master of Science in Mechanical Engineering, University of Arkansas, Fayetteville, Class of 1990
- Keep education and credential details schema-only. Do not add visible degree, school, class year, author, or reviewed-by text unless Sanjay explicitly asks for visible author treatment.

Pages already passed before this credential policy still need a narrow hidden-schema-only supplemental pass. Do not reopen content, images, layout, captions, CTAs, links, or visible text during that supplemental pass unless Codex explicitly assigns that separate issue.

## Astro-Pass-On-Instructions

## Copy-Paste Handoff Rule

If Codex wants Sanjay to tell Astro Agent anything, Codex must provide the exact ready-to-send copy-paste block for Astro Agent in the response.

Do not say "have Astro Agent commit" or "send this to Astro Agent" without also giving the complete text Sanjay can paste directly into Astro Agent.

This applies to:
- New page instructions.
- Correction instructions.
- Pre-commit clean commit instructions.
- SHA/report-back requests.
- Any stop-and-report instruction.

Codex should not make Sanjay translate, summarize, or reword instructions for Astro Agent.

The required format is:

```text
ASTRO-AGENT-COPY-PASTE

...
```

Every Codex handoff to Astro Agent must include:

```text
ASTRO-PASS-ON-INSTRUCTIONS

Mode: AEO/GEO single-page implementation
Multi-agent mode: FORBIDDEN

Landing page:
Queue label:
GA4 rank:
Sessions:
Source file:

Required reading:
1.
2.
3.

Allowed files to edit:
-

Do not edit:
-

Must-do items:
1.
2.
3.

Quick link check:
- Check internal `href` links in this page file only.
- Verify each internal target exists as a source page route or in `public/_redirects`.
- Verify same-page `#anchor` links match real element IDs.
- Fix obvious broken or label/href-mismatched links found in this file.
- Do not run a full-site crawl.
- Do not validate every external URL unless it is visibly malformed.

Forbidden changes:
-

Verification checklist:
- [ ]
- [ ]
- [ ]

Report-back format:
- What changed
- Files changed
- What was intentionally not changed
- Any uncertainty
- Verification performed
- Exact commit SHA

After reporting the SHA, stop.
```

## Logging

Codex maintains `CODE_AEO_GEO_LOG.md`.

Codex appends a short entry:
- At the start of each selected page.
- When Astro-Pass-On-Instructions are issued.
- When Astro Agent returns a SHA.
- After Codex audit: PASS or NEEDS FIXES.

Astro Agent never edits the log.

## Completion Rule

A page is not complete because Astro Agent says it is complete.

A page is complete only when Codex audits the exact commit SHA and records PASS in `CODE_AEO_GEO_LOG.md`.

After recording PASS, Codex must continue automatically:
- Pick the next highest-ranked real top-30 page that is not marked PASS.
- Inspect the matching source file.
- Add the new `INSTRUCTIONS ISSUED` entry to `CODE_AEO_GEO_LOG.md`.
- Return the PASS summary and the next strict Astro-Pass-On-Instructions block in the same response.
- Stop only for a NEEDS FIXES blocker, completion of the top-30 pre-live queue, or Sanjay's explicit pause instruction.
