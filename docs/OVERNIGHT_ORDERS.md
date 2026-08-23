# OVERNIGHT ORDERS - Trust & Proof campaign (issued by Sanjay, 2026-08-23)

You are the orchestrating agent for an overnight fix campaign on dolphincentrifuge.com.
Sanjay has authorized the whole run: work autonomously, deploy minions for ALL legwork,
ship batch by batch, never wake or involve Sanjay. This file is self-contained.

## Read first (in this order)

1. `docs/GAMEPLAN.md` - the strategy these orders execute (Tracks 1-3).
2. `docs/DAYLIGHT_PLAN.md` - working rules + messaging kit + model cross-reference. BINDING.
3. `docs/DAYLIGHT_HANDOFF.md` - status log + Sanjay's ruling list. APPEND to the log
   after every shipped batch (that is the continuity discipline).
4. `docs/zero-context-audit-top50.md` - the doubt taxonomy driving these fixes.
5. The `dolphin-github` skill - THE deploy route: branch -> PR -> minion in Sanjay's
   logged-in Chrome approves+merges as sprabhu-dolphin -> verify live. Sanjay is NEVER
   asked to log in, click, approve, or type anything. That rule is constitutional.

## Binding rules (violations are regressions)

- URL slugs never change. /alfa-laval-* pages: additive edits only.
- Never invent a fact, number, customer name, certificate, or photo caption. Where truth
  is unknown, write the honest generic and mark `<!-- TBD: Track-2 ruling -->`.
- Numbers on the Track-2 ruling list (handoff top section) are FROZEN - do not pick
  values overnight. Only fix numeric items listed under "confirmed defects" below where
  one page contradicts ITSELF and one side is corroborated by the model's own page.
- No em dashes in customer-facing copy. No authorized/affiliated claims, ever.
- Every batch: npm run build must pass -> ship via the skill route -> live-verify a
  sample page -> log to the handoff. Small batches (6-12 files).
- The "wrong page served" audit complaints were PROVEN artifacts (16/16 byte-stable
  correct). Do not investigate Cloudflare caching. Not a thing.

## PRIORITY 0 - safety/liability claims (do this batch first, tonight)

Confirmed by adjudication 2026-08-23:
1. `/alfa-laval-chnx-418-decanter/` claims "ATEX Certified" 8x (incl. spec-table row and
   meta description) with no certificate number, notified body, Ex marking, or statement
   of what survives Dolphin's teardown/rebuild. HIGHEST-CONSEQUENCE ITEM ON THE SITE.
   Fix: rewrite every instance to the honest chain: the machine is built on an Alfa Laval
   CHNX 418 originally manufactured for ATEX service; Dolphin remanufactures it and
   verifies the nitrogen purge system function in its Warren MI shop; certification
   documentation for the original build available on request. Remove "ATEX Certified" as
   a bare spec row; replace with "Hazardous-area design: ATEX (original Alfa Laval
   build) <!-- TBD: Track-2 ruling on current cert chain -->".
2. The house-standard for hazardous-area language is `/explosion-proof-centrifuge/`
   (cites the directive, shows a sample Ex marking "ATEX II 3 G (Zone 2) II B T3",
   credits Intertek). Normalize ALL other hazardous-area pages to that pattern.
3. `/alfa-laval-diesel-centrifuge/`: "Class 1 Division 2 explosion-proof certification"
   is terminologically wrong - Div 2 equipment is non-incendive/pressurized, not
   "explosion-proof" (that is Div 1). Fix the wording; name no NRTL unless the page
   already truthfully does.
4. Sitewide: "Class 1" -> "Class I" in NEC hazardous-area contexts (17x on
   /explosion-proof-centrifuge/ alone; also the stainless page).
5. `/alfa-laval-diesel-centrifuge/`: remove/reword "restoring off-spec diesel to ASTM
   D975 specification" - a centrifuge cannot establish D975 conformance (cetane, sulfur,
   lubricity). Honest form: "removes the water and particulate contamination that most
   commonly puts stored diesel out of spec".

## PRIORITY 1 - confirmed fake/wrong evidence (tonight)

6. `/pyrolysis-oil-centrifuge/` hero is AI-GENERATED (visually confirmed: garbled DANGER
   placards, nonsense "LUBER" label, dead-end pipes) on a page selling "a real
   installation we built". Remove it. Replace with a real photo from the repo's image
   library or `C:\Dolphin Marine Services\Skids\` (MOPX210/MOPX209 folders) - real,
   uncomposited, honestly captioned - or run the page hero-less.
7. Same page: the only real photo is a 250px MOPX205 thumbnail while the page sells a
   MOPX 210 in 13 places. Swap to a genuine MOPX 210 photo (Skids library) or caption
   honestly as the smaller sibling model.
8. `/liquid-humus-centrifuge/` hero is a third-party composting-yard photo (no decanter
   visible) filed as `Alfa_Laval_NX-314_Decanter_Humu_Facility.webp` with an alt
   asserting it is that machine. Remove or replace with a real NX-314 photo; never
   caption a photo as a machine it does not show.
9. `/three-phase-decanter/` (from top-50 audit): the OEM cutaway is redistributed with
   the "(c) Alfa Laval Inc" credit stripped in the hero/og:image version. Restore the
   visible credit line under the figure.

## PRIORITY 2 - crawler-facing bugs and self-contradictions (tonight)

10. Homepage stat counters render as literal "0+ Years Experience / 0+ Systems
    Delivered" to every crawler and AI (values only in data-target for JS). Server-render
    the real numbers with JS animation as enhancement.
11. H1s on ~12 pages are the raw SEO title including the "|" pipe (e.g. "Liquid Humus
    Centrifuge | Commercial Scale Production"). Give them clean H1s; titles unchanged.
12. Testimonials page schema: Review markup has the anonymous descriptor as a Person
    author and the customer's employer as publisher, no dates, no ratings. Either make
    the structured data truthful (Organization/anonymous handled per schema.org rules,
    Dolphin as publisher, dates if known) or strip the Review JSON-LD and keep quotes
    as plain content. Do not fabricate names or ratings.
13. `/alfa-laval-nx-314-decanter-centrifuge/`: the AVNX 414 spec table is a verbatim
    clone of the NX 314 table; the page contains "The Alfa Laval AVNX 414 Decanter is a
    three-phase decanter centrifuge specially built for the 2-phase separation..." -
    rebuild the section: one honest table per model, TBD-mark specs you cannot verify
    from the model's own page or the BRAIN cross-reference; fix the sentence.
14. Self-contradictions where one side is corroborated (fix these; all adjudicated):
    liquid-humus H2 "40 GPM" over a "30 GPM" table (align to the table unless the NX-314
    page says otherwise); liquid-humus "<5% moisture" dryness claim (physically wrong for
    a decanter - reword to realistic cake dryness); CHNX 100 GPM headline vs its own FAQ
    5-20 m3/hr (align, TBD if unclear); WHPX-510 page MOPX 310 "25 GPM" prose vs "42 GPM"
    table cloned from the row above (TBD-mark, likely wrong clone); NX-314 15 HP on
    liquid-humus vs 10 HP on its own page (align to the model page).
15. Visible byline + published/last-reviewed date component, sitewide (author exists in
    schema; surface it to readers). One reusable component, applied in batches.

## PRIORITY 3 - funnel work (overnight if time remains)

16. CTR rewrites: /decanter-centrifuge/ and /industrial-centrifuge/ titles + metas
    (0.2% CTR at rank ~10 vs site norm 0.8%). Keep the ranking keywords, add the click
    reason (recon + warranty + in-stock). Slugs and H1 content strategy unchanged.
17. Money-page routing: add in-context links/CTAs from the six top-traffic zero-lead
    pages (industrial-centrifuge, decanter-centrifuge, disc-stack-centrifuge,
    wastewater-centrifuge, alfa-laval-centrifugal-separator, waste-oil hub) to the
    converting cluster (/wvo-centrifuge-separator/, /waste-oil-centrifuge/, model pages
    WHPX-513/BTPX-205/NX-418). Natural placement, no link spam - 2-3 per page.
18. Google Ads - NEGATIVES ONLY tonight (via a minion in Sanjay's logged-in Chrome, ads
    account): add exact-match negative keywords for the navigational bleed terms
    (alfa laval phone number / customer service / contact number / email address /
    careers / golbey and obvious siblings found in the search-terms report). DO NOT
    change budgets, bids, or pause keywords overnight - prepare the budget-shift
    proposal as a doc for Sanjay's morning confirmation.
19. April index cliff: investigate read-only (GSC UI via Chrome minion: Pages/coverage
    report; plus site: checks and the redirects file). Write findings to
    `docs/april-cliff-findings.md`. No fixes without understanding.
20. Track-2 prep: build `docs/RULING_WORKSHEET.md` - every frozen numeric conflict as a
    one-line fillable question (current values + pages affected + recommended value with
    reasoning). Goal: Sanjay's ruling hour becomes checkbox-fast.

## Cadence and morning report

- Ship in small PRs: P0 first (single batch), then P1, P2, P3 as separate batches.
- After each merge: live-verify one page, append one status block to DAYLIGHT_HANDOFF.
- End state by morning: P0-P2 live, P3 as far as it got, RULING_WORKSHEET ready,
  ads-budget proposal ready, april-cliff findings written.
- Morning report (in chat): scannable, lead with what shipped and what needs Sanjay's
  hour. Sanjay has ADHD: short, plain, no walls of text.
