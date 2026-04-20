# Page Layout Decision Tree (v2.2)

**🛑 STOP.** **DO NOT OPEN A BROWSER OR PREVIEW THE PAGE.**
Doing so crashes the PC due to memory limits. Instead, hand off to the user.

**Purpose:** Ensure technical data clarity and "Industrial Intuition" by matching layout structures to image orientation and content density.

---

## Universal Hero Image Specification
*Mandatory standard for ALL hero images.*

| Property | Specification |
|---|---|
| **Pixel Dimensions** | **1440 × 500 px** (minimum) |
| **Aspect Ratio** | **16:9** or wider (panoramic preferred) |
| **Placement** | `object-cover object-center` |

---

## Step 1: Alignment & The "Starting Line"

**Mandatory:** Keep the `<h2 />`, `<h3 />`, `<h4 />` and introductory paragraph (`<p />`) **FULL-WIDTH** above any grid.
- **Why?** This ensures the "Starting Line" of the technical image and the data-table are perfectly aligned at the top. 
- **NEVER** put the intro paragraph in a 2/3 column - it displaces the image downwards.
- **NEVER** bury an `<h3>` or `<h4>` inside a grid column — all section headings must appear full-width **above** their associated image/table grid.

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
- **NEVER** stack multiple images vertically in a single narrow column — it wastes space and looks unbalanced.

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
    - **CENTERING RULE:** Any image that renders less than full container width MUST be centered. Always add `mx-auto block` to the image class. Use `style="max-width: Xpx;"` (inline, not Tailwind) to cap at native width — then `mx-auto block` will center it. Tailwind `max-w-*` classes get overridden by `.prose-dolphin img` and must not be used for width caps.
    - **NEVER** use `max-h` on vertical (tall) images. It shortens them and ruins the professional look.
    - ⚠️ **NO UPSCALING RULE:** NEVER render an image wider than its native pixel width. If the image file is 600px wide, add `style="max-width: 600px; width: 100%;"` and `mx-auto block`. Using `w-full` alone on a small image will stretch it beyond native resolution, causing visible blur. NOTE: Tailwind classes like `max-w-[600px]` get overridden by `.prose-dolphin img` — always use **inline style** for max-width caps.
    - ⚠️ **NO ANCHOR WRAPPING:** NEVER wrap `<img>` in an `<a href="image.webp">` tag. The global `Lightbox.astro` component auto-attaches click-to-zoom on ALL content images. An `<a>` wrapper intercepts the click and opens the image in a new browser tab instead of the lightbox.
- **Boxes in the Same Row:**
    - MUST be **equal height**. Use `items-stretch` on the grid + `flex flex-col` on each box + `flex-1` on the image wrapper.
    - Shorter images center vertically inside the equal-height box via `flex items-center justify-center`.
- **Tables:** 
    - Wrap in `not-prose overflow-x-auto border border-gray-100 rounded-xl`.
    - Priority: Data readability. If the table looks cramped, change the Grid Ratio or **Stack**.

---

## Step 5: Final Quality Audit

**🛑 STOP.** **DO NOT OPEN A BROWSER OR PREVIEW THE PAGE.**
Doing so crashes the PC due to memory limits. Instead, hand off to the user.
Ask Sanjay to preview the page and answer:
1.  **Hero Quality:** "Is the hero sharp and 16:9? If no, replacement needed?"
2.  **Legacy Sketches:** "Are there hand-drawn or blurry graphs? Should I draw clean SVGs?"
3.  **Starting Line:** "Are the Image and Table aligned perfectly at the top?"
4.  **Invisible Text:** "Can you read ALL text on dark/navy background boxes?" — Check headings, links, and body text inside CTA boxes. The `.prose-dolphin` CSS forces `color: navy` on `h2/h3/h4` and `p a` elements. Any element with `text-white` on a dark box needs the `!important` override already in `ApplicationLayout.astro`. If text is invisible, add `text-white` to the element **and** verify the CSS override exists. 