/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches, matchPrecache } from 'workbox-precaching';
import { registerRoute, setCatchHandler } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate, NetworkOnly } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { BackgroundSyncPlugin } from 'workbox-background-sync';

declare const self: ServiceWorkerGlobalScope;

// Precache list injected by Next.js building/Workbox
precacheAndRoute(self.__WB_MANIFEST || []);

cleanupOutdatedCaches();

// Force immediate activation
self.skipWaiting();

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// 1. Cache Images using CacheFirst Strategy
registerRoute(
  ({ request }) => request.destination === 'image' || /\.(?:png|jpg|jpeg|svg|gif|webp|jfif|ico)$/i.test(request.url),
  new CacheFirst({
    cacheName: 'menuiserie-images-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 120,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      }),
    ],
  })
);

// 2. Cache API Data using StaleWhileRevalidate Strategy (GET only)
registerRoute(
  ({ url, request }) => {
    return (
      url.pathname.includes('/api/') && 
      (request.method === 'GET' || request.method === 'HEAD')
    );
  },
  new StaleWhileRevalidate({
    cacheName: 'menuiserie-api-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 24 * 60 * 60, // 24 Hours
      }),
    ],
  })
);

// 3. Queue failed POST requests to addCommande using BackgroundSyncPlugin
const bgSyncPlugin = new BackgroundSyncPlugin('menuiserie-order-sync-queue', {
  maxRetentionTime: 24 * 60, // Keep in queue for up to 24 Hours
  onSync: async ({ queue }) => {
    try {
      await queue.replayRequests();
      
      // Notify active browser tabs of successful background sync
      const clientsList = await self.clients.matchAll();
      for (const client of clientsList) {
        client.postMessage({
          type: 'BACKGROUND_SYNC_COMPLETE',
          message: 'Commande synchronisée avec succès par Background Sync !'
        });
      }
    } catch (error) {
      console.error('Background Sync replay failed:', error);
      throw error; // keep in queue for next retry
    }
  }
});

registerRoute(
  ({ url, request }) => url.pathname.includes('/api/addCommande') && request.method === 'POST',
  new NetworkOnly({
    plugins: [bgSyncPlugin]
  })
);

// 4. Custom sync events (for fallbacks from useCartSync)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-orders') {
    event.waitUntil(
      (async () => {
        console.log('SW Background sync tag sync-orders triggered.');
        // We can communicate with main thread or trigger processing here
      })()
    );
  }
});

// 5. Offline Fallback Catch Handler for Document Navigations
setCatchHandler(async ({ request }) => {
  if (request.destination === 'document') {
    return (await matchPrecache('/offline')) || Response.error();
  }
  return Response.error();
});
