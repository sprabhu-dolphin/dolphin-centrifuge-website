// WebMCP tool for the dated Alfa Laval stock list.
// find_alfa_laval_centrifuges_in_stock is read-only and registered sitewide
// through registerDolphinWebMcpTools (dolphinWebMcp.ts), which supplies JSON-string
// input parsing, schema validation and independent per-tool registration.
type JsonObject = Record<string, any>;
type Context = { signal?: AbortSignal };
type Deps = { fetchJson: (url: string, signal?: AbortSignal) => Promise<JsonObject> };

const STOCK_URL = '/technical-data/stock-list.v1.json';
const STOCK_SCHEMA = 'dolphin-stock-list-v1';
const STOCK_PAGE = 'https://dolphincentrifuge.com/alfa-laval-centrifuges-in-stock/';
const STOCK_JSON = `https://dolphincentrifuge.com${STOCK_URL}`;
const STOCK_STATEMENT = 'Dolphin Centrifuge keeps 150+ Alfa Laval centrifuges in stock in Warren, Michigan; capacities are quoted per application.';
const TYPES = ['disc stack self-cleaning', 'disc stack manual-clean', 'decanter'];
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;
const UNIT_FIELDS = ['model', 'family', 'type', 'condition', 'status', 'quantity', 'wettedParts', 'bowlSpeedRpm', 'motorHp',
  'bowlDiameter', 'separationType', 'cleaningMethod', 'capacity', 'configuration', 'modelPage'];

let stockCache: JsonObject | undefined;

async function getStock(deps: Deps, signal?: AbortSignal): Promise<JsonObject> {
  if (stockCache) return stockCache;
  const stock = await deps.fetchJson(STOCK_URL, signal);
  if (stock.schemaVersion !== STOCK_SCHEMA || !Array.isArray(stock.units)) throw new Error('DOLPHIN_STOCK_LIST_INVALID');
  stockCache = stock;
  return stock;
}

function result(status: string, data: JsonObject | null, warnings: string[]): JsonObject {
  return {
    schemaVersion: STOCK_SCHEMA,
    status,
    data,
    answerability: { canStateAsFact: status === 'ok', qualificationRequired: true, missingInputs: [] },
    warnings,
    sources: status === 'ok' ? [STOCK_JSON, STOCK_PAGE] : [],
  };
}

const compact = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '');

function matcher(query: string | undefined): (unit: JsonObject) => boolean {
  const tokens = String(query ?? '').toLowerCase().split(/\s+/).filter(Boolean);
  if (!tokens.length) return () => true;
  const squashed = compact(tokens.join(''));
  return (unit) => {
    const hay = [unit.model, unit.family, unit.type].filter(Boolean).join(' ').toLowerCase();
    return tokens.every((token) => hay.includes(token)) || (squashed.length > 0 && compact(hay).includes(squashed));
  };
}

async function findInStock(input: JsonObject, context: Context | undefined, deps: Deps): Promise<JsonObject> {
  const signal = context?.signal;
  signal?.throwIfAborted();
  const limit = input.limit ?? DEFAULT_LIMIT;
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
    return result('invalid_input', null, [`limit must be an integer from 1 to ${MAX_LIMIT}.`]);
  }
  let stock: JsonObject;
  try {
    stock = await getStock(deps, signal);
  } catch (error) {
    if (signal?.aborted) throw error;
    return result('unavailable', null, ['The same-origin stock list is temporarily unavailable. Call (248) 522-2573 or see the stock page.']);
  }

  const units: JsonObject[] = stock.units;
  const quantity = (list: JsonObject[]) => list.reduce((sum, unit) => sum + (Number(unit.quantity) || 0), 0);
  const matches = units.filter((unit) => (!input.type || unit.type === input.type) && matcher(input.query)(unit));
  return result('ok', {
    statement: STOCK_STATEMENT,
    asOf: stock.asOf,
    totalListings: units.length,
    totalQuantity: quantity(units),
    matchingListings: matches.length,
    matchingQuantity: quantity(matches),
    returned: Math.min(matches.length, limit),
    units: matches.slice(0, limit).map((unit) => Object.fromEntries(
      UNIT_FIELDS.filter((field) => unit[field] !== undefined && unit[field] !== null).map((field) => [field, unit[field]]))),
    page: STOCK_PAGE,
    record: STOCK_JSON,
  }, [
    'Dated list; availability is confirmed per quote and prices are by quote. Fields absent from a unit are not published.',
    ...(matches.length > limit ? [`Showing ${limit} of ${matches.length} matching listings; narrow the query or raise limit (maximum ${MAX_LIMIT}).`] : []),
  ]);
}

export function stockListWebMcpTools(deps: Deps) {
  return [{
    name: 'find_alfa_laval_centrifuges_in_stock',
    title: 'Find Alfa Laval centrifuges in stock',
    description: 'Search the dated list of complete Alfa Laval disc stack and decanter centrifuges Dolphin Centrifuge has in stock, by model, family or type, such as MAB 104, WHPX or decanter. Returns each matching listing with model, family, type, condition, status, quantity, wetted parts and any published specification or capacity, plus the list date and the stock page and JSON record. Prices are by quote and are never returned.',
    inputSchema: {
      type: 'object', additionalProperties: false, properties: {
        query: { type: 'string', maxLength: 200, description: 'Model, family or type text, case-insensitive, such as "MAB 104", "decanter" or "WHPX". Omit to list the stock.' },
        type: { type: 'string', enum: TYPES, description: 'Exact machine type.' },
        limit: { type: 'integer', minimum: 1, maximum: MAX_LIMIT, description: `Maximum listings to return, 1 to ${MAX_LIMIT}. Defaults to ${DEFAULT_LIMIT}.` },
      },
    },
    annotations: { readOnlyHint: true, untrustedContentHint: false, consequentialHint: false },
    execute: (input: JsonObject, context?: Context) => findInStock(input, context, deps),
  }];
}
