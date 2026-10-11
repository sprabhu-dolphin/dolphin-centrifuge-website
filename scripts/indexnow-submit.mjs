// Push URLs to IndexNow (Bing, Yandex, Seznam, Naver). See docs/INDEXNOW.md.
// Usage: node scripts/indexnow-submit.mjs <url|path> [...]   or   --sitemap
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HOST = 'dolphincentrifuge.com';
const ORIGIN = `https://${HOST}`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const publicDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');

const keyFile = readdirSync(publicDir).find((f) => /^[0-9a-f]{32}\.txt$/.test(f));
if (!keyFile) throw new Error('No <32-hex-key>.txt file found in public/');
const key = keyFile.replace('.txt', '');
if (readFileSync(join(publicDir, keyFile), 'utf8').trim() !== key) throw new Error(`${keyFile} must contain its own name as the key`);
const keyLocation = `${ORIGIN}/${keyFile}`;

const locs = (xml) => [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);
const get = async (u) => {
  const r = await fetch(u);
  if (!r.ok) throw new Error(`${u} -> HTTP ${r.status}`);
  return r.text();
};

const args = process.argv.slice(2);
const urls = [];
if (args.includes('--sitemap')) {
  for (const loc of locs(await get(`${ORIGIN}/sitemap-index.xml`))) {
    urls.push(...locs(await get(loc)));
  }
}
for (const a of args.filter((x) => x !== '--sitemap')) {
  urls.push(a.startsWith('http') ? a : `${ORIGIN}${a.startsWith('/') ? '' : '/'}${a}`);
}
const urlList = [...new Set(urls)];
if (!urlList.length) {
  console.error('Usage: npm run indexnow -- <url|/path> [...]  |  npm run indexnow -- --sitemap');
  process.exit(2);
}

let failed = false;
for (let i = 0; i < urlList.length; i += 100) {
  const batch = urlList.slice(i, i + 100);
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key, keyLocation, urlList: batch }),
  });
  const ok = res.status === 200 || res.status === 202;
  if (!ok) failed = true;
  console.log(`batch ${i / 100 + 1}: ${batch.length} URLs -> HTTP ${res.status}${ok ? ' accepted' : ' ' + (await res.text()).slice(0, 200)}`);
}
console.log(`total ${urlList.length} URLs`);
process.exit(failed ? 1 : 0);
