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

// Owner ruling 2026-11-20 ("Use Alfa Laval's"): where the site and Alfa Laval differ, the
// site shows Alfa Laval's printed figure. This replaced R5-4 (MOPX 207 at 6,325 RPM).
const REPLACED = {
  'MOPX 207': { bowlSpeedRpm: 6400, sludgeVolumeL: 3.9, sludgeVolumeGal: 1.03 },
  'MOPX 205': { bowlSpeedRpm: 7600 },
  'WHPX 405': { bowlSpeedRpm: 7605, motorKw: 4 },
  'WHPX 407': { motorKw: 11 },
  'WHPX 510': { motorKw: 11.2, bowlSpeedRpm: 5180 },
  'MOPX 209': { motorKw: 11.2 },
  'MOPX 310': { motorKw: 11, bowlSpeedRpm: 5175, sludgeVolumeL: 13 },
  'FOPX 613': { motorKw: 16, sludgeVolumeL: 29 },
  'MAPX 309': { motorKw: 8.8 },
  'MAB 103': { sludgeVolumeL: 0.56, sludgeVolumeGal: 0.15 },
  'MAB 104': { motorKw: 1.12, bowlSpeedRpm: 7500 },
  'WSB 104': { motorKw: 1.1 },
  'WSPX 303': { motorKw: 2.2, bowlSpeedRpm: 9510, sludgeVolumeL: 0.63 },
  'WSPX 307': { motorKw: 7.5, bowlSpeedRpm: 8375, sludgeVolumeL: 2.9 },
  'AFPX 213': { motorKw: 15 },
  'BRPX 309': { motorKw: 11 },
  'BRPX 313': { motorKw: 22, sludgeVolumeL: 16.4 },
  'BTPX 205': { motorKw: 6.5, bowlSpeedRpm: 9631, sludgeVolumeL: 3.1 },
  'LAPX-404': { motorKw: 3, bowlSpeedRpm: 9512, sludgeVolumeL: 1.11 },
};

test('every figure the owner decided on is Alfa Laval\'s printed figure, with its document', () => {
  for (const [designation, want] of Object.entries(REPLACED)) {
    const m = spec(designation);
    for (const [field, value] of Object.entries(want)) assert.equal(m[field], value, `${designation} ${field}`);
    if (want.sludgeVolumeL !== undefined) {
      assert.ok(m.sludgeSource, `${designation}: printed sludge names its document`);
      assert.equal(m.sludgeVolumeGal, Math.round((m.sludgeVolumeL / 3.785) * 100) / 100, `${designation}: gal is converted from printed L`);
    }
    if (want.bowlSpeedRpm !== undefined) assert.ok(m.alfaLavalSources?.bowlSpeed, `${designation}: bowl speed names its document`);
  }
  // G-force figures stated at a superseded speed with no bowl diameter in the data are dropped.
  for (const d of ['BTPX 205', 'WSPX 307', 'LAPX-404']) assert.equal(spec(d).gForce, undefined, `${d} G-force dropped`);
  assert.ok(!spec('MOPX 207').rulings.includes('R5-4'), 'R5-4 (6,325 RPM) is replaced by the 2026-11-20 ruling');
});

test('where Alfa Laval prints more than one figure, every one is shown with its variant and document', () => {
  const want = {
    'MOPX 209': { motor: ['11.2 kW', '11 kW'] },
    'MOPX 205': { bowlSpeed: ['7,600 rpm', '7,605 rpm'] },
    'WHPX 405': { motor: ['4 kW', '5.5 kW'] },
    'WHPX 407': { motor: ['11 kW', '10 kW'] },
    'MAB 104': { bowlSpeed: ['7,500 rpm', '7,350 rpm at 60 Hz'], motor: ['1.12 kW', '1.1 kW', '1.5 kW'] },
    'WSPX 307': { bowlSpeed: ['8,375 rpm at 50 Hz', '8,400 rpm at 60 Hz'], motor: ['7.5 kW at 50 Hz', '8.5 kW at 60 Hz'] },
    'BTPX 205': { bowlSpeed: ['9,631 rpm', '9,655 rpm', '7,605 rpm', '7,540 rpm', '7,270 rpm'] },
    'LAPX-404': { bowlSpeed: ['9,512 rpm at 50 Hz', '9,307 rpm at 60 Hz'], sludge: ['1.11 L', '0.57 L'] },
    'AFPX 213': { motor: ['15 kW', '18.5 kW'] },
    'BRPX 309': { motor: ['11 kW', '15 kW'] },
  };
  for (const [designation, fields] of Object.entries(want)) {
    const alts = spec(designation).alfaLavalAlternatives;
    for (const [field, figures] of Object.entries(fields)) {
      assert.equal(alts[field].length >= figures.length - 1, true, `${designation} ${field} alternatives`);
      const text = alts[field].join(' | ');
      for (const f of figures) assert.ok(text.includes(f), `${designation} ${field}: ${f} shown`);
      for (const a of alts[field]) assert.match(a, /Alfa Laval .*pp?\. \d/, `${designation} ${field}: "${a}" names its document and page`);
    }
  }
  const worker209 = getCentrifugeSpecs({ model: 'MOPX 209' });
  assert.match(JSON.stringify(worker209), /11\.2 kW, MOPX 209TGT-20[^"]*PX types/);
  assert.match(JSON.stringify(worker209), /11 kW, MOPX 209TGT[^"]*MR SO 2800E, p\. 94/);
  const agent209 = agentTechnicalCatalog.models.find((m) => m.id === 'alfa-laval-mopx-209');
  assert.equal(agent209.specifications.motorPower.alfaLavalPrinted.value, 11.2);
  assert.equal(agent209.specifications.motorPower.alfaLavalAlternatives.length, 2);
});

test('MOPX 207, WHPX 510 and MOPX 209: spec data, registry, agent tools and stock rows give one answer', async () => {
  const { stockList } = await import('./src/data/stockList.mjs');
  const rows = (model) => stockList.units.filter((u) => u.model === model);
  // MOPX 207 bowl speed: 6,400 rpm everywhere.
  assert.equal(spec('MOPX 207').bowlSpeedRpm, 6400);
  assert.equal(registry('alfa-laval-mopx-207').specifications.bowlSpeed.value, 6400);
  assert.match(registry('alfa-laval-mopx-207').specifications.bowlSpeed.alfaLavalPrinted.document, /MR SO 2800E, p\. 92/);
  assert.equal(agentTechnicalCatalog.models.find((m) => m.id === 'alfa-laval-mopx-207').specifications.bowlSpeed.value, 6400);
  const worker207 = JSON.stringify(getCentrifugeSpecs({ model: 'MOPX 207' }));
  assert.match(worker207, /"bowlSpeedRpm":6400/);
  assert.doesNotMatch(worker207, /6,?325/);
  assert.equal(rows('MOPX 207').length, 3);
  for (const u of rows('MOPX 207')) {
    assert.equal(u.bowlSpeedRpm, 6400);
    assert.match(u.alfaLavalSource, /6,400 rpm[\s\S]*MR SO 2800E, p\. 92/);
  }
  // WHPX 510 motor: 11.2 kW (the only printed figure, WHPX 510TGD-20).
  assert.equal(spec('WHPX 510').motorKw, 11.2);
  assert.equal(registry('alfa-laval-whpx-510').specifications.motorPower.alfaLavalPrinted.value, 11.2);
  for (const u of rows('WHPX 510')) {
    assert.equal(u.motorKw, 11.2);
    assert.equal(u.motorHp, undefined);
    assert.equal(u.bowlSpeedRpm, spec('WHPX 510').bowlSpeedRpm);
  }
  // MOPX 209: headline 11.2 kW with the 11 kW alternative in every agent record.
  assert.equal(registry('alfa-laval-mopx-209').specifications.motorPower.alfaLavalPrinted.value, 11.2);
  assert.equal(registry('alfa-laval-mopx-209').specifications.motorPower.alfaLavalAlternatives.length, 2);
  // Every stock row with a printed figure carries its source; no stock row contradicts the spec data.
  for (const u of stockList.units) {
    const s = models.find((m) => m.designation === u.model);
    if (!s) continue;
    if (u.motorKw !== undefined) assert.equal(u.motorKw, s.motorKw, `${u.model} stock motor`);
    if (u.bowlSpeedRpm !== undefined && s.bowlSpeedRpm !== undefined) assert.equal(u.bowlSpeedRpm, s.bowlSpeedRpm, `${u.model} stock bowl speed`);
    if (s.motorKw !== undefined && u.motorKw !== undefined) assert.ok(u.alfaLavalSource, `${u.model}: stock row names the Alfa Laval document`);
  }
});

test('the library data sheet agrees with the site for the MOPX 207, WHPX 510 and MOPX 209', () => {
  const library = JSON.parse(fs.readFileSync('./public/technical-data/machine-datasheets.v1.json', 'utf8'));
  const figures = (id, group) => library.machines[id].figures.filter((f) => f.group === group);
  assert.ok(figures('alfa-laval-mopx-207', 'bowl speed').every((f) => f.max === 6400 || /6400/.test(f.value)));
  assert.deepEqual(figures('alfa-laval-whpx-510', 'motor power').map((f) => f.max), [11.2]);
  assert.deepEqual(figures('alfa-laval-mopx-209', 'motor power').map((f) => f.max).sort(), [11, 11.2]);
  const text = spec('MOPX 209').alfaLavalAlternatives.motor.join(' ');
  for (const f of figures('alfa-laval-mopx-209', 'motor power')) assert.ok(text.includes(`${f.max} kW`), `MOPX 209 shows ${f.max} kW`);
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

test('built pages show the Alfa Laval figures: MOPX 207 6,400 RPM, WHPX 510 11.2 kW, MOPX 209 11.2 kW and 11 kW', { skip: !fs.existsSync(`${DIST}/specs.json`) && 'run npm run build first' }, () => {
  const p207 = page('/alfa-laval-mopx-207-centrifuge/');
  assert.match(p207, /6,400 RPM/);
  assert.match(p207, /MR SO 2800E, p\. 92/);
  assert.doesNotMatch(p207, /6,?325/);
  for (const route of ['/centrifuges/dmpx-028/', '/disc-stack-centrifuge/', '/waste-oil-centrifuge-case-study-marine-and-industrial-waste-oil-recovery/']) {
    assert.doesNotMatch(page(route), /6,?325/, `${route} still shows 6,325`);
  }
  assert.match(page('/centrifuges/dmpx-028/'), /5,175.6,400 RPM/);
  const p510 = page('/alfa-laval-whpx-510-centrifuge/');
  assert.match(p510, /11\.2 kW/);
  assert.match(p510, /5,180 RPM/);
  assert.doesNotMatch(p510, /(?<![\d.])10 HP motor/);
  const p209 = page('/alfa-laval-mopx-209-centrifuge/');
  assert.match(p209, /11\.2 kW/);
  assert.match(p209, /(?<![\d.])11 kW/);
  const stock = JSON.parse(fs.readFileSync(`${DIST}/technical-data/stock-list.v1.json`, 'utf8'));
  const rows207 = stock.units.filter((u) => u.model === 'MOPX 207');
  assert.ok(rows207.length && rows207.every((u) => u.bowlSpeedRpm === 6400 && /MR SO 2800E, p\. 92/.test(u.alfaLavalSource)));
  assert.doesNotMatch(JSON.stringify(stock), /6,?325/);
});