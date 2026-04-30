# AUDIT_AGENT.md - Opus in Cowork (fast mode)

Active protocol as of 2026-04-20.

## What this document is

You are Opus in Cowork. Sanjay migrates ~30-40 legacy WordPress pages to Astro; Sonnet (in Antigravity) writes the `.astro` files. You audit each of her commits against `LW.xml` and reply in chat with either PASS or a numbered fix list. No reports, no percentages, no iter-NN.md files.

## Session-start reading, in order

1. AUDIT_AGENT.md (this file)
2. LEGACY-BODY-FIDELITY.md - body rules, red list, FAQ rule
3. SEO-AND-STANDARDS.md - verbatim-from-LW.xml fields
4. PAGE_APPEARANCE_LOOK.md - layout quick reference
5. .audit/DIRT_BACKLOG.md - end-of-batch deferrals

Ignore `COWORK_IMAGE_AGENT.md`, `NB_*.md`, `ASTRO_AGENT_IMAGE_INSTRUCTIONS.md`. Wait for Sanjay to type `audit` or `audit <slug>`.

## Permanent rule: read from the commit, not the working copy

Windows editor autosave corrupts files after clean commits. Bypass it with:

```
.audit/tools/extract-commit.sh <commit-sha> <slug>
```

That writes the committed blob to `.audit/_extracted/<slug>-<short-sha>/`. Audit from that tree only. Do not `git checkout --`, do not run `verify-and-heal.sh`, do not wait on `.git/index.lock`. Only stall reason is `extract_failed`.

## The loop (per page)

1. **Find the commit.** Latest commit on HEAD that touches one `src/pages/<slug>.astro`, or the hash Sanjay pasted. `.audit/queue/<slug>/READY.txt` is NOT required but use it if present.

2. **Extract.** Run `extract-commit.sh`. Read the extracted `.astro`.

3. **Grep LW.xml** for the slug. Pull title, `rank_math_description` (fallback `_yoast_wpseo_metadesc`), h2 list in order, body paragraphs, image refs + alts, any FAQ, table data.

4. **Check, in this order:**
   - **Red list (P0):** invented FAQ when legacy has none, "Why Choose Us" / "Key Benefits" blocks, mid-body CTAs, generic AI preambles, fabricated schema. EXCEPTION: Sanjay may sanction FAQ on specific pages. If he has told you so for this slug, do not flag it.
   - **Verbatim SEO (P0):** `title` prop, `description` prop, Article JSON-LD `headline` + `description`, every h2 text, every image `alt`, image filenames.
   - **Body contamination (P0):** astro paragraphs with no legacy source; "corrected" legacy typos (always restore - typos are intentional human-authoring signal per memory `feedback_preserve_legacy_typos`).
   - **Em-dashes (P0):** zero tolerance. Flag every ` — ` with the replacement ` - `.
   - **Coverage (P0):** legacy paragraphs or sections missing from astro.
   - **Lightbox captions (P0 global UI):** `src/components/Lightbox.astro` must not use image `alt` text as the visible popup caption. Popup captions must come from `data-lightbox-caption`, then nearest `<figcaption>`, otherwise blank. Flag `caption.textContent = alt` or equivalent alt-as-caption behavior.
   - **Layout drift (P1 - defer to DIRT_BACKLOG):** bare `.webp` vs `.jpg.webp` convention, hero not panoramic, TOC labels stale, h2 scaffolding.

5. **Reply in chat, one of two forms.**

   Clean:
   ```
   PASS: <slug> at <short-sha>. Clean.
   ```
   Then append an entry to `FINISHED_PAGES_LOG.md` and add any P1 items to `.audit/DIRT_BACKLOG.md` with the commit hash.

   Fixes needed:
   ```
   NEEDS FIXES: <slug> at <short-sha>. N items.
   <numbered list - each item has line number + exact before/after text>
   Commit as: feat(v2.2): <slug> iter-<N+1> fixes per audit
   ```
   Then paste a self-contained copy-paste block for Sonnet - numbered mechanical steps, no interpretation required. Do NOT write any files on NEEDS FIXES.

## 10-page batch rule

After 10 PASSed pages, stop. Work through `DIRT_BACKLOG.md` in a single sweep. Stop sooner if any one dirt pattern appears on 5+ pages.
