declare let self: ServiceWorkerGlobalScope

const cacheName = "audio-trimmer-v1";
const assets = ["index.html", "DJ_YARI_EVERYTHING_IS_BUSINES_PT_2.mp3", "icon.svg", "assets/index.js", "assets/index.css"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(cacheName);
      cache.addAll(assets);
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()

      keys.forEach(async (key) => {
        if (key !== cacheName) {
          await caches.delete(key)
        }
      })
    })()
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.url.startsWith("chrome-extension")) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(cacheName);
      let response = await cache.match(event.request.url);
      if (response === undefined) {
        response = await fetch(event.request.url);
        cache.put(event.request.url, response.clone());
      }
      return response
    })()
  );
});
