import rss from '@astrojs/rss';
import { allPosts, settings } from '../content/site';
export const GET = (ctx) => rss({
  title: settings.siteTitle, description: settings.tagline, site: ctx.site,
  items: allPosts.map(p => ({ title: p.title, pubDate: p.date, description: p.description, link: `/${p.slug}/` })),
});
