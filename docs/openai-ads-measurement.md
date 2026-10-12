# OpenAI inquiry measurement

Updated October 12, 2026, for the audit attribution repair.

The production Astro layout initializes the Measurement Pixel once from the Pages build variable `PUBLIC_OPENAI_ADS_PIXEL_ID`. The contact Worker reports the same saved inquiry through CAPI using the returned server event ID. All five forms use that ID: main contact, used-oil quote, parts request, disc-parts glossary, and used Alfa Laval quick quote. Only an HTTP-success response with application success reaches the browser lead signal. Invalid or unsaved inquiries do not create an OpenAI event. Google reporting and customer form completion remain independent of measurement failures.

## First-party attribution

`src/lib/openaiAds.mjs` captures the actual landing URL's `oppref` before the third-party SDK loads. It does not invent an identifier. After the existing browser permission checks pass, a same-origin POST to `/api/ads-attribution` writes `dc_oppref` with Secure, SameSite=Lax and a requested 30-day lifetime. The endpoint is a Pages Function explicitly included in `public/_routes.json`, not a new website page. It rejects foreign origins and respects DNT, GPC and persisted cookie denial. The browser can read this host-only cookie and forward its original value to the cross-origin contact Worker; URI escaping is only the reversible cookie transport format. An immediate form can use the in-memory URL value even if cookie persistence fails. Oversized values remain available in memory but are not squeezed into a cookie.

Only a new landing reference refreshes the requested expiry. Ordinary later visits do not extend it. The form context prefers that current reference, then the first-party saved value, then the SDK cookie. D1 stores a dedicated private reference field; no reference values belong in reports, logs or Git.

The existing attribution payload now includes `first_touch` separately from current-session fields. D1 saves the full bounded first-touch JSON independently. This permits a later direct/organic inquiry to retain earlier campaign evidence without relabeling its current visit. It cannot reconstruct first-touch details missing from historical records, nor explain the unmatched September 21 platform event conclusively.

## Privacy and limitations

D4 was resolved by Sanjay on October 12, 2026: keep DNT suppression. GPC, stored Pixel denial, queued denial and storage-error suppression also remain unchanged. Suppressed contexts now carry bounded reason codes, and the server records only the reason in its diagnostic message. Forms continue normally. This change does not resolve D3 or change the existing hashed-email behavior. Section 8 updates matching policy documentation after the owner decision.

The 404 page intentionally uses its separate layout and remains outside measurement. Preview hosts and localhost do not load the Pixel. Browser blocking can still prevent Pixel receipt; form CAPI remains independently available for permitted, saved inquiries. No synthetic conversion or historical replay is part of verification.

C10 assessment: production pages are on the actual Dolphin origin, while the contact Worker uses a workers.dev origin. Setting a cookie on the contact Worker's response would not provide a Dolphin landing-page cookie. A narrow same-origin Pages Function after the browser consent check therefore supplies the required first-party response. Blanket landing middleware was rejected because it cannot observe a local-storage-only denial before writing. Server delivery does not guarantee Safari retention: browser storage limits, tracking protections and deletion still apply. No 30-day Safari survival claim is made.

## Live evidence, October 12

C4: production D1 confirms the three cited suppressed inquiries (October 2 and October 5) have `allowed=false`, but no saved reason. The original code collapsed all denial paths. Their individual cause is unrecoverable from those records, not evidence that any particular browser or privacy setting caused them. This historical question is closed as unprovable; prospective reason recording addresses the defect.

C9: a read-only query found 523 ChatGPT/OpenAI-paid pageview records since September 14, including 359 with an `oppref`. Of these, 198 had `oai_*_id` tracking parameters with no unresolved braces; the most recent was October 12 at 05:49:54 UTC. One unresolved-macro record with a reference was September 14 at 04:02:48 UTC. These are observed pageview records, not unique people or a claim that all traffic is eligible. Current substitution is established without creating an ad click.

## Verification

Run `node --test openai-ads.test.mjs openai-capi.test.mjs`, `npm run lead:reconcile:test`, `npm run build`, and a Worker dry run. Tests exercise SDK-blocked capture, suppression, cookie transport, fifth-form saved IDs, database payload alignment and Google-specific paid classification. The three-column `workers/contact-form/schema-openai-attribution.sql` migration precedes Worker deployment. No customer data is backfilled.

Sources: [Measurement Pixel](https://developers.openai.com/ads/measurement-pixel), [Supported events](https://developers.openai.com/ads/supported-events), [Measure Results](https://help.openai.com/en/articles/20001214-measure-results). Pixel documentation confirms requested cookie lifetime can be shortened by the browser and is separate from attribution windows.

## Observed paid-session funnel (audit section 4)

The existing authenticated `/admin/api/weekly-report` response now includes `chatgpt_funnel`. Supply both `funnel_start` and `funnel_end` as ISO timestamps (end exclusive, at most 90 days). For October 4-10 in America/New_York use `2026-10-04T04:00:00Z` and `2026-10-11T04:00:00Z`. Without explicit bounds it uses completed UTC days, clearly labeled; that default is not an account-local comparison window. Existing report fields keep their existing windows.

A denominator session must have a pageview with source `chatgpt`, `openai`, or `chatgpt.com` and medium `paid`, `cpc`, or `ppc`. Group by pageview `utm_content`, join other events by session, and count each session once. Missing/invalid/conflicting ad tags remain explicit buckets; missing session pageviews are reported separately. Unavailable D1 returns unavailable, not zeros. No customer or visitor identifiers are returned in this new aggregate.

`form_page_reach_rate` counts sessions visiting one of the five inquiry page paths, including a form landing page. `form_start_rate` counts sessions with a first-field engagement event. These are different signals: parts lands on a form page, so 100% page reach is not 100% engagement. Browser restrictions, tests/bots and lost attribution limit the website-observed denominator. It is not the number of Ads clicks or unique people, nor a qualified-lead result.

Read-only live query for October 4-10 account-local dates: 112 observed paid sessions, 132 paid pageviews, all 112 carrying usable ad tags; no missing-session pageviews or conflicting tags. 48 sessions reached a form page and none recorded form start. Parts accounted for 44 of those 48 because its landing page contains the form. The remaining reaches were one each for Turbine A, Turbine B, Waste Oil B and WVO B. This is descriptive funnel evidence, not a winning-ad verdict.

Validation: `node --test chatgpt-funnel.test.mjs` covers multi-page deduplication, organic/Google exclusion, ad-tag gaps/conflicts, form engagement joins, exact form paths and bounded reporting windows.
