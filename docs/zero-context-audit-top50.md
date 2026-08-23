# Zero-context audit - top 50 pages

50 independent auditors, one page each, no prior knowledge of Dolphin. Each returned
`what_is_this`, `entity_and_brand_read`, `who_runs_it`, `trust_score_0_10`, `doubts[]`,
`single_best_fix`, `verdict`. Source: `zerocontext-top50.json` (562 doubt items).
Pages are numbered P01-P50 in GA4 traffic order (see legend, section 3).
Cross-referenced against the 50-item ruling list in `docs/DAYLIGHT_HANDOFF.md`.

---

## 1. Headline verdict

**Unanimous, all 50: this is a real business.** Every auditor independently identified
Dolphin Centrifuge as a genuine, findable, owner-operated Michigan company that
remanufactures used Alfa Laval centrifuges into turnkey skids.

- 50/50 named Sanjay Prabhu, M.S.M.E. as the person behind it; 44/50 quoted the phone number.
- 49/50 read the Warren MI address as real; 50/50 described the business as real and
  explicitly **not** a drop-shipper, lead-broker or shell.
- 50/50 identified the Alfa Laval relationship correctly as **independent remanufacturer,
  not authorized**; 49/50 found and credited the non-affiliation disclaimer.
- 44/50 used the words *honest*, *candid*, *upfront* or *refreshing* about the disclosure.
- 0/50 raised scam, fraud or misrepresentation of identity.

**And 40/50 verdicts use the word "undercut", "undermined", "let down" or "held back".**
The site is not disbelieved. It is discounted. The pattern is identical on every page: a
credible seller whose own artefacts contradict it.

> "A real, competent, unusually honest-about-its-brand-relationship remanufacturer whose
> own engineering numbers do not survive ten minutes with a calculator - trust it enough
> to call and send a sample, not enough to size a project or wire a deposit off this page."
> **(P08 disc-stack-centrifuge, 6.0)**

> "A real, verifiable Michigan remanufacturer with genuinely expert content and an
> unusually honest 'not affiliated with Alfa Laval' disclaimer, undercut by a bearing photo
> that looks AI-generated while the page insists its images come straight out of its own
> shop - trust the engineering, verify the marketing."
> **(P24 decanter-centrifuge-vibration, 6.0)**

> "A real, verifiable, owner-operated Michigan remanufacturer with unusually honest
> brand-independence disclosure and genuinely useful engineering content, undercut by SEO
> puffery, one flatly false universal claim, an unfinished section, and prestige customer
> name-drops it never backs up - I would take the sales call, but I would demand three
> customer references before sending money."
> **(P09 alfa-laval-centrifuge, 6.5)**

> "A real, locatable Michigan shop with one credibly credentialed engineer and an honest,
> machine-consistent 'not affiliated with Alfa Laval' disclaimer - undermined by a page
> where literally every proof point (military customers, 500+ systems, 100+ team-years,
> 10 billion gallons) is self-asserted, anonymized, or years out of date."
> **(P39 about-dolphin-centrifuge, 6.5)**

The repeated closing formula across the set: *credible enough to call, not credible enough
to wire money against.*

---

## 2. Trust stats

| Metric | Value |
|---|---|
| Mean | **6.52 / 10** |
| Median | 6.5 |
| Min | 6.0 |
| Max | 7.0 |
| Range | 1.0 point across 50 independent auditors |

| Score | Pages | Share |
|---|---|---|
| 7.0 | 20 | 40% |
| 6.5 | 12 | 24% |
| 6.0 | 18 | 36% |

No page scored above 7 and no page scored below 6. That 1-point band across 50 blind
auditors is the most useful stat here: the ceiling is not page-specific. Nothing on any
page gets it past 7, and the reasons are the same sitewide claims and sitewide components
on all 50 pages. Fixing one page cannot move the number; fixing the shared layer moves all 50.

Score-6 pages skew to those with a hard, catchable numeric or image error
(P03 waste-oil, P08 disc-stack, P21 decanter-vs-disc, P24 vibration, P28 RCF, P43 three-phase,
P45 smallest, P50 black-diesel). Score-7 pages are the ones where the content is clean and
only the shared trust layer is weak.

---

## 3. Doubt taxonomy

All 562 doubt items clustered into 25 themes by primary cause. "Pages" = distinct pages
raising that theme; "sessions" = combined GA4 sessions of those pages (total across the
50 audited pages: 42,702).

### Page legend

| | | | |
|---|---|---|---|
| P01 `/` | P14 purifier-clarifier-difference | P27 alfa-laval-centrifuges | P40 beer-wine |
| P02 al-centrifugal-separator | P15 oil-centrifuge | P28 rcf-rpm-calculation | P41 disc-stack-applications |
| P03 waste-oil | P16 decanter-optimization | P29 fuel-oil | P42 disc-stack-options |
| P04 industrial-centrifuge | P17 crude-oil | P30 biodiesel | P43 three-phase-decanter |
| P05 wastewater | P18 lube-oil | P31 disc-stack-faq | P44 operating-water |
| P06 decanter-centrifuge | P19 stainless-steel | P32 backpressure | P45 smallest |
| P07 decanter-differential-speed | P20 troubleshoot-bowl | P33 contact | P46 nx-418 |
| P08 disc-stack-centrifuge | P21 decanter-vs-disc | P34 selection-guide | P47 disc-repair |
| P09 alfa-laval-centrifuge | P22 dewatering | P35 liquid-seal-break | P48 efficiency |
| P10 al-centrifuge-parts | P23 pond-depth | P36 wvo | P49 sludge-ejection |
| P11 parts-glossary | P24 decanter-vibration | P37 ethanol-comparison | P50 black-diesel |
| P12 diesel-centrifuge | P25 machine-coolant | P38 bowl-leaking | |
| P13 centrifugal-filter | P26 algae | P39 about | |

### Theme counts

| # | Theme | Items | Pages | Sessions |
|---|---|---|---|---|
| T01 | Unverifiable prestige claims and anonymous social proof | 74 | 48 | 41,725 |
| T02 | Self-contradicting specs and numbers | 75 | 34 | 32,462 |
| T08 | Photo, caption and alt text do not match the image | 57 | 38 | 32,993 |
| T03 | Author tenure arithmetic: personal "40+ years" vs 1990 degree | 47 | 41 | 33,635 |
| T13 | No price, lead time, warranty terms or inventory a buyer can check | 37 | 29 | 27,242 |
| T04 | One engineer, conflicting job titles | 37 | 31 | 20,908 |
| T12 | Outright factual, physics and arithmetic errors | 30 | 17 | 17,063 |
| T24 | Schema hygiene defects (duplicate / invalid / mismatched JSON-LD) | 24 | 21 | 15,671 |
| T07 | No visible date; stale or placeholder freshness signals | 21 | 20 | 9,931 |
| T05 | Structured data contradicts the page (brand/manufacturer = Alfa Laval) | 18 | 16 | 16,524 |
| T06 | Author / E-E-A-T shown to crawlers, hidden from readers | 17 | 16 | 8,755 |
| T09 | Synthetic / AI-generated imagery passed off as real | 14 | 12 | 8,759 |
| T20 | Unsourced numbers: no citation, standard, test data or regulatory context | 16 | 13 | 4,785 |
| T14 | Title / headline promises the page does not deliver | 15 | 13 | 15,575 |
| T16 | OEM artwork used without credit (or with credit stripped) | 15 | 14 | 8,945 |
| T11 | Disclaimer placement / emphasis, and missing trademark attribution | 13 | 12 | 13,232 |
| T10 | No first-party photographic evidence of the shop, stock or work | 12 | 11 | 5,311 |
| T17 | Parts provenance: "genuine parts" vs aftermarket vs beyond-OEM | 10 | 9 | 9,692 |
| T21 | Editorial content blended into, or gated behind, the sales funnel | 8 | 7 | 5,696 |
| T19 | Typos and unproofread copy in engineering content | 8 | 8 | 3,405 |
| T15 | Founding year 1982 vs third-party records (1995) | 4 | 4 | 2,536 |
| T22 | Serving / edge-cache anomaly (wrong page served) | 3 | 3 | 4,484 |
| T25 | Guides with no numbers - nothing a reader can actually set | 3 | 3 | 1,361 |
| T18 | JS-only stat counters serve as literal zeros in HTML | 2 | 2 | 8,010 |
| T23 | Tracking without a consent notice near the form | 2 | 2 | 1,874 |
| | **Total** | **562** | | |

Counts above are primary-cause labels (each doubt counted once). Several claims are raised
on far more pages than their primary bucket shows, because on most pages they arrive
bundled inside another complaint. Mention-level reach for the biggest ones:

| Claim raised anywhere in a doubt | Pages | Sessions |
|---|---|---|
| "Trusted by the U.S. Military / Fortune 500 / 500+ systems since 1982" | **50** | 42,702 |
| Personal "40+ years" vs the schema's own Class of 1990 | 43 | 36,449 |
| Photo / caption / alt-text mismatch | 41 | 28,032 |
| "150+ centrifuges in stock" with nothing enumerated | 39 | 29,872 |
| No visible date, or a stale/placeholder date | 36 | 20,685 |
| Conflicting job titles for Sanjay Prabhu | 35 | 23,011 |
| No visible byline / invisible author | 30 | 19,086 |
| "6-Month Mechanical Warranty" with no terms | 26 | 23,621 |
| No certification, ISO, BBB or third-party validation | 23 | 16,006 |
| Product/Service schema brand or manufacturer = Alfa Laval | 22 | 21,570 |
| No price or lead time | 22 | 24,908 |
| Disclaimer placement / no trademark attribution | 21 | 19,123 |
| "Largest inventory in North America" / "Apart from Alfa Laval itself..." | 19 | 19,303 |
| Synthetic / AI-generated / composited image | 12 | 8,759 |
| "10 billion gallons" (2017, undefined) | 8 | 4,888 |
| Founding 1982 vs directory records showing 1995 | 8 | 5,431 |

---

### T01 - Unverifiable prestige claims and anonymous social proof
**74 items / 48 pages / 41,725 sessions.** Universal (the banner itself is raised on all 50).
Covers: the trust banner, "150+ centrifuges in stock", "largest inventory in North America",
"Apart from Alfa Laval itself, Dolphin is the reliable source", "the independent specialist",
"10 billion gallons" (2017), initials-only testimonials, anonymized case studies, "our
engineers" plural against one named employee, "rebuilds every week".

> "Naming customers by *category* rather than by name is the classic shape of a claim
> nobody can check." (P22)

> "Social proof is anonymized to the point of being unfalsifiable ... names zero customers.
> The single testimonial is attributed to 'T.G., President & CEO, Northeast biodiesel
> start-up'." (P01)

> "Military and Fortune 500 are the two easiest claims to make and the two hardest to
> check, and this page does nothing to help me check either." (P42)

### T02 - Self-contradicting specs and numbers
**75 items / 34 pages / 32,462 sessions.** The single densest cluster and the direct cause
of most 6.0 scores. Same machine, different capacity/RPM/HP/G-force/micron in two places
on one page, or against the site's own model page.

> "Alfa Laval WHPX-405 is listed ... as 10 GPM / 8,000 RPM / 5 HP / 2,500 lbs; in the
> 'Centrifuges for Sale' card lower on the SAME page as 5 GPM @ 180F / 8,500 RPM / 4 HP /
> 1,800 lbs; and on the site's own /alfa-laval-whpx-405/ product page as 15 GPM / 7,600 RPM
> ... Capacity is the exact number a buyer sizes and budgets against." (P03)

> "HARD SPEC CONTRADICTION against the company's own pages. This page's table says UVNX 314
> = 15 HP and UVNX 418 = 25 HP. But /alfa-laval-nx-314-decanter-centrifuge/ lists the NX 314
> ... at 10 HP, and /alfa-laval-nx-418-decanter-centrifuge/ ... at 20 HP." (P43)

> "The page contradicts itself on the single most decision-relevant spec, disc-stack maximum
> feed solids, four different ways ... Worse, the Alfa Laval chart embedded on the same page
> visibly shows disc stack separators operating up to roughly 22% solids. A buyer sizing
> equipment cannot use this page." (P21)

### T08 - Photo, caption and alt text do not match the image
**57 items / 38 pages / 32,993 sessions.** Alt text describing labels that are not in the
figure; captions naming a different model than the filename; photos recycled across
application pages and relabelled; "as shown in the photograph above" pointing at a schematic.

> "Body copy states: The featured image ... is an Alfa Laval disc stack centrifuge bowl
> cross-section ... The alt text says something different ... I downloaded and viewed the
> actual file: it is neither. ... The page tells the reader to look at a diagram that does
> not exist." (P11)

> "The photo captioned 'Alfa Laval MAB-102 small capacity compressor oil centrifuge' is not
> a MAB-102 ... it shows a large blue turnkey skid on casters with an explosion-proof control
> panel, pumps, heater, valves and piping - sitting inches from a spec table that says the
> machine weighs 100 lbs." (P45)

> "Alt text overclaims what the image contains ... it labels Sliding Piston and Operating
> Slide, but there is no Drain Valve Plug label, no Closing Water Chamber, no Opening Water
> Chamber ... Written for crawlers, not for readers." (P20)

### T03 - Author tenure arithmetic: personal "40+ years" vs 1990 degree
**47 items / 41 pages / 33,635 sessions.** The most mechanically repeated defect on the site
and the only claim auditors called *provably* false from the site's own data.

> "This is the single highest-value change because it is the only claim on the page that its
> own data provably refutes (the same schema block says Class of 1990)." (P38)

> "The company's 1982 founding date quietly transferred onto the individual ... Small, but it
> is exactly the kind of inflation that makes a careful reader re-audit every other number on
> the page." (P39)

### T13 - No price, lead time, warranty terms or inventory a buyer can check
**37 items / 29 pages / 27,242 sessions.** Dominated by the "6-Month Mechanical Warranty"
badge (26 pages) asserted 3-4 times per page with no terms, no exclusions, no document.

> "The 6-month mechanical warranty is asserted four times but its terms are never stated or
> linked - what it covers, what voids it, and 'to the original purchaser' only, which quietly
> means it does not transfer." (P18)

> "Those are remanufactured-machine promises pasted onto a parts page ... a buyer skimming
> will reasonably assume the 6-month warranty covers what they are about to order. That is
> the most commercially misleading thing here." (P10)

### T04 - One engineer, conflicting job titles
**37 items / 31 pages / 20,908 sessions.** Up to four titles for the same @id: visible byline
"Engineering Manager", Article schema "Centrifuge Applications Engineer", Organization schema
"Owner and Chief Engineer", About page "leads centrifuge applications engineering".

> "The commercially relevant one - that the author owns the business selling the machines -
> is the one only machines can see." (P31)

### T12 - Outright factual, physics and arithmetic errors
**30 items / 17 pages / 17,063 sessions.** Errors that are wrong, not merely unproven.
Includes both wrong published formulas.

> "FLAGSHIP ERROR: the branded formula diagram is mathematically wrong ... it reads
> 'RCF = 1.18 x r x (RPM/1000)'. ... there is no exponent on the RPM term, and the constant is
> 1.18 where it should be 11.18. Applied to the page's own example ... off by a factor of ~47.
> Squaring RPM is the entire concept the article exists to teach, and the graphic drops it." (P28)

> "The printed formula contradicts the page's own calculator by a factor of 100 ... On a page
> that warns in capitals that a mis-set cycle time can cause 'catastrophic failure of the
> centrifuge and possible injury or death,' publishing a formula that disagrees with your own
> calculator is a serious competence flag." (P49)

> "Demonstrably false universal claim: 'All wine producers, including red, white, and
> carbonated wines, use Alfa Laval wine centrifuges to process wine.'" (P09)

Others: the operating-cost table's 100x cents/dollars unit error and the Ae table that
contradicts the formula printed above it (P08); the NX-314/NX-418 identical-G-force physics
error (P22); "316L Duplex Stainless Steel", which is not a real material (P06, P37); the
ethanol table's radius-labelled-as-diameter and a dimensionally impossible basket (P37); a
5 HP single-phase motor sold as 110 V capable (P45); the decanter operating-cost worked
example that omits motor power entirely (P06).

### T24 - Schema hygiene defects
**24 items / 21 pages / 15,671 sessions.** Duplicate BreadcrumbList blocks (P32, P36, P46),
three JSON-LD blocks missing `@context` and therefore discarded (P17, including the one
carrying the author credential), malformed LinkedIn `sameAs` with a raw ampersand (5+ pages),
a Facebook `sameAs` returning HTTP 400 (P04, P39), Article headline vs `<title>` vs WebPage
name all different (P08, P12, P15, P30, P43), Product schema with no offers on pages that
publish prices, `og:type` website vs Article (P48), breadcrumb parents pointing at the wrong
hub (P10, P32, P37, P43).

### T07 - No visible date; stale or placeholder freshness signals
**21 items / 20 pages / 9,931 sessions.** Round placeholder dates (`2021-01-01`, `2020-01-01`),
`dateModified` absent on 5-year-old troubleshooting guides, and one demonstrably false one:

> "the Article JSON-LD declares dateModified 2022-08-30, but the page is demonstrably far
> newer - the footer says (c) 2026 and the page's own inline JS carries site_version
> 'dolphin_astro_2026' ... The page tells search engines it has not been touched in four
> years, which is not true." (P34)

### T05 - Structured data contradicts the visible page
**18 items / 16 pages primary (22 pages mention it) / 16,524-21,570 sessions.**
`brand` and `manufacturer` both set to Alfa Laval on Dolphin-built skids, inside the same
JSON object whose description disclaims affiliation.

> "The disclaimer and the manufacturer field are in the same JSON object contradicting each
> other. Dolphin is named nowhere in the Product node as brand, manufacturer, or seller." (P25)

> "Search engines and AI assistants ingesting this page are told the opposite of what the
> human-readable disclaimer says." (P27)

### T09 - Synthetic / AI-generated imagery passed off as real
**14 items / 12 pages / 8,759 sessions.** The lowest traffic weight on the list and the most
damaging category per item. Nine heroes called out firmly as generated or composited while
their alt text asserts a real Dolphin build: P05 wastewater, P10 parts, P12 diesel, P24
vibration (bearing photo), P26 algae, P27 alfa-laval-centrifuges ("our facility"), P29
fuel-oil (unlabelled CAD renders), P33 contact, P45 smallest. Three more flagged as suspicion
or as a synthetic marketing banner rather than a firm finding: P17, P25, P41.

> "the 'Dolphin Centrifuge' logo on the control panel is garbled pseudo-lettering
> ('Toighin') ... The single most prominent asset on the page is a fake photo of a machine
> they claim to have built - while the real, clearly Dolphin-branded photographs further
> down the page are perfectly good." (P05)

> "Tellingly, it is the ONLY 'photo' on the page WITHOUT the Dolphin watermark that the two
> authentic shop photos both carry, and it is 182KB versus ~21KB for the real ones. This is
> the sharpest integrity problem on the page." (P24)

> "the image's entire job is to prove the page's central claim ('1000s of parts in
> inventory', 'same day from stock') - the one asset placed to evidence real inventory is
> fabricated inventory." (P10)

### T06 - Author / E-E-A-T shown to crawlers, hidden from readers
**17 items / 16 pages / 8,755 sessions.**

> "A buyer reads an anonymous, undated page while search engines are told a 40-year expert
> wrote it. That asymmetry is itself a trust problem." (P07)

### T20 - Unsourced numbers: no citation, standard, test data or regulatory context
**16 items / 13 pages / 4,785 sessions.** Vibration thresholds with no ISO 10816/20816 (P24),
charts with unlabelled axes presented as measured data (P16, P37), "field data" with no
sample size (P37), self-generated test data with no date or method (P48), 85 dB described as
"not excessive" at exactly the OSHA action level (P22), and complete regulatory silence on a
page promoting used motor oil as road fuel (P50).

### T14 - Title / headline promises the page does not deliver
**15 items / 13 pages / 15,575 sessions.**

> "The words purifier and clarifier appear ONLY in the title, meta tags, hero subtitle and
> JSON-LD - zero times in the article body. ... The headline is chasing a keyword the article
> never delivers on." (P02)

> "The title tag, H1 and og:title all promise Disc Stack Centrifuge Parts Diagram. There is
> no diagram, exploded view or labeled cross-section anywhere on the page." (P11)

Also: "Sizing" promised, none delivered (P04); an H2 "Specifications" followed by no table
(P09); "7 Key Things" with no list of seven (P44); "50+" vs a TOC numbered to 67 (P41);
raw pipe-separated SEO title strings shipped as H1 (P03, P04, P07).

### T16 - OEM artwork used without credit (or with credit stripped)
**15 items / 14 pages / 8,945 sessions.** Sharpest instance:

> "The 400px inline figure has burned-in artwork text ... plus a corner credit '(c) Alfa
> Laval Inc' ... The 1600px variant of the same drawing, which serves as the page's hero
> banner AND the og:image AND the Product schema image, has that caption strip and the
> '(c) Alfa Laval Inc' credit removed ... the site is distributing OEM artwork with the OEM's
> mark stripped, which sits badly next to its otherwise scrupulous non-affiliation language." (P43)

> "Hero image is Alfa Laval's own studio marketing render, with the ALFA LAVAL logo and 'G2'
> badge clearly visible, used without attribution by a company that explicitly disclaims
> affiliation with Alfa Laval. The visual borrows exactly the authority the text gives back." (P23)

### T11 - Disclaimer placement / emphasis, and missing trademark attribution
**13 items / 12 pages primary (21 mention) / 13,232-19,123 sessions.**

> "'Alfa Laval' appears 99 times in the source; the disclaimer appears exactly once in
> visible copy, buried at the tail of the third paragraph of a mid-page block. It is absent
> from the title tag, from the meta description, from og: and twitter: descriptions, from the
> footer, and from the H1 area - so every search and social snippet propagates the brand
> association with no caveat." (P01)

> "66 uses of a third party's trademark, zero (TM)/(R) symbols, one disclaimer buried
> mid-page in a summary box, none in the footer. A cautious buyer could easily leave this
> page thinking they're buying from an Alfa Laval channel partner." (P30)

### T10 - No first-party photographic evidence
**12 items / 11 pages / 5,311 sessions.** Pages whose whole pitch is physical craftsmanship
carrying only diagrams and renders.

> "The entire differentiator claimed is physical craftsmanship ... There is no shop floor, no
> teardown, no rebuilt bowl, no test stand, no delivered skid. The visual evidence for the one
> claim that most needs evidence is entirely missing." (P13)

### T17 - Parts provenance: "genuine parts" vs aftermarket vs beyond-OEM
**10 items / 9 pages / 9,692 sessions.**

> "the homepage says systems are 'rebuilt to OEM specifications with genuine parts,' the
> About page says the company 'started as an Alfa Laval aftermarket parts manufacturer,' and
> this page's badge says 'Beyond-OEM Rebuild.' Genuine, aftermarket, and beyond-OEM are three
> different things and a parts-sensitive buyer would want that pinned down." (P24)

### T21 - Editorial content blended into, or gated behind, the sales funnel
**8 items / 7 pages / 5,696 sessions.** Worst case is a withheld input:

> "the sample table demonstrably encodes that number for the MOPX-207 (I back-solved 0.774
> gallons / 2.93 L consistently across all 35 cells). They know the figure and withhold it,
> turning an educational tool into a lead-capture gate." (P49)

### T19 - Typos and unproofread copy in engineering content
**8 items / 8 pages / 3,405 sessions.** "Synopsys" for Synopsis (twice, P11), "Beech Angle"
in a spec table (P22), a verbatim duplicated paragraph (P35), "This water operates the pushes
the operating slide downwards" (P44), raw UUID suffixes in heading IDs (P39), and a page of
apparently machine-generated unedited prose (P50).

### T15 - Founding year 1982 vs third-party records (1995)
**4 items primary / 8 pages mention / 5,431 sessions.** Directory records list the entity as
Dolphin Marine Services Inc., in business since 1995. Auditors flagged it as unresolved
rather than false, but nothing on the site preempts the check.

### T22 - Serving / edge-cache anomaly
**3 items / 3 pages / 4,484 sessions.** Two auditors independently received a response whose
title, canonical, meta and JSON-LD belonged to a different page. P13 traced its own instance
to local tooling contamination and cleared the site; P02 and P27 could not reproduce theirs
but could not clear it either.

> "the HTTP response carried the <title>, meta description, og: tags and rel=canonical of a
> completely different article ... attached to the body of a third page ... it indicates a
> real rendering or edge-cache incoherence that can serve wrong canonicals and wrong metadata
> to crawlers." (P27)

**This one is worth 20 minutes of Cloudflare cache-key checking regardless of the fix list.**

### T25 - Guides with no numbers
**3 items / 3 pages / 1,361 sessions.** P42 options (zero models, zero GPM, zero microns),
P44 operating-water (an article about parameters that states none), P16 optimization
(no RPM, no G, no worked example).

### T18 - JS-only stat counters serve as literal zeros
**2 items / 2 pages / 8,010 sessions** (homepage + disc-stack).

> "The served HTML contains '0+ Years Experience', '0+ Systems Delivered', '0% Every Unit
> Tested', '0+ Parts in Stock' - the real values live only in data-target attributes
> (40/500/100/2000) animated by JS. With scripts off, or to a crawler or LLM reading source,
> the entire trust panel reads zero." (P01)

### T23 - Tracking without a consent notice near the form
**2 items / 2 pages / 1,874 sessions.** First-party `visitor_id` cookie, localStorage profile
and pageview beacons with the privacy policy as a footer link only (P10, P33). Both auditors
noted the form posts to Dolphin's own Worker rather than a lead broker, which they called
"the good version of this".

---

## 4. Fix-map

The 50 `single_best_fix` recommendations deduplicate to **11 distinct actions**. Ranked by
auditors satisfied x traffic of affected pages.

"#1 fix" = auditors who named it as *the* single best fix for their page. "Also cited" =
auditors who named it as their explicit close second.

| Rank | Action | #1 fix | Also cited | Pages | Sessions | vs ruling list |
|---|---|---|---|---|---|---|
| 1 | **Put named, dated, checkable references behind the trust banner - or delete it** | 16 | 4 | 48 | 41,725 | **NEW** |
| 2 | **One authoritative spec table per model, reconciled sitewide** | 11 | 8 | 34 | 32,462 | **PARTIAL** (list A) |
| 3 | **Replace synthetic / AI / borrowed-OEM heroes with real dated shop photos** | 9 | 1 | 12 synthetic + 14 OEM-art | 8,759 / 8,945 | **NEW** |
| 4 | **Sitewide visible byline + published / last-reviewed date component** | 3 | 2 | 36-43 | 36,449 | **NEW** |
| 5 | **Move "40+ years" from the person to the company; one job title everywhere** | 1 | 1 | 43 | 36,449 | **PARTIAL** (D2) |
| 6 | **Product/Service JSON-LD: brand + manufacturer = Dolphin, Alfa Laval as base machine** | 1 | 6 | 22 | 21,570 | **NEW** |
| 7 | **Make every caption and alt text describe the actual image** | 3 | 0 | 41 | 28,032 | **PARTIAL** (list C) |
| 8 | **Publish a dated, unit-level inventory list (retires "150+ in stock")** | 2 | 0 | 39 | 29,872 | **NEW** |
| 9 | **Publish the 6-month warranty terms as a linked document** | 0 | 1 | 26 | 23,621 | **NEW** |
| 10 | **Disclaimer at first Alfa Laval mention + footer + inside the schema node; add trademark line** | 1 | 3 | 21 | 19,123 | **NEW** |
| 11 | **Correct the two wrong published formulas (RCF graphic, sludge-cycle 100x)** | 2 | 0 | 2 | 707 | **NEW** |

Below the auditors' #1 line but flagged repeatedly and cheap:

| | Action | Pages | Sessions | vs ruling list |
|---|---|---|---|---|
| 12 | Cite a source under every spec table and chart ("Alfa Laval datasheet" / "Dolphin wet-test, Warren MI, [date]") | 13+ | 4,785 | **NEW** |
| 13 | Schema hygiene sweep: duplicate breadcrumbs, missing `@context`, malformed LinkedIn `sameAs`, dead Facebook, headline/name mismatches | 21 | 15,671 | **PARTIAL** (D6) |
| 14 | Render the homepage stat counters server-side so they are not zeros in HTML | 2 | 8,010 | **NEW** |
| 15 | Investigate the edge-cache / wrong-canonical anomaly | 3 | 4,484 | **NEW** |

### Cross-reference detail against `DAYLIGHT_HANDOFF.md`

**Ruling list A (24 numeric rulings) covers roughly 9 of ~35 distinct numeric conflicts the
auditors found.** Already on the list: WHPX-405 GPM and bowl speed (A1-A3, P03), WHPX-513
50 vs 60 GPM (A4, P03), waste-oil G-force (A5, P03), NX-314 capacity / bowl speed / motor /
bowl diameter (A6-A10, P05, P06, P22, P43), MAB 103 turbine lube (A13, P18), DMPX-042 rated
GPM (A14, P29), WVO 15 GPM DMPX-028 vs DMPX-014 (A18, P36), WSPX sizing story (A21-A23, P25).

**Numeric conflicts the auditors found that are NOT on the ruling list (all NEW):**

- MOPX-205 21 vs 25 GPM and MOPX-207 30 vs 34 GPM, same page, same field (P08)
- Micron rating 1 vs 0.5 across hero, table, FAQ and HowTo schema (P03, P08, P12, P18, P36, P50)
- G-force 7,000 / 8,000 / 10,000 / 12,000 stated for the same class (P03, P08, P15, P26, P41)
- MAB-206 25 GPM on 2 HP vs MOPX-205 10 GPM on 4 HP (P15)
- MAB 205 18 / 15 / 10 GPM and MAB 103 800 vs 1,500 lbs plus a vanished 110 V option (P18)
- AFPX 213 bowl speed 4,150 vs 4,600 RPM (P19)
- Disc-stack maximum feed solids 5 / 8 / 10 / ~22 percent on one page (P21)
- WHPX-510 32 vs 50 GPM on coolant (P25)
- BRPX 313 "over 7,000 Gs" vs its own 6,500 Gs table (P30, P40)
- NX-418 / UVNX 418 motor 25 vs 20 HP (P43, P46) - the list has NX-418 bowl length only
- P-660 motor 7.5 / 5~10 / 5 HP and MAB-102 G-force 8,500 / "over 9,000" (P45)
- Black diesel 80 GPM vs a 40 GPM table maximum, 5 GPM vs 2 GPM (P50)
- Basket ethanol recovery 70 vs 80 percent; radius labelled where diameter is meant (P37)
- BS&W below 0.1 percent vs below 1 percent (P17)
- Decanter particle range 1 micron vs 50 micron (P06); decanter cutoff 50-100 vs over 100 (P34)

**Ruling list C (10 photo confirmations) does not reach the auditors' photo problem.** List C
asks which model is in a real photo. The auditors' finding is different in kind: nine heroes
they read as synthetic (T09), 41 pages with caption/alt mismatches (T08), and OEM artwork
distributed with the copyright credit stripped (P43). Only C8 (decanter-vibration shop photos)
overlaps a page the auditors flagged, and there the finding is the AI-looking bearing image,
not the model name.

**Ruling list D:** D2 (founder vs owner in Person schema) is the only item touching the
job-title and tenure cluster, which is the second-largest defect on the site by page count.
D6 (duplicate BreadcrumbList on backpressure) covers one of three pages emitting duplicates;
P36 wvo and P46 nx-418 are NEW.

**Ruling list B (10 model designations)** is not reflected in the auditor findings at all.
Auditors were not able to see designation ambiguity; it does not affect the trust score.

---

## 5. What would move 6.5 to 8+

The auditors are consistent about why they stop at 7. It is not the disclosure, the
engineering or the company. It is that **every claim is the seller vouching for the seller,
and the seller's own artefacts disagree with each other.** Five changes cover it. Four of the
five are sitewide components, not page edits.

1. **Three named, dated references, in a sitewide component that replaces the banner.**
   Customer or site name, year, model supplied, measured before/after result, linked to a
   case study. If NDAs block names, say so explicitly and give industry + region + year +
   model + hard numbers + "references on request". 16 of 50 auditors named this as *the* fix;
   another 4 named it second. Nothing else on the list comes close.

2. **One spec source of truth per model.** Pick the number, state the fluid and duty it
   assumes, and drive every table, sidebar, gallery caption and schema field from it. Sanjay's
   ruling-list A answers about 9 of the 35 conflicts; the other 26 need the same one-pass
   treatment. This is what separates the 6.0 pages from the 7.0 pages.

3. **Delete the nine synthetic heroes.** Every auditor who found one said the same thing:
   the fake image is the one asset placed to prove the real claim, and finding it makes them
   re-audit everything else. The genuine shop photos already exist further down the same pages.

4. **A byline + date component on every page.** Sanjay Prabhu, M.S.M.E., one job title
   (the one that says he owns the company), linked to his bio, with visible Published and Last
   reviewed dates. Same component moves "40+ years" off the person and onto the company, which
   is the only claim on the site that its own data refutes.

5. **Make the machine layer say what the copy says.** `brand` and `manufacturer` = Dolphin
   Centrifuge, Alfa Laval named as the remanufactured base machine, the non-affiliation line
   inside the same node, and the disclaimer moved to first Alfa Laval mention plus the footer.

Cheap add-ons that cost minutes and were each raised on 20+ pages: publish the warranty terms
as a real document behind the badge; correct the two wrong formulas; server-render the
homepage stat counters so the trust panel does not read zero to every crawler and LLM.

Do 1 through 5 and the recurring verdict sentence changes from *"credible enough to call, not
credible enough to wire money against"* to something a procurement engineer can act on
without a plant visit. That is the 8.
