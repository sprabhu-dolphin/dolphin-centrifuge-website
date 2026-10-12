import { buildSpecsDataset } from '../../data/specsDataset';

export const prerender = true;

// Agent-only dataset (owner decision 2026-10-12). Discoverable via llms.txt and Dataset
// JSON-LD; never link it from a visible page. Source: src/data/specsDataset.ts.
export function GET() {
  return new Response(JSON.stringify(buildSpecsDataset(), null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
