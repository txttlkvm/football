// The page-builder blocks (like Squarespace sections). Each one is a form in the editor and a block in src/lib/render.mjs.
const cats = [{ value: '', label: 'All posts' }, ...['motherhood', 'marriage', 'meals', 'breakfast', 'lunch', 'dinner'].map(v => ({ value: v, label: v[0].toUpperCase() + v.slice(1) }))];
const catOnly = cats.slice(1);
function pick0(name: string, label: string, opts: [string, string][] = [['center', 'Center'], ['top', 'Top'], ['bottom', 'Bottom'], ['left', 'Left'], ['right', 'Right'], ['face', 'Upper middle (faces)']]) { return { type: 'string', name, label, options: opts.map(([value, label]) => ({ value, label })) } as any; }
const s = (name: string, label: string, extra: any = {}) => ({ type: 'string', name, label, ...extra });
const text = (name: string, label: string, hint = 'You can use **bold**, *italic* and [links](https://…)') => s(name, label, { description: hint, ui: { component: 'textarea' } });
import { RichField } from './RichField';
const rich = (name: string, label: string) => ({ type: 'string', name, label, ui: { component: RichField } });
const focus = pick0('focus', 'Which part of the photo to keep in view');
const ratio = pick0('ratio', 'Photo shape', [['original', 'Original'], ['4/3', 'Standard (4:3)'], ['1/1', 'Square'], ['16/9', 'Wide (16:9)'], ['3/4', 'Tall (3:4)']]);
const img = (name: string, label: string) => ({ type: 'image', name, label });
const pick = (name: string, label: string, opts: [string, string][]) => s(name, label, { options: opts.map(([value, label]) => ({ value, label })) });
const bg = pick('background', 'Background', [['', 'White'], ['soft', 'Soft color'], ['dark', 'Dark']]);
const label = (icon: string, name: string) => `${icon}  ${name}`;
const item = (...keys: string[]) => ({ itemProps: (i: any) => ({ label: keys.map(k => i?.[k]).find(Boolean) || 'Untitled' }) });

export const blockTemplates = [
  { name: 'hero', label: label('🌅', 'Big banner (photo, headline, buttons)'),
    ui: { defaultItem: { heading: 'A big, friendly headline', text: 'One or two sentences that welcome people.', buttonLabel: 'Learn more', buttonUrl: '/', height: 'medium', image: '/img/hero.jpg' } },
    fields: [img('image', 'Background photo'), focus, s('heading', 'Headline'), text('text', 'Text under the headline', 'Plain text'), s('buttonLabel', 'Button 1 text'), s('buttonUrl', 'Button 1 link'), s('button2Label', 'Button 2 text (optional)'), s('button2Url', 'Button 2 link'), pick('height', 'Height', [['tall', 'Tall'], ['medium', 'Medium'], ['short', 'Short']])] },
  { name: 'text', label: label('📝', 'Text'),
    ui: { defaultItem: { heading: 'A heading', text: 'Write something here…', align: 'left', width: 'narrow' } },
    fields: [s('heading', 'Heading (optional)'), rich('text', 'Text'), pick('align', 'Alignment', [['left', 'Left'], ['center', 'Centered']]), pick('width', 'Width', [['narrow', 'Narrow (easy to read)'], ['wide', 'Wide']]), bg] },
  { name: 'imageText', label: label('🖼️', 'Photo + text side by side'),
    ui: { defaultItem: { heading: 'Your heading', text: 'Tell the story behind the photo.', imageSide: 'left', image: '/img/hero.jpg' } },
    fields: [img('image', 'Photo'), focus, ratio, s('alt', 'Describe the photo (for blind readers and Google)'), s('heading', 'Heading'), rich('text', 'Text'), s('buttonLabel', 'Button text (optional)'), s('buttonUrl', 'Button link'), pick('imageSide', 'Photo position', [['left', 'Photo on the left'], ['right', 'Photo on the right']]), bg] },
  { name: 'gallery', label: label('🏞️', 'Photo gallery'),
    ui: { defaultItem: { title: 'Gallery', perRow: '3' } },
    fields: [s('title', 'Title (optional)'), pick('perRow', 'Photos per row', [['2', '2'], ['3', '3'], ['4', '4']]), { type: 'object', name: 'images', label: 'Photos', list: true, ui: item('alt', 'caption'), fields: [img('src', 'Photo'), focus, s('alt', 'Describe the photo'), s('caption', 'Caption (optional)')] }, ratio, bg] },
  { name: 'feature', label: label('⭐', 'Highlight card (photo, title, button)'),
    ui: { defaultItem: { eyebrow: 'New', heading: 'Something worth sharing', text: 'A short description.', buttonLabel: 'Learn more', buttonUrl: '/', background: 'soft' } },
    fields: [img('image', 'Photo'), focus, ratio, s('eyebrow', 'Small label above the title'), s('heading', 'Title'), rich('text', 'Text'), s('buttonLabel', 'Button text'), s('buttonUrl', 'Button link'), s('linkLabel', 'Extra text link (optional)'), s('linkUrl', 'Extra link address'), bg] },
  { name: 'cta', label: label('📣', 'Call-to-action band'),
    ui: { defaultItem: { heading: 'Ready to join us?', text: 'One short line.', buttonLabel: 'Sign up', buttonUrl: '/', style: 'pink' } },
    fields: [s('heading', 'Headline'), s('text', 'Text'), s('buttonLabel', 'Button text'), s('buttonUrl', 'Button link'), pick('style', 'Color', [['pink', 'Accent color'], ['dark', 'Dark'], ['soft', 'Soft']])] },
  { name: 'video', label: label('🎬', 'Video'),
    ui: { defaultItem: { url: '' } },
    fields: [s('url', 'Paste a YouTube or Vimeo link'), img('file', 'Or upload a short video file'), s('caption', 'Caption (optional)'), bg] },
  { name: 'quote', label: label('💬', 'Big quote'),
    ui: { defaultItem: { text: 'A sentence worth remembering.', author: '' } },
    fields: [text('text', 'Quote', 'Plain text'), s('author', 'Who said it (optional)'), bg] },
  { name: 'postGrid', label: label('📰', 'Blog posts grid'),
    ui: { defaultItem: { title: 'Latest posts', count: 3 } },
    fields: [s('title', 'Title'), { type: 'number', name: 'count', label: 'How many posts' }, s('category', 'Only from this category', { options: cats }), bg] },
  { name: 'featuredPost', label: label('📌', 'Featured post (the one marked "Featured")'),
    ui: { defaultItem: { title: 'Featured' } }, fields: [s('title', 'Title'), bg] },
  { name: 'categoryTiles', label: label('🗂️', 'Category tiles'),
    ui: { defaultItem: { title: 'Browse by topic' } },
    fields: [s('title', 'Title'), { type: 'object', name: 'tiles', label: 'Tiles', list: true, ui: item('label'), fields: [s('label', 'Name'), s('slug', 'Category', { options: catOnly }), img('image', 'Photo')] }, bg] },
  { name: 'faq', label: label('❓', 'Questions & answers'),
    ui: { defaultItem: { title: 'Good questions' } },
    fields: [s('title', 'Title'), { type: 'object', name: 'questions', label: 'Questions', list: true, ui: item('question'), fields: [s('question', 'Question'), rich('answer', 'Answer')] }, bg] },
  { name: 'columns', label: label('🔲', 'Columns (2–4 short points)'),
    ui: { defaultItem: { title: '' } },
    fields: [s('title', 'Title (optional)'), { type: 'object', name: 'points', label: 'Columns', list: true, ui: item('heading'), fields: [s('icon', 'Emoji (optional)'), s('heading', 'Heading'), rich('text', 'Text')] }, bg] },
  { name: 'form', label: label('✉️', 'Contact form'),
    ui: { defaultItem: { title: 'Get in touch', intro: 'We would love to hear from you.', buttonLabel: 'Send message', successText: 'Thank you! Your message was sent.' } },
    fields: [s('title', 'Title'), s('intro', 'Short intro'), s('buttonLabel', 'Button text'), s('successText', 'Message shown after sending'), bg] },
  { name: 'spacer', label: label('↕️', 'Empty space'),
    ui: { defaultItem: { size: 'medium' } }, fields: [pick('size', 'Size', [['small', 'Small'], ['medium', 'Medium'], ['large', 'Large']])] },
] as any[];

export const blocksField = {
  type: 'object', name: 'blocks', label: 'Page sections (drag to reorder)', list: true,
  ui: { itemProps: (i: any) => ({ label: (i?._template || '') + (i?.heading || i?.title ? ' — ' + (i.heading || i.title) : '') }) },
  templates: blockTemplates,
} as any;
