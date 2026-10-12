import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { installOpenAiAds } from './src/lib/openaiAds.mjs';
import worker from './workers/contact-form/index.js';

const layout = readFileSync(new URL('./src/layouts/BaseLayout.astro', import.meta.url), 'utf8');
function bootstrap(name) {
  const expression = layout.match(new RegExp('const ' + name + ' = (`[\\s\\S]*?`);'))[1];
  return vm.runInNewContext(expression, { contactWorkerBaseUrl: 'https://worker.example', trackingAllowedHosts: ['dolphincentrifuge.com'] });
}
function browser(search = '', cookies = new Map()) {
  const writes = [], beacons = [];
  const storage = () => { const data = new Map(); return { getItem: key => data.get(key) || null, setItem: (key, value) => data.set(key, value) }; };
  const window = {
    location: new URL('https://dolphincentrifuge.com/used-oil/' + search),
    localStorage: storage(), sessionStorage: storage(), addEventListener() {},
    navigator: { sendBeacon: (url, blob) => { beacons.push({ url, blob }); return true; } },
    URLSearchParams,
  };
  window.history = { state: { retained: true }, replaceState(state, title, url) { assert.equal(state.retained, true); window.location = new URL(url, window.location); } };
  const document = {
    title: 'Test page', referrer: '', querySelectorAll: () => [], addEventListener() {},
    createElement: () => ({}), getElementsByTagName: () => [{ parentNode: { insertBefore() {} } }],
    get cookie() { return [...cookies].map(([key, value]) => key + '=' + value).join('; '); },
    set cookie(value) { writes.push(value); const pair = value.split(';')[0]; cookies.set(pair.slice(0, pair.indexOf('=')), pair.slice(pair.indexOf('=') + 1)); },
  };
  const context = vm.createContext({ window, document, navigator: window.navigator, URL, URLSearchParams, Blob });
  vm.runInContext(bootstrap('dolphinInternalBootstrap'), context);
  installOpenAiAds(window, document, { pixelId: 'test', allowedHosts: ['dolphincentrifuge.com'] });
  vm.runInContext(bootstrap('dolphinAttributionBootstrap'), context);
  return { window, cookies, writes, beacons };
}

test('one-time URL marks the browser for 400 days before tracking and preserves other URL parameters', async () => {
  const first = browser('?utm_source=chatgpt&dc_internal=1&utm_medium=paid#quote');
  assert.deepEqual(first.writes.filter(value => value.startsWith('dc_internal=')), ['dc_internal=1; Max-Age=34560000; Path=/; Secure; SameSite=Lax']);
  assert.equal(first.window.location.href, 'https://dolphincentrifuge.com/used-oil/?utm_source=chatgpt&utm_medium=paid#quote');
  const view = JSON.parse(await first.beacons[0].blob.text());
  assert.equal(view.internal, true);
  assert.equal(view.attribution.internal, true);
  assert.equal(view.attribution.openai_ads.internal, true);
  assert.equal(JSON.stringify(view).includes('dc_internal'), false);
  const later = browser('', first.cookies);
  assert.equal(later.window.dolphinIsInternalVisitor(), true);
  assert.equal(later.writes.some(value => value.startsWith('dc_internal=')), false);
  for (const name of ['centrifuge_contact_form', 'used_oil_landing_form', 'parts_request_form', 'disc_parts_glossary_form', 'used_alfa_laval_quote_form']) {
    const context = JSON.parse(later.window.dolphinGetAttributionForForm(name));
    assert.equal(context.internal, true);
    assert.equal(context.openai_ads.internal, true);
  }
  later.window.navigator.doNotTrack = '1';
  assert.equal(later.window.dolphinOpenAiConversionContext().internal, true);
  assert.equal(later.window.dolphinOpenAiConversionContext().allowed, false);
  delete later.window.dolphinOpenAiConversionContext;
  assert.equal(later.window.dolphinAttribution.getPayload('contact').openai_ads.internal, true);
  assert.equal(browser('?dc_internal=0').window.dolphinIsInternalVisitor(), false);
  assert.equal(browser().window.dolphinAttribution.getPayload('contact').internal, false);
});

test('Worker persists internal marker in visitor context from pageviews, intent events and cookie fallback', async () => {
  for (const event of ['pageview', 'form_start']) {
    for (const marker of ['payload', 'attribution', 'openai_ads', 'cookie', 'external']) {
      const writes = [];
      const db = { prepare(sql) { return { bind(...values) { this.values = values; return this; }, first: async () => null,
        run: async function () { writes.push({ sql, values: this.values }); return { success: true }; } }; } };
      const body = { event_type: event, internal: marker === 'payload', attribution: { visitor_id: 'test-visitor', session_id: 'test-session',
        internal: marker === 'attribution', openai_ads: { internal: marker === 'openai_ads' } } };
      const response = await worker.fetch(new Request('https://worker.example/track/' + (event === 'pageview' ? event : 'event'), {
        method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: marker === 'cookie' ? 'dc_internal=1' : '' }, body: JSON.stringify(body),
      }), { DB: db }, {});
      assert.equal(response.status, event === 'pageview' ? 200 : 204);
      const saved = writes.find(write => write.sql.includes('INSERT INTO visitor_events'));
      assert.equal(JSON.parse(saved.values[16]).internal, marker !== 'external');
    }
  }
});
