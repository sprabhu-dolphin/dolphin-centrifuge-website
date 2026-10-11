/**
 * Build-time capacity lookup for page prose. Prose never types a GPM figure: it asks the
 * spec source (centrifugeSpecs.ts) for the capacity of a named fluid and prints it with
 * that fluid and its conditions. Throws at build time if the record or fluid is missing.
 */
import { models, type Capacity, type Numeric } from './centrifugeSpecs';

export type FluidKey = 'turbine' | 'ro' | 'diesel';

const FLUID: Record<FluidKey, { match: (f: string) => boolean; words: string; conditions: string }> = {
  turbine: { match: (f) => /steam turbine/i.test(f), words: 'steam turbine lube oil', conditions: '60 to 70 °C' },
  ro: { match: (f) => /^R&O/i.test(f), words: 'R&O lube oil', conditions: '80 to 90 °C' },
  diesel: { match: (f) => /^diesel fuel$/i.test(f), words: '13 cSt diesel', conditions: '40 °C' },
};

function find(designation: string, fluid: FluidKey): Capacity {
  const m = models.find((model) => model.designation === designation);
  if (!m) throw new Error(`specLookup: no spec record for ${designation}`);
  const cap = m.capacities.find((c) => FLUID[fluid].match(c.fluid) && c.derivedGpm !== undefined);
  if (!cap) throw new Error(`specLookup: ${designation} has no ${fluid} capacity in centrifugeSpecs.ts`);
  return cap;
}

const one = (n: number) => n.toFixed(1);
const gpmText = (g: Numeric) => (Array.isArray(g) ? `${one(g[0])} to ${one(g[1])}` : one(g as number));

/** "3.5" or "8.8 to 10.1" - the spec's derived US GPM for that fluid. */
export function gpm(designation: string, fluid: FluidKey): string {
  return gpmText(find(designation, fluid).derivedGpm as Numeric);
}

/** "3.5 GPM on steam turbine lube oil at 60 to 70 °C" */
export function gpmOn(designation: string, fluid: FluidKey): string {
  const f = FLUID[fluid];
  return `${gpm(designation, fluid)} GPM on ${f.words} at ${f.conditions}`;
}
