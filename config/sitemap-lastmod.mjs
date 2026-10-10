// Sitemap <lastmod> from each page's real last change: the last git commit
// that touched its source file (src/pages/... or a static public/.../index.html).
// One git log pass at build time. Commits at a shallow-clone boundary are
// skipped because their date is not the file's real last change; a page with
// no known date gets no lastmod rather than the build date.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

function git(args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}

function loadLastCommitDates() {
  const dates = new Map();
  try {
    const shallowPath = path.resolve(root, git(['rev-parse', '--git-path', 'shallow']).trim());
    // Cloudflare Pages builds from a shallow clone; the repo is public, so
    // fetch the full history when possible. On failure the boundary rule below applies.
    if (existsSync(shallowPath)) {
      try { execFileSync('git', ['fetch', '--unshallow', '--quiet'], { cwd: root, stdio: 'ignore', timeout: 120000 }); } catch {}
    }
    const boundary = new Set(existsSync(shallowPath)
      ? readFileSync(shallowPath, 'utf8').split(/\s+/).filter(Boolean)
      : []);
    const log = git(['log', '--format=%x00%H %cI', '--name-only', '--',
      'src/pages', ':(glob)public/**/index.html']);
    for (const entry of log.split('\0').slice(1)) {
      const [header, ...files] = entry.split('\n');
      const [hash, date] = header.trim().split(' ');
      if (boundary.has(hash)) continue;
      for (const file of files.map((name) => name.trim()).filter(Boolean)) {
        if (!dates.has(file)) dates.set(file, date);
      }
    }
  } catch {
    // No git or no history: the sitemap simply carries no lastmod.
  }
  return dates;
}

const lastCommitDates = loadLastCommitDates();

export function lastmodForUrl(url) {
  const pathname = decodeURIComponent(new URL(url).pathname).replace(/\/$/, '');
  const candidates = pathname === ''
    ? ['src/pages/index.astro']
    : [`src/pages${pathname}.astro`, `src/pages${pathname}/index.astro`, `public${pathname}/index.html`];
  for (const file of candidates) {
    if (lastCommitDates.has(file)) return lastCommitDates.get(file);
  }
  return undefined;
}
