(() => {
    if (typeof Window === 'undefined') return;
    navigator.serviceWorker.register(document.currentScript.src);
})();
(() => {
    // service-worker.js
    if (typeof Window !== 'undefined') return;
    const CACHE_NAME = 'app-cache-v1';
    // Install: pre-cache app shell
    self.addEventListener('install', event => self.skipWaiting());
    self.addEventListener('activate', event => self.clients.claim());
    const cacheMatch = async (key) => {
        try {
            key = String(key?.clone?.().url ?? key);
            const cache = await caches.open(CACHE_NAME);
            return (await cache.match(key, {
                ignoreMethod: true,
                ignoreVary: true
            }))?.clone?.();
        } catch (e) {
            console.warn(e, ...args);
        }
    };
    const cachePut = async (key, value) => {
        try {
            key = String(key?.clone?.().url ?? key);
            const cache = await caches.open(CACHE_NAME);
            return await cache.put(key, value.clone());
        } catch (e) {
            console.warn(e, ...args);
        }
    };
    const serviceFetch = async (...args) => {
        try {
            return await fetch(...args.map(x => x?.clone?.() ?? x));
        } catch (e) {
            console.warn(e, ...args);
            return new Response(String(e?.stack ?? e), {
                status: 569,
                statusText: String(e?.message ?? e)
            });
        }
    };
    
    let test;
    self.addEventListener('fetch', event => {
        const fetchEvent = ((async () => {
            try {
                if(!test){
                    test = serviceFetch('https://archives.lenguapedia.com/media/upload/thumb/2/27/0004Charmander.png/55px-0004Charmander.png');
                }
                if(test?.then){
                    test = await test;
                }
                let res = await cacheMatch(event.request);
                if (res) {
                    return res;
                } else {
                    res = await serviceFetch(event.request);
                    if(!res.status || res.status >= 400){
                        return test.clone();
                    }
                    return res
                }
            } catch (e) {
                console.warn(e, event);
            }
        })());
        event.respondWith(fetchEvent);
        event.waitUntil(fetchEvent);
    });
})();
