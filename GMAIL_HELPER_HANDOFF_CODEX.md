# Gmail Helper Handoff (Codex) - Permanent Fix for the Gmail Connector Problem

Written by Claude, 2026-07-04. Audience: Codex. Status: helper BUILT and live-tested;
one owner action remains (consent click for write scope on Sanjay's own-token path).

> **2026-07-04 update - MULTI-MAILBOX IS LIVE.** The helper now also supports EVERY
> dolphincentrifuge.com mailbox via a domain-wide-delegated service account:
> `node gmail-helper.mjs profile --mailbox jkraft@dolphincentrifuge.com`
> Live-verified same day against sprabhu@, jkraft@, and devans@ (profile + real search).
> Service account: `dolphin-gmail-agent@gen-lang-client-0409110854.iam.gserviceaccount.com`
> (client ID 110240727590578948401, GCP project gen-lang-client-0409110854 / 356503740536).
> Key: `%APPDATA%\gcloud\dolphin-gmail-sa-key.json`. Admin console DWD grant done 2026-07-04
> (scopes: gmail.readonly, gmail.modify, gmail.compose). Least-privilege per command:
> reads use readonly, label uses modify, create-draft uses compose. No per-user consent
> clicks are ever needed for domain mailboxes - new mailboxes are covered automatically.
> The Step 2 consent click below is now OPTIONAL (only needed for the tokened non-mailbox
> path); prefer `--mailbox` for triage/auto-responder work.

## The one-paragraph summary

The recurring "Gmail keeps disconnecting" problem is NOT a Gmail auth problem. It is a
known Codex Desktop `codex_apps` connector session/handshake failure class (evidence in
`docs/codex-gmail-connector-diagnostics.md`, incl. matching public issues #27844, #24785,
#20167). Reconnecting Gmail refreshes the wrong layer, which is why months of reconnects
never fixed it. The permanent fix is to stop depending on the connector: all Gmail
automation now goes through `gmail-helper.mjs`, a direct Gmail API helper that uses local
refresh tokens under `%APPDATA%\gcloud` and works even while the connector is broken.

## What already exists (do NOT rebuild any of this)

- `gmail-helper.mjs` (repo root) - the connector-independent Gmail path.
  Commands: `auth`, `profile`, `search`, `read`, `thread`, `attachments`,
  `download-attachment`, `labels`, `label`, `create-draft`, `self-test`.
  Run `node gmail-helper.mjs --help` for flags.
- npm shortcuts: `gmail:auth`, `gmail:profile`, `gmail:search`, `gmail:self-test`.
- OAuth client (shared with GA4/GSC/Ads helpers):
  `%APPDATA%\gcloud\dolphin-ga4-gtm-readonly-codex-oauth-client.json`
- Tokens (out-of-repo, never commit, never print values):
  - `%APPDATA%\gcloud\dolphin-gmail-readonly-token.json` - EXISTS (2026-06-26),
    scope gmail.readonly. Read commands fall back to this automatically.
  - `%APPDATA%\gcloud\dolphin-gmail-helper-token.json` - DOES NOT EXIST YET.
    Created by `npm run gmail:auth` (scopes: gmail.modify + gmail.compose).
    Required for `create-draft` and `label`.
- Gmail API is already ENABLED on GCP project 356503740536.
- Live proof (2026-07-04, from Claude's session): `profile` returned
  sprabhu@dolphincentrifuge.com and `search` returned real recent messages,
  using only the readonly fallback token - while the Codex connector was failing.
- Permanent operating rule added to `AGENTS.md` ("Gmail Rule").

## Operating rules for Codex (permanent)

#1. Every scripted, scheduled, or multi-step Gmail flow uses `gmail-helper.mjs`.
    Never build a workflow on the Codex Gmail connector again.

#2. If the connector fails (`token_expired`, `failed to get client`,
    `MCP startup failed`, `wham/apps` errors): restart Codex Desktop ONCE, do not
    loop on "reconnect Gmail", and continue the task via the helper. Never hand a
    reconnect-click loop to Sanjay.

#3. Health check order: `npm run gmail:profile` (proves the API path), and
    `npm run codex:gmail-health` only when diagnosing the connector itself.

#4. Safety boundaries (do not change without Sanjay's explicit approval):
    - The helper has NO send command. Drafts only; Sanjay reviews and sends in Gmail.
    - Tokens stay under `%APPDATA%\gcloud`, mode 0600, never in repo/chat/vault.
    - Do not widen OAuth scopes beyond gmail.modify + gmail.compose.

## Remaining steps to complete the permanent fix

#1. OWNER (Sanjay, one time, ~30 seconds): run `npm run gmail:auth` in the repo and
    approve the Google consent screen for sprabhu@dolphincentrifuge.com. This mints
    `dolphin-gmail-helper-token.json` and unlocks `create-draft` + `label`.

#2. CODEX (after #1): verify the write path end-to-end, read-safe:
    - `npm run gmail:profile` (must now use the helper token)
    - `node gmail-helper.mjs labels`
    - `node gmail-helper.mjs create-draft --to sprabhu@dolphincentrifuge.com
       --subject "gmail-helper write-path test" --body "Test draft - safe to discard."`
    - Confirm the draft exists (`search --query "in:draft subject:write-path"`), then
      tell Sanjay to discard it. Do NOT send it.

#3. CODEX: migrate any existing Gmail-connector-dependent automation (scheduled tasks,
    skills, follow-up scanners) to call the helper instead. `talkroute-voicemail-ingest.mjs`
    already has its own token path - leave it as is.

#4. CODEX: stamp `01 Operating Rules\Agent Coordination.md` when #2/#3 are done.

## Draft format (fix 2026-07-15)

`create-draft` now ALWAYS builds the MIME body as text/html. Plain `--body` /
`--body-file` text is HTML-escaped with newlines converted to `<br>`; pass `--html`
ONLY when the body is already HTML markup. Before this fix, plain-text drafts locked
Gmail's composer into plain-text mode, which stripped signature links and blocked
inserting the rich signature. Any Gmail draft created before 2026-07-15 is plain-text
and must be recreated to get a working signature. `self-test` covers the conversion.

## Failure modes and answers

- `invalid_grant` on token refresh -> the refresh token was revoked or the Google
  password changed. Fix: rerun `npm run gmail:auth` (one consent click). This is the
  ONLY case where re-consent is the answer.
- `403 accessNotConfigured` -> Gmail API disabled on the GCP project. Re-enable:
  `gcloud services enable gmail.googleapis.com --project 356503740536`.
- Write command errors "needs the helper token" -> step #1 above has not happened yet.
- Codex connector errors of any kind -> irrelevant to the helper. Restart Codex once
  if you need the connector interactively; otherwise ignore and use the helper.
