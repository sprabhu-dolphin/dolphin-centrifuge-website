# Spec: Swap phone-lead source from Gmail to the Talkroute API

Author: Claude (planning doc, NOT an implementation file). Date: 2026-06-26.
Owner to implement: Codex (Worker + dashboard lane). Auditor after: Claude (multi-agent test).

## Goal

Replace the fragile Gmail-voicemail-email parsing source with Talkroute's official API as the
phone-lead source. Reuse EVERYTHING downstream - the `calls` table, phone normalization, the
digit-floor + snippet fixes, exact-match logic, and the Phone Leads dashboard view are all
source-agnostic. This is a SOURCE ADAPTER SWAP, not a rewrite.

## Confirmed API contract (from apidocs.talkroute.com, 2026-06-26)

- Base URL: `https://api.talkroute.com/api`
- Auth: API key `tr_live_<64 hex>` passed as `Authorization: Bearer <key>` (apiKeyAuth). Included on all plans.
- OpenAPI 3.1, v2.0.0. Versioned paths under `/v2/...` (e.g. `GET /v2/account`).
- Resources present: account, contacts, conversations, messages, users, extensions, mailboxes,
  phone numbers, **voicemails**, **call logs**, **webhooks**, blocked-numbers.
- EXACT endpoint paths + field names + webhook event/payload shapes: confirm from the live OpenAPI
  doc / your account once the API key exists (the public spec download is access-gated). Likely
  `GET /v2/voicemails`, `GET /v2/call-logs` (or `/v2/calls`), `GET/POST /v2/webhooks`.

## Prerequisite (owner action - cannot be automated)

Sanjay must request API access in the Talkroute account (talkroute.com/api) and obtain the
`tr_live_...` key. That is the one gating step. Once obtained, storing it is automated (below).

## Implementation

### 1. Secret
- Add Worker secret `TALKROUTE_API_KEY`. Set it via the SAME automated approach as the other
  secrets (read from a local cred file, pipe to `wrangler secret put`, never print/store the value).
  Owner does not cut-paste.

### 2. Source adapter (V1 = polling; simplest + robust for Dolphin's low volume)
- Add a Talkroute client (Worker-safe, no Node-only deps) that calls the API with the Bearer key.
- Add an admin route `GET /admin/calls/sync-talkroute` (admin-auth-gated, same as other /admin) +
  wire a scheduled pull (reuse the existing cron infra; e.g. every 15-30 min - volume is tiny).
- The sync pulls voicemails + call logs since the last sync watermark, normalizes EACH into the
  existing `calls` record shape, and runs the EXISTING upsert + exact-match path:
  - `source = 'talkroute_api'`, `source_message_id = <Talkroute voicemail/call id>` (idempotent via
    the existing unique (source, source_message_id)).
  - Keep the digit-floor guard (`callerDigits.length < 10 -> unmatched`) and SNIPPET-only retention
    (transcript_snippet ~200, transcript_available; NO full transcript; raw_json = metadata only).
  - Reuse `findCallPhoneMatch` + `updateVisitorIdentityFromCallMatch` unchanged.
- Watermark: store last-synced timestamp/cursor (a small KV/D1 row) so each run only pulls new items.

### 3. Webhooks (V2 - optional real-time upgrade, do after polling works)
- Add `POST /track/talkroute` webhook receiver: verify Talkroute's signature/shared secret (check
  docs for the exact mechanism), normalize the event into the same `calls` path. Register the
  webhook via `/v2/webhooks` (or the Talkroute UI) pointing at the Worker URL, subscribed to
  voicemail/new-call events. Polling stays as backfill / missed-webhook safety net.

### 4. Transcripts
- Confirm whether the API returns voicemail transcripts. If yes, store SNIPPET only (same rule).
  If the API gives a recording URL instead of text, store availability + URL (no audio in D1).

### 5. Gmail path
- Keep `talkroute-voicemail-ingest.mjs` as a manual fallback/backfill, or retire it once the API
  source is verified. Do not run both as primary (would double-ingest; the (source,message_id) key
  dedups within a source but Gmail vs API ids differ - so gate one off as primary).

## Verify / deploy

1. Clean commit; `npm run build`; `node --check`; `wrangler deploy --dry-run`.
2. No D1 migration expected (calls table already live; new `source` value only). Confirm.
3. Set `TALKROUTE_API_KEY` (automated). Deploy Worker.
4. Manual `GET /admin/calls/sync-talkroute` -> confirm real voicemails/calls upsert into `calls`.
5. Verify: snippet (not full transcript) stored; unmatched real numbers stay unmatched (no false
   attach); matched ones attach to the right visitor; Phone Leads dashboard + timeline render.
6. Commit + push, stamp coordination note (commits, deploy URL, webhook id if used), hand to Claude.

## Claude's multi-agent test (after build)

- Agent: Talkroute client + sync correctness (auth, pagination, watermark, idempotency, error handling).
- Agent: Worker calls path reuse (digit-floor, snippet, match, no false attach) against real API data.
- Agent: dashboard render/XSS for API-sourced calls; no regression.
- Live: a real sync pulling real Talkroute data -> rows in D1 -> dashboard, end to end.

## Acceptance criteria

1. Real Talkroute voicemails/calls land in `calls` via the API (not Gmail), idempotently.
2. Snippet-only retention enforced; no full transcript/audio in D1.
3. Digit-floor + exact-match preserved; no false visitor attach.
4. Dashboard Phone Leads + timeline render API-sourced calls, XSS-safe.
5. Secret automated; no owner cut-paste. Clean commit; build + dry-run pass.
