import { getCollection } from 'astro:content';
import settings from './settings.json';
export { settings };
const now = new Date();
export const allPosts = (await getCollection('posts'))
  .filter(e => !e.data.draft && +(e.data.publishDate ?? e.data.date) <= +now)
  .map(e => ({
    slug: e.id, entry: e, title: e.data.title, date: e.data.publishDate ?? e.data.date, cats: e.data.categories, img: e.data.image ?? null,
    excerpt: e.data.excerpt, description: e.data.description ?? e.data.excerpt, featured: e.data.featured, hasImg: /!\[|<img/.test(e.body ?? ''),
  })).sort((a, b) => +b.date - +a.date);
export const allPages = (await getCollection('pages')).filter(e => !e.data.draft);
export const categories = [
  { slug: 'marriage', name: 'Marriage' }, { slug: 'motherhood', name: 'Motherhood' }, { slug: 'meals', name: 'Meals' },
  { slug: 'breakfast', name: 'Breakfast' }, { slug: 'lunch', name: 'Lunch' }, { slug: 'dinner', name: 'Dinner' }, { slug: 'bake-class', name: 'Bake Class' },
];
export const nav = settings.nav as { label: string; href: string; children?: { label: string; href: string }[] }[];
export const fmt = (d: Date) => d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

export const REGISTER_URL = settings.registerUrl;

import { existsSync } from 'node:fs';
export const renderCtx = {
  posts: allPosts.map(p => ({ slug: p.slug, title: p.title, date: p.date, img: p.img, excerpt: p.excerpt, cats: p.cats, featured: p.featured })),
  posterFor: (src: string) => { const p = src.replace(/\.(mp4|webm|mov)$/i, '-poster.jpg'); return p !== src && src.startsWith('/') && existsSync('public' + p) ? p : ''; },
};
