#!/usr/bin/env node

/*
 * Google Ads BLEED SCAN (read-only daily monitor).
 *
 * Purpose: a fast, read-only "is it wasting money" check for the Dolphin Marine
 * ad account. Designed to run once per day, automatically, the first time a Claude
 * session comes online in this repo (wired via a SessionStart hook). It self-guards
 * so it runs at most once per America/New_York day no matter how many sessions start.
 *
 * Modes:
 *   node google-ads-bleed-scan.mjs            # always run, print report
 *   node google-ads-bleed-scan.mjs --if-stale # run only if it has not run today (hook mode)
 *   node google-ads-bleed-scan.mjs --json     # machine-readable
 *
 * It NEVER mutates anything. Always exits 0 (so it can't block a session start),
 * printing any error as a NOTE instead of throwing.
 *
 * Reuses the same OAuth token + developer-token config as google-ads-check.mjs
 * (stored outside the repo in %APPDATA%\gcloud\).
 */

import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const apiVersion = 'v24';
const appDataDir = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
const gcloudDir = path.join(appDataDir, 'gcloud');
const clientPath = path.join(gcloudDir, 'dolphin-ga4-gtm-readonly-codex-oauth-client.json');
const tokenPath = path.join(gcloudDir, 'dolphin-google-ads-token.json');
const configPath = path.join(gcloudDir, 'dolphin-google-ads-config.json');
const customerId = '3917484159';
const loginCustomerId = '6124315358';

const monitorDir = path.join('D:', 'Business Docs', 'GoogleAds_Audit_Monitoring');
const statePath = path.join(monitorDir, 'bleed-scan-state.json');
const rollingLog = path.join(monitorDir, 'bleed-scan-log.csv');

// Tunable thresholds (account daily budget is $50/day).
const DAILY_BUDGET = 50;
const SPIKE_DAY = 100;      // a single day over 2x budget -> WARN
const AVG7_WARN = 60;       // 7-day average over this -> WARN
const ZEROCONV_SPEND_WARN = 200; // 7-day spend with zero conversions over this -> WARN

const args = new Set(process.argv.slice(2));
const asJson = args.has('--json');

function nyDate(d = new Date()) {
  // America/New_York calendar date as YYYY-MM-DD
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}
function daysAgoNy(n) {
  const d = new Date(Date.now() - n * 86400000);
  return nyDate(d);
}
const $ = (m) => Number(m || 0) / 1e6;

async function readJson(p) { return JSON.parse((await fs.readFile(p, 'utf8')).replace(/^﻿/, '')); }

async function refreshAccessToken() {
  const token = await readJson(tokenPath);
  const raw = await readJson(clientPath);
  const client = raw.installed || raw.web;
  const body = new URLSearchParams({
    client_id: client.client_id, client_secret: client.client_secret,
    refresh_token: token.refresh_token, grant_type: 'refresh_token'
  });
  const res = await fetch(token.token_uri || 'https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`token refresh failed: ${JSON.stringify(json)}`);
  return json.access_token;
}

async function searchStream(accessToken, devToken, query) {
  const res = await fetch(`https://googleads.googleapis.com/${apiVersion}/customers/${customerId}/googleAds:searchStream`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`, 'developer-token': devToken,
      'login-customer-id': loginCustomerId, 'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query })
  });
  const text = await res.text();
  const body = text ? JSON.parse(text) : [];
  if (!res.ok) throw new Error(`API ${res.status}: ${JSON.stringify(body).slice(0, 600)}`);
  return body.flatMap((c) => c.results || []);
}

const junkRe = /\b(for sale|used|refurbished|cheap|price|prices|cost|costs|how much|kit|diy|homemade|alibaba|amazon|ebay|lab|laboratory|blood|plasma|medical|microcentrifuge|washing machine|sifter|drilling mud|olive oil|jobs|salary)\b/i;

async function main() {
  await fs.mkdir(monitorDir, { recursive: true });
  const todayNy = nyDate();

  if (args.has('--if-stale') && existsSync(statePath)) {
    try {
      const state = await readJson(statePath);
      if (state.lastRunNyDate === todayNy) {
        if (!asJson) console.log(`[ads-bleed-scan] already ran today (${todayNy}); skipping. Last summary: ${state.lastSummary || 'n/a'}`);
        return;
      }
    } catch { /* fall through and run */ }
  }

  const config = await readJson(configPath);
  const accessToken = await refreshAccessToken();
  const devToken = config.developer_token;

  const start10 = daysAgoNy(10);
  const start7 = daysAgoNy(7);

  const daily = await searchStream(accessToken, devToken,
    `SELECT segments.date, metrics.cost_micros, metrics.clicks, metrics.conversions FROM customer WHERE segments.date BETWEEN '${start10}' AND '${todayNy}' ORDER BY segments.date`);

  const kw = await searchStream(accessToken, devToken,
    `SELECT ad_group_criterion.keyword.text, metrics.cost_micros, metrics.conversions FROM keyword_view WHERE segments.date BETWEEN '${start7}' AND '${todayNy}' AND metrics.cost_micros > 0 ORDER BY metrics.cost_micros DESC LIMIT 100`);

  const terms = await searchStream(accessToken, devToken,
    `SELECT search_term_view.search_term, metrics.cost_micros, metrics.conversions FROM search_term_view WHERE segments.date BETWEEN '${start7}' AND '${todayNy}' AND metrics.cost_micros > 0 ORDER BY metrics.cost_micros DESC LIMIT 200`);

  const dailyRows = daily.map((r) => ({ date: r.segments.date, cost: $(r.metrics.costMicros), clicks: Number(r.metrics.clicks || 0), conv: Number(r.metrics.conversions || 0) }));
  const last7 = dailyRows.slice(-7);
  const spend7 = last7.reduce((s, r) => s + r.cost, 0);
  const conv7 = last7.reduce((s, r) => s + r.conv, 0);
  const avg7 = last7.length ? spend7 / last7.length : 0;
  const spikeDays = dailyRows.slice(-3).filter((r) => r.cost > SPIKE_DAY);

  let junkSpend = 0, termTotal = 0;
  for (const t of terms) { const c = $(t.metrics.costMicros); termTotal += c; if (junkRe.test(t.searchTermView.searchTerm)) junkSpend += c; }

  const topKw = kw.slice(0, 8).map((r) => ({ text: r.adGroupCriterion.keyword.text, cost: $(r.metrics.costMicros), conv: Number(r.metrics.conversions || 0) }));
  const topJunk = terms.filter((t) => junkRe.test(t.searchTermView.searchTerm)).slice(0, 8).map((t) => ({ term: t.searchTermView.searchTerm, cost: $(t.metrics.costMicros) }));

  const warns = [];
  if (spikeDays.length) warns.push(`spend spike: ${spikeDays.map((d) => `${d.date} $${d.cost.toFixed(0)}`).join(', ')} (>2x $${DAILY_BUDGET}/day cap)`);
  if (avg7 > AVG7_WARN) warns.push(`7-day avg $${avg7.toFixed(2)}/day above $${AVG7_WARN}`);
  if (spend7 > ZEROCONV_SPEND_WARN && conv7 === 0) warns.push(`$${spend7.toFixed(2)} spent in 7 days with 0 conversions (note: allow for tracking lag)`);
  if (junkSpend > 0) warns.push(`$${junkSpend.toFixed(2)} on junk/not-a-customer search terms (7d)`);

  const status = warns.length ? 'WARN' : 'OK';
  const summary = `${status} | 7d $${spend7.toFixed(2)} (${conv7.toFixed(1)} conv) | avg $${avg7.toFixed(2)}/day | junk $${junkSpend.toFixed(2)}`;

  // Persist state + rolling log + dated report.
  await fs.writeFile(statePath, `${JSON.stringify({ lastRunNyDate: todayNy, lastSummary: summary, ranUtc: new Date().toISOString() }, null, 2)}\n`);
  if (!existsSync(rollingLog)) await fs.writeFile(rollingLog, 'ny_date,status,spend7,conv7,avg_day,junk7,warns\n');
  await fs.appendFile(rollingLog, `${todayNy},${status},${spend7.toFixed(2)},${conv7.toFixed(1)},${avg7.toFixed(2)},${junkSpend.toFixed(2)},"${warns.join('; ')}"\n`);

  const report = { todayNy, status, summary, dailyRows, spend7, conv7, avg7, junkSpend, termTotal, warns, topKw, topJunk };
  await fs.writeFile(path.join(monitorDir, `bleed-scan_${todayNy}.json`), `${JSON.stringify(report, null, 2)}\n`);

  if (asJson) { console.log(JSON.stringify(report, null, 2)); return; }

  console.log(`===== GOOGLE ADS BLEED SCAN (${todayNy}, America/New_York) =====`);
  console.log(`STATUS: ${status}`);
  console.log(`Last 7 days: $${spend7.toFixed(2)} spend | ${conv7.toFixed(1)} conversions | avg $${avg7.toFixed(2)}/day (cap $${DAILY_BUDGET}/day)`);
  console.log('Daily:');
  for (const r of dailyRows.slice(-7)) console.log(`  ${r.date} | $${r.cost.toFixed(2).padStart(7)} | clicks ${r.clicks} | conv ${r.conv.toFixed(1)}`);
  if (warns.length) { console.log('FLAGS:'); for (const w of warns) console.log(`  ! ${w}`); } else console.log('No flags. Spend within cap, no junk-term spend detected.');
  if (topKw.length) { console.log('Top keyword spend (7d):'); for (const k of topKw) console.log(`  $${k.cost.toFixed(2).padStart(7)} | conv ${k.conv.toFixed(1)} | ${k.text}`); }
  if (topJunk.length) { console.log('Junk terms paid for (7d):'); for (const t of topJunk) console.log(`  $${t.cost.toFixed(2).padStart(7)} | "${t.term}"`); }
  console.log('(read-only; nothing was changed)');
}

main().catch((e) => {
  if (asJson) console.log(JSON.stringify({ status: 'ERROR', error: e.message }));
  else console.log(`[ads-bleed-scan] NOTE: scan could not run: ${e.message}`);
  // never block the session
});
