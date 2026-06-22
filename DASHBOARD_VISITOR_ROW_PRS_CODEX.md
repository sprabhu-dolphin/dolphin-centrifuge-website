# Dashboard Visitor-Row PRs — Instruction Pack for Codex

**Owner-directed (Sanjay, 2026-06-21).** Claude is planner + auditor; **Codex executes** (repo lane).
After you implement, hand back to Claude for a 3-independent-sub-agent audit + final audit.

## Scope (DASHBOARD-ONLY — no Worker change)
All three PRs are in ONE file: `src/pages/admin/submissions.astro`, inside the client `<script>`,
specifically the **`renderVisitorDirectory(visitors)`** function's per-row `shown.map(visitor => {…})`
block and its helpers. **No `workers/contact-form/index.js` change. No `wrangler deploy`.** Ship via
`npm run build` (expect **159 pages**) → `git commit` → `git push origin master` (Pages auto-deploys).

## Data available on each `visitor` (a `visitor_profiles` row)
`visitor_id, visitor_country, visitor_region, visitor_city, visitor_as_organization` (ISP),
`visitor_asn, visitor_ip, source, medium, campaign, term, gclid, gbraid, wbraid, referrer,
first_landing_page, last_page, label, contact_name, contact_company, contact_email, visit_count`.
Helpers already in scope (hoisted): `countryFlag(cc)`, `displayUrl(url)`, `esc(str)`,
`visitorDisplayName(visitor)`, `visitorSourcePill(visitor)` (defined ~line 1315 but **currently
never rendered** — PR-3 wires it in).

---

## PR-1 — Anonymous rows: show flag + location + ISP instead of bold "Anonymous"
**Why:** "Anonymous #abc123" is zero value. Show who/where at a glance.

**Where:** the `nameHtml` ternary (~line 1401):
```js
const nameHtml = name
  ? `${esc(name)}${(visitor.contact_company && visitor.contact_company !== name) ? ' <span class="va-company">· ' + esc(visitor.contact_company) + '</span>' : ''}`
  : `Anonymous <span class="va-id">#${esc(visitorId.slice(0, 12))}</span>`;
```
**Change the ELSE (anonymous) branch** to build a location/ISP identity:
- `flag = countryFlag(visitor.visitor_country)`
- `loc = [visitor.visitor_city, visitor.visitor_region, visitor.visitor_country].filter(Boolean).join(', ')`
- `isp = visitor.visitor_as_organization || ''`
- Render: `${flag ? flag + ' ' : ''}${esc(loc)}${isp ? ' <span class="va-company">· ' + esc(isp) + '</span>' : ''}`
- **Fallback:** if BOTH `loc` and `isp` are empty → keep `Anonymous <span class="va-id">#${id}</span>`.
- Keep it inside `<span class="va-name">` (the bold header). Identified rows (the `name` branch) are UNCHANGED.

**Acceptance:** an anonymous US visitor in Houston on Verizon shows "🇺🇸 Houston, Texas, United States · Verizon" as the row title; a no-geo anonymous still shows "Anonymous #id".

---

## PR-2 — Decipher the long Google-Ads URL into a keyword nugget
**Why:** the raw ad landing URL (`…?utm_source=googleads&vt_keyword=centrifuge+for+used+oil…&gad_campaignid=…&gbraid=0A…`) is a text-wall. Surface the **search keyword** instead; Google hides most, but show whatever nugget exists.

**Add a helper** (near the other row helpers):
```js
function qparam(url, names) {
  try {
    const u = new URL(url, 'https://x'); // base lets relative paths parse
    for (const n of names) {
      const v = u.searchParams.get(n);
      if (v) return decodeURIComponent(v.replace(/\+/g, ' ')).trim();
    }
  } catch (e) {}
  return '';
}
function decipherKeyword(visitor) {
  // Prefer the parsed term; else mine the landing/last-page URL for ad/search keyword params.
  if (visitor.term && visitor.term !== '(not provided)') return visitor.term;
  const urls = [visitor.last_page, visitor.first_landing_page, visitor.referrer].filter(Boolean);
  for (const u of urls) {
    const k = qparam(u, ['vt_keyword', 'utm_term', 'keyword', 'q', 'p']); // p = older Bing/Yahoo
    if (k) return k;
  }
  return '';
}
```
**Then in the row:** replace the raw "Visit Page" wall with a clean keyword line + a SHORT page link.
- Add a keyword vaPair when a keyword exists:
  `${vaPair('Searched:', decipherKeyword(visitor) ? esc(decipherKeyword(visitor)) : '')}`
  (call `decipherKeyword` once into a const; label it "Searched:" — it covers Google Ads `vt_keyword`,
  organic `q`, Bing, etc.)
- Shorten the Visit Page so it is NOT a wall: show the **path only** (strip the query string) with the
  full URL in a `title=` tooltip. The existing `lastPageHtml` uses `displayUrl(lastPageRaw)`; change it to
  display `new URL(lastPageRaw,'https://x').pathname` (fallback to `displayUrl`) and put the full URL in `title`.
  Keep the link `href` as the full `lastPageRaw`.

**Acceptance:** a Google-Ads visitor shows `Searched: centrifuge for used oil purification` and `Visit Page: /waste-oil-centrifuge/ ↗` (full URL on hover), NOT the 200-char param wall. A visitor with no keyword shows no "Searched:" line.

---

## PR-3 — Per-row source/channel badge (enhance + WIRE IN `visitorSourcePill`)
**Why:** every row should show its channel at a glance. `visitorSourcePill` exists but is **never rendered**.

**3a. Enhance `visitorSourcePill(visitor)`** (~line 1315) into 5 explicit, color-coded categories:
- **Paid – Google:** `visitor.gclid` OR `visitor.gbraid` OR `visitor.wbraid` OR `medium` in (cpc,ppc,paid) OR `source`/landing-url contains `googleads`/`gclid`. → class `va-pill-ads`, label "Paid · Google".
- **Organic – Google:** no paid signal AND (`medium`==='organic') AND `source` contains `google`. → new class `va-pill-org-g`, label "Organic · Google".
- **Organic – Bing:** `source` contains `bing` (or `msn`/`yahoo`) and not paid. → new class `va-pill-org-b`, label "Organic · Bing".
- **Direct:** no `source` or `source` in (direct,(direct),none). → class `va-pill-neu`, label "Direct".
- **Other:** anything else → class `va-pill-neu`, label "Other · {source}/{medium}" (show the detail).
- Drop the inline `term` from the pill (PR-2's "Searched:" line now carries the keyword).

**3b. Add CSS** for the two new pill classes near the existing `.va-pill-ads`/`.va-pill-neu`:
- `.va-pill-org-g { background:#e3f4e8; color:#1f7a3d; }` (green, organic Google)
- `.va-pill-org-b { background:#e2eef7; color:#1d5d86; }` (blue, organic Bing)
(Match the existing pill padding/radius/font — copy from `.va-pill`.)

**3c. RENDER the pill in the row** — add `${visitorSourcePill(visitor)}` to the `.va-ident` line
(next to `connectBadge`/`quickTagBtn`, ~line 1432) so every row shows its channel badge.

**Acceptance:** each visitor row shows exactly one colored channel badge — Paid·Google (gold),
Organic·Google (green), Organic·Bing (blue), Direct (gray), or Other·detail.

---

## DO NOT BREAK
- Identified-visitor rows (name/label) — PR-1 only changes the anonymous branch.
- The connected-dots highlight, `🏷 Name/Re-tag` quick-tag button, returning/filled badges, the
  expandable detail panel + identity controls — all stay.
- Pagination, date range, search, the Pages/Summary panels (other waves) — untouched.
- `esc()` every interpolated string (XSS); the pill/keyword must be escaped.

## VERIFY before handing back
1. `npm run build` → **159 pages**, no errors.
2. Eyeball logic for: anonymous-with-geo, anonymous-no-geo (fallback), a Google-Ads visitor
   (keyword deciphered + short Visit Page), an organic visitor, a direct visitor.
3. `git commit` + `git push origin master`. Record a coordination stamp (`01 Operating Rules/Agent
   Coordination.md`) with the commit hash + what changed.
4. **Hand back to Claude** for the 3-independent-sub-agent audit + final audit. Not closed until that passes.
