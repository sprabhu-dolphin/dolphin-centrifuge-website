# Codex Gmail Connector Diagnostics

This note captures what we currently know about the intermittent Gmail connector failures in Codex Desktop.

## Current conclusion

The strongest current evidence points to a Codex Desktop `codex_apps` connector-session / MCP-handshake problem, not a Gmail mailbox problem.

That does **not** mean we have a permanent product fix yet. It means we have a reliable way to classify the failure and a practical operating workaround.

## Local evidence from this machine

- A fresh Gmail connector proof succeeds after a clean Codex restart:
  - Gmail `_get_profile` returned `sprabhu@dolphincentrifuge.com` on 2026-06-14 after restart.
- The same connector sometimes fails before mailbox access with:
  - `failed to get client`
  - `MCP startup failed`
  - `error sending request for url (https://chatgpt.com/backend-api/wham/apps)`
- The local `codex_apps` tool cache exists and is populated even when live connector startup can still fail.
- Current local cache snapshot:
  - file: `C:\Users\Sanjay Prabhu\.codex\cache\codex_apps_tools\4a4fb12ec1bae76e663ef4d56dcb99bb3cd7be1c.json`
  - total tools: 148
  - Gmail tools: 21
  - GitHub tools: 89
  - Google Drive tools: 35

Important meaning:

- Cached tools are **not** proof that the live connector is healthy.
- The only trustworthy live proof is a fresh connector call like Gmail `_get_profile`.

## Official docs

OpenAI’s Codex docs support a few relevant points:

- After installing a plugin that uses external apps, Codex expects you to connect the app and then start a new thread.
- The app and CLI can behave differently because they may rely on different underlying versions.
- For stuck app states, the docs explicitly recommend restart as a recovery step.

## Public evidence

Recent public reports show this is not isolated to this machine or to Gmail alone.

### Same `wham/apps` / `codex_apps` startup class

- `#27844` reports Gmail and Google Calendar both failing during MCP startup against `https://chatgpt.com/backend-api/wham/apps` before any API access.
- `#21995` reports scheduled Desktop automations failing on Gmail and GitHub connector startup, then succeeding on manual rerun later.
- `#20167` reports Codex hanging on `Starting MCP servers (2/3): codex_apps` with local logs showing `timed out handshaking` and `error sending request for url (https://chatgpt.com/backend-api/wham/apps)`.
- `#16550` reports `codex_apps` startup failing even when the endpoint itself is reachable, which points to the RMCP / streamable HTTP handshake path rather than a simple network failure.
- `#24785` reports the strongest public match: direct calls to `wham/apps` succeed with the same auth token while Codex Desktop connector calls still fail. That strongly supports “backend/token okay, Desktop connector session path broken.”

### Stale connector state in other apps

- `#19669` shows Slack staying on a stale connector link until local app-tool cache is moved aside and Codex is fully restarted.
- `#20286` shows Vercel connector state staying stuck after revoke/account switch.
- `#20710` shows Gmail plugin UI state looking installed even when the required app connection is not really ready.

Meaning:

- This looks like a broader Codex connector lifecycle / cache / handshake reliability problem, not a Gmail-only quirk.

## Community signal

- Reddit and forum discussions show related reports of reconnecting / connector breakage, but not a trustworthy permanent fix.
- The only recurring user-level workarounds I found were restart, reconnect, or in some cases downgrade. I do **not** consider downgrade a reliable business-safe policy here.

## Skills / plugin ecosystem check

I checked:

- built-in and curated installable skills
- local personal skills
- broader skill directories such as `skills.sh`

Current result:

- I did **not** find an installable skill or plugin whose real job is to fix Codex Desktop connector-session failures.
- Skills can help us manage the workflow around the issue, but they do not appear to repair the `codex_apps` handshake path itself.

## Practical criteria

Use this decision rule every time:

1. Run a fresh Gmail `_get_profile` first.
2. If it succeeds, proceed normally.
3. If it fails before mailbox access with the `wham/apps` startup / handshake error class, treat the live Codex session as stale or broken.
4. Restart Codex.
5. Retry `_get_profile`.
6. Only suspect Gmail auth itself if the connector starts and then reports account/auth mismatch.

## Local helper

Use the local script:

```powershell
powershell -ExecutionPolicy Bypass -File .\codex-gmail-health.ps1
```

Or:

```bash
npm run codex:gmail-health
```

What the script tells you:

- whether local Codex auth exists
- whether `wham/apps` is reachable with the current token
- whether the local app-tool cache is populated
- how many Codex processes are running and how old they are

What it **cannot** prove:

- it cannot prove the live Desktop connector session is healthy
- only a real `_get_profile` call from Codex can prove that

## Recommended durable operating policy

- Always do a fresh Gmail `_get_profile` check first.
- Treat success as healthy.
- Treat `wham/apps` startup failure as a Codex session/runtime issue first.
- Restart Codex before reconnecting Gmail.
- If restart stops working consistently, escalate with a focused bug report and local evidence.
