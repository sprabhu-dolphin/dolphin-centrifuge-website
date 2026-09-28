// One source for the used / reconditioned Alfa Laval offer. The page
// /used-alfa-laval-centrifuges-for-sale/, its JSON record and the WebMCP tool
// all read this file, so they cannot drift apart.
//
// Customer-facing statements here use only owner-approved copy (2026-09-28).
// Do not add inventory counts per model, prices, warranty terms or
// certifications. Model names and pages come from the technical catalog,
// never retyped.
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

/** Application pages that already exist on the site, in page order.
 * `families` is machine data for the WebMCP finder only; it is not shown on the page. */
export const usedApplications = [
  { key: 'used-oil', label: 'Used motor oil', path: '/used-oil-centrifuge/', families: ['whpx', 'mopx'] },
  { key: 'waste-oil', label: 'Waste oil', path: '/waste-oil-centrifuge/', families: ['whpx', 'mopx'] },
  { key: 'wvo-uco', label: 'WVO/used cooking oil', path: '/wvo-centrifuge-separator/', families: ['whpx', 'mopx', 'mapx'] },
  { key: 'fuel-oil', label: 'Fuel oil/HFO', path: '/fuel-oil-centrifuge/', families: ['whpx', 'mopx'] },
  { key: 'lube-oil', label: 'Lube oil', path: '/lube-oil-centrifuge/', families: ['mab', 'whpx'] },
  { key: 'hydraulic-oil', label: 'Hydraulic oil', path: '/hydraulic-oil-centrifuge/', families: ['mab', 'whpx'] },
  { key: 'diesel', label: 'Diesel polishing', path: '/diesel-centrifuge/', families: ['whpx', 'mab', 'mopx'] },
  { key: 'biodiesel', label: 'Biodiesel', path: '/biodiesel-centrifuge/', families: ['whpx'] },
  { key: 'crude-oil', label: 'Crude oil/tank bottoms', path: '/crude-oil-centrifuge/', families: ['nx', 'whpx'] },
  { key: 'wastewater', label: 'Industrial wastewater', path: '/wastewater-centrifuge/', families: ['nx', 'whpx'] },
  { key: 'machine-coolant', label: 'Machine coolant', path: '/machine-coolant-centrifuge/', families: ['wspx'] },
  { key: 'beer-wine', label: 'Beer and wine', path: '/beer-wine-centrifuge/', families: ['food'] },
  { key: 'food', label: 'Food grade/biotech', path: '/food-grade-centrifuge/', families: ['food'] },
];

/** Machine data for the WebMCP finder only; the page shows no model table. */
export const usedFamilies = [
  {
    key: 'whpx',
    name: 'Alfa Laval WHPX',
    type: 'Self-cleaning disc stack',
    cleaning: 'self-cleaning',
    models: ['alfa-laval-whpx-405', 'alfa-laval-whpx-407', 'alfa-laval-whpx-409', 'alfa-laval-whpx-510', 'alfa-laval-whpx-513'].map(model),
  },
  {
    key: 'mopx',
    name: 'Alfa Laval MOPX',
    type: 'Self-cleaning disc stack',
    cleaning: 'self-cleaning',
    models: ['alfa-laval-mopx-205', 'alfa-laval-mopx-207', 'alfa-laval-mopx-209', 'alfa-laval-mopx-213'].map(model),
  },
  {
    key: 'mapx',
    name: 'Alfa Laval MAPX',
    type: 'Self-cleaning disc stack',
    cleaning: 'self-cleaning',
    models: ['alfa-laval-mapx-207', 'alfa-laval-mapx-210', 'alfa-laval-mapx-309'].map(model),
  },
  {
    key: 'mab',
    name: 'Alfa Laval MAB',
    type: 'Manual-clean disc stack',
    cleaning: 'manual',
    models: ['alfa-laval-mab-103', 'alfa-laval-mab-104', 'alfa-laval-mab-204', 'alfa-laval-mab-205', 'alfa-laval-mab-206', 'alfa-laval-mab-207', 'alfa-laval-mab-209'].map(model),
  },
  {
    key: 'wspx',
    name: 'Alfa Laval WSPX',
    type: 'Self-cleaning disc stack for water-based fluids',
    cleaning: 'self-cleaning',
    models: ['alfa-laval-wspx-207', 'alfa-laval-wspx-303', 'alfa-laval-wspx-307', 'alfa-laval-wspx-407'].map(model),
  },
  {
    key: 'nx',
    name: 'Alfa Laval NX, CHNX and G2 decanters',
    type: 'Decanter centrifuge',
    cleaning: 'continuous',
    models: ['alfa-laval-nx-314', 'alfa-laval-nx-418', 'alfa-laval-chnx-418', 'alfa-laval-g2-40', 'sharples-p-3000', 'sharples-p-3400'].map(model),
  },
  {
    key: 'food',
    name: 'Alfa Laval BRPX, BTPX, LAPX and Clara',
    type: 'Food-grade and biotech disc stack',
    cleaning: 'self-cleaning',
    models: ['alfa-laval-brpx-313', 'alfa-laval-btpx-205', 'alfa-laval-lapx-404', 'alfa-laval-clara-20'].map(model),
  },
];

const HUB = `${SITE}/alfa-laval-centrifuge/`;
const STANDARD = `${SITE}/centrifuge-reconditioning-standard/`;
const CONTACT = `${SITE}/contact-for-alfa-laval-centrifuges/`;

/** Approved opening answer (page section 1 and FAQ 1). */
export const USED_OPENING_ANSWER = 'Dolphin sells used Alfa Laval centrifuges it has remanufactured in its own shop in Warren, Michigan. 150+ self-cleaning disc stack centrifuges manufactured by Alfa Laval in stock. Each is sold only as a complete, fully functional module: the reconditioned centrifuge on a new skid with new controls, pumps and sensors. Every unit gets new seals, gaskets, bearings and fasteners, is wet-tested on a surrogate fluid, and ships with a warranty. Dolphin is not affiliated with Alfa Laval.';

/** Approved price guidance (page price section and FAQ 4). */
export const USED_PRICE_TEXT = 'For used oil and waste oil we recommend a complete plug-and-play module built around a self-cleaning, three-phase centrifuge that separates oil from water and sludge. The module includes a pump, automatic controls, sensors, piping, valves and wiring harness, all new except the centrifuge, which is fully rebuilt with a warranty. Modules start in the mid-$50s. Optional accessories such as heaters, pre- and post-filters, a clean oil tank and a transfer pump are also available.';

export const usedOffer = {
  seller: {
    name: 'Dolphin Centrifuge',
    url: SITE,
    telephone: '+1-248-522-2573',
    email: 'sales@dolphincentrifuge.com',
    address: '24248 Gibson Dr, Warren, MI 48089, USA',
    established: 1982,
    independence: 'Dolphin Centrifuge is an independent remanufacturer of Alfa Laval centrifuges and is not affiliated with Alfa Laval.',
    sources: [`${SITE}/about-dolphin-centrifuge/`, CONTACT],
  },
  condition: {
    offered: 'remanufactured',
    alsoSearchedAs: ['used', 'reconditioned', 'refurbished', 'rebuilt', 'remanufactured'],
    notOffered: 'Fully rebuilt, never sold as-is.',
    standard: [
      'Bowl and rotating parts inspected for wear and repaired where possible',
      'Every seal, gasket, friction pad, bearing and fastener replaced; exposed fasteners upgraded to stainless',
      'Rotating assembly vibration-checked and balanced as needed',
      'Frame sandblasted and coated with two-part epoxy per OEM specifications',
      'New motor',
      'Transmission upgraded to a friction-free drive where the application requires it',
      'Full wet test at rated speed on a surrogate fluid (hydraulic oil or water)',
      'FAT available on request',
    ],
    sources: [STANDARD, HUB],
  },
  warranty: {
    summary: '6-month mechanical warranty with all skids, plus lifetime technical support.',
    sources: [STANDARD],
  },
  inventory: {
    statement: '150+ centrifuges in stock in Warren, Michigan.',
    perModelCountsPublished: false,
    howToConfirm: 'Call (248) 522-2573 or request a quote.',
    visits: 'You can visit our Warren, Michigan shop by appointment to see machines in stock.',
    sources: [HUB, CONTACT],
  },
  supplyOptions: ['Complete plug-and-play modules only.'],
  priceGuidance: {
    basis: 'Quoted per unit and application.',
    from: 'Modules start in the mid-$50s.',
    summary: USED_PRICE_TEXT,
  },
  services: {
    sampleTesting: `${SITE}/industrial-centrifuge-sample-testing/`,
    responseTime: 'An engineer replies within one business day.',
    shipping: 'Ships worldwide.',
    sources: [CONTACT],
  },
};

/** Public JSON record: offer plus families and applications with absolute URLs. */
export function buildUsedOfferRecord() {
  return {
    schemaVersion: USED_OFFER_SCHEMA_VERSION,
    lastReviewed: '2026-09-28',
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
