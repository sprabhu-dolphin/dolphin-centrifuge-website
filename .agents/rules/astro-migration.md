# Astro Migration Essentials

This file is intentionally short. It is the quick operating checklist for one-page Astro migration work. Put detailed rules in the reference files below, not here.

## Read First

Before editing a page, read:

1. `SEO-AND-STANDARDS.md`
2. `LEGACY-BODY-FIDELITY.md`
3. `PAGE_APPEARANCE_LOOK.md`
4. `AUDIT_HANDOFF_PROTOCOL.md`

Use `LW.xml` and the matching legacy page content as the source of truth.

## Work Scope

- Work on one slug and one `src/pages/<slug>.astro` page at a time.
- Do not process multiple pages together.
- Do not spawn parallel agents unless Sanjay explicitly asks.
- Do not use any existing page as a universal template. Use `ApplicationLayout` patterns plus the current page's legacy content.
- Do not open a browser or localhost preview. Use file-based verification. If a visual check is needed, ask Sanjay to preview.

## Image Handoff (First Step)

Before editing the page, set up all 4 image handoff folders at the repo root. This is mandatory for every page.

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

Do not assume SEO title, visible H1, and meta description are the same. If the layout would append a title suffix that breaks legacy title fidelity, use the existing layout option to disable that suffix.

## Schema

- Every page needs truthful JSON-LD appropriate to the page type plus breadcrumb behavior.
- Schema must match visible page content and legacy facts.
- Do not add unsupported Product, Article, brand, manufacturer, capacity, price, performance, or authorization claims.
- If an FAQ is rendered and approved, `FAQPage` schema must match it exactly.
- If no rendered FAQ exists, do not include `FAQPage` schema.

## FAQ

- Keep a FAQ only if legacy has a visible FAQ or Sanjay approved that exact page FAQ.
- If the Astro page has an AI-added FAQ with no legacy or Sanjay approval, remove the FAQ section and `FAQPage` schema.
- Do not restore RankMath-only FAQ schema as visible body text unless legacy also had visible Q/A content.

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
- no duplicate bottom CTA when `ApplicationLayout` already renders the standard CTA
- no duplicate FAQ section or duplicate schema
- no page-local component duplicates layout features already supplied by `ApplicationLayout`

## Text Style

- No em-dashes in new AI-authored text.
- Avoid new en-dashes in AI-authored text unless legacy requires them.
- Do not do tiny wording polish just for style. Fix real fidelity, SEO, schema, appearance, or trust problems.

## Completion

- Never truncate an `.astro` file or leave placeholders like `// ... rest of code ...`.
- Commit the completed fix batch before telling Sanjay it is ready for audit.
- Report the commit SHA.
- Do not mark a page finished until Sanjay reports auditor PASS for that exact slug and commit.
