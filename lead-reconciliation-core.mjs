// Shared lead reconciliation rules for Dolphin's local checker and cloud monitor.
// Keep this file Worker-safe: no Node-only imports, no filesystem, no child_process.

export const DEFAULT_GA4_PROPERTY_ID = '536974508';
export const DEFAULT_ADS_CUSTOMER_ID = '3917484159';
export const DEFAULT_ADS_LOGIN_CUSTOMER_ID = '6124315358';

export const FORM_TYPES = [
  { key: 'contact', d1: 'contact', ga4LeadForm: 'centrifuge_contact_form' },
  { key: 'parts', d1: 'parts_request_form', ga4LeadForm: 'parts_request_form' },
  { key: 'disc-glossary', d1: 'disc_parts_glossary_form', ga4LeadForm: 'disc_parts_glossary_form' },
];

export const ADS_FORM_LEAD_ACTIONS = [/generate[_ ]?lead/i];
export const ADS_PHONE_LEAD_ACTIONS = [/calls from ads/i];
export const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const D1_TEST_EXCLUSION_SQL = [
  `lower(coalesce(email,'')) NOT LIKE '%@example.com'`,
  `lower(coalesce(email,'')) NOT LIKE '%@example.org'`,
  `lower(coalesce(email,'')) NOT LIKE '%@example.net'`,
  `lower(coalesce(email,'')) NOT LIKE '%codex%'`,
  `lower(coalesce(first_name,'')) NOT LIKE '%codex%'`,
  `lower(coalesce(last_name,'')) NOT LIKE '%codex%'`,
].join(' AND ');

export function isoDaysAgo(days, now = new Date()) {
  const d = new Date(now);
  d.setUTCDate(d.getUTCDate() - Number(days || 0));
  return d.toISOString().slice(0, 10);
}

export function isoToday(now = new Date()) {
  return new Date(now).toISOString().slice(0, 10);
}

export function addDays(isoDate, days) {
  const d = new Date(`${isoDate}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + Number(days || 0));
  return d.toISOString().slice(0, 10);
}

export function nextDay(isoDate) {
  return addDays(isoDate, 1);
}

export function buildLeadMonitorWindow(opts = {}) {
  const now = opts.now || new Date();
  const days = Math.max(1, Number(opts.days || 14));
  const endOffsetDays = Math.max(0, Number(opts.endOffsetDays || 0));
  const end = opts.end || addDays(isoToday(now), -endOffsetDays);
  const start = opts.start || addDays(end, -(days - 1));
  if (!ISO_DATE_RE.test(start)) throw new Error(`Invalid start date: ${start}`);
  if (!ISO_DATE_RE.test(end)) throw new Error(`Invalid end date: ${end}`);
  return { start, end, endExclusive: nextDay(end), days };
}

export function normalizeAdsCustomerId(value) {
  return String(value || '').replace(/\D/g, '');
}

export function sumMatching(byAction, patterns) {
  let total = 0;
  for (const [name, value] of Object.entries(byAction || {})) {
    if (patterns.some((re) => re.test(name))) total += Number(value || 0);
  }
  return total;
}

export function reconcileLeadSources(d1, ga4, ads, opts = {}) {
  const tol = Number(opts.undercountTolerance ?? 0.30);
  const minAbs = Number(opts.minAbs ?? 2);
  const alerts = [];
  const perType = [];

  let d1FormTotal = 0;
  let ga4FormTotal = 0;

  for (const ft of FORM_TYPES) {
    const nD1 = Number(d1?.[ft.d1] || 0);
    const nGA4 = Number(ga4?.[ft.ga4LeadForm] || 0);
    d1FormTotal += nD1;
    ga4FormTotal += nGA4;
    const row = { formType: ft.key, d1: nD1, ga4: nGA4 };

    if (nD1 >= 1 && nGA4 === 0) {
      const level = nD1 >= minAbs ? 'CRITICAL' : 'WARN';
      const msg = `${level} [${ft.key}]: D1 has ${nD1} form lead(s) but GA4 generate_lead=0 - the site's generate_lead may have stopped firing (check BaseLayout.astro dolphinTrackLead + the form success handler).`;
      alerts.push({ level, formType: ft.key, message: msg });
      row.flag = `${level}: GA4 silent`;
    } else if (nGA4 > nD1 && (nGA4 - nD1) >= minAbs && (nGA4 - nD1) / Math.max(nGA4, 1) > tol) {
      const msg = `WARN [${ft.key}]: GA4 generate_lead=${nGA4} exceeds D1=${nD1} by ${nGA4 - nD1}. Either client-side generate_lead is firing without a stored submission, or the D1 write is failing for this form. Investigate the ${ft.key} path.`;
      alerts.push({ level: 'WARN', formType: ft.key, message: msg });
      row.flag = 'WARN: GA4 > D1';
    } else if (nD1 > nGA4 && (nD1 - nGA4) >= minAbs && (nD1 - nGA4) / Math.max(nD1, 1) > tol) {
      const msg = `WARN [${ft.key}]: D1=${nD1} exceeds GA4 generate_lead=${nGA4} by ${nD1 - nGA4} (> ${Math.round(tol * 100)}% undercount band). generate_lead may not be firing on every ${ft.key} submit.`;
      alerts.push({ level: 'WARN', formType: ft.key, message: msg });
      row.flag = 'WARN: D1 > GA4';
    } else {
      row.flag = 'ok';
    }
    perType.push(row);
  }

  const knownD1 = new Set(FORM_TYPES.map((f) => f.d1));
  const knownGA4 = new Set(FORM_TYPES.map((f) => f.ga4LeadForm));
  for (const [k, v] of Object.entries(d1 || {})) {
    if (Number(v || 0) > 0 && !knownD1.has(k)) {
      alerts.push({ level: 'WARN', formType: k, message: `WARN [coverage]: D1 has ${v} lead(s) with form_type='${k}' which is not mapped in reconcile-leads.mjs FORM_TYPES - this form is unmonitored. Add it.` });
    }
  }
  for (const [k, v] of Object.entries(ga4 || {})) {
    if (Number(v || 0) > 0 && !knownGA4.has(k)) {
      alerts.push({ level: 'WARN', formType: k, message: `WARN [coverage]: GA4 has ${v} generate_lead event(s) with lead_form='${k}' which is not mapped in reconcile-leads.mjs FORM_TYPES - this form is unmonitored. Add it.` });
    }
  }

  const adsForm = sumMatching(ads || {}, ADS_FORM_LEAD_ACTIONS);
  const adsPhone = sumMatching(ads || {}, ADS_PHONE_LEAD_ACTIONS);
  if (adsForm > ga4FormTotal && (adsForm - ga4FormTotal) >= minAbs) {
    const msg = `WARN [ads]: Ads form-lead conversions=${adsForm} exceed GA4 generate_lead total=${ga4FormTotal}. Ads should count a subset of GA4 leads - a surplus suggests page-view or codeless actions counting again.`;
    alerts.push({ level: 'WARN', formType: 'ads', message: msg });
  }

  return {
    perType,
    totals: { d1Forms: d1FormTotal, ga4Forms: ga4FormTotal, adsFormConversions: adsForm, adsPhoneConversions: adsPhone },
    alerts,
  };
}

export function leadReconciliationVerdict(report) {
  const critical = (report.alerts || []).filter((a) => a.level === 'CRITICAL').length;
  const warn = (report.alerts || []).filter((a) => a.level === 'WARN').length;
  return {
    critical,
    warn,
    status: critical ? 'CRITICAL' : warn ? 'WARN' : 'OK',
  };
}

function pad(value, n) {
  const s = String(value);
  return s + ' '.repeat(Math.max(0, n - s.length));
}

export function formatLeadReconciliationText(report, ctx = {}) {
  const window = ctx.window || {};
  const ads = ctx.ads || {};
  const verdict = leadReconciliationVerdict(report);
  const lines = [];

  lines.push(`Dolphin lead reconciliation | ${window.start || '?'}..${window.end || '?'}`);
  lines.push('(D1 windowed in UTC; GA4/Ads use their account reporting timezone, so edge-day counts can differ slightly)');
  lines.push('');
  lines.push('Form leads by type (D1 = source of truth):');
  lines.push(`  ${pad('form', 16)}${pad('D1', 6)}${pad('GA4', 6)}status`);
  for (const r of report.perType || []) {
    lines.push(`  ${pad(r.formType, 16)}${pad(r.d1, 6)}${pad(r.ga4, 6)}${r.flag}`);
  }
  lines.push(`  ${pad('TOTAL', 16)}${pad(report.totals?.d1Forms || 0, 6)}${pad(report.totals?.ga4Forms || 0, 6)}`);
  lines.push('');
  lines.push('Google Ads conversions (window):');
  const adsEntries = Object.entries(ads);
  if (!adsEntries.length) {
    lines.push('  (none yet - generate_lead + Calls-from-ads only accrue after the 2026-06-18/19 fixes)');
  } else {
    for (const [name, v] of adsEntries) lines.push(`  ${pad(name, 38)}${v}`);
  }
  lines.push(`  -> form-lead actions: ${report.totals?.adsFormConversions || 0} | phone actions: ${report.totals?.adsPhoneConversions || 0}`);
  lines.push('  (phone = Ads "Calls from ads"; full phone-lead truth arrives with the Talkroute feed)');
  lines.push('');
  lines.push('Alerts:');
  if (!report.alerts?.length) {
    lines.push('  none - all systems reconcile within tolerance.');
  } else {
    for (const a of report.alerts) lines.push(`  - ${a.message}`);
  }
  lines.push('');
  lines.push(`Verdict: ${verdict.status} (${verdict.critical} critical, ${verdict.warn} warn).`);
  return lines.join('\n');
}
