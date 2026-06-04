/**
 * Vite PWA Configuration — Reference Deliverable
 * ------------------------------------------------
 * This file documents how the Menuiserie Digitale PWA would be configured
 * using `vite-plugin-pwa` (e.g. in a future Vite migration).
 *
 * The ACTIVE PWA configuration lives in:
 *   • next.config.js   → next-pwa wrapper (webpack / injectManifest)
 *   • src/sw.ts         → custom Service Worker with Workbox strategies
 *   • public/manifest.json → web app manifest
 */

interface RuntimeCacheEntry {
  urlPattern: RegExp;
  handler: 'CacheFirst' | 'StaleWhileRevalidate' | 'NetworkFirst' | 'NetworkOnly';
  options: {
    cacheName: string;
    expiration: { maxEntries: number; maxAgeSeconds: number };
    cacheableResponse?: { statuses: number[] };
  };
}

interface VitePWAConfig {
  registerType: 'autoUpdate' | 'prompt';
  devOptions: { enabled: boolean; type: string };
  manifest: Record<string, unknown>;
  workbox: {
    globPatterns: string[];
    runtimeCaching: RuntimeCacheEntry[];
  };
}

export const vitePwaConfig: VitePWAConfig = {
  registerType: 'autoUpdate',
  devOptions: {
    enabled: true,
    type: 'module'
  },
  manifest: {
    name: "Menuiserie Digitale",
    short_name: "Menuiserie",
    description: "Showcase digital pour menuisier d'exception à Marrakech. L'excellence du bois sur mesure.",
    start_url: "/",
    display: "standalone",
    background_color: "#fcf9f3", // Luxury minimalist off-white background
    theme_color: "#ffffff",      // Luxury minimalist clean white status bar
    orientation: "portrait",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable"
      }
    ]
  },
  workbox: {
    // Custom routing and runtime caching rules
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    runtimeCaching: [
      // 1. Image Caching Strategy: CacheFirst
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|jfif|ico)$/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'menuiserie-images-cache',
          expiration: {
            maxEntries: 120,
            maxAgeSeconds: 30 * 24 * 60 * 60 // Cache for 30 Days
          },
          cacheableResponse: {
            statuses: [0, 200]
          }
        }
      },
      // 2. API Data Caching Strategy: StaleWhileRevalidate
      {
        urlPattern: /^https?:\/\/.*\/api\/(?:AllProduits|SingleProduit|ProduitsVedettes|AllCategories).*/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'menuiserie-api-cache',
          expiration: {
            maxEntries: 60,
            maxAgeSeconds: 24 * 60 * 60 // Cache for 24 Hours
          },
          cacheableResponse: {
            statuses: [0, 200]
          }
        }
      }
    ]
  }
};
