# AUDIT_HANDOFF_PROTOCOL.md - Sonnet in Antigravity (fast mode)

Active protocol as of 2026-04-20.

## What this document is

You are Sonnet in Antigravity on Sanjay's Windows machine. You write `src/pages/<slug>.astro` files migrated from legacy WordPress. Opus in Cowork audits each of your commits against `LW.xml` and returns a fix list in chat. You commit, Opus audits, you fix, repeat.

## Session-start reading, in order

1. AUDIT_HANDOFF_PROTOCOL.md (this file)
2. LEGACY-BODY-FIDELITY.md - body rules, red list, FAQ rule
3. SEO-AND-STANDARDS.md - verbatim-from-LW.xml fields
4. PAGE_APPEARANCE_LOOK.md - layout rules

Ignore `COWORK_IMAGE_AGENT.md`, `NB_*.md`, `ASTRO_AGENT_IMAGE_INSTRUCTIONS.md`. Do NOT read `.audit/DIRT_BACKLOG.md` - that's Opus's file for end-of-batch planning.

## The loop (per page)

1. **Read legacy.** Grep `LW.xml` for the slug. Pull title, `rank_math_description` (fallback `_yoast_wpseo_metadesc`), h1/h2/h3 list in order, body paragraphs, tables, image refs + alts, any FAQ.

2. **Write or edit** `src/pages/<slug>.astro` using `ApplicationLayout`. Match legacy verbatim on: `title` prop, `description` prop, Article JSON-LD `headline` + `description`, every h2 text, every image `alt`. For new image filenames use `<legacy-stem>.jpg.webp` (preserves the legacy `.jpg` URL stem for 301 redirect image-search continuity).

3. **Do NOT add:**
   - FAQ blocks, unless legacy has one OR Sanjay has explicitly sanctioned FAQ for this specific slug.
   - FAQPage JSON-LD, unless FAQ is present.
   - "Why Choose Us" / "Key Benefits" lists.
   - Mid-body CTA buttons.
   - Generic AI preambles.
   - Em-dashes anywhere. Use regular `-`.
   - Fabricated stats, testimonials, "Authorized Alfa Laval" language.

4. **Preserve legacy typos.** Sanjay seeds minor typos intentionally as a human-authoring signal. Examples seen: `Standards filters`, `flood products`, `nigh centrifugal force`. If LW.xml has a typo, keep it. Do NOT "fix" it.

5. **Self-check before committing:**
   - `title` = legacy `<title>` verbatim
   - `description` = legacy `rank_math_description` verbatim
   - every `<h2>` = legacy h2 text verbatim
   - every image `alt` = legacy alt or descriptive human text
   - TOC const labels match your h2 text exactly
   - no ` — ` em-dashes anywhere
   - legacy typos preserved

6. **Commit:**
   ```
   git add src/pages/<slug>.astro
   git commit -m "feat(v2.2): <slug> iter-<N>"
   ```

7. **Tell Sanjay:**
   ```
   Committed <slug> iter-<N> at <short-sha>. Ready for audit.
   ```
   Stop. No READY.txt file. No `verify-and-heal.sh` required. Sanjay will pop to Cowork and type `audit`.

8. **When Sanjay pastes a fix list from Opus:** apply every numbered item mechanically. No interpretation. Commit as `feat(v2.2): <slug> iter-<N+1> fixes per audit`. Tell Sanjay the new short-sha. Repeat from step 7.

9. **When Opus says PASS:** done. Wait for next slug.

## On working-copy corruption (context only)

Windows editor autosave sometimes corrupts files after clean commits. The commit itself is fine - Opus reads from the committed git object, not from disk, so this does not block audits. If your `git status` shows unexpected dirt after committing, `git checkout -- <file>` restores it. Not urgent, not a blocker.

## On dirty tree during the batch

Fast mode runs ~10 pages before a single cleanup sweep. Your working tree may accumulate mods from prior pages. Do NOT try to clean mid-batch. Commit only the file you are working on. Sanjay and Opus sweep at the end.
