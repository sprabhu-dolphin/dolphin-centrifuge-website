import { test } from 'node:test';
import assert from 'node:assert/strict';
import { talkrouteCallRaw } from './talkroute.js';
import worker from './index.js';

const SECRET = 'test-webhook-secret-0123456789abcdef';
const BASE = 'https://dolphin-contact-form.dolphin-centrifuge.workers.dev/track/talkroute/';

const callEvent = {
  datetime: '2026-09-20T15:04:05+00:00',
  call_result: 'answered',
  direction: 'inbound',
  duration: 42,
  caller_number: '+17023234800',
  called_number: '+12488205840',
  caller_cname: 'Kim Perkins',
};

function post(secret, body) {
  return worker.fetch(new Request(BASE + secret, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }), env(), {});
}

function env(db) {
  return {
    TALKROUTE_WEBHOOK_SECRET: SECRET,
    DB: db || { prepare() { throw new Error('Must not touch D1'); } },
  };
}

test('webhook call record normalizes into the calls record shape', () => {
  const raw = talkrouteCallRaw(callEvent);
  assert.equal(raw.source, 'talkroute_api');
  assert.equal(raw.source_message_id, `tr-call-${Date.parse(callEvent.datetime) / 1000}-7023234800`);
  assert.equal(raw.created_at, '2026-09-20T15:04:05.000Z');
  assert.equal(raw.caller_raw, '+17023234800');
  assert.equal(raw.email_to, '+12488205840');
  assert.equal(raw.mailbox, 'Answered');
  assert.equal(raw.duration_seconds, 42);
  assert.equal(raw.transcript, '');
  assert.match(raw.email_subject, /Kim Perkins/);
  assert.deepEqual(talkrouteCallRaw({ ...callEvent }), raw, 'same event gives the same idempotency key');
});

test('call-history record uses the same key as the matching webhook and keeps the Talkroute id', () => {
  const raw = talkrouteCallRaw({
    id: '98765', direction: 'inbound', callDate: '2026-09-20T15:04:05.123456Z',
    externalNumber: '+17023234800', externalName: null, phoneNumber: '+12488205840',
    duration: 42, result: 'missed', events: [{ type: 'voicemail' }],
  });
  assert.equal(raw.source_message_id, talkrouteCallRaw(callEvent).source_message_id);
  assert.equal(raw.source_thread_id, '98765');
  assert.equal(raw.mailbox, 'Voicemail');
});

test('voicemail event keeps the transcript; outbound and undated events are ignored', () => {
  const vm = talkrouteCallRaw({
    datetime: '2026-09-20T15:05:00+00:00', call_result: 'missed', duration: 7,
    called_number: '+12488205840', caller_number: '+17023234800',
    transcription: 'Calling about used oil.', mailbox_name: 'Default Mailbox',
  });
  assert.match(vm.source_message_id, /^tr-vm-/);
  assert.equal(vm.mailbox, 'Voicemail');
  assert.equal(vm.transcript, 'Calling about used oil.');
  assert.equal(talkrouteCallRaw({ ...callEvent, direction: 'outbound' }), null);
  assert.equal(talkrouteCallRaw({ ...callEvent, datetime: '' }), null);
});

test('short or missing caller ids still get a stable key', () => {
  const raw = talkrouteCallRaw({ ...callEvent, caller_number: '12345' });
  assert.match(raw.source_message_id, /-12345$/);
  assert.match(talkrouteCallRaw({ ...callEvent, caller_number: '' }).source_message_id, /-unknown$/);
});

test('webhook without the right secret is rejected and stores nothing', async () => {
  for (const secret of ['', 'wrong', SECRET.slice(0, -1), SECRET + 'x']) {
    const res = await post(secret, callEvent);
    assert.equal(res.status, 401);
  }
  const noSecretEnv = await worker.fetch(new Request(BASE + SECRET, {
    method: 'POST', body: JSON.stringify(callEvent),
  }), { DB: { prepare() { throw new Error('Must not touch D1'); } } }, {});
  assert.equal(noSecretEnv.status, 401);
});

test('authenticated webhook upserts one talkroute_api row through the shared calls path', async () => {
  const writes = [];
  const db = {
    prepare(sql) {
      return {
        bind(...args) {
          return {
            first: async () => null,
            all: async () => ({ results: [] }),
            run: async () => { writes.push({ sql, args }); return {}; },
          };
        },
        all: async () => ({ results: [] }),
      };
    },
  };
  const res = await worker.fetch(new Request(BASE + SECRET, {
    method: 'POST', body: JSON.stringify(callEvent),
  }), env(db), {});
  assert.equal(res.status, 200);
  assert.equal(writes.length, 1);
  assert.match(writes[0].sql, /INSERT INTO calls/);
  assert.equal(writes[0].args[3], 'talkroute_api');
  assert.equal(writes[0].args[4], talkrouteCallRaw(callEvent).source_message_id);
  assert.equal(writes[0].args[13], '7023234800');
});
