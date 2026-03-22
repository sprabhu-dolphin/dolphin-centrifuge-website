# FIX-AUDIT_FOUND_BUGS.md
## Dolphin Centrifuge — Zero-Context Audit Findings Log

Each batch of 10 pages is audited by an independent zero-context agent.
Findings are logged here. Fix agents resolve each issue and mark it ✅.

---

## BATCH 0 — First 5 pages (audited 2026-03-21, session 1)

### disc-stack-centrifuge
- ✅ LINE 1016: DUPLICATE FAQPage JSON-LD — remove the hardcoded `<script type="application/ld+json">` tag that reinjects faqJsonLd; it's already passed via jsonLd prop to ApplicationLayout
- ✅ LINES 946–953: MOPX 207 product card is a grey placeholder div with no image — replace placeholder with actual product image or a styled card with Dolphin model reference
- ✅ HEADINGS: "Industrial Disc Stack Centrifuges" H2 (~line 987) and "Related Articles & Products" H2 (~line 1019) have no id attributes — add id="in-stock" and id="related" respectively
- ✅ BOTTOM CTA BAR: phone number (248) 522-2573 missing from bottom CTA — add tel: link

### waste-oil-centrifuge
- ✅ AI SUMMARY ~68 words — trim to 30–50 words (remove trailing brand/experience sentence)
- ✅ SCHEMA: Article JSON-LD with author Person/jobTitle MISSING entirely — add articleJsonLd to jsonLd array
- ✅ TEMPLATE line 111: AI Summary div missing `not-prose` class — add it
- ✅ CONTENT lines 157–161: Pilot video section is placeholder text — remove or replace with real content

### fuel-oil-centrifuge
- ✅ LINE 122: Hardcoded hex `text-[#555]` — replace with `text-text-light`
- ✅ SCHEMA line 66: Article author name "Dolphin Centrifuge Engineering" is an org string on Person type — change to "Sanjay Prabhu"
- ✅ CTA lines 242–254: Mid-page CTA missing `/industrial-centrifuge-sample-testing/` button — add it
- ✅ IMAGE line 204–211: Alt text "fuel oil separator centrifuge" too generic — make descriptive (include model, process)
- ✅ CONTENT line 170: Developer NOTE flags unverified FAQ content — verify against CENTRIFUGE_BRAIN

### decanter-centrifuge
- ✅ HEADINGS line 533: "Available Decanter Models" H2 missing id attribute — add id="available-models"
- ✅ CTA line 461: Phone tel link `tel:2485222573` missing +1 prefix — change to `tel:+12485222573`

### industrial-centrifuge
- ✅ HEADINGS line 818: "Related Articles" H2 missing id attribute — add id="related"
- ✅ CTA lines 621–629: Mid-page CTA missing phone number — add (248) 522-2573 tel: link
- ✅ IMAGES lines 703–712: Pharmaceutical image has no surrounding link context — add descriptive caption or link

---

## BATCH 1 — pages 6–15 (pending audit)

## BATCH 2 — pages 16–25 (pending audit)

## BATCH 3 — pages 26–35 (pending audit)

## BATCH 4 — pages 36–45 (pending audit)

## BATCH 5 — pages 46–55 (pending audit)

## BATCH 6 — pages 56–65 (pending audit)

## BATCH 7 — pages 66–75 (pending audit)

## BATCH 8 — pages 76–85 (pending audit)

## BATCH 9 — pages 86–95 (pending audit)

## BATCH 10 — pages 96–105 (pending audit)

## BATCH 11 — pages 106–115 (pending audit)

## BATCH 12 — pages 116–125 (pending audit)

## BATCH 13 — pages 126–135 (pending audit)

## BATCH 14 — pages 136–145 (pending audit)

## BATCH 15 — pages 146–155 (pending audit)
