import { ORGANIZATION_ID } from './siteSchema';

export interface DolphinVideo {
  id: string;
  title: string;
  uploadDate: string;
  fact: string;
}

export const DOLPHIN_VIDEOS = {
  motorOil: {
    id: '0Ex7AzpYuQY',
    title: 'Used Motor Oil Separation Test | Alfa Laval Disc Stack Centrifuge Pilot Run',
    uploadDate: '2025-12-26T15:41:42-05:00',
    fact: 'A used motor oil sample is run through an Alfa Laval disc stack centrifuge in a pilot run.',
  },
  pilot: {
    id: 'b-cnnYnrj5c',
    title: 'Pilot Test with Alfa Laval Disc Stack Centrifuge',
    uploadDate: '2026-03-08T19:30:03-04:00',
    fact: 'A pilot test run on an Alfa Laval disc stack centrifuge.',
  },
  trampOil: {
    id: 'rgCa6NbYtmE',
    title: 'Tramp Oil Out in 30 Seconds: Coolant Cleaning with Alfa Laval Disc Centrifuge',
    uploadDate: '2026-03-03T07:32:06-05:00',
    fact: 'Tramp oil is separated from coolant by an Alfa Laval disc centrifuge in about 30 seconds.',
  },
  bod: {
    id: 'xDEPdhmq9zQ',
    title: 'Alfa Laval Disc Stack Centrifuge for Wastewater BOD Reduction – Real Sample Test',
    uploadDate: '2025-10-18T13:58:58-04:00',
    fact: 'A real wastewater sample is run through an Alfa Laval disc stack centrifuge to reduce BOD.',
  },
} satisfies Record<string, DolphinVideo>;

export function videoJsonLd(v: DolphinVideo) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: v.title,
    description: `${v.title}. ${v.fact}`,
    thumbnailUrl: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
    uploadDate: v.uploadDate,
    embedUrl: `https://www.youtube-nocookie.com/embed/${v.id}`,
    contentUrl: `https://www.youtube.com/watch?v=${v.id}`,
    publisher: { '@id': ORGANIZATION_ID },
  };
}
