# CODE AEO/GEO Log

Codex maintains this file during the AEO/GEO phase.

Astro Agent must not edit this file.

## Source Of Truth

- Ranking file: `ga4-landing-pages-top160.xlsx`
- Queue columns: `Rank`, `Landing Page`, `Sessions`
- Homepage mapping: `/` -> `src/pages/index.astro`
- Skipped by default: `(not set)`
- Pre-live gate: top 30 highest-traffic real pages only, then go live unless Sanjay explicitly changes the gate.

## Status Legend

- `NOT STARTED`: No Codex handoff issued yet.
- `INSTRUCTIONS ISSUED`: Codex issued Astro-Pass-On-Instructions.
- `ASTRO SHA RECEIVED`: Astro Agent returned a commit SHA.
- `NEEDS FIXES`: Codex audited the SHA and found blockers.
- `PASS`: Codex audited the SHA and approved the page.
- `SKIPPED`: Codex skipped the row with a stated reason.

## Session Log

### 2026-05-12 - Control docs created

- Created AEO/GEO control-doc workflow.
- Canonical ranking file is `ga4-landing-pages-top160.xlsx`.
- `/` is homepage and maps to `src/pages/index.astro`.
- Codex is auditor, dispatcher, queue owner, and log keeper.
- Astro Agent is the only implementation agent.
- Multi-agent mode is forbidden.

### 2026-05-12 - Launch gate clarified

- Sanjay's primary priority remains going live ASAP.
- Pre-live AEO/GEO scope is the first 30 highest-traffic real pages from `ga4-landing-pages-top160.xlsx`.
- After the top 30 pass Codex audit, AEO/GEO should continue on the live site and should not block launch unless Sanjay explicitly changes the gate.

### 2026-05-12 - Astro migration rule cleanup

- Reviewed `.agents/rules/astro-migration.md` before starting Page 1.
- Removed old final-phase grouped-triage and Top 100 batch language that could conflict with the new AEO/GEO one-page-at-a-time flow.
- Added an AEO/GEO metadata note: follow exact Codex pass-on instructions when Codex deliberately assigns updated metadata or schema text.
- Confirmed multi-agent mode is forbidden in the migration checklist.

### 2026-05-12 - Fresh-chat handoff created

- Created root `handoff.md` for future AEO/GEO fresh-chat restarts.
- Fresh chats should read `handoff.md` first, then `CODE_AEO_GEO_LOG.md`, then the AEO/GEO operating and skill docs.
- The reusable starter prompt is stored in `handoff.md`.

### 2026-05-12 - Author trust policy clarified

- Sanjay clarified that author trust should default to background schema, not visible visitor-facing bylines or review lines.
- Updated AEO/GEO control docs and roadmap override language accordingly.
- Future pass-on instructions should require schema-level `Person`/`author` details for Sanjay Prabhu MSME where truthful, including credentials, role, and experience when supported by site identity.
- Do not ask Astro Agent to add visible author bylines, reviewed-by lines, headshots, or author bio blocks unless Sanjay explicitly asks for visible author treatment on that page.
- The already-issued Rank 4 `/waste-oil-centrifuge/` block should be corrected before implementation: replace the visible review-line requirement with schema-only author enrichment.
- Canonical author instruction: Add schema-only author enrichment. Do not add any visible author or reviewed-by text. In Article schema, identify the author as Sanjay Prabhu MSME with truthful background details where supported by site identity: name, role/title, worksFor, description with 40+ years of specialized experience in industrial centrifuge systems, and url.

### 2026-05-12 - Quick link check added to future handoffs

- Sanjay approved adding a lightweight quick link check to every future Astro-Pass-On-Instructions block.
- Updated active AEO/GEO instruction files so future handoffs check internal `href` links in the selected page file only, verify source routes or `public/_redirects`, verify same-page anchors, and fix obvious broken or label/href-mismatched page-local links.
- This is not a full-site crawl and does not require validating every external URL unless visibly malformed.

### 2026-05-13 - Author education credential added as hidden-only schema policy

- Sanjay confirmed the author credential should remain background-only, not visible on visitor-facing page content.
- Future page schema should identify Sanjay Prabhu MSME in hidden schema where truthful. Use `Article.author` when Article schema exists. If there is no Article schema, use `WebPage.author`; do not create Article schema only to carry author data.
- Hidden schema may include `alumniOf` and `hasCredential` details: Master of Science in Mechanical Engineering, University of Arkansas, Fayetteville, Class of 1990.
- Do not add visible degree, school, class year, author, or reviewed-by text unless Sanjay explicitly asks for visible author treatment.

### 2026-05-13 - Auto-continue after PASS rule added

- Sanjay corrected the workflow: after Codex records a commit-pinned PASS, Codex must not wait for Sanjay to ask for the next slug.
- Updated the active AEO/GEO control docs so every PASS response automatically selects the next highest-ranked real top-30 page not marked PASS, inspects the source, logs `INSTRUCTIONS ISSUED`, and includes the next strict Astro-Pass-On-Instructions block in the same reply.
- Stop only for a NEEDS FIXES blocker, top-30 pre-live completion, or Sanjay's explicit pause instruction.

### 2026-05-13 - Retroactive hidden credential pass planned

- Sanjay approved going back surgically for pages already handled before the hidden education credential policy was added.
- Retroactive scope is hidden schema only. Do not alter visible content, images, layout, captions, CTAs, links, or unrelated schema.
- Rank 1 `/` homepage: add hidden Sanjay Prabhu MSME author/credential data to WebPage schema only, because homepage does not need a new Article schema just for author data.
- Rank 3 `/alfa-laval-centrifugal-separator/`: add hidden `alumniOf` and `hasCredential` data to the existing Article author object.
- Rank 4 `/waste-oil-centrifuge/`: include the same hidden credential fields when resolving the pending WHPX-407 link correction.
- Future pages: include the hidden credential fields in the first AEO/GEO handoff.

## Page Queue Notes

Codex appends page entries below as each slug starts.

### 2026-05-12 - Rank 1 homepage - INSTRUCTIONS ISSUED

- Landing page: `/`
- Queue label: `homepage`
- Source file: `src/pages/index.astro`
- GA4 rank: 1
- Sessions: 6368
- Status: `INSTRUCTIONS ISSUED`
- Scope: page-local AEO/GEO pass only
- Allowed implementation file: `src/pages/index.astro`
- Notes: Codex found existing Organization and LocalBusiness schema. First handoff is limited to meta description cleanup, homepage WebPage/WebSite schema, removal of empty `sameAs`, and one factual answer capsule from existing page facts.
- Awaiting: Astro Agent commit SHA for Codex audit.

### 2026-05-12 - Rank 1 homepage - PASS

- Landing page: `/`
- Queue label: `homepage`
- Source file: `src/pages/index.astro`
- GA4 rank: 1
- Sessions: 6368
- Astro Agent commit: `adf9fd2e4d5f12255e703eaeb62a71f1fa6a8f6e`
- Codex audit result: `PASS`
- Verified commit changed only `src/pages/index.astro`.
- Verified BaseLayout meta description was updated.
- Verified Organization `@id`, WebSite schema, WebPage schema, and `dateModified: "2026-05-12"`.
- Verified empty `sameAs: []` was removed.
- Verified the factual homepage answer capsule was added.
- Verified no forbidden Product, HowTo, VideoObject, Dataset, or FAQPage schema was added.
- Verified added lines introduced no em dash or en dash.

### 2026-05-13 - Rank 1 homepage - SUPPLEMENTAL HIDDEN CREDENTIAL INSTRUCTIONS ISSUED

- Landing page: `/`
- Queue label: `homepage`
- Source file: `src/pages/index.astro`
- GA4 rank: 1
- Sessions: 6368
- Status: `INSTRUCTIONS ISSUED`
- Scope: hidden schema-only author credential backfill.
- Allowed implementation file: `src/pages/index.astro`
- Notes: Homepage has WebPage schema but no Article schema. Add hidden Sanjay Prabhu MSME author/credential details to `WebPage.author` only. Do not create Article schema and do not add visible author, degree, school, class year, or reviewed-by text.
- Awaiting: Astro Agent supplemental credential commit SHA for Codex audit.

### 2026-05-13 - Rank 1 homepage - SUPPLEMENTAL CREDENTIAL AND PRODUCT-FAMILIES VISUAL INSTRUCTIONS ISSUED

- Landing page: `/`
- Queue label: `homepage`
- Source file: `src/pages/index.astro`
- GA4 rank: 1
- Sessions: 6368
- Status: `INSTRUCTIONS ISSUED`
- Scope: homepage-local hidden credential plus product-family card visual correction only. This supersedes the prior homepage credential-only supplemental block.
- Allowed implementation file: `src/pages/index.astro`
- Notes: Sanjay flagged the homepage Centrifuge Product Families cards as visually unprofessional because the product images are too small inside oversized gray tiles and text/card heights are jagged. Required fix is square, equal-height, symmetric cards with larger product images, no pale gray image tiles, and aligned text/actions. Also add hidden WebPage author credential schema as already planned.
- Awaiting: Astro Agent supplemental commit SHA for Codex audit.

### 2026-05-13 - Rank 1 homepage - PRODUCT-FAMILIES VISUAL-ONLY INSTRUCTIONS ISSUED

- Landing page: `/`
- Queue label: `homepage`
- Source file: `src/pages/index.astro`
- GA4 rank: 1
- Sessions: 6368
- Status: `INSTRUCTIONS ISSUED`
- Scope: homepage-local visual correction only for the Centrifuge Product Families section. This supersedes the prior combined credential and visual block because the credential-only task is already active separately.
- Allowed implementation file: `src/pages/index.astro`
- Notes: Fix the product-family card layout shown in Sanjay's screenshot: remove pale gray image tiles, enlarge product images, use square image areas, make cards equal height, and align text/actions consistently. Do not touch schema or credentials in this visual-only pass.
- Awaiting: Astro Agent visual-only commit SHA for Codex audit.

### 2026-05-12 - Rank 2 `(not set)` - SKIPPED

- Landing page: `(not set)`
- GA4 rank: 2
- Sessions: 5702
- Status: `SKIPPED`
- Reason: Not a real public landing page. Skipped by default under the AEO/GEO queue rules unless Sanjay explicitly reopens it.

### 2026-05-12 - Rank 3 `/alfa-laval-centrifugal-separator/` - INSTRUCTIONS ISSUED

- Landing page: `/alfa-laval-centrifugal-separator/`
- Queue label: `alfa-laval-centrifugal-separator`
- Source file: `src/pages/alfa-laval-centrifugal-separator.astro`
- GA4 rank: 3
- Sessions: 2893
- Status: `INSTRUCTIONS ISSUED`
- Scope: page-local AEO/GEO pass plus existing page-local breadcrumb, caption, and nomenclature blockers found during source inspection.
- Allowed implementation file: `src/pages/alfa-laval-centrifugal-separator.astro`
- Notes: Codex found missing `dateModified`, no page-level `WebPage` schema, no AEO answer capsule, a Knowledge Center breadcrumb missing explicit `categoryHref`, one visible DMPX phrase, unhyphenated model text in visible/alt/caption fields, and paragraph-style captions under body images.
- Awaiting: Astro Agent commit SHA for Codex audit.

### 2026-05-12 - Rank 3 `/alfa-laval-centrifugal-separator/` - PASS

- Landing page: `/alfa-laval-centrifugal-separator/`
- Queue label: `alfa-laval-centrifugal-separator`
- Source file: `src/pages/alfa-laval-centrifugal-separator.astro`
- GA4 rank: 3
- Sessions: 2893
- Astro Agent commit: `3a6e68f`
- Codex audit result: `PASS`
- Verified commit changed only `src/pages/alfa-laval-centrifugal-separator.astro`.
- Verified `categoryHref="/knowledge-center/"` was added.
- Verified Article schema has `dateModified: "2026-05-12"` and page-level WebPage schema was added.
- Verified no manual BreadcrumbList schema and no forbidden FAQPage, HowTo, Product, VideoObject, Dataset, Offer, or AggregateOffer schema was added.
- Verified the requested AEO answer capsule and visible review line with `<time datetime="2026-05-12">` are present.
- Verified visible DMPX/DMB wording is gone.
- Verified allowed model-name normalization is present and old unhyphenated variants remain only in preserved image filenames.
- Verified 16 body image captions now use `<figure><figcaption>` markup and the old paragraph-caption patterns are gone.
- Verified mojibake marker scan and `git diff --check` were clean for the pinned commit.

### 2026-05-12 - Rank 3 `/alfa-laval-centrifugal-separator/` - SUPPLEMENTAL CORRECTION ISSUED

- Landing page: `/alfa-laval-centrifugal-separator/`
- Queue label: `alfa-laval-centrifugal-separator`
- Source file: `src/pages/alfa-laval-centrifugal-separator.astro`
- GA4 rank: 3
- Sessions: 2893
- Status: `INSTRUCTIONS ISSUED`
- Scope: page-local consistency correction only.
- Allowed implementation file: `src/pages/alfa-laval-centrifugal-separator.astro`
- Notes: Sanjay clarified the AEO/GEO author trust signal should be schema-only. The visible review line added in the AEO answer capsule should be removed, and the Article author object should be enriched with the canonical schema-only Sanjay Prabhu MSME details.
- Awaiting: Astro Agent correction commit SHA for Codex audit.

### 2026-05-12 - Rank 3 `/alfa-laval-centrifugal-separator/` - SUPPLEMENTAL CORRECTION PASS

- Landing page: `/alfa-laval-centrifugal-separator/`
- Queue label: `alfa-laval-centrifugal-separator`
- Source file: `src/pages/alfa-laval-centrifugal-separator.astro`
- GA4 rank: 3
- Sessions: 2893
- Astro Agent commit: `23186e2`
- Codex audit result: `PASS`
- Verified commit changed only `src/pages/alfa-laval-centrifugal-separator.astro`.
- Verified Article author now includes `name`, `jobTitle`, `worksFor.name`, `worksFor.url`, `description`, and `url`.
- Verified the visible AEO capsule review line was removed while the AEO capsule answer text remained unchanged.
- Verified no new visible author or reviewed-by text was added.
- Verified the remaining bottom author byline existed before this correction and was intentionally left unchanged.
- Verified `git diff --check` was clean for the correction commit.

### 2026-05-12 - Rank 4 `/waste-oil-centrifuge/` - INSTRUCTIONS ISSUED

- Landing page: `/waste-oil-centrifuge/`
- Queue label: `waste-oil-centrifuge`
- Source file: `src/pages/waste-oil-centrifuge.astro`
- GA4 rank: 4
- Sessions: 1989
- Status: `INSTRUCTIONS ISSUED`
- Scope: page-local AEO/GEO pass only, with required page-local nomenclature, schema, answer-capsule, review-signal, and body-image caption cleanup.
- Allowed implementation file: `src/pages/waste-oil-centrifuge.astro`
- Notes: Codex found missing Article `dateModified`, no page-level WebPage schema, supported visible process-flow and performance-data opportunities for HowTo and Dataset schema, visible DMPX table language that conflicts with the May 2026 nomenclature reversal, unhyphenated model names, a related-product label/href mismatch, and several body images missing real `<figcaption>` markup.
- Awaiting: Astro Agent commit SHA for Codex audit.

### 2026-05-12 - Rank 4 `/waste-oil-centrifuge/` - CORRECTED INSTRUCTIONS ISSUED

- Landing page: `/waste-oil-centrifuge/`
- Queue label: `waste-oil-centrifuge`
- Source file: `src/pages/waste-oil-centrifuge.astro`
- GA4 rank: 4
- Sessions: 1989
- Status: `INSTRUCTIONS ISSUED`
- Scope: page-local AEO/GEO pass only. This corrected handoff supersedes the prior Rank 4 handoff where it mentioned a visible review signal.
- Allowed implementation file: `src/pages/waste-oil-centrifuge.astro`
- Notes: Required corrections are schema freshness and WebPage schema, schema-only Sanjay Prabhu MSME author enrichment, one factual answer capsule with no visible author/review line, DMPX-to-Alfa Laval visible nomenclature cleanup, one broken pyrolysis internal link fix, body-image figure/figcaption cleanup, and supported HowTo/Dataset schema from existing visible process-flow and performance table content.
- Awaiting: Astro Agent commit SHA for Codex audit.

### 2026-05-12 - Rank 4 `/waste-oil-centrifuge/` - NEEDS FIXES

- Landing page: `/waste-oil-centrifuge/`
- Queue label: `waste-oil-centrifuge`
- Source file: `src/pages/waste-oil-centrifuge.astro`
- GA4 rank: 4
- Sessions: 1989
- Astro Agent commit: `b32a1fa`
- Codex audit result: `NEEDS FIXES`
- Verified commit changed only `src/pages/waste-oil-centrifuge.astro`.
- Verified Article, WebPage, HowTo, and Dataset schema were added as instructed.
- Verified schema-only Sanjay Prabhu MSME author enrichment is present and no visible author/reviewed-by text was added.
- Verified AEO answer capsule text is present, no visible DMPX remnants remain, the broken pyrolysis link was fixed, the listed body images use `<figure><figcaption>`, no VideoObject or manual BreadcrumbList was added, route-level quick link check passes, mojibake marker scan is clean, and `git diff --check` is clean.
- Blocker: the Packaged Systems table labels the middle column `Alfa Laval WHPX-407` but links it to `/alfa-laval-mopx-207-centrifuge/`, whose target page is explicitly an Alfa Laval MOPX-207 page. This is a label/href mismatch under the quick link check.
- Required fix: keep `Alfa Laval WHPX-407` visible, but remove that anchor or point it only to a truthful WHPX-407 route if one is created separately. Do not create a new page in this pass.

### 2026-05-13 - Rank 1 `/` homepage - HIDDEN AUTHOR CREDENTIAL SUPPLEMENT PASS

- Landing page: `/`
- Queue label: `homepage`
- Source file: `src/pages/index.astro`
- GA4 rank: 1
- Sessions: 6368
- Astro Agent commit: `5e38e04`
- Codex audit result: `PASS`
- Verified commit changed only `src/pages/index.astro`.
- Verified the existing homepage `WebPage` schema now has hidden `author` with `name`, `jobTitle`, `worksFor`, `description`, `url`, `alumniOf`, and `hasCredential`.
- Verified no `Article` schema was added for the homepage.
- Verified no visible author, education, degree, class-year, or reviewed-by text was added.
- Verified Organization, LocalBusiness, and WebSite schemas were not changed.
- Verified `git diff --check` and mojibake marker scan were clean for the pinned commit.
- Note: This credential-only pass is separate from the still-open homepage Product Families visual-only card correction.

### 2026-05-13 - Rank 1 `/` homepage - PRODUCT-FAMILIES VISUAL-ONLY NEEDS FIXES

- Landing page: `/`
- Queue label: `homepage`
- Source file: `src/pages/index.astro`
- GA4 rank: 1
- Sessions: 6368
- Astro Agent commit: `9b97c02`
- Codex audit result: `NEEDS FIXES`
- Verified commit changed only `src/pages/index.astro`.
- Verified the Product Families diff is scoped to the requested card layout section.
- Verified four card links stayed unchanged and resolve to existing page routes: `/disc-stack-centrifuge/`, `/decanter-centrifuge/`, `/explosion-proof-centrifuge/`, and `/stainless-steel-centrifuge/`.
- Verified the section's `View All Alfa Laval Centrifuge Models` link resolves to existing page route `/alfa-laval-centrifuge/`.
- Verified four card image files exist and were not renamed.
- Verified no schema, author credentials, metadata, hero, CTA, or other homepage-section edits were introduced in this visual-only commit.
- Blocker: `git diff --check 9b97c02^ 9b97c02 -- src/pages/index.astro` reports trailing whitespace on lines 778, 802, 826, and 850.
- Required fix: remove only the trailing spaces from the four changed image `class="w-[88%] h-[88%] object-contain mx-auto ..."` lines. Do not change layout, copy, schema, links, images, or any other file.

### 2026-05-13 - Rank 1 `/` homepage - PRODUCT-FAMILIES VISUAL-ONLY PASS

- Landing page: `/`
- Queue label: `homepage`
- Source file: `src/pages/index.astro`
- GA4 rank: 1
- Sessions: 6368
- Astro Agent commit: `8e80033`
- Codex audit result: `PASS`
- Verified commit changed only `src/pages/index.astro`.
- Verified the commit only removes trailing whitespace from the four Product Families image `class` lines flagged in the prior audit.
- Verified `git diff --check 8e80033^ 8e80033 -- src/pages/index.astro` is clean.
- Prior visual audit on commit `9b97c02` had already verified section-local scope, unchanged card links, existing target routes, unchanged image files, and no schema/credential/metadata/hero/CTA spillover.
- Result: homepage hidden credential supplement and homepage Product Families visual correction are both closed.

### 2026-05-13 - Rank 3 `/alfa-laval-centrifugal-separator/` - HIDDEN CREDENTIAL AND VISIBLE BYLINE CLEANUP INSTRUCTIONS ISSUED

- Landing page: `/alfa-laval-centrifugal-separator/`
- Queue label: `alfa-laval-centrifugal-separator`
- Source file: `src/pages/alfa-laval-centrifugal-separator.astro`
- GA4 rank: 3
- Sessions: 2893
- Status: `INSTRUCTIONS ISSUED`
- Scope: narrow author-policy catch-up pass for the already-passed Rank 3 page.
- Allowed implementation file: `src/pages/alfa-laval-centrifugal-separator.astro`
- Notes: Add hidden `alumniOf` and `hasCredential` to existing `Article.author`, update hidden `dateModified` values to `2026-05-13`, and remove the remaining old visible bottom author/byline block so the page matches the hidden-only author policy. Do not touch body content, answer capsule, headings, captions, CTAs, images, layout, links, breadcrumbs, or unrelated schema.
- Awaiting: Astro Agent supplemental commit SHA for Codex audit.

### 2026-05-13 - Rank 3 `/alfa-laval-centrifugal-separator/` - HIDDEN CREDENTIAL CLEANUP NEEDS FIXES

- Landing page: `/alfa-laval-centrifugal-separator/`
- Queue label: `alfa-laval-centrifugal-separator`
- Source file: `src/pages/alfa-laval-centrifugal-separator.astro`
- GA4 rank: 3
- Sessions: 2893
- Astro Agent commit: `4b8f85d`
- Codex audit result: `NEEDS FIXES`
- Verified commit changed only `src/pages/alfa-laval-centrifugal-separator.astro`.
- Verified hidden `Article.author.alumniOf` was added.
- Verified hidden `Article.author.hasCredential` was added.
- Verified no `WebPage.author` was added because the page already has `Article.author`.
- Verified both `dateModified` values are `2026-05-13`.
- Verified the old visible bottom author/byline block was removed.
- Verified no visible author, education, degree, class-year, or reviewed-by text remains outside frontmatter.
- Verified page-local internal links resolve and no same-page `href="#..."` anchors exist.
- Verified mojibake marker scan and `git diff --check` are clean for the pinned commit.
- Blocker: the hidden credential object is not aligned with the canonical wording used for the homepage and future pages. It currently has `credentialCategory: "degree"` and `description: "Class of 1990"`.
- Required fix: change only the credential object so `credentialCategory` is `"Master's degree"` and `description` is `"Master of Science in Mechanical Engineering, University of Arkansas, Fayetteville, Class of 1990"`. Do not change anything else.

### 2026-05-13 - Rank 3 `/alfa-laval-centrifugal-separator/` - HIDDEN CREDENTIAL CLEANUP PASS

- Landing page: `/alfa-laval-centrifugal-separator/`
- Queue label: `alfa-laval-centrifugal-separator`
- Source file: `src/pages/alfa-laval-centrifugal-separator.astro`
- GA4 rank: 3
- Sessions: 2893
- Astro Agent commit: `bce0733`
- Codex audit result: `PASS`
- Verified commit changed only `src/pages/alfa-laval-centrifugal-separator.astro`.
- Verified the commit changed only the two hidden `Article.author.hasCredential` values requested.
- Verified `credentialCategory` is now `"Master's degree"`.
- Verified `description` is now `"Master of Science in Mechanical Engineering, University of Arkansas, Fayetteville, Class of 1990"`.
- Verified no visible author, education, degree, class-year, reviewed-by, or bio text was added.
- Verified no `WebPage.author` was added because `Article.author` already exists.
- Verified both `dateModified` values remain `2026-05-13`.
- Verified mojibake marker scan and `git diff --check` are clean for the pinned commit.
- Result: Rank 3 hidden credential catch-up is closed.

### 2026-05-13 - Rank 4 `/waste-oil-centrifuge/` - LINK AND HIDDEN CREDENTIAL CLEANUP INSTRUCTIONS ISSUED

- Landing page: `/waste-oil-centrifuge/`
- Queue label: `waste-oil-centrifuge`
- Source file: `src/pages/waste-oil-centrifuge.astro`
- GA4 rank: 4
- Sessions: 1989
- Status: `INSTRUCTIONS ISSUED`
- Scope: narrow cleanup pass to close the known Rank 4 quick-link blocker and bring hidden author credentials up to the new policy.
- Allowed implementation file: `src/pages/waste-oil-centrifuge.astro`
- Notes: Add hidden `alumniOf` and `hasCredential` to existing `Article.author`, update Article and WebPage `dateModified` values to `2026-05-13`, and ensure the Packaged Systems `Alfa Laval WHPX-407` header is not linked to `/alfa-laval-mopx-207-centrifuge/`. Do not touch body copy, headings, images, captions, CTA, FAQ, HowTo, Dataset, Product schema, layout, components, or global files.
- Awaiting: Astro Agent supplemental commit SHA for Codex audit.

### 2026-05-13 - Rank 4 `/waste-oil-centrifuge/` - LINK AND HIDDEN CREDENTIAL CLEANUP PASS

- Landing page: `/waste-oil-centrifuge/`
- Queue label: `waste-oil-centrifuge`
- Source file: `src/pages/waste-oil-centrifuge.astro`
- GA4 rank: 4
- Sessions: 1989
- Astro Agent commit: `277716b`
- Codex audit result: `PASS`
- Verified commit changed only `src/pages/waste-oil-centrifuge.astro`.
- Verified `Article.author` now includes hidden `alumniOf` and canonical hidden `hasCredential` fields.
- Verified no `WebPage.author` was added because `Article.author` already exists.
- Verified no visible author, education, degree, class-year, reviewed-by, or bio text was added.
- Verified `Article.dateModified` and `WebPage.dateModified` are both `2026-05-13`.
- Verified the Packaged Systems `Alfa Laval WHPX-407` header is plain text and is not linked to `/alfa-laval-mopx-207-centrifuge/`.
- Verified internal page/file hrefs resolve, including the one WebP lightbox href as an existing public asset, and all 16 TOC ids match real element ids.
- Verified mojibake marker scan and `git diff --check` are clean for the pinned commit.
- Result: Rank 4 is closed.

### 2026-05-13 - Rank 5 `/industrial-centrifuge/` - INSTRUCTIONS ISSUED

- Landing page: `/industrial-centrifuge/`
- Queue label: `industrial-centrifuge`
- Source file: `src/pages/industrial-centrifuge.astro`
- GA4 rank: 5
- Sessions: 1892
- Status: `INSTRUCTIONS ISSUED`
- Scope: page-local AEO/GEO pass with schema freshness, hidden author credentials, WebPage schema, answer capsule, known FAQ typo, page-local mojibake cleanup, visible DMPX/nomenclature cleanup, and a small malformed figure fix in the capacity image row.
- Allowed implementation file: `src/pages/industrial-centrifuge.astro`
- Notes: Codex found no WebPage schema, Article schema missing `dateModified` and full author trust fields, schema headline mojibake, visible FAQ typo `a75 dB`, several mojibake markers in comments/visible card text, visible DMPX model text, unhyphenated `WHPX 513`, and malformed figure markup around the two capacity images.
- Awaiting: Astro Agent commit SHA for Codex audit.

### 2026-05-13 - Rank 5 `/industrial-centrifuge/` - PASS

- Landing page: `/industrial-centrifuge/`
- Queue label: `industrial-centrifuge`
- Source file: `src/pages/industrial-centrifuge.astro`
- GA4 rank: 5
- Sessions: 1892
- Astro Agent commit: `22b4792`
- Codex audit result: `PASS`
- Verified commit changed only `src/pages/industrial-centrifuge.astro`.
- Verified mojibake marker scan and `git diff --check` are clean for the pinned commit.
- Verified FAQ typo is corrected to `75 dB`.
- Verified Article schema has aligned headline and description, `datePublished: "2021-03-01"`, `dateModified: "2026-05-13"`, `mainEntityOfPage`, and canonical hidden Sanjay author credential fields.
- Verified WebPage schema was added and included in `jsonLd`, with no `WebPage.author`.
- Verified no visible author, education, degree, class-year, reviewed-by, or bio text was added.
- Verified the exact AEO answer-capsule text is present.
- Verified visible DMPX/DMB text is gone; DMPX remains only in the preserved image filename and preserved href slug.
- Verified `Alfa Laval WHPX-513` is hyphenated in visible/table text.
- Verified the capacity image row now has valid `<figure><figcaption>` structure and balanced responsive grid markup.
- Verified internal hrefs resolve, the cross-page `/waste-oil-centrifuge/#filter-vs-centrifuge` anchor resolves, and all TOC ids match real element ids.
- Verified no new forbidden schema types were added.
- Result: Rank 5 is closed.

### 2026-05-13 - Rank 6 `/wastewater-centrifuge/` - INSTRUCTIONS ISSUED

- Landing page: `/wastewater-centrifuge/`
- Queue label: `wastewater-centrifuge`
- Source file: `src/pages/wastewater-centrifuge.astro`
- GA4 rank: 6
- Sessions: 1821
- Status: `INSTRUCTIONS ISSUED`
- Scope: page-local AEO/GEO pass with Article schema alignment, hidden author credential enrichment, WebPage schema, answer capsule, visible DMPX/nomenclature cleanup, raw Markdown bold cleanup, NX model hyphenation, and the required quick link check.
- Allowed implementation file: `src/pages/wastewater-centrifuge.astro`
- Notes: Codex found Article schema missing `dateModified`, `mainEntityOfPage`, and full hidden author trust fields; no WebPage schema; visible DMPX-028 model text that should become Alfa Laval WHPX-407 while preserving filenames; raw Markdown `**...**` markers in visible HTML; two unhyphenated NX model strings; and related-product descriptions containing literal `&mdash;` text in frontmatter strings.
- Awaiting: Astro Agent commit SHA for Codex audit.

### 2026-05-13 - Rank 6 `/wastewater-centrifuge/` - NEEDS FIXES

- Landing page: `/wastewater-centrifuge/`
- Queue label: `wastewater-centrifuge`
- Source file: `src/pages/wastewater-centrifuge.astro`
- GA4 rank: 6
- Sessions: 1821
- Astro Agent commit: `ef77e8a`
- Codex audit result: `NEEDS FIXES`
- Verified commit changed only `src/pages/wastewater-centrifuge.astro`.
- Verified Article/WebPage schema, AEO capsule, DMPX visible text cleanup, raw Markdown cleanup, NX model hyphenation, frontmatter `&mdash;` cleanup, mojibake scan, and `git diff --check` are otherwise acceptable from the pinned diff.
- Blocking issue: `Article.author.hasCredential` does not match the canonical hidden credential schema. It uses `credentialCategory: "Master of Science in Mechanical Engineering"` and `description: "Class of 1990"` instead of `credentialCategory: "Master's degree"` and the full credential description. It also should include `name: "Master of Science in Mechanical Engineering"` for consistency.
- Awaiting: Astro Agent correction commit SHA for Codex re-audit.

### 2026-05-13 - Rank 6 `/wastewater-centrifuge/` - PASS

- Landing page: `/wastewater-centrifuge/`
- Queue label: `wastewater-centrifuge`
- Source file: `src/pages/wastewater-centrifuge.astro`
- GA4 rank: 6
- Sessions: 1821
- Astro Agent correction commit: `767c828`
- Codex audit result: `PASS`
- Verified correction commit changed only `src/pages/wastewater-centrifuge.astro`.
- Verified `Article.author.hasCredential` now includes canonical `name`, `credentialCategory: "Master's degree"`, `recognizedBy`, and full credential description.
- Verified no visible author, degree, school, class-year, reviewed-by, or bio text appears in the page body.
- Prior Rank 6 checks from `ef77e8a` remain accepted: Article/WebPage schema, AEO capsule, DMPX visible text cleanup, raw Markdown cleanup, NX model hyphenation, frontmatter `&mdash;` cleanup, quick link check, asset check, TOC anchor check, mojibake scan, `git diff --check`, and build reported clean.
- Result: Rank 6 is closed.

### 2026-05-13 - Rank 7 `/decanter-centrifuge/` - INSTRUCTIONS ISSUED

- Landing page: `/decanter-centrifuge/`
- Queue label: `decanter-centrifuge`
- Source file: `src/pages/decanter-centrifuge.astro`
- GA4 rank: 7
- Sessions: 1722
- Status: `INSTRUCTIONS ISSUED`
- Scope: page-local AEO/GEO pass with Article schema alignment, hidden author credential enrichment, WebPage schema, AEO answer capsule, mojibake cleanup, visible model-name hyphenation, and the required quick link check.
- Allowed implementation file: `src/pages/decanter-centrifuge.astro`
- Notes: Codex found Article schema missing `dateModified`, `mainEntityOfPage`, and full hidden author trust fields; no WebPage schema; mojibake in schema strings, related-product descriptions, and decorative comments; visible model text needing hyphenation for NX-314, NX-418, Sharples P-3000, and Sharples P-3400; FAQPage is supported by a visible FAQ component and should be preserved.
- Awaiting: Astro Agent commit SHA for Codex audit.

### 2026-05-13 - Rank 7 `/decanter-centrifuge/` - PASS

- Landing page: `/decanter-centrifuge/`
- Queue label: `decanter-centrifuge`
- Source file: `src/pages/decanter-centrifuge.astro`
- GA4 rank: 7
- Sessions: 1722
- Astro Agent commit inferred from latest page commit: `e1f2b4e`
- Codex audit result: `PASS`
- Verified commit changed only `src/pages/decanter-centrifuge.astro`.
- Verified Article schema has aligned headline and description, preserved `datePublished: "2021-03-01"`, `dateModified: "2026-05-13"`, `mainEntityOfPage`, and canonical hidden Sanjay author credential fields.
- Verified WebPage schema exists and is included in `jsonLd`, with no `WebPage.author`.
- Verified Product and FAQPage schema are preserved and the visible FAQ component remains.
- Verified no visible author, degree, school, class-year, reviewed-by, or bio text was added.
- Verified the exact AEO answer-capsule text is present.
- Verified mojibake marker scan is clean.
- Verified unhyphenated model strings remain only in preserved filenames, while visible text, alt text, and captions use NX-314, NX-418, Sharples P-3000, and Sharples P-3400.
- Verified internal links, same-page TOC ids, and image assets resolve.
- Verified `git diff --check` is clean for the pinned commit.
- Astro Agent reported `npx astro build` passes and Rule #12 post-commit integrity clean.
- Result: Rank 7 is closed.

### 2026-05-13 - Rank 8 `/decanter-centrifuge-differential-speed/` - INSTRUCTIONS ISSUED

- Landing page: `/decanter-centrifuge-differential-speed/`
- Queue label: `decanter-centrifuge-differential-speed`
- Source file: `src/pages/decanter-centrifuge-differential-speed.astro`
- GA4 rank: 8
- Sessions: 1719
- Status: `INSTRUCTIONS ISSUED`
- Scope: page-local AEO/GEO pass with Article schema alignment, hidden author credential enrichment, WebPage schema, AEO answer capsule, Knowledge Center breadcrumb href, small calculator-page text cleanup, em dash fallback cleanup, and the required quick link check.
- Allowed implementation file: `src/pages/decanter-centrifuge-differential-speed.astro`
- Notes: Codex found Article schema missing `dateModified`, `mainEntityOfPage`, and full hidden author trust fields; no WebPage schema; Knowledge Base category missing explicit `/knowledge-center/` href; one visible typo `Gear-Box Ration`; and two em dash fallback strings in calculator error output. Existing links, TOC ids, and image assets checked clean before handoff.
- Awaiting: Astro Agent commit SHA for Codex audit.

### 2026-05-13 - Rank 8 `/decanter-centrifuge-differential-speed/` - NEEDS FIXES

- Landing page: `/decanter-centrifuge-differential-speed/`
- Queue label: `decanter-centrifuge-differential-speed`
- Source file: `src/pages/decanter-centrifuge-differential-speed.astro`
- GA4 rank: 8
- Sessions: 1719
- Codex audit result: `NEEDS FIXES`
- Reason: No new commit SHA exists for the reported work. The target file is still modified in the working tree, while the latest commit touching this page is the old May 4 migration commit `46422c0`.
- Additional blockers found in the working copy: `Article.author.hasCredential` is missing the full canonical credential `description`, and a visible byline paragraph remains near the bottom of the page.
- Awaiting: Astro Agent correction commit SHA for Codex re-audit.

### 2026-05-13 - Rank 8 `/decanter-centrifuge-differential-speed/` - PASS

- Landing page: `/decanter-centrifuge-differential-speed/`
- Queue label: `decanter-centrifuge-differential-speed`
- Source file: `src/pages/decanter-centrifuge-differential-speed.astro`
- GA4 rank: 8
- Sessions: 1719
- Astro Agent correction commit: `a1abe88`
- Codex audit result: `PASS`
- Verified commit changed only `src/pages/decanter-centrifuge-differential-speed.astro`.
- Verified Article schema has aligned headline and description, preserved `datePublished: "2020-09-01"`, `dateModified: "2026-05-13"`, `mainEntityOfPage`, and canonical hidden Sanjay author credential fields.
- Verified WebPage schema exists with `#webpage` `@id` and no `WebPage.author`.
- Verified no visible author, degree, school, class-year, reviewed-by, or bio text remains.
- Verified `categoryHref="/knowledge-center/"`, exact AEO answer capsule, typo fix, calculator fallback hyphens, clean mojibake scan, and clean `git diff --check`.
- Verified internal links, same-page TOC ids, and image assets resolve.
- Verified `npx astro build` passes locally with 156 pages.
- Result: Rank 8 is closed.

### 2026-05-13 - Rank 9 `/disc-stack-centrifuge/` - INSTRUCTIONS ISSUED

- Landing page: `/disc-stack-centrifuge/`
- Queue label: `disc-stack-centrifuge`
- Source file: `src/pages/disc-stack-centrifuge.astro`
- GA4 rank: 9
- Sessions: 1642
- Status: `INSTRUCTIONS ISSUED`
- Scope: page-local AEO/GEO pass with Article schema alignment, hidden author credential enrichment, WebPage schema, AEO answer capsule, visible DMPX cleanup, model-name hyphenation, literal em dash cleanup, and the required quick link check.
- Allowed implementation file: `src/pages/disc-stack-centrifuge.astro`
- Notes: Codex found Article schema missing `dateModified`, `mainEntityOfPage`, and full hidden author trust fields; no WebPage schema; Article headline not aligned to visible title; visible DMPX references in FAQ/related product/image alt/caption; unhyphenated MAB/MOPX/WHPX visible model names; literal em dashes in schema/visible text/alt text; existing Product and FAQPage schema are supported and should be preserved.
- Awaiting: Astro Agent commit SHA for Codex audit.

### 2026-05-13 - Rank 9 `/disc-stack-centrifuge/` - PRE-COMMIT NEEDS FIXES

- Landing page: `/disc-stack-centrifuge/`
- Queue label: `disc-stack-centrifuge`
- Source file: `src/pages/disc-stack-centrifuge.astro`
- GA4 rank: 9
- Sessions: 1642
- Codex pre-commit review result: `NEEDS FIXES`
- The target file is still uncommitted, so Rank 9 cannot be marked PASS.
- Blocking issues in the working copy: `Article.author.hasCredential` is not canonical, missing author `description` and author `url`; one visible em dash remains in the sample-testing CTA sentence; and one DMPX string remains in a preserved image filename, which is allowed but should be reported accurately as filename-only, not "none found".
- Awaiting: Astro Agent correction and commit SHA for Codex audit.

### 2026-05-13 - Rank 9 `/disc-stack-centrifuge/` - PASS

- Landing page: `/disc-stack-centrifuge/`
- Queue label: `disc-stack-centrifuge`
- Source file: `src/pages/disc-stack-centrifuge.astro`
- GA4 rank: 9
- Sessions: 1642
- Astro Agent correction commit: `390ef4e`
- Codex audit result: `PASS`
- Verified commit changed only `src/pages/disc-stack-centrifuge.astro`.
- Verified Article schema has aligned headline and description, preserved `datePublished: "2021-03-01"`, `dateModified: "2026-05-13"`, `mainEntityOfPage`, and canonical hidden Sanjay author credential fields.
- Verified WebPage schema exists with `#webpage` `@id`, is included in `jsonLd`, and has no `WebPage.author`.
- Verified Product and FAQPage schema are preserved.
- Verified no visible author, degree, school, class-year, reviewed-by, or bio text was added.
- Verified exact AEO answer capsule is present.
- Verified visible DMPX references were removed; DMPX remains only in preserved filename and preserved URL slug where applicable.
- Verified model names are hyphenated in visible text, alt text, and captions.
- Verified em dash cleanup, clean mojibake scan, and clean `git diff --check`.
- Verified internal links, same-page TOC ids, and image assets resolve.
- Verified `npx astro build` passes locally with 156 pages.
- Result: Rank 9 is closed.

### 2026-05-13 - Rank 10 `/alfa-laval-centrifuge/` - INSTRUCTIONS ISSUED

- Landing page: `/alfa-laval-centrifuge/`
- Queue label: `alfa-laval-centrifuge`
- Source file: `src/pages/alfa-laval-centrifuge.astro`
- GA4 rank: 10
- Sessions: 1585
- Status: `INSTRUCTIONS ISSUED`
- Scope: page-local AEO/GEO pass with Product schema preservation, WebPage schema with hidden author credentials, AEO answer capsule, visible byline removal, DMPX label cleanup, model-name hyphenation, one broken related-application link fix, literal em dash cleanup, and the required quick link check.
- Allowed implementation file: `src/pages/alfa-laval-centrifuge.astro`
- Notes: Codex found no Article schema on this product-family page; preserve the existing Product schema and do not add Article. Add hidden author only to WebPage schema. Remove the visible bottom byline. Precheck found `/marine-diesel-centrifuge/` missing as a route; use the existing `/diesel-centrifuge/` route instead. Existing same-page TOC ids and image assets checked clean before handoff.
- Awaiting: Astro Agent commit SHA for Codex audit.

### 2026-05-13 - Rank 10 `/alfa-laval-centrifuge/` - PRE-COMMIT NEEDS FIXES

- Landing page: `/alfa-laval-centrifuge/`
- Queue label: `alfa-laval-centrifuge`
- Source file: `src/pages/alfa-laval-centrifuge.astro`
- GA4 rank: 10
- Sessions: 1585
- Codex pre-commit review result: `NEEDS FIXES`
- The target file is still uncommitted, so Rank 10 cannot be marked PASS.
- Blocking issues in the working copy: `WebPage.author.hasCredential.description` is not the canonical wording, and six table dimension rows still contain mojibake `Ã—` characters.
- Verified during pre-commit review: Product schema preserved, no Article schema added, hidden author is on WebPage, no visible author/byline text remains, AEO capsule present, DMPX labels cleaned while URL slugs preserved, broken diesel link fixed, internal links clean, TOC ids clean, image assets clean, and `git diff --check` clean for the target file.
- Awaiting: Astro Agent correction and commit SHA for Codex audit.

### 2026-05-13 - Rank 10 `/alfa-laval-centrifuge/` - PRE-COMMIT CLEAN

- Landing page: `/alfa-laval-centrifuge/`
- Queue label: `alfa-laval-centrifuge`
- Source file: `src/pages/alfa-laval-centrifuge.astro`
- GA4 rank: 10
- Sessions: 1585
- Codex pre-commit review result: `CLEAN`
- Verified correction: `WebPage.author.hasCredential.description` now uses the canonical wording exactly.
- Verified correction: mojibake scan is clean for corrupted dimension separators and known marker characters.
- Verified Product schema preserved, WebPage schema added with hidden author credentials, no Article schema added, visible byline removed, AEO capsule present, DMPX only in preserved URL slugs, broken diesel link fixed, internal links clean, TOC ids clean, image assets clean, and `git diff --check` clean for the target file.
- Verified `npx astro build` passes locally with 156 pages.
- Awaiting: Astro Agent commit SHA for final Codex audit and Rank 10 closure.

### 2026-05-13 - Rank 10 `/alfa-laval-centrifuge/` - PASS

- Landing page: `/alfa-laval-centrifuge/`
- Queue label: `alfa-laval-centrifuge`
- Source file: `src/pages/alfa-laval-centrifuge.astro`
- GA4 rank: 10
- Sessions: 1585
- Astro Agent commit: `e9ac2c0`
- Codex audit result: `PASS`
- Verified commit changed only `src/pages/alfa-laval-centrifuge.astro`.
- Verified Product schema is preserved.
- Verified WebPage schema exists with `#webpage` `@id`, hidden Sanjay author credential fields, and no Article schema added.
- Verified no visible author, degree, school, class-year, reviewed-by, or bio text remains.
- Verified exact AEO answer capsule is present.
- Verified visible DMPX labels were removed while preserved DMPX URL slugs remain.
- Verified broken `/marine-diesel-centrifuge/` link was replaced with `/diesel-centrifuge/`.
- Verified canonical credential wording, clean mojibake scan, clean `git diff --check`, target file clean in working tree, and `npx astro build` passes locally with 156 pages.
- Result: Rank 10 is closed.

### 2026-05-13 - Rank 11 `/alfa-laval-centrifuge-parts/` - INSTRUCTIONS ISSUED

- Landing page: `/alfa-laval-centrifuge-parts/`
- Queue label: `alfa-laval-centrifuge-parts`
- Source file: `src/pages/alfa-laval-centrifuge-parts.astro`
- GA4 rank: 11
- Sessions: 1503
- Status: `INSTRUCTIONS ISSUED`
- Scope: page-local AEO/GEO pass with Product schema preservation, WebPage schema with hidden author credentials, AEO answer capsule, RFQ mojibake cleanup, one explicit model-example hyphenation, and the required quick link check.
- Allowed implementation file: `src/pages/alfa-laval-centrifuge-parts.astro`
- Notes: Codex found no Article schema and no WebPage schema; preserve existing Product schema and do not add Article. Add hidden author only to WebPage schema. Existing internal links, TOC ids, and image assets checked clean before handoff. Do not rewrite the Alfa Laval model coverage tables into full hyphenated model names; only fix explicit combined model text such as `MAB104`.
- Awaiting: Astro Agent commit SHA for Codex audit.

### 2026-05-13 - Rank 11 `/alfa-laval-centrifuge-parts/` - NEEDS FIXES

- Landing page: `/alfa-laval-centrifuge-parts/`
- Queue label: `alfa-laval-centrifuge-parts`
- Source file: `src/pages/alfa-laval-centrifuge-parts.astro`
- GA4 rank: 11
- Sessions: 1503
- Astro Agent commit: `a5d4221`
- Codex audit result: `NEEDS FIXES`
- Verified commit changed only `src/pages/alfa-laval-centrifuge-parts.astro`.
- Passing items: Product schema preserved, WebPage schema added, no Article schema added, no visible author/byline text, AEO capsule present, RFQ mojibake fixed, `MAB-104` example fixed, target file clean in working tree, `git diff --check` clean, and `npx astro build` passes locally with 156 pages.
- Blocking issue: hidden `WebPage.author.hasCredential` is not canonical. It uses `credentialCategory: "Master of Science in Mechanical Engineering"`, lacks the required credential `description`, and uses incomplete University of Arkansas fields.
- Awaiting: Astro Agent correction commit SHA for Codex re-audit.

### 2026-05-13 - Rank 11 `/alfa-laval-centrifuge-parts/` - PASS

- Landing page: `/alfa-laval-centrifuge-parts/`
- Queue label: `alfa-laval-centrifuge-parts`
- Source file: `src/pages/alfa-laval-centrifuge-parts.astro`
- GA4 rank: 11
- Sessions: 1503
- Astro Agent correction commit: `cade832`
- Codex audit result: `PASS`
- Verified correction commit changed only `src/pages/alfa-laval-centrifuge-parts.astro`.
- Verified Product schema preserved, WebPage schema present with hidden Sanjay author credential fields, and no Article schema added.
- Verified canonical `alumniOf` and `hasCredential` fields, including credential category `Master's degree` and credential description with Class of 1990.
- Verified no visible author, degree, school, class-year, reviewed-by, or bio text was added.
- Verified exact AEO answer capsule is present, RFQ mojibake fixed, explicit `MAB-104` example fixed, and mojibake marker scan clean.
- Verified `git diff --check` clean, target file clean in working tree, and `npx astro build` passes locally with 156 pages.
- Result: Rank 11 is closed.

### 2026-05-13 - Rank 12 `/disc-centrifuge-parts-glossary/` - INSTRUCTIONS ISSUED

- Landing page: `/disc-centrifuge-parts-glossary/`
- Queue label: `disc-centrifuge-parts-glossary`
- Source file: `src/pages/disc-centrifuge-parts-glossary.astro`
- GA4 rank: 12
- Sessions: 1073
- Status: `INSTRUCTIONS ISSUED`
- Scope: page-local AEO/GEO pass with Article schema alignment, hidden author credential enrichment, WebPage schema, AEO answer capsule, Knowledge Center category href, visible DMPX label cleanup, one encoded dash cleanup, and the required quick link check.
- Allowed implementation file: `src/pages/disc-centrifuge-parts-glossary.astro`
- Notes: Codex found Article schema missing `dateModified` and full hidden author trust fields; no standalone WebPage schema; no `categoryHref`; visible DMPX related-product labels; and one `&ndash;` encoded dash in body copy. Existing internal links, same-page TOC ids, and image assets checked clean before handoff.
- Awaiting: Astro Agent commit SHA for Codex audit.

### 2026-05-13 - Rank 12 `/disc-centrifuge-parts-glossary/` - PASS

- Landing page: `/disc-centrifuge-parts-glossary/`
- Queue label: `disc-centrifuge-parts-glossary`
- Source file: `src/pages/disc-centrifuge-parts-glossary.astro`
- GA4 rank: 12
- Sessions: 1073
- Astro Agent commit: `3f208bc`
- Codex audit result: `PASS`
- Verified commit changed only `src/pages/disc-centrifuge-parts-glossary.astro`.
- Verified Article schema preserved, aligned, and enriched with hidden Sanjay author credential fields.
- Verified WebPage schema exists with `#webpage` `@id` and no WebPage author.
- Verified no visible author, degree, school, class-year, reviewed-by, or bio text was added.
- Verified `categoryHref="/knowledge-center/"`, exact AEO answer capsule, visible DMPX label cleanup, preserved DMPX URL slugs, and encoded dash cleanup.
- Verified no forbidden schema types were added, `git diff --check` is clean, target file is clean in working tree, and `npx astro build` passes locally with 156 pages.
- Result: Rank 12 is closed.

### 2026-05-13 - Rank 13 `/diesel-centrifuge/` - INSTRUCTIONS ISSUED

- Landing page: `/diesel-centrifuge/`
- Queue label: `diesel-centrifuge`
- Source file: `src/pages/diesel-centrifuge.astro`
- GA4 rank: 13
- Sessions: 1065
- Status: `INSTRUCTIONS ISSUED`
- Scope: page-local AEO/GEO pass with Product schema preservation, Article schema enrichment, WebPage schema, AEO answer capsule, Applications category href, DMPX/DMB visible label cleanup, one broken related-product link fix, model-name hyphenation, and the required quick link check.
- Allowed implementation file: `src/pages/diesel-centrifuge.astro`
- Notes: Codex found Product and Article schema but no WebPage schema; Article author lacks full hidden trust fields; no `dateModified`; no `mainEntityOfPage`; no `categoryHref`; broken internal href `/centrifuges/dmpx-014/`; visible DMPX/DMB labels and alt/caption text; unhyphenated MOPX/MAB model names in specs. Existing same-page TOC ids and image assets checked clean before handoff.
- Awaiting: Astro Agent commit SHA for Codex audit.

### 2026-05-13 - Rank 13 `/diesel-centrifuge/` - PASS

- Landing page: `/diesel-centrifuge/`
- Queue label: `diesel-centrifuge`
- Source file: `src/pages/diesel-centrifuge.astro`
- GA4 rank: 13
- Sessions: 1065
- Astro Agent commit: `719995b`
- Codex audit result: `PASS`
- Verified commit changed only `src/pages/diesel-centrifuge.astro`.
- Verified Product schema preserved, Article schema enriched with hidden Sanjay author credential fields, and WebPage schema added with `#webpage` `@id`.
- Verified no WebPage.author, no visible author/degree/school/class-year/reviewed-by text, `categoryHref="/applications/"`, exact AEO answer capsule, and preserved page-local style block.
- Verified `/centrifuges/dmpx-014/` was replaced with `/alfa-laval-whpx-405/`, visible DMPX/DMB labels were cleaned, model names were hyphenated in visible text/alt/caption fields, and preserved legacy strings remain only in image filenames or URL slugs where allowed.
- Verified page-local quick link check: internal hrefs resolve either to source routes or `public/_redirects`; `/diesel-fuel-purifier/` is covered by an existing redirect to `/alfa-laval-diesel-centrifuge/`, and that target route exists.
- Verified same-page TOC ids and image assets resolve, mojibake marker scan is clean, `git diff --check` is clean, and the target file matches commit `719995b` in the working tree.
- Astro Agent reported `npx astro build` passes with 156 pages and Rule #12 post-commit integrity clean.
- Result: Rank 13 is closed.

### 2026-05-13 - Rank 14 `/centrifugal-filter/` - INSTRUCTIONS ISSUED

- Landing page: `/centrifugal-filter/`
- Queue label: `centrifugal-filter`
- Source file: `src/pages/centrifugal-filter.astro`
- GA4 rank: 14
- Sessions: 1049
- Status: `INSTRUCTIONS ISSUED`
- Scope: page-local AEO/GEO pass with Article schema alignment, hidden author credential enrichment, WebPage schema, AEO answer capsule, Knowledge Center category href, visible bottom byline removal, visible DMPX related-product label cleanup, small obvious typo/factual cleanup, and the required quick link check.
- Allowed implementation file: `src/pages/centrifugal-filter.astro`
- Notes: Codex found Article schema but no WebPage schema; Article author lacks full hidden trust fields; no `dateModified`; no `mainEntityOfPage`; no `categoryHref`; a visible bottom author byline; visible DMPX related-product labels; and obvious visible wording errors (`gravitational force`, `Standards filters`, `flood products`, `nigh centrifugal force`). Existing internal links, same-page TOC ids, and image assets checked clean before handoff.
- Awaiting: Astro Agent commit SHA for Codex audit.

### 2026-05-13 - Rank 14 `/centrifugal-filter/` - PASS

- Landing page: `/centrifugal-filter/`
- Queue label: `centrifugal-filter`
- Source file: `src/pages/centrifugal-filter.astro`
- GA4 rank: 14
- Sessions: 1049
- Astro Agent commit: `f95be76`
- Codex audit result: `PASS`
- Verified commit changed only `src/pages/centrifugal-filter.astro`.
- Verified Article schema headline and description align to page metadata, `datePublished: "2020-12-01"` was preserved, `dateModified: "2026-05-13"` and `mainEntityOfPage` were added, and hidden Sanjay author credential fields are canonical.
- Verified WebPage schema exists with `#webpage` `@id`, is included in `jsonLd`, and has no `WebPage.author`.
- Verified no visible author, degree, school, class-year, reviewed-by, or bio text remains.
- Verified `categoryHref="/knowledge-center/"`, exact AEO answer capsule, visible DMPX related-product label cleanup, and the four assigned wording fixes.
- Verified no forbidden FAQPage, HowTo, Product, Dataset, VideoObject, or manual BreadcrumbList schema was added.
- Verified internal links, same-page TOC ids, and 5 image assets resolve; mojibake marker scan and `git diff --check` are clean; target file matches commit `f95be76` in the working tree.
- Verified `npx astro build` passes locally with 156 pages.
- Result: Rank 14 is closed.

### 2026-05-13 - Rank 15 `/disc-centrifuge-purifier-clarifier-difference/` - INSTRUCTIONS ISSUED

- Landing page: `/disc-centrifuge-purifier-clarifier-difference/`
- Queue label: `disc-centrifuge-purifier-clarifier-difference`
- Source file: `src/pages/disc-centrifuge-purifier-clarifier-difference.astro`
- GA4 rank: 15
- Sessions: 988
- Status: `INSTRUCTIONS ISSUED`
- Scope: page-local AEO/GEO pass with Article schema alignment, hidden author credential enrichment, WebPage schema, AEO answer capsule, Knowledge Center category href, visible bottom byline removal, visible DMPX related-product label cleanup, one WSPX hyphenation fix, and the required quick link check.
- Allowed implementation file: `src/pages/disc-centrifuge-purifier-clarifier-difference.astro`
- Notes: Codex found Article schema but no WebPage schema; Article author lacks full hidden trust fields; no `dateModified`; no `mainEntityOfPage`; no `categoryHref`; a visible bottom byline; visible DMPX related-product labels; and unhyphenated `Alfa Laval WSPX 303` in the concentrator capacity table. Existing internal links, cross-page glossary anchors, same-page TOC ids, and image assets checked clean before handoff.
- Awaiting: Astro Agent commit SHA for Codex audit.

### 2026-05-13 - Rank 15 `/disc-centrifuge-purifier-clarifier-difference/` - PASS

- Landing page: `/disc-centrifuge-purifier-clarifier-difference/`
- Queue label: `disc-centrifuge-purifier-clarifier-difference`
- Source file: `src/pages/disc-centrifuge-purifier-clarifier-difference.astro`
- GA4 rank: 15
- Sessions: 988
- Astro Agent commit: `caacbd3e64465da95e326fb13b0c538f1654a7ce`
- Codex audit result: `PASS`
- Verified commit changed only `src/pages/disc-centrifuge-purifier-clarifier-difference.astro`.
- Verified Article schema has aligned headline and description, preserved `datePublished: "2021-01-01"`, `dateModified: "2026-05-13"`, `mainEntityOfPage` with `#webpage`, and canonical hidden Sanjay author credential fields.
- Verified WebPage schema exists as the second jsonLd entry, has `#webpage` `@id`, and has no `WebPage.author`.
- Verified no visible author, degree, school, class-year, reviewed-by, or bio text remains.
- Verified `categoryHref="/knowledge-center/"`, exact AEO answer capsule, visible DMPX related-product label cleanup with hrefs preserved, and `Alfa Laval WSPX-303` hyphenation.
- Verified no forbidden FAQPage, HowTo, Product, Dataset, VideoObject, or manual BreadcrumbList schema was added.
- Verified internal links, same-page TOC ids, cross-page glossary anchors, and 3 image assets resolve; mojibake marker scan and `git diff --check` are clean; target file matches commit `caacbd3e64465da95e326fb13b0c538f1654a7ce` in the working tree.
- Verified `npx astro build` passes locally with 156 pages.
- Result: Rank 15 is closed.

### 2026-05-13 - Rank 16 `/oil-centrifuge/` - INSTRUCTIONS ISSUED

- Landing page: `/oil-centrifuge/`
- Queue label: `oil-centrifuge`
- Source file: `src/pages/oil-centrifuge.astro`
- GA4 rank: 16
- Sessions: 980
- Status: `INSTRUCTIONS ISSUED`
- Scope: page-local AEO/GEO pass with Product schema preservation, Article schema enrichment, WebPage schema, AEO answer capsule replacement, Applications category href, and the required quick link check.
- Allowed implementation file: `src/pages/oil-centrifuge.astro`
- Notes: Codex found existing Product and Article schema but no WebPage schema; Article author lacks full hidden trust fields; no `dateModified`; `mainEntityOfPage` should use the `#webpage` id; no `categoryHref`; existing summary capsule can be tightened rather than duplicated. Existing internal links, the `/disc-stack-centrifuge/#maintenance-costs` cross-page anchor, same-page TOC ids, and image assets checked clean before handoff.
- Awaiting: Astro Agent commit SHA for Codex audit.

### 2026-05-13 - Rank 16 `/oil-centrifuge/` - PASS

- Landing page: `/oil-centrifuge/`
- Queue label: `oil-centrifuge`
- Source file: `src/pages/oil-centrifuge.astro`
- GA4 rank: 16
- Sessions: 980
- Astro Agent commit: `264a4ec`
- Codex audit result: `PASS`
- Verified commit changed only `src/pages/oil-centrifuge.astro`.
- Verified Product schema remained present and unchanged in purpose, Article schema has aligned headline and description, no `datePublished` was invented, `dateModified: "2026-05-13"` was added, and `mainEntityOfPage` points to `#webpage`.
- Verified Article author has canonical hidden Sanjay author credential fields.
- Verified WebPage schema exists with `#webpage` `@id`, is included in `jsonLd`, and has no `WebPage.author`.
- Verified no visible author, degree, school, class-year, reviewed-by, or bio text was added.
- Verified `categoryHref="/applications/"`, exact AEO capsule replacement in the existing summary block, no duplicate old capsule, and no forbidden FAQPage, HowTo, Dataset, VideoObject, BreadcrumbList, or AggregateOffer schema was added.
- Verified internal links, same-page TOC ids, `/disc-stack-centrifuge/#maintenance-costs`, and 3 image assets resolve; mojibake marker scan and `git diff --check` are clean; target file matches commit `264a4ec` in the working tree.
- Verified `npx astro build` passes locally with 156 pages.
- Result: Rank 16 is closed.

### 2026-05-13 - Rank 17 `/decanter-centrifuge-optimization/` - INSTRUCTIONS ISSUED

- Landing page: `/decanter-centrifuge-optimization/`
- Queue label: `decanter-centrifuge-optimization`
- Source file: `src/pages/decanter-centrifuge-optimization.astro`
- GA4 rank: 17
- Sessions: 864
- Status: `INSTRUCTIONS ISSUED`
- Scope: page-local AEO/GEO pass with Article schema enrichment, WebPage schema, AEO answer capsule replacement in the existing summary block, Knowledge Center category href, visible bottom byline removal, one factual shallow-pond line fix, and the required quick link check.
- Allowed implementation file: `src/pages/decanter-centrifuge-optimization.astro`
- Notes: Codex found Article schema but no WebPage schema; Article author lacks full hidden trust fields and worksFor URL; `dateModified` is stale; no `mainEntityOfPage`; no `categoryHref`; a visible bottom byline; and the Shallow Pond summary line incorrectly says `a deeper pond leads to`. Existing internal links, same-page TOC ids, and image assets checked clean before handoff.
- Awaiting: Astro Agent commit SHA for Codex audit.

### 2026-05-13 - Rank 17 `/decanter-centrifuge-optimization/` - PASS

- Landing page: `/decanter-centrifuge-optimization/`
- Queue label: `decanter-centrifuge-optimization`
- Source file: `src/pages/decanter-centrifuge-optimization.astro`
- GA4 rank: 17
- Sessions: 864
- Astro Agent commit: `eac5d23faa588a0ccdc9a4c1df2fd681fa1c2d02`
- Codex audit result: `PASS`
- Verified commit changed only `src/pages/decanter-centrifuge-optimization.astro`.
- Verified Article schema has aligned headline and description, preserved `datePublished: "2021-02-01"`, `dateModified: "2026-05-13"`, `mainEntityOfPage` with `#webpage`, and canonical hidden Sanjay author credential fields.
- Verified WebPage schema exists with `#webpage` `@id`, is included in `jsonLd`, and has no `WebPage.author`.
- Verified `categoryHref="/knowledge-center/"`, exact visible AEO capsule text in the existing summary box, no duplicate capsule, visible bottom byline removed, and the Shallow Pond summary line corrected while the Deep Pond summary line stayed intact.
- Verified no forbidden FAQPage, HowTo, Product, Dataset, VideoObject, BreadcrumbList, Offer, or AggregateOffer schema was added.
- Verified internal links, same-page TOC ids, and 9 image assets resolve; mojibake marker scan and `git diff --check` are clean; target file matches commit `eac5d23faa588a0ccdc9a4c1df2fd681fa1c2d02` in the working tree.
- Verified `npx astro build` passes from a temporary archive of the exact commit with 156 pages.
- Result: Rank 17 is closed.

### 2026-05-13 - Rank 18 `/crude-oil-centrifuge/` - INSTRUCTIONS ISSUED

- Landing page: `/crude-oil-centrifuge/`
- Queue label: `crude-oil-centrifuge`
- Source file: `src/pages/crude-oil-centrifuge.astro`
- GA4 rank: 18
- Sessions: 825
- Status: `INSTRUCTIONS ISSUED`
- Scope: page-local AEO/GEO pass with Product schema preservation, Article schema enrichment, WebPage schema, narrow HowTo schema from the existing visible ORS process list, AEO answer capsule, Applications category href correction, visible DMPX caption/alt cleanup, model-name hyphenation, two visible typo fixes, and the required quick link check.
- Allowed implementation file: `src/pages/crude-oil-centrifuge.astro`
- Notes: Codex found existing Product and Article schema but no WebPage schema; Article lacks `dateModified`, `mainEntityOfPage`, and full hidden author credentials; `categoryHref` points to a disc-stack application page instead of the Applications category; one visible DMPX-042 alt/caption conflicts with the WHPX-first public nomenclature policy; visible module model labels use unhyphenated model names; the ORS 3-step list supports narrow HowTo schema; and two visible typos are present (`Reduced OIl Losses`, `BS%W`). Existing internal links, same-page TOC ids, and image assets checked clean before handoff.
- Awaiting: Astro Agent commit SHA for Codex audit.

### 2026-05-13 - Rank 18 `/crude-oil-centrifuge/` - PASS

- Landing page: `/crude-oil-centrifuge/`
- Queue label: `crude-oil-centrifuge`
- Source file: `src/pages/crude-oil-centrifuge.astro`
- GA4 rank: 18
- Sessions: 825
- Astro Agent commit: `f83b057d6282dc5813c8fa021fae8aef1928055e`
- Codex audit result: `PASS`
- Verified commit changed only `src/pages/crude-oil-centrifuge.astro`.
- Verified Product and Offer schema were preserved.
- Verified Article schema has URL, `dateModified: "2026-05-13"`, `mainEntityOfPage` with `#webpage`, and canonical hidden Sanjay author credential fields, with no invented `datePublished`.
- Verified WebPage schema exists with `#webpage` `@id`, is included in `jsonLd`, and has no `WebPage.author`.
- Verified HowTo schema matches only the existing visible ORS 3-step process.
- Verified exact visible AEO capsule renders once, `categoryHref="/applications/"`, assigned DMPX-042 visible alt/caption cleanup, assigned model-name hyphenation, and the two visible typo fixes.
- Verified no visible author, degree, school, class-year, reviewed-by, author bio, or headshot text was added.
- Verified no forbidden FAQPage, VideoObject, Dataset, BreadcrumbList, AggregateOffer, or extra Product schema was added.
- Verified internal links, same-page TOC ids, and 8 image assets resolve; mojibake marker scan and `git diff --check` are clean; target file matches commit `f83b057d6282dc5813c8fa021fae8aef1928055e` in the working tree.
- Verified `npx astro build` passes from a temporary archive of the exact commit with 156 pages.
- Result: Rank 18 is closed.

### 2026-05-13 - Rank 19 `/lube-oil-centrifuge/` - INSTRUCTIONS ISSUED

- Landing page: `/lube-oil-centrifuge/`
- Queue label: `lube-oil-centrifuge`
- Source file: `src/pages/lube-oil-centrifuge.astro`
- GA4 rank: 19
- Sessions: 769
- Status: `INSTRUCTIONS ISSUED`
- Scope: page-local AEO/GEO pass with Product and FAQPage schema preservation, Article schema enrichment, WebPage schema, AEO answer capsule replacement in the existing top callout, Applications category href, visible model-name hyphenation, one mapped visible DMPX related-product label cleanup, small obvious typo fixes, and the required quick link check.
- Allowed implementation file: `src/pages/lube-oil-centrifuge.astro`
- Notes: Codex found existing Product, Article, and rendered FAQ/FAQPage schema; Article lacks `dateModified`, `mainEntityOfPage`, and full hidden author credentials; no WebPage schema; no `categoryHref`; existing top callout can be tightened rather than duplicated; visible MAB/MOPX model names use space formatting; visible DMPX-042 related-product label should map to WHPX-410 while preserving the URL slug; and obvious typos include `chemically boned`, `Trubine`, `1.5 Ggal`, and `3' x 4' 4' (H)`. Existing internal links and image assets checked clean; the `faq` TOC id is rendered by `FAQ.astro`.
- Awaiting: Astro Agent commit SHA for Codex audit.

### 2026-05-13 - Rank 19 `/lube-oil-centrifuge/` - PASS

- Landing page: `/lube-oil-centrifuge/`
- Queue label: `lube-oil-centrifuge`
- Source file: `src/pages/lube-oil-centrifuge.astro`
- GA4 rank: 19
- Sessions: 769
- Astro Agent commit: `4a3aa87eb32ba833ac3622f127d11ef1c10a1eea`
- Codex audit result: `PASS`
- Verified commit changed only `src/pages/lube-oil-centrifuge.astro`.
- Verified Product and Offer schema were preserved.
- Verified rendered FAQ and FAQPage schema remain present with the same five FAQ items.
- Verified Article schema has URL, `dateModified: "2026-05-13"`, `mainEntityOfPage` with `#webpage`, and canonical hidden Sanjay author credential fields, with no invented `datePublished`.
- Verified WebPage schema exists with `#webpage` `@id`, is included in `jsonLd`, and has no `WebPage.author`.
- Verified exact visible AEO capsule renders once, `categoryHref="/applications/"`, assigned model-name hyphenation, assigned DMPX-042 related-product label cleanup with href preserved, and the four visible typo fixes.
- Verified no visible author, degree, school, class-year, reviewed-by, author bio, or headshot text was added.
- Verified no forbidden HowTo, VideoObject, Dataset, BreadcrumbList, AggregateOffer, or extra Product schema was added.
- Verified internal links, same-page TOC ids including the FAQ component id, and 7 image assets resolve; mojibake marker scan and `git diff --check` are clean; target file matches commit `4a3aa87eb32ba833ac3622f127d11ef1c10a1eea` in the working tree.
- Verified `npx astro build` passes from a temporary archive of the exact commit with 156 pages.
- Result: Rank 19 is closed.

### 2026-05-13 - Rank 20 `/disc-centrifuge-troubleshoot-bowl/` - INSTRUCTIONS ISSUED

- Landing page: `/disc-centrifuge-troubleshoot-bowl/`
- Queue label: `disc-centrifuge-troubleshoot-bowl`
- Source file: `src/pages/disc-centrifuge-troubleshoot-bowl.astro`
- GA4 rank: 20
- Sessions: 740
- Status: `INSTRUCTIONS ISSUED`
- Scope: page-local AEO/GEO pass with Article schema enrichment, WebPage schema, AEO answer capsule replacement in the existing top summary block, Knowledge Center category href, visible bottom byline removal, body-image figure/figcaption markup for existing caption text, and the required quick link check.
- Allowed implementation file: `src/pages/disc-centrifuge-troubleshoot-bowl.astro`
- Notes: Codex found Article schema but no WebPage schema; Article author lacks full hidden trust fields and worksFor URL; `dateModified` is stale; `mainEntityOfPage` should point to the `#webpage` id; no `categoryHref`; an existing top AI Summary block can be tightened rather than duplicated; a visible bottom byline should be removed; and three body images use nearby paragraph captions instead of real `<figure><figcaption>` markup. Existing internal links, same-page TOC ids, and image assets checked clean before handoff.
- Awaiting: Astro Agent commit SHA for Codex audit.

### 2026-05-13 - Rank 20 `/disc-centrifuge-troubleshoot-bowl/` - PASS

- Landing page: `/disc-centrifuge-troubleshoot-bowl/`
- Queue label: `disc-centrifuge-troubleshoot-bowl`
- Source file: `src/pages/disc-centrifuge-troubleshoot-bowl.astro`
- GA4 rank: 20
- Sessions: 740
- Astro Agent commit: `81e6c651d7c2669f04ce2a7d886546a4e3e20075`
- Codex audit result: `PASS`
- Verified commit changed only `src/pages/disc-centrifuge-troubleshoot-bowl.astro`.
- Verified Article schema has aligned headline and description, preserved `datePublished: "2021-01-01"`, `dateModified: "2026-05-13"`, `mainEntityOfPage` with `#webpage`, and canonical hidden Sanjay author credential fields.
- Verified WebPage schema exists with `#webpage` `@id`, is included in `jsonLd`, and has no `WebPage.author`.
- Verified exact visible AEO capsule renders once, `summary-takeaway` is present in the TOC, `categoryHref="/knowledge-center/"`, visible bottom byline removed, and the old AI Summary wording removed.
- Verified the three body images now use real `<figure><figcaption>` markup while preserving image source, size, alt, and caption text.
- Verified no forbidden FAQPage, HowTo, Product, Dataset, VideoObject, BreadcrumbList, Offer, or AggregateOffer schema was added.
- Verified internal links, same-page TOC ids, and 3 image assets resolve; mojibake marker scan and `git diff --check` are clean.
- Verified `npx astro build` passes from a temporary archive of the exact commit with 156 pages.
- Result: Rank 20 is closed.

### 2026-05-13 - Rank 21 `/difference-between-decanter-centrifuge-disc-centrifuge/` - INSTRUCTIONS ISSUED

- Landing page: `/difference-between-decanter-centrifuge-disc-centrifuge/`
- Queue label: `difference-between-decanter-centrifuge-disc-centrifuge`
- Source file: `src/pages/difference-between-decanter-centrifuge-disc-centrifuge.astro`
- GA4 rank: 21
- Sessions: 657
- Status: `INSTRUCTIONS ISSUED`
- Scope: page-local AEO/GEO pass with Article schema enrichment, WebPage schema, AEO answer capsule replacement of the existing top takeaway section, Knowledge Center category href, WHPX-first visible nomenclature cleanup, limited mojibake/typo cleanup, and the required quick link check.
- Allowed implementation file: `src/pages/difference-between-decanter-centrifuge-disc-centrifuge.astro`
- Notes: Codex found Article schema but no WebPage schema; Article author lacks full hidden trust fields and worksFor URL; no `dateModified`; no `mainEntityOfPage`; no `categoryHref`; the top `30-Second Take-Away` section should be standardized to the AEO capsule pattern; visible `DMPX Series` conflicts with the current WHPX-first nomenclature policy; `WHPX 510` should be hyphenated; and a few visible mojibake/typo strings are present. Existing internal links, same-page TOC ids, and image assets checked clean before handoff.
- Awaiting: Astro Agent commit SHA for Codex audit.

### 2026-05-13 - Rank 21 `/difference-between-decanter-centrifuge-disc-centrifuge/` - PASS

- Landing page: `/difference-between-decanter-centrifuge-disc-centrifuge/`
- Queue label: `difference-between-decanter-centrifuge-disc-centrifuge`
- Source file: `src/pages/difference-between-decanter-centrifuge-disc-centrifuge.astro`
- GA4 rank: 21
- Sessions: 657
- Astro Agent commit: `e28d39f561a676c683196d2a279f09bdb2078eb6`
- Codex audit result: `PASS`
- Verified commit changed only `src/pages/difference-between-decanter-centrifuge-disc-centrifuge.astro`.
- Verified Article schema has aligned headline and description, preserved `datePublished: "2021-01-01"`, `dateModified: "2026-05-13"`, `mainEntityOfPage` with `#webpage`, and canonical hidden Sanjay author credential fields.
- Verified WebPage schema exists with `#webpage` `@id`, is included in `jsonLd`, and has no `WebPage.author`.
- Verified exact visible AEO capsule renders once, `summary-takeaway` is present in the TOC, `categoryHref="/knowledge-center/"`, and the old top takeaway bullet list was removed.
- Verified assigned WHPX-first visible nomenclature cleanup and the assigned mojibake/typo fixes.
- Verified no visible author, degree, school, class-year, reviewed-by, author bio, or headshot text was added.
- Verified no forbidden FAQPage, HowTo, Product, Dataset, VideoObject, BreadcrumbList, Offer, or AggregateOffer schema was added.
- Verified internal links, same-page TOC ids, and 6 image assets resolve; mojibake marker scan and `git diff --check` are clean.
- Verified `npx astro build` passes from a temporary archive of the exact commit with 156 pages.
- Result: Rank 21 is closed.

### 2026-05-13 - Rank 22 `/dewatering-centrifuge/` - INSTRUCTIONS ISSUED

- Landing page: `/dewatering-centrifuge/`
- Queue label: `dewatering-centrifuge`
- Source file: `src/pages/dewatering-centrifuge.astro`
- GA4 rank: 22
- Sessions: 642
- Status: `INSTRUCTIONS ISSUED`
- Scope: page-local AEO/GEO pass with Article schema enrichment, existing FAQPage preservation, WebPage schema, AEO answer capsule replacement of the unlabeled top summary paragraph, Knowledge Center category href, visible bottom byline removal, limited obvious typo fixes, and the required quick link check.
- Allowed implementation file: `src/pages/dewatering-centrifuge.astro`
- Notes: Codex found Article and rendered FAQ/FAQPage schema but no WebPage schema; Article author lacks full hidden trust fields and worksFor URL; no `dateModified`; no `mainEntityOfPage`; no `categoryHref`; the top unlabeled summary paragraph can become the AEO summary section; a visible bottom byline should be removed; and a few obvious sentence typos are present. Existing internal links, the FAQ component anchor, and image assets checked clean before handoff.
- Awaiting: Astro Agent commit SHA for Codex audit.

### 2026-05-14 - Rank 22 `/dewatering-centrifuge/` - PASS

- Landing page: `/dewatering-centrifuge/`
- Queue label: `dewatering-centrifuge`
- Source file: `src/pages/dewatering-centrifuge.astro`
- GA4 rank: 22
- Sessions: 642
- Astro Agent commit: `15581c22d0b2a67c0a03924633b186c521385105`
- Codex audit result: `PASS`
- Verified commit changed only `src/pages/dewatering-centrifuge.astro`.
- Verified Article schema has aligned headline and description, no invented `datePublished`, `dateModified: "2026-05-13"`, `mainEntityOfPage` with `#webpage`, and canonical hidden Sanjay author credential fields.
- Verified existing rendered FAQ and FAQPage schema were preserved with the same five FAQ items.
- Verified WebPage schema exists with `#webpage` `@id`, is included in `jsonLd`, and has no `WebPage.author`.
- Verified exact visible AEO capsule renders once, `summary-takeaway` is present in the TOC, `categoryHref="/knowledge-center/"`, visible bottom byline removed, and assigned typo fixes applied.
- Verified no visible author, degree, school, class-year, reviewed-by, author bio, or headshot text was added.
- Verified no forbidden HowTo, Product, Dataset, VideoObject, BreadcrumbList, Offer, AggregateOffer, or duplicate FAQPage schema was added.
- Verified internal links, same-page TOC ids including the FAQ component id, and 3 image assets resolve; mojibake marker scan and `git diff --check` are clean.
- Verified `npx astro build` passes from a temporary archive of the exact commit with 156 pages.
- Result: Rank 22 is closed.

### 2026-05-14 - Rank 23 `/decanter-centrifuge-pond-depth/` - INSTRUCTIONS ISSUED

- Landing page: `/decanter-centrifuge-pond-depth/`
- Queue label: `decanter-centrifuge-pond-depth`
- Source file: `src/pages/decanter-centrifuge-pond-depth.astro`
- GA4 rank: 23
- Sessions: 626
- Status: `INSTRUCTIONS ISSUED`
- Scope: page-local AEO/GEO pass with Article schema enrichment, WebPage schema, AEO answer capsule replacement in the existing top summary section, Knowledge Center category href, visible bottom byline removal, limited page-local link-label corrections, and the required quick link check.
- Allowed implementation file: `src/pages/decanter-centrifuge-pond-depth.astro`
- Notes: Codex found Article schema but no WebPage schema; Article author lacks full hidden trust fields and worksFor URL; no `dateModified`; no `mainEntityOfPage`; no `categoryHref`; the existing top summary paragraph should become an AEO answer capsule while preserving the question list; visible bottom byline should be removed; and three visible/internal link labels point to mismatched hrefs. Existing internal route existence, same-page ids, and image assets checked clean before handoff.
- Awaiting: Astro Agent commit SHA for Codex audit.

### 2026-05-14 - Rank 23 `/decanter-centrifuge-pond-depth/` - PASS

- Landing page: `/decanter-centrifuge-pond-depth/`
- Queue label: `decanter-centrifuge-pond-depth`
- Source file: `src/pages/decanter-centrifuge-pond-depth.astro`
- GA4 rank: 23
- Sessions: 626
- Astro Agent commit: `54642d847f94bc8ca6a0eef91391271d9bd50bc2`
- Codex audit result: `PASS`
- Verified commit changed only `src/pages/decanter-centrifuge-pond-depth.astro`.
- Verified Article schema has aligned headline and description, preserved `datePublished: "2020-10-01"`, `dateModified: "2026-05-14"`, `mainEntityOfPage` with `#webpage`, and canonical hidden Sanjay author credential fields.
- Verified WebPage schema exists with `#webpage` `@id`, is included in `jsonLd`, and has no `WebPage.author`.
- Verified exact visible AEO capsule renders once, `summary-takeaway` is present in the TOC, `categoryHref="/knowledge-center/"`, and the existing question list was preserved.
- Verified visible bottom byline removed and assigned link-label mismatches fixed.
- Verified no visible author, degree, school, class-year, reviewed-by, author bio, or headshot text was added.
- Verified no forbidden FAQPage, HowTo, Product, Dataset, VideoObject, BreadcrumbList, Offer, or AggregateOffer schema was added.
- Verified internal links, same-page TOC ids, and 4 image assets resolve; mojibake marker scan and `git diff --check` are clean.
- Verified `npx astro build` passes from a temporary archive of the exact commit with 156 pages.
- Result: Rank 23 is closed.

### 2026-05-14 - Rank 24 `/decanter-centrifuge-vibration/` - INSTRUCTIONS ISSUED

- Landing page: `/decanter-centrifuge-vibration/`
- Queue label: `decanter-centrifuge-vibration`
- Source file: `src/pages/decanter-centrifuge-vibration.astro`
- GA4 rank: 24
- Sessions: 583
- Status: `INSTRUCTIONS ISSUED`
- Scope: page-local AEO/GEO pass with Article schema enrichment, WebPage schema, AEO answer capsule replacement in the existing top intro section, Knowledge Center category href, limited obvious typo fixes, and the required quick link check.
- Allowed implementation file: `src/pages/decanter-centrifuge-vibration.astro`
- Notes: Codex found Article schema but no WebPage schema; Article is missing `@context`, full hidden author fields, `dateModified`, and `mainEntityOfPage`; no `categoryHref`; no standardized top AEO summary; and a few obvious visible typos are present (`Auxillary`, missing space after `axis.`, `broker tile`, `above to push`, `login functionality`, and summary sentence grammar). Existing internal route existence, same-page ids, and image assets checked clean before handoff.
- Awaiting: Astro Agent commit SHA for Codex audit.

### 2026-05-14 - Rank 24 `/decanter-centrifuge-vibration/` - PASS

- Landing page: `/decanter-centrifuge-vibration/`
- Queue label: `decanter-centrifuge-vibration`
- Source file: `src/pages/decanter-centrifuge-vibration.astro`
- GA4 rank: 24
- Sessions: 583
- Astro Agent commit: `e208e4b14c168f7d3eab3d98322fadc824e798b7`
- Codex audit result: `PASS`
- Verified commit changed only `src/pages/decanter-centrifuge-vibration.astro`.
- Verified Article schema has `@context`, preserved headline and description, preserved `datePublished: "2020-11-08"`, `dateModified: "2026-05-14"`, `mainEntityOfPage` with `#webpage`, and canonical hidden Sanjay author credential fields.
- Verified WebPage schema exists with `#webpage` `@id`, is included in `jsonLd`, and has no `WebPage.author`.
- Verified exact visible AEO capsule renders once, `summary-takeaway` is present in the TOC, `categoryHref="/knowledge-center/"`, and both existing cause lists were preserved.
- Verified assigned typo/grammar fixes applied.
- Verified no visible author, degree, school, class-year, reviewed-by, author bio, or headshot text was added.
- Verified no forbidden FAQPage, HowTo, Product, Dataset, VideoObject, BreadcrumbList, Offer, or AggregateOffer schema was added.
- Verified internal links, same-page TOC ids, and 4 image assets resolve; mojibake marker scan and `git diff --check` are clean.
- Verified `npx astro build` passes from a temporary archive of the exact commit with 156 pages.
- Result: Rank 24 is closed.

### 2026-05-14 - Rank 25 `/machine-coolant-centrifuge/` - INSTRUCTIONS ISSUED

- Landing page: `/machine-coolant-centrifuge/`
- Queue label: `machine-coolant-centrifuge`
- Source file: `src/pages/machine-coolant-centrifuge.astro`
- GA4 rank: 25
- Sessions: 563
- Status: `INSTRUCTIONS ISSUED`
- Scope: page-local AEO/GEO pass with existing Product/Offer and FAQPage preservation, Article schema enrichment, WebPage schema, top AEO answer capsule, Applications category href, page-local Alfa Laval naming and hyphenation cleanup, source-comment mojibake cleanup, and the required quick link check.
- Allowed implementation file: `src/pages/machine-coolant-centrifuge.astro`
- Notes: Codex found Product, FAQPage, and Article schema but no WebPage schema; Article author lacks full hidden trust fields and worksFor URL; Article has no `dateModified` or `mainEntityOfPage`; no `categoryHref`; no standardized top AEO summary; related product labels still use DMPX names; several visible Alfa Laval model names are unhyphenated or mismatch their current linked model route; and section comments contain mojibake markers. Existing internal route existence, same-page ids, and 11 image assets checked clean before handoff.
- Awaiting: Astro Agent commit SHA for Codex audit.

### 2026-05-14 - Rank 25 `/machine-coolant-centrifuge/` - PASS

- Landing page: `/machine-coolant-centrifuge/`
- Queue label: `machine-coolant-centrifuge`
- Source file: `src/pages/machine-coolant-centrifuge.astro`
- GA4 rank: 25
- Sessions: 563
- Astro Agent commit: `5dcaf754a70ab766e67b7ef5b49dfbdb0984cccf`
- Codex audit result: `PASS`
- Verified commit changed only `src/pages/machine-coolant-centrifuge.astro`.
- Verified Product and Offer schema were preserved.
- Verified rendered FAQ and FAQPage schema were preserved.
- Verified Article schema has `dateModified: "2026-05-14"`, `mainEntityOfPage` with `#webpage`, and canonical hidden Sanjay author credential fields, with no invented `datePublished`.
- Verified WebPage schema exists with `#webpage` `@id`, is included in `jsonLd`, and has no `WebPage.author`.
- Verified `jsonLd` includes Product, FAQPage, Article, and WebPage.
- Verified exact visible AEO capsule renders once, `summary-takeaway` is present in the TOC, `categoryHref="/applications/"`, related-product label cleanup, assigned model-name cleanup, and source-comment mojibake cleanup.
- Verified no visible author, degree, school, class-year, reviewed-by, author bio, or headshot text was added.
- Verified no forbidden HowTo, Dataset, VideoObject, BreadcrumbList, AggregateOffer, or extra Product/Offer schema was added.
- Verified internal links, same-page TOC ids, and 12 image references resolve; `/centrifuges/dmpx-028/` and `/centrifuges/dmpx-042/` both exist as source routes.
- Verified mojibake marker scan and `git diff --check` are clean; target file matches commit `5dcaf754a70ab766e67b7ef5b49dfbdb0984cccf` in the working tree.
- Verified `npx astro build` passes from a temporary archive of the exact commit with 156 pages.
- Result: Rank 25 is closed.

### 2026-05-14 - Rank 26 `/algae-centrifuge/` - INSTRUCTIONS ISSUED

- Landing page: `/algae-centrifuge/`
- Queue label: `algae-centrifuge`
- Source file: `src/pages/algae-centrifuge.astro`
- GA4 rank: 26
- Sessions: 544
- Status: `INSTRUCTIONS ISSUED`
- Scope: page-local AEO/GEO pass with Product/Offer and rendered FAQ/FAQPage preservation, Article schema enrichment, WebPage schema, top AEO answer capsule, Applications category href correction, DMPX related-product label cleanup, limited obvious typo/markup fixes, and the required quick link check.
- Allowed implementation file: `src/pages/algae-centrifuge.astro`
- Notes: Codex found Product, Offer, Article, rendered FAQ, and FAQPage schema but no WebPage schema; Article author lacks full hidden trust fields and worksFor URL; Article has no `dateModified` or `mainEntityOfPage`; the page has no standardized top AEO summary; `categoryHref` still points to `/disc-stack-centrifuge-applications/`; related product labels still use DMPX names; and a few obvious visible typos/markup issues are present. Existing internal route existence, the FAQ component anchor, and 6 image assets checked clean before handoff.
- Awaiting: Astro Agent commit SHA for Codex audit.

### 2026-05-14 - Rank 26 `/algae-centrifuge/` - PASS

- Landing page: `/algae-centrifuge/`
- Queue label: `algae-centrifuge`
- Source file: `src/pages/algae-centrifuge.astro`
- GA4 rank: 26
- Sessions: 544
- Astro Agent commit: `d71d1dce793a5f95acd1558875fca0860292a35c`
- Codex audit result: `PASS`
- Verified commit changed only `src/pages/algae-centrifuge.astro`.
- Verified Product and Offer schema were preserved.
- Verified rendered FAQ and FAQPage schema were preserved except the assigned FAQ grammar fix.
- Verified Article schema has `dateModified: "2026-05-14"`, `mainEntityOfPage` with `#webpage`, and canonical hidden Sanjay author credential fields, with no invented `datePublished`.
- Verified WebPage schema exists with `#webpage` `@id`, is included in `jsonLd`, and has no `WebPage.author`.
- Verified `jsonLd` includes Product, Article, FAQPage, and WebPage.
- Verified exact visible AEO capsule renders once, `summary-takeaway` is present in the TOC, `categoryHref="/applications/"`, related-product label cleanup, and assigned typo/markup fixes.
- Verified no visible author, degree, school, class-year, reviewed-by, author bio, or headshot text was added.
- Verified no forbidden HowTo, Dataset, VideoObject, BreadcrumbList, AggregateOffer, or extra Product/Offer schema was added.
- Verified internal links, same-page TOC ids including the FAQ component id, and 6 image references resolve.
- Verified mojibake marker scan and `git diff --check` are clean; target file matches commit `d71d1dce793a5f95acd1558875fca0860292a35c` in the working tree.
- Verified `npx astro build` passes from a temporary archive of the exact commit with 156 pages.
- Result: Rank 26 is closed.

### 2026-05-14 - Rank 27 `/alfa-laval-centrifuges/` - INSTRUCTIONS ISSUED

- Landing page: `/alfa-laval-centrifuges/`
- Queue label: `alfa-laval-centrifuges`
- Source file: `src/pages/alfa-laval-centrifuges.astro`
- GA4 rank: 27
- Sessions: 542
- Status: `INSTRUCTIONS ISSUED`
- Scope: page-local AEO/GEO pass with existing Article and Product/Offer schema preservation/enrichment, WebPage schema, top AEO answer capsule, product category href, visible model-name hyphenation, and the required quick link check.
- Allowed implementation file: `src/pages/alfa-laval-centrifuges.astro`
- Notes: Codex found Article and Product/Offer schema but no WebPage schema; Article author lacks full hidden trust fields and worksFor URL; `dateModified` is stale; `mainEntityOfPage` lacks the `#webpage` id; there is no standardized top AEO summary; no `categoryHref`; and many visible Alfa Laval model names use space formatting instead of the required hyphenated format. Existing internal route existence, same-page ids, and 29 image references checked clean before handoff.
- Awaiting: Astro Agent commit SHA for Codex audit.

### 2026-05-14 - Rank 27 `/alfa-laval-centrifuges/` - PASS

- Landing page: `/alfa-laval-centrifuges/`
- Queue label: `alfa-laval-centrifuges`
- Source file: `src/pages/alfa-laval-centrifuges.astro`
- GA4 rank: 27
- Sessions: 542
- Astro Agent commit: `a1028188b5c3b26cff8bd77fe0ba381f3ac3c19c`
- Codex audit result: `PASS`
- Verified commit changed only `src/pages/alfa-laval-centrifuges.astro`.
- Verified Product and Offer schema fields were preserved.
- Verified Article schema has preserved `datePublished: "2020-01-01"`, `dateModified: "2026-05-14"`, `mainEntityOfPage` with `#webpage`, and canonical hidden Sanjay author credential fields.
- Verified WebPage schema exists with `#webpage` `@id`, is included in `jsonLd`, and has no `WebPage.author`.
- Verified `jsonLd` includes Article, Product, and WebPage.
- Verified exact visible AEO capsule renders once, `summary-takeaway` is present in the TOC, `categoryHref="/alfa-laval-centrifuges/"`, assigned visible model-name hyphenation, and the Self-Cleaning wording fix.
- Verified no visible author, degree, school, class-year, reviewed-by, author bio, or headshot text was added.
- Verified no forbidden FAQPage, HowTo, Dataset, VideoObject, BreadcrumbList, AggregateOffer, or extra Product/Offer schema was added.
- Verified internal links, same-page TOC ids, and 29 image references resolve.
- Verified mojibake marker scan and `git diff --check` are clean; target file matches commit `a1028188b5c3b26cff8bd77fe0ba381f3ac3c19c` in the working tree.
- Verified `npx astro build` passes from a temporary archive of the exact commit with 156 pages.
- Result: Rank 27 is closed.

### 2026-05-14 - Rank 28 `/centrifuge-rcf-rpm-difference-calculation/` - INSTRUCTIONS ISSUED

- Landing page: `/centrifuge-rcf-rpm-difference-calculation/`
- Queue label: `centrifuge-rcf-rpm-difference-calculation`
- Source file: `src/pages/centrifuge-rcf-rpm-difference-calculation.astro`
- GA4 rank: 28
- Sessions: 490
- Status: `INSTRUCTIONS ISSUED`
- Scope: page-local AEO/GEO pass with existing Article schema enrichment, WebPage schema, top AEO answer capsule, related-product label cleanup, one obvious sentence fix, and the required quick link check.
- Allowed implementation file: `src/pages/centrifuge-rcf-rpm-difference-calculation.astro`
- Notes: Codex found Article schema but no WebPage schema; Article author lacks full hidden trust fields and worksFor URL; Article has no `dateModified` or `mainEntityOfPage`; `categoryHref="/knowledge-center/"` is already present; there is no standardized top AEO summary; related product labels still use DMPX names; and one visible sentence says "the RCF functions as the RPM and the rotating object's radius." Existing internal route existence, same-page ids, and image assets checked clean before handoff.
- Awaiting: Astro Agent commit SHA for Codex audit.

### 2026-05-14 - Rank 28 `/centrifuge-rcf-rpm-difference-calculation/` - PASS

- Landing page: `/centrifuge-rcf-rpm-difference-calculation/`
- Queue label: `centrifuge-rcf-rpm-difference-calculation`
- Source file: `src/pages/centrifuge-rcf-rpm-difference-calculation.astro`
- GA4 rank: 28
- Sessions: 490
- Astro Agent commit: `80bde333b7550820e0021b52eab570964789c8cb`
- Codex audit result: `PASS`
- Verified commit changed only `src/pages/centrifuge-rcf-rpm-difference-calculation.astro`.
- Verified Article schema preserves `datePublished: "2020-10-20"`, has `dateModified: "2026-05-14"`, `mainEntityOfPage` with `#webpage`, and canonical hidden Sanjay author credential fields.
- Verified WebPage schema exists with `#webpage` `@id`, is included in `jsonLd`, and has no `WebPage.author`.
- Verified `jsonLd` includes Article and WebPage only, with no forbidden FAQPage, HowTo, Product, Dataset, VideoObject, SoftwareApplication, BreadcrumbList, Offer, or AggregateOffer schema.
- Verified `categoryHref="/knowledge-center/"` is still present.
- Verified exact visible AEO capsule renders once, `summary-takeaway` is present in the TOC, related-product label cleanup was applied, and the assigned sentence fix was applied.
- Verified the inline RCF calculator script was unchanged from the parent commit.
- Verified no visible author, degree, school, class-year, reviewed-by, author bio, or headshot text was added.
- Verified internal links, same-page TOC ids, and 2 image references resolve.
- Verified mojibake marker scan and `git diff --check` are clean; target file matches commit `80bde333b7550820e0021b52eab570964789c8cb` in the working tree.
- Verified `npx astro build` passes at exact HEAD `80bde333b7550820e0021b52eab570964789c8cb` with 156 pages.
- Result: Rank 28 is closed.

### 2026-05-14 - Rank 29 `/fuel-oil-centrifuge/` - INSTRUCTIONS ISSUED

- Landing page: `/fuel-oil-centrifuge/`
- Queue label: `fuel-oil-centrifuge`
- Source file: `src/pages/fuel-oil-centrifuge.astro`
- GA4 rank: 29
- Sessions: 449
- Status: `INSTRUCTIONS ISSUED`
- Scope: page-local AEO/GEO pass with existing Product/Offer preservation, Article schema enrichment, WebPage schema, top AEO answer capsule, Applications category href, related-product label cleanup plus one broken href fix, visible Alfa Laval model hyphenation cleanup, and the required quick link check.
- Allowed implementation file: `src/pages/fuel-oil-centrifuge.astro`
- Notes: Codex found Product/Offer and Article schema but no WebPage schema; Article author lacks full hidden trust fields and worksFor URL; Article has no `dateModified` or `mainEntityOfPage`; no `datePublished` is currently present; no `categoryHref`; no standardized top AEO summary; related product labels still use DMPX names; `/centrifuges/dmpx-014/` is a broken related-product href; and visible model references include unhyphenated MOPX/FOPX names. Existing body internal links, same-page ids, mojibake marker scan, and 7 image references checked clean before handoff.
- Awaiting: Astro Agent commit SHA for Codex audit.

### 2026-05-14 - Rank 29 `/fuel-oil-centrifuge/` - PASS

- Landing page: `/fuel-oil-centrifuge/`
- Queue label: `fuel-oil-centrifuge`
- Source file: `src/pages/fuel-oil-centrifuge.astro`
- GA4 rank: 29
- Sessions: 449
- Astro Agent commit: `38f7ee882b0a7e223559e884db8b8f453197f5e4`
- Codex audit result: `PASS`
- Verified commit changed only `src/pages/fuel-oil-centrifuge.astro`.
- Verified Product and Offer schema fields were preserved exactly.
- Verified Article schema has no invented `datePublished`, has `dateModified: "2026-05-14"`, `mainEntityOfPage` with `#webpage`, and canonical hidden Sanjay author credential fields.
- Verified WebPage schema exists with `#webpage` `@id`, is included in `jsonLd`, and has no `WebPage.author`.
- Verified `jsonLd` includes Product, Article, and WebPage, with no forbidden FAQPage, HowTo, Dataset, VideoObject, BreadcrumbList, AggregateOffer, or extra Product/Offer schema added.
- Verified `categoryHref="/applications/"` is present.
- Verified exact visible AEO capsule renders once, `summary-takeaway` is present in the TOC, related-product label cleanup was applied, `/centrifuges/dmpx-014/` was fixed to `/alfa-laval-whpx-405/`, and assigned model-name hyphenation was applied.
- Verified no visible author, degree, school, class-year, reviewed-by, author bio, or headshot text was added.
- Verified internal links including related arrays, same-page TOC ids, and 7 image references resolve.
- Verified mojibake marker scan and `git diff --check` are clean; target file matches commit `38f7ee882b0a7e223559e884db8b8f453197f5e4` in the working tree.
- Verified `npx astro build` passes at exact HEAD `38f7ee882b0a7e223559e884db8b8f453197f5e4` with 156 pages.
- Result: Rank 29 is closed.

### 2026-05-14 - Rank 30 `/biodiesel-centrifuge/` - INSTRUCTIONS ISSUED

- Landing page: `/biodiesel-centrifuge/`
- Queue label: `biodiesel-centrifuge`
- Source file: `src/pages/biodiesel-centrifuge.astro`
- GA4 rank: 30
- Sessions: 448
- Status: `INSTRUCTIONS ISSUED`
- Scope: page-local AEO/GEO pass with existing Product/Offer and rendered FAQ/FAQPage preservation except assigned FAQ grammar fixes, Article schema enrichment, WebPage schema, top AEO answer capsule, Applications category href, visible Alfa Laval model hyphenation cleanup, and the required quick link check.
- Allowed implementation file: `src/pages/biodiesel-centrifuge.astro`
- Notes: Codex found Product/Offer, rendered FAQ, FAQPage, and Article schema but no WebPage schema; Article author lacks full hidden trust fields and worksFor URL; Article has no `dateModified` or `mainEntityOfPage`; no `datePublished` is currently present; no `categoryHref`; no standardized top AEO summary; and visible model references use unhyphenated MAB/BDB/BDPX forms. Existing internal links, same-page ids including the FAQ component id, mojibake marker scan, and 6 image references checked clean before handoff.
- Awaiting: Astro Agent commit SHA for Codex audit.

### 2026-05-14 - Rank 30 `/biodiesel-centrifuge/` - NEEDS FIXES

- Landing page: `/biodiesel-centrifuge/`
- Queue label: `biodiesel-centrifuge`
- Source file: `src/pages/biodiesel-centrifuge.astro`
- GA4 rank: 30
- Sessions: 448
- Astro Agent commit: `9508c3a1405177e7eb7b6405e8570aa6529718c7`
- Codex audit result: `NEEDS FIXES`
- Verified commit changed only `src/pages/biodiesel-centrifuge.astro`.
- Verified Product and Offer schema fields were preserved exactly.
- Verified rendered FAQ and FAQPage schema were preserved with 8 FAQ items and the assigned FAQ grammar/model-name fixes.
- Verified Article schema has no invented `datePublished`, has `dateModified: "2026-05-14"`, `mainEntityOfPage` with `#webpage`, and canonical hidden Sanjay author credential fields.
- Verified WebPage schema exists with `#webpage` `@id`, is included in `jsonLd`, and has no `WebPage.author`.
- Verified exact visible AEO capsule renders once, `summary-takeaway` is present in the TOC, `categoryHref="/applications/"`, assigned model-name hyphenation, internal links, same-page ids, and 6 image references.
- Verified mojibake marker scan and `git diff --check` are clean.
- Blocker: `webPageJsonLd.about` is typed as `Product`, creating a second Product entity. The handoff forbade extra Product/Offer schema. Change only `webPageJsonLd.about` from `@type: "Product"` to `@type: "Thing"` and return a new commit SHA.

### 2026-05-14 - Rank 30 `/biodiesel-centrifuge/` - PASS

- Landing page: `/biodiesel-centrifuge/`
- Queue label: `biodiesel-centrifuge`
- Source file: `src/pages/biodiesel-centrifuge.astro`
- GA4 rank: 30
- Sessions: 448
- Astro Agent correction commit: `d9e56d572cd33a7bd295d80b2f4530a2ee052b1f`
- Codex audit result: `PASS`
- Verified correction commit changed only `src/pages/biodiesel-centrifuge.astro`.
- Verified correction changed only `webPageJsonLd.about["@type"]` from `Product` to `Thing`.
- Verified Product and Offer schema fields remain preserved exactly from the original page.
- Verified rendered FAQ and FAQPage schema remain preserved with 8 FAQ items and the assigned FAQ grammar/model-name fixes.
- Verified Article schema has no invented `datePublished`, has `dateModified: "2026-05-14"`, `mainEntityOfPage` with `#webpage`, and canonical hidden Sanjay author credential fields.
- Verified WebPage schema exists with `#webpage` `@id`, `about` typed as `Thing`, is included in `jsonLd`, and has no `WebPage.author`.
- Verified `jsonLd` includes Product, FAQPage, Article, and WebPage; only one `Product` schema and one `Offer` schema remain.
- Verified no forbidden HowTo, Dataset, VideoObject, BreadcrumbList, AggregateOffer, or extra Product/Offer schema was added.
- Verified `categoryHref="/applications/"` is present.
- Verified exact visible AEO capsule renders once, `summary-takeaway` is present in the TOC, assigned model-name hyphenation is applied, and assigned FAQ grammar fixes are applied.
- Verified no visible author, degree, school, class-year, reviewed-by, author bio, or headshot text was added.
- Verified internal links including related arrays, same-page TOC ids including the FAQ component id, and 6 image references resolve.
- Verified mojibake marker scan and `git diff --check` are clean; target file matches commit `d9e56d572cd33a7bd295d80b2f4530a2ee052b1f` in the working tree.
- Verified `npx astro build` passes at exact HEAD `d9e56d572cd33a7bd295d80b2f4530a2ee052b1f` with 156 pages.
- Result: Rank 30 is closed.

### 2026-05-14 - Top 30 Pre-Live AEO/GEO Gate - COMPLETE

- Completed the first 30 highest-traffic real pages from `ga4-landing-pages-top160.xlsx`, including `/` and skipping `(not set)`.
- All top-30 real pages have PASS entries in this log.
- Per the operating plan, AEO/GEO is no longer a pre-live blocker after this point unless Sanjay explicitly reopens the launch gate.
- Continue remaining AEO/GEO pages after launch.
