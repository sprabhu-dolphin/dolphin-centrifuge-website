#!/usr/bin/env node

// General-purpose Gmail API helper for Dolphin Centrifuge automation.
// Purpose: a connector-independent Gmail path (Codex Desktop connector NOT required).
// Gmail OAuth tokens are stored outside the repo under %APPDATA%/gcloud.
//
// Safety model:
//   - Read commands (profile/search/read/thread/labels/attachments/download-attachment)
//     work with either token.
//   - Write commands are DRAFTS and LABELS only. There is deliberately NO send
//     command in this helper. Sanjay reviews and sends drafts from Gmail himself.
//   - Never print token or secret values.

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
const helperTokenPath = path.join(gcloudDir, 'dolphin-gmail-helper-token.json');
const readonlyTokenPath = path.join(gcloudDir, 'dolphin-gmail-readonly-token.json');
const saKeyPath = path.join(gcloudDir, 'dolphin-gmail-sa-key.json');
const helperScopes = [
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.compose',
].join(' ');

const WRITE_COMMANDS = new Set(['create-draft', 'update-draft', 'create-label', 'label']);

// Least-privilege scope per command for service-account (domain-wide delegation) access.
const COMMAND_SCOPES = {
  profile: 'https://www.googleapis.com/auth/gmail.readonly',
  search: 'https://www.googleapis.com/auth/gmail.readonly',
  read: 'https://www.googleapis.com/auth/gmail.readonly',
  thread: 'https://www.googleapis.com/auth/gmail.readonly',
  attachments: 'https://www.googleapis.com/auth/gmail.readonly',
  'download-attachment': 'https://www.googleapis.com/auth/gmail.readonly',
  labels: 'https://www.googleapis.com/auth/gmail.readonly',
  'create-label': 'https://www.googleapis.com/auth/gmail.modify',
  label: 'https://www.googleapis.com/auth/gmail.modify',
  'create-draft': 'https://www.googleapis.com/auth/gmail.compose https://www.googleapis.com/auth/gmail.readonly',
  'update-draft': 'https://www.googleapis.com/auth/gmail.compose https://www.googleapis.com/auth/gmail.readonly',
};
const ACCESS_TOKEN_EARLY_EXPIRY_MS = 60_000;
const DEFAULT_ACCESS_TOKEN_LIFETIME_MS = 60 * 60_000;
const SEARCH_HYDRATION_CONCURRENCY = 6;
const accessTokenCache = new Map();

async function mapBoundedOrdered(items, concurrency, mapper) {
  const results = new Array(items.length); let next = 0;
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (next < items.length) { const index = next++;
      results[index] = await mapper(items[index], index);
    }
  }));
  return results;
}

function accessTokenCacheKey(args, command) {
  const mailbox = String(
    args.mailbox || 'sprabhu@dolphincentrifuge.com',
  ).trim().toLowerCase();
  const scope = COMMAND_SCOPES[command] || COMMAND_SCOPES.profile;
  return `${mailbox}\u0000${scope}`;
}

async function commandAccessToken(args, command, {
  cache = accessTokenCache,
  load = () => getAccessToken(args, command),
  now = () => Date.now(),
} = {}) {
  const key = accessTokenCacheKey(args, command);
  const nowMs = now();
  const existing = cache.get(key);
  if (
    existing &&
    existing.expiresAt - ACCESS_TOKEN_EARLY_EXPIRY_MS > nowMs
  ) return existing.promise;

  const pending = Promise.resolve()
    .then(load)
    .then((record) => {
      const accessToken = String(record?.accessToken || '');
      if (!accessToken) throw new Error('Gmail access-token response was empty.');
      const expiresAt = Number.isFinite(record?.expiresAt)
        ? Number(record.expiresAt)
        : now() + DEFAULT_ACCESS_TOKEN_LIFETIME_MS;
      if (cache.get(key)?.promise === pending) {
        cache.set(key, {
          promise: Promise.resolve(accessToken),
          expiresAt,
        });
      }
      return accessToken;
    })
    .catch((error) => {
      if (cache.get(key)?.promise === pending) cache.delete(key);
      throw error;
    });
  // Infinity keeps every caller on this exact in-flight acquisition. The
  // resolved record replaces it with the provider expiry before reuse.
  cache.set(key, { promise: pending, expiresAt: Number.POSITIVE_INFINITY });
  return pending;
}

function usage() {
  console.log(`Dolphin Gmail helper (connector-independent Gmail API access)

Usage:
  node gmail-helper.mjs auth [--login-hint sprabhu@dolphincentrifuge.com]
  node gmail-helper.mjs profile [--mailbox EMAIL] [--json]
  node gmail-helper.mjs search --query "from:x newer_than:7d" [--mailbox EMAIL] [--max 25]
        [--page-token TOKEN] [--envelope] [--json]
  node gmail-helper.mjs read --id MESSAGE_ID [--mailbox EMAIL] [--json]
  node gmail-helper.mjs thread --id THREAD_ID [--mailbox EMAIL] [--json]
  node gmail-helper.mjs attachments --id MESSAGE_ID [--mailbox EMAIL] [--json]
  node gmail-helper.mjs download-attachment --id MESSAGE_ID (--attachment-id ATTACHMENT_ID | --filename NAME)
        [--filename-index 1]
        --output FILE [--overwrite] [--mailbox EMAIL] [--json]
  node gmail-helper.mjs labels [--mailbox EMAIL] [--json]
  node gmail-helper.mjs create-label --name "LabelName" [--mailbox EMAIL] [--json]
  node gmail-helper.mjs label --id MESSAGE_ID [--add "LabelName"] [--remove "LabelName"] [--mailbox EMAIL]
  node gmail-helper.mjs create-draft --to EMAIL --subject "..." (--body "text" | --body-file FILE)
        [--cc EMAIL] [--html] [--attach FILE ...] [--attach-name NAME ...]
        [--inline-attach FILE ...] [--inline-name NAME ...] [--inline-cid CID ...]
        [--verified-safe-newer-message-id MSG_ID ...]
        [--reply-to-message-id MSG_ID] [--force-anchor] [--standalone] [--mailbox EMAIL]
  node gmail-helper.mjs update-draft --draft-id DRAFT_ID --to EMAIL --subject "..."
        (--body "text" | --body-file FILE) [same attachment and reply options as create-draft]
  node gmail-helper.mjs self-test

Access modes:
  - Default (no --mailbox): Sanjay's own mailbox via OAuth refresh tokens.
      helper (read/write): ${helperTokenPath}
      readonly (fallback): ${readonlyTokenPath}
    Write commands (create-draft, update-draft, create-label, label) REQUIRE the helper token; run auth once
    (one browser consent click). Scopes: ${helperScopes}
  - --mailbox EMAIL: ANY dolphincentrifuge.com mailbox (jkraft@, devans@, sprabhu@, ...)
    via the domain-wide-delegated service account. Requires:
      key file: ${saKeyPath}
      one-time Admin console grant (Security > API Controls > Domain-wide delegation).
    Uses least-privilege scopes per command (readonly for reads, modify/compose for writes).

Notes:
  - There is intentionally NO send command. Drafts only.
  - A reply anchor must be the newest real message. --force-anchor is an explicit logged override.
  - Anchorless drafts check for recent correspondent activity; --standalone asserts a deliberate clean email.
  - This script never stores secrets in the repo and never prints token values.`);
}

function parseArgs(argv) {
  const args = { _: [] };
  const assign = (key, value) => {
    if ([
      'attach',
      'attach-name',
      'inline-attach',
      'inline-name',
      'inline-cid',
      'verified-safe-newer-message-id',
    ].includes(key)) {
      args[key] = [...(Array.isArray(args[key]) ? args[key] : []), value];
      return;
    }
    args[key] = value;
  };
  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (!item.startsWith('--')) { args._.push(item); continue; }
    const eq = item.indexOf('=');
    if (eq !== -1) { assign(item.slice(2, eq), item.slice(eq + 1)); continue; }
    const key = item.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) { assign(key, true); } else { assign(key, next); i += 1; }
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
  if (!client?.client_id || !client?.client_secret) {
    throw new Error(`OAuth client file missing client_id/client_secret: ${clientPath}`);
  }
  return {
    clientId: client.client_id,
    clientSecret: client.client_secret,
    authUri: client.auth_uri || 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUri: client.token_uri || 'https://oauth2.googleapis.com/token',
  };
}

function openInBrowser(url) {
  return new Promise((resolve) => {
    if (process.platform === 'win32') {
      const child = spawn('rundll32.exe', ['url.dll,FileProtocolHandler', url], {
        detached: true,
        stdio: 'ignore',
        windowsHide: true,
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

let lastRedirectUri = '';

async function exchangeCodeForToken({ client, code, redirectUri }) {
  const params = new URLSearchParams({
    client_id: client.clientId,
    client_secret: client.clientSecret,
    code,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
  });
  const response = await fetch(client.tokenUri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`OAuth token exchange failed (${response.status}): ${JSON.stringify(body)}`);
  return {
    ...body,
    scope: body.scope || helperScopes,
    token_uri: client.tokenUri,
    saved_at: new Date().toISOString(),
  };
}

async function auth(args) {
  const clientPath = args.client || defaultClientPath;
  const tokenPath = args.token || helperTokenPath;
  const client = await readClient(clientPath);
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
        res.end('Gmail helper authorization is complete. You can close this tab.');
        resolve(code);
        server.close();
      } catch (err) {
        reject(err);
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
      url.searchParams.set('scope', helperScopes);
      url.searchParams.set('access_type', 'offline');
      url.searchParams.set('prompt', 'consent');
      url.searchParams.set('login_hint', args['login-hint'] || 'sprabhu@dolphincentrifuge.com');
      url.searchParams.set('state', state);

      console.log('Opening Google OAuth consent in the browser...');
      console.log(`Requested scopes: ${helperScopes}`);
      console.log(`Token will be stored at: ${tokenPath}`);
      await openInBrowser(url.toString());
      console.log('Waiting for Google OAuth callback...');
    });
  });

  const token = await exchangeCodeForToken({ client, code: authCode, redirectUri: lastRedirectUri });
  await writeJson(tokenPath, token);
  console.log('Gmail helper token saved.');
  console.log(`Token path: ${tokenPath}`);
}

function resolveTokenPath(args, command) {
  if (args.token) return args.token;
  if (existsSync(helperTokenPath)) return helperTokenPath;
  if (WRITE_COMMANDS.has(command)) {
    throw new Error(
      `Write command "${command}" needs the helper token, which does not exist yet: ${helperTokenPath}\n` +
      'Run: npm run gmail:auth (one browser consent click by Sanjay), then retry.'
    );
  }
  if (existsSync(readonlyTokenPath)) return readonlyTokenPath;
  throw new Error(`No Gmail token found at ${helperTokenPath} or ${readonlyTokenPath}. Run: npm run gmail:auth`);
}

function buildServiceAccountJwt({ saEmail, privateKey, mailbox, scope, tokenUri }) {
  const now = Math.floor(Date.now() / 1000);
  const header = encodeBase64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = encodeBase64Url(JSON.stringify({
    iss: saEmail,
    sub: mailbox,
    scope,
    aud: tokenUri,
    iat: now,
    exp: now + 3600,
  }));
  const signingInput = `${header}.${claims}`;
  const signature = crypto.sign('RSA-SHA256', Buffer.from(signingInput, 'utf8'), privateKey)
    .toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${signingInput}.${signature}`;
}

async function getServiceAccountAccessToken(args, command) {
  const keyPath = args['sa-key'] || saKeyPath;
  if (!existsSync(keyPath)) {
    throw new Error(`Service account key not found: ${keyPath}\n--mailbox requires the domain-wide-delegated service account key.`);
  }
  const key = await readJson(keyPath);
  if (!key.client_email || !key.private_key) throw new Error(`Service account key file is missing client_email/private_key: ${keyPath}`);
  const mailbox = String(args.mailbox).toLowerCase();
  if (!mailbox.endsWith('@dolphincentrifuge.com')) {
    throw new Error(`--mailbox must be a dolphincentrifuge.com address, got: ${mailbox}`);
  }
  const scope = COMMAND_SCOPES[command] || COMMAND_SCOPES.profile;
  const tokenUri = key.token_uri || 'https://oauth2.googleapis.com/token';
  const assertion = buildServiceAccountJwt({
    saEmail: key.client_email,
    privateKey: key.private_key,
    mailbox,
    scope,
    tokenUri,
  });
  const res = await fetch(tokenUri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }),
  });
  const json = await res.json();
  if (!res.ok) {
    const hint = JSON.stringify(json).includes('unauthorized_client')
      ? '\nHint: domain-wide delegation is not granted (or scopes mismatch) in Admin console > Security > API Controls > Domain-wide delegation.'
      : '';
    throw new Error(`Service account token failed for ${mailbox}: ${JSON.stringify(json)}${hint}`);
  }
  return {
    accessToken: json.access_token,
    expiresAt: Date.now() +
      (Number(json.expires_in) || DEFAULT_ACCESS_TOKEN_LIFETIME_MS / 1000) * 1000,
  };
}

async function getAccessToken(args, command) {
  if (args.mailbox) return getServiceAccountAccessToken(args, command);
  const tokenPath = resolveTokenPath(args, command);
  const clientPath = args.client || defaultClientPath;
  const token = await readJson(tokenPath);
  const client = await readClient(clientPath);
  if (!token.refresh_token) throw new Error(`Gmail token has no refresh_token: ${tokenPath}`);
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
  if (!res.ok) throw new Error(`Gmail token refresh failed (${tokenPath}): ${JSON.stringify(json)}`);
  return {
    accessToken: json.access_token,
    expiresAt: Date.now() +
      (Number(json.expires_in) || DEFAULT_ACCESS_TOKEN_LIFETIME_MS / 1000) * 1000,
  };
}

async function gmailFetch(args, command, url, init = {}) {
  const accessToken = await commandAccessToken(args, command);
  const headers = { Authorization: `Bearer ${accessToken}`, ...(init.headers || {}) };
  const res = await fetch(url, { ...init, headers });
  const text = await res.text();
  let json;
  try { json = text ? JSON.parse(text) : {}; } catch { json = { raw: text }; }
  if (!res.ok) throw new Error(`Gmail API ${res.status}: ${JSON.stringify(json).slice(0, 1200)}`);
  return json;
}

function decodeBase64Url(value) {
  if (!value) return '';
  const normalized = String(value).replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  return Buffer.from(padded, 'base64').toString('utf8');
}

function decodeBase64UrlBuffer(value) {
  if (!value) return Buffer.alloc(0);
  const normalized = String(value).replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  return Buffer.from(padded, 'base64');
}

function encodeBase64Url(value) {
  return Buffer.from(value, 'utf8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function headerValue(message, name) {
  const headers = message?.payload?.headers || [];
  const match = headers.find((h) => String(h.name).toLowerCase() === name.toLowerCase());
  return match?.value || '';
}

function mimePartHeaderValue(part, name) {
  const headers = part?.headers || [];
  const match = headers.find(
    (header) => String(header?.name || '').toLowerCase() === name.toLowerCase(),
  );
  return String(match?.value || '');
}

function isAttachmentMimePart(part) {
  if (!part) return false;
  const disposition = mimePartHeaderValue(part, 'Content-Disposition');
  return Boolean(String(part.filename || '').trim())
    || /\battachment\b/i.test(disposition)
    || String(part.mimeType || '').toLowerCase() === 'message/rfc822';
}

function extractPlainText(part, out = []) {
  if (!part || isAttachmentMimePart(part)) return out;
  if (part.mimeType === 'text/plain' && part.body?.data) out.push(decodeBase64Url(part.body.data));
  for (const child of part.parts || []) extractPlainText(child, out);
  return out;
}

function extractHtmlText(part, out = []) {
  if (!part || isAttachmentMimePart(part)) return out;
  if (part.mimeType === 'text/html' && part.body?.data) out.push(decodeBase64Url(part.body.data));
  for (const child of part.parts || []) extractHtmlText(child, out);
  return out;
}

function collectAttachments(part, out = []) {
  if (!part) return out;
  const contentId = (part.headers || [])
    .find(header => String(header.name || '').toLowerCase() === 'content-id')?.value
    ?.replace(/[<>]/g, '') || '';
  if (part.filename || contentId) {
    out.push({
      filename: part.filename || contentId,
      mimeType: part.mimeType || 'application/octet-stream',
      size: Number(part.body?.size || 0),
      attachmentId: part.body?.attachmentId || '',
      inlineData: Boolean(part.body?.data),
      contentId,
    });
  }
  for (const child of part.parts || []) collectAttachments(child, out);
  return out;
}

function findAttachmentPart(part, attachmentId) {
  if (!part) return null;
  if (part.body?.attachmentId === attachmentId) return part;
  for (const child of part.parts || []) {
    const match = findAttachmentPart(child, attachmentId);
    if (match) return match;
  }
  return null;
}

function findAttachmentPartByFilename(part, filename, occurrence = 1, matches = []) {
  if (!part) return null;
  if (part.filename === filename) matches.push(part);
  for (const child of part.parts || []) findAttachmentPartByFilename(child, filename, occurrence, matches);
  return matches[Math.max(1, Number(occurrence || 1)) - 1] || null;
}

function summarizeMessage(message) {
  return {
    id: message.id,
    threadId: message.threadId,
    internalDate: String(message.internalDate || ''),
    date: headerValue(message, 'Date'),
    from: headerValue(message, 'From'),
    to: headerValue(message, 'To'),
    cc: headerValue(message, 'Cc'),
    bcc: headerValue(message, 'Bcc'),
    replyTo: headerValue(message, 'Reply-To'),
    subject: headerValue(message, 'Subject'),
    messageIdHeader: headerValue(message, 'Message-ID'),
    inReplyTo: headerValue(message, 'In-Reply-To'),
    references: headerValue(message, 'References'),
    listUnsubscribe: headerValue(message, 'List-Unsubscribe'),
    precedence: headerValue(message, 'Precedence'),
    snippet: message.snippet || '',
    labelIds: message.labelIds || [],
  };
}

function printSummaries(items) {
  for (const item of items) {
    console.log(`${item.id} | ${item.date} | ${item.from} | ${item.subject}`);
    if (item.snippet) console.log(`  ${item.snippet}`);
  }
}

async function profile(args) {
  const json = await gmailFetch(args, 'profile', 'https://gmail.googleapis.com/gmail/v1/users/me/profile');
  if (args.json) { console.log(JSON.stringify(json, null, 2)); return; }
  console.log(`Gmail profile OK: ${json.emailAddress} (messagesTotal=${json.messagesTotal}, historyId=${json.historyId})`);
}

async function search(args) {
  if (!args.query) throw new Error('search requires --query');
  const max = Math.max(1, Math.min(100, Number(args.max || 25)));
  const url = new URL('https://gmail.googleapis.com/gmail/v1/users/me/messages');
  url.searchParams.set('q', String(args.query));
  url.searchParams.set('maxResults', String(max));
  if (args['page-token']) {
    url.searchParams.set('pageToken', String(args['page-token']));
  }
  const list = await gmailFetch(args, 'search', url);
  const ids = (list.messages || []).map((m) => m.id).filter(Boolean);
  const summaries = await mapBoundedOrdered(ids, SEARCH_HYDRATION_CONCURRENCY, async (id) => {
    const msgUrl = new URL(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}`);
    msgUrl.searchParams.set('format', 'metadata');
    for (const header of ['From', 'To', 'Cc', 'Bcc', 'Reply-To', 'Subject', 'Date', 'Message-ID', 'In-Reply-To', 'References', 'List-Unsubscribe', 'Precedence']) {
      msgUrl.searchParams.append('metadataHeaders', header);
    }
    return summarizeMessage(await gmailFetch(args, 'search', msgUrl));
  });
  if (args.json) {
    const output = flagEnabled(args.envelope)
      ? {
          items: summaries,
          nextPageToken: String(list.nextPageToken || ''),
          complete: !list.nextPageToken,
        }
      : summaries;
    console.log(JSON.stringify(output, null, 2));
    return;
  }
  if (!summaries.length) { console.log('No messages matched.'); return; }
  printSummaries(summaries);
}

async function read(args) {
  if (!args.id) throw new Error('read requires --id MESSAGE_ID');
  const url = new URL(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${args.id}`);
  url.searchParams.set('format', 'full');
  const message = await gmailFetch(args, 'read', url);
  const summary = summarizeMessage(message);
  const bodyText = extractPlainText(message.payload).join('\n').trim();
  const htmlBody = extractHtmlText(message.payload).join('\n').trim();
  if (args.json) { console.log(JSON.stringify({ ...summary, body: bodyText, htmlBody }, null, 2)); return; }
  console.log(`From: ${summary.from}`);
  console.log(`To: ${summary.to}`);
  console.log(`Date: ${summary.date}`);
  console.log(`Subject: ${summary.subject}`);
  console.log(`Labels: ${summary.labelIds.join(', ')}`);
  console.log('');
  console.log(bodyText || `(no text/plain body) snippet: ${summary.snippet}`);
}

async function thread(args) {
  if (!args.id) throw new Error('thread requires --id THREAD_ID');
  const url = new URL(`https://gmail.googleapis.com/gmail/v1/users/me/threads/${args.id}`);
  url.searchParams.set('format', 'metadata');
  for (const header of ['From', 'To', 'Cc', 'Bcc', 'Reply-To', 'Subject', 'Date', 'Message-ID', 'In-Reply-To', 'References', 'List-Unsubscribe', 'Precedence']) {
    url.searchParams.append('metadataHeaders', header);
  }
  const json = await gmailFetch(args, 'thread', url);
  const summaries = (json.messages || []).map(summarizeMessage);
  if (args.json) { console.log(JSON.stringify(summaries, null, 2)); return; }
  console.log(`Thread ${args.id}: ${summaries.length} message(s)`);
  printSummaries(summaries);
}

async function attachments(args) {
  if (!args.id) throw new Error('attachments requires --id MESSAGE_ID');
  const url = new URL(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${args.id}`);
  url.searchParams.set('format', 'full');
  const message = await gmailFetch(args, 'attachments', url);
  const items = collectAttachments(message.payload);
  if (args.json) {
    console.log(JSON.stringify({ message: summarizeMessage(message), attachments: items }, null, 2));
    return;
  }
  if (!items.length) { console.log('No attachments found.'); return; }
  for (const item of items) {
    console.log(`${item.attachmentId || '(inline)'} | ${item.size} bytes | ${item.mimeType} | ${item.filename}`);
  }
}

async function downloadAttachment(args) {
  const requestedAttachmentId = args['attachment-id'];
  const requestedFilename = args.filename;
  const requestedFilenameIndex = Math.max(1, Number(args['filename-index'] || 1));
  if (!args.id) throw new Error('download-attachment requires --id MESSAGE_ID');
  if (!requestedAttachmentId && !requestedFilename) {
    throw new Error('download-attachment requires --attachment-id ATTACHMENT_ID or --filename NAME');
  }
  if (!args.output) throw new Error('download-attachment requires --output FILE');

  const messageUrl = new URL(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${args.id}`);
  messageUrl.searchParams.set('format', 'full');
  const message = await gmailFetch(args, 'download-attachment', messageUrl);
  const part = requestedFilename
    ? findAttachmentPartByFilename(message.payload, String(requestedFilename), requestedFilenameIndex)
    : findAttachmentPart(message.payload, String(requestedAttachmentId));
  if (!part) {
    const target = requestedFilename || requestedAttachmentId;
    throw new Error(`Attachment not found on message ${args.id}: ${target}`);
  }
  const attachmentId = part.body?.attachmentId || '';

  let payload;
  if (part.body?.data) {
    payload = { data: part.body.data, size: part.body.size };
  } else {
    if (!attachmentId) throw new Error(`Attachment has no downloadable data: ${part.filename || requestedFilename}`);
    const attachmentUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${args.id}/attachments/${encodeURIComponent(String(attachmentId))}`;
    payload = await gmailFetch(args, 'download-attachment', attachmentUrl);
  }
  const bytes = decodeBase64UrlBuffer(payload.data);
  const expectedSize = Number(payload.size || part.body?.size || 0);
  if (expectedSize && bytes.length !== expectedSize) {
    throw new Error(`Attachment size mismatch: expected ${expectedSize} bytes, received ${bytes.length}`);
  }

  const outputPath = path.resolve(String(args.output));
  const parent = path.dirname(outputPath);
  if (!existsSync(parent)) throw new Error(`Output folder does not exist: ${parent}`);
  if (existsSync(outputPath) && !args.overwrite) {
    throw new Error(`Output file already exists (use --overwrite to replace it): ${outputPath}`);
  }
  await fs.writeFile(outputPath, bytes, { flag: args.overwrite ? 'w' : 'wx' });

  const result = {
    messageId: message.id,
    attachmentId: String(attachmentId),
    filename: part.filename || path.basename(outputPath),
    mimeType: part.mimeType || 'application/octet-stream',
    size: bytes.length,
    output: outputPath,
  };
  if (args.json) { console.log(JSON.stringify(result, null, 2)); return; }
  console.log(`Attachment saved: ${result.filename} (${result.size} bytes) -> ${result.output}`);
}

async function listLabels(args) {
  const json = await gmailFetch(args, 'labels', 'https://gmail.googleapis.com/gmail/v1/users/me/labels');
  const labels = (json.labels || []).map((l) => ({ id: l.id, name: l.name, type: l.type }));
  if (args.json) { console.log(JSON.stringify(labels, null, 2)); return; }
  for (const label of labels.sort((a, b) => a.name.localeCompare(b.name))) {
    console.log(`${label.id} | ${label.name} | ${label.type}`);
  }
}

async function createLabel(args) {
  const name = String(args.name || '').trim();
  if (!name) throw new Error('create-label requires --name "LabelName"');

  const current = await gmailFetch(
    args,
    'create-label',
    'https://gmail.googleapis.com/gmail/v1/users/me/labels',
  );
  const existing = (current.labels || []).find(
    (item) => String(item.name || '').toLowerCase() === name.toLowerCase(),
  );
  if (existing) {
    const result = {
      action: 'reused_existing',
      id: existing.id,
      name: existing.name,
      type: existing.type,
    };
    if (args.json) { console.log(JSON.stringify(result, null, 2)); return; }
    console.log(`Label already exists: ${result.id} | ${result.name}`);
    return;
  }

  const created = await gmailFetch(
    args,
    'create-label',
    'https://gmail.googleapis.com/gmail/v1/users/me/labels',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        labelListVisibility: 'labelShow',
        messageListVisibility: 'show',
      }),
    },
  );
  const result = {
    action: 'created',
    id: created.id,
    name: created.name,
    type: created.type,
  };
  if (args.json) { console.log(JSON.stringify(result, null, 2)); return; }
  console.log(`Label created: ${result.id} | ${result.name}`);
}

async function resolveLabelId(args, name) {
  const json = await gmailFetch(args, 'label', 'https://gmail.googleapis.com/gmail/v1/users/me/labels');
  const match = (json.labels || []).find(
    (l) => l.name === name || l.id === name || l.name.toLowerCase() === String(name).toLowerCase()
  );
  if (!match) throw new Error(`Label not found: ${name}`);
  return match.id;
}

async function label(args) {
  if (!args.id) throw new Error('label requires --id MESSAGE_ID');
  if (!args.add && !args.remove) throw new Error('label requires --add and/or --remove');
  const body = { addLabelIds: [], removeLabelIds: [] };
  if (args.add) body.addLabelIds.push(await resolveLabelId(args, String(args.add)));
  if (args.remove) body.removeLabelIds.push(await resolveLabelId(args, String(args.remove)));
  const json = await gmailFetch(args, 'label',
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${args.id}/modify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  console.log(`Labels updated on ${json.id}: now [${(json.labelIds || []).join(', ')}]`);
}

// Convert plain text to safe HTML so drafts always open in Gmail's
// rich-text composer. A text/plain draft locks the composer into
// plain-text mode: the saved signature loses its links and the rich
// signature cannot be inserted manually. (Fix 2026-07-15)
function plainTextToHtml(text) {
  const escaped = String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  // Permit a narrowly scoped Markdown-style HTTPS link so Review Station
  // drafts can show a clean phrase instead of exposing a long payment URL.
  // Everything is escaped first; only the explicit [label](https://...) form
  // is converted back into an anchor.
  const linked = escaped.replace(
    /\[([^\]\r\n]+)\]\((https:\/\/[^\s<>"')]+)\)/g,
    '<a href="$2">$1</a>',
  );
  return `<div dir="ltr">${linked.replace(/\r?\n/g, '<br>\r\n')}</div>`;
}

function safeHeader(value) {
  return String(value || '').replace(/[\r\n]+/g, ' ').trim();
}

function attachmentMimeType(filename) {
  const extension = path.extname(String(filename || '')).toLowerCase();
  return {
    '.csv': 'text/csv',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.gif': 'image/gif',
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpeg',
    '.pdf': 'application/pdf',
    '.png': 'image/png',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.txt': 'text/plain',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.zip': 'application/zip',
  }[extension] || 'application/octet-stream';
}

function attachmentFilename(value) {
  return path.basename(safeHeader(value)).replace(/\\/g, '\\\\').replace(/"/g, '\\"') || 'attachment';
}

function wrapBase64(buffer) {
  return buffer.toString('base64').match(/.{1,76}/g)?.join('\r\n') || '';
}

function buildMime({
  to, cc, subject, body, html, inReplyTo, references,
  attachments = [], inlineAttachments = [],
}) {
  const lines = [];
  lines.push(`To: ${safeHeader(to)}`);
  if (cc) lines.push(`Cc: ${safeHeader(cc)}`);
  lines.push(`Subject: ${safeHeader(subject)}`);
  if (inReplyTo) lines.push(`In-Reply-To: ${safeHeader(inReplyTo)}`);
  if (references) lines.push(`References: ${safeHeader(references)}`);
  lines.push('MIME-Version: 1.0');
  const htmlBody = html ? body : plainTextToHtml(body);
  if (attachments.length || inlineAttachments.length) {
    const boundary = `dolphin_${crypto.randomBytes(18).toString('hex')}`;
    lines.push(`Content-Type: multipart/mixed; boundary="${boundary}"`);
    lines.push('');
    if (inlineAttachments.length) {
      const relatedBoundary = `dolphin_related_${crypto.randomBytes(18).toString('hex')}`;
      lines.push(`--${boundary}`);
      lines.push(`Content-Type: multipart/related; boundary="${relatedBoundary}"`);
      lines.push('');
      lines.push(`--${relatedBoundary}`);
      lines.push('Content-Type: text/html; charset="UTF-8"');
      lines.push('Content-Transfer-Encoding: 7bit');
      lines.push('');
      lines.push(htmlBody);
      for (const attachment of inlineAttachments) {
        const filename = attachmentFilename(attachment.filename);
        const contentId = safeHeader(attachment.contentId);
        lines.push(`--${relatedBoundary}`);
        lines.push(`Content-Type: ${attachment.mimeType}; name="${filename}"`);
        lines.push(`Content-Disposition: inline; filename="${filename}"`);
        lines.push(`Content-ID: <${contentId}>`);
        lines.push('Content-Transfer-Encoding: base64');
        lines.push('');
        lines.push(wrapBase64(attachment.data));
      }
      lines.push(`--${relatedBoundary}--`);
    } else {
      lines.push(`--${boundary}`);
      lines.push('Content-Type: text/html; charset="UTF-8"');
      lines.push('Content-Transfer-Encoding: 7bit');
      lines.push('');
      lines.push(htmlBody);
    }
    for (const attachment of attachments) {
      const filename = attachmentFilename(attachment.filename);
      lines.push(`--${boundary}`);
      lines.push(`Content-Type: ${attachment.mimeType}; name="${filename}"`);
      lines.push(`Content-Disposition: attachment; filename="${filename}"`);
      lines.push('Content-Transfer-Encoding: base64');
      lines.push('');
      lines.push(wrapBase64(attachment.data));
    }
    lines.push(`--${boundary}--`);
    return lines.join('\r\n');
  }
  // ALWAYS text/html: --html means "body is already HTML"; plain bodies
  // are escaped and converted. Never emit text/plain (see note above).
  lines.push('Content-Type: text/html; charset="UTF-8"');
  lines.push('Content-Transfer-Encoding: 7bit');
  lines.push('');
  lines.push(htmlBody);
  return lines.join('\r\n');
}

function flagEnabled(value) {
  return value === true || String(value || '').trim().toLowerCase() === 'true';
}

function isDraftMessage(message) {
  return Array.isArray(message?.labelIds) && message.labelIds.includes('DRAFT');
}

function newestRealMessage(messages) {
  return [...(messages || [])]
    .filter(message => !isDraftMessage(message))
    .sort((left, right) => Number(left.internalDate || 0) - Number(right.internalDate || 0))
    .at(-1);
}

function inspectReplyAnchorPlacement(messages, replyToMessageId, verifiedSafeIds = []) {
  const orderedReal = [...(messages || [])]
    .filter(message => !isDraftMessage(message))
    .sort((left, right) => Number(left.internalDate || 0) - Number(right.internalDate || 0));
  const newest = orderedReal.at(-1) || null;
  const anchorIndex = orderedReal.findIndex(message => message.id === replyToMessageId);
  const laterIds = anchorIndex < 0
    ? []
    : orderedReal.slice(anchorIndex + 1).map(message => String(message.id || ''));
  const verifiedSafe = new Set(verifiedSafeIds);
  return {
    newest,
    anchorIndex,
    laterIds,
    unverifiedLaterIds: laterIds.filter(id => !verifiedSafe.has(id)),
    unusedVerifiedIds: verifiedSafeIds.filter(id => !laterIds.includes(id)),
  };
}

function isReplyStyleSubject(value) {
  const confusableSkeleton = String(value || '')
    .normalize('NFKC')
    .replace(/\p{Cf}/gu, '')
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[\u0433\u0491\u04f7\u0393\u03a1\u03c1\u0420\u0440]/gu, 'r')
    .replace(/[\u03b5\u0395\u0435\u0415\u025b\u0258]/gu, 'e')
    .replace(/[\u0192\u03dc\u03dd\u0492\u0493]/gu, 'f')
    .replace(/[\u03c9\u03a9\u051d\u051c\u0428\u0448]/gu, 'w')
    .replace(/[\u0501\u0500]/gu, 'd')
    .replace(/[:\u02d0\u02f8\u0589\u05c3\u0703\u0704\u1361\u1803\u1809\u205a\u2236\u2997\ua789\ufe13\ufe30\ufe55\uff1a]/gu, ':');
  const compact = confusableSkeleton.trimStart().replace(/\s+/gu, '');
  const delimitedPrefix = compact.match(/^([\p{L}]{2,3})[\p{P}\p{S}]/u);
  if (delimitedPrefix) {
    const letters = delimitedPrefix[1];
    const ascii = letters.replace(/[^a-z]/g, '');
    if (new Set(['re', 'fw', 'fwd']).has(ascii)) return true;
    if (/[^\x00-\x7f]/.test(letters)) return true;
  }
  const colonIndex = confusableSkeleton.indexOf(':');
  if (colonIndex < 0) return false;
  const letters = confusableSkeleton.slice(0, colonIndex).replace(/[^\p{L}]/gu, '');
  const prefix = letters.replace(/[^a-z]/g, '');
  if (new Set(['re', 'fw', 'fwd']).has(prefix)) return true;
  const letterCount = Array.from(letters).length;
  return letterCount >= 2 && letterCount <= 3 && /[^\x00-\x7f]/.test(letters);
}

function correspondentAddress(value) {
  const matches = [...String(value || '').matchAll(/[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9.-]+\.[a-z]{2,}/gi)]
    .map(match => match[0].toLowerCase());
  const unique = [...new Set(matches)];
  if (unique.length !== 1) {
    throw new Error('An anchorless draft requires exactly one unique recipient address, or explicit --standalone.');
  }
  return unique[0];
}

function recentCorrespondentQuery(recipient) {
  return `newer_than:30d -label:drafts {from:${recipient} to:${recipient} cc:${recipient}}`;
}

async function recentCorrespondentActivity(args, command, recipient) {
  const url = new URL('https://gmail.googleapis.com/gmail/v1/users/me/messages');
  url.searchParams.set('q', recentCorrespondentQuery(recipient));
  url.searchParams.set('maxResults', '1');
  const list = await gmailFetch(args, command, url);
  return (list.messages || [])[0] || null;
}

async function readReplyAnchor(args, command, messageId) {
  const url = new URL(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(messageId)}`);
  url.searchParams.set('format', 'metadata');
  for (const header of ['Message-ID', 'References', 'Subject']) url.searchParams.append('metadataHeaders', header);
  return gmailFetch(args, command, url);
}

async function readThreadMetadata(args, command, threadId) {
  const url = new URL(`https://gmail.googleapis.com/gmail/v1/users/me/threads/${encodeURIComponent(threadId)}`);
  url.searchParams.set('format', 'metadata');
  return gmailFetch(args, command, url);
}

async function createDraft(args) {
  const command = args._[0] === 'update-draft' ? 'update-draft' : 'create-draft';
  if (command === 'update-draft' && !args['draft-id']) throw new Error('update-draft requires --draft-id');
  if (!args.to) throw new Error('create-draft requires --to');
  if (!args.subject) throw new Error('create-draft requires --subject');
  let body = args.body;
  if (!body && args['body-file']) body = await fs.readFile(String(args['body-file']), 'utf8');
  if (!body) throw new Error('create-draft requires --body or --body-file');
  const replyToMessageId = String(args['reply-to-message-id'] || '').trim();
  const requestedThreadId = String(args['thread-id'] || '').trim();
  const standalone = flagEnabled(args.standalone);
  const forceAnchor = flagEnabled(args['force-anchor']);
  const verifiedSafeNewerMessageIds = Array.isArray(args['verified-safe-newer-message-id'])
    ? args['verified-safe-newer-message-id'].map(value => String(value || '').trim())
    : [];
  if (
    verifiedSafeNewerMessageIds.length > 32 ||
    verifiedSafeNewerMessageIds.some(value => !/^[a-z0-9_-]{1,200}$/i.test(value)) ||
    new Set(verifiedSafeNewerMessageIds).size !== verifiedSafeNewerMessageIds.length
  ) {
    throw new Error('Verified safe newer message IDs are malformed or exceed the limit.');
  }
  if (forceAnchor && verifiedSafeNewerMessageIds.length) {
    throw new Error('--force-anchor cannot be combined with verified safe newer message IDs.');
  }
  if (standalone && replyToMessageId) {
    throw new Error('--standalone cannot be combined with --reply-to-message-id');
  }
  if (standalone && requestedThreadId) {
    throw new Error('--standalone cannot be combined with --thread-id');
  }
  if (forceAnchor && !replyToMessageId) {
    throw new Error('--force-anchor requires --reply-to-message-id');
  }
  if (requestedThreadId && !replyToMessageId) {
    throw new Error(`${command} refuses --thread-id without --reply-to-message-id`);
  }
  if (!replyToMessageId && isReplyStyleSubject(args.subject)) {
    throw new Error('An anchorless draft cannot use a Re:, FW:, or Fwd: subject. Reply to the newest message instead.');
  }

  let original = null;
  let forceAnchorUsed = false;
  if (replyToMessageId) {
    original = await readReplyAnchor(args, command, replyToMessageId);
    if (!original.threadId || isDraftMessage(original)) {
      throw new Error('The reply anchor must be a real non-draft Gmail message.');
    }
    if (requestedThreadId && requestedThreadId !== original.threadId) {
      throw new Error(`The supplied thread id does not match the reply anchor thread ${original.threadId}.`);
    }
    const thread = await readThreadMetadata(args, command, original.threadId);
    const placement = inspectReplyAnchorPlacement(
      thread.messages,
      replyToMessageId,
      verifiedSafeNewerMessageIds,
    );
    const newest = placement.newest;
    if (!newest) throw new Error(`No real message exists in reply anchor thread ${original.threadId}.`);
    if (newest.id !== replyToMessageId) {
      if (placement.anchorIndex < 0) {
        throw new Error(`Reply anchor ${replyToMessageId} is not present in its Gmail thread.`);
      }
      if (!forceAnchor && (
        placement.unverifiedLaterIds.length ||
        placement.unusedVerifiedIds.length
      )) {
        throw new Error(
          `Reply anchor ${replyToMessageId} is stale. The newest real message is ${newest.id}. `
          + 'Reply to the newest message, or supply only exact caller-verified safe newer message IDs.',
        );
      }
      if (forceAnchor) {
        forceAnchorUsed = true;
        console.warn(
          `PLACEMENT OVERRIDE: --force-anchor accepted stale anchor ${replyToMessageId}; newest real message is ${newest.id}.`,
        );
      } else {
        console.warn(
          `PLACEMENT SAFE TAIL: accepted ${verifiedSafeNewerMessageIds.length} exact caller-verified newer message(s) after anchor ${replyToMessageId}.`,
        );
      }
    } else if (forceAnchor) {
      console.warn(`PLACEMENT OVERRIDE FLAG: --force-anchor supplied; anchor ${replyToMessageId} is already newest.`);
    } else if (verifiedSafeNewerMessageIds.length) {
      throw new Error('Verified safe newer message IDs were supplied, but the reply anchor is already newest.');
    }
  } else if (!standalone) {
    const recipient = correspondentAddress([args.to, args.cc, args.bcc].filter(Boolean).join(', '));
    const recent = await recentCorrespondentActivity(args, command, recipient);
    if (recent) {
      throw new Error(
        `Recent Gmail activity with ${recipient} exists. Newest thread id: ${recent.threadId}, message id: ${recent.id}. `
        + 'Reply to that message, or pass --standalone for a deliberate clean email.',
      );
    }
  }
  const attachments = [];
  const requestedAttachments = Array.isArray(args.attach) ? args.attach : [];
  const requestedNames = Array.isArray(args['attach-name']) ? args['attach-name'] : [];
  if (requestedNames.length && requestedNames.length !== requestedAttachments.length) {
    throw new Error('Each --attach-name must correspond to one --attach file');
  }
  for (let index = 0; index < requestedAttachments.length; index += 1) {
    const requestedPath = requestedAttachments[index];
    const attachmentPath = path.resolve(String(requestedPath));
    if (!existsSync(attachmentPath)) throw new Error(`Attachment file not found: ${attachmentPath}`);
    const data = await fs.readFile(attachmentPath);
    if (!data.length) throw new Error(`Attachment file is empty: ${attachmentPath}`);
    attachments.push({
      filename: requestedNames[index] ? path.basename(String(requestedNames[index])) : path.basename(attachmentPath),
      mimeType: attachmentMimeType(attachmentPath),
      data,
    });
  }
  const inlineAttachments = [];
  const requestedInlineAttachments = Array.isArray(args['inline-attach']) ? args['inline-attach'] : [];
  const requestedInlineNames = Array.isArray(args['inline-name']) ? args['inline-name'] : [];
  const requestedInlineCids = Array.isArray(args['inline-cid']) ? args['inline-cid'] : [];
  if (requestedInlineNames.length !== requestedInlineAttachments.length
      || requestedInlineCids.length !== requestedInlineAttachments.length) {
    throw new Error('Each --inline-attach requires one --inline-name and one --inline-cid');
  }
  for (let index = 0; index < requestedInlineAttachments.length; index += 1) {
    const attachmentPath = path.resolve(String(requestedInlineAttachments[index]));
    if (!existsSync(attachmentPath)) throw new Error(`Inline image file not found: ${attachmentPath}`);
    const data = await fs.readFile(attachmentPath);
    if (!data.length) throw new Error(`Inline image file is empty: ${attachmentPath}`);
    inlineAttachments.push({
      filename: path.basename(String(requestedInlineNames[index])),
      contentId: String(requestedInlineCids[index]).replace(/[<>\r\n]/g, ''),
      mimeType: attachmentMimeType(attachmentPath),
      data,
    });
  }

  let inReplyTo = '';
  let references = '';
  let threadId = requestedThreadId;
  if (original) {
    const originalMessageId = headerValue(original, 'Message-ID');
    inReplyTo = originalMessageId;
    references = [headerValue(original, 'References'), originalMessageId].filter(Boolean).join(' ');
    threadId = threadId || original.threadId;
  }

  const mime = buildMime({
    to: String(args.to),
    cc: args.cc ? String(args.cc) : '',
    subject: String(args.subject),
    body: String(body),
    html: Boolean(args.html),
    inReplyTo,
    references,
    attachments,
    inlineAttachments,
  });
  const draftBody = { message: { raw: encodeBase64Url(mime) } };
  if (threadId) draftBody.message.threadId = threadId;

  const endpoint = command === 'update-draft'
    ? `https://gmail.googleapis.com/gmail/v1/users/me/drafts/${encodeURIComponent(String(args['draft-id']))}`
    : 'https://gmail.googleapis.com/gmail/v1/users/me/drafts';
  const json = await gmailFetch(args, command,
    endpoint, {
      method: command === 'update-draft' ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draftBody),
    });
  console.log(`Draft ${command === 'update-draft' ? 'updated' : 'created'} (NOT sent). Draft id: ${json.id}, message id: ${json.message?.id}`);
  if (forceAnchorUsed) console.log('Placement override used: --force-anchor');
  if (attachments.length || inlineAttachments.length) {
    const allFiles = [...attachments, ...inlineAttachments];
    console.log(`Attachments: ${allFiles.length} | ${allFiles.map(item => item.filename).join(' | ')}`);
  }
  console.log('Review and send it from Gmail.');
}

async function selfTest() {
  const failures = [];
  const check = (name, cond) => { if (!cond) failures.push(name); };

  const args = parseArgs(['search', '--query', 'from:a b', '--max=5', '--json']);
  check('parseArgs positional', args._[0] === 'search');
  check('parseArgs spaced value', args.query === 'from:a b');
  check('parseArgs eq value', args.max === '5');
  check('parseArgs flag', args.json === true);
  const pagingArgs = parseArgs([
    'search', '--query', 'newer_than:1d', '--page-token', 'opaque-page',
    '--envelope', '--json',
  ]);
  check('parseArgs paging token', pagingArgs['page-token'] === 'opaque-page');
  check('parseArgs envelope flag', pagingArgs.envelope === true);
  let hydrationActive = 0, hydrationPeak = 0;
  const orderedHydration = await mapBoundedOrdered([3, 1, 2], 2, async (value) => {
    hydrationPeak = Math.max(hydrationPeak, ++hydrationActive);
    await Promise.resolve();
    hydrationActive--;
    return value;
  });
  check('bounded hydration preserves order', orderedHydration.join('|') === '3|1|2');
  check('bounded hydration respects concurrency', hydrationPeak === 2);
  let hydrationFailed = false;
  try { await mapBoundedOrdered([1, 2], 2, async (value) => {
    if (value === 2) throw new Error('hydrate failed');
    return value;
  }); } catch { hydrationFailed = true; }
  check('bounded hydration fails the whole search', hydrationFailed);
  check(
    'summary exposes authoritative Gmail time',
    summarizeMessage({
      id: 'message-1',
      threadId: 'thread-1',
      internalDate: '1234567890',
      payload: { headers: [] },
    }).internalDate === '1234567890',
  );
  const attachmentArgs = parseArgs([
    'create-draft',
    '--attach', 'one.pdf',
    '--attach=two.xlsx',
    '--attach-name', 'First brochure.pdf',
    '--attach-name=Second sheet.xlsx',
  ]);
  check('parseArgs repeated attachments', Array.isArray(attachmentArgs.attach)
    && attachmentArgs.attach.join('|') === 'one.pdf|two.xlsx');
  check('parseArgs repeated attachment names', Array.isArray(attachmentArgs['attach-name'])
    && attachmentArgs['attach-name'].join('|') === 'First brochure.pdf|Second sheet.xlsx');
  const safeTailArgs = parseArgs([
    'create-draft',
    '--verified-safe-newer-message-id', 'internal-forward-1',
    '--verified-safe-newer-message-id', 'automatic-reply-2',
  ]);
  check('parseArgs repeated verified safe newer IDs',
    Array.isArray(safeTailArgs['verified-safe-newer-message-id'])
      && safeTailArgs['verified-safe-newer-message-id'].join('|')
        === 'internal-forward-1|automatic-reply-2');
  check('standalone reply subject blocked', isReplyStyleSubject('  R\u200Be : Existing thread'));
  check('standalone reply subject blocked after long leading whitespace', isReplyStyleSubject(`${' '.repeat(80)}Re: Existing thread`));
  check('standalone reply subject blocked after long internal whitespace', isReplyStyleSubject(`R${' '.repeat(200)}e: Existing thread`));
  check('standalone reply subject blocks Cyrillic e', isReplyStyleSubject('R\u0435: Existing thread'));
  check('standalone reply subject blocks mixed Unicode lookalikes', isReplyStyleSubject('\u0280\u0435: Existing thread'));
  check('standalone forward subject blocks small-cap Unicode F', isReplyStyleSubject('\ua730W: Existing thread'));
  check('standalone reply subject blocks modifier-letter colon', isReplyStyleSubject('Re\ua789 Existing thread'));
  check('standalone reply subject blocks ratio colon', isReplyStyleSubject('Re\u2236 Existing thread'));
  check('standalone reply subject blocks vertical two-dot leader', isReplyStyleSubject('Re\ufe30 Existing thread'));
  check('standalone reply subject blocks generic symbol delimiter', isReplyStyleSubject('Re\u25aa Existing thread'));
  check('standalone reply subject blocks folded whitespace', isReplyStyleSubject('\r\n R\t e : Existing thread'));
  check('standalone forward subject blocked', isReplyStyleSubject('Fwd: Existing thread'));
  check('clean standalone subject accepted', !isReplyStyleSubject('Independent proposal for review'));
  check('recent correspondent query is bounded', recentCorrespondentQuery('x@example.com')
    === 'newer_than:30d -label:drafts {from:x@example.com to:x@example.com cc:x@example.com}');
  let multiRecipientRefused = false;
  try {
    correspondentAddress('brandnew@example.com, existingcustomer@example.com');
  } catch {
    multiRecipientRefused = true;
  }
  check('anchorless multi-recipient ambiguity refused', multiRecipientRefused);
  const newestFixture = newestRealMessage([
    { id: 'older', internalDate: '100', labelIds: ['INBOX'] },
    { id: 'draft', internalDate: '300', labelIds: ['DRAFT'] },
    { id: 'newest-real', internalDate: '200', labelIds: ['SENT'] },
  ]);
  check('newest real ignores drafts', newestFixture?.id === 'newest-real');
  const safeTailFixture = [
    { id: 'customer-anchor', internalDate: '100', labelIds: ['INBOX'] },
    { id: 'internal-forward', internalDate: '200', labelIds: ['SENT'] },
  ];
  const safeTailPlacement = inspectReplyAnchorPlacement(
    safeTailFixture,
    'customer-anchor',
    ['internal-forward'],
  );
  check('exact verified safe tail is accepted',
    safeTailPlacement.unverifiedLaterIds.length === 0
      && safeTailPlacement.unusedVerifiedIds.length === 0);
  const racedCustomerPlacement = inspectReplyAnchorPlacement(
    [...safeTailFixture, { id: 'new-customer', internalDate: '300', labelIds: ['INBOX'] }],
    'customer-anchor',
    ['internal-forward'],
  );
  check('an unlisted newer customer message still blocks',
    racedCustomerPlacement.unverifiedLaterIds.join('|') === 'new-customer');
  const unusedSafePlacement = inspectReplyAnchorPlacement(
    safeTailFixture,
    'customer-anchor',
    ['internal-forward', 'not-in-thread'],
  );
  check('unused safe IDs fail closed',
    unusedSafePlacement.unusedVerifiedIds.join('|') === 'not-in-thread');

  const roundTrip = decodeBase64Url(encodeBase64Url('Dolphin ~ test + / body'));
  check('base64url round trip', roundTrip === 'Dolphin ~ test + / body');
  const bodyWithTextAttachments = {
    mimeType: 'multipart/mixed',
    parts: [
      {
        mimeType: 'text/plain',
        filename: '',
        body: { data: encodeBase64Url('Real message body') },
      },
      {
        mimeType: 'text/plain',
        filename: 'notes.txt',
        body: { data: encodeBase64Url('Attached text must stay hidden') },
      },
      {
        mimeType: 'message/rfc822',
        filename: 'forwarded.eml',
        headers: [{ name: 'Content-Disposition', value: 'attachment' }],
        parts: [{
          mimeType: 'text/html',
          body: { data: encodeBase64Url('<p>Attached message must stay hidden</p>') },
        }],
      },
    ],
  };
  check(
    'read excludes text attachment bodies',
    extractPlainText(bodyWithTextAttachments).join('\n') === 'Real message body',
  );
  check(
    'read excludes attached-message HTML bodies',
    extractHtmlText(bodyWithTextAttachments).length === 0,
  );

  const mime = buildMime({
    to: 'x@example.com', cc: '', subject: 'Hello', body: 'Line1\nLine2',
    html: false, inReplyTo: '<abc@mail>', references: '<abc@mail>',
  });
  check('mime To', mime.includes('To: x@example.com'));
  check('mime reply headers', mime.includes('In-Reply-To: <abc@mail>'));
  check('mime no cc line', !mime.includes('Cc:'));
  check('mime always html content type', mime.includes('text/html') && !mime.includes('text/plain'));
  check('mime plain body converted to html', mime.includes('Line1<br>'));

  const mimeEscape = buildMime({
    to: 'x@example.com', cc: '', subject: 'Esc', body: 'a < b & c',
    html: false, inReplyTo: '', references: '',
  });
  check('mime plain body escaped', mimeEscape.includes('a &lt; b &amp; c'));

  const mimeLinkedPhrase = buildMime({
    to: 'x@example.com', cc: '', subject: 'Link',
    body: '[here is the direct payment link](https://www.paypal.com/invoice/p/#INV2-TEST)',
    html: false, inReplyTo: '', references: '',
  });
  check(
    'mime converts explicit HTTPS linked phrase',
    mimeLinkedPhrase.includes('<a href="https://www.paypal.com/invoice/p/#INV2-TEST">here is the direct payment link</a>'),
  );
  check(
    'mime does not linkify non-HTTPS markup',
    plainTextToHtml('[unsafe](javascript:alert(1))').includes('[unsafe](javascript:alert(1))'),
  );

  const mimeHtml = buildMime({
    to: 'x@example.com', cc: '', subject: 'H', body: '<p>Hi</p>',
    html: true, inReplyTo: '', references: '',
  });
  check('mime html body passthrough', mimeHtml.includes('<p>Hi</p>'));

  const mimeAttachment = buildMime({
    to: 'x@example.com', cc: '', subject: 'Attachment', body: 'Attached',
    html: false, inReplyTo: '', references: '',
    attachments: [{
      filename: 'brochure.pdf',
      mimeType: 'application/pdf',
      data: Buffer.from('test-pdf'),
    }],
  });
  check('mime attachment multipart', mimeAttachment.includes('multipart/mixed'));
  check('mime attachment filename', mimeAttachment.includes('filename="brochure.pdf"'));
  check('mime attachment encoded', mimeAttachment.includes(Buffer.from('test-pdf').toString('base64')));

  check(
    'write command gate',
    WRITE_COMMANDS.has('create-draft')
      && WRITE_COMMANDS.has('create-label')
      && WRITE_COMMANDS.has('label')
      && !WRITE_COMMANDS.has('search'),
  );
  check('scope map reads are readonly', COMMAND_SCOPES.search === 'https://www.googleapis.com/auth/gmail.readonly');
  check('scope map create-label is modify', COMMAND_SCOPES['create-label'].includes('gmail.modify'));
  check('scope map label is modify', COMMAND_SCOPES.label.includes('gmail.modify'));
  check('scope map draft is compose', COMMAND_SCOPES['create-draft'].includes('gmail.compose'));

  const singleFlightCache = new Map();
  let singleFlightLoads = 0;
  let releaseSingleFlight;
  const singleFlightGate = new Promise((resolve) => {
    releaseSingleFlight = resolve;
  });
  const loadSingleFlight = async () => {
    singleFlightLoads += 1;
    await singleFlightGate;
    return { accessToken: 'single-flight-token', expiresAt: 500_000 };
  };
  const firstToken = commandAccessToken(
    { mailbox: 'devans@dolphincentrifuge.com' },
    'search',
    { cache: singleFlightCache, load: loadSingleFlight, now: () => 1_000 },
  );
  const secondToken = commandAccessToken(
    { mailbox: 'DEVANS@dolphincentrifuge.com' },
    'search',
    { cache: singleFlightCache, load: loadSingleFlight, now: () => 1_000 },
  );
  await Promise.resolve();
  check('token acquisition is single flight', singleFlightLoads === 1);
  releaseSingleFlight();
  check(
    'single-flight callers share one token',
    await firstToken === 'single-flight-token' &&
      await secondToken === 'single-flight-token',
  );

  const expiryCache = new Map();
  let expiryNow = 10_000;
  let expiryLoads = 0;
  const loadExpiring = async () => ({
    accessToken: `expiry-token-${++expiryLoads}`,
    expiresAt: expiryNow + 120_000,
  });
  const freshToken = await commandAccessToken(
    { mailbox: 'sprabhu@dolphincentrifuge.com' },
    'search',
    { cache: expiryCache, load: loadExpiring, now: () => expiryNow },
  );
  expiryNow += 61_000;
  const renewedToken = await commandAccessToken(
    { mailbox: 'sprabhu@dolphincentrifuge.com' },
    'search',
    { cache: expiryCache, load: loadExpiring, now: () => expiryNow },
  );
  check(
    'token cache renews before expiry',
    freshToken === 'expiry-token-1' &&
      renewedToken === 'expiry-token-2' &&
      expiryLoads === 2,
  );
  check(
    'token cache is mailbox and scope keyed',
    accessTokenCacheKey(
      { mailbox: 'devans@dolphincentrifuge.com' },
      'search',
    ) !== accessTokenCacheKey(
      { mailbox: 'devans@dolphincentrifuge.com' },
      'create-draft',
    ),
  );

  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
  const jwt = buildServiceAccountJwt({
    saEmail: 'sa@example.iam.gserviceaccount.com',
    privateKey,
    mailbox: 'jkraft@dolphincentrifuge.com',
    scope: COMMAND_SCOPES.search,
    tokenUri: 'https://oauth2.googleapis.com/token',
  });
  const [jwtHeader, jwtClaims, jwtSig] = jwt.split('.');
  const verified = crypto.verify(
    'RSA-SHA256',
    Buffer.from(`${jwtHeader}.${jwtClaims}`, 'utf8'),
    publicKey,
    Buffer.from(jwtSig.replace(/-/g, '+').replace(/_/g, '/'), 'base64')
  );
  check('sa jwt signature verifies', verified);
  const claims = JSON.parse(decodeBase64Url(jwtClaims));
  check('sa jwt sub is mailbox', claims.sub === 'jkraft@dolphincentrifuge.com');
  check('sa jwt aud is token uri', claims.aud === 'https://oauth2.googleapis.com/token');

  if (failures.length) {
    console.error(`self-test FAILED: ${failures.join(', ')}`);
    process.exitCode = 1;
    return;
  }
  console.log('self-test passed.');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const command = args._[0] || 'help';
  if (args.help || command === 'help') { usage(); return; }
  if (command === 'auth') return auth(args);
  if (command === 'profile') return profile(args);
  if (command === 'search') return search(args);
  if (command === 'read') return read(args);
  if (command === 'thread') return thread(args);
  if (command === 'attachments') return attachments(args);
  if (command === 'download-attachment') return downloadAttachment(args);
  if (command === 'labels') return listLabels(args);
  if (command === 'create-label') return createLabel(args);
  if (command === 'label') return label(args);
  if (command === 'create-draft') return createDraft(args);
  if (command === 'update-draft') return createDraft(args);
  if (command === 'self-test') return selfTest();
  throw new Error(`Unknown command: ${command}`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exitCode = 1;
});
