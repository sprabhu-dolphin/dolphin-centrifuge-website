# AEO/GEO Pathway For Astro Agent

This file applies only when Sanjay or Codex assigns AEO/GEO, GEO, AEO, AI search, answer engine, schema/entity optimization, `llms.txt`, or traffic-priority optimization work.

## Hard Role

Astro Agent is the implementation agent only.

Astro Agent must work only from the exact Astro-Pass-On-Instructions provided by Codex.

## No Multi-Agent Mode

Multi-agent mode is forbidden.

Do not:
- Spawn subagents.
- Ask another agent to work in parallel.
- Split the slug across workers.
- Start a second page while the current page is active.
- Continue if another implementation agent is already working on the same page.

If another agent is active on the same page or scope is unclear, stop and ask Sanjay.

## Required Reading

Before editing:
1. `.agents/rules/astro-migration.md`
2. This file
3. The exact Astro-Pass-On-Instructions from Codex
4. Any source docs named by Codex

## Implementation Scope

Only edit files listed under `Allowed files to edit` in the Codex handoff.

If Codex lists one source page, edit only that page unless the handoff explicitly allows a support file.

Do not edit:
- `CODE_AEO_GEO_LOG.md`
- `AEO_GEO_OPERATING_PLAN.md`
- `AEO_GEO_SKILL.md`
- `ga4-landing-pages-top160.xlsx`
- Other page files
- Image assets
- Global layouts, components, or CSS unless Codex explicitly lists them under allowed files

## Launch Gate

Pre-live AEO/GEO work is limited to the first 30 highest-traffic pages selected by Codex.

Do not self-assign page 31 or later. After a commit, return the SHA and stop.

## AEO/GEO Guardrails

- Do not invent facts, FAQs, specs, prices, capacities, testimonials, guarantees, or performance data.
- Do not add FAQPage schema unless a matching rendered FAQ exists.
- Do not add HowTo schema unless matching procedural steps are visible.
- Do not add VideoObject schema unless the page has a real visible video and verified video metadata.
- Do not add Product schema claims that are not visible or otherwise verified.
- Default author trust signals belong in background schema only. Do not add visible author bylines, reviewed-by lines, headshots, or author bio blocks unless the Codex handoff explicitly says Sanjay approved visible author treatment for that page.
- Do not change URL slugs.
- Do not change image selections unless Sanjay explicitly opened image work.
- Do not add generic marketing sections.
- Do not use em dashes in new AI-authored text.

## Quick Link Check

Every AEO/GEO handoff must include a page-local quick link check. When assigned:
- Check internal `href` links in the selected page file only.
- Verify each internal target exists as a source page route or in `public/_redirects`.
- Verify same-page `#anchor` links match real element IDs in the selected page.
- Fix obvious broken or label/href-mismatched page-local links found in that file.
- Do not run a full-site crawl.
- Do not validate every external URL unless it is visibly malformed.

## Schema-Only Author Enrichment

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

Pages already passed before this credential policy still need a narrow hidden-schema-only supplemental pass. Do not reopen content, images, layout, captions, CTAs, links, or visible text during that supplemental pass unless Codex explicitly assigns that separate issue.

## Naming Policy

Follow `DOLPHIN_NOMENCLATURE_POLICY_REVERSAL.md`.

- Customer-facing content uses Alfa Laval model names.
- Default to WHPX current-production models where the policy applies.
- Use legacy MOPX/MAPX only for legacy installs, full-discharge exceptions, historical data, or truthful schema aliases.
- Preserve URL slugs even if visible naming changes.

## Report Back

After implementation:
1. Verify the checklist from Codex.
2. Commit the work.
3. Return:
   - What changed
   - Files changed
   - What was intentionally not changed
   - Any uncertainty
   - Verification performed
   - Exact commit SHA
4. Stop.

Do not self-assign the next page.

## Sanjay Copy-Paste Workflow

Astro Agent may receive Codex instructions through a copy-paste block from Sanjay.

When the block says to commit, commit only the listed file or files and return the exact SHA.

When the block says to correct and report before commit, make only the listed corrections and report the verification result back to Sanjay without broadening the scope.
