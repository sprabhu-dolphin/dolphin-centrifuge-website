// Same-origin persistence only; this endpoint never sends a conversion.
const ORIGINS = new Set(['https://dolphincentrifuge.com', 'https://www.dolphincentrifuge.com']);
export async function onRequest({ request }) {
  const url = new URL(request.url);
  const headers = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' };
  if (request.method !== 'POST') return new Response(null, { status: 405, headers });
  if (!ORIGINS.has(url.origin) || request.headers.get('Origin') !== url.origin) return new Response(null, { status: 403, headers });
  if (request.headers.get('Sec-GPC') === '1' || request.headers.get('DNT') === '1'
      || /(?:^|;\s*)__oaiq_consent=false(?:;|$)/.test(request.headers.get('Cookie') || '')) {
    return new Response(null, { status: 204, headers: { ...headers, 'Set-Cookie': 'dc_oppref=; Path=/; Max-Age=0; Secure; SameSite=Lax' } });
  }
  if (Number(request.headers.get('Content-Length')) > 12000) return new Response(null, { status: 413, headers });
  try {
    const body = await request.json();
    if (body.allowed !== true || typeof body.oppref !== 'string' || !body.oppref || body.oppref.length > 8192) return new Response(null, { status: 400, headers });
    // Cookie encoding is reversible transport escaping; the opaque value is not modified.
    const cookie = encodeURIComponent(body.oppref);
    if (cookie.length > 3800) return new Response(null, { status: 413, headers });
    return new Response(null, { status: 204, headers: { ...headers,
      'Set-Cookie': `dc_oppref=${cookie}; Path=/; Max-Age=2592000; Secure; SameSite=Lax` } });
  } catch { return new Response(null, { status: 400, headers }); }
}
