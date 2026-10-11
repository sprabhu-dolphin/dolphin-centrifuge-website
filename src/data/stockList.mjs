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
//     condition: 'remanufactured' | 'awaiting remanufacture',
//     status: 'in stock' | 'reserved',
//     quantity: 1, modelPage: '/alfa-laval-mopx-207-centrifuge/' }
//
// To publish: set asOf to the list date (YYYY-MM-DD) and add units. Nothing
// else changes. While `units` is empty the page is noindex and left out of the
// sitemap (see config/noindex-registry.mjs); the first unit turns both off.

export const STOCK_PAGE_PATH = '/alfa-laval-centrifuges-in-stock/';
export const STOCK_JSON_PATH = '/technical-data/stock-list.v1.json';

export const stockList = {
  asOf: null,
  units: [],
};

export const STOCK_TYPES = ['disc stack self-cleaning', 'disc stack manual-clean', 'decanter'];
export const STOCK_CONDITIONS = ['remanufactured', 'awaiting remanufacture'];
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
    if (u.modelPage && !/^\/[^\s]*\/$/.test(u.modelPage)) throw new Error(`${where}: modelPage must be a site path ending in /`);
  });
}
