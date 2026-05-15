## Rule 0 — Encoding Guard (MANDATORY)

**Do NOT use a bulk PowerShell read/write script on `.astro` files unless it explicitly reads and writes UTF-8.**

- **Preferred:** Use patch-only edits (tool-based `replace_file_content` / `multi_replace_file_content`).
- **If scripting:** Use `[System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)` to read and `New-Object System.Text.UTF8Encoding($false)` + `[System.IO.File]::WriteAllText(...)` to write.
- **Never** use `Get-Content -Raw` + `WriteAllText()` without specifying encoding.
- **Pre-commit:** Scan all changed `.astro` files for mojibake markers: `â€™`, `â€œ`, `â€`, `Âµ`, `â€"`, `â€¦`, `â†'`, `Ð`, `Ï`. If any appear, fix before reporting ready.

> Origin: commit `ff9445c` corrupted 21 files. Fixed in `757889f`.

---

# Astro Migration Essentials

This file is intentionally short. It is the quick operating checklist for one-page Astro migration work. Put detailed rules in the reference files below, not here.

## Read First

Before editing a page, read:

1. `SEO-AND-STANDARDS.md`
2. `LEGACY-BODY-FIDELITY.md`
3. `PAGE_APPEARANCE_LOOK.md`
4. `AUDIT_HANDOFF_PROTOCOL.md`

For AEO/GEO, AI search, answer-engine, or traffic-priority optimization work, also read `.agents/rules/aeo_geo_pathway.md` before editing.

Use `LW.xml` and the matching legacy page content as the source of truth.

## Rule Cascade

Use this file as the short operating checklist.

When deciding a page issue:
1. Sanjay's current page-specific instruction wins.
2. SEO/title/meta/schema/canonical/TOC/CTA rules come from `SEO-AND-STANDARDS.md`.
3. Body text, tables, FAQ authenticity, and AI-added content rules come from `LEGACY-BODY-FIDELITY.md`.
4. Visual layout, image captions, `img-cap-*` sizing, page-context alt text, and contrast rules come from `PAGE_APPEARANCE_LOOK.md`.
5. If two files appear to conflict, stop and ask Sanjay instead of guessing.

## Work Scope

- Default mode for normal migration work: one slug and one `src/pages/<slug>.astro` page at a time.
- For AEO/GEO work: one assigned page only, selected by Codex from the traffic queue. Do not self-assign the next page.
- Do not spawn parallel agents or use multi-agent mode.
- Do not touch shared layouts, shared components, shared CSS, docs, spreadsheets, tracking code, or unrelated files unless Sanjay explicitly approves that exact extra scope.
- Do not use any existing page as a universal template. Use `ApplicationLayout` patterns plus the current page's legacy content.
- Do not open a browser or localhost preview. Use file-based verification. If a visual check is needed, ask Sanjay to preview.

## Image Handoff (First Step)

Use the image handoff folders only when the task actually includes image generation, image repair, image replacement, hero swaps, or body-image asset work.

For non-image passes such as SEO, FAQ, TOC, CTA, links, schema, alt text, or caption markup, do not force the image handoff workflow first.

When image work is in scope, set up all 4 image handoff folders at the repo root before editing the page.

**Copy old images into these folders:**
1. **Old hero image:** Copy the hero JPG from `public/images/<slug>/` to `_Old_Hero_Image/<slug>/`
2. **Old body images:** Copy every body JPG from `public/images/<slug>/` to `_Image_Repair/<slug>/`

**Create empty folders ready for Sanjay's fixed images:**
3. **New hero image:** Create empty `_New_Hero_Image/<slug>/`
4. **Fixed body images:** Create empty `_Image_NB_Fixed/<slug>/`

All 4 paths are at the repo root:
- `_Old_Hero_Image/<slug>/` - old hero JPG goes here
- `_Image_Repair/<slug>/` - all old body JPGs go here
- `_New_Hero_Image/<slug>/` - empty, ready for Sanjay's new hero
- `_Image_NB_Fixed/<slug>/` - empty, ready for Sanjay's fixed body images

Create the slug subfolder if it does not exist. These folders are gitignored by design.

## Legacy Content

- Preserve all legacy body sections, headings, paragraphs, lists, links, tables, captions, and image references unless Sanjay approved an exception.
- Do not invent sections, summaries, FAQs, claims, specs, stats, testimonials, guarantees, prices, or capacities.
- Tables are strict: keep data cells, numbers, model codes, punctuation, blanks, and units faithful to legacy.
- Do not replace continuous legacy paragraphs with artificial cards, callouts, or marketing blocks.
- Preserve legacy typos and awkward wording unless Sanjay asks to clean them.

## SEO Fields

Check these as separate fields:

- Astro SEO title: use legacy `rank_math_title` when present, otherwise the legacy page title.
- Visible H1 / hero title: use the legacy visible page title or H1.
- Meta description: use legacy `rank_math_description` when present.

For AEO/GEO work, follow the exact Codex pass-on instruction when it deliberately assigns updated metadata or schema text for the selected page. Do not invent new metadata.

Do not assume SEO title, visible H1, and meta description are the same. If the layout would append a title suffix that breaks legacy title fidelity, use the existing layout option to disable that suffix.

## AEO/GEO Quick Link Check

All future AEO/GEO Astro instructions must include a page-local quick link check:
- Check internal `href` links in the selected page file only.
- Verify each internal target exists as a source page route or in `public/_redirects`.
- Verify same-page `#anchor` links match real element IDs in the selected page.
- Fix obvious broken or label/href-mismatched page-local links found in that file.
- Do not run a full-site crawl.
- Do not validate every external URL unless it is visibly malformed.

## Schema

- Every page needs truthful JSON-LD appropriate to the page type plus breadcrumb behavior.
- Schema must match visible page content and legacy facts.
- Do not add unsupported Product, Article, brand, manufacturer, capacity, price, performance, or authorization claims.
- If an FAQ is rendered and approved, `FAQPage` schema must match it exactly.
- If no rendered FAQ exists, do not include `FAQPage` schema.
- For AEO/GEO schema, add schema-only author enrichment for Sanjay Prabhu MSME when truthful. Use `Article.author` when Article schema exists. If there is no Article schema, use `WebPage.author`; do not create Article schema only to carry author data. Current hidden-only credential: Master of Science in Mechanical Engineering, University of Arkansas, Fayetteville, Class of 1990. Do not add visible author, degree, school, class year, or reviewed-by text unless Sanjay explicitly asks for visible author treatment.
- If Codex assigns a supplemental author-credential pass for a page that already passed, keep it hidden-schema-only and do not reopen content, images, layout, captions, CTAs, links, or visible text unless Codex explicitly assigns that separate issue.

## FAQ

- Keep a FAQ only if legacy has a visible FAQ or Sanjay approved that exact page FAQ.
- If the Astro page has an AI-added FAQ with no legacy or Sanjay approval, remove the FAQ section and `FAQPage` schema.
- Do not restore RankMath-only FAQ schema as visible body text unless legacy also had visible Q/A content.

## CTA Duplication

- `ApplicationLayout` already renders hero, sidebar, and bottom CTAs. `BaseLayout` also renders `Footer.astro`, which contains its own CTA banner.
- Before handoff, count CTAs from the full shared layout chain, not only CTA markup in the page file.
- Do not ship both the `ApplicationLayout` bottom CTA and the `Footer.astro` CTA unless Sanjay explicitly approves that page-specific exception.
- Default page-local fix: add `hideBottomCTA={true}` to the `ApplicationLayout` props so the page keeps the global footer CTA and avoids a second bottom CTA.
- If the page also contains its own bottom CTA bar near the end of the content, that page-local bar still counts as a duplicate when the footer CTA remains.
- `hideBottomCTA={true}` alone is not enough if a page-local bottom CTA bar is still present.
- Default pass condition on `ApplicationLayout` pages: one bottom CTA system only, usually the shared footer CTA.

## TOC

- Use the standard `ApplicationLayout` TOC pattern.
- If legacy has a visible TOC, preserve its items, order, nesting, and anchors through the standard TOC.
- If legacy has no visible TOC, one standard Astro TOC is allowed.
- Never ship two visible TOCs for the same page.

## Images

- Sanjay may replace bad legacy images manually. Once he has replaced or approved a page image, do not restore or swap it back unless he explicitly asks.
- For each current image, verify the file exists, `width` and `height` match the actual file, alt text fits the actual image, and body images use an approved `img-cap-*` class.
- Every body/content image needs real `<figure><figcaption>` markup so the shared gray caption bar appears.
- Exclusions from caption requirement: hero images, logos, icons, and purely decorative UI assets.
- Use legacy caption text when present. For Sanjay-replaced images or legacy images with no caption, use clear page-context caption text that describes the actual current image.
- Do not use image `alt` text as the lightbox caption source.
- Separate image generation or repair work belongs in `ASTRO_AGENT_IMAGE_INSTRUCTIONS.md`, not this file.

## Appearance

Follow `PAGE_APPEARANCE_LOOK.md`.

Before handing off, check:

- body image sizing uses `img-cap-*`
- large portrait images are not dumped full-width
- galleries use approved equal-height patterns
- dark backgrounds have readable text and links
- pale tinted blocks keep dark readable text
- no duplicate bottom CTA from the final rendered layout chain, including `ApplicationLayout` plus `Footer.astro`
- no duplicate FAQ section or duplicate schema
- no page-local component duplicates layout features already supplied by `ApplicationLayout`

## Text Style

- No em-dashes in new AI-authored text.
- Avoid new en-dashes in AI-authored text unless legacy requires them.
- Do not do tiny wording polish just for style. Fix real fidelity, SEO, schema, appearance, or trust problems.

## Completion

- Never truncate an `.astro` file or leave placeholders like `// ... rest of code ...`.
- Commit the completed assigned page or approved fix before telling Sanjay it is ready for audit.
- Report the commit SHA.
- Do not mark a page finished until Sanjay reports auditor PASS for that exact slug and commit.
