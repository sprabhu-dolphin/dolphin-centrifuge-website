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

// DECISION_RULES section 2 (n<20 is noise): a per-form GA4 gap is only a verdict
// when the form has at least LOW_N_MIN events. Below that it is INFO, never WARN.
export const LOW_N_MIN = 10;
export const MIN_MATCH_RATIO = 0.70;
// A real outage: GA4 saw no leads at all while D1 stored at least this many.
export const OUTAGE_MIN_D1 = 3;
// Ads form-lead conversions of 0 only matter when D1 has this many paid leads.
export const ADS_MIN_PAID_LEADS = 3;

function isoWeekKey(isoDate) {
  const d = new Date(`${isoDate || isoToday()}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}

// d1: { form_type: count }, ga4: { lead_form: count }, ads: { action: conversions }.
// opts.d1Ids: { form_type: [submission ids] }, opts.d1PaidIds: [submission ids],
// opts.adsSpend: Ads cost in the window, opts.windowEnd: YYYY-MM-DD.
// Each WARN carries dedupe `keys`; the monitor only emails when a key is new.
export function reconcileLeadSources(d1, ga4, ads, opts = {}) {
  const minN = Number(opts.lowNMin ?? LOW_N_MIN);
  const ratio = Number(opts.minMatchRatio ?? MIN_MATCH_RATIO);
  const d1Ids = opts.d1Ids || {};
  const week = isoWeekKey(opts.windowEnd);
  const alerts = [];
  const info = [];
  const perType = [];

  let d1FormTotal = 0;
  let ga4FormTotal = 0;

  for (const ft of FORM_TYPES) {
    const nD1 = Number(d1?.[ft.d1] || 0);
    const nGA4 = Number(ga4?.[ft.ga4LeadForm] || 0);
    d1FormTotal += nD1;
    ga4FormTotal += nGA4;
    const row = { formType: ft.key, d1: nD1, ga4: nGA4, flag: 'ok' };

    if (nD1 > nGA4) {
      if (nD1 >= minN && nGA4 / nD1 < ratio) {
        alerts.push({
          level: 'WARN',
          formType: ft.key,
          keys: (d1Ids[ft.d1] || []).map((id) => `sub:${id}`),
          message: `WARN [${ft.key}]: D1=${nD1} but GA4 generate_lead=${nGA4} (${Math.round((nGA4 / nD1) * 100)}% matched, below ${Math.round(ratio * 100)}%). generate_lead may not be firing on every ${ft.key} submit.`,
        });
        row.flag = 'WARN: D1 > GA4';
      } else if (nD1 < minN) {
        info.push(`INFO [${ft.key}]: D1=${nD1}, GA4=${nGA4} - low-n, no verdict.`);
        row.flag = 'low-n, no verdict';
      } else {
        row.flag = 'ok (within band)';
      }
    } else if (nGA4 > nD1) {
      if (nGA4 >= minN && nD1 / nGA4 < ratio) {
        alerts.push({
          level: 'WARN',
          formType: ft.key,
          keys: [`ga4-surplus:${ft.key}:${week}`],
          message: `WARN [${ft.key}]: GA4 generate_lead=${nGA4} exceeds D1=${nD1}. Either generate_lead fires without a stored submission, or the D1 write is failing for this form.`,
        });
        row.flag = 'WARN: GA4 > D1';
      } else if (nGA4 < minN) {
        info.push(`INFO [${ft.key}]: D1=${nD1}, GA4=${nGA4} - low-n, no verdict.`);
        row.flag = 'low-n, no verdict';
      } else {
        row.flag = 'ok (within band)';
      }
    }
    perType.push(row);
  }

  if (ga4FormTotal === 0 && d1FormTotal >= OUTAGE_MIN_D1) {
    alerts.unshift({
      level: 'CRITICAL',
      formType: 'all',
      keys: null,
      message: `CRITICAL: D1 stored ${d1FormTotal} form leads but GA4 generate_lead=0 across all forms - site lead tracking looks down (check BaseLayout.astro dolphinTrackLead and the form success handlers).`,
    });
  }

  const knownD1 = new Set(FORM_TYPES.map((f) => f.d1));
  const knownGA4 = new Set(FORM_TYPES.map((f) => f.ga4LeadForm));
  for (const [k, v] of Object.entries(d1 || {})) {
    if (Number(v || 0) > 0 && !knownD1.has(k)) {
      alerts.push({ level: 'WARN', formType: k, keys: (d1Ids[k] || []).map((id) => `sub:${id}`), message: `WARN [coverage]: D1 has ${v} lead(s) with form_type='${k}' which is not mapped in FORM_TYPES - this form is unmonitored. Add it.` });
    }
  }
  for (const [k, v] of Object.entries(ga4 || {})) {
    if (Number(v || 0) > 0 && !knownGA4.has(k)) {
      alerts.push({ level: 'WARN', formType: k, keys: [`ga4-coverage:${k}`], message: `WARN [coverage]: GA4 has ${v} generate_lead event(s) with lead_form='${k}' which is not mapped in FORM_TYPES - this form is unmonitored. Add it.` });
    }
  }

  const adsForm = sumMatching(ads || {}, ADS_FORM_LEAD_ACTIONS);
  const adsPhone = sumMatching(ads || {}, ADS_PHONE_LEAD_ACTIONS);
  const adsSpend = Number(opts.adsSpend || 0);
  const paidIds = opts.d1PaidIds || [];
  if (adsForm === 0 && adsSpend > 0 && paidIds.length >= ADS_MIN_PAID_LEADS) {
    alerts.push({
      level: 'WARN',
      formType: 'ads',
      keys: paidIds.map((id) => `ads-zero:${id}`),
      message: `WARN [ads]: Ads recorded 0 form-lead conversions while spending $${adsSpend.toFixed(2)} and D1 has ${paidIds.length} paid-click leads in the same window. The Ads generate_lead conversion may not be importing.`,
    });
  } else if (adsForm > ga4FormTotal) {
    info.push(`INFO [ads]: Ads form-lead conversions=${adsForm} exceed GA4 generate_lead total=${ga4FormTotal} (Ads conversion column is not used for decisions).`);
  }

  return {
    perType,
    totals: {
      d1Forms: d1FormTotal,
      ga4Forms: ga4FormTotal,
      adsFormConversions: adsForm,
      adsPhoneConversions: adsPhone,
      adsSpend,
      d1PaidLeads: paidIds.length,
    },
    alerts,
    info,
  };
}

export function leadReconciliationVerdict(report) {
  const alerts = report?.alerts || [];
  const critical = alerts.filter((a) => a.level === 'CRITICAL').length;
  const warn = alerts.filter((a) => a.level === 'WARN').length;
  return {
    critical,
    warn,
    info: (report?.info || []).length,
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
  lines.push('Google Ads (window):');
  lines.push(`  spend: $${Number(report.totals?.adsSpend || 0).toFixed(2)} | D1 paid-click leads: ${report.totals?.d1PaidLeads || 0}`);
  for (const [name, v] of Object.entries(ads)) lines.push(`  ${pad(name, 38)}${Number(v || 0).toFixed(1)}`);
  lines.push(`  -> form-lead conversions: ${report.totals?.adsFormConversions || 0} | phone conversions: ${report.totals?.adsPhoneConversions || 0}`);
  lines.push('');
  lines.push('Alerts:');
  if (!report.alerts?.length) {
    lines.push('  none.');
  } else {
    for (const a of report.alerts) lines.push(`  - ${a.message}${a.isNew === false ? ' (already alerted)' : ''}`);
  }
  if (report.info?.length) {
    lines.push('');
    lines.push('Info:');
    for (const line of report.info) lines.push(`  - ${line}`);
  }
  lines.push('');
  lines.push(`Verdict: ${verdict.status} (${verdict.critical} critical, ${verdict.warn} warn, ${verdict.info} info).`);
  return lines.join('\n');
}
