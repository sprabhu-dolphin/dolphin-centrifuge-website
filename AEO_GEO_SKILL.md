---
name: AEO_GEO_SKILL
description: Use for Dolphin Centrifuge Astro AEO/GEO optimization, AI search readiness, answer-engine optimization, llms.txt, robots.txt, schema/entity cleanup, WHPX-first nomenclature, author trust signals, answer capsules, and traffic-priority page dispatch from ga4-landing-pages-top160.xlsx.
---

# Dolphin AEO/GEO Skill

## What This Skill Does

This skill controls AEO/GEO optimization for the Dolphin Centrifuge Astro repo.

It is not a general SEO rewrite skill. It is a controlled workflow for making existing pages more understandable, trustworthy, and citable by AI answer engines while preserving the existing migration rules.

## Non-Negotiable Rules

- Codex is auditor, dispatcher, queue owner, and log keeper only.
- Astro Agent is the only implementation agent.
- No multi-agent mode.
- No subagents.
- No parallel workers.
- One page at a time unless Sanjay explicitly changes the mode.
- No side fixes.
- No invented facts.
- No fake FAQs.
- No unsupported schema.
- No image selection changes unless Sanjay explicitly opens image work.
- No em dashes in new AI-authored text.

## Memory Use Instructions

Before planning or auditing AEO/GEO work, Codex should use memory when available.

Quick memory pass:
1. Search `C:\Users\sprab\.codex\memories\MEMORY.md` for:
   - `Dolphin Astro`
   - `grouped triage`
   - `single-agent`
   - `caption`
   - `WHPX`
   - `nomenclature`
   - `AEO`
   - `GEO`
   - `Astro migration`
2. Open only the most relevant 1 or 2 rollout summaries if exact evidence is needed.
3. Do not broadly scan all memory summaries unless stuck.
4. Prefer current repo files over memory if they conflict.
5. If memory and repo instructions conflict, stop and ask Sanjay.

Durable lessons from memory:
- Sanjay wants one clear next action, not menus.
- Keep grouped or recurring work to one defect family at a time.
- Bind audit conclusions to the exact commit SHA.
- Do not reopen pages Sanjay has closed unless he explicitly reopens them.
- Keep repo guidance short and useful. Do not bloat `.agents/rules/astro-migration.md`.
- Page-local fixes are preferred over global changes unless a global cause is proven.
- Shared CSS, layouts, and components are high-risk and must be called out as GLOBAL.
- Astro repo work defaults to single-agent, patch-only, no unrelated cleanup.
- Caption compliance means real `<figure><figcaption>` structure, not nearby caption text.
- User-managed images are not restored or swapped back unless Sanjay asks.

## Repo Read Order

Codex AEO/GEO startup:
1. `AEO_GEO_OPERATING_PLAN.md`
2. `AEO_GEO_SKILL.md`
3. `CODE_AEO_GEO_LOG.md`
4. `ga4-landing-pages-top160.xlsx`
5. `DOLPHIN_GEO_ROADMAP.md`
6. `DOLPHIN_NOMENCLATURE_POLICY_REVERSAL.md`
7. `SEO-AND-STANDARDS.md`
8. `LEGACY-BODY-FIDELITY.md`
9. `PAGE_APPEARANCE_LOOK.md`
10. `AUDIT_HANDOFF_PROTOCOL.md`

Astro Agent AEO/GEO startup:
1. `.agents/rules/astro-migration.md`
2. `.agents/rules/aeo_geo_pathway.md`
3. The exact Astro-Pass-On-Instructions from Codex

## Traffic Queue Rules

Canonical traffic file:

`ga4-landing-pages-top160.xlsx`

Codex uses `Rank`, `Landing Page`, and `Sessions`.

Special mappings:
- `/` means homepage.
- Homepage source is `src/pages/index.astro`.
- Homepage build output is `dist/index.html`.
- `(not set)` is skipped unless Sanjay explicitly says otherwise.

Normal mapping:
- `/example-slug` usually maps to `src/pages/example-slug.astro`.
- Codex must verify the file exists before writing a handoff.

## Launch Gate Rule

Sanjay's priority is launch speed. AEO/GEO is important, but it must not become an endless pre-launch detour.

Pre-live scope:
- Complete the first 30 highest-traffic real pages from `ga4-landing-pages-top160.xlsx`.
- Include `/` as homepage.
- Skip `(not set)` unless Sanjay explicitly includes it.
- Work one page at a time.

After the top 30 pass Codex audit, stop treating AEO/GEO as a launch blocker. Continue the remaining pages after the site is live unless Sanjay explicitly changes the gate.

## AEO/GEO Optimization Rules

### Entity And Naming

- Follow `DOLPHIN_NOMENCLATURE_POLICY_REVERSAL.md`.
- Customer-facing content uses Alfa Laval names, not Dolphin DMPX/DMB names.
- Default recommendation is WHPX where the policy applies.
- Use legacy MOPX/MAPX mainly for legacy installations, full-discharge exceptions, historical data, or schema aliases.
- Preserve URL slugs.
- Use `Product.alternateName` only when truthful and useful for legacy entity matching.

### Content

- Preserve legacy body content unless Sanjay approved an exception.
- Do not invent new claims, specs, capacities, pricing, testimonials, performance data, or guarantees.
- Add answer capsules only from facts already present on the page or verified source docs.
- Keep answer capsules short, direct, and useful. Do not add marketing fluff.
- Do not add generic "Why Choose Us" or generic benefits blocks.

### Schema

- Schema must match visible content and known site identity.
- `FAQPage` requires a rendered FAQ with matching questions and answers.
- `HowTo` requires visible procedural steps.
- `VideoObject` requires a real visible video and enough verified video metadata.
- `Dataset` requires real visible data, not vibes.
- `Product` schema must not invent pricing, condition, manufacturer, capacity, or availability.
- `dateModified` should reflect actual review or content change.

### Trust Signals

- Default AEO/GEO author trust work is background schema, not visible visitor-facing bylines.
- Every Article-style page should identify Sanjay Prabhu MSME in schema when truthful, including role/credentials/experience where supported by site identity.
- Do not add a visible author byline, visible reviewed-by line, headshot, or author bio block unless Sanjay explicitly asks for visible author treatment on that page.
- Do not add fake author history.
- Use Sanjay Prabhu MSME only where consistent with existing site identity and roadmap.

Default pass-on language:

Add schema-only author enrichment. Do not add any visible author or reviewed-by text.

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

Retroactive page rule:
- Pages already passed before this credential policy still need a narrow hidden-schema-only supplemental pass.
- Do not reopen content, images, layout, captions, CTAs, links, or visible text during that supplemental pass unless Codex explicitly assigns that separate issue.

### Images And Captions

- AEO/GEO work does not automatically include image generation or image replacement.
- Sanjay manages image selection unless he explicitly opens image work.
- Body/content images should use real `<figure><figcaption>` markup.
- Captions should use existing legacy caption text when available.
- Alt text should match the actual committed image and page context.

### Quick Link Check

Every future Astro-Pass-On-Instructions block must include a page-local quick link check:
- Check internal `href` links in the selected page file only.
- Verify each internal target exists as a source page route or in `public/_redirects`.
- Verify same-page `#anchor` links match real element IDs in the selected page.
- Fix obvious broken or label/href-mismatched page-local links found in that file.
- Do not run a full-site crawl.
- Do not validate every external URL unless it is visibly malformed.

## Codex Output Rules

Codex should give one recommended next action.

After any commit-pinned PASS, Codex must not wait for Sanjay to ask for the next slug. In the same response, Codex must:
- state the PASS result briefly,
- select the next highest-ranked real top-30 page not marked PASS,
- inspect that source file,
- log `INSTRUCTIONS ISSUED`,
- output the next strict Astro-Pass-On-Instructions block.

Stop instead only when the current page is NEEDS FIXES, the top-30 pre-live queue is complete, or Sanjay explicitly says to pause.

## Copy-Paste Handoff Rule

If Codex wants Sanjay to tell Astro Agent anything, Codex must provide the exact ready-to-send copy-paste block for Astro Agent in the response.

Do not write only a narrative request such as "have Astro Agent commit" or "send this to Astro Agent." Always include the complete message Sanjay can paste directly.

Use this rule for new page handoffs, correction blocks, pre-commit clean commit instructions, SHA/report-back requests, and any stop-and-report instruction.

Required wrapper:

```text
ASTRO-AGENT-COPY-PASTE

...
```

For Astro Agent handoffs, Codex must provide a strict `ASTRO-PASS-ON-INSTRUCTIONS` block with:
- Landing page
- Queue label
- GA4 rank
- Sessions
- Source file
- Required reading
- Allowed files to edit
- Do not edit
- Must-do items
- Quick link check
- Forbidden changes
- Verification checklist
- Report-back format
- Exact commit SHA requirement

If an issue is outside the selected page or outside the chosen defect family, put it under "Not changed" or "Future note." Do not ask Astro Agent to fix it now.

## Astro Agent Failure Patterns To Prevent

- Working on several pages because they look similar.
- Mixing schema, captions, links, images, CTA, and content rewrites in one pass.
- Adding unsupported FAQ sections because AEO/GEO likes Q&A.
- Adding schema that does not match visible content.
- Making global CSS or layout changes for a local page issue.
- Reporting a bucket complete without commit-pinned re-audit.
- Treating caption text as compliant without `<figure><figcaption>`.
- Touching user-managed images.
- Reopening closed pages.
- Using multi-agent mode.
