// Owner ruling 2026-10-13: no food or human-consumption claim ever leaves Dolphin.
// Owner ruling 2026-11-16: "Remove all 'Food' 'Beverage' and any other liability openers."
// Agent tools (WebMCP and the /mcp Worker) call this before matching a free-text
// fluid, application or query. A request that names a food, beverage, dairy,
// edible-oil, biotech, fermentation, pharmaceutical or other human-consumption
// duty gets no machine, no capacity and no price: only the verbatim disclaimer. Waste streams (food-industry
// wastewater, used cooking oil, rendering, food waste) are allowed and pass.
// This module has no imports on purpose: it is bundled into the browser WebMCP
// script, which must never carry the spec file's internal notes.

/** Owner ruling 2026-10-13, verbatim. The one home of this sentence; centrifugeSpecs.ts re-exports it. */
export const NO_HUMAN_CONSUMPTION_DISCLAIMER =
  'Dolphin Centrifuge does not represent any centrifuge it supplies as food grade, sanitary, or suitable for food, beverage, pharmaceutical or other human-consumption use.';

const HUMAN_CONSUMPTION = new RegExp(String.raw`\b(?:${[
  'food(?:s|stuffs?)?', 'food[- ]?grade', 'human[- ]consumption', 'edible', 'beverages?', 'drinks?', 'drinking', 'potable',
  'dairy', 'milk', 'whey', 'cream', 'cheese', 'butter', 'yogh?urt',
  'juices?', 'beer', 'wine', 'brew(?:ing|ery|eries)?', 'cider', 'kombucha', 'vinegar', 'coffee', 'tea',
  'vegetable oil', 'cooking oil', 'olive oil', 'palm oil', 'soy(?:bean)? oil', 'canola', 'rapeseed oil', 'sunflower oil',
  'sugar', 'syrup', 'starch', 'gelatine?', 'broth', 'soup', 'sauce', 'surimi', 'seafood',
  'pharma(?:ceuticals?)?', 'drugs?', 'vaccines?', 'nutraceuticals?', 'dietary supplements?',
  'bio-?tech(?:nology|nological)?', 'cell harvest(?:ing)?', 'cell broth', 'ferment(?:ation|ed|ing)?',
  'sanitary', 'hygienic', 'fda', 'usda', '3-a',
].join('|')})\b`, 'i');

// A waste stream from a food or other plant is industrial duty, never human consumption.
const WASTE_STREAM = /\b(?:waste(?:water)?s?|used|spent|uco|wvo|rendering|effluent|sludge|grease trap|tank bottoms?|by-?products?)\b/i;

/** True when the text asks about a food, beverage or other human-consumption duty. */
export function isHumanConsumptionRequest(...texts) {
  const text = texts.filter((t) => typeof t === 'string' && t.trim()).join(' ');
  if (!text) return false;
  return HUMAN_CONSUMPTION.test(text) && !WASTE_STREAM.test(text);
}

/** The one reply every agent tool gives to such a request: no machine, no suitability statement. */
export function humanConsumptionReply(contact) {
  return {
    status: 'no_suitability_statement',
    message: NO_HUMAN_CONSUMPTION_DISCLAIMER,
    ...(contact ? { contact } : {}),
  };
}
