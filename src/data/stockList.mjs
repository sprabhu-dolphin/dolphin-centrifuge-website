// Dated centrifuges-in-stock list (Alfa Laval, Sharples and ALDEC machines). The page
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
//     status: 'in stock' | 'built to order' | 'reserved',
//       ('built to order' is the status of every 'remanufactured to order' row: a used unit
//       Dolphin remanufactures after an order, not a ready-built unit)
//     quantity: 1, modelPage: '/alfa-laval-mopx-207-centrifuge/',
//     // Optional public fields. Leave a field out when it is unknown; never guess.
//     bowlSpeedRpm, motorHp, motorKw (use motorKw when Alfa Laval prints kW), bowlDiameter, wettedParts, separationType,
//     cleaningMethod: 'self-cleaning' | 'manual-clean',
//     capacity: '<n> GPM on <fluid> at <conditions>' (spec data only),
//     configuration: 'Skid-mounted' ... (only what the inventory sheet states) }
//
// To publish: set asOf to the list date (YYYY-MM-DD) and add units. Nothing
// else changes. While `units` is empty the page is noindex and left out of the
// sitemap (see config/noindex-registry.mjs); the first unit turns both off.

export const STOCK_PAGE_PATH = '/alfa-laval-centrifuges-in-stock/';
export const STOCK_JSON_PATH = '/technical-data/stock-list.v1.json';

/** Date of the owner's written inventory sheet the listed units come from ("List w Capacities.xlsx"). */
export const INVENTORY_LIST_DATE = '2025-12-09';

/**
 * Owner ruling 2026-11-16: "Not all machines are in the list, so keep it at 150 plus."
 * Every agent surface that serves this list carries this sentence. No reason or count for the unlisted machines.
 */
export function stockCoverage(list = stockList) {
  return `This list shows machines from Dolphin's written inventory list dated ${list.asOf}. It is not the complete stock; Dolphin holds more machines than are listed.`;
}

// Owner 2026-11-16: "We can certainly add our entire stock list to the WebMCP as well."
// Every complete machine on the sheet, public fields only, grouped by model, condition,
// configuration and wetted parts. Left out: frame-only / missing-bowl units, a bowl on
// its own, a machine whose sheet notes say an assembly is missing, the one non-Alfa Laval
// maker (Westfalia), and one unit whose machine type the sheet does not state (P 605).
// Per-model figures come from the October list or the site's public spec data only.
export const stockList = {
  // asOf is the date of the inventory sheet the units come from.
  asOf: INVENTORY_LIST_DATE,
  units: [
    { family: 'AFPX', model: 'AFPX 407', type: 'disc stack self-cleaning', condition: 'remanufactured', status: 'in stock', quantity: 1, wettedParts: 'stainless steel (SS316) wetted parts', cleaningMethod: 'self-cleaning' },
    { family: 'ALDEC', model: 'ALDEC G2-40', type: 'decanter', condition: 'new old stock, unused', status: 'in stock', quantity: 1, modelPage: '/alfa-laval-g2-40-decanter/', bowlSpeedRpm: 4000, motorHp: 20, wettedParts: 'stainless steel (SS316) wetted parts' },
    { family: 'BDB', model: 'BDB 104', type: 'disc stack manual-clean', condition: 'new old stock, unused', status: 'in stock', quantity: 1, wettedParts: 'stainless steel (SS316) wetted parts', cleaningMethod: 'manual-clean' },
    { family: 'BRPX', model: 'BRPX 213', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'built to order', quantity: 2, wettedParts: 'stainless steel (SS316) wetted parts', cleaningMethod: 'self-cleaning' },
    { family: 'BRPX', model: 'BRPX 213', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'built to order', quantity: 1, wettedParts: 'stainless steel (SS316) wetted parts', cleaningMethod: 'self-cleaning', configuration: 'Skid-mounted' },
    { family: 'BRPX', model: 'BRPX 313', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'built to order', quantity: 2, motorHp: 15, wettedParts: 'stainless steel (SS316) wetted parts', cleaningMethod: 'self-cleaning' },
    { family: 'BRPX', model: 'BRPX 417', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'built to order', quantity: 1, wettedParts: 'stainless steel (SS316) wetted parts', cleaningMethod: 'self-cleaning' },
    { family: 'BTPX', model: 'BTPX 205', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'built to order', quantity: 2, modelPage: '/alfa-laval-btpx-205-disc-centrifuge/', bowlSpeedRpm: 9650, motorHp: 7.5, wettedParts: 'stainless steel (SS316) wetted parts', cleaningMethod: 'self-cleaning', configuration: 'Skid-mounted' },
    { family: 'CHNX', model: 'CHNX 418', type: 'decanter', condition: 'new old stock, unused', status: 'in stock', quantity: 1, modelPage: '/alfa-laval-chnx-418-decanter/', bowlSpeedRpm: 4000, motorHp: 20, bowlDiameter: '418 mm', wettedParts: 'stainless steel (SS316) wetted parts' },
    { family: 'FOPX', model: 'FOPX 610', type: 'disc stack self-cleaning', condition: 'remanufactured', status: 'in stock', quantity: 1, wettedParts: 'SS316 with some bronze parts', cleaningMethod: 'self-cleaning' },
    { family: 'FOPX', model: 'FOPX 613', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'built to order', quantity: 1, motorHp: 15, wettedParts: 'SS316 with some bronze parts', cleaningMethod: 'self-cleaning' },
    { family: 'LAPX', model: 'LAPX 202', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'built to order', quantity: 1, wettedParts: 'stainless steel (SS316) wetted parts', cleaningMethod: 'self-cleaning' },
    { family: 'MAB', model: 'MAB 103', type: 'disc stack manual-clean', condition: 'remanufactured', status: 'in stock', quantity: 2, modelPage: '/alfa-laval-mab-103-centrifuge/', bowlSpeedRpm: 8600, motorHp: 1, wettedParts: 'SS316 with some bronze parts', cleaningMethod: 'manual-clean' },
    { family: 'MAB', model: 'MAB 104', type: 'disc stack manual-clean', condition: 'remanufactured', status: 'in stock', quantity: 1, modelPage: '/alfa-laval-mab-104-centrifuge/', bowlSpeedRpm: 7350, motorHp: 2, wettedParts: 'SS316 with some bronze parts', cleaningMethod: 'manual-clean', capacity: '6.6 US GPM converted from 1,500 L/h, 13 cSt diesel at 40 °C' },
    { family: 'MAB', model: 'MAB 104', type: 'disc stack manual-clean', condition: 'remanufactured', status: 'in stock', quantity: 1, modelPage: '/alfa-laval-mab-104-centrifuge/', bowlSpeedRpm: 7350, motorHp: 2, wettedParts: 'SS316 with some bronze parts', cleaningMethod: 'manual-clean', capacity: '6.6 US GPM converted from 1,500 L/h, 13 cSt diesel at 40 °C', configuration: 'Skid-mounted' },
    { family: 'MAB', model: 'MAB 204', type: 'disc stack manual-clean', condition: 'remanufactured to order', status: 'built to order', quantity: 2, motorHp: 4, wettedParts: 'SS316 with some bronze parts', cleaningMethod: 'manual-clean' },
    { family: 'MAB', model: 'MAB 205', type: 'disc stack manual-clean', condition: 'remanufactured', status: 'in stock', quantity: 1, motorHp: 5, wettedParts: 'SS316 with some bronze parts', cleaningMethod: 'manual-clean' },
    { family: 'MAB', model: 'MAB 205', type: 'disc stack manual-clean', condition: 'remanufactured to order', status: 'built to order', quantity: 5, motorHp: 5, wettedParts: 'SS316 with some bronze parts', cleaningMethod: 'manual-clean' },
    { family: 'MAB', model: 'MAB 206', type: 'disc stack manual-clean', condition: 'remanufactured', status: 'in stock', quantity: 1, motorHp: 7.5, wettedParts: 'SS316 with some bronze parts', cleaningMethod: 'manual-clean' },
    { family: 'MAB', model: 'MAB 206', type: 'disc stack manual-clean', condition: 'remanufactured to order', status: 'built to order', quantity: 1, motorHp: 7.5, wettedParts: 'SS316 with some bronze parts', cleaningMethod: 'manual-clean' },
    { family: 'MAB', model: 'MAB 207', type: 'disc stack manual-clean', condition: 'remanufactured', status: 'in stock', quantity: 1, motorHp: 10, wettedParts: 'SS316 with some bronze parts', cleaningMethod: 'manual-clean' },
    { family: 'MAB', model: 'MAB 207', type: 'disc stack manual-clean', condition: 'remanufactured to order', status: 'built to order', quantity: 1, motorHp: 10, wettedParts: 'SS316 with some bronze parts', cleaningMethod: 'manual-clean' },
    { family: 'MAB', model: 'MAB 209', type: 'disc stack manual-clean', condition: 'remanufactured to order', status: 'built to order', quantity: 1, motorHp: 15, wettedParts: 'SS316 with some bronze parts', cleaningMethod: 'manual-clean' },
    { family: 'MAPX', model: 'MAPX 204', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'built to order', quantity: 1, wettedParts: 'SS316 with some bronze parts', cleaningMethod: 'self-cleaning' },
    { family: 'MAPX', model: 'MAPX 207', type: 'disc stack self-cleaning', condition: 'new old stock, unused', status: 'in stock', quantity: 1, motorHp: 7.5, wettedParts: 'SS316 with some bronze parts', cleaningMethod: 'self-cleaning' },
    { family: 'MAPX', model: 'MAPX 207', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'built to order', quantity: 3, motorHp: 7.5, wettedParts: 'SS316 with some bronze parts', cleaningMethod: 'self-cleaning' },
    { family: 'MAPX', model: 'MAPX 209', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'built to order', quantity: 1, wettedParts: 'SS316 with some bronze parts', cleaningMethod: 'self-cleaning', configuration: 'Skid-mounted' },
    { family: 'MAPX', model: 'MAPX 210', type: 'disc stack self-cleaning', condition: 'remanufactured', status: 'in stock', quantity: 1, wettedParts: 'SS316 with some bronze parts', cleaningMethod: 'self-cleaning' },
    { family: 'MAPX', model: 'MAPX 309', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'built to order', quantity: 2, motorHp: 10, wettedParts: 'SS316 with some bronze parts', cleaningMethod: 'self-cleaning' },
    { family: 'MOPX', model: 'MOPX 207', type: 'disc stack self-cleaning', condition: 'remanufactured', status: 'in stock', quantity: 2, modelPage: '/alfa-laval-mopx-207-centrifuge/', bowlSpeedRpm: 6325, motorKw: 7.5, wettedParts: 'SS316 with some bronze parts', separationType: 'Three-phase (oil / water / solids)', cleaningMethod: 'self-cleaning', capacity: '22.0 US GPM converted from 5,000 L/h, 13 cSt diesel at 40 °C' },
    { family: 'MOPX', model: 'MOPX 207', type: 'disc stack self-cleaning', condition: 'remanufactured', status: 'in stock', quantity: 1, modelPage: '/alfa-laval-mopx-207-centrifuge/', bowlSpeedRpm: 6325, motorKw: 7.5, wettedParts: 'SS316 with some bronze parts', separationType: 'Three-phase (oil / water / solids)', cleaningMethod: 'self-cleaning', capacity: '22.0 US GPM converted from 5,000 L/h, 13 cSt diesel at 40 °C', configuration: 'Skid-mounted' },
    { family: 'MOPX', model: 'MOPX 207', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'built to order', quantity: 1, modelPage: '/alfa-laval-mopx-207-centrifuge/', bowlSpeedRpm: 6325, motorKw: 7.5, wettedParts: 'SS316 with some bronze parts', separationType: 'Three-phase (oil / water / solids)', cleaningMethod: 'self-cleaning', capacity: '22.0 US GPM converted from 5,000 L/h, 13 cSt diesel at 40 °C', configuration: 'Skid-mounted' },
    { family: 'MOPX', model: 'MOPX 210', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'built to order', quantity: 4, wettedParts: 'SS316 with some bronze parts', cleaningMethod: 'self-cleaning', capacity: '41.4 US GPM converted from 9,400 L/h, 13 cSt diesel at 40 °C' },
    { family: 'MOPX', model: 'MOPX 213', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'built to order', quantity: 4, motorKw: 15, wettedParts: 'SS316 with some bronze parts', cleaningMethod: 'self-cleaning', capacity: '63.4 US GPM converted from 14,400 L/h, 13 cSt diesel at 40 °C' },
    { family: 'MOPX', model: 'MOPX 310', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'built to order', quantity: 1, bowlSpeedRpm: 5180, motorHp: 10, wettedParts: 'SS316 with some bronze parts', separationType: 'Three-phase (oil / water / solids)', cleaningMethod: 'self-cleaning' },
    { family: 'MOPX', model: 'MOPX 313', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'built to order', quantity: 1, wettedParts: 'SS316 with some bronze parts', cleaningMethod: 'self-cleaning' },
    { family: 'MOPX', model: 'MOPX 410', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'built to order', quantity: 1, wettedParts: 'SS316 with some bronze parts', cleaningMethod: 'self-cleaning' },
    { family: 'MOPX', model: 'MOPX 513', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'built to order', quantity: 1, wettedParts: 'SS316 with some bronze parts', cleaningMethod: 'self-cleaning' },
    { family: 'NX', model: 'NX 314', type: 'decanter', condition: 'remanufactured', status: 'in stock', quantity: 1, modelPage: '/alfa-laval-nx-314-decanter-centrifuge/', bowlSpeedRpm: 4000, motorHp: 10, wettedParts: 'stainless steel (SS316) wetted parts' },
    { family: 'NX', model: 'NX 418', type: 'decanter', condition: 'new old stock, unused', status: 'in stock', quantity: 1, modelPage: '/alfa-laval-nx-418-decanter-centrifuge/', bowlSpeedRpm: 4000, motorHp: 20, bowlDiameter: '418 mm', wettedParts: 'stainless steel (SS316) wetted parts' },
    { family: 'NX', model: 'NX 418', type: 'decanter', condition: 'remanufactured', status: 'in stock', quantity: 2, modelPage: '/alfa-laval-nx-418-decanter-centrifuge/', bowlSpeedRpm: 4000, motorHp: 20, bowlDiameter: '418 mm', wettedParts: 'stainless steel (SS316) wetted parts' },
    { family: 'Sharples', model: 'Sharples P-3000', type: 'decanter', condition: 'remanufactured to order', status: 'built to order', quantity: 2, modelPage: '/sharples-p-3000-decanter/', bowlSpeedRpm: 4000, motorHp: 15 },
    { family: 'Sharples', model: 'Sharples P-3400', type: 'decanter', condition: 'remanufactured', status: 'in stock', quantity: 1, modelPage: '/sharples-p-3400-decanter/', bowlSpeedRpm: 4000, motorHp: 25, wettedParts: 'stainless steel (SS316) wetted parts' },
    { family: 'Sharples', model: 'Sharples P-5000', type: 'decanter', condition: 'remanufactured to order', status: 'built to order', quantity: 1, wettedParts: 'stainless steel (SS316) wetted parts' },
    { family: 'Sharples', model: 'Sharples P-660', type: 'decanter', condition: 'remanufactured', status: 'in stock', quantity: 1, bowlSpeedRpm: 6000, motorHp: 5 },
    { family: 'UVNX', model: 'UVNX 309', type: 'decanter', condition: 'remanufactured', status: 'in stock', quantity: 1, wettedParts: 'SS316 bowl, carbon steel frame' },
    { family: 'UVNX', model: 'UVNX 414', type: 'decanter', condition: 'remanufactured', status: 'in stock', quantity: 1, wettedParts: 'stainless steel (SS316) wetted parts' },
    { family: 'VNPX', model: 'VNPX 207', type: 'disc stack self-cleaning', condition: 'remanufactured', status: 'in stock', quantity: 1, wettedParts: 'stainless steel (SS316) wetted parts', cleaningMethod: 'self-cleaning' },
    { family: 'VNPX', model: 'VNPX 407', type: 'disc stack self-cleaning', condition: 'remanufactured', status: 'in stock', quantity: 1, wettedParts: 'stainless steel (SS316) wetted parts', cleaningMethod: 'self-cleaning' },
    { family: 'VNPX', model: 'VNPX 407', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'built to order', quantity: 1, wettedParts: 'stainless steel (SS316) wetted parts', cleaningMethod: 'self-cleaning', configuration: 'Skid-mounted' },
    { family: 'VNPX', model: 'VNPX 410', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'built to order', quantity: 1, wettedParts: 'stainless steel (SS316) wetted parts', cleaningMethod: 'self-cleaning', configuration: 'Skid-mounted' },
    { family: 'WHPX', model: 'WHPX 405', type: 'disc stack self-cleaning', condition: 'remanufactured', status: 'in stock', quantity: 1, modelPage: '/alfa-laval-whpx-405/', bowlSpeedRpm: 7600, motorHp: 5, wettedParts: 'SS316 with some bronze parts', separationType: 'Three-phase (oil / water / solids)', cleaningMethod: 'self-cleaning', capacity: '16.3 US GPM converted from 3,700 L/h, 13 cSt diesel at 40 °C' },
    { family: 'WHPX', model: 'WHPX 405', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'built to order', quantity: 1, modelPage: '/alfa-laval-whpx-405/', bowlSpeedRpm: 7600, motorHp: 5, wettedParts: 'SS316 with some bronze parts', separationType: 'Three-phase (oil / water / solids)', cleaningMethod: 'self-cleaning', capacity: '16.3 US GPM converted from 3,700 L/h, 13 cSt diesel at 40 °C' },
    { family: 'WHPX', model: 'WHPX 407', type: 'disc stack self-cleaning', condition: 'remanufactured', status: 'in stock', quantity: 2, bowlSpeedRpm: 5175, motorHp: 10, wettedParts: 'SS316 with some bronze parts', cleaningMethod: 'self-cleaning', capacity: '26.4 US GPM converted from 6,000 L/h, 13 cSt diesel at 40 °C' },
    { family: 'WHPX', model: 'WHPX 410', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'built to order', quantity: 3, wettedParts: 'SS316 with some bronze parts', cleaningMethod: 'self-cleaning' },
    { family: 'WHPX', model: 'WHPX 510', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'built to order', quantity: 4, modelPage: '/alfa-laval-whpx-510-centrifuge/', bowlSpeedRpm: 5180, motorHp: 10, wettedParts: 'SS316 with some bronze parts', separationType: 'Three-phase (oil / water / solids)', cleaningMethod: 'self-cleaning', capacity: '47.1 US GPM converted from 10,700 L/h, 13 cSt diesel at 40 °C' },
    { family: 'WHPX', model: 'WHPX 510', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'built to order', quantity: 1, modelPage: '/alfa-laval-whpx-510-centrifuge/', bowlSpeedRpm: 5180, motorHp: 10, wettedParts: 'SS316 with some bronze parts', separationType: 'Three-phase (oil / water / solids)', cleaningMethod: 'self-cleaning', capacity: '47.1 US GPM converted from 10,700 L/h, 13 cSt diesel at 40 °C', configuration: 'Skid-mounted' },
    { family: 'WHPX', model: 'WHPX 513', type: 'disc stack self-cleaning', condition: 'remanufactured', status: 'in stock', quantity: 1, modelPage: '/alfa-laval-whpx-513/', motorHp: 15, wettedParts: 'SS316 with some bronze parts', cleaningMethod: 'self-cleaning', capacity: '72.2 US GPM converted from 16,400 L/h, 13 cSt diesel at 40 °C' },
    { family: 'WHPX', model: 'WHPX 513', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'built to order', quantity: 11, modelPage: '/alfa-laval-whpx-513/', motorHp: 15, wettedParts: 'SS316 with some bronze parts', cleaningMethod: 'self-cleaning', capacity: '72.2 US GPM converted from 16,400 L/h, 13 cSt diesel at 40 °C' },
    { family: 'WSB', model: 'WSB 103', type: 'disc stack manual-clean', condition: 'remanufactured to order', status: 'built to order', quantity: 1, wettedParts: 'stainless steel (SS316) wetted parts', cleaningMethod: 'manual-clean' },
    { family: 'WSB', model: 'WSB 104', type: 'disc stack manual-clean', condition: 'remanufactured to order', status: 'built to order', quantity: 1, motorHp: 2, wettedParts: 'stainless steel (SS316) wetted parts', cleaningMethod: 'manual-clean' },
    { family: 'WSPX', model: 'WSPX 207', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'built to order', quantity: 1, modelPage: '/alfa-laval-wspx-207-self-cleaning-coolant-centrifuge/', bowlSpeedRpm: 6300, motorHp: 7.5, wettedParts: 'stainless steel (SS316) wetted parts', separationType: '3-Phase (Liquid-Liquid-Solid)', cleaningMethod: 'self-cleaning', configuration: 'Skid-mounted' },
    { family: 'WSPX', model: 'WSPX 504', type: 'disc stack self-cleaning', condition: 'remanufactured', status: 'in stock', quantity: 1, wettedParts: 'stainless steel (SS316) wetted parts', cleaningMethod: 'self-cleaning' },
  ],
};

export const STOCK_TYPES = ['disc stack self-cleaning', 'disc stack manual-clean', 'decanter'];
export const STOCK_CONDITIONS = ['remanufactured', 'remanufactured to order', 'new old stock, unused'];
export const STOCK_CLEANING = ['self-cleaning', 'manual-clean'];
export const STOCK_STATUSES = ['in stock', 'built to order', 'reserved'];

/** Owner ruling 2026-11-20: a remanufactured-to-order row is never presented as sitting in stock. */
export const BUILT_TO_ORDER_STATEMENT = 'Remanufactured to order after sale, not a ready-built unit';
export const BUILT_TO_ORDER_DETAIL = 'A used unit Dolphin remanufactures after an order. Remanufactured to order after sale, not a ready-built unit. Lead time 4 to 8 weeks for small machines, 12 to 20 weeks for larger ones.';
export const READY_BUILT_STATEMENT = 'Ready-built: already remanufactured, or new old stock and unused.';
export const SHEET_DATE_NOTE = `Sheet date ${INVENTORY_LIST_DATE} is the date of Dolphin's written inventory sheet, not a confirmation date. Availability is confirmed per quote.`;

export const isBuiltToOrder = (u) => u.condition === 'remanufactured to order';

/** Maker label for a row: Sharples and ALDEC are Alfa Laval brands, named as the data names them. */
export function stockMaker(u) {
  if (u.family === 'Sharples') return 'Sharples (Alfa Laval)';
  if (u.family === 'ALDEC') return 'Alfa Laval (ALDEC)';
  return 'Alfa Laval';
}

/** Availability sentence for a row; never "in stock" for a built-to-order row. */
export function stockAvailability(u) {
  if (u.status === 'reserved') return 'reserved';
  if (isBuiltToOrder(u)) return BUILT_TO_ORDER_STATEMENT;
  return 'in stock, ready-built';
}

/** Listing and unit counts, split ready-built vs built to order. */
export function stockCounts(units = stockList.units) {
  const sum = (list) => list.reduce((n, u) => n + (Number(u.quantity) || 0), 0);
  const built = units.filter((u) => !isBuiltToOrder(u));
  const order = units.filter(isBuiltToOrder);
  return {
    listings: units.length,
    units: sum(units),
    readyBuiltListings: built.length,
    readyBuiltUnits: sum(built),
    builtToOrderListings: order.length,
    builtToOrderUnits: sum(order),
  };
}

/** One sentence an agent can repeat: split counts plus the headline inventory. */
export function stockCountsSentence(units = stockList.units) {
  const c = stockCounts(units);
  return `${c.readyBuiltUnits} ready-built, ${c.builtToOrderUnits} remanufactured to order after sale (not ready-built), plus 150+ machines in total inventory.`;
}

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
    if (isBuiltToOrder(u) && u.status === 'in stock') throw new Error(`${where}: a remanufactured to order row must not say in stock`);
    if (!isBuiltToOrder(u) && u.status === 'built to order') throw new Error(`${where}: built to order status needs condition remanufactured to order`);
    if (!Number.isInteger(u.quantity) || u.quantity < 1) throw new Error(`${where}: quantity must be a positive integer`);
    for (const k of ['wettedParts', 'separationType', 'bowlDiameter', 'capacity', 'configuration']) {
      if (u[k] !== undefined && (typeof u[k] !== 'string' || !u[k].trim())) throw new Error(`${where}: ${k} must be a non-empty string`);
    }
    if (u.cleaningMethod !== undefined && !STOCK_CLEANING.includes(u.cleaningMethod)) throw new Error(`${where}: bad cleaningMethod ${u.cleaningMethod}`);
    for (const k of ['bowlSpeedRpm', 'motorHp', 'motorKw']) {
      if (u[k] !== undefined && !(typeof u[k] === 'number' || (Array.isArray(u[k]) && u[k].length === 2))) throw new Error(`${where}: ${k} must be a number or [min, max]`);
    }
    if (u.modelPage && !/^\/[^\s]*\/$/.test(u.modelPage)) throw new Error(`${where}: modelPage must be a site path ending in /`);
  });
}
