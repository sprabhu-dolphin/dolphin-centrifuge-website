#!/usr/bin/env node
/**
 * Builds public/technical-data/machine-datasheets.v1.json from the Drawing Catalog Library
 * export (Alfa Laval's printed machine figures, one record per machine).
 *
 * Run by hand when the library export changes. NOT part of `npm run build`.
 *   node scripts/build-machine-datasheets.mjs [--source <path>] [--out <path>] [--log <path>]
 *
 * Filters (owner rulings 2026-11-16 and 2026-11-20): no file paths, reader names, crop boxes,
 * internal ids or unverified rows; nothing about parts, kits, part numbers, prices, drawings
 * or scans; nothing with food, beverage, dairy, brewery, wine, juice, edible, biotech, cell
 * harvesting, fermentation, pharmaceutical or sanitary wording. The machine "BREW 300" is
 * dropped whole. Every drop is logged with its reason (--log writes the log as JSON).
 *
 * The stock join uses src/data/stockList.mjs (public facts only: listing and unit counts).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { stockCounts, stockList } from '../src/data/stockList.mjs';
import { normalizeModelName } from '../src/lib/machineDatasheets.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (name, fallback) => {
  const i = process.argv.indexOf(name);
  return i > -1 ? process.argv[i + 1] : fallback;
};
const SOURCE = arg('--source', 'N:/Drawings/Dolphin Pune CD Drawings/Drawing Catalog Library/05 Code/drawing-catalog/work/centrifuge/export/datasheet_public/machine-datasheets.v1.json');
const OUT = arg('--out', path.join(root, 'public/technical-data/machine-datasheets.v1.json'));
const LOG = arg('--log');
const GENERATED = '2026-11-20';

const DROP_MACHINES = new Set(['alfa-laval-brew-300']);

// Word-aware; errs on dropping. "wine" does not hit "twine" or "swine".
const BANNED_WORDS = /\b(food\w*|beverage\w*|dairy|brew\w*|beer\w*|wines?|juices?|edible\w*|biotech\w*|cell[\s-]+harvest\w*|harvest\w*|ferment\w*|pharma\w*|sanitary|hygien\w*|milk\w*|human[\s-]+consumption)\b/i;
const NOT_PUBLIC_WORDS = /\b(spare[\s-]+parts?|parts?[\s-]+(list|catalog\w*|numbers?)|part[\s-]+numbers?|kits?|prices?|pricing|drawings?|scans?|bearings?)\b/i;
const PATH_PATTERN = /\b[A-Za-z]:[\\/]|\\\\|source_path/;

const log = [];
const drop = (kind, machine, what, reason) => log.push({ kind, machine, what, reason });

function badReason(text) {
  const s = String(text ?? '');
  if (BANNED_WORDS.test(s)) return `banned wording: ${s.match(BANNED_WORDS)[0]}`;
  if (NOT_PUBLIC_WORDS.test(s)) return `not public (parts, prices or drawings): ${s.match(NOT_PUBLIC_WORDS)[0]}`;
  if (PATH_PATTERN.test(s)) return 'file path';
  return null;
}

const source = JSON.parse(fs.readFileSync(SOURCE, 'utf8'));

/** A capacity table row becomes an ordinary figure whose quote is built from the table's own pattern. */
function rowToFigure(table, row) {
  const cond = row.condition ?? null;
  const quote = table.quotePattern
    .replace('<value>', row.value)
    .replace('<unit>', table.unit)
    .replace('<condition>', cond ?? '')
    .replace('<document>', table.source.document)
    .replace('<page>', table.source.page)
    .replace(', ,', ',')
    .replace(/:\s*,/, ':');
  return {
    group: 'capacity',
    label: table.label,
    condition: cond,
    value: row.value,
    min: row.min ?? null,
    max: row.max ?? null,
    unit: table.unit,
    ...(row.derived !== undefined && row.derived !== null ? { derived: { value: row.derived, unit: table.derivedUnit, method: table.method } } : {}),
    ...(row.variant ? { variant: row.variant } : {}),
    source: { ...table.source },
    quote: cond ? quote : quote.replace(/,\s*\(/, ' ('),
    ...(row.differs ? { differs: true } : {}),
    ...(row.valueNote ? { valueNote: row.valueNote } : {}),
    ...(row.alsoPrinted ? { alsoPrinted: row.alsoPrinted } : {}),
    note: 'application capacity row from a printed table',
  };
}

const FIGURE_KEYS = ['group', 'label', 'condition', 'value', 'min', 'max', 'unit', 'dimension', 'derived', 'variant', 'source', 'quote', 'differs', 'valueNote', 'note', 'alsoPrinted'];

function cleanFigure(f) {
  const out = {};
  for (const k of FIGURE_KEYS) if (f[k] !== undefined) out[k] = f[k];
  out.source = { document: f.source.document, page: f.source.page, ...(f.source.printedPage ? { printedPage: f.source.printedPage } : {}) };
  if (f.alsoIn) out.alsoIn = f.alsoIn.map((a) => ({ document: a.document, page: a.page, ...(a.printedPage ? { printedPage: a.printedPage } : {}) }));
  return out;
}

const machines = {};
for (const [id, rec] of Object.entries(source.machines)) {
  if (DROP_MACHINES.has(id)) {
    drop('machine', rec.model, id, 'owner ruling: BREW 300 dropped entirely');
    continue;
  }
  const machineReason = badReason([rec.model, rec.modelLabel, rec.family, rec.maker, rec.type].join(' '));
  if (machineReason) {
    drop('machine', rec.model, id, machineReason);
    continue;
  }

  const aliases = [];
  for (const a of rec.aliases ?? []) {
    const r = badReason(a);
    if (r) drop('alias', rec.model, a, r);
    else aliases.push(a);
  }
  const variants = [];
  for (const v of rec.variants ?? []) {
    const r = badReason(v.label);
    if (r) drop('variant', rec.model, v.label, r);
    else variants.push({ label: v.label });
  }
  const documents = [];
  const droppedDocs = new Set();
  for (const d of rec.documents ?? []) {
    const r = badReason(`${d.number ?? ''} ${d.title ?? ''}`);
    if (r) {
      drop('document', rec.model, d.title ?? d.number, r);
      droppedDocs.add(d.number ?? d.title);
    } else {
      documents.push({ number: d.number ?? null, title: d.title ?? null, date: d.date ?? null, ...(d.dateNote ? { dateNote: d.dateNote } : {}) });
    }
  }

  const rawFigures = [...(rec.figures ?? [])];
  for (const t of rec.capacityTables ?? []) for (const row of t.rows) rawFigures.push(rowToFigure(t, row));

  const figures = [];
  for (const f of rawFigures) {
    const name = `${f.group} | ${f.label} | ${f.condition ?? ''} | ${f.value} ${f.unit ?? ''}`;
    const text = [f.label, f.condition, f.variant, f.quote, f.unit, f.source?.document, f.valueNote, f.note, f.dimension].join(' | ');
    let r = badReason(text);
    if (!r && (f.labelBasis || f.unitNote)) r = 'drawing-derived label or unit (not a printed figure)';
    if (!r && droppedDocs.has(f.source?.document)) r = 'source document dropped';
    if (!r && f.audit && f.audit !== 'verified') r = 'audit status not verified';
    if (r) {
      drop('figure', rec.model, name, r);
      continue;
    }
    figures.push(cleanFigure(f));
  }

  const key = normalizeModelName(rec.model);
  const matching = stockList.units.filter((u) => normalizeModelName(u.model.replace(/^(Sharples|ALDEC)\s+/i, '')) === key);
  const counts = stockCounts(matching);
  const stock = {
    listings: counts.listings,
    readyBuiltUnits: counts.readyBuiltUnits,
    builtToOrderUnits: counts.builtToOrderUnits,
    ...(counts.listings === 0
      ? { note: `Not in the current stock list (inventory sheet dated ${stockList.asOf}). Dolphin holds 150+ machines in total; ask for this model.` }
      : { note: `From the inventory sheet dated ${stockList.asOf}. Built-to-order units are used units remanufactured after an order, not ready-built. Availability is confirmed per quote.` }),
  };

  machines[id] = {
    id,
    model: rec.model,
    family: rec.family,
    maker: rec.maker,
    type: rec.type,
    aliases,
    variants,
    figures,
    documents,
    credit: rec.credit,
    stock,
  };
}

const index = Object.values(machines).map((m) => ({
  id: m.id,
  model: m.model,
  maker: m.maker,
  type: m.type,
  aliases: m.aliases,
  variants: m.variants.map((v) => v.label),
  documents: m.documents.map((d) => d.number ?? d.title),
  figureCount: m.figures.length,
  inStockList: m.stock.listings > 0,
}));

const out = {
  schemaVersion: '1',
  generated: GENERATED,
  auditedOn: source.auditedOn,
  source: 'Dolphin Centrifuge machine data sheet library, public export: figures read from Alfa Laval documents and audited as verified',
  attribution: "These are Alfa Laval's published figures, quoted from Alfa Laval documents, units as printed. Dolphin Centrifuge is an independent remanufacturer and is not affiliated with Alfa Laval.",
  independence: 'Dolphin Centrifuge is independent of Alfa Laval. Figures are Alfa Laval\'s as printed in the named documents; they are not Dolphin measurements, guarantees or ratings.',
  notes: [
    ...(source.notes ?? []),
    'Machine records carry every figure in one place. A figure tagged with a variant applies to that variant only. differs: true means another Alfa Laval document prints a different value for the same figure; both are listed.',
    'Application capacity rows come from printed capacity tables; a rated capacity with no printed fluid stays fluid-less and is not an application capacity.',
  ],
  stockListDate: stockList.asOf,
  stockNote: `The stock join counts come from Dolphin's written inventory sheet dated ${stockList.asOf}, not a confirmation date. Availability is confirmed per quote. Dolphin holds 150+ machines in total.`,
  figureGroups: source.figureGroups,
  index,
  machines,
};

fs.writeFileSync(OUT, JSON.stringify(out) + '\n');
if (LOG) fs.writeFileSync(LOG, JSON.stringify(log, null, 2));
const groups = {};
for (const m of Object.values(machines)) for (const f of m.figures) groups[f.group] = (groups[f.group] ?? 0) + 1;
console.log(JSON.stringify({ out: OUT, bytes: fs.statSync(OUT).size, machines: index.length, figures: Object.values(groups).reduce((a, b) => a + b, 0), groups, drops: log.length }, null, 2));
