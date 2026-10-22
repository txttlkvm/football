// Ready-made starting points: whole pages, post outlines, and one-click "looks" for the whole site.
const t = (text: string) => ({ type: 'text', text });
const p = (text: string) => ({ type: 'p', children: [t(text)] });
const h2 = (text: string) => ({ type: 'h2', children: [t(text)] });
const ul = (...items: string[]) => ({ type: 'ul', children: items.map(i => ({ type: 'li', children: [{ type: 'lic', children: [t(i)] }] })) });
const ol = (...items: string[]) => ({ type: 'ol', children: items.map(i => ({ type: 'li', children: [{ type: 'lic', children: [t(i)] }] })) });
const root = (...children: any[]) => ({ type: 'root', children });
const HERO = '/img/hero.jpg';

export const PAGE_TEMPLATES = [
  { id: 'landing', icon: '🚀', name: 'Landing page', desc: 'Big welcome, three reasons, kind words, a sign-up button.', title: 'Welcome',
    blocks: [
      { hero: { image: HERO, heading: 'A warm, friendly headline', text: 'One or two sentences that tell people what this page is about.', buttonLabel: 'Sign up', buttonUrl: '/', height: 'medium' } },
      { columns: { title: 'Why you will love it', points: [{ icon: '🍞', heading: 'First reason', text: 'A short sentence.' }, { icon: '🥣', heading: 'Second reason', text: 'A short sentence.' }, { icon: '🍰', heading: 'Third reason', text: 'A short sentence.' }] } },
      { testimonials: { title: 'Kind words', background: 'soft', quotes: [{ text: 'Something lovely a reader or parent said.', name: 'Name' }, { text: 'Another kind comment.', name: 'Name' }] } },
      { cta: { heading: 'Ready to join us?', text: 'One short, friendly line.', buttonLabel: 'Sign up', buttonUrl: '/', style: 'pink' } },
    ] },
  { id: 'class', icon: '👩‍🍳', name: 'Class or event page', desc: 'Price, day and time, a photo story, questions and a sign-up button.', title: 'New class',
    blocks: [
      { hero: { image: HERO, heading: 'Class name', text: 'Who it is for and what they will learn.', buttonLabel: 'Register', buttonUrl: '/', height: 'short' } },
      { facts: { title: 'Class details', background: 'soft', items: [{ label: 'Price', value: '$0' }, { label: 'When', value: 'Day and time' }, { label: 'Ages', value: 'Who it is for' }, { label: 'Where', value: 'Place' }] } },
      { split: { ratio: '1/1', valign: 'center', mobileFirst: 'left', left: { kind: 'photo', image: HERO, caption: '' }, right: { kind: 'text', text: '## What we will do\n\nDescribe a typical class in a few friendly sentences.' } } },
      { faq: { title: 'Good questions', questions: [{ question: 'What should we bring?', answer: 'Your answer.' }, { question: 'What if we miss a class?', answer: 'Your answer.' }] } },
      { buttons: { align: 'center', links: [{ label: 'Register now', url: '/', style: 'solid' }] } },
    ] },
  { id: 'about', icon: '💁🏾‍♀️', name: 'About me', desc: 'Your photo beside your story, a favourite quote, an invitation.', title: 'About',
    blocks: [
      { split: { ratio: '1/2', valign: 'center', mobileFirst: 'left', left: { kind: 'photo', image: HERO, caption: '' }, right: { kind: 'text', text: '## Hello, I am…\n\nTell your story here. Who you are, what you love, and why you started.' } } },
      { quote: { text: 'A sentence you live by.', author: '' , background: 'soft' } },
      { cta: { heading: 'Let us stay in touch', text: 'Follow along for new recipes and family stories.', buttonLabel: 'Read the blog', buttonUrl: '/blog/', style: 'pink' } },
    ] },
  { id: 'menu', icon: '🧁', name: 'Menu & prices', desc: 'A short intro, a clean price list and an order button.', title: 'Menu',
    blocks: [
      { text: { heading: 'Our menu', text: 'A line or two about what you make and how people can order.', align: 'center', width: 'narrow' } },
      { facts: { title: 'Prices', background: 'soft', items: [{ label: 'Item one', value: '$0' }, { label: 'Item two', value: '$0' }, { label: 'Item three', value: '$0' }] } },
      { buttons: { align: 'center', links: [{ label: 'Order now', url: '/', style: 'solid' }] } },
    ] },
  { id: 'contact', icon: '✉️', name: 'Contact page', desc: 'Where to find you and a message form.', title: 'Contact',
    blocks: [
      { text: { heading: 'Say hello', text: 'We would love to hear from you.', align: 'center', width: 'narrow' } },
      { facts: { title: '', items: [{ label: 'Email', value: 'you@example.com' }, { label: 'Replies', value: 'Within 2 days' }] } },
      { form: { title: 'Send a message', intro: 'Tell us how we can help.', buttonLabel: 'Send message', successText: 'Thank you! Your message was sent.' } },
    ] },
  { id: 'blank', icon: '📄', name: 'Blank page', desc: 'Just a title and a place to write.', title: 'New page',
    blocks: [{ text: { heading: 'A heading', text: 'Write something here…', align: 'left', width: 'narrow' } }] },
];

export const POST_TEMPLATES = [
  { id: 'recipe', icon: '🥘', name: 'Recipe post', desc: 'Ingredients, steps and a tip — ready to fill in.', title: 'New recipe', categories: ['meals'],
    body: root(p('A sentence or two about why your family loves this dish.'), h2('Ingredients'), ul('1 cup of something', '2 tablespoons of something else', 'A pinch of love'), h2('How to make it'), ol('First do this.', 'Then do that.', 'Serve and enjoy!'), h2('A little tip'), p('Anything that makes it easier or tastier.')) },
  { id: 'story', icon: '📖', name: 'Family story', desc: 'A heartfelt post with a beginning, a lesson and a closing thought.', title: 'New story', categories: ['motherhood'],
    body: root(p('Start with a moment — what happened?'), h2('What I learned'), p('Share the lesson or encouragement.'), h2('For you'), p('End with a question or a prayer for the reader.')) },
  { id: 'update', icon: '🗓️', name: 'Weekly update', desc: 'What’s new, what’s cooking, what’s coming.', title: 'This week', categories: [],
    body: root(h2('What’s new'), p('A few lines.'), h2('What’s cooking'), ul('Something delicious', 'Something quick'), h2('Coming up'), p('Dates, classes or posts to look forward to.')) },
];

export const LOOKS = [
  { id: 'blush', name: 'Blush (current)', accent: '#ff66c4', dark: '#120f0c', text: '#4a4946', soft: '#fdf7f4', headingFont: 'Outfit', bodyFont: 'Heebo' },
  { id: 'sage', name: 'Sage & cream', accent: '#4f9d7e', dark: '#14231c', text: '#44504a', soft: '#f4f8f4', headingFont: 'Lora', bodyFont: 'Nunito' },
  { id: 'ocean', name: 'Ocean breeze', accent: '#3b82c4', dark: '#0f1c2b', text: '#3f4a57', soft: '#f1f6fb', headingFont: 'Montserrat', bodyFont: 'Inter' },
  { id: 'sunset', name: 'Golden sunset', accent: '#f08a24', dark: '#2a1608', text: '#52473d', soft: '#fff6ec', headingFont: 'Playfair Display', bodyFont: 'Nunito' },
  { id: 'berry', name: 'Berry', accent: '#b02a6b', dark: '#220a17', text: '#4d3d46', soft: '#fbf1f6', headingFont: 'Poppins', bodyFont: 'Open Sans' },
  { id: 'mono', name: 'Quiet & classic', accent: '#444444', dark: '#111111', text: '#444444', soft: '#f6f6f4', headingFont: 'DM Sans', bodyFont: 'DM Sans' },
];
