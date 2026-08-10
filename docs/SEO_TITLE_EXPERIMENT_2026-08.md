# Industrial and Disc Stack SEO Title Experiment

This is a controlled sequential A/B/C test, not simultaneous random title delivery. Google indexes one canonical title per URL and may rewrite it, so serving random variants would make the result unreliable.

## Pages and variants

### Industrial centrifuge

- A, current live: `Industrial Centrifuge | Types, Continuous Separation, Cost & Applications`
- B, first challenger: `Industrial Centrifuge Machines | Disc Stack Systems & Sizing`
- C, reserve challenger: `Industrial Centrifuge | Continuous Disc Stack Systems & Capacity`

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

## Test method

1. Deploy B on both pages and record the deployment timestamp.
2. Hold body copy, H1s, internal links, canonicals, and structured data constant except for keeping the Article headline aligned with the title.
3. Review after 7 days for indexing, title rewriting, or material rank loss. Do not call a winner at this point.
4. Review after 14 complete days plus Search Console lag. Compare the same query baskets, page metrics, and page share of sitewide organic traffic.
5. Use the unchanged purifier-versus-clarifier page and sitewide non-brand organic trend as controls for broad demand or algorithm changes.
6. Keep B if it improves click capture without rank damage. Use C only if B loses or remains inconclusive after one optional seven-day extension.

## Decision rules

- Win: core-query CTR improves at least 20% relative, total clicks do not decline, and average position is no worse than 0.5 positions.
- Inconclusive: CTR moves less than 20%, impressions materially change, or Google has not consistently adopted the tested title. Extend B for seven days before deciding.
- Stop or roll back: average position worsens by more than 1.0 across two checks, core-query clicks materially decline, or the wrong page begins taking the target queries.
- C is a new challenger, not an automatic deployment. Preserve the B result before changing variants.

## Parallel diagnosis

The weekly consolidated SEO brief should also report:

- DataForSEO live rank and displayed-title checks for the experiment query basket.
- Search Console query ownership across canonical and fragment URLs.
- Cannibalization against adjacent industrial and disc-stack pages.
- Google title rewrites and major SERP-feature or competitor changes.
- GA4 organic landings and D1 lead quality for both pages.

No separate dashboard is required.
