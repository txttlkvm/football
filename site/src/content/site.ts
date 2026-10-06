import posts from './posts.json';
export type Post = { slug: string; title: string; date: string; cats: string[]; img: string | null; hasImg?: boolean; excerpt: string; body: string };
export const allPosts = (posts as Post[]).sort((a, b) => b.date.localeCompare(a.date));
export const categories = [
  { slug: 'marriage', name: 'Marriage' }, { slug: 'motherhood', name: 'Motherhood' }, { slug: 'meals', name: 'Meals' },
  { slug: 'breakfast', name: 'Breakfast' }, { slug: 'lunch', name: 'Lunch' }, { slug: 'dinner', name: 'Dinner' }, { slug: 'bake-class', name: 'Bake Class' },
];
export const nav = [
  { href: '/', label: 'Home' }, { href: '/about-me/', label: 'About Me' },
  { href: '/category/marriage/', label: 'Marriage' }, { href: '/category/motherhood/', label: 'Motherhood' },
  { href: '/category/meals/', label: 'Meals', children: [
    { href: '/category/breakfast/', label: 'Breakfast' }, { href: '/category/lunch/', label: 'Lunch' }, { href: '/category/dinner/', label: 'Dinner' } ] },
  { href: '/home-bakery/', label: "Manna’s Bakehouse", children: [
    { href: '/home-bakery/', label: 'Home Bakery' }, { href: '/home-chefs/', label: 'Kids Baking/Cooking Classes' } ] },
];
export const fmt = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

export const REGISTER_URL = 'https://form.jotform.com/253607074823155';
