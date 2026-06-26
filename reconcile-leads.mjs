#!/usr/bin/env node

// Local diagnostic wrapper for the Dolphin lead reconciliation monitor.
//
// The comparison rules live in lead-reconciliation-core.mjs so the same logic is used by:
//   - this local read-only checker
//   - the Cloudflare Worker daily cloud monitor
//
// Read-only sources:
//   - D1 via wrangler d1 execute
//   - GA4 via ga4-check.mjs
//   - Google Ads via google-ads-check.mjs
//
// Usage:
//   node reconcile-leads.mjs [--start YYYY-MM-DD] [--end YYYY-MM-DD] [--days N] [--json]
//                            [--complete-days] [--end-offset-days N]
//                            [--undercount-tolerance 0.30] [--min-abs 2]

import { execFile, exec } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DEFAULT_ADS_CUSTOMER_ID,
  D1_TEST_EXCLUSION_SQL,
  buildLeadMonitorWindow,
  formatLeadReconciliationText,
  leadReconciliationVerdict,
  nextDay,
  reconcileLeadSources,
} from './lead-reconciliation-core.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = __dirname;
const workerDir = path.join(repoRoot, 'workers', 'contact-form');

const D1_DATABASE = 'dolphin-submissions';
const ADS_CUSTOMER_ID = process.env.GOOGLE_ADS_CUSTOMER_ID || DEFAULT_ADS_CUSTOMER_ID;
const nodeBin = process.execPath;

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

function firstJsonOffset(text) {
  const firstArr = text.indexOf('[');
  const firstObj = text.indexOf('{');
  return [firstArr, firstObj].filter((n) => n >= 0).sort((a, b) => a - b)[0];
}

function runJson(command, cmdArgs, opts = {}) {
  return new Promise((resolve, reject) => {
    execFile(command, cmdArgs, { cwd: opts.cwd || repoRoot, maxBuffer: 32 * 1024 * 1024, windowsHide: true, shell: false }, (err, stdout, stderr) => {
      const out = String(stdout || '');
      const start = firstJsonOffset(out);
      if (start === undefined) {
        reject(new Error(`No JSON in output of \`${command} ${cmdArgs.join(' ')}\`.\nstdout: ${out.slice(0, 400)}\nstderr: ${String(stderr || '').slice(0, 400)}`));
        return;
      }
      try {
        resolve(JSON.parse(out.slice(start)));
      } catch (parseErr) {
        if (err) { reject(new Error(`${command} failed: ${String(stderr || out).slice(0, 600)}`)); return; }
        reject(new Error(`Could not parse JSON from \`${command}\`: ${parseErr.message}\n${out.slice(0, 400)}`));
      }
    });
  });
}

function runJsonShell(commandString, opts = {}) {
  return new Promise((resolve, reject) => {
    exec(commandString, { cwd: opts.cwd || repoRoot, maxBuffer: 32 * 1024 * 1024, windowsHide: true }, (err, stdout, stderr) => {
      const out = String(stdout || '');
      const start = firstJsonOffset(out);
      if (start === undefined) {
        reject(new Error(`No JSON in output of \`${commandString}\`.\nstdout: ${out.slice(0, 400)}\nstderr: ${String(stderr || '').slice(0, 600)}`));
        return;
      }
      try {
        resolve(JSON.parse(out.slice(start)));
      } catch (parseErr) {
        if (err) { reject(new Error(`Command failed: ${String(stderr || out).slice(0, 600)}`)); return; }
        reject(new Error(`Could not parse JSON: ${parseErr.message}\n${out.slice(0, 400)}`));
      }
    });
  });
}

async function pullD1(startDate, endExclusive) {
  const sql = `SELECT form_type, COUNT(*) AS n FROM submissions WHERE deleted=0 AND created_at >= '${startDate}' AND created_at < '${endExclusive}' AND ${D1_TEST_EXCLUSION_SQL} GROUP BY form_type`;
  const parsed = await runJsonShell(
    `npx wrangler d1 execute ${D1_DATABASE} --remote --json --command "${sql}"`,
    { cwd: workerDir },
  );

  const first = Array.isArray(parsed) ? parsed[0] : parsed;
  if (!first || first.success !== true || !Array.isArray(first.results)) {
    throw new Error(`D1 query did not return success=true with a results array - refusing to report zeros. Raw: ${JSON.stringify(parsed).slice(0, 300)}`);
  }

  const byType = {};
  for (const row of first.results) byType[row.form_type || '(none)'] = Number(row.n || 0);
  return byType;
}

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

function usage() {
  console.log('node reconcile-leads.mjs [--start YYYY-MM-DD] [--end YYYY-MM-DD] [--days N] [--json] [--complete-days] [--end-offset-days N] [--undercount-tolerance 0.30] [--min-abs 2]');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) { usage(); return; }

  if (!existsSync(path.join(repoRoot, 'ga4-check.mjs'))) throw new Error('ga4-check.mjs not found beside this script.');
  if (!existsSync(path.join(repoRoot, 'google-ads-check.mjs'))) throw new Error('google-ads-check.mjs not found beside this script.');

  const window = buildLeadMonitorWindow({
    days: args.days || 14,
    start: args.start,
    end: args.end,
    endOffsetDays: args['end-offset-days'] ?? (args['complete-days'] ? 1 : 0),
  });
  const endExclusive = args.end ? nextDay(window.end) : window.endExclusive;

  const [d1, ga4, ads] = await Promise.all([
    pullD1(window.start, endExclusive),
    pullGA4(window.start, window.end),
    pullAds(window.start, window.end),
  ]);

  const report = reconcileLeadSources(d1, ga4, ads, {
    undercountTolerance: args['undercount-tolerance'],
    minAbs: args['min-abs'],
  });
  const ctx = { window: { start: window.start, end: window.end }, d1, ga4, ads };

  if (args.json) {
    console.log(JSON.stringify({ window: ctx.window, sources: { d1, ga4, ads }, ...report }, null, 2));
  } else {
    console.log(formatLeadReconciliationText(report, ctx));
  }

  const verdict = leadReconciliationVerdict(report);
  process.exit(verdict.critical ? 2 : verdict.warn ? 1 : 0);
}

main().catch((error) => { console.error(error.message); process.exit(3); });
