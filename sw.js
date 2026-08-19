/* =========================================================================
   JALORI LINE — sw.js
   Cache-first service worker for full offline field use.
   ========================================================================= */

const CACHE_VERSION = 'jalori-line-v1';
const APP_SHELL_CACHE = `${CACHE_VERSION}-shell`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const TILE_CACHE = `${CACHE_VERSION}-tiles`;

const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-apple-touch.png',
  './icons/favicon-32.png',
];

const CDN_ASSETS = [
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&family=Cinzel:wght@500;700&family=Caveat:wght@500;700&display=swap',
];

/* ---- install: pre-cache the app shell + CDN assets (best effort) ---- */
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const shellCache = await caches.open(APP_SHELL_CACHE);
    await shellCache.addAll(APP_SHELL).catch((err) => console.warn('[sw] shell cache miss', err));

    const runtimeCache = await caches.open(RUNTIME_CACHE);
    await Promise.all(
      CDN_ASSETS.map((url) =>
        fetch(url, { mode: 'cors' })
          .then((res) => (res.ok ? runtimeCache.put(url, res) : null))
          .catch(() => null)
      )
    );
    self.skipWaiting();
  })());
});

/* ---- activate: clear old versioned caches ---- */
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((k) => k.startsWith('jalori-line-') && ![APP_SHELL_CACHE, RUNTIME_CACHE, TILE_CACHE].includes(k))
        .map((k) => caches.delete(k))
    );
    await self.clients.claim();
  })());
});

/* ---- helpers ---- */
function isMapTile(url) {
  return /tile\.openstreetmap\.org/.test(url) || /\{s\}\.tile/.test(url);
}
function isCdn(url) {
  return /unpkg\.com|fonts\.googleapis\.com|fonts\.gstatic\.com|cdn\.tailwindcss\.com/.test(url);
}

/* ---- fetch: cache-first everywhere, with runtime population ---- */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = request.url;

  // Map tiles: dedicated cache-first strategy, keeps growing as the user pans/zooms
  if (isMapTile(url)) {
    event.respondWith((async () => {
      const cache = await caches.open(TILE_CACHE);
      const cached = await cache.match(request);
      if (cached) return cached;
      try {
        const fresh = await fetch(request);
        if (fresh.ok) cache.put(request, fresh.clone());
        return fresh;
      } catch (err) {
        return cached || new Response('', { status: 504, statusText: 'Offline — tile not cached' });
      }
    })());
    return;
  }

  // CDN assets (Tailwind, Leaflet, fonts): cache-first, refresh in background
  if (isCdn(url)) {
    event.respondWith((async () => {
      const cache = await caches.open(RUNTIME_CACHE);
      const cached = await cache.match(request);
      const network = fetch(request).then((res) => {
        if (res.ok) cache.put(request, res.clone());
        return res;
      }).catch(() => null);
      return cached || (await network) || new Response('', { status: 504 });
    })());
    return;
  }

  // App shell + same-origin requests: cache-first, fallback to network, fallback to index.html for navigations
  event.respondWith((async () => {
    const shellCache = await caches.open(APP_SHELL_CACHE);
    const cached = await shellCache.match(request);
    if (cached) return cached;
    try {
      const fresh = await fetch(request);
      if (fresh.ok && new URL(url).origin === self.location.origin) {
        shellCache.put(request, fresh.clone());
      }
      return fresh;
    } catch (err) {
      if (request.mode === 'navigate') {
        const fallback = await shellCache.match('./index.html');
        if (fallback) return fallback;
      }
      return new Response('Offline and not cached.', { status: 504, statusText: 'Offline' });
    }
  })());
});
