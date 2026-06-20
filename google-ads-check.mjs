#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

const apiVersion = 'v24';
const appDataDir = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
const gcloudDir = path.join(appDataDir, 'gcloud');
const defaultClientPath = path.join(gcloudDir, 'dolphin-ga4-gtm-readonly-codex-oauth-client.json');
const defaultTokenPath = path.join(gcloudDir, 'dolphin-google-ads-token.json');
const defaultConfigPath = path.join(gcloudDir, 'dolphin-google-ads-config.json');
const defaultScope = 'https://www.googleapis.com/auth/adwords';
const defaultLoginCustomerId = '6124315358';
const defaultCustomerId = '3917484159';

function usage() {
  console.log(`Google Ads read-only helper

Usage:
  node google-ads-check.mjs auth [--login-hint EMAIL] [--client PATH] [--token PATH]
  node google-ads-check.mjs status [--config PATH] [--token PATH]
  node google-ads-check.mjs save-config --developer-token-env ENV_NAME [--login-customer-id ID] [--customer-id ID]
  node google-ads-check.mjs accessible [--config PATH] [--token PATH]
  node google-ads-check.mjs clients [--login-customer-id ID] [--config PATH] [--token PATH]
  node google-ads-check.mjs query --customer-id ID --sql "GAQL" [--login-customer-id ID] [--json]
  node google-ads-check.mjs audit [--customer-id ID] [--login-customer-id ID] [--start-date YYYY-MM-DD] [--end-date YYYY-MM-DD] [--json]

Notes:
  - This helper only uses read/reporting API calls.
  - Tokens and developer token config are stored outside the repo by default:
    ${defaultTokenPath}
    ${defaultConfigPath}
  - The OAuth scope is:
    ${defaultScope}
  - Default manager login customer id: ${defaultLoginCustomerId}
  - Default likely client customer id from GA4 link: ${defaultCustomerId}`);
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

async function writeJson(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
}

async function readClient(clientPath) {
  if (!existsSync(clientPath)) {
    throw new Error(`OAuth client file not found: ${clientPath}`);
  }
  const raw = await readJson(clientPath);
  const client = raw.installed || raw.web;
  if (!client?.client_id || !client?.client_secret) {
    throw new Error(`OAuth client file is missing client_id/client_secret: ${clientPath}`);
  }
  return {
    clientId: client.client_id,
    clientSecret: client.client_secret,
    authUri: client.auth_uri || 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUri: client.token_uri || 'https://oauth2.googleapis.com/token'
  };
}

function openInBrowser(url) {
  return new Promise((resolve) => {
    if (process.platform === 'win32') {
      const child = spawn('rundll32.exe', ['url.dll,FileProtocolHandler', url], {
        detached: true,
        stdio: 'ignore'
      });
      child.on('error', resolve);
      child.unref();
      resolve();
      return;
    }
    const opener = process.platform === 'darwin' ? 'open' : 'xdg-open';
    const child = spawn(opener, [url], { detached: true, stdio: 'ignore' });
    child.on('error', resolve);
    child.unref();
    resolve();
  });
}

async function auth(args) {
  const clientPath = args.client || defaultClientPath;
  const tokenPath = args.token || defaultTokenPath;
  const client = await readClient(clientPath);
  const state = crypto.randomUUID();

  const authResult = await new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      try {
        const requestUrl = new URL(req.url, 'http://localhost');
        if (requestUrl.pathname !== '/oauth2callback') {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not found');
          return;
        }
        if (requestUrl.searchParams.get('state') !== state) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('State mismatch. Close this tab and rerun the auth command.');
          reject(new Error('OAuth state mismatch'));
          server.close();
          return;
        }
        const error = requestUrl.searchParams.get('error');
        if (error) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end(`Google returned an OAuth error: ${error}`);
          reject(new Error(`OAuth error: ${error}`));
          server.close();
          return;
        }
        const code = requestUrl.searchParams.get('code');
        if (!code) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('No OAuth code returned.');
          reject(new Error('No OAuth code returned'));
          server.close();
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Google Ads authorization saved. You can close this tab and return to Codex.');
        resolve({ code, redirectUri: `http://127.0.0.1:${server.address().port}/oauth2callback` });
        server.close();
      } catch (error) {
        reject(error);
        server.close();
      }
    });

    server.on('error', reject);
    server.listen(0, '127.0.0.1', async () => {
      const { port } = server.address();
      const redirectUri = `http://127.0.0.1:${port}/oauth2callback`;
      const url = new URL(client.authUri);
      url.searchParams.set('client_id', client.clientId);
      url.searchParams.set('redirect_uri', redirectUri);
      url.searchParams.set('response_type', 'code');
      url.searchParams.set('scope', defaultScope);
      url.searchParams.set('access_type', 'offline');
      url.searchParams.set('prompt', 'consent');
      url.searchParams.set('state', state);
      if (args['login-hint']) url.searchParams.set('login_hint', args['login-hint']);
      console.log(`Opening Google authorization page for Ads API read access. Waiting for callback on ${redirectUri}`);
      await openInBrowser(url.toString());
    });
  });

  const body = new URLSearchParams({
    code: authResult.code,
    client_id: client.clientId,
    client_secret: client.clientSecret,
    redirect_uri: authResult.redirectUri,
    grant_type: 'authorization_code'
  });

  const tokenResponse = await fetch(client.tokenUri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });
  const token = await tokenResponse.json();
  if (!tokenResponse.ok) {
    throw new Error(`Token exchange failed: ${JSON.stringify(token)}`);
  }
  if (!token.refresh_token) {
    throw new Error('Google did not return a refresh token. Rerun auth and make sure consent is granted.');
  }
  const saved = {
    client_id: client.clientId,
    token_uri: client.tokenUri,
    scope: token.scope || defaultScope,
    token_type: token.token_type,
    access_token: token.access_token,
    refresh_token: token.refresh_token,
    expires_in: token.expires_in,
    expiry_date: Date.now() + Number(token.expires_in || 3600) * 1000,
    created_utc: new Date().toISOString()
  };
  await writeJson(tokenPath, saved);
  console.log(`Saved Google Ads OAuth token outside repo: ${tokenPath}`);
}

async function refreshAccessToken(tokenPath = defaultTokenPath, clientPath = defaultClientPath) {
  if (!existsSync(tokenPath)) {
    throw new Error(`Google Ads OAuth token not found. Run: node google-ads-check.mjs auth`);
  }
  const token = await readJson(tokenPath);
  const client = await readClient(clientPath);
  const body = new URLSearchParams({
    client_id: client.clientId,
    client_secret: client.clientSecret,
    refresh_token: token.refresh_token,
    grant_type: 'refresh_token'
  });
  const res = await fetch(token.token_uri || client.tokenUri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Token refresh failed: ${JSON.stringify(json)}`);
  return json.access_token;
}

async function readConfig(configPath = defaultConfigPath) {
  if (!existsSync(configPath)) {
    throw new Error(`Google Ads config not found. Save it with: node google-ads-check.mjs save-config --developer-token-env ENV_NAME`);
  }
  const config = await readJson(configPath);
  if (!config.developer_token) {
    throw new Error(`Google Ads config missing developer_token: ${configPath}`);
  }
  return config;
}

async function saveConfig(args) {
  const envName = args['developer-token-env'];
  if (!envName) {
    throw new Error('Use --developer-token-env ENV_NAME so the token is read from an environment variable, not command history.');
  }
  const developerToken = process.env[envName];
  if (!developerToken) {
    throw new Error(`Environment variable ${envName} is empty or not set.`);
  }
  const config = {
    developer_token: developerToken.trim(),
    login_customer_id: normalizeCustomerId(args['login-customer-id'] || defaultLoginCustomerId),
    customer_id: normalizeCustomerId(args['customer-id'] || defaultCustomerId),
    saved_utc: new Date().toISOString()
  };
  await writeJson(args.config || defaultConfigPath, config);
  console.log(`Saved Google Ads API config outside repo: ${args.config || defaultConfigPath}`);
}

function normalizeCustomerId(value) {
  return String(value || '').replace(/\D/g, '');
}

async function googleAdsFetch(args, url, options = {}) {
  const config = await readConfig(args.config || defaultConfigPath);
  const accessToken = await refreshAccessToken(args.token || defaultTokenPath, args.client || defaultClientPath);
  const loginCustomerId = normalizeCustomerId(args['login-customer-id'] || config.login_customer_id || defaultLoginCustomerId);
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
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { raw: text };
  }
  if (!res.ok) {
    const requestId = res.headers.get('request-id') || res.headers.get('google-ads-request-id') || '';
    throw new Error(`Google Ads API ${res.status}${requestId ? ` request-id ${requestId}` : ''}: ${JSON.stringify(body).slice(0, 1600)}`);
  }
  return body;
}

async function accessible(args) {
  const body = await googleAdsFetch(args, `https://googleads.googleapis.com/${apiVersion}/customers:listAccessibleCustomers`);
  const names = body.resourceNames || [];
  if (args.json) {
    console.log(JSON.stringify(names, null, 2));
    return;
  }
  console.log(`Accessible customers (${names.length}):`);
  for (const name of names) console.log(`- ${name}`);
}

async function searchStream(args, customerId, query) {
  const normalizedCustomerId = normalizeCustomerId(customerId);
  if (!normalizedCustomerId) throw new Error('Missing --customer-id');
  const body = await googleAdsFetch(
    args,
    `https://googleads.googleapis.com/${apiVersion}/customers/${normalizedCustomerId}/googleAds:searchStream`,
    { method: 'POST', body: JSON.stringify({ query }) }
  );
  return body.flatMap((chunk) => chunk.results || []);
}

async function query(args) {
  const sql = args.sql || args._.slice(1).join(' ');
  const customerId = normalizeCustomerId(args['customer-id'] || (await readConfig(args.config || defaultConfigPath)).customer_id);
  if (!sql) throw new Error('Missing --sql "GAQL"');
  const rows = await searchStream(args, customerId, sql);
  if (args.json) {
    console.log(JSON.stringify(rows, null, 2));
    return;
  }
  console.log(`Rows: ${rows.length}`);
  console.log(JSON.stringify(rows.slice(0, 25), null, 2));
}

async function clients(args) {
  const config = await readConfig(args.config || defaultConfigPath);
  const loginCustomerId = normalizeCustomerId(args['login-customer-id'] || config.login_customer_id || defaultLoginCustomerId);
  const rows = await searchStream(args, loginCustomerId, `
    SELECT
      customer_client.client_customer,
      customer_client.descriptive_name,
      customer_client.id,
      customer_client.level,
      customer_client.manager,
      customer_client.status,
      customer_client.currency_code,
      customer_client.time_zone
    FROM customer_client
    WHERE customer_client.status != 'CANCELED'
    ORDER BY customer_client.level, customer_client.descriptive_name
  `);
  if (args.json) {
    console.log(JSON.stringify(rows, null, 2));
    return;
  }
  for (const row of rows) {
    const client = row.customerClient || {};
    console.log(`${client.descriptiveName || '(unnamed)'} | id=${client.id} | manager=${client.manager} | level=${client.level} | status=${client.status} | currency=${client.currencyCode || ''}`);
  }
}

function money(micros) {
  return Number(micros || 0) / 1_000_000;
}

function formatMoney(micros) {
  return `$${money(micros).toFixed(2)}`;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function dateDaysAgo(days) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

function suspectText(text) {
  return /\b(price|prices|cost|costs|cheap|how much|for sale|alibaba|amazon|ebay|kit|home|doctor|medical|lab|laboratory|blood|plasma|desktop|bench|benchtop|tabletop|mini|small|rpm|water centrifuge|drilling mud|sifter|washing machine)\b/i.test(text || '');
}

async function audit(args) {
  const config = await readConfig(args.config || defaultConfigPath);
  const customerId = normalizeCustomerId(args['customer-id'] || config.customer_id || defaultCustomerId);
  const startDate = args['start-date'] || dateDaysAgo(30);
  const endDate = args['end-date'] || todayIso();

  const campaignRows = await searchStream(args, customerId, `
    SELECT
      campaign.id,
      campaign.name,
      campaign.status,
      campaign.advertising_channel_type,
      campaign.bidding_strategy_type,
      campaign_budget.name,
      campaign_budget.amount_micros,
      campaign_budget.delivery_method,
      metrics.cost_micros,
      metrics.clicks,
      metrics.impressions,
      metrics.conversions
    FROM campaign
    WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
      AND campaign.status != 'REMOVED'
    ORDER BY metrics.cost_micros DESC
  `);

  const keywordRows = await searchStream(args, customerId, `
    SELECT
      campaign.name,
      campaign.status,
      ad_group.name,
      ad_group.status,
      ad_group_criterion.keyword.text,
      ad_group_criterion.keyword.match_type,
      ad_group_criterion.status,
      ad_group_criterion.system_serving_status,
      ad_group_criterion.approval_status,
      ad_group_criterion.negative,
      ad_group_criterion.final_urls,
      metrics.clicks,
      metrics.impressions,
      metrics.ctr,
      metrics.average_cpc,
      metrics.cost_micros,
      metrics.conversions
    FROM keyword_view
    WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
      AND campaign.status != 'REMOVED'
      AND ad_group.status != 'REMOVED'
      AND ad_group_criterion.status != 'REMOVED'
      AND ad_group_criterion.negative = FALSE
    ORDER BY metrics.cost_micros DESC
    LIMIT 1000
  `);

  const searchTermRows = await searchStream(args, customerId, `
    SELECT
      search_term_view.search_term,
      segments.keyword.info.match_type,
      search_term_view.status,
      campaign.name,
      ad_group.name,
      metrics.clicks,
      metrics.impressions,
      metrics.ctr,
      metrics.average_cpc,
      metrics.cost_micros,
      metrics.conversions,
      campaign.advertising_channel_type
    FROM search_term_view
    WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
      AND campaign.status != 'REMOVED'
    ORDER BY metrics.cost_micros DESC
    LIMIT 1000
  `);

  const adGroupNegativeRows = await searchStream(args, customerId, `
    SELECT
      campaign.name,
      ad_group.name,
      ad_group_criterion.keyword.text,
      ad_group_criterion.keyword.match_type,
      ad_group_criterion.status
    FROM ad_group_criterion
    WHERE ad_group_criterion.type = 'KEYWORD'
      AND ad_group_criterion.negative = TRUE
      AND ad_group_criterion.status != 'REMOVED'
    ORDER BY campaign.name, ad_group.name, ad_group_criterion.keyword.text
    LIMIT 1000
  `);

  const campaignNegativeRows = await searchStream(args, customerId, `
    SELECT
      campaign.name,
      campaign_criterion.keyword.text,
      campaign_criterion.keyword.match_type,
      campaign_criterion.status
    FROM campaign_criterion
    WHERE campaign_criterion.type = 'KEYWORD'
      AND campaign_criterion.negative = TRUE
      AND campaign_criterion.status != 'REMOVED'
    ORDER BY campaign.name, campaign_criterion.keyword.text
    LIMIT 1000
  `);

  const broadKeywords = keywordRows.filter((row) => row.adGroupCriterion?.keyword?.matchType === 'BROAD');
  const activeBroadKeywords = broadKeywords.filter((row) =>
    row.campaign?.status === 'ENABLED' &&
    row.adGroup?.status === 'ENABLED' &&
    row.adGroupCriterion?.status === 'ENABLED'
  );
  const suspectKeywords = keywordRows.filter((row) => suspectText(row.adGroupCriterion?.keyword?.text));
  const suspectSearchTerms = searchTermRows.filter((row) => suspectText(row.searchTermView?.searchTerm));
  const totalCostMicros = campaignRows.reduce((sum, row) => sum + Number(row.metrics?.costMicros || 0), 0);
  const totalClicks = campaignRows.reduce((sum, row) => sum + Number(row.metrics?.clicks || 0), 0);
  const totalImpressions = campaignRows.reduce((sum, row) => sum + Number(row.metrics?.impressions || 0), 0);
  const totalConversions = campaignRows.reduce((sum, row) => sum + Number(row.metrics?.conversions || 0), 0);

  const output = {
    customerId,
    dateRange: { startDate, endDate },
    summary: {
      totalCost: money(totalCostMicros),
      totalClicks,
      totalImpressions,
      totalConversions,
      campaignRows: campaignRows.length,
      keywordRows: keywordRows.length,
      searchTermRows: searchTermRows.length,
      broadKeywordCount: broadKeywords.length,
      activeBroadKeywordCount: activeBroadKeywords.length,
      suspectKeywordCount: suspectKeywords.length,
      suspectSearchTermCount: suspectSearchTerms.length,
      adGroupNegativeCount: adGroupNegativeRows.length,
      campaignNegativeCount: campaignNegativeRows.length
    },
    campaignRows,
    broadKeywords,
    suspectKeywords,
    suspectSearchTerms,
    topKeywordSpendRows: keywordRows.slice(0, 50),
    topSearchTermSpendRows: searchTermRows.slice(0, 50),
    adGroupNegativeRows,
    campaignNegativeRows
  };

  if (args.json) {
    console.log(JSON.stringify(output, null, 2));
    return;
  }

  console.log(`Google Ads read-only audit for customer ${customerId}`);
  console.log(`Date range: ${startDate} to ${endDate}`);
  console.log(`Total cost: ${formatMoney(totalCostMicros)} | clicks: ${totalClicks} | impressions: ${totalImpressions} | conversions: ${totalConversions}`);
  console.log(`Configured keyword rows checked: ${keywordRows.length}`);
  console.log(`Broad keyword rows found in non-removed campaigns: ${broadKeywords.length}`);
  console.log(`Active broad keywords found: ${activeBroadKeywords.length}`);
  console.log(`Suspect configured keywords found: ${suspectKeywords.length}`);
  console.log(`Suspect search terms found: ${suspectSearchTerms.length}`);
  console.log(`Negatives found: ad group ${adGroupNegativeRows.length}, campaign ${campaignNegativeRows.length}`);

  if (activeBroadKeywords.length) {
    console.log('\nActive broad keywords by spend:');
    for (const row of activeBroadKeywords.slice(0, 25)) {
      console.log(`- ${row.adGroupCriterion?.keyword?.text} | ${row.campaign?.name} / ${row.adGroup?.name} | ${formatMoney(row.metrics?.costMicros)} | clicks ${row.metrics?.clicks || 0}`);
    }
  }

  if (suspectKeywords.length) {
    console.log('\nSuspect configured keywords by spend:');
    for (const row of suspectKeywords.slice(0, 25)) {
      console.log(`- ${row.adGroupCriterion?.keyword?.text} [${row.adGroupCriterion?.keyword?.matchType}] | ${row.campaign?.name} / ${row.adGroup?.name} | ${formatMoney(row.metrics?.costMicros)} | clicks ${row.metrics?.clicks || 0} | conv ${row.metrics?.conversions || 0}`);
    }
  }

  if (suspectSearchTerms.length) {
    console.log('\nSuspect search terms by spend:');
    for (const row of suspectSearchTerms.slice(0, 25)) {
      console.log(`- ${row.searchTermView?.searchTerm} [trigger ${row.segments?.keyword?.info?.matchType || ''}] | ${row.campaign?.name} / ${row.adGroup?.name} | ${formatMoney(row.metrics?.costMicros)} | clicks ${row.metrics?.clicks || 0} | conv ${row.metrics?.conversions || 0}`);
    }
  }
}

async function status(args) {
  const tokenPath = args.token || defaultTokenPath;
  const configPath = args.config || defaultConfigPath;
  const info = {
    oauthTokenPath: tokenPath,
    oauthTokenExists: existsSync(tokenPath),
    configPath,
    configExists: existsSync(configPath),
    developerTokenConfigured: false,
    loginCustomerId: null,
    customerId: null,
    scope: null
  };
  if (info.oauthTokenExists) {
    const token = await readJson(tokenPath);
    info.scope = token.scope || null;
    info.tokenCreatedUtc = token.created_utc || null;
  }
  if (info.configExists) {
    const config = await readJson(configPath);
    info.developerTokenConfigured = Boolean(config.developer_token);
    info.loginCustomerId = config.login_customer_id || null;
    info.customerId = config.customer_id || null;
    info.configSavedUtc = config.saved_utc || null;
  }
  console.log(JSON.stringify(info, null, 2));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const command = args._[0] || 'help';
  if (args.help || command === 'help') {
    usage();
    return;
  }
  if (command === 'auth') return auth(args);
  if (command === 'status') return status(args);
  if (command === 'save-config') return saveConfig(args);
  if (command === 'accessible') return accessible(args);
  if (command === 'clients') return clients(args);
  if (command === 'query') return query(args);
  if (command === 'audit') return audit(args);
  throw new Error(`Unknown command: ${command}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
