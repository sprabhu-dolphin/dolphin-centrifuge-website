#!/usr/bin/env node
/**
 * Postbuild: writes dist/llms-full.txt.
 *
 * The header block of public/llms.txt (everything before the first "## " section),
 * then, for each key page, its title, URL, meta description and the main body text
 * stripped of HTML (headings kept as markdown #). Reads the built dist/<path>/index.html.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const SITE = 'https://dolphincentrifuge.com';
const MAX_BYTES = 400 * 1024;

const PAGES = [
  '/used-alfa-laval-centrifuges-for-sale/',
  '/used-vs-remanufactured-alfa-laval-centrifuge/',
  '/centrifuge-reconditioning-standard/',
  '/alfa-laval-centrifuges/',
  '/alfa-laval-centrifuge/',
  '/authors/sanjay-prabhu/',
  '/about-dolphin-centrifuge/',
  '/industrial-disc-centrifuge-repair/',
  '/alfa-laval-centrifuge-parts/',
  '/disc-stack-centrifuge/',
  '/decanter-centrifuge/',
  '/industrial-centrifuges-faq/',
  '/contact-for-alfa-laval-centrifuges/',
];

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', mdash: ',', ndash: '-', rsquo: "'", lsquo: "'", rdquo: '"', ldquo: '"', hellip: '...', middot: '.', bull: '-' };
const decode = (s) =>
  s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, n) => (n.toLowerCase() in ENTITIES ? ENTITIES[n.toLowerCase()] : m));

function between(html, open, close) {
  const start = html.search(open);
  if (start < 0) return null;
  const rest = html.slice(start);
  const end = rest.search(close);
  return end < 0 ? rest : rest.slice(0, end);
}

function metaContent(html, attr, name) {
  const re = new RegExp(`<meta[^>]*${attr}=["']${name}["'][^>]*>`, 'i');
  const tag = html.match(re)?.[0];
  return tag ? decode(tag.match(/content=["']([^"']*)["']/i)?.[1] ?? '') : '';
}

function htmlToText(html) {
  let h = html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|style|noscript|svg|nav|footer|aside|form|button|template|iframe|select)\b[\s\S]*?<\/\1>/gi, '');
  h = h.replace(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi, (_, n, inner) => {
    const t = inner.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    return t ? `\n\n${'#'.repeat(Number(n))} ${t}\n\n` : '';
  });
  h = h
    .replace(/<li\b[^>]*>/gi, '\n- ')
    .replace(/<\/(p|div|section|ul|ol|table|tr|blockquote|figure|dl)>/gi, '\n\n')
    .replace(/<(br|hr)\b[^>]*>/gi, '\n')
    .replace(/<\/(td|th)>/gi, ' | ')
    .replace(/<[^>]+>/g, ' ');
  h = decode(h);
  return h
    .split('\n')
    .map((l) => l.replace(/[ \t]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function extractMain(html) {
  const body = between(html, /<body\b/i, /$^/) ?? html;
  const article = body.match(/<article\b[^>]*>[\s\S]*?<\/article>/i)?.[0];
  if (article) return article;
  const main = body.match(/<main\b[^>]*>[\s\S]*<\/main>/i)?.[0];
  return main ?? body;
}

const llms = fs.readFileSync(path.join(root, 'public', 'llms.txt'), 'utf8').replace(/\r\n/g, '\n');
const firstSection = llms.search(/^## /m);
const header = (firstSection < 0 ? llms : llms.slice(0, firstSection)).trim();

const parts = [header, `Full text of the key pages follows. Source: ${SITE}/llms.txt`];
const missing = [];
for (const route of PAGES) {
  const file = path.join(dist, route, 'index.html');
  if (!fs.existsSync(file)) {
    missing.push(route);
    continue;
  }
  const html = fs.readFileSync(file, 'utf8');
  const title = decode((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '').replace(/\s+/g, ' ').trim());
  const description = metaContent(html, 'name', 'description');
  const text = htmlToText(extractMain(html));
  parts.push(
    ['---', `# ${title}`, `URL: ${SITE}${route}`, ...(description ? [`Description: ${description}`] : []), '', text].join('\n'),
  );
}

if (missing.length) {
  console.error(`build-llms-full: missing built pages: ${missing.join(', ')}`);
  process.exit(1);
}

const out = `${parts.join('\n\n')}\n`;
const bytes = Buffer.byteLength(out, 'utf8');
if (bytes > MAX_BYTES) {
  console.error(`build-llms-full: output ${bytes} bytes exceeds ${MAX_BYTES}`);
  process.exit(1);
}
fs.writeFileSync(path.join(dist, 'llms-full.txt'), out);
console.log(`build-llms-full: wrote dist/llms-full.txt (${bytes} bytes, ${PAGES.length} pages)`);
