// Service Worker pour Jux Cloud PWA
const CACHE_NAME = 'jux-cloud-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/App.css',
  '/src/index.css',
  '/src/lib/pocketbase.ts',
  '/src/hooks/use-mobile.tsx',
  '/src/components/HomePage.tsx',
  '/src/components/Dashboard.tsx',
  '/src/components/MainMenu.tsx',
  '/src/components/MediaGallery.tsx',
  '/src/components/RichTextEditor.tsx',
  '/src/components/ImagePickerDialog.tsx',
  '/src/components/AuthEntry.tsx',
  '/src/pages/Index.tsx',
  '/src/pages/Cloud.tsx',
  '/src/pages/Favorites.tsx',
  '/src/pages/Editor.tsx',
  '/src/pages/MediaPicker.tsx',
  '/src/pages/NotFound.tsx',
  '/public/favicon.ico',
  '/public/placeholder.svg',
  '/public/robots.txt'
];

// Installation du service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Stratégie de cache-first avec fallback réseau
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retourne la ressource du cache ou la demande réseau
        if (response) {
          return response;
        }
        return fetch(event.request).then(
          (networkResponse) => {
            // Si la requête réussit, la mettre en cache
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseClone);
              });
            }
            return networkResponse;
          }
        ).catch(() => {
          // Fallback pour les pages HTML
          if (event.request.destination === 'document') {
            return caches.match('/');
          }
        });
      })
  );
});

// Activation du service worker - nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});