const SITE_ORIGIN = 'https://dolphincentrifuge.com';
const TRUSTED_ORIGINS = new Set([SITE_ORIGIN, 'https://www.dolphincentrifuge.com']);

function rawCookie(header, name) {
  const part = String(header || '').split(';').find(value => value.trimStart().startsWith(name + '='));
  return part ? part.trimStart().slice(name.length + 1) : '';
}

function contextFrom(input) {
  try {
    const value = typeof input === 'string' ? JSON.parse(input) : input;
    return value?.openai_ads || {};
  } catch { return {}; }
}

export function savedLeadEventId(result) {
  const id = result?.meta?.last_row_id;
  return result?.success !== false && Number.isSafeInteger(id) && id > 0 ? `dolphin_lead_${id}` : null;
}

// All work, including URL handling and serialization, stays inside this boundary.
export async function sendOpenAiLead({ env, request, attribution, eventId, timestampMs = Date.now(), validateOnly = false }, transport = fetch) {
  try {
    const context = contextFrom(attribution);
    if (!eventId || !env.OPENAI_ADS_CAPI_KEY || !env.OPENAI_ADS_PIXEL_ID) return { status: 'not_configured' };
    if (context.allowed !== true || request.headers.get('Sec-GPC') === '1' || request.headers.get('DNT') === '1') return { status: 'suppressed' };
    let sourceUrl = SITE_ORIGIN + '/contact-for-alfa-laval-centrifuges/';
    try {
      const candidate = new URL(context.sourceUrl);
      if (TRUSTED_ORIGINS.has(candidate.origin)) sourceUrl = candidate.origin + candidate.pathname;
    } catch { /* Use the canonical fallback. */ }
    const event = {
      id: eventId, type: 'lead_created', timestamp_ms: timestampMs,
      action_source: 'web', source_url: sourceUrl, opt_out: true,
      data: { type: 'customer_action' },
    };
    const cookies = request.headers.get('Cookie');
    const oppref = rawCookie(cookies, '__oppref') || context.oppref;
    if (typeof oppref === 'string' && oppref.length && oppref.length <= 8192) event.oppref = oppref;
    const user = {};
    const obref = rawCookie(cookies, '__obref') || context.obref;
    if (typeof obref === 'string' && obref.trim() && obref.length <= 1024) user.obref = obref;
    // Cloudflare supplies this header; never trust X-Forwarded-For from a form.
    const ip = request.headers.get('CF-Connecting-IP');
    const ua = request.headers.get('User-Agent');
    if (ip) user.ip_address = ip;
    if (ua) user.user_agent = ua.slice(0, 2048);
    if (Object.keys(user).length) event.user = user;
    const body = JSON.stringify({ validate_only: validateOnly, events: [event] });
    let response;
    // One bounded retry uses exactly the same ID, timestamp and payload.
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        response = await transport(`https://bzr.openai.com/v1/events?pid=${encodeURIComponent(env.OPENAI_ADS_PIXEL_ID)}`, {
          method: 'POST', headers: { Authorization: `Bearer ${env.OPENAI_ADS_CAPI_KEY}`, 'Content-Type': 'application/json' },
          body, signal: AbortSignal.timeout(4000),
        });
      } catch {
        if (attempt === 0) continue;
        throw new Error('transport_failed');
      }
      if (response.ok || (response.status !== 429 && response.status < 500)) break;
    }
    if (!response?.ok) {
      console.error('OpenAI lead delivery failed', { status: response?.status || 0 });
      return { status: 'failed', httpStatus: response?.status || 0 };
    }
    // No identifiers, form contents, cookies, credentials or response bodies in logs.
    console.info('OpenAI lead delivery accepted', { validationOnly: validateOnly, httpStatus: response.status });
    return { status: validateOnly ? 'validated' : 'accepted', httpStatus: response.status };
  } catch {
    console.error('OpenAI lead delivery failed', { status: 'unavailable' });
    return { status: 'failed' };
  }
}

export function scheduleOpenAiLead(ctx, options) {
  try {
    const task = sendOpenAiLead(options);
    if (ctx && typeof ctx.waitUntil === 'function') ctx.waitUntil(task);
  } catch { /* Never interrupt an inquiry. */ }
}
