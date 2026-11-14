// Internal working notes (ruling ids, parked items, rejected candidate values,
// guard switches) live in src/data/centrifugeSpecs.ts and must never reach a
// public surface: the data files in dist, comments in built pages, the in-page
// WebMCP tool answers, or the remote MCP Worker's tool answers. Needs `npm run build`.
import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

import { models as internalModels } from './src/data/centrifugeSpecs.ts';
import { INTERNAL_CAPACITY_KEYS, INTERNAL_MODEL_KEYS, publicModels } from './src/data/publicSpecs.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
// DOLPHIN_DIST points the scan at another build, e.g. an older one, to see what it leaked.
const DIST = process.env.DOLPHIN_DIST ? path.resolve(process.env.DOLPHIN_DIST) : path.join(ROOT, 'dist');
const WORKER_DIR = path.join(ROOT, 'workers/dolphin-mcp');

/*
 * Chosen to match staff notes and nothing in customer copy. Deliberately NOT
 * listed: "owner" (the author's job title and the evidence class
 * first-party-owner-attestation), "Sanjay" (the named technical author),
 * "internal" ("internal bowl components"), "audit" ("auditable"), "rejected"
 * (minified promise code), "not published" (neutral copy such as "Exact prices
 * are not published") and "Claude" (AI-referrer detection names AI assistants).
 */
const INTERNAL_WORDING = [
  ['ruling', /\bruling/i],
  ['owner decision', /\bowner(?:'s)? (?:ruling|decision|approval|order)/i],
  ['rejectedValues', /rejectedValues/i],
  ['unpublishedFields', /unpublishedFields/i],
  ['skipPageAssert', /skipPageAssert/i],
  ['internalNote', /internalNote/i],
  ['modelsWithParkedFields', /modelsWithParkedFields/i],
  ['parked', /\bparked\b/i],
  ['TBD', /\btbd\b/i],
  ['worksheet', /\bworksheet\b/i],
  ['do not publish', /\bdo not publish/i],
  ['handoff', /\bhand-?off\b/i],
  ['Codex', /\bCodex\b/],
  // Worksheet ids used as a note prefix: "A20: ...", "A21/A23: ...", "R5-7 (ruled 2026-08-29): ...".
  ['worksheet id', /(?:^|[\s"'([])(?:[A-F]\d{1,2}|R5-\d{1,2})(?:\/[A-F]?\d{1,2})*(?: \([^)]*\))?:\s/],
];

/** Consumed by Cloudflare Pages and never served (both return 404 on the live site). */
const NOT_SERVED = new Set(['_redirects', '_headers']);
const BINARY = /\.(?:jpe?g|png|webp|gif|avif|ico|mp4|webm|pdf|woff2?|ttf|otf)$/i;

function findings(text, where) {
  return INTERNAL_WORDING.flatMap(([name, pattern]) => {
    const match = pattern.exec(text);
    return match ? [`${where}: ${name} -> ...${text.slice(Math.max(0, match.index - 50), match.index + 70).replace(/\s+/g, ' ')}...`] : [];
  });
}

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await walk(full));
    else out.push(full);
  }
  return out;
}

const rel = (file) => path.relative(DIST, file).split(path.sep).join('/');
const distFiles = await walk(DIST);

test('the detector catches the internal notes it guards against', () => {
  // Bare values (ruling ids, rejected numbers) are covered by their key names below; this measures the prose.
  const notes = internalModels.flatMap((model) => [
    ...(model.notes ?? []),
    ...(model.rejectedValues ?? []).map((item) => item.reason),
    ...model.capacities.map((capacity) => capacity.internalNote ?? ''),
  ]).filter(Boolean);
  assert.ok(notes.length > 100, 'internal notes still live in the source for the build guard');
  const caught = notes.filter((note) => findings(note, 'source').length).length;
  assert.ok(caught / notes.length > 0.6, `detector caught only ${caught} of ${notes.length} internal notes`);
  assert.ok(findings(JSON.stringify({ unpublishedFields: [], rejectedValues: [], tbd: true }), 'keys').length >= 3);
});

test('the public view drops every internal key and keeps every published field', () => {
  const internalKeys = new Set([...INTERNAL_MODEL_KEYS, ...INTERNAL_CAPACITY_KEYS]);
  assert.equal(publicModels.length, internalModels.length);
  publicModels.forEach((model, index) => {
    const source = internalModels[index];
    for (const key of Object.keys(model)) assert.ok(!internalKeys.has(key), `${model.id}.${key}`);
    for (const key of Object.keys(source)) {
      if (internalKeys.has(key)) continue;
      if (key === 'capacities') continue;
      assert.deepEqual(model[key], source[key], `${model.id}.${key}`);
    }
    model.capacities.forEach((capacity, i) => {
      for (const key of Object.keys(capacity)) assert.ok(!internalKeys.has(key), `${model.id}.capacities[${i}].${key}`);
      for (const key of Object.keys(source.capacities[i])) {
        if (!internalKeys.has(key)) assert.deepEqual(capacity[key], source.capacities[i][key], `${model.id}.capacities[${i}].${key}`);
      }
    });
  });
});

test('no publicly served data file carries internal wording', async () => {
  const data = distFiles.filter((file) => !file.endsWith('.html') && !BINARY.test(file) && !NOT_SERVED.has(rel(file)));
  assert.ok(data.some((file) => rel(file) === 'specs.json'));
  assert.ok(data.some((file) => rel(file) === 'technical-data/centrifuges.v1.json'));
  const problems = [];
  let scanned = 0;
  for (const file of data) {
    const bytes = await readFile(file);
    if (bytes.subarray(0, 4096).includes(0)) continue; // extensionless images
    scanned++;
    problems.push(...findings(bytes.toString('utf8'), rel(file)));
  }
  assert.ok(scanned > 60, `scanned ${scanned} data files`);
  assert.deepEqual(problems, []);
});

test('built pages carry no internal notes in HTML comments', async () => {
  const problems = [];
  for (const file of distFiles.filter((f) => f.endsWith('.html'))) {
    const html = await readFile(file, 'utf8');
    for (const [, comment] of html.matchAll(/<!--([\s\S]*?)-->/g)) problems.push(...findings(comment, rel(file)));
  }
  assert.deepEqual(problems, []);
});

/* ------------------------------------------------- in-page WebMCP tool answers */

const { outputFiles: pageBundle } = await build({ entryPoints: ['src/scripts/dolphinWebMcp.ts'], bundle: true, write: false, format: 'iife', globalName: 'runtime', logLevel: 'silent' });
const catalog = JSON.parse(await readFile(path.join(DIST, 'technical-data/centrifuges.v1.json'), 'utf8'));

async function pageTools() {
  const tools = new Map();
  const context = vm.createContext({
    document: { modelContext: { registerTool: async (tool) => { tools.set(tool.name, tool); } } },
    console: { warn() {} }, AbortSignal, AbortController,
    // Every in-page read is a same-origin GET of a built file.
    fetch: async (url) => {
      const file = path.join(DIST, decodeURIComponent(new URL(String(url), 'https://dolphincentrifuge.com').pathname));
      try {
        const body = await readFile(file, 'utf8');
        return { ok: true, json: async () => JSON.parse(body) };
      } catch {
        return { ok: false, json: async () => ({}) };
      }
    },
  });
  vm.runInContext(pageBundle[0].text, context);
  await context.runtime.registerDolphinWebMcpTools();
  return tools;
}

/** Every page of a paginated tool answer. */
async function allPages(tool, input) {
  const answers = [];
  let offset = 0;
  for (let i = 0; i < 80 && offset !== null && offset !== undefined; i++) {
    const answer = await tool.execute({ ...input, ...(offset ? { offset } : {}) });
    answers.push(answer);
    offset = answer?.page?.nextOffset;
  }
  return answers;
}

test('in-page WebMCP tool answers carry no internal wording, for every model', async () => {
  const tools = await pageTools();
  assert.ok(tools.size >= 9, `registered ${tools.size} tools`);
  const answers = [];
  for (const model of catalog.models) {
    answers.push(...await allPages(tools.get('get_centrifuge_specifications'), { model: model.id }));
    answers.push(...await allPages(tools.get('get_centrifuge_capacity'), { model: model.id }));
    answers.push(await tools.get('find_centrifuge_models').execute({ query: model.id }));
    answers.push(await tools.get('get_alfa_laval_published_figures').execute({ model: model.id }));
  }
  answers.push(...await allPages(tools.get('find_centrifuge_models'), {}));
  for (const application of ['diesel', 'marine diesel', 'HFO 380 cSt', 'lube oil', 'used oil', 'water']) {
    answers.push(...await allPages(tools.get('select_centrifuge_candidates'), { application, requiredFlow: 10, flowUnit: 'US GPM' }));
  }
  answers.push(...await allPages(tools.get('find_used_alfa_laval_centrifuges'), {}));
  answers.push(await tools.get('find_alfa_laval_centrifuges_in_stock').execute({}));
  answers.push(await tools.get('list_alfa_laval_published_documents').execute({}));
  answers.push(await tools.get('get_technical_author_identity').execute({}));

  const text = JSON.stringify(answers);
  assert.ok(answers.filter((answer) => answer?.status === 'ok').length > catalog.models.length, 'tools answered from the built data');
  assert.match(text, /16400/, 'published figures are present in the answers');
  assert.deepEqual(findings(text, 'in-page tools'), []);
});

/* ---------------------------------------------------- remote MCP Worker answers */

const workerReady = await access(path.join(WORKER_DIR, 'node_modules/@modelcontextprotocol/sdk')).then(() => true, () => false);

async function loadWorker() {
  const { outputFiles } = await build({
    entryPoints: [path.join(WORKER_DIR, 'src/index.js')],
    bundle: true, write: false, format: 'esm', platform: 'neutral', mainFields: ['module', 'main'],
    conditions: ['workerd', 'worker', 'import'], logLevel: 'silent',
  });
  return (await import(`data:text/javascript;base64,${Buffer.from(outputFiles[0].text).toString('base64')}`)).default;
}

async function rpc(worker, method, params) {
  const response = await worker.fetch(new Request('http://127.0.0.1/mcp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  }), {});
  assert.equal(response.status, 200, method);
  return (await response.json()).result;
}

test('remote MCP Worker answers carry no internal wording, for every model', { skip: !workerReady && 'workers/dolphin-mcp dependencies are not installed' }, async () => {
  const worker = await loadWorker();
  const init = await rpc(worker, 'initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'leak-test', version: '1' } });
  const { tools } = await rpc(worker, 'tools/list', {});
  const texts = [JSON.stringify(init), JSON.stringify(tools)];
  const call = async (name, args) => {
    const result = await rpc(worker, 'tools/call', { name, arguments: args });
    texts.push(result.content[0].text);
  };
  // request_quote is never called: it is the one tool that sends.
  for (const model of publicModels) {
    for (const term of new Set([model.designation, model.id, ...(model.aliases ?? [])])) await call('get_centrifuge_specs', { model: term });
    await call('get_alfa_laval_published_figures', { model: model.designation });
    await call('check_dolphin_stock', { model: model.designation });
  }
  for (const args of [{}, { type: 'disc stack' }, { type: 'decanter' }, { application: 'diesel' }, { application: 'coolant' }, { application: 'wastewater' }]) await call('list_centrifuge_models', args);
  await call('check_dolphin_stock', {});
  await call('size_centrifuge', { bowl_diameter_m: 0.4064, rpm: 6000 });
  await call('list_alfa_laval_published_documents', {});

  const text = texts.join('\n');
  assert.match(text, /MAPX 210/);
  assert.match(text, /Fluid not specified/, 'the MAPX 210 capacity keeps its figure with a neutral fluid label');
  assert.deepEqual(findings(text, 'Worker tools'), []);
});
