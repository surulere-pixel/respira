/* respira studio · service worker · scope /studio/ */
const CACHE = 'respira-studio-v1';
const SHELL = ['/studio/', '/studio/index.html', '/studio/manifest.json'];
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => Promise.allSettled(SHELL.map(u => c.add(u))))); });
self.addEventListener('activate', e => { e.waitUntil((async () => { const k = await caches.keys(); await Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x))); await self.clients.claim(); })()); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;      // audio + fonts pass through
  if (url.pathname.endsWith('.mp3')) return;
  if (req.mode === 'navigate') {
    e.respondWith((async () => { try { const f = await fetch(req); (await caches.open(CACHE)).put(req, f.clone()); return f; } catch { return (await caches.match(req)) || (await caches.match('/studio/index.html')) || new Response('offline', {status:503}); } })());
    return;
  }
  e.respondWith((async () => { const hit = await caches.match(req); const net = fetch(req).then(r => { if (r&&r.status===200&&r.type==='basic') caches.open(CACHE).then(c=>c.put(req,r.clone())); return r; }).catch(()=>hit); return hit || net; })());
});
