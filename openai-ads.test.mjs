import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { buildOpenAiAdsBootstrap } from './src/lib/openaiAds.mjs';

const config = { pixelId: 'test-pixel', allowedHosts: ['dolphincentrifuge.com', 'www.dolphincentrifuge.com'] };
function browser(host = 'dolphincentrifuge.com', navigator = {}) {
  const scripts = [];
  const window = { location: { hostname: host }, navigator };
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
  window.dolphinTrackOpenAiLead({ email: 'private@example.invalid', fluid_type: 'private' });
  const measured = JSON.parse(JSON.stringify(Array.from(window.oaiq.q[1])));
  assert.deepEqual(measured, ['measure', 'lead_created', { type: 'customer_action' }, { opt_out: true }]);
});

test('suppresses previews, localhost, missing configuration, and privacy opt-outs', () => {
  for (const host of ['localhost', '127.0.0.1', 'preview.pages.dev']) {
    assert.equal(browser(host).scripts.length, 0);
  }
  assert.equal(buildOpenAiAdsBootstrap({ ...config, pixelId: '' }), '');
  for (const privacy of [{ globalPrivacyControl: true }, { doNotTrack: '1' }]) {
    assert.equal(browser('dolphincentrifuge.com', privacy).scripts.length, 0);
  }
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
