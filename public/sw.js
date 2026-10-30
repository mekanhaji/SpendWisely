// The placeholders below are stamped in by vite.config.ts after each build, so
// this file's bytes change on every deploy and the browser actually installs
// the new worker instead of treating it as unchanged.
const CACHE_NAME = "spend-wisely-__BUILD_ID__";

// App shell: index.html, every fingerprinted asset, icons and the manifest.
// The quoted placeholder is replaced by an array at build time. In dev it stays
// a string, so precaching is skipped instead of throwing.
const PRECACHE_URLS = "__PRECACHE__";
const SHELL_URL = "/index.html";

self.addEventListener("install", (event) => {
  if (!Array.isArray(PRECACHE_URLS)) return;

  // Fail the install (and keep the old worker) if any shell file is missing,
  // rather than shipping a half-cached app that breaks offline.
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
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

// Page loads for client-side routes (/analytics, /add, share-target URLs).
// Only the shell exists on disk, so offline falls back to the cached
// index.html and the router takes over.
const navigationHandler = async (request) => {
  try {
    const response = await fetch(request);
    if (response.ok) return response;
  } catch {
    // Offline: fall through to the cached shell.
  }

  const shell = await caches.match(SHELL_URL, { ignoreSearch: true });
  return shell || Response.error();
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

  if (request.mode === "navigate") {
    event.respondWith(navigationHandler(request));
    return;
  }

  event.respondWith(
    isCacheFirst(new URL(request.url))
      ? caches.match(request).then((cached) => cached || networkFirst(request))
      : networkFirst(request),
  );
});
