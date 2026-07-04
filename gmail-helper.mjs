#!/usr/bin/env node

// General-purpose Gmail API helper for Dolphin Centrifuge automation.
// Purpose: a connector-independent Gmail path (Codex Desktop connector NOT required).
// Gmail OAuth tokens are stored outside the repo under %APPDATA%/gcloud.
//
// Safety model:
//   - Read commands (profile/search/read/thread/labels) work with either token.
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
const helperScopes = [
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.compose',
].join(' ');

const WRITE_COMMANDS = new Set(['create-draft', 'label']);

function usage() {
  console.log(`Dolphin Gmail helper (connector-independent Gmail API access)

Usage:
  node gmail-helper.mjs auth [--login-hint sprabhu@dolphincentrifuge.com]
  node gmail-helper.mjs profile [--json]
  node gmail-helper.mjs search --query "from:x newer_than:7d" [--max 25] [--json]
  node gmail-helper.mjs read --id MESSAGE_ID [--json]
  node gmail-helper.mjs thread --id THREAD_ID [--json]
  node gmail-helper.mjs labels [--json]
  node gmail-helper.mjs label --id MESSAGE_ID [--add "LabelName"] [--remove "LabelName"]
  node gmail-helper.mjs create-draft --to EMAIL --subject "..." (--body "text" | --body-file FILE)
        [--cc EMAIL] [--html] [--reply-to-message-id MSG_ID]
  node gmail-helper.mjs self-test

Notes:
  - Read commands fall back to the readonly token if the helper token is absent:
      helper (read/write): ${helperTokenPath}
      readonly (fallback): ${readonlyTokenPath}
  - Write commands (create-draft, label) REQUIRE the helper token. Run auth once
    (one browser consent click) to create it. Scopes: ${helperScopes}
  - There is intentionally NO send command. Drafts only.
  - This script never stores secrets in the repo and never prints token values.`);
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

async function getAccessToken(args, command) {
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
  return json.access_token;
}

async function gmailFetch(args, command, url, init = {}) {
  const accessToken = await getAccessToken(args, command);
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

function encodeBase64Url(value) {
  return Buffer.from(value, 'utf8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function headerValue(message, name) {
  const headers = message?.payload?.headers || [];
  const match = headers.find((h) => String(h.name).toLowerCase() === name.toLowerCase());
  return match?.value || '';
}

function extractPlainText(part, out = []) {
  if (!part) return out;
  if (part.mimeType === 'text/plain' && part.body?.data) out.push(decodeBase64Url(part.body.data));
  for (const child of part.parts || []) extractPlainText(child, out);
  return out;
}

function summarizeMessage(message) {
  return {
    id: message.id,
    threadId: message.threadId,
    date: headerValue(message, 'Date'),
    from: headerValue(message, 'From'),
    to: headerValue(message, 'To'),
    subject: headerValue(message, 'Subject'),
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
  const list = await gmailFetch(args, 'search', url);
  const ids = (list.messages || []).map((m) => m.id).filter(Boolean);
  const summaries = [];
  for (const id of ids) {
    const msgUrl = new URL(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}`);
    msgUrl.searchParams.set('format', 'metadata');
    for (const header of ['From', 'To', 'Subject', 'Date']) msgUrl.searchParams.append('metadataHeaders', header);
    summaries.push(summarizeMessage(await gmailFetch(args, 'search', msgUrl)));
  }
  if (args.json) { console.log(JSON.stringify(summaries, null, 2)); return; }
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
  if (args.json) { console.log(JSON.stringify({ ...summary, body: bodyText }, null, 2)); return; }
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
  for (const header of ['From', 'To', 'Subject', 'Date']) url.searchParams.append('metadataHeaders', header);
  const json = await gmailFetch(args, 'thread', url);
  const summaries = (json.messages || []).map(summarizeMessage);
  if (args.json) { console.log(JSON.stringify(summaries, null, 2)); return; }
  console.log(`Thread ${args.id}: ${summaries.length} message(s)`);
  printSummaries(summaries);
}

async function listLabels(args) {
  const json = await gmailFetch(args, 'labels', 'https://gmail.googleapis.com/gmail/v1/users/me/labels');
  const labels = (json.labels || []).map((l) => ({ id: l.id, name: l.name, type: l.type }));
  if (args.json) { console.log(JSON.stringify(labels, null, 2)); return; }
  for (const label of labels.sort((a, b) => a.name.localeCompare(b.name))) {
    console.log(`${label.id} | ${label.name} | ${label.type}`);
  }
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

function buildMime({ to, cc, subject, body, html, inReplyTo, references }) {
  const lines = [];
  lines.push(`To: ${to}`);
  if (cc) lines.push(`Cc: ${cc}`);
  lines.push(`Subject: ${subject}`);
  if (inReplyTo) lines.push(`In-Reply-To: ${inReplyTo}`);
  if (references) lines.push(`References: ${references}`);
  lines.push('MIME-Version: 1.0');
  lines.push(`Content-Type: ${html ? 'text/html' : 'text/plain'}; charset="UTF-8"`);
  lines.push('Content-Transfer-Encoding: 7bit');
  lines.push('');
  lines.push(body);
  return lines.join('\r\n');
}

async function createDraft(args) {
  if (!args.to) throw new Error('create-draft requires --to');
  if (!args.subject) throw new Error('create-draft requires --subject');
  let body = args.body;
  if (!body && args['body-file']) body = await fs.readFile(String(args['body-file']), 'utf8');
  if (!body) throw new Error('create-draft requires --body or --body-file');

  let inReplyTo = '';
  let references = '';
  let threadId = args['thread-id'] || '';
  if (args['reply-to-message-id']) {
    const url = new URL(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${args['reply-to-message-id']}`);
    url.searchParams.set('format', 'metadata');
    for (const header of ['Message-ID', 'References', 'Subject']) url.searchParams.append('metadataHeaders', header);
    const original = await gmailFetch(args, 'create-draft', url);
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
  });
  const draftBody = { message: { raw: encodeBase64Url(mime) } };
  if (threadId) draftBody.message.threadId = threadId;

  const json = await gmailFetch(args, 'create-draft',
    'https://gmail.googleapis.com/gmail/v1/users/me/drafts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draftBody),
    });
  console.log(`Draft created (NOT sent). Draft id: ${json.id}, message id: ${json.message?.id}`);
  console.log('Review and send it from Gmail.');
}

function selfTest() {
  const failures = [];
  const check = (name, cond) => { if (!cond) failures.push(name); };

  const args = parseArgs(['search', '--query', 'from:a b', '--max=5', '--json']);
  check('parseArgs positional', args._[0] === 'search');
  check('parseArgs spaced value', args.query === 'from:a b');
  check('parseArgs eq value', args.max === '5');
  check('parseArgs flag', args.json === true);

  const roundTrip = decodeBase64Url(encodeBase64Url('Dolphin ~ test + / body'));
  check('base64url round trip', roundTrip === 'Dolphin ~ test + / body');

  const mime = buildMime({
    to: 'x@example.com', cc: '', subject: 'Hello', body: 'Line1\nLine2',
    html: false, inReplyTo: '<abc@mail>', references: '<abc@mail>',
  });
  check('mime To', mime.includes('To: x@example.com'));
  check('mime reply headers', mime.includes('In-Reply-To: <abc@mail>'));
  check('mime no cc line', !mime.includes('Cc:'));
  check('mime plain content type', mime.includes('text/plain'));

  check('write command gate', WRITE_COMMANDS.has('create-draft') && WRITE_COMMANDS.has('label') && !WRITE_COMMANDS.has('search'));

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
  if (command === 'labels') return listLabels(args);
  if (command === 'label') return label(args);
  if (command === 'create-draft') return createDraft(args);
  if (command === 'self-test') return selfTest();
  throw new Error(`Unknown command: ${command}`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exitCode = 1;
});
