#!/usr/bin/env node

import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const appDataDir = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
const defaultCredentialsPath = path.join(appDataDir, 'dataforseo', 'credentials.json');
const defaultDomain = 'dolphincentrifuge.com';
const defaultLocationCode = 2840;
const defaultLanguageCode = 'en';
const defaultDepth = 20;
const defaultKeywords = [
  'industrial centrifuge',
  'industrial centrifuges',
  'industrial centrifuge machine',
  'industrial continuous centrifuge',
  'industrial centrifuge suppliers',
  'disc stack centrifuge',
  'disk stack centrifuge',
  'disc stack centrifuge price',
  'disc stack centrifuge manufacturers',
  'alfa laval disc stack centrifuge',
  'difference between purifier and clarifier'
];

function usage() {
  console.log(`DataForSEO helper

Usage:
  node dataforseo-check.mjs status
  node dataforseo-check.mjs serp [--domain DOMAIN] [--keyword "keyword"] [--keywords "a,b,c"] [--keywords-file PATH] [--depth 20] [--location-code 2840] [--language-code en]
  node dataforseo-check.mjs ranked-keywords [--target DOMAIN_OR_URL] [--limit 20] [--location-code 2840] [--language-code en]

Credential resolution:
  1. DATAFORSEO_LOGIN + DATAFORSEO_PASSWORD environment variables
  2. DATAFORSEO_CREDENTIALS_FILE
  3. ${defaultCredentialsPath}

Credential file format:
  { "login": "...", "password": "..." }

Notes:
  - Uses official DataForSEO Basic authentication.
  - This helper is read-only and does not write to BigQuery or any cloud config.
  - The default keyword set is the current Dolphin head-term watchlist.`);
}

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (!item.startsWith('--')) {
      args._.push(item);
      continue;
    }
    const eq = item.indexOf('=');
    if (eq !== -1) {
      args[item.slice(2, eq)] = item.slice(eq + 1);
      continue;
    }
    const key = item.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      args[key] = true;
    } else {
      args[key] = next;
      i += 1;
    }
  }
  return args;
}

async function readJson(filePath) {
  const text = await fs.readFile(filePath, 'utf8');
  return JSON.parse(text.replace(/^\uFEFF/, ''));
}

async function resolveCredentials(args) {
  const envLogin = process.env.DATAFORSEO_LOGIN;
  const envPassword = process.env.DATAFORSEO_PASSWORD;
  if (envLogin && envPassword) {
    return { login: envLogin, password: envPassword, source: 'environment variables' };
  }

  const credentialsPath = args['credentials-file'] || process.env.DATAFORSEO_CREDENTIALS_FILE || defaultCredentialsPath;
  if (existsSync(credentialsPath)) {
    const json = await readJson(credentialsPath);
    if (json?.login && json?.password) {
      return { login: json.login, password: json.password, source: credentialsPath };
    }
  }

  throw new Error(
    `DataForSEO credentials not found. Set DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD, or provide a JSON file at ${credentialsPath}.`
  );
}

function buildAuthHeader(login, password) {
  return `Basic ${Buffer.from(`${login}:${password}`).toString('base64')}`;
}

function asNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeKeywords(args) {
  if (args.keyword) {
    return [String(args.keyword).trim()].filter(Boolean);
  }
  if (args.keywords) {
    return String(args.keywords)
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);
  }
  if (args['keywords-file']) {
    return null;
  }
  return defaultKeywords;
}

async function resolveKeywords(args) {
  const inlineKeywords = normalizeKeywords(args);
  if (inlineKeywords) {
    return inlineKeywords;
  }
  const filePath = path.resolve(String(args['keywords-file']));
  const payload = await readJson(filePath);
  if (!Array.isArray(payload) || payload.some(item => typeof item !== 'string')) {
    throw new Error(`Keywords file must be a JSON array of strings: ${filePath}`);
  }
  return payload.map(item => item.trim()).filter(Boolean);
}

async function apiRequest({ method, endpoint, payload, args }) {
  const credentials = await resolveCredentials(args);
  const response = await fetch(`https://api.dataforseo.com/v3/${endpoint}`, {
    method,
    headers: {
      Authorization: buildAuthHeader(credentials.login, credentials.password),
      'Content-Type': 'application/json'
    },
    body: payload ? JSON.stringify(payload) : undefined
  });

  const json = await response.json();
  const topStatus = Number(json?.status_code);
  if (topStatus && topStatus !== 20000) {
    throw new Error(`${endpoint} failed with status ${topStatus}: ${json?.status_message || 'Unknown error'}`);
  }

  const failedTask = (json?.tasks || []).find(task => Number(task?.status_code) !== 20000);
  if (failedTask) {
    throw new Error(`${endpoint} task failed with status ${failedTask.status_code}: ${failedTask.status_message || 'Unknown error'}`);
  }

  return json;
}

function normalizeHost(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/.*$/, '');
}

function extractHost(value) {
  if (!value) {
    return '';
  }
  try {
    return normalizeHost(new URL(value).hostname);
  } catch {
    return normalizeHost(value);
  }
}

function hostMatches(candidate, targetDomain) {
  const normalizedCandidate = extractHost(candidate);
  const normalizedTarget = normalizeHost(targetDomain);
  return normalizedCandidate === normalizedTarget || normalizedCandidate.endsWith(`.${normalizedTarget}`);
}

function summarizeSerpTask(task, targetDomain) {
  const result = task?.result?.[0] || {};
  const items = Array.isArray(result.items) ? result.items : [];
  const organicItems = items.filter(item => item?.type === 'organic');
  const match = organicItems.find(item => hostMatches(item?.domain || item?.url, targetDomain));

  return {
    keyword: result.keyword || task?.data?.keyword || null,
    found: Boolean(match),
    found_position: match?.rank_absolute ?? match?.position ?? null,
    found_url: match?.url || null,
    found_title: match?.title || null,
    top_results: organicItems.slice(0, 5).map(item => ({
      position: item?.rank_absolute ?? item?.position ?? null,
      domain: item?.domain || extractHost(item?.url),
      title: item?.title || null,
      url: item?.url || null
    }))
  };
}

async function runStatus(args) {
  const json = await apiRequest({
    method: 'GET',
    endpoint: 'appendix/user_data',
    args
  });

  const result = json?.tasks?.[0]?.result?.[0] || {};
  console.log(JSON.stringify({
    checked_at: new Date().toISOString(),
    status_code: json?.status_code || null,
    status_message: json?.status_message || null,
    account: {
      login: result?.login || null,
      money_limit: result?.money_limit ?? null,
      money_left: result?.money_left ?? null,
      total_money_spent: result?.total_money_spent ?? null
    }
  }, null, 2));
}

async function runSerp(args) {
  const keywords = await resolveKeywords(args);
  const targetDomain = args.domain || defaultDomain;
  const payload = keywords.map(keyword => ({
    keyword,
    language_code: args['language-code'] || defaultLanguageCode,
    location_code: asNumber(args['location-code'], defaultLocationCode),
    device: args.device || 'desktop',
    os: args.os || 'windows',
    depth: asNumber(args.depth, defaultDepth)
  }));

  const json = await apiRequest({
    method: 'POST',
    endpoint: 'serp/google/organic/live/advanced',
    payload,
    args
  });

  console.log(JSON.stringify({
    checked_at: new Date().toISOString(),
    target_domain: normalizeHost(targetDomain),
    location_code: asNumber(args['location-code'], defaultLocationCode),
    language_code: args['language-code'] || defaultLanguageCode,
    depth: asNumber(args.depth, defaultDepth),
    keywords_checked: keywords,
    results: (json?.tasks || []).map(task => summarizeSerpTask(task, targetDomain))
  }, null, 2));
}

async function runRankedKeywords(args) {
  const limit = asNumber(args.limit, 20);
  const target = args.target || defaultDomain;
  const payload = [{
    target,
    language_code: args['language-code'] || defaultLanguageCode,
    location_code: asNumber(args['location-code'], defaultLocationCode),
    limit
  }];

  const json = await apiRequest({
    method: 'POST',
    endpoint: 'dataforseo_labs/google/ranked_keywords/live',
    payload,
    args
  });

  const items = json?.tasks?.[0]?.result?.[0]?.items || [];
  console.log(JSON.stringify({
    checked_at: new Date().toISOString(),
    target,
    location_code: asNumber(args['location-code'], defaultLocationCode),
    language_code: args['language-code'] || defaultLanguageCode,
    item_count: items.length,
    items: items.map(item => ({
      keyword: item?.keyword_data?.keyword || null,
      position: item?.ranked_serp_element?.serp_item?.rank_absolute ?? item?.ranked_serp_element?.serp_item?.position ?? null,
      search_volume: item?.keyword_data?.keyword_info?.search_volume ?? null,
      keyword_difficulty: item?.keyword_properties?.keyword_difficulty ?? null,
      result_url: item?.ranked_serp_element?.serp_item?.url ?? null,
      result_title: item?.ranked_serp_element?.serp_item?.title ?? null
    }))
  }, null, 2));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const command = args._[0];

  if (!command || ['-h', '--help', 'help'].includes(command)) {
    usage();
    process.exit(command ? 0 : 1);
  }

  if (command === 'status') {
    await runStatus(args);
    return;
  }

  if (command === 'serp') {
    await runSerp(args);
    return;
  }

  if (command === 'ranked-keywords') {
    await runRankedKeywords(args);
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

main().catch(error => {
  console.error(error.message);
  process.exit(1);
});
