# .audit/ - Handoff Contract Between Sonnet (Antigravity) and Opus (Cowork)

This folder is the ONLY communication channel between the two AI agents working on this site.
Sonnet and Opus never talk directly. They write files here. That is the contract.

---

## Folder purpose

| Folder | Written by | Read by | Purpose |
|---|---|---|---|
| `queue/{slug}/` | Sonnet | Opus | Sonnet drops `READY.txt` here when a page finishes an edit pass |
| `queue/_processed/` | Opus | (archive) | Opus moves processed `READY.txt` files here so they don't re-run |
| `reports/{slug}/` | Opus | Sonnet | Audit reports: `iter-01.md`, `iter-02.md`, ... plus `LATEST.md` pointer |
| `passed/{slug}/` | Opus | Sanjay + Sonnet | `FINAL.md` written when a page scores >= 90 overall with no P0 items |
| `stalled/{slug}/` | Opus | Sanjay | `WHY.md` written when the loop can't converge (5 iters, repeat offender, dirty tree) |

---

## State machine per page

```
Sonnet edits src/pages/{slug}.astro
       |
       v
Sonnet commits (clean working tree REQUIRED)
       |
       v
Sonnet writes .audit/queue/{slug}/READY.txt
       |
       v
Sanjay says "audit" in Cowork -> Opus runs
       |
       +--- score >= 90 AND body >= 90 AND seo >= 85 AND no P0
       |      --> .audit/passed/{slug}/FINAL.md
       |      --> Opus tells Sanjay: ROTATE SESSIONS before next slug
       |
       +--- iter >= 5 OR same P0s as previous iter OR dirty tree OR bad commit hash
       |      --> .audit/stalled/{slug}/WHY.md
       |      --> Opus tells Sanjay: human review needed, ROTATE SESSIONS
       |
       +--- otherwise
              --> .audit/reports/{slug}/iter-NN.md + LATEST.md
              --> Sonnet reads LATEST, fixes every P0 and P1, new READY.txt (iter+1)
              --> loop
```

---

## Hard rules

1. **Never edit another agent's files.** Sonnet writes only to `queue/`. Opus writes only to `reports/`, `passed/`, `stalled/`, and moves files into `queue/_processed/`.
2. **LATEST.md is always a copy of the newest `iter-NN.md` in that slug's report folder.** Sonnet reads LATEST, not iter files directly.
3. **Working tree must be clean** before Sonnet writes READY.txt. Dirty tree = auto-STALL.
4. **Commit hash in READY.txt must match current HEAD for that file.** Mismatch = auto-STALL.
5. **One slug per audit run.** Opus processes oldest READY.txt first, one at a time.
6. **No production deploys triggered from this loop.** PASS means "source is ready". Sanjay chooses when to push.

---

## See also

- `AUDIT_HANDOFF_PROTOCOL.md` (repo root) - Sonnet's full operating brief
- `AUDIT_AGENT.md` (repo root) - Opus's full operating brief
- `LEGACY-BODY-FIDELITY.md` (repo root) - body content rules audited on every page
- `SEO-AND-STANDARDS.md` (repo root) - SEO + standards rules audited on every page
- `PAGE_APPEARANCE_LOOK.md` (repo root) - layout rules audited on every page
- `.agents/rules/astro-migration.md` - Antigravity's root rule file, references the above
