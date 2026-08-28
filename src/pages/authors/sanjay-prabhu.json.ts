import type { APIRoute } from 'astro';
import {
  PERSON_ID,
  PERSON_JSON_URL,
  PERSON_PROFILE_URL,
  SANJAY_EXTERNAL_AUTHOR_URL,
  SANJAY_LINKEDIN_URL,
  UARK_COMMENCEMENT_RECORD_URL,
  UARK_SENIOR_WALK_DATA_URL,
  UARK_SENIOR_WALK_URL,
  UARK_THESIS_RECORD_URL,
  sanjayPrabhuPersonJsonLd,
} from '../../lib/siteSchema';

export const prerender = true;

const authorRecord = {
  schemaVersion: '1.0',
  recordType: 'source-backed-author-identity',
  canonicalEntityId: PERSON_ID,
  canonicalProfile: PERSON_PROFILE_URL,
  canonicalJson: PERSON_JSON_URL,
  lastVerified: '2026-08-28',
  profile: sanjayPrabhuPersonJsonLd,
  credential: {
    degree: 'Master of Science in Mechanical Engineering',
    abbreviation: 'M.S.M.E.',
    institution: 'University of Arkansas',
    publicUniversityRecordYear: 1991,
    displayedConferralYear: null,
    dateNote:
      'The University public records are dated 1991. LinkedIn displays attendance through 1990. Dolphin does not infer an exact degree-conferral date from an attendance range.',
  },
  authorship: {
    role: 'Owner and Chief Engineer',
    organization: 'Dolphin Centrifuge',
    responsibility:
      'Centrifuge application engineering, machine selection, remanufacturing scope, turnkey separation-system design, and technical recommendations published under his byline.',
  },
  evidence: [
    {
      claim: 'Full name and Master of Science in Mechanical Engineering credential',
      authority: 'University of Arkansas',
      sourceType: 'Institutional commencement record',
      url: UARK_COMMENCEMENT_RECORD_URL,
      detail:
        'The May 1991 commencement program lists Sanjay K. Prabhu under Master of Science in Mechanical Engineering and records a prior B.E. from the University of Poona.',
    },
    {
      claim: 'M.S.M.E. thesis, author name, and technical subject matter',
      authority: 'University of Arkansas Libraries',
      sourceType: 'Institutional library catalog record',
      url: UARK_THESIS_RECORD_URL,
      detail:
        'The catalog identifies Sanjay K. Prabhu, the M.S.M.E. thesis, and CAD/CAM and numerical-control subjects.',
    },
    {
      claim: 'Name and M.S.M.E. credential',
      authority: 'University of Arkansas',
      sourceType: 'Institutional graduate record',
      url: UARK_SENIOR_WALK_URL,
      machineReadableUrl: UARK_SENIOR_WALK_DATA_URL,
      record: {
        id: 1836,
        name: 'Sanjay K. Prabhu',
        degree: 'M.S.M.E.',
        graduateYear: '1991',
      },
      detail: 'The Senior Walk lists Sanjay K. Prabhu, M.S.M.E., in its 1991 public grouping.',
    },
    {
      claim: 'Public professional identity and connection to Dolphin Centrifuge',
      authority: 'Sanjay Prabhu',
      sourceType: 'First-person professional profile',
      url: SANJAY_LINKEDIN_URL,
      detail:
        'The public profile identifies Dolphin Centrifuge, Warren, Michigan, and links dolphincentrifuge.com.',
    },
    {
      claim: 'Technical authorship connected to Dolphin Centrifuge',
      authority: 'Machinery Lubrication',
      sourceType: 'Independent publisher author record',
      url: SANJAY_EXTERNAL_AUTHOR_URL,
      detail: 'The publisher identifies Sanjay Prabhu and his Dolphin Centrifuge technical work.',
    },
  ],
  ownerAttestation: {
    attestedBy: 'Sanjay Prabhu',
    attestationDate: '2026-08-28',
    claims: [
      'Identity as Sanjay Prabhu, owner and chief engineer of Dolphin Centrifuge',
      'Master of Science in Mechanical Engineering credential from the University of Arkansas',
    ],
    datePolicy:
      'No exact conferral year is asserted while the public source dates remain inconsistent.',
  },
};

export const GET: APIRoute = () =>
  new Response(`${JSON.stringify(authorRecord, null, 2)}\n`, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
