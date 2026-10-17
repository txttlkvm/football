// A small "type and see it" text box (bold, italic, links, lists) for page-builder sections. Stores clean HTML.
import React from 'react';
import { wrapFieldsWithMeta } from 'tinacms';
import { md } from '../src/lib/render.mjs';

const KEEP: Record<string, string> = { B: 'strong', STRONG: 'strong', I: 'em', EM: 'em', U: 'u', A: 'a', BR: 'br', P: 'p', UL: 'ul', OL: 'ol', LI: 'li' };
function cleanNode(n: Node, out: Document): Node {
  if (n.nodeType === 3) return out.createTextNode(n.textContent || '');
  if (n.nodeType !== 1) return out.createDocumentFragment();
  const el = n as HTMLElement, tag = KEEP[el.tagName];
  const kids = (parent: Node) => { el.childNodes.forEach(c => parent.appendChild(cleanNode(c, out))); return parent; };
  if (['SCRIPT', 'STYLE', 'META', 'LINK'].includes(el.tagName)) return out.createDocumentFragment();
  if (!tag) return kids(out.createDocumentFragment());
  const e = out.createElement(tag);
  if (tag === 'a') { const h = el.getAttribute('href') || ''; if (/^(https?:|mailto:|\/|#)/i.test(h)) e.setAttribute('href', h); }
  return tag === 'br' ? e : kids(e);
}
export function cleanHtml(html: string) {
  const src = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html'), out = document.implementation.createHTMLDocument('');
  const box = out.createElement('div');
  src.body.childNodes.forEach(c => box.appendChild(cleanNode(c, out)));
  return box.innerHTML.replace(/<p><br><\/p>/g, '').trim();
}
const toHtml = (v: string) => (/<[a-z][\s\S]*>/i.test(v) ? v : md(v));

const tb: React.CSSProperties = { font: 'inherit', fontSize: 14, minWidth: 32, height: 30, border: '1px solid #d8d8e0', background: '#fff', borderRadius: 6, cursor: 'pointer' };
function Inner({ input }: any) {
  const ref = React.useRef<HTMLDivElement>(null);
  const last = React.useRef<string>('');
  React.useEffect(() => {
    const v = String(input.value ?? '');
    if (ref.current && v !== last.current) { ref.current.innerHTML = toHtml(v); last.current = v; }
  }, [input.value]);
  const emit = () => { if (!ref.current) return; const html = cleanHtml(ref.current.innerHTML); last.current = html; input.onChange(html); };
  const run = (c: string, arg?: string) => { ref.current?.focus(); document.execCommand(c, false, arg); emit(); };
  const link = () => { const u = window.prompt('Where should the link go?', 'https://'); if (u) run('createLink', u); };
  return (
    <div style={{ border: '1px solid #d8d8e0', borderRadius: 8, background: '#fff', overflow: 'hidden' }}>
      <div style={{ display: 'flex', gap: 6, padding: 6, background: '#f6f6f9', borderBottom: '1px solid #e6e6ee', flexWrap: 'wrap' }}>
        <button type="button" title="Bold" aria-label="Bold" style={{ ...tb, fontWeight: 700 }} onMouseDown={e => e.preventDefault()} onClick={() => run('bold')}>B</button>
        <button type="button" title="Italic" aria-label="Italic" style={{ ...tb, fontStyle: 'italic' }} onMouseDown={e => e.preventDefault()} onClick={() => run('italic')}>I</button>
        <button type="button" title="Add a link" aria-label="Add a link" style={tb} onMouseDown={e => e.preventDefault()} onClick={link}>🔗</button>
        <button type="button" title="Bulleted list" aria-label="Bulleted list" style={tb} onMouseDown={e => e.preventDefault()} onClick={() => run('insertUnorderedList')}>• List</button>
        <button type="button" title="Numbered list" aria-label="Numbered list" style={tb} onMouseDown={e => e.preventDefault()} onClick={() => run('insertOrderedList')}>1. List</button>
        <button type="button" title="Remove formatting" aria-label="Remove formatting" style={tb} onMouseDown={e => e.preventDefault()} onClick={() => run('removeFormat')}>Clear</button>
      </div>
      <div
        ref={ref} contentEditable suppressContentEditableWarning role="textbox" aria-multiline="true"
        onInput={emit} onBlur={emit}
        onPaste={e => { e.preventDefault(); const t = e.clipboardData.getData('text/html') || e.clipboardData.getData('text/plain').replace(/</g, '&lt;').replace(/\n/g, '<br>'); document.execCommand('insertHTML', false, cleanHtml(t)); emit(); }}
        style={{ minHeight: 110, padding: '10px 12px', fontSize: 15, lineHeight: 1.6, outline: 'none' }}
      />
    </div>
  );
}
export const RichField = wrapFieldsWithMeta(Inner);
