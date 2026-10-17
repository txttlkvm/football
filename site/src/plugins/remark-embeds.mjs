// Turns the editor's blocks, saved in posts as {{< name key="value" >}}, into real HTML (video player, photo, photo row, button).
import { existsSync } from 'node:fs';
const YT = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/;
const VM = /vimeo\.com\/(?:video\/)?(\d+)/;
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const attrsOf = (s) => Object.fromEntries([...s.matchAll(/(\w+)=["“”]([^"“”]*)["“”]/g)].map((m) => [m[1], m[2]]));
const posterFor = (src) => { const p = src.replace(/\.(mp4|webm|mov)$/i, '-poster.jpg'); return p !== src && src.startsWith('/') && existsSync('public' + p) ? p : ''; };

function video(a) {
  const src = (a.url || a.file || '').trim();
  if (!src) return '';
  let inner;
  const yt = YT.exec(src), vm = VM.exec(src);
  if (yt) inner = `<div class="video-embed"><iframe src="https://www.youtube-nocookie.com/embed/${yt[1]}" title="${esc(a.caption || 'Video')}" loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>`;
  else if (vm) inner = `<div class="video-embed"><iframe src="https://player.vimeo.com/video/${vm[1]}" title="${esc(a.caption || 'Video')}" loading="lazy" allow="fullscreen; picture-in-picture" allowfullscreen></iframe></div>`;
  else { const poster = posterFor(src); inner = `<video class="video-file" controls playsinline preload="metadata"${poster ? ` poster="${poster}"` : ''} src="${esc(src)}"></video>`; }
  return `<figure class="video-figure">${inner}${a.caption ? `<figcaption>${esc(a.caption)}</figcaption>` : ''}</figure>`;
}
const photo = (a) => a.src ? `<figure class="photo photo-${esc(a.size || 'medium')} photo-${esc(a.align || 'center')}"><img src="${esc(a.src)}" alt="${esc(a.alt)}" loading="lazy" decoding="async">${a.caption ? `<figcaption>${esc(a.caption)}</figcaption>` : ''}</figure>` : '';
const photoRow = (a) => { const imgs = [1, 2, 3].filter((i) => a['photo' + i]).map((i) => `<img src="${esc(a['photo' + i])}" alt="${esc(a['alt' + i])}" loading="lazy" decoding="async">`); return imgs.length ? `<div class="photo-row photo-row-${imgs.length}">${imgs.join('')}</div>` : ''; };
const button = (a) => a.url && a.label ? `<p class="btn-wrap btn-${esc(a.align || 'left')}"><a class="btn" href="${esc(a.url)}">${esc(a.label)}</a></p>` : '';
const blocks = { video, photo, photoRow, button };

function fixText(t) { return t.replace(/(https?:)÷/g, '$1//'); }   // the editor can turn a typed "//" into "÷"
function walk(node) {
  if (!node.children) return;
  node.children = node.children.map((ch) => {
    if (ch.type === 'paragraph' && ch.children?.length === 1 && ch.children[0].type === 'text') {
      const m = /^\{\{<\s*(\w+)\s+([\s\S]*?)\s*>\}\}$/.exec(ch.children[0].value.trim());
      if (m && blocks[m[1]]) return { type: 'html', value: blocks[m[1]](attrsOf(m[2])) };
    }
    if (ch.type === 'text') ch.value = fixText(ch.value);
    if (ch.type === 'link' && ch.url) ch.url = fixText(ch.url);
    walk(ch);
    return ch;
  });
}
export default function remarkEmbeds() { return (tree) => walk(tree); }
