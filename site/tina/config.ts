import { defineConfig } from 'tinacms';
const branch = process.env.TINA_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || process.env.HEAD || 'main';
const cats = ['motherhood', 'marriage', 'meals', 'breakfast', 'lunch', 'dinner'].map(v => ({ value: v, label: v[0].toUpperCase() + v.slice(1) }));
const slugify = (v: any) => (v?.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const router = ({ document }: any) => `/${document._sys.filename}/`;
const color = { component: 'color', colorFormat: 'hex' } as any;
const link = [
  { type: 'string', name: 'label', label: 'Menu text', required: true },
  { type: 'string', name: 'href', label: 'Link (e.g. /about-me/ or https://…)', required: true },
] as any[];
export default defineConfig({
  branch,
  clientId: '01789bf2-d73e-4861-a4f9-5960dbbd6392',
  token: process.env.TINA_TOKEN,
  build: { outputFolder: 'admin', publicFolder: 'public' },
  media: { tina: { mediaRoot: 'img', publicFolder: 'public' } },
  schema: {
    collections: [
      {
        name: 'post', label: 'Blog Posts', path: 'src/content/posts', format: 'md',
        ui: { filename: { slugify }, router },
        defaultItem: () => ({ date: new Date().toISOString(), categories: [], draft: false, featured: false }),
        fields: [
          { type: 'string', name: 'title', label: 'Title', isTitle: true, required: true },
          { type: 'datetime', name: 'date', label: 'Date shown on the post', required: true },
          { type: 'string', name: 'categories', label: 'Categories (tick any)', list: true, options: cats },
          { type: 'image', name: 'image', label: 'Cover photo' },
          { type: 'string', name: 'excerpt', label: 'Short summary (shown on cards)', ui: { component: 'textarea' } },
          { type: 'rich-text', name: 'body', label: 'Write your post', isBody: true },
          { type: 'boolean', name: 'draft', label: 'Draft — keep hidden from the website' },
          { type: 'datetime', name: 'publishDate', label: 'Publish on a future date (optional)', description: 'Leave empty to publish right away. A future date keeps the post hidden until then.' },
          { type: 'string', name: 'description', label: 'Search-engine description (optional)', ui: { component: 'textarea' } },
          { type: 'boolean', name: 'featured', label: 'Featured' },
        ],
      },
      {
        name: 'page', label: 'Pages', path: 'src/content/pages', format: 'md',
        ui: { filename: { slugify }, router, allowedActions: { delete: false } },
        fields: [
          { type: 'string', name: 'title', label: 'Page title', isTitle: true, required: true },
          { type: 'image', name: 'image', label: 'Top photo' },
          { type: 'rich-text', name: 'body', label: 'Page content', isBody: true },
          { type: 'boolean', name: 'showRegisterCta', label: 'Show the "Register" box and button on this page' },
          { type: 'string', name: 'description', label: 'Search-engine description (optional)', ui: { component: 'textarea' } },
          { type: 'boolean', name: 'draft', label: 'Draft — keep hidden from the website' },
        ],
      },
      {
        name: 'settings', label: 'Site Settings', path: 'src/content', format: 'json',
        match: { include: 'settings' },
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          { type: 'string', name: 'siteTitle', label: 'Site name' },
          { type: 'string', name: 'tagline', label: 'Tagline' },
          { type: 'object', name: 'theme', label: 'Colors & fonts', fields: [
            { type: 'string', name: 'accent', label: 'Accent color (buttons, links)', ui: color },
            { type: 'string', name: 'dark', label: 'Headline color', ui: color },
            { type: 'string', name: 'text', label: 'Body text color', ui: color },
            { type: 'string', name: 'soft', label: 'Soft background color', ui: color },
            { type: 'string', name: 'headingFont', label: 'Headline font', options: ['Outfit', 'Poppins', 'Montserrat', 'Playfair Display', 'Lora', 'DM Sans'] },
            { type: 'string', name: 'bodyFont', label: 'Body font', options: ['Heebo', 'Inter', 'Nunito', 'Open Sans', 'DM Sans', 'Lora'] } ] },
          { type: 'object', name: 'nav', label: 'Menu', list: true, ui: { itemProps: (i: any) => ({ label: i?.label }) }, fields: [
            ...link,
            { type: 'object', name: 'children', label: 'Drop-down items', list: true, ui: { itemProps: (i: any) => ({ label: i?.label }) }, fields: link } ] },
          { type: 'string', name: 'registerUrl', label: 'Class sign-up link' },
          { type: 'object', name: 'announcement', label: 'Top announcement bar', fields: [
            { type: 'boolean', name: 'show', label: 'Show the bar' },
            { type: 'string', name: 'text', label: 'Bold text' },
            { type: 'string', name: 'linkText', label: 'Link text' } ] },
          { type: 'object', name: 'hero', label: 'Home page welcome banner', fields: [
            { type: 'string', name: 'title', label: 'Headline' },
            { type: 'string', name: 'intro', label: 'Intro text', ui: { component: 'textarea' } } ] },
          { type: 'object', name: 'classCard', label: 'Kids class card', fields: [
            { type: 'boolean', name: 'show', label: 'Show the card' },
            { type: 'string', name: 'label', label: 'Small label' },
            { type: 'string', name: 'title', label: 'Title' },
            { type: 'string', name: 'text', label: 'Description', ui: { component: 'textarea' } },
            { type: 'string', name: 'buttonText', label: 'Button text' } ] },
          { type: 'string', name: 'footerText', label: 'Footer text' },
          { type: 'object', name: 'social', label: 'Social links (footer)', list: true, ui: { itemProps: (i: any) => ({ label: i?.label }) }, fields: [
            { type: 'string', name: 'label', label: 'Name (e.g. Instagram)' }, { type: 'string', name: 'url', label: 'Link' } ] },
        ],
      },
    ],
  },
});
