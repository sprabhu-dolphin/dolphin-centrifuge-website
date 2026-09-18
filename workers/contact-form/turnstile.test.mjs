import { test } from 'node:test';
import assert from 'node:assert/strict';
import { verifyTurnstile } from './turnstile.js';
import worker from './index.js';

const request = new Request('https://dolphin-contact-form.dolphin-centrifuge.workers.dev/');

test('missing tokens or configuration never reach Siteverify', async (t) => {
  const fetchMock = t.mock.method(globalThis, 'fetch', () => { throw new Error('Unexpected network access'); });
  for (const token of [undefined, '', ' ', {}, 'x'.repeat(2049)]) {
    assert.equal(await verifyTurnstile(token, 'test-secret', request, 'contact'), false);
  }
  assert.equal(await verifyTurnstile('test-token', '', request, 'contact'), false);
  assert.equal(fetchMock.mock.callCount(), 0);
});

test('only successful tokens for our hostname and matching form are accepted', async (t) => {
  let result;
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, 'https://challenges.cloudflare.com/turnstile/v0/siteverify');
    assert.equal(options.body.get('response'), 'test-token');
    assert.ok(options.signal);
    return Response.json(result);
  });
  for (const action of ['contact', 'parts_rfq']) {
    for (const hostname of ['dolphincentrifuge.com', 'www.dolphincentrifuge.com']) {
      result = { success: true, hostname, action };
      assert.equal(await verifyTurnstile('test-token', 'test-secret', request, action), true);
    }
    for (const invalid of [
      { success: false, 'error-codes': ['timeout-or-duplicate'] },
      { success: true, hostname: 'elsewhere.example', action },
      { success: true, hostname: 'dolphincentrifuge.com', action: 'unrelated' },
      { success: true },
    ]) {
      result = invalid;
      assert.equal(await verifyTurnstile('test-token', 'test-secret', request, action), false);
    }
  }
});

test('verification outages and malformed responses reject the request', async (t) => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => { throw new Error('Timeout'); });
  assert.equal(await verifyTurnstile('test-token', 'test-secret', request, 'contact'), false);
  fetchMock.mock.mockImplementation(async () => new Response('unavailable', { status: 503 }));
  assert.equal(await verifyTurnstile('test-token', 'test-secret', request, 'contact'), false);
  fetchMock.mock.mockImplementation(async () => new Response('not JSON'));
  assert.equal(await verifyTurnstile('test-token', 'test-secret', request, 'contact'), false);
});

test('both public handlers reject missing or invalid verification before saving or emailing', async (t) => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async (url) => {
    assert.equal(url, 'https://challenges.cloudflare.com/turnstile/v0/siteverify');
    return Response.json({ success: false });
  });
  const env = { TURNSTILE_SECRET_KEY: 'test-secret', DB: { prepare() { throw new Error('Must not write a lead'); } } };
  for (const path of ['/', '/parts']) {
    for (const body of [{}, { 'cf-turnstile-response': 'invalid-token' }]) {
      const response = await worker.fetch(new Request(new URL(path, request.url), {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      }), env, {});
      assert.equal(response.status, 400);
      assert.match((await response.json()).error, /security verification/);
    }
  }
  assert.equal(fetchMock.mock.callCount(), 2);
});
