// One renderer, two users: the Astro build (the real site) and the editor's live preview. Pure functions: data in, HTML out.
import { marked } from 'marked';
const YT = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/;
const VM = /vimeo\.com\/(?:video\/)?(\d+)/;
export const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
export const md = (s) => marked.parse(String(s ?? ''), { breaks: true, async: false });
const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
const url = (s) => esc(String(s ?? '').trim());
const FOCUS = { top: '50% 0%', center: '50% 50%', bottom: '50% 100%', left: '0% 50%', right: '100% 50%', face: '50% 25%' };
const imgStyle = (focus, ratio) => { const st = []; if (ratio && ratio !== 'original') st.push(`aspect-ratio:${esc(ratio)};object-fit:cover`); if (focus && FOCUS[focus]) st.push(`object-position:${FOCUS[focus]}`); return st.length ? ` style="${st.join(';')}"` : ''; };
// In the editor preview (ctx.edit) every editable part carries data-e="field path" so it can be clicked and changed right on the page.
const E = (ctx, i) => (key, type = 'text') => (ctx.edit ? ` data-e="blocks.${i}.${esc(key)}" data-t="${type}"` : '');
const btn = (label, href, cls = '', ed = '') => (label && href ? `<a class="btn ${cls}" href="${url(href)}"${ed}>${esc(label)}</a>` : '');

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
const card = (p) => `<a class="card" href="/${esc(p.slug)}/">${p.img ? `<img src="${esc(p.img)}" alt="" loading="lazy">` : '<div class="ph"></div>'}<div class="b">${(p.cats || [])[0] ? `<div class="cat-eyebrow">${esc(p.cats[0])}</div>` : ''}<h3>${esc(p.title)}</h3>${p.excerpt ? `<p class="clamp">${esc(String(p.excerpt).replace(/…+$|\.{3}$/, ''))}</p>` : ''}<div class="meta">${fmtDate(p.date)}</div></div></a>`;

const blockTypes = {
  hero: (b, ctx, i) => { const e = E(ctx, i); return `<section class="hero hero-${esc(b.height || 'tall')}" style="--hero-img:url(${esc(b.image || '/img/hero.jpg')});--hero-pos:${FOCUS[b.focus] || 'center right'}"${e('image', 'img')}><div class="wrap"><h1${e('heading')}>${esc(b.heading)}</h1>${b.text ? `<p${e('text')}>${esc(b.text)}</p>` : ''}${btn(b.buttonLabel, b.buttonUrl, '', e('buttonLabel'))} ${btn(b.button2Label, b.button2Url, 'btn-outline', e('button2Label'))}</div></section>`; },
  text: (b, ctx, i) => { const e = E(ctx, i); return section(b, `blk-text blk-${esc(b.align || 'left')} blk-${esc(b.width || 'narrow')}`, `${b.heading ? `<h2 class="title"${e('heading')}>${esc(b.heading)}</h2>` : ''}<div class="body"${e('text', 'field')}>${md(b.text)}</div>`); },
  imageText: (b, ctx, i) => { const e = E(ctx, i); return section(b, `blk-imagetext side-${esc(b.imageSide || 'left')}`, `<div class="it"><div class="it-img">${b.image ? `<img src="${esc(b.image)}" alt="${esc(b.alt)}" loading="lazy"${imgStyle(b.focus, b.ratio)}${e('image', 'img')}>` : ''}</div><div class="it-txt">${b.heading ? `<h2${e('heading')}>${esc(b.heading)}</h2>` : ''}<div class="body"${e('text', 'field')}>${md(b.text)}</div>${b.buttonLabel ? `<p>${btn(b.buttonLabel, b.buttonUrl, '', e('buttonLabel'))}</p>` : ''}</div></div>`); },
  gallery: (b, ctx, i) => { const e = E(ctx, i); return section(b, 'blk-gallery', `${b.title ? `<h2 class="title"${e('title')}>${esc(b.title)}</h2>` : ''}<div class="gal gal-${esc(b.perRow || '3')}">${(b.images || []).map((im, j) => (im && im.src ? `<figure><img src="${esc(im.src)}" alt="${esc(im.alt)}" loading="lazy"${imgStyle(im.focus, b.ratio || '4/3')}${e(`images.${j}.src`, 'img')}>${im.caption ? `<figcaption${e(`images.${j}.caption`)}>${esc(im.caption)}</figcaption>` : ''}</figure>` : '')).join('')}</div>`); },
  feature: (b, ctx, i) => { const e = E(ctx, i); return section(b, 'blk-feature', `<div class="feature">${b.image ? `<img src="${esc(b.image)}" alt="" loading="lazy"${imgStyle(b.focus, b.ratio)}${e('image', 'img')}>` : ''}<div>${b.eyebrow ? `<p class="eyebrow"${e('eyebrow')}>${esc(b.eyebrow)}</p>` : ''}<h2${e('heading')}>${esc(b.heading)}</h2><div class="body"${e('text', 'field')}>${md(b.text)}</div><p>${btn(b.buttonLabel, b.buttonUrl, '', e('buttonLabel'))} ${b.linkLabel && b.linkUrl ? `<a class="more" href="${url(b.linkUrl)}"${e('linkLabel')}>${esc(b.linkLabel)}</a>` : ''}</p></div></div>`); },
  cta: (b, ctx, i) => { const e = E(ctx, i); return `<section class="section blk"><div class="wrap"><div class="cta-band cta-${esc(b.style || 'pink')}"><h2${e('heading')}>${esc(b.heading)}</h2>${b.text ? `<p${e('text')}>${esc(b.text)}</p>` : ''}${btn(b.buttonLabel, b.buttonUrl, 'btn-inv', e('buttonLabel'))}</div></div></section>`; },
  video: (b, ctx, i) => { const e = E(ctx, i); return section(b, 'blk-video', `<div class="blk-narrow"${e('url', 'field')}>${video(b, ctx) || '<p class="empty-hint">Click here to add a video</p>'}</div>`); },
  quote: (b, ctx, i) => { const e = E(ctx, i); return section(b, 'blk-quote', `<blockquote><p${e('text')}>${esc(b.text)}</p>${b.author ? `<cite${e('author')}>— ${esc(b.author)}</cite>` : ''}</blockquote>`); },
  postGrid: (b, ctx, i) => { const e = E(ctx, i); const list = (ctx.posts || []).filter((p) => !b.category || (p.cats || []).includes(b.category)).slice(0, Number(b.count) || 6); return list.length ? section(b, 'blk-posts', `${b.title ? `<h2 class="title"${e('title')}>${esc(b.title)}</h2>` : ''}<div class="grid">${list.map(card).join('')}</div>`) : ''; },
  featuredPost: (b, ctx, i) => { const e = E(ctx, i); const p = (ctx.posts || []).find((x) => x.featured); return p ? section(b, 'blk-featured', `${b.title ? `<h2 class="title"${e('title')}>${esc(b.title)}</h2>` : ''}<div class="feature">${p.img ? `<img src="${esc(p.img)}" alt="${esc(p.title)}" loading="lazy">` : ''}<div><p class="eyebrow">${fmtDate(p.date)}</p><h2>${esc(p.title)}</h2><p>${esc(p.excerpt)}</p><p><a class="btn" href="/${esc(p.slug)}/">Read the post</a></p></div></div>`) : ''; },
  categoryTiles: (b, ctx, i) => { const e = E(ctx, i); return section(b, 'blk-cats', `${b.title ? `<h2 class="title"${e('title')}>${esc(b.title)}</h2>` : ''}<div class="grid">${(b.tiles || []).map((c, j) => (c && c.slug ? `<a class="card cat" href="/category/${esc(c.slug)}/">${c.image ? `<img src="${esc(c.image)}" alt=""  loading="lazy"${e(`tiles.${j}.image`, 'img')}>` : ''}<div class="b"${e(`tiles.${j}.label`)}>${esc(c.label)}</div></a>` : '')).join('')}</div>`); },
  faq: (b, ctx, i) => { const e = E(ctx, i); return section(b, 'blk-faq', `${b.title ? `<h2 class="title"${e('title')}>${esc(b.title)}</h2>` : ''}<div class="blk-narrow">${(b.questions || []).map((q, j) => (q && q.question ? `<details${ctx.edit ? ' open' : ''}><summary${e(`questions.${j}.question`)}>${esc(q.question)}</summary><div class="body"${e(`questions.${j}.answer`, 'field')}>${md(q.answer)}</div></details>` : '')).join('')}</div>`); },
  columns: (b, ctx, i) => { const e = E(ctx, i); return section(b, 'blk-columns', `${b.title ? `<h2 class="title"${e('title')}>${esc(b.title)}</h2>` : ''}<div class="cols cols-${Math.min(4, Math.max(2, (b.points || []).length))}">${(b.points || []).map((c, j) => (c ? `<div class="col">${c.icon ? `<div class="ico"${e(`points.${j}.icon`)}>${esc(c.icon)}</div>` : ''}<h3${e(`points.${j}.heading`)}>${esc(c.heading)}</h3><div class="body"${e(`points.${j}.text`, 'field')}>${md(c.text)}</div></div>` : '')).join('')}</div>`); },
  form: (b, ctx, i) => { const e = E(ctx, i); if (!ctx.formsKey && !ctx.edit) return ''; return section(b, 'blk-form', `<div class="blk-narrow">${b.title ? `<h2 class="title"${e('title')}>${esc(b.title)}</h2>` : ''}${b.intro ? `<p class="form-intro"${e('intro')}>${esc(b.intro)}</p>` : ''}<form class="contact" data-success="${esc(b.successText || 'Thank you! Your message was sent.')}" action="https://api.web3forms.com/submit" method="post"><input type="hidden" name="access_key" value="${esc(ctx.formsKey === true ? '' : ctx.formsKey)}"><input type="hidden" name="subject" value="${esc(b.title || 'New message from your website')}"><input type="checkbox" name="botcheck" class="hp" tabindex="-1" autocomplete="off"><label>Your name<input name="name" required autocomplete="name"></label><label>Email<input type="email" name="email" required autocomplete="email"></label><label>Message<textarea name="message" rows="5" required></textarea></label><button class="btn" type="submit"${e('buttonLabel')}>${esc(b.buttonLabel || 'Send message')}</button><p class="form-status" role="status"></p></form>${ctx.edit && !ctx.formsKey ? '<p class="empty-hint">Add your form key in Site Settings → Contact form to make this form work.</p>' : ''}</div>`); },
  spacer: (b) => `<div class="spacer spacer-${esc(b.size || 'medium')}"></div>`,
};
export const blocksHtml = (blocks, ctx = {}) => (blocks || []).map((b, i) => { if (!b) return ''; const f = blockTypes[b._template]; return f ? f(b, ctx, i) : ''; }).join('\n');
