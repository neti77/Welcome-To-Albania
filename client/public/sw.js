const CACHE_VERSION = "v1";
const IMAGE_CACHE = `images-${CACHE_VERSION}`;
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith("images-") && key !== IMAGE_CACHE)
          .map((key) => caches.delete(key)),
      ),
    ),
  );
  self.clients.claim();
});

const isImageRequest = (request) => {
  if (request.destination === "image") return true;
  const url = new URL(request.url);
  return IMAGE_EXTENSIONS.some((ext) => url.pathname.toLowerCase().endsWith(ext));
};

const cacheFirst = async (request) => {
  const cache = await caches.open(IMAGE_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response && (response.ok || response.type === "opaque")) {
    cache.put(request, response.clone());
  }
  return response;
};

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  if (!isImageRequest(request)) return;
  event.respondWith(cacheFirst(request));
});
