# AI ASSISTANT — PERMANENT RULES

These rules are **non-negotiable** and apply to every session, every task.

---

## 🚨 RULE 1: NO PowerShell Set-Content on Source Files

**NEVER use `Set-Content` or `Get-Content | Set-Content` to modify `.astro`, `.html`, `.js`, `.ts`, `.css`, or any source code files.**

### Why
- PowerShell's `Set-Content -Encoding UTF8` adds a BOM and re-encodes the file.
- Every pass **double-encodes** special characters (em dashes, arrows, apostrophes, etc.).
- Characters like `—` become `Ã¢â‚¬â€` — visible garbage on the live website.
- This caused **repeated broken pages** and wasted session time.

### What to use instead
| Task | Correct Tool |
|---|---|
| Edit a single block of code | `replace_file_content` tool |
| Edit multiple non-adjacent blocks | `multi_replace_file_content` tool |
| Create a new file | `write_to_file` tool |
| Delete specific lines (surgery) | Write and run a `.ps1` script using `[System.IO.File]::ReadAllLines` + `WriteAllLines` (which does NOT add BOM) |

### Allowed PowerShell operations (read-only, safe)
- `Select-String` — searching/finding line numbers ✅
- `Get-Content` for reading only (not piped to Set-Content) ✅
- `[System.IO.File]::ReadAllLines` + `WriteAllLines` for bulk surgery ✅

---

## 🚨 RULE 2: Verify Before Claiming Fixed

**Never say "fixed" unless a verification step has been run.**

- After encoding fixes: run the corruption scan script to confirm zero non-ASCII chars
- After layout changes: check dev server returns `[200]` and no errors
- After delete operations: `view_file` the join point before declaring done

---

## 🚨 RULE 3: No Cloudflare via Browser Automation

**All Cloudflare dashboard tasks must be performed manually by the user.**

- Worker deployment: use `wrangler` CLI with `CLOUDFLARE_API_TOKEN` env variable
- Secret management: `wrangler secret put KEY_NAME`
- DNS changes: user performs manually in Cloudflare dashboard
- **Never** use browser subagent for Cloudflare login or dashboard actions

---

## 📋 Project Context Quick Reference

| Item | Value |
|---|---|
| Worker URL | `https://dolphin-contact-form.dolphin-centrifuge.workers.dev` |
| Worker file | `workers/contact-form/index.js` |
| Contact page | `src/pages/contact-for-alfa-laval-centrifuges.astro` |
| Resend API Key secret | Set via `wrangler secret put RESEND_API_KEY` |
| Dev server | `npm run dev` → `http://localhost:4321` |
| Design standard | v2.2 "Rugged Industrial" — Alpha Blue + Industrial Beige, Arial font |

---

*Last updated: 2026-04-18*
