# Page Layout Decision Tree

**Purpose:** Use this decision tree for EVERY image/section layout decision. No interpretation needed - follow the IF/THEN logic.

**Core principle: Minimize blank vertical space.** Side-by-side is the default when there's enough text. Stacking is the fallback when there isn't.

---

## Step 1: Is There Enough Adjacent Text for Side-by-Side?

```
IF adjacent text is less than ~3 lines (one sentence, a "Learn more" link, etc.)
    -> STACK it (image standalone, text below or above)
    -> One sentence next to an image = dead space. Don't do it.
    -> Go to CAPTION rule

IF adjacent text is 1 paragraph (3+ lines), a paragraph + list, or 2+ paragraphs
    -> SIDE-BY-SIDE (md:flex md:gap-6)
    -> Image: md:w-1/3 shrink-0 object-contain
    -> Text: flex-1
    -> Overflow text flows full-width below per Rule A
    -> Go to Step 2 for image sizing

IF unsure
    -> Check LW's layout. Match whatever LW did.
```

## Step 2: Image Sizing Within Side-by-Side

```
IF image is a diagram, chart, or infographic
    -> Image at md:w-1/2 (diagrams need more width to stay readable)
    -> Text: flex-1
    -> If the diagram is too complex to read at half-width, STACK it instead

IF image is a large equipment/system photo (centrifuge skid, full assembly)
    -> Image at md:w-1/2
    -> Text: flex-1

IF image is a product/equipment detail photo
    -> Image at md:w-1/3 shrink-0
    -> Text: flex-1
```

## Step 3: When to Stack (Override Side-by-Side)

```
STACK when:
    -> Adjacent text is less than ~3 lines (Step 1)
    -> Diagram is too complex/detailed to read at half-width
    -> Image is very wide and short (aspect ratio > 3:1) - would look crushed in side-by-side

Everything else: SIDE-BY-SIDE to minimize vertical blank space.
```

## Step 4: Multiple Images in a Row?

```
IF 2+ images need to appear together (grid)
    -> Use grid layout with uniform sizing
    -> NEVER object-cover (crops equipment photos)
    -> Go to CAPTION rule

    IF images are product/equipment thumbnails (cards, model listings)
        -> aspect-square object-contain (forces uniform height in grid)

    IF images are diagrams, charts, animations, or wide-format technical images
        -> object-contain ONLY — NO aspect-square
        -> Preserve natural aspect ratio. Forcing square adds dead space.
```

---

## Layout Rules (A-G)

### Rule A: No Wasted Vertical Space
Side-by-side layouts must fill their row. If text overflows the image height, let it flow below the image as full-width content within the same section box.

- Image width: 30-35% for equipment photos (md:w-1/3), 50% for diagrams/charts (md:w-1/2)
- Text: flex-1
- Bad: 45% image + 55% text where text runs 3x longer than image
- Good: 30% image + 70% text, overflow goes full-width below

### Rule B: Image Sizing by Context

| Context | Width | Layout |
|---------|-------|--------|
| Equipment photo beside text | 30-35% (md:w-1/3) | Side-by-side |
| Diagram/chart beside text | 50% (md:w-1/2) | Side-by-side |
| System/skid photo beside text | 50% (md:w-1/2) | Side-by-side |
| Image with <3 lines of text | max-w-2xl centered | Stacked |
| Before/after or test results | 35% | Side-by-side with table |
| Product cards | aspect-square | Grid of equal cards |
| Grid images | aspect-square object-contain | Uniform height |

### Rule C: NEVER object-cover on Equipment Images
`object-cover` CROPS parts of the image. Equipment photos must NEVER be cropped.
- ALWAYS use `object-contain` (scales to fit, preserves full image)
- This applies everywhere: side-by-side, grids, standalone, cards

### Rule D: Product Cards - Uniform Specs
ALL ProductCards in a grid row must have identical spec rows (same labels in same order). If one card has Bowl RPM, ALL cards must have Bowl RPM.

### Rule E: Equipment Lists - Grid After Image
When a section has image + list of equipment/features:
- Image + intro + first 1-2 items side-by-side
- Remaining items in 2-3 column grid below

### Rule F: Section Spacing
- `mb-3` between paragraphs (not mb-4)
- `mb-2` for lists following a label
- `space-y-1` for list items
- `gap-3` for equipment grids (not gap-6)
- Section boxes: `p-6 md:p-8 mb-8`

### Rule G: Captions
Every image gets a caption: `text-gray-500 text-sm mt-1 text-center`. No exceptions.

---

## Quick Reference: Common Mistakes

| Mistake | Fix |
|---------|-----|
| Image stacked when there's 3+ lines of adjacent text | Side-by-side - minimize vertical blank space |
| object-cover on equipment photo | Change to object-contain |
| Diagram at md:w-1/3 (too narrow to read) | Use md:w-1/2 for diagrams/charts |
| Grid images at different heights | aspect-square object-contain on all |
| 45% image width leaving empty column | Reduce to 30-35% for equipment, 50% for diagrams |
| No caption on image | Add text-gray-500 text-sm mt-1 text-center |
| Aesthetic rules skipped before review | NEVER skip - content -> aesthetics -> self-review -> deploy -> mutual review |

## Images Resource: Pre-sized and cleaned equipment photos are available. Ask Sanjay instead of using mis-sized, old (blurry) photo from the LW.
