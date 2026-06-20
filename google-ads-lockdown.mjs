#!/usr/bin/env node

/*
 * Google Ads LOCKDOWN helper (WRITE-capable, gated).
 *
 * Companion to the read-only `google-ads-check.mjs`. This script performs
 * MUTATIONS, so every command:
 *   1. Snapshots current state to <workdir>/snapshots/ before changing anything.
 *   2. Writes the proposed mutation to <workdir>/proposed_mutations/.
 *   3. Prints a plain-English dry-run of what will change.
 *   4. Does NOTHING live unless you pass --confirm.
 *   5. On --confirm, writes a before/after record to <workdir>/change_logs/.
 *
 * It reuses the SAME OAuth token + developer-token config as the read-only
 * helper (stored outside the repo in %APPDATA%\gcloud\). Read-only by default;
 * --confirm is the single gate that turns a dry-run into a live write.
 *
 * Usage:
 *   node google-ads-lockdown.mjs set-budget --budget-id ID --dollars 50 [--confirm]
 *   node google-ads-lockdown.mjs dismiss-recs --resource-names rn1,rn2 [--confirm]
 *   node google-ads-lockdown.mjs add-negatives --campaign-id ID --file negs.txt [--match BROAD|PHRASE] [--confirm]
 *
 * Guardrails baked in: never deletes; budget command refuses to RAISE a budget
 * unless --allow-increase is passed; everything is reversible.
 */

import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const apiVersion = 'v24';
const appDataDir = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
const gcloudDir = path.join(appDataDir, 'gcloud');
const defaultClientPath = path.join(gcloudDir, 'dolphin-ga4-gtm-readonly-codex-oauth-client.json');
const defaultTokenPath = path.join(gcloudDir, 'dolphin-google-ads-token.json');
const defaultConfigPath = path.join(gcloudDir, 'dolphin-google-ads-config.json');
const defaultLoginCustomerId = '6124315358';
const defaultCustomerId = '3917484159';

function pad(n) { return String(n).padStart(2, '0'); }
function stamp() {
  const d = new Date();
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}
function today() {
  const d = new Date();
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
}

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

async function readJson(filePath) {
  const text = await fs.readFile(filePath, 'utf8');
  return JSON.parse(text.replace(/^﻿/, ''));
}
async function writeJson(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
}

async function readClient(clientPath) {
  if (!existsSync(clientPath)) throw new Error(`OAuth client file not found: ${clientPath}`);
  const raw = await readJson(clientPath);
  const client = raw.installed || raw.web;
  if (!client?.client_id || !client?.client_secret) throw new Error(`OAuth client missing client_id/client_secret: ${clientPath}`);
  return { clientId: client.client_id, clientSecret: client.client_secret, tokenUri: client.token_uri || 'https://oauth2.googleapis.com/token' };
}

async function refreshAccessToken(tokenPath = defaultTokenPath, clientPath = defaultClientPath) {
  if (!existsSync(tokenPath)) throw new Error(`Google Ads OAuth token not found. Run: node google-ads-check.mjs auth`);
  const token = await readJson(tokenPath);
  const client = await readClient(clientPath);
  const body = new URLSearchParams({
    client_id: client.clientId, client_secret: client.clientSecret,
    refresh_token: token.refresh_token, grant_type: 'refresh_token'
  });
  const res = await fetch(token.token_uri || client.tokenUri, {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Token refresh failed: ${JSON.stringify(json)}`);
  return json.access_token;
}

async function readConfig(configPath = defaultConfigPath) {
  if (!existsSync(configPath)) throw new Error(`Google Ads config not found: ${configPath}`);
  const config = await readJson(configPath);
  if (!config.developer_token) throw new Error(`Google Ads config missing developer_token: ${configPath}`);
  return config;
}

function normalizeId(v) { return String(v || '').replace(/\D/g, ''); }

async function adsFetch(args, url, options = {}) {
  const config = await readConfig(args.config || defaultConfigPath);
  const accessToken = await refreshAccessToken(args.token || defaultTokenPath, args.client || defaultClientPath);
  const loginCustomerId = normalizeId(args['login-customer-id'] || config.login_customer_id || defaultLoginCustomerId);
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'developer-token': config.developer_token,
    'Content-Type': 'application/json',
    ...(loginCustomerId ? { 'login-customer-id': loginCustomerId } : {}),
    ...(options.headers || {})
  };
  const res = await fetch(url, { ...options, headers });
  const text = await res.text();
  let body;
  try { body = text ? JSON.parse(text) : {}; } catch { body = { raw: text }; }
  if (!res.ok) {
    const requestId = res.headers.get('request-id') || '';
    throw new Error(`Google Ads API ${res.status}${requestId ? ` request-id ${requestId}` : ''}: ${JSON.stringify(body).slice(0, 1800)}`);
  }
  return body;
}

async function searchStream(args, customerId, query) {
  const body = await adsFetch(args, `https://googleads.googleapis.com/${apiVersion}/customers/${normalizeId(customerId)}/googleAds:searchStream`, {
    method: 'POST', body: JSON.stringify({ query })
  });
  return body.flatMap((chunk) => chunk.results || []);
}

function workdir(args) {
  return args.workdir || path.join('D:', 'Business Docs', `GoogleAds_Audit_${today()}`);
}
async function snapshot(args, name, data) {
  const p = path.join(workdir(args), 'snapshots', `${name}_${stamp()}.json`);
  await writeJson(p, data);
  return p;
}
async function proposed(args, name, data) {
  const p = path.join(workdir(args), 'proposed_mutations', `${name}_${stamp()}.json`);
  await writeJson(p, data);
  return p;
}
async function changeLog(args, name, data) {
  const p = path.join(workdir(args), 'change_logs', `${name}_${stamp()}.json`);
  await writeJson(p, { ...data, recorded_utc: new Date().toISOString() });
  return p;
}

function money(micros) { return Number(micros || 0) / 1e6; }

/* ---- set-budget ---- */
async function setBudget(args) {
  const customerId = normalizeId(args['customer-id'] || defaultCustomerId);
  const budgetId = normalizeId(args['budget-id']);
  if (!budgetId) throw new Error('Missing --budget-id');
  if (args.dollars === undefined) throw new Error('Missing --dollars (new daily budget in dollars)');
  const newMicros = Math.round(Number(args.dollars) * 1e6);

  const rows = await searchStream(args, customerId, `
    SELECT campaign_budget.id, campaign_budget.name, campaign_budget.amount_micros, campaign_budget.resource_name
    FROM campaign_budget WHERE campaign_budget.id = ${budgetId}`);
  if (!rows.length) throw new Error(`Budget ${budgetId} not found on customer ${customerId}`);
  const before = rows[0].campaignBudget;
  const beforeMicros = Number(before.amountMicros || 0);

  if (newMicros > beforeMicros && !args['allow-increase']) {
    throw new Error(`Refusing to RAISE budget from $${money(beforeMicros)} to $${money(newMicros)}/day. Pass --allow-increase if intended.`);
  }

  const operation = {
    operations: [{ updateMask: 'amount_micros', update: { resourceName: before.resourceName, amountMicros: String(newMicros) } }]
  };
  await snapshot(args, `budget_${budgetId}_before`, before);
  await proposed(args, `set_budget_${budgetId}`, operation);

  console.log('DRY-RUN: set-budget');
  console.log(`  Budget: ${before.name || budgetId} (id ${budgetId})`);
  console.log(`  Daily: $${money(beforeMicros).toFixed(2)} -> $${money(newMicros).toFixed(2)}  (monthly cap ~ $${(money(newMicros) * 30.4).toFixed(0)})`);
  if (!args.confirm) { console.log('  No live change. Re-run with --confirm to execute.'); return; }

  const result = await adsFetch(args, `https://googleads.googleapis.com/${apiVersion}/customers/${customerId}/campaignBudgets:mutate`, {
    method: 'POST', body: JSON.stringify(operation)
  });
  await changeLog(args, `set_budget_${budgetId}`, { action: 'set-budget', budgetId, beforeMicros, afterMicros: newMicros, result });
  console.log('LIVE: budget updated.');
  console.log(JSON.stringify(result, null, 2));
}

/* ---- dismiss-recs ---- */
async function dismissRecs(args) {
  const customerId = normalizeId(args['customer-id'] || defaultCustomerId);
  const names = String(args['resource-names'] || '').split(',').map((s) => s.trim()).filter(Boolean);
  if (!names.length) throw new Error('Missing --resource-names rn1,rn2');

  const current = await searchStream(args, customerId, `SELECT recommendation.resource_name, recommendation.type FROM recommendation`);
  const wanted = current.filter((r) => names.includes(r.recommendation.resourceName));
  await snapshot(args, 'recommendations_before', current.map((r) => r.recommendation));

  // The dismiss endpoint rejects mixed recommendation types in one batch, so dismiss one at a time.
  await proposed(args, 'dismiss_recs', { resourceNames: names });

  console.log('DRY-RUN: dismiss-recs');
  for (const rn of names) {
    const match = wanted.find((r) => r.recommendation.resourceName === rn);
    console.log(`  ${match ? match.recommendation.type : '(NOT currently pending - may already be gone)'} | ${rn}`);
  }
  if (!args.confirm) { console.log('  No live change. Re-run with --confirm to execute.'); return; }

  const results = [];
  for (const rn of names) {
    try {
      const result = await adsFetch(args, `https://googleads.googleapis.com/${apiVersion}/customers/${customerId}/recommendations:dismiss`, {
        method: 'POST', body: JSON.stringify({ operations: [{ resourceName: rn }] })
      });
      results.push({ resourceName: rn, status: 'dismissed', result });
      console.log(`  dismissed: ${rn}`);
    } catch (e) {
      if (/ALREADY_DISMISSED/.test(e.message)) {
        results.push({ resourceName: rn, status: 'already-dismissed' });
        console.log(`  already dismissed (skipped): ${rn}`);
      } else {
        results.push({ resourceName: rn, status: 'error', error: e.message });
        console.log(`  ERROR (skipped): ${rn} -> ${e.message}`);
      }
    }
  }
  await changeLog(args, 'dismiss_recs', { action: 'dismiss-recs', names, results });
  console.log('LIVE: dismiss pass complete.');
}

/* ---- add-negatives ---- */
async function addNegatives(args) {
  const customerId = normalizeId(args['customer-id'] || defaultCustomerId);
  const campaignId = normalizeId(args['campaign-id']);
  if (!campaignId) throw new Error('Missing --campaign-id');
  const match = String(args.match || 'PHRASE').toUpperCase();
  if (!['BROAD', 'PHRASE', 'EXACT'].includes(match)) throw new Error('--match must be BROAD, PHRASE, or EXACT');
  if (!args.file) throw new Error('Missing --file (one negative keyword per line)');

  const raw = await fs.readFile(args.file, 'utf8');
  const terms = [...new Set(raw.split(/\r?\n/).map((s) => s.trim().toLowerCase()).filter((s) => s && !s.startsWith('#')))];
  if (!terms.length) throw new Error('No keywords found in file');

  // Snapshot existing negatives so we can dedup and roll back.
  const existing = await searchStream(args, customerId, `
    SELECT campaign_criterion.keyword.text, campaign_criterion.keyword.match_type
    FROM campaign_criterion
    WHERE campaign.id = ${campaignId} AND campaign_criterion.type = 'KEYWORD'
      AND campaign_criterion.negative = TRUE AND campaign_criterion.status != 'REMOVED'`);
  const existingSet = new Set(existing.map((r) => `${(r.campaignCriterion?.keyword?.text || '').toLowerCase()}|${r.campaignCriterion?.keyword?.matchType}`));
  const toAdd = terms.filter((t) => !existingSet.has(`${t}|${match}`));
  const skipped = terms.filter((t) => existingSet.has(`${t}|${match}`));

  await snapshot(args, `campaign_${campaignId}_negatives_before`, existing.map((r) => r.campaignCriterion));

  const operation = {
    operations: toAdd.map((text) => ({
      create: { campaign: `customers/${customerId}/campaigns/${campaignId}`, negative: true, keyword: { text, matchType: match } }
    }))
  };
  await proposed(args, `add_negatives_${campaignId}`, operation);

  console.log('DRY-RUN: add-negatives');
  console.log(`  Campaign id ${campaignId} | match ${match}`);
  console.log(`  Existing negatives: ${existing.length} | in file: ${terms.length} | NEW to add: ${toAdd.length} | already present (skipped): ${skipped.length}`);
  console.log(`  New terms: ${toAdd.map((t) => `"${t}"`).join(', ') || '(none)'}`);
  if (!toAdd.length) { console.log('  Nothing new to add.'); return; }
  if (!args.confirm) { console.log('  No live change. Re-run with --confirm to execute.'); return; }

  const result = await adsFetch(args, `https://googleads.googleapis.com/${apiVersion}/customers/${customerId}/campaignCriteria:mutate`, {
    method: 'POST', body: JSON.stringify(operation)
  });
  await changeLog(args, `add_negatives_${campaignId}`, { action: 'add-negatives', campaignId, match, added: toAdd, skipped, result });
  console.log(`LIVE: added ${toAdd.length} negative keywords.`);
}

function usage() {
  console.log(`Google Ads LOCKDOWN helper (gated writes). Dry-run unless --confirm.

  node google-ads-lockdown.mjs set-budget --budget-id ID --dollars 50 [--confirm]
  node google-ads-lockdown.mjs dismiss-recs --resource-names rn1,rn2 [--confirm]
  node google-ads-lockdown.mjs add-negatives --campaign-id ID --file negs.txt [--match PHRASE] [--confirm]

  Defaults: customer ${defaultCustomerId}, login-customer ${defaultLoginCustomerId}.
  Artifacts -> D:\\Business Docs\\GoogleAds_Audit_<YYYYMMDD>\\{snapshots,proposed_mutations,change_logs}.`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const command = args._[0] || 'help';
  if (args.help || command === 'help') return usage();
  if (command === 'set-budget') return setBudget(args);
  if (command === 'dismiss-recs') return dismissRecs(args);
  if (command === 'add-negatives') return addNegatives(args);
  throw new Error(`Unknown command: ${command}`);
}

main().catch((error) => { console.error(error.message); process.exit(1); });
