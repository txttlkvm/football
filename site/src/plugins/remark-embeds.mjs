// Turns the editor's blocks, saved in posts as {{< name key="value" >}}, into real HTML using the shared renderer.
import { existsSync } from 'node:fs';
import { embeds } from '../lib/render.mjs';
const attrsOf = (s) => Object.fromEntries([...s.matchAll(/(\w+)=(?:"((?:[^"\\]|\\.)*)"|“([^”]*)”)/g)].map((m) => [m[1], (m[2] ?? m[3]).replace(/\\"/g, '"')]));
const posterFor = (src) => { const p = src.replace(/\.(mp4|webm|mov)$/i, '-poster.jpg'); return p !== src && src.startsWith('/') && existsSync('public' + p) ? p : ''; };
const fixText = (t) => t.replace(/(https?:)÷/g, '$1//');   // the editor can turn a typed "//" into "÷"
function walk(node) {
  if (!node.children) return;
  node.children = node.children.map((ch) => {
    if (ch.type === 'paragraph' && ch.children?.length === 1 && ch.children[0].type === 'text') {
      const m = /^\{\{<\s*(\w+)\s+([\s\S]*?)\s*>\}\}$/.exec(ch.children[0].value.trim());
      if (m && embeds[m[1]]) return { type: 'html', value: embeds[m[1]](attrsOf(m[2]), { posterFor }) };
    }
    if (ch.type === 'text') ch.value = fixText(ch.value);
    if (ch.type === 'link' && ch.url) ch.url = fixText(ch.url);
    walk(ch);
    return ch;
  });
}
export default function remarkEmbeds() { return (tree) => walk(tree); }
