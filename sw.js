// PROTOTYPE - NOT FOR PRODUCTION
// Question: Kaydırarak falsolu şut atmak 10 level boyunca eğlenceli ve öğrenilebilir mi?
// Date: 2026-11-10
// Offline cache so the installed app opens with no connection. Bump VERSION after any change.
const VERSION = 'frikik-ustasi-v2';
const FILES = ['./', './index.html', './config.js', './manifest.webmanifest',
  './assets/icon.svg', './assets/icon-192.png', './assets/icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // network first, so a new version shows at once; the cache when offline
  e.respondWith(fetch(e.request).then(r => {
    const copy = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); return r;
  }).catch(() => caches.match(e.request).then(m => m || caches.match('./index.html'))));
});
