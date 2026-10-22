// Makes small WebP copies of every photo in public/img so pages load fast on phones.
// Output goes to public/img/_r/ (not committed). Safe to run repeatedly: it only redoes changed photos.
import { readdirSync, statSync, mkdirSync, existsSync } from 'node:fs';
import { join, parse } from 'node:path';
let sharp;
try { sharp = (await import('sharp')).default; } catch { console.warn('sharp not available: skipping image optimisation'); process.exit(0); }
const SRC = 'public/img', OUT = join(SRC, '_r'), WIDTHS = [480, 960, 1600];
mkdirSync(OUT, { recursive: true });
let made = 0;
for (const f of readdirSync(SRC)) {
  if (!/\.(jpe?g|png)$/i.test(f)) continue;
  const p = join(SRC, f), { name } = parse(f), mtime = statSync(p).mtimeMs;
  for (const w of WIDTHS) {
    const out = join(OUT, `${name}-${w}.webp`);
    if (existsSync(out) && statSync(out).mtimeMs >= mtime) continue;
    try { await sharp(p, { failOn: 'none' }).rotate().resize({ width: w, withoutEnlargement: true }).webp({ quality: 78 }).toFile(out); made++; } catch (e) { console.warn('could not resize', f, e.message); }
  }
}
console.log(`Image variants: ${made} created`);
