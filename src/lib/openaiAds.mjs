// Runs in the browser. Keep measurement failures separate from form completion.
export function installOpenAiAds(window, document, config) {
  try {
    if (!config.pixelId || !config.allowedHosts.includes(window.location.hostname)) return;
    if (window.__dolphinOpenAiAdsInstalled) return;
    const privacy = window.navigator || {};
    function rawCookie(name) {
      const part = String(document.cookie || '').split(';').find(value => value.trimStart().startsWith(name + '='));
      return part ? part.trimStart().slice(name.length + 1) : '';
    }
    function suppressionReason() {
      try {
        if (window.dolphinIsInternalVisitor?.() === true) return 'internal';
        if (privacy.globalPrivacyControl === true) return 'gpc';
        if (privacy.doNotTrack === '1') return 'dnt';
        if (window.localStorage?.getItem('oaiq_consent') === 'false' || rawCookie('__oaiq_consent') === 'false') return 'stored_denial';
        const queued = window.oaiq?.q || [];
        let denied = false;
        for (const command of queued) if (command[0] === 'consent') denied = command[1] === false;
        return denied ? 'queued_denial' : '';
      } catch { return 'storage_unavailable'; }
    }
    function measurementAllowed() { return !suppressionReason(); }
    let landingReference = '';
    function savedReference() {
      try { return decodeURIComponent(rawCookie('dc_oppref')); } catch { return ''; }
    }
    window.dolphinOpenAiConversionContext = function () {
      try {
        const internal = window.dolphinIsInternalVisitor?.() === true;
        const reason = suppressionReason();
        if (reason) {
          landingReference = '';
          document.cookie = 'dc_oppref=; Path=/; Max-Age=0; Secure; SameSite=Lax';
          return { allowed: false, reason, internal };
        }
        return { allowed: true, internal, sourceUrl: window.location.origin + window.location.pathname,
          oppref: landingReference || savedReference() || rawCookie('__oppref'), obref: rawCookie('__obref') };
      } catch { return { allowed: false, reason: 'context_unavailable', internal: false }; }
    };
    if (!measurementAllowed()) { window.dolphinOpenAiConversionContext(); return; }
    // Capture the actual URL value before the third-party SDK loads. Never invent an identifier.
    try {
      const value = new window.URLSearchParams(window.location.search || '').get('oppref');
      if (typeof value === 'string' && value.length > 0 && value.length <= 8192) {
        landingReference = value;
        // Same-origin Pages Function writes the cookie after client-side consent checks.
        // The in-memory value still reaches a form if this optional request fails.
        window.fetch('/api/ads-attribution', {
          method: 'POST', credentials: 'same-origin', keepalive: true,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ allowed: true, oppref: value }),
        }).then(function () {
          if (!measurementAllowed()) window.dolphinOpenAiConversionContext();
        }).catch(function () {});
      }
    } catch { /* SDK and form completion remain independent. */ }

    if (!window.oaiq) {
      const queue = function () { queue.q.push(arguments); };
      queue.q = [];
      window.oaiq = queue;
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://bzrcdn.openai.com/sdk/oaiq.min.js';
      const first = document.getElementsByTagName('script')[0];
      first.parentNode.insertBefore(script, first);
    }
    window.oaiq('init', { pixelId: config.pixelId });
    window.dolphinTrackOpenAiLead = function (params) {
      try {
        if (!measurementAllowed()) return false;
        const eventId = params && params.openai_event_id;
        if (typeof eventId !== 'string' || !eventId) return false;
        let measured = false;
        const measure = function () {
          if (measured || !measurementAllowed()) return;
          measured = true;
          window.oaiq('measure', 'lead_created', { type: 'customer_action' }, { opt_out: true, event_id: eventId });
        };
        const email = typeof params.openai_email === 'string' ? params.openai_email.trim().toLowerCase() : '';
        if (email && email.length <= 254 && window.crypto?.subtle && window.TextEncoder) {
          window.crypto.subtle.digest('SHA-256', new window.TextEncoder().encode(email)).then(function (digest) {
            const emailSha256 = Array.from(new Uint8Array(digest), function (byte) {
              return byte.toString(16).padStart(2, '0');
            }).join('');
            if (measurementAllowed()) window.oaiq('init', { user: { email_sha256: emailSha256 } });
            measure();
          }).catch(measure);
        } else {
          measure();
        }
        return true;
      } catch (_) { return false; }
    };
    window.__dolphinOpenAiAdsInstalled = true;
  } catch (_) { /* Tracking must never interrupt a customer inquiry. */ }
}

export function buildOpenAiAdsBootstrap(config) {
  if (!config.pixelId) return '';
  const safeConfig = JSON.stringify(config).replace(/</g, '\\u003c');
  return `(${installOpenAiAds.toString()})(window, document, ${safeConfig});`;
}
