// Minimal service worker: makes the site and editor installable; pages load from network, falling back to cache offline.
const C = 'mmm-v3';
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== C).map(x => caches.delete(x)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || r.mode !== 'navigate' || !r.url.startsWith(self.location.origin) || r.url.includes('/admin/')) return;
  e.respondWith(Promise.race([fetch(r), new Promise((_, no) => setTimeout(no, 6000))]).then(res => { if (res.ok) { const c = res.clone(); caches.open(C).then(x => x.put(r, c)); } return res; }).catch(() => caches.match(r).then(m => m || new Response('<!doctype html><meta name=viewport content="width=device-width"><body style="font:18px system-ui;padding:2em;text-align:center"><h1>You are offline</h1><p>Reconnect and try again.</p>', { headers: { 'Content-Type': 'text/html' } }))));
});
