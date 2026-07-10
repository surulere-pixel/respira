/* respira radio · service worker
   shell cached, audio streamed. bump CACHE on every deploy. */
const CACHE = 'respira-radio-v1';
const SHELL = ['/radio/', '/radio/index.html', '/radio/tracks.js', '/radio/manifest.json'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => Promise.allSettled(SHELL.map(u => c.add(u)))));
});
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;          // audio + fonts pass through
  if (url.pathname.endsWith('.mp3')) return;

  const isPage = req.mode === 'navigate';
  if (isPage) {
    e.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        (await caches.open(CACHE)).put(req, fresh.clone());
        return fresh;
      } catch (err) {
        return (await caches.match(req)) || (await caches.match('/radio/index.html')) ||
               new Response('offline', { status: 503 });
      }
    })());
    return;
  }
  e.respondWith((async () => {
    const hit = await caches.match(req);
    const net = fetch(req).then(res => {
      if (res && res.status === 200 && res.type === 'basic') caches.open(CACHE).then(c => c.put(req, res.clone()));
      return res;
    }).catch(() => hit);
    return hit || net;
  })());
});
