# Audit Handoff Protocol - For Sonnet (Antigravity)

**Last updated:** 2026-04-19 by Sanjay
**Audience:** Sonnet running inside Antigravity as the Astro build agent.
**Purpose:** Defines the contract for how you communicate with Opus (running inside Cowork) as the auditor agent.

> **You (Sonnet) and Opus NEVER talk directly.** You communicate entirely through files in `.audit/`. This file is the spec for those files.

---

## 1. Who you are, who Opus is

| Role | Model | Tool | Writes | Reads |
|---|---|---|---|---|
| Builder | Sonnet | Antigravity IDE | `.astro` pages, `.audit/queue/{slug}/READY.txt` | `.audit/reports/{slug}/LATEST.md`, `.audit/stalled/{slug}/WHY.md`, `LW.xml`, all rule MDs |
| Auditor | Opus | Cowork (desktop) | `.audit/reports/*`, `.audit/passed/*`, `.audit/stalled/*` | `.astro` pages, `LW.xml`, `READY.txt` files, all rule MDs |
| Decider | Sanjay | Both apps | Everything if he wants | Everything |

**You never edit files in `.audit/reports/`, `.audit/passed/`, or `.audit/stalled/`. Those are read-only for you.** If you think the auditor got something wrong, flag it to Sanjay in chat. Do not modify the report.

---

## 2. Mandatory reads at session start

Before touching any code, confirm you have loaded all of these into working memory:

1. `.agents/rules/astro-migration.md` - your root rules
2. `ANTIGRAVITY_SAFETY_PROTOCOL.md` - the 6 safety rules (now 7 with this protocol)
3. `SEO-AND-STANDARDS.md` - SEO-sensitive verbatim rules + standards
4. `PAGE_APPEARANCE_LOOK.md` - layout decision tree
5. `LEGACY-BODY-FIDELITY.md` - body coverage + no-AI-contamination rules
6. `AUDIT_HANDOFF_PROTOCOL.md` - this file
7. `FINISHED_PAGES_LOG.md` - know what's already done
8. `PENDING_FIXES_LIST.md` - know what's outstanding

Echo the list back to Sanjay at session start. If you skipped any, read them now before proceeding.

---

## 3. The file contract

### 3.1 READY.txt - you write this

**Path:** `.audit/queue/{slug}/READY.txt`
**When:** After every commit that changes `src/pages/{slug}.astro`, exactly once.
**Format:** Plain text, key-value, one per line.

```
slug: wastewater-centrifuge
iteration: 1
commit: a9f0079
timestamp: 2026-04-19T14:30:00Z
sonnet_summary: Initial migration from LW.xml. Grid layout per PAGE_APPEARANCE_LOOK v2.2. 3 tables preserved verbatim.
sonnet_open_questions: Hero image missing - flagged via HERO_NEEDED.txt. Legacy has no FAQ, so none created.
```

**Field rules:**

| Field | Format | Rule |
|---|---|---|
| `slug` | string | Must match an existing legacy slug in LW.xml. Must match the `.astro` filename. |
| `iteration` | integer >= 1 | Start at 1. Increment by 1 on every subsequent READY for the same slug. |
| `commit` | 7+ char git SHA | MUST be the current HEAD commit that contains your edit. Run `git log -1 --format=%h -- src/pages/{slug}.astro` to get it. |
| `timestamp` | ISO-8601 UTC | Use real time, not placeholder. |
| `sonnet_summary` | 1-3 sentences | What you changed in this iteration. Be specific, not generic. |
| `sonnet_open_questions` | 1-3 sentences | Anything you couldn't resolve, or known-unresolved items. Empty string if none. |

### 3.2 LATEST.md - Opus writes, you read

**Path:** `.audit/reports/{slug}/LATEST.md`
**When:** After Sanjay runs an audit, within ~2 minutes of your READY.txt landing.
**Format:** YAML frontmatter + markdown body.

```
---
slug: wastewater-centrifuge
iteration: 1
overall_score: 78
body_score: 82
seo_score: 74
layout_score: 70
verdict: NEEDS_FIXES
rotate_sessions: false
next_action: sonnet_fix
---

# Audit Report: wastewater-centrifuge (iter-01)

## Scores
- Body fidelity: 82/100 (weight 45%)
- SEO + standards: 74/100 (weight 35%)
- Layout: 70/100 (weight 20%)
- Overall: 78/100

## P0 - Must fix (blocks PASS)

### 1. [BODY] Missing legacy paragraph (content deletion)
File: src/pages/wastewater-centrifuge.astro
Near line: 142
Issue: LW.xml paragraph about "sludge dewatering at 6500 g-force" is not on the astro page.
Legacy text: "The disc stack sludge dewatering operates at 6500 g-force, producing a solid-phase..."
Action: Insert this paragraph in the section titled "Process Operation".

### 2. [SEO] Title tag wrong
File: src/pages/wastewater-centrifuge.astro
Line: 8
Current: <title>Wastewater Centrifuge Systems | Dolphin</title>
Legacy (verbatim required): <title>Wastewater Centrifuge - Disc Stack & Decanter Solutions</title>
Action: Replace line 8 with legacy verbatim.

...

## P1 - Should fix
...

## P2 - Nit
...
```

**Verdict values:**
- `PASS` - Page is done. Do not edit further. Update `FINISHED_PAGES_LOG.md`. See section 5.
- `NEEDS_FIXES` - Fix every P0 and every P1. Do not skip P1s. Commit. Write new READY with iter+1.
- `STALLED` - Stop. Do not edit this slug. Wait for Sanjay. Also see `.audit/stalled/{slug}/WHY.md`.

### 3.3 FINAL.md - Opus writes when a slug passes

**Path:** `.audit/passed/{slug}/FINAL.md`
**Your action:** Sanjay will tell you to update `FINISHED_PAGES_LOG.md`. Do it per RULE 4 of `ANTIGRAVITY_SAFETY_PROTOCOL.md`. Do not deploy to production.

### 3.4 WHY.md - Opus writes when a slug stalls

**Path:** `.audit/stalled/{slug}/WHY.md`
**Your action:** Do not touch this slug again until Sanjay unblocks you. He will either clear the stall manually or reassign the page.

---

## 4. The loop you run

```
For a slug Sanjay gives you:

  STEP 0 - Pre-flight checks:
    - Read LW.xml entry for this slug (source of truth)
    - Check .audit/reports/{slug}/LATEST.md - is there an existing report?
    - Check .audit/stalled/{slug}/WHY.md - am I blocked?
    - Check .audit/passed/{slug}/FINAL.md - is this already done?

  STEP 1 - If LATEST.md exists and verdict: NEEDS_FIXES:
    - Load LATEST.md
    - Apply EVERY P0 item. Do not skip.
    - Apply EVERY P1 item. Do not skip.
    - Optionally apply P2 items.
    - Do NOT add anything not requested by the report.

  STEP 2 - If no LATEST.md exists (iter-1, fresh page):
    - Read all mandatory MDs (see section 2)
    - Build the page from LW.xml per the rules
    - Do the standard Mandatory Body Copy Verification Checklist from .agents/rules/astro-migration.md

  STEP 3 - Commit:
    - git add src/pages/{slug}.astro (and any related image moves)
    - git status MUST show clean tree after commit
    - git commit -m "feat(v2.2): {slug} iter-NN"
    - Capture the commit hash

  STEP 3.5 - MANDATORY: Verify-and-heal working copy:
    - Run: bash .audit/tools/verify-and-heal.sh
    - This script auto-detects post-commit working-copy corruption
      (known issue on this machine: mid-content truncation after clean
      commits) and restores the file from HEAD if needed.
    - Exit code 0 = working tree matches HEAD, safe to proceed.
    - Exit code 1 = unresolvable dirty state - STOP, tell Sanjay.
    - See section 7.2 for why this exists. Skipping this step will
      cause auditor STALLs for something harmless.

  STEP 4 - Write READY.txt:
    - Path: .audit/queue/{slug}/READY.txt
    - Fill in the schema from section 3.1
    - iteration number is +1 from the LATEST.md you just addressed (or 1 if fresh)

  STEP 5 - Stop.
    - Tell Sanjay: "iter-N submitted for {slug}, commit {hash}, waiting on audit."
    - Do NOT touch this slug again until new LATEST.md appears with matching iteration.
    - Do NOT move to a different slug. Single-page workflow.
```

---

## 5. What happens when verdict is PASS

You see `verdict: PASS` in LATEST.md. Opus has also written `.audit/passed/{slug}/FINAL.md`.

Your action in this order:

1. Update `FINISHED_PAGES_LOG.md` with: slug, today's date, commit hash, layout engine, status `DONE`.
2. Commit: `git commit -m "chore: mark {slug} DONE in FINISHED_PAGES_LOG"`
3. Tell Sanjay: **"{slug} PASSED. Session rotation required before next slug per protocol."**

**The session rotation requirement.** When a page passes, Sanjay must:
- Close your current Antigravity session and start a fresh one
- Close his current Cowork session with Opus and start a fresh one

Why: both agents have accumulated page-specific context. Starting the next page in a hot session risks context bleed (applying the previous page's rules and mistakes). This is a hard rule, not a suggestion.

Do not start the next slug yourself. Wait for Sanjay to come back in a new session and give you a new slug. The fresh session will begin with the bootstrap prompt and mandatory reads (section 2).

---

## 6. What happens when verdict is STALLED

You see `verdict: STALLED` in LATEST.md or a `.audit/stalled/{slug}/WHY.md` appears.

Your action:
1. Read WHY.md to understand the stall reason.
2. Tell Sanjay: **"{slug} STALLED. Reason: {copy the WHY.md first line}. Session rotation required."**
3. Do NOT edit the slug.
4. Do NOT start a new slug until Sanjay tells you to.

Session rotation applies to STALLED just like PASS.

---

## 7. Git hygiene rules (enforced by auditor)

| Rule | Enforcement |
|---|---|
| Working tree must be clean when READY.txt is written | Auditor checks `git status`. Dirty tree = auto-STALL with reason `dirty_tree`. |
| Commit hash in READY.txt must match HEAD for the .astro file | Auditor checks. Mismatch = auto-STALL with reason `commit_hash_mismatch`. |
| Never mix edits to multiple slugs in a single commit | Auditor checks commit file list. Multi-slug commit = auto-STALL with reason `multi_slug_commit`. |
| Never commit without running the Mandatory Body Copy Verification Checklist | Enforced by astro-migration.md Rule #1. Auditor detects violations via body_score. |
| Never push to origin / deploy to production automatically | PASS does NOT deploy. Sanjay decides when to push. |

### 7.1 CRLF / line-ending false positives (DIAGNOSE BEFORE STALLING)

Windows checkouts can show hundreds of "modified" files in `git status` even when no real edits exist. This is line-ending drift (CRLF on disk vs LF in HEAD), not real work. Treat dirty-tree as auto-STALL ONLY after this 3-step check:

1. Run `git diff -w --stat` (the `-w` flag ignores whitespace including line endings).
   - If output shows zero files or only files you actually edited → it is CRLF noise. NOT a dirty tree. Proceed.
   - If output shows many unrelated files with real content changes → genuine dirty tree. STALL.
2. If CRLF noise is confirmed, the project's `.gitattributes` (`* text=auto eol=lf`) plus `git add --renormalize .` will make it permanent. If `.gitattributes` is missing, flag it to Sanjay before writing any READY.txt.
3. Excel lock files (`~$*.xlsx`) and OS junk (`.DS_Store`, `Thumbs.db`) must be in `.gitignore`. If they appear in `git status`, that is a `.gitignore` gap, not a dirty tree - flag it.

Do NOT freeze and ask Sanjay "Option A/B/C" on a dirty tree before running `git diff -w`. False-positive STALLs waste a session rotation.

### 7.2 Post-commit working-copy corruption (auto-heal, do not STALL)

Diagnosed 2026-04-19 after two back-to-back STALLs on `disc-centrifuge-parts-glossary`. Signature:

- Sonnet commits cleanly. `git show {commit}:{file}` is correct.
- Seconds later, the on-disk working copy of a committed file is truncated (mid-word, mid-tag, no trailing newline).
- Only affects files just committed. Git object store is untouched.

Root cause is not Git, not Cowork, not Sonnet's logic. It is some Windows-side process (IDE autosave, file-watcher, antivirus write-back) flushing a stale buffer after the commit has already written the object.

**Guard rails in place:**

1. `.git/hooks/post-commit` - snapshots each committed file's SHA at T+0 and T+15s. Any drift gets logged to `.audit/_diagnostic/post-commit-sentinel.log`. This is diagnostic only, not a blocker.
2. `.audit/tools/verify-and-heal.sh` - Sonnet runs this before writing READY.txt (STEP 3.5). Auto-restores corrupted working copies from HEAD.
3. Auditor-side auto-heal - Opus no longer STALLs on dirty-tree if the only drift is for files in the last commit AND HEAD version is intact. Opus runs the heal script itself, documents the heal in the report, and proceeds to audit the commit (which is the source of truth anyway).

**The rule:** if disk differs from HEAD for a file in the last commit, and HEAD is intact, **heal instead of stalling**. Document the heal in the log, do not rotate sessions for it.

---

## 8. Deployment is out of scope

The audit loop runs on **source files**, not the live site. You never need to:
- Run `npm run dev`
- Deploy to Cloudflare Pages
- Preview in a browser
- Take screenshots

Opus audits `.astro` source against `LW.xml`. Period. When a page PASSES, commits sit in the local repo. Sanjay chooses when to push to origin and when Cloudflare Pages deploys. That decision is not automated.

---

## 9. Example: one full iteration walked through

**Scenario:** Sanjay tells Sonnet "Work on wastewater-centrifuge".

### Iteration 1

```
Sonnet:
  - Reads .audit/reports/wastewater-centrifuge/LATEST.md -> does not exist
  - Reads .audit/stalled/wastewater-centrifuge/WHY.md -> does not exist
  - Reads LW.xml entry for wastewater-centrifuge
  - Reads all mandatory MDs
  - Edits src/pages/wastewater-centrifuge.astro
  - Runs Mandatory Body Copy Verification Checklist
  - git add src/pages/wastewater-centrifuge.astro
  - git commit -m "feat(v2.2): wastewater-centrifuge iter-1"
  - git status -> clean
  - Commit hash: abc1234
  - Writes .audit/queue/wastewater-centrifuge/READY.txt:
      slug: wastewater-centrifuge
      iteration: 1
      commit: abc1234
      timestamp: 2026-04-19T14:30:00Z
      sonnet_summary: Initial migration. 12 paragraphs, 3 tables, 2 images. No FAQ in legacy so none added.
      sonnet_open_questions: Hero image is stretched - flagged via HERO_NEEDED.txt.
  - Tells Sanjay: "iter-1 submitted for wastewater-centrifuge, commit abc1234, waiting on audit."
  - STOPS.

Sanjay in Cowork: "audit"

Opus:
  - Scans .audit/queue/ -> sees wastewater-centrifuge/READY.txt
  - Verifies commit hash matches HEAD -> OK
  - Verifies working tree clean -> OK
  - Runs Pass A (body), Pass B (SEO), Pass C (layout)
  - Scores: body 82, seo 74, layout 70, overall 78
  - Writes .audit/reports/wastewater-centrifuge/iter-01.md
  - Writes .audit/reports/wastewater-centrifuge/LATEST.md (copy of iter-01)
  - Moves .audit/queue/wastewater-centrifuge/READY.txt to .audit/queue/_processed/wastewater-centrifuge-iter1.txt
  - Tells Sanjay: "iter-1 audited. Score 78. 4 P0 items, 3 P1 items. Needs another pass."
```

### Iteration 2

```
Sanjay in Antigravity: "Read the new LATEST and fix."

Sonnet:
  - Reads .audit/reports/wastewater-centrifuge/LATEST.md
  - Fixes all 4 P0 items (applies the diffs shown in the report)
  - Fixes all 3 P1 items
  - git add src/pages/wastewater-centrifuge.astro
  - git commit -m "feat(v2.2): wastewater-centrifuge iter-2 fixes per audit"
  - Commit hash: def5678
  - Writes .audit/queue/wastewater-centrifuge/READY.txt (iteration: 2, commit: def5678)
  - Tells Sanjay: "iter-2 submitted."

Sanjay in Cowork: "audit"

Opus:
  - Audits -> body 94, seo 91, layout 88, overall 91
  - All P0 resolved. No new P0s.
  - verdict: PASS
  - Writes .audit/reports/wastewater-centrifuge/iter-02.md + LATEST.md
  - Writes .audit/passed/wastewater-centrifuge/FINAL.md
  - Tells Sanjay: "wastewater-centrifuge PASSED with 91. Rotate sessions before next slug."
```

### Session rotation

```
Sanjay:
  - Closes Antigravity session
  - Closes Cowork conversation
  - Opens fresh Antigravity session
  - Opens fresh Cowork conversation
  - Pastes bootstrap prompt into Antigravity
  - Gives Sonnet the next slug
```

---

## 10. Hard stops (things that must never happen)

1. **Never edit two slugs in the same session.** One slug per session until PASS or STALL.
2. **Never skip a P0 or P1 fix** because "it looks fine". The audit is the arbiter.
3. **Never fabricate content to fix a P0.** If the P0 says "missing legacy paragraph", copy from LW.xml (paraphrase if needed). Do not invent.
4. **Never modify a file in `.audit/reports/`, `.audit/passed/`, or `.audit/stalled/`.** Read-only.
5. **Never deploy to production from this loop.** Push to origin is a separate manual step Sanjay triggers.
6. **Never start a new slug without session rotation** after PASS or STALL.
7. **Never claim a page is done based on your own judgment.** Done = `verdict: PASS` in LATEST.md. Nothing else counts.

---

## 11. Summary in one paragraph

You edit the page, commit, write READY.txt, stop. Opus audits and writes LATEST.md. You read LATEST.md, fix every P0 and P1, commit, write new READY.txt with iter+1, stop. Repeat until verdict PASS. On PASS or STALL, both sessions rotate. You and Opus never talk; the `.audit/` folder is the contract.
