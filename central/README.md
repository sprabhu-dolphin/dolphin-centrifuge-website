# Central

Staff page available now: https://codex-central-staff.dolphin-centrifuge-website.pages.dev/central/

Permanent website address after the repository-required review and merge: https://dolphincentrifuge.com/central/ . PR #62 contains the website integration. Its Cloudflare preview is the same password-protected staff app, using the same live answer engine and knowledge master.

Sanjay's local page: http://127.0.0.1:4412/central/

The local page has a **Copy staff password** button for sharing access with Hudson. The remote page requires that password. The password is randomly generated; its plaintext is never part of this repository, a command argument or a log. The local credential set is encrypted with Windows DPAPI under the existing DolphinCodex secrets location. Model subprocesses receive the established minimal environment, not the Cloudflare or Central credentials.

The one NAS knowledge master is `N:\Business Docs\AI\Knowledge\Current`. This app builds its search index in memory and notices updated source files. It does not copy the Brain or customer records into the website repository. `model.mjs` reuses the installed Dolphin Codex model adapter. Planning, source selection, drafting and a material-support check use only supplied Dolphin evidence; model tools and external browsing are disabled.

The Cloudflare Worker `dolphin-central` owns a small private question queue and signed staff sessions. Pages Functions forward `/central/api/*` to that Worker. Every staff API request requires a valid signature and expiration; job reads and feedback require the same session that created the job. Cross-origin writes are rejected. The local engine uses a separate service credential and outbound HTTPS. The staff password alone cannot access the engine credential or NAS files.

Questions and answers expire from the queue after 30 minutes, including when no one revisits the page. Original question/context text is removed on completion. The browser keeps the current conversation in memory only. Feedback is retained only when a staff member clicks a feedback button, with a maximum of 200 entries in the central Reports folder. It is feedback for review, not automatic promotion into factual knowledge.

Each model call removes its own schema directory in a finally block. Startup and hourly cleanup remove abandoned schema-only directories created by this app. No old NAS trial files, original mail, project documents or unrelated folders are cleanup targets. The local status log is bounded to about 512 KB.

`agent.mjs` listens only on 127.0.0.1:4412. The exact Windows task **Dolphin Central** runs it without a window at sign-in and restarts it after failure. This computer and NAS must remain available for live answers. The staff page states when the knowledge computer is disconnected.

Validation: `node --test central/central.test.mjs`; `npm run build`; Worker dry run using `workers/central/wrangler.jsonc`. Deploy the Worker first and website source through the existing master/Cloudflare Pages route. Verify the deployed commit, unauthenticated rejection and a real authenticated answer. Do not commit secrets or local runtime data.
