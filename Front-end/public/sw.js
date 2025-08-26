const VERSION = 'v2';
const RUNTIME_CACHE = `runtime-${VERSION}`;
const PRECACHE = `precache-${VERSION}`;
const PRECACHE_URLS = [
  '/',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(PRECACHE).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => ![PRECACHE, RUNTIME_CACHE].includes(k)).map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

// Navegação: fallback offline simples
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Apenas GET
  if (request.method !== 'GET') return;

  // Ignora esquemas não suportados (ex.: chrome-extension)
  try {
    const url = new URL(request.url);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
  } catch {
    return;
  }

  // Navegação (document)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(PRECACHE);
        const cached = await cache.match('/');
        return (
          cached ||
          new Response('<html><body><h1>Offline</h1><p>Você está offline. Tente novamente mais tarde.</p></body></html>', {
            headers: { 'Content-Type': 'text/html' },
          })
        );
      })
    );
    return;
  }

  const dest = request.destination;
  const shouldCache = ['script', 'style', 'image', 'font'].includes(dest);
  if (!shouldCache) return;

  // Stale-While-Revalidate para assets
  event.respondWith(
    (async () => {
      const cache = await caches.open(RUNTIME_CACHE);
      const cached = await cache.match(request);
      const networkFetch = fetch(request)
        .then((response) => {
          // Somente cacheia respostas válidas
          if (response && response.status === 200 && response.type === 'basic') {
            cache.put(request, response.clone());
          }
          return response;
        })
        .catch(() => undefined);

      return cached || networkFetch || fetch(request);
    })()
  );
});
