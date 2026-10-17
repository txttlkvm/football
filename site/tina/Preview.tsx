// Live preview panel shown at the top of every editing form: phone / desktop view, or pop out to a big window.
import React from 'react';
import { richText, blocksHtml, esc } from '../src/lib/render.mjs';

let shell: any = null;
async function loadShell() {
  if (shell) return shell;
  const [html, posts] = await Promise.all([fetch('/', { cache: 'no-store' }).then(r => r.text()), fetch('/posts.json').then(r => r.json()).catch(() => [])]);
  const doc = new DOMParser().parseFromString(html, 'text/html');
  let head = '';
  doc.querySelectorAll('head link[rel=stylesheet], head style').forEach(el => (head += el.outerHTML));
  shell = {
    head, posts,
    announce: (doc.querySelector('.announce')?.outerHTML ?? '').replace(' hidden=""', '').replace(' hidden', ''),
    header: doc.querySelector('.site-header')?.outerHTML ?? '', footer: doc.querySelector('.footer')?.outerHTML ?? '', main: doc.querySelector('main')?.innerHTML ?? '',
  };
  return shell;
}
const fmt = (d: any) => (d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }) : '');

async function build(kind: string, v: any): Promise<string> {
  const c = await loadShell();
  const ctx = { posts: c.posts };
  let content = '';
  const cover = v.image ? `<img src="${esc(v.image)}" alt="" style="margin:0 auto 1.5em">` : '';
  if (kind === 'post') {
    content = `<article class="article"><div class="narrow"><div class="meta">${fmt(v.date)}</div><h1>${esc(v.title)}</h1>${cover}<div class="body">${richText(v.body, ctx)}</div></div></article>`;
  } else if (kind === 'page') {
    const blocks = blocksHtml(v.blocks, ctx);
    content = v.layout === 'blocks' ? blocks : `<article class="article"><div class="narrow"><h1>${esc(v.title)}</h1>${cover}<div class="body">${richText(v.body, ctx)}</div></div></article>${blocks}`;
  } else content = c.main;
  let doc = `<!doctype html><html class="js"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base href="${location.origin}/" target="_blank">${c.head}<style>*,*::before,*::after{animation:none!important;transition:none!important}.reveal,.js .reveal{opacity:1!important;transform:none!important}.sticky-register{display:none!important}.site-header{position:static}</style></head><body>${c.announce}${c.header}<main>${content}</main>${c.footer}</body></html>`;
  if (kind === 'settings') {
    const d = new DOMParser().parseFromString(doc, 'text/html'), t = v.theme || {};
    const st = d.createElement('style');
    st.textContent = `html:root{--pink:${t.accent};--ink:${t.dark};--text:${t.text};--cream:${t.soft};--font-head:"${t.headingFont}",system-ui,sans-serif;--font-body:"${t.bodyFont}",system-ui,sans-serif}`;
    d.head.append(st);
    const fl = d.createElement('link'); fl.rel = 'stylesheet'; fl.href = `https://fonts.googleapis.com/css2?family=${String(t.headingFont || '').replace(/ /g, '+')}:wght@400;500;600;700&family=${String(t.bodyFont || '').replace(/ /g, '+')}:wght@400;500;600;700&display=swap`; d.head.append(fl);
    const a = d.querySelector('.announce'); if (a) { if (v.announcement?.show === false) a.remove(); else { const b = a.querySelector('strong'), l = a.querySelector('a'); if (b) b.textContent = v.announcement?.text ?? ''; if (l) l.textContent = v.announcement?.linkText ?? ''; } }
    d.querySelectorAll('.brand img, .footer img').forEach((i: any) => v.logo && i.setAttribute('src', v.logo));
    const fp = d.querySelector('.footer p'); if (fp) fp.innerHTML = `${esc(v.tagline)}<br>© ${new Date().getFullYear()} ${esc(v.footerText)}`;
    doc = '<!doctype html>' + d.documentElement.outerHTML;
  }
  return doc;
}

const btn = (on: boolean): React.CSSProperties => ({ font: 'inherit', fontSize: 13, padding: '5px 12px', borderRadius: 999, border: '1px solid ' + (on ? '#ec4815' : '#d8d8e0'), background: on ? '#fff1ec' : '#fff', color: on ? '#b93a10' : '#333', cursor: 'pointer' });

function Panel({ kind, form }: { kind: string; form: any }) {
  const [html, setHtml] = React.useState('');
  const [mode, setMode] = React.useState<'phone' | 'desktop'>('phone');
  const [open, setOpen] = React.useState(true);
  const [w, setW] = React.useState(360);
  const wrap = React.useRef<HTMLDivElement>(null);
  const pop = React.useRef<Window | null>(null);
  const timer = React.useRef<any>();
  const ff = form?.finalForm ?? form;
  React.useEffect(() => {
    const run = () => {
      clearTimeout(timer.current);
      timer.current = setTimeout(async () => {
        try {
          const doc = await build(kind, ff.getState().values);
          setHtml(doc);
          const p = pop.current;
          if (p && !p.closed) (p.document.getElementById('f') as HTMLIFrameElement | null)?.setAttribute('srcdoc', doc);
        } catch (e) { /* keep the last good preview */ }
      }, 300);
    };
    run();
    const off = ff.subscribe(run, { values: true });
    return () => { off(); clearTimeout(timer.current); };
  }, [ff, kind]);
  React.useEffect(() => {
    if (!wrap.current) return;
    const ro = new ResizeObserver(e => setW(Math.max(200, Math.floor(e[0].contentRect.width))));
    ro.observe(wrap.current);
    return () => ro.disconnect();
  }, [open]);
  const popOut = () => {
    const p = window.open('', 'site-preview', 'width=1280,height=900');
    if (!p) return;
    p.document.open();
    p.document.write('<!doctype html><title>Live preview</title><body style="margin:0;font:14px sans-serif"><div style="padding:8px 14px;background:#222;color:#fff">Live preview — updates as you type. Close this window when you are done.</div><iframe id="f" style="border:0;width:100%;height:calc(100vh - 36px)"></iframe></body>');
    p.document.close();
    pop.current = p;
    p.document.getElementById('f')?.setAttribute('srcdoc', html);
  };
  const base = mode === 'phone' ? 390 : 1200, k = Math.min(1, w / base), h = mode === 'phone' ? 760 : 820;
  return (
    <div style={{ margin: '0 0 22px', padding: 12, background: '#fff', border: '1px solid #e1e1ea', borderRadius: 10 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: open ? 10 : 0 }}>
        <strong style={{ fontSize: 14, marginRight: 4 }}>Live preview</strong>
        <button type="button" style={btn(mode === 'phone')} onClick={() => setMode('phone')}>Phone</button>
        <button type="button" style={btn(mode === 'desktop')} onClick={() => setMode('desktop')}>Desktop</button>
        <button type="button" style={btn(false)} onClick={popOut}>Open big ↗</button>
        <button type="button" style={btn(false)} onClick={() => setOpen(!open)}>{open ? 'Hide' : 'Show'}</button>
      </div>
      {open && (
        <div ref={wrap} style={{ width: '100%', height: h * k, overflow: 'hidden', borderRadius: 8, background: '#f2f2f6', position: 'relative' }}>
          <iframe title="Live preview" srcDoc={html} style={{ position: 'absolute', left: Math.max(0, (w - base * k) / 2), top: 0, width: base, height: h, border: 0, background: '#fff', transform: `scale(${k})`, transformOrigin: 'top left' }} />
        </div>
      )}
    </div>
  );
}
export const previewField = (kind: string) => ({ type: 'string', name: 'livePreview', label: 'Live preview', ui: { component: (props: any) => <Panel kind={kind} form={props.tinaForm ?? props.form} /> } }) as any;
