// /mcp on the apex -> dolphin-mcp Worker (remote MCP server for AI agents).
// The zone API token cannot create Worker routes, so Pages proxies, like /central/api.
const UPSTREAM = 'https://dolphin-mcp.dolphin-centrifuge.workers.dev';
const PASS = ['content-type', 'accept', 'mcp-protocol-version', 'mcp-session-id', 'last-event-id', 'authorization',
  'user-agent', 'accept-language', 'origin', 'access-control-request-method', 'access-control-request-headers'];

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const headers = new Headers();
  for (const name of PASS) {
    const v = request.headers.get(name);
    if (v) headers.set(name, v);
  }
  const ip = request.headers.get('cf-connecting-ip');
  if (ip) headers.set('x-dolphin-client-ip', ip);
  const ray = request.headers.get('cf-ray');
  if (ray) headers.set('x-dolphin-cf-ray', ray);
  const hasBody = !['GET', 'HEAD', 'OPTIONS'].includes(request.method);
  try {
    const response = await fetch(UPSTREAM + url.pathname + url.search, {
      method: request.method, headers, body: hasBody ? request.body : undefined, redirect: 'manual',
    });
    return new Response(response.body, response);
  } catch {
    return Response.json(
      { error: 'Dolphin MCP server is temporarily unavailable. Contact sales@dolphincentrifuge.com or (248) 522-2573.' },
      { status: 503, headers: { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' } },
    );
  }
}
