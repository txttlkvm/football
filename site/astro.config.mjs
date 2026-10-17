import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import remarkEmbeds from './src/plugins/remark-embeds.mjs';
export default defineConfig({ site: 'https://www.marriagemotherhood-meals.org', trailingSlash: 'always', build: { format: 'directory' }, integrations: [sitemap()], markdown: { remarkPlugins: [remarkEmbeds] } });
