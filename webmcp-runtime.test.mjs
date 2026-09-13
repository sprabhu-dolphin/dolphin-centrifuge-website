import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { build } from 'esbuild';
import { readFile } from 'node:fs/promises';
import { technicalCatalog } from './src/data/agentCatalog.mjs';

const { outputFiles } = await build({ entryPoints: ['src/scripts/dolphinWebMcp.ts'], bundle: true, write: false, format: 'iife', globalName: 'runtime' });
const code = outputFiles[0].text;
async function harness(register, fetcher) {
  const tools = new Map();
  let reads = 0;
  const context = vm.createContext({
    document: { modelContext: register === false ? undefined : { registerTool: async tool => {
      if (register) await register(tool);
      tools.set(tool.name, tool);
    } } },
    console: { warn() {} }, AbortSignal, AbortController,
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
  assert.equal(h.tools.size, 5);
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
