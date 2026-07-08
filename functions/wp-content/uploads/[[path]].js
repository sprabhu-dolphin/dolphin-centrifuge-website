const THUMBNAIL_VARIANT_RE = /-\d+x\d+(\.(?:jpe?g|png|gif|webp))$/i;

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  if (!['GET', 'HEAD'].includes(request.method)) {
    return env.ASSETS.fetch(request);
  }

  const originalResponse = await env.ASSETS.fetch(request);
  if (originalResponse.status !== 404 || !THUMBNAIL_VARIANT_RE.test(url.pathname)) {
    return originalResponse;
  }

  const baseUrl = new URL(request.url);
  baseUrl.pathname = url.pathname.replace(THUMBNAIL_VARIANT_RE, '$1');
  const baseRequest = new Request(baseUrl.toString(), request);
  const baseResponse = await env.ASSETS.fetch(baseRequest);

  return baseResponse.status === 200 ? baseResponse : originalResponse;
}
