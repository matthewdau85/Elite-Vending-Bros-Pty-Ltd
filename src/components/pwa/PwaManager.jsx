import { useState, useEffect } from 'react';
import { useFeatureGate } from '../features/useFeatureGate';
import { logger } from '../lib/logger';

// This service worker provides a basic "app shell" cache.
// It prioritizes network requests first (stale-while-revalidate), falling back to cache.
const serviceWorkerCode = `
const CACHE_NAME = 'elite-vending-cache-v2';
const urlsToCache = ['/', '/dashboard', '/machines', '/routes', '/alerts'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('PWA Service Worker: Caching app shell');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('PWA Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Ignore non-GET requests and chrome extensions
  if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  // Network-first strategy
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // If the request is successful, update the cache
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
        }
        return networkResponse;
      })
      .catch(() => {
        // If network fails, try to serve from cache
        return caches.match(event.request)
          .then(cachedResponse => {
            return cachedResponse || new Response('Offline content not available', {
              status: 404,
              statusText: 'Offline content not available'
            });
          });
      })
  );
});
`;

export default function PwaManager({ setInstallPromptEvent }) {
  const { checkFlag, isInitialized } = useFeatureGate();
  const pwaEnabled = checkFlag('pwa.offline');

  useEffect(() => {
    if (!isInitialized || !pwaEnabled) {
      // If flag is disabled, try to unregister existing service workers
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          for(let registration of registrations) {
            registration.unregister();
            logger.info('PWA disabled: Service worker unregistered.');
          }
        });
      }
      return;
    }

    // 1. Inject Manifest
    const manifest = {
      short_name: "EliteVending",
      name: "Elite Vending Bros",
      icons: [
        {
          src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68a9859032719af23976947e/17a78377c_android-chrome-192x192.png",
          type: "image/png",
          sizes: "192x192"
        },
        {
          src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68a9859032719af23976947e/f04c000ab_android-chrome-512x512.png",
          type: "image/png",
          sizes: "512x512"
        }
      ],
      start_url: "/",
      display: "standalone",
      theme_color: "#1e40af",
      background_color: "#f8fafc"
    };

    const manifestBlob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
    const manifestUrl = URL.createObjectURL(manifestBlob);
    
    let linkEl = document.querySelector('link[rel="manifest"]');
    if (!linkEl) {
      linkEl = document.createElement('link');
      linkEl.rel = 'manifest';
      document.head.appendChild(linkEl);
    }
    linkEl.href = manifestUrl;

    // 2. Register Service Worker
    if ('serviceWorker' in navigator) {
      const swBlob = new Blob([serviceWorkerCode], { type: 'application/javascript' });
      const swUrl = URL.createObjectURL(swBlob);

      navigator.serviceWorker.register(swUrl)
        .then(registration => {
          logger.info('PWA enabled: Service Worker registered.', { scope: registration.scope });
        }).catch(error => {
          logger.error('Service Worker registration failed', error);
        });
    }
    
    // 3. Handle Install Prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPromptEvent(e);
      logger.info('PWA install prompt captured.');
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      // Clean up listeners, but don't remove manifest or unregister SW on component unmount
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [pwaEnabled, isInitialized, setInstallPromptEvent]);

  return null;
}