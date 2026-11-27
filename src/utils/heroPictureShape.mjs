// Decides how a hero picture is shown on phones (below the md breakpoint).
// A diagram or a machine cut out on white has a white border on all four sides:
// it is shown whole, scaled to the width, on a white ground. A photograph is not
// white along all four edges and keeps the cropped strip. Laptops are never affected.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const WHITE = 238; // every colour channel at or above this counts as white
const EDGE_SHARE = 0.85; // share of an edge that must be white
const cache = new Map();

export async function heroPictureIsWhole(publicSrc) {
  if (!publicSrc || !publicSrc.startsWith('/')) return false;
  if (cache.has(publicSrc)) return cache.get(publicSrc);
  let whole = false;
  try {
    const file = path.join(process.cwd(), 'public', publicSrc);
    if (fs.existsSync(file)) {
      const { data, info } = await sharp(file)
        .resize({ width: 200, withoutEnlargement: true })
        .flatten({ background: '#ffffff' })
        .removeAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      const { width: w, height: h } = info;
      const isWhite = (x, y) => {
        const i = (y * w + x) * 3;
        return data[i] >= WHITE && data[i + 1] >= WHITE && data[i + 2] >= WHITE;
      };
      const share = (points) => points.filter(([x, y]) => isWhite(x, y)).length / points.length;
      const top = Array.from({ length: w }, (_, x) => [x, 0]);
      const bottom = Array.from({ length: w }, (_, x) => [x, h - 1]);
      const left = Array.from({ length: h }, (_, y) => [0, y]);
      const right = Array.from({ length: h }, (_, y) => [w - 1, y]);
      whole = [top, bottom, left, right].every((edge) => share(edge) >= EDGE_SHARE);
    }
  } catch {
    whole = false;
  }
  cache.set(publicSrc, whole);
  return whole;
}
