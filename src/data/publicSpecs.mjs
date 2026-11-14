/**
 * The PUBLIC view of the spec source.
 *
 * `centrifugeSpecs.ts` carries internal working fields next to the published
 * figures: ruling ids, parked-item notes, rejected candidate values and build
 * guard switches. The build guard (`scripts/spec-consistency-check.mjs`) reads
 * those from the source file. Every public surface (specs.json, the technical
 * data JSON and CSV, the in-page WebMCP tools through centrifuges.v1.json, and
 * the /mcp Worker) reads models from here instead, so an internal field can
 * never reach a customer or an agent by a new path.
 *
 * This file only removes keys. It never changes a published figure.
 */
import { models, retiredDesignations } from './centrifugeSpecs.ts';

/** Model keys that are internal working notes or build-guard switches. */
export const INTERNAL_MODEL_KEYS = Object.freeze(['tbd', 'notes', 'rulings', 'rejectedValues', 'skipPageAssert']);

/** Capacity keys that are internal working notes. `note` is public; `internalNote` is not. */
export const INTERNAL_CAPACITY_KEYS = Object.freeze(['ruling', 'internalNote']);

const omit = (record, keys) => Object.fromEntries(Object.entries(record).filter(([key]) => !keys.includes(key)));

export function publicCapacity(capacity) {
  return omit(capacity, INTERNAL_CAPACITY_KEYS);
}

/** A model record with internal keys removed. Key order is preserved. */
export function publicModel(model) {
  const out = omit(model, INTERNAL_MODEL_KEYS);
  out.capacities = (model.capacities ?? []).map(publicCapacity);
  return out;
}

export const publicModels = Object.freeze(models.map(publicModel));

/** Leading worksheet ids such as "B2: " or "A21/A23: ". */
const WORKSHEET_ID_PREFIX = /^[A-Z]\d+(?:\/[A-Z]?\d+)*:\s*/;

/** Retired designations as public guidance: the code and what to say instead, no worksheet ids or guard regexes. */
export const publicRetiredDesignations = Object.freeze(
  retiredDesignations.map(({ text, reason }) => {
    const plain = reason.replace(WORKSHEET_ID_PREFIX, '');
    return { text, reason: plain.charAt(0).toUpperCase() + plain.slice(1) };
  }),
);
