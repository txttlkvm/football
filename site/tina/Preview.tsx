// Live preview + click-on-the-page editing. Click text in the preview to type in place; click a photo to swap it;
// click formatted text to jump to its box. Also keeps a recoverable copy of unsaved work.
import React from 'react';
import ReactDOM from 'react-dom';
import { useCMS } from 'tinacms';
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
const FOCUS: any = { top: '50% 0%', center: '50% 50%', bottom: '50% 100%', left: '0% 50%', right: '100% 50%', face: '50% 25%' };

const IFRAME_SCRIPT = `(function(){
var send=function(m){parent.postMessage(Object.assign({tinaPreview:1},m),'*')};
var st=document.createElement('style');st.textContent='[data-e]{cursor:pointer}[data-e]:hover{outline:2px dashed #ff66c4;outline-offset:3px}[data-t="text"]:focus{outline:2px solid #ff66c4;outline-offset:3px;cursor:text}';document.head.appendChild(st);
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a');if(a)e.preventDefault();var el=e.target.closest&&e.target.closest('[data-e]');if(!el)return;var t=el.getAttribute('data-t');if(t==='text')return;e.preventDefault();e.stopPropagation();send({type:t,path:el.getAttribute('data-e')})},true);
document.querySelectorAll('[data-t="text"]').forEach(function(el){
try{el.contentEditable='plaintext-only'}catch(x){el.contentEditable='true'}
el.addEventListener('focus',function(){send({type:'focus'})});
el.addEventListener('input',function(){send({type:'text',path:el.getAttribute('data-e'),value:el.innerText.replace(/\\n/g,' ')})});
el.addEventListener('blur',function(){send({type:'blur'})});
el.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();el.blur()}});
});})();`;

async function build(kind: string, v: any): Promise<string> {
  const c = await loadShell();
  const ctx: any = { posts: c.posts, edit: kind !== 'settings', formsKey: true };
  const cover = v.image ? `<img src="${esc(v.image)}" alt="" style="margin:0 auto 1.5em${v.imageFocus && FOCUS[v.imageFocus] ? ';object-position:' + FOCUS[v.imageFocus] : ''}" data-e="image" data-t="img">` : `<p class="empty-hint" data-e="image" data-t="img">Click to add a top photo</p>`;
  const article = (meta: string) => `<article class="article"><div class="narrow">${meta}<h1 data-e="title" data-t="text">${esc(v.title)}</h1>${cover}<div class="body" data-e="body" data-t="field">${richText(v.body, ctx)}</div></div></article>`;
  let content = '';
  if (kind === 'post') content = article(`<div class="meta">${fmt(v.date)}</div>`);
  else if (kind === 'page') { const blocks = blocksHtml(v.blocks, ctx); content = v.layout === 'blocks' ? blocks : article('') + blocks; }
  else content = c.main;
  let doc = `<!doctype html><html class="js"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base href="${location.origin}/" target="_blank">${c.head}<style>*,*::before,*::after{animation:none!important;transition:none!important}.reveal,.js .reveal{opacity:1!important;transform:none!important}.sticky-register{display:none!important}.site-header{position:static}</style></head><body>${c.announce}${c.header}<main>${content}</main>${c.footer}${ctx.edit ? `<script>${IFRAME_SCRIPT}</script>` : ''}</body></html>`;
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

const pill = (on: boolean): React.CSSProperties => ({ font: 'inherit', fontSize: 13, padding: '5px 12px', borderRadius: 999, border: '1px solid ' + (on ? '#ec4815' : '#d8d8e0'), background: on ? '#fff1ec' : '#fff', color: on ? '#b93a10' : '#333', cursor: 'pointer' });

function Panel({ kind, tinaForm }: { kind: string; tinaForm: any }) {
  const cms: any = useCMS();
  const ff = tinaForm?.finalForm ?? tinaForm;
  const formId = tinaForm?.id ?? 'form';
  const draftKey = 'tina-draft:' + formId;
  const [html, setHtml] = React.useState('');
  const [mode, setMode] = React.useState<'phone' | 'desktop'>(window.innerWidth >= 1000 ? 'desktop' : 'phone');
  const [open, setOpen] = React.useState(true);
  const [w, setW] = React.useState(300);
  const [restore, setRestore] = React.useState<any>(() => { try { const r = JSON.parse(localStorage.getItem(draftKey) || 'null'); return r && JSON.stringify(r.values) !== JSON.stringify(ff.getState().initialValues) ? r : null; } catch { return null; } });
  const wrap = React.useRef<HTMLDivElement>(null);
  const frame = React.useRef<HTMLIFrameElement>(null);
  const pop = React.useRef<Window | null>(null);
  const timer = React.useRef<any>();
  const typing = React.useRef(false);
  const scroll = React.useRef(0);
  const latest = React.useRef('');
  const [auto, setAuto] = React.useState<string>('');
  const idle = React.useRef<any>();

  const push = React.useCallback((doc: string) => {
    latest.current = doc;
    scroll.current = frame.current?.contentWindow?.scrollY ?? 0;
    setHtml(doc);
    const p = pop.current;
    if (p && !p.closed) (p.document.getElementById('f') as HTMLIFrameElement | null)?.setAttribute('srcdoc', doc);
  }, []);
  const schedule = React.useCallback(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      if (typing.current) return;
      try { push(await build(kind, ff.getState().values)); } catch (e) { /* keep the last good preview */ }
    }, 300);
  }, [ff, kind, push]);

  React.useEffect(() => {
    schedule();
    const off = ff.subscribe((s: any) => {
      schedule();
      clearTimeout(idle.current);
      if (s.dirty && !s.submitting) idle.current = setTimeout(async () => { try { setAuto('Saving…'); await ff.submit(); setAuto('Auto-saved ✓ ' + new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })); } catch (e) { setAuto('Could not auto-save — press Save'); } }, 30000);
      try { if (s.submitSucceeded && !s.dirty) localStorage.removeItem(draftKey); else if (s.dirty) localStorage.setItem(draftKey, JSON.stringify({ t: Date.now(), values: s.values })); } catch (e) { /* storage unavailable */ }
    }, { values: true, dirty: true, submitSucceeded: true, submitting: true });
    const guard = (e: BeforeUnloadEvent) => { if (ff.getState().dirty) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', guard);
    return () => { off(); clearTimeout(timer.current); clearTimeout(idle.current); window.removeEventListener('beforeunload', guard); };
  }, [ff, schedule, draftKey]);

  React.useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const m: any = e.data;
      if (!m || !m.tinaPreview) return;
      const ok = e.source === frame.current?.contentWindow || (pop.current && e.source === pop.current);
      if (!ok) return;
      if (m.type === 'focus') typing.current = true;
      else if (m.type === 'blur') { typing.current = false; schedule(); }
      else if (m.type === 'text') { typing.current = true; ff.change(m.path, m.value); }
      else if (m.type === 'img') cms.media.open({ allowDelete: false, onSelect: (media: any) => ff.change(m.path, media.src) });
      else if (m.type === 'field') cms.dispatch({ type: 'forms:set-active-field-name', value: { formId: tinaForm.id, fieldName: m.path } });
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [cms, ff, tinaForm, schedule]);

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
    p.document.write('<!doctype html><title>Live preview</title><body style="margin:0;font:14px sans-serif"><div style="padding:8px 14px;background:#222;color:#fff">Live preview — click text to type, click a photo to swap it. Close this window when you are done.</div><iframe id="f" style="border:0;width:100%;height:calc(100vh - 36px)"></iframe><script>window.addEventListener("message",function(e){if(e.data&&e.data.tinaPreview&&window.opener)window.opener.postMessage(e.data,"*")})</script></body>');
    p.document.close();
    pop.current = p;
    p.document.getElementById('f')?.setAttribute('srcdoc', latest.current);
  };
  const doRestore = () => { const vals = restore.values; Object.keys(vals).forEach(k => ff.change(k, vals[k])); setRestore(null); };
  const discard = () => { try { localStorage.removeItem(draftKey); } catch (e) { /* ignore */ } setRestore(null); };

  const [vp, setVp] = React.useState({ w: window.innerWidth, h: window.innerHeight });
  const card = React.useRef<HTMLDivElement>(null);
  const [left, setLeft] = React.useState(660);
  const [tip, setTip] = React.useState(() => { try { return !localStorage.getItem('tina-tip-seen'); } catch { return true; } });
  React.useEffect(() => {
    const on = () => { setVp({ w: window.innerWidth, h: window.innerHeight }); const r = card.current?.getBoundingClientRect(); if (r) setLeft(Math.min(Math.round(r.right + 16), 560)); };
    on(); window.addEventListener('resize', on);
    const ro = new ResizeObserver(on); if (card.current) ro.observe(card.current);
    return () => { window.removeEventListener('resize', on); ro.disconnect(); };
  }, []);
  const big = vp.w >= 1000;
  React.useEffect(() => {
    if (!big || !open || !card.current) return;
    const done: [HTMLElement, string][] = [];
    for (let el = card.current.parentElement; el && el !== document.body; el = el.parentElement) {
      if (el.offsetWidth > vp.w * 0.8) { done.push([el, el.style.maxWidth]); el.style.maxWidth = '540px'; }
    }
    window.dispatchEvent(new Event('resize'));
    return () => done.forEach(([el, v]) => { el.style.maxWidth = v; });
  }, [big, open]);
  const cw = big ? vp.w - left - 16 : w, ch = big ? vp.h - 118 - 76 : 540;
  const base = big ? (mode === 'phone' ? 390 : 1100) : Math.max(280, cw), k = Math.min(1, cw / base), h = big ? ch / k : ch;
  const frameEl = (
    <div ref={wrap} style={{ width: '100%', height: ch, overflow: 'hidden', borderRadius: big ? 14 : 8, background: big ? '#ece9f0' : '#f2f2f6', position: 'relative' }}>
      <iframe ref={frame} title="Live preview" srcDoc={html} onLoad={() => { try { frame.current?.contentWindow?.scrollTo(0, scroll.current); } catch (e) { /* ignore */ } }} style={{ position: 'absolute', left: Math.max(0, (cw - base * k) / 2), top: 0, width: base, height: h, border: 0, background: '#fff', transform: `scale(${k})`, transformOrigin: 'top left', boxShadow: mode === 'phone' && big ? '0 8px 40px rgba(0,0,0,.18)' : 'none' }} />
    </div>
  );
  const dismiss = () => { setTip(false); try { localStorage.setItem('tina-tip-seen', '1'); } catch (e) { /* ignore */ } };
  return (
    <div style={{ margin: '0 0 22px' }}>
      {restore && (
        <div style={{ margin: '0 0 12px', padding: '10px 12px', background: '#fff8e6', border: '1px solid #f0d98a', borderRadius: 8, fontSize: 14 }}>
          <strong>You have unsaved changes from earlier</strong> ({new Date(restore.t).toLocaleString()}).
          <div style={{ marginTop: 8, display: 'flex', gap: 8 }}><button type="button" style={pill(true)} onClick={doRestore}>Bring them back</button><button type="button" style={pill(false)} onClick={discard}>Throw them away</button></div>
        </div>
      )}
      <div ref={card} style={{ boxSizing: 'border-box', width: '100%', padding: 12, background: '#fff', border: '1px solid #e1e1ea', borderRadius: 10 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', border: '1px solid #e1e1ea', borderRadius: 999, overflow: 'hidden' }}>
            <button type="button" style={{ ...pill(mode === 'phone'), border: 0, borderRadius: 0 }} onClick={() => setMode('phone')}>📱 Phone</button>
            <button type="button" style={{ ...pill(mode === 'desktop'), border: 0, borderRadius: 0 }} onClick={() => setMode('desktop')}>🖥 Computer</button>
          </span>
          <button type="button" style={pill(false)} onClick={popOut}>Full screen ↗</button>
          <button type="button" style={pill(false)} onClick={() => setOpen(!open)}>{open ? 'Hide preview' : 'Show preview'}</button>
        </div>
        <div style={{ marginTop: 10, fontSize: 13, fontWeight: 600, color: auto.startsWith('Could') ? '#b3261e' : '#1b7a3d' }}>{auto || '● Saves automatically as you work'}</div>
        {tip && kind !== 'settings' && (
          <div style={{ marginTop: 10, padding: '10px 12px', background: '#fff1fa', border: '1px solid #ffc2e6', borderRadius: 8, fontSize: 14, color: '#5a1d44' }}>
            <strong>New:</strong> click any words on the page to type there, or click a photo to swap it. <button type="button" onClick={dismiss} style={{ ...pill(false), marginLeft: 6, padding: '2px 10px' }}>Got it</button>
          </div>
        )}
        {open && !big && <div style={{ marginTop: 10 }}>{frameEl}</div>}
      </div>
      {open && big && ReactDOM.createPortal(<div style={{ position: 'fixed', left, right: 16, top: 118, bottom: 76, zIndex: 40 }}>{frameEl}</div>, document.body)}
    </div>
  );
}
export const previewField = (kind: string) => ({ type: 'string', name: 'livePreview', label: 'Live preview', ui: { component: (props: any) => <Panel kind={kind} tinaForm={props.tinaForm ?? props.form} /> } }) as any;
