// node --test tracker-client.test.mjs
// The Reply Desk's tracked drafts against a stub tracker: pixel placement, link rewriting, quoted text left
// alone, attachments never uploaded, and a draft that still goes out when the tracker is down.
import assert from 'node:assert/strict';
import http from 'node:http';
import { after, before, test } from 'node:test';
import { collectUrls, createTrackerClient, findQuoteStart, trackDraft } from './tracker-client.mjs';

const TOKEN = 'stub-token';
let server, base;
const seen = { messages: [], links: [], files: [], patches: [], auth: new Set() };

before(async () => {
  server = http.createServer((req, res) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const body = Buffer.concat(chunks);
      seen.auth.add(req.headers.authorization);
      const json = (code, o) => res.writeHead(code, { 'content-type': 'application/json' }).end(JSON.stringify(o));
      if (req.headers.authorization !== `Bearer ${TOKEN}`) return json(401, { error: 'Wrong token.' });
      if (req.url === '/api/v1/messages' && req.method === 'POST') {
        seen.messages.push(JSON.parse(body));
        return json(200, { guid: 'g1', pixelUrl: `${base}/o/g1.gif`, pixelHtml: `<div hspace="dolphin-pt-mark"><img src="${base}/o/g1.gif"></div>` });
      }
      if (req.url === '/api/v1/messages/g1/links') {
        const { urls } = JSON.parse(body);
        seen.links.push(...urls);
        return json(200, { links: urls.map((url, i) => ({ url, trackedUrl: `${base}/l/tok${seen.links.length - urls.length + i}` })) });
      }
      if (req.url === '/api/v1/messages/g1/files') {
        const text = body.toString('latin1');
        const filename = text.match(/name="filename"\r\n\r\n([^\r]*)/)[1];
        seen.files.push({ filename, hasBytes: text.includes('PDF-BYTES'), multipart: /multipart\/form-data/.test(req.headers['content-type']) });
        return json(200, { fileToken: 'ft', url: `${base}/d/ft/${encodeURIComponent(filename)}`, filename, size: 9 });
      }
      if (req.method === 'PATCH') { seen.patches.push([req.url, JSON.parse(body)]); return json(200, { ok: true }); }
      json(404, { error: 'No such route.' });
    });
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => server.close());

const reset = () => { for (const k of ['messages', 'links', 'files', 'patches']) seen[k].length = 0; };
// The helper turns the desk's plain text into HTML this way (plainTextToHtml in gmail-helper.mjs).
const asHtml = (text) => `<div dir="ltr">${text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\r?\n/g, '<br>\r\n')}</div>`;
const client = (extra = {}) => createTrackerClient({ baseUrl: base, token: TOKEN, log: () => {}, ...extra });
// A desk draft to a thread Dan's mailbox does not hold: his text, his sign-off, then the customer quoted.
const deskDraft = asHtml(
  'John,\n\nThe brochure is at https://dolphincentrifuge.com/brochure/. Also see <a> tags & the manual.\n' +
  'Email sales@x.com or call.\n\nRegards,\nDan Evans\n\n\n' +
  'On Tue Sep 29 2026, John Smith <john@acme.com> wrote:\n> Please see https://acme.com/spec?a=1&b=2\n> Thanks',
);
const common = { sender: 'devans@dolphincentrifuge.com', recipients: ['john@acme.com'], subject: 'Re: Centrifuge' };

test('pixel sits after the signature and before the quoted reply', async () => {
  reset();
  const out = await trackDraft({ client: client(), html: deskDraft, ...common });
  assert.equal(out.guid, 'g1');
  const sig = out.html.indexOf('Dan Evans'), pixel = out.html.indexOf('dolphin-pt-mark'), quote = out.html.indexOf('On Tue Sep 29 2026');
  assert.ok(sig > 0 && pixel > sig && quote > pixel, 'signature < pixel < quote');
  assert.equal(out.html.split('dolphin-pt-mark').length, 2, 'one pixel');
  assert.deepEqual(seen.messages[0], { ...common, source: 'desk' });
});

test('an earlier Dolphin pixel in the quoted reply is removed', async () => {
  reset();
  const old = '<div hspace="dolphin-pt-mark" style="max-height:1px"><img alt="" src="https://t.dolphincentrifuge.com/o/old-guid.gif"></div>';
  const out = await trackDraft({ client: client(), html: `<div>Thanks.<br>Dan Evans</div><div class="gmail_quote">On Tue, John wrote:<br>Hi${old}</div>`, ...common });
  assert.ok(!out.html.includes('old-guid') && out.html.split('dolphin-pt-mark').length === 2, 'only the new pixel');
});

test('pixel goes at the end when nothing is quoted', async () => {
  reset();
  const out = await trackDraft({ client: client(), html: asHtml('Hi,\n\nThanks.\nDan Evans\n'), ...common });
  assert.match(out.html, /Dan Evans<div hspace="dolphin-pt-mark">.*<\/div><br>\r\n<\/div>$/s);
});

test('http(s) links in the new text are tracked; mailto, tel, and the quote are not', async () => {
  reset();
  const html = deskDraft.replace('Email sales@x.com or call.',
    'Email <a href="mailto:sales@x.com">sales</a>, call <a href="tel:+17575551234">us</a>, or read <a href="https://dolphincentrifuge.com/manual?x=1&amp;y=2">the manual</a>.');
  const out = await trackDraft({ client: client(), html, ...common });
  assert.deepEqual(seen.links, ['https://dolphincentrifuge.com/brochure/', 'https://dolphincentrifuge.com/manual?x=1&y=2']);
  assert.ok(out.html.includes(`<a href="${base}/l/tok0">https://dolphincentrifuge.com/brochure/</a>. Also`), 'bare URL linked, full stop kept outside');
  assert.ok(out.html.includes(`<a href="${base}/l/tok1">the manual</a>`), 'anchor href rewritten');
  assert.ok(out.html.includes('href="mailto:sales@x.com"') && out.html.includes('href="tel:+17575551234"'));
  assert.ok(out.html.includes('&gt; Please see https://acme.com/spec?a=1&amp;b=2'), 'quoted URL untouched');
  assert.equal(out.links, 2);
});

test('quoted text is found in Gmail, blockquote, and Outlook shapes', () => {
  assert.equal(findQuoteStart('<div>Hi</div><div class="gmail_quote">On x wrote:</div>'), 13);
  assert.equal(findQuoteStart('<p>Hi</p><blockquote>old</blockquote>'), 9);
  assert.equal(findQuoteStart('<p>Hi</p><div>-----Original Message-----<br>From: a</div>'), 14);
  assert.equal(findQuoteStart('<div>Hi https://a.com</div>'), -1);
  assert.deepEqual(collectUrls('see https://a.com/x) and <a href="https://b.com">b</a> <a href="https://t.test/l/1">t</a>', 'https://t.test'),
    ['https://a.com/x', 'https://b.com']);
});

test('attachments are never uploaded and add no line to the email', async () => {
  reset();
  const out = await trackDraft({ client: client(), html: deskDraft, ...common,
    attachments: [{ filename: 'a.pdf', mimeType: 'application/pdf', data: Buffer.from('PDF-BYTES') }] });
  assert.equal(seen.files.length, 0);
  assert.ok(!out.html.includes('Also available'));
  assert.ok(out.html.includes('dolphin-pt-mark'));
  assert.equal('files' in out, false);
});

test('tracker down: the draft HTML comes back unchanged with one log line', async () => {
  const lines = [];
  const down = createTrackerClient({ baseUrl: 'http://127.0.0.1:9', token: TOKEN, log: (l) => lines.push(l) });
  const out = await trackDraft({ client: down, html: deskDraft, ...common,
    attachments: [{ filename: 'a.pdf', mimeType: 'application/pdf', data: Buffer.from('x') }] });
  assert.equal(out.html, deskDraft);
  assert.equal(out.guid, null);
  assert.equal(lines.length, 1);
  assert.match(lines[0], /^Tracker: register message failed/);
});

test('tracker hanging: gives up at the time limit with one log line', async () => {
  const hang = http.createServer(() => {});
  await new Promise((r) => hang.listen(0, '127.0.0.1', r));
  const lines = [];
  const slow = createTrackerClient({ baseUrl: `http://127.0.0.1:${hang.address().port}`, token: TOKEN, timeoutMs: 300, log: (l) => lines.push(l) });
  const began = Date.now();
  const out = await trackDraft({ client: slow, html: deskDraft, ...common });
  hang.closeAllConnections(); hang.close();
  assert.equal(out.html, deskDraft);
  assert.ok(Date.now() - began < 2000);
  assert.deepEqual(lines, ['Tracker: register message failed (no answer in 0.3 s); carrying on without it.']);
});

test('no token: nothing is called, one log line, draft unchanged', async () => {
  const lines = [];
  const none = createTrackerClient({ baseUrl: base, token: '', file: 'C:\\nowhere.json', log: (l) => lines.push(l) });
  const out = await trackDraft({ client: none, html: deskDraft, ...common });
  assert.equal(out.html, deskDraft);
  assert.equal(lines.length, 1);
  assert.ok(!lines[0].includes(TOKEN));
});

test('PATCH and events carry the bearer token', async () => {
  reset();
  assert.deepEqual(await client().patchMessage('g1', { status: 'sent', gmailMessageId: 'm1' }), { ok: true });
  assert.deepEqual(seen.patches, [['/api/v1/messages/g1', { status: 'sent', gmailMessageId: 'm1' }]]);
  assert.ok(seen.auth.has(`Bearer ${TOKEN}`));
});
