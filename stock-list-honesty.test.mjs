// Stock list honesty (owner ruling 2026-11-20): a remanufactured-to-order unit is never "in stock",
// counts show the split, the date is the inventory sheet date, makers are named correctly, per-model
// figures agree with the site's corrected data, and rows carry public fields only.
import assert from 'node:assert/strict';
import test from 'node:test';

import { agentModels } from './src/data/agentCatalog.mjs';
import {
  BUILT_TO_ORDER_STATEMENT, isBuiltToOrder, stockAvailability, stockCounts, stockCountsSentence, stockList, stockMaker, validateStockList,
} from './src/data/stockList.mjs';
import { checkDolphinStock, SERVER_INSTRUCTIONS } from './workers/dolphin-mcp/src/catalog.js';
import { GET } from './src/pages/technical-data/stock-list.v1.json.ts';

const record = JSON.parse(await GET().text());

test('every built-to-order row says so and none says in stock', () => {
  validateStockList();
  const order = stockList.units.filter(isBuiltToOrder);
  assert.ok(order.length > 20);
  for (const u of order) {
    assert.equal(u.status, 'built to order', u.model);
    assert.equal(stockAvailability(u), BUILT_TO_ORDER_STATEMENT);
    assert.doesNotMatch(stockAvailability(u), /in stock/i);
  }
  for (const u of stockList.units.filter((x) => !isBuiltToOrder(x))) assert.equal(u.status, 'in stock', u.model);
  assert.equal(BUILT_TO_ORDER_STATEMENT, 'Remanufactured to order after sale, not a ready-built unit');
});

test('/mcp check_dolphin_stock, the JSON record and the page tool never call a built-to-order unit in stock', async () => {
  const mcp = checkDolphinStock({});
  for (const u of mcp.units.filter((x) => x.condition === 'remanufactured to order')) {
    assert.equal(u.availability, BUILT_TO_ORDER_STATEMENT);
    assert.doesNotMatch(JSON.stringify(u), /in stock/i, `${u.model} (Worker)`);
  }
  for (const u of record.units.filter((x) => x.condition === 'remanufactured to order')) {
    assert.equal(u.status, 'built to order');
    assert.equal(u.availability, BUILT_TO_ORDER_STATEMENT);
    assert.doesNotMatch(JSON.stringify(u), /in stock/i, `${u.model} (record)`);
  }
  const { stockListWebMcpTools } = await import('./src/scripts/stockListWebMcp.ts');
  const [tool] = stockListWebMcpTools({ fetchJson: async () => record });
  const out = await tool.execute({ limit: 50 });
  assert.equal(out.status, 'ok');
  for (const u of out.data.units.filter((x) => x.condition === 'remanufactured to order')) {
    assert.doesNotMatch(JSON.stringify(u), /in stock/i, `${u.model} (page)`);
  }
  assert.match(tool.description, /not a ready-built unit/);
  assert.doesNotMatch(`${tool.title} ${tool.description}`, /Alfa Laval centrifuges in stock/i);
});

test('counts show the split: ready-built vs remanufactured to order, plus 150+ in total', () => {
  const c = stockCounts();
  assert.equal(c.listings, stockList.units.length);
  assert.equal(c.units, c.readyBuiltUnits + c.builtToOrderUnits);
  assert.equal(c.listings, c.readyBuiltListings + c.builtToOrderListings);
  assert.ok(c.readyBuiltUnits > 0 && c.builtToOrderUnits > 0);
  assert.match(stockCountsSentence(), /150\+ machines in total inventory/);
  const mcp = checkDolphinStock({});
  assert.equal(mcp.totalCounts.readyBuiltUnits, c.readyBuiltUnits);
  assert.equal(mcp.totalCounts.builtToOrderUnits, c.builtToOrderUnits);
  assert.equal(mcp.matchingCounts.units, c.units);
  assert.equal(checkDolphinStock({ model: 'MOPX 207' }).matchingCounts.builtToOrderUnits, 1);
  assert.equal(record.counts.readyBuiltUnits, c.readyBuiltUnits);
  assert.equal(record.counts.builtToOrderUnits, c.builtToOrderUnits);
  assert.match(record.counts.summary, /150\+ machines in total inventory/);
  assert.match(mcp.note, /150\+ machines in stock/);
});

test('list date is the written inventory sheet date, availability is confirmed per quote', () => {
  assert.equal(stockList.asOf, '2025-12-09');
  assert.equal(record.sheetDate, '2025-12-09');
  assert.match(record.sheetDateNote, /not a confirmation date/);
  const mcp = checkDolphinStock({});
  assert.equal(mcp.sheetDate, '2025-12-09');
  assert.match(mcp.sheetDateNote, /Availability is confirmed per quote/);
  assert.doesNotMatch(JSON.stringify([record, mcp]), /confirmed on|last confirmed|verified on/i);
});

test('maker labels: Sharples and ALDEC rows carry their own maker, the list is not called Alfa Laval stock', () => {
  for (const u of stockList.units) {
    const maker = stockMaker(u);
    if (u.family === 'Sharples') assert.equal(maker, 'Sharples (Alfa Laval)');
    else if (u.family === 'ALDEC') assert.equal(maker, 'Alfa Laval (ALDEC)');
    else assert.equal(maker, 'Alfa Laval');
  }
  assert.ok(record.units.every((u) => u.maker));
  assert.equal(record.units.find((u) => u.family === 'Sharples').maker, 'Sharples (Alfa Laval)');
  assert.equal(checkDolphinStock({ model: 'Sharples' }).units[0].maker, 'Sharples (Alfa Laval)');
  assert.doesNotMatch(record.title, /Alfa Laval/);
  assert.match(SERVER_INSTRUCTIONS, /150\+ machines in stock/);
});

test('stock figures agree with the corrected site data; no model has two answers', () => {
  const keyOf = (s) => String(s).toUpperCase().replace(/^(SHARPLES|ALDEC)\s+/, '').replace(/[^A-Z0-9]/g, '');
  const site = (model) => agentModels.find((m) => [m.designation, m.id, m.modelType, ...(m.aliases ?? [])].filter(Boolean).map(keyOf).includes(keyOf(model)));
  for (const u of stockList.units) {
    const s = site(u.model);
    if (!s) continue;
    if (u.bowlSpeedRpm !== undefined && s.bowlSpeedRpm !== undefined) assert.deepEqual(u.bowlSpeedRpm, s.bowlSpeedRpm, `${u.model} bowl speed`);
    if (u.motorHp !== undefined && s.motorHp !== undefined) assert.deepEqual(u.motorHp, s.motorHp, `${u.model} motor HP`);
    if (u.motorKw !== undefined) assert.equal(u.motorKw, s.motorKw, `${u.model} motor kW`);
  }
  const first = (model) => stockList.units.find((u) => u.model === model);
  assert.equal(first('MOPX 207').motorKw, 7.5);
  assert.equal(first('MOPX 207').motorHp, undefined);
  assert.equal(first('MOPX 213').motorKw, 15);
  assert.equal(first('MOPX 213').motorHp, undefined);
  assert.equal(first('WHPX 407').bowlSpeedRpm, 5175);
  assert.match(first('MAB 104').capacity, /6\.6 US GPM converted from 1,500 L\/h/);
});

test('public fields only: no serial, asset id, location or cost on any unit', () => {
  const ALLOWED = new Set(['family', 'model', 'type', 'condition', 'status', 'quantity', 'modelPage', 'bowlSpeedRpm', 'motorHp', 'motorKw',
    'bowlDiameter', 'wettedParts', 'separationType', 'cleaningMethod', 'capacity', 'configuration', 'alfaLavalSource']);
  for (const u of stockList.units) for (const k of Object.keys(u)) assert.ok(ALLOWED.has(k), `${u.model}: unexpected field ${k}`);
  assert.doesNotMatch(JSON.stringify(stockList), /serial|asset|location|cost|price|\$\d|bay |aisle|rack /i);
});
