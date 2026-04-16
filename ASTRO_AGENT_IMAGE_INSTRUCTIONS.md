# Image Handoff Instructions — Astro Build Agent

## System Process Flow

The Astro agent has **two phases** per page. The CoWork Image Agent runs between them.

```
ASTRO AGENT — Phase 1         IMAGE COWORK AGENT           ASTRO AGENT — Phase 2
──────────────────────    →   ──────────────────────   →   ──────────────────────
Text fidelity check           Generates hero banner         Pick up hero from
SEO checks                    Sharpens bad diagrams         _New_Hero_Image\
PAGE_APPEARANCE_LOOK.md       Drops finished files          Pick up diagrams from
Sanjay preview                in handoff folders            _Image_NB_Fixed\
↓                                                           Embed in page
Identify bad images
Place in _Image_Repair\
Flag hero if needed
STOP — hand off to
Image CoWork Agent
```

---

## PHASE 1 — Page Audit & Image Triage (Do This First)

### Step 1 — Standard page checks
- Text fidelity vs Legacy WordPress page (SOURCE OF TRUTH)
- SEO checks
- Apply `PAGE_APPEARANCE_LOOK.md`
- Get Sanjay to preview

### Step 2 — Image triage (after Sanjay preview)

Identify images that need fixing:

| Image Type | Condition | Action |
|---|---|---|
| Technical diagram / drawing | Blurry, pixelated, low-res | Copy to `_Image_Repair\{slug}\` |
| Graph / cross-section / sketch | Blurry, pixelated, low-res | Copy to `_Image_Repair\{slug}\` |
| Product photo | Blurry or wrong | Copy to `_Image_Repair\{slug}\` |
| Hero banner | Missing, broken, stretched, wrong | Flag as "hero needed" (see below) |
| Any image | Already sharp and correct | Leave in place — do NOT copy |

### Step 3 — Hero flag

If the page needs a new hero, create a flag file:
```
_Image_Repair\{slug}\HERO_NEEDED.txt
```
Contents of the file:
```
Page: {slug}
Page type: [Application | Model | KB-product | KB-engineering | KB-troubleshooting]
Notes: [any specific notes for the Image Agent e.g. "machine is WHPX-513"]
```
The Image Agent reads this flag and knows to generate a hero for this page.

### Step 4 — Hand off to Image CoWork Agent

Once `_Image_Repair\{slug}\` is populated:
- Notify Sanjay that image triage is complete for `{slug}`
- Stop work on this page
- The Image CoWork Agent takes over

Do NOT continue building the page until the Image CoWork Agent has delivered finished files.

---

## PHASE 2 — Embed Finished Images (After Image CoWork Agent)

### Hero Banner

**Where to find it:**
```
_New_Hero_Image\{slug}\{slug}_hero.webp   (1440×500px WebP, 50–150KB)
```

**Step-by-step:**
1. Check `_New_Hero_Image\{slug}\{slug}_hero.webp` exists
2. Archive old hero → `_Old_Hero_Image\{slug}\{slug}_hero.webp`
3. Copy new hero → correct Astro `public/images/` location per page frontmatter
4. Rename `{slug}_hero.webp` → `{slug}_hero.webp.done` (prevents double-processing)

### Body Diagrams

**Where to find them:**
```
_Image_NB_Fixed\{slug}\{filename-600}.webp
```
One file per diagram. The number in the filename = actual pixel width of the sharpened file.

**How to wire in Astro — one file, two uses:**
```
src=   "_Image_NB_Fixed/{slug}/{name-600}.webp"   ← Astro resizes to original display width
```
Keep original `width=` attribute unchanged. CSS constrains display. Lightbox opens at full pixel size automatically.

`_Image_Repair\` is NEVER referenced in Astro source. It is the Image Agent's input only.

---

## Phase 2 — STOP After Deploy

After copying files and updating src= references:
- ✅ Archive old hero to `_Old_Hero_Image\`
- ✅ Deploy new hero to `public/images/`
- ✅ Deploy fixed diagrams to `public/images/`
- ✅ Update all `src=` references in `.astro` file
- 🛑 **STOP. Do NOT open a browser. Do NOT take screenshots. Do NOT review.**

Tell Sanjay: **"Phase 2 complete. Images deployed. Please review on your end and reply 'Commit' or 'Changes needed'."**

Sanjay will review on his own machine and return with the verdict.
This prevents context window bloat and PC overheating from browser subagent calls.


---

## What NOT To Do

- ❌ Do not re-compress, resize, or convert any file from `_Image_NB_Fixed\` or `_New_Hero_Image\`
- ❌ Do not place a hero without archiving the old one first
- ❌ Do not reference `_Image_Repair\` anywhere in Astro
- ❌ Do not delete anything from `_Old_Hero_Image\`
- ❌ Do not proceed to Phase 2 until Image CoWork Agent confirms it is done

---

## Current Files Ready for Pickup (Phase 2)

| Slug | Asset | Type | Status |
|---|---|---|---|
| `alfa-laval-centrifugal-separator` | `{slug}_hero.webp` | Hero 1440×500 | ✅ Ready |
| `alfa-laval-centrifugal-separator` | `alfa-laval-disc-centrifuge-bowl-cross-section-600-1.webp` | Diagram | ✅ Ready |
| `alfa-laval-centrifugal-separator` | `decanter-bowl-scroll-rotation-600.webp` | Diagram | ✅ Ready |
