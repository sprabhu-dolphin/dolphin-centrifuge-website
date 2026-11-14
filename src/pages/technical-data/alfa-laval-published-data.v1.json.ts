// Served byte for byte from src/data/alfa-laval-published-data.v1.json, the one copy of
// the dataset. The remote MCP server (workers/dolphin-mcp) bundles the same file.
import publishedData from '../../data/alfa-laval-published-data.v1.json?raw';

export const prerender = true;

export function GET() {
  return new Response(publishedData, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
