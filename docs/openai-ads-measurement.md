# OpenAI inquiry measurement

The production Astro layout initializes the browser Measurement Pixel once. Its identifier comes from the Cloudflare Pages production build variable `PUBLIC_OPENAI_ADS_PIXEL_ID`; identifiers and API credentials are not committed.

The existing `dolphinTrackLead` success signal also emits standard `lead_created` with `type: customer_action`. This covers the main contact form, used-oil quote form, parts request form, and disc-parts glossary form. Each requires an HTTP-success response and the form service's success result. Clicks, invalid forms, failed requests, page views, and confirmation-page refreshes do not emit a lead. Google tracking remains independent.

The production host allowlist excludes preview deployments and localhost. The SDK captures and persists `oppref`; existing first-party attribution preserves UTM source, campaign, and creative tags through form submission. No manual click-reference generation, transformation, or logging is added.

Measurement errors are contained and cannot block the inquiry flow. No CAPI key, server changes, new database, queue, or recurring job is required. Browser blocking can prevent measurement. The SDK's stored consent denial remains effective; the integration additionally suppresses loading and events for GPC or DNT. Events set `opt_out: true`. No manual user-data enrichment is added; Ads Manager's current source UI describes automatic matching but exposes no matching toggle.

Only the confirmed business outcome is included. `page_viewed` and `contents_viewed` are deferred to avoid counting engagement as inquiries. Commerce, signup, subscription, trial, app, and appointment events have no applicable confirmed success flow here. CAPI and browser/server deduplication are outside this browser-only fix.

Validation: `node --test openai-ads.test.mjs`, `npm run build`, deployed-script inspection, and a controlled local form-success test with the actual Pixel SDK. A synthetic test is not an attributed customer lead. Real attribution requires eligible ad traffic and can take 24–48 hours to report.

Sources: [Measurement Pixel](https://developers.openai.com/ads/measurement-pixel), [Supported events](https://developers.openai.com/ads/supported-events), [Measure Results](https://help.openai.com/en/articles/20001214-measure-results).
