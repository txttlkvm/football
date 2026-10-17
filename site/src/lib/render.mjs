// One renderer, two users: the Astro build (the real site) and the editor's live preview. Pure functions: data in, HTML out.
import { marked } from 'marked';
const YT = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/;
const VM = /vimeo\.com\/(?:video\/)?(\d+)/;
export const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
export const md = (s) => marked.parse(String(s ?? ''), { breaks: true, async: false });
const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
const url = (s) => esc(String(s ?? '').trim());
const btn = (label, href, cls = '') => (label && href ? `<a class="btn ${cls}" href="${url(href)}">${esc(label)}</a>` : '');

/* ---------- small content blocks (also used inside posts as {{< name … >}}) ---------- */
export function video(a, ctx = {}) {
  const src = String(a.url || a.file || '').trim();
  if (!src) return '';
  let inner;
  const yt = YT.exec(src), vm = VM.exec(src);
  if (yt) inner = `<div class="video-embed"><iframe src="https://www.youtube-nocookie.com/embed/${yt[1]}" title="${esc(a.caption || 'Video')}" loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>`;
  else if (vm) inner = `<div class="video-embed"><iframe src="https://player.vimeo.com/video/${vm[1]}" title="${esc(a.caption || 'Video')}" loading="lazy" allow="fullscreen; picture-in-picture" allowfullscreen></iframe></div>`;
  else { const poster = ctx.posterFor ? ctx.posterFor(src) : ''; inner = `<video class="video-file" controls playsinline preload="metadata"${poster ? ` poster="${poster}"` : ''} src="${esc(src)}"></video>`; }
  return `<figure class="video-figure">${inner}${a.caption ? `<figcaption>${esc(a.caption)}</figcaption>` : ''}</figure>`;
}
export const photo = (a) => a.src ? `<figure class="photo photo-${esc(a.size || 'medium')} photo-${esc(a.align || 'center')}"><img src="${esc(a.src)}" alt="${esc(a.alt)}" loading="lazy" decoding="async">${a.caption ? `<figcaption>${esc(a.caption)}</figcaption>` : ''}</figure>` : '';
export const photoRow = (a) => { const imgs = [1, 2, 3].filter((i) => a['photo' + i]).map((i) => `<img src="${esc(a['photo' + i])}" alt="${esc(a['alt' + i])}" loading="lazy" decoding="async">`); return imgs.length ? `<div class="photo-row photo-row-${imgs.length}">${imgs.join('')}</div>` : ''; };
export const button = (a) => a.url && a.label ? `<p class="btn-wrap btn-${esc(a.align || 'left')}"><a class="btn" href="${url(a.url)}">${esc(a.label)}</a></p>` : '';
export const embeds = { video, photo, photoRow, button };

/* ---------- editor rich-text (Tina AST) -> HTML, used by the live preview ---------- */
function kids(n, ctx) { return (n.children || []).map((c) => richNode(c, ctx)).join(''); }
function richNode(n, ctx) {
  switch (n.type) {
    case 'text': { let t = esc(n.text); if (!t) return ''; if (n.code) t = `<code>${t}</code>`; if (n.bold) t = `<strong>${t}</strong>`; if (n.italic) t = `<em>${t}</em>`; if (n.strikethrough) t = `<s>${t}</s>`; if (n.underline) t = `<u>${t}</u>`; return t; }
    case 'p': { const k = kids(n, ctx); return k.trim() ? `<p>${k}</p>` : ''; }
    case 'h1': case 'h2': case 'h3': case 'h4': case 'h5': case 'h6': return `<${n.type}>${kids(n, ctx)}</${n.type}>`;
    case 'blockquote': return `<blockquote>${kids(n, ctx)}</blockquote>`;
    case 'hr': return '<hr>';
    case 'ul': case 'ol': return `<${n.type}>${kids(n, ctx)}</${n.type}>`;
    case 'li': return `<li>${kids(n, ctx)}</li>`;
    case 'lic': return kids(n, ctx);
    case 'a': return `<a href="${url(n.url)}">${kids(n, ctx)}</a>`;
    case 'img': return n.url ? `<img src="${esc(n.url)}" alt="${esc(n.alt)}">` : '';
    case 'break': return '<br>';
    case 'code_block': return `<pre><code>${esc(n.value)}</code></pre>`;
    case 'mdxJsxFlowElement': case 'mdxJsxTextElement': return embeds[n.name] ? embeds[n.name](n.props || {}, ctx) : '';
    default: return kids(n, ctx);
  }
}
export const richText = (ast, ctx = {}) => (ast && ast.children ? kids(ast, ctx) : '');

/* ---------- page-builder blocks ---------- */
const bgOf = (b) => (b.background === 'soft' ? 'cream' : b.background === 'dark' ? 'dark' : '');
const section = (b, cls, inner) => `<section class="section blk ${cls} ${bgOf(b)}"><div class="wrap">${inner}</div></section>`;
const titleOf = (t) => (t ? `<h2 class="title">${esc(t)}</h2>` : '');
const card = (p) => `<a class="card" href="/${esc(p.slug)}/">${p.img ? `<img src="${esc(p.img)}" alt="" loading="lazy">` : '<div class="ph"></div>'}<div class="b"><div class="meta">${fmtDate(p.date)}</div><h3>${esc(p.title)}</h3>${p.excerpt ? `<p>${esc(String(p.excerpt).slice(0, 110))}…</p>` : ''}</div></a>`;

const blockTypes = {
  hero: (b) => `<section class="hero hero-${esc(b.height || 'tall')}" style="--hero-img:url(${esc(b.image || '/img/hero.jpg')})"><div class="wrap"><h1>${esc(b.heading)}</h1>${b.text ? `<p>${esc(b.text)}</p>` : ''}${btn(b.buttonLabel, b.buttonUrl)} ${btn(b.button2Label, b.button2Url, 'btn-outline')}</div></section>`,
  text: (b) => section(b, `blk-text blk-${esc(b.align || 'left')} blk-${esc(b.width || 'narrow')}`, `${titleOf(b.heading)}<div class="body">${md(b.text)}</div>`),
  imageText: (b) => section(b, `blk-imagetext side-${esc(b.imageSide || 'left')}`, `<div class="it"><div class="it-img">${b.image ? `<img src="${esc(b.image)}" alt="${esc(b.alt)}" loading="lazy">` : ''}</div><div class="it-txt">${b.heading ? `<h2>${esc(b.heading)}</h2>` : ''}<div class="body">${md(b.text)}</div>${b.buttonLabel ? `<p>${btn(b.buttonLabel, b.buttonUrl)}</p>` : ''}</div></div>`),
  gallery: (b) => section(b, 'blk-gallery', `${titleOf(b.title)}<div class="gal gal-${esc(b.perRow || '3')}">${(b.images || []).filter((i) => i && i.src).map((i) => `<figure><img src="${esc(i.src)}" alt="${esc(i.alt)}" loading="lazy">${i.caption ? `<figcaption>${esc(i.caption)}</figcaption>` : ''}</figure>`).join('')}</div>`),
  feature: (b) => section(b, 'blk-feature', `<div class="feature">${b.image ? `<img src="${esc(b.image)}" alt="" loading="lazy">` : ''}<div>${b.eyebrow ? `<p class="eyebrow">${esc(b.eyebrow)}</p>` : ''}<h2>${esc(b.heading)}</h2><div class="body">${md(b.text)}</div><p>${btn(b.buttonLabel, b.buttonUrl)} ${b.linkLabel && b.linkUrl ? `<a class="more" href="${url(b.linkUrl)}">${esc(b.linkLabel)}</a>` : ''}</p></div></div>`),
  cta: (b) => `<section class="section blk"><div class="wrap"><div class="cta-band cta-${esc(b.style || 'pink')}"><h2>${esc(b.heading)}</h2>${b.text ? `<p>${esc(b.text)}</p>` : ''}${btn(b.buttonLabel, b.buttonUrl, 'btn-inv')}</div></div></section>`,
  video: (b, ctx) => section(b, 'blk-video', `<div class="blk-narrow">${video(b, ctx)}</div>`),
  quote: (b) => section(b, 'blk-quote', `<blockquote><p>${esc(b.text)}</p>${b.author ? `<cite>— ${esc(b.author)}</cite>` : ''}</blockquote>`),
  postGrid: (b, ctx) => { const list = (ctx.posts || []).filter((p) => !b.category || (p.cats || []).includes(b.category)).slice(0, Number(b.count) || 6); return list.length ? section(b, 'blk-posts', `${titleOf(b.title)}<div class="grid">${list.map(card).join('')}</div>`) : ''; },
  featuredPost: (b, ctx) => { const p = (ctx.posts || []).find((x) => x.featured); return p ? section(b, 'blk-featured', `${titleOf(b.title)}<div class="feature">${p.img ? `<img src="${esc(p.img)}" alt="${esc(p.title)}" loading="lazy">` : ''}<div><p class="eyebrow">${fmtDate(p.date)}</p><h2>${esc(p.title)}</h2><p>${esc(p.excerpt)}</p><p><a class="btn" href="/${esc(p.slug)}/">Read the post</a></p></div></div>`) : ''; },
  categoryTiles: (b) => section(b, 'blk-cats', `${titleOf(b.title)}<div class="grid">${(b.tiles || []).filter((c) => c && c.slug).map((c) => `<a class="card cat" href="/category/${esc(c.slug)}/">${c.image ? `<img src="${esc(c.image)}" alt="" loading="lazy">` : ''}<div class="b">${esc(c.label)}</div></a>`).join('')}</div>`),
  faq: (b) => section(b, 'blk-faq', `${titleOf(b.title)}<div class="blk-narrow">${(b.questions || []).filter((i) => i && i.question).map((i) => `<details><summary>${esc(i.question)}</summary><div class="body">${md(i.answer)}</div></details>`).join('')}</div>`),
  columns: (b) => section(b, 'blk-columns', `${titleOf(b.title)}<div class="cols cols-${Math.min(4, Math.max(2, (b.points || []).length))}">${(b.points || []).filter(Boolean).map((c) => `<div class="col">${c.icon ? `<div class="ico">${esc(c.icon)}</div>` : ''}<h3>${esc(c.heading)}</h3><div class="body">${md(c.text)}</div></div>`).join('')}</div>`),
  spacer: (b) => `<div class="spacer spacer-${esc(b.size || 'medium')}"></div>`,
};
export const blocksHtml = (blocks, ctx = {}) => (blocks || []).filter(Boolean).map((b) => { const f = blockTypes[b._template]; return f ? f(b, ctx) : ''; }).join('\n');
