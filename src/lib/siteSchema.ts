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
export const PERSON_PROFILE_PATH = '/authors/sanjay-prabhu/';
export const PERSON_PROFILE_URL = `${SITE_URL}${PERSON_PROFILE_PATH}`;
export const PERSON_PROFILE_PAGE_ID = `${PERSON_PROFILE_URL}#profile`;
export const PERSON_ID = `${PERSON_PROFILE_URL}#person`;
export const PERSON_JSON_URL = `${SITE_URL}/authors/sanjay-prabhu.json`;

export const SANJAY_LINKEDIN_URL =
  'https://www.linkedin.com/in/sanjay-prabhu-a987085';
export const SANJAY_EXTERNAL_AUTHOR_URL =
  'https://www.machinerylubrication.com/Authors/Detail/2429';
export const UARK_THESIS_RECORD_URL =
  'https://onesearch.uark.edu/permalink/01UARK_INST/6np6g9/alma991022032739707336';
export const UARK_COMMENCEMENT_RECORD_URL =
  'https://archive.org/details/1991-05_202504/page/n48/mode/1up';
export const UARK_SENIOR_WALK_URL =
  'https://www.uark.edu/about/senior-walk/?year=1991#find';
export const UARK_SENIOR_WALK_DATA_URL =
  'https://campusdata.uark.edu/apiv2/map/seniorwalklist/1991';

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

export const universityOfArkansasJsonLd = {
  '@type': 'CollegeOrUniversity',
  name: 'University of Arkansas',
  url: 'https://www.uark.edu/',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Fayetteville',
    addressRegion: 'AR',
    addressCountry: 'US',
  },
};

export const sanjayCredentialEvidenceJsonLd = [
  {
    '@type': 'WebPage',
    name: 'University of Arkansas Libraries thesis catalog record',
    url: UARK_THESIS_RECORD_URL,
  },
  {
    '@type': 'DigitalDocument',
    name: 'University of Arkansas May 1991 commencement program, printed page 47',
    url: UARK_COMMENCEMENT_RECORD_URL,
  },
  {
    '@type': 'Dataset',
    name: 'University of Arkansas Senior Walk record',
    url: UARK_SENIOR_WALK_URL,
    distribution: {
      '@type': 'DataDownload',
      encodingFormat: 'application/json',
      contentUrl: UARK_SENIOR_WALK_DATA_URL,
    },
  },
];

/**
 * Canonical Person node for Sanjay Prabhu.
 *
 * The degree is deliberately year-neutral. LinkedIn shows attendance through
 * 1990, while the University's public thesis, commencement and Senior Walk
 * records are dated 1991. The public institutional records conclusively
 * corroborate the credential, but an exact conferral date is not inferred.
 */
export const sanjayPrabhuPersonJsonLd = {
  '@type': 'Person',
  '@id': PERSON_ID,
  name: 'Sanjay Prabhu',
  additionalName: 'K.',
  alternateName: 'Sanjay K. Prabhu',
  honorificSuffix: 'M.S.M.E.',
  jobTitle: 'Owner and Chief Engineer',
  description:
    'Mechanical engineer with an M.S.M.E. from the University of Arkansas who leads centrifuge application engineering, Alfa Laval centrifuge remanufacturing, and turnkey separation-system design at Dolphin Centrifuge.',
  url: PERSON_PROFILE_URL,
  mainEntityOfPage: { '@id': PERSON_PROFILE_PAGE_ID },
  worksFor: { '@id': ORGANIZATION_ID },
  sameAs: [SANJAY_LINKEDIN_URL, SANJAY_EXTERNAL_AUTHOR_URL],
  subjectOf: [
    ...sanjayCredentialEvidenceJsonLd,
    {
      '@type': 'ProfilePage',
      name: 'Sanjay Prabhu author profile at Machinery Lubrication',
      url: SANJAY_EXTERNAL_AUTHOR_URL,
    },
  ],
  knowsAbout: [
    'Alfa Laval centrifuges',
    'Disc stack centrifuges',
    'Decanter centrifuges',
    'Centrifuge remanufacturing',
    'Industrial fluid separation',
    'Turnkey centrifuge system design',
  ],
  alumniOf: universityOfArkansasJsonLd,
  hasCredential: [
    {
      '@type': 'EducationalOccupationalCredential',
      name: 'Master of Science in Mechanical Engineering',
      alternateName: 'M.S.M.E.',
      credentialCategory: "Master's degree",
      recognizedBy: universityOfArkansasJsonLd,
      description:
        'Master of Science in Mechanical Engineering from the University of Arkansas, corroborated by public University thesis, commencement, and Senior Walk records.',
      subjectOf: sanjayCredentialEvidenceJsonLd,
    },
    {
      '@type': 'EducationalOccupationalCredential',
      name: 'Bachelor of Engineering',
      alternateName: 'B.E.',
      credentialCategory: "Bachelor's degree",
      recognizedBy: {
        '@type': 'CollegeOrUniversity',
        name: 'University of Poona',
      },
      description:
        'Prior Bachelor of Engineering degree recorded in the University of Arkansas May 1991 commencement program.',
      subjectOf: [sanjayCredentialEvidenceJsonLd[1]],
    },
  ],
  identifier: {
    '@type': 'PropertyValue',
    propertyID: 'University of Arkansas Libraries thesis catalog record',
    value: 'alma991022032739707336',
    url: UARK_THESIS_RECORD_URL,
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
  node.additionalName = sanjayPrabhuPersonJsonLd.additionalName;
  node.alternateName = sanjayPrabhuPersonJsonLd.alternateName;
  node.honorificSuffix = sanjayPrabhuPersonJsonLd.honorificSuffix;
  node['@id'] = PERSON_ID;
  node.jobTitle = sanjayPrabhuPersonJsonLd.jobTitle;
  node.description = sanjayPrabhuPersonJsonLd.description;
  node.url = PERSON_PROFILE_URL;
  node.mainEntityOfPage = sanjayPrabhuPersonJsonLd.mainEntityOfPage;
  node.worksFor = { '@id': ORGANIZATION_ID };
  node.sameAs = sanjayPrabhuPersonJsonLd.sameAs;
  node.subjectOf = sanjayPrabhuPersonJsonLd.subjectOf;
  node.alumniOf = sanjayPrabhuPersonJsonLd.alumniOf;
  node.hasCredential = sanjayPrabhuPersonJsonLd.hasCredential;
  node.identifier = sanjayPrabhuPersonJsonLd.identifier;

  const currentKnowledge = Array.isArray(node.knowsAbout)
    ? node.knowsAbout
    : hasSchemaValue(node.knowsAbout)
      ? [node.knowsAbout]
      : [];
  const seen = new Set(currentKnowledge.map((entry: any) => String(entry).toLowerCase()));
  node.knowsAbout = [
    ...currentKnowledge,
    ...sanjayPrabhuPersonJsonLd.knowsAbout.filter(
      (entry) => !seen.has(entry.toLowerCase()),
    ),
  ];
};

/**
 * Walks a schema tree and pins the two site entities together:
 *  - every "Sanjay Prabhu" Person node gets the canonical name, MSME suffix
 *    and @id, so all author nodes resolve to one person;
 *  - publisher/worksFor/seller/provider Organization nodes named
 *    "Dolphin Centrifuge" get the canonical Organization @id.
 * Canonical identity and credential fields overwrite page-local copies so an
 * article cannot accidentally publish a stale title, URL, or degree claim.
 * Page-specific knowsAbout values are retained and unioned with the canonical
 * expertise list.
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
