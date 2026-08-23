# Dolphin Centrifuge - Performance Review, August 2026

Data through **2026-08-20**. Written 2026-08-23.
Sources: GSC (`metrics-history.csv`, 2026-01-27 -> 2026-08-20), GA4 (`ga4-history.csv`,
2026-06-16 -> 2026-08-20), Google Ads (`ads-history.csv`, rebuilt clean 2026-08-23),
D1 lead grading (executor blocks AP-0803-03 / AP-0810-03), AI SOV run 2026-07-18.

**Every snapshot in all three CSVs is a 28-day rolling window ending on the snapshot
date.** Weekly snapshots therefore overlap ~75%. All totals below use non-overlapping
windows only; anything summed across overlapping weeks would be inflated ~4x.

---

## VERDICT

**Organic traffic bottomed in July and is climbing back (+7% off the floor), but the
site is still down 17% on clicks and 44% on impressions since January. Ads is the
problem: 63% of all spend produced zero conversions, and a third of the budget goes
to people searching for Alfa Laval's own company. Leads are healthy and concentrated
in a handful of small pages nobody is optimizing.**

Three numbers that matter:

| | Now (28d to 08-20) | vs January | Read |
|---|---|---|---|
| GSC clicks | **1,117** | -17% | Bottomed in July, recovering |
| GSC impressions | **163,840** | -44% | Junk impressions shed; CTR up 48% |
| Ads zero-conversion spend | **63% of $6,732** | - | The single biggest fixable leak |

---

## 1. Traffic: where the site actually is

### Organic search (GSC, 28-day windows)

| Window ending | Clicks | Impressions | CTR | Avg pos | Pages w/ impressions |
|---|---|---|---|---|---|
| 2026-01-27 | 1,339 | 291,677 | 0.46% | 11.5 | 302 |
| 2026-02-24 | **1,698** (peak) | **391,688** (peak) | 0.43% | 9.8 | 310 |
| 2026-03-24 | 1,443 | 307,029 | 0.47% | 8.6 | 333 |
| 2026-04-21 | 1,477 | 261,466 | 0.56% | 9.3 | 337 |
| 2026-05-19 | 1,216 | 172,543 | 0.70% | 10.9 | **154** |
| 2026-06-16 | 1,066 | 161,505 | 0.66% | 12.0 | 160 |
| 2026-07-17 | **1,042** (floor) | 154,617 | 0.67% | 13.7 | 176 |
| 2026-08-20 | **1,117** | 163,840 | 0.68% | 14.3 | 156 |

(Page counts roll URL fragments into their parent page. Fragment rows are 11-16% of
impressions and essentially 0 clicks - they are Google "jump to" links, not real pages.)

**What this says:**

- **The April->May cliff is the year's defining event.** Pages earning impressions
  halved (337 -> 154) and impressions fell 88k in one month. Everything since is a
  smaller site competing for a smaller pool. *This data does not explain why* - it is
  worth a separate look at what changed on the site or in Google around 2026-04-21 to
  2026-05-19.
- **The shed traffic was low quality.** CTR rose 0.46% -> 0.68% (+48%) as impressions
  fell 44%. The site lost impressions it was never going to convert.
- **Clicks turned in July.** 1,042 -> 1,117 over five weeks (+7%), up in four of the
  last five weekly readings. This is the first sustained positive move all year.
- **Average position is still deteriorating** (11.5 -> 14.3). Clicks are recovering
  *despite* rank, which means CTR gains are carrying it - a fragile way to grow.

### GA4 sessions (top 100 landing pages, 28-day windows)

| Window ending | Users | Pageviews | Leads |
|---|---|---|---|
| 2026-06-16 | 925 | 1,203 | 9 |
| 2026-07-17 | 2,920 | 4,093 | 25 |
| 2026-08-20 | **3,175** | 3,873 | **28** |

Users +9% from July to August - consistent with the GSC recovery. **Ignore the
2026-06-16 row**: a 3x jump in one month is instrumentation, not growth, and GA4
history only starts here. There is no usable GA4 trend before June.

### Top 10 pages, 28 days to 2026-08-20

**By organic clicks:**

| Page | Clicks | Impr | Pos | Jan clicks |
|---|---|---|---|---|
| /disc-centrifuge-purifier-clarifier-difference/ | 70 | 6,973 | 4.9 | 83 |
| /disc-stack-centrifuge/ | 50 | 7,521 | 8.9 | 52 |
| /decanter-centrifuge/ | 45 | 18,462 | 10.3 | 14 |
| / (homepage) | 42 | 3,358 | 18.0 | 47 |
| /decanter-centrifuge-differential-speed/ | 36 | 4,511 | 9.4 | 56 |
| /industrial-centrifuge/ | 28 | 13,369 | 9.8 | 44 |
| /decanter-centrifuge-optimization/ | 26 | 1,695 | 9.5 | 23 |
| /centrifugal-filter/ | 25 | 3,213 | 18.9 | 68 |
| /difference-between-decanter-centrifuge-disc-centrifuge/ | 25 | 3,024 | 24.4 | 41 |
| /diesel-centrifuge/ | 23 | 2,195 | 7.7 | 41 |

**By impressions** - the CTR failures are visible here:

| Page | Impr | Clicks | CTR | Pos |
|---|---|---|---|---|
| /decanter-centrifuge/ | 18,462 | 45 | 0.24% | 10.3 |
| /industrial-centrifuge/ | 13,369 | 28 | 0.21% | 9.8 |
| /disc-stack-centrifuge/ | 7,521 | 50 | 0.66% | 8.9 |
| /disc-centrifuge-purifier-clarifier-difference/ | 6,973 | 70 | 1.00% | 4.9 |
| /wastewater-centrifuge/ | 5,852 | 12 | 0.21% | 21.3 |
| **/centrifuge-rcf-rpm-difference-calculation/** | **5,504** | **1** | **0.02%** | 29.5 |
| /disc-centrifuge-parts-glossary/ | 4,728 | 20 | 0.42% | 10.4 |
| /decanter-centrifuge-differential-speed/ | 4,511 | 36 | 0.80% | 9.4 |
| /alfa-laval-centrifugal-separator/ | 3,802 | 18 | 0.47% | 16.1 |
| /dewatering-centrifuge/ | 3,572 | 10 | 0.28% | 17.7 |

`/decanter-centrifuge/` and `/industrial-centrifuge/` together take **32k impressions
at rank ~10 and convert 0.2% of them into clicks.** That is the largest single pool of
wasted visibility on the site.

---

## 2. Search: winners and sliders

**Gained since January** (clicks):

| Page | Jan -> Aug | Impressions |
|---|---|---|
| /decanter-centrifuge/ | 14 -> 45 (+31) | 8,193 -> 18,462 |
| /explosion-proof-centrifuge/ | 3 -> 14 (+11) | 433 -> 573 |
| /wvo-centrifuge-separator/ | 7 -> 17 (+10) | 1,674 -> 1,731 |
| /used-oil-centrifuge/ | 2 -> 11 (+9) | 1,419 -> 449 |
| /decanter-centrifuge-rental/ | 4 -> 12 (+8) | 812 -> 1,477 |

**Slid since January** (clicks):

| Page | Jan -> Aug | Impressions | Position |
|---|---|---|---|
| /centrifugal-filter/ | 68 -> 25 (-43) | 10,585 -> 3,213 | 11.6 -> 18.9 |
| /disc-centrifuge-troubleshoot-bowl/ | 52 -> 21 (-31) | 2,779 -> 2,585 | 6.9 -> 9.6 |
| /oil-centrifuge/ | 39 -> 17 (-22) | 12,135 -> 2,737 | 9.2 -> 24.1 |
| /diesel-centrifuge/ | 41 -> 23 (-18) | 5,173 -> 2,195 | 14.7 -> 7.7 |
| /decanter-centrifuge-differential-speed/ | 56 -> 36 (-20) | 8,521 -> 4,511 | 5.6 -> 11.0 |
| /difference-between-decanter-centrifuge-disc-centrifuge/ | 41 -> 25 (-16) | 11,615 -> 3,024 | 9.3 -> 24.4 |

Biggest impression collapses: `/disc-stack-centrifuge/` (-14,531), `/centrifuge-rcf-rpm-difference-calculation/`
(-14,115), `/alfa-laval-centrifugal-separator/` (-12,297). Note `/disc-stack-centrifuge/`
held its clicks (52 -> 50) while losing 66% of impressions - it shed noise, not demand.
`/oil-centrifuge/` and `/difference-between-decanter.../` lost both impressions *and*
15 positions - those are real losses.

Dropped out of the index entirely since January: `/cannabis-thc-extraction-centrifuge/`
(8 clicks), `/hemp-biomass-centrifuge/` (4), `/hemp-extraction-centrifuge/` (2, 1,532
impressions). The hemp/cannabis cluster is gone.

New since January: `/knowledge-troubleshooting/` (3 clicks, 431 impr),
`/knowledge-guides/`, `/centrifuges/dmb-004/`, `/centrifuges/dmb-013/` - the new
hub/model URL structure is being indexed but is not yet earning meaningfully.

### Daylight relaunch: too early to measure

**Operation Daylight's ruling list is dated 2026-08-22. The last data point in every
source here is 2026-08-20 - two days *before* it.** There is zero post-relaunch data.
Nothing in this report reflects Daylight, and no claim about its effect can be made yet.

Additionally, `docs/DAYLIGHT_HANDOFF.md` shows **50 items still waiting on one ruling
pass from Sanjay** (24 numeric specs, 10 model designations, 10 + 6 others), so much of
Daylight is not live on the site at all.

**Set the marker here:** the 28-day window ending **2026-09-19** is the first fully
post-Daylight GSC window. Compare it against the 2026-08-20 baseline in this document
(1,117 clicks / 163,840 impressions / 0.68% CTR / pos 14.3). The AI SOV baseline
(2026-07-18) is also pre-Daylight and should be re-run at the same time.

---

## 3. Ads: the biggest fixable leak

Totals below use the six non-overlapping 28-day windows (2026-02-25 -> 2026-08-20,
with a 6-day gap Jul 18-23 not covered by any snapshot).

| | |
|---|---|
| Total spend | **$6,732.39** |
| Clicks | 1,605 (CPC $4.19) |
| Conversions | 48.5 (CPA **$138.81**) |
| Distinct search terms | 445 |
| **Zero-conversion spend** | **$4,261.07 = 63.3%** across 411 terms / 1,094 clicks |
| Converting terms | 34 terms, $2,471.32, 48.5 conv |

### Spend collapsed after June - and conversions went with it

| Window ending | Spend | Clicks | Conv | CPA | CPC | Zero-conv share |
|---|---|---|---|---|---|---|
| 2026-03-24 | $751.72 | 98 | 5.0 | $150 | $7.67 | 77% |
| 2026-04-21 | $2,142.46 | 330 | 19.0 | $113 | $6.49 | 66% |
| 2026-05-19 | $1,750.11 | 273 | 10.5 | $167 | $6.41 | 84% |
| 2026-06-16 | $1,252.62 | 537 | 8.0 | $157 | $2.33 | 96% |
| 2026-07-17 | $385.20 | 167 | 2.0 | $193 | $2.31 | 97% |
| 2026-08-20 | $450.28 | 200 | 4.0 | **$113** | $2.25 | **66%** |

Two real signals here:

1. **CPC halved in June** ($6.41 -> $2.33) and has held at ~$2.25. Whatever changed
   around 2026-06-16 made clicks cheap. Volume per dollar roughly tripled.
2. **August is the best month since April on efficiency** - CPA back to $113, zero-conv
   share down from 97% to 66%. The recent negative-keyword work is visibly landing.
   But the account is now spending only ~$450/28d, so it is efficient at a volume too
   small to matter.

### The bleed: Alfa Laval brand terms

| | Spend | Share of total | Conv | CPA |
|---|---|---|---|---|
| All terms containing "alfa laval" (88 terms) | **$2,284.64** | **33.9%** | 19.0 | $120 |
| ...of which purely navigational/corporate (11 terms) | **$458.46** | 6.8% | 4.0 | $115 |

**Yes, the data supports the bleed thesis.** A third of the entire budget chases the
competitor's brand name. Within that, ~$458 went to people trying to reach Alfa Laval's
own switchboard, HR, or head office - not to buy a centrifuge:

| Term | Spend | Clicks | Conv | Effective CPC |
|---|---|---|---|---|
| alfa laval inc | $135.74 | 12 | 1.0 | $11.31 |
| alfa laval golbey | $73.37 | 1 | 1.0 | $73.37 |
| **alfa laval phone number** | $68.24 | 2 | **0** | $34.12 |
| **alfa laval customer service** | $46.91 | 2 | **0** | $23.46 |
| **alfa laval contact number** | $38.24 | 1 | **0** | $38.24 |
| **alfa laval email address** | $31.90 | 1 | **0** | $31.90 |
| alfa laval distributors usa | $12.77 | 2 | 0 | $6.39 |

`alfa laval golbey` is a Alfa Laval factory town in France. That click cost $73.

Worst single term in the account: **`alfa laval centrifuge` - $438.54 for 120 clicks
and 1 conversion ($439 CPA)**. Compare `alfa laval` (the bare brand term):
$689.83 for 6 conversions at $115. The bare term works; the modified one does not.

### What actually converts

| Term | Spend | Conv | CPA |
|---|---|---|---|
| decanter centrifuge | $123.81 | 5.0 | **$24.76** |
| alfa laval | $689.83 | 6.0 | $114.97 |
| industrial centrifuge | $111.98 | 2.0 | $55.99 |
| centrifuge machine for oil | $55.22 | 2.0 | $27.61 |
| alfa laval decanter | $19.68 | 2.0 | $9.84 |
| machine coolant centrifuge | $12.73 | 2.0 | $6.37 |
| refurbished centrifuge for sale | $9.40 | 2.0 | $4.70 |
| alfa laval decanters | $8.75 | 2.0 | $4.38 |

**"Decanter" and "for sale"/"refurbished" intent are the cheap wins** - CPAs of $5-25
versus a $139 account average. They are also barely funded: the four cheapest converting
terms took $50 combined.

### Top zero-conversion terms (kill list candidates)

| Term | Spend | Clicks | Impr |
|---|---|---|---|
| oil centrifuge | $110.61 | 46 | 255 |
| alfa laval phone number | $68.24 | 2 | 2 |
| algae centrifuge | $67.06 | 11 | 121 |
| centrifuge machine | $66.02 | 10 | 108 |
| centrifuge manufacturers | $65.28 | 2 | 26 |
| centrifuges | $61.45 | 3 | 46 |
| fuel centrifuge | $60.43 | 15 | 112 |
| sharples centrifuge | $52.13 | 10 | 72 |
| mab104 centrifuge | $50.52 | 2 | 2 |
| centrifugal oil separator | $49.97 | 22 | 91 |
| disc stack centrifuge | $49.29 | 16 | 270 |
| alfa laval customer service | $46.91 | 2 | 9 |

### Match type

| Match | Spend | Clicks | Conv | CPA | CPC |
|---|---|---|---|---|---|
| PHRASE | $5,206.39 | 1,026 | 40.5 | $128.55 | $5.07 |
| EXACT | $1,526.00 | 579 | 8.0 | **$190.75** | $2.64 |

Exact match buys cheaper clicks that convert half as well. Phrase is carrying the account.

### Ad landing pages vs converting pages

The ads data has no landing-page column, so ad-click -> page cannot be joined directly.
The one hard link available: D1 records **exactly one paid-attributed lead in the
28d window to 2026-08-09, and it landed on `/waste-oil-centrifuge/`**. The weekly-genie
report for 2026-08-10 notes the last paid lead before that was 2026-07-15 - **26 days
with zero paid-attributed leads**. Adding a landing-page dimension to the ads pull is
the missing piece needed to answer this properly.

---

## 4. Leads: small pages carry the business

**GA4 cannot answer "which page produces leads."** In the last three windows, 100% of
leads (28/28, 25/25, 23/23) are attributed to `/contact-for-alfa-laval-centrifuges/`.
That is the form page, not the entry page - the lead event is keyed where the form is
submitted, not where the session started. **Treat GA4's `leads` column as a site-total
only.** D1 grading is the sole valid source for page attribution.

### D1 graded leads, 28 days to 2026-08-09 (27 form leads: 16 A / 7 B / 4 C)

Cross-referenced against organic clicks in the closest GSC window (28d to 2026-08-12):

| Page | A | B | C | Organic clicks | Impressions | **A-leads / click** |
|---|---|---|---|---|---|---|
| **/wvo-centrifuge-separator/** | **5** | 0 | 0 | 19 | 1,660 | **0.26** |
| /alfa-laval-whpx-513/ | 1 | 0 | 0 | 3 | 185 | **0.33** |
| /alfa-laval-btpx-205-biotech-centrifuge/ | 1 | 0 | 0 | 4 | 327 | **0.25** |
| /waste-oil-centrifuge/ | 3 | 1 | 0 | 21 | 2,521 | 0.14 |
| /explosion-proof-centrifuge/ | 1 | 0 | 0 | 11 | 496 | 0.09 |
| /alfa-laval-nx-418-decanter-centrifuge/ | 1 | 0 | 0 | 11 | 664 | 0.09 |
| / (homepage) | 3 | 0 | 0 | 48 | 2,819 | 0.06 |
| /about-dolphin-centrifuge/ | 1 | 0 | 0 | 0 | 148 | (non-organic) |
| /alfa-laval-centrifuge-parts/ | 0 | 2 | 0 | 7 | 1,155 | 0 |
| /diesel-centrifuge/ | 0 | 1 | 0 | 29 | 2,164 | 0 |
| /disc-stack-centrifuge/ | 0 | 0 | 1 | 60 | 7,065 | 0 |
| /centrifugal-filter/ | 0 | 0 | 0 | 38 | 4,317 | 0 |
| /industrial-centrifuge/ | 0 | 0 | 0 | 26 | 13,520 | 0 |

### The wvo pattern, stated plainly

**Traffic and leads are almost inversely related on this site.**

- `/wvo-centrifuge-separator/` gets **19 organic clicks** and produces **5 grade-A
  leads** - more A-leads than the homepage and `/waste-oil-centrifuge/` combined. It is
  the top A-producer sitewide on the 33rd-most traffic.
- The three Alfa Laval *model* pages (WHPX-513, BTPX-205, NX-418) produce 3 A-leads on
  18 clicks combined. Highest intent per visitor on the site.
- Meanwhile the **top 6 pages by organic clicks produced zero A-leads between them**:
  `/disc-centrifuge-purifier-clarifier-difference/` (70 clicks), `/disc-stack-centrifuge/`
  (60), `/decanter-centrifuge/` (39), `/centrifugal-filter/` (38),
  `/decanter-centrifuge-differential-speed/` (38), `/decanter-centrifuge-optimization/` (31).
- `/industrial-centrifuge/` carries **13,520 impressions** and produced **zero graded
  leads**.

The high-traffic pages are educational/comparison content pulling researchers. The
lead-producing pages are narrow, specific, buy-intent pages with almost no traffic.

Cross-check from the longer-horizon GA4 export (`ga4-landing-pages-top160.xlsx`,
56,071 sessions, 810 key events): the same shape holds.
`/disc-centrifuge-purifier-clarifier-difference` recorded **988 sessions and 0 key
events**; `/dewatering-centrifuge` 642 sessions / 0; `/decanter-centrifuge-pond-depth`
626 / 0. High-yield pages there were `/decanter-centrifuge-differential-speed`
(15.9% key-events per session) and `/contact-for-alfa-laval-centrifuges` (10.0%).

Stability check: the previous D1 window (28d to 2026-08-02, 32 leads) shows the same
ranking - `/wvo-centrifuge-separator/` 5 A, `/waste-oil-centrifuge/` 3 A + 1 B,
homepage 2 A. **This is a stable pattern across two windows, not a one-week fluke.**

---

## 5. AI visibility (baseline 2026-07-18, pre-Daylight)

52 buyer prompts x 5 models = 260 scored responses, web search on.

| Metric | Result |
|---|---|
| Prompts where Dolphin is mentioned | **144 / 260 = 55.4%** |
| Dolphin named #1 vendor | 44 / 260 = 16.9% |
| Dolphin site cited | 82 / 260 = 31.5% |
| Sentiment when mentioned | 74 endorsed / 69 neutral / 0 negative |
| Top rival | Alfa Laval (177 mentions), Flottweg (72), GEA (66) |

**Citation is wildly model-dependent** - and this is the real story:

| Model | Mention % | Cites site % | Files citing a URL |
|---|---|---|---|
| perplexity-sonar | 69.2% | **67.3%** | 33 / 52 |
| grok-4.3 | 59.6% | **55.8%** | 29 / 52 |
| gemini-3-flash-preview | 61.5% | 5.8% | 3 / 52 |
| claude-sonnet-5 | 59.6% | 1.9% | **0 / 52** |
| gpt-5.2 | **26.9%** | 26.9% | 14 / 52 |

Claude and Gemini talk about Dolphin without ever linking it. GPT-5.2 barely knows
Dolphin exists - 27% mention rate against a 55% average.

### Which pages AI engines actually cite

*Note: the SOV run's `cited_dolphin_url` column stores a boolean, not a URL - the run
does not record which page was cited. The list below was recovered by parsing the raw
model response files, and should be captured properly on the next run.*

| Page | Citations |
|---|---|
| / (homepage) | 29 |
| **/waste-oil-centrifuge/** | **26** |
| /disc-stack-centrifuge/ | 13 |
| /diesel-centrifuge/ | 12 |
| /fuel-oil-centrifuge/ | 8 |
| /industrial-disc-centrifuge-repair/ | 7 |
| /alfa-laval-centrifuge-parts/ | 6 |
| /quench-oil-centrifuge/ | 5 |
| /picking-the-right-industrial-centrifuge/ | 4 |
| /lube-oil-centrifuge/ | 4 |
| /centrifuge-reconditioning-standard/ | 4 |

`/waste-oil-centrifuge/` is the standout: **top-cited content page in AI, 3 A-leads +
1 B in D1, and the landing page for the only paid-attributed lead.** It is the one page
performing on all three channels at once.

Notably `/wvo-centrifuge-separator/` - the top lead producer - was cited only **twice**.

### Where Dolphin is invisible

Categories with zero or near-zero presence, where all 5 models named a rival:

- Marine separator service in the US (B10)
- **Where to buy a used Alfa Laval centrifuge (C14)** - directly on-business
- Hydraulic/turbine oil purification equipment (E25, E26)
- Decanter supplier for Texas oilfield / Permian produced water (F30, F31)
- Who sells used decanter centrifuges in the US (H37)

C14 and H37 are literally Dolphin's core business, and the site loses them 5/5.

---

## State of the business funnel

The site is a **research magnet with a narrow, high-quality conversion channel bolted
onto the side of it.** Roughly 164,000 monthly impressions produce 1,117 organic clicks
(0.68%), which feed ~3,200 monthly users, which yield ~27 graded form leads of which
~16 are grade A. The top of the funnel shrank 44% this year and is only now stabilizing,
but it was mostly shedding impressions that never converted - CTR is up 48% and clicks
have risen for four of the last five weeks. The middle of the funnel is where the money
is being lost: the six highest-traffic pages produced **zero** grade-A leads between
them, while `/wvo-centrifuge-separator/` turned 19 clicks into 5 A-leads. Traffic and
revenue are near-decoupled, so more traffic to current winners would not produce more
leads. Paid is the weakest leg - $6,732 spent, 63% of it on terms that converted
nothing, a third of the budget chasing Alfa Laval's brand name (including ~$458 for
people looking for Alfa Laval's phone number), and 26 straight days with no
paid-attributed lead. AI visibility is the quiet bright spot: 55% share of voice with
zero negative sentiment, though half the engines mention Dolphin without linking it,
and the two prompts closest to the actual business ("where do I buy a used Alfa Laval
centrifuge", "who sells used decanter centrifuges in the US") lose 5/5 to competitors.
Daylight is not measurable yet and 50 of its items are still waiting on one ruling pass.

---

## Top 5: what the data says to do next

*Data-driven only. A separate strategy pass will combine this with audit results.*

**1. Kill the Alfa Laval navigational bleed - $458+ recovered, zero risk.**
Add exact negatives for `alfa laval phone number`, `alfa laval customer service`,
`alfa laval contact number`, `alfa laval email address`, `alfa laval golbey`,
`alfa laval distributors usa`, `alfa laval inc usa`, `alfa laval separation inc`,
`alfa laval lund ab`. Then look hard at `alfa laval centrifuge` ($438.54 / 1 conv /
$439 CPA) - the bare term `alfa laval` converts at $115, the modified one does not.
Zero-conversion spend is 63% of the account; this is the cleanest slice of it.

**2. Move ads budget to the $5-25 CPA terms that are being starved.**
`decanter centrifuge` ($24.76 CPA, 5 conv), `refurbished centrifuge for sale` ($4.70),
`alfa laval decanters` ($4.38), `machine coolant centrifuge` ($6.37),
`centrifuge for oil water separation` ($7.36). These converted on ~$180 combined
against a $139 account-average CPA. "Decanter" and "for sale / refurbished" intent are
demonstrably the cheapest buyers in the account and are barely funded.

**3. Treat `/wvo-centrifuge-separator/` and the Alfa Laval model pages as the money pages.**
5 A-leads on 19 clicks (0.26 A/click) is 4x the homepage rate and the best on the site
across two consecutive D1 windows. WHPX-513, BTPX-205 and NX-418 convert at 0.25-0.33
A/click. These pages have almost no traffic - the opportunity is to *drive* traffic to
proven converters rather than optimize converters that already have traffic. They also
have almost no AI citations (wvo: 2), so they are a GEO target as well.

**4. Fix the two biggest CTR failures - 32,000 impressions currently worth 73 clicks.**
`/decanter-centrifuge/` (18,462 impr, 0.24% CTR, pos 10.3) and `/industrial-centrifuge/`
(13,369 impr, 0.21% CTR, pos 9.8) rank on page one and get ignored. A 0.2% -> 0.8% CTR
(the site's own better pages already do 0.8-1.0%) is roughly +190 clicks/month, a ~17%
lift in total site clicks from two title/meta rewrites. Also check
`/centrifuge-rcf-rpm-difference-calculation/`: 5,504 impressions, **1 click**, 0.02% -
that is either the wrong query intent entirely or a broken snippet.

**5. Close two measurement gaps before the next review, or the next review repeats this one.**
(a) **GA4 lead attribution is unusable** - 100% of leads collapse onto
`/contact-for-alfa-laval-centrifuges/`. Capture the session landing page on the lead
event so page attribution stops depending on manual D1 grading.
(b) **The ads pull has no landing-page column**, so "what converts vs what we pay for"
cannot be joined - and there have been 26 days with no paid-attributed lead, which
nobody can currently diagnose. Add landing page to `ads-weekly-fetch.mjs`.
(Minor, same pass: the AI SOV run stores `cited_dolphin_url` as a boolean - store the
actual URL, and re-run the baseline post-Daylight alongside the 2026-09-19 GSC window.)

---

### Data caveats

- All windows are 28-day rolling. Weekly snapshots overlap ~75%; never sum them.
- Ads totals cover 2026-02-25 -> 2026-08-20 with a 6-day gap (Jul 18-23) that no
  snapshot covers.
- GSC 2026-08-19 and 2026-08-20 are consecutive-day reruns of nearly the same window.
- GA4 history begins 2026-06-16 and that first window is not comparable to later ones.
- GA4 rows are capped at the top 100 landing pages per window.
- 6 rows in `metrics-history.csv` have unescaped commas inside a URL fragment
  (`/disc-stack-centrifuge-remove-metals-ash-used-oil/#Why-remove-water,-heavy-metals,...`);
  parsed positionally here, all zero-click. Worth quoting the field in the writer.
- One row in the AI SOV `results.csv` contains leaked XML (`false</cited_dolphin_url></invoke>`).
- D1 lead windows end 2026-08-09; GSC comparison window ends 2026-08-12. Close, not identical.
