# Worker Lead-Loss Fix — Instruction Pack for Codex

**Owner-directed (Sanjay, 2026-06-20). REVENUE-CRITICAL.** Found by an independent audit
during conversion-tracking verification. Claude wrote this pack and will run 3 independent
post-audits after you implement. Repo lane is yours; please implement + deploy + verify.

---

## The problem (one line)
Both lead handlers send the Resend **email BEFORE** the D1 insert and abort on an email
failure, so the D1 insert is **never reached** — meaning if Resend is down/misconfigured,
the lead is lost with **no database fallback**. This inverts the intended model where D1 is
the durable source of truth.

**File:** `workers/contact-form/index.js`

- `handleFormSubmit` (contact): email send at ~line 1436; `if (!resendResponse.ok) throw` at
  ~1451; the D1 insert block (`// ── Save to D1 ──`) sits AFTER at ~1518-1547 → unreachable on
  email failure.
- `handlePartsSubmit` (parts + disc-glossary): email send ~1203; `if (!resendResponse.ok)
  return 500` at ~1218; D1 insert block AFTER at ~1227-1259 → unreachable on email failure.

---

## TIER 1 — the required fix (do this)

**Reorder both handlers so the D1 insert happens BEFORE the email send.** Keep everything else
identical. The insert stays wrapped in its existing non-fatal `try/catch` (so a D1 failure does
NOT block the email — the lead still survives by email). After the move, BOTH single-failure
cases are covered:
- D1 down, email up → lead delivered by email (unchanged).
- **Email down, D1 up → lead saved in D1, recoverable (this is the hole being closed).**

Keep the existing behavior of still returning the error to the customer when the email fails
(they see "please call us") — the lead is now safely stored either way. Do **not** flip an
email failure into a `success: true` response.

### 1a. Contact handler `handleFormSubmit`
- **Move** the entire `// ── Save to D1 ──` block (currently ~1518-1547: the
  `if (env.DB) { try { await insertSubmission(env, { ...formType: 'contact'... }); } catch ... }`)
  to **immediately before** the `// ── Send standard inquiry email ──` section (~line 1435,
  right after `emailHtml` is built). The insert does not use `emailHtml` or the email response,
  so it relocates cleanly. `reconnectMatchId` (from the reconnect check ~1349-1373) is already
  computed above this point — keep the reconnect check where it is, ahead of the insert.
- **Placement:** the new insert position (~1435) is ahead of BOTH the standard inquiry email
  send AND the reconnect-alert fire-and-forget email. Both email blocks stay where they are, in
  their current relative order, BELOW the insert. Final order: reconnect-check -> insert ->
  standard email send (+ its `!ok` throw) -> reconnect-alert email -> success.
- Leave the email send + `if (!resendResponse.ok) throw` exactly as-is, now AFTER the insert.
- Leave the reconnect-alert fire-and-forget email where it is (below the insert).

### 1b. Parts handler `handlePartsSubmit`
- **Move** the entire `if (env.DB) { try { await insertSubmission(env, {
  ...formType: attribution.formName || 'parts_request_form'... }); } catch ... }` block
  (currently ~1227-1259) to **immediately before** the Resend `fetch(...)` email send (~1203).
  All inputs it needs (`attribution` ~1166, `visitorContext` ~1167, `cleanParts` ~1144,
  `company/email/phone/name`) are available above line 1203. `nameParts`/`partsSummary` are
  computed inside the block — keep them inside it.
- Leave the email send + `if (!resendResponse.ok) return 500` as-is, now AFTER the insert.

### 1c. Add a last-resort recovery log in BOTH insert `catch` blocks
So that even the rare both-systems-down case leaves the lead in Worker logs, add a structured
full-payload log line in each insert `catch` (in addition to the existing `console.error`).
**Use the handler-specific payload below — the two handlers do NOT share the same variables**
(the parts handler has NO `firstName`/`lastName`; it has `name` and `nameParts.firstName`).
Do not copy the contact snippet into the parts catch — `firstName` is undefined there and would
throw a `ReferenceError` inside the catch, masking the real D1 error.

Contact handler (`handleFormSubmit`) catch:
```js
} catch (dbErr) {
  console.error('LEAD_RECOVERY_PAYLOAD', JSON.stringify({
    form: 'contact', firstName, lastName, company, email, phone,
  }));
  console.error('D1 insert error:', dbErr.message);
}
```

Parts handler (`handlePartsSubmit`) catch (note: `name` + `cleanParts`, NOT firstName/lastName):
```js
} catch (dbErr) {
  console.error('LEAD_RECOVERY_PAYLOAD', JSON.stringify({
    form: 'parts', name, company, email, phone, parts: cleanParts,
  }));
  console.error('D1 insert error (parts):', dbErr.message);
}
```

---

## TIER 2 — recommended hardening (do if low-risk; the auditors will check these too)

1. **Contact handler parse guard.** `handleFormSubmit` parses the body (~1280-1287) WITHOUT a
   try/catch, so a malformed body → unhandled throw → 500 (lead lost). Mirror the parts handler
   (~1093-1100): wrap the parse and return a clean `400 Invalid body` instead of 500.
2. **Turnstile fail-open.** `verifyTurnstile` (~1571) does an un-guarded `fetch(...).json()`; a
   Cloudflare siteverify outage would throw → 500 → lost lead. Wrap the verify CALL in both
   handlers in try/catch and **fail open** (log + proceed) on an infrastructure error, so spam
   protection never costs a real lead. (Only runs when a token is present AND
   `TURNSTILE_SECRET_KEY` is set, so low current risk — but cheap insurance.)

> Note: a missing `RESEND_API_KEY` is now mitigated by Tier 1 (email fails → lead still in D1).
> No separate change required, but you may add an explicit `if (!env.RESEND_API_KEY)` log.

---

## DO NOT BREAK (hard constraints)
- The email send itself, its recipients (`sales@dolphincentrifuge.com`), subject, reply-to, HTML.
- The 4-tier `insertSubmission` schema-drift fallback (keep it intact and non-fatal).
- `form_type` values: contact → `'contact'`; parts → `attribution.formName` (yields
  `parts_request_form` and `disc_parts_glossary_form`). The reconciliation monitor depends on
  these EXACT strings.
- The `success: true` contract: it must still mean "a real lead email was sent" — do not return
  success when the email failed. (Now the lead is also persisted first, so it's recoverable.)
- The `/track/pageview` route and admin routes — untouched.

## VERIFY before declaring done
1. `node --check workers/contact-form/index.js` passes.
2. Reason through all four failure combinations (D1 up/down × email up/down) and confirm the
   lead survives in 3 of 4, and is logged in the 4th.
3. Deploy: `wrangler deploy` (note the new version id). Reversible via `wrangler rollback`.
4. Live smoke test (like Claude's 2026-06-20 run): POST one clearly-marked test to each of the
   contact endpoint and `/parts` (with `attribution.form_name` = `parts_request_form` then
   `disc_parts_glossary_form`), confirm HTTP 200 + a D1 row with the right `form_type`, then
   DELETE the test rows (use `@example.com` emails so they're auto-excluded from reporting).
5. Record a coordination stamp in `01 Operating Rules/Agent Coordination.md` with the new Worker
   version id and what changed.

## THEN
Hand back to Claude for **3 independent zero-context post-audits** (Worker pipeline re-verify,
failure-combination/regression review, and end-to-end functional re-test + monitor reconcile).
Do not consider the work closed until those 3 pass.
