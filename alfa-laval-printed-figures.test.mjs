// Machine figures must match what Alfa Laval prints (owner ruling 2026-11-20).
// 1. A rated capacity is never labelled with a fluid. Alfa Laval prints the MAPX / MOPX
//    rated capacity with no fluid; it was once published as "Gas oil".
// 2. Gas oil is diesel fuel: the MAPX / MOPX diesel figure is the printed marine diesel oil
//    row (MPCO 20-00-02 p. 1). "Gas oil" stays only where Alfa Laval prints it (MAB chart).
// 3. The corrected MOPX, WHPX motor, speed and weight figures stay corrected.
// Source checks need no build; the page checks read dist/ and skip when it is absent.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

import { technicalCatalog } from './src/data/centrifugeTechnicalRegistry.mjs';
import { models } from './src/data/centrifugeSpecs.ts';
import { agentModels, technicalCatalog as agentTechnicalCatalog } from './src/data/agentCatalog.mjs';
import { getCentrifugeSpecs } from './workers/dolphin-mcp/src/catalog.js';

const RATED_LABEL = /^Rated reference capacity \(fluid not specified\)$/;
const registry = (id) => technicalCatalog.models.find((m) => m.id === id);
const spec = (designation) => models.find((m) => m.designation === designation);

test('a rated capacity is never labelled with a fluid', () => {
  for (const model of technicalCatalog.models) {
    for (const c of model.capacities) {
      if (c.ratingBasis === 'oem-rated-reference' || c.fluid.category === 'reference') {
        assert.match(c.fluid.name, RATED_LABEL, `${model.id}: rated record labelled "${c.fluid.name}"`);
        assert.equal(c.ratingBasis, 'oem-rated-reference', `${model.id}: rated record basis`);
      }
    }
  }
  for (const model of models) {
    for (const c of model.capacities) {
      if (c.kind === 'reference') assert.doesNotMatch(c.fluid, /gas oil|diesel|water|lube/i, `${model.designation}: reference capacity names a fluid`);
    }
  }
});

test('"Gas oil" appears only on models where Alfa Laval prints it (MAB series chart)', () => {
  for (const model of technicalCatalog.models) {
    const gas = model.capacities.filter((c) => /gas oil/i.test(c.fluid.name));
    if (gas.length) assert.match(model.id, /^alfa-laval-mab-/, `${model.id} carries a gas oil capacity Alfa Laval does not print`);
  }
});

const MOPX = {
  'MAPX 204': { rated: 2700, diesel: 1800, ro: [800, 900], turbine: 1800 },
  'MOPX 205': { rated: 4900, diesel: 3300, ro: [1500, 1700], turbine: 3200 },
  'MOPX 207': { rated: 7400, diesel: 5000, ro: [2200, 2600], turbine: 4800 },
  'MOPX 209': { rated: 11800, diesel: 7900, ro: [3500, 4100], turbine: 7700 },
  'MOPX 210': { rated: 14000, diesel: 9400, ro: [4200, 4900], turbine: 9100 },
  'MOPX 213': { rated: 21500, diesel: 14400, ro: [6500, 7500], turbine: 14000 },
};

test('MAPX / MOPX capacities are the Alfa Laval MPCO 20-00-02 printed figures', () => {
  for (const [designation, want] of Object.entries(MOPX)) {
    const id = `alfa-laval-${designation.toLowerCase().replace(' ', '-')}`;
    const caps = registry(id).capacities;
    const by = (key) => caps.find((c) => c.id === `${id}-${key}`);
    assert.equal(caps.length, 4, `${designation}: four records`);
    assert.equal(by('rated-reference').sourceValue.value, want.rated, `${designation} rated`);
    assert.match(by('rated-reference').fluid.name, RATED_LABEL);
    assert.equal(by('diesel').sourceValue.value, want.diesel, `${designation} diesel`);
    assert.match(by('diesel').fluid.name, /marine diesel oil/i);
    assert.equal(by('diesel').conditions.viscosity.value, 13);
    assert.equal(by('diesel').conditions.centrifugationTemperatureC, 40);
    assert.deepEqual([by('ro-lube-oil').sourceValue.minimum, by('ro-lube-oil').sourceValue.maximum], want.ro, `${designation} R&O`);
    assert.equal(by('steam-turbine-lube-oil').sourceValue.value, want.turbine, `${designation} steam turbine`);
    for (const c of caps) assert.match(c.source.alfaLavalDocument, /MPCO 20-00-02/, `${c.id} names the Alfa Laval document`);
    assert.ok(!caps.some((c) => /gas oil/i.test(c.fluid.name)), `${designation}: no gas oil record`);
  }
});

test('corrected motor, bowl speed and weight figures carry the Alfa Laval printed value', () => {
  const m207 = spec('MOPX 207');
  assert.equal(m207.motorKw, 7.5);
  assert.equal(m207.motorHp, 10.1);
  assert.equal(m207.netWeightKg, 785);
  assert.equal(m207.netWeightLb, 1731);
  assert.match(m207.alfaLavalSources.netWeight, /MR SO 2800E, p\. 92/);
  assert.equal(spec('MOPX 205').motorKw, 4);
  assert.equal(spec('MOPX 213').motorKw, 15);
  assert.equal(spec('WHPX 409').motorKw, 11);
  for (const d of ['WHPX 407', 'WHPX 409', 'MOPX 209']) assert.equal(spec(d).bowlSpeedRpm, 5175, `${d} bowl speed`);
  for (const m of models) if (m.motorKw !== undefined) {
    assert.equal(m.motorHp, Math.round(m.motorKw * 1.341 * 10) / 10, `${m.designation}: HP must be the converted printed kW`);
    assert.ok(m.alfaLavalSources?.motor, `${m.designation}: printed kW names its document`);
  }
  assert.equal(agentModels.find((m) => m.id === 'alfa-laval-mopx-207').motorKw, 7.5);
  const catalog207 = agentTechnicalCatalog.models.find((m) => m.id === 'alfa-laval-mopx-207');
  assert.equal(catalog207.specifications.motorPower.alfaLavalPrinted.value, 7.5);
  assert.equal(catalog207.specifications.netWeight.alfaLavalPrinted.value, 785);
  const worker207 = getCentrifugeSpecs({ model: 'MOPX 207' });
  assert.match(JSON.stringify(worker207), /"motorKwAlfaLaval":7\.5/);
  assert.doesNotMatch(JSON.stringify(worker207), /gas oil/i);
});

const DIST = './dist';
const page = (route) => fs.readFileSync(`${DIST}${route}index.html`, 'utf8').replace(/<[^>]+>/g, ' ').replace(/&deg;/g, '°').replace(/\s+/g, ' ');

test('built pages and data never label a MAPX / MOPX rated capacity as gas oil', { skip: !fs.existsSync(`${DIST}/specs.json`) && 'run npm run build first' }, () => {
  const routes = ['/alfa-laval-mopx-207-centrifuge/', '/alfa-laval-mopx-209-centrifuge/', '/centrifuges/dmpx-010/', '/centrifuges/dmpx-028/',
    '/centrifuges/dmpx-042/', '/centrifuges/dmpx-070/', '/dmpx-014-self-cleaning-3-phase-disc-stack-centrifuge/', '/alfa-laval-whpx-405/', '/disc-stack-centrifuge/'];
  for (const route of routes) {
    const text = page(route);
    assert.doesNotMatch(text, /gas oil/i, `${route} still says gas oil`);
    assert.doesNotMatch(text, /R&(amp;)?O \/ engine lube/i, `${route} still uses the old R&O / engine lube label`);
  }
  const designations = new Set(Object.keys(MOPX));
  let checked = 0;
  (function walk(node) {
    if (Array.isArray(node)) return node.forEach(walk);
    if (!node || typeof node !== 'object') return;
    if (designations.has(node.model) || designations.has(node.designation)) {
      checked++;
      assert.doesNotMatch(JSON.stringify(node), /gas oil/i, `${node.model ?? node.designation} in specs.json`);
      return;
    }
    Object.values(node).forEach(walk);
  })(JSON.parse(fs.readFileSync(`${DIST}/specs.json`, 'utf8')));
  assert.ok(checked >= 5, `specs.json MOPX records checked (${checked})`);
  for (const f of ['llms-full.txt', 'llms.txt']) {
    if (!fs.existsSync(`${DIST}/${f}`)) continue;
    assert.doesNotMatch(fs.readFileSync(`${DIST}/${f}`, 'utf8'), /(MOPX|MAPX)[^\n]{0,120}gas oil|gas oil[^\n]{0,40}(7,?400|4,?900|11,?800|21,?500)/i, `${f}`);
  }
});
