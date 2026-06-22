# Dashboard Audit Pack — for Codex (role-reversed, one-time)

**Author:** Claude (planner/auditor) · **Date:** 2026-06-21
**Why this exists:** Claude executed two dashboard changes directly, which is Codex's execution lane (model = Claude plans/audits, Codex executes). Owner decided: keep both commits live, and have **Codex run the independent audit** of Claude's work this once. You are auditing code you did not write — treat it zero-context and adversarially.

---

## Scope

- **One file only:** `src/pages/admin/submissions.astro` (client-side `<script>`; the admin visitor dashboard). **No Worker change** in either commit.
- **Two commits, both already LIVE on `origin/master`** (Cloudflare Pages auto-deployed):
  - **`9286045e`** — 2 security/robustness hardening one-liners.
  - **`ac825d3e`** — 4 owner-requested UI tweaks.
- Baseline before this work: **`f9a1d37a`**.

### Get the diffs
```
git show 9286045e -- src/pages/admin/submissions.astro
git show ac825d3e -- src/pages/admin/submissions.astro
git diff f9a1d37a..ac825d3e -- src/pages/admin/submissions.astro   # full combined
```

---

## Method (standing audit method)

1. Read each diff zero-context from three angles: **bugs** (does it do what it claims), **weak-links** (XSS / injection / unescaped interpolation / edge inputs), **break-points** (what input or interaction crashes or corrupts the render).
2. `npm run build` → must report **159 page(s)**, exit 0. (Astro bundles the client `<script>`, so a JS syntax error fails the build — but a build pass does NOT prove runtime correctness; reason about the logic.)
3. **Live browser check is NOT available** — the admin panel is auth-gated to prod and `?localDemo=1` only bypasses the login UI (it still fetches the live Worker, which 401s a fake token), so there's no seeded local data. Audit by code reasoning + build, the standing proof for this panel.

---

## Commit `9286045e` — hardening

**(A) "Visit Page" scheme-guard** (in `renderVisitorDirectory`). The anchor's `href` came from `last_page`/`first_landing_page`, which arrive via the public, unauthenticated `/track/pageview` beacon; the Worker's `cleanText` (`workers/contact-form/index.js` ~line 424) only trims+truncates, so a `javascript:`/`data:` URL can be stored → click-gated stored-XSS in the admin origin. New code parses `new URL(raw,'https://x')` and only emits the `href` when `protocol` is `http:`/`https:`; otherwise renders a plain `<span class="va-link-plain">`.

Confirm:
- [ ] Relative paths (`/oil-centrifuge/`) still render as a **link** (they resolve to `https://x/...` → safe).
- [ ] `javascript:…`, `data:…`, `vbscript:…`, leading-space ` javascript:…` all render as **plain text, no `href`** (the URL constructor trims leading control/space, so ` javascript:` still parses to `protocol === 'javascript:'`).
- [ ] In BOTH branches, `href`, `title`, and the label are `esc()`'d — the plain-text fallback label for a `javascript:` value is `u.pathname` (e.g. `alert(1)`) which is inert text once esc'd; confirm no path renders executable markup.
- [ ] This is the **only** clickable visitor-URL in the file: detail-panel "Last page" is plain `esc()` text via `attribLine`; the leads table renders no attribution URL as an anchor. (grep `va-link` / `href=` to confirm.)
- [ ] `lastPageRaw = last_page || first_landing_page`, so the single guard covers **both** URL fields.

**(B) anon-id crash guard.** `esc(String(visitor.visitor_id || '').slice(0,12))` (was `esc(visitorId.slice(0,12))`).
- [ ] A non-string `visitor_id` can no longer throw and blank the whole directory; mirrors the `String(...)` guard in `visitorSourcePill`.

---

## Commit `ac825d3e` — 4 UI tweaks

**(1) Country flag instead of `US`/`CA` text.** Leads-table Country cell + visitor-log location now show the flag emoji with the ISO code in a hover `title`.
- [ ] Leads cell: `${ccFlag ? <span class="va-flag" title="${esc(cc)}">…</span> : esc(r.country || '')}` — flag when `cc` is a valid 2-letter code, **falls back to raw code text** otherwise; `us_state` suffix preserved; `title` is `esc()`'d.
- [ ] The `isForeign` amber-cell cue still fires (it keys off `cc`, unchanged).
- [ ] `countryFlag()` itself is untouched (returns '' unless `/^[A-Z]{2}$/`).

**(2) Left-justified leads table.** Sticky `#` id column (`td:nth-child(1)`) and `.cell-num` changed `text-align: center` → `left`.
- [ ] Header/body of the sticky first column still align; `left: 0;` sticky positioning intact; no other column shifted.

**(3) "Connected dots" → click-popup.** Badge is now a `<button data-dots-toggle>`; a sibling hidden `<span class="va-dots-pop">` holds the breakdown; on click a single **body-level** popup is built from that HTML and positioned under the badge.
- [ ] Handler does `preventDefault()` + `stopPropagation()` so clicking the badge does **not** toggle the `<details>` row (mirrors quick-tag).
- [ ] Same-badge re-click closes (toggle); different-badge click closes the old one and opens the new (`dotsPopupAnchor` compare logic).
- [ ] Popup is appended to `document.body` (so `.va-log { overflow:hidden }` can't clip it) and **removed** on outside-click, `scroll` (capture=true), and `resize`.
- [ ] **XSS:** every interpolation in `signalsHtml` is safe — the `label`s are Claude-authored string literals; `sourceDetail` and the identity `detail` are `esc()`'d; `visits` is a `Number`; the `&times;`/`&middot;` are entities. Confirm no raw visitor field reaches the popup unescaped.
- [ ] Left-position is clamped to the viewport (`Math.max(10, Math.min(r.left, maxLeft))`).
- [ ] Badge-as-`<button>` styling reset (border:0, font-family:inherit, cursor:pointer) doesn't distort the pill.

**(4) Shorter locations.** New `locationDisplay(visitor)` dedupes a repeated city/region and drops the country text (flag conveys it); returns `{ flagHtml, loc, has }`. Used in the anonymous header line and Column B "Location".
- [ ] Dedupe: `region` dropped when `region.toLowerCase() === city.toLowerCase()` (so "Ho Chi Minh City, Ho Chi Minh City, VN" → flag + "Ho Chi Minh City").
- [ ] Anon row still falls back to `Anonymous #id` only when there's no loc AND no flag AND no ISP.
- [ ] Identified visitors still show their location in Column B (the `geo` var is reused there).
- [ ] Leads-table Visitor-context panel (`renderVisitorContext`) dedupes the same repeat but **keeps** the country code (no flag in that plain-text drill-down); its `hasContext` gate still works.

---

## Claude's self-flagged suspects (start here — these are where I'm least sure)

1. **Dots popup orphaned on re-render.** The popup lives on `document.body`, outside `visitorDirectory.innerHTML`. A re-render (search keystroke, pagination, date-range change) destroys the anchor but does NOT remove an open popup — it can float until the next outside-click/scroll. Decide if `renderVisitorDirectory` (or `applySearch`) should call `closeDotsPopup()` up front. **Likely worth a one-line fix.**
2. **Scroll container.** Confirm the capture-phase `window` scroll listener actually closes the popup when the scroll happens inside an inner scrollable element (not just the window), since the table/panel may scroll internally.
3. **Flag-only leads cell.** A US lead now shows just 🇺🇸 (+ state), no "US" text. Confirm that's the intended look and nothing downstream parsed the old text.
4. **Country dropped from the visitor-log Location pair** when a flag renders (it's only in the flag `title` now). Confirm acceptable vs. wanting the code visible.

---

## Cross-cutting

- [ ] No new XSS anywhere in either diff (every new interpolation `esc()`'d or provably non-string).
- [ ] No regression to existing render paths: pagination, known-only filter, search, quick-tag, Save Visitor, delete.
- [ ] No duplicate function or CSS-selector definitions introduced (`locationDisplay`, `openDotsPopup`, `closeDotsPopup`, `.va-flag`, `.va-dots-*` each defined once).
- [ ] `npm run build` = 159 pages, exit 0.

---

## Reporting

Give a verdict **per commit**: `PASS` or `FIX-THEN-SHIP` (with `file:line` + the precise fix).

- If you find a **real defect** (e.g. suspect #1): it's your execution lane — fix it in `submissions.astro`, `npm run build` (159 pages), commit + push (Pages redeploys), and record the hash.
- If both are **clean**: record a PASS stamp.
- Either way, add a stamp to `01 Operating Rules/Agent Coordination.md` (who / commits audited / verdict / build) and hand back to Claude.

---

## Housekeeping (follow-up — do after the audit hand-back)

Goal: a clean `git status`. After the audit, three files are untracked:
`DASHBOARD_VISITOR_ROW_PRS_CODEX.md`, `DASHBOARD_AUDIT_CODEX.md` (this file),
`google-ads-bleed-scan.mjs`. The repo root already tracks ~15 `*_CODEX.md` /
planning packs (GSC/WORKER/STATCOUNTER/etc.), and the bleed-scan is a sibling of
the already-tracked `google-ads-check.mjs` / `-lockdown.mjs` / `-write.mjs`, so
committing all three to root is the established convention.

### Recommended — commit all three

```bash
# from repo root
# 1) Secret-scan the helper (standing practice before committing any helper)
rg -n -i "AIza|ya29\.|refresh_token|client_secret|developer_token|login_customer_id|Bearer [A-Za-z0-9]" google-ads-bleed-scan.mjs
#    EXPECT only variable names / out-of-repo credential PATHS, never a literal secret value.
#    If a real secret is present, STOP — move it to the external cred store first, do not commit.

# 2) Stage the two planning packs + the helper
git add DASHBOARD_VISITOR_ROW_PRS_CODEX.md DASHBOARD_AUDIT_CODEX.md google-ads-bleed-scan.mjs

# 3) Hygiene check
git diff --check

# 4) Commit + push (no build needed — no src/ or worker change)
git commit -m "chore(dashboard): add visitor-row spec + audit packs; ads bleed-scan helper"
git push origin master

# 5) Confirm
git status --short      # expect: empty
```

### The one judgment call — the helper (your file, your call)

- **Commit it** (recommended) — maintained Ads helper alongside the others → command above.
- **Keep untracked** — if scratch: `Add-Content .gitignore "google-ads-bleed-scan.mjs"` (PowerShell), then commit only the two `.md` packs.
- **Delete it** — if throwaway: `Remove-Item google-ads-bleed-scan.mjs` (or `git clean -i`).

The two `.md` packs get **committed either way** — they're the durable spec+audit record. Record a coordination stamp when done.

*(Until committed, this pack is untracked / not pushed — a planning artifact, consistent with the other `*_CODEX.md` packs in the tree.)*
