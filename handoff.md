# Dolphin AEO/GEO Handoff

Use this file to restart the AEO/GEO optimization exercise in a fresh chat.

## Current Mission

Improve the Dolphin Centrifuge Astro site for AEO/GEO and AI answer-engine visibility without delaying launch beyond the agreed gate.

Pre-live scope:
- Complete the first 30 highest-traffic real pages from `ga4-landing-pages-top160.xlsx`.
- Include `/` as homepage.
- Skip `(not set)` unless Sanjay explicitly reopens it.
- After the top 30 pass Codex audit, do not let AEO/GEO block go-live. Continue the rest after launch.

## Hard Roles

Codex:
- Auditor, dispatcher, queue owner, and log keeper only.
- Selects the next page from the ranking file.
- Writes exact Astro-Pass-On-Instructions.
- Audits the exact commit SHA returned by Astro Agent.
- Updates `CODE_AEO_GEO_LOG.md`.
- Does not edit site implementation files during page work.

Astro Agent:
- Only implementation agent.
- Works only from Codex's exact Astro-Pass-On-Instructions.
- Edits only the files explicitly allowed in the handoff.
- Commits and returns the exact SHA.
- Stops after returning the SHA.

No multi-agent mode:
- No subagents.
- No parallel workers.
- No second implementation agent on the same page.
- No self-assigning the next page.

## Fresh Chat Startup Order

Read these first:
1. `handoff.md`
2. `CODE_AEO_GEO_LOG.md`
3. `AEO_GEO_OPERATING_PLAN.md`
4. `AEO_GEO_SKILL.md`
5. `.agents/rules/astro-migration.md`
6. `.agents/rules/aeo_geo_pathway.md`
7. `DOLPHIN_GEO_ROADMAP.md`
8. `DOLPHIN_NOMENCLATURE_POLICY_REVERSAL.md`
9. `ga4-landing-pages-top160.xlsx`

Then inspect the next selected page source file under `src/pages`.

## How Codex Continues

1. Read `CODE_AEO_GEO_LOG.md` to find completed PASS pages.
2. Read `ga4-landing-pages-top160.xlsx`.
3. Pick the highest-ranked real page that is not marked PASS.
4. Map `/` to `src/pages/index.astro`; map `/slug` to `src/pages/slug.astro` unless repo inspection proves otherwise.
5. Inspect the source page and relevant legacy content.
6. Prepare one strict Astro-Pass-On-Instructions block.
7. Wait for Astro Agent's commit SHA.
8. Audit that exact SHA from git, not the working tree.
9. Update `CODE_AEO_GEO_LOG.md` with PASS or NEEDS FIXES.
10. If the page is NEEDS FIXES, give Sanjay the exact correction block for that same page.
11. If the page is PASS, immediately pick the next highest-ranked real page not marked PASS, inspect its source, log the new instruction entry, and include the next ready-to-send Astro-Pass-On-Instructions block in the same response. Do not wait for Sanjay to ask for the next slug.

## Current Status

Snapshot: 2026-05-14, after Rank 30 `/biodiesel-centrifuge/` PASS. Top 30 pre-live AEO/GEO gate complete.

Closed PASS pages:
- Rank 1 `/`
- Rank 3 `/alfa-laval-centrifugal-separator/`
- Rank 4 `/waste-oil-centrifuge/`
- Rank 5 `/industrial-centrifuge/`
- Rank 6 `/wastewater-centrifuge/`
- Rank 7 `/decanter-centrifuge/`
- Rank 8 `/decanter-centrifuge-differential-speed/`
- Rank 9 `/disc-stack-centrifuge/`
- Rank 10 `/alfa-laval-centrifuge/`
- Rank 11 `/alfa-laval-centrifuge-parts/`
- Rank 12 `/disc-centrifuge-parts-glossary/`
- Rank 13 `/diesel-centrifuge/`
- Rank 14 `/centrifugal-filter/`
- Rank 15 `/disc-centrifuge-purifier-clarifier-difference/`
- Rank 16 `/oil-centrifuge/`
- Rank 17 `/decanter-centrifuge-optimization/`
- Rank 18 `/crude-oil-centrifuge/`
- Rank 19 `/lube-oil-centrifuge/`
- Rank 20 `/disc-centrifuge-troubleshoot-bowl/`
- Rank 21 `/difference-between-decanter-centrifuge-disc-centrifuge/`
- Rank 22 `/dewatering-centrifuge/`
- Rank 23 `/decanter-centrifuge-pond-depth/`
- Rank 24 `/decanter-centrifuge-vibration/`
- Rank 25 `/machine-coolant-centrifuge/`
- Rank 26 `/algae-centrifuge/`
- Rank 27 `/alfa-laval-centrifuges/`
- Rank 28 `/centrifuge-rcf-rpm-difference-calculation/`
- Rank 29 `/fuel-oil-centrifuge/`
- Rank 30 `/biodiesel-centrifuge/`

Skipped:
- Rank 2 `(not set)` remains skipped by default.

Current active page:
- None. Top 30 pre-live AEO/GEO queue is complete.

After Rank 30 PASS:
- Top 30 pre-live AEO/GEO queue is complete.
- AEO/GEO must not block go-live after Rank 30 passes Codex audit unless Sanjay explicitly reopens the launch gate.
- Continue remaining AEO/GEO work after launch.

`CODE_AEO_GEO_LOG.md` is the detailed authority for commits, PASS/NEEDS FIXES records, and correction history.

## Standing Astro-Pass-On-Instructions Shape

Every pass-on block must include:
- Landing page
- Queue label
- GA4 rank
- Sessions
- Source file
- Required reading
- Allowed files to edit
- Do not edit
- Must-do items
- Quick link check
- Forbidden changes
- Verification checklist
- Report-back format
- Exact commit SHA requirement

Astro Agent may not add side fixes. If it sees another issue, it reports it under "not changed" and stops.

Codex continuation rule after PASS:
- A PASS response must not stop with only "next slug is X".
- After any PASS, Codex must automatically continue to the next open real top-30 page and provide the full next Astro-Pass-On-Instructions block in the same reply.
- Stop only if there is a NEEDS FIXES blocker, the top-30 pre-live queue is complete, or Sanjay explicitly says to pause.

Copy-paste handoff rule:
- If Codex wants Sanjay to tell Astro Agent anything, Codex must provide the exact ready-to-send copy-paste block for Astro Agent in the response.
- Do not write only a narrative request such as "have Astro Agent commit" or "send this to Astro Agent."
- This applies to new page handoffs, correction blocks, pre-commit clean commit instructions, SHA/report-back requests, and any stop-and-report instruction.
- Use a fenced block headed `ASTRO-AGENT-COPY-PASTE` so Sanjay can paste it directly.
- Sanjay must not have to translate, summarize, or reword Codex instructions for Astro Agent.

Default quick link check for all future Astro instructions:
- Check internal `href` links in the selected page file only.
- Verify each internal target exists as a source page route or in `public/_redirects`.
- Verify same-page `#anchor` links match real element IDs in the selected page.
- Fix obvious broken or label/href-mismatched page-local links found in that file.
- Do not run a full-site crawl.
- Do not validate every external URL unless it is visibly malformed.

## AEO/GEO Guardrails

- Do not invent facts, FAQs, specs, prices, capacities, testimonials, guarantees, or performance data.
- Do not add schema that is unsupported by visible content or verified site identity.
- Do not add FAQPage unless a matching visible FAQ exists.
- Do not add HowTo unless matching procedural steps are visible.
- Do not add VideoObject unless the page has a visible video and verified video metadata.
- Default author trust signals are schema-only. Do not add visible author bylines, reviewed-by lines, headshots, or author bio blocks unless Sanjay explicitly asks for visible author treatment.
- Do not change image choices unless Sanjay explicitly opens image work.
- Do not edit global layouts, components, or CSS unless Codex explicitly allows it and Sanjay has approved that global risk.
- Keep changes page-local by default.
- Follow the WHPX-first Alfa Laval naming policy from `DOLPHIN_NOMENCLATURE_POLICY_REVERSAL.md`.
- Preserve URL slugs.

Default hidden author-schema language for pass-on instructions:

Add schema-only author enrichment. Do not add any visible author or reviewed-by text.

For every selected AEO/GEO page, identify Sanjay Prabhu MSME in hidden schema where truthful. Use `Article.author` when an Article schema exists. If the page has no Article schema, use `WebPage.author`. Do not create an Article schema only to carry author data.

Canonical hidden Sanjay author object:
- name: Sanjay Prabhu MSME
- jobTitle: Centrifuge Applications Engineer, or the existing site-consistent title if the page already uses one
- worksFor: Dolphin Centrifuge with url `https://dolphincentrifuge.com`
- description: 40+ years of specialized experience in industrial centrifuge systems
- url: `https://dolphincentrifuge.com/about-dolphin-centrifuge/`
- alumniOf: University of Arkansas, location Fayetteville, AR, US
- hasCredential:
  - @type: EducationalOccupationalCredential
  - name: Master of Science in Mechanical Engineering
  - credentialCategory: Master's degree
  - recognizedBy: University of Arkansas, location Fayetteville, AR, US
  - description: Master of Science in Mechanical Engineering, University of Arkansas, Fayetteville, Class of 1990
- Keep education and credential details schema-only. Do not add visible degree, school, class year, author, or reviewed-by text unless Sanjay explicitly asks for visible author treatment.

Retroactive page rule:
- Pages already passed before this credential policy still need a narrow hidden-schema-only supplemental pass.
- Do not reopen their content, images, layout, captions, CTAs, links, or visible text during that supplemental pass unless a separate Codex audit instruction says so.

## Copy-Paste Starter For New Chats

```text
Continue the Dolphin AEO/GEO top-30 pre-live optimization workflow.

Read `handoff.md` first, then `CODE_AEO_GEO_LOG.md`, `AEO_GEO_OPERATING_PLAN.md`, `AEO_GEO_SKILL.md`, `.agents/rules/astro-migration.md`, `.agents/rules/aeo_geo_pathway.md`, `DOLPHIN_GEO_ROADMAP.md`, `DOLPHIN_NOMENCLATURE_POLICY_REVERSAL.md`, and `ga4-landing-pages-top160.xlsx`.

Codex is auditor, dispatcher, queue owner, and log keeper only. Do not edit site implementation files. Pick the highest-ranked real page not marked PASS, inspect the matching source file, and give me one strict Astro-Pass-On-Instructions block. No multi-agent mode. One page at a time. Top 30 pre-live only, then go live.
```
