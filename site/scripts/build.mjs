// Builds the Tina editor (/admin) when TINA_TOKEN is set, then the site. Without the token it builds the site only.
import { spawnSync } from 'node:child_process';
const run = (cmd, args) => { const r = spawnSync(cmd, args, { stdio: 'inherit', shell: true }); if (r.status) process.exit(r.status); };
if (process.env.TINA_TOKEN) run('npx', ['tinacms', 'build']); else console.log('TINA_TOKEN not set: skipping editor build');
run('npx', ['astro', 'build']);
