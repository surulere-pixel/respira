/* ══════════════════════════════════════════════════════════
   respira · service worker
   v4 — bump CACHE on every deploy that changes html or assets

   pages (html)  → network first, cache as fallback  (never stale)
   assets        → cache first, refreshed in background
   ══════════════════════════════════════════════════════════ */

const CACHE = 'respira-v9';

const PRECACHE = [
  '/',
  '/index.html',
  '/poster',
  '/poster.html',
  '/manifest.json'
];

/* install: take over immediately */
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then(c => Promise.allSettled(PRECACHE.map(u => c.add(u))))
  );
});

/* activate: drop every older cache, claim open tabs */
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

/* an escape hatch: page can post {type:'RESET'} to wipe everything */
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'RESET') {
    event.waitUntil((async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach(c => c.navigate(c.url));
    })());
  }
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;   // let fonts, github, formspree pass through

  const isPage = req.mode === 'navigate' ||
                 (req.headers.get('accept') || '').includes('text/html');

  if (isPage) {
    // network first — a deploy is visible on the next load
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(CACHE);
        cache.put(req, fresh.clone());
        return fresh;
      } catch (e) {
        const hit = await caches.match(req);
        return hit || await caches.match('/index.html') ||
               new Response('offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
      }
    })());
    return;
  }

  // assets: cache first, quietly refresh behind the scenes
  event.respondWith((async () => {
    const hit = await caches.match(req);
    const network = fetch(req).then(res => {
      if (res && res.status === 200 && res.type === 'basic') {
        caches.open(CACHE).then(c => c.put(req, res.clone()));
      }
      return res;
    }).catch(() => hit);
    return hit || network;
  })());
});
