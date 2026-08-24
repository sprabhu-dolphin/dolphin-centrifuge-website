# Industrial and Disc Stack SEO Title Experiment

This is a controlled sequential A/B/C test, not simultaneous random title delivery. Google indexes one canonical title per URL and may rewrite it, so serving random variants would make the result unreliable.

## Pages and variants

### Industrial centrifuge

- A, ran through 2026-08-10: `Industrial Centrifuge | Types, Continuous Separation, Cost & Applications`
- B, ran from 2026-08-10 through 2026-08-23: `Industrial Centrifuge Machines | Disc Stack Systems & Sizing`
- C, current live since 2026-08-23: `Industrial Centrifuge | Remanufactured Alfa Laval, In Stock`

### Disc stack centrifuge

- A, current live: `Disc Stack Centrifuge: How It Works, Cost & Sizing Guide`
- B, first challenger: `Disc Stack Centrifuge | Industrial Applications, Sizing & Price`
- C, reserve challenger: `Disc Stack Centrifuge | 40+ Years of Alfa Laval Expertise`

## Frozen A baseline

Search Console data through 2026-08-08, with URL fragments consolidated into their canonical page.

| Page | Period | Clicks | Impressions | CTR | Average position |
| --- | --- | ---: | ---: | ---: | ---: |
| Disc stack | 2026-07-26 to 2026-08-08 | 27 | 3,944 | 0.68% | 8.76 |
| Disc stack | 2026-07-12 to 2026-07-25 | 28 | 3,063 | 0.91% | 8.00 |
| Industrial | 2026-07-26 to 2026-08-08 | 14 | 6,656 | 0.21% | 10.06 |
| Industrial | 2026-07-12 to 2026-07-25 | 12 | 7,090 | 0.17% | 8.95 |

The 28-day query baseline shows the opportunity is primarily click capture:

- `industrial centrifuge`: 2,571 impressions, 4 clicks, 0.16% CTR, position 6.30.
- `industrial centrifuges`: 1,712 impressions, 0 clicks, position 7.06.
- `industrial centrifuge machine`: 623 impressions, 0 clicks, position 6.44.
- `disc stack centrifuge`: 1,100 impressions, 7 clicks, 0.64% CTR, position 8.50.
- `disk stack centrifuge`: 332 impressions, 2 clicks, 0.60% CTR, position 12.66.
- `disc stack centrifuge price`: 110 impressions, 0 clicks, position 5.25.

## Industrial A/B readout before C

The native GSC bulk export was fresh through 2026-08-22. The comparison below uses
the canonical URL only, excluding fragment rows, and gives B one fewer day because
the export contains 13 complete B days.

| Scope | Variant | Period | Days | Clicks | Impressions | CTR | Average position |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: |
| Canonical page, all queries | A | 2026-07-27 to 2026-08-09 | 14 | 14 | 3,516 | 0.398% | 15.07 |
| Canonical page, all queries | B | 2026-08-10 to 2026-08-22 | 13 | 15 | 3,339 | 0.449% | 13.80 |
| `industrial centrifuge` | A | 2026-07-27 to 2026-08-09 | 14 | 3 | 389 | 0.771% | 10.34 |
| `industrial centrifuge` | B | 2026-08-10 to 2026-08-22 | 13 | 6 | 349 | 1.719% | 7.64 |
| `industrial centrifuge machine` | A | 2026-07-27 to 2026-08-09 | 14 | 0 | 141 | 0% | 9.91 |
| `industrial centrifuge machine` | B | 2026-08-10 to 2026-08-22 | 13 | 0 | 126 | 0% | 6.44 |
| `industrial centrifuges` | A | 2026-07-27 to 2026-08-09 | 14 | 0 | 216 | 0% | 13.30 |
| `industrial centrifuges` | B | 2026-08-10 to 2026-08-22 | 13 | 1 | 216 | 0.463% | 13.96 |

B improved page CTR by 12.8% relative, delivered more clicks in one fewer day, and
improved average position by 1.27. For the exact `industrial centrifuge` query, CTR
rose 123%, clicks doubled, and position improved by 2.70. B is therefore the frozen
rollback candidate while C tests whether stronger commercial qualification captures
more of the remaining high-position, zero-click traffic.

GA4 also remained stable: organic landings were 22 for A's 14-day window and 25 for
B's comparable 14-day window. Neither period recorded a key event on this landing page.

## Test method

1. Keep industrial Variant C live from the 2026-08-23 deployment; keep B frozen as the rollback title.
2. Hold body copy, H1s, internal links, canonicals, and structured data constant except for keeping page-level title fields aligned with C.
3. Review C after 7 complete days plus Search Console lag for adoption or material rank loss. Do not call a winner at this point.
4. Review after 14 complete C days plus Search Console lag. Compare the same query baskets, page metrics, and page share of sitewide organic traffic.
5. Use the unchanged purifier-versus-clarifier page and sitewide non-brand organic trend as controls for broad demand or algorithm changes.
6. Keep C only if it beats B's click capture without rank damage; otherwise restore B.

## Decision rules

- Win: core-query CTR improves at least 20% relative, total clicks do not decline, and average position is no worse than 0.5 positions.
- Inconclusive: CTR moves less than 20%, impressions materially change, or Google has not consistently adopted the tested title. Extend C for seven days before deciding.
- Stop or roll back: average position worsens by more than 1.0 across two checks, core-query clicks materially decline, or the wrong page begins taking the target queries.
- B is the recovery fallback. Do not extend C beyond one optional seven-day period if it remains inconclusive.

## Parallel diagnosis

The weekly consolidated SEO brief should also report:

- DataForSEO live rank and displayed-title checks for the experiment query basket.
- Search Console query ownership across canonical and fragment URLs.
- Cannibalization against adjacent industrial and disc-stack pages.
- Google title rewrites and major SERP-feature or competitor changes.
- GA4 organic landings and D1 lead quality for both pages.

No separate dashboard is required.
