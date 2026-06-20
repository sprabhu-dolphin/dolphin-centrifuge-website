#!/usr/bin/env node

// GA4 Data API read-only helper (mirrors gsc-check.mjs / google-ads-check.mjs).
// Tokens are stored outside the repo under %APPDATA%/gcloud. Read-only reporting only.

import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const appDataDir = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
const gcloudDir = path.join(appDataDir, 'gcloud');
const defaultClientPath = path.join(gcloudDir, 'dolphin-ga4-gtm-readonly-codex-oauth-client.json');
const defaultTokenPath = path.join(gcloudDir, 'dolphin-ga4-gtm-readonly-token.json');
const defaultProperty = '536974508'; // Dolphin Centrifuge - Astro Website - 2026 (G-9DCDDZTT9N)

function usage() {
  console.log(`GA4 Data API read-only helper

Usage:
  node ga4-check.mjs report --dimensions "d1,d2" --metrics "m1,m2" [--start YYYY-MM-DD] [--end YYYY-MM-DD] [--limit N] [--order METRIC] [--filter "dim=value"] [--property ID] [--json]
  node ga4-check.mjs metadata [--property ID] [--json]

Notes:
  - Property defaults to ${defaultProperty}.
  - Token: ${defaultTokenPath} (scope analytics.readonly).
  - --filter does an exact string match on a dimension, e.g. --filter "sessionMedium=cpc".
  - Common paid dims: sessionGoogleAdsKeyword, sessionGoogleAdsQuery, sessionCampaignName,
    sessionSource, sessionMedium, sessionDefaultChannelGroup, landingPagePlusQueryString.
  - Common metrics: sessions, totalUsers, engagedSessions, averageSessionDuration,
    userEngagementDuration, bounceRate, keyEvents, eventCount, conversions.`);
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

async function readClient(clientPath) {
  if (!existsSync(clientPath)) throw new Error(`OAuth client file not found: ${clientPath}`);
  const raw = await readJson(clientPath);
  const client = raw.installed || raw.web;
  if (!client?.client_id || !client?.client_secret) {
    throw new Error(`OAuth client file missing client_id/client_secret: ${clientPath}`);
  }
  return {
    clientId: client.client_id,
    clientSecret: client.client_secret,
    tokenUri: client.token_uri || 'https://oauth2.googleapis.com/token',
  };
}

async function getAccessToken(args) {
  const tokenPath = args.token || defaultTokenPath;
  const clientPath = args.client || defaultClientPath;
  if (!existsSync(tokenPath)) throw new Error(`GA4 token not found: ${tokenPath}`);
  const token = await readJson(tokenPath);
  const client = await readClient(clientPath);
  if (!token.refresh_token) throw new Error('GA4 token has no refresh_token.');
  const body = new URLSearchParams({
    client_id: client.clientId,
    client_secret: client.clientSecret,
    refresh_token: token.refresh_token,
    grant_type: 'refresh_token',
  });
  const res = await fetch(token.token_uri || client.tokenUri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`GA4 token refresh failed: ${JSON.stringify(json)}`);
  return json.access_token;
}

function isoDaysAgo(days) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

async function ga4Fetch(args, suffix, payload) {
  const property = args.property || defaultProperty;
  const accessToken = await getAccessToken(args);
  const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${property}:${suffix}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload || {}),
  });
  const text = await res.text();
  let parsed;
  try { parsed = text ? JSON.parse(text) : {}; } catch { parsed = { raw: text }; }
  if (!res.ok) throw new Error(`GA4 API ${res.status}: ${JSON.stringify(parsed).slice(0, 1500)}`);
  return parsed;
}

async function metadata(args) {
  const property = args.property || defaultProperty;
  const accessToken = await getAccessToken(args);
  const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${property}/metadata`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`GA4 metadata ${res.status}: ${JSON.stringify(json).slice(0, 1200)}`);
  if (args.json) { console.log(JSON.stringify(json, null, 2)); return; }
  console.log('Dimensions:', (json.dimensions || []).map((d) => d.apiName).join(', '));
  console.log('Metrics:', (json.metrics || []).map((m) => m.apiName).join(', '));
}

async function report(args) {
  const dimensions = String(args.dimensions || '').split(',').map((s) => s.trim()).filter(Boolean);
  const metrics = String(args.metrics || '').split(',').map((s) => s.trim()).filter(Boolean);
  if (!metrics.length) throw new Error('Provide --metrics "m1,m2"');
  const startDate = args.start || isoDaysAgo(30);
  const endDate = args.end || isoDaysAgo(0);
  const limit = Number(args.limit || 50);

  const payload = {
    dateRanges: [{ startDate, endDate }],
    dimensions: dimensions.map((name) => ({ name })),
    metrics: metrics.map((name) => ({ name })),
    limit,
  };

  if (args.order) {
    payload.orderBys = [{ desc: true, metric: { metricName: args.order } }];
  } else if (metrics.length) {
    payload.orderBys = [{ desc: true, metric: { metricName: metrics[0] } }];
  }

  if (args.filter) {
    const eq = String(args.filter).indexOf('=');
    if (eq !== -1) {
      const fieldName = String(args.filter).slice(0, eq).trim();
      const value = String(args.filter).slice(eq + 1).trim();
      payload.dimensionFilter = {
        filter: { fieldName, stringFilter: { matchType: 'EXACT', value, caseSensitive: false } },
      };
    }
  }

  const body = await ga4Fetch(args, 'runReport', payload);
  const dimHeaders = (body.dimensionHeaders || []).map((h) => h.name);
  const metHeaders = (body.metricHeaders || []).map((h) => h.name);
  const rows = (body.rows || []).map((row) => {
    const out = {};
    (row.dimensionValues || []).forEach((v, i) => { out[dimHeaders[i]] = v.value; });
    (row.metricValues || []).forEach((v, i) => { out[metHeaders[i]] = v.value; });
    return out;
  });

  if (args.json) {
    console.log(JSON.stringify({ property: args.property || defaultProperty, dateRange: { startDate, endDate }, rowCount: body.rowCount || rows.length, rows }, null, 2));
    return;
  }
  console.log(`GA4 property ${args.property || defaultProperty} | ${startDate}..${endDate} | rows ${rows.length}`);
  console.log([...dimHeaders, ...metHeaders].join(' | '));
  for (const r of rows) console.log([...dimHeaders, ...metHeaders].map((k) => r[k]).join(' | '));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const command = args._[0] || 'help';
  if (args.help || command === 'help') { usage(); return; }
  if (command === 'report') return report(args);
  if (command === 'metadata') return metadata(args);
  throw new Error(`Unknown command: ${command}`);
}

main().catch((error) => { console.error(error.message); process.exit(1); });
