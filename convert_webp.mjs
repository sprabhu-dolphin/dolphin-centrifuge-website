// Batch convert all JPG/PNG images in public/images to WebP
import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import { join, extname, basename } from 'path';

const imgRoot = 'public/images';
let converted = 0, skipped = 0, errors = 0;

async function processDir(dir) {
  let entries;
  try {
    entries = await readdir(dir);
  } catch { return; }

  const webpBases = new Set(
    entries.filter(f => f.toLowerCase().endsWith('.webp'))
           .map(f => f.slice(0, -5).toLowerCase())
  );

  const promises = entries
    .filter(f => ['.jpg', '.jpeg', '.png'].includes(extname(f).toLowerCase()))
    .map(async f => {
      const base = basename(f, extname(f)).toLowerCase();
      if (webpBases.has(base)) {
        skipped++;
        return;
      }
      const inp = join(dir, f);
      const out = join(dir, basename(f, extname(f)) + '.webp');
      try {
        await sharp(inp)
          .webp({ quality: 82 })
          .toFile(out);
        converted++;
        if (converted % 10 === 0) console.log(`Converted ${converted} images...`);
      } catch (e) {
        errors++;
        console.error(`ERROR: ${f}: ${e.message}`);
      }
    });

  await Promise.all(promises);
}

// Walk all subdirectories
const pages = await readdir(imgRoot);
for (const page of pages) {
  const pageDir = join(imgRoot, page);
  const s = await stat(pageDir).catch(() => null);
  if (s?.isDirectory()) {
    await processDir(pageDir);
  }
}

console.log(`\nDone: ${converted} converted, ${skipped} already had WebP, ${errors} errors`);
