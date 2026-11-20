// One pure module for the machine data sheet tools. The /mcp Worker and the page WebMCP script
// both import it, so the two surfaces cannot disagree. It reads the public record
// /technical-data/machine-datasheets.v1.json (built by scripts/build-machine-datasheets.mjs).
import { isHumanConsumptionRequest, NO_HUMAN_CONSUMPTION_DISCLAIMER } from './humanConsumptionGuard.mjs';

export const MACHINE_DATASHEETS_PATH = '/technical-data/machine-datasheets.v1.json';
export const MACHINE_DATASHEETS_URL = `https://dolphincentrifuge.com${MACHINE_DATASHEETS_PATH}`;
export const MACHINE_DATASHEETS_SCHEMA = 'dolphin-machine-datasheets-v1';
export const GET_DATASHEET_TOOL = 'get_machine_datasheet';
export const LIST_MACHINES_TOOL = 'list_machines';

export const DATASHEET_STATEMENT =
  "Figures are Alfa Laval's, as printed in the named Alfa Laval documents, units as printed. They are not Dolphin measurements, guarantees or ratings. Dolphin Centrifuge is independent of Alfa Laval.";

export const GET_DATASHEET_DESCRIPTION =
  'Return ONE whole Alfa Laval machine data sheet in a single call, with no paging: every figure Alfa Laval printed for it (capacity, bowl speed, motor power, solids space, weight, dimensions) with its condition, unit, source document, page and a ready-to-quote sentence, plus the documents and how many units of that model sit on Dolphin\'s inventory sheet (ready-built vs remanufactured to order). ' +
  'Model names written many ways work: "MOPX 207", "MOPX207", "mopx-207 TGT", "Alfa Laval MAB 204S". A bare family such as "MOPX" returns the list of models; a variant name returns the machine with each figure tagged by variant; no match returns the closest models, never an empty error. ' +
  "Figures are Alfa Laval's as printed, not Dolphin measurements or guarantees. This tool has no prices and no parts or drawings.";

export const LIST_MACHINES_DESCRIPTION =
  'List the Alfa Laval machines that have a data sheet, one short line each (id, model, maker, type, variants, figure count, whether the model is on Dolphin\'s inventory sheet), optionally filtered by type ("disc stack", "self-cleaning", "manual-clean") and maker ("Alfa Laval"). Use it to find the right model, then call get_machine_datasheet. It carries no figures, no prices and no parts.';

const alnum = (s) => String(s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '');

/** Lower case; drop "Alfa Laval", spaces, hyphens, dots and other punctuation. */
export function normalizeModelName(name) {
  return alnum(String(name ?? '').toLowerCase().replace(/alfa[\s-]*laval/g, ''));
}

export function isMachineDatasheetData(data) {
  return Boolean(data) && typeof data === 'object' && data.schemaVersion === '1' && Array.isArray(data.index)
    && data.machines && typeof data.machines === 'object' && !Array.isArray(data.machines);
}

const caches = new WeakMap();

function lookups(data) {
  let c = caches.get(data);
  if (c) return c;
  const names = new Map();
  const variants = new Map();
  const families = new Map();
  const add = (map, key, value) => {
    if (!key) return;
    const list = map.get(key) ?? [];
    if (!list.includes(value)) list.push(value);
    map.set(key, list);
  };
  for (const m of Object.values(data.machines)) {
    add(names, normalizeModelName(m.id), m.id);
    add(names, normalizeModelName(m.model), m.id);
    for (const a of m.aliases ?? []) add(names, normalizeModelName(a), m.id);
    for (const v of m.variants ?? []) add(variants, normalizeModelName(v.label), { id: m.id, label: v.label });
    add(families, normalizeModelName(m.family ?? m.model.split(/\s+/)[0]), m.id);
  }
  c = { names, variants, families };
  caches.set(data, c);
  return c;
}

const brief = (m) => ({
  id: m.id,
  model: m.model,
  maker: m.maker,
  type: m.type,
  variants: (m.variants ?? []).map((v) => (typeof v === 'string' ? v : v.label)),
  figureCount: m.figureCount ?? m.figures?.length ?? 0,
  inStockList: m.stock ? m.stock.listings > 0 : m.inStockList,
});

const entryOf = (data, id) => data.index.find((e) => e.id === id);

function distance(a, b) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return row[b.length];
}

/** The closest models in the index: same family first, then nearest name. Never empty. */
export function closestModels(data, query, limit = 5) {
  const q = normalizeModelName(query);
  const fam = q.match(/^[a-z]+/)?.[0] ?? '';
  return data.index
    .map((e) => {
      const k = normalizeModelName(e.model);
      return { e, score: distance(q, k) - (fam && k.startsWith(fam) ? 3 : 0) };
    })
    .sort((x, y) => x.score - y.score || x.e.model.localeCompare(y.e.model))
    .slice(0, limit)
    .map(({ e }) => brief(e));
}

function resolve(data, q) {
  const { names, variants, families } = lookups(data);
  const hit = names.get(q);
  if (hit) {
    if (hit.length === 1) {
      const m = data.machines[hit[0]];
      return { kind: normalizeModelName(m.model) === q || normalizeModelName(m.id) === q ? 'model' : 'alias', machine: m };
    }
    return { kind: 'ambiguous', ids: hit };
  }
  const v = variants.get(q);
  if (v && v.length === 1) return { kind: 'variant', machine: data.machines[v[0].id], variant: v[0].label };
  if (v) return { kind: 'ambiguous', ids: v.map((x) => x.id) };
  const fam = families.get(q);
  if (fam) return { kind: 'family', ids: fam };
  // "MAB 204S", "WHPX 510TGD-20": the model followed by a letter suffix that is not itself an alias.
  const base = q.match(/^([a-z]+\d{3})([a-z].*)$/);
  if (base && names.get(base[1])?.length === 1) return { kind: 'base model', machine: data.machines[names.get(base[1])[0]], suffix: base[2] };
  return null;
}

/** Variant labels of a machine that the query names or extends. */
function variantsFit(machine, q) {
  const modelKey = normalizeModelName(machine.model);
  if (q === modelKey) return [];
  return (machine.variants ?? []).map((v) => v.label).filter((label) => {
    const k = normalizeModelName(label);
    return k.startsWith(q) || q.startsWith(k);
  });
}

export function getMachineDatasheet(data, { model } = {}) {
  const base = { source: MACHINE_DATASHEETS_URL, statement: DATASHEET_STATEMENT };
  if (typeof model !== 'string' || !model.trim()) {
    return { status: 'invalid_input', message: 'Provide model, e.g. "MOPX 207". Use list_machines to browse.', ...base };
  }
  if (isHumanConsumptionRequest(model)) {
    return { status: 'no_suitability_statement', message: NO_HUMAN_CONSUMPTION_DISCLAIMER, ...base };
  }
  const q = normalizeModelName(model);
  const found = q ? resolve(data, q) : null;
  if (!found) {
    return {
      status: 'not_found',
      query: model,
      message: `No data sheet matches "${model}". The closest models are listed; call get_machine_datasheet with one of them, or list_machines to browse.`,
      closest: closestModels(data, model),
      ...base,
    };
  }
  if (found.kind === 'family' || found.kind === 'ambiguous') {
    const ids = found.ids;
    return {
      status: 'family',
      query: model,
      family: found.kind === 'family' ? data.machines[ids[0]].family : undefined,
      count: ids.length,
      message: found.kind === 'family'
        ? `"${model}" is a family, not one machine. Call get_machine_datasheet with one of these models.`
        : `"${model}" fits more than one machine. Call get_machine_datasheet with one of these models.`,
      models: ids.map((id) => brief(entryOf(data, id) ?? data.machines[id])),
      ...base,
    };
  }
  const machine = found.machine;
  const fit = found.kind === 'variant' ? [found.variant] : variantsFit(machine, q);
  return {
    status: 'ok',
    match: {
      query: model,
      kind: found.kind,
      ...(found.kind === 'base model' ? { note: `"${model}" was read as ${machine.model} plus the suffix "${found.suffix}".` } : {}),
      ...(fit.length ? {
        variants: fit,
        variantNote: 'The name fits these variants. Figures with a "variant" field apply to that variant only; figures without one apply to the machine as printed. Do not apply a variant figure to another variant.',
      } : {}),
    },
    machine,
    usage: 'Quote the "quote" string of a figure as it stands. Capacity needs its condition. A figure with differs: true has another Alfa Laval document that prints a different value; give both.',
    ...base,
  };
}

function typeMatches(type, wanted) {
  const t = alnum(type);
  const w = alnum(wanted);
  return Boolean(t) && Boolean(w) && t.includes(w);
}

export function listMachines(data, { type, maker } = {}) {
  let list = data.index;
  if (type) list = list.filter((e) => typeMatches(e.type, type));
  if (maker) {
    const w = alnum(maker);
    list = list.filter((e) => alnum(e.maker).includes(w));
  }
  const types = [...new Set(data.index.map((e) => e.type).filter(Boolean))].sort();
  const makers = [...new Set(data.index.map((e) => e.maker).filter(Boolean))].sort();
  return {
    status: 'ok',
    count: list.length,
    of: data.index.length,
    machines: list.map(brief),
    ...(list.length === 0 ? { message: `No machine matches that filter. Types: ${types.join('; ')}. Makers: ${makers.join('; ')}.` } : {}),
    next: 'Call get_machine_datasheet with a model to get the whole machine record.',
    stockNote: `inStockList is true when the model is on Dolphin's inventory sheet dated ${data.stockListDate}; availability is confirmed per quote.`,
    source: MACHINE_DATASHEETS_URL,
    statement: DATASHEET_STATEMENT,
  };
}
