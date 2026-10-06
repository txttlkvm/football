// Builds the Tina editor (/admin) when TINA_TOKEN is set, then the site.
// A Tina failure never blocks the site build: the site deploys without /admin and the error is logged.
import { spawnSync } from 'node:child_process';
const run = (cmd, args) => spawnSync(cmd, args, { stdio: 'inherit', shell: true }).status;
if (process.env.TINA_TOKEN) {
  if (run('npx', ['tinacms', 'build'])) console.warn('WARNING: Tina editor build failed (check TINA_TOKEN and that this branch is enabled in Tina Cloud). Building site without /admin.');
} else console.log('TINA_TOKEN not set: skipping editor build');
process.exit(run('npx', ['astro', 'build']));
