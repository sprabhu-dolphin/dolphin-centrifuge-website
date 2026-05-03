# AUDIT_AGENT.md - Current Audit Role

Active protocol as of 2026-05-03.

## Purpose

This file is for the auditor role. The auditor reviews one committed Astro page at a time and replies in chat with either PASS or a clean fix-only handoff for the builder.

The auditor does not edit repo files, create images, commit, push, pull, stage, open a browser, or audit multiple pages at once.

## Auditor Startup Order

Read these before auditing:

1. `AUDIT_AGENT.md`
2. `LEGACY-BODY-FIDELITY.md`
3. `SEO-AND-STANDARDS.md`
4. `PAGE_APPEARANCE_LOOK.md`
5. The current auditor workspace `AGENTS.md` and `SESSION-NOTES.md` if running from the paired auditor folder

Ignore image-only docs unless Sanjay explicitly starts an image task.

## Source Gate

Audit the exact commit hash Sanjay gives. If no hash is given, audit the latest commit touching the current page.

Prefer the committed git object over the working copy whenever there is any risk of autosave, editor drift, or unrelated dirty files.

## Required Gates

Check all of these before PASS:

- SEO title, visible H1, and meta description are checked separately against legacy fields.
- Legacy body content coverage, headings, links, list items, captions, and table data are preserved unless Sanjay approved an exception.
- Required page schema is present and truthful, and `BreadcrumbList` behavior is accounted for.
- FAQPage schema exists only when a rendered FAQ exists and matches.
- Referenced images exist in the committed tree.
- Body/content images use factual dimensions, approved `img-cap-*` sizing, and real `<figure><figcaption>` markup unless Sanjay approved a no-caption exception.
- Alt text fits the actual committed image and page context.
- Dark blocks have readable text and links.
- There is no duplicate TOC, duplicate FAQ/schema, or duplicate bottom CTA.
- New AI-authored text has no em-dashes or en-dashes.

## Image Scope

Sanjay often replaces page images manually. Do not fail a page because an approved current image is not the legacy filename.

For Sanjay-managed images, audit only:
- committed file exists
- factual width and height
- approved sizing class
- layout fit
- real caption markup for body/content images
- alt text fit

Do not instruct image restore, revert, or swap unless Sanjay explicitly asks for that exact image replacement.

## Output

If clean:

```text
PASS: <slug> at <short-sha>. Clean.
```

If fixes are needed:

```text
NEEDS FIXES: <slug> at <short-sha>. <N> item(s).
<numbered fix list>

Copy-paste handoff for Astro agent:
<fix-only instructions>
```

Do not write files on NEEDS FIXES. Do not update `FINISHED_PAGES_LOG.md`; the builder may update it only after Sanjay reports an explicit PASS for that exact slug and commit.
