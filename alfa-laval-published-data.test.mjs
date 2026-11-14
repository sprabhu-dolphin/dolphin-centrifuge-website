// Alfa Laval published figures: the served JSON, the shared lookups and the remote MCP
// server tools (workers/dolphin-mcp), exercised through real JSON-RPC calls in process.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

import {
  GET_FIGURES_DESCRIPTION,
  LIST_DOCUMENTS_DESCRIPTION,
  NOT_OFFERED,
  findPublishedDocument,
  findPublishedMachine,
  lookupPublishedFigures,
} from './src/lib/alfaLavalPublishedData.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(ROOT, 'src/data/alfa-laval-published-data.v1.json');
const DIST_FILE = path.join(ROOT, 'dist/technical-data/alfa-laval-published-data.v1.json');
const WORKER_DIR = path.join(ROOT, 'workers/dolphin-mcp');
// SHA-256 of the audited source export; the served file must match it byte for byte.
const SOURCE_SHA256 = '2e204051fc5fee5b43d09ca4f8b0c49c8c29c76a6d564901f071389b6d92508d';
const FORBIDDEN = /\\|\.pdf|scan|unverified|confirmed|handwritten|food|beverage|dairy|sanitary/i;
const NOTICE = /as printed by Alfa Laval in the named document, units as printed, not Dolphin measurements, guarantees or ratings; nothing is converted or calculated/;

const raw = await readFile(DATA_FILE);
const data = JSON.parse(raw.toString('utf8'));
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

async function exists(target) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

/** Every key and string value in a tool answer. */
function strings(value, out = []) {
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) value.forEach((item) => strings(item, out));
  else if (value && typeof value === 'object') for (const [key, item] of Object.entries(value)) { out.push(key); strings(item, out); }
  return out;
}

function assertClean(answer, label) {
  for (const text of strings(answer)) assert.doesNotMatch(text, FORBIDDEN, `${label}: ${text}`);
}

/** The forms people type for each covered machine. */
function typedForms(machine) {
  const forms = [machine.name, machine.model_label, machine.name.replace(' ', '-'), machine.name.toLowerCase(), machine.model_label.toLowerCase()];
  if (machine.printed_type) forms.push(machine.printed_type, machine.printed_type.toLowerCase());
  return forms;
}

/** Returned documents carry every printed value unchanged, and a withheld cell only as "not offered". */
function assertMatchesSource(machine, documents) {
  assert.equal(documents.length, machine.documents.length, machine.model_label);
  machine.documents.forEach((sourceDoc, d) => {
    const doc = documents[d];
    assert.equal(doc.document, sourceDoc.document);
    assert.equal(doc.documentNumber, sourceDoc.document_number);
    assert.equal(doc.documentDate, sourceDoc.document_date);
    assert.match(doc.source, /^Alfa Laval, /);
    assert.ok(doc.source.includes(sourceDoc.document_number));
    assert.ok(doc.source.includes(sourceDoc.document_date ?? 'date not given'));
    assert.equal(doc.sections.length, sourceDoc.sections.length);
    sourceDoc.sections.forEach((sourceSection, s) => {
      const section = doc.sections[s];
      assert.equal(section.heading, sourceSection.heading);
      assert.deepEqual(section.columns, sourceSection.columns);
      assert.deepEqual(section.units, sourceSection.units);
      assert.equal(section.withheld, sourceSection.withheld);
      let withheld = 0;
      sourceSection.rows.forEach((sourceRow, r) => {
        const row = section.rows[r];
        assert.equal(row.row, sourceRow.row);
        assert.deepEqual(Object.keys(row.values), Object.keys(sourceRow.values));
        for (const [column, value] of Object.entries(sourceRow.values)) {
          if (value === null) {
            withheld++;
            assert.equal(row.values[column], NOT_OFFERED, `${machine.model_label} ${sourceRow.row} ${column}`);
            assert.ok(row.notOffered.includes(column));
          } else {
            assert.equal(row.values[column], value, `${machine.model_label} ${sourceRow.row} ${column}`);
          }
        }
        if (!Object.values(sourceRow.values).includes(null)) assert.equal(row.notOffered, undefined);
      });
      assert.equal(withheld, sourceSection.withheld, `${machine.model_label} ${sourceSection.heading} withheld count`);
    });
    if (sourceDoc.statements) assert.deepEqual(doc.statements, sourceDoc.statements);
  });
}

function cell(documents, heading, rowLabel, column) {
  const section = documents.flatMap((doc) => doc.sections).find((candidate) => candidate.heading === heading);
  return section.rows.find((row) => row.row === rowLabel).values[column];
}

test('the served dataset is the audited export, byte for byte, with CRLF kept', async (t) => {
  assert.equal(sha256(raw), SOURCE_SHA256);
  assert.equal(data.schema, 'dolphin.alfa-laval-published-data.v1');
  assert.equal(data.documents.length, 6);
  assert.equal(data.machines.length, 11);
  const gitattributes = await readFile(path.join(ROOT, '.gitattributes'), 'utf8');
  assert.match(gitattributes, /^src\/data\/alfa-laval-published-data\.v1\.json -text$/m);
  if (!(await exists(DIST_FILE))) {
    t.skip('dist does not exist; the built-file check runs after npm run build');
    return;
  }
  assert.equal(sha256(await readFile(DIST_FILE)), SOURCE_SHA256);
  const sitemaps = await readFile(path.join(ROOT, 'dist/sitemap-0.xml'), 'utf8');
  assert.ok(!sitemaps.includes('alfa-laval-published-data'), 'agent data stays out of the sitemap');
});

test('shared lookup accepts every typed model form and keeps every printed value', () => {
  for (const machine of data.machines) {
    for (const form of typedForms(machine)) {
      assert.equal(findPublishedMachine(data, form)?.model_label, machine.model_label, form);
      const answer = lookupPublishedFigures(data, { model: form });
      assert.equal(answer.status, 'ok', form);
      assert.equal(answer.machine.model, machine.name);
      assertMatchesSource(machine, answer.documents);
      assertClean(answer, form);
    }
  }
  for (const unknown of ['MAB 103', 'MOPX 208', 'WHPX 513', 'MAB 204X', 'MAB 2045', '']) {
    assert.equal(lookupPublishedFigures(data, { model: unknown }).status, 'not_found', unknown);
  }
  assert.equal(findPublishedDocument(data, 'TD S93303E')?.id, 'alfa-laval-td-s93303e');
  assert.equal(findPublishedDocument(data, 'S93306E')?.id, 'alfa-laval-td-s93306e');
  assert.equal(findPublishedDocument(data, 'MPCO 20-00-02')?.id, 'alfa-laval-mpco-20-00-02');
  assert.equal(lookupPublishedFigures(data, { model: 'MAB 204', document: 'MPCO 20-00-02' }).status, 'document_not_found');
});

const workerReady = await exists(path.join(WORKER_DIR, 'node_modules/@modelcontextprotocol/sdk'));

async function loadWorker() {
  const { outputFiles } = await build({
    entryPoints: [path.join(WORKER_DIR, 'src/index.js')],
    bundle: true, write: false, format: 'esm', platform: 'neutral', mainFields: ['module', 'main'],
    conditions: ['workerd', 'worker', 'import'], logLevel: 'silent',
  });
  const code = Buffer.from(outputFiles[0].text).toString('base64');
  return (await import(`data:text/javascript;base64,${code}`)).default;
}

async function rpc(worker, method, params, id = 1) {
  const response = await worker.fetch(new Request('http://127.0.0.1/mcp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' },
    body: JSON.stringify({ jsonrpc: '2.0', id, method, params }),
  }), {});
  assert.equal(response.status, 200, method);
  return (await response.json()).result;
}

async function callTool(worker, name, args) {
  const result = await rpc(worker, 'tools/call', { name, arguments: args });
  return { isError: Boolean(result.isError), answer: JSON.parse(result.content[0].text) };
}

test('remote MCP server lists both read-only tools and answers from the same file', { skip: !workerReady && 'workers/dolphin-mcp dependencies are not installed' }, async () => {
  const worker = await loadWorker();
  const { tools } = await rpc(worker, 'tools/list', {});
  const names = tools.map((tool) => tool.name);
  for (const name of ['get_centrifuge_specs', 'list_centrifuge_models', 'check_dolphin_stock', 'size_centrifuge', 'request_quote']) assert.ok(names.includes(name), name);
  const list = tools.find((tool) => tool.name === 'list_alfa_laval_published_documents');
  const get = tools.find((tool) => tool.name === 'get_alfa_laval_published_figures');
  assert.equal(list.description, LIST_DOCUMENTS_DESCRIPTION);
  assert.equal(get.description, GET_FIGURES_DESCRIPTION);
  for (const tool of [list, get]) {
    assert.match(tool.description, NOTICE);
    assert.equal(tool.annotations.readOnlyHint, true);
    assert.equal(tool.annotations.destructiveHint, false);
    assertClean(tool, tool.name);
  }
  assert.deepEqual(get.inputSchema.required, ['model']);
  assert.deepEqual(Object.keys(get.inputSchema.properties).sort(), ['document', 'model']);

  const documents = await callTool(worker, 'list_alfa_laval_published_documents', {});
  assert.equal(documents.isError, false);
  assert.equal(documents.answer.count, 6);
  assert.deepEqual(documents.answer.documents.map((doc) => doc.documentNumber), data.documents.map((doc) => doc.document_number));
  assert.deepEqual(documents.answer.documents.at(-1).machines, ['MAPX 204', 'MOPX 205', 'MOPX 207', 'MOPX 209', 'MOPX 210', 'MOPX 213']);
  assertClean(documents.answer, 'list');

  for (const machine of data.machines) {
    for (const form of typedForms(machine)) {
      const { isError, answer } = await callTool(worker, 'get_alfa_laval_published_figures', { model: form });
      assert.equal(isError, false, form);
      assert.equal(answer.found, 1, form);
      assert.equal(answer.machine.model, machine.name, form);
      assert.equal(answer.basis, data.basis);
      assertMatchesSource(machine, answer.documents);
      assertClean(answer, form);
    }
  }

  const mab205 = (await callTool(worker, 'get_alfa_laval_published_figures', { model: 'MAB 205S' })).answer;
  assert.equal(cell(mab205.documents, 'Solids space', 'Solids space', 'dm3'), NOT_OFFERED);
  const mab207 = (await callTool(worker, 'get_alfa_laval_published_figures', { model: 'MAB-207' })).answer;
  assert.equal(cell(mab207.documents, 'Capacity: recommended max. throughput', 'Insulating oil', 'U.K.gal/h'), NOT_OFFERED);

  const scoped = (await callTool(worker, 'get_alfa_laval_published_figures', { model: 'MOPX 207', document: 'MPCO 20-00-02' })).answer;
  assert.equal(scoped.found, 1);
  const wrongDocument = (await callTool(worker, 'get_alfa_laval_published_figures', { model: 'MOPX 207', document: 'TD S93303E' })).answer;
  assert.equal(wrongDocument.found, 0);

  const unknown = await callTool(worker, 'get_alfa_laval_published_figures', { model: 'WHPX 513' });
  assert.equal(unknown.isError, false);
  assert.equal(unknown.answer.found, 0);
  assert.equal(unknown.answer.coveredMachines.length, 11);
  assert.match(unknown.answer.message, /^No Alfa Laval published figures for "WHPX 513"\. Covered machines: MAB 204, .*MOPX 213\./);
  assertClean(unknown.answer, 'unknown');

  const existing = await callTool(worker, 'get_centrifuge_specs', { model: 'MOPX 207' });
  assert.equal(existing.answer.found, 1, 'existing tools keep answering');
});
