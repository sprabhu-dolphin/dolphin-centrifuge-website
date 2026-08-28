import { technicalCatalog } from '../../data/centrifugeTechnicalRegistry.mjs';

export const prerender = true;

export function GET() {
  return new Response(JSON.stringify(technicalCatalog, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
