import { buildSpecsCsv } from '../../data/specsDataset';

export const prerender = true;

// CSV twin of alfa-laval-centrifuge-specs.v1.json. Agent-only; never link it from a visible page.
export function GET() {
  return new Response(buildSpecsCsv(), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
