---
name: NB_HERO_DRAWINGS_FIX_SKILL
description: Two-part NB image skill for Dolphin Centrifuge website pages. 

PART 1 - Generate 1440x500 hero banners (machine on gradient OR photorealistic industrial scene OR sharpened drawing full-bleed). 

PART 2 - Sharpen blurry technical diagrams for page body lightbox. Claude Code does all NB work; Astro build agent picks up finished files. Trigger on "hero for [page]", "fix diagrams for [page]", or "image work for [page]".
---

# NB Hero + Drawings Fix Skill

## MCP Setup (Once Per Session)
```
ToolSearch: select:mcp__nanobanana-mcp__gemini_edit_image,mcp__nanobanana-mcp__gemini_generate_image,mcp__nanobanana-mcp__set_model,mcp__nanobanana-mcp__set_aspect_ratio
```
Always set model to `pro` before any generation or edit.

---

## PART 1 — Hero Banner (1440×500 WebP, 50–150KB)

### Step 1 — Identify hero type by page

| Page Type | Hero Approach |
|---|---|
| Application page (Waste Oil, Biodiesel, etc.) | Machine in photorealistic industrial scene |
| Centrifuge model page / KB product article | Machine on brand gradient — Layout A |
| Design & engineering / cross-sections / troubleshooting | Sharpened drawing, full-bleed, centered |

### Step 1b — STOP: Show Sanjay the candidate image first

Before generating any hero, show Sanjay the source image you plan to use and ask:
> "Here is the image I plan to use for the [page] hero. OK to proceed with NB sharpening — or are you providing a different image?"

**Do not run NB until Sanjay confirms.** This saves API credits and avoids wasted generations.

### Step 2 — Generate

**TYPE A — Photorealistic industrial scene (Application pages)**
- Machine composited into the relevant industrial environment
- Scene naturally provides contrast for the frosted tile — no gradient needed
- Machine positioned right side, left area calmer for frosted tile overlap
- Prompt rules: match lighting, skid flat on floor, connect flanges, correct fluid (if shown), authentic environment
- See Iron Rules in `NB_IMAGE_SKILL.md` for full prompt framework

**TYPE B — Machine on gradient (Model / KB pages)**
- Layout A: machine in right third, left 65% open
- Brand gradient — locked, no per-page approval needed:
  - LEFT (frosted tile area): `#EEF2F7` → `#24507A`
  - RIGHT (machine area): `#1B3A5C` → `#122840`
- Prompt: "Smooth gradient background, #EEF2F7 left fading to #122840 right. [Machine] placed in right third, fully visible, no clipping. Left area completely open. No floor, no environment, no text."
- Source images: `C:\Users\sprab\Documents\Projects\DolphinWeb\NB-Cleaned-Images\`

**TYPE C — Drawing / diagram full-bleed (Engineering / Troubleshooting pages)**
- Sharpen the source drawing with NB first (see PART 2 below)
- Then generate hero: sharpened drawing fills full 1440×500, centered
- No gradient — drawing IS the background
- Frosted tile handles its own contrast — no dimming needed
- Prompt: "Place this technical diagram centered and scaled to fill the full frame as a hero banner background. Keep all labels and lines crisp and clear. White background."

### Step 3 — Post-process to 1440×500

NB always outputs ~1376×768 at 16:9. Always resize + crop with PIL:

```python
python3 -c "
from PIL import Image
import os
src = r'<NB output .jpg path>'
out = r'C:\Users\sprab\Documents\GitHub\dolphin-centrifuge-website\_New_Hero_Image\<slug>\<slug>_hero.webp'
os.makedirs(os.path.dirname(out), exist_ok=True)
img = Image.open(src)
scale = 1440 / img.width
new_h = int(img.height * scale)
img = img.resize((1440, new_h), Image.LANCZOS)
top = (new_h - 500) // 2
img = img.crop((0, top, 1440, top + 500))
img.save(out, 'webp', quality=85)
print(img.size, os.path.getsize(out)//1024, 'KB')
"
```
If over 150KB → drop quality to 75.

### Step 4 — Builder Agent Handoff

Drop finished hero at:
```
_New_Hero_Image\{slug}\<slug>_hero.webp
```
Builder agent: archives old hero → places new → renames to `<slug>_hero.webp.done`

---

## PART 2 — Sharpen Body Diagrams (Lightbox Version)

**Scope:** Technical drawings, cross-sections, graphs, labeled diagrams ONLY. Skip product photos.

### Step 0 — Scan and process all diagrams in the subfolder

Claude Code scans `_Image_Repair\{subfolder}\` and processes **every file** found there automatically. No per-file approval needed for body diagrams — process the full batch.

```python
python3 -c "
from PIL import Image
import os
folder = r'C:\Users\sprab\Documents\GitHub\dolphin-centrifuge-website\_Image_Repair\{subfolder}'
for f in os.listdir(folder):
    img = Image.open(os.path.join(folder, f))
    print(f'{f}: {img.size}')
"
```

Skip any file that is clearly a product photo (not a diagram/drawing/graph).

### Step 1 — Get source dimensions
```python
python3 -c "from PIL import Image; img=Image.open(r'<path>'); print(img.size)"
```

### Step 2 — NB edit
```
set_model(model="pro", conversation_id="image-repair")
gemini_edit_image(
  image_path="<_Image_Repair\{subfolder}\{name}.webp>",
  edit_prompt="Technical [cross-section/diagram/graph] of [subject] for engineering website. Sharpen and enhance. Make all labels crisp and readable. Enhance line clarity and color vibrancy. *Important: Preserve all details, labels, arrows exactly — do not add, remove, or change anything.* Clean white background.",
  output_path="<_Image_NB_Fixed\{subfolder}\{name}.jpg>",
  conversation_id="image-repair",
  aspect_ratio="<16:9 for landscape | 4:3 for near-square>"
)
```

### Step 3 — Resize to 150% + convert to WebP
```python
python3 -c "
from PIL import Image
import os, glob
folder = r'_Image_NB_Fixed\{subfolder}'
base = '{source-filename-without-extension}'
src_w, src_h = <original width>, <original height>
nb_file = [f for f in os.listdir(folder) if base in f and not f.endswith('.webp')][0]
img = Image.open(os.path.join(folder, nb_file))
tw, th = int(src_w*1.5), int(src_h*1.5)
img = img.resize((tw, th), Image.LANCZOS)
# Update pixel number in filename: diagram-400.webp → diagram-600.webp
new_name = nb_file.replace(str(src_w), str(tw)).rsplit('.',1)[0] + '.webp'
dst = os.path.join(folder, new_name)
img.save(dst, 'WEBP', quality=92, method=6)
os.remove(os.path.join(folder, nb_file))
print(f'Saved: {new_name}  {tw}x{th}px  {os.path.getsize(dst):,} bytes')
"
```

### Step 4 — Astro Builder Handoff

| Usage | Path |
|---|---|
| `src=` (Astro resizes to display size) | `_Image_NB_Fixed\{subfolder}\{name-600}.webp` |
| `lightbox href=` (shown at full 600px) | same file |

**`_Image_Repair\` is NEVER referenced by the website.**

---

## ⚠️ Key Warnings

- **NB always saves as JPG** regardless of extension specified — always post-process
- **Label hallucination:** NB may corrupt text labels on diagrams — human review before deploy
- **NB output is ephemeral** — save immediately, verify file exists before moving on
- **Keep prompts under 500 tokens** — quality degrades above that

---

## File Paths Quick Reference

| Asset | Path |
|---|---|
| Cleaned product images (hero source) | `C:\Users\sprab\Documents\Projects\DolphinWeb\NB-Cleaned-Images\` |
| Hero final output | `_New_Hero_Image\{slug}\hero.webp` |
| Blurry diagrams (input) | `_Image_Repair\{subfolder}\{name-400}.webp` |
| Sharpened diagrams (output) | `_Image_NB_Fixed\{subfolder}\{name-600}.webp` |
