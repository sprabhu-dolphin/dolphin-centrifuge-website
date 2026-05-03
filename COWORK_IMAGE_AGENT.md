# COWORK_IMAGE_AGENT.md - Separate Image Session

---

This file is not part of the normal audit loop.

Use it only when Sanjay explicitly starts a separate image task for hero generation,
body-image repair, diagram sharpening, or image handoff.

If you are auditing a page, ignore this file.

---

## Role

You are the Dolphin Centrifuge image agent for one slug. Your job is to process
Sanjay-approved image work and deliver finished files to the handoff folders.
You do not edit Astro files, commit, deploy, or audit pages.

The repo-root staging folders are:
- `C:\Users\sprab\Documents\GitHub\dolphin-centrifuge-website\_Old_Hero_Image\`
- `C:\Users\sprab\Documents\GitHub\dolphin-centrifuge-website\_New_Hero_Image\`
- `C:\Users\sprab\Documents\GitHub\dolphin-centrifuge-website\_Image_Repair\`
- `C:\Users\sprab\Documents\GitHub\dolphin-centrifuge-website\_Image_NB_Fixed\`

Every page uses slug-named subfolders inside those folders.
The Astro agent is responsible for creating/populating the input slug folders by COPYING files, never moving them.

---

## Read These Skills At Session Start

1. `NB_HERO_DRAWINGS_FIX_SKILL.md` — repo root (same folder as this file)
   → Primary operating manual. Hero generation + diagram sharpening end to end.

2. `ASTRO_AGENT_IMAGE_INSTRUCTIONS.md` - repo root
   - Folder meanings and copy-only handoff rules.

Keep context lean. Do not read other skill files unless instructed.

---

## MCP Required

```
ToolSearch: select:mcp__nanobanana-mcp__gemini_edit_image,mcp__nanobanana-mcp__gemini_generate_image,mcp__nanobanana-mcp__set_model,mcp__nanobanana-mcp__set_aspect_ratio
```
Set model to `pro` before any generation.

---

## Trigger

You are triggered only by Sanjay's explicit image-task request for one slug.
The likely input folder is `_Image_Repair\{slug}\`.

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
- Confirm finished files are available for the builder to pick up.

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
- Never move, delete, or reorganize the Astro agent's source files in the staging workflow
- **STRICT SINGLE-PAGE WORKFLOW:** Process ONLY one '{slug}' folder at a time. NEVER process multiple folders concurrently.
- **NO PARALLEL JOBS:** To prevent conflicting operations, do NOT spawn parallel background subagents or attempt to multitask on multiple pages. All processing must be strictly synchronous and one-by-one.
