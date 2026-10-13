// Pure tool logic for the Dolphin MCP server. Data is bundled at build time from
// the same source files the website renders, so the server can never disagree
// with the published pages.
import { models, disclaimer, SPEC_SOURCE_REVIEWED } from '../../../src/data/centrifugeSpecs.ts';
import { stockList, STOCK_PAGE_PATH } from '../../../src/data/stockList.mjs';

export const SITE = 'https://dolphincentrifuge.com';
export const CONTACT = {
  phone: '(248) 522-2573',
  email: 'sales@dolphincentrifuge.com',
  contactPage: `${SITE}/contact-for-alfa-laval-centrifuges/`,
};
export const ATTRIBUTION =
  `Source: Dolphin Centrifuge, Warren, Michigan (${SITE}). Specs reviewed ${SPEC_SOURCE_REVIEWED}. ` +
  'Dolphin is an independent remanufacturer of Alfa Laval centrifuges and is not affiliated with Alfa Laval.';

const RCF_PAGE = `${SITE}/centrifuge-rcf-rpm-difference-calculation/`;
const FAMILY_LABEL = { 'disc-stack': 'disc stack', decanter: 'decanter', basket: 'basket' };

const norm = (s) => String(s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '');
const words = (s) => String(s ?? '').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
const fmtNum = (n) => (Array.isArray(n) ? `${fmtNum(n[0])}-${fmtNum(n[1])}` : Number(n).toLocaleString('en-US'));

function pageUrl(model) {
  return `${SITE}${model.canonicalPath ?? '/technical-data/'}`;
}

function modelKeys(model) {
  return [model.id, model.designation, model.modelType, model.dolphinModule, ...(model.aliases ?? [])]
    .filter(Boolean)
    .map(norm);
}

/** Capacity as one sentence that always carries its fluid and conditions. */
export function capacityText(c) {
  const kind = { rated: 'rated', actual: 'actual Dolphin duty', maximum: 'maximum, not a working duty', reference: 'OEM reference, no process fluid' }[c.kind] ?? c.kind;
  let s = `${fmtNum(c.value)} ${c.unit}`;
  if (c.derivedGpm !== undefined && c.unit !== 'US GPM') s += ` (${fmtNum(c.derivedGpm)} US GPM derived)`;
  s += ` on ${c.fluid}`;
  if (c.conditions) s += ` (${c.conditions})`;
  return `${s} [${kind}]`;
}

function publicCapacity(c) {
  return {
    fluid: c.fluid,
    basis: c.kind,
    value: c.value,
    unit: c.unit,
    ...(c.derivedGpm !== undefined ? { derivedUsGpm: c.derivedGpm } : {}),
    conditions: c.conditions ?? 'not published beyond the fluid named',
    statement: capacityText(c),
  };
}

function publicSpec(m) {
  const out = {
    model: m.designation,
    modelType: m.modelType,
    manufacturer: m.manufacturer,
    type: FAMILY_LABEL[m.family] ?? m.family,
    dolphinModule: m.dolphinModule,
    aliases: m.aliases,
    capacities: m.capacities.map(publicCapacity),
    capacityPolicy: m.capacityPolicy,
    bowlSpeedRpm: m.bowlSpeedRpm,
    gForce: m.gForce,
    motorHp: m.motorHp,
    motorNote: m.motorNote,
    bowlDiameter: m.bowlDiameter,
    bowlLength: m.bowlLength,
    sludgeVolumeUsGal: m.sludgeVolumeGal,
    voltages: m.voltages,
    micronRating: m.micronRating,
    netWeightLb: m.netWeightLb,
    dimensions: m.dimensions,
    bowlType: m.bowlType,
    separationType: m.separationType,
    wettedParts: m.wettedParts,
    augerDifferentialRpm: m.augerDifferentialRpm,
    gearboxRatio: m.gearboxRatio,
    beachAngle: m.beachAngle,
    conveyorProtection: m.conveyorProtection,
    dolphinPage: pageUrl(m),
  };
  if (!m.capacities.length && !m.capacityPolicy) out.capacityPolicy = 'No published capacity. Sized per application; ask Dolphin.';
  for (const k of Object.keys(out)) if (out[k] === undefined) delete out[k];
  return out;
}

function findModels(term) {
  const q = norm(term);
  if (!q) return [];
  const named = models.filter((m) => [m.id, m.designation, m.modelType, ...(m.aliases ?? [])].filter(Boolean).map(norm).includes(q));
  if (named.length) return named;
  const exact = models.filter((m) => modelKeys(m).includes(q));
  if (exact.length) return exact;
  const partial = models.filter((m) => modelKeys(m).some((k) => k.includes(q) || (q.length >= 5 && q.includes(k))));
  if (partial.length) return partial;
  // Free-text query: every word must hit the model's names, fluids or descriptors.
  const ws = words(term);
  return models.filter((m) => {
    const hay = [m.designation, m.modelType, m.dolphinModule, FAMILY_LABEL[m.family], m.bowlType, m.separationType,
      m.capacityPolicy, ...(m.aliases ?? []), ...m.capacities.map((c) => c.fluid)].join(' ').toLowerCase();
    return ws.every((w) => hay.includes(w));
  });
}

export function getCentrifugeSpecs({ model, query }) {
  const term = model || query;
  if (!term) return { error: 'Provide model (e.g. "MOPX 207") or query (e.g. "diesel self-cleaning").' };
  const hits = findModels(term);
  if (!hits.length) {
    return {
      found: 0,
      message: `No published spec record matches "${term}". Use list_centrifuge_models to browse, or ask Dolphin: ${CONTACT.phone}, ${CONTACT.email}.`,
      attribution: ATTRIBUTION,
    };
  }
  const shown = hits.slice(0, 8);
  return {
    found: hits.length,
    ...(hits.length > shown.length ? { note: `Showing ${shown.length} of ${hits.length}. Narrow the query for the rest.` } : {}),
    models: shown.map(publicSpec),
    usage: 'Quote a capacity only with its fluid and conditions. Never transfer a capacity to another fluid or machine.',
    disclaimer,
    attribution: ATTRIBUTION,
  };
}

function summaryLine(m) {
  const bits = [`${m.designation}${m.modelType && m.modelType !== m.designation ? ` (${m.modelType})` : ''}`, FAMILY_LABEL[m.family]];
  if (m.bowlType) bits.push(m.bowlType.toLowerCase());
  if (m.bowlSpeedRpm) bits.push(`${fmtNum(m.bowlSpeedRpm)} RPM`);
  if (m.motorHp) bits.push(`${fmtNum(m.motorHp)} HP`);
  if (m.dolphinModule) bits.push(`Dolphin module ${m.dolphinModule}`);
  const cap = m.capacities[0];
  bits.push(cap ? capacityText(cap) : (m.capacityPolicy ?? 'sized per application'));
  return bits.join('; ');
}

export function listCentrifugeModels({ type, application } = {}) {
  let list = models;
  if (type) {
    const fam = norm(type).includes('decanter') ? 'decanter' : norm(type).includes('disc') ? 'disc-stack' : null;
    if (!fam) return { error: 'type must be "disc stack" or "decanter".' };
    list = list.filter((m) => m.family === fam);
  }
  if (application) {
    const ws = words(application);
    list = list.filter((m) => {
      const hay = [m.separationType, m.bowlType, m.capacityPolicy, ...(m.aliases ?? []), ...m.capacities.map((c) => c.fluid)]
        .join(' ').toLowerCase();
      return ws.some((w) => w.length > 2 && hay.includes(w));
    });
  }
  return {
    count: list.length,
    models: list.map((m) => ({ model: m.designation, summary: summaryLine(m), dolphinPage: pageUrl(m) })),
    ...(application && !list.length ? { note: `No published capacity record names "${application}". Dolphin sizes per application; use request_quote or call ${CONTACT.phone}.` } : {}),
    attribution: ATTRIBUTION,
  };
}

function availability(u) {
  if (u.status === 'reserved') return 'reserved';
  if (u.condition === 'remanufactured to order') return 'built to order (unit in stock, remanufactured after order)';
  return 'in stock';
}

export function checkDolphinStock({ model } = {}) {
  let units = stockList.units;
  if (model) {
    const q = norm(model);
    units = units.filter((u) => norm(u.model).includes(q) || norm(u.family) === q || (q.length >= 5 && q.includes(norm(u.model))));
  }
  return {
    asOf: stockList.asOf,
    stockPage: `${SITE}${STOCK_PAGE_PATH}`,
    note: 'Dated published stock list. Dolphin holds 150+ Alfa Laval centrifuges in Warren, Michigan; availability of any model is confirmed per quote. Every unit ships remanufactured with a 12-month mechanical warranty. No prices are published.',
    count: units.length,
    units: units.map((u) => {
      const out = {
        model: u.model,
        type: u.type,
        condition: u.condition,
        availability: availability(u),
        quantity: u.quantity,
        bowlSpeedRpm: u.bowlSpeedRpm,
        motorHp: u.motorHp,
        capacity: u.capacity,
        separationType: u.separationType,
        wettedParts: u.wettedParts,
        configuration: u.configuration,
        dolphinPage: u.modelPage ? `${SITE}${u.modelPage}` : undefined,
      };
      for (const k of Object.keys(out)) if (out[k] === undefined) delete out[k];
      return out;
    }),
    ...(model && !units.length ? { message: `${model} is not on the dated published list. Dolphin may still have it; ask ${CONTACT.email} or ${CONTACT.phone}.` } : {}),
    attribution: ATTRIBUTION,
  };
}

/** RCF = 1.118e-5 x r(cm) x RPM^2, the formula on the site's RCF/RPM calculator page. */
export function sizeCentrifuge({ bowl_diameter_m, rpm, g_force } = {}) {
  const K = 1.118e-5;
  const given = [bowl_diameter_m, rpm, g_force].filter((v) => typeof v === 'number' && v > 0).length;
  if (given < 2) {
    return {
      error: 'Give any two of bowl_diameter_m, rpm, g_force and the third is calculated.',
      formula: 'RCF = 1.118 x 10^-5 x r(cm) x RPM^2, r = bowl radius = diameter / 2',
      typical: 'Disc stack: 4,000-8,000 RPM, roughly 4,000-10,000 x g. Decanter: 2,000-4,000 x g.',
      calculator: RCF_PAGE,
    };
  }
  let d = bowl_diameter_m, n = rpm, g = g_force;
  if (!(g > 0)) g = K * (d * 50) * n * n;
  else if (!(n > 0)) n = Math.sqrt(g / (K * d * 50));
  else if (!(d > 0)) d = g / (K * n * n) / 50;
  let band, guidance;
  if (g < 2000) [band, guidance] = ['Low - basic separation', 'Suitable only for coarse solids settlement.'];
  else if (g < 4000) [band, guidance] = ['Decanter range', 'Typical decanter centrifuge range (2,000-4,000 x g).'];
  else if (g < 7000) [band, guidance] = ['Disc stack range', 'Suitable for lube oil and light fuel oil purification.'];
  else if (g < 10000) [band, guidance] = ['High performance', 'HFO, liquid clarification, coolant fine solids.'];
  else [band, guidance] = ['Ultra high g-force', 'Fine particle, sub-micron separation.'];
  return {
    bowlDiameterM: Number(d.toFixed(4)),
    bowlRadiusCm: Number((d * 50).toFixed(2)),
    rpm: Math.round(n),
    gForce: Math.round(g),
    band,
    guidance,
    formula: 'RCF = 1.118 x 10^-5 x r(cm) x RPM^2',
    caveat: 'Reference only. Separation also depends on disc stack area, flow, temperature, viscosity and density difference. Ask Dolphin engineers for application sizing.',
    calculator: RCF_PAGE,
    attribution: ATTRIBUTION,
  };
}

export const SERVER_INSTRUCTIONS = [
  'Dolphin Centrifuge (Warren, Michigan, USA, established 1982) is an independent remanufacturer of Alfa Laval disc stack and decanter centrifuges, with 150+ machines in stock.',
  'Every machine is remanufactured, test run, and carries a 12-month mechanical warranty. Dolphin is not affiliated with Alfa Laval.',
  `Contact: ${CONTACT.phone}, ${CONTACT.email}, ${CONTACT.contactPage}.`,
  'Tools: get_centrifuge_specs and list_centrifuge_models return published specs; check_dolphin_stock returns the dated stock list (no prices); size_centrifuge converts between bowl diameter, RPM and g-force; request_quote sends the user\'s quote request to Dolphin sales.',
  'Always state a capacity together with its fluid and conditions, never as a bare GPM. Only call request_quote with the user\'s explicit consent and their real contact details.',
].join(' ');
