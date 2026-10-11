// Dated "Alfa Laval centrifuges in stock" list. The page
// /alfa-laval-centrifuges-in-stock/ and the record
// /technical-data/stock-list.v1.json both read this file only.
//
// Published fields only. Serials, costs and locations never go here.
// Every unit sold is remanufactured to the published reconditioning standard
// before shipment, so `condition` says where a listed unit is in that process.
//
// Unit shape:
//   { family: 'MOPX', model: 'MOPX 207',
//     type: 'disc stack self-cleaning' | 'disc stack manual-clean' | 'decanter',
//     condition: 'remanufactured' | 'remanufactured to order' | 'new old stock, unused',
//     status: 'in stock' | 'reserved',
//     quantity: 1, modelPage: '/alfa-laval-mopx-207-centrifuge/',
//     // Optional public fields. Leave a field out when it is unknown; never guess.
//     bowlSpeedRpm, motorHp, bowlDiameter, wettedParts, separationType,
//     cleaningMethod: 'self-cleaning' | 'manual-clean',
//     capacity: '<n> GPM on <fluid> at <conditions>' (spec data only),
//     configuration: 'Skid-mounted' ... (only what the inventory sheet states) }
//
// To publish: set asOf to the list date (YYYY-MM-DD) and add units. Nothing
// else changes. While `units` is empty the page is noindex and left out of the
// sitemap (see config/noindex-registry.mjs); the first unit turns both off.

export const STOCK_PAGE_PATH = '/alfa-laval-centrifuges-in-stock/';
export const STOCK_JSON_PATH = '/technical-data/stock-list.v1.json';

export const stockList = {
  // asOf is the date the owner confirmed this list (2026-10-11). The source sheet "List w Capacities.xlsx" is dated 2025-12-09.
  asOf: '2026-10-11',
  units: [
    { family: 'AFPX', model: 'AFPX 407', type: 'disc stack self-cleaning', condition: 'remanufactured', status: 'in stock', quantity: 1, wettedParts: 'stainless steel (SS316) wetted parts' },
    { family: 'ALDEC', model: 'ALDEC G2-40', type: 'decanter', condition: 'new old stock, unused', status: 'in stock', quantity: 1, modelPage: '/alfa-laval-g2-40-decanter/', bowlSpeedRpm: 4000, motorHp: 20, wettedParts: 'stainless steel (SS316) wetted parts' },
    { family: 'BDB', model: 'BDB 104', type: 'disc stack manual-clean', condition: 'new old stock, unused', status: 'in stock', quantity: 1, wettedParts: 'stainless steel (SS316) wetted parts' },
    { family: 'BRPX', model: 'BRPX 213', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'in stock', quantity: 1, wettedParts: 'stainless steel (SS316) wetted parts' },
    { family: 'BRPX', model: 'BRPX 213', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'in stock', quantity: 1, wettedParts: 'stainless steel (SS316) wetted parts', configuration: 'Skid-mounted' },
    { family: 'BRPX', model: 'BRPX 417', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'in stock', quantity: 1, wettedParts: 'stainless steel (SS316) wetted parts' },
    { family: 'BTPX', model: 'BTPX 205', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'in stock', quantity: 2, modelPage: '/alfa-laval-btpx-205-biotech-centrifuge/', bowlSpeedRpm: 9650, motorHp: 7.5, wettedParts: 'stainless steel (SS316) wetted parts', configuration: 'Complete Alfa Laval modules on stainless steel skids, near-new condition' },
    { family: 'CHNX', model: 'CHNX 418', type: 'decanter', condition: 'new old stock, unused', status: 'in stock', quantity: 1, modelPage: '/alfa-laval-chnx-418-decanter/', bowlSpeedRpm: 4000, motorHp: 20, bowlDiameter: '418 mm', wettedParts: 'stainless steel (SS316) wetted parts' },
    { family: 'FOPX', model: 'FOPX 610', type: 'disc stack self-cleaning', condition: 'remanufactured', status: 'in stock', quantity: 1, wettedParts: 'SS316 with some bronze parts' },
    { family: 'FOPX', model: 'FOPX 613', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'in stock', quantity: 1, motorHp: 15, wettedParts: 'SS316 with some bronze parts' },
    { family: 'LAPX', model: 'LAPX 202', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'in stock', quantity: 1, wettedParts: 'stainless steel (SS316) wetted parts' },
    { family: 'MAB', model: 'MAB 104', type: 'disc stack manual-clean', condition: 'remanufactured', status: 'in stock', quantity: 1, modelPage: '/alfa-laval-mab-104-centrifuge/', bowlSpeedRpm: 7350, motorHp: 2, wettedParts: 'SS316 with some bronze parts', cleaningMethod: 'manual-clean', capacity: '6.6 GPM on 13 cSt diesel at 40 °C', configuration: 'Skid-mounted' },
    { family: 'MAPX', model: 'MAPX 209', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'in stock', quantity: 1, wettedParts: 'SS316 with some bronze parts', configuration: 'Skid-mounted' },
    { family: 'MAPX', model: 'MAPX 210', type: 'disc stack self-cleaning', condition: 'remanufactured', status: 'in stock', quantity: 1, wettedParts: 'SS316 with some bronze parts', cleaningMethod: 'self-cleaning' },
    { family: 'MAPX', model: 'MAPX 309', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'in stock', quantity: 2, motorHp: 10, wettedParts: 'SS316 with some bronze parts' },
    { family: 'MOPX', model: 'MOPX 207', type: 'disc stack self-cleaning', condition: 'remanufactured', status: 'in stock', quantity: 2, modelPage: '/alfa-laval-mopx-207-centrifuge/', bowlSpeedRpm: 6325, motorHp: 7.5, wettedParts: 'SS316 with some bronze parts', separationType: 'Three-phase (oil / water / solids)', cleaningMethod: 'self-cleaning', capacity: '22.0 GPM on 13 cSt diesel at 40 °C' },
    { family: 'MOPX', model: 'MOPX 207', type: 'disc stack self-cleaning', condition: 'remanufactured', status: 'in stock', quantity: 1, modelPage: '/alfa-laval-mopx-207-centrifuge/', bowlSpeedRpm: 6325, motorHp: 7.5, wettedParts: 'SS316 with some bronze parts', separationType: 'Three-phase (oil / water / solids)', cleaningMethod: 'self-cleaning', capacity: '22.0 GPM on 13 cSt diesel at 40 °C', configuration: 'Skid-mounted' },
    { family: 'MOPX', model: 'MOPX 210', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'in stock', quantity: 2, wettedParts: 'SS316 with some bronze parts', cleaningMethod: 'self-cleaning', capacity: '41.4 GPM on 13 cSt diesel at 40 °C' },
    { family: 'MOPX', model: 'MOPX 213', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'in stock', quantity: 1, motorHp: 15, wettedParts: 'SS316 with some bronze parts', cleaningMethod: 'self-cleaning', capacity: '63.4 GPM on 13 cSt diesel at 40 °C' },
    { family: 'MOPX', model: 'MOPX 410', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'in stock', quantity: 1, wettedParts: 'SS316 with some bronze parts' },
    { family: 'NX', model: 'NX 418', type: 'decanter', condition: 'remanufactured', status: 'in stock', quantity: 2, modelPage: '/alfa-laval-nx-418-decanter-centrifuge/', bowlSpeedRpm: 4000, motorHp: 20, bowlDiameter: '418 mm', wettedParts: 'stainless steel (SS316) wetted parts' },
    { family: 'NX', model: 'NX 418', type: 'decanter', condition: 'new old stock, unused', status: 'in stock', quantity: 1, modelPage: '/alfa-laval-nx-418-decanter-centrifuge/', bowlSpeedRpm: 4000, motorHp: 20, bowlDiameter: '418 mm', wettedParts: 'stainless steel (SS316) wetted parts', configuration: '3.5 gear box' },
    { family: 'Sharples', model: 'Sharples P-3400', type: 'decanter', condition: 'remanufactured', status: 'in stock', quantity: 1, modelPage: '/sharples-p-3400-decanter/', bowlSpeedRpm: 4000, motorHp: 25, wettedParts: 'stainless steel (SS316) wetted parts' },
    { family: 'UVNX', model: 'UVNX 309', type: 'decanter', condition: 'remanufactured', status: 'in stock', quantity: 1, wettedParts: 'SS316 bowl, carbon steel frame' },
    { family: 'UVNX', model: 'UVNX 414', type: 'decanter', condition: 'remanufactured', status: 'in stock', quantity: 1, wettedParts: 'stainless steel (SS316) wetted parts' },
    { family: 'VNPX', model: 'VNPX 207', type: 'disc stack self-cleaning', condition: 'remanufactured', status: 'in stock', quantity: 1, wettedParts: 'stainless steel (SS316) wetted parts' },
    { family: 'VNPX', model: 'VNPX 407', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'in stock', quantity: 1, wettedParts: 'stainless steel (SS316) wetted parts', configuration: 'Skid-mounted' },
    { family: 'VNPX', model: 'VNPX 407', type: 'disc stack self-cleaning', condition: 'remanufactured', status: 'in stock', quantity: 1, wettedParts: 'stainless steel (SS316) wetted parts' },
    { family: 'VNPX', model: 'VNPX 410', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'in stock', quantity: 1, wettedParts: 'stainless steel (SS316) wetted parts', configuration: 'Skid-mounted' },
    { family: 'WHPX', model: 'WHPX 405', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'in stock', quantity: 1, modelPage: '/alfa-laval-whpx-405/', bowlSpeedRpm: 7600, motorHp: 5, wettedParts: 'SS316 with some bronze parts', separationType: 'Three-phase (oil / water / solids)', cleaningMethod: 'self-cleaning', capacity: '16.3 GPM on 13 cSt diesel at 40 °C' },
    { family: 'WHPX', model: 'WHPX 405', type: 'disc stack self-cleaning', condition: 'remanufactured', status: 'in stock', quantity: 1, modelPage: '/alfa-laval-whpx-405/', bowlSpeedRpm: 7600, motorHp: 5, wettedParts: 'SS316 with some bronze parts', separationType: 'Three-phase (oil / water / solids)', cleaningMethod: 'self-cleaning', capacity: '16.3 GPM on 13 cSt diesel at 40 °C' },
    { family: 'WHPX', model: 'WHPX 407', type: 'disc stack self-cleaning', condition: 'remanufactured', status: 'in stock', quantity: 2, bowlSpeedRpm: 7125, motorHp: 10, wettedParts: 'SS316 with some bronze parts', cleaningMethod: 'self-cleaning', capacity: '26.4 GPM on 13 cSt diesel at 40 °C' },
    { family: 'WHPX', model: 'WHPX 510', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'in stock', quantity: 1, modelPage: '/alfa-laval-whpx-510-centrifuge/', bowlSpeedRpm: 5180, motorHp: 10, wettedParts: 'SS316 with some bronze parts', separationType: 'Three-phase (oil / water / solids)', cleaningMethod: 'self-cleaning', capacity: '47.1 GPM on 13 cSt diesel at 40 °C', configuration: 'Skid with heater' },
    { family: 'WHPX', model: 'WHPX 513', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'in stock', quantity: 3, modelPage: '/alfa-laval-whpx-513/', motorHp: 15, wettedParts: 'SS316 with some bronze parts', cleaningMethod: 'self-cleaning', capacity: '72.2 GPM on 13 cSt diesel at 40 °C' },
    { family: 'WSB', model: 'WSB 103', type: 'disc stack manual-clean', condition: 'remanufactured to order', status: 'in stock', quantity: 1, wettedParts: 'stainless steel (SS316) wetted parts' },
    { family: 'WSB', model: 'WSB 104', type: 'disc stack manual-clean', condition: 'remanufactured to order', status: 'in stock', quantity: 1, motorHp: 2, wettedParts: 'stainless steel (SS316) wetted parts' },
    { family: 'WSPX', model: 'WSPX 207', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'in stock', quantity: 1, modelPage: '/alfa-laval-wspx-207-self-cleaning-coolant-centrifuge/', bowlSpeedRpm: 6300, motorHp: 7.5, wettedParts: 'stainless steel (SS316) wetted parts', separationType: '3-Phase (Liquid-Liquid-Solid)', cleaningMethod: 'self-cleaning', configuration: 'Skid-mounted' },
  ],
};

export const STOCK_TYPES = ['disc stack self-cleaning', 'disc stack manual-clean', 'decanter'];
export const STOCK_CONDITIONS = ['remanufactured', 'remanufactured to order', 'new old stock, unused'];
export const STOCK_CLEANING = ['self-cleaning', 'manual-clean'];
export const STOCK_STATUSES = ['in stock', 'reserved'];

/** True only when there is a dated list with at least one unit. */
export function hasStock(list = stockList) {
  return Boolean(list.asOf) && list.units.length > 0;
}

/** Fails the build on a malformed list so a bad drop never ships quietly. */
export function validateStockList(list = stockList) {
  if (list.units.length === 0) return;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(list.asOf))) throw new Error('stockList: asOf must be YYYY-MM-DD when units exist');
  list.units.forEach((u, i) => {
    const where = `stockList.units[${i}]`;
    if (!u.family || !u.model) throw new Error(`${where}: family and model are required`);
    if (!STOCK_TYPES.includes(u.type)) throw new Error(`${where}: bad type ${u.type}`);
    if (!STOCK_CONDITIONS.includes(u.condition)) throw new Error(`${where}: bad condition ${u.condition}`);
    if (!STOCK_STATUSES.includes(u.status)) throw new Error(`${where}: bad status ${u.status}`);
    if (!Number.isInteger(u.quantity) || u.quantity < 1) throw new Error(`${where}: quantity must be a positive integer`);
    for (const k of ['wettedParts', 'separationType', 'bowlDiameter', 'capacity', 'configuration']) {
      if (u[k] !== undefined && (typeof u[k] !== 'string' || !u[k].trim())) throw new Error(`${where}: ${k} must be a non-empty string`);
    }
    if (u.cleaningMethod !== undefined && !STOCK_CLEANING.includes(u.cleaningMethod)) throw new Error(`${where}: bad cleaningMethod ${u.cleaningMethod}`);
    for (const k of ['bowlSpeedRpm', 'motorHp']) {
      if (u[k] !== undefined && !(typeof u[k] === 'number' || (Array.isArray(u[k]) && u[k].length === 2))) throw new Error(`${where}: ${k} must be a number or [min, max]`);
    }
    if (u.modelPage && !/^\/[^\s]*\/$/.test(u.modelPage)) throw new Error(`${where}: modelPage must be a site path ending in /`);
  });
}
