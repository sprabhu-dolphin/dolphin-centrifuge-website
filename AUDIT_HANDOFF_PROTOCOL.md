# AUDIT_HANDOFF_PROTOCOL.md - Current Chat Loop

Active protocol as of 2026-05-03.

## Purpose

This file defines the normal builder-to-auditor loop for one migrated Astro page at a time.

The current workflow is Sanjay-mediated chat:
- The Astro builder edits one `src/pages/<slug>.astro` page.
- The builder commits the fix batch.
- The builder gives Sanjay the commit SHA.
- Sanjay sends that slug and SHA to the audit agent.
- The audit agent replies in chat with PASS or a fix-only handoff.

No READY.txt, LATEST.md, bridge JSON, or `.audit/queue` file is used in the normal loop.

## Builder Startup Order

Read these before page work:

1. `.agents/rules/astro-migration.md`
2. `SEO-AND-STANDARDS.md`
3. `LEGACY-BODY-FIDELITY.md`
4. `PAGE_APPEARANCE_LOOK.md`
5. `AUDIT_HANDOFF_PROTOCOL.md`

Ignore image-only docs unless Sanjay explicitly starts an image task:
- `ASTRO_AGENT_IMAGE_INSTRUCTIONS.md`
- `COWORK_IMAGE_AGENT.md`
- `NB_IMAGE_SKILL.md`
- `NB_HERO_DRAWINGS_FIX_SKILL.md`

## Builder Loop

1. Work on exactly one slug.
2. Read legacy source from `LW.xml`.
3. Edit only the current page and directly required support files.
4. Preserve legacy SEO fields, visible H1, body coverage, table data, captions, links, schema facts, and approved user exceptions.
5. Use `ApplicationLayout` patterns. Do not use a single existing page as a universal template.
6. Keep image work copy-only and Sanjay-managed when he has replaced or approved images.
7. Commit the current fix batch.
8. Give Sanjay the exact commit SHA and stop for audit.

## Do Not Add

- FAQ blocks unless legacy has one or Sanjay approved that exact page FAQ.
- FAQPage JSON-LD unless the rendered FAQ exists and matches.
- Generic "Why Choose Us", "Key Benefits", or AI summary sections unless approved for the page.
- Page-local bottom CTA when `ApplicationLayout` already provides the standard bottom CTA.
- Duplicate TOCs.
- Unsupported Product, Article, manufacturer, brand, capacity, pricing, or performance claims in schema.
- Em-dashes or new AI-authored en-dashes.

## Verification Before Audit

Before telling Sanjay a page is ready for audit, verify file-based:

- The committed page is the intended slug.
- SEO title, visible H1, and meta description are checked separately.
- Legacy body content coverage and table data are preserved.
- Required schema and `BreadcrumbList` behavior are present and truthful.
- Referenced images exist in the committed tree.
- Body/content images use factual dimensions, approved `img-cap-*` sizing, and real `<figure><figcaption>` markup unless Sanjay approved a no-caption exception.
- Dark blocks have readable text and links.
- There is no duplicate TOC, duplicate FAQ/schema, or duplicate bottom CTA.

## Legacy `.audit` Files

The `.audit` READY/LATEST workflow is retired for normal work. Do not write `.audit` queue, report, passed, or stalled files unless Sanjay explicitly re-enables that legacy workflow for the current page.

Never edit `.audit/reports/`, `.audit/passed/`, or `.audit/stalled/`.
