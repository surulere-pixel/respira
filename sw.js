const CACHE = 'respira-v2';
const BASE = 'https://raw.githubusercontent.com/surulere-pixel/respira/main/';

// Core app shell
const SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// Pose images to pre-cache
const POSES = Array.from({length: 24}, (_, i) => {
  const names = [
    '01_seated_meditation','02_seated_breath','03_cat_flat','04_cow',
    '05_cat_cow_side','06_downdog','07_lunge','08_forward_fold',
    '09_standing_reach','10_warrior2','11_triangle','12_childs_pose',
    '13_tree','14_chair','15_plank','16_side_angle','17_upward_dog',
    '18_bridge','19_boat','20_pigeon_pose','21_easy_seat','22_camel',
    '23_half_moon','24_happy_baby'
  ];
  return BASE + names[i] + '.png';
});

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => {
      // Cache shell immediately
      cache.addAll(SHELL);
      // Cache poses in background (don't block install)
      cache.addAll(POSES).catch(() => {});
      return cache;
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Network first for HTML, cache first for assets
  const url = new URL(e.request.url);
  const isShell = url.pathname === '/' || url.pathname === '/index.html';

  if (isShell) {
    // Network first — always get latest app
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
  } else {
    // Cache first — images, audio, fonts
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return res;
        }).catch(() => cached);
      })
    );
  }
});
