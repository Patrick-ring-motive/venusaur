(()=>{
  if(!typeof Window)return;
  
})();


(()=>{
// service-worker.js
  if(typeof Window)return;

const CACHE_NAME = 'app-cache-v1';
  
// Install: pre-cache app shell
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME));
  event.waitUntil(self.skipWaiting());
});

// Activate: cleanup old caches
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));

// Fetch: serve from cache, fall back to network
self.addEventListener('fetch', event => {

});

})();
