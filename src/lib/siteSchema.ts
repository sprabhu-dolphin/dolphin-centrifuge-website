/**
 * Sitewide entity schema for Dolphin Centrifuge.
 *
 * One Organization node and one Person node, both with stable @id values, so
 * search engines and AI crawlers resolve every page to the same two entities:
 *   1. Dolphin Centrifuge, the independent specialist in Alfa Laval centrifuges.
 *   2. Sanjay Prabhu, MSME, the engineer behind the company.
 *
 * Rendered once per page by BaseLayout. If a page already ships its own
 * top-level Organization node, BaseLayout extends that node instead of adding
 * a second one.
 */

export const SITE_URL = 'https://dolphincentrifuge.com';
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const PERSON_ID = `${SITE_URL}/about-dolphin-centrifuge/#sanjay-prabhu`;

/** Canonical positioning line (docs/DAYLIGHT_PLAN.md, "The message"). */
export const ORG_POSITIONING =
  'Dolphin Centrifuge is the independent specialist in Alfa Laval centrifuges: remanufactured machines, turnkey systems, parts, and service, built on 40+ years of Alfa Laval experience.';

/** Independence statement. Dolphin is never described as authorized or affiliated. */
export const ORG_NON_AFFILIATION =
  'Dolphin Centrifuge is an independent remanufacturer and supplier of Alfa Laval centrifuges. It is not affiliated with, authorized by, or a distributor for Alfa Laval.';

/**
 * Social profiles carried over from the previous WordPress site's footer links
 * (found in the repo's WordPress export). Nothing here is invented.
 */
export const ORG_SAME_AS = [
  'https://www.facebook.com/dolphincentrifuge',
  'https://www.linkedin.com/company/dolphin-marine-&-industrial-centrifuges',
  'https://www.youtube.com/DolphinCentrifuge',
  'https://twitter.com/DCentrifuge',
  'https://www.instagram.com/dolphin_centrifuge',
];

export const ORG_KNOWS_ABOUT = [
  'Alfa Laval centrifuges',
  'disc stack centrifuges',
  'decanter centrifuges',
  'centrifuge remanufacturing',
  'industrial oil purification',
];

/**
 * Canonical Person node for Sanjay Prabhu.
 * Credential facts match /about-dolphin-centrifuge/.
 */
export const sanjayPrabhuPersonJsonLd = {
  '@type': 'Person',
  '@id': PERSON_ID,
  name: 'Sanjay Prabhu',
  honorificSuffix: 'MSME',
  jobTitle: 'Owner and Chief Engineer',
  description:
    'Mechanical engineer (MSME, University of Arkansas) who leads Dolphin Centrifuge, covering centrifuge application engineering, Alfa Laval remanufacturing, and turnkey system design.',
  url: `${SITE_URL}/about-dolphin-centrifuge/`,
  worksFor: { '@id': ORGANIZATION_ID },
  knowsAbout: [
    'Alfa Laval centrifuges',
    'Disc stack centrifuges',
    'Decanter centrifuges',
    'Centrifuge remanufacturing',
    'Industrial fluid separation',
  ],
  alumniOf: {
    '@type': 'CollegeOrUniversity',
    name: 'University of Arkansas',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Fayetteville',
      addressRegion: 'AR',
      addressCountry: 'US',
    },
  },
  hasCredential: {
    '@type': 'EducationalOccupationalCredential',
    name: 'Master of Science in Mechanical Engineering',
    credentialCategory: "Master's degree",
    description:
      'Master of Science in Mechanical Engineering, University of Arkansas, Fayetteville, Class of 1990',
  },
};

/** Canonical sitewide Organization node. */
export const dolphinOrganizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': ORGANIZATION_ID,
  name: 'Dolphin Centrifuge',
  url: SITE_URL,
  logo: `${SITE_URL}/images/homepage/dolphin-centrifuge-logo.png`,
  image: `${SITE_URL}/images/homepage/dolphin-centrifuge-logo.png`,
  description: ORG_POSITIONING,
  disambiguatingDescription: ORG_NON_AFFILIATION,
  foundingDate: '1982',
  telephone: '+1-248-522-2573',
  email: 'sales@dolphincentrifuge.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '24248 Gibson Dr',
    addressLocality: 'Warren',
    addressRegion: 'MI',
    postalCode: '48089',
    addressCountry: 'US',
  },
  areaServed: 'Worldwide',
  knowsAbout: ORG_KNOWS_ABOUT,
  employee: sanjayPrabhuPersonJsonLd,
  sameAs: ORG_SAME_AS,
};

/* ── small shared schema helpers ─────────────────────────────────────────── */

export const schemaTypes = (schema: any): string[] => {
  const type = schema?.['@type'];
  return (Array.isArray(type) ? type : [type]).filter(Boolean).map(String);
};

export const hasSchemaValue = (value: any): boolean => {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.some(hasSchemaValue);
  return true;
};

const isPlainObject = (value: any): boolean =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

/**
 * Extends a page's own Organization node with the sitewide values it is
 * missing. Existing page values always win; knowsAbout is unioned so the
 * Alfa Laval entries are present everywhere.
 */
export const mergeOrganizationSchema = (existing: Record<string, any>) => {
  const merged: Record<string, any> = { ...existing };
  for (const [key, value] of Object.entries(dolphinOrganizationJsonLd)) {
    if (key === 'knowsAbout') continue;
    if (!hasSchemaValue(merged[key])) merged[key] = value;
  }
  const current = Array.isArray(merged.knowsAbout)
    ? merged.knowsAbout
    : hasSchemaValue(merged.knowsAbout)
      ? [merged.knowsAbout]
      : [];
  const seen = new Set(current.map((entry: any) => String(entry).toLowerCase()));
  merged.knowsAbout = [
    ...current,
    ...ORG_KNOWS_ABOUT.filter((entry) => !seen.has(entry.toLowerCase())),
  ];
  return merged;
};

/** True when a schema value refers to Dolphin Centrifuge itself. */
export const isDolphinOrganizationNode = (value: any): boolean => {
  if (!hasSchemaValue(value)) return false;
  if (typeof value === 'string') return DOLPHIN_ORG_NAMES.has(value.trim().toLowerCase());
  if (Array.isArray(value)) return value.every(isDolphinOrganizationNode);
  if (isPlainObject(value)) {
    if (String(value['@id'] || '') === ORGANIZATION_ID) return true;
    return DOLPHIN_ORG_NAMES.has(String(value.name || '').trim().toLowerCase());
  }
  return false;
};

const SANJAY_PATTERN = /^sanjay\s+prabhu\b/i;
const DOLPHIN_ORG_NAMES = new Set(['dolphin centrifuge', 'dolphin centrifuge llc']);
/** Keys where a nested "Dolphin Centrifuge" Organization safely means the company itself. */
const ORG_REFERENCE_KEYS = new Set(['publisher', 'worksFor', 'seller', 'provider']);

const normalizePersonNode = (node: Record<string, any>) => {
  node.name = 'Sanjay Prabhu';
  node.honorificSuffix = 'MSME';
  if (!hasSchemaValue(node['@id'])) node['@id'] = PERSON_ID;
  if (!hasSchemaValue(node.jobTitle)) node.jobTitle = sanjayPrabhuPersonJsonLd.jobTitle;
  if (!hasSchemaValue(node.url)) node.url = sanjayPrabhuPersonJsonLd.url;
  if (!hasSchemaValue(node.worksFor)) node.worksFor = { '@id': ORGANIZATION_ID };
};

/**
 * Walks a schema tree and pins the two site entities together:
 *  - every "Sanjay Prabhu" Person node gets the canonical name, MSME suffix
 *    and @id, so all author nodes resolve to one person;
 *  - publisher/worksFor/seller/provider Organization nodes named
 *    "Dolphin Centrifuge" get the canonical Organization @id.
 * Page-authored values are never overwritten apart from the person's name and
 * honorific suffix, which exist only to be consistent.
 */
export const linkSiteEntities = (value: any, parentKey?: string): any => {
  if (Array.isArray(value)) return value.map((entry) => linkSiteEntities(entry, parentKey));
  if (!isPlainObject(value)) return value;

  const node: Record<string, any> = { ...value };
  const types = schemaTypes(node);

  if (types.includes('Person') && SANJAY_PATTERN.test(String(node.name || ''))) {
    normalizePersonNode(node);
  }

  if (
    parentKey &&
    ORG_REFERENCE_KEYS.has(parentKey) &&
    types.includes('Organization') &&
    DOLPHIN_ORG_NAMES.has(String(node.name || '').trim().toLowerCase()) &&
    !hasSchemaValue(node['@id'])
  ) {
    node['@id'] = ORGANIZATION_ID;
  }

  for (const [key, child] of Object.entries(node)) {
    if (key === '@id' || key === '@type' || key === '@context') continue;
    node[key] = linkSiteEntities(child, key);
  }
  return node;
};
