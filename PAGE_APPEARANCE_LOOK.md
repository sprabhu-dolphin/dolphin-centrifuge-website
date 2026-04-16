# Page Layout Decision Tree

**Purpose:** Use this decision tree for EVERY image/section layout decision. No interpretation needed - follow the IF/THEN logic.

**Core principle: Eliminate massive empty white voids and minimize blank vertical space.** 

---

## Universal Hero Image Specification

**This is the mandatory size standard for ALL hero images across ALL pages.**

The Hero component renders at full browser width with `object-cover object-center`.

| Property | Specification |
|---|---|
| **Pixel Dimensions** | **1440 × 500 px** (minimum) |
| **Aspect Ratio** | **16:9** or wider (e.g. 3:1 panoramic) |
| **File Format** | **WebP** preferred · JPEG fallback |
| **Max File Size** | **200 KB** |
| **Subject Position** | Subject/key content must be **center-frame** — edges will be cropped on mobile |
| **Quality** | Must be sharp at 100% zoom. No pixelation. No stretching. |
| **Min rendered height** | 320px mobile · 380px tablet · 420px desktop |

### Why 1440 × 500?
The Hero.astro component CSS is:
- `min-h-[320px] md:min-h-[380px] lg:min-h-[420px]`
- `object-cover object-center` — image fills full width and is cropped vertically
- Full-width container up to 1280px + gutters

A 1440px wide image ensures zero upscaling on any screen. 500px height ensures no vertical pixelation at any breakpoint.

### Hero Image → Stop-and-Check Rule
Before committing any page:
1. View the hero on the local dev server at desktop width
2. If it looks **stretched, blurry, or barely visible** → flag it
3. Ask Sanjay: **"The hero image on this page appears low quality. Do you want a replacement?"**

---

## Step 1: Is There Enough Adjacent Text for Side-by-Side?

IF adjacent text is SHORT (less than 4-5 lines, e.g., just 1-2 sentences) AND the image is tall:
    -> DO NOT put them side-by-side. This creates a massive empty white void.
    -> STACK it. Place the text full-width above or below the image.
    -> Layout for stacked image: `<div class="not-prose mb-8 flex justify-center"><div class="w-full max-w-sm md:max-w-md"> ... </div></div>`
    -> Go to CAPTION rule

IF adjacent text is SUBSTANTIAL (a large, dense paragraph of 5+ lines, or multiple paragraphs/lists):
    -> SIDE-BY-SIDE (CSS GRID ONLY - NEVER USE FLEXBOX)
    -> Grid Wrapper: `<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 items-start">`
    -> Image Container (1/3 width): `<div class="not-prose"> ... </div>`
    -> Text Container (2/3 width): `<div class="md:col-span-2 prose prose-lg max-w-none"> ... </div>`
    -> Go to Step 2 for image sizing

IF unsure:
    -> Default to STACKED (Text full width on top, image centered below). It is always safer and cleaner than leaving vast empty spaces.

## Step 2: Image Sizing Within Side-by-Side

IF image is a diagram, chart, or infographic
    -> Needs more width to stay readable. Use 50/50 CSS Grid:
    -> Grid Wrapper: `<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 items-start">`
    -> Image Container: `<div class="not-prose"> ... </div>`
    -> Text Container: `<div class="prose prose-lg max-w-none"> ... </div>`

IF image is a large equipment/system photo (centrifuge skid, full assembly)
    -> Image at 50% width using grid-cols-2 (see above).

IF image is a product/equipment detail photo
    -> STRICTLY use 1/3 CSS Grid:
    -> Grid Wrapper: `<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 items-start">`
    -> Image Container: `<div class="not-prose"> ... </div>`
    -> Text Container: `<div class="md:col-span-2 prose prose-lg max-w-none"> ... </div>`

## Step 3: When to Stack (Override Side-by-Side)

STACK when:
    -> Adjacent text is too short (creates a blank void).
    -> Diagram is too complex/detailed to read at half-width.
    -> Image is very wide and short (aspect ratio > 3:1) - would look crushed in CSS Grid.

Layout for stacked:
`<div class="not-prose mb-8 flex justify-center"><div class="w-full max-w-sm md:max-w-md"> ... </div></div>`

## Step 4: Multiple Images in the Same Section (The "Gallery Fix")

IF a single logical section contains TWO (or more) images:
    -> DO NOT stagger them (e.g., Image 1 side-by-side, then Image 2 stacked below). It looks clunky.
    -> Group the images into a uniform CSS Grid (`grid-cols-2`).
    -> Place the text FULL-WIDTH above or below the image grid.
    -> Force uniform image heights using `aspect-[4/3] object-contain` or `aspect-square object-contain`.

## Step 5: Uniform Image Sizing (The "Test Tube" Fix)

Purpose: Prevent extreme size disparities between tall (portrait) and wide (landscape) images in side-by-side layouts.

IF an image is placed in a 1/3 CSS Grid column:
-> You MUST constrain its maximum height and force it to contain itself proportionally.
-> Add these specific Tailwind classes to the <img> tag itself: max-h-64 object-contain mx-auto w-full

Correct Side-by-Side Image HTML:
HTML

<div class="not-prose flex justify-center">
    <img src="..." alt="..." class="w-full max-h-64 object-contain mx-auto rounded-xl bg-white border border-gray-200" />
</div>

Note: max-h-64 restricts the image to 16rem (256px) tall. object-contain ensures it never stretches or distorts.

Layout Structure Template:
```html
<div class="prose prose-lg max-w-none mb-8">
    <p>...paragraphs...</p>
</div>

<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 items-start">
    <div class="not-prose">
        <img src="..." alt="..." class="w-full aspect-[4/3] object-contain rounded-xl bg-white border border-gray-200" />
        <p class="text-gray-500 text-sm mt-2 text-center">Caption 1</p>
    </div>
    <div class="not-prose">
        <img src="..." alt="..." class="w-full aspect-[4/3] object-contain rounded-xl bg-white border border-gray-200" />
        <p class="text-gray-500 text-sm mt-2 text-center">Caption 2</p>
    </div>
</div>

---

## Step 6: Image Quality Review (MANDATORY — Ask Sanjay Before Every Commit)

Before finalizing any page, the agent MUST review ALL images on the page and ask:

### Hero Image Check
- Is the hero image **sharp, non-pixelated, and correctly proportioned** (16:9 or 3:2)?
- Many legacy hero images are **stretched, low-resolution, or barely visible** on the new layout.
- If the answer is NO → Ask: **"The hero image appears poor quality. Do you want a replacement before we commit?"**

### Inline Sketch / Diagram / Graph Check
Flag any image that is any of the following:
- A **hand-drawn sketch** or **low-res scan** from the original WordPress page
- A **pixelated or blurry diagram** that is hard to read
- A **graph or chart** that could benefit from a clean SVG redraw (per `SEO-AND-STANDARDS.md` Section 2 — Graphs & Technical Diagrams)

→ Ask: **"I see [X] legacy sketches/diagrams on this page. Do you want any of these redrawn or replaced before we commit?"**

### Rule
**Never commit a page** with a known bad hero image or a low-quality legacy diagram **without Sanjay's explicit OK.**
This question is mandatory — ask it even if you believe the images are acceptable.