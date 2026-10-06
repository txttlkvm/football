import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
export default defineConfig({ site: 'https://marriagemotherhood-meals.vercel.app' /* TODO: switch to https://marriagemotherhood-meals.org at DNS cutover */, trailingSlash: 'always', build: { format: 'directory' }, integrations: [sitemap()] });
