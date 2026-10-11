/**
 * Build-time capacity lookup for page prose. Prose never types a GPM figure: it asks the
 * spec source (centrifugeSpecs.ts) for the capacity of a named fluid and prints it with
 * that fluid and its conditions. Throws at build time if the record or fluid is missing.
 */
import { models, type Capacity, type Numeric } from './centrifugeSpecs';

export type FluidKey = 'turbine' | 'ro' | 'diesel' | 'gas' | 'engine' | 'rated' | 'hfo30' | 'hfo380';

const FLUID: Record<FluidKey, { match: (f: string) => boolean; words: string; conditions: string }> = {
  turbine: { match: (f) => /steam turbine/i.test(f), words: 'steam turbine lube oil', conditions: '60 to 70 °C' },
  ro: { match: (f) => /^R&O/i.test(f), words: 'R&O lube oil', conditions: '80 to 90 °C' },
  diesel: { match: (f) => /^(diesel fuel|marine diesel)$/i.test(f), words: '13 cSt diesel', conditions: '40 °C' },
  gas: { match: (f) => /^gas oil$/i.test(f), words: 'gas oil', conditions: '40 °C' },
  engine: { match: (f) => /^(engine lube oil|R&O \/ engine lube oil)$/i.test(f), words: 'engine lube oil', conditions: '80 to 90 °C' },
  hfo30: { match: (f) => /^Heavy fuel oil, 30 cSt$/i.test(f), words: '30 cSt heavy fuel oil', conditions: '50 °C' },
  hfo380: { match: (f) => /^Heavy fuel oil, 380 cSt$/i.test(f), words: '380 cSt heavy fuel oil', conditions: '50 °C' },
  rated: { match: (f) => /^Rated reference capacity/i.test(f), words: 'rated reference capacity', conditions: 'fluid not specified' },
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
  if (fluid === 'rated') return `${gpm(designation, fluid)} GPM rated reference capacity (fluid not specified)`;
  return `${gpm(designation, fluid)} GPM on ${f.words} at ${f.conditions}`;
}

/** The spec's own published label for a capacity whose fluid contains `fluidPart`, e.g. "110 GPM on Water Sludge Thickening". */
export function specLabel(designation: string, fluidPart: string): string {
  const m = models.find((model) => model.designation === designation);
  if (!m) throw new Error(`specLookup: no spec record for ${designation}`);
  const cap = m.capacities.find((c) => c.fluid.toLowerCase().includes(fluidPart.toLowerCase()) && c.label);
  if (!cap || !cap.label) throw new Error(`specLookup: ${designation} has no labelled capacity for ${fluidPart}`);
  return cap.label;
}

/** "2 GPM" - the spec's own stated (non-derived) US GPM value for a capacity whose fluid contains `fluidPart`. */
export function specGpm(designation: string, fluidPart: string): string {
  const m = models.find((model) => model.designation === designation);
  if (!m) throw new Error(`specLookup: no spec record for ${designation}`);
  const cap = m.capacities.find((c) => c.fluid.toLowerCase().includes(fluidPart.toLowerCase()) && typeof c.value === 'number' && /GPM/i.test(c.unit));
  if (!cap) throw new Error(`specLookup: ${designation} has no GPM-valued capacity for ${fluidPart}`);
  return `${cap.value} GPM`;
}
