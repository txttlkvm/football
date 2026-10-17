import { allPosts } from '../content/site';
export const GET = () => new Response(JSON.stringify(allPosts.map(p => ({ slug: p.slug, title: p.title, date: p.date, img: p.img, excerpt: p.excerpt, cats: p.cats, featured: p.featured }))), { headers: { 'content-type': 'application/json' } });
