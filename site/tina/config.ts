import { defineConfig } from 'tinacms';
import { blocksField } from './blocks';
import { previewField } from './Preview';
import { PAGE_TEMPLATES, POST_TEMPLATES, LOOKS } from './templates';
const branch = process.env.TINA_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || process.env.HEAD || 'main';
const cats = ['motherhood', 'marriage', 'meals', 'breakfast', 'lunch', 'dinner', 'bake-class'].map(v => ({ value: v, label: v[0].toUpperCase() + v.slice(1).replace('-', ' ') }));
const RESERVED = ['tag', 'blog', 'edit', 'about-me', 'home-chefs', 'home-bakery', 'home', 'category', 'rss', 'admin', 'posts', 'sitemap', '404', 'index'];
const slugify = (v: any) => {
  let t = (v?.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60).replace(/-$/, '');
  if (!t) t = 'post-' + new Date().toISOString().slice(0, 10);
  return RESERVED.includes(t) ? t + '-post' : t;
};
const embeds = [
  {
    name: 'video', label: 'Video', match: { start: '{{<', end: '>}}' },
    ui: { defaultItem: { url: '', caption: '' } },
    fields: [
      { type: 'string', name: 'url', label: 'Paste a YouTube or Vimeo link', description: 'Easiest for long videos. Or leave this empty and choose a video file below.' },
      { type: 'image', name: 'file', label: 'Or upload a short video file (MP4, under about 50 MB)' },
      { type: 'string', name: 'caption', label: 'Caption (optional)' },
    ],
  },
  {
    name: 'photo', label: 'Photo with caption', match: { start: '{{<', end: '>}}' },
    fields: [
      { type: 'image', name: 'src', label: 'Photo' },
      { type: 'string', name: 'alt', label: 'Describe the photo (helps blind readers and Google)' },
      { type: 'string', name: 'caption', label: 'Caption (optional)' },
      { type: 'string', name: 'size', label: 'Size', options: [{ value: 'small', label: 'Small' }, { value: 'medium', label: 'Medium' }, { value: 'large', label: 'Large' }, { value: 'full', label: 'Full width' }] },
      { type: 'string', name: 'align', label: 'Position', options: [{ value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' }] },
    ],
  },
  {
    name: 'photoRow', label: 'Photos side by side (2–3)', match: { start: '{{<', end: '>}}' },
    fields: [
      { type: 'image', name: 'photo1', label: 'Photo 1' }, { type: 'string', name: 'alt1', label: 'Describe photo 1' },
      { type: 'image', name: 'photo2', label: 'Photo 2' }, { type: 'string', name: 'alt2', label: 'Describe photo 2' },
      { type: 'image', name: 'photo3', label: 'Photo 3 (optional)' }, { type: 'string', name: 'alt3', label: 'Describe photo 3' },
    ],
  },
  {
    name: 'button', label: 'Button', match: { start: '{{<', end: '>}}' },
    fields: [
      { type: 'string', name: 'label', label: 'Button text' }, { type: 'string', name: 'url', label: 'Where it goes (link)' },
      { type: 'string', name: 'align', label: 'Position', options: [{ value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' }] },
    ],
  },
] as any[];
const router = ({ document }: any) => `/${document._sys.filename}/`;
const color = { component: 'color', colorFormat: 'hex' } as any;
const link = [
  { type: 'string', name: 'label', label: 'Menu text', required: true },
  { type: 'string', name: 'href', label: 'Link (e.g. /about-me/ or https://…)', required: true },
] as any[];

const SKIN = `[class*="drag"] svg,[class*="pencil"] svg,[class*="Pencil"] svg{color:#6b6660!important}button[aria-label*="elete"] svg,[class*="trash"] svg{color:#b3261e!important;opacity:1!important}
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
body,button,input,textarea,select{font-family:'Poppins',system-ui,sans-serif!important}
:root{--tina-color-primary:#b0246f}
[class*="bg-orange"],[class*="from-orange"],[class*="to-orange"]{background:#b0246f!important;background-image:none!important;border-color:#b0246f!important;color:#fff!important}
[class*="text-orange"]{color:#8a1b5a!important}[class*="border-orange"]{border-color:#ff66c4!important}
[class*="orange"] svg{color:inherit}
input:focus,textarea:focus,select:focus,button:focus-visible,a:focus-visible{outline:2px solid #8a1b5a!important;outline-offset:2px}`;
const cmsCallback = (cms: any) => {
  try {
    const PAGES = ['about-me', 'home-chefs', 'home-bakery'];
    const HUB_CSS = `@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@500;600&display=swap');#hub{position:fixed;inset:0;z-index:99990;overflow:auto;background:radial-gradient(1200px 600px at 10% -10%,#ffe3f4 0,transparent 60%),radial-gradient(900px 500px at 100% 0,#fff0e6 0,transparent 55%),#fffaf7;font-family:Poppins,system-ui,sans-serif;color:#2a1a24;animation:hubIn .5s ease both}
#hub.out{opacity:0;transition:opacity .25s}
#hub .in{max-width:880px;margin:0 auto;padding:clamp(24px,6vw,64px) 20px 120px}
#hub img.logo{width:min(260px,70vw);display:block;margin:0 auto 28px}
#hub h1{font:600 clamp(1.8rem,5vw,2.8rem)/1.1 Outfit,Poppins,sans-serif;margin:0 0 6px;text-align:center;letter-spacing:-.02em}
#hub p.sub{margin:0 0 28px;text-align:center;font-size:1.05rem;color:#6b5560}
#hub .grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
#hub a.t{display:flex;align-items:center;gap:16px;padding:20px 22px;min-height:84px;border-radius:22px;background:#fff;color:inherit;text-decoration:none;box-shadow:0 1px 2px rgba(40,20,30,.05),0 10px 30px rgba(40,20,30,.08);transition:transform .3s cubic-bezier(.22,.8,.2,1),box-shadow .3s;animation:hubIn .6s both;cursor:pointer}
#hub a.t:hover,#hub a.t:focus-visible{transform:translateY(-4px) scale(1.01);box-shadow:0 2px 4px rgba(40,20,30,.06),0 18px 44px rgba(176,36,111,.2);outline:none}
#hub a.t b{display:block;font:600 1.15rem/1.2 Outfit,Poppins,sans-serif}#hub a.t small{display:block;margin-top:3px;color:#7a6570;font-size:.88rem;line-height:1.35}
#hub a.t .i{font-size:2rem;flex:none;width:52px;height:52px;border-radius:16px;display:grid;place-items:center;background:#fff0f8}
#hub a.big{grid-column:1/-1;background:linear-gradient(135deg,#d6409f,#a63d7d);color:#fff;min-height:104px}#hub a.big small{color:rgba(255,255,255,.85)}#hub a.big .i{background:rgba(255,255,255,.2)}
#hub .foot{margin-top:26px;display:flex;gap:10px;flex-wrap:wrap;justify-content:center}
#hub .foot button,#hub .foot a{font:500 .92rem Poppins,sans-serif;padding:12px 18px;border-radius:999px;border:1px solid #e8dcd6;background:#fff;color:#4a3640;cursor:pointer;text-decoration:none}
#hub .hint{margin-top:22px;text-align:center;font-size:.9rem;color:#8a7580}
#hubstart{position:fixed;left:14px;bottom:86px;z-index:99991;border:0;border-radius:999px;padding:12px 16px;background:#2a1a24;color:#fff;font:600 14px Poppins,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.3);cursor:pointer;animation:hubIn .5s both}
@keyframes hubIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@media(max-width:640px){#hub .grid{grid-template-columns:1fr}#hub a.t{min-height:78px}}
@media(prefers-reduced-motion:reduce){#hub,#hub a.t,#hubstart{animation:none}}`;
    const hubTiles = [
      ['big', '✍️', 'Write a new post', 'Start a fresh blog post — add a photo, type, publish.', '#/collections/new/post/~/'],
      ['', '🏠', 'My home page', 'Change the words and photos people see first.', '#/collections/edit/home/home'],
      ['', '👩‍🍳', 'Kids class info', 'Update the price, day and sign-up details.', '#/collections/edit/page/home-chefs'],
      ['', '📚', 'My posts', 'Find, fix or hide a post you wrote before.', '#/collections/post/~'],
      ['', '💁🏾‍♀️', 'About me', 'Your story and photo.', '#/collections/edit/page/about-me'],
      ['', '🧩', 'Start from a template', 'Pages and posts with the boring part done for you.', '#modal:templates'],
      ['', '🎨', 'Change my look', 'One tap to try a new color and font style.', '#modal:looks'],
      ['', '⚙️', 'Logo, menu & more', 'Logo, announcement bar, menu, comments.', '#/collections/edit/settings/settings'],
      ['', '👀', 'See my live website', 'Opens your real website in a new tab.', 'https://www.marriagemotherhood-meals.org/'],
    ];
    const greet = () => { const h = new Date().getHours(); return h < 5 ? 'Up late' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; };
    let inst: any = null; window.addEventListener('beforeinstallprompt', (e: any) => { e.preventDefault(); inst = e; const b = document.getElementById('hubinstall'); if (b) b.style.display = ''; });
    const closeHub = (go?: string) => { const h = document.getElementById('hub'); if (go) location.hash = go; if (h) { h.classList.add('out'); setTimeout(() => h.remove(), 260); } showStart(); };
    const showStart = () => { if (document.getElementById('hubstart')) return; const b = document.createElement('button'); b.id = 'hubstart'; b.type = 'button'; b.textContent = '🏠 Start'; b.setAttribute('aria-label', 'Back to the start screen'); b.onclick = openHub; document.body.appendChild(b); };

    const MODAL_CSS = `#mm{position:fixed;inset:0;z-index:99995;display:grid;place-items:center;padding:16px;background:rgba(30,10,22,.55);font-family:Poppins,system-ui,sans-serif;animation:hubIn .3s both}
#mm .box{width:min(760px,100%);max-height:calc(100dvh - 32px);overflow:auto;background:#fffaf7;border-radius:26px;padding:clamp(18px,4vw,32px);box-shadow:0 30px 80px rgba(0,0,0,.4);color:#2a1a24}
#mm h2{font:600 1.6rem/1.15 Outfit,Poppins,sans-serif;margin:0 0 4px}#mm .sub{margin:0 0 18px;color:#6b5560;font-size:.98rem}
#mm .cards{display:grid;grid-template-columns:1fr 1fr;gap:12px}
#mm button.c{all:unset;box-sizing:border-box;cursor:pointer;display:flex;gap:14px;align-items:flex-start;padding:16px;border-radius:18px;background:#fff;box-shadow:0 1px 2px rgba(40,20,30,.05),0 8px 22px rgba(40,20,30,.07);transition:transform .25s,box-shadow .25s}
#mm button.c:hover,#mm button.c:focus-visible{transform:translateY(-3px);box-shadow:0 14px 34px rgba(176,36,111,.2);outline:2px solid #b0246f}
#mm button.c .i{font-size:1.8rem;flex:none}#mm button.c b{display:block;font:600 1.02rem Outfit,Poppins,sans-serif}#mm button.c small{display:block;color:#7a6570;font-size:.84rem;line-height:1.35;margin-top:2px}
#mm .tag{display:inline-block;font-size:.7rem;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#a63d7d;margin-bottom:2px}
#mm .sw{display:flex;gap:5px;margin-bottom:8px}#mm .sw i{width:26px;height:26px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 0 1px #e8dcd6}
#mm .row{display:flex;gap:10px;margin-top:6px}#mm input{flex:1;font:500 1.05rem Poppins,sans-serif;padding:14px 16px;border-radius:14px;border:2px solid #e8dcd6;background:#fff}#mm input:focus{outline:none;border-color:#b0246f}
#mm .go{all:unset;cursor:pointer;padding:14px 22px;border-radius:999px;background:linear-gradient(135deg,#d6409f,#a63d7d);color:#fff;font:600 1rem Poppins,sans-serif}
#mm .x{all:unset;cursor:pointer;float:right;font-size:1.4rem;line-height:1;padding:6px 10px;border-radius:999px;color:#6b5560}#mm .msg{margin-top:12px;font-size:.95rem;color:#b3261e}
@media(max-width:640px){#mm .cards{grid-template-columns:1fr}}`;
    const mst = document.createElement('style'); mst.textContent = MODAL_CSS; document.head.appendChild(mst);
    const gql = async (query: string, variables: any = {}) => { const r = await (cms as any).api.tina.request(query, { variables }); return r; };
    const slugy = (t: string, reserved: string[]) => { let x = t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60).replace(/-$/, '') || 'new-page'; return reserved.includes(x) ? x + '-page' : x; };
    const closeModal = () => document.getElementById('mm')?.remove();
    const modal = (title: string, sub: string, inner: string) => { closeModal(); const m = document.createElement('div'); m.id = 'mm'; m.innerHTML = `<div class="box" role="dialog" aria-label="${title}"><button class="x" aria-label="Close">✕</button><h2>${title}</h2><p class="sub">${sub}</p>${inner}<div class="msg" id="mmsg" role="status"></div></div>`; m.addEventListener('click', (e: any) => { if (e.target === m || e.target.closest('.x')) closeModal(); }); document.body.appendChild(m); return m; };
    const RES = ['tag', 'blog', 'edit', 'about-me', 'home-chefs', 'home-bakery', 'home', 'category', 'rss', 'admin', 'posts', 'sitemap', '404', 'index'];
    const openTemplates = () => {
      const m = modal('Start from a template', 'Pick one — we fill in the layout, you change the words and photos.', `<div class="cards">${[...PAGE_TEMPLATES.map(x => ({ ...x, k: 'page' })), ...POST_TEMPLATES.map(x => ({ ...x, k: 'post' }))].map(x => `<button class="c" data-k="${x.k}" data-id="${x.id}"><span class="i">${x.icon}</span><span><span class="tag">${x.k === 'page' ? 'Page' : 'Blog post'}</span><b>${x.name}</b><small>${x.desc}</small></span></button>`).join('')}</div>`);
      m.addEventListener('click', (e: any) => { const c = e.target.closest('button.c'); if (!c) return; const k = c.dataset.k, id = c.dataset.id; const tpl: any = (k === 'page' ? PAGE_TEMPLATES : POST_TEMPLATES).find(y => y.id === id);
        const box = m.querySelector('.box') as HTMLElement; box.innerHTML = `<button class="x" aria-label="Close">✕</button><h2>${tpl.icon} ${tpl.name}</h2><p class="sub">What should it be called?</p><div class="row"><input id="mt" value="${tpl.title}" autofocus><button class="go" id="mgo">Create it</button></div><div class="msg" id="mmsg" role="status"></div>`;
        const input = box.querySelector('#mt') as HTMLInputElement; input.focus(); input.select();
        const go = async () => { const title = input.value.trim() || tpl.title; const msg = box.querySelector('#mmsg') as HTMLElement; msg.style.color = '#6b5560'; msg.textContent = 'Creating…';
          try { let slug = slugy(title, RES); for (let n = 0; n < 6; n++) { try {
            if (k === 'page') await gql('mutation($rp:String!,$p:PageMutation!){createDocument(collection:"page",relativePath:$rp,params:{page:$p}){__typename}}', { rp: `${slug}.md`, p: { title, layout: 'blocks', blocks: tpl.blocks } });
            else await gql('mutation($rp:String!,$p:PostMutation!){createDocument(collection:"post",relativePath:$rp,params:{post:$p}){__typename}}', { rp: `${slug}.md`, p: { title, date: new Date().toISOString(), draft: true, categories: tpl.categories, body: tpl.body } });
            closeModal(); closeHub(`#/collections/edit/${k}/${slug}`); return; } catch (err: any) { if (/exist|already/i.test(String(err?.message || err))) { slug = slugy(title, RES) + '-' + (n + 2); continue; } throw err; } } msg.textContent = 'Could not find a free name — try a different title.';
          } catch (err: any) { msg.style.color = '#b3261e'; msg.textContent = 'Sorry, that did not work (' + String(err?.message || err).slice(0, 120) + ')'; } };
        box.querySelector('#mgo')!.addEventListener('click', go); input.addEventListener('keydown', (ev: any) => { if (ev.key === 'Enter') go(); });
      });
    };
    const openLooks = () => {
      const m = modal('Change my look', 'Tap a style to apply it to your whole website. You can change it back any time.', `<div class="cards">${LOOKS.map(l => `<button class="c" data-id="${l.id}"><span><span class="sw"><i style="background:${l.accent}"></i><i style="background:${l.dark}"></i><i style="background:${l.soft}"></i></span><b>${l.name}</b><small>${l.headingFont} + ${l.bodyFont}</small></span></button>`).join('')}</div>`);
      m.addEventListener('click', async (e: any) => { const c = e.target.closest('button.c'); if (!c) return; const look: any = LOOKS.find(l => l.id === c.dataset.id); const msg = m.querySelector('#mmsg') as HTMLElement; msg.style.color = '#6b5560'; msg.textContent = 'Applying…';
        try { const r: any = await gql('{settings(relativePath:"settings.json"){_values}}'); const v: any = {}; Object.entries(r.settings._values).forEach(([k2, x]) => { if (!k2.startsWith('_')) v[k2] = x; });
          v.theme = { ...(v.theme || {}), accent: look.accent, dark: look.dark, text: look.text, soft: look.soft, headingFont: look.headingFont, bodyFont: look.bodyFont };
          await gql('mutation($p:SettingsMutation!){updateDocument(collection:"settings",relativePath:"settings.json",params:{settings:$p}){__typename}}', { p: v });
          msg.style.color = '#1b7a3d'; msg.textContent = `✓ ${look.name} is saved. Your website will show it in about a minute.`;
        } catch (err: any) { msg.style.color = '#b3261e'; msg.textContent = 'Sorry, that did not work (' + String(err?.message || err).slice(0, 120) + ')'; } });
    };
    const authed = async () => { try { const t = (cms as any).api?.tina; if (t && typeof t.isAuthenticated === 'function') return !!(await t.isAuthenticated()); } catch (e) { /* assume ok */ } return true; };
    const openHub = async () => {
      if (document.getElementById('hub')) return;
      if (!(await authed())) { setTimeout(land, 1500); return; }
      if (document.getElementById('hub')) return;
      document.getElementById('hubstart')?.remove();
      let first = true; try { first = !localStorage.getItem('mmm-hub-seen'); localStorage.setItem('mmm-hub-seen', '1'); } catch (e) { /* ignore */ }
      const h = document.createElement('div'); h.id = 'hub';
      h.innerHTML = `<div class="in"><img class="logo" src="/img/logo.png" alt="Marriage Motherhood Meals"><h1>${greet()}, Diamond ${new Date().getHours() < 18 ? '☀️' : '🌙'}</h1><p class="sub">${first ? 'Welcome! This is your little corner of the website. Tap anything to begin.' : 'What would you like to do today?'}</p><div class="grid">${hubTiles.map(([c, i, t, d, href], n) => `<a class="t ${c}" href="${href}" ${href.startsWith('http') ? 'target="_blank" rel="noopener"' : ''} style="animation-delay:${80 + n * 70}ms"><span class="i">${i}</span><span><b>${t}</b><small>${d}</small></span></a>`).join('')}</div><div class="foot"><button id="hubinstall" type="button" style="display:none">📱 Add the editor to my phone</button></div><p class="hint">Tip: on any page you can tap the words in the preview and just type.</p></div>`;
      h.addEventListener('click', (e: any) => { const a = e.target.closest('a.t'); if (a && !a.getAttribute('href').startsWith('http')) { e.preventDefault(); const hr = a.getAttribute('href'); if (hr === '#modal:templates') openTemplates(); else if (hr === '#modal:looks') openLooks(); else closeHub(hr); } });
      document.body.appendChild(h);
      const ib = h.querySelector('#hubinstall') as HTMLElement; if (inst) ib.style.display = ''; ib.onclick = () => inst && inst.prompt();
    };
    const land: () => void = () => {
      const h = location.hash;
      if (!h || h === '#/' || h === '#/collections' || h === '#/~' || h === '#/~/') { openHub(); return; }
      if (!h.startsWith('#/~')) { if (!document.getElementById('hub')) showStart(); return; }
      const slug = h.replace(/^#\/~\/?/, '').replace(/[?].*$/, '').replace(/\/+$/, '');
      location.hash = !slug || slug === 'home' ? '#/collections/edit/home/home' : PAGES.includes(slug) ? `#/collections/edit/page/${slug}` : `#/collections/edit/post/${slug}`;
    };
    const hs = document.createElement('style'); hs.textContent = HUB_CSS; document.head.appendChild(hs);
    land(); window.addEventListener('hashchange', land);
    const st = document.createElement('style'); st.textContent = SKIN; document.head.appendChild(st);
    const l = document.createElement('link'); l.rel = 'manifest'; l.href = '/admin-manifest.webmanifest'; document.head.appendChild(l);
    const m = document.createElement('meta'); m.name = 'theme-color'; m.content = '#ff66c4'; document.head.appendChild(m);
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js');
    const tidy = () => {
      document.querySelectorAll('td div, td span, td p, li p, li span').forEach((e: any) => { if (e.children.length === 0 && /^src\/content\//.test((e.textContent || '').trim())) e.style.display = 'none'; });
      document.querySelectorAll('label').forEach((l: any) => { if (/^Filename\b/.test((l.textContent || '').trim())) { const w = l.closest('div'); if (w && w.parentElement) w.parentElement.style.display = 'none'; } });
      document.querySelectorAll('[class*="border-amber"]').forEach((e: any) => { if (/local mode/.test(e.textContent || '') && e.textContent.length < 80) e.style.display = 'none'; });
      document.querySelectorAll('[class*="border-blue-"]').forEach((e: any) => { if (/configured search/.test(e.textContent || '')) e.style.display = 'none'; });
      document.querySelectorAll('table').forEach((t: any) => {
        const heads = [...t.querySelectorAll('thead th')];
        heads.forEach((th: any, i: number) => { if (/^(Filename|Extension|Template)$/.test(th.textContent.trim())) { th.style.display = 'none'; t.querySelectorAll('tbody tr').forEach((r: any) => { const c = r.children[i]; if (c) c.style.display = 'none'; }); } });
      });
      document.querySelectorAll('a,button').forEach((e: any) => { if (/^Add File$/.test(e.textContent.trim())) { const n = [...e.childNodes].find((c: any) => c.nodeType === 3 && /Add File/.test(c.textContent)); if (n) n.textContent = 'New post / page'; } });
    };
    new MutationObserver(tidy).observe(document.body, { childList: true, subtree: true });
    let ev: any; window.addEventListener('beforeinstallprompt', (e: any) => { e.preventDefault(); ev = e; const b = document.createElement('button'); b.textContent = '📱 Install this editor on your phone'; b.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:84px;z-index:99;padding:10px 18px;border-radius:999px;border:0;background:#b0246f;color:#fff;font:600 14px Poppins,sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.2);cursor:pointer'; b.onclick = () => { ev.prompt(); b.remove(); }; document.body.appendChild(b); });
  } catch (e) { /* cosmetic only */ }
  return cms;
};
export default defineConfig({
  cmsCallback,
  branch,
  clientId: '01789bf2-d73e-4861-a4f9-5960dbbd6392',
  token: process.env.TINA_TOKEN,
  build: { outputFolder: 'admin', publicFolder: 'public' },
  media: { tina: { mediaRoot: 'img', publicFolder: 'public' } },
  schema: {
    collections: [
      {
        name: 'post', label: 'Blog Posts', path: 'src/content/posts', format: 'md',
        ui: { filename: { slugify, readonly: true }, allowedActions: { createNestedFolder: false } },
        defaultItem: () => ({ date: new Date().toISOString(), categories: [], draft: true, featured: false }),
        fields: [
          { type: 'string', name: 'title', label: 'Title', isTitle: true, required: true },
          { type: 'boolean', name: 'draft', label: 'Keep this post hidden (draft)', description: 'New posts start hidden. Turn this OFF when you are ready for everyone to see it.' },
          { type: 'image', name: 'image', label: 'Cover photo' },
          { type: 'string', name: 'imageFocus', label: 'Which part of the cover photo to keep in view', options: [{ value: 'center', label: 'Center' }, { value: 'top', label: 'Top' }, { value: 'bottom', label: 'Bottom' }, { value: 'left', label: 'Left' }, { value: 'right', label: 'Right' }, { value: 'face', label: 'Upper middle (faces)' }] },
          { type: 'rich-text', name: 'body', label: 'Write your post', isBody: true, templates: embeds, toolbarOverride: ['heading', 'link', 'image', 'quote', 'ul', 'ol', 'bold', 'italic', 'hr', 'embed'] },
          { type: 'string', name: 'excerpt', label: 'Short summary (shown on cards)', ui: { component: 'textarea' } },
          { type: 'string', name: 'categories', label: 'Categories (tick any)', list: true, options: cats },
          { type: 'string', name: 'tags', label: 'Tags (type a word and press Enter)', description: 'Optional. Handy words like “sourdough” or “toddlers”. Readers can click a tag to see similar posts.', list: true },
          { type: 'datetime', name: 'date', label: 'Date shown on the post', required: true },
          { type: 'boolean', name: 'featured', label: 'Feature this post at the top of the home page' },
          { type: 'datetime', name: 'publishDate', label: 'Schedule: hide until this date (optional)', description: 'Leave empty to publish immediately. A scheduled post appears the next time the site updates after this date.' },
          { type: 'string', name: 'description', label: 'Search-engine description (optional)', ui: { component: 'textarea' } },
          previewField('post'),
        ],
      },
      {
        name: 'page', label: 'Pages', path: 'src/content/pages', format: 'md', match: { exclude: 'home' },
        defaultItem: () => ({ layout: 'blocks', blocks: [{ _template: 'hero', heading: 'Page title', text: 'A short welcome.', height: 'short', image: '/img/hero.jpg' }, { _template: 'text', heading: 'About this page', text: '<p>Write something here…</p>', align: 'left', width: 'narrow' }, { _template: 'cta', heading: 'Ready to join us?', buttonLabel: 'Sign up', buttonUrl: '/', style: 'pink' }] }),
        ui: { filename: { slugify }, allowedActions: { delete: false, createNestedFolder: false } },
        fields: [
          previewField('page'),
          { type: 'string', name: 'title', label: 'Page title', isTitle: true, required: true },
          { type: 'string', name: 'layout', label: 'Page style', options: [{ value: 'article', label: 'Article (title, photo and text, then sections below)' }, { value: 'blocks', label: 'Sections only (like the home page)' }] },
          { type: 'image', name: 'image', label: 'Top photo' },
          { type: 'rich-text', name: 'body', label: 'Page content', isBody: true, templates: embeds, toolbarOverride: ['heading', 'link', 'image', 'quote', 'ul', 'ol', 'bold', 'italic', 'hr', 'embed'] },
          { type: 'boolean', name: 'showRegisterCta', label: 'Show the "Register" box and button on this page' },
          { type: 'string', name: 'description', label: 'Search-engine description (optional)', ui: { component: 'textarea' } },
          { type: 'boolean', name: 'draft', label: 'Draft — keep hidden from the website' },
          blocksField,
        ],
      },
      {
        name: 'home', label: 'Home Page', path: 'src/content/pages', format: 'md', match: { include: 'home' },
        ui: { router: () => '/', allowedActions: { create: false, delete: false, createNestedFolder: false } },
        fields: [
          previewField('page'),
          blocksField,
          { type: 'string', name: 'title', label: 'Page name (leave as Home)', isTitle: true, required: true },
          { type: 'string', name: 'layout', label: 'Layout', ui: { component: 'hidden' } },
          { type: 'string', name: 'description', label: 'Search-engine description', ui: { component: 'textarea' } },
        ],
      },
      {
        name: 'settings', label: 'Site Settings', path: 'src/content', format: 'json',
        match: { include: 'settings' },
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          previewField('settings'),
          { type: 'string', name: 'siteTitle', label: 'Site name' },
          { type: 'image', name: 'logo', label: 'Logo' },
          { type: 'string', name: 'tagline', label: 'Tagline' },
          { type: 'object', name: 'announcement', label: 'Top announcement bar', fields: [
            { type: 'boolean', name: 'show', label: 'Show the bar' },
            { type: 'string', name: 'text', label: 'Headline' },
            { type: 'string', name: 'linkText', label: 'Button words' }, { type: 'string', name: 'linkUrl', label: 'Link goes to (leave empty for the Register page)' } ] },
          { type: 'object', name: 'classCard', label: 'Class sign-up box (shown on pages where you turn it on)', fields: [
            { type: 'string', name: 'label', label: 'Small label' },
            { type: 'string', name: 'text', label: 'Description', ui: { component: 'textarea' } },
            { type: 'string', name: 'buttonText', label: 'Button text' },
            { type: 'string', name: 'stickyText', label: 'Text on the bottom bar (phones)' } ] },
          { type: 'object', name: 'theme', label: 'Colors & fonts', fields: [
            { type: 'string', name: 'accent', label: 'Accent color (buttons, links)', description: 'Buttons use a slightly deeper shade of this colour so white text stays easy to read.', ui: color },
            { type: 'string', name: 'dark', label: 'Headline color', ui: color },
            { type: 'string', name: 'text', label: 'Body text color', ui: color },
            { type: 'string', name: 'soft', label: 'Soft background color', ui: color },
            { type: 'string', name: 'headingFont', label: 'Headline font', options: ['Outfit', 'Poppins', 'Montserrat', 'Playfair Display', 'Lora', 'DM Sans'] },
            { type: 'string', name: 'bodyFont', label: 'Body font', options: ['Heebo', 'Inter', 'Nunito', 'Open Sans', 'DM Sans', 'Lora'] } ] },
          { type: 'object', name: 'nav', label: 'Menu', list: true, ui: { itemProps: (i: any) => ({ label: i?.label }) }, fields: [
            ...link,
            { type: 'object', name: 'children', label: 'Drop-down items', list: true, ui: { itemProps: (i: any) => ({ label: i?.label }) }, fields: link } ] },
          { type: 'string', name: 'registerUrl', label: 'Class sign-up link' },
          { type: 'string', name: 'mobileCta', label: 'Phone menu: top button text' },
          { type: 'string', name: 'formsKey', label: 'Contact form key', description: 'Free at web3forms.com — enter your email there, they send you a key. Paste it here to turn on the Contact form section.' },
          { type: 'object', name: 'comments', label: 'Reader comments', description: 'Optional. Lets readers comment on posts using Disqus (free account at disqus.com — you will get a short “shortname”).', fields: [
            { type: 'string', name: 'provider', label: 'Comments', options: [{ value: 'none', label: 'Off' }, { value: 'disqus', label: 'On (Disqus)' }] },
            { type: 'string', name: 'disqusShortname', label: 'Your Disqus shortname' } ] },
          { type: 'string', name: 'footerText', label: 'Footer text' },
          { type: 'object', name: 'social', label: 'Social links (footer)', list: true, ui: { itemProps: (i: any) => ({ label: i?.label }) }, fields: [
            { type: 'string', name: 'label', label: 'Name (e.g. Instagram)' }, { type: 'string', name: 'url', label: 'Link' } ] },
        ],
      },
    ],
  },
});
