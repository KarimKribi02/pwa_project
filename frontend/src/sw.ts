/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches, matchPrecache } from 'workbox-precaching';
import { registerRoute, setCatchHandler } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate, NetworkOnly } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { BackgroundSyncPlugin } from 'workbox-background-sync';

declare const self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST || []);
cleanupOutdatedCaches();

self.skipWaiting();

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

registerRoute(
  ({ request }) =>
    request.destination === 'image' ||
    /\.(?:png|jpg|jpeg|svg|gif|webp|jfif|ico)$/i.test(request.url),
  new CacheFirst({
    cacheName: 'menuiserie-images-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 120,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  }),
);

registerRoute(
  ({ url, request }) =>
    url.pathname.includes('/api/') && (request.method === 'GET' || request.method === 'HEAD'),
  new StaleWhileRevalidate({
    cacheName: 'menuiserie-api-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 24 * 60 * 60,
      }),
    ],
  }),
);

const bgSyncPlugin = new BackgroundSyncPlugin('menuiserie-order-sync-queue', {
  maxRetentionTime: 24 * 60,
  onSync: async () => {
    const clientsList = await self.clients.matchAll({ type: 'window' });
    for (const client of clientsList) {
      client.postMessage({ type: 'TRIGGER_ORDER_SYNC' });
    }
  },
});

registerRoute(
  ({ url, request }) =>
    url.pathname.includes('/api/addCommande') && request.method === 'POST',
  new NetworkOnly({ plugins: [bgSyncPlugin] }),
);

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-orders') {
    event.waitUntil(
      (async () => {
        const clientsList = await self.clients.matchAll({ type: 'window' });
        if (clientsList.length > 0) {
          for (const client of clientsList) {
            client.postMessage({ type: 'TRIGGER_ORDER_SYNC' });
          }
        } else {
          console.log('sync-orders: no clients open, Dexie queue will sync on next visit');
        }
      })(),
    );
  }

  if (event.tag === 'catalog-refresh') {
    event.waitUntil(
      (async () => {
        const clientsList = await self.clients.matchAll({ type: 'window' });
        for (const client of clientsList) {
          client.postMessage({ type: 'TRIGGER_CATALOG_SYNC' });
        }
      })(),
    );
  }
});

self.addEventListener('periodicsync', (event) => {
  const periodicEvent = event as SyncEvent & { tag: string };
  if (periodicEvent.tag === 'catalog-refresh') {
    periodicEvent.waitUntil(
      (async () => {
        const clientsList = await self.clients.matchAll({ type: 'window' });
        for (const client of clientsList) {
          client.postMessage({ type: 'TRIGGER_CATALOG_SYNC' });
        }
      })(),
    );
  }
});

setCatchHandler(async ({ request }) => {
  if (request.destination === 'document') {
    return (await matchPrecache('/offline')) || Response.error();
  }
  return Response.error();
});
