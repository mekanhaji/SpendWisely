const CACHE_NAME = "spend-wisely-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

const cacheIfUsable = (request, response) => {
  if (response.ok && response.type === "basic") {
    const copy = response.clone();
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.put(request, copy))
      .catch(() => {});
  }

  return response;
};

const fromCache = (request) =>
  caches.match(request).then((cached) => cached || Response.error());

const networkFirst = async (request) => {
  try {
    const response = await fetch(request);

    if (response.ok) {
      return cacheIfUsable(request, response);
    }

    // The network answered with an error, so a cached copy is better.
    const cached = await caches.match(request);
    return cached || response;
  } catch {
    return fromCache(request);
  }
};

// Vite fingerprints everything under /assets/, so those are safe to serve
// straight from the cache. Everything else stays network-first so a fresh
// deploy shows up right away.
const isCacheFirst = (url) => url.pathname.includes("/assets/");

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (
    request.method !== "GET" ||
    new URL(request.url).origin !== self.location.origin
  ) {
    return;
  }

  event.respondWith(
    isCacheFirst(new URL(request.url))
      ? caches.match(request).then((cached) => cached || networkFirst(request))
      : networkFirst(request),
  );
});
