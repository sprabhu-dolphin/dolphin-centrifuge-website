# April Cliff Investigation — Findings

**Date:** 2026-08-23
**Scope:** Overnight Orders item 19 — why "Google-indexed pages" appeared to fall 337 → 154 during Apr–May 2026.
**Method:** Google Search Console (property `sc-domain:dolphincentrifuge.com`, Sanjay's logged-in Chrome, read-only) + local repo forensics.
**Nothing was changed.** No validation started, no removal requested, no setting touched, no indexing requested, no git write.

---

## Conclusion (read this first)

**Benign consolidation. There is no deindexing event and no live money page is missing from Google.**

Two findings, in order of importance:

### 1. The premise is a metric mix-up. 337 → 154 was never the indexed-page count.

`docs/performance-review-2026-08.md` line 41–42 sources those numbers from the **Performance report** column
"Pages w/ impressions" — how many distinct URLs earned at least one impression in a rolling 28-day window.
That is not GSC's index coverage. The Page Indexing report's *indexed* count has been flat at
**149–152 for the entire retained history** (GSC's coverage chart only retains back to 2026-05-24; every day in
that window sits at ~149).

So nothing was "deindexed." What halved was the count of junk URLs Google was still willing to *show*
impressions for.

### 2. The cliff predates the Astro cutover by about three weeks, so it is not migration breakage.

| Date | Event |
|---|---|
| 2026-03-07 | First Astro commit (`7f09f122`) — development only |
| 2026-03-16 | `63b67f76` "Full site build: 128 legacy pages + 11 hub pages" — still development |
| **2026-03-20 → 03-30** | **Googlebot's last crawl of the legacy junk-URL family** (see sample URLs below) |
| 2026-04-21 | Perf window ends: 337 pages w/ impressions, 1,477 clicks, 261k impressions |
| 2026-05-18 | `50273640` WordPress legacy redirect patterns added "for launch" |
| **2026-05-19** | **Perf window ends: 154 pages w/ impressions, 1,216 clicks, 172k impressions ← the "cliff"** |
| 2026-05-21 | `b707cb3c` "Backend launch cleanup: sitemap filter, admin noindex" |
| 2026-06-07 | `a7bd182c` "Google tracking parity with WordPress **pre-go-live**" |
| ~2026-06-09/10 | `f0fe4100` "backup: **live** Astro website snapshot 2026-06-10" — actual cutover |
| 2026-06-11 | `sitemap-index.xml` submitted to GSC (per Sitemaps report) |

The site was still WordPress throughout the Apr 21 → May 19 window. The Astro cutover happened *after* the
cliff. The migration cannot be the cause, and the existing note in `EXEC_REVIEW_8POINT_LOG.md:280`
("no migration breakage") is consistent with this.

### What actually dropped out

The shed URLs were near-zero-click legacy WordPress cruft. The arithmetic proves it:

| Apr 21 → May 19 | Change |
|---|---|
| Pages w/ impressions | 337 → 154 (**-54%**) |
| Impressions | 261,466 → 172,543 (-34%) |
| Clicks | 1,477 → 1,216 (**-18%**) |
| CTR | 0.56% → 0.70% (**+25%**) |

Pages fell three times faster than clicks and CTR went *up*. The lost URLs were earning impressions and
essentially no clicks. That is the signature of Google retiring a long tail of duplicate/parameter/archive
URLs, not of losing real pages.

---

## GSC numbers as of 2026-08-23 (last GSC update 8/20/26)

**Indexed: 149. Not indexed: 290, across 6 active reasons.**

| Reason | Source | Pages | First detected | Trend in retained window |
|---|---|---|---|---|
| Crawled - currently not indexed | Google systems | **182** | 8/16/22 | Flat ~200, easing to ~180 after 7/21 |
| Not found (404) | Website | **52** | 8/16/22 | ~70 in late May → ~40 in July → 52 now |
| Page with redirect | Website | **48** | 8/16/22 | Flat |
| Excluded by 'noindex' tag | Website | 4 | 8/16/22 | Flat |
| Alternate page with proper canonical tag | Website | 3 | 8/16/22 | Flat |
| Blocked by robots.txt | Website | 1 | 5/7/24 | Flat |

**Reasons confirmed at zero** (checked individually, all "no data"): Duplicate without user-selected canonical,
Discovered - currently not indexed, Duplicate/Google chose different canonical, Soft 404, Server error (5xx),
Redirect error, Queued for crawling, Blocked by page removal tool, 401, Legal complaint.

Zero `Discovered - not indexed`, zero soft-404, zero 5xx and zero canonical conflicts is a clean profile.
There is no crawl-budget or duplicate-content problem.

**Every one of these reason buckets was first detected 8/16/22 or 5/7/24 — none of them appeared in April 2026.**
GSC shows no issue with an April onset.

### Sitemap alignment (decisive)

| Measure | Count |
|---|---|
| `.astro` pages in `src/pages` excluding `/admin/` and `404` | 148 |
| `<loc>` entries in built `dist/sitemap-0.xml` | 148 |
| GSC "Discovered pages" for `sitemap-index.xml` (submitted 6/11/26, last read 8/16/26, Success) | 148 |
| GSC indexed pages | 149 |

148 built = 148 submitted = 148 discovered = 149 indexed. **The entire live site is indexed.**

---

## Sample URLs by reason

### Crawled - currently not indexed (182) — the legacy junk family

Note the **Last crawled dates cluster in March 2026**, immediately before the cliff window. Google crawled this
family in late March, evaluated it, and stopped serving it.

| URL | Last crawled |
|---|---|
| `/wp-content/uploads/2022/02/Alfa-Laval-G2-Decanter.pdf` | Aug 2, 2026 |
| `/images/alfa-laval-g2-40-decanter/Alfa-Laval-G2-Decanter.pdf` | Aug 1, 2026 |
| `/wp-includes/js/dist/vendor/wp-polyfill-dom-rect.min.js?ver=3.42.0` | May 2, 2026 |
| `/diesel-centrifuge/#!/lively-chat-support` | Apr 12, 2026 |
| `/wvo-centrifuge-separator` (no trailing slash) | Mar 30, 2026 |
| `/hemp-extraction-centrifuge//1000` | Mar 29, 2026 |
| `/can-a-centrifuge-` (truncated slug) | Mar 26, 2026 |
| `/fuel-oil-centrifuge//1000` | Mar 24, 2026 |
| `http://www.dolphincentrifuge.com/applications/crude` | Mar 24, 2026 |
| `/alfa-laval-btpx-205-biotech-centrifuge//1000` | Mar 24, 2026 |
| `/beer-wine-centrifuge` (no trailing slash) | Mar 24, 2026 |
| `/wp-includes/js/dist/vendor/wp-polyfill-importmap.min.js?ver=1.8.2` | Mar 24, 2026 |
| `/disc-stack-centrifuge-remove-metals-ash-used-oil//1000` | Mar 22, 2026 |
| `/sharples-p-3400-decanter//1000` | Mar 21, 2026 |
| `/biodiesel-centrifuge` (no trailing slash) | Mar 21, 2026 |
| `http://www.dolphincentrifuge.com/applications/lube-oil-centrifuge/?gclid=CjwKEAjw...` | Mar 21, 2026 |
| `/lube-oil-centrifuge/?gclid=CjwKEAjw...` | Mar 21, 2026 |
| `/machining-coolant-recovery-centrifuge/1000` | Mar 20, 2026 |
| `/product-tag/explosion-proof-centrifuge/` | Mar 20, 2026 |
| `/product/alfa-laval-centrifuge-parts/` | Mar 20, 2026 |

Five distinct junk patterns, all WordPress-era, none of them a real page:
`//1000` and `/1000` image-size suffixes, `?gclid=` ad-landing duplicates, `#!/lively-chat-support` chat-widget
fragments, `/product-tag/` and `/product/` WooCommerce archives, `wp-includes/` and `wp-content/` assets, and
no-trailing-slash duplicates of pages that are themselves indexed at the canonical slash form.

### Not found (404) — 52

| URL | Last crawled |
|---|---|
| `/thank-you/` | Aug 12, 2026 |
| `/test/` | Aug 12, 2026 |
| `/disc-centrifuge-parts-glossary/1000` | Aug 8, 2026 |
| `/centrifugal-filter/1000` | Aug 8, 2026 |
| `/dmpx-014-wo-self-cleaning-disc-stack-centrifuge/` | Aug 7, 2026 |
| `/industrial/` | Aug 7, 2026 |
| `https://www.dolphincentrifuge.com/industrial/` | Aug 7, 2026 |
| `/centrifugal-filter//1000` | Aug 5, 2026 |
| `https://www.dolphincentrifuge.com/industrial` | Aug 5, 2026 |
| `/disc-centrifuge-purifier-clarifier-difference/1000` | Aug 5, 2026 |

Same `/1000` family plus retired WP pages (`/thank-you/`, `/test/`, `/industrial/`, `/dmpx-014-...`).
`/dmpx-014-wo-self-cleaning-disc-stack-centrifuge/` matches commits `1ecc23a6` / `15e0921b` (2026-05-18) which
deliberately removed `/centrifuges/dmpx-014/` links — retirement, not breakage.

### Page with redirect — 48 (all working as designed)

| URL | Last crawled |
|---|---|
| `/home/` | Aug 21, 2026 |
| `/disc-centrifuge-glossary/` | Aug 21, 2026 |
| `/category/manual-clean-disc-centrifuge/` | Aug 20, 2026 |
| `http://dolphincentrifuge.com/` | Aug 20, 2026 |
| `http://www.dolphincentrifuge.com/` | Aug 20, 2026 |
| `https://www.dolphincentrifuge.com/` | Aug 20, 2026 |
| `/centrifuge-rcf-rpm-difference-calculation` (no slash) | Aug 20, 2026 |
| `/waste-oil-centrifuges-lp/` | Aug 18, 2026 |
| `/oil-centrifuge` (no slash) | Aug 16, 2026 |
| `/disc-centrifuge-purifier-clarifier-difference` (no slash) | Aug 16, 2026 |

http→https, www→apex, `/category/*`, no-trailing-slash variants, and the intentionally retired
`/waste-oil-centrifuges-lp/` (merged into `/waste-oil-centrifuge/` in commit `f03a45e5`, 2026-05-08).
Every one is a rule we wrote on purpose. This bucket is proof the redirects work, not a problem.

### Excluded by 'noindex' — 4 (all stale WP entries)

| URL | Last crawled |
|---|---|
| `/centrifuge-calculator-disclaimer/` | Feb 6, 2025 |
| `/2020/12/` | Feb 5, 2025 |
| `/2020/10/` | Feb 5, 2025 |
| `/industrial-centrifuge-blog/` | Oct 28, 2023 |

All last crawled in 2023–2025, i.e. WordPress-era leftovers Google has not revisited. Nothing here reflects the
current Astro build, whose only `noindex` emissions are `src/pages/404.astro` and `src/pages/admin/submissions.astro`
(verified by grep — those are the only two files in `src/` containing `noindex`).

### Alternate page with proper canonical tag — 3

- `/explosion-proof-centrifuge/#!/lively-chat-support`
- `/industrial-centrifuge/?utm_source=googleads&vt_keyword=industrial centrifuge&...&gclid=EAIaIQob...`
- `/alfa-laval-wspx-303-centrifuge//` (double slash)

Fragment, ad-parameter, and double-slash duplicates correctly canonicalising to the real page. Working as intended.

### Blocked by robots.txt — 1

- `/tour/` — intentional. `public/robots.txt` contains `Disallow: /tour/` and `Disallow: /tour2/`;
  `/tour3/` is the live tour and stays crawlable. Working as intended.

---

## Are any live, wanted pages unindexed?

**No.** URL Inspection on the converting cluster, all five confirmed live on Google today:

| Page | URL Inspection verdict |
|---|---|
| `/wvo-centrifuge-separator/` | URL is on Google — Page is indexed |
| `/waste-oil-centrifuge/` | URL is on Google (has issues) — Page is indexed; 1 invalid **Product snippet** (schema, not indexing) |
| `/alfa-laval-whpx-513/` | URL is on Google — Page is indexed |
| `/decanter-centrifuge/` | URL is on Google — Page is indexed; Product snippet valid with non-critical issues |
| `/industrial-centrifuge/` | URL is on Google (has issues) — Page is indexed; 1 invalid **Product snippet** (schema, not indexing) |

The "has issues" warnings are structured-data enhancement problems only. They do not affect indexing.
Site-wide the Shopping report shows **Product snippets: 1 valid / 6 invalid** — the only real (non-indexing)
defect this investigation turned up, and it is already tracked separately (commits `5ae3f8dd`, `75504bd7`).

Supporting evidence that nothing wanted is missing: Core Web Vitals 132 good / 0 poor on both mobile and
desktop, HTTPS 132 / 0, Breadcrumbs 134 valid / 0 invalid.

---

## Repo evidence

### `public/_redirects`

175 lines, **129 active rules**. Top families:

| Pattern | Rules |
|---|---|
| `/applications/*` (CC-invented category pages, retired 2026-07-16) | 23 |
| `/industrial-centrifuge-blog/` + `/page/N/` | 8 |
| `/wp-content/*` | 7 |
| `/product/*`, `/product-category/*` | 5 |
| `/tag`, `/tag/`, `/tag/*` | 3 |
| `/category`, `/category/`, `/category/*` | 3 |
| `/author`, `/author/`, `/author/*` | 3 |
| `/search`, `/2020/04/`, `/2020/05/`, `/topics/`, `/web-stories/`, sitemap variants | ~10 |

History (`git log --follow -- public/_redirects`) — the file only started absorbing WordPress archive patterns
**after** the cliff:

| Commit | Date | Note |
|---|---|---|
| `9d68cb06` | 2026-03-16 | first redirects (cannabis → stainless steel) |
| `1882662f` | 2026-04-19 | Netlify→Cloudflare language purge |
| `5f35c0e2` | 2026-05-07 | no-trailing-slash 301s |
| `f03a45e5` | 2026-05-08 | retire `/waste-oil-centrifuges-lp/` |
| **`50273640`** | **2026-05-18** | **WordPress legacy patterns: wp-content, wp-admin, category, tag, author, feed, sitemap** |
| `14970053` | 2026-05-18 | proper 404 page; remove dead 410 rules (CF Pages has no 410) |
| `de039c8d` | 2026-05-18 | remove broken `/?s=*` rule that was matching `/` and redirecting to `/knowledge-center/` |
| `c6f01206`, `531d618c` | 2026-06-12, 06-19 | "GSC recovery" legacy 404 redirects |
| `06b6fb8a` | 2026-07-17 | traffic-backed 404 repairs |

The `/category/*`, `/tag/*`, `/author/*` and `/product-tag/` families that vanished from impressions were
**not redirected until 2026-05-18**, three-plus weeks into the cliff window. They dropped out on their own.
The redirects were the cleanup, not the cause.

Note the `de039c8d` bug (a `/?s=*` rule that matched the homepage `/` and 301'd it to `/knowledge-center/`) —
it existed only between 2026-05-18 and 2026-05-18 and was fixed the same day, so it cannot explain an
Apr 21 → May 19 decline either.

### Other repo checks

- **robots.txt** — clean. `Allow: /`, sitemap declared, only `/admin/`, `/drafts/`, `/tour/`, `/tour2/` disallowed.
  No site-wide or accidental block, past or present.
- **Sitemap** — `@astrojs/sitemap` in `astro.config.mjs`, single filter `!page.includes('/admin/')`. No
  over-filtering.
- **noindex** — only `src/pages/404.astro` and `src/pages/admin/submissions.astro`.
- **Canonical changes** — no commit in the Mar 1 – Jun 15 range touches canonical logic sitewide. The Apr
  commits (`cb7a5a91`, `280b2f65`, `a5c80a33`, decanter fixes) are content-fidelity and image work on a site
  that was not yet live.
- **Was there ever a ~337-URL sitemap?** No. The Astro build has only ever produced 148 URLs. The 337 count
  came from Google's own long tail of WordPress URLs (tags, categories, `/product-tag/`, `?gclid=` ad landings,
  `/1000` image-size variants, `#!` chat fragments, no-trailing-slash duplicates, `wp-content` assets) — the
  same family now sitting in "Crawled - currently not indexed."

### Crawl stats (Settings → Crawl stats, retained window 5/24–8/20)

- 11K total crawl requests, 275 MB, avg response **144 ms**
- Hosts: `dolphincentrifuge.com` 10,392 (No problems) · `www.dolphincentrifuge.com` 570 (Problems in the past) ·
  **`wp.dolphincentrifuge.com` 1** (No problems) — a leftover WordPress subdomain still known to Google
- By response: **200 = 67%**, 404 = 18%, 301 = 11%, 304 = 5%, robots.txt unavailable <1%
- By purpose: Refresh 86%, Discovery 14%

The 18% 404 share is Googlebot re-testing the retired junk family. No crawl anomaly, no server errors.

### Data-availability limit (stated plainly)

GSC's Page Indexing chart, per-reason trend charts and Crawl Stats all retain only ~90 days — **the earliest day
available today is 2026-05-24**. April and early-May coverage history is gone from the UI and cannot be
recovered from it. Every April-dated claim above therefore rests on repo git history, the "Last crawled" dates
inside the current not-indexed buckets, and the 16-month Performance report — not on a coverage chart.

The 16-month Performance chart does cover the period, and it shows a **gradual glide, not a cliff**: impressions
fall steadily from ~10–12K/day in early March to ~4–5K by mid-May, then run flat. That shape is inconsistent
with a single breaking change on a single date and consistent with Google progressively retiring a long tail.

---

## Recommended next steps (nothing done, nothing changed)

1. **Correct the record in `docs/performance-review-2026-08.md`.** Lines 41–56 imply an indexing collapse.
   Relabel the column as "URLs earning impressions (incl. fragments)" and drop the "worth a separate look at
   what changed" note, or replace it with a pointer to this file. Leaving it as written will keep sending
   people after a phantom.
2. **Fix the 6 invalid Product snippets.** This is the only genuine defect found. It costs rich results on
   `/waste-oil-centrifuge/` and `/industrial-centrifuge/` — both money pages. Real revenue impact, unlike the
   indexing "problem."
3. **Leave the 290 not-indexed URLs alone.** 182 crawled-not-indexed + 48 redirects + 4 stale noindex + 3
   canonical alternates + 1 robots block are all correct outcomes. Do not run "Validate Fix" on them; validation
   on intentional exclusions just churns crawl budget.
4. **Optional, low value: trim the 404 list.** ~52 URLs, mostly `/1000` suffixes and `/thank-you/`, `/test/`.
   A wildcard rule for `*/1000` would tidy the report. Cosmetic — a 404 on a dead URL is the correct answer, and
   `06b6fb8a` already repaired the traffic-backed ones.
5. **Check `wp.dolphincentrifuge.com`.** Googlebot still hits it. If that subdomain is retired, confirming it
   returns nothing indexable closes the last WordPress loose end. One crawl request, so this is housekeeping.
6. **Do not chase the position decline here.** Average position drifting 11.5 → 14.3 is a separate, real issue
   (organic ranking slips on live pages) and `EXEC_REVIEW_8POINT_LOG.md:280` already reached the same verdict:
   on-page work, not migration repair.
