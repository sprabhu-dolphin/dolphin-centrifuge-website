// Owner ruling 2026-10-13: no food or human-consumption claim ever leaves Dolphin.
// Covers the shared guard, the used-offer data and the /mcp Worker tools.
import assert from 'node:assert/strict';
import test from 'node:test';
import { agentModels } from './src/data/agentCatalog.mjs';
import { buildUsedOfferRecord, usedApplications, usedFamilies } from './src/data/usedAlfaLavalOffer.mjs';
import { isHumanConsumptionRequest, NO_HUMAN_CONSUMPTION_DISCLAIMER } from './src/lib/humanConsumptionGuard.mjs';
import { getCentrifugeSpecs, listCentrifugeModels } from './workers/dolphin-mcp/src/catalog.js';

const FOOD_REQUESTS = ['food', 'Food grade', 'juice', 'beer', 'wine', 'milk', 'dairy', 'edible oil', 'olive oil',
  'vegetable oil', 'cooking oil', 'beverage', 'pharmaceutical', 'drinking water', 'sugar syrup'];
const INDUSTRIAL = ['waste oil', 'used oil', 'used cooking oil', 'waste vegetable oil', 'WVO', 'UCO',
  'food-industry wastewater', 'food processing wastewater', 'food waste', 'rendering', 'diesel', 'lube oil',
  'steam turbine oil', 'machine coolant', 'crude oil tank bottoms', 'biodiesel', 'MOPX 207', 'stainless'];

test('guard flags human-consumption duties and lets industrial and waste streams through', () => {
  for (const text of FOOD_REQUESTS) assert.equal(isHumanConsumptionRequest(text), true, text);
  for (const text of INDUSTRIAL) assert.equal(isHumanConsumptionRequest(text), false, text);
  assert.equal(isHumanConsumptionRequest(undefined, ''), false);
});

test('guard never blocks a published model name or capacity fluid', () => {
  for (const m of agentModels) {
    for (const text of [m.designation, m.modelType, m.dolphinModule, ...(m.aliases ?? [])].filter(Boolean)) {
      assert.equal(isHumanConsumptionRequest(text), false, `${m.id}: ${text}`);
    }
    for (const c of m.capacities ?? []) assert.equal(isHumanConsumptionRequest(c.fluid), false, `${m.id}: ${c.fluid}`);
  }
});

test('used-offer data carries no food key or food route', () => {
  const keys = [...usedApplications.map((a) => a.key), ...usedApplications.flatMap((a) => a.families), ...usedFamilies.map((f) => f.key)];
  assert.ok(!keys.some((k) => /food/i.test(k)), keys.join(','));
  const record = JSON.stringify(buildUsedOfferRecord());
  assert.doesNotMatch(record, /"key":"food"|"food"/);
  assert.ok(usedFamilies.some((f) => f.key === 'stainless' && f.type === 'Stainless steel and biotech disc stack'));
});

test('/mcp tools return no machine for a human-consumption request', () => {
  for (const application of ['edible oil', 'olive oil', 'vegetable oil', 'juice', 'food']) {
    const out = listCentrifugeModels({ application });
    assert.equal(out.count, 0, application);
    assert.deepEqual(out.models, []);
    assert.equal(out.note, NO_HUMAN_CONSUMPTION_DISCLAIMER);
  }
  for (const query of ['food grade separator', 'juice', 'edible oil']) {
    const out = getCentrifugeSpecs({ query });
    assert.equal(out.found, 0, query);
    assert.equal(out.note, NO_HUMAN_CONSUMPTION_DISCLAIMER);
  }
  assert.ok(listCentrifugeModels({ application: 'waste oil' }).count > 0, 'waste oil still lists machines');
  assert.equal(getCentrifugeSpecs({ model: 'MOPX 207' }).found, 1);
});
