# AUDIT_HANDOFF_PROTOCOL.md — Sonnet in Antigravity (fast mode)

Active protocol as of 2026-04-19. Replaces the older READY.txt / LATEST.md / WHY.md contract (git log has the old version if we need it back).

## What this document is

You are Sonnet running inside Antigravity on Sanjay's Windows machine. Your job: migrate legacy WordPress pages to Astro in `src/pages/<slug>.astro`. Opus runs inside Cowork and audits each of your commits against `LW.xml`. You commit, Opus audits, you fix, repeat. The loop is fast and light now. No READY files, no iteration markers, no reports from you.

## Session-start reading (short list)

Read these at session start, in order:

1. **AUDIT_HANDOFF_PROTOCOL.md** (this file)
2. **LEGACY-BODY-FIDELITY.md** — body rules, red list, FAQ rule
3. **SEO-AND-STANDARDS.md** — verbatim-from-LW.xml rules
4. **PAGE_APPEARANCE_LOOK.md** — layout rules

Ignore image-workflow files (`COWORK_IMAGE_AGENT.md`, `NB_*.md`, `ASTRO_AGENT_IMAGE_INSTRUCTIONS.md`).

You do NOT read `.audit/DIRT_BACKLOG.md` during per-page work. That's Opus's file for end-of-batch cleanup planning.

## The fast-mode loop (per page)

When Sanjay tells you to work on a slug:

1. **Read legacy.** Grep `LW.xml` for the slug. Extract: title, meta description, h1/h2/h3/h4 list in order, body paragraphs, table data, image refs with alt text, any FAQ, canonical slug.

2. **Write or edit** `src/pages/<slug>.astro`. Use `ApplicationLayout`. Match legacy verbatim on all SEO-ranking fields (title, description, h1, every h2, image alts, image filenames in `.jpg.webp` convention, Article JSON-LD headline).

3. **Do NOT add:** FAQ blocks unless legacy has one. FAQPage JSON-LD unless legacy has a FAQ. "Why Choose Us" / "Key Benefits" lists. Mid-body CTA buttons. Generic AI preambles. Em-dashes anywhere (use regular `-`). Fabricated stats, testimonials, "Authorized Alfa Laval" language.

4. **Preserve legacy typos.** Sanjay seeds minor typos intentionally as a human-authoring signal. Examples we've seen: `Standards filters`, `flood products`, `nigh centrifugal force`. If LW.xml has a typo, you keep the typo. Do not "fix" it.

5. **Commit.**

   ```
   git add src/pages/<slug>.astro
   git commit -m "feat(v2.2): <slug> iter-<N>"
   ```

   If you also renamed images on disk, include those in the commit.

6. **Tell Sanjay:**

   ```
   Committed <slug> iter-<N> at <short-sha>. Ready for audit.
   ```

   Stop. Do not write `READY.txt`. Do not wait for anything. Sanjay will pop over to Cowork and type `audit`.

7. **When Opus returns a fix list in chat** (Sanjay will paste it to you), apply every numbered item mechanically. No interpretation, no arguing, no skipping. Commit as `feat(v2.2): <slug> iter-<N+1> fixes per audit`. Tell Sanjay you're done. Repeat from step 6.

8. **When Opus says PASS**, you're done with that page. Sanjay will move you to the next one.

## What you do NOT do (things that used to be ceremony)

- No `.audit/queue/<slug>/READY.txt` files. Ever.
- No iteration numbering in READY.txt. (Still fine in commit messages.)
- No `verify-and-heal.sh` required before handoff. The auditor reads from the commit object directly, so working-copy corruption no longer blocks the audit. You can still run it if you want your local `git status` clean, but it's optional now.
- No STALL reports. If something's genuinely blocking, ask Sanjay in chat.
- No session rotation between pages unless Sanjay asks.

## The working-copy corruption issue (context only)

The Windows editor on this machine sometimes corrupts files after you commit (trailing whitespace, mid-content truncation). The commit itself is fine. Opus reads from the commit via `git show`, so this doesn't affect audits anymore.

If YOUR `git status` shows unexpected dirt after a commit, that's the corruption. `git checkout -- <file>` restores it. Not urgent, not a blocker, not an audit concern.

## On dirty tree across multiple open pages

We're running in fast mode for a batch of ~10 pages before a single cleanup commit. Your working tree may accumulate modifications from prior pages (the §7.2 corruption pattern, or images pending rename). Do not try to clean it up mid-batch. Just commit the file you're working on and let the rest accumulate. Sanjay and Opus will sweep at the end.

## On the `.jpg.webp` image naming convention

Convention: `<legacy-stem>.jpg.webp` so a 301 from `/wp-content/.../foo.jpg` preserves image-search ranking.

In fast mode, if you see the bare `.webp` form on existing pages, leave it. Opus is tracking it in `DIRT_BACKLOG.md` for end-of-batch cleanup. But for NEW images on the page you're currently building, use `.jpg.webp` from the start - don't create new drift.

## Quick reference: what Opus checks (so you can self-check before committing)

- `title=` prop: verbatim vs LW.xml `<title>` (or `_yoast_wpseo_title` if present)
- `description=` prop: verbatim vs LW.xml `rank_math_description` (or `_yoast_wpseo_metadesc`)
- Every `<h2>`: verbatim vs legacy h2 text
- Every image `alt`: verbatim vs legacy alt (or descriptive human text matching legacy filename stem)
- Every image filename: `<legacy-stem>.jpg.webp` unless legacy was already `.gif` or `.png`
- Article JSON-LD `headline`: verbatim = title
- NO FAQ unless LW.xml has FAQ blocks
- NO em-dashes anywhere in the file
- Legacy typos preserved, not "corrected"
- TOC const labels match the h2 text you wrote

If all of those are clean, Opus will PASS your iter-1 and we skip a round.
