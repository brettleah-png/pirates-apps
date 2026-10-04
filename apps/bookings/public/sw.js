// Service worker: shows an offline page when the server can't be reached.
//
// It deliberately caches nothing else. Bookings hold personal details and change
// often, so every page comes from the server and none of it is stored on phones.

// Change the version when the offline page changes, so phones fetch the new one
const CACHE_NAME = "offline-v1";
const OFFLINE_URL = "/offline/";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.add(OFFLINE_URL))
  );
  // Start using this version straight away instead of after every tab closes
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Delete caches left by older versions of this file
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        )
      )
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only page loads. Form submissions (POST) and everything else go to the
  // network untouched.
  if (request.mode !== "navigate" || request.method !== "GET") {
    return;
  }

  event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
});
