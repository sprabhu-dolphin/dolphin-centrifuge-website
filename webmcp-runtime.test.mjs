import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { build } from 'esbuild';
import { readFile } from 'node:fs/promises';
import { technicalCatalog } from './src/data/agentCatalog.mjs';

const { outputFiles } = await build({ entryPoints: ['src/scripts/dolphinWebMcp.ts'], bundle: true, write: false, format: 'iife', globalName: 'runtime' });
const code = outputFiles[0].text;
async function harness(register, fetcher, documentExtras = {}, globals = {}) {
  const tools = new Map();
  let reads = 0;
  const context = vm.createContext({
    document: { ...documentExtras, modelContext: register === false ? undefined : { registerTool: async tool => {
      if (register) await register(tool);
      tools.set(tool.name, tool);
    } } },
    console: { warn() {} }, AbortSignal, AbortController, ...globals,
    fetch: async (...args) => {
      reads++;
      return fetcher ? fetcher(...args) : { ok: true, json: async () => technicalCatalog };
    },
  });
  vm.runInContext(code, context);
  await context.runtime.registerDolphinWebMcpTools();
  return { context, tools, reads: () => reads };
}

test('unsupported browsers remain usable and do not fetch data', async () => {
  const h = await harness(false);
  assert.equal(await h.context.runtime.registerDolphinWebMcpTools(), false);
  assert.equal(h.reads(), 0);
});

test('partial registration failures recover without duplicate registrations', async () => {
  const attempts = new Map();
  const h = await harness(tool => {
    const n = (attempts.get(tool.name) ?? 0) + 1;
    attempts.set(tool.name, n);
    if (tool.name === 'get_centrifuge_capacity' && n === 1) throw Error('temporary failure');
  });
  assert.equal(await h.context.runtime.registerDolphinWebMcpTools(), true);
  assert.equal(h.tools.size, 6);
  assert.ok(h.tools.has('find_used_alfa_laval_centrifuges'));
  assert.ok(!h.tools.has('prepare_used_alfa_laval_quote'), 'quote tool registers only on the page with the quote form');
  assert.equal(attempts.get('get_centrifuge_capacity'), 2);
  assert.equal(attempts.get('find_centrifuge_models'), 1);
});

test('runtime validates required fields, types, enum, unknown keys, length and offsets before fetch', async () => {
  const h = await harness();
  const capacity = h.tools.get('get_centrifuge_capacity');
  for (const input of [null, [], {}, {model: ' '}, {model: 5}, {model: 'x'.repeat(201)}, {model: 'MAB 103', url: 'https://example.com'}, {model: 'MAB 103', offset: -1}, {model: 'MAB 103', offset: 1.5}]) {
    assert.equal((await capacity.execute(input)).status, 'invalid_input');
  }
  assert.equal((await h.tools.get('find_centrifuge_models').execute({recordType: 'made-up'})).status, 'invalid_input');
  assert.equal((await h.tools.get('get_technical_author_identity').execute({secret: 'x'})).status, 'invalid_input');
  assert.equal(h.reads(), 0);
});

test('pagination keeps all models and complete capacity qualifiers without fabricating ratings', async () => {
  const h = await harness();
  const ids = [];
  let offset = 0;
  do {
    const result = await h.tools.get('find_centrifuge_models').execute({offset});
    ids.push(...result.data.models.map(m => m.id));
    assert.ok(JSON.stringify(result).length < 1500);
    offset = result.page.nextOffset;
  } while (offset !== null);
  assert.equal(new Set(ids).size, technicalCatalog.models.length);
  const tool = h.tools.get('get_centrifuge_capacity');
  const marine = await tool.execute({model: 'WHPX 513', fluid: 'marine diesel'});
  assert.equal(marine.data.capacities[0].sourceValue.value, 16400);
  assert.equal(marine.data.capacities[0].conditions.centrifugationTemperatureC, 40);
  assert.equal(marine.data.capacities[0].ratingBasis, 'oem-application');
  assert.ok(marine.sourceUrl.endsWith('/alfa-laval-whpx-513.json'));
  assert.equal((await tool.execute({model: 'DMPX-070'})).status, 'ambiguous');
  assert.equal((await tool.execute({model: 'WHPX 513', fluid: 'water'})).status, 'not_found');
  assert.equal((await tool.execute({model: 'WHPX 513', offset: 999})).status, 'invalid_input');
  assert.equal(h.reads(), 1);
});

test('cancellation rejects even when cached; failed fetch can be retried', async () => {
  let fail = true;
  const h = await harness(undefined, async () => {
    if (fail) return {ok: false};
    return {ok: true, json: async () => technicalCatalog};
  });
  const tool = h.tools.get('find_centrifuge_models');
  assert.equal((await tool.execute({})).status, 'unavailable');
  fail = false;
  assert.equal((await tool.execute({})).status, 'ok');
  const ac = new AbortController(); ac.abort();
  await assert.rejects(tool.execute({}, {signal: ac.signal}), {name: 'AbortError'});
});

test('quote form preserves visitor submission and reports actual asynchronous completion', async () => {
  const source = await readFile('src/pages/contact-for-alfa-laval-centrifuges.astro', 'utf8');

  assert.doesNotMatch(source, /toolautosubmit/);
  assert.match(source, /e.respondWith\(completion\)/);
  assert.match(source, /response.ok && result.success/);
});

test('quote submission responds only after server confirmation and prevents concurrent duplicates', async () => {
  const source = await readFile('src/pages/contact-for-alfa-laval-centrifuges.astro', 'utf8');
  const handler = source.slice(source.indexOf('      let inquiryPending'), source.indexOf('    })();', source.indexOf('      let inquiryPending')));
  const element = { value: 'fixture', classList: {add() {}, remove() {}}, scrollIntoView() {}, focus() {} };
  let onSubmit, finish, calls = 0, reset = 0;
  let invalid = false;
  const context = vm.createContext({
    form: { addEventListener: (_, fn) => { onSubmit = fn; }, querySelector: () => element, reset: () => { reset++; } },
    validateRequired: () => ({anyEmpty: invalid, firstInvalid: element}),
    errorText: {}, errorMsg: element, submitBtn: {}, submitBtnText: element, submitBtnLoading: element,
    window: {}, document: {getElementById: () => element},
    FormData: class { append() {} }, WORKER_URL: 'https://example.invalid/test-only',
    fetch: () => { calls++; return new Promise(resolve => { finish = resolve; }); },
    getFluidRedirect: () => '/diesel-centrifuge/', showSuccessToast: url => assert.equal(url, null),
    REQUIRED_IDS: [], REQUIRED_RADIO_GROUPS: [], countrySelect: null,
    clearFieldError() {}, clearRadioGroupError() {}, markFieldError() {},
  });
  vm.runInContext(handler, context);
  function submit() {
    let completion;
    onSubmit({agentInvoked: true, preventDefault() {}, respondWith(p) { completion = p; }});
    assert.ok(completion, 'respondWith must be called synchronously');
    return completion;
  }
  invalid = true;
  assert.equal((await submit()).status, 'invalid_input');
  assert.equal(calls, 0);
  invalid = false;
  const first = submit();
  assert.equal((await submit()).status, 'pending');
  assert.equal(calls, 1);
  assert.equal(reset, 0);
  finish({ok: true, json: async () => ({success: true})});
  assert.equal((await first).status, 'submitted');
  assert.equal(reset, 1);
  const failed = submit();
  finish({ok: false, json: async () => ({success: false, error: 'Test failure'})});
  assert.equal((await failed).status, 'unconfirmed');
  assert.equal(reset, 1, 'failure preserves the visitor form');
});

test('author result retains credential qualifications and malformed catalogs stay unavailable', async () => {
  const author = JSON.parse(await readFile('dist/authors/sanjay-prabhu.json', 'utf8'));
  const h = await harness(undefined, async () => ({ok: true, json: async () => author}));
  const result = await h.tools.get('get_technical_author_identity').execute({});
  assert.equal(result.data.name, 'Sanjay Prabhu');
  assert.equal(result.data.credential.displayedConferralYear, null);
  assert.ok(JSON.stringify(result).length < 1500);
  assert.equal((await h.tools.get('find_centrifuge_models').execute({})).status, 'unavailable');
});

const { buildUsedOfferRecord } = await import('./src/data/usedAlfaLavalOffer.mjs');
const usedOffer = JSON.parse(JSON.stringify(buildUsedOfferRecord()));
const routeFetch = async (url) => ({ ok: true, json: async () => (String(url).includes('used-alfa-laval') ? usedOffer : technicalCatalog) });

test('used Alfa Laval finder filters families, pages results and adds a documented flow shortlist', async () => {
  const h = await harness(undefined, routeFetch);
  const find = h.tools.get('find_used_alfa_laval_centrifuges');
  assert.equal(find.annotations.readOnlyHint, true);

  const diesel = await find.execute({application: 'diesel'});
  assert.equal(diesel.status, 'ok');
  assert.deepEqual(diesel.data.families.map(f => f.key), ['whpx', 'mopx', 'mab']);
  assert.match(diesel.data.offer, /6-month mechanical warranty/);
  assert.match(diesel.data.offer, /150\+ centrifuges in stock/);
  assert.match(diesel.data.price, /^Smallest manual-clean skid from mid-\$30s; /);
  assert.match(diesel.data.offer, /price confirmed per quote/);
  assert.equal(diesel.data.families[0].models, 'WHPX 405, WHPX 407, WHPX 409, WHPX 510, WHPX 513');
  assert.equal(diesel.sources[0], '/technical-data/used-alfa-laval-centrifuges.v1.json', 'links the full offer data');
  assert.equal(diesel.data.quote.tool, 'prepare_used_alfa_laval_quote');
  assert.ok(JSON.stringify(diesel).length <= 1500, `default output is ${JSON.stringify(diesel).length} chars`);
  assert.ok(JSON.stringify(await find.execute({})).length <= 1500);

  const all = [];
  let offset = 0;
  do {
    const page = await find.execute({offset});
    all.push(...page.data.families.map(f => f.key));
    offset = page.page.nextOffset;
  } while (offset !== null);
  assert.deepEqual(all, usedOffer.families.map(f => f.key));

  const manual = await find.execute({cleaning: 'manual'});
  assert.deepEqual(manual.data.families.map(f => f.key), ['mab']);

  const sized = await find.execute({application: 'diesel', fluid: 'diesel', requiredFlow: 10, flowUnit: 'US GPM', cleaning: 'manual'});
  assert.equal(sized.data.flowSizing.status, 'candidate');
  assert.equal(sized.data.flowSizing.candidate.modelId, 'alfa-laval-mab-204');
  assert.equal(sized.data.flowSizing.candidate.reconditionedFamily, 'mab');

  assert.equal((await find.execute({requiredFlow: 10, flowUnit: 'US GPM'})).status, 'invalid_input');
  assert.equal((await find.execute({application: 'milk'})).status, 'invalid_input');
  assert.equal((await find.execute({offset: 99})).status, 'invalid_input');
});

test('used Alfa Laval finder reports unavailable data instead of inventing an answer', async () => {
  const h = await harness(undefined, async () => ({ok: false}));
  assert.equal((await h.tools.get('find_used_alfa_laval_centrifuges').execute({})).status, 'unavailable');
});

function fakeQuotePage({token = ''} = {}) {
  const fields = {};
  const field = (name, value = '') => (fields[name] ??= {name, value, dispatchEvent() {}, focus() { focused = name; }});
  let focused;
  for (const name of ['name', 'company', 'email', 'phone', 'fluid', 'flowRate', 'country', 'preferredContact', 'modelInterest', 'details', 'bot-field']) field(name);
  field('cf-turnstile-response', token);
  const messages = {error: {hidden: true, textContent: ''}, success: {hidden: true, textContent: ''}};
  const button = {disabled: false, focus() { focused = 'submit'; }};
  let resets = 0;
  let scrolled = 0;
  const form = {
    dataset: {endpoint: 'https://worker.test.invalid'},
    querySelector(selector) {
      const name = selector.match(/\[name="([^"]+)"\]/)?.[1];
      if (name) return fields[name] ?? null;
      if (selector === '[data-quote-error]') return messages.error;
      if (selector === '[data-quote-success]') return messages.success;
      if (selector === 'button[type="submit"]') return button;
      return null;
    },
    scrollIntoView() { scrolled++; },
    reset() { resets++; for (const f of Object.values(fields)) f.value = ''; },
  };
  const posts = [];
  const globals = {
    Event: class { constructor(type) { this.type = type; } },
    CustomEvent: class { constructor(type, init) { this.type = type; this.detail = init?.detail; } },
    FormData, location: {pathname: '/used-alfa-laval-centrifuges-for-sale/'},
    dispatchEvent() {},
  };
  const fetcher = async (url, init) => {
    if (init?.method === 'POST') posts.push({url});
    return routeFetch(url);
  };
  return {form, fields, posts, globals, fetcher,
    documentExtras: {getElementById: id => (id === 'used-alfa-laval-quote-form' ? form : null)},
    focused: () => focused, scrolled: () => scrolled, resets: () => resets};
}

const agentQuote = {name: 'Ada Lovelace', company: 'Analytical Oil LLC', email: 'ada@example.com', phone: '+1 313 555 0100',
  fluid: 'Waste oil', flowRate: '20 US GPM', country: 'Canada', preferredContact: 'phone_dolphin_calls', modelInterest: 'WHPX 513'};

test('quote tool exists only with the form, fills every visible field and never submits', async () => {
  const page = fakeQuotePage({token: 'turnstile-token'});
  const h = await harness(undefined, page.fetcher, page.documentExtras, page.globals);
  const quote = h.tools.get('prepare_used_alfa_laval_quote');
  assert.equal(h.tools.size, 7);
  assert.ok(!h.tools.has('request_used_alfa_laval_quote'));
  assert.equal(quote.annotations.consequentialHint, false);
  assert.equal(quote.annotations.readOnlyHint, false);
  assert.ok(quote.description.length <= 500);

  const partial = await quote.execute({name: 'Ada Lovelace', fluid: 'Waste oil'});
  assert.equal(partial.status, 'prepared');
  assert.equal(partial.submitted, false);
  assert.deepEqual([...partial.missingFields], ['company', 'email', 'phone']);
  assert.equal(page.focused(), 'company');

  const result = await quote.execute(JSON.stringify(agentQuote));
  assert.equal(result.status, 'prepared', 'a JSON string input from older Chrome builds is accepted');
  assert.equal(result.missingFields.length, 0);
  assert.match(result.message, /visitor reviews it and clicks Send Quote Request/);
  assert.equal(page.focused(), 'submit');
  assert.ok(page.scrolled() >= 2);
  for (const [name, value] of Object.entries(agentQuote)) assert.equal(page.fields[name].value, value, `${name} is visible`);
  assert.equal(page.form.dataset.agentPrepared, 'true');
  assert.equal(page.posts.length, 0, 'the tool never posts the form');
  assert.equal(page.resets(), 0);

  assert.equal((await quote.execute({...agentQuote, url: 'https://example.com'})).status, 'invalid_input');
  assert.equal((await quote.execute({...agentQuote, preferredContact: 'fax'})).status, 'invalid_input');
  assert.equal((await quote.execute('not json')).status, 'invalid_input');
});
