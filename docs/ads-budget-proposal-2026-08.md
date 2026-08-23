# Google Ads budget proposal - morning confirmation (2026-08-23)

**Nothing in this document has been changed in the ads account.** Overnight work was
limited to exact-match negative keywords (OVERNIGHT_ORDERS item 18, "NEGATIVES ONLY
tonight"). Every budget, bid, and pause below waits on your typed yes.

All figures come from `docs/performance-review-2026-08.md` (six non-overlapping 28-day
windows, **2026-02-25 -> 2026-08-20, 168 days covered**, 6-day gap Jul 18-23).
Per-day numbers are the 168-day average, **not** today's run rate. Today's run rate is
$450.28 per 28 days = $16.08/day.

---

## Decisions needed

- [ ] **1. Kill `alfa laval centrifuge` (phrase), redeploy to `decanter centrifuge`.**
  It burned **$438.54** ($2.61/day) for 120 clicks and 1 conversion = **$439 CPA**;
  the same money at `decanter centrifuge`'s **$24.76 CPA** is **~17.7 conversions**, so
  net **+16.7 over 168 days (~+2.8 per 28-day window)** after giving up its 1 conversion.

- [ ] **2. Feed the five starved converters.** `decanter centrifuge`,
  `refurbished centrifuge for sale`, `alfa laval decanters`, `machine coolant centrifuge`,
  `centrifuge for oil water separation` took **~$180 combined** and returned CPAs of
  **$4.38-$24.76** against a **$138.81** account average; these are the destination for
  every dollar freed by decisions 1, 3 and 4.

- [ ] **3. Negative out the 10 remaining zero-conversion kill-list terms.**
  **$632.76** ($3.77/day), 137 clicks, **0 conversions** - est. **+25.6 conversions**
  if redeployed at $24.76 CPA. Two of the twelve on the review's list were already
  handled tonight.

- [ ] **4. Shift exact-match spend toward phrase.** EXACT bought **$1,526.00 / 579
  clicks / 8.0 conv = $190.75 CPA**; PHRASE runs **$128.55** - moving that spend to
  phrase economics is est. **+3.9 conversions**, but the source has no per-term match
  breakdown, so a Chrome minion has to read the account UI to execute this one.

- [ ] **5. Set the total daily budget.** The account is at its best efficiency since
  April (**$113 CPA**, zero-conversion share down from 97% in July to **66%**) but is
  spending only **$450.28 per 28 days** - efficient at a volume too small to matter.
  **No number in the source supports a specific increase; this is your call.**

- [ ] **6. Sequencing: raise budget now, or wait for the landing-page column?**
  There were **26 straight days with zero paid-attributed leads** (last one 2026-07-15,
  then one on `/waste-oil-centrifuge/` in the window to 2026-08-09) and the ads pull has
  **no landing-page column**, so nobody can diagnose it. Spending more before that fix
  is spending blind.

**Why this matters in one line:** zero-conversion spend is **$4,261.07 of $6,732.39
(63.3%)**. Removing it without losing a conversion puts account CPA at
**$2,471.32 / 48.5 = $50.95** - inside the GAMEPLAN target of "under $60".

---

## Evidence: keywords to act on

| Term / group | Spend | Clicks | Conv | CPA | Verdict |
|---|---|---|---|---|---|
| **alfa laval centrifuge** | $438.54 | 120 | 1.0 | **$439** | **KILL** - worst term in the account |
| alfa laval (bare) | $689.83 | n/a in source | 6.0 | $114.97 | **KEEP** - the bare term works, the modified one does not |
| Navigational cluster (11 terms) | $458.46 | n/a in source | 4.0 | $115 | **KILL** - partially done tonight, see below |
| **decanter centrifuge** | $123.81 | n/a in source | 5.0 | **$24.76** | **FEED** - best volume-plus-efficiency term |
| industrial centrifuge | $111.98 | n/a in source | 2.0 | $55.99 | **FEED** |
| centrifuge machine for oil | $55.22 | n/a in source | 2.0 | $27.61 | **FEED** |
| alfa laval decanter | $19.68 | n/a in source | 2.0 | $9.84 | **FEED** - starved |
| machine coolant centrifuge | $12.73 | n/a in source | 2.0 | $6.37 | **FEED** - starved |
| refurbished centrifuge for sale | $9.40 | n/a in source | 2.0 | $4.70 | **FEED** - starved |
| alfa laval decanters | $8.75 | n/a in source | 2.0 | $4.38 | **FEED** - starved |
| centrifuge for oil water separation | n/a in source | n/a in source | n/a in source | $7.36 | **FEED** - starved |

The four cheapest converting terms took **$50.56 combined** across the whole 168 days.
That is the entire problem in one number.

### Zero-conversion kill list (decision 3)

| Term | Spend | Clicks | Impr | Verdict |
|---|---|---|---|---|
| oil centrifuge | $110.61 | 46 | 255 | **STARVE** - core business term; `/oil-centrifuge/` slid 39 -> 17 organic clicks and pos 9.2 -> 24.1, so the page may be the problem, not the term |
| algae centrifuge | $67.06 | 11 | 121 | KILL |
| centrifuge machine | $66.02 | 10 | 108 | KILL - too broad |
| centrifuge manufacturers | $65.28 | 2 | 26 | KILL - $32.64/click |
| centrifuges | $61.45 | 3 | 46 | KILL - $20.48/click |
| fuel centrifuge | $60.43 | 15 | 112 | KILL |
| sharples centrifuge | $52.13 | 10 | 72 | KILL - rival brand |
| mab104 centrifuge | $50.52 | 2 | 2 | **STARVE** - a model Dolphin actually sells, but $25.26/click on 2 impressions; cut the bid rather than block it |
| centrifugal oil separator | $49.97 | 22 | 91 | KILL |
| disc stack centrifuge | $49.29 | 16 | 270 | **STARVE** - core term and a top organic page; reduce bid, do not block |
| **Total** | **$632.76** | **137** | | **0 conversions** |

Excluded from this total because they were negated tonight: `alfa laval phone number`
($68.24) and `alfa laval customer service` ($46.91) = $115.15.

---

## Already done tonight - no approval needed

**OVERNIGHT_ORDERS item 18**, negatives only, executed by a Chrome minion in the
logged-in ads account. No budget, bid, or keyword pause was touched.

Exact-match negatives added for the navigational bleed terms:

| Negative term | Spend | Clicks | Conv |
|---|---|---|---|
| alfa laval phone number | $68.24 | 2 | 0 |
| alfa laval customer service | $46.91 | 2 | 0 |
| alfa laval contact number | $38.24 | 1 | 0 |
| alfa laval email address | $31.90 | 1 | 0 |
| alfa laval distributors usa | $12.77 | 2 | 0 |
| alfa laval golbey | $73.37 | 1 | **1.0** |
| alfa laval careers | n/a in source | n/a in source | n/a in source |
| alfa laval inc usa | n/a in source | n/a in source | n/a in source |
| alfa laval separation inc | n/a in source | n/a in source | n/a in source |
| alfa laval lund ab | n/a in source | n/a in source | n/a in source |

Two things you should know about that list:

1. **$198.06 of it is itemized, zero-conversion, zero-risk** (the first five rows).
2. **`alfa laval golbey` produced 1 conversion** at a $73.37 cost per click, and the
   full 11-term navigational cluster carries **4.0 conversions on $458.46**. So the
   headline "$458 of pure bleed" overstates it slightly: some of that cluster converted.
   Say the word and the minion removes `alfa laval golbey` from the negatives.
3. **`alfa laval inc`** ($135.74, 12 clicks, 1.0 conv, $11.31/click) was deliberately
   **not** negated - it converts and is the cheapest click in the brand cluster.

---

## Execution plan once you approve

Nothing below runs until you type a yes. You approve by decision number; a partial yes
("1, 2, 3 only") executes only those.

| # | Who | Does what | Where |
|---|---|---|---|
| 1 | Chrome minion | Pause `alfa laval centrifuge` (phrase), verify it is not also live as exact | Ads account, Keywords view |
| 2 | Chrome minion | Read current bids/budgets for the 5 starved converters, raise to absorb the freed spend, screenshot before and after | Ads account, Keywords + Campaign budget |
| 3 | Chrome minion | Add the 8 KILL terms as exact-match negatives; reduce bids on the 3 STARVE terms rather than blocking them | Ads account, Negative keywords |
| 4 | Chrome minion | Pull the exact-vs-phrase per-term split from the search terms report first, report back, then act | Ads account, Search terms report |
| 5 | You | Name the daily budget number; minion sets it | - |
| 6 | Repo minion | Add the landing-page column to `ads-weekly-fetch.mjs` (GAMEPLAN Track 3 item 6) | Reporting worker |

Route is the same one used for tonight's negatives: a minion drives your already
logged-in Chrome. You are not asked to log in, click, or approve anything in a
dashboard - only to type the decision here.

**Verification after execution:** minion screenshots each changed setting and appends a
status block to `docs/DAYLIGHT_HANDOFF.md`. First real read on whether this worked is
the **28-day window ending 2026-09-19**, the same checkpoint set for the post-Daylight
GSC compare.

---

## Data gaps - read before approving

- **The conversion estimates are arithmetic, not forecasts.** They assume the
  $24.76 CPA of `decanter centrifuge` holds at 3-10x its current spend. It probably will
  not; the cheapest converters each recorded only **2 conversions on under $15**, which
  is statistically thin. Treat "+25.6 conversions" as the ceiling, not the expectation.
- **Which terms are still live is n/a in source.** The review does not break the
  August window ($450.28) down by term, so some kill-list terms may already be dormant
  and reclaim less than the 168-day figures suggest.
- **Per-term match type is n/a in source.** Only the PHRASE/EXACT totals exist, which is
  why decision 4 needs an account read before execution.
- **Landing page per ad click is n/a in source** - the ads pull has no landing-page
  column at all. This is the reason 26 days of zero paid leads went undiagnosed.
- **Clicks per converting term are n/a in source.** The "what converts" table in the
  review carries spend, conversions and CPA only.
- **Four of the 11 navigational-cluster terms are not itemized** in the review, so the
  $458.46 total cannot be fully reconciled against the negatives list above.
- **`alfa laval careers`** appears in OVERNIGHT_ORDERS item 18 but not in the review's
  spend tables - no spend figure exists for it.
- The two source lists differ: performance-review Top-5 item 1 names 9 negatives,
  OVERNIGHT_ORDERS item 18 names 6 plus "obvious siblings". Tonight's minion applied
  the union.

---

## Sources

- `docs/performance-review-2026-08.md` - section 3 (Ads) and Top-5 items 1, 2, 5.
- `docs/GAMEPLAN.md` - Track 3 item 1 (ads surgery), Track 3 item 6 (measurement),
  Targets line (ads avg CPA $139 -> under $60).
- `docs/OVERNIGHT_ORDERS.md` - item 18 (negatives only tonight; this document is the
  deliverable it calls for).
- `ads-history.csv` and `ads-weekly-fetch.mjs` are named as the upstream data and
  fetcher in the performance review. **Neither file is present in this repository** -
  they live in the reporting worker. No external service was queried to write this.
