// The in-page WebMCP tools (src/data/agentCatalog.mjs via centrifuges.v1.json) and the /mcp
// Worker (workers/dolphin-mcp) must answer from one dataset. This fails if, for any model, the
// two systems would hand an agent a different published figure, or if either lacks a model the
// other has. Runs on source; no build needed.
import assert from 'node:assert/strict';
import test from 'node:test';

import { agentModels, technicalCatalog } from './src/data/agentCatalog.mjs';
import { getCentrifugeCapacity } from './src/lib/agentCatalogQuery.mjs';
import { getCentrifugeSpecs, listCentrifugeModels } from './workers/dolphin-mcp/src/catalog.js';

const text = (number) => (Array.isArray(number) ? number.join('-') : String(number));
const sourceNumber = (source) => (source.value !== undefined ? source.value : [source.minimum, source.maximum]);
const specNumber = (record) => (!record ? undefined : record.value !== undefined ? record.value
  : record.minimum !== undefined ? [record.minimum, record.maximum] : record.publishedNominalDrive?.value);

/** Published figures on an in-page catalog record, as "field = value unit" lines. */
function catalogFigures(model, capacities = model.capacities) {
  const out = capacities.map((c) => `capacity ${c.fluid.name} = ${text(sourceNumber(c.sourceValue))} ${c.sourceValue.unit}`);
  const specs = model.specifications ?? {};
  for (const [label, key] of [['motor', 'motorPower'], ['bowl speed', 'bowlSpeed'], ['sludge space', 'sludgeSpace'], ['net weight', 'netWeight'], ['g-force', 'gForce']]) {
    const number = specNumber(specs[key]);
    if (number !== undefined) out.push(`${label} = ${text(number)}`);
  }
  return out.sort();
}

/** Published figures in a Worker get_centrifuge_specs model answer. */
function workerFigures(answer, { capacitiesOnly = false } = {}) {
  const out = answer.capacities.map((c) => `capacity ${c.fluid} = ${text(c.value)} ${c.unit}`);
  if (!capacitiesOnly) {
    for (const [label, key] of [['motor', 'motorHp'], ['bowl speed', 'bowlSpeedRpm'], ['sludge space', 'sludgeVolumeUsGal'], ['net weight', 'netWeightLb'], ['g-force', 'gForce']]) {
      if (answer[key] !== undefined) out.push(`${label} = ${text(answer[key])}`);
    }
  }
  return out.sort();
}

function workerAnswer(model) {
  const designation = agentModels.find((m) => m.id === model.id)?.designation;
  const result = getCentrifugeSpecs({ model: model.id });
  return result.models?.find((m) => m.model === designation);
}

test('both systems cover the same models', () => {
  const catalogIds = technicalCatalog.models.map((m) => m.id).sort();
  assert.deepEqual(agentModels.map((m) => m.id).sort(), catalogIds);
  assert.equal(listCentrifugeModels().count, catalogIds.length);
  for (const model of technicalCatalog.models) assert.ok(workerAnswer(model), `the Worker has no answer for ${model.id}`);
});

test('every model carries the same published figures in both systems', () => {
  for (const model of technicalCatalog.models) {
    assert.deepEqual(workerFigures(workerAnswer(model)), catalogFigures(model), model.id);
  }
});

test('a capacity the in-page tool returns is the capacity the Worker returns for that machine', () => {
  for (const model of technicalCatalog.models) {
    const result = getCentrifugeCapacity(technicalCatalog, { model: model.id });
    if (result.status !== 'ok') continue; // a multi-base commercial class waits for a base machine
    const selected = technicalCatalog.models.find((m) => m.id === result.data.selectedModel?.id) ?? model;
    const inPage = catalogFigures(selected, result.data.capacities).filter((line) => line.startsWith('capacity '));
    const worker = workerFigures(workerAnswer(selected), { capacitiesOnly: true });
    for (const line of inPage) assert.ok(worker.includes(line), `${model.id}: in-page "${line}" is not in the Worker answer for ${selected.id}`);
  }
});
