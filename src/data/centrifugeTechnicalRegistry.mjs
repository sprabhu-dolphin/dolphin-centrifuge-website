const SITE_URL = 'https://dolphincentrifuge.com';
const REVIEWED_ON = '2026-08-28';

export const US_GPM_DIVISOR = 227.124707;

const sourceDocuments = [
  {
    id: 'alfa-laval-mab-capacity-chart',
    title: 'Alfa Laval MAB Capacity Chart',
    sourceType: 'capacity table in Dolphin technical library',
    authority: 'Alfa Laval application-capacity values',
    publicAccess: 'not publicly hosted',
    sourceFileSha256: '913D42C2ED02375B0BD58E2DF671757D044A2AA87A314718EE41AB70EF4BC876',
    transcriptionRule: 'Only the published L/h cells are canonical. GPM cells and formulas in the workbook are intentionally ignored.',
    publicMethodologyUrl: `${SITE_URL}/technical-data/#methodology`,
  },
  {
    id: 'alfa-laval-whpx-capacities',
    title: 'Alfa Laval WHPX Capacities',
    sourceType: 'capacity table in Dolphin technical library',
    authority: 'Alfa Laval application-capacity values',
    publicAccess: 'not publicly hosted',
    sourceFileSha256: 'A88EE38A5499FE205269369C6F078B445C47181B9D4505A26B2F6C931C0C89E8',
    transcriptionRule: 'Only the published L/h cells are canonical. GPM cells and formulas in the workbook are intentionally ignored.',
    publicMethodologyUrl: `${SITE_URL}/technical-data/#methodology`,
  },
];

const roundGpm = (litersPerHour) => Number((litersPerHour / US_GPM_DIVISOR).toFixed(2));

const exact = (value) => ({ value, unit: 'L/h', valueStatus: 'published-tabular-value' });
const range = (minimum, maximum) => ({ minimum, maximum, unit: 'L/h', valueStatus: 'published-tabular-range' });
const exactWithCellText = (value, originalCellText = String(value)) => ({
  ...exact(value),
  originalCellText,
});
const rangeWithCellText = (minimum, maximum, originalCellText, normalization = undefined) => ({
  ...range(minimum, maximum),
  originalCellText,
  ...(normalization ? { normalization } : {}),
});

function convertSourceValue(sourceValue) {
  const shared = {
    unit: 'US GPM',
    derived: true,
    formula: 'L/h ÷ 227.124707',
    rounding: { decimalPlaces: 2, method: 'nearest' },
  };
  if ('value' in sourceValue) return [{ ...shared, value: roundGpm(sourceValue.value) }];
  return [{ ...shared, minimum: roundGpm(sourceValue.minimum), maximum: roundGpm(sourceValue.maximum) }];
}

function capacity({ modelId, key, fluid, category, sourceValue, conditions, ratingBasis, sourceDocumentId, sourceLocation, searchTerms = [] }) {
  const sourceDocument = sourceDocuments.find((document) => document.id === sourceDocumentId);
  return {
    id: `${modelId}-${key}`,
    fluid: { name: fluid, category, searchTerms },
    ratingBasis,
    sourceValue,
    derivedConversions: convertSourceValue(sourceValue),
    conditions,
    answerability: {
      canStateAsFact: true,
      qualificationRequired: true,
      requiredQualifiers: ['exact base machine', 'fluid', 'rating basis', 'listed viscosity and temperature conditions'],
    },
    source: {
      sourceDocumentId,
      sourceDocumentTitle: sourceDocument?.title,
      sourceFileSha256: sourceDocument?.sourceFileSha256,
      location: sourceLocation,
      valueField: 'L/h',
      reviewedOn: REVIEWED_ON,
      reviewedBy: `${SITE_URL}/authors/sanjay-prabhu/#person`,
      methodologyUrl: `${SITE_URL}/technical-data/#methodology`,
    },
  };
}

const capacityConditions = {
  ratedReference: {
    fluidDefinition: 'The source table does not identify a process fluid for this rated reference value.',
    useRestriction: 'Do not present this value as a diesel, water, or other application capacity.',
  },
  gasOil: {
    fluidTemperatureC: 40,
    sourceLabel: 'Gas Oil, 40 C',
  },
  diesel: {
    viscosity: { value: 13, unit: 'cSt', referenceTemperatureC: 40 },
    centrifugationTemperatureC: 40,
    sourceLabel: 'Diesel, 40 C, 13 cSt',
  },
  engineLube: {
    centrifugationTemperatureC: { minimum: 80, maximum: 90 },
    sourceLabel: 'Engine Lube Oil, 80-90 C',
  },
  steamTurbine: {
    centrifugationTemperatureC: { minimum: 60, maximum: 70 },
    sourceLabel: 'Steam Turbine Lube Oil, 60-70 C',
  },
  mabLubeRange: {
    centrifugationTemperatureC: { minimum: 80, maximum: 90 },
  },
};

const mabRows = [
  { model: 'MAB 103', row: 5, rated: 1300, gasOil: 1150, diesel: 900, ro: [400, 500], detergent: [300, 400], trunk: [200, 300], engineLube: 500, steamTurbine: 800 },
  { model: 'MAB 104', row: 6, rated: 2200, gasOil: 1950, diesel: 1500, ro: [700, 800], detergent: [600, 700], trunk: [400, 500], engineLube: 800, steamTurbine: 1400 },
  { model: 'MAB 204', row: 7, rated: 4300, gasOil: 3600, diesel: 2900, ro: [1300, 1500], detergent: [1100, 1300], trunk: [800, 900], engineLube: 1500, steamTurbine: 2800 },
  { model: 'MAB 205', row: 8, rated: 6500, gasOil: 5750, diesel: 4400, ro: [2000, 2300], detergent: [1600, 2000], trunk: [1200, 1400], engineLube: 2300, steamTurbine: 4200 },
  { model: 'MAB 206', row: 9, rated: 9500, gasOil: 8500, diesel: 6400, ro: [2900, 3300], detergent: [2400, 2900], trunk: [1700, 2100], engineLube: 3300, steamTurbine: 6200 },
  { model: 'MAB 207', row: 10, rated: 12500, gasOil: 11300, diesel: 8400, ro: [3800, 4400], detergent: [3100, 3800], trunk: [2300, 2800], engineLube: 4400, steamTurbine: 8100 },
  { model: 'MAB 209', row: 11, rated: 21000, gasOil: 18300, diesel: 14100, ro: [6300, 7400], detergent: [5300, 6300], trunk: [3800, 4600], engineLube: 7400, steamTurbine: 13700 },
];

function mabCapacities(modelId, row) {
  const sourceDocumentId = 'alfa-laval-mab-capacity-chart';
  return [
    capacity({ modelId, key: 'rated-reference', fluid: 'Rated reference capacity (fluid not specified)', category: 'reference', sourceValue: exact(row.rated), conditions: capacityConditions.ratedReference, ratingBasis: 'oem-rated-reference', sourceDocumentId, sourceLocation: `Sheet1!B${row.row}` }),
    capacity({ modelId, key: 'gas-oil', fluid: 'Gas oil', category: 'fuel-oil', searchTerms: ['light fuel oil', 'lfo'], sourceValue: exact(row.gasOil), conditions: capacityConditions.gasOil, ratingBasis: 'oem-application', sourceDocumentId, sourceLocation: `Sheet1!C${row.row}` }),
    capacity({ modelId, key: 'diesel', fluid: 'Diesel fuel', category: 'diesel', searchTerms: ['marine diesel', 'number 2 diesel', '#2 diesel'], sourceValue: exact(row.diesel), conditions: capacityConditions.diesel, ratingBasis: 'oem-application', sourceDocumentId, sourceLocation: `Sheet1!E${row.row}` }),
    capacity({ modelId, key: 'ro-lube-oil', fluid: 'R&O lube oil', category: 'lube-oil', searchTerms: ['rust and oxidation oil', 'hydraulic oil'], sourceValue: range(...row.ro), conditions: { ...capacityConditions.mabLubeRange, sourceLabel: 'R&O lube oil, 80-90 C' }, ratingBasis: 'oem-application-range', sourceDocumentId, sourceLocation: `Sheet1!G${row.row}` }),
    capacity({ modelId, key: 'detergent-lube-oil', fluid: 'Detergent lube oil', category: 'lube-oil', sourceValue: range(...row.detergent), conditions: { ...capacityConditions.mabLubeRange, sourceLabel: 'Detergent lube oil, 80-90 C' }, ratingBasis: 'oem-application-range', sourceDocumentId, sourceLocation: `Sheet1!H${row.row}` }),
    capacity({ modelId, key: 'trunk-piston-detergent-lube-oil', fluid: 'Trunk-piston detergent lube oil', category: 'lube-oil', searchTerms: ['trunk detergent oil'], sourceValue: range(...row.trunk), conditions: { ...capacityConditions.mabLubeRange, sourceLabel: 'Trunk detergent lube oil, 80-90 C' }, ratingBasis: 'oem-application-range', sourceDocumentId, sourceLocation: `Sheet1!I${row.row}` }),
    capacity({ modelId, key: 'engine-lube-oil', fluid: 'Engine lube oil', category: 'lube-oil', sourceValue: exact(row.engineLube), conditions: capacityConditions.engineLube, ratingBasis: 'oem-application', sourceDocumentId, sourceLocation: `Lube Oil Capacities!D${row.row}` }),
    capacity({ modelId, key: 'steam-turbine-lube-oil', fluid: 'Steam turbine lube oil', category: 'lube-oil', searchTerms: ['turbine oil'], sourceValue: exact(row.steamTurbine), conditions: capacityConditions.steamTurbine, ratingBasis: 'oem-application', sourceDocumentId, sourceLocation: `Lube Oil Capacities!F${row.row}` }),
  ];
}

const mopxRows = [
  { model: 'MAPX 204', row: 15, gasOil: 2700, diesel: 1800, engineLube: 900, steamTurbine: 1800 },
  { model: 'MOPX 205', row: 16, gasOil: 4900, diesel: 3300, engineLube: 1700, steamTurbine: 3200 },
  { model: 'MOPX 207', row: 17, gasOil: 7400, diesel: 5000, engineLube: 2600, steamTurbine: 4800 },
  { model: 'MOPX 209', row: 18, gasOil: 11800, diesel: 7900, engineLube: 4100, steamTurbine: 7700 },
  { model: 'MOPX 210', row: 19, gasOil: 14000, diesel: 9400, engineLube: 4900, steamTurbine: 9100 },
  { model: 'MOPX 213', row: 20, gasOil: 21500, diesel: 14400, engineLube: 7500, steamTurbine: 14000 },
];

function mopxCapacities(modelId, row) {
  const sourceDocumentId = 'alfa-laval-mab-capacity-chart';
  return [
    capacity({ modelId, key: 'gas-oil', fluid: 'Gas oil', category: 'fuel-oil', searchTerms: ['light fuel oil', 'lfo'], sourceValue: exact(row.gasOil), conditions: capacityConditions.gasOil, ratingBasis: 'oem-application', sourceDocumentId, sourceLocation: `Sheet1!C${row.row}` }),
    capacity({ modelId, key: 'diesel', fluid: 'Diesel fuel', category: 'diesel', searchTerms: ['marine diesel', 'number 2 diesel', '#2 diesel'], sourceValue: exact(row.diesel), conditions: capacityConditions.diesel, ratingBasis: 'oem-application', sourceDocumentId, sourceLocation: `Sheet1!E${row.row}` }),
    capacity({ modelId, key: 'engine-lube-oil', fluid: 'R&O / engine lube oil', category: 'lube-oil', searchTerms: ['hydraulic oil'], sourceValue: exact(row.engineLube), conditions: capacityConditions.engineLube, ratingBasis: 'oem-application', sourceDocumentId, sourceLocation: `Sheet1!G${row.row}` }),
    capacity({ modelId, key: 'steam-turbine-lube-oil', fluid: 'Steam turbine lube oil', category: 'lube-oil', searchTerms: ['turbine oil'], sourceValue: exact(row.steamTurbine), conditions: capacityConditions.steamTurbine, ratingBasis: 'oem-application', sourceDocumentId, sourceLocation: `Sheet1!J${row.row}` }),
  ];
}

const whpxRows = [
  {
    model: 'WHPX 405', row: 9, rated: 5500, diesel: 3700,
    hfo: { 30: 3400, 40: 3400, 60: 2600, 100: 2500, 180: 1700, 380: 1400 },
    lube: {
      crossHeadRo: { minimum: 1700, maximum: 1900, originalCellText: '1700-1900' },
      crossHeadDetergent: { minimum: 1400, maximum: 1700, originalCellText: '1400-1700' },
      trunkDetergent: { minimum: 1000, maximum: 1200, originalCellText: '1000-1200' },
      steamTurbine: { value: 3600, originalCellText: '3600' },
    },
  },
  {
    model: 'WHPX 407', row: 10, rated: 9000, diesel: 6000,
    hfo: { 30: 5600, 40: 5600, 60: 4200, 100: 4100, 180: 2800, 380: 2300, 460: 2000, 600: 1600 },
    lube: {
      crossHeadRo: { minimum: 2700, maximum: 3200, originalCellText: '2700-3200' },
      crossHeadDetergent: { minimum: 2300, maximum: 2700, originalCellText: '2300-2700' },
      trunkDetergent: { minimum: 1600, maximum: 2000, originalCellText: '1600-2000' },
      steamTurbine: { value: 5900, originalCellText: '5900' },
    },
  },
  {
    model: 'WHPX 409', row: 11, rated: 12500, diesel: 8400,
    hfo: { 30: 7800, 40: 7800, 60: 5900, 100: 5600, 180: 3900, 380: 3300, 460: 2800, 600: 2300 },
    lube: {
      crossHeadRo: { minimum: 3800, maximum: 4400, originalCellText: '3800-4400' },
      crossHeadDetergent: { minimum: 3100, maximum: 3800, originalCellText: '3100-3800' },
      trunkDetergent: { minimum: 2300, maximum: 2500, originalCellText: '2300-2500' },
      steamTurbine: { value: 8000, originalCellText: '8000' },
    },
  },
  {
    model: 'WHPX 510', row: 12, rated: 16000, diesel: 10700,
    hfo: { 30: 9900, 40: 9900, 60: 7500, 100: 7200, 180: 5000, 380: 4200, 460: 3500, 600: 2900 },
    lube: {
      crossHeadRo: { minimum: 4800, maximum: 5600, originalCellText: '4800-5600' },
      crossHeadDetergent: { minimum: 4000, maximum: 4800, originalCellText: '4000-4800' },
      trunkDetergent: { minimum: 2900, maximum: 3500, originalCellText: '2900-3500' },
      steamTurbine: { value: 10400, originalCellText: '10400' },
    },
  },
  {
    model: 'WHPX 513', row: 13, rated: 24500, diesel: 16400,
    hfo: { 30: 15200, 40: 15200, 60: 11500, 100: 11000, 180: 7600, 380: 6400, 460: 5400, 600: 4400 },
    lube: {
      crossHeadRo: { minimum: 7400, maximum: 8600, originalCellText: '7400-8600' },
      crossHeadDetergent: {
        minimum: 7400,
        maximum: 8100,
        originalCellText: '8100-7400',
        normalization: {
          applied: true,
          anomaly: 'The source cell lists the two range endpoints in descending order.',
          note: 'The queryable minimum and maximum are normalized to ascending order (7400-8100 L/h); originalCellText preserves the exact source text.',
        },
      },
      trunkDetergent: { minimum: 4400, maximum: 5400, originalCellText: '4400-5400' },
      steamTurbine: { value: 15900, originalCellText: '15900' },
    },
  },
];

const hfoColumns = { 30: 'E', 40: 'F', 60: 'G', 100: 'H', 180: 'I', 380: 'J', 460: 'K', 600: 'L' };
const hfoCentrifugationTemperature = {
  30: { minimum: 70, maximum: 98 },
  40: { minimum: 80, maximum: 98 },
  60: { minimum: 80, maximum: 98 },
  100: { minimum: 90, maximum: 98 },
  180: { minimum: 90, maximum: 98 },
  380: 98,
  460: 98,
  600: 98,
};

function whpxCapacities(modelId, row) {
  const sourceDocumentId = 'alfa-laval-whpx-capacities';
  const records = [
    capacity({ modelId, key: 'rated-reference', fluid: 'Rated reference capacity (fluid not specified)', category: 'reference', sourceValue: exact(row.rated), conditions: capacityConditions.ratedReference, ratingBasis: 'oem-rated-reference', sourceDocumentId, sourceLocation: `Sheet1!B${row.row}` }),
    capacity({ modelId, key: 'marine-diesel', fluid: 'Marine diesel', category: 'diesel', searchTerms: ['diesel fuel', 'number 2 diesel', '#2 diesel'], sourceValue: exact(row.diesel), conditions: capacityConditions.diesel, ratingBasis: 'oem-application', sourceDocumentId, sourceLocation: `Sheet1!C${row.row}` }),
  ];
  for (const [viscosityText, litersPerHour] of Object.entries(row.hfo)) {
    const viscosity = Number(viscosityText);
    records.push(capacity({
      modelId,
      key: `hfo-${viscosity}-cst`,
      fluid: `Heavy fuel oil, ${viscosity} cSt`,
      category: 'heavy-fuel-oil',
      searchTerms: ['hfo', 'fuel oil'],
      sourceValue: exact(litersPerHour),
      conditions: {
        viscosity: { value: viscosity, unit: 'cSt', referenceTemperatureC: 50 },
        centrifugationTemperatureC: hfoCentrifugationTemperature[viscosity],
        sourceLabel: `Heavy Fuel Oil, ${viscosity} cSt at 50 C`,
      },
      ratingBasis: 'oem-application',
      sourceDocumentId,
      sourceLocation: `Sheet1!${hfoColumns[viscosity]}${row.row}`,
    }));
  }
  records.push(
    capacity({
      modelId,
      key: 'cross-head-ro-lube-oil',
      fluid: 'Cross-head R&O lube oil',
      category: 'lube-oil',
      searchTerms: ['crosshead R&O oil', 'cross-head rust and oxidation oil'],
      sourceValue: rangeWithCellText(
        row.lube.crossHeadRo.minimum,
        row.lube.crossHeadRo.maximum,
        row.lube.crossHeadRo.originalCellText,
      ),
      conditions: { centrifugationTemperatureC: { minimum: 80, maximum: 90 }, sourceLabel: 'Diesel Engine, Cross-Head, R&O, 80-90 C' },
      ratingBasis: 'oem-application-range',
      sourceDocumentId,
      sourceLocation: `Sheet1!M${row.row}`,
    }),
    capacity({
      modelId,
      key: 'cross-head-detergent-lube-oil',
      fluid: 'Cross-head detergent lube oil',
      category: 'lube-oil',
      searchTerms: ['crosshead detergent oil'],
      sourceValue: rangeWithCellText(
        row.lube.crossHeadDetergent.minimum,
        row.lube.crossHeadDetergent.maximum,
        row.lube.crossHeadDetergent.originalCellText,
        row.lube.crossHeadDetergent.normalization,
      ),
      conditions: { centrifugationTemperatureC: { minimum: 80, maximum: 90 }, sourceLabel: 'Diesel Engine, Cross-Head, Detergent, 80-90 C' },
      ratingBasis: 'oem-application-range',
      sourceDocumentId,
      sourceLocation: `Sheet1!N${row.row}`,
    }),
    capacity({
      modelId,
      key: 'trunk-detergent-lube-oil',
      fluid: 'Trunk detergent lube oil',
      category: 'lube-oil',
      searchTerms: ['trunk-piston detergent lube oil', 'trunk detergent oil'],
      sourceValue: rangeWithCellText(
        row.lube.trunkDetergent.minimum,
        row.lube.trunkDetergent.maximum,
        row.lube.trunkDetergent.originalCellText,
      ),
      conditions: { centrifugationTemperatureC: { minimum: 80, maximum: 90 }, sourceLabel: 'Diesel Engine, Trunk Detergent, 80-90 C' },
      ratingBasis: 'oem-application-range',
      sourceDocumentId,
      sourceLocation: `Sheet1!O${row.row}`,
    }),
    capacity({
      modelId,
      key: 'steam-turbine-lube-oil',
      fluid: 'Steam turbine lube oil',
      category: 'lube-oil',
      searchTerms: ['turbine oil'],
      sourceValue: exactWithCellText(row.lube.steamTurbine.value, row.lube.steamTurbine.originalCellText),
      conditions: { centrifugationTemperatureC: { minimum: 60, maximum: 70 }, sourceLabel: 'Steam Turbine, 60-70 C' },
      ratingBasis: 'oem-application',
      sourceDocumentId,
      sourceLocation: `Sheet1!P${row.row}`,
    }),
  );
  return records;
}

const specSource = (page, extra = {}) => ({
  basis: 'Dolphin-published machine specification',
  evidenceClass: 'first-party-owner-attestation',
  publisher: 'Dolphin Centrifuge',
  sourceUrl: `${SITE_URL}${page}`,
  reviewedOn: REVIEWED_ON,
  reviewedBy: `${SITE_URL}/authors/sanjay-prabhu/#person`,
  scopeNote: 'Authoritative for the stated Dolphin machine or package configuration; separate from OEM capacity-table provenance.',
  ...extra,
});

const materialSet = (page) => [
  { component: 'Bowl body and bowl hood', material: '316L duplex stainless steel', ...specSource(page) },
  { component: 'Disc stack', material: '316L duplex stainless steel', ...specSource(page) },
  { component: 'Distributor / disc carrier', material: 'Marine-grade bronze; 316 stainless steel special-order option', ...specSource(page) },
  { component: 'Top disc', material: 'Marine-grade bronze; 316 stainless steel special-order option', ...specSource(page) },
  { component: 'Collecting covers', material: 'Silium aluminum alloy', ...specSource(page) },
  { component: 'Frame', material: 'Nodular cast iron', ...specSource(page) },
];

const knownSpecs = {
  'alfa-laval-mab-103': {
    cleaningMethod: { value: 'manual-clean / solid-retaining', ...specSource('/alfa-laval-mab-103-centrifuge/') },
    motorPower: { value: 1, unit: 'HP', ...specSource('/alfa-laval-mab-103-centrifuge/') },
    voltage: { values: [230, 460], unit: 'V', alternatives: ['110 V single-phase'], ...specSource('/alfa-laval-mab-103-centrifuge/') },
    dimensions: { width: 24, length: 30, height: 26, unit: 'in', scope: 'bare centrifuge', ...specSource('/alfa-laval-mab-103-centrifuge/') },
    bowlSpeed: { value: 8600, unit: 'RPM', ...specSource('/alfa-laval-mab-103-centrifuge/') },
    sludgeSpace: { value: 0.14, unit: 'US gal', ...specSource('/alfa-laval-mab-103-centrifuge/') },
    materialsOfConstruction: materialSet('/alfa-laval-mab-103-centrifuge/#material-of-construction'),
  },
  'alfa-laval-mab-104': {
    cleaningMethod: { value: 'manual-clean / solid-retaining', ...specSource('/alfa-laval-mab-104-centrifuge/') },
    motorPower: { value: 2, unit: 'HP', ...specSource('/alfa-laval-mab-104-centrifuge/') },
    voltage: { values: [230, 460], unit: 'V', alternatives: ['110 V single-phase'], ...specSource('/alfa-laval-mab-104-centrifuge/') },
    dimensions: { width: 30, length: 38, height: 43, unit: 'in', scope: 'bare centrifuge', ...specSource('/alfa-laval-mab-104-centrifuge/') },
    bowlSpeed: { value: 7500, unit: 'RPM', ...specSource('/alfa-laval-mab-104-centrifuge/') },
    sludgeSpace: { value: 0.25, unit: 'US gal', ...specSource('/alfa-laval-mab-104-centrifuge/') },
    materialsOfConstruction: materialSet('/alfa-laval-mab-104-centrifuge/#material-of-construction'),
  },
};

const mabLargeSpecs = {
  'MAB 204': { motor: 4, sludge: 0.40 },
  'MAB 205': { motor: 5, sludge: 0.48 },
  'MAB 206': { motor: 7.5, sludge: 0.88 },
  'MAB 207': { motor: 10, sludge: 1.10 },
  'MAB 209': { motor: 15, sludge: 2.00 },
};

function modelId(model) {
  return `alfa-laval-${model.toLowerCase().replace(/\s+/g, '-')}`;
}

function modelAliases(model) {
  return [model, model.replace(/\s+/g, ''), model.replace(/\s+/g, '-')];
}

function technicalAnchor(id) {
  return `${SITE_URL}/technical-data/#${id}`;
}

function oemModel({ model, capacities = [], canonicalPage, specifications = {}, aliases = [] }) {
  const id = modelId(model);
  return {
    id,
    displayName: `Alfa Laval ${model}`,
    manufacturer: 'Alfa Laval',
    recordType: 'oem-base-machine',
    aliases: [...new Set([...modelAliases(model), ...aliases])],
    canonicalPage: canonicalPage || technicalAnchor(id),
    machineReadableRecord: `${SITE_URL}/technical-data/${id}.json`,
    specifications,
    capacities,
    dataCompleteness: {
      capacity: capacities.length ? 'source-backed' : 'not available in this catalog',
      specifications: Object.keys(specifications).length ? 'partial; only published fields are included' : 'not yet published',
    },
  };
}

const mabModels = mabRows.map((row) => {
  const id = modelId(row.model);
  const large = mabLargeSpecs[row.model];
  const page = row.model === 'MAB 103'
    ? '/alfa-laval-mab-103-centrifuge/'
    : row.model === 'MAB 104'
      ? '/alfa-laval-mab-104-centrifuge/'
      : `/alfa-laval-mab-centrifuge/#${row.model.toLowerCase().replace(' ', '-')}`;
  const specifications = knownSpecs[id] || (large ? {
    cleaningMethod: { value: 'manual-clean / solid-retaining', ...specSource(page) },
    motorPower: { value: large.motor, unit: 'HP', ...specSource(page) },
    voltage: { values: [230, 460], unit: 'V', ...specSource(page) },
    sludgeSpace: { value: large.sludge, unit: 'US gal', ...specSource(page) },
  } : {});
  return oemModel({ model: row.model, canonicalPage: `${SITE_URL}${page}`, specifications, capacities: mabCapacities(id, row) });
});

const mopxSpecByModel = {
  'MOPX 205': { motor: 4, sludge: 0.38, voltage: [230, 460], page: '/alfa-laval-whpx-405/#mopx-205' },
  'MOPX 207': { motor: 7.5, sludge: 1.00, voltage: [230, 460], rpm: 6325, dimensions: [30, 38, 43], page: '/alfa-laval-mopx-207-centrifuge/' },
  'MOPX 209': { motor: 15, sludge: 2.00, voltage: [230, 460], rpm: 5180, page: '/alfa-laval-mopx-209-centrifuge/' },
};

const mopxCanonicalPages = {
  'MOPX 207': '/alfa-laval-mopx-207-centrifuge/',
  'MOPX 209': '/alfa-laval-mopx-209-centrifuge/',
};

const mopxModels = mopxRows.map((row) => {
  const id = modelId(row.model);
  const published = mopxSpecByModel[row.model];
  const specifications = published ? {
    cleaningMethod: { value: 'automatic self-cleaning', ...specSource(published.page) },
    motorPower: { value: published.motor, unit: 'HP', ...specSource(published.page) },
    voltage: { values: published.voltage, unit: 'V', phases: 3, ...specSource(published.page) },
    sludgeSpace: { value: published.sludge, unit: 'US gal', ...specSource(published.page) },
    ...(published.rpm ? { bowlSpeed: { value: published.rpm, unit: 'RPM', ...specSource(published.page) } } : {}),
    ...(published.dimensions ? { dimensions: { width: published.dimensions[0], length: published.dimensions[1], height: published.dimensions[2], unit: 'in', scope: 'bare centrifuge', ...specSource(published.page) } } : {}),
    ...(row.model === 'MOPX 207' ? { materialsOfConstruction: materialSet('/alfa-laval-mopx-207-centrifuge/#material') } : {}),
  } : {};
  return oemModel({ model: row.model, canonicalPage: mopxCanonicalPages[row.model] ? `${SITE_URL}${mopxCanonicalPages[row.model]}` : undefined, specifications, capacities: mopxCapacities(id, row) });
});

const whpxSpecByModel = {
  'WHPX 405': { motor: 5, sludge: 0.36, rpm: 7600, page: '/alfa-laval-whpx-405/' },
  'WHPX 407': { motor: 10, sludge: 1.30, rpm: 7125, page: '/alfa-laval-mopx-207-centrifuge/#whpx-407' },
  'WHPX 409': { motor: 12.5, sludge: 1.30, rpm: 7125, page: '/alfa-laval-mopx-209-centrifuge/#whpx-409' },
  'WHPX 510': { motor: 10, sludge: 1.62, rpm: 5180, page: '/alfa-laval-whpx-510-centrifuge/' },
  'WHPX 513': { motor: 15, sludge: 3.87, page: '/alfa-laval-whpx-513/' },
};

const whpxModels = whpxRows.map((row) => {
  const id = modelId(row.model);
  const published = whpxSpecByModel[row.model];
  const specifications = {
    cleaningMethod: { value: 'automatic partial-discharge / self-cleaning', ...specSource(published.page) },
    motorPower: { value: published.motor, unit: 'HP', ...specSource(published.page) },
    voltage: { values: [230, 460], unit: 'V', phases: 3, ...specSource(published.page) },
    sludgeSpace: { value: published.sludge, unit: 'US gal', ...specSource(published.page) },
    ...(published.rpm ? { bowlSpeed: { value: published.rpm, unit: 'RPM', ...specSource(published.page) } } : {}),
  };
  return oemModel({ model: row.model, canonicalPage: `${SITE_URL}${published.page}`, specifications, capacities: whpxCapacities(id, row) });
});

const oemCapacityModels = [...mabModels, ...mopxModels, ...whpxModels];

const stubBaseModels = [
  oemModel({ model: 'MMPX 304', aliases: ['MMPX304'] }),
  oemModel({ model: 'MMPX 404', aliases: ['MMPX404'] }),
];

function commercialModel({ id, displayName, baseMachineVariantIds, canonicalPage, specifications = {}, series }) {
  return {
    id,
    displayName,
    manufacturer: 'Dolphin Centrifuge',
    recordType: 'dolphin-commercial-class',
    series,
    aliases: [displayName.replace('Dolphin ', ''), displayName.replace('Dolphin ', '').replace('-', ' '), id],
    canonicalPage: `${SITE_URL}${canonicalPage}`,
    machineReadableRecord: `${SITE_URL}/technical-data/${id}.json`,
    baseMachineVariantIds,
    requiresBaseModelSelection: baseMachineVariantIds.length > 1,
    specifications,
    capacities: [],
    capacityRule: baseMachineVariantIds.length > 1
      ? 'This is a commercial class, not one universal flow rating. Select the exact Alfa Laval base machine before stating capacity.'
      : 'Capacity is inherited only from the named exact base machine and must retain that machine, fluid, basis, viscosity, and temperature.',
  };
}

const dmbMappings = [
  ['dolphin-dmb-004', 'Dolphin DMB-004', 'alfa-laval-mab-103', '/centrifuges/dmb-004/'],
  ['dolphin-dmb-007', 'Dolphin DMB-007', 'alfa-laval-mab-104', '/centrifuges/dmb-007/'],
  ['dolphin-dmb-013', 'Dolphin DMB-013', 'alfa-laval-mab-204', '/centrifuges/dmb-013/'],
  ['dolphin-dmb-019', 'Dolphin DMB-019', 'alfa-laval-mab-205', '/centrifuges/dmb-019/'],
  ['dolphin-dmb-028', 'Dolphin DMB-028', 'alfa-laval-mab-206', '/centrifuges/dmb-028/'],
  ['dolphin-dmb-037', 'Dolphin DMB-037', 'alfa-laval-mab-207', '/centrifuges/dmb-037/'],
  ['dolphin-dmb-062', 'Dolphin DMB-062', 'alfa-laval-mab-209', '/centrifuges/dmb-062/'],
];

const dmbModels = dmbMappings.map(([id, displayName, base, page]) => commercialModel({
  id,
  displayName,
  baseMachineVariantIds: [base],
  canonicalPage: page,
  series: 'DMB',
  specifications: {
    cleaningMethod: { value: 'manual-clean', ...specSource(page) },
    separationType: { value: 'disc-stack liquid/solid separation; configuration-dependent liquid phases', ...specSource(page) },
  },
}));

const dmpxModels = [
  commercialModel({
    id: 'dolphin-dmpx-010', displayName: 'Dolphin DMPX-010', series: 'DMPX', canonicalPage: '/centrifuges/dmpx-010/',
    baseMachineVariantIds: ['alfa-laval-mmpx-304', 'alfa-laval-mmpx-404', 'alfa-laval-mapx-204'],
    specifications: {
      cleaningMethod: { value: 'automatic self-cleaning', ...specSource('/centrifuges/dmpx-010/') },
      separationType: { value: 'three-phase oil / water / solids', ...specSource('/centrifuges/dmpx-010/') },
      motorPower: { minimum: 3.5, maximum: 5, unit: 'HP', approximate: true, ...specSource('/centrifuges/dmpx-010/') },
      sludgeSpace: { value: 0.16, unit: 'US gal', ...specSource('/centrifuges/dmpx-010/') },
    },
  }),
  commercialModel({
    id: 'dolphin-dmpx-014', displayName: 'Dolphin DMPX-014', series: 'DMPX', canonicalPage: '/dmpx-014-self-cleaning-3-phase-disc-stack-centrifuge/',
    baseMachineVariantIds: ['alfa-laval-mopx-205', 'alfa-laval-whpx-405'],
    specifications: {
      cleaningMethod: { value: 'automatic self-cleaning', ...specSource('/dmpx-014-self-cleaning-3-phase-disc-stack-centrifuge/') },
      separationType: { value: 'three-phase light liquid / heavy liquid / solids', ...specSource('/dmpx-014-self-cleaning-3-phase-disc-stack-centrifuge/') },
      motorPower: { value: 5, unit: 'HP', standard: true, ...specSource('/dmpx-014-self-cleaning-3-phase-disc-stack-centrifuge/') },
      voltage: { values: [230, 460], unit: 'V', phases: 3, frequencyHz: 60, alternativesAvailable: true, ...specSource('/dmpx-014-self-cleaning-3-phase-disc-stack-centrifuge/') },
      skidDimensions: { width: 36, length: 60, height: 60, unit: 'in', approximate: true, ...specSource('/dmpx-014-self-cleaning-3-phase-disc-stack-centrifuge/') },
      bowlConstruction: { standard: 'Carbon steel', option: '316L stainless steel', ...specSource('/dmpx-014-self-cleaning-3-phase-disc-stack-centrifuge/') },
      sludgeSpace: { minimum: 0.32, maximum: 0.34, unit: 'US gal', ...specSource('/dmpx-014-self-cleaning-3-phase-disc-stack-centrifuge/') },
    },
  }),
  commercialModel({
    id: 'dolphin-dmpx-028', displayName: 'Dolphin DMPX-028', series: 'DMPX', canonicalPage: '/centrifuges/dmpx-028/',
    baseMachineVariantIds: ['alfa-laval-mopx-207', 'alfa-laval-whpx-407'],
    specifications: {
      cleaningMethod: { value: 'automatic self-cleaning', ...specSource('/centrifuges/dmpx-028/') },
      separationType: { value: 'three-phase oil / water / solids', ...specSource('/centrifuges/dmpx-028/') },
      motorPower: { minimum: 7.5, maximum: 10, unit: 'HP', variantDependent: true, ...specSource('/centrifuges/dmpx-028/') },
      voltage: { values: [230, 460], unit: 'V', phases: 3, ...specSource('/centrifuges/dmpx-028/') },
      dimensions: { width: 30, length: 38, height: 43, unit: 'in', scope: 'bare centrifuge', approximate: true, variantDependent: true, ...specSource('/centrifuges/dmpx-028/') },
      sludgeSpace: { value: 1.03, unit: 'US gal', ...specSource('/centrifuges/dmpx-028/') },
      materialsOfConstruction: materialSet('/centrifuges/dmpx-028/#technical-specifications'),
    },
  }),
  commercialModel({
    id: 'dolphin-dmpx-042', displayName: 'Dolphin DMPX-042', series: 'DMPX', canonicalPage: '/centrifuges/dmpx-042/',
    baseMachineVariantIds: ['alfa-laval-mopx-209', 'alfa-laval-mopx-210', 'alfa-laval-whpx-409', 'alfa-laval-whpx-510'],
    specifications: {
      cleaningMethod: { value: 'automatic self-cleaning', ...specSource('/centrifuges/dmpx-042/') },
      separationType: { value: 'three-phase oil / water / solids', ...specSource('/centrifuges/dmpx-042/') },
      motorPower: { minimum: 10, maximum: 15, unit: 'HP', variantDependent: true, ...specSource('/centrifuges/dmpx-042/') },
      voltage: { values: [230, 460], unit: 'V', phases: 3, ...specSource('/centrifuges/dmpx-042/') },
      sludgeSpace: { minimum: 1.64, maximum: 1.66, unit: 'US gal', variantDependent: true, ...specSource('/centrifuges/dmpx-042/') },
    },
  }),
  commercialModel({
    id: 'dolphin-dmpx-070', displayName: 'Dolphin DMPX-070', series: 'DMPX', canonicalPage: '/centrifuges/dmpx-070/',
    baseMachineVariantIds: ['alfa-laval-mopx-213', 'alfa-laval-whpx-513'],
    specifications: {
      cleaningMethod: { value: 'automatic self-cleaning', ...specSource('/centrifuges/dmpx-070/') },
      separationType: { value: 'three-phase oil / water / solids', ...specSource('/centrifuges/dmpx-070/') },
      motorPower: { value: 15, unit: 'HP', ...specSource('/centrifuges/dmpx-070/') },
      voltage: { values: [230, 460], unit: 'V', phases: 3, ...specSource('/centrifuges/dmpx-070/') },
      sludgeSpace: { minimum: 3.65, maximum: 3.96, unit: 'US gal', variantDependent: true, ...specSource('/centrifuges/dmpx-070/') },
    },
  }),
];

const models = [...oemCapacityModels, ...stubBaseModels, ...dmbModels, ...dmpxModels];

export const technicalCatalog = {
  schemaVersion: 'dolphin-centrifuge-technical-v1',
  catalogId: `${SITE_URL}/technical-data/centrifuges.v1.json`,
  title: 'Dolphin Centrifuge Authoritative Technical Catalog',
  lastReviewed: REVIEWED_ON,
  reviewedBy: {
    id: `${SITE_URL}/authors/sanjay-prabhu/#person`,
    name: 'Sanjay Prabhu, M.S.M.E.',
    role: 'Owner and Chief Engineer',
    profile: `${SITE_URL}/authors/sanjay-prabhu/`,
    machineReadableProfile: `${SITE_URL}/authors/sanjay-prabhu.json`,
  },
  publisher: {
    name: 'Dolphin Centrifuge',
    url: SITE_URL,
    relationshipToAlfaLaval: 'Independent remanufacturer; not affiliated with Alfa Laval.',
  },
  agentInterface: {
    webMcp: {
      status: 'experimental-draft',
      standardsStatus: 'W3C Community Group Draft Report; WebMCP is not a W3C Standard.',
      specificationUrl: 'https://webmachinelearning.github.io/webmcp/',
      browserApi: 'document.modelContext',
      tools: [
        'find_centrifuge_models',
        'get_centrifuge_specifications',
        'get_centrifuge_capacity',
        'get_technical_author_identity',
      ],
    },
    publicJsonFallback: `${SITE_URL}/technical-data/centrifuges.v1.json`,
  },
  methodology: {
    capacitySourceOfTruth: 'Original published L/h cells in the cited Alfa Laval capacity tables',
    conversion: { from: 'L/h', to: 'US GPM', formula: 'L/h ÷ 227.124707', decimalPlaces: 2 },
    rules: [
      'Never use or repeat the workbook GPM cells; several use inconsistent conversion factors.',
      'Always keep exact base machine, fluid, rating basis, viscosity, and temperature attached to a capacity.',
      'Dolphin DMB and DMPX names are commercial classes. They are not universal flow ratings.',
      'Never borrow a capacity across different base machines or fluids.',
      'No water capacity is inferred from diesel or fuel-oil data.',
      'Unknown specifications remain absent rather than inferred.',
    ],
    humanReadableUrl: `${SITE_URL}/technical-data/#methodology`,
  },
  sourceDocuments,
  statistics: {
    modelRecords: models.length,
    exactOemCapacityModels: oemCapacityModels.length,
    capacityRecords: models.reduce((sum, model) => sum + model.capacities.length, 0),
  },
  models,
};

export default technicalCatalog;
