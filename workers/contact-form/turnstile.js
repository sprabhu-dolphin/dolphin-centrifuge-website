const FORM_HOSTNAMES = new Set(['dolphincentrifuge.com', 'www.dolphincentrifuge.com']);

// Reject missing, expired, reused, or unrelated tokens before processing a lead.
export async function verifyTurnstile(token, secretKey, request, action) {
  if (typeof token !== 'string' || !token.trim() || token.length > 2048 || !secretKey) return false;
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
        remoteip: request.headers.get('CF-Connecting-IP') || '',
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return false;
    const result = await response.json();
    return result.success === true && FORM_HOSTNAMES.has(result.hostname) && result.action === action;
  } catch {
    return false;
  }
}
