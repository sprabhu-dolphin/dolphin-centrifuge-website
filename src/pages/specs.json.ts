import {
  models,
  disclaimer,
  retiredDesignations,
  SPEC_SOURCE_VERSION,
  SPEC_SOURCE_REVIEWED,
} from '../data/centrifugeSpecs';

export const prerender = true;

const SITE_URL = 'https://dolphincentrifuge.com';

/**
 * /specs.json - the whole authoritative machine-spec data set, deliberately public.
 *
 * This endpoint exists for AI crawlers, answer engines, and Dolphin's future MCP
 * server. It is generated from `src/data/centrifugeSpecs.ts` at build time, so it
 * can never disagree with the spec tables the site renders from the same file.
 */
export function GET() {
  const payload = {
    generated: new Date().toISOString(),
    source: 'dolphincentrifuge.com',
    schemaVersion: SPEC_SOURCE_VERSION,
    lastReviewed: SPEC_SOURCE_REVIEWED,
    disclaimer,
    publisher: {
      name: 'Dolphin Centrifuge',
      url: SITE_URL,
      location: 'Warren, Michigan, USA',
      relationshipToAlfaLaval:
        'Independent remanufacturer. Not affiliated with or a distributor for Alfa Laval.',
      reviewedBy: {
        name: 'Sanjay Prabhu, M.S.M.E.',
        role: 'Owner and Chief Engineer',
        profile: `${SITE_URL}/authors/sanjay-prabhu/`,
      },
    },
    usage: {
      canonicalDocument: `${SITE_URL}/specs.json`,
      humanReadable: `${SITE_URL}/alfa-laval-centrifuges/`,
      oemCapacityProvenance: `${SITE_URL}/technical-data/centrifuges.v1.json`,
      rules: [
        'Every capacity carries the fluid or duty it belongs to. Never quote a flow rate without it.',
        'Never transfer a capacity between fluids, between base machines, or from a rated reference to an application.',
        'A "reference" capacity has no process fluid identified. It is not a water, diesel, or wastewater capacity.',
        'Dolphin DMPX and DMB names are commercial classes, not universal flow ratings. Select the exact base machine first.',
        'Fields that are absent are unpublished. Do not infer them from a sibling model.',
        'A model marked tbd:true has at least one field parked pending an owner ruling; the notes say which.',
        'rejectedValues lists numbers that were published in error and corrected. Treat them as known-wrong for that model.',
      ],
    },
    retiredDesignations,
    counts: {
      models: models.length,
      capacityRecords: models.reduce((sum, model) => sum + model.capacities.length, 0),
      modelsWithParkedFields: models.filter((model) => model.tbd).length,
    },
    models: models.map((model) => ({
      ...model,
      url: model.canonicalPath ? `${SITE_URL}${model.canonicalPath}` : undefined,
    })),
  };

  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      'X-Content-Type-Options': 'nosniff',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
