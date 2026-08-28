import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { technicalCatalog } from './src/data/centrifugeTechnicalRegistry.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const MODEL_BY_ID = new Map(technicalCatalog.models.map((model) => [model.id, model]));

function modelById(id) {
  const model = MODEL_BY_ID.get(id);
  assert.ok(model, `Technical registry must contain ${id}`);
  return model;
}

function sourceForModel(model) {
  const route = new URL(model.canonicalPage).pathname.replace(/^\/+|\/+$/g, '');
  return readFileSync(path.join(ROOT, 'src', 'pages', `${route}.astro`), 'utf8');
}

function sourceFor(relativePath) {
  return readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function escaped(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function integerPattern(value) {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, '[,]?');
}

function capacityPairPattern(capacity) {
  const conversion = capacity.derivedConversions.find((item) => item.unit === 'US GPM');
  assert.ok(conversion && Number.isFinite(conversion.value), `${capacity.id} must have one exact GPM value`);
  const gpm = escaped(conversion.value.toFixed(2));
  return new RegExp(
    `${integerPattern(capacity.sourceValue.value)}\\s*L\\s*\\/\\s*h[\\s\\S]{0,90}?${gpm}\\s*(?:US\\s*)?GPM`,
    'i',
  );
}

function dieselCapacity(model) {
  const capacity = model.capacities.find((item) => item.fluid.category === 'diesel');
  assert.ok(capacity, `${model.id} must retain its exact diesel capacity record`);
  return capacity;
}

function ratedReference(model) {
  const capacity = model.capacities.find((item) => item.ratingBasis === 'oem-rated-reference');
  assert.ok(capacity, `${model.id} must retain its rated-reference record`);
  return capacity;
}

function shortModelPattern(displayName) {
  return new RegExp(
    escaped(displayName.replace(/^Alfa Laval\s+/i, '')).replace(/\\ /g, '[\\s-]*'),
    'i',
  );
}

function assertVariantCapacity(page, model, capacity, pageLabel) {
  const modelPattern = shortModelPattern(model.displayName);
  const pairPattern = capacityPairPattern(capacity);
  const positions = [...page.matchAll(new RegExp(modelPattern.source, 'gi'))].map((match) => match.index);
  assert.ok(positions.length > 0, `${pageLabel} must name ${model.displayName}`);
  assert.ok(
    positions.some((index) => pairPattern.test(page.slice(Math.max(0, index - 40), index + 460))),
    `${pageLabel} must attach ${capacity.sourceValue.value} L/h and ${capacity.derivedConversions[0].value.toFixed(2)} US GPM to ${model.displayName}`,
  );
}

function assertQualifiedRatedReference(page, capacity, pageLabel) {
  const pairPattern = capacityPairPattern(capacity);
  const matches = [...page.matchAll(new RegExp(pairPattern.source, 'gi'))];
  assert.ok(matches.length > 0, `${pageLabel} must contain the exact rated-reference L/h and GPM pair`);
  assert.ok(
    matches.some((match) =>
      /(?:source\s+)?fluid(?:\s+is|\s*:)?\s+(?:unspecified|not\s+specified)|no\s+source\s+fluid\s+(?:is\s+)?specified|does\s+not\s+identify\s+(?:its|the)\s+fluid/i.test(
        page.slice(Math.max(0, match.index - 180), match.index + match[0].length + 180),
      ),
    ),
    `${pageLabel} must identify the rated-reference source fluid as unspecified`,
  );
}

test('DMB pages preserve exact base-machine diesel values and never relabel rated reference as water', () => {
  const dmbModels = technicalCatalog.models.filter(
    (model) => model.recordType === 'dolphin-commercial-class' && model.series === 'DMB',
  );
  assert.ok(dmbModels.length > 0, 'Registry must contain DMB commercial classes');

  for (const commercialModel of dmbModels) {
    assert.equal(commercialModel.baseMachineVariantIds.length, 1, `${commercialModel.id} must have one base machine`);
    const baseModel = modelById(commercialModel.baseMachineVariantIds[0]);
    const page = sourceForModel(commercialModel);
    const diesel = dieselCapacity(baseModel);
    assertVariantCapacity(page, baseModel, diesel, commercialModel.displayName);

    const ratedLines = page.split(/\r?\n/).filter((line) => /rated[-\s]?reference/i.test(line));
    assert.ok(ratedLines.length > 0, `${commercialModel.displayName} must label its rated reference`);
    for (const line of ratedLines) {
      assert.match(
        line,
        /(?:source\s+)?fluid(?:\s+is|\s*:)?\s+(?:unspecified|not\s+specified)|no\s+source\s+fluid\s+(?:is\s+)?specified/i,
        `${commercialModel.displayName} rated reference must say its source fluid is unspecified`,
      );
    }
  }
});

test('DMPX pages keep each supported variant and its own exact diesel value', () => {
  const dmpxModels = technicalCatalog.models.filter(
    (model) => model.recordType === 'dolphin-commercial-class' && model.series === 'DMPX',
  );
  assert.ok(dmpxModels.length > 0, 'Registry must contain DMPX commercial classes');

  for (const commercialModel of dmpxModels) {
    const page = sourceForModel(commercialModel);
    for (const baseId of commercialModel.baseMachineVariantIds) {
      const baseModel = modelById(baseId);
      assert.match(page, shortModelPattern(baseModel.displayName), `${commercialModel.displayName} must name ${baseModel.displayName}`);
      const diesel = baseModel.capacities.find((item) => item.fluid.category === 'diesel');
      if (diesel) assertVariantCapacity(page, baseModel, diesel, commercialModel.displayName);
    }
  }

  const dmpx042 = sourceForModel(modelById('dolphin-dmpx-042'));
  assert.doesNotMatch(dmpx042, /WHPX[\s-]*410/i, 'DMPX-042 must not restore unsupported WHPX 410');
  assert.doesNotMatch(dmpx042, /MAPX[\s-]*210/i, 'DMPX-042 must not restore unsupported MAPX 210');
});

test('WHPX 510 and WHPX 513 pages distinguish diesel application capacity from rated reference', () => {
  for (const id of ['alfa-laval-whpx-510', 'alfa-laval-whpx-513']) {
    const model = modelById(id);
    const page = sourceForModel(model);
    assert.match(page, capacityPairPattern(dieselCapacity(model)), `${model.displayName} diesel value must match the registry`);
    assertQualifiedRatedReference(page, ratedReference(model), model.displayName);
  }

  const whpx510 = sourceForModel(modelById('alfa-laval-whpx-510'));
  for (const line of whpx510.split(/\r?\n/).filter((line) => /42(?:\.0+)?\s*(?:US\s*)?GPM/i.test(line))) {
    assert.doesNotMatch(line, /diesel/i, 'WHPX 510 must not call 42 GPM a diesel capacity');
  }
});

test('WHPX 513 clarifier page contains no unsupported flow or particle-size claim', () => {
  const page = sourceFor('src/pages/alfa-laval-whpx-513-clarifier-centrifuge-module.astro');
  const lines = page.split(/\r?\n/);

  for (const line of lines.filter((item) => /72(?:\.21)?\s*(?:US\s*)?GPM/i.test(item))) {
    if (/(?:clarifier|wastewater)/i.test(line)) {
      assert.match(line, /\b(?:not|no|unsupported|does\s+not|cannot)\b/i, '72 GPM must not be a clarifier or wastewater capacity');
    } else {
      assert.match(line, /diesel/i, 'Any retained 72 GPM reference must be explicitly limited to diesel');
    }
  }
  for (const line of lines.filter((item) => /0\.5[\s-]*micron/i.test(item))) {
    assert.match(line, /\b(?:not|no|unsupported|does\s+not|cannot|application-specific|test)\b/i, '0.5 micron must not be stated as a guarantee');
  }
  for (const line of lines.filter((item) => /(?:over|exceeds?)\s*90\s*(?:US\s*)?GPM|90\s*(?:US\s*)?GPM[\s\S]{0,80}light oils?/i.test(item))) {
    assert.match(line, /\b(?:not|no|unsupported|does\s+not|cannot)\b/i, 'The unsupported over-90-GPM light-oil claim must stay removed');
  }
});

test('canonical OEM pages publish corrected registry values and no MAPX 309 flow', () => {
  const pages = [
    ['src/pages/alfa-laval-mab-103-centrifuge.astro', ['alfa-laval-mab-103']],
    ['src/pages/alfa-laval-mab-104-centrifuge.astro', ['alfa-laval-mab-104']],
    ['src/pages/alfa-laval-mab-centrifuge.astro', [
      'alfa-laval-mab-204',
      'alfa-laval-mab-205',
      'alfa-laval-mab-206',
      'alfa-laval-mab-207',
      'alfa-laval-mab-209',
    ]],
    ['src/pages/alfa-laval-mopx-207-centrifuge.astro', ['alfa-laval-mopx-207']],
    ['src/pages/alfa-laval-mopx-209-centrifuge.astro', ['alfa-laval-mopx-209']],
    ['src/pages/alfa-laval-whpx-405.astro', ['alfa-laval-whpx-405']],
  ];

  for (const [relativePath, modelIds] of pages) {
    const page = sourceFor(relativePath);
    for (const id of modelIds) {
      const model = modelById(id);
      assertVariantCapacity(page, model, dieselCapacity(model), relativePath);
      const rated = model.capacities.find((item) => item.ratingBasis === 'oem-rated-reference');
      if (rated) assertQualifiedRatedReference(page, rated, relativePath);
    }
  }

  const mopx209 = sourceFor('src/pages/alfa-laval-mopx-209-centrifuge.astro');
  const mapxSection = mopx209.match(/<h2[^>]*id=["']mapx-309["'][\s\S]*?(?=<h2\b|<FAQ\b|<\/ApplicationLayout>)/i)?.[0];
  assert.ok(mapxSection, 'MOPX 209 page must retain its MAPX 309 no-data explanation');
  assert.doesNotMatch(mapxSection, /\d[\d,]*(?:\.\d+)?\s*(?:L\s*\/\s*h|(?:US\s*)?GPM)/i, 'MAPX 309 must have no unsupported numeric flow');
});
