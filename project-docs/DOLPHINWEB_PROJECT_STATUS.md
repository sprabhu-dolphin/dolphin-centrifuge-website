# DolphinWeb - Project Status

**Last Updated:** April 4, 2026 (Session 21 start)
**Owner:** Sanjay Prabhu

---

## Current State

STRATEGIC PIVOT (Session 18): Switching from scratch-rebuild on cowork-audit to auditing/fixing CC+CG's "fixed" pages on master. At 8 pages per 17 sessions, scratch-rebuild of 128 remaining pages was not viable. CC+CG have 66 "fixed" pages on master - quality-sampled 4 pages and found legacy content ~85-95% preserved but with consistent issues (see below). Decision: audit and fix CC+CG's work instead of redoing it.

---

## Phase 1: First Audit Batch (8 pages)

| # | Page | Type | Sessions | Status |
|---|------|------|----------|--------|
| 1 | `/` (homepage) | homepage | 6,368 | DONE (Sessions 8-11) |
| 2 | `/waste-oil-centrifuge/` | application | 1,989 | DONE (Sessions 12-13). FAQ pending RankMath data. DolphinChart accuracy pending. |
| 3 | `/industrial-centrifuge/` | SEO-honey-pot | 1,892 | DONE (Session 14). SVG diagrams shelved (use legacy images). FAQ co-creation deferred. |
| 4 | `/alfa-laval-centrifugal-separator/` | SEO-honey-pot | 2,893 | DONE (Session 14). Approved. |
| 5 | `/wastewater-centrifuge/` | application | 1,821 | DONE (Session 15). Approved. |
| 6 | `/decanter-centrifuge-differential-speed/` | knowledge | 1,719 | DONE (Sessions 16-17). Approved. Clean hero + effects chart images added. |
| 7 | `/diesel-centrifuge/` | application | 1,065 | DONE (Session 17). Heavy CC damage fixed. All legacy content restored. Mutual review in progress. |
| 8 | `/decanter-centrifuge/` | knowledge/hub | 1,722 | NOT STARTED |
| 9 | `/contact-for-alfa-laval-centrifuges/` | contact | 371 | NOT STARTED |

## Phase 2-5 (Not Started)

- Phase 2: Remaining ~27 application pages (template batch)
- Phase 3: Remaining ~17 model pages (template batch)
- Phase 4: Remaining ~52 blog/knowledge pages (template batch)
- Phase 5: Misc pages + all 301s + full site crawl

---

## Open Items (Carried Forward)

### Ready to Do (no blockers)
- [ ] 3 missing standalone SVGs breaking 11 pages (quick fix: rename v2 to v3)
- [ ] ~150 FDA/food-grade instances need cleanup page-by-page
- [ ] Testimonials page - check backlinks before killing
- [ ] Sitewide: 26 CC-invented pages need review/removal

### Needs Sanjay Input
- [ ] FAQ co-creation for /industrial-centrifuge/ - legit FAQ page, needs Sanjay
- [ ] DolphinChart data accuracy review (Sanjay to verify)
- [ ] Hero image spec decision (1600x900 was never implemented)
- [ ] Knowledge Center 5th sub-category TBD

### Blocked on External
- [ ] FAQ content for /waste-oil-centrifuge/ - needs RankMath recovery data from CC folder
- [ ] NB images for product cards (WHPX 405, MOPX 213, WHPX 513) - need generation
- [ ] 12 missing NB hero images - need generation

---

## Session 18 Summary (April 3, 2026)

**Strategic pivot:** Decided to audit/fix CC+CG's "fixed" pages on master instead of continuing scratch-rebuild on cowork-audit. Math doesn't work at current pace (8 pages / 17 sessions = ~250 sessions for 128 pages).

**Project file cleanup completed:**
- Reviewed all remaining .md files one-by-one with Sanjay
- Deleted: ChatGPT/AUDIT_SUMMARY.md, ChatGPT/GIT_BRANCH_INFO.md, ChatGPT/PAGE_APPEARANCE_LOOK.md (stale/redundant)
- Deleted: Entire audit/Claude Code/ folder (5 files - all merged into CG's SITE_INVENTORY)
- Updated: ChatGPT/SITE_INVENTORY.md replaced with full merged version (292 lines, 155 pages, 66 fixed)
- Reviewed: ChatGPT/KNOWN_ISSUES.md (40 items, all boilerplate - kept but low value)
- Reviewed: Global .claude/CLAUDE.md (no changes needed)
- Added Rule 12 to CLAUDE.md: Chrome checklist (close office PC Chrome, verify local extension connected)

**CC+CG quality sampling:** Opened 4 "fixed" pages side-by-side (LW vs master staging) in Chrome:
- /diesel-centrifuge/ - content ~85%, some rewrites, images dropped
- /alfa-laval-mab-103-centrifuge/ - content ~95%, core excellent
- /disc-centrifuge-friction-clutch/ - content ~95%, title improvement kept
- /decanter-centrifuge-differential-speed/ - content ~90%, calculator rebuilt, images dropped

**Chrome connection issue resolved:** Claude in Chrome extension was connecting to office PC instead of local PC. Killed office Chrome, re-logged extension locally. Added Rule 12 to prevent recurrence.

**New 5-step audit workflow defined:** Artifacts inventory -> LW content 100% -> Artifacts 100% (upgrade available) -> PAGE_APPEARANCE_LOOK -> Final check

**No git commits this session** (organizational + strategy session)

---

## Session 17 Summary (April 2, 2026)

**Project file cleanup:** Replaced 3 .md files with consolidated versions, deleted 8 obsolete files. Updated global .claude/CLAUDE.md. Cleared 17 redundant auto-memory entries.

**PAGE_APPEARANCE_LOOK.md rewritten:** Old rules were too aggressive about stacking. New core principle: minimize blank vertical space. Side-by-side is default when there's 3+ lines of adjacent text. Diagrams get md:w-1/2, equipment photos get md:w-1/3.

**Diff-speed page mutual review + fixes (commits 9302a48, bfe0b59, 1d682bc, 65b0e51):**
- Fixed diagram layout violations (stacked -> side-by-side per new rules)
- All 5 images now side-by-side with adjacent text
- Restored H4 for "Differential Speed Table" (was H3, legacy is H4)
- Added clean NB hero image (decanter-bowl-scroll-rotation-1600.webp)
- Replaced effects chart with clean version
- "blacked-rive" typo fix to "back-drive" kept (Sanjay approved)
- Page approved by Sanjay

**Diesel centrifuge audit + fix (commits d210d47 through cc7e8e2):**
- Removed AI summary box
- Restored "How does a diesel centrifuge work?" paragraphs (CC had rewritten)
- Restored "Can a centrifuge separate diesel from engine oil?" to H2 with full legacy text (CC had rewritten and demoted to H3)
- Removed 3 CC-invented spec tables (DMPX, DMB, "Available Systems")
- Removed CC-invented "Related resources" section
- Restored legacy headings: "Class 1 Div 2 for Hazardous Areas", "Work-boats"
- Restored "per-heaters" and "starter" (CC had "corrected" to pre-heaters/starters)
- Un-blockquoted "Dolphin Centrifuge supplies..." paragraph
- Restored Selection Guide <<< standalone line
- Added missing C1D2 Duplex image in overview
- Fixed all images to figure/figcaption with captions
- Standalone images constrained with max-w-lg mx-auto
- Module images (MAPX-210, MOPX-213, MAB-206) side-by-side with spec tables
- C1D2 gallery: removed duplicate duplex image, kept 2 images side-by-side with centered caption
- Removed duplicate C1D2 explosion proof image after operation section (Sanjay approved)
- Removed duplicate C1D2 explosion proof image (Sanjay approved)

**New CLAUDE.md rules added:**
- Rule 9: NEVER ask Sanjay to copy-paste legacy content
- Rule 10: ALWAYS open LW pages in Chrome browser with patience
- Rule 11: ALWAYS open LW and CF staging side-by-side in Chrome - mutual review means both looking at same screens

**Git state:** cowork-audit branch at commit cc7e8e2

---

## Session 16 Summary (April 1, 2026)

**Page audited:** /decanter-centrifuge-differential-speed/ (first knowledge/blog template)

**Content fixes (commit 36e8499):**
- Restored full legacy title via pageTitle prop
- Swapped broken NB hero to existing legacy image (decanter-bowl-scroll-rotation-800.webp)
- Removed AI summary box
- Restored all body paragraphs word-for-word from LW
- Restored 2 dropped images (effects chart, calculator image)
- Restored Alfa Laval PDF link
- Kept CC's JS calculator (approved functional improvement)
- Kept CTAs and Related Articles

**Layout fix (commit 03de49a):**
- Changed effects chart from side-by-side to standalone figure (diagrams need width)

**Template finding:** Knowledge pages use ApplicationLayout (same as app pages). No separate template needed.

**Project file consolidation:** Sanjay escalated that 13 overlapping .md files with scattered rules were causing repeated layout mistakes. Approved consolidation from 13 files to 7. New files written this session.

**Git state:** cowork-audit branch at commit 03de49a

---

## Previous Sessions (Condensed)

| Session | Date | Key Work |
|---------|------|----------|
| Setup | Mar 28 | Created project folder and structure |
| 1 | Mar 29 | Crawled LW sitemap (136 pages), built SITE_STRUCTURE.md |
| 2 | Mar 29 | FAQ audit (153/155 CC-invented), FIRST_AUDIT_BATCH.md |
| 3 | Mar 29 | Skill files audited, dual-model warnings added |
| 4 | Mar 29 | Git repo cloned, cowork-audit branch created |
| 5 | Mar 29 | Hero image audit, FAQ removal (144 pages, 5817 lines), SVG graph audit |
| 6 | Mar 29 | Application category restructure (v4 frozen) |
| 7 | Mar 30 | Git push via PAT, CF Pages auto-deploy working |
| 8 | Mar 31 | Homepage audit started |
| 9 | Mar 31 | Homepage fixed (title, H1, nav redesign) |
| 10 | Mar 31 | Homepage visual overhaul planning, NB image inventory |
| 11 | Mar 31 | Homepage images + product cards + FDA fix |
| 12 | Mar 31 | /waste-oil-centrifuge/ content audit + fix |
| 13 | Apr 1 | /waste-oil-centrifuge/ layout fixes, PAGE_APPEARANCE_LOOK.md created |
| 14 | Apr 1 | /industrial-centrifuge/ + /alfa-laval-centrifugal-separator/ |
| 15 | Apr 1 | /wastewater-centrifuge/ content + layout fix |
| 16 | Apr 1 | /decanter-centrifuge-differential-speed/ + project file consolidation |
| 17 | Apr 2 | File cleanup, PAGE_APPEARANCE_LOOK.md rewrite, diff-speed approved, /diesel-centrifuge/ audited + fixed |

---

## CC+CG Quality Sample Results (Session 18)

Pages sampled from master staging (https://master.dolphin-centrifuge-staging.pages.dev/):

| Page | Content Preserved | Issues Found |
|------|-------------------|--------------|
| /diesel-centrifuge/ | ~85% | Title lost "Sludge & Water Separator" keyword. AI summary + 5 fake FAQs added. Missing images (C1D2 Duplex, MOPX 205). Selection Guide link dropped. Some text rewritten. |
| /alfa-laval-mab-103-centrifuge/ | ~95% | Title double-branded "Dolphin | Dolphin Centrifuge". AI summary + 5 fake FAQs added. CTA blocks added. Core content excellent. |
| /disc-centrifuge-friction-clutch/ | ~95% | Title changed to "Maintenance Guide" (IMPROVEMENT - keep). AI summary + 5 FAQs added. CTA blocks added. Core content excellent. |
| /decanter-centrifuge-differential-speed/ | ~90% | Title double-branded. Calculator rebuilt in JS (verify math). Some images/graphs dropped. AI summary + 3 FAQs added. Performance chart replaced with SVG. |

### Consistent CC+CG Issues (all pages):
1. **AI summary paragraph** bolted on top of every page - REMOVE
2. **AI-generated FAQs** at bottom of every page (3-5 per page) - REMOVE
3. **CTA blocks** added mid-page and bottom - REVIEW (some OK to keep)
4. **Images/diagrams dropped** - most serious issue, needs artifact inventory per page
5. **Title changes** - some lost SEO keywords (bad), some improved (keep)
6. **Double-branding** in titles ("Dolphin | Dolphin Centrifuge") - FIX

## New Audit Workflow (per page)

1. **Artifacts Inventory:** Open LW + staging side-by-side in Chrome (Rule 11-12). Catalog every image, diagram, graph, calculator, table, schema on LW. Check which survived on staging.
2. **LW Content 100%:** Full text comparison. Every paragraph, heading, inline link, caption must be present. Flag missing, rewritten, or AI-generated content.
3. **Artifacts 100%:** Restore missing images/diagrams. Upgrade where possible (new SVG, pre-sized photos from Sanjay).
4. **PAGE_APPEARANCE_LOOK.md:** Visual layout review per rules.
5. **Final Check:** Schema, title/meta, internal links, TOC anchors. Sign off, next page.

## Session 20 Summary (April 4, 2026)

**Branch:** master (direct)

**Continued from Session 19 context compaction.**

**waste-oil-centrifuge NB image upgrades (commit 7027542):**
- MOPX-210 section image: replaced stale Panama installation photo with NB HOPE chassis 3q-front-right (`/images/nb/mopx-210/alfa-laval-mopx-210-hope-3q-front-right-300sq.webp`)
- Stainless Steel section image: replaced old frame-base centrifuge with NB WHPX-405 DCO front-right (`/images/nb/whpx-405/alfa-laval-whpx-405-dco-front-right-300sq.webp`) â€” now correctly shows actual SS centrifuge
- WHPX 405 ProductCard: replaced same stale reframed image with NB WHPX-405 NORRIS front-right (`/images/nb/whpx-405/alfa-laval-whpx-405-norris-front-right-300sq.webp`)
- New NB folders created: `/images/nb/mopx-210/` and `/images/nb/whpx-405/`

**Sanjay ready to move to next session for 'previous page fixes'**

---

## Session 19 Summary (April 3, 2026 - in progress)

**Branch:** Now working on master directly (resolved from Session 18).

**Hover/link color fix (commit eec2d55):**
- Header.astro: top utility bar phone+email links and mobile menu bottom contact links - added explicit `text-gray-300` so links are visible in base state (Tailwind v4 reset was making them inherit gray-400 and appear dim)
- Footer.astro: nav column links bumped from `text-gray-400` to `text-gray-300`; bottom bar email added explicit `text-gray-400`

**NB Image Upgrade Process established:**
- Sanjay ran robocopy â†’ 765 images (227 unique shots Ã— 3 sizes) now in workspace NB-Cleaned-Images folder
- 17+ model series: AFPX-207, ALDEC-406, BRPX-313, CRPX-207, MAB-103/204/206, MOPX-205/207/210, NX-314/418, P615, WHPX-405/407/410/513, WSB-104, WSPX-303/307
- Robocopy command: `robocopy "D:\Dolphin Marine Services\Business Docs\AI\Claude\Dolphin_Website_Redo\NB Images\NB-Cleaned-Images" "C:\Users\sprab\Documents\DolphinWeb\NB-Cleaned-Images" *.webp /E /XO /R:2 /W:5`
- NB images go to `/images/nb/{model-slug}/` in repo (central, not per-page)
- Naming: `alfa-laval-{model}-{angle}-{size}.webp`
- 300sq-fit â†’ product cards/module images; original â†’ hero
- Workflow step insertion: after content 100% check, BEFORE PAGE_APPEARANCE_LOOK review

**New 6-step audit workflow (updated from 5-step):**
1. Artifacts inventory (LW vs staging side-by-side)
2. LW content 100%
3. **NB Image Upgrade** (select best NB shots, rename, copy to /images/nb/{model}/, update src, commit)
4. Artifacts 100% (restore any remaining missing legacy images)
5. PAGE_APPEARANCE_LOOK layout review
6. Final check (schema, title, links) â†’ sign off

**Chrome issues this session:** Extension initially connecting to wrong machine. Fixed by Ctrl+N new window. Sanjay confirmed process: always use Ctrl+N fresh window.

**Sanjay noticed errors on done pages** - will do issues-list review next.

## NEXT SESSION INSTRUCTIONS

1. Read CLAUDE.md and this file
2. **CHROME CHECKLIST:** Ctrl+N new window, confirm extension connected
3. PAT for git clone: [REDACTED - do not store tokens in repo]
4. Fix issues Sanjay finds on previously done pages (issues-list review)
5. Then start /decanter-centrifuge/ audit (rank 7, 1,722 sessions) using 6-step workflow
6. End of session: update this file

**NB image folders created so far:**
- `/images/nb/crpx-207/` (homepage algae section - Session 19)
- `/images/nb/mopx-210/` (waste-oil-centrifuge - Session 20)
- `/images/nb/whpx-405/` (waste-oil-centrifuge - Session 20)
