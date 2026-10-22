// Scheduled posts: the site is built ahead of time, so a post with a future "publish on" date needs a new build once that date passes.
// This script (run every few hours by .github/workflows/scheduled-publish.yml) checks whether any scheduled post became due since the
// last deploy. If so it updates .deployed-at, and committing that file triggers the normal automatic deploy.
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
const DIR = 'src/content/posts', STAMP = '.deployed-at';
const last = existsSync(STAMP) ? new Date(readFileSync(STAMP, 'utf8').trim()) : new Date(0);
const now = new Date();
let due = 0;
for (const f of readdirSync(DIR)) {
  if (!f.endsWith('.md')) continue;
  const fm = /^---\n([\s\S]*?)\n---/.exec(readFileSync(`${DIR}/${f}`, 'utf8'))?.[1] || '';
  if (/^draft:\s*true\s*$/m.test(fm)) continue;
  const m = /^publishDate:\s*["']?([^"'\n]+)["']?\s*$/m.exec(fm);
  if (!m) continue;
  const d = new Date(m[1]);
  if (!isNaN(d) && d > last && d <= now) { due++; console.log('Now due:', f, d.toISOString()); }
}
if (due) { writeFileSync(STAMP, now.toISOString() + '\n'); console.log(`${due} scheduled post(s) are now due; stamped ${STAMP}`); } else console.log('Nothing newly due.');
