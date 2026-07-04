# Dolphin Website Agent Rules

These local rules apply to this Dolphin Centrifuge Astro website repo.

## API-First Platform Rule

Quick line: API first, browser second.

For any task with Sanjay that involves an external platform, SaaS dashboard, analytics tool, CRM, email service, Cloudflare, StatCounter, Google service, Google Ads, or similar system:

1. Check whether an official API, CLI, MCP connector, export endpoint, webhook, or SDK exists before using browser/dashboard automation.
2. Check whether safe local credentials, environment variables, or connected tools are already available without exposing secrets.
3. If an API path exists but credentials are missing, offer Sanjay the API path and ask whether he wants to provide or create the needed credential.
4. Use browser automation only when no API path exists, the API cannot answer the task, Sanjay chooses the browser path, or visual/login verification is required.
5. Do not store API keys, passwords, tokens, or secret credentials in this repo, Obsidian, GitHub, or chat.

## Gmail Rule (permanent, added 2026-07-04)

Quick line: Gmail goes through `gmail-helper.mjs`, never through the Codex Desktop Gmail connector.

1. For ANY Gmail task (health check, search, read, labels, drafts), use the local helper:
   `node gmail-helper.mjs profile|search|read|thread|labels|label|create-draft` (see `--help`).
   It uses direct Gmail API access with out-of-repo OAuth tokens under `%APPDATA%\gcloud`.
2. Do NOT build workflows on the Codex Gmail connector. It has a known, recurring
   `codex_apps` session/handshake failure class (see `docs/codex-gmail-connector-diagnostics.md`
   and `GMAIL_HELPER_HANDOFF_CODEX.md`). The connector may be used opportunistically for
   interactive reads, but every scripted/scheduled/multi-step Gmail flow must use the helper.
3. If the connector fails (`token_expired`, `failed to get client`, `MCP startup failed`,
   `wham/apps` errors): do NOT loop on reconnecting Gmail. Restart Codex Desktop once, and
   continue the task via `gmail-helper.mjs`. Never hand a reconnect-click loop back to Sanjay.
4. The helper is drafts-only by design - it has no send command. Do not add one without
   Sanjay's explicit approval.

