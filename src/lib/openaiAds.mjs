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
    function measurementAllowed() {
      try {
        if (privacy.globalPrivacyControl === true || privacy.doNotTrack === '1') return false;
        // Preserve the current SDK's persisted denial, including after a reload.
        if (window.localStorage?.getItem('oaiq_consent') === 'false' || rawCookie('__oaiq_consent') === 'false') return false;
        const queued = window.oaiq?.q || [];
        let denied = false;
        for (const command of queued) if (command[0] === 'consent') denied = command[1] === false;
        return !denied;
      } catch { return false; }
    }
    window.dolphinOpenAiConversionContext = function () {
      try {
        if (!measurementAllowed()) return { allowed: false };
        return { allowed: true, sourceUrl: window.location.origin + window.location.pathname,
          oppref: rawCookie('__oppref'), obref: rawCookie('__obref') };
      } catch { return { allowed: false }; }
    };
    if (!measurementAllowed()) return;

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
        window.oaiq('measure', 'lead_created', { type: 'customer_action' }, { opt_out: true, event_id: eventId });
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
