// Machine data sheets: the public JSON, the two tools (Worker and page share one module),
// the content filters, and Worker/page parity. Runs on source and the generated public file.
import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { build } from 'esbuild';
import { readFile } from 'node:fs/promises';

import {
  closestModels, getMachineDatasheet, GET_DATASHEET_DESCRIPTION, GET_DATASHEET_TOOL, LIST_MACHINES_DESCRIPTION,
  LIST_MACHINES_TOOL, listMachines, normalizeModelName,
} from './src/lib/machineDatasheets.mjs';
import { getMachineDatasheetTool, listMachinesTool, machineDatasheetData } from './workers/dolphin-mcp/src/machineDatasheets.js';
import { checkDolphinStock, getCentrifugeSpecs, listCentrifugeModels, sizeCentrifuge } from './workers/dolphin-mcp/src/catalog.js';
import { getAlfaLavalPublishedFigures, listAlfaLavalPublishedDocuments } from './workers/dolphin-mcp/src/alfaLavalPublished.js';

const FILE = 'public/technical-data/machine-datasheets.v1.json';
const raw = await readFile(FILE, 'utf8');
const data = JSON.parse(raw);
const sheet = (model) => getMachineDatasheetTool({ model });

test('public file shape: schema, date, independence, index matches records', () => {
  assert.equal(data.schemaVersion, '1');
  assert.equal(data.generated, '2026-11-20');
  assert.match(data.source, /machine data sheet library/);
  assert.match(data.independence, /independent of Alfa Laval/);
  assert.equal(data.stockListDate, '2025-12-09');
  const ids = Object.keys(data.machines);
  assert.equal(data.index.length, ids.length);
  assert.ok(ids.length >= 80);
  for (const e of data.index) {
    const m = data.machines[e.id];
    assert.ok(m, e.id);
    assert.equal(e.figureCount, m.figures.length, e.id);
    assert.equal(e.model, m.model);
    assert.ok(m.stock && Number.isInteger(m.stock.listings) && Number.isInteger(m.stock.readyBuiltUnits) && Number.isInteger(m.stock.builtToOrderUnits), e.id);
    assert.ok(m.credit && /independent/.test(m.credit));
    for (const f of m.figures) {
      assert.ok(f.group && f.label && f.value !== undefined && f.unit !== undefined && f.quote && f.source?.document, `${e.id} figure`);
    }
  }
});

test('banned wording, paths and the dropped machine never appear in the public file', () => {
  const BANNED = /\b(food\w*|beverage\w*|dairy|brew\w*|beer\w*|wines?|juices?|edible\w*|biotech\w*|cell[\s-]+harvest\w*|harvest\w*|ferment\w*|pharma\w*|sanitary|hygien\w*|milk\w*|human[\s-]+consumption)\b/i;
  const hit = raw.match(BANNED);
  assert.equal(hit, null, `banned word in public file: ${hit?.[0]}`);
  assert.doesNotMatch(raw, /N:\\|C:\\|[A-Za-z]:\/|source_path|\\\\|BREW/i);
  assert.doesNotMatch(raw, /\b(part numbers?|spare parts?|prices?|pricing|drawings?|scans?)\b/i);
  assert.ok(!data.machines['alfa-laval-brew-300'] && !data.index.some((e) => /brew/i.test(e.model)));
  for (const k of ['reader', 'crop', 'bbox', 'audit', 'source_path', 'labelBasis', 'unitNote']) assert.ok(!raw.includes(`"${k}":`), k);
});

test('normalisation: lower case, drops Alfa Laval, spaces, hyphens, dots', () => {
  for (const n of ['MOPX 207', 'mopx-207', 'MOPX.207', 'Alfa Laval MOPX 207', 'alfa-laval-mopx-207', ' MOPX207 ']) assert.equal(normalizeModelName(n), 'mopx207', n);
});

test('get_machine_datasheet: exact name, alias, other spellings', () => {
  for (const q of ['MOPX 207', 'MOPX207', 'mopx-207', 'Alfa Laval MOPX 207', 'alfa-laval-mopx-207']) {
    const r = sheet(q);
    assert.equal(r.status, 'ok', q);
    assert.equal(r.machine.id, 'alfa-laval-mopx-207');
  }
  assert.equal(sheet('LAPX-404').machine.id, 'alfa-laval-lapx-404');
  assert.equal(sheet('LAPX 404').machine.id, 'alfa-laval-lapx-404');
  const mab = sheet('MAB 204S');
  assert.equal(mab.status, 'ok');
  assert.equal(mab.machine.id, 'alfa-laval-mab-204');
  assert.equal(sheet('WHPX 510TGD-20').machine.id, 'alfa-laval-whpx-510');
  assert.equal(sheet('MOPX 2077').status, 'not_found', 'a longer number is not a suffix');
});

test('get_machine_datasheet: a bare family returns the list of models, not one machine', () => {
  const r = sheet('MOPX');
  assert.equal(r.status, 'family');
  assert.equal(r.machine, undefined);
  assert.ok(r.models.length >= 5);
  assert.ok(r.models.every((m) => /^MOPX \d{3}$/.test(m.model)));
  assert.ok(r.models.some((m) => m.model === 'MOPX 207'));
});

test('get_machine_datasheet: a variant name returns the machine with figures tagged by variant', () => {
  const r = sheet('MOPX 207SGT');
  assert.equal(r.status, 'ok');
  assert.equal(r.machine.id, 'alfa-laval-mopx-207');
  assert.ok(r.match.variants.length >= 1);
  assert.match(r.match.variantNote, /variant/);
  assert.ok(r.machine.figures.some((f) => f.variant === 'MOPX 207SGT'));
  const whole = sheet('WHPX 510TGD');
  assert.ok(whole.match.variants.includes('WHPX 510TGD'));
});

test('get_machine_datasheet: no match returns the closest models, never an empty error', () => {
  for (const q of ['MOPX 208', 'MOPX 999', 'banana', 'WHPX 999']) {
    const r = sheet(q);
    assert.equal(r.status, 'not_found', q);
    assert.ok(r.closest.length >= 3, q);
    assert.match(r.message, /closest/);
    assert.equal(r.isError, undefined);
  }
  assert.equal(sheet('MOPX 208').closest[0].model.slice(0, 4), 'MOPX');
  assert.equal(closestModels(machineDatasheetData, 'whpx 51').length, 5);
  assert.equal(sheet('').status, 'invalid_input');
  assert.equal(sheet('food').status, 'no_suitability_statement');
});

test('MOPX 207 carries the printed diesel figure with its Alfa Laval document', () => {
  const m = sheet('MOPX 207').machine;
  assert.equal(m.maker, 'Alfa Laval');
  assert.equal(m.type, 'disc stack, self-cleaning');
  const diesel = m.figures.find((f) => f.group === 'capacity' && /Marine diesel oil, viscosity 13 cSt\/40 °C, centr\. temp\. 40 °C/.test(f.condition ?? ''));
  assert.ok(diesel, 'marine diesel capacity row');
  assert.equal(diesel.value, '5000');
  assert.equal(diesel.unit, 'l/h');
  assert.match(diesel.source.document, /MPCO 20-00-02/);
  assert.match(diesel.quote, /5000 l\/h/);
  assert.match(diesel.quote, /Alfa Laval MPCO 20-00-02/);
  const rated = m.figures.find((f) => f.label === 'Rated capacity' && f.condition === null);
  assert.equal(rated.note, 'not an application capacity', 'a rated capacity stays fluid-less');
  assert.ok(m.documents.some((d) => /MPCO 20-00-02/.test(d.number)));
  assert.ok(m.figures.some((f) => f.group === 'motor power' && f.value === '7.5' && f.unit === 'kW'));
});

test('stock join: public counts only, built-to-order split, note when absent', () => {
  const m = sheet('MOPX 207').machine;
  assert.deepEqual(Object.keys(m.stock).sort(), ['builtToOrderUnits', 'listings', 'note', 'readyBuiltUnits']);
  assert.equal(m.stock.readyBuiltUnits, 3);
  assert.equal(m.stock.builtToOrderUnits, 1);
  assert.match(m.stock.note, /not ready-built/);
  assert.match(sheet('MOPX 213').machine.stock.note, /2025-12-09/);
  const absent = sheet('MOPX 205').machine.stock;
  assert.equal(absent.listings, 0);
  assert.match(absent.note, /^Not in the current stock list/);
  const w = sheet('WHPX 510').machine;
  assert.equal(w.stock.builtToOrderUnits, 5);
  assert.equal(w.stock.readyBuiltUnits, 0);
});

test('list_machines: index, type and maker filters, empty filter explains itself', () => {
  const all = listMachinesTool({});
  assert.equal(all.count, data.index.length);
  assert.ok(all.machines.every((m) => m.id && m.model && 'figureCount' in m));
  assert.ok(JSON.stringify(all).length < 40_000, 'short index');
  const manual = listMachinesTool({ type: 'manual-clean' });
  assert.ok(manual.count > 5 && manual.machines.every((m) => /manual-clean/.test(m.type)));
  assert.equal(listMachinesTool({ maker: 'Alfa Laval' }).count, data.index.length);
  const none = listMachinesTool({ type: 'zzz' });
  assert.equal(none.count, 0);
  assert.match(none.message, /Types:/);
});

test('descriptions say what the tools are for and are not', () => {
  for (const d of [GET_DATASHEET_DESCRIPTION, LIST_MACHINES_DESCRIPTION]) {
    assert.match(d, /no prices/i);
    assert.match(d, /no parts|no figures, no prices and no parts/i);
  }
  assert.match(GET_DATASHEET_DESCRIPTION, /Alfa Laval's as printed/);
  assert.match(GET_DATASHEET_DESCRIPTION, /ONE whole/);
});

test('Worker registers both tools read-only and the page registers the same names; answers match', async () => {
  const workerSource = await readFile('workers/dolphin-mcp/src/index.js', 'utf8');
  assert.equal((workerSource.match(/server\.registerTool\(/g) ?? []).length, 9, '/mcp has nine tools');
  assert.match(workerSource, /registerTool\(GET_DATASHEET_TOOL[\s\S]*?description: GET_DATASHEET_DESCRIPTION[\s\S]*?annotations: READ_ONLY/);
  assert.match(workerSource, /registerTool\(LIST_MACHINES_TOOL[\s\S]*?description: LIST_MACHINES_DESCRIPTION[\s\S]*?annotations: READ_ONLY/);
  for (const name of ['get_centrifuge_specs', 'list_centrifuge_models', 'check_dolphin_stock', 'size_centrifuge', 'request_quote']) {
    assert.ok(workerSource.includes(`registerTool('${name}'`), name);
  }

  const { outputFiles } = await build({ entryPoints: ['src/scripts/dolphinWebMcp.ts'], bundle: true, write: false, format: 'iife', globalName: 'runtime' });
  const tools = new Map();
  const context = vm.createContext({
    document: { modelContext: { registerTool: async (tool) => { tools.set(tool.name, tool); } } },
    console: { warn() {} }, AbortSignal, AbortController,
    fetch: async (url) => ({ ok: true, json: async () => (String(url).includes('machine-datasheets') ? data : {}) }),
  });
  vm.runInContext(outputFiles[0].text, context);
  await context.runtime.registerDolphinWebMcpTools();
  const get = tools.get(GET_DATASHEET_TOOL);
  const list = tools.get(LIST_MACHINES_TOOL);
  assert.ok(get && list);
  assert.equal(get.description, GET_DATASHEET_DESCRIPTION);
  assert.equal(list.description, LIST_MACHINES_DESCRIPTION);
  assert.equal(get.annotations.readOnlyHint, true);
  assert.equal(list.annotations.readOnlyHint, true);

  for (const model of ['MOPX 207', 'MOPX', 'MAB 204S', 'MOPX 208', 'WHPX 510TGD']) {
    const page = await get.execute({ model });
    const { status, ...expected } = getMachineDatasheet(machineDatasheetData, { model });
    assert.equal(page.status, status);
    assert.equal(JSON.stringify(page.data), JSON.stringify(JSON.parse(JSON.stringify(expected))), model);
  }
  const pageList = await list.execute({ type: 'decanter' });
  assert.equal(pageList.data.count, listMachines(machineDatasheetData, { type: 'decanter' }).count);
  assert.equal((await get.execute({})).status, 'invalid_input');
  assert.equal((await get.execute({ model: 'MOPX', extra: 1 })).status, 'invalid_input');
});

test('free-text get_centrifuge_specs pages through every match', () => {
  const first = getCentrifugeSpecs({ query: 'disc stack' });
  assert.ok(first.found > 8);
  assert.equal(first.page.nextOffset, 8);
  assert.match(first.note, /offset 8/);
  const seen = [...first.models.map((m) => m.model)];
  let next = first.page.nextOffset;
  while (next !== null) {
    const p = getCentrifugeSpecs({ query: 'disc stack', offset: next });
    seen.push(...p.models.map((m) => m.model));
    next = p.page.nextOffset;
  }
  assert.equal(seen.length, first.found);
  assert.equal(new Set(seen).size, first.found);
  assert.ok(getCentrifugeSpecs({ query: 'disc stack', offset: 9999 }).error);
});

test('every older Worker tool still answers', () => {
  assert.equal(getCentrifugeSpecs({ model: 'MOPX 207' }).found, 1);
  assert.ok(listCentrifugeModels({ type: 'decanter' }).count > 0);
  assert.ok(checkDolphinStock({}).count > 0);
  assert.ok(sizeCentrifuge({ bowl_diameter_m: 0.4, rpm: 6000 }).gForce > 0);
  assert.ok(listAlfaLavalPublishedDocuments());
  assert.ok(getAlfaLavalPublishedFigures({ model: 'MAB 204' }));
});
