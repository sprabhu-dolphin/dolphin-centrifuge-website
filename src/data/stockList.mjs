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
//     configuration: 'Skid-mounted' ... (only what the inventory sheet states),
//     alfaLavalSource: the Alfa Laval document and page behind the row's figures, with every printed alternative }
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
//
// Owner ruling 2026-11-20 ("Use Alfa Laval's"): where Alfa Laval prints the figure, the row
// carries Alfa Laval's printed kW and rpm, and `alfaLavalSource` names the document and page
// plus every other figure Alfa Laval prints for the same field (variant, 50/60 Hz, feed pump).
const SRC = {
  brpx313: 'Motor 22 kW: Alfa Laval S93494E-2 (4267-1), p. 23.',
  btpx205: 'BTPX 205SGD-34CDP, Alfa Laval ref. 556661: bowl speed max. 9,631 rpm at 50 Hz, 9,655 rpm at 60 Hz (p. 152); machine plate max. 7,605 rpm at 50 Hz, 7,540 rpm at 60 Hz (p. 190); motor 6.5 kW (pp. 152, 190).',
  fopx613: 'FOPX 613TFD-20: motor 16 kW, Alfa Laval 1270760-02 V2, p. 174.',
  mab103: 'MAB 103B-24: bowl speed 8,600 rpm at 60 Hz (8,570 rpm at 50 Hz), Alfa Laval 1270118-02 V5, p. 117. Motor 1 HP is the site figure.',
  mab104: 'Bowl speed 7,500 rpm, MAB 104B-20 (Alfa Laval Mineral Oil Separators: solids-retaining types, p. 1); MAB 104B-14/24: 7,500 rpm at 50 Hz, 7,350 rpm at 60 Hz (Alfa Laval ref. 558168 rev. 2, p. 136). Motor 1.12 kW (Alfa Laval S83470E, p. 8); MAB 104B-14/24: 1.1 kW without OEM pump, 1.5 kW with OEM pump (ref. 558168 rev. 2, p. 136).',
  mapx309: 'Motor 8.8 kW (12 HP as printed): Alfa Laval S88847E (4094-14), p. 36.',
  mopx207: 'Bowl speed max. 6,400 rpm at 50 Hz and 60 Hz and motor 7.5 kW: Alfa Laval MR SO 2800E, p. 92; 160-OSM-1E, p. 241.',
  mopx213: 'Motor 15 kW: Alfa Laval MR SO 2800E, p. 98; PX types, p. 1.',
  mopx310: 'MOPX 310TGT-24: bowl speed max. 5,175 rpm at 50 Hz, 5,142 rpm at 60 Hz; motor 11 kW. Alfa Laval 1270376-02 V1, p. 187.',
  whpx405: 'Bowl speed max. 7,605 rpm at 50 Hz and 60 Hz; motor 4 kW with separate feed pump, 5.5 kW with built-on feed pump. Alfa Laval MPCO 31-05-01, p. 66.',
  whpx407: 'Bowl speed max. 5,175 rpm and motor 11 kW: Alfa Laval 170-OSM2-2E, p. 174. Alfa Laval also prints 10 kW for the WHPX 407TGD-20 (PX types, p. 1).',
  whpx510: 'WHPX 510TGD-20: bowl speed 5,180 rpm, motor 11.2 kW. Alfa Laval PX types, p. 1.',
  whpx513: 'WHPX 513TGD-20: motor 15 kW. Alfa Laval MR SO 1763 E 6/8309, p. 62 (also p. 64).',
  wsb104: 'WSB 104B: motor 1.1 kW with separate feed pump, 1.5 kW with built-on feed pump (Alfa Laval SO 11064E, p. 39).',
};

export const stockList = {
  // asOf is the date of the inventory sheet the units come from.
  asOf: INVENTORY_LIST_DATE,
  units: [
    { family: 'AFPX', model: 'AFPX 407', type: 'disc stack self-cleaning', condition: 'remanufactured', status: 'in stock', quantity: 1, wettedParts: 'stainless steel (all metallic parts in contact with the process liquid); bowl body, hood and lock ring high grade stainless steel', cleaningMethod: 'self-cleaning' },
    { family: 'ALDEC', model: 'ALDEC G2-40', type: 'decanter', condition: 'new old stock, unused', status: 'in stock', quantity: 1, modelPage: '/alfa-laval-g2-40-decanter/', bowlSpeedRpm: 4000, motorHp: 20, wettedParts: 'AISI 316 (bowl and other product and liquid wetted parts)' },
    { family: 'BDB', model: 'BDB 104', type: 'disc stack manual-clean', condition: 'new old stock, unused', status: 'in stock', quantity: 1, wettedParts: 'bowl body and hood EN 1.4462 / UNS S31803; distributor, top disc and discs EN 1.4401 / ASTM 316; lock ring EN 10025 / AISI 1035', cleaningMethod: 'manual-clean' },
    { family: 'BRPX', model: 'BRPX 213', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'built to order', quantity: 2, cleaningMethod: 'self-cleaning' },
    { family: 'BRPX', model: 'BRPX 213', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'built to order', quantity: 1, cleaningMethod: 'self-cleaning', configuration: 'Skid-mounted' },
    { family: 'BRPX', model: 'BRPX 313', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'built to order', quantity: 2, motorKw: 22, alfaLavalSource: SRC.brpx313, wettedParts: 'stainless steel (bowl body and hood, other bowl parts including inlet and outlets, lock ring)', cleaningMethod: 'self-cleaning' },
    { family: 'BRPX', model: 'BRPX 417', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'built to order', quantity: 1, cleaningMethod: 'self-cleaning' },
    { family: 'BTPX', model: 'BTPX 205', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'built to order', quantity: 2, modelPage: '/alfa-laval-btpx-205-disc-centrifuge/', bowlSpeedRpm: 9631, motorKw: 6.5, alfaLavalSource: SRC.btpx205, wettedParts: 'high-grade stainless steel (all liquid-wetted parts)', cleaningMethod: 'self-cleaning', configuration: 'Skid-mounted' },
    { family: 'CHNX', model: 'CHNX 418', type: 'decanter', condition: 'new old stock, unused', status: 'in stock', quantity: 1, modelPage: '/alfa-laval-chnx-418-decanter/', bowlSpeedRpm: 4000, motorHp: 20, bowlDiameter: '418 mm', wettedParts: 'AISI 316 (bowl and other parts in contact with process)' },
    { family: 'FOPX', model: 'FOPX 610', type: 'disc stack self-cleaning', condition: 'remanufactured', status: 'in stock', quantity: 1, wettedParts: 'brass, bronze and stainless steel (materials in contact with process fluid, excluding seals and O-rings); cast iron frame', cleaningMethod: 'self-cleaning' },
    { family: 'FOPX', model: 'FOPX 613', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'built to order', quantity: 1, motorKw: 16, alfaLavalSource: SRC.fopx613, wettedParts: 'brass, bronze and stainless steel (materials in contact with process fluid, excluding seals and O-rings); cast iron frame', cleaningMethod: 'self-cleaning' },
    { family: 'LAPX', model: 'LAPX 202', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'built to order', quantity: 1, cleaningMethod: 'self-cleaning' },
    { family: 'MAB', model: 'MAB 103', type: 'disc stack manual-clean', condition: 'remanufactured', status: 'in stock', quantity: 2, modelPage: '/alfa-laval-mab-103-centrifuge/', bowlSpeedRpm: 8600, motorHp: 1, alfaLavalSource: SRC.mab103, wettedParts: 'stainless steel bowl body and hood, disc stack and gravity discs; tinned bronze distributor and top disc', cleaningMethod: 'manual-clean' },
    { family: 'MAB', model: 'MAB 104', type: 'disc stack manual-clean', condition: 'remanufactured', status: 'in stock', quantity: 1, modelPage: '/alfa-laval-mab-104-centrifuge/', bowlSpeedRpm: 7500, motorKw: 1.12, alfaLavalSource: SRC.mab104, wettedParts: 'stainless steel bowl body and hood, disc stack and gravity discs; tinned bronze distributor and top disc', cleaningMethod: 'manual-clean', capacity: '6.6 US GPM converted from 1,500 L/h, 13 cSt diesel at 40 °C' },
    { family: 'MAB', model: 'MAB 104', type: 'disc stack manual-clean', condition: 'remanufactured', status: 'in stock', quantity: 1, modelPage: '/alfa-laval-mab-104-centrifuge/', bowlSpeedRpm: 7500, motorKw: 1.12, alfaLavalSource: SRC.mab104, wettedParts: 'stainless steel bowl body and hood, disc stack and gravity discs; tinned bronze distributor and top disc', cleaningMethod: 'manual-clean', capacity: '6.6 US GPM converted from 1,500 L/h, 13 cSt diesel at 40 °C', configuration: 'Skid-mounted' },
    { family: 'MAB', model: 'MAB 204', type: 'disc stack manual-clean', condition: 'remanufactured to order', status: 'built to order', quantity: 2, motorHp: 4, cleaningMethod: 'manual-clean' },
    { family: 'MAB', model: 'MAB 205', type: 'disc stack manual-clean', condition: 'remanufactured', status: 'in stock', quantity: 1, motorHp: 5, cleaningMethod: 'manual-clean' },
    { family: 'MAB', model: 'MAB 205', type: 'disc stack manual-clean', condition: 'remanufactured to order', status: 'built to order', quantity: 5, motorHp: 5, cleaningMethod: 'manual-clean' },
    { family: 'MAB', model: 'MAB 206', type: 'disc stack manual-clean', condition: 'remanufactured', status: 'in stock', quantity: 1, motorHp: 7.5, wettedParts: 'stainless steel bowl body and hood, disc stack and gravity disc; other bowl parts tinned steel, bronze, brass', cleaningMethod: 'manual-clean' },
    { family: 'MAB', model: 'MAB 206', type: 'disc stack manual-clean', condition: 'remanufactured to order', status: 'built to order', quantity: 1, motorHp: 7.5, wettedParts: 'stainless steel bowl body and hood, disc stack and gravity disc; other bowl parts tinned steel, bronze, brass', cleaningMethod: 'manual-clean' },
    { family: 'MAB', model: 'MAB 207', type: 'disc stack manual-clean', condition: 'remanufactured', status: 'in stock', quantity: 1, motorHp: 10, cleaningMethod: 'manual-clean' },
    { family: 'MAB', model: 'MAB 207', type: 'disc stack manual-clean', condition: 'remanufactured to order', status: 'built to order', quantity: 1, motorHp: 10, cleaningMethod: 'manual-clean' },
    { family: 'MAB', model: 'MAB 209', type: 'disc stack manual-clean', condition: 'remanufactured to order', status: 'built to order', quantity: 1, motorHp: 15, cleaningMethod: 'manual-clean' },
    { family: 'MAPX', model: 'MAPX 204', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'built to order', quantity: 1, wettedParts: 'stainless steel bowl body and hood, sliding bowl bottom, disc stack, top disc, gravity discs and operating slide; other bowl parts Ni-alloy, tinned steel, bronze, brass', cleaningMethod: 'self-cleaning' },
    { family: 'MAPX', model: 'MAPX 207', type: 'disc stack self-cleaning', condition: 'new old stock, unused', status: 'in stock', quantity: 1, motorHp: 7.5, wettedParts: 'high-grade stainless steel (all liquid-wetted parts in the bowl except the top disc, which is red metal)', cleaningMethod: 'self-cleaning' },
    { family: 'MAPX', model: 'MAPX 207', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'built to order', quantity: 3, motorHp: 7.5, wettedParts: 'high-grade stainless steel (all liquid-wetted parts in the bowl except the top disc, which is red metal)', cleaningMethod: 'self-cleaning' },
    { family: 'MAPX', model: 'MAPX 209', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'built to order', quantity: 1, cleaningMethod: 'self-cleaning', configuration: 'Skid-mounted' },
    { family: 'MAPX', model: 'MAPX 210', type: 'disc stack self-cleaning', condition: 'remanufactured', status: 'in stock', quantity: 1, cleaningMethod: 'self-cleaning' },
    { family: 'MAPX', model: 'MAPX 309', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'built to order', quantity: 2, motorKw: 8.8, alfaLavalSource: SRC.mapx309, cleaningMethod: 'self-cleaning' },
    { family: 'MOPX', model: 'MOPX 207', type: 'disc stack self-cleaning', condition: 'remanufactured', status: 'in stock', quantity: 2, modelPage: '/alfa-laval-mopx-207-centrifuge/', bowlSpeedRpm: 6400, motorKw: 7.5, alfaLavalSource: SRC.mopx207, wettedParts: 'brass, bronze and stainless steel (materials in contact with process fluid, excluding seals and O-rings); cast iron frame', separationType: 'Three-phase (oil / water / solids)', cleaningMethod: 'self-cleaning', capacity: '22.0 US GPM converted from 5,000 L/h, 13 cSt diesel at 40 °C' },
    { family: 'MOPX', model: 'MOPX 207', type: 'disc stack self-cleaning', condition: 'remanufactured', status: 'in stock', quantity: 1, modelPage: '/alfa-laval-mopx-207-centrifuge/', bowlSpeedRpm: 6400, motorKw: 7.5, alfaLavalSource: SRC.mopx207, wettedParts: 'brass, bronze and stainless steel (materials in contact with process fluid, excluding seals and O-rings); cast iron frame', separationType: 'Three-phase (oil / water / solids)', cleaningMethod: 'self-cleaning', capacity: '22.0 US GPM converted from 5,000 L/h, 13 cSt diesel at 40 °C', configuration: 'Skid-mounted' },
    { family: 'MOPX', model: 'MOPX 207', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'built to order', quantity: 1, modelPage: '/alfa-laval-mopx-207-centrifuge/', bowlSpeedRpm: 6400, motorKw: 7.5, alfaLavalSource: SRC.mopx207, wettedParts: 'brass, bronze and stainless steel (materials in contact with process fluid, excluding seals and O-rings); cast iron frame', separationType: 'Three-phase (oil / water / solids)', cleaningMethod: 'self-cleaning', capacity: '22.0 US GPM converted from 5,000 L/h, 13 cSt diesel at 40 °C', configuration: 'Skid-mounted' },
    { family: 'MOPX', model: 'MOPX 210', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'built to order', quantity: 4, wettedParts: 'stainless steel bowl body and hood, sliding bowl bottom, disc stack, gravity discs and operating slide; other bowl parts bronze and brass', cleaningMethod: 'self-cleaning', capacity: '41.4 US GPM converted from 9,400 L/h, 13 cSt diesel at 40 °C' },
    { family: 'MOPX', model: 'MOPX 213', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'built to order', quantity: 4, motorKw: 15, alfaLavalSource: SRC.mopx213, wettedParts: 'brass, bronze and stainless steel (materials in contact with process fluid, excluding seals and O-rings); cast iron frame', cleaningMethod: 'self-cleaning', capacity: '63.4 US GPM converted from 14,400 L/h, 13 cSt diesel at 40 °C' },
    { family: 'MOPX', model: 'MOPX 310', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'built to order', quantity: 1, bowlSpeedRpm: 5175, motorKw: 11, alfaLavalSource: SRC.mopx310, wettedParts: 'brass, bronze and stainless steel (materials in contact with process fluid, excluding seals and O-rings); cast iron frame', separationType: 'Three-phase (oil / water / solids)', cleaningMethod: 'self-cleaning' },
    { family: 'MOPX', model: 'MOPX 313', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'built to order', quantity: 1, cleaningMethod: 'self-cleaning' },
    { family: 'MOPX', model: 'MOPX 410', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'built to order', quantity: 1, cleaningMethod: 'self-cleaning' },
    { family: 'MOPX', model: 'MOPX 513', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'built to order', quantity: 1, cleaningMethod: 'self-cleaning' },
    { family: 'NX', model: 'NX 314', type: 'decanter', condition: 'remanufactured', status: 'in stock', quantity: 1, modelPage: '/alfa-laval-nx-314-decanter-centrifuge/', bowlSpeedRpm: 4000, motorHp: 10 },
    { family: 'NX', model: 'NX 418', type: 'decanter', condition: 'new old stock, unused', status: 'in stock', quantity: 1, modelPage: '/alfa-laval-nx-418-decanter-centrifuge/', bowlSpeedRpm: 4000, motorHp: 20, bowlDiameter: '418 mm', wettedParts: 'AISI 316 stainless steel (bowl, conveyor, casing, inlet tube, outlets and other parts in contact with the process media)' },
    { family: 'NX', model: 'NX 418', type: 'decanter', condition: 'remanufactured', status: 'in stock', quantity: 2, modelPage: '/alfa-laval-nx-418-decanter-centrifuge/', bowlSpeedRpm: 4000, motorHp: 20, bowlDiameter: '418 mm', wettedParts: 'AISI 316 stainless steel (bowl, conveyor, casing, inlet tube, outlets and other parts in contact with the process media)' },
    { family: 'Sharples', model: 'Sharples P-3000', type: 'decanter', condition: 'remanufactured to order', status: 'built to order', quantity: 2, modelPage: '/sharples-p-3000-decanter/', bowlSpeedRpm: 4000, motorHp: 15 },
    { family: 'Sharples', model: 'Sharples P-3400', type: 'decanter', condition: 'remanufactured', status: 'in stock', quantity: 1, modelPage: '/sharples-p-3400-decanter/', bowlSpeedRpm: 4000, motorHp: 25 },
    { family: 'Sharples', model: 'Sharples P-5000', type: 'decanter', condition: 'remanufactured to order', status: 'built to order', quantity: 1 },
    { family: 'Sharples', model: 'Sharples P-660', type: 'decanter', condition: 'remanufactured', status: 'in stock', quantity: 1, bowlSpeedRpm: 6000, motorHp: 5 },
    { family: 'UVNX', model: 'UVNX 309', type: 'decanter', condition: 'remanufactured', status: 'in stock', quantity: 1 },
    { family: 'UVNX', model: 'UVNX 414', type: 'decanter', condition: 'remanufactured', status: 'in stock', quantity: 1 },
    { family: 'VNPX', model: 'VNPX 207', type: 'disc stack self-cleaning', condition: 'remanufactured', status: 'in stock', quantity: 1, cleaningMethod: 'self-cleaning' },
    { family: 'VNPX', model: 'VNPX 407', type: 'disc stack self-cleaning', condition: 'remanufactured', status: 'in stock', quantity: 1, cleaningMethod: 'self-cleaning' },
    { family: 'VNPX', model: 'VNPX 407', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'built to order', quantity: 1, cleaningMethod: 'self-cleaning', configuration: 'Skid-mounted' },
    { family: 'VNPX', model: 'VNPX 410', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'built to order', quantity: 1, cleaningMethod: 'self-cleaning', configuration: 'Skid-mounted' },
    { family: 'WHPX', model: 'WHPX 405', type: 'disc stack self-cleaning', condition: 'remanufactured', status: 'in stock', quantity: 1, modelPage: '/alfa-laval-whpx-405/', bowlSpeedRpm: 7605, motorKw: 4, alfaLavalSource: SRC.whpx405, wettedParts: 'stainless steel bowl body and hood, sliding bowl bottom, disc stack, gravity discs and operating slide; other bowl parts Ni-alloy, tinned steel, bronze, brass', separationType: 'Three-phase (oil / water / solids)', cleaningMethod: 'self-cleaning', capacity: '13.6 US GPM converted from 3,100 L/h, 13 cSt diesel at 40 °C' },
    { family: 'WHPX', model: 'WHPX 405', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'built to order', quantity: 1, modelPage: '/alfa-laval-whpx-405/', bowlSpeedRpm: 7605, motorKw: 4, alfaLavalSource: SRC.whpx405, wettedParts: 'stainless steel bowl body and hood, sliding bowl bottom, disc stack, gravity discs and operating slide; other bowl parts Ni-alloy, tinned steel, bronze, brass', separationType: 'Three-phase (oil / water / solids)', cleaningMethod: 'self-cleaning', capacity: '13.6 US GPM converted from 3,100 L/h, 13 cSt diesel at 40 °C' },
    { family: 'WHPX', model: 'WHPX 407', type: 'disc stack self-cleaning', condition: 'remanufactured', status: 'in stock', quantity: 2, bowlSpeedRpm: 5175, motorKw: 11, alfaLavalSource: SRC.whpx407, wettedParts: 'stainless steel bowl body and hood, sliding bowl bottom, disc stack, gravity discs and operating slide; other bowl parts Ni-alloy, tinned steel, bronze, brass', cleaningMethod: 'self-cleaning', capacity: '26.4 US GPM converted from 6,000 L/h, 13 cSt diesel at 40 °C' },
    { family: 'WHPX', model: 'WHPX 410', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'built to order', quantity: 3, wettedParts: 'high-grade stainless steel (all liquid-wetted parts in the bowl except the top disc, which is red metal)', cleaningMethod: 'self-cleaning' },
    { family: 'WHPX', model: 'WHPX 510', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'built to order', quantity: 4, modelPage: '/alfa-laval-whpx-510-centrifuge/', bowlSpeedRpm: 5180, motorKw: 11.2, alfaLavalSource: SRC.whpx510, wettedParts: 'stainless steel bowl body and hood, sliding bowl bottom, disc stack, gravity discs and operating slide; other bowl parts Ni-alloy, tinned steel, bronze, brass', separationType: 'Three-phase (oil / water / solids)', cleaningMethod: 'self-cleaning', capacity: '47.1 US GPM converted from 10,700 L/h, 13 cSt diesel at 40 °C' },
    { family: 'WHPX', model: 'WHPX 510', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'built to order', quantity: 1, modelPage: '/alfa-laval-whpx-510-centrifuge/', bowlSpeedRpm: 5180, motorKw: 11.2, alfaLavalSource: SRC.whpx510, wettedParts: 'stainless steel bowl body and hood, sliding bowl bottom, disc stack, gravity discs and operating slide; other bowl parts Ni-alloy, tinned steel, bronze, brass', separationType: 'Three-phase (oil / water / solids)', cleaningMethod: 'self-cleaning', capacity: '47.1 US GPM converted from 10,700 L/h, 13 cSt diesel at 40 °C', configuration: 'Skid-mounted' },
    { family: 'WHPX', model: 'WHPX 513', type: 'disc stack self-cleaning', condition: 'remanufactured', status: 'in stock', quantity: 1, modelPage: '/alfa-laval-whpx-513/', motorKw: 15, alfaLavalSource: SRC.whpx513, wettedParts: 'stainless steel bowl body and hood, sliding bowl bottom, disc stack, gravity discs and operating slide; other bowl parts Ni-alloy, tinned steel, bronze, brass', cleaningMethod: 'self-cleaning', capacity: '72.2 US GPM converted from 16,400 L/h, 13 cSt diesel at 40 °C' },
    { family: 'WHPX', model: 'WHPX 513', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'built to order', quantity: 11, modelPage: '/alfa-laval-whpx-513/', motorKw: 15, alfaLavalSource: SRC.whpx513, wettedParts: 'stainless steel bowl body and hood, sliding bowl bottom, disc stack, gravity discs and operating slide; other bowl parts Ni-alloy, tinned steel, bronze, brass', cleaningMethod: 'self-cleaning', capacity: '72.2 US GPM converted from 16,400 L/h, 13 cSt diesel at 40 °C' },
    { family: 'WSB', model: 'WSB 103', type: 'disc stack manual-clean', condition: 'remanufactured to order', status: 'built to order', quantity: 1, cleaningMethod: 'manual-clean' },
    { family: 'WSB', model: 'WSB 104', type: 'disc stack manual-clean', condition: 'remanufactured to order', status: 'built to order', quantity: 1, motorKw: 1.1, alfaLavalSource: SRC.wsb104, wettedParts: 'high-grade stainless steel (all liquid wetted parts)', cleaningMethod: 'manual-clean' },
    { family: 'WSPX', model: 'WSPX 207', type: 'disc stack self-cleaning', condition: 'remanufactured to order', status: 'built to order', quantity: 1, modelPage: '/alfa-laval-wspx-207-self-cleaning-coolant-centrifuge/', bowlSpeedRpm: 6300, motorHp: 7.5, wettedParts: 'stainless steel (all internal liquid wetted parts)', separationType: '3-Phase (Liquid-Liquid-Solid)', cleaningMethod: 'self-cleaning', configuration: 'Skid-mounted' },
    { family: 'WSPX', model: 'WSPX 504', type: 'disc stack self-cleaning', condition: 'remanufactured', status: 'in stock', quantity: 1, cleaningMethod: 'self-cleaning' },
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
    for (const k of ['wettedParts', 'separationType', 'bowlDiameter', 'capacity', 'configuration', 'alfaLavalSource']) {
      if (u[k] !== undefined && (typeof u[k] !== 'string' || !u[k].trim())) throw new Error(`${where}: ${k} must be a non-empty string`);
    }
    if (u.cleaningMethod !== undefined && !STOCK_CLEANING.includes(u.cleaningMethod)) throw new Error(`${where}: bad cleaningMethod ${u.cleaningMethod}`);
    for (const k of ['bowlSpeedRpm', 'motorHp', 'motorKw']) {
      if (u[k] !== undefined && !(typeof u[k] === 'number' || (Array.isArray(u[k]) && u[k].length === 2))) throw new Error(`${where}: ${k} must be a number or [min, max]`);
    }
    if (u.modelPage && !/^\/[^\s]*\/$/.test(u.modelPage)) throw new Error(`${where}: modelPage must be a site path ending in /`);
  });
}
