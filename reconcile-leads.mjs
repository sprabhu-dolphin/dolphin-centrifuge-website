#!/usr/bin/env node

// Reconciliation monitor for the Dolphin Stats Dashboard (read-only).
//
// Compares the three lead-tracking systems over a window and alerts on divergence:
//   - D1   form submissions  by form_type           (the SOURCE OF TRUTH for form leads)
//   - GA4  generate_lead     by customEvent:lead_form
//   - Ads  conversions       by conversion_action_name
//
// It reuses the existing, audited read-only helpers (ga4-check.mjs, google-ads-check.mjs)
// and wrangler d1 so there is one auth path. Nothing here mutates any system.
//
// Mapping (form-type axis):
//   contact : D1 'contact' <-> GA4 'centrifuge_contact_form' <-> Ads generate_lead (partial)
//   parts   : D1 'parts_request_form' <-> GA4 'parts_request_form' <-> Ads generate_lead (partial)
//   glossary: D1 'disc_parts_glossary_form' <-> GA4 'disc_parts_glossary_form' <-> Ads generate_lead (partial)
//   phone   : Ads 'Calls from ads' only (Talkroute feed is a future source) -> reported, not reconciled
//
// Expected relationships (from CONVERSION_TRACKING_VERIFICATION.md, Check 6):
//   N_ga4 ~= N_d1   per form type (GA4 may undercount ~10-30% from consent/adblock/bots)
//   N_ads <= N_ga4  (Ads counts only the ad-attributed subset)
//
// Alerts:
//   CRITICAL  generate_lead silence: D1 has new leads but GA4 generate_lead ~ 0 -> tracking broke
//   WARN      GA4 >> D1 for a form type (phantom client-side fires, or D1 write failing)
//   WARN      D1 >> GA4 beyond undercount tolerance (generate_lead not firing on some submits)
//   WARN      Ads form conversions > GA4 form leads (page-view junk counting again)
//
// Exit code: 0 = clean, 1 = WARN only, 2 = at least one CRITICAL. Lets a cron detect trouble.
//
// Usage:
//   node reconcile-leads.mjs [--start YYYY-MM-DD] [--end YYYY-MM-DD] [--days N] [--json]
//                            [--undercount-tolerance 0.30] [--min-abs 2]
//   Defaults: last 14 days, text output.

import { execFile, exec } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = __dirname;
const workerDir = path.join(repoRoot, 'workers', 'contact-form');

const D1_DATABASE = 'dolphin-submissions';
const ADS_CUSTOMER_ID = '3917484159';

// Form-type axis: how the same lead shows up in each system.
// D1 form_type = the form's attribution name for the /parts endpoint (worker index.js ~1250),
// and the literal 'contact' for the contact endpoint (~1537). GA4 lead_form is set per page.
const FORM_TYPES = [
  { key: 'contact', d1: 'contact', ga4LeadForm: 'centrifuge_contact_form' },
  { key: 'parts', d1: 'parts_request_form', ga4LeadForm: 'parts_request_form' },
  { key: 'disc-glossary', d1: 'disc_parts_glossary_form', ga4LeadForm: 'disc_parts_glossary_form' },
];

// Ads conversion-action names that represent a real lead (set up 2026-06-18/19).
const ADS_FORM_LEAD_ACTIONS = [/generate[_ ]?lead/i];
const ADS_PHONE_LEAD_ACTIONS = [/calls from ads/i];

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (!item.startsWith('--')) { args._.push(item); continue; }
    const eq = item.indexOf('=');
    if (eq !== -1) { args[item.slice(2, eq)] = item.slice(eq + 1); continue; }
    const key = item.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) { args[key] = true; } else { args[key] = next; i += 1; }
  }
  return args;
}

function isoDaysAgo(days) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

function isoToday() {
  return new Date().toISOString().slice(0, 10);
}

function nextDay(isoDate) {
  const d = new Date(`${isoDate}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

// Run a command, capture stdout, and parse the first JSON value it contains.
// (wrangler can emit non-JSON warnings on stderr / teardown asserts; we read stdout only.)
function runJson(command, cmdArgs, opts = {}) {
  return new Promise((resolve, reject) => {
    execFile(command, cmdArgs, { cwd: opts.cwd || repoRoot, maxBuffer: 32 * 1024 * 1024, windowsHide: true, shell: false }, (err, stdout, stderr) => {
      const out = String(stdout || '');
      const firstArr = out.indexOf('[');
      const firstObj = out.indexOf('{');
      const start = [firstArr, firstObj].filter((n) => n >= 0).sort((a, b) => a - b)[0];
      if (start === undefined) {
        reject(new Error(`No JSON in output of \`${command} ${cmdArgs.join(' ')}\`.\nstdout: ${out.slice(0, 400)}\nstderr: ${String(stderr || '').slice(0, 400)}`));
        return;
      }
      try {
        resolve(JSON.parse(out.slice(start)));
      } catch (parseErr) {
        // Fall back: the helper may have failed and printed an error line. Surface it.
        if (err) { reject(new Error(`${command} failed: ${String(stderr || out).slice(0, 600)}`)); return; }
        reject(new Error(`Could not parse JSON from \`${command}\`: ${parseErr.message}\n${out.slice(0, 400)}`));
      }
    });
  });
}

// Run a shell command string (used for `npx wrangler ...`, which on Windows is a .cmd
// that Node refuses to execFile without a shell) and parse the first JSON value in stdout.
function runJsonShell(commandString, opts = {}) {
  return new Promise((resolve, reject) => {
    exec(commandString, { cwd: opts.cwd || repoRoot, maxBuffer: 32 * 1024 * 1024, windowsHide: true }, (err, stdout, stderr) => {
      const out = String(stdout || '');
      const firstArr = out.indexOf('[');
      const firstObj = out.indexOf('{');
      const start = [firstArr, firstObj].filter((n) => n >= 0).sort((a, b) => a - b)[0];
      if (start === undefined) {
        reject(new Error(`No JSON in output of \`${commandString}\`.\nstdout: ${out.slice(0, 400)}\nstderr: ${String(stderr || '').slice(0, 600)}`));
        return;
      }
      try { resolve(JSON.parse(out.slice(start))); } catch (parseErr) {
        if (err) { reject(new Error(`Command failed: ${String(stderr || out).slice(0, 600)}`)); return; }
        reject(new Error(`Could not parse JSON: ${parseErr.message}\n${out.slice(0, 400)}`));
      }
    });
  });
}

const nodeBin = process.execPath;

// --- D1: form submissions by form_type (deleted=0, test rows excluded) ---
function d1TestExclusion() {
  // Exclude staging/seed rows that exist in D1 but never fired production GA4
  // (so they don't manufacture a false D1>GA4 divergence). PRECISE matching only -
  // a bare '%test%' substring would wrongly drop real leads (Preston, Chester,
  // "Testa Corp", contest@..., etc.), so we anchor on the example.* test domains
  // and the literal 'codex' marker (which no real customer name/email contains).
  return [
    `lower(coalesce(email,'')) NOT LIKE '%@example.com'`,
    `lower(coalesce(email,'')) NOT LIKE '%@example.org'`,
    `lower(coalesce(email,'')) NOT LIKE '%@example.net'`,
    `lower(coalesce(email,'')) NOT LIKE '%codex%'`,
    `lower(coalesce(first_name,'')) NOT LIKE '%codex%'`,
    `lower(coalesce(last_name,'')) NOT LIKE '%codex%'`,
  ].join(' AND ');
}

async function pullD1(startDate, endExclusive) {
  // Single line so it embeds cleanly in the shell command string (no double quotes inside).
  const sql = `SELECT form_type, COUNT(*) AS n FROM submissions WHERE deleted=0 AND created_at >= '${startDate}' AND created_at < '${endExclusive}' AND ${d1TestExclusion()} GROUP BY form_type`;
  const parsed = await runJsonShell(
    `npx wrangler d1 execute ${D1_DATABASE} --remote --json --command "${sql}"`,
    { cwd: workerDir },
  );
  // Fail LOUD on an unexpected envelope - never silently treat a degraded D1
  // response as "0 leads", which would suppress the CRITICAL "GA4 silent" alert.
  const first = Array.isArray(parsed) ? parsed[0] : parsed;
  if (!first || first.success !== true || !Array.isArray(first.results)) {
    throw new Error(`D1 query did not return success=true with a results array - refusing to report zeros. Raw: ${JSON.stringify(parsed).slice(0, 300)}`);
  }
  const results = first.results;
  const byType = {};
  for (const row of results) byType[row.form_type || '(none)'] = Number(row.n || 0);
  return byType;
}

// --- GA4: generate_lead eventCount by customEvent:lead_form ---
async function pullGA4(startDate, endDate) {
  const parsed = await runJson(nodeBin, [
    path.join(repoRoot, 'ga4-check.mjs'), 'report',
    '--dimensions', 'customEvent:lead_form',
    '--metrics', 'eventCount',
    '--filter', 'eventName=generate_lead',
    '--start', startDate, '--end', endDate, '--json',
  ]);
  const byForm = {};
  for (const row of parsed.rows || []) {
    byForm[row['customEvent:lead_form'] || '(not set)'] = Number(row.eventCount || 0);
  }
  return byForm;
}

// --- Ads: conversions by conversion_action_name over the window ---
async function pullAds(startDate, endDate) {
  const sql = `SELECT segments.conversion_action_name, metrics.conversions, metrics.all_conversions
    FROM campaign
    WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
      AND metrics.all_conversions > 0`;
  const rows = await runJson(nodeBin, [
    path.join(repoRoot, 'google-ads-check.mjs'), 'query',
    '--customer-id', ADS_CUSTOMER_ID, '--sql', sql, '--json',
  ]);
  const byAction = {};
  for (const row of rows || []) {
    const name = row.segments?.conversionActionName || '(unknown)';
    byAction[name] = (byAction[name] || 0) + Number(row.metrics?.conversions || 0);
  }
  return byAction;
}

function sumMatching(byAction, patterns) {
  let total = 0;
  for (const [name, value] of Object.entries(byAction)) {
    if (patterns.some((re) => re.test(name))) total += value;
  }
  return total;
}

function reconcile(d1, ga4, ads, opts) {
  const tol = Number(opts.undercountTolerance ?? 0.30);
  const minAbs = Number(opts.minAbs ?? 2);
  const alerts = [];
  const perType = [];

  let d1FormTotal = 0;
  let ga4FormTotal = 0;

  for (const ft of FORM_TYPES) {
    const nD1 = d1[ft.d1] || 0;
    const nGA4 = ga4[ft.ga4LeadForm] || 0;
    d1FormTotal += nD1;
    ga4FormTotal += nGA4;
    const row = { formType: ft.key, d1: nD1, ga4: nGA4 };

    // D1 has real leads but GA4 is silent -> generate_lead stopped firing.
    // Even ONE dropped lead matters on low-traffic forms, so a single lead warns;
    // >= minAbs escalates to CRITICAL (a sustained, unambiguous break).
    if (nD1 >= 1 && nGA4 === 0) {
      const level = nD1 >= minAbs ? 'CRITICAL' : 'WARN';
      const msg = `${level} [${ft.key}]: D1 has ${nD1} form lead(s) but GA4 generate_lead=0 - the site's generate_lead may have stopped firing (check BaseLayout.astro dolphinTrackLead + the form success handler).`;
      alerts.push({ level, formType: ft.key, message: msg });
      row.flag = `${level}: GA4 silent`;
    } else if (nGA4 > nD1 && (nGA4 - nD1) >= minAbs && (nGA4 - nD1) / Math.max(nGA4, 1) > tol) {
      // GA4 materially exceeds D1: phantom client-side fires OR a D1 write failing.
      const msg = `WARN [${ft.key}]: GA4 generate_lead=${nGA4} exceeds D1=${nD1} by ${nGA4 - nD1}. Either client-side generate_lead is firing without a stored submission (phantom), or the D1 write is failing for this form. Investigate the ${ft.key} path.`;
      alerts.push({ level: 'WARN', formType: ft.key, message: msg });
      row.flag = 'WARN: GA4 > D1';
    } else if (nD1 > nGA4 && (nD1 - nGA4) >= minAbs && (nD1 - nGA4) / Math.max(nD1, 1) > tol) {
      // D1 much larger than GA4 beyond the normal undercount band.
      const msg = `WARN [${ft.key}]: D1=${nD1} exceeds GA4 generate_lead=${nGA4} by ${nD1 - nGA4} (> ${Math.round(tol * 100)}% undercount band). generate_lead may not be firing on every ${ft.key} submit.`;
      alerts.push({ level: 'WARN', formType: ft.key, message: msg });
      row.flag = 'WARN: D1 > GA4';
    } else {
      row.flag = 'ok';
    }
    perType.push(row);
  }

  // Self-defending coverage check: any D1 form_type or GA4 lead_form with leads that
  // isn't in FORM_TYPES means a new form shipped without being added here -> it would go
  // unmonitored. Flag it. (This is the gap that hid the disc-glossary + parts mapping.)
  const knownD1 = new Set(FORM_TYPES.map((f) => f.d1));
  const knownGA4 = new Set(FORM_TYPES.map((f) => f.ga4LeadForm));
  for (const [k, v] of Object.entries(d1)) {
    if (v > 0 && !knownD1.has(k)) alerts.push({ level: 'WARN', formType: k, message: `WARN [coverage]: D1 has ${v} lead(s) with form_type='${k}' which is not mapped in reconcile-leads.mjs FORM_TYPES - this form is unmonitored. Add it.` });
  }
  for (const [k, v] of Object.entries(ga4)) {
    if (v > 0 && !knownGA4.has(k)) alerts.push({ level: 'WARN', formType: k, message: `WARN [coverage]: GA4 has ${v} generate_lead event(s) with lead_form='${k}' which is not mapped in reconcile-leads.mjs FORM_TYPES - this form is unmonitored. Add it.` });
  }

  // Ads vs GA4 (aggregate form leads). Ads should never exceed GA4 form leads.
  const adsForm = sumMatching(ads, ADS_FORM_LEAD_ACTIONS);
  const adsPhone = sumMatching(ads, ADS_PHONE_LEAD_ACTIONS);
  if (adsForm > ga4FormTotal && (adsForm - ga4FormTotal) >= minAbs) {
    const msg = `WARN [ads]: Ads form-lead conversions=${adsForm} exceed GA4 generate_lead total=${ga4FormTotal}. Ads should count a subset of GA4 leads - a surplus suggests page-view/codeless actions counting again (e.g. dead action 6997640059).`;
    alerts.push({ level: 'WARN', formType: 'ads', message: msg });
  }

  return {
    perType,
    totals: { d1Forms: d1FormTotal, ga4Forms: ga4FormTotal, adsFormConversions: adsForm, adsPhoneConversions: adsPhone },
    alerts,
  };
}

function pad(s, n) { s = String(s); return s + ' '.repeat(Math.max(0, n - s.length)); }

function printText(report, ctx) {
  const { window, d1, ga4, ads } = ctx;
  console.log(`Dolphin lead reconciliation | ${window.start}..${window.end}`);
  console.log(`(D1 windowed in UTC; GA4/Ads in their account reporting timezone - edge-day counts can differ slightly)\n`);

  console.log('Form leads by type (D1 = source of truth):');
  console.log(`  ${pad('form', 16)}${pad('D1', 6)}${pad('GA4', 6)}status`);
  for (const r of report.perType) {
    console.log(`  ${pad(r.formType, 16)}${pad(r.d1, 6)}${pad(r.ga4, 6)}${r.flag}`);
  }
  console.log(`  ${pad('TOTAL', 16)}${pad(report.totals.d1Forms, 6)}${pad(report.totals.ga4Forms, 6)}`);

  console.log('\nGoogle Ads conversions (window):');
  const adsEntries = Object.entries(ads);
  if (!adsEntries.length) {
    console.log('  (none yet - generate_lead + Calls-from-ads only accrue after the 2026-06-18/19 fixes)');
  } else {
    for (const [name, v] of adsEntries) console.log(`  ${pad(name, 38)}${v}`);
  }
  console.log(`  -> form-lead actions: ${report.totals.adsFormConversions} | phone actions: ${report.totals.adsPhoneConversions}`);
  console.log('  (phone = Ads "Calls from ads"; full phone-lead truth arrives with the Talkroute feed)');

  console.log('\nAlerts:');
  if (!report.alerts.length) {
    console.log('  none - all systems reconcile within tolerance.');
  } else {
    for (const a of report.alerts) console.log(`  - ${a.message}`);
  }

  const crit = report.alerts.filter((a) => a.level === 'CRITICAL').length;
  const warn = report.alerts.filter((a) => a.level === 'WARN').length;
  console.log(`\nVerdict: ${crit ? 'CRITICAL' : warn ? 'WARN' : 'OK'} (${crit} critical, ${warn} warn).`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log('node reconcile-leads.mjs [--start YYYY-MM-DD] [--end YYYY-MM-DD] [--days N] [--json] [--undercount-tolerance 0.30] [--min-abs 2]');
    return;
  }

  const days = Number(args.days || 14);
  const start = args.start || isoDaysAgo(days);
  const end = args.end || isoToday();
  const endExclusive = nextDay(end); // include the full end day for D1's timestamped rows

  if (!existsSync(path.join(repoRoot, 'ga4-check.mjs'))) throw new Error('ga4-check.mjs not found beside this script.');

  const [d1, ga4, ads] = await Promise.all([
    pullD1(start, endExclusive),
    pullGA4(start, end),
    pullAds(start, end),
  ]);

  const report = reconcile(d1, ga4, ads, {
    undercountTolerance: args['undercount-tolerance'],
    minAbs: args['min-abs'],
  });

  const ctx = { window: { start, end }, d1, ga4, ads };

  if (args.json) {
    console.log(JSON.stringify({ window: ctx.window, sources: { d1, ga4, ads }, ...report }, null, 2));
  } else {
    printText(report, ctx);
  }

  const hasCritical = report.alerts.some((a) => a.level === 'CRITICAL');
  const hasWarn = report.alerts.some((a) => a.level === 'WARN');
  process.exit(hasCritical ? 2 : hasWarn ? 1 : 0);
}

main().catch((error) => { console.error(error.message); process.exit(3); });
