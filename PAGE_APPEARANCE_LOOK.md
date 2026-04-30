# Page Layout Decision Tree (v2.2)

**ðŸ›‘ STOP.** **DO NOT OPEN A BROWSER OR PREVIEW THE PAGE.**
Doing so crashes the PC due to memory limits. Instead, hand off to the user.
All verification described in this file is file-based verification only. Agents must not launch a browser, open localhost, use browser testing tools, or tell another agent to preview in a browser. If visual confirmation is needed, ask Sanjay to preview locally.

**Purpose:** Ensure technical data clarity and "Industrial Intuition" by matching layout structures to image orientation and content density.

---

## Universal Hero Image Specification
*Mandatory standard for ALL hero images.*

| Property | Specification |
|---|---|
| **Pixel Dimensions** | **1440 Ã— 500 px** (minimum) |
| **Aspect Ratio** | **16:9** or wider (panoramic preferred) |
| **Placement** | `object-cover object-center` |

---

## Step 1: Alignment & The "Starting Line"

**Mandatory:** Keep the `<h2 />`, `<h3 />`, `<h4 />` and introductory paragraph (`<p />`) **FULL-WIDTH** above any grid.
- **Why?** This ensures the "Starting Line" of the technical image and the data-table are perfectly aligned at the top. 
- **NEVER** put the intro paragraph in a 2/3 column - it displaces the image downwards.
- **NEVER** bury an `<h3>` or `<h4>` inside a grid column - all section headings must appear full-width **above** their associated image/table grid.

---

## Step 2: The Orientation Logic Gate

### 1. STACK (Row Layout) IF:
- **Wide Images (Aspect Ratio > 16:9):** System skids, modules, plant drawings.
- **Short Adjacent Text:** Less than 5 lines. (Prevents massive white voids).
- **RESOURCE CONFLICT:** You have a **Tall Image** AND a **Data-Heavy Table**. Grids will cramp both. **STACK** to give the table full width and the image full height.

### 2. GRID (Column Layout) IF:
- **Tall/Vertical Images:** Centrifuge tubes, tall components. (Vertical orientation fits column shapes).
- **Square Product Photos:** Motors, valves, detail shots.
- **AND** there is substantial text (5+ lines) to wrap with.

### 3. MULTI-IMAGE GALLERY ROW IF:
- A section has **2+ images** with shared context.
- Place images **side-by-side** in a `md:grid-cols-2` row with `items-stretch` (equal height boxes).
- Text goes **full-width below** the image row.
- **NEVER** stack multiple images vertically in a single narrow column - it wastes space and looks unbalanced.

---

## Step 3: The "Fit" Matrix (Grid Ratios)

| Image Type | Grid Ratio | Tailwind Classes |
|---|---|---|
| **Vertical/Tall Image** | **40% Image : 60% Text** | `grid-cols-1 md:grid-cols-5` (Img: 2, Text: 3) |
| **Standard Product Photo** | **33% Image : 66% Text** | `grid-cols-1 md:grid-cols-3` (Img: 1, Text: 2) |
| **Complex Diagrams** | **50% Image : 50% Text** | `grid-cols-1 md:grid-cols-2` |

### Text Silos (Long Text + Single Image)
- When text is **long** (8+ paragraphs with sub-headings), use this layout:
  - **Row 1:** Image centered, capped at native width (obey NO UPSCALING RULE in Step 4)
  - **Row 2:** Text in **2-column silos** (`md:grid-cols-2 gap-x-8`)
  - Place the section **heading + intro paragraph** in the **LEFT silo**, not spanning full width above
- This prevents a tiny image floating next to a wall of text

---

## Step 4: Component Consistency

- **Images:** 
    - `w-full h-auto object-contain rounded-xl shadow-sm border border-gray-100`
    - **CENTERING RULE:** images inside `.prose-dolphin` are centered automatically by the global rule. Just add the `img-cap-N` class. Do not add `mx-auto block`, do not add `rounded-xl`, do not add `shadow-sm` — all are inherited.
    - **NEVER** use `max-h` on vertical (tall) images. It shortens them and ruins the professional look.
    - **NO UPSCALING RULE (simplified 2026-04-20):** body images on `ApplicationLayout` pages MUST use an `img-cap-N` utility class on the `<img>` tag. Available sizes: `img-cap-300`, `img-cap-400`, `img-cap-450`, `img-cap-500`, `img-cap-600`, `img-cap-700`, `img-cap-800`. Pick the class whose number is the closest cap at or above the image native pixel width. Never use `style="max-width:..."`, never use Tailwind `max-w-[Npx]`, never wrap in `<figure style="max-width:...">`. The `img-cap` classes use `!important` and are the single source of truth for body-image sizing.
    - âš ï¸ **NO ANCHOR WRAPPING:** NEVER wrap `<img>` in an `<a href="image.webp">` tag. The global `Lightbox.astro` component auto-attaches click-to-zoom on ALL content images. An `<a>` wrapper intercepts the click and opens the image in a new browser tab instead of the lightbox.
    - **UNIVERSAL BODY-IMAGE CAPTION BAR (GLOBAL):** Body images that use `<figure>` plus `<figcaption>` should render as one unified framed image block. The `<figcaption>` must appear as an attached bottom bar under the image with a light gray background, top border, centered small readable text, modest vertical padding, and no disconnected gap from the image. This is a shared/global body-content style, not a page-local custom class. Do not invent captions; only style existing legacy or Sanjay-approved `<figcaption>` text. Do not apply this rule to hero images. Do not change `img-cap-*` sizing rules.
    - **LIGHTBOX CAPTION RULE (GLOBAL):** Lightbox popup captions must never be generated from image `alt` text. Alt text is for accessibility and SEO, and often needs to be longer than a visible caption. The lightbox must use `data-lightbox-caption` when explicitly present, otherwise the nearest parent `<figure><figcaption>` text, otherwise show no popup caption. Audit this from files by checking `src/components/Lightbox.astro` for `caption.textContent = alt` or equivalent behavior; that pattern is forbidden.
- **Boxes in the Same Row:**
    - MUST be **equal height**. Use `items-stretch` on the grid + `flex flex-col` on each box + `flex-1` on the image wrapper.
    - Shorter images center vertically inside the equal-height box via `flex items-center justify-center`.
- **Tables:** 
    - Wrap in `not-prose overflow-x-auto border border-gray-100 rounded-xl`.
    - Priority: Data readability. If the table looks cramped, change the Grid Ratio or **Stack**.

---

## Step 5: Text Contrast (zero-tolerance)

No text may render in a color that is the same as, or close to, its background. This chronically happens in dark navy CTA boxes where inline links inherit the default `text-navy` link color. Result: invisible dark-on-dark text, only the underline is visible. This must be checked on EVERY page.

**Rule:** On any dark-background block (classes containing `bg-navy`, `bg-slate-8`, `bg-slate-9`, `bg-gray-8`, `bg-gray-9`, or any hex navy/dark CTA wrapper), every text-bearing child inside MUST have an explicit readable light text color class unless the shared component itself enforces it. This includes headings, paragraphs, links, spans, icons, button text, phone/email rows, and small helper text.

| Background | Paragraph text | Link text |
|---|---|---|
| Dark (`bg-navy`, `bg-slate-900`, etc.) | `text-white` or `text-gray-100` | `text-white underline hover:text-gold` (or `text-gold`) |
| Light (`bg-white`, `bg-gray-50`, default prose) | Default / `text-text` | Default / `text-navy` |

**NEVER** leave the default link color on a dark box. The default resolves to `text-navy`, which is the same color as `bg-navy`.

**Known failure pattern:** the "Get a Quote / Sample Testing" CTA box, the "If you have simple, routine questions..." FAQ callout, and the ApplicationLayout "Talk to an Engineer" sidebar card use dark/navy backgrounds. Any text, icon, link, phone/email row, or button label inside them without an explicit readable color can render invisible or low contrast.

**Audit check (file-based only, no browser):**
1. Grep the astro file for `bg-navy`, `bg-slate-8`, `bg-slate-9`, `bg-gray-8`, `bg-gray-9`.
2. For every hit, read the block and list every text-bearing child inside it, including `<h*>`, `<p>`, `<a>`, `<span>`, icons, and button labels.
3. Flag any text-bearing child that does NOT have an explicit readable color class (`text-white`, `text-gray-100`, `text-gold`, etc.) or is not clearly covered by the shared component's own enforced text color.
4. If a dark-box component (e.g. `<CtaBox>` or the ApplicationLayout sidebar contact card) is used and the component itself does not enforce readable light text on every child, the page or component must pass explicit color classes.
5. Specifically verify the ApplicationLayout right sidebar contact card: "Talk to an Engineer", helper text, phone number, email, icons, and quote button text must all remain readable on the navy/gold backgrounds.
6. Do not treat tinted light backgrounds such as `bg-navy/5`, `bg-navy/10`, `bg-slate-50`, or similar pale brand-tint blocks as dark backgrounds. These blocks must keep dark readable text/links (`text-navy`, `text-text`, `text-text-light`). Global selectors like `[class*="bg-navy"]` are dangerous because they also match `bg-navy/5`; do not use them to force white text unless the selector excludes slash-opacity tint classes.

---

### Change-scope safety rule for text-visibility fixes (critical)

When fixing invisible text, disappearing links, wrong link color, or "font" issues, the default fix must be LOCAL to the current page.

Required default approach:
1. Fix the current page's markup or classes first.
2. Prefer changing the current page's wrapper/background class if a shared selector is matching the wrong thing.
3. Prefer adding explicit classes on the current page instead of editing shared layout or global CSS.

Do NOT default to changing shared selectors in `global.css`, layouts, or shared components just because one page has a visibility issue.

Reason:
- A shared CSS change can silently regress 30-40 already-finished pages.
- A page-local class-name collision is safer to fix locally than "cleaning up" global prose or link rules.

If a shared/global fix is truly necessary:
- Call it GLOBAL explicitly.
- Name the shared file being changed.
- State which completed page patterns may be affected.
- Require regression checks on representative completed pages before considering the fix safe.

---

## Step 6: Final Quality Audit

**ðŸ›‘ STOP.** **DO NOT OPEN A BROWSER OR PREVIEW THE PAGE.**
