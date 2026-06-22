# Dashboard Flag Fix — spec for Codex

**Author:** Claude (planner) · **Date:** 2026-06-22 · **Audit:** Claude, after you ship.
**Scope:** dashboard-only `src/pages/admin/submissions.astro`. **No Worker change.** Ship via `npm run build` → commit → push (Pages auto-deploys), record a stamp, hand back to Claude.

---

## Problem

Commit `ac825d3e` rendered country flags as **emoji** (`countryFlag()` returns regional-indicator glyphs). **Windows does not render flag emoji** — it shows the two-letter code instead (🇺🇸 → "US", 🇲🇽 → "MX"). On the owner's Windows/Chrome the dashboard therefore still shows "US / MX / KR / AU" as text, so the flag feature looks like it never landed. (Everything else from `ac825d3e`/`81278efc` is confirmed live and working: location dedupe, scheme-guard, popup-rerender fix.)

## Fix

Replace the emoji flag with a real flag **image** from `flagcdn.com` (a PNG per ISO-3166-1 alpha-2 code) — same approach StatCounter uses. Renders on every OS incl. Windows. The admin page already loads Google Fonts from an external origin, so an external image CDN is consistent; flagcdn sees only the admin's IP + country codes (no visitor PII).

---

## Edits (all in `src/pages/admin/submissions.astro`)

### 1. Add a `flagImg()` helper (place right after the existing `countryFlag` function)

```js
// Real flag IMAGE — Windows can't render flag emoji (it shows the 2-letter code),
// so we use flagcdn.com (PNG per ISO-3166-1 alpha-2, lowercase). '' on a bad code.
function flagImg(cc) {
  const code = String(cc || '').trim().toLowerCase();
  if (!/^[a-z]{2}$/.test(code)) return '';
  const u = code.toUpperCase();
  return `<img class="va-flag" src="https://flagcdn.com/20x15/${code}.png" srcset="https://flagcdn.com/40x30/${code}.png 2x" width="20" height="15" loading="lazy" alt="${esc(u)}" title="${esc(u)}">`;
}
```

### 2. `locationDisplay()` — use the image instead of the emoji span

Replace:
```js
      const code = String(visitor.visitor_country || '').trim().toUpperCase();
      const flag = countryFlag(code);
      const city = String(visitor.visitor_city || '').trim();
      const region = String(visitor.visitor_region || '').trim();
      const parts = [];
      if (city) parts.push(city);
      if (region && region.toLowerCase() !== city.toLowerCase()) parts.push(region);
      const flagHtml = flag
        ? `<span class="va-flag" title="${esc(code)}">${flag}</span>`
        : (code ? `<span class="va-cc">${esc(code)}</span>` : '');
```
With:
```js
      const code = String(visitor.visitor_country || '').trim().toUpperCase();
      const city = String(visitor.visitor_city || '').trim();
      const region = String(visitor.visitor_region || '').trim();
      const parts = [];
      if (city) parts.push(city);
      if (region && region.toLowerCase() !== city.toLowerCase()) parts.push(region);
      const img = flagImg(code);
      const flagHtml = img || (code ? `<span class="va-cc">${esc(code)}</span>` : '');
```
(`loc` and the `return` line stay as-is.)

### 3. Leads-table Country cell — use the image

Replace:
```js
        const ccFlag = countryFlag(cc);
```
With:
```js
        const ccFlagImg = flagImg(cc);
```
And in the `<td>` for Country, replace:
```js
${ccFlag ? `<span class="va-flag" title="${esc(cc)}">${ccFlag}</span>` : esc(r.country || '')}
```
With:
```js
${ccFlagImg || esc(r.country || '')}
```
(Keep the surrounding `<td style="white-space:nowrap;${isForeign ? ...}">` and the `${r.us_state ? ' / ' + esc(r.us_state) : ''}` suffix unchanged. `isForeign` still keys off `cc` — leave it.)

### 4. CSS — restyle `.va-flag` for an `<img>`

Replace:
```css
    .va-flag { font-style: normal; }
```
With:
```css
    .va-flag { display: inline-block; width: 20px; height: 15px; vertical-align: -2px; border-radius: 2px; box-shadow: 0 0 0 1px rgba(0,0,0,0.10); }
```
(The 1px shadow gives a hairline border so near-white flags — Japan, etc. — are visible on the white rows. Keep `.va-cc` as-is.)

### 5. Dead code

After steps 2–3, `countryFlag()` has no callers. `grep` for `countryFlag` — if zero remaining references, **delete the `countryFlag` function**; if anything still uses it, leave it.

---

## Verify

- `npm run build` → **159 pages**, exit 0.
- Confirm the deploy shipped: `Invoke-WebRequest https://dolphincentrifuge.com/admin/submissions/ -UseBasicParsing` and check the body contains `flagcdn.com` (mirrors how Claude verified prior deploys). The *visual* confirmation (flags actually drawn) is the owner's eyeball on Windows after a hard refresh — that's the whole point of this fix.

## Do-not-break

- Keep the `isForeign` amber cue and the `us_state` suffix in the leads cell.
- Keep the raw 2-letter code **text fallback** when the code is invalid/missing.
- Keep `title`/`alt` on the image (hover shows the code; accessibility).
- Don't touch the Worker or any other file. If a Content-Security-Policy is ever added, `img-src` must allow `https://flagcdn.com`.

## Hand-back

Commit (e.g. `fix(dashboard): render country flags as images (Windows can't draw flag emoji)`), push, record a coordination stamp with the hash, and hand back to Claude for the audit.
