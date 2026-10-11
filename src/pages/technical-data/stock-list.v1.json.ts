import { stockList, STOCK_PAGE_PATH, validateStockList } from '../../data/stockList.mjs';

export const prerender = true;

const SITE = 'https://dolphincentrifuge.com';

export function GET() {
  validateStockList();
  const record = {
    schemaVersion: 'dolphin-stock-list-v1',
    asOf: stockList.asOf,
    page: `${SITE}${STOCK_PAGE_PATH}`,
    note: 'Dated list. Availability changes and is confirmed per quote. Prices by quote. Every unit sold is remanufactured to the published reconditioning standard before shipment.',
    units: stockList.units.map((u) => ({
      family: u.family,
      model: u.model,
      type: u.type,
      condition: u.condition,
      status: u.status,
      quantity: u.quantity,
      modelPage: u.modelPage ? `${SITE}${u.modelPage}` : null,
    })),
  };
  return new Response(JSON.stringify(record, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
