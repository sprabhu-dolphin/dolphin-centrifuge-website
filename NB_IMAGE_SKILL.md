---
name: NB_IMAGE_SKILL
description: Generate photorealistic hero images for Dolphin Centrifuge application pages by compositing real centrifuge photos into industrial environments via Nano Banana 2 MCP. Use when the user says "generate hero", "NB hero", "hero image for [page]", "nano banana", "application hero", or when any page needs a new hero image. Also triggers on "make a hero", "create hero", "new hero for". Requires Sanjay's approval per page.
---

# Dolphin NB Master Image Skill

Generate photorealistic website hero images by placing a real Dolphin Centrifuge into application-specific industrial environments. The centrifuge is LOCKED — only the background environment changes.

---

## ⚠️ SETUP RECORD — Lessons Learned (April 2026, Home PC Setup)

This section documents the exact issues hit during first-time setup on a new machine and how they were resolved. Read this before touching any config.

### 1. Wrong MCP Package
**What happened:** First attempt used `@nanana-ai/mcp-server-nano-banana` — a third-party service called nanana.app that has its own account/token system completely unrelated to Google Gemini. It connected but returned "Invalid or missing API token" because it needs a nanana.app account token, NOT a Gemini key.

**Fix:** Delete that entry. Use `@ycse/nanobanana-mcp` — this is the correct package that uses Google's Gemini image generation (Nano Banana Pro = Gemini 3 Pro Image).

### 2. Wrong API Key Variable Name
**What happened:** nanana.app uses `NANANA_API_TOKEN`. The correct package uses `GOOGLE_AI_API_KEY`. Using the wrong variable name means the key is never passed even if the package is right.

**Fix:** Always use `GOOGLE_AI_API_KEY` with the Gemini API key.

### 3. Wrong Config File Location (Claude Desktop on Windows)
**What happened:** Tried `~/.claude/settings.json` (wrong — that's Claude Code CLI config), then `~/.claude/.mcp.json` (wrong), then `~/.mcp.json` (wrong for Claude Desktop). None of these work for Claude Desktop on Windows.

**Fix:** The ONLY correct location for Claude Desktop MCP config on Windows is:
`C:\Users\{username}\AppData\Roaming\Claude\claude_desktop_config.json`
i.e. `%APPDATA%\Claude\claude_desktop_config.json`

### 4. file:// URLs Don't Work (nanana.app package only)
**What happened:** With the wrong nanana.app package, image URLs are sent to nanana.app's servers which cannot reach local `file://` paths.

**Fix:** Not relevant with `@ycse/nanobanana-mcp` — this package accepts local Windows absolute paths directly in `reference_images`. No HTTP server needed.

### 5. Output is Always .JPG — Never .PNG
**What happened:** Specifying `.png` in `output_path` causes confusion — the MCP saves as `.jpg` regardless. Skill files previously said "NB outputs extensionless PNG files" — this was wrong for the current package.

**Fix:** Always specify `.jpg` extension in `output_path`. Never `.png`. The file on disk will be JPEG format.

### 6. Native Output is 1376×768, Not 1440×500
**What happened:** 1440×500 is not a Gemini output ratio. Closest available is 16:9 which outputs ~1376×768.

**Fix:** Generate at 16:9, then post-process: resize width to 1440px → center-crop height to 500px using Python/Pillow.

### Correct Working Config
```json
{
  "mcpServers": {
    "nanobanana-mcp": {
      "command": "npx",
      "args": ["-y", "@ycse/nanobanana-mcp"],
      "env": {
        "GOOGLE_AI_API_KEY": "AIzaSyCTw2pAbIlfSeeWG5bUlcjwBtn_bnO0Rzg"
      }
    }
  }
}
```
Restart Claude Desktop after any config change.

---

## Goal Statement

**Clear, NB-generated, realistic hero showing the actual Dolphin centrifuge — perfectly blended with the relevant background.** The result must look like a professional photographer walked into a real facility and shot the centrifuge where it was installed.

---

## Safety Gate (MANDATORY)

Before generating ANY image:
1. Sanjay has explicitly approved AI image generation for this specific page
2. A real Dolphin Centrifuge reference photo has been identified (never AI-generated base)
3. If no base image is specified, ask Sanjay which reference photo to use

If ANY condition is unmet — STOP and ask.

---

## Base Image Selection Guide

| Preference | Why |
|-----------|-----|
| **BEST: Multi-unit system on a skid, on a real floor** | Already grounded, proportions established, natural shadows present |
| **GOOD: Full machine in context (facility, shop floor)** | Environment cues help NB blend naturally |
| **AVOID: Isolated unit on plain/white background** | Produces floating, disconnected composites |
| **AVOID: Close-up details or cutaways** | Need full machine visible for hero composition |
| **AVOID: Photos shot outdoors** | Most centrifuge photos are indoor-lit; outdoor environments create lighting mismatches |

If multiple candidates exist, pick the one showing the most real-world context around the centrifuge.

---

## The 10 Iron Rules of NB Hero Generation

These rules were learned through 20+ iterative generations. Every one was earned the hard way.

### 1. LIGHTING MATCH IS KING
The #1 killer of realism. If the base centrifuge photo was shot under bright indoor fluorescents, the environment MUST also be brightly lit. A bright centrifuge in a dark engine room or outdoor overcast scene looks instantly fake. **Always match the environment lighting type and intensity to the centrifuge's native lighting.**

### 2. SKID SITS FLAT ON THE FLOOR
The skid base must meet the environment floor with NO visible seam, color shift, or shadow discontinuity. Describe the floor material extending continuously under and around the skid. The machine must look bolted down, not placed on top.

### 3. SCALE AND PROPORTION MATTER
The centrifuge must be correctly sized relative to the surrounding environment. A full-size centrifuge in a tiny shop looks absurd. Either use a smaller centrifuge base photo or describe a larger facility. Background equipment (CNC machines, tanks, generators) must be proportionally correct.

### 4. NATURAL PLACEMENT — NEVER CENTER STAGE
Position the centrifuge naturally to the side, tucked next to the equipment it serves — against a wall, beside a machine tool, next to a sump or reservoir, along a pipe run. NEVER floating in the center of an open factory floor. It should look installed, not displayed.

### 5. CONNECT THE FLANGES
Disconnected inlet/outlet flanges and couplings are the biggest "composite" tell. If the base image shows open connection points on the skid edge, describe hoses or steel pipes connecting to them. **CRITICAL NB BEHAVIOR:** NB tends to ADD new flanges beside the originals instead of connecting to existing ones. Counter this by explicitly stating: "Connect to the EXISTING open flanges already visible on the skid — do NOT add new flanges." If hose connections fail after 2 attempts, accept without — overall composition matters more.

### 6. MATCH THE FLUID TO THE APPLICATION
Show the correct fluid type for the application. Don't show milky white coolant on a cutting oil page (cutting oil is amber/dark). Don't show clean water on a waste oil page. The visible fluid (in hoses, reservoirs, sight glasses) must match the application's reality.

### 7. ENVIRONMENT CHARACTER MATCHES APPLICATION
- **Clean applications** (food, pharma, algae, water): hygienic, stainless steel, bright, organized
- **Gritty applications** (waste oil, diesel, crude, black diesel): working industrial with realistic wear — oil stains, patina, maintenance tags, drip trays
- **Precision applications** (lube oil, hydraulic, coolant): clean but mechanical, well-maintained, organized industrial
- The environment MUST feel authentic to someone who works in that industry

### 8. INDOOR ENVIRONMENTS WIN
Most centrifuge base photos were shot indoors under even fluorescent lighting. Indoor environments (factories, engine rooms, process halls) produce the best lighting matches. Outdoor scenes (tank farms, oil fields, port facilities) are harder — only use when the base photo was also shot outdoors or the application demands it (containerized units).

### 9. SPATIAL DEPTH TELLS THE STORY
Describe the scene in layers:
- **Foreground**: Floor detail, nearby piping, cable trays at centrifuge base level
- **Midground**: Process equipment the centrifuge serves (tanks, machines, generators)
- **Background**: Facility structure (walls, columns, mezzanines, overhead cranes, distant equipment)
- The left 2/3 of frame stays slightly darker and visually calm for website text overlay

### 10. WHITE/BRIGHT BACKGROUNDS NEED DARK HERO TEXT
When the generated hero has a predominantly white or bright background, the page's hero text overlay must switch to dark text for visibility. Flag this to Sanjay when it happens so the page template can be adjusted.

---

## Prompt Framework (Subject–Context–Style)

Optimized for Gemini/Nano Banana 2. Based on Phil Schmid's 7 principles + our proven iterations.

### Core Principles
- **Be hyper-specific** — describe textures, materials, colors, spatial relationships explicitly
- **Positive framing** — describe what IS there, minimize "do not" lists
- **Physical details** — floor material, lighting fixtures, pipe materials, wall textures
- **Camera language** — use professional photography terms
- **Stay under 500 tokens** — NB quality degrades above 1000 tokens

### 5-Part Prompt Structure

```
PART 1 — SUBJECT (LOCKED BASE IMAGE) [~60 tokens]
"Use the uploaded photo of the actual Dolphin Centrifuge as the locked base image.
Preserve exactly: machine geometry, bowl shape, piping layout, pump, control panel,
skid footprint, proportions, colors, materials, overall appearance. The centrifuge
is the subject — it must remain identical to the reference photo in every detail."

PART 2 — CONTEXT (COMPOSITION + ENVIRONMENT + GROUNDING) [~200 tokens]
"Professional website hero photograph, 1600 x 900, shot at eye-level with a
medium-wide lens. The Dolphin centrifuge sits on the right third of the frame,
positioned naturally beside {ADJACENT EQUIPMENT — what it serves}, its steel skid
sitting flat on {FLOOR MATERIAL}. Consistent {LIGHTING TYPE} illuminates both the
centrifuge and the surrounding environment uniformly. Natural shadows fall beneath
the skid and piping, anchoring the machine to the floor.

The left two-thirds show the {APPLICATION} environment in layers:
Foreground — {SPECIFIC FLOOR-LEVEL DETAILS: piping, cable trays, drip trays}
Midground — {PROCESS EQUIPMENT: tanks, machines, reactors, reservoirs}
Background — {FACILITY STRUCTURE: walls, columns, mezzanines, overhead systems}

{HOSE/PIPE CONNECTIONS if open flanges visible in base photo:}
Black industrial hoses with stainless steel braided fittings are bolted directly
to the EXISTING open connection flanges on the skid edge, running to nearby
{RELEVANT RESERVOIR/EQUIPMENT}. Do NOT add new flanges — use the ones already
visible in the reference photo.

The left side stays slightly darker and visually calm for website text overlay."

PART 3 — STYLE (PHOTOGRAPHIC DIRECTION) [~80 tokens]
"Shot style: editorial industrial photography for a manufacturer's product brochure.
Color palette: {APPLICATION-SPECIFIC TONES}. The image feels like a professional
photographer documented this centrifuge installation in an active {INDUSTRY} facility.
Real, practical, current-day, trustworthy."

PART 4 — GROUNDING RULES [~60 tokens]
"The centrifuge skid sits flat on the floor, in correct proportion to the surrounding
environment. The machine looks naturally installed — as if it was bolted down here and
the photographer walked in to shoot it. The floor surface is continuous from the
centrifuge base to the surrounding environment with no visible seam."

PART 5 — EXCLUSIONS [~40 tokens]
"This is real photography: no text, no labels, no signage, no UI overlays. Every
surface has realistic industrial texture. Lighting is consistent across the entire frame."
```

### Token Budget

| Part | Tokens | Purpose |
|------|--------|---------|
| Subject | ~60 | Lock the centrifuge identity |
| Context | ~200 | Composition + environment + spatial layers + connections |
| Style | ~80 | Photography direction + color palette |
| Grounding | ~60 | Floor/shadow/proportion/placement rules |
| Exclusions | ~40 | Minimal constraints, positively framed |
| **Total** | **~440** | **Under 500-token sweet spot** |

---

## Environment Examples

These are optional image-generation examples, not migration templates and not audit rules.
Never treat any application example as a page-structure template.

| Application | Possible environment | Lighting direction |
|-------------|----------------------|--------------------|
| Waste oil / used oil | Indoor processing plant, collection tanks, transfer piping, concrete floor | Bright industrial |
| Fuel oil / diesel | Engine room or fuel treatment room with heavy piping and day tanks | Warm or bright industrial |
| Crude oil / petroleum | Refinery process hall with grated floors, columns, piping, valves | Bright industrial |
| Lube oil / hydraulic oil / coolant | Clean mechanical room, shop floor, or equipment bay | Clean industrial |
| Food grade / chemical | Stainless process room, vessels, sanitary piping | Bright hygienic |
| Wastewater | Treatment facility with clarifier tanks, basins, pipe bridges | Bright outdoor or mixed |
| Explosion proof | Hazardous area processing with Ex-rated conduit and zone markings | Bright Ex-rated industrial |

---

## CRITICAL: Correct MCP Setup

**Package**: `@ycse/nanobanana-mcp` (NOT `@nanana-ai/mcp-server-nano-banana`)
**API key env var**: `GOOGLE_AI_API_KEY` (Gemini API key — NOT a nanana.app token)

Config in `%APPDATA%\Claude\claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "nanobanana-mcp": {
      "command": "npx",
      "args": ["-y", "@ycse/nanobanana-mcp"],
      "env": {
        "GOOGLE_AI_API_KEY": "AIzaSyCTw2pAbIlfSeeWG5bUlcjwBtn_bnO0Rzg"
      }
    }
  }
}
```

Load schemas first:
```
ToolSearch: select:mcp__nanobanana-mcp__gemini_generate_image,mcp__nanobanana-mcp__gemini_edit_image,mcp__nanobanana-mcp__set_model,mcp__nanobanana-mcp__set_aspect_ratio
```

## MCP Tool Call

```
# Step 1 — mandatory session setup
set_model(model="pro", conversation_id="dolphin-{slug}")
set_aspect_ratio(aspect_ratio="16:9", conversation_id="dolphin-{slug}")

# Step 2 — generate
gemini_generate_image(
    prompt=[assembled 5-part prompt as single string],
    reference_images=["C:\\path\\to\\base-centrifuge-photo.webp"],
    aspect_ratio="16:9",
    conversation_id="dolphin-{slug}",
    output_path="C:\\Users\\sprab\\Documents\\Projects\\DolphinWeb\\NB Images\\hero-{slug}-v{N}.jpg"  # intermediate raw
)
```

**Notes:**
- `reference_images` accepts local Windows absolute paths directly
- Output always saves as `.jpg` regardless of extension specified
- Native output is ~1376×768 at 16:9 — resize/crop to final dimensions in post
- Always set model to 'pro' for full-scene industrial composites

Always generate **3 variants** per page. Let Sanjay pick. Save all good variants for potential reuse on other pages.

---

## Post-Generation Pipeline

### Convert to WebP
IMPORTANT: sharp must run from inside the `site/` directory where node_modules lives.
```bash
cd 'D:/Dolphin Marine Services/Business Docs/AI/Claude/Dolphin_Website_Redo/site' && node -e "const sharp=require('sharp');
sharp('public/images/hero-{slug}-v{N}-1600x900')
  .webp({quality:75})
  .toFile('public/images/{page-slug}/{page-slug}-hero-nb.webp')
  .then(i=>console.log(Math.round(i.size/1024)+'KB'))"
```
If file exceeds 200KB at quality:75, drop to quality:65. Never use `npx sharp` — it's not available.

### Quality Gates
- [ ] File size under 200KB (use quality:75, drop to 65 if needed)
- [ ] Dimensions at least 1400px wide
- [ ] WebP format
- [ ] Proper heroImageAlt written (descriptive, includes "Dolphin Centrifuge")

### Embed in Page
Update the `.astro` file's frontmatter:
```
heroImage="/images/{page-slug}/{page-slug}-hero-nb.webp"
heroImageAlt="Dolphin Centrifuge {model} {application} system installed in {environment description}"
```

### White Background Alert
If the hero has a predominantly white/bright background, flag to Sanjay that hero text color may need to switch to dark for visibility.

---

## Known NB Limitations

1. **Cannot modify base image details** — NB adds new elements instead of modifying existing ones. It will create new flanges rather than connecting hoses to existing ones.
2. **Outdoor lighting mismatch** — Indoor-shot centrifuges look fake in outdoor scenes. Stick to indoor environments.
3. **Center placement tendency** — NB defaults to centering the subject. Must explicitly describe off-center, natural placement.
4. **Scale drift** — NB sometimes makes environments too small relative to the centrifuge. Describe the facility as "large" or "spacious" when needed.
5. **Wrong fluid type** — NB doesn't know what cutting oil vs coolant looks like. Must describe the fluid color and consistency explicitly (amber oil vs milky white coolant).

---

## Iteration Protocol

1. Generate 3 variants per page
2. Show all 3 to Sanjay for review
3. If none work, diagnose the specific issue (lighting? scale? placement? fluid?)
4. Regenerate with targeted fix — max 3 more attempts
5. Save ALL good variants (even non-selected) in `site/public/images/` for reuse
6. Lock the winner, convert to WebP, embed in page
7. Update this skill with any new learnings

---

## File Paths

- **Working dir**: `D:\Dolphin Marine Services\Business Docs\AI\Claude\Dolphin_Website_Redo\site\`
- **Source cleaned images**: `C:\Users\sprab\Documents\Projects\DolphinWeb\NB-Cleaned-Images\`
- **NB raw output (intermediate)**: `C:\Users\sprab\Documents\Projects\DolphinWeb\NB Images\hero-{slug}-v{N}.jpg`
- **Final hero (1440×500 WebP)**: `C:\Users\sprab\Documents\GitHub\dolphin-centrifuge-website\_New_Hero_Image\{slug}\hero.webp`
- **Old hero (archived by builder)**: `C:\Users\sprab\Documents\GitHub\dolphin-centrifuge-website\_Old_Hero_Image\{slug}\hero.webp`
- File inside slug folder is always `hero.webp` — slug folder IS the page identifier
- **CENTRIFUGE_BRAIN**: `D:\Dolphin Marine Services\Business Docs\AI\Claude\_Centrifuge-Knowledge-Base\CENTRIFUGE_BRAIN_v4_0.md`
