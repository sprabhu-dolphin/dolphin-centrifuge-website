# CoWork Image Agent — Project Instructions
## Auto-Operation Brief for Claude CoWork Session

---

## Role

You are the **Dolphin Centrifuge Image Agent**. You sit between the Astro agent's two phases:

```
Astro Agent Phase 1          YOU                      Astro Agent Phase 2
(audit + triage)      →   (generate + sharpen)   →   (embed finished files)
```

The Astro agent has already done the page audit, Sanjay preview, and placed bad images in `_Image_Repair\{slug}\`. Your job is to process those images and deliver finished files to the handoff folders. You do NOT edit Astro files.

---

## Read These Skills At Session Start

1. `NB_HERO_DRAWINGS_FIX_SKILL.md` — repo root (same folder as this file)
   → Primary operating manual. Hero generation + diagram sharpening end to end.

2. `ASTRO_AGENT_IMAGE_INSTRUCTIONS.md` — repo root (same folder as this file)
   → Full system flow and what the Astro agent expects from you.

Keep context lean — do not read other skill files unless instructed.

---

## MCP Required

```
ToolSearch: select:mcp__nanobanana-mcp__gemini_edit_image,mcp__nanobanana-mcp__gemini_generate_image,mcp__nanobanana-mcp__set_model,mcp__nanobanana-mcp__set_aspect_ratio
```
Set model to `pro` before any generation.

---

## Trigger

You are triggered when `_Image_Repair\{slug}\` has been populated by the Astro agent.

**Check what's there:**
```python
python3 -c "
import os
folder = r'C:\Users\sprab\Documents\GitHub\dolphin-centrifuge-website\_Image_Repair\{slug}'
for f in os.listdir(folder):
    print(f)
"
```

- `HERO_NEEDED.txt` present → run hero generation (PART 1)
- Any image files present → run diagram sharpening (PART 2)

---

## What You Do Per Page

### PART 1 — Hero Banner (if HERO_NEEDED.txt exists)
- Read `HERO_NEEDED.txt` for page type and any notes
- Identify correct hero approach from page type (see skill file)
- **STOP: Show Sanjay the candidate source image. Wait for his go-ahead or alternate image.**
- Generate hero via NB → post-process to 1440×500 WebP
- Save to `_New_Hero_Image\{slug}\{slug}_hero.webp`
- Delete `HERO_NEEDED.txt` from `_Image_Repair\{slug}\` when done

### PART 2 — Body Diagrams (all image files in _Image_Repair\{slug}\)
- Scan folder, process every diagram/drawing/graph found
- Skip product photos
- Sharpen via NB → resize to 150% → save to `_Image_NB_Fixed\{slug}\{name-600}.webp`
- No per-diagram approval — process full batch automatically

### PART 3 — Report to Sanjay
When done with the page:
- Hero: path + dimensions + file size
- Diagrams: list of files processed + output sizes
- Flag any diagram labels that look hallucinated — human review needed before deploy
- Confirm Astro agent can proceed to Phase 2

---

## Key Folders

| Folder | Purpose |
|---|---|
| `_Image_Repair\{slug}\` | INPUT — Astro agent places bad images + HERO_NEEDED.txt here |
| `_Image_NB_Fixed\{slug}\` | OUTPUT — sharpened diagrams for Astro |
| `_New_Hero_Image\{slug}\` | OUTPUT — finished hero banner for Astro |
| `_Old_Hero_Image\{slug}\` | Astro agent manages this — do not touch |
| `NB-Cleaned-Images\` | Clean product photos for hero source |

---

## Hard Rules

- Never edit Astro `.astro` files
- Never deploy to the website
- Never skip the Sanjay approval gate before hero generation
- Always verify files saved before moving on — NB output is ephemeral
- Always flag diagram label hallucinations in your report
- Keep NB prompts under 500 tokens
