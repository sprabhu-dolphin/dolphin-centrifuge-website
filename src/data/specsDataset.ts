/**
 * Machine-readable centrifuge specifications dataset (JSON + CSV), built from the one
 * spec source (centrifugeSpecs.ts) plus the dated stock list (stockList.mjs).
 *
 * Agent-only by owner decision 2026-10-12: served at /technical-data/alfa-laval-centrifuge-specs.v1.{json,csv},
 * listed in llms.txt and in Dataset JSON-LD on /alfa-laval-centrifuges/. Never link it from a
 * visible HTML page and never add it to the sitemap.
 *
 * Nothing here adds a number. Every value is read from the spec source; a field the source
 * leaves out stays null. Capacities always travel with their fluid and conditions.
 */
import { models, SPEC_SOURCE_REVIEWED, type Capacity, type Dimension, type ModelSpec, type Numeric } from './centrifugeSpecs';
import { stockList } from './stockList.mjs';

const SITE = 'https://dolphincentrifuge.com';
export const SPECS_DATASET_JSON_PATH = '/technical-data/alfa-laval-centrifuge-specs.v1.json';
export const SPECS_DATASET_CSV_PATH = '/technical-data/alfa-laval-centrifuge-specs.v1.csv';
export const SPECS_DATASET_README_PATH = '/technical-data/README.txt';

export const SPECS_DATASET_LICENSE =
  'Free to use and cite for engineering evaluation and AI assistants with attribution to Dolphin Centrifuge, Warren, Michigan, https://dolphincentrifuge.com. Figures are published manufacturer values or Dolphin-measured values as noted per row; verify against the formal proposal.';
export const SPECS_DATASET_NOTES = 'Dolphin Centrifuge is an independent remanufacturer and is not affiliated with Alfa Laval.';
export const SPECS_DATASET_NAME = 'Alfa Laval Centrifuge Specifications (Dolphin Centrifuge)';
export const SPECS_DATASET_DESCRIPTION =
  'Machine-readable specifications for Alfa Laval and Sharples disc stack and decanter centrifuges and the Dolphin DMPX and DMB modules built on them: bowl speed, G-force, motor, capacity stated with its fluid and conditions, sludge space, weight, dimensions and Dolphin stock status.';
/** Latest of the spec-source review date and the stock-list date. */
export const SPECS_DATASET_AS_OF = [SPEC_SOURCE_REVIEWED, stockList.asOf].sort().at(-1) as string;

const HP_TO_KW = 0.7457;

type Range = { min: number; max: number };
const num = (v: Numeric | undefined): number | Range | null =>
  v === undefined ? null : Array.isArray(v) ? { min: v[0], max: v[1] } : v;
const fmt = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 2 });
const numText = (v: Numeric) => (Array.isArray(v) ? `${fmt(v[0])}-${fmt(v[1])}` : fmt(v));
const dimText = (d: Dimension | undefined) => {
  if (!d) return null;
  const other = d.alsoMm !== undefined ? ` (${numText(d.alsoMm)} mm)` : d.alsoIn !== undefined ? ` (${numText(d.alsoIn)} in)` : '';
  return `${numText(d.value)} ${d.unit}${other}`;
};

/** Where a capacity figure comes from. */
function capacitySource(c: Capacity, m: ModelSpec): string {
  if (c.ruling?.startsWith('technical registry')) return 'Alfa Laval published data';
  if (c.kind === 'actual') return 'Dolphin measured';
  if (m.manufacturer === 'Dolphin Centrifuge') return 'Dolphin published module rating';
  return 'Dolphin published rating';
}

const BASIS: Record<Capacity['kind'], string> = {
  rated: 'rated',
  actual: 'actual throughput',
  maximum: 'maximum',
  reference: 'OEM rated reference, fluid not specified; not an application capacity',
};

function capacityRecord(c: Capacity, m: ModelSpec) {
  const conditions = c.conditions ?? null;
  const gpm = c.derivedGpm !== undefined ? ` (${numText(c.derivedGpm)} US GPM derived)` : '';
  const text = `${numText(c.value)} ${c.unit}${gpm} on ${c.fluid} (conditions: ${conditions ?? 'not stated in source'}) [${BASIS[c.kind]}; ${capacitySource(c, m)}]`;
  return {
    fluid: c.fluid,
    conditions,
    basis: BASIS[c.kind],
    value: num(c.value),
    unit: c.unit,
    derivedUsGpm: num(c.derivedGpm),
    source: capacitySource(c, m),
    ...(c.note ? { note: c.note } : {}),
    text,
  };
}

function cleaning(m: ModelSpec): string | null {
  if (m.family === 'decanter') return null;
  const t = (m.bowlType ?? '').toLowerCase();
  if (/manual/.test(t)) return 'manual';
  if (/nozzle/.test(t)) return 'nozzle';
  if (/self-cleaning|discharge/.test(t)) return 'self-cleaning';
  const stockTypes = new Set(stockUnits(m).map((u) => u.type));
  if (stockTypes.size === 1) {
    if (stockTypes.has('disc stack self-cleaning')) return 'self-cleaning';
    if (stockTypes.has('disc stack manual-clean')) return 'manual';
  }
  return null;
}

const norm = (s: string) => s.toUpperCase().replace(/^(SHARPLES|ALDEC)\s+/, '').replace(/[^A-Z0-9]/g, '');

function stockUnits(m: ModelSpec) {
  if (m.manufacturer === 'Dolphin Centrifuge') return [];
  const keys = new Set([m.designation, ...(m.aliases ?? [])].map(norm));
  return stockList.units.filter((u) => keys.has(norm(u.model)));
}

/** "in stock" when a finished or new unit is listed, "built to order" when only cores to remanufacture are listed. */
function dolphinStock(m: ModelSpec): 'in stock' | 'built to order' | null {
  const units = stockUnits(m).filter((u) => u.status === 'in stock');
  if (units.length === 0) return null;
  return units.some((u) => u.condition !== 'remanufactured to order') ? 'in stock' : 'built to order';
}

/** Model family / series prefix, e.g. "WHPX", "MAB", "NX", "Sharples P", "ALDEC G2". */
function series(m: ModelSpec): string {
  if (/sharples/i.test(m.manufacturer)) return 'Sharples P';
  if (/^G2/.test(m.designation)) return 'ALDEC G2';
  return m.designation.match(/^[A-Za-z]+/)?.[0] ?? m.designation;
}

const NOT_AN_APPLICATION = /not specified|not stated|process duty/i;

function modelRow(m: ModelSpec) {
  const capacities = m.capacities.map((c) => capacityRecord(c, m));
  const sources = [...new Set(capacities.map((c) => c.source))];
  const hp = m.motorHp;
  return {
    id: m.id,
    manufacturer: m.manufacturer,
    model: m.designation,
    modelType: m.modelType ?? null,
    aliases: m.aliases ?? [],
    family: series(m),
    type: m.family === 'disc-stack' ? 'disc stack' : m.family,
    cleaning: cleaning(m),
    separationType: m.separationType ?? null,
    bowlSpeedRpm: num(m.bowlSpeedRpm),
    gForce: typeof m.gForce === 'string' ? m.gForce : num(m.gForce),
    motorHp: num(hp),
    motorKwDerived: hp === undefined ? null : Array.isArray(hp) ? { min: +(hp[0] * HP_TO_KW).toFixed(2), max: +(hp[1] * HP_TO_KW).toFixed(2) } : +(hp * HP_TO_KW).toFixed(2),
    motorNote: m.motorNote ?? null,
    capacities,
    capacityPolicy: m.capacityPolicy ?? (capacities.length === 0 ? 'No capacity published; sized per application' : null),
    sludgeSpaceGal: num(m.sludgeVolumeGal),
    netWeightLb: num(m.netWeightLb),
    dimensions: m.dimensions ?? null,
    bowlDiameter: dimText(m.bowlDiameter),
    bowlLength: dimText(m.bowlLength),
    wettedParts: m.wettedParts ?? null,
    voltages: m.voltages ?? null,
    dolphinModule: m.dolphinModule ?? null,
    typicalApplications: [...new Set(m.capacities.filter((c) => c.kind !== 'reference' && !NOT_AN_APPLICATION.test(c.fluid)).map((c) => c.fluid))],
    dolphinPageUrl: m.canonicalPath ? `${SITE}${m.canonicalPath}` : null,
    dolphinStock: dolphinStock(m),
    source: sources.length ? sources.join('; ') : 'Dolphin spec source (no capacity published)',
    lastVerified: SPEC_SOURCE_REVIEWED,
  };
}

export type SpecsDatasetRow = ReturnType<typeof modelRow>;

export function buildSpecsDataset() {
  const rows = models.map(modelRow);
  return {
    dataset: {
      name: SPECS_DATASET_NAME,
      description: SPECS_DATASET_DESCRIPTION,
      version: '1.0',
      asOf: SPECS_DATASET_AS_OF,
      publisher: 'Dolphin Centrifuge',
      publisherUrl: SITE,
      contact: 'sales@dolphincentrifuge.com',
      license: SPECS_DATASET_LICENSE,
      notes: SPECS_DATASET_NOTES,
      url: `${SITE}${SPECS_DATASET_JSON_PATH}`,
      csvUrl: `${SITE}${SPECS_DATASET_CSV_PATH}`,
      readmeUrl: `${SITE}${SPECS_DATASET_README_PATH}`,
      modelCount: rows.length,
      fieldNotes: {
        capacities: 'Every capacity is stated with its fluid and the conditions the source gives. Never transfer a capacity between fluids or between machines. derivedUsGpm = L/h divided by 227.124707.',
        motorKwDerived: 'motorHp x 0.7457, rounded to two decimals.',
        typicalApplications: 'The duties the published capacities belong to.',
        dolphinStock: `From the Dolphin stock list dated ${stockList.asOf}. "in stock" = a finished or unused unit is listed; "built to order" = a core is held and remanufactured to order; null = not on the list. Availability is confirmed per quote.`,
        cleaning: 'Disc stack bowl cleaning: manual, self-cleaning or nozzle. null for decanters or when not published.',
      },
    },
    models: rows,
  };
}

const CSV_COLUMNS: Array<[string, (r: SpecsDatasetRow) => unknown]> = [
  ['manufacturer', (r) => r.manufacturer],
  ['model', (r) => r.model],
  ['model_type', (r) => r.modelType],
  ['family', (r) => r.family],
  ['type', (r) => r.type],
  ['cleaning', (r) => r.cleaning],
  ['separation_type', (r) => r.separationType],
  ['bowl_speed_rpm', (r) => r.bowlSpeedRpm],
  ['g_force', (r) => r.gForce],
  ['motor_hp', (r) => r.motorHp],
  ['motor_kw_derived', (r) => r.motorKwDerived],
  ['capacity', (r) => r.capacities.map((c) => c.text).join(' | ') || r.capacityPolicy],
  ['sludge_space_gal', (r) => r.sludgeSpaceGal],
  ['net_weight_lb', (r) => r.netWeightLb],
  ['dimensions', (r) => r.dimensions],
  ['bowl_diameter', (r) => r.bowlDiameter],
  ['bowl_length', (r) => r.bowlLength],
  ['wetted_parts', (r) => r.wettedParts],
  ['voltages', (r) => r.voltages],
  ['dolphin_module', (r) => r.dolphinModule],
  ['typical_applications', (r) => r.typicalApplications.join('; ')],
  ['dolphin_page_url', (r) => r.dolphinPageUrl],
  ['dolphin_stock', (r) => r.dolphinStock],
  ['source', (r) => r.source],
  ['last_verified', (r) => r.lastVerified],
];

const csvCell = (v: unknown): string => {
  if (v === null || v === undefined) return '';
  const s = typeof v === 'object' ? `${(v as Range).min}-${(v as Range).max}` : String(v);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function buildSpecsCsv(): string {
  const { models: rows } = buildSpecsDataset();
  const lines = [CSV_COLUMNS.map(([h]) => h).join(','), ...rows.map((r) => CSV_COLUMNS.map(([, get]) => csvCell(get(r))).join(','))];
  return `${lines.join('\r\n')}\r\n`;
}

/** schema.org Dataset node. Emitted as invisible JSON-LD on /alfa-laval-centrifuges/ only. */
export const specsDatasetJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Dataset',
  '@id': `${SITE}${SPECS_DATASET_JSON_PATH}#dataset`,
  name: SPECS_DATASET_NAME,
  description: `${SPECS_DATASET_DESCRIPTION} ${SPECS_DATASET_NOTES}`,
  url: `${SITE}${SPECS_DATASET_JSON_PATH}`,
  version: '1.0',
  creator: { '@type': 'Organization', '@id': `${SITE}/#organization`, name: 'Dolphin Centrifuge' },
  publisher: { '@type': 'Organization', '@id': `${SITE}/#organization`, name: 'Dolphin Centrifuge' },
  license: `${SITE}${SPECS_DATASET_README_PATH}`,
  creditText: SPECS_DATASET_LICENSE,
  isAccessibleForFree: true,
  dateModified: SPECS_DATASET_AS_OF,
  keywords: [
    'Alfa Laval centrifuge specifications',
    'disc stack centrifuge',
    'decanter centrifuge',
    'centrifuge capacity',
    'bowl speed',
    'G-force',
    'remanufactured Alfa Laval centrifuge',
  ],
  distribution: [
    { '@type': 'DataDownload', contentUrl: `${SITE}${SPECS_DATASET_JSON_PATH}`, encodingFormat: 'application/json' },
    { '@type': 'DataDownload', contentUrl: `${SITE}${SPECS_DATASET_CSV_PATH}`, encodingFormat: 'text/csv' },
  ],
};
