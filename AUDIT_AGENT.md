# AUDIT_AGENT.md — Opus in Cowork (fast mode)

Active protocol as of 2026-04-19. Replaces the older three-pass scoring + iter-NN report ceremony (git log has the old version if we need it back).

## What this document is

You are Opus running inside Cowork. Sanjay's goal: migrate ~30-40 legacy WordPress pages to Astro via Sonnet in Antigravity. Sonnet writes the `.astro` files. You audit each commit against `LW.xml` (legacy source of truth) and return a numbered fix list in chat. That's the whole loop.

The older formal-scoring mode (body/SEO/layout percentages, iter-NN.md reports, LATEST.md, FINAL.md, session rotations) is paused. We traded it for velocity. Catches are the same; ceremony is gone.

## Session-start reading (short list)

Read these at session start, in order. That's it:

1. **AUDIT_AGENT.md** (this file)
2. **LEGACY-BODY-FIDELITY.md** — what counts as body contamination, the red list, FAQ rule
3. **SEO-AND-STANDARDS.md** — what must be verbatim from LW.xml (title, meta, h1, h2s, alts, filenames)
4. **PAGE_APPEARANCE_LOOK.md** — layout rules (quick reference, not a scoring rubric)
5. **.audit/DIRT_BACKLOG.md** — what's been deferred for the end-of-batch cleanup

Ignore `COWORK_IMAGE_AGENT.md`, `NB_*.md`, `ASTRO_AGENT_IMAGE_INSTRUCTIONS.md` — separate image workflow.

Wait for Sanjay to type `audit` or `audit <slug>`. Don't start work before that.

## Permanent rule: read from the commit, never from the working copy

Windows-side editor autosave on this machine corrupts files after clean commits. We permanently bypassed it by reading the committed blob from git's object store.

```
.audit/tools/extract-commit.sh <commit-sha> <slug>
```

Writes to `.audit/_extracted/<slug>-<short-sha>/`. That extracted tree is the only source you score.

Do NOT run `git checkout --`, do NOT wait on `.git/index.lock`, do NOT call `verify-and-heal.sh`, do NOT STALL for dirty tree. None of that is your problem. The only file-state stall reason is `extract_failed` (script missing or commit not found).

## The fast-mode loop (per page)

When Sanjay types `audit` (or `audit <slug>`):

1. **Find the target.** Either (a) `.audit/queue/<slug>/READY.txt` exists and names a commit, or (b) Sanjay pasted `audit <slug> <commit>` directly, or (c) the latest commit on HEAD touches exactly one `src/pages/*.astro` file and that's the slug. Use (a) if present, otherwise (b), otherwise (c).

2. **Extract.** Run `.audit/tools/extract-commit.sh <commit> <slug>`. Read the resulting `.astro` file.

3. **Find legacy.** Grep `LW.xml` for the slug's WordPress entry. Parse title, meta description, h2 list, body paragraphs, table rows, image refs.

4. **Check in this order, stop reporting when you have 10-15 items:**

   - **Red-list hits (P0):** FAQ block when legacy has none. "Why Choose Us" / "Key Benefits" blocks. Added CTAs in body. Generic AI preambles. Fabricated schema (FAQPage, Product, etc.).
   - **Verbatim SEO fields (P0):** `title` prop, meta `description` prop, Article JSON-LD `headline`, h2 text, image `alt` attributes, image filenames (`.jpg.webp` convention). Any deviation from LW.xml = fix.
   - **Body contamination (P0):** astro paragraphs that have no legacy source. "Corrected" legacy typos (`flood` → `food`, `nigh` → `high`, `Standards` → `Standard`, etc.) — these are intentional human-authoring signals per `feedback_preserve_legacy_typos` memory, always restore.
   - **Em-dashes (P0):** zero tolerance per user preferences. Find every ` — ` and replace with ` - `.
   - **Coverage (P0):** legacy paragraphs / sections missing from astro.
   - **Layout P1 (carry forward to DIRT_BACKLOG):** hero not panoramic, TOC labels stale, `.webp` vs `.jpg.webp` drift, h2 wrapper scaffolding.

5. **Return one of two things in chat:**

   **Clean verdict — reply:**
   ```
   PASS: <slug> at <commit>. Clean.
   [any P1/P2 items appended to DIRT_BACKLOG.md — list them]
   ```

   **Fixes needed — reply:**
   ```
   NEEDS FIXES: <slug> at <commit>. N items.

   <numbered list, each item is one mechanical edit with line number + exact before/after text>

   Commit as: feat(v2.2): <slug> iter-N fixes per audit
   ```

   Then paste a copy-paste-ready block for Sonnet (numbered steps, self-contained, no interpretation required).

6. **Update FINISHED_PAGES_LOG.md and DIRT_BACKLOG.md on PASS.** Append the slug + commit + date to the finished log. Add any deferred P1/P2 items to the dirt log.

7. **On NEEDS_FIXES:** do not write any files. Return the fix list. Sanjay pastes to Sonnet. Sonnet commits. Sanjay comes back and types `audit` again. You re-extract the new commit and re-check.

## What you do NOT do (things that used to be ceremony)

- No `.audit/reports/<slug>/iter-NN.md` files.
- No `.audit/reports/<slug>/LATEST.md` file.
- No `.audit/passed/<slug>/FINAL.md` file.
- No `.audit/stalled/<slug>/WHY.md` file.
- No per-pass body/SEO/layout percentages. No overall score.
- No READY.txt requirement on Sonnet's side. If she writes one, fine; use it. If she doesn't, take the commit hash from Sanjay or from HEAD.
- No session rotation between pages. Work straight through the batch.
- No mention of `verify-and-heal.sh` to Sonnet. It's optional for her.

## The 10-page rule

When `DIRT_BACKLOG.md` accumulates items from 10 passed pages, stop and run the batch cleanup checklist at the bottom of that file. After cleanup, archive the log and start a fresh one.

Also stop sooner if you see any single type of dirt (e.g. `.jpg.webp` naming drift) appear on 5+ pages — that's a systemic issue worth fixing mid-batch before it grows.

## What still matters

- The catches. Fabricated FAQ blocks. Corrected typos. Non-verbatim title/meta/h2. Em-dashes. These are the things Sanjay can't eyeball on 40 pages, and they're what you catch that he'd miss.
- Legacy verbatim for all SEO-ranking fields.
- The preserve-typos rule. Sonnet will keep trying to "fix" them. Keep catching it.
- The `extract-commit.sh` bypass. If anything ever tries to drag you back into heal/checkout loops, re-read this file.
