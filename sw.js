(() => {
    if (typeof Window === 'undefined') return;
    navigator.serviceWorker.register(document.currentScript.src);
})();
(() => {
        // service-worker.js
        if (typeof Window !== 'undefined') return;
        const CACHE_NAME = 'app-cache-v1';
        // Install: pre-cache app shell
        self.addEventListener('install', event => {
            event.waitUntil(self.skipWaiting());
        });
        self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
        const awaitUntil = (event, promise) => {
                event.waitUntil((async () => {
                                await event;
                                await promise;
                                await event;
                            };
                            return promise;
                        };
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
                        }; self.addEventListener('fetch', event => {
                            awaitUntil(event, async (() => {
                                    try {
                                        let res = await cacheMatch(event.request);
                                        if (res) return await awaitUntil(event.respondWith(res));
                                        res = await serviceFetch(request);
                                        if (/image/i.test(res.headers.get('content-type'))) {
                                                await cachePut(event.request, res);
                                            }
                                            return await awaitUntil(event.respondWith(res));
                                        }
                                        catch (e) {
                                            console.warn(e, ...args);
                                            return await awaitUntil(new Response(String(e?.stack ?? e), {
                                                status: 569,
                                                statusText: String(e?.message ?? e)
                                            }));
                                        }
                                    })();
                            });
                        })();
