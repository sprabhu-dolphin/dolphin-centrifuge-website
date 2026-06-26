# Phone Lead Ingestion Handoff

Status: local implementation only. Not deployed. Not committed. Not pushed.

Owner note: this work should now be treated as input to the main Dolphin stats dashboard effort. Do not continue it as a separate independent lane. The main Claude plus main Codex dashboard lane should decide what to keep, merge it cleanly, then deploy it as one consolidated "connect all the dots" release.

## Why This Exists

The dashboard goal is to connect all lead signals into one visitor profile:

- Website page visits.
- Website phone clicks.
- Website email clicks.
- Contact and parts form submissions.
- Google Ads origin and conversion data.
- Talkroute voicemail leads.
- Future provider call logs.

This local work created the first phone-lead ingestion path, starting with Talkroute voicemail emails in Gmail.

## Source Pattern Confirmed

I used the Gmail connector in read-only mode only.

Confirmed mailbox profile:

- `sprabhu@dolphincentrifuge.com`

Confirmed recent Talkroute voicemail pattern:

- Sender: `voicemail@talkroute.com`
- Display sender: `Voicemail | Talkroute`
- Subject format: `You Have A New Voice Message From 1 (...)`
- Body fields:
  - `From:`
  - `Message Length:`
  - `Mailbox:`
  - Transcript text after the mailbox line, or a no-transcription marker
- Attachment:
  - `voicemessage.m4a`
  - MIME type `audio/mp4`
  - Attachment size metadata

No Gmail drafts, labels, archives, sends, deletes, or other mailbox writes were performed.

## Data Flow Implemented

The local V1 flow is:

1. Gmail voicemail email is read by a local helper script.
2. The helper parses caller number, message length, mailbox, transcript status, a short transcript snippet, attachment metadata, email timestamp, Gmail message id, thread id, subject, sender, and a Gmail display URL.
3. The helper sends normalized records to a protected Worker admin endpoint.
4. The Worker upserts the record into a new `calls` table.
5. The Worker normalizes the caller number into:
   - `caller_phone_digits`, for matching
   - `caller_phone_e164`, for display
6. The Worker tries exact phone matching only, and refuses to match caller IDs shorter than 10 digits:
   - First against `submissions.phone`
   - Then against `visitor_profiles.contact_phone`
7. If the call matches a form submission that has a visitor id, the Worker can update that visitor profile with:
   - `identity_source = 'phone+form match'`
   - `identity_confidence = 'exact-phone-confirmed'`
8. The dashboard can show the call in two places:
   - A new Phone Leads view
   - The matched visitor's activity timeline as a `phone_voicemail` event

Important safety rule: this implementation does not auto-match by IP address, timing, city, area code, or other clues. Those are useful hints later, but not proof.

## Files Added Or Changed

New file:

- `phone_lead_ingestion.md`
  - This handoff file.

New local helper:

- `talkroute-voicemail-ingest.mjs`
  - Local Gmail voicemail preview and ingestion helper.
  - Uses Gmail readonly OAuth.
  - Keeps tokens outside the repo under `%APPDATA%\gcloud`.
  - Supports:
    - `auth`
    - `preview`
    - `ingest`
    - `parse-file`
    - `self-test`

Schema:

- `workers/contact-form/schema.sql`
  - Added `calls` table.
  - Added indexes for source message id, created date, caller phone, matched visitor, match status, and deletion flag.

- `workers/contact-form/schema-phone-leads-v1.sql`
  - Standalone migration for the `calls` table and indexes.
  - Intended for later approved D1 migration.

Worker:

- `workers/contact-form/index.js`
  - Added `GET /admin/calls`.
  - Added `POST /admin/calls/ingest`.
  - Added phone normalization helpers.
  - Added voicemail call record normalization.
  - Added exact-phone match logic.
  - Added call upsert logic keyed by `(source, source_message_id)`.
  - Added matched voicemail events to `GET /admin/visitors/:visitorId/events`.
  - Added calls count to `GET /admin/summary`.

Dashboard:

- `src/pages/admin/submissions.astro`
  - Added sidebar item: Phone Leads.
  - Added `panel-calls`.
  - Added phone-lead table rendering.
  - Added call search text.
  - Added `phone_voicemail` timeline display.
  - Added Phone leads summary tile.
  - Added safe URL handling for Gmail source links.

Related click-tracking bootstrap:

- `src/layouts/BaseLayout.astro`
  - During this sidetrack, I also applied the one-token local fix that changes the existing phone/email click listener wrapper from not-invoked to invoked.
  - This makes the existing `tel:` and `mailto:` listeners actually attach.
  - Important: the main coordination note says this one-token fix was later handled, audited, and deployed in the main visitor-event lane. It is no longer showing as a separate pending local diff here. Do not treat this phone-lead handoff as the owner of that live click-tracking fix.

## What Was Not Done

No live system was changed.

Specifically, I did not:

- Run the D1 migration.
- Deploy the Worker.
- Deploy the Pages site.
- Commit or push.
- Create or change Gmail drafts.
- Send email.
- Archive, label, delete, or move Gmail messages.
- Write anything to Talkroute.
- Use a Talkroute API.
- Build a scheduled cloud sync.
- Match voicemail-only callers to visitors by IP, timing, area code, or location.
- Reconcile phone leads against Google Ads call conversions.

## Validation Completed

Local checks passed:

- Worker syntax check.
- Gmail ingestion helper syntax check.
- Gmail ingestion helper self-test.
- Repository whitespace check.
- Full Astro site build.

Live Gmail was used only for read-only pattern confirmation.

## Important Worktree Warning

At the time this handoff was created, the local repo also had separate active or parallel changes unrelated to phone-lead ingestion.

Examples included:

- Lead reconciliation monitor files.
- Google Ads helper files.
- `package.json`.
- `workers/contact-form/wrangler.toml`.
- Other untracked lead-reconciliation helper and test files.

The biggest overlap is `workers/contact-form/index.js`, which currently contains both:

- Phone-lead ingestion changes from this lane.
- Separate lead-reconciliation monitor changes from another lane.

Do not deploy the current dirty worktree blindly. The main dashboard effort should merge the phone-lead pieces into a clean branch from the current main line and resolve overlap with the lead-reconciliation work deliberately.

## Privacy And Data Notes

Owner decision for the coordinated release: D1 stores only `transcript_snippet` plus `transcript_available`.

The full voicemail transcript is not stored. The `raw_json` column is limited to message metadata such as message id, thread id, sender, subject, message length, mailbox, and timestamps. It does not store the full email body or transcript.

## Recommended Consolidated Path

Recommended next steps for the main dashboard lane:

1. Treat this file as the phone-lead V1 handoff.
2. Decide whether this schema and flow fit the unified dashboard plan.
3. Move the accepted phone-lead changes into a clean consolidated branch.
4. Resolve overlap with the lead-reconciliation monitor before any Worker deploy.
5. Confirm transcript snippet-only retention remains intact.
6. Run local syntax checks and full site build again.
7. Apply the D1 migration only after approval.
8. Deploy the Worker only after the migration is live.
9. Deploy the Pages dashboard only after the Worker route is live.
10. Run the Gmail helper in preview mode first.
11. Ingest a very small batch first.
12. Verify:
    - `/admin/calls` loads.
    - Phone leads appear in the dashboard.
    - Exact phone matches attach to the correct visitor profiles.
    - Matched voicemails appear in visitor timelines.
    - No unmatched call is falsely attached to a visitor.
13. Record the final deployed state in Agent Coordination and the Dolphin Stats Dashboard note.

## Helpful Local Commands

Preview recent Talkroute voicemail emails:

```bash
node talkroute-voicemail-ingest.mjs preview --max 10
```

Dry-run ingestion:

```bash
node talkroute-voicemail-ingest.mjs ingest --max 10 --dry-run
```

Self-test parser logic:

```bash
node talkroute-voicemail-ingest.mjs self-test
```

Run the D1 migration later, only after approval:

```bash
wrangler d1 execute dolphin-submissions --file=workers/contact-form/schema-phone-leads-v1.sql --remote
```

## Open Decisions For Main Effort

- Should Gmail voicemail ingestion stay as the V1 source, or should Talkroute API call logs become the first official source?
- Should Talkroute API call logs later replace Gmail voicemail emails as the official source?
- Should unmatched voicemail-only callers appear as standalone phone leads only, or also as suggested visitor matches?
- How should suggested matches be shown without pretending they are certain?
- Should this run manually first, then later move to Worker Cron or another cloud job?
- How should phone leads reconcile with Google Ads `Calls from ads` and website `phone_click` events?
- What is the final source of truth for Dolphin phone numbers across Talkroute, call assets, website `tel:` links, and form phone numbers?

## Bottom Line

This local work proves the first voicemail-to-dashboard path:

Talkroute Gmail voicemail -> parsed phone lead -> D1 `calls` -> exact phone match -> visitor profile -> dashboard timeline.

It should now be folded into the main dashboard build as one coordinated action, not advanced separately.
