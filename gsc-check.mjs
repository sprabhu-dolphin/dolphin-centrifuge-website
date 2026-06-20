#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

const appDataDir = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
const gcloudDir = path.join(appDataDir, 'gcloud');
const defaultClientPath = path.join(gcloudDir, 'dolphin-ga4-gtm-readonly-codex-oauth-client.json');
const defaultTokenPath = path.join(gcloudDir, 'dolphin-gsc-readonly-token.json');
const defaultScopes = ['https://www.googleapis.com/auth/webmasters.readonly'];
const defaultSiteUrl = 'sc-domain:dolphincentrifuge.com';
const defaultInspectionUrls = [
  'https://dolphincentrifuge.com/',
  'https://dolphincentrifuge.com/alfa-laval-centrifuge/',
  'https://dolphincentrifuge.com/alfa-laval-centrifuges/',
  'https://dolphincentrifuge.com/decanter-centrifuge/'
];

function usage() {
  console.log(`Google Search Console helper

Usage:
  node gsc-check.mjs auth [--scope readonly|full] [--login-hint EMAIL] [--client PATH] [--token PATH]
  node gsc-check.mjs sites [--token PATH]
  node gsc-check.mjs sitemaps [--site SITE_URL] [--token PATH]
  node gsc-check.mjs inspect [--site SITE_URL] [--urls URL1,URL2] [--token PATH] [--json]
  node gsc-check.mjs live-schema [--sitemap URL] [--json]

Notes:
  - Tokens are stored outside the repo by default:
    ${defaultTokenPath}
  - The default OAuth scope is read-only Search Console access.
  - The Search Console API can inspect URLs and list properties/sitemaps. Google does not currently expose the "Validate Fix" button as a public API method.`);
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
  const scopes = normalizeScopes(args.scope);
  const state = crypto.randomUUID();

  const authCode = await new Promise((resolve, reject) => {
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
          reject(new Error(`Google returned an OAuth error: ${error}`));
          server.close();
          return;
        }
        const code = requestUrl.searchParams.get('code');
        if (!code) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('No authorization code was returned.');
          reject(new Error('No authorization code was returned'));
          server.close();
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Search Console authorization is complete. You can close this tab.');
        resolve(code);
        server.close();
      } catch (error) {
        reject(error);
        server.close();
      }
    });

    server.on('error', reject);
    server.listen(0, 'localhost', async () => {
      const address = server.address();
      const redirectUri = `http://localhost:${address.port}/oauth2callback`;
      lastRedirectUri = redirectUri;
      const url = new URL(client.authUri);
      url.searchParams.set('client_id', client.clientId);
      url.searchParams.set('redirect_uri', redirectUri);
      url.searchParams.set('response_type', 'code');
      url.searchParams.set('scope', scopes.join(' '));
      url.searchParams.set('access_type', 'offline');
      url.searchParams.set('prompt', 'consent');
      if (args['login-hint']) {
        url.searchParams.set('login_hint', args['login-hint']);
      }
      url.searchParams.set('state', state);

      console.log('Opening Google OAuth consent in the browser...');
      console.log(`Requested scope: ${scopes.join(' ')}`);
      console.log(`Token will be stored at: ${tokenPath}`);
      console.log(`Consent URL: ${url.toString()}`);
      await openInBrowser(url.toString());
      console.log('Waiting for Google OAuth callback...');
    });
  });

  const token = await exchangeCodeForToken({
    client,
    code: authCode,
    redirectUri: lastRedirectUri,
    scopes
  });

  await writeJson(tokenPath, token);
  console.log('Search Console OAuth token saved.');
  console.log(`Token path: ${tokenPath}`);
  console.log(`Scope: ${token.scope}`);
  console.log(`Expires: ${token.expiry_date}`);
}

let lastRedirectUri = '';

async function exchangeCodeForToken({ client, code, redirectUri, scopes }) {
  const params = new URLSearchParams({
    client_id: client.clientId,
    client_secret: client.clientSecret,
    code,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri
  });
  const response = await fetch(client.tokenUri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`OAuth token exchange failed (${response.status}): ${JSON.stringify(redactTokenBody(body))}`);
  }
  const expiryDate = new Date(Date.now() + Number(body.expires_in || 0) * 1000).toISOString();
  return {
    client_id: client.clientId,
    token_uri: client.tokenUri,
    scope: body.scope || scopes.join(' '),
    created_utc: new Date().toISOString(),
    access_token: body.access_token,
    refresh_token: body.refresh_token,
    expires_in: body.expires_in,
    token_type: body.token_type,
    expiry_date: expiryDate
  };
}

function normalizeScopes(scopeArg) {
  if (!scopeArg || scopeArg === 'readonly') {
    return defaultScopes;
  }
  if (scopeArg === 'full') {
    return ['https://www.googleapis.com/auth/webmasters'];
  }
  return String(scopeArg).split(/[,\s]+/).filter(Boolean);
}

function isExpired(token) {
  if (!token.expiry_date) return true;
  return Date.now() > new Date(token.expiry_date).getTime() - 60_000;
}

async function getAccessToken(args) {
  const clientPath = args.client || defaultClientPath;
  const tokenPath = args.token || defaultTokenPath;
  if (!existsSync(tokenPath)) {
    throw new Error(`Search Console token not found. Run: node gsc-check.mjs auth`);
  }
  const client = await readClient(clientPath);
  const token = await readJson(tokenPath);
  if (!isExpired(token) && token.access_token) {
    return token.access_token;
  }
  if (!token.refresh_token) {
    throw new Error(`Token has no refresh_token. Rerun: node gsc-check.mjs auth`);
  }

  const params = new URLSearchParams({
    client_id: client.clientId,
    client_secret: client.clientSecret,
    refresh_token: token.refresh_token,
    grant_type: 'refresh_token'
  });
  const response = await fetch(client.tokenUri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`OAuth refresh failed (${response.status}): ${JSON.stringify(redactTokenBody(body))}`);
  }
  const updated = {
    ...token,
    access_token: body.access_token,
    expires_in: body.expires_in,
    token_type: body.token_type || token.token_type,
    expiry_date: new Date(Date.now() + Number(body.expires_in || 0) * 1000).toISOString()
  };
  if (body.scope) {
    updated.scope = body.scope;
  }
  await writeJson(tokenPath, updated);
  return updated.access_token;
}

function redactTokenBody(body) {
  const copy = { ...body };
  for (const key of ['access_token', 'refresh_token', 'id_token']) {
    if (copy[key]) copy[key] = '[redacted]';
  }
  return copy;
}

async function gscFetch(args, url, options = {}) {
  const accessToken = await getAccessToken(args);
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const body = await response.json().catch(async () => ({ text: await response.text() }));
  if (!response.ok) {
    throw new Error(`Search Console API failed (${response.status}): ${JSON.stringify(body)}`);
  }
  return body;
}

async function sites(args) {
  const body = await gscFetch(args, 'https://www.googleapis.com/webmasters/v3/sites');
  const rows = (body.siteEntry || []).map((site) => ({
    siteUrl: site.siteUrl,
    permissionLevel: site.permissionLevel
  }));
  if (args.json) {
    console.log(JSON.stringify(rows, null, 2));
    return;
  }
  if (!rows.length) {
    console.log('No verified Search Console properties were returned for this Google account.');
    return;
  }
  for (const row of rows) {
    console.log(`${row.siteUrl}  ${row.permissionLevel}`);
  }
}

async function sitemaps(args) {
  const siteUrl = args.site || defaultSiteUrl;
  const encodedSite = encodeURIComponent(siteUrl);
  const body = await gscFetch(args, `https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/sitemaps`);
  const rows = body.sitemap || [];
  if (args.json) {
    console.log(JSON.stringify(rows, null, 2));
    return;
  }
  if (!rows.length) {
    console.log(`No sitemaps returned for ${siteUrl}.`);
    return;
  }
  for (const sitemap of rows) {
    console.log(`${sitemap.path}  submitted=${sitemap.lastSubmitted || 'unknown'}  downloaded=${sitemap.lastDownloaded || 'unknown'}  errors=${sitemap.errors || 0}  warnings=${sitemap.warnings || 0}`);
  }
}

async function inspect(args) {
  const siteUrl = args.site || defaultSiteUrl;
  const urls = parseUrls(args.urls) || defaultInspectionUrls;
  const results = [];
  for (const inspectionUrl of urls) {
    const body = await gscFetch(args, 'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
      method: 'POST',
      body: JSON.stringify({
        inspectionUrl,
        siteUrl,
        languageCode: 'en-US'
      })
    });
    results.push(summarizeInspection(inspectionUrl, body.inspectionResult || {}));
  }
  if (args.json) {
    console.log(JSON.stringify(results, null, 2));
    return;
  }
  for (const result of results) {
    console.log(`\n${result.url}`);
    console.log(`  coverage: ${result.coverageState || 'unknown'}`);
    console.log(`  indexing: ${result.indexingState || 'unknown'}`);
    console.log(`  robots: ${result.robotsTxtState || 'unknown'}`);
    console.log(`  page fetch: ${result.pageFetchState || 'unknown'}`);
    console.log(`  rich results: ${result.richResultsVerdict || 'unknown'}`);
    if (result.richResultsItems.length) {
      for (const item of result.richResultsItems) {
        console.log(`  rich item: ${item.name || item.type || 'unknown'} verdict=${item.verdict || 'unknown'} issues=${item.issueCount}`);
      }
    }
    if (result.inspectionResultLink) {
      console.log(`  GSC link: ${result.inspectionResultLink}`);
    }
  }
}

function parseUrls(urlsArg) {
  if (!urlsArg) return null;
  return String(urlsArg).split(',').map((url) => url.trim()).filter(Boolean);
}

function summarizeInspection(url, inspectionResult) {
  const index = inspectionResult.indexStatusResult || {};
  const rich = inspectionResult.richResultsResult || {};
  const richResultsItems = (rich.detectedItems || []).map((item) => ({
    type: item.richResultType,
    name: item.name,
    verdict: item.verdict,
    issueCount: (item.items || []).reduce((count, detected) => count + (detected.richResultIssues || []).length, 0)
  }));
  return {
    url,
    inspectionResultLink: inspectionResult.inspectionResultLink,
    coverageState: index.coverageState,
    indexingState: index.indexingState,
    robotsTxtState: index.robotsTxtState,
    pageFetchState: index.pageFetchState,
    googleCanonical: index.googleCanonical,
    userCanonical: index.userCanonical,
    lastCrawlTime: index.lastCrawlTime,
    richResultsVerdict: rich.verdict,
    richResultsItems
  };
}

async function liveSchema(args) {
  const sitemapUrl = args.sitemap || 'https://dolphincentrifuge.com/sitemap-index.xml';
  const urls = await collectSitemapUrls(sitemapUrl);
  const scanUrls = Array.from(new Set([
    ...urls,
    'https://dolphincentrifuge.com/alfa-laval-centrifuge/',
    'https://dolphincentrifuge.com/alfa-laval-centrifuges/'
  ]));
  const result = {
    checked: scanUrls.length,
    breadcrumbMissingItem: [],
    productNoRichTrigger: [],
    productOfferNoPrice: [],
    productNoImage: [],
    fetchErrors: [],
    parseErrors: [],
    productCount: 0
  };

  for (const url of scanUrls) {
    let html = '';
    try {
      const response = await fetchWithRetries(url, { redirect: 'follow' }, 30_000, 3);
      html = await response.text();
      if (!response.ok) {
        result.fetchErrors.push({ url, error: `HTTP ${response.status}` });
        continue;
      }
    } catch (error) {
      result.fetchErrors.push({ url, error: error.message });
      continue;
    }

    const schemas = extractJsonLd(html, url, result);
    for (const schema of schemas) {
      const nodes = flattenSchema(schema);
      for (const node of nodes) {
        const typeSet = new Set(Array.isArray(node?.['@type']) ? node['@type'] : [node?.['@type']]);
        if (typeSet.has('BreadcrumbList')) {
          for (const item of node.itemListElement || []) {
            if (!item?.item) {
              result.breadcrumbMissingItem.push({ url, name: item?.name || null });
            }
          }
        }
        if (typeSet.has('Product')) {
          result.productCount += 1;
          const hasOffer = Boolean(node.offers);
          const hasReview = Boolean(node.review);
          const hasRating = Boolean(node.aggregateRating);
          const images = Array.isArray(node.image) ? node.image : [node.image].filter(Boolean);
          if (!images.length) {
            result.productNoImage.push({ url, name: node.name || null });
          }
          if (!hasOffer && !hasReview && !hasRating) {
            result.productNoRichTrigger.push({ url, name: node.name || null });
          }
          if (hasOffer && !offerHasPrice(node.offers)) {
            result.productOfferNoPrice.push({ url, name: node.name || null });
          }
        }
      }
    }
  }

  if (args.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }
  console.log(`Checked ${result.checked} live URLs.`);
  console.log(`Breadcrumbs missing item: ${result.breadcrumbMissingItem.length}`);
  console.log(`Products without rich-result trigger: ${result.productNoRichTrigger.length}`);
  console.log(`Product offers without price: ${result.productOfferNoPrice.length}`);
  console.log(`Products without image: ${result.productNoImage.length}`);
  console.log(`Fetch errors: ${result.fetchErrors.length}`);
  console.log(`JSON-LD parse errors: ${result.parseErrors.length}`);
  console.log(`Product schemas found: ${result.productCount}`);
  if (hasLiveSchemaFailures(result)) {
    console.log('\nFailure details:');
    console.log(JSON.stringify({
      breadcrumbMissingItem: result.breadcrumbMissingItem,
      productNoRichTrigger: result.productNoRichTrigger,
      productOfferNoPrice: result.productOfferNoPrice,
      productNoImage: result.productNoImage,
      fetchErrors: result.fetchErrors,
      parseErrors: result.parseErrors
    }, null, 2));
    process.exitCode = 1;
  }
}

function hasLiveSchemaFailures(result) {
  return result.breadcrumbMissingItem.length ||
    result.productNoRichTrigger.length ||
    result.productOfferNoPrice.length ||
    result.productNoImage.length ||
    result.fetchErrors.length ||
    result.parseErrors.length;
}

async function collectSitemapUrls(sitemapUrl) {
  const response = await fetchWithTimeout(sitemapUrl, { redirect: 'follow' }, 20_000);
  const xml = await response.text();
  if (!response.ok) {
    throw new Error(`Could not fetch sitemap ${sitemapUrl}: HTTP ${response.status}`);
  }
  const locs = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g), (match) => match[1].trim());
  const nestedSitemaps = locs.filter((url) => /sitemap/i.test(url) && /\.xml(?:$|\?)/i.test(url));
  const pageUrls = locs.filter((url) => !nestedSitemaps.includes(url));
  for (const nested of nestedSitemaps) {
    const nestedResponse = await fetchWithTimeout(nested, { redirect: 'follow' }, 20_000);
    const nestedXml = await nestedResponse.text();
    if (!nestedResponse.ok) {
      continue;
    }
    pageUrls.push(...Array.from(nestedXml.matchAll(/<loc>([^<]+)<\/loc>/g), (match) => match[1].trim()));
  }
  return pageUrls;
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 20_000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchWithRetries(url, options = {}, timeoutMs = 20_000, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fetchWithTimeout(url, options, timeoutMs);
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await delay(250 * attempt);
      }
    }
  }
  throw lastError;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractJsonLd(html, pageUrl, result) {
  const scripts = Array.from(html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi));
  const schemas = [];
  for (const script of scripts) {
    const text = script[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&').trim();
    if (!text) continue;
    try {
      schemas.push(JSON.parse(text));
    } catch (error) {
      result.parseErrors.push({ url: pageUrl, error: error.message });
    }
  }
  return schemas;
}

function flattenSchema(schema) {
  if (!schema) return [];
  if (Array.isArray(schema)) {
    return schema.flatMap(flattenSchema);
  }
  const graph = Array.isArray(schema['@graph']) ? schema['@graph'] : [];
  return [schema, ...graph.flatMap(flattenSchema)];
}

function offerHasPrice(offers) {
  const offerList = Array.isArray(offers) ? offers : [offers].filter(Boolean);
  return offerList.some((offer) => {
    if (!offer || typeof offer !== 'object') return false;
    if (offer.price || offer.lowPrice || offer.highPrice) return true;
    const spec = offer.priceSpecification;
    const specs = Array.isArray(spec) ? spec : [spec].filter(Boolean);
    return specs.some((item) => item?.price || item?.minPrice || item?.maxPrice);
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const command = args._[0] || 'help';
  if (args.help || command === 'help') {
    usage();
    return;
  }
  if (command === 'auth') {
    await auth(args);
    return;
  }
  if (command === 'sites') {
    await sites(args);
    return;
  }
  if (command === 'sitemaps') {
    await sitemaps(args);
    return;
  }
  if (command === 'inspect') {
    await inspect(args);
    return;
  }
  if (command === 'live-schema') {
    await liveSchema(args);
    return;
  }
  throw new Error(`Unknown command: ${command}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
