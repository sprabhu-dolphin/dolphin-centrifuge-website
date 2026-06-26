#!/usr/bin/env node

// Talkroute voicemail email ingestion helper for the Dolphin Stats Dashboard.
// Gmail OAuth tokens are stored outside the repo under %APPDATA%/gcloud.

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
const defaultTokenPath = path.join(gcloudDir, 'dolphin-gmail-readonly-token.json');
const defaultScope = 'https://www.googleapis.com/auth/gmail.readonly';
const defaultQuery = 'from:voicemail@talkroute.com newer_than:30d';
const defaultWorkerUrl = 'https://dolphin-contact-form.dolphin-centrifuge.workers.dev';

function usage() {
  console.log(`Talkroute voicemail ingestion

Usage:
  node talkroute-voicemail-ingest.mjs auth [--login-hint sprabhu@dolphincentrifuge.com]
  node talkroute-voicemail-ingest.mjs preview [--query "from:voicemail@talkroute.com newer_than:30d"] [--max 25] [--json]
  node talkroute-voicemail-ingest.mjs ingest [--query "..."] [--max 25] [--worker-url URL] [--admin-token TOKEN] [--dry-run]
  node talkroute-voicemail-ingest.mjs parse-file --input messages.json [--json]
  node talkroute-voicemail-ingest.mjs self-test

Notes:
  - Default Gmail query: ${defaultQuery}
  - Token path: ${defaultTokenPath}
  - The script never stores Gmail or dashboard secrets in the repo.
  - For ingest, pass --admin-token or set DOLPHIN_ADMIN_PASSWORD / ADMIN_PASSWORD.`);
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
  return JSON.parse(text.replace(/^\uFEFF/, ''));
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
    scope: body.scope || defaultScope,
    token_uri: client.tokenUri,
    saved_at: new Date().toISOString(),
  };
}

async function auth(args) {
  const clientPath = args.client || defaultClientPath;
  const tokenPath = args.token || defaultTokenPath;
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
        res.end('Gmail read-only authorization is complete. You can close this tab.');
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
      url.searchParams.set('scope', defaultScope);
      url.searchParams.set('access_type', 'offline');
      url.searchParams.set('prompt', 'consent');
      url.searchParams.set('login_hint', args['login-hint'] || 'sprabhu@dolphincentrifuge.com');
      url.searchParams.set('state', state);

      console.log('Opening Google OAuth consent in the browser...');
      console.log(`Requested scope: ${defaultScope}`);
      console.log(`Token will be stored at: ${tokenPath}`);
      await openInBrowser(url.toString());
      console.log('Waiting for Google OAuth callback...');
    });
  });

  const token = await exchangeCodeForToken({ client, code: authCode, redirectUri: lastRedirectUri });
  await writeJson(tokenPath, token);
  console.log('Gmail read-only token saved.');
  console.log(`Token path: ${tokenPath}`);
}

async function getAccessToken(args) {
  const tokenPath = args.token || defaultTokenPath;
  const clientPath = args.client || defaultClientPath;
  if (!existsSync(tokenPath)) throw new Error(`Gmail token not found: ${tokenPath}. Run auth first.`);
  const token = await readJson(tokenPath);
  const client = await readClient(clientPath);
  if (!token.refresh_token) throw new Error('Gmail token has no refresh_token.');
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
  if (!res.ok) throw new Error(`Gmail token refresh failed: ${JSON.stringify(json)}`);
  return json.access_token;
}

async function gmailFetch(args, url) {
  const accessToken = await getAccessToken(args);
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  const text = await res.text();
  let json;
  try { json = text ? JSON.parse(text) : {}; } catch { json = { raw: text }; }
  if (!res.ok) throw new Error(`Gmail API ${res.status}: ${JSON.stringify(json).slice(0, 1200)}`);
  return json;
}

async function listGmailMessages(args) {
  const query = args.query || defaultQuery;
  const max = Math.max(1, Math.min(100, Number(args.max || 25)));
  const url = new URL('https://gmail.googleapis.com/gmail/v1/users/me/messages');
  url.searchParams.set('q', query);
  url.searchParams.set('maxResults', String(max));
  const list = await gmailFetch(args, url);
  const ids = (list.messages || []).map((message) => message.id).filter(Boolean);
  const messages = [];
  for (const id of ids) {
    const msgUrl = new URL(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}`);
    msgUrl.searchParams.set('format', 'full');
    messages.push(await gmailFetch(args, msgUrl));
  }
  return messages;
}

function decodeBase64Url(value) {
  if (!value) return '';
  const normalized = String(value).replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  return Buffer.from(padded, 'base64').toString('utf8');
}

function walkPayload(part, out = { plain: [], html: [], attachments: [] }) {
  if (!part) return out;
  const filename = part.filename || '';
  const body = part.body || {};
  if (filename) {
    out.attachments.push({
      filename,
      mime_type: part.mimeType || '',
      size_bytes: body.size || 0,
      attachment_id: body.attachmentId || '',
    });
  }
  if (body.data && !filename) {
    const text = decodeBase64Url(body.data);
    if ((part.mimeType || '').includes('text/plain')) out.plain.push(text);
    else if ((part.mimeType || '').includes('text/html')) out.html.push(text);
  }
  for (const child of part.parts || []) walkPayload(child, out);
  return out;
}

function htmlToText(html) {
  return String(html || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function headerMap(headers = []) {
  const map = {};
  for (const header of headers) map[String(header.name || '').toLowerCase()] = header.value || '';
  return map;
}

function coerceGmailApiMessage(message) {
  const headers = headerMap(message.payload?.headers || []);
  const bodyParts = walkPayload(message.payload || {});
  const body = bodyParts.plain.join('\n').trim() || htmlToText(bodyParts.html.join('\n')).trim();
  const internal = message.internalDate ? new Date(Number(message.internalDate)).toISOString() : '';
  return {
    id: message.id,
    thread_id: message.threadId,
    from_: headers.from || '',
    to: headers.to ? [headers.to] : [],
    subject: headers.subject || '',
    body,
    email_ts: internal || headers.date || '',
    attachments: bodyParts.attachments,
    display_url: `https://mail.google.com/mail/#all/${message.id}`,
  };
}

function coerceConnectorMessage(message) {
  return {
    id: message.id || message.message_id,
    thread_id: message.thread_id,
    from_: message.from_ || message.from || '',
    to: Array.isArray(message.to) ? message.to : (message.to ? [message.to] : []),
    subject: message.subject || '',
    body: message.body || message.snippet || '',
    email_ts: message.email_ts || message.date || '',
    attachments: message.attachments || [],
    display_url: message.display_url || '',
  };
}

function cleanLine(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function fieldValue(body, label) {
  const re = new RegExp(`^${label}:\\s*(.+)$`, 'im');
  const match = String(body || '').match(re);
  return match ? cleanLine(match[1]) : '';
}

function parseDuration(value) {
  const text = String(value || '').toLowerCase();
  let total = 0;
  const hour = text.match(/(\d+(?:\.\d+)?)\s*h(?:ou)?rs?/);
  const minute = text.match(/(\d+(?:\.\d+)?)\s*m(?:in(?:ute)?s?)?/);
  const second = text.match(/(\d+(?:\.\d+)?)\s*s(?:ec(?:ond)?s?)?/);
  if (hour) total += Number(hour[1]) * 3600;
  if (minute) total += Number(minute[1]) * 60;
  if (second) total += Number(second[1]);
  return Math.max(0, Math.round(total || 0));
}

function transcriptFromBody(body) {
  const lines = String(body || '').replace(/\r/g, '').split('\n').map((line) => line.trim()).filter(Boolean);
  const mailboxIndex = lines.findIndex((line) => /^Mailbox:\s*/i.test(line));
  if (mailboxIndex === -1) return '';
  const kept = [];
  for (const line of lines.slice(mailboxIndex + 1)) {
    if (/^\[?Contact\]?(\(|\s*\||$)/i.test(line)) break;
    if (/^(Help|Login)(\s*\||$)/i.test(line)) break;
    if (/unsubscribe|privacy policy/i.test(line)) break;
    kept.push(line);
  }
  return cleanLine(kept.join(' '));
}

function transcriptSnippet(value) {
  const text = cleanLine(value);
  if (!text) return '';
  return text.length > 200 ? `${text.slice(0, 197).trim()}...` : text;
}

function normalizePhoneDigits(value) {
  let digits = String(value || '').replace(/\D+/g, '');
  if (digits.length === 11 && digits.startsWith('1')) digits = digits.slice(1);
  return digits;
}

function normalizePhoneE164(value) {
  const originalDigits = String(value || '').replace(/\D+/g, '');
  const key = normalizePhoneDigits(value);
  if (key.length === 10) return `+1${key}`;
  if (originalDigits.length >= 8 && originalDigits.length <= 15) return `+${originalDigits}`;
  return '';
}

function parseTalkrouteVoicemail(email) {
  const body = email.body || '';
  const subjectCaller = String(email.subject || '').match(/Voice Message From\s+(.+)$/i);
  const caller = fieldValue(body, 'From') || cleanLine(subjectCaller && subjectCaller[1]);
  const messageLength = fieldValue(body, 'Message Length');
  const mailbox = fieldValue(body, 'Mailbox');
  const transcript = transcriptFromBody(body);
  const noTranscript = /^\[?no transcription is available\.?\]?$/i.test(transcript);
  const audio = (email.attachments || []).find((attachment) => {
    const filename = String(attachment.filename || '').toLowerCase();
    const mime = String(attachment.mime_type || attachment.mimeType || '').toLowerCase();
    return filename.endsWith('.m4a') || filename.endsWith('.mp3') || mime.startsWith('audio/');
  }) || {};

  return {
    source: 'talkroute_gmail',
    source_message_id: email.id,
    source_thread_id: email.thread_id || '',
    source_email_ts: email.email_ts || '',
    source_display_url: email.display_url || '',
    email_subject: email.subject || '',
    email_from: email.from_ || '',
    email_to: email.to || [],
    caller_raw: caller,
    caller_phone_e164: normalizePhoneE164(caller),
    caller_phone_digits: normalizePhoneDigits(caller),
    mailbox,
    duration_seconds: parseDuration(messageLength),
    transcript_snippet: noTranscript ? '' : transcriptSnippet(transcript),
    transcript_available: noTranscript || !transcript ? 0 : 1,
    audio_filename: audio.filename || '',
    audio_mime_type: audio.mime_type || audio.mimeType || '',
    audio_size_bytes: audio.size_bytes || audio.size || 0,
  };
}

function coerceMessages(raw) {
  const list = Array.isArray(raw)
    ? raw
    : (Array.isArray(raw.responses) ? raw.responses : (Array.isArray(raw.messages) ? raw.messages : [raw]));
  return list
    .filter((item) => item && typeof item === 'object')
    .map((item) => item.payload ? coerceGmailApiMessage(item) : coerceConnectorMessage(item));
}

function summarize(records) {
  for (const record of records) {
    const transcript = record.transcript_available ? 'transcript' : 'no transcript';
    console.log(`${record.source_email_ts || '(no date)'} | ${record.caller_raw || '(no caller)'} | ${record.mailbox || '(no mailbox)'} | ${record.duration_seconds}s | ${transcript}`);
  }
}

async function preview(args) {
  const messages = (await listGmailMessages(args)).map(coerceGmailApiMessage);
  const records = messages.map(parseTalkrouteVoicemail);
  if (args.json) console.log(JSON.stringify({ count: records.length, calls: records }, null, 2));
  else summarize(records);
}

async function parseFile(args) {
  if (!args.input) throw new Error('Provide --input messages.json');
  const raw = await readJson(args.input);
  const records = coerceMessages(raw).map(parseTalkrouteVoicemail);
  if (args.json) console.log(JSON.stringify({ count: records.length, calls: records }, null, 2));
  else summarize(records);
}

async function ingest(args) {
  const messages = (await listGmailMessages(args)).map(coerceGmailApiMessage);
  const calls = messages.map(parseTalkrouteVoicemail).filter((record) => record.source_message_id && record.caller_phone_digits);
  if (args['dry-run']) {
    summarize(calls);
    console.log(`Dry run only. Parsed ${calls.length} call(s).`);
    return;
  }
  const adminToken = args['admin-token'] || process.env.DOLPHIN_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;
  if (!adminToken) throw new Error('Missing dashboard admin token. Set DOLPHIN_ADMIN_PASSWORD or pass --admin-token.');
  const workerUrl = String(args['worker-url'] || defaultWorkerUrl).replace(/\/$/, '');
  const res = await fetch(`${workerUrl}/admin/calls/ingest`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ calls }),
  });
  const text = await res.text();
  let json;
  try { json = text ? JSON.parse(text) : {}; } catch { json = { raw: text }; }
  if (!res.ok) throw new Error(`Worker ingest failed (${res.status}): ${JSON.stringify(json).slice(0, 1200)}`);
  console.log(JSON.stringify(json, null, 2));
}

function selfTest() {
  const sample = {
    id: 'sample-message',
    thread_id: 'sample-thread',
    from_: '"Voicemail | Talkroute" voicemail@talkroute.com',
    to: ['sprabhu@dolphincentrifuge.com'],
    subject: 'You Have A New Voice Message From 1 (555) 123-4567',
    email_ts: '2026-06-23T15:11:33Z',
    display_url: 'https://mail.google.com/mail/#all/sample-message',
    attachments: [{ filename: 'voicemessage.m4a', mime_type: 'audio/mp4', size_bytes: 12345 }],
    body: `
Voice Message Details:

From: 1 (555) 123-4567

Message Length: 28 seconds

Mailbox: Sales VM

This is a sample voicemail asking for a callback.

Contact | Help | Login`,
  };
  const parsed = parseTalkrouteVoicemail(sample);
  if (parsed.caller_phone_digits !== '5551234567') throw new Error('phone parse failed');
  if (parsed.duration_seconds !== 28) throw new Error('duration parse failed');
  if (parsed.mailbox !== 'Sales VM') throw new Error('mailbox parse failed');
  if (!parsed.transcript_snippet.includes('sample voicemail')) throw new Error('transcript parse failed');
  console.log('Self-test passed.');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const command = args._[0] || 'help';
  if (args.help || command === 'help') { usage(); return; }
  if (command === 'auth') return auth(args);
  if (command === 'preview') return preview(args);
  if (command === 'parse-file') return parseFile(args);
  if (command === 'ingest') return ingest(args);
  if (command === 'self-test') return selfTest();
  throw new Error(`Unknown command: ${command}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
