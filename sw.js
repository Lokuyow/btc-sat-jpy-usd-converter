const CACHE_NAME = 'sats-rate-caches-v1.36.2';
const urlsToCache = [
    './index.html',
    './styles.css',
    './main.js',
    './manifest.json',
    './favicons/favicon.ico',
    './images/icon_x192.png',
    './images/icon_x512.png',
    './images/maskable_icon_x192.png',
    './images/maskable_icon_x512.png',
    './images/title.svg',
    './images/copy-regular.svg',
    './images/paste-regular.svg',
    './images/白抜きのビットコインアイコン.svg',
    './images/白抜きの円アイコン.svg',
    './images/白抜きのドルアイコン.svg',
    './images/白抜きのユーロアイコン.svg',
    './images/square-x-twitter.svg',
    './images/nostr-icon-purple-on-white.svg',
    './images/cloud-solid.svg',
    './images/share-nodes-solid.svg',
    './images/clipboard-solid.svg',
    './images/fulgur-favicon.ico',
    './images/alby_icon_head_yellow_48x48.svg',
    './images/btcmap-logo.svg',
    './images/robosats-favicon.ico',
    './images/mempool-favicon.ico',
    './images/bolt-solid.svg',
    './images/list-ol-solid.svg',
    './images/magnifying-glass-solid.svg',
    './images/sun-regular.svg',
    './images/moon-regular.svg',
    './images/angle-down-solid.svg'
];

const MY_CACHES = new Set([CACHE_NAME]);
self.addEventListener('install', (ev) => void ev.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(urlsToCache);

    const keys = await caches.keys();
    await Promise.all(
        keys
        .filter(key => !MY_CACHES.has(key))
        .map(key => caches.delete(key))
    );
    return self.skipWaiting();
})()));

self.addEventListener('fetch', (ev) => void ev.respondWith((async () => {
    const cacheResponse = await caches.match(ev.request);
    return cacheResponse || fetch(ev.request);
})()));

self.addEventListener('activate', (ev) => void ev.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
        keys
        .filter(key => !MY_CACHES.has(key))
        .map(key => caches.delete(key))
    );
    return clients.claim();
})()));

self.addEventListener('message', (event) => {
    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    }
});