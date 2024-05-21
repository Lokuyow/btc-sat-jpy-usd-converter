const urlsToCache = [
    './index.html',
    './currency-selection.html',
    './styles.css',
    './main.js',
    './lib/currencyManager.js',
    './lib/currencySelection.js',
    './lib/lightning-address.js',
    './lib/pos.js',
    './lib/currencies.json',
    './lib/nostr-zap@0.21.0.js',
    './lib/qr-code-styling@1.6.0-rc.1.js',
    './manifest.json',
    './fonts/RoundedMplus1c-Regular.woff2',
    './fonts/RoundedMplus1c-Medium.woff2',
    './fonts/RoundedMplus1c-Bold.woff2',
    './fonts/NotoColorEmoji-Regular.woff2',
    './favicons/favicon.ico',
    './images/icon_x192.png',
    './images/icon_x512.png',
    './images/maskable_icon_x192.png',
    './images/maskable_icon_x512.png',
    './images/square-x-twitter.svg',
    './images/nostr-icon-purple-on-white.svg',
    './images/cloud-solid.svg',
    './images/share-nodes-solid.svg',
    './images/clipboard-solid.svg',
    './images/bitcoin-zukan.png',
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
    './images/angle-down-solid.svg',
    './images/settings-solid.svg',
    './images/bitcoin-icon.svg',
    './images/currency-icons/btc.png',
    './images/currency-icons/eth.png',
    './images/currency-icons/ltc.png',
    './images/currency-icons/bch.png',
    './images/currency-icons/bnb.png',
    './images/currency-icons/eos.png',
    './images/currency-icons/xrp.png',
    './images/currency-icons/xlm.png',
    './images/currency-icons/link.png',
    './images/currency-icons/dot.png',
    './images/currency-icons/yfi.png',
    './images/currency-icons/silver-icon.png',
    './images/currency-icons/gold-icon.png'
];

const VERSION = '2.0';
let CACHE_NAME = 'sats-rate-caches-' + VERSION;
const MY_CACHES = new Set([CACHE_NAME]);

self.addEventListener('install', (event) => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME);
        await cache.addAll(urlsToCache);

        // 新しいバージョンがインストールされたことをクライアントに通知
        self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then((clients) => {
            clients.forEach(client => client.postMessage({ type: 'NEW_VERSION_INSTALLED' }));
        });

        const keys = await caches.keys();
        await Promise.all(
            keys
                .filter(key => !MY_CACHES.has(key))
                .map(key => caches.delete(key))
        );
        return self.skipWaiting();
    })());
});

self.addEventListener('fetch', (ev) => void ev.respondWith((async () => {
    const url = new URL(ev.request.url);
    if (url.origin === location.origin) {
        url.search = '';
    }

    let requestToFetch = ev.request;

    if (ev.request.mode === 'navigate') {
        requestToFetch = new Request(ev.request, {
            mode: 'cors'
        });
    }

    const cacheResponse = await caches.match(url.toString());

    return cacheResponse || fetch(requestToFetch);
})()));

self.addEventListener('message', (event) => {
    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    }
    if (event.data === 'CHECK_UPDATE_STATUS') {
        if (self.registration.waiting) {
            // 新しいバージョンがインストールされ、待機中であれば NEW_VERSION_INSTALLED を送信
            event.source.postMessage({ type: 'NEW_VERSION_INSTALLED' });
        } else if (self.registration.installing) {
            // 新しいバージョンが現在インストール中であれば、インストールの完了を待機
            const worker = self.registration.installing;
            worker.addEventListener('statechange', () => {
                if (worker.state === 'installed') {
                    event.source.postMessage({ type: 'NEW_VERSION_INSTALLED' });
                }
            });
        } else {
            // 更新がない場合、あるいはまだ新しいバージョンが準備されていない場合は NO_UPDATE_FOUND を送信
            event.source.postMessage({ type: 'NO_UPDATE_FOUND' });
        }
    }
    if (event.data.action === 'getVersion') {
        event.ports[0].postMessage({ version: VERSION });
    }
});
