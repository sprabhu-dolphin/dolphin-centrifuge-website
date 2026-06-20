# Executive Review — 8-Point Implementation Log

Living work plan + progress log for the owner-led exec-review conversion/trust pass.
Spec: `EXEC_REVIEW_8POINT_BRIEF.md`. Vault: `02 Projects/Dolphin Astro Website.md`.

**Roles (this pass):** Astro Agent (AG+Sonnet) = implementer (commits + returns SHA).
Claude + sub-agents = auditors (content, syntax/build, links, SEO/AEO-GEO, schema).
**Loop per feature:** Claude issues strict AG instruction block → AG implements + returns SHA
→ Claude audits that exact SHA → PASS or correction block → next feature.
**Repo lock:** Claude+AG hold the repo (Codex parked, confirmed 2026-06-14).

Status legend: PLANNED · INSTRUCTION SENT · IMPLEMENTED (SHA) · AUDIT: PASS · AUDIT: NEEDS FIXES

---

## Status Board

| # | Feature | Status | Date | Commit SHA | Audit |
|---|---------|--------|------|-----------|-------|
| 5 | Rental de-emphasis + kill rent-to-own | AUDIT: PASS | 2026-06-14 | 5ae14f1e | PASS — rent-to-own=0, build clean, link OK |
| 4 | Canonical numbers — 4A stock+founding+year / 4B quote-time | AUDIT: PASS (4A+4B) | 2026-06-14 | 17a4b747, c8dc925b, 96ecb7e6 | PASS — all canonical numbers + response-time consistent; 4B dual-audited (Claude git-level + independent zero-context sub-agent); shipping claims preserved; build clean |
| 1 | Reconditioning Standard page + warranty summary (full warranty page DEFERRED to legal session) | AUDIT: PASS (+ claims revision) | 2026-06-14 | e035b0dd, bb35c0b1 | PASS — triple-audited build; claims then corrected per owner verification (no NDT, balance as-needed, test-RUN universal but signed report on-request/paid); revision dual-audited; build clean |
| 6 | Trust components + testimonials + sitewide rollout | PASS (a+b+c) — owner signed off | 2026-06-14 | 9b2f5dba, 39922376, 665e1eb2, 066d1b63 | ALL PASS — homepage trust components + testimonials normalized/featured + sitewide rollout via ApplicationLayout (TrustStrip + TrustPillars + warranty badge on ~150 pages). Dual-audited incl. built-HTML render proof. Owner eyeballed live + signed off 2026-06-14. Follow-up idea: surface a compact trust signal higher on top high-traffic pages (TrustPillars at bottom = low visibility) |
| 2 | Value-bundled price ranges on money pages (3 brackets) | AUDIT: PASS | 2026-06-15 | 37a25021 | PASS (Codex-implemented, dual-audited) — 11 pages, A($50-150K)×6 / B(mid-$30s)×3 / C(SS mid-$60s)×2; visible copy only, ZERO offer schema added (GSC-safe); +US-built-in-MI; build clean |
| 3 | Two ROI case studies (WVO + UMO) strengthened | AUDIT: PASS | 2026-06-16 | f53295ca | PASS (Codex-implemented, dual-audited incl. built-HTML proof) — Guam: inconsistent $400K/$20K/$380K removed, electricity fixed to ~$0.0009/gal (math sub-agent verified), "not audited" honesty framing, single-stage train; Yellow grease: measured-results callout (<6mo/30%, ours/not audited), two-stage train, sourced UCO context; 4 cross-links; zero schema; build clean |
| 7 | Engineer kit (gated datasheet, model selector, install block) | AUDIT: PASS | 2026-06-16 | 71dc178e | PASS (Codex, dual-audited incl. built-HTML) — new InstallationRequirements + ModelFlowRateSelector components; install block on 9 pages; gated spec-sheet CTA on 14 model pages (all route to contact form, no PDF download); selector on hub+selection-guide w/ real GPM; contact/attribution NOT bundled; zero schema; build clean |
| 8 | Feasibility matrix + honest small-buyer on-ramp | AUDIT: PASS | 2026-06-16 | 2d662ad1 | PASS (Codex, dual-audited incl. built-HTML) — feasibility matrix on picking-the-right (corrected ~mid-$30s, NOT $20K), MAB-103 entry note, scale qualifier on 4 pages, KC start-here box, contact flow-rate now optional (scoped — no attribution bundled); zero schema; build clean. Codex also hardened lingering sample-testing CTAs to paid/no-free-sample |

**Execution order:** 5 (shakedown) → 4 → 1 → 6 → 2 → 3 → 7 → 8.
**Current focus:** ✅ ALL 8 POINTS COMPLETE & PASS (2026-06-16). Exec-review implementation done.
Remaining follow-ups (NOT part of the 8): (a) Codex to commit its restored attribution/visitor-identity WIP; (b) lift a compact trust signal higher on top high-traffic pages (owner idea); (c) decanter "over 30 years" claim; (d) sitewide "lifetime → ongoing/original-purchaser" tech-support harmonization; (e) separate Legal W&TC-update session (Advance Protein); (f) deploy/verify live + GSC recheck.
**Follow-up backlog:** (a) surface a compact trust signal higher on top high-traffic pages (owner idea 2026-06-14); (b) decanter "over 30 years" claim; (c) sitewide em-dash sweep (hero/intro prose); (d) separate Legal W&TC-update session (Advance Protein); (e) Codex WIP stash + attribution patch to restore when repo releases. WORKFLOW CHANGED 2026-06-14: Antigravity hit its Google-plan quota (meters all models incl. Claude); switched to sub-agents as implementers + Claude as auditor. Parked: decanter "over 30 years"; separate Legal W&TC-update session (Advance Protein lessons).

---

## Daily Log

### 2026-06-14 (Claude)
- Ran owner-led executive review of live site via 4 buyer personas (CEO, CFO, engineer, startup).
- Worked through all 8 points with Sanjay; every decision locked. See brief for specs.
- Ran deep-research workflow (109 agents, adversarial verify) for sourced ROI/commodity numbers.
- Wrote `EXEC_REVIEW_8POINT_BRIEF.md` (authoritative spec) + captured to vault.
- Took repo lock (Codex parked).
- **#5:** issued AG instruction block — remove 2 rent-to-own lines on
  `disc-stack-centrifuge-rental.astro` (lines 266, 275), replace #266 with a sample-testing
  de-risk pointer. Awaiting AG SHA. Audit criteria: `grep rent-to-own = 0`, build clean,
  sample-testing link resolves, no other drift.
- **#5 AUDITED → PASS** (commit `5ae14f1e`): independent audit — only the rental page changed
  (1 file, 2+/2−), rent-to-own count = 0 sitewide, sample-testing pointer present, build clean
  (158 pages). Trivial nit: blank line left in the `<ul>` where the `<li>` was; harmless, fold
  into a future cleanup if reopened.
- **#4 split** into 4A (stock 150+ / founding 1982 / company-age 40+ — mechanical exact
  find-replace, grep-verifiable) and 4B (quote/response time — contextual rewrite). 4A block
  issued. KEY GUARDRAIL: edits scoped to COMPANY claims only — technical specs (200+/300+ GPM,
  7,200+ RPM, 2000+ parts, 200 discs) and equipment-life (30+ yr service life, 100 yr field
  performance) are explicit do-not-touch. OPEN FLAG for Sanjay: decanter page "remanufacturing
  Alfa Laval decanters for over 30 years" — bump to 40+ or leave as a true narrower sub-claim?

- **#4A AG SHA `17a4b747`** — number edits correct (1981→1982, stock→150+, company-age→40+;
  specs untouched), BUT audit caught the commit had swept in Codex's uncommitted attribution/
  visitor-identity WIP on the contact page (working tree was dirty from before the session).
- **#4A contamination RESOLVED** (cleanup commit `c8dc925b`): restored contact page to base +
  150+ only via `git checkout 5ae14f1e -- contact` + re-applied the 5 stock edits. Codex's
  attribution preserved as `codex-contact-attribution.patch` (52 lines, repo root, untracked).
  Stashed Codex's remaining tracked WIP (`git stash`: package.json, admin/submissions,
  alfa-laval-centrifuge-parts, beer-wine-centrifuge, disc-centrifuge-parts-glossary,
  workers/contact-form/{index.js,schema.sql}) under label
  "codex-wip-attribution-visitor-identity 2026-06-14". Tracked tree now CLEAN.
- **#4A FINAL AUDIT → PASS**: 1981=0, company 200+/300+=0, company-age 35yr=0, attribution in
  contact=0; tech specs (2000+ parts, 300/200 GPM, 7,200+ RPM, 200 discs) + equipment-life
  (30+ yr) + "100+ years team expertise" intact; foundingDate=1982; build clean (158 pages).
- **PROCESS FIX (lesson):** ensure a clean tracked tree before every AG run. Codex's WIP must
  stay stashed (or be committed by Codex) until this pass releases the repo.

- **#4B AUDITED → PASS** (commit `96ecb7e6`; dual audit: Claude git-level + independent
  zero-context sub-agent). Only 4 files changed; no attribution re-bundling (clean-tree fix
  held); `few business days`/`Same-Day Response`/`Same-day quotes` = 0; same-day SHIPPING lines
  preserved (parts:144, index:807); FAQ→JSON-LD schema safe; no stragglers (buyback "1-2 days"
  is a separate flow). Equipment: respond 1 bd, full quote 1-10 days, ATEX ~2 wks. Parts: 1-2 bd.
  Non-blocking nit: numeral style mix ("one" vs "1-2").

- **#1 SCOPED + AUDITED → PASS** (commit `e035b0dd`). Owner decision: the existing Warranty &
  Terms doc (`C:\Dolphin Marine Services\Business Docs\Legal\Warranty & TC\WTC.pdf`) is the
  current binding stance (6-mo mechanical warranty from delivery; claim part shipped freight
  pre-paid; repair/replace at Dolphin discretion; excludes wear/consumables incl. bearings;
  Original Consumer concept). Updating it for Advance Protein litigation lessons = SEPARATE
  legal session (attorney sign-off; treat litigation specifics as privileged; keep off website/
  public repo). So #1 was scoped to: NEW page `/centrifuge-reconditioning-standard/` (outcome
  checklist + test-report differentiator + conservative warranty summary that DEFERS binding
  terms to the formal proposal doc) + 2 inbound links. Support limited to "original purchaser"
  (no secondhand/eBay buyers), matching the doc's Original Consumer concept. Triple audit
  (Claude git-level + 2 independent zero-context sub-agents: content/schema + scope/regression).
  Flagged "CSS class tweak" was VERIFIED a false alarm via word-diff (no existing class changed).
  Non-blocking nit: "NDT (non-destructive)" → could be "(non-destructive testing)". Full Warranty
  Statement page DEFERRED to post-legal-session; warranty badge rollout folded into #6.

- **#1 CLAIMS REVISION → PASS** (commit `bb35c0b1`; owner verified every claim line-by-line).
  Corrected overstatements on the reconditioning page: removed NDT (visual inspection for
  excessive wear only); balancing now "vibration-checked; balanced as needed" (not universal);
  **test report is NOT shipped with every unit** — every unit IS test-run (rated speed, surrogate
  fluid hyd oil/water; FAT available), operational data (amps/performance) recorded, and a signed
  Test/FAT report is available on request for additional charge. Section renamed "Why We Test
  Every Unit"; anchor test-report→testing; meta + JSON-LD descriptions corrected; inbound link on
  alfa-laval-centrifuge.astro corrected. Dual-audited (Claude git-level + independent zero-context
  sub-agent). **CORRECTED DIFFERENTIATOR for #6: "every unit test-run before it ships" — NOT
  "test report with every unit."** Minor pre-existing note (out of scope, owner to confirm later):
  alfa-laval page says "replacing all consumable parts and bearings regardless of their condition."

- **#6a → PASS** (build commit `9b2f5dba` + fix commit `39922376`). Built 4 reusable components
  (TrustStrip, StatsBar, ProvenResults, TrustPillars) + placed on homepage + strengthened the
  reconditioning "beyond-OEM" bullet (every seal/gasket/friction pad/bearing/fastener replaced
  regardless of condition; exposed fasteners upgraded to stainless steel, beyond OEM zinc-plated).
  AUDIT (preview) caught 2 homepage placement bugs: StatsBar duplicated the existing TrustSignals
  stat card, and TrustStrip was hidden behind TrustSignals' -mt-12 overlap. FIX (39922376):
  removed StatsBar entirely (file deleted), relocated TrustStrip to AFTER TrustSignals (now
  visible). Verified via git diff + accessibility snapshot (order: Hero → TrustSignals →
  TrustStrip → QuickSelector; StatsBar gone; build clean 159). NOTE: pixel screenshot tool was
  hanging on the homepage (dev-only load-idle issue, page serves 200) — structural verification
  used instead. The 3 trust pillars are now: (1) every unit test-run, (2) beyond-OEM rebuild
  w/ SS fasteners, (3) 6-month warranty + original-purchaser support.
- **WORKFLOW CHANGE 2026-06-14:** Antigravity (AG) hit its Google-plan baseline quota. Key fact:
  AG meters ALL models (incl. Claude Sonnet) through Google's plan quota, so switching AG's model
  to Sonnet did not help, and overages are blocked on the current Google plan. Switched implementer
  role to independent sub-agents (Claude), with Claude as final auditor. Bills to Claude plan, no
  Google quota. AG can resume later if its billing/account is sorted.

- **#6b → PASS** (commit `665e1eb2`; implementer sub-agent, dual-audited by Claude + independent
  zero-context sub-agent). Normalized 5 testimonial attributions to style-B (initials + role +
  region; dropped fake-looking pseudo-company names; renamed data field company→descriptor and
  migrated JSON-LD + avatar fallback so null-contact id3 "Gulf Coast oilfield operator" doesn't
  crash). Kept all quote text incl. testimonial #4 "Jim (Kraft)" (Dolphin employee, owner-confirmed
  keep). Built reusable FeaturedTestimonial.astro (verbatim startup excerpt "we are not Exxon Mobil
  or Chevron... you've been there, you get it") and placed it on the homepage as an "In Their Words"
  section after TrustPillars. Build clean (159). Owner note-to-self: drop testimonials into
  high-traffic pages (fold into #6c).

- **WORKFLOW CHANGE #2 (2026-06-15):** owner switched the implementer from Claude sub-agents to
  **CODEX** (Antigravity stays abandoned — Google-plan quota). New flow: Claude writes the
  instruction block → Sanjay relays it to Codex → Codex implements + commits + returns the SHA →
  Claude audits (git diff + built-HTML render proof + independent zero-context sub-agents).
  Claude + sub-agents are PURELY auditors now. Codex should `git stash pop` its
  "codex-wip-attribution-visitor-identity 2026-06-14" stash + `git apply codex-contact-attribution.patch`
  as it resumes the repo. Preview dev-server closed at owner request.
- **STATUS: 6 of 8 features PASS** (#5, #4, #1, #6). Remaining: #2 (next, pending owner sign-off on
  the price line + pages), #3, #7, #8.

- **#2 → PASS** (commit `37a25021`; FIRST Codex-implemented commit under the new workflow;
  dual-audited by Claude git-level + independent zero-context sub-agent incl. built-HTML proof).
  Added owner-approved "Indicative Pricing" callouts to 11 application pages in 3 brackets:
  A = $50K-$150K plug-and-play modules (waste-oil, used-oil, fuel-oil, wvo-separator, oil,
  machine-coolant); B = mid-$30s smallest manual-clean skid w/ controls+pumps (lube-oil,
  hydraulic-oil, diesel); C = mid-$60s full stainless-steel wetted parts (wastewater, algae).
  All include "US engineered and built in Michigan". CRITICAL: visible copy ONLY — zero offer/
  Product schema added (kept GSC-safe). Build clean (159). Codex also tidied a few pre-existing
  em-dashes to spaced hyphens on waste-oil/used-oil (on-brand, harmless). NOTE for #8: the small-
  unit figure is mid-$30s (skid w/ controls+pumps), NOT the "$20K MAB 103" the #8 matrix drafted —
  fix the matrix when building #8.

- **#3 → PASS** (commit `f53295ca`; Codex-implemented, dual-audited: Claude git-level + independent
  zero-context sub-agent w/ built-HTML proof; electricity math separately verified by a 3rd sub-agent).
  GUAM/UMO case study reworked per owner "Option B": removed the internally-inconsistent cost table
  ($400K legacy / $20K centrifuge / $380K savings all GONE — their parts never summed to the stated
  totals), fixed electricity to the correct ~$0.0009/gal (~0.09¢/gal at 15¢/kWh, ~$4,500/yr — was a
  ~16× decimal-slip at "$0.015/gal"), added "our own measured results, not independently audited"
  framing, explicit single-stage train (pre-strain → DMPX-028/MOPX-207), free-analysis CTA. YELLOW
  GREASE/WVO: measured-results callout (<6-mo payback, ~30% throughput, labeled ours/not audited),
  explicit two-stage train (NX-314 decanter → WHPX-510), sourced qualitative UCO value ($1.50-3.00/gal
  USDA/Jacobsen/Fastmarkets 2024, no computed total), CTA. 4 cross-links added; #2 pricing callouts
  intact; zero offer schema; build clean (159). 6 of 8 features now PASS (#1-#6).

- **"FREE" CLEANUP → PASS** (commit `7545465a`; Codex-implemented, Claude git-audited). A sub-agent
  scanned the whole site for "free" (~66 uses) and found only 3 real problems: the two case-study
  "Request a Free Analysis" CTAs + a "free operator training" line. Fixed: CTAs → "Talk to an
  Engineer - Free, No Obligation"; training → "operator training included with your system purchase".
  OWNER RULE (durable): advice/consultation/support is free; NOTHING physical/lab/sample/shipping is
  ever free, and the site must NEVER invite a visitor to send fluid/samples or promise an "analysis"
  / "assessment". Kept (correct): all "free lifetime technical support" + "free consultation" uses.
  Untouched: ~52 technical uses ("free water/oil" separated phases, "trouble-free", "antifreeze").
  Separately staged: #8 matrix CTA reworded to the same "Talk to an Engineer - Free, No Obligation"
  pattern (no "tell/send us your fluid").

- **#7 → PASS** (commit `71dc178e`; Codex-implemented, dual-audited: Claude git-level + independent
  zero-context sub-agent w/ built-HTML proof). New reusable components InstallationRequirements.astro
  (owner-supplied utilities spec) + ModelFlowRateSelector.astro (capacity->model table populated from
  real published model GPM). Install block placed on 9 pages (MOPX-207, DMPX 010/028/042/070, waste-oil,
  decanter, disc-stack, WVO); gated "Request the full spec sheet (PDF)" CTA on 14 model pages, all
  routing to the contact form (no open PDF/download); selector on hub + selection-guide. Codex correctly
  restored its attribution WIP (contact page) but did NOT bundle it into this commit. Zero offer schema;
  build clean (159). 7 of 8 PASS.

- **#8 → PASS** (commit `2d662ad1`; Codex-implemented, dual-audited: Claude git-level + independent
  zero-context sub-agent w/ built-HTML proof). Feasibility matrix ("Is a Centrifuge Right for You?")
  on picking-the-right page with the corrected ~mid-$30s small-unit figure (NOT the earlier $20K draft);
  MAB-103 smallest-unit entry note; honest scale qualifier on beer-wine/biodiesel/algae/wvo (point to
  PAID sample testing + matrix, "reach out when you scale"); KC "New to centrifuges? Start here" box;
  contact-form flow-rate made optional (commit scoped to just that — attribution WIP not bundled).
  Codex also hardened lingering sample-testing CTAs (wvo + picking-the-right) to "paid sample testing"
  / no-free-sample wording (slightly beyond the block but on-intent). Zero schema; build clean (159).
- ============================================================
- **✅ EXEC-REVIEW 8-POINT IMPLEMENTATION COMPLETE — 2026-06-16. All 8 PASS.**
  Commits: #5 5ae14f1e · #4 17a4b747/c8dc925b/96ecb7e6 · #1 e035b0dd/bb35c0b1 · #6 9b2f5dba/39922376/
  665e1eb2/066d1b63 · #2 37a25021 · #3 f53295ca · (free-cleanup 7545465a) · #7 71dc178e · #8 2d662ad1.
  Workflow evolved: AG (Antigravity) → Claude sub-agents → Codex as implementer; Claude+sub-agents as
  auditors throughout.
- **🚀 DEPLOYED LIVE 2026-06-16** — `git push origin master` (`75504bd7..2d662ad1`, 15 commits) →
  Cloudflare Pages auto-build. Verified live on dolphincentrifuge.com: new recon-standard page (HTTP
  200), homepage TrustStrip/Proven-Results/TrustPillars/featured-testimonial, #2 pricing callouts, #8
  feasibility matrix. Codex's uncommitted attribution WIP was NOT pushed (only the 15 audited commits).
  GSC recheck still pending (low risk — zero offer/Product schema was added in any commit).
- ============================================================

- **FOLLOW-UP (b)+(c) → PASS** (commit `6dfb3c82`; Codex, dual-audited). (b) decanter company-
  experience "over 30 years" → "over 40 years". (c) softened the support promise sitewide:
  "lifetime technical support/assistance/after-sales" → "ongoing ..." across 8 files (about,
  decanter, 2 troubleshooting pages, testimonials, industrial-centrifuges-faq, knowledge-
  troubleshooting, picking-the-right; visible + JSON-LD text). Testimonials also dropped the
  open-ended "no expiration" phrase (consistent). CRITICAL no-collateral check PASSED: all
  EQUIPMENT-DURABILITY claims left intact ("service life of over 30 years", "30+ years reliable",
  "life expectancy 30+ years", "100 years field performance", "50+ years", "for the life of the
  machine"). Zero "lifetime" remains in src. No schema; build clean (159). NOT YET DEPLOYED
  (committed after the live push 2d662ad1; will push with follow-up (a)).
- FOLLOW-UP (a) compact trust-pillars strip up top — block staged & relayed to Codex; awaiting SHA.

- **E-E-A-T COVERAGE PASS (2026-06-16, Claude analysis):** pulled the PRE-WEBSITE (WordPress-era)
  GA4 ranking via the Analytics Data API and cross-referenced author-schema coverage. GA4-PULL
  METHOD (reusable): property `342043678`; read-only token `%APPDATA%/gcloud/dolphin-ga4-gtm-readonly-token.json`
  (UTF-8 BOM — strip it) + OAuth client `dolphin-ga4-gtm-readonly-codex-oauth-client.json` (installed,
  has client_id/secret/token_uri); refresh the access token then POST analyticsdata v1beta
  `:runReport`. Data span on that property: ~4,000-5,700 sessions/mo Jun-2024→May-2026, drops to
  1,104 in Jun-2026 (cutover). FINDING: top 28 landing pages (12-mo pre-website) are ALL already
  FULL author-schema. Gaps start at rank 29. 11 high-traffic gap pages (>180 sessions) queued for
  the full Sanjay author object: wvo-centrifuge-separator, beer-wine, black-diesel (NONE);
  disc-stack-centrifuge-vibration (NONE - had "Jim Kraft" author, replacing); nx-418-decanter,
  three-phase-decanter, disc-centrifuge-friction-clutch, industrial-disc-centrifuge-repair,
  sharples-p-3000-decanter, about-dolphin-centrifuge, disadvantages-disc-stack-centrifuge (MINIMAL).
  Overall sitewide coverage ~50 FULL / ~71 MINIMAL / ~27 NONE - full sitewide upgrade (#3) deferred,
  best via a shared author-constant import. Redirect-only high-traffic slugs (no source file):
  /hemp-extraction-centrifuge/ (225), /cannabis-thc-extraction-centrifuge/ (208) - verify redirect targets.

- **E-E-A-T 11-PAGE BATCH → PASS** (commit `fc89387b`; Codex, dual-audited incl. built-HTML). Added
  the full Sanjay author object (hasCredential MSME + alumniOf + knowsAbout) to the 11 high-traffic
  gap pages (4 NONE→added, 7 MINIMAL→upgraded; Jim Kraft replaced on the vibration page). CRITICAL
  host-validity check PASSED: author on Article/WebPage only, NEVER on a Product node (the 3 Product
  pages got a separate WebPage node for the author; the decanter pages were Article). Schema-only,
  no visible bylines; JSON-LD valid; build clean (159). Codex used a reusable `sanjayPrabhuAuthorJsonLd`
  const per file — good basis for the deferred #3 shared-constant refactor. Minor: 2 author-object
  variants exist sitewide (leaner waste-oil style vs fuller contact-page style w/ recognizedBy) —
  both valid FULL; standardize during #3. NOT YET PUSHED.
- **DEPLOY/GIT STATE NOTE:** origin/master advanced via a concurrent dashboard push `fe470e87` (which
  also carried the earlier exec-review follow-up `6dfb3c82` live). So the lifetime/decanter follow-up
  is ALREADY live; the E-E-A-T batch `fc89387b` is committed locally but NOT pushed. Pushing it needs
  a `git pull origin master` first (local is behind origin). Follow-up (a) compact-pillars strip was
  relayed but never implemented (no SHA) — still outstanding.

- **FOLLOW-UP (a) compact trust-pillars strip → PASS & LIVE** (commit `b48b3417`; Codex, Claude-audited).
  New `TrustPillarsStrip.astro` (compact single-row: test-run · beyond-OEM+SS fasteners · 6-mo warranty),
  rendered in ApplicationLayout right after `<TrustStrip>` (line 103), full `<TrustPillars>` kept at
  bottom (line 297) per owner's "redundancy OK". No schema; build clean.
- **🚀 ALL FOLLOW-UPS NOW LIVE (2026-06-16).** Git state: a concurrent dashboard-restyle push
  (`a361f849`) carried `fc89387b` (E-E-A-T 11 pages) + `b48b3417` (compact pillars) to origin/master
  with it, so `origin/master..HEAD` is empty — nothing left to push. Verified live on
  dolphincentrifuge.com: wvo-separator + black-diesel serve the MSME author schema; waste-oil shows
  the pillar labels twice (compact strip top + full pillars bottom). The dashboard restyle `a361f849`
  (admin visitor dashboard, another actor's work) also went live — outside exec-review scope, not
  audited here. Leftover uncommitted WIP: package.json + alfa-laval-centrifuge-parts.astro (Codex's).
- **OPEN / DEFERRED:** (1) sitewide #3 — upgrade remaining ~71 MINIMAL author pages to FULL via a
  shared author-constant import (Codex already uses a per-file `sanjayPrabhuAuthorJsonLd` const, a
  good basis); also standardize the leaner-vs-fuller author variants then. (2) Legal W&TC-update
  session (Advance Protein). (3) optional GSC recheck in a few days (low risk — zero offer schema).

<!-- Append new dated entries below. After each Codex SHA, record it + audit verdict in the
     Status Board and add a Daily Log note. -->

---

## GSC RANKING RECOVERY (new workstream) — 2026-06-18

**Plan:** Track 1 index health → Tier 1 title/meta + targeted phrase fixes → re-pull GSC in ~3 weeks.

**Track 1 (DONE 2026-06-18):** GSC URL-inspection API on 6 worst pages = ALL "Submitted and indexed", self-canonical, robots ALLOWED, fetch SUCCESSFUL, crawled Jun 8–18; sitemap 0 errors/0 warnings. VERDICT: no migration breakage. Declines are organic ranking slips (data window ends Jun 13, pre-cutover) → on-page TLC is the right remedy.

**Diagnosis (DONE):** 6 parallel analyst sub-agents on 12 decliner pages. Key findings: (a) 4 pages (NX-418, MAB-104, troubleshoot-bowl, purifier-clarifier) aren't really declining — impression dilution; don't over-invest. (b) Real losers share a fingerprint: head term slips ~2 pos + long-tail variants drop to 0 impr because exact buyer phrases ("for sale", "used motor oil", "centrifugal separator", "continuous centrifuge") aren't in current page text. (c) Cannibalization on 3 terms — assigned owners.

**Tier 1 scope (owner-approved):** title/meta + restore missing phrases + internal links. NO new sections/FAQ schema this pass.
**Instruction pack for Codex:** `GSC_RECOVERY_TIER1_CODEX.md` (6 pages: oil, industrial, disc-stack, three-phase, diesel, waste-oil). Awaiting relay → Codex commits → Claude audits.

**Reusable:** `node gsc-check.mjs inspect --urls "..." --json` and `... sitemaps` work off the stored GSC readonly token. Site `sc-domain:dolphincentrifuge.com`.

### CROWN DEEP-DIVE: "industrial centrifuge" lost US #1 — 2026-06-18

**Question:** were we #1 for "industrial centrifuge" for years, did we lose it? YES. USA pos was 1.7-3.0 Feb-Oct 2025; crashed to 13.1 (Dec'25) → 21.8 (Jan'26); partial recovery to 8.3 (Apr); slipped to 18.3 (Jun). Clicks ~17-26/mo → 2-6/mo. NOTE: blended-global GSC pos (8.7) HID this — US (biggest market) is ~pos 16-18.

**Timing:** crash was Dec 2025 / Jan 2026 — ~6 MONTHS BEFORE the June migration. Migration did NOT cause it. Also page-specific: sitewide avg position IMPROVED in the same window.

**ROOT CAUSE (strong lead, Wayback-confirmed):** the OLD WordPress site began serving a Cloudflare "One moment, please..." bot-challenge interstitial to crawlers ~mid-Dec 2025. Wayback: Oct/Nov'25 = full page; Jan-Mar'26 = title "One moment, please...", spinner+reload, zero content. Googlebot can't pass JS challenges → content vanished → ranking decayed (matches the gradual #5→#13→#22 shape).
  CAVEAT: sitewide GSC stayed healthy (impressions record-high Feb'26), so it was NOT a clean total Googlebot block — likely blocked archive.org fully + Googlebot intermittently, hitting high-competition head terms hardest. Lead, not closed case.

**CURRENT STATUS: blocker gone.** Live GSC inspect (today): page indexed, fetch SUCCESSFUL, crawled Jun 17. Migration to Cloudflare Pages removed the interstitial. We're in recovery now.

**Page quality:** BEST in niche — deeper/more commercial than Riera Nadeu, Western States, Trucent, HCR. NOT a content problem; do not rebuild.

**Cannibalization:** real but shallow. Homepage title/H1 "Alfa Laval Industrial Centrifuge Systems" competes for the term. BUT internal links favor the dedicated page 37-to-0; canonicals clean. Fix = soften homepage title/H1 to brand framing + add 1 prominent exact-anchor homepage link to /industrial-centrifuge/.

**RECLAIM PLAN:** (1) VERIFY in GSC Crawl Stats (UI) whether Googlebot hit the interstitial Dec'25-May'26 + confirm no current CF bot-challenge for Googlebot. (2) Fix homepage cannibalization. (3) Apply held Tier-1 TLC to the page. (4) Request re-indexing. (5) Re-pull GSC ~3 weeks. Page content itself stays — it's already category-best.

### TIER 1 GSC RECOVERY — CODEX COMMITS + AUDIT (2026-06-18)

Codex implemented the Tier-1 pack in 7 commits:
- oil-centrifuge 89116797 | industrial-centrifuge b2315573 | disc-stack 8ccdb5f6 | three-phase 3c9001c1 | diesel 4d51105c | waste-oil 66501e48 | homepage link 6ef8da0e

AUDIT VERDICT: ✅ PASS. git diffs exact-match the pack; only intended pages + internal-link source pages touched; no stray WIP. Titles/meta correct (entity conventions right). Flagged meta claims VERIFIED on-page: diesel (0.5 micron L262, reconditioned Alfa Laval L139, mid-$30s + Michigan L147), waste-oil (US-built/test-run/6-mo warranty L244). /hydraulic-oil-centrifuge/ target exists. npm run build = 159 pages OK. No "free" language.

3 cosmetic nits from the pass (fix-up commit): (A) oil-centrifuge hydraulic added as lone <ul><li> vs sibling <h3>+<p>; (B) disc-stack "alternate spelling" sentence reads bolted-on (synonym already at L197); (C) diesel new "marine diesel" sentence duplicates the day-tank sentence below it. Bonus pre-existing nits: diesel L186 "per-heaters"→"pre-heaters"; disc-stack-applications L184 "their"→"your".

NOT deployed. Next: fix-up commit → push (1-8 already pending too) → Sanjay GSC re-index /industrial-centrifuge/ + crawl-stats check → re-pull GSC ~July 9.
