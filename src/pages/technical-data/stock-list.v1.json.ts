import { stockList, STOCK_PAGE_PATH, validateStockList } from '../../data/stockList.mjs';

export const prerender = true;

const SITE = 'https://dolphincentrifuge.com';

export function GET() {
  validateStockList();
  const record = {
    schemaVersion: 'dolphin-stock-list-v1',
    asOf: stockList.asOf,
    page: `${SITE}${STOCK_PAGE_PATH}`,
    note: 'Dated list. Availability changes and is confirmed per quote. Prices by quote. Every unit is remanufactured to the published reconditioning standard before shipment and sold with the 12-month mechanical warranty, never as-is. Serial numbers on request to qualified buyers.',
    units: stockList.units.map((u) => ({
      family: u.family,
      model: u.model,
      type: u.type,
      condition: u.condition,
      status: u.status,
      quantity: u.quantity,
      ...(u.bowlSpeedRpm !== undefined ? { bowlSpeedRpm: u.bowlSpeedRpm } : {}),
      ...(u.motorHp !== undefined ? { motorHp: u.motorHp } : {}),
      ...(u.bowlDiameter ? { bowlDiameter: u.bowlDiameter } : {}),
      ...(u.wettedParts ? { wettedParts: u.wettedParts } : {}),
      ...(u.separationType ? { separationType: u.separationType } : {}),
      ...(u.cleaningMethod ? { cleaningMethod: u.cleaningMethod } : {}),
      ...(u.capacity ? { capacity: u.capacity } : {}),
      ...(u.configuration ? { configuration: u.configuration } : {}),
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
