# ASTRO_AGENT_IMAGE_INSTRUCTIONS.md - Image Handoff Folders

Active protocol as of 2026-05-03.

## Scope

This file is only for separate, on-demand image work. It is not part of the normal page-audit loop unless Sanjay explicitly asks for image processing, image repair, hero replacement, or image handoff.

There is no assumed live image worker during normal page migration. Do not stop page work waiting for another agent unless Sanjay starts that image session.

## Repo-Root Folders

All image handoff work uses slug-named subfolders under these repo-root folders:

- `_Old_Hero_Image\{slug}\`
- `_New_Hero_Image\{slug}\`
- `_Image_Repair\{slug}\`
- `_Image_NB_Fixed\{slug}\`

## Folder Meaning

- `_Old_Hero_Image\{slug}\` holds a copy of the old/current hero for reference or fallback.
- `_New_Hero_Image\{slug}\` receives Sanjay-approved or image-session finished hero files.
- `_Image_Repair\{slug}\` holds old/current body images that may need repair, redraw, or Sanjay review.
- `_Image_NB_Fixed\{slug}\` receives finished repaired body images.

## Hard Rules

- Copy only. Never move source images.
- Never delete original/source images.
- Never overwrite Sanjay-supplied or Sanjay-approved replacement images unless he explicitly says to replace that exact file.
- Never reference `_Image_Repair\` or `_Image_NB_Fixed\` directly from Astro page source. Finished files must be copied into the correct `public/images/{slug}/` location before page wiring.
- Keep one slug at a time.
- Use file-based verification only. Do not open a browser or localhost preview.

## Normal Handoff Steps

1. Create the four slug folders when image work is needed.
2. Copy the old/current hero into `_Old_Hero_Image\{slug}\` if hero replacement is being considered.
3. Copy body images needing repair or review into `_Image_Repair\{slug}\`.
4. Leave `_New_Hero_Image\{slug}\` and `_Image_NB_Fixed\{slug}\` ready for finished files.
5. When finished images are supplied, copy them into `public/images/{slug}/`.
6. Update the page image references, factual `width` and `height`, `img-cap-*` sizing class, `alt`, and real `<figure><figcaption>` captions.
7. Ask Sanjay for visual preview if the image choice, crop, or technical fidelity needs human review.

## Current-File Lists

Do not keep page-specific "ready for pickup" lists in this file. Those become stale quickly. Use the actual slug folders and committed page state as the source of truth.
