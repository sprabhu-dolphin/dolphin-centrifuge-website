import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { usedQuoteLeadDetail } from './src/lib/usedQuote.mjs';
import { onRequest } from './functions/api/ads-attribution.js';
import { buildOpenAiAdsBootstrap } from './src/lib/openaiAds.mjs';

const config = { pixelId: 'test-pixel', allowedHosts: ['dolphincentrifuge.com', 'www.dolphincentrifuge.com'] };
function browser(host = 'dolphincentrifuge.com', navigator = {}, crypto, search = '', internal = false) {
  const scripts = [];
  const window = { location: { hostname: host, search, origin: 'https://' + host, pathname: '/used-oil/' }, navigator, crypto, TextEncoder, URLSearchParams, fetch: async () => new Response(null, { status: 204 }) };
  window.dolphinIsInternalVisitor = () => internal;
  const document = {
    createElement: () => ({}),
    getElementsByTagName: () => [{ parentNode: { insertBefore: script => scripts.push(script) } }],
  };
  const context = vm.createContext({ window, document });
  const run = () => vm.runInContext(buildOpenAiAdsBootstrap(config), context);
  run();
  return { window, scripts, run };
}

test('initializes once and measures only explicit successful leads without form data', () => {
  const { window, scripts, run } = browser();
  run();
  assert.equal(scripts.length, 1);
  assert.equal(scripts[0].src, 'https://bzrcdn.openai.com/sdk/oaiq.min.js');
  assert.equal(window.oaiq.q.length, 1);
  window.dolphinTrackOpenAiLead({ openai_event_id: 'dolphin_lead_17', email: 'private@example.invalid', fluid_type: 'private' });
  const measured = JSON.parse(JSON.stringify(Array.from(window.oaiq.q[1])));
  assert.deepEqual(measured, ['measure', 'lead_created', { type: 'customer_action' }, { opt_out: true, event_id: 'dolphin_lead_17' }]);
});

test('hashes successful-lead email before updating Pixel user data', async () => {
  const crypto = { subtle: { digest: async () => Uint8Array.from({ length: 32 }, (_, i) => i).buffer } };
  const { window } = browser('dolphincentrifuge.com', {}, crypto);
  assert.equal(window.dolphinTrackOpenAiLead({ openai_event_id: 'dolphin_lead_17', openai_email: ' Buyer@Example.COM ' }), true);
  await Promise.resolve();
  await Promise.resolve();
  const queued = JSON.parse(JSON.stringify(window.oaiq.q.map(args => Array.from(args))));
  assert.deepEqual(queued[1], ['init', { user: { email_sha256: '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f' } }]);
  assert.deepEqual(queued[2], ['measure', 'lead_created', { type: 'customer_action' }, { opt_out: true, event_id: 'dolphin_lead_17' }]);
  assert.equal(JSON.stringify(queued).includes('Buyer@Example.COM'), false);
});

test('suppresses previews, localhost, missing configuration, and privacy opt-outs', () => {
  for (const host of ['localhost', '127.0.0.1', 'preview.pages.dev']) {
    assert.equal(browser(host).scripts.length, 0);
  }
  assert.equal(buildOpenAiAdsBootstrap({ ...config, pixelId: '' }), '');
  for (const privacy of [{ globalPrivacyControl: true }, { doNotTrack: '1' }]) {
    assert.equal(browser('dolphincentrifuge.com', privacy).scripts.length, 0);
  }
  const internal = browser('dolphincentrifuge.com', {}, undefined, '', true);
  assert.equal(internal.scripts.length, 0);
  assert.deepEqual(JSON.parse(JSON.stringify(internal.window.dolphinOpenAiConversionContext())), { allowed: false, reason: 'internal', internal: true });
});

test('SDK failure cannot fail form completion or Google lead reporting', () => {
  const { window } = browser();
  window.oaiq = () => { throw new Error('measurement unavailable'); };
  assert.equal(window.dolphinTrackOpenAiLead(), false);
  const layout = readFileSync(new URL('./src/layouts/BaseLayout.astro', import.meta.url), 'utf8');
  const match = layout.match(/window\.dolphinTrackLead = window\.dolphinTrackLead \|\| function\(params\) \{([\s\S]*?)\n\};/);
  let googleLeads = 0;
  window.dolphinTrackEvent = () => { googleLeads++; return true; };
  vm.runInNewContext(`window.dolphinTrackLead = function(params) {${match[1]}\n};`, { window });
  assert.equal(window.dolphinTrackLead({ lead_form: 'contact' }), true);
  assert.equal(googleLeads, 1);
});

test('all four inquiry forms dispatch after both HTTP and application success', () => {
  for (const [page, result] of [
    ['contact-for-alfa-laval-centrifuges', 'result'],
    ['used-oil', 'result'],
    ['alfa-laval-centrifuge-parts', 'data'],
    ['disc-centrifuge-parts-glossary', 'data'],
  ]) {
    const source = readFileSync(new URL(`./src/pages/${page}.astro`, import.meta.url), 'utf8');
    const success = source.indexOf(`if (response.ok && ${result}.success)`);
    const dispatch = source.indexOf("new CustomEvent('dolphin:generate-lead'");
    assert.ok(success >= 0 && dispatch > success, page);
    assert.equal(source.match(/new CustomEvent\('dolphin:generate-lead'/g).length, 1, page);
  }
});


test('server ID is required and missing saves do not create browser events', () => {
  const { window } = browser();
  for (const input of [undefined, {}, { openai_event_id: null }]) assert.equal(window.dolphinTrackOpenAiLead(input), false);
  assert.equal(window.oaiq.q.length, 1);
});

test('persisted consent denial suppresses server context and browser events', () => {
  const { window } = browser();
  window.localStorage = { getItem: () => 'false' };
  assert.equal(window.dolphinOpenAiConversionContext().allowed, false);
  assert.equal(window.dolphinTrackOpenAiLead({ openai_event_id: 'dolphin_lead_17' }), false);
});


test('captures genuine URL reference before SDK receipt, preserves it through forms and reports the suppression reason', () => {
  const { window } = browser('dolphincentrifuge.com', {}, undefined, '?oppref=opaque%2B%2Fvalue');
  assert.equal(window.dolphinOpenAiConversionContext().oppref, 'opaque+/value');
  window.navigator.doNotTrack = '1';
  assert.deepEqual(JSON.parse(JSON.stringify(window.dolphinOpenAiConversionContext())), { allowed: false, reason: 'dnt', internal: false });
  const blocked = browser();
  blocked.window.localStorage = { getItem() { throw Error('blocked'); } };
  assert.equal(blocked.window.dolphinOpenAiConversionContext().reason, 'storage_unavailable');
});

test('fifth inquiry form carries the saved server ID and cannot measure an unsaved result', () => {
  const input = { email: 'buyer@example.invalid' };
  const { window } = browser();
  assert.equal(window.dolphinTrackOpenAiLead(usedQuoteLeadDetail(input, 'form')), false);
  assert.equal(window.dolphinTrackOpenAiLead(usedQuoteLeadDetail(input, 'form', { openai_event_id: 'dolphin_lead_19' })), true);
  assert.equal(window.oaiq.q[1][3].event_id, 'dolphin_lead_19');
  const source = readFileSync(new URL('./src/scripts/usedQuoteForm.ts', import.meta.url), 'utf8');
  assert.ok(source.indexOf('usedQuoteLeadDetail(input, channel, result)') > source.indexOf('if (!response.ok || !result.success)'));
});

test('first-party cookie endpoint respects denial and origin and round-trips opaque values', async () => {
  const url = 'https://dolphincentrifuge.com/api/ads-attribution';
  const send = (body, headers = {}) => onRequest({ request: new Request(url, { method: 'POST', headers: { Origin: 'https://dolphincentrifuge.com', 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) }) });
  const accepted = await send({ allowed: true, oppref: 'opaque+/=%value' });
  assert.equal(accepted.status, 204);
  assert.equal(decodeURIComponent(accepted.headers.get('Set-Cookie').split(';')[0].slice('dc_oppref='.length)), 'opaque+/=%value');
  assert.match(accepted.headers.get('Set-Cookie'), /Max-Age=2592000/);
  for (const headers of [{ DNT: '1' }, { 'Sec-GPC': '1' }, { Cookie: '__oaiq_consent=false' }]) {
    assert.match((await send({ allowed: true, oppref: 'x' }, headers)).headers.get('Set-Cookie'), /Max-Age=0/);
  }
  assert.equal((await send({ allowed: false, oppref: 'x' })).status, 400);
  assert.equal((await send({ allowed: true, oppref: 'x' }, { Origin: 'https://foreign.example' })).status, 403);
});
