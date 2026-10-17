// Turns the editor's video block, written in posts as {{< video url="…" file="…" caption="…" >}}, into a real player.
const YT = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/;
const VM = /vimeo\.com\/(?:video\/)?(\d+)/;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const attrsOf = (s) => Object.fromEntries([...s.matchAll(/(\w+)=["“”]([^"“”]*)["“”]/g)].map((m) => [m[1], m[2]]));

function videoHtml(a) {
  const src = (a.url || a.file || '').trim();
  if (!src) return '';
  let inner;
  const yt = YT.exec(src), vm = VM.exec(src);
  if (yt) inner = `<div class="video-embed"><iframe src="https://www.youtube-nocookie.com/embed/${yt[1]}" title="${esc(a.caption || 'Video')}" loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>`;
  else if (vm) inner = `<div class="video-embed"><iframe src="https://player.vimeo.com/video/${vm[1]}" title="${esc(a.caption || 'Video')}" loading="lazy" allow="fullscreen; picture-in-picture" allowfullscreen></iframe></div>`;
  else inner = `<video class="video-file" controls playsinline preload="metadata" src="${esc(src)}"></video>`;
  return `<figure class="video-figure">${inner}${a.caption ? `<figcaption>${esc(a.caption)}</figcaption>` : ''}</figure>`;
}

function walk(node) {
  if (!node.children) return;
  node.children = node.children.map((ch) => {
    if (ch.type === 'paragraph' && ch.children?.length === 1 && ch.children[0].type === 'text') {
      const m = /^\{\{<\s*video\s+([\s\S]*?)\s*>\}\}$/.exec(ch.children[0].value.trim());
      if (m) return { type: 'html', value: videoHtml(attrsOf(m[1])) };
    }
    walk(ch);
    return ch;
  });
}
export default function remarkEmbeds() { return (tree) => walk(tree); }
