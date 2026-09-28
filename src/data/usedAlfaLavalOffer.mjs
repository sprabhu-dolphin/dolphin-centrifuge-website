// One source for the used / reconditioned Alfa Laval offer. The page
// /used-alfa-laval-centrifuges-for-sale/, its JSON record and the WebMCP tool
// all read this file, so they cannot drift apart.
//
// Every statement here is already published elsewhere on the site; `sources`
// names the page. Do not add inventory counts per model, prices, warranty terms
// or certifications that are not published. Model names and pages come from
// the technical catalog, never retyped.
import { technicalCatalog } from './agentCatalog.mjs';

const SITE = 'https://dolphincentrifuge.com';
export const USED_PAGE_PATH = '/used-alfa-laval-centrifuges-for-sale/';
export const USED_PAGE_URL = `${SITE}${USED_PAGE_PATH}`;
export const USED_OFFER_JSON_PATH = '/technical-data/used-alfa-laval-centrifuges.v1.json';
export const USED_OFFER_SCHEMA_VERSION = 'dolphin-used-alfa-laval-offer-v1';

const catalogById = new Map(technicalCatalog.models.map((model) => [model.id, model]));

function model(id) {
  const record = catalogById.get(id);
  if (!record) throw new Error(`usedAlfaLavalOffer: unknown catalog model ${id}`);
  return {
    id,
    name: record.displayName,
    page: record.canonicalPage,
    technicalRecord: record.machineReadableRecord,
  };
}

/** Application pages that already exist on the site. */
export const usedApplications = [
  { key: 'waste-oil', label: 'Waste oil', path: '/waste-oil-centrifuge/', families: ['whpx', 'mopx'] },
  { key: 'used-oil', label: 'Used motor oil', path: '/used-oil-centrifuge/', families: ['whpx', 'mopx'] },
  { key: 'diesel', label: 'Diesel fuel polishing', path: '/diesel-centrifuge/', families: ['whpx', 'mab', 'mopx'] },
  { key: 'fuel-oil', label: 'Fuel oil and HFO', path: '/fuel-oil-centrifuge/', families: ['whpx', 'mopx'] },
  { key: 'wvo-uco', label: 'WVO and used cooking oil', path: '/wvo-centrifuge-separator/', families: ['whpx', 'mopx', 'mapx'] },
  { key: 'lube-oil', label: 'Lube oil', path: '/lube-oil-centrifuge/', families: ['mab', 'whpx'] },
  { key: 'hydraulic-oil', label: 'Hydraulic oil', path: '/hydraulic-oil-centrifuge/', families: ['mab', 'whpx'] },
  { key: 'biodiesel', label: 'Biodiesel', path: '/biodiesel-centrifuge/', families: ['whpx'] },
  { key: 'machine-coolant', label: 'Machine coolant', path: '/machine-coolant-centrifuge/', families: ['wspx'] },
  { key: 'wastewater', label: 'Industrial wastewater', path: '/wastewater-centrifuge/', families: ['nx', 'whpx'] },
  { key: 'crude-oil', label: 'Crude oil and tank bottoms', path: '/crude-oil-centrifuge/', families: ['nx', 'whpx'] },
  { key: 'beer-wine', label: 'Beer and wine', path: '/beer-wine-centrifuge/', families: ['food'] },
  { key: 'food', label: 'Food grade and biotech', path: '/food-grade-centrifuge/', families: ['food'] },
];

export const usedFamilies = [
  {
    key: 'whpx',
    name: 'Alfa Laval WHPX',
    type: 'Self-cleaning disc stack, partial discharge',
    cleaning: 'self-cleaning',
    role: 'Current Alfa Laval production series and our default recommendation for oils and fuels. Partial discharge ejects only the sludge layer, so less oil is lost.',
    models: ['alfa-laval-whpx-405', 'alfa-laval-whpx-407', 'alfa-laval-whpx-409', 'alfa-laval-whpx-510', 'alfa-laval-whpx-513'].map(model),
  },
  {
    key: 'mopx',
    name: 'Alfa Laval MOPX',
    type: 'Self-cleaning disc stack, full discharge',
    cleaning: 'self-cleaning',
    role: 'Older full-discharge design, still a good fit for heavy sludge loads and for matching an existing installation.',
    models: ['alfa-laval-mopx-205', 'alfa-laval-mopx-207', 'alfa-laval-mopx-209', 'alfa-laval-mopx-213'].map(model),
  },
  {
    key: 'mapx',
    name: 'Alfa Laval MAPX',
    type: 'Self-cleaning disc stack, full discharge',
    cleaning: 'self-cleaning',
    role: 'Legacy full-discharge series, quoted when a unit suits the duty or matches an existing installation.',
    models: ['alfa-laval-mapx-207', 'alfa-laval-mapx-210', 'alfa-laval-mapx-309'].map(model),
  },
  {
    key: 'mab',
    name: 'Alfa Laval MAB',
    type: 'Manual-clean disc stack (solids-retaining bowl)',
    cleaning: 'manual',
    role: 'Smallest and simplest option for low-solids oils and fuels such as diesel, lube and hydraulic oil.',
    models: ['alfa-laval-mab-103', 'alfa-laval-mab-104', 'alfa-laval-mab-204', 'alfa-laval-mab-205', 'alfa-laval-mab-206', 'alfa-laval-mab-207', 'alfa-laval-mab-209'].map(model),
  },
  {
    key: 'wspx',
    name: 'Alfa Laval WSPX',
    type: 'Self-cleaning disc stack for water-based fluids',
    cleaning: 'self-cleaning',
    role: 'Machining coolant and water-based fluid recycling.',
    models: ['alfa-laval-wspx-207', 'alfa-laval-wspx-303', 'alfa-laval-wspx-307', 'alfa-laval-wspx-407'].map(model),
  },
  {
    key: 'nx',
    name: 'Alfa Laval NX, CHNX and G2 decanters',
    type: 'Decanter centrifuge',
    cleaning: 'continuous',
    role: 'High-solids duties: sludge dewatering, wastewater and oily tank bottoms.',
    models: ['alfa-laval-nx-314', 'alfa-laval-nx-418', 'alfa-laval-chnx-418', 'alfa-laval-g2-40', 'sharples-p-3000', 'sharples-p-3400'].map(model),
  },
  {
    key: 'food',
    name: 'Alfa Laval BRPX, BTPX, LAPX and Clara',
    type: 'Food-grade and biotech disc stack',
    cleaning: 'self-cleaning',
    role: 'Beverage clarification, food processing and biotech separation.',
    models: ['alfa-laval-brpx-313', 'alfa-laval-btpx-205', 'alfa-laval-lapx-404', 'alfa-laval-clara-20'].map(model),
  },
];

const HUB = `${SITE}/alfa-laval-centrifuge/`;
const STANDARD = `${SITE}/centrifuge-reconditioning-standard/`;
const CONTACT = `${SITE}/contact-for-alfa-laval-centrifuges/`;

export const usedOffer = {
  seller: {
    name: 'Dolphin Centrifuge',
    url: SITE,
    telephone: '+1-248-522-2573',
    email: 'sales@dolphincentrifuge.com',
    address: '24248 Gibson Dr, Warren, MI 48089, USA',
    established: 1982,
    independence: 'Independent remanufacturer of Alfa Laval centrifuges. Not affiliated with Alfa Laval and not an authorized Alfa Laval distributor.',
    sources: [`${SITE}/about-dolphin-centrifuge/`, CONTACT],
  },
  condition: {
    offered: 'remanufactured',
    alsoSearchedAs: ['used', 'reconditioned', 'refurbished', 'rebuilt', 'remanufactured'],
    notOffered: "Dolphin does not sell centrifuges 'as is'. Used equipment dealers often list Alfa Laval centrifuges 'as is', with no bowl inspection and no warranty.",
    standard: [
      'Bowl and critical rotating components visually inspected for excessive wear',
      'Every seal, gasket, friction pad, bearing and fastener replaced regardless of condition; exposed fasteners upgraded to stainless steel',
      'Rotating assembly vibration-checked and dynamically balanced as needed',
      'Base sandblasted and double-coated',
      'Full test run at rated speed before shipment on a surrogate fluid (hydraulic oil or water)',
      'Running amps and performance recorded on every unit; signed test or FAT report available on request (additional charges may apply)',
    ],
    qualification: 'General reconditioning standard, not a binding specification. Actual scope depends on unit condition and is defined in the quote.',
    sources: [STANDARD, HUB],
  },
  warranty: {
    summary: '6-month mechanical warranty covering defects in parts, materials and workmanship from the date of delivery, as specified in the formal proposal.',
    support: 'Ongoing technical support for the original purchaser for the life of the machine.',
    exclusions: 'Wear and consumable items such as seals, gaskets, friction material and bearings.',
    governingDocument: 'Full terms are in the Warranty and Terms document that accompanies every proposal.',
    sources: [STANDARD],
  },
  inventory: {
    statement: '150+ centrifuges in stock at the Warren, Michigan facility, available for rebuild and custom configuration.',
    commonlyStocked: 'MAB 103, MAB 204, MAB 205, MAB 206 and MAB 209 manual-clean separators; MOPX 205, MOPX 207, MOPX 209, MOPX 213, WHPX 405, WHPX 510 and WHPX 513 self-cleaning separators; NX 309, NX 314 and NX 418 decanters.',
    perModelCountsPublished: false,
    howToConfirm: 'Current availability of an exact model is confirmed per quote. Call (248) 522-2573 or request a quote.',
    visits: 'Buyers may visit the Warren, Michigan facility to inspect machines by appointment.',
    sources: [HUB, CONTACT],
  },
  supplyOptions: [
    'Complete skid with pumps, heater and PLC controls (Dolphin DMB and DMPX modules)',
    'Bare centrifuge',
  ],
  priceGuidance: {
    basis: 'Quoted per unit and application. Exact prices are not published.',
    anchors: [
      { item: 'Smallest manual-clean skid (Alfa Laval MAB 103, Dolphin DMB-004), with controls and pumps', from: 'starts around the mid-$30s', source: `${SITE}/diesel-centrifuge/` },
      { item: 'Complete plug-and-play self-cleaning module', from: 'starts around $50K, EXW Warren MI', source: `${SITE}/waste-oil-centrifuge/` },
      { item: 'System with full stainless steel wetted parts', from: 'starts around the mid-$60s, EXW Warren MI', source: `${SITE}/wastewater-centrifuge/` },
    ],
  },
  services: {
    sampleTesting: `${SITE}/industrial-centrifuge-sample-testing/`,
    responseTime: 'Inquiries answered within one business day; a full quote typically follows within 1 to 10 business days depending on configuration.',
    shipping: 'Ships worldwide.',
    buyback: `${SITE}/industrial-centrifuge-buyback/`,
    sources: [CONTACT],
  },
};

/** Public JSON record: offer plus families and applications with absolute URLs. */
export function buildUsedOfferRecord() {
  return {
    schemaVersion: USED_OFFER_SCHEMA_VERSION,
    lastReviewed: '2026-09-27',
    page: USED_PAGE_URL,
    quoteRequest: {
      page: `${USED_PAGE_URL}#quote`,
      webMcpTool: 'request_used_alfa_laval_quote',
      phone: '+1-248-522-2573',
      note: 'A quote request asks for engineering follow-up. It is not an order and does not reserve a machine.',
    },
    ...usedOffer,
    families: usedFamilies.map(({ models, ...family }) => ({ ...family, models })),
    applications: usedApplications.map(({ path, ...application }) => ({ ...application, page: `${SITE}${path}` })),
    technicalCatalog: `${SITE}/technical-data/centrifuges.v1.json`,
  };
}
