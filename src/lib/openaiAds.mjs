// Runs in the browser. Keep measurement failures separate from form completion.
export function installOpenAiAds(window, document, config) {
  try {
    if (!config.pixelId || !config.allowedHosts.includes(window.location.hostname)) return;
    if (window.__dolphinOpenAiAdsInstalled) return;
    const privacy = window.navigator || {};
    if (privacy.globalPrivacyControl === true || privacy.doNotTrack === '1') return;

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
    window.dolphinTrackOpenAiLead = function () {
      try {
        if (privacy.globalPrivacyControl === true || privacy.doNotTrack === '1') return false;
        window.oaiq('measure', 'lead_created', { type: 'customer_action' }, { opt_out: true });
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
