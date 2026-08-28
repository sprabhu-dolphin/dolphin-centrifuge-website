import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import technicalCatalogDefault, {
  technicalCatalog,
  US_GPM_DIVISOR,
} from './src/data/centrifugeTechnicalRegistry.mjs';
import {
  findCentrifugeModels,
  getCentrifugeCapacity,
  getCentrifugeSpecifications,
} from './src/lib/agentCatalogQuery.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(ROOT, 'dist');
const SCHEMA_VERSION = 'dolphin-centrifuge-technical-v1';
const REVIEWER_ID = 'https://dolphincentrifuge.com/authors/sanjay-prabhu/#person';
const PUBLIC_CATALOG_URL = 'https://dolphincentrifuge.com/technical-data/centrifuges.v1.json';
const WEBMCP_TOOL_NAMES = [
  'find_centrifuge_models',
  'get_centrifuge_specifications',
  'get_centrifuge_capacity',
  'get_technical_author_identity',
];

function allCapacities() {
  return technicalCatalog.models.flatMap((model) =>
    model.capacities.map((capacity) => ({ model, capacity })),
  );
}

function modelById(id) {
  const model = technicalCatalog.models.find((candidate) => candidate.id === id);
  assert.ok(model, `Expected catalog model ${id}`);
  return model;
}

function capacityById(modelId, capacityId) {
  const model = modelById(modelId);
  const capacity = model.capacities.find((candidate) => candidate.id === capacityId);
  assert.ok(capacity, `Expected capacity ${capacityId} on ${modelId}`);
  return capacity;
}

function roundedGpm(litersPerHour) {
  return Number((litersPerHour / US_GPM_DIVISOR).toFixed(2));
}

function assertExactCapacity(modelId, capacityId, litersPerHour, expectedGpm) {
  const capacity = capacityById(modelId, capacityId);
  assert.deepEqual(capacity.sourceValue, {
    value: litersPerHour,
    unit: 'L/h',
    valueStatus: 'published-tabular-value',
  });
  assert.equal(capacity.derivedConversions.length, 1);
  assert.equal(capacity.derivedConversions[0].value, expectedGpm);
  assert.equal(expectedGpm, roundedGpm(litersPerHour));
}

async function exists(target) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

test('catalog has the versioned schema and canonical technical reviewer', () => {
  assert.equal(technicalCatalogDefault, technicalCatalog);
  assert.equal(technicalCatalog.schemaVersion, SCHEMA_VERSION);
  assert.equal(technicalCatalog.catalogId, PUBLIC_CATALOG_URL);
  assert.match(technicalCatalog.lastReviewed, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(technicalCatalog.reviewedBy.id, REVIEWER_ID);
  assert.equal(technicalCatalog.reviewedBy.profile, 'https://dolphincentrifuge.com/authors/sanjay-prabhu/');
  assert.equal(
    technicalCatalog.reviewedBy.machineReadableProfile,
    'https://dolphincentrifuge.com/authors/sanjay-prabhu.json',
  );
  assert.equal(technicalCatalog.methodology.conversion.formula, 'L/h ÷ 227.124707');
  assert.equal(technicalCatalog.methodology.conversion.decimalPlaces, 2);
  assert.equal(technicalCatalog.agentInterface.webMcp.status, 'experimental-draft');
  assert.match(technicalCatalog.agentInterface.webMcp.standardsStatus, /not a W3C Standard/i);
  assert.equal(
    technicalCatalog.agentInterface.webMcp.specificationUrl,
    'https://webmachinelearning.github.io/webmcp/',
  );
  assert.deepEqual(
    technicalCatalog.sourceDocuments.map((source) => source.sourceFileSha256),
    [
      '913D42C2ED02375B0BD58E2DF671757D044A2AA87A314718EE41AB70EF4BC876',
      'A88EE38A5499FE205269369C6F078B445C47181B9D4505A26B2F6C931C0C89E8',
    ],
  );
});

test('catalog contains exactly 18 sourced OEM models and 148 capacity records', () => {
  const sourcedOemModels = technicalCatalog.models.filter(
    (model) => model.recordType === 'oem-base-machine' && model.capacities.length > 0,
  );
  const capacities = allCapacities();

  assert.equal(sourcedOemModels.length, 18);
  assert.equal(capacities.length, 148);
  assert.equal(technicalCatalog.statistics.exactOemCapacityModels, 18);
  assert.equal(technicalCatalog.statistics.capacityRecords, 148);
  assert.equal(technicalCatalog.statistics.modelRecords, technicalCatalog.models.length);
  assert.ok(
    sourcedOemModels.every((model) => model.recordType === 'oem-base-machine'),
    'Every capacity-bearing model must be an exact OEM base-machine record',
  );
});

test('model IDs and alias ownership are unique and deterministic', () => {
  const ids = technicalCatalog.models.map((model) => model.id);
  assert.equal(new Set(ids).size, ids.length, 'Model IDs must be globally unique');

  const aliasOwners = new Map();
  for (const model of technicalCatalog.models) {
    assert.match(model.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(Array.isArray(model.aliases) && model.aliases.length > 0, `${model.id} needs aliases`);

    const aliases = model.aliases.map((alias) => String(alias).trim().toLocaleLowerCase('en-US'));
    assert.equal(new Set(aliases).size, aliases.length, `${model.id} contains a duplicate alias`);

    for (const alias of aliases) {
      assert.ok(alias, `${model.id} contains an empty alias`);
      const priorOwner = aliasOwners.get(alias);
      assert.ok(
        !priorOwner || priorOwner === model.id,
        `Alias ${JSON.stringify(alias)} belongs to both ${priorOwner} and ${model.id}`,
      );
      aliasOwners.set(alias, model.id);
    }
  }

  const lookup = findCentrifugeModels(technicalCatalog, { query: 'WHPX 513' });
  assert.equal(lookup.status, 'ok');
  assert.deepEqual(lookup.data.models.map((model) => model.id), ['alfa-laval-whpx-513']);
});

test('every capacity preserves L/h, deterministic GPM, conditions, basis, and provenance', () => {
  assert.equal(US_GPM_DIVISOR, 227.124707);

  for (const { model, capacity } of allCapacities()) {
    const label = `${model.id}/${capacity.id}`;
    assert.equal(capacity.sourceValue.unit, 'L/h', `${label} source unit`);
    assert.ok(
      Number.isFinite(capacity.sourceValue.value) ||
        (Number.isFinite(capacity.sourceValue.minimum) && Number.isFinite(capacity.sourceValue.maximum)),
      `${label} needs a numeric source value or range`,
    );
    assert.ok(capacity.ratingBasis, `${label} needs a rating basis`);
    assert.ok(
      capacity.conditions && Object.keys(capacity.conditions).length > 0,
      `${label} needs application conditions`,
    );

    assert.equal(capacity.derivedConversions.length, 1, `${label} conversion count`);
    const conversion = capacity.derivedConversions[0];
    assert.equal(conversion.unit, 'US GPM', `${label} conversion unit`);
    assert.equal(conversion.derived, true, `${label} must label GPM as derived`);
    assert.equal(conversion.formula, 'L/h ÷ 227.124707', `${label} conversion formula`);
    assert.deepEqual(
      conversion.rounding,
      { decimalPlaces: 2, method: 'nearest' },
      `${label} conversion rounding`,
    );

    if (Number.isFinite(capacity.sourceValue.value)) {
      assert.equal(conversion.value, roundedGpm(capacity.sourceValue.value), `${label} GPM value`);
    } else {
      assert.equal(conversion.minimum, roundedGpm(capacity.sourceValue.minimum), `${label} GPM minimum`);
      assert.equal(conversion.maximum, roundedGpm(capacity.sourceValue.maximum), `${label} GPM maximum`);
    }

    assert.ok(capacity.source.sourceDocumentId, `${label} source document`);
    assert.ok(capacity.source.sourceDocumentTitle, `${label} source document title`);
    assert.match(capacity.source.sourceFileSha256, /^[A-F0-9]{64}$/, `${label} source fingerprint`);
    assert.ok(capacity.source.location, `${label} source location`);
    assert.equal(capacity.source.valueField, 'L/h', `${label} source field`);
    assert.match(capacity.source.reviewedOn, /^\d{4}-\d{2}-\d{2}$/, `${label} review date`);
    assert.equal(capacity.source.reviewedBy, REVIEWER_ID, `${label} reviewer`);
    assert.equal(
      capacity.source.methodologyUrl,
      'https://dolphincentrifuge.com/technical-data/#methodology',
      `${label} methodology`,
    );
  }
});

test('known OEM capacity cells retain their exact source and derived values', () => {
  assertExactCapacity('alfa-laval-mab-103', 'alfa-laval-mab-103-diesel', 900, 3.96);
  assertExactCapacity('alfa-laval-mopx-207', 'alfa-laval-mopx-207-diesel', 5000, 22.01);
  assertExactCapacity('alfa-laval-whpx-513', 'alfa-laval-whpx-513-marine-diesel', 16400, 72.21);
  assertExactCapacity('alfa-laval-whpx-513', 'alfa-laval-whpx-513-hfo-380-cst', 6400, 28.18);
  assertExactCapacity('alfa-laval-whpx-405', 'alfa-laval-whpx-405-hfo-180-cst', 1700, 7.48);

  const reversedSourceRange = capacityById(
    'alfa-laval-whpx-513',
    'alfa-laval-whpx-513-cross-head-detergent-lube-oil',
  );
  assert.equal(reversedSourceRange.sourceValue.originalCellText, '8100-7400');
  assert.equal(reversedSourceRange.sourceValue.minimum, 7400);
  assert.equal(reversedSourceRange.sourceValue.maximum, 8100);
  assert.equal(reversedSourceRange.sourceValue.normalization.applied, true);
  assert.deepEqual(
    [
      reversedSourceRange.derivedConversions[0].minimum,
      reversedSourceRange.derivedConversions[0].maximum,
    ],
    [32.58, 35.66],
  );
});

test('commercial DMPX classes never synthesize a capacity without an exact base machine', () => {
  for (const commercialModel of ['DMPX-070', 'DMPX-042']) {
    const result = getCentrifugeCapacity(technicalCatalog, {
      model: commercialModel,
      fluid: 'diesel',
    });
    assert.equal(result.status, 'ambiguous', commercialModel);
    assert.equal(result.answerability.canStateAsFact, false, commercialModel);
    assert.equal(result.answerability.qualificationRequired, true, commercialModel);
    assert.deepEqual(result.answerability.missingInputs, ['baseMachineVariant'], commercialModel);
    assert.deepEqual(result.data.capacities, [], commercialModel);
    assert.ok(result.data.baseMachineVariants.length > 1, commercialModel);
  }
});

test('an allowed base-machine selection returns only that platform capacity', () => {
  const dmpx070 = getCentrifugeCapacity(technicalCatalog, {
    model: 'DMPX-070',
    baseMachineVariant: 'WHPX 513',
    fluid: 'marine diesel',
  });
  assert.equal(dmpx070.status, 'ok');
  assert.equal(dmpx070.data.selectedModel.id, 'alfa-laval-whpx-513');
  assert.deepEqual(dmpx070.data.capacities.map((capacity) => capacity.sourceValue.value), [16400]);

  const dmpx042 = getCentrifugeCapacity(technicalCatalog, {
    model: 'DMPX-042',
    baseMachineVariant: 'MOPX 210',
    fluid: 'diesel',
  });
  assert.equal(dmpx042.status, 'ok');
  assert.equal(dmpx042.data.selectedModel.id, 'alfa-laval-mopx-210');
  assert.deepEqual(dmpx042.data.capacities.map((capacity) => capacity.sourceValue.value), [9400]);
});

test('a single-base commercial class automatically uses its sole documented base', () => {
  const capacity = getCentrifugeCapacity(technicalCatalog, {
    model: 'DMB-004',
    fluid: 'diesel',
  });
  assert.equal(capacity.status, 'ok');
  assert.equal(capacity.data.requestedModel.id, 'dolphin-dmb-004');
  assert.equal(capacity.data.selectedModel.id, 'alfa-laval-mab-103');
  assert.deepEqual(capacity.data.capacities.map((record) => record.sourceValue.value), [900]);
  assert.deepEqual(capacity.answerability.missingInputs, []);

  const specifications = getCentrifugeSpecifications(technicalCatalog, {
    model: 'DMB-004',
  });
  assert.equal(specifications.status, 'ok');
  assert.equal(specifications.data.selectedModel.id, 'alfa-laval-mab-103');
  assert.equal(specifications.data.specifications.commercialClass.cleaningMethod.value, 'manual-clean');
  assert.equal(specifications.data.specifications.baseMachine.motorPower.value, 1);
  assert.deepEqual(specifications.answerability.missingInputs, []);
});

test('selected commercial specifications retain separate module and base-machine scopes', () => {
  const result = getCentrifugeSpecifications(technicalCatalog, {
    model: 'DMPX-014',
    baseMachineVariant: 'WHPX 405',
  });
  assert.equal(result.status, 'ok');
  assert.equal(result.data.requestedModel.id, 'dolphin-dmpx-014');
  assert.equal(result.data.selectedModel.id, 'alfa-laval-whpx-405');
  assert.ok(result.data.specifications.commercialClass.skidDimensions);
  assert.ok(result.data.specifications.commercialClass.bowlConstruction);
  assert.equal(result.data.specifications.baseMachine.motorPower.value, 5);
  assert.equal(result.data.specifications.baseMachine.cleaningMethod.value, 'automatic partial-discharge / self-cleaning');
});

test('fluid discovery follows documented commercial base mappings without returning capacity data', () => {
  const result = findCentrifugeModels(technicalCatalog, { fluid: 'HFO 600 cSt' });
  assert.equal(result.status, 'ok');
  const ids = result.data.models.map((model) => model.id);
  for (const expected of [
    'dolphin-dmpx-028',
    'dolphin-dmpx-042',
    'dolphin-dmpx-070',
  ]) {
    assert.ok(ids.includes(expected), `Expected ${expected} through a documented base variant`);
  }
  assert.equal(ids.includes('dolphin-dmpx-014'), false);
  assert.ok(result.data.models.every((model) => !('capacities' in model)));
});

test('an exact OEM request cannot be redirected to another base-machine platform', () => {
  const capacity = getCentrifugeCapacity(technicalCatalog, {
    model: 'WHPX 405',
    baseMachineVariant: 'WHPX 513',
    fluid: 'marine diesel',
  });
  assert.equal(capacity.status, 'invalid_input');
  assert.equal(capacity.answerability.canStateAsFact, false);
  assert.deepEqual(capacity.data.capacities, []);
  assert.deepEqual(capacity.sources, []);
  assert.match(capacity.warnings[0], /cannot redirect an exact OEM model/i);

  const specifications = getCentrifugeSpecifications(technicalCatalog, {
    model: 'MAB 103',
    baseMachineVariant: 'MAB 104',
  });
  assert.equal(specifications.status, 'invalid_input');
  assert.equal(specifications.answerability.canStateAsFact, false);
  assert.equal('specifications' in specifications.data, false);
  assert.deepEqual(specifications.sources, []);
  assert.match(specifications.warnings[0], /cannot redirect an exact OEM model/i);
});

test('specific HFO viscosity queries return only that row while generic HFO stays useful', () => {
  const specific = getCentrifugeCapacity(technicalCatalog, {
    model: 'WHPX 513',
    fluid: 'HFO 380 cSt',
  });
  assert.equal(specific.status, 'ok');
  assert.deepEqual(
    specific.data.capacities.map((capacity) => capacity.id),
    ['alfa-laval-whpx-513-hfo-380-cst'],
  );

  const generic = getCentrifugeCapacity(technicalCatalog, {
    model: 'WHPX 405',
    fluid: 'HFO',
  });
  assert.equal(generic.status, 'ok');
  assert.deepEqual(
    generic.data.capacities.map((capacity) => capacity.conditions.viscosity.value),
    [30, 40, 60, 100, 180, 380],
  );

  const naturalLanguage = getCentrifugeCapacity(technicalCatalog, {
    model: 'WHPX 513',
    fluid: 'HFO 380 cSt at 50 C',
  });
  assert.equal(naturalLanguage.status, 'ok');
  assert.equal(naturalLanguage.data.capacities.length, 1);
  assert.equal(naturalLanguage.data.capacities[0].conditions.viscosity.value, 380);

  const bareGrade = getCentrifugeCapacity(technicalCatalog, {
    model: 'WHPX 513',
    fluid: 'HFO 380',
  });
  assert.equal(bareGrade.status, 'ok');
  assert.deepEqual(
    bareGrade.data.capacities.map((capacity) => capacity.id),
    ['alfa-laval-whpx-513-hfo-380-cst'],
  );

  const exactOperatingTemperature = getCentrifugeCapacity(technicalCatalog, {
    model: 'WHPX 513',
    fluid: 'HFO 380 cSt centrifuged at 98 C',
  });
  assert.equal(exactOperatingTemperature.status, 'ok');
  assert.equal(exactOperatingTemperature.data.capacities.length, 1);

  const wrongTemperature = getCentrifugeCapacity(technicalCatalog, {
    model: 'WHPX 513',
    fluid: 'HFO 380 cSt at 70 C',
  });
  assert.equal(wrongTemperature.status, 'not_found');
  assert.deepEqual(wrongTemperature.data.capacities, []);

  const wrongScopedTemperature = getCentrifugeCapacity(technicalCatalog, {
    model: 'WHPX 513',
    fluid: 'HFO 380 cSt centrifuged at 50 C',
  });
  assert.equal(wrongScopedTemperature.status, 'not_found');
  assert.deepEqual(wrongScopedTemperature.data.capacities, []);

  const unsupported = getCentrifugeCapacity(technicalCatalog, {
    model: 'WHPX 405',
    fluid: 'HFO 600 cSt',
  });
  assert.equal(unsupported.status, 'not_found');
  assert.deepEqual(unsupported.data.capacities, []);
  assert.deepEqual(unsupported.sources, []);
});

test('published specifications identify owner attestation separately from OEM capacity evidence', () => {
  const result = getCentrifugeSpecifications(technicalCatalog, { model: 'MAB 103' });
  assert.equal(result.status, 'ok');
  assert.equal(result.data.specifications.motorPower.evidenceClass, 'first-party-owner-attestation');
  assert.equal(result.data.specifications.motorPower.publisher, 'Dolphin Centrifuge');
  assert.match(result.data.specifications.motorPower.reviewedBy, /authors\/sanjay-prabhu\/#person$/);
  assert.match(result.data.specifications.motorPower.scopeNote, /separate from OEM capacity-table provenance/i);
  assert.ok(result.sources.length > 0);
  assert.equal(result.sources[0].evidenceClass, 'first-party-owner-attestation');
  assert.match(result.sources[0].sourceUrl, /^https:\/\/dolphincentrifuge\.com\//);
});

test('models without published specifications return a non-answer instead of an empty success', () => {
  const result = getCentrifugeSpecifications(technicalCatalog, { model: 'MMPX 304' });
  assert.equal(result.status, 'not_found');
  assert.equal(result.answerability.canStateAsFact, false);
  assert.deepEqual(result.data.specifications, {});
  assert.deepEqual(result.sources, []);
  assert.match(result.warnings[0], /no source-backed specifications/i);
});

test('water lookups return not_found and never borrow diesel or fuel-oil values', () => {
  const lookups = [
    getCentrifugeCapacity(technicalCatalog, { model: 'WHPX 513', fluid: 'water' }),
    getCentrifugeCapacity(technicalCatalog, { model: 'MAB 103', fluid: 'water' }),
    getCentrifugeCapacity(technicalCatalog, {
      model: 'DMPX-070',
      baseMachineVariant: 'WHPX 513',
      fluid: 'water',
    }),
  ];

  for (const result of lookups) {
    assert.equal(result.status, 'not_found');
    assert.equal(result.answerability.canStateAsFact, false);
    assert.deepEqual(result.data.capacities, []);
    assert.deepEqual(result.sources, []);
  }
});

test('specification queries return published motor, voltage, skid, and MOC facts', () => {
  const packaged = getCentrifugeSpecifications(technicalCatalog, { model: 'DMPX-014' });
  assert.equal(packaged.status, 'ok');
  assert.ok(packaged.data.specifications.motorPower);
  assert.ok(packaged.data.specifications.voltage);
  assert.ok(packaged.data.specifications.skidDimensions);
  assert.ok(packaged.data.specifications.bowlConstruction);

  const materials = getCentrifugeSpecifications(technicalCatalog, { model: 'DMPX-028' });
  assert.equal(materials.status, 'ok');
  assert.ok(Array.isArray(materials.data.specifications.materialsOfConstruction));
  assert.ok(materials.data.specifications.materialsOfConstruction.length >= 3);

  for (const field of [
    packaged.data.specifications.motorPower,
    packaged.data.specifications.voltage,
    packaged.data.specifications.skidDimensions,
    packaged.data.specifications.bowlConstruction,
  ]) {
    assert.match(field.sourceUrl, /^https:\/\/dolphincentrifuge\.com\//);
    assert.equal(field.reviewedOn, technicalCatalog.lastReviewed);
  }
});

test('WebMCP runtime declares exactly four read-only tools and only feature-detects the browser API', async () => {
  const runtime = await readFile(path.join(ROOT, 'src/scripts/dolphinWebMcp.ts'), 'utf8');
  const declarations = [...runtime.matchAll(/\bname:\s*['"]([^'"]+)['"]/g)].map((match) => match[1]);

  assert.equal(declarations.length, 4);
  assert.deepEqual([...declarations].sort(), [...WEBMCP_TOOL_NAMES].sort());
  assert.match(runtime, /const annotations\s*=\s*\{[\s\S]*?readOnlyHint:\s*true,[\s\S]*?untrustedContentHint:\s*false/);
  assert.match(runtime, /typeof document === ['"]undefined['"]/);
  assert.match(runtime, /typeof modelContext\.registerTool !== ['"]function['"]/);
  assert.match(runtime, /modelContext\.registerTool\(tool\)/);
  assert.match(runtime, /execute:\s*\(input:\s*JsonObject,[\s\S]*?Promise<JsonObject>/);
  assert.match(runtime, /return query\(await getCatalog\(signal\)\);/);
  assert.match(runtime, /const MAX_TOOL_INPUT_LENGTH\s*=\s*200/);
  assert.match(runtime, /maxLength:\s*MAX_TOOL_INPUT_LENGTH/);
  assert.match(runtime, /withBoundedCatalogInput\(input, context/);
  assert.match(runtime, /resource === ['"]author['"][\s\S]*?dolphin\.author-identity\.v1/);
  assert.match(runtime, /Promise\.all\(registrations\)/);
  assert.match(runtime, /console\.warn\(['"]Dolphin WebMCP tool registration failed\./);
  assert.doesNotMatch(runtime, /stableStringify/);

  assert.ok(
    declarations.every((name) => !/^(?:create|delete|remove|send|set|update|write)_/i.test(name)),
    'The public WebMCP surface must not declare a write-capable tool',
  );
  assert.doesNotMatch(runtime, /document\.modelContext\s*=/);
  assert.doesNotMatch(runtime, /Object\.defineProperty\(\s*document\s*,\s*['"]modelContext['"]/);
  assert.doesNotMatch(runtime, /(?:import|require)[^\n]*(?:polyfill|shim)/i);
});

test('public crawler files advertise the catalog, tools, reviewer, and crawlability', async () => {
  const [llms, headers, robots] = await Promise.all([
    readFile(path.join(ROOT, 'public/llms.txt'), 'utf8'),
    readFile(path.join(ROOT, 'public/_headers'), 'utf8'),
    readFile(path.join(ROOT, 'public/robots.txt'), 'utf8'),
  ]);

  assert.match(llms, /https:\/\/dolphincentrifuge\.com\/technical-data\//);
  assert.ok(llms.includes(PUBLIC_CATALOG_URL));
  assert.ok(llms.includes(REVIEWER_ID));
  assert.ok(llms.includes(SCHEMA_VERSION));
  for (const toolName of WEBMCP_TOOL_NAMES) assert.ok(llms.includes(toolName), toolName);

  assert.match(headers, /^\/technical-data\/\*\.json\s*$/m);
  assert.match(headers, /^\s+Content-Type:\s*application\/json;\s*charset=utf-8\s*$/mi);
  assert.match(headers, /^\s+Cache-Control:\s*public,\s*max-age=3600,\s*s-maxage=86400\s*$/mi);
  assert.match(headers, /^\s+Origin-Agent-Cluster:\s*\?1\s*$/mi);

  assert.match(robots, /^User-agent:\s*\*\s*$/mi);
  assert.match(robots, /^Allow:\s*\/\s*$/mi);
  assert.match(robots, /^Sitemap:\s*https:\/\/dolphincentrifuge\.com\/sitemap-index\.xml\s*$/mi);
  assert.doesNotMatch(robots, /^Disallow:\s*\/technical-data(?:\/|\s*$)/mi);
});

test('built site publishes byte-equivalent data and discoverable WebMCP assets', async (t) => {
  if (!(await exists(DIST))) {
    t.skip('dist does not exist; build-specific assertions run after npm run build');
    return;
  }

  const builtCatalogPath = path.join(DIST, 'technical-data', 'centrifuges.v1.json');
  const technicalPagePath = path.join(DIST, 'technical-data', 'index.html');
  const representativePagePath = path.join(DIST, 'index.html');
  const builtHeadersPath = path.join(DIST, '_headers');

  const [builtCatalogText, technicalPage, representativePage, builtHeaders] = await Promise.all([
    readFile(builtCatalogPath, 'utf8'),
    readFile(technicalPagePath, 'utf8'),
    readFile(representativePagePath, 'utf8'),
    readFile(builtHeadersPath, 'utf8'),
  ]);

  assert.deepEqual(JSON.parse(builtCatalogText), technicalCatalog);
  assert.match(technicalPage, /href=["']\/technical-data\/centrifuges\.v1\.json["']/i);
  assert.match(technicalPage, /href=["']\/authors\/sanjay-prabhu\/["']/i);
  assert.match(builtHeaders, /^\/technical-data\/\*\.json\s*$/m);
  assert.match(builtHeaders, /^\s+Content-Type:\s*application\/json;\s*charset=utf-8\s*$/mi);

  const scriptUrls = [...representativePage.matchAll(/<script\b[^>]*\bsrc=(["'])(.*?)\1[^>]*>/gis)]
    .map((match) => match[2])
    .filter((url) => url.startsWith('/_astro/') && url.split(/[?#]/, 1)[0].endsWith('.js'));
  assert.ok(scriptUrls.length > 0, 'Home page must reference at least one bundled JavaScript asset');

  const bundledSources = await Promise.all(
    scriptUrls.map((url) =>
      readFile(path.join(DIST, decodeURIComponent(url.split(/[?#]/, 1)[0].replace(/^\//, ''))), 'utf8'),
    ),
  );
  const pageBundle = bundledSources.join('\n');
  for (const toolName of WEBMCP_TOOL_NAMES) {
    assert.ok(pageBundle.includes(toolName), `Home-page bundle must include ${toolName}`);
  }
});
