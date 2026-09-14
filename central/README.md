# Central

Staff page: https://dolphincentrifuge.com/central/

## Hosted service

Central's production answer engine runs in the Cloudflare Worker and Durable Object queue named dolphin-central. Questions use the private dolphin-central-knowledge D1 database (eastern North America) and the existing authenticated Claude API account. Neither the laptop nor the NAS is involved in serving a cloud answer. The public website serves only the application shell.

The seven private source files are CENTRIFUGE_BRAIN.md, CENTRIFUGE_SKILLS.md, CENTRIFUGE_WIKI.json, SITE_KNOWLEDGE.json, TECHNICAL_CATALOG.json, SANJAY_WRITING_STYLE.md, and SANJAY_WORDING_LIBRARY.json. A versioned private database archive preserves the full files; its search index supplies selected factual passages. Writing examples are separate from factual citations, and historical factual slots remain masked. No source archives, credentials, or customer records belong in Git, public assets, or a public bucket. The public WebMCP catalog continues to use only published product information.

Staff access uses the existing shared password, signed twelve-hour HttpOnly/Secure/SameSite cookies, origin checks, login throttling, and session-scoped question results. It is staff access, not a customer account. Future customer access needs a separately authorized view. Central and descendants are registered noindex and excluded from sitemaps; authentication provides privacy.

The model receives only selected private passages and supplied customer context. It has no browser, email, filesystem, inventory, or external tools. Claude API processing is a cloud service, not offline processing. No email is sent. Responses include supporting sources and staff follow-ups for missing facts. Quotes, inventory and private project decisions are never inferred from old examples.

Cloud alarms run queued questions, update progress, remove the original question/context on completion, and expire results after thirty minutes. Feedback is private cloud data retained for twenty-four hours; it is not automatically promoted into factual knowledge. The browser keeps conversation history in memory only. New inquiries are read from the existing dolphin-submissions database with staff authentication; the initial list defaults to U.S. forms. Reconnecting customer context is pasted by staff.

## Knowledge updates

central/publish-knowledge.mjs reads the approved seven-file source directory supplied by CENTRAL_KNOWLEDGE_ROOT (the NAS is only an update source). It uploads a new private release, verifies the indexed passage count and all seven archived file hashes, then switches the active release. Previous releases stay available. An interrupted publication never replaces the active release. Credentials are consumed from the existing Cloudflare environment without printing them. Publication records go under the existing private local Central runtime folder.

The old local agent remains as a compatibility owner console until retired. In cloud mode its claim operation receives no jobs. The hosted application works independently of that console and the Dolphin Central Windows task. The encrypted local credential record can still be used to recover staff access; it is not needed by Hudson's browser.

## Deploy and verify

Run the website build and Central tests, then the Worker dry run with workers/central/wrangler.jsonc. The Worker requires the existing authentication secrets plus ANTHROPIC_API_KEY, the two explicitly named D1 bindings, CLOUD_ENABLED=true, and CENTRAL_MODEL. Deploy the Worker only after a verified active knowledge release exists. Publish the website through master and verify the exact source commit. Confirm unauthorized requests are rejected, a signed-in real answer completes with hosting=cloud, and it still completes with the local engine stopped.
