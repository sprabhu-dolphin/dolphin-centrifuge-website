// Dolphin Email Tracker client for the Gmail helper and the Reply Desk.
// Contract: Dolphin Email Tracker SPEC.md (API prefix /api/v1, Bearer token).
//
// Token and base URL live with the helper's other secrets, outside the repo:
//   %APPDATA%\gcloud\dolphin-email-tracker.json  {"token": "...", "baseUrl": "https://t.dolphincentrifuge.com"}
// DOLPHIN_TRACKER_TOKEN / DOLPHIN_TRACKER_BASE_URL override the file; DOLPHIN_TRACKER_CONFIG points at another file.
//
// Every call has a 6 second limit and fails open: on any failure it writes one log line and returns null,
// so a draft is never blocked by the tracker. Token values are never printed.

import { readFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const DEFAULT_BASE_URL = 'https://t.dolphincentrifuge.com';
export const TIMEOUT_MS = 6000;
const appDataDir = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
export const CONFIG_PATH = path.join(appDataDir, 'gcloud', 'dolphin-email-tracker.json');

export function trackerConfig(env = process.env) {
  const file = env.DOLPHIN_TRACKER_CONFIG || CONFIG_PATH;
  let json = {};
  try { json = JSON.parse(readFileSync(file, 'utf8').replace(/^﻿/, '')); } catch {}
  return {
    baseUrl: String(env.DOLPHIN_TRACKER_BASE_URL || json.baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, ''),
    token: String(env.DOLPHIN_TRACKER_TOKEN || json.token || '').trim(),
    file,
  };
}

export function createTrackerClient(options = {}) {
  const { baseUrl, token, file } = { ...trackerConfig(), ...options };
  const timeoutMs = options.timeoutMs || TIMEOUT_MS;
  const log = options.log || ((line) => console.log(line));
  const fetchImpl = options.fetchImpl || fetch;

  async function call(what, method, route, body) {
    if (!token) { log(`Tracker: ${what} skipped, no token in ${file}.`); return null; }
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), timeoutMs);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      let payload = body;
      if (body) { headers['Content-Type'] = 'application/json'; payload = JSON.stringify(body); }
      const res = await fetchImpl(`${baseUrl}/api/v1${route}`, { method, headers, body: payload, signal: ctl.signal });
      // The body is read inside the same 6 seconds.
      const text = await res.text();
      let json = {};
      try { json = text ? JSON.parse(text) : {}; } catch {}
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      return json;
    } catch (e) {
      log(`Tracker: ${what} failed (${ctl.signal.aborted ? `no answer in ${timeoutMs / 1000} s` : e.message}); carrying on without it.`);
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  return {
    baseUrl,
    configured: Boolean(token),
    registerMessage: ({ sender, recipients, subject, gmailDraftId, rfcMessageId }) =>
      call('register message', 'POST', '/messages', {
        sender, recipients, subject, source: 'desk',
        ...(gmailDraftId ? { gmailDraftId } : {}), ...(rfcMessageId ? { rfcMessageId } : {}),
      }),
    registerLinks: (guid, urls) => call('register links', 'POST', `/messages/${encodeURIComponent(guid)}/links`, { urls }),
    patchMessage: (guid, fields) => call('update message', 'PATCH', `/messages/${encodeURIComponent(guid)}`, fields),
    // The customer answered a tracked message (idempotent on the Worker).
    reportReply: (guid, { at, from }) => call('report reply', 'POST', `/messages/${encodeURIComponent(guid)}/reply`, { at, from }),
    events: ({ since, limit = 500 } = {}) => {
      const q = new URLSearchParams({ limit: String(limit) });
      if (since) q.set('since', since);
      return call('read events', 'GET', `/events?${q}`);
    },
  };
}

/* ---------- HTML: where the new text ends, and its links ---------- */

const decodeEntities = (s) => String(s)
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
  .replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
const escapeAttr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Where the quoted reply starts: a Gmail quote block, a blockquote, an "On ... wrote:" line, a "> " line,
// or an Outlook header. The earliest one wins; -1 when the email quotes nothing.
const QUOTE_MARKS = [
  /()<div[^>]*class="[^"]*gmail_quote/i,
  /()<blockquote/i,
  /(^|<br\s*\/?>|<div[^>]*>|<p[^>]*>)\s*On\s[^<>]{1,400}?wrote:/i,
  /(^|<br\s*\/?>|<div[^>]*>|<p[^>]*>)\s*&gt;/i,
  /()<div[^>]*id="?divRplyFwdMsg/i,
  /(^|<br\s*\/?>|<div[^>]*>|<p[^>]*>)\s*-{2,}\s*Original Message\s*-{2,}/i,
  /(^|<br\s*\/?>|<div[^>]*>|<p[^>]*>)\s*(?:<b>)?From:(?:<\/b>)?\s[^<]{1,300}<br\s*\/?>\s*(?:<b>)?Sent:/i,
];
export function findQuoteStart(html) {
  let at = -1;
  for (const re of QUOTE_MARKS) {
    const m = re.exec(html);
    if (!m) continue;
    let i = m.index + m[1].length;
    while (/\s/.test(html[i] || '')) i++;
    if (at < 0 || i < at) at = i;
  }
  return at;
}

// head: the new text (signature included), gap: its trailing blank lines, tail: the quoted reply or closing tags.
export function splitNewText(html) {
  const q = findQuoteStart(html);
  let head = q < 0 ? html : html.slice(0, q);
  let tail = q < 0 ? '' : html.slice(q);
  if (q < 0) {
    const closers = head.match(/(?:\s*<\/(?:div|p|span|font|body|html)>)*\s*$/i)[0];
    head = head.slice(0, head.length - closers.length);
    tail = closers;
  }
  const gap = head.match(/(?:\s|&nbsp;|<br\s*\/?>)*$/i)[0];
  return { head: head.slice(0, head.length - gap.length), gap, tail };
}

const BARE_URL = /https?:\/\/(?:(?!&gt;|&lt;|&quot;|&#39;)[^\s<>"'])+/gi;
function trimUrl(raw) {
  let url = raw.replace(/[.,;:!?]+$/, '');
  if (url.endsWith(')') && !url.includes('(')) url = url.slice(0, -1);
  return url;
}
// Walks the new text: `onHref` sees each <a href>, `onText` each run of text outside a link.
function walk(head, { onHref, onText }) {
  let inLink = false, inRaw = false;
  return head.split(/(<[^>]*>)/).map((part) => {
    if (part.startsWith('<')) {
      if (/^<a\b/i.test(part)) {
        inLink = true;
        return part.replace(/(\shref\s*=\s*)(["'])(.*?)\2/i, (all, pre, qt, value) => {
          const out = onHref(decodeEntities(value));
          return out ? `${pre}${qt}${escapeAttr(out)}${qt}` : all;
        });
      }
      if (/^<\/a\s*>/i.test(part)) inLink = false;
      if (/^<(style|script)\b/i.test(part)) inRaw = true;
      if (/^<\/(style|script)\s*>/i.test(part)) inRaw = false;
      return part;
    }
    return inLink || inRaw ? part : onText(part);
  }).join('');
}
const isTrackable = (url, baseUrl) => /^https?:\/\//i.test(url) && !(baseUrl && url.startsWith(baseUrl));

export function collectUrls(head, baseUrl = '') {
  const urls = new Set();
  walk(head, {
    onHref: (url) => { if (isTrackable(url, baseUrl)) urls.add(url); return null; },
    onText: (text) => { for (const m of text.matchAll(BARE_URL)) urls.add(decodeEntities(trimUrl(m[0]))); return text; },
  });
  return [...urls];
}

// Links become their tracked URL; a bare URL in the text becomes a link that still reads as the URL.
export function rewriteLinks(head, tracked) {
  return walk(head, {
    onHref: (url) => tracked.get(url) || null,
    onText: (text) => text.replace(BARE_URL, (raw) => {
      const shown = trimUrl(raw);
      const dest = tracked.get(decodeEntities(shown));
      return dest ? `<a href="${escapeAttr(dest)}">${shown}</a>${raw.slice(shown.length)}` : raw;
    }),
  });
}

// The whole draft step: register the message, track the links of the new text, and put the pixel
// under the signature, above any quoted reply. Attachments are never uploaded (owner ruling 2026-10-06).
// Any failure leaves that piece out; with no message registered the HTML comes back unchanged.
export async function trackDraft({ client, html, sender, recipients, subject, gmailDraftId }) {
  const result = { html, guid: null, links: 0 };
  const msg = await client.registerMessage({ sender, recipients, subject, gmailDraftId });
  if (!msg || !msg.guid) return result;
  result.guid = msg.guid;
  const { head, gap, tail } = splitNewText(html);
  let newText = head;
  const urls = collectUrls(head, client.baseUrl);
  if (urls.length) {
    const reg = await client.registerLinks(msg.guid, urls);
    const tracked = new Map((reg?.links || []).filter((l) => l.url && l.trackedUrl).map((l) => [l.url, l.trackedUrl]));
    if (tracked.size) { newText = rewriteLinks(head, tracked); result.links = tracked.size; }
  }
  result.html = newText + (msg.pixelHtml || '') + gap + tail;
  return result;
}
