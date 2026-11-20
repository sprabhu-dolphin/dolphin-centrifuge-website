import {
  BUILT_TO_ORDER_DETAIL, READY_BUILT_STATEMENT, SHEET_DATE_NOTE, stockAvailability, stockCounts, stockCountsSentence,
  stockCoverage, stockList, stockMaker, STOCK_PAGE_PATH, validateStockList,
} from '../../data/stockList.mjs';

export const prerender = true;

const SITE = 'https://dolphincentrifuge.com';

export function GET() {
  validateStockList();
  const record = {
    schemaVersion: 'dolphin-stock-list-v1',
    title: 'Centrifuges in stock at Dolphin Centrifuge',
    asOf: stockList.asOf,
    sheetDate: stockList.asOf,
    sheetDateNote: SHEET_DATE_NOTE,
    coverage: stockCoverage(),
    counts: { ...stockCounts(), summary: stockCountsSentence() },
    availabilityKey: {
      'in stock, ready-built': READY_BUILT_STATEMENT,
      'Remanufactured to order after sale, not a ready-built unit': BUILT_TO_ORDER_DETAIL,
    },
    page: `${SITE}${STOCK_PAGE_PATH}`,
    note: 'Dated list. Availability changes and is confirmed per quote. Prices by quote. Every unit is remanufactured to the published reconditioning standard before shipment and sold with the 12-month mechanical warranty, never as-is. Serial numbers on request to qualified buyers.',
    units: stockList.units.map((u) => ({
      family: u.family,
      maker: stockMaker(u),
      model: u.model,
      type: u.type,
      condition: u.condition,
      status: u.status,
      availability: stockAvailability(u),
      quantity: u.quantity,
      ...(u.bowlSpeedRpm !== undefined ? { bowlSpeedRpm: u.bowlSpeedRpm } : {}),
      ...(u.motorHp !== undefined ? { motorHp: u.motorHp } : {}),
      ...(u.motorKw !== undefined ? { motorKw: u.motorKw } : {}),
      ...(u.alfaLavalSource ? { alfaLavalSource: u.alfaLavalSource } : {}),
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
